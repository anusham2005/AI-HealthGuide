import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ClientChatMessage {
  role: "user" | "model";
  content: string;
}

interface EmergencyCheckResult {
  isEmergency: boolean;
  isCrisisLineRelevant: boolean;
  matchedWarnings: string[];
}

const EMERGENCY_PATTERNS: Array<{ pattern: RegExp; label: string; crisis?: boolean }> = [
  {
    pattern: /\b(chest\s+(pain|pressure|tightness|crushing|squeezing)|heart\s+attack)\b/i,
    label: "Chest pain, pressure, or tightness",
  },
  {
    pattern: /\b(trouble\s+breathing|difficulty\s+breathing|can'?t\s+breathe|shortness\s+of\s+breath|gasping\s+for\s+air|turning\s+blue)\b/i,
    label: "Severe difficulty breathing or shortness of breath",
  },
  {
    pattern: /\b(stroke|face\s+droop(ing)?|slurred\s+speech|sudden\s+(weakness|numbness|confusion|vision\s+loss)|one\s+side\s+of\s+(my|the)\s+(body|face))\b/i,
    label: "Possible stroke warning signs (facial drooping, arm weakness, speech changes)",
  },
  {
    pattern: /\b(severe\s+bleeding|uncontrolled\s+bleeding|won'?t\s+stop\s+bleeding|coughing\s+up\s+blood|vomiting\s+blood)\b/i,
    label: "Severe or uncontrolled bleeding",
  },
  {
    pattern: /\b(anaphylaxis|throat\s+(swelling|closing)|swollen\s+(tongue|lips)|severe\s+allergic\s+reaction)\b/i,
    label: "Signs of a severe allergic reaction (swelling of throat, tongue, or lips)",
  },
  {
    pattern: /\b(fainted|passed\s+out|unconscious|unresponsive|seizure|convulsion|stiff\s+neck\s+with\s+fever|worst\s+headache\s+of\s+my\s+life)\b/i,
    label: "Loss of consciousness, seizure, or sudden severe neurological symptoms",
  },
  {
    pattern: /\b(overdose|poison(ed|ing)?|swallowed\s+(bleach|chemicals|pills))\b/i,
    label: "Possible poisoning or overdose",
  },
  {
    pattern: /\b(suicid(e|al)|kill\s+myself|end\s+my\s+life|self[- ]harm|hurt\s+myself|don'?t\s+want\s+to\s+live)\b/i,
    label: "Mental health crisis or thoughts of self-harm",
    crisis: true,
  },
];

function detectEmergencySigns(text: string): EmergencyCheckResult {
  const matchedWarnings: string[] = [];
  let isCrisisLineRelevant = false;

  for (const item of EMERGENCY_PATTERNS) {
    if (item.pattern.test(text)) {
      matchedWarnings.push(item.label);
      if (item.crisis) {
        isCrisisLineRelevant = true;
      }
    }
  }

  return {
    isEmergency: matchedWarnings.length > 0,
    isCrisisLineRelevant,
    matchedWarnings,
  };
}

function detectUnnecessaryPII(text: string): { sanitizedText: string; hadPII: boolean } {
  let sanitizedText = text;
  let hadPII = false;

  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g;

  if (ssnRegex.test(sanitizedText)) {
    hadPII = true;
    sanitizedText = sanitizedText.replace(ssnRegex, "[REDACTED-ID]");
  }
  if (emailRegex.test(sanitizedText)) {
    hadPII = true;
    sanitizedText = sanitizedText.replace(emailRegex, "[REDACTED-EMAIL]");
  }
  if (phoneRegex.test(sanitizedText)) {
    hadPII = true;
    sanitizedText = sanitizedText.replace(phoneRegex, "[REDACTED-PHONE]");
  }

  return { sanitizedText, hadPII };
}

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  return key;
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";
let primaryCooldownUntil = 0;

async function generateWithResilience<T>(
  runForModel: (model: string) => Promise<T>
): Promise<T> {
  const now = Date.now();
  const candidateModels =
    now < primaryCooldownUntil
      ? [FALLBACK_MODEL]
      : [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: unknown;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await runForModel(model);
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number })?.status;
        const msg = err instanceof Error ? err.message : String(err);

        // If 429 quota on primary model, set 2-minute cooldown and switch immediately to fallback
        if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) {
          if (model === PRIMARY_MODEL) {
            primaryCooldownUntil = Date.now() + 120_000;
          }
          break;
        }

        // Retry transient 500/503 spikes with backoff
        if ((status && status >= 500) || /UNAVAILABLE|high demand|fetch failed/i.test(msg)) {
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
            continue;
          }
          break;
        }

        // Non-retryable client/auth error
        throw err;
      }
    }
  }

  throw lastError;
}

function mapGeminiError(err: unknown): { status: number; message: string; code: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;

  if (status === 401 || status === 403 || /API_KEY_INVALID|PERMISSION_DENIED|api key/i.test(rawMessage)) {
    return {
      status: 503,
      code: "AUTH_ERROR",
      message:
        "The AI health education service could not authenticate. Please verify your API key in Settings > Secrets, or use the Urgent Care and Visit Preparation tools directly.",
    };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMessage)) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      message:
        "The AI health education service has temporarily reached its request limit. Please wait a moment and try again, or check Settings > Secrets if quota limits persist.",
    };
  }

  return {
    status: 502,
    code: "UPSTREAM_ERROR",
    message:
      "The AI health education service is temporarily unavailable. For urgent concerns, please review the Emergency Warning Signs section or contact a licensed healthcare professional.",
  };
}

const HEALTH_CHAT_SYSTEM_INSTRUCTION = `You are the educational health guide inside "AI HealthGuide – Smart Healthcare Assistant".

Follow these safety and communication rules strictly on every response:
1. PLAIN, SIMPLE ENGLISH: Explain general health concepts clearly using everyday words. If you mention a medical term, explain it immediately in plain English. Keep paragraphs short and use concise bullet points where helpful.
2. NEVER DIAGNOSE OR PRESCRIBE: You are strictly an educational tool, not a doctor. Never tell a user they have or do not have a specific disease or condition. Never prescribe, recommend specific prescription drugs, or suggest medication dosages. If asked for a diagnosis or prescription, politely explain that you can only share general health education and encourage speaking with a licensed doctor or pharmacist.
3. STATE UNCERTAINTY CLEARLY: Explicitly note that health symptoms can have many different causes depending on a person's full medical history and physical exam, so general information cannot confirm what is happening for any individual.
4. ASK CLARIFYING QUESTIONS WHEN HELPFUL: When a user's question is broad, vague, or could mean several general topics, ask 1 or 2 gentle, non-identifying clarifying questions (for example, how long a general symptom has lasted, or whether they want general background info vs. questions to ask their doctor).
5. PROTECT PRIVACY: Never ask for full names, dates of birth, street addresses, phone numbers, emails, Social Security numbers, or medical record numbers. If a user shares personal identifiers, remind them kindly not to share private identifying details.
6. RECOGNIZE EMERGENCY WARNING SIGNS: If the user mentions potential emergency red flags—such as chest pain or pressure, trouble breathing, stroke signs (facial drooping, arm weakness, slurred speech), severe bleeding, anaphylaxis/throat swelling, seizures, fainting/unconsciousness, poisoning/overdose, or thoughts of self-harm/suicide—IMMEDIATELY and prominently tell them at the very start of your message to call local emergency services (such as 911 in the US, or 988 for mental health crises) or go to the nearest emergency department right away. Do not delay emergency advice with clarifying questions.
7. ENCOURAGE PROFESSIONAL CARE: Remind users to consult a qualified healthcare professional for personal medical advice.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "64kb" }));

  // Health check endpoint (never exposes any secret values)
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiAvailable: Boolean(getApiKey()),
    });
  });

  // Chat endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    let emergencyCheck: EmergencyCheckResult = {
      isEmergency: false,
      isCrisisLineRelevant: false,
      matchedWarnings: [],
    };
    let hadPII = false;

    try {
      const { messages, simulateUnavailable } = req.body as {
        messages?: ClientChatMessage[];
        simulateUnavailable?: boolean;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({
          error: "Please enter a health question before sending.",
          code: "INVALID_INPUT",
        });
        return;
      }

      const latestMessage = messages[messages.length - 1];
      if (
        !latestMessage ||
        latestMessage.role !== "user" ||
        typeof latestMessage.content !== "string" ||
        latestMessage.content.trim().length === 0
      ) {
        res.status(400).json({
          error: "Your message cannot be empty. Please type a general health question.",
          code: "EMPTY_MESSAGE",
        });
        return;
      }

      if (latestMessage.content.length > 1500) {
        res.status(400).json({
          error: "Please keep your question under 1,500 characters so we can give a clear response.",
          code: "MESSAGE_TOO_LONG",
        });
        return;
      }

      emergencyCheck = detectEmergencySigns(latestMessage.content);
      hadPII = detectUnnecessaryPII(latestMessage.content).hadPII;

      if (simulateUnavailable === true) {
        res.status(503).json({
          error:
            "The AI health education assistant is currently unreachable. For immediate medical concerns, please review Emergency Warning Signs or contact a clinician.",
          code: "SIMULATED_UNAVAILABLE",
          emergency: emergencyCheck,
          privacyNoticeTriggered: hadPII,
        });
        return;
      }

      const ai = createGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            "The AI health education service is currently unavailable because the server API key is not configured. Please check Settings > Secrets, or use the Emergency Signs and Visit Preparation sections.",
          code: "SERVICE_UNAVAILABLE",
          emergency: emergencyCheck,
          privacyNoticeTriggered: hadPII,
        });
        return;
      }

      const sanitizedHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
      for (const msg of messages.slice(-12)) {
        const clean = detectUnnecessaryPII(String(msg.content || "").slice(0, 1500));
        const role: "user" | "model" = msg.role === "model" ? "model" : "user";
        const prev = sanitizedHistory[sanitizedHistory.length - 1];
        if (prev && prev.role === role) {
          prev.parts[0].text = `${prev.parts[0].text}\n\n${clean.sanitizedText}`;
        } else {
          sanitizedHistory.push({
            role,
            parts: [{ text: clean.sanitizedText }],
          });
        }
      }

      const contextualSystemInstruction = emergencyCheck.isEmergency
        ? `${HEALTH_CHAT_SYSTEM_INSTRUCTION}\n\nURGENT OVERRIDE: The user's message contains potential emergency warning signs (${emergencyCheck.matchedWarnings.join("; ")}). Begin IMMEDIATELY with clear instructions to call emergency services (911 or local emergency number${emergencyCheck.isCrisisLineRelevant ? ", or call/text 988 for the Suicide & Crisis Lifeline" : ""}) or go to the nearest emergency room right away.`
        : HEALTH_CHAT_SYSTEM_INSTRUCTION;

      const response = await generateWithResilience((model) =>
        ai.models.generateContent({
          model,
          contents: sanitizedHistory,
          config: {
            systemInstruction: contextualSystemInstruction,
            temperature: 0.3,
          },
        })
      );

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error:
            "The AI assistant returned an empty response. Please try rephrasing your question or consult a healthcare professional.",
          code: "EMPTY_MODEL_RESPONSE",
          emergency: emergencyCheck,
          privacyNoticeTriggered: hadPII,
        });
        return;
      }

      res.json({
        reply: replyText,
        emergency: emergencyCheck,
        privacyNoticeTriggered: hadPII,
      });
    } catch (err: unknown) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
        code: mapped.code,
        emergency: emergencyCheck,
        privacyNoticeTriggered: hadPII,
      });
    }
  });

  // Structured Non-Diagnostic Symptom Educational Guidance endpoint
  app.post("/api/symptom-guidance", async (req: Request, res: Response) => {
    let hasEmergencyFlag = false;
    let combinedWarnings: string[] = [];

    try {
      const { symptom, duration, severity, redFlags, additionalNotes, simulateUnavailable } = req.body as {
        symptom?: string;
        duration?: string;
        severity?: string;
        redFlags?: string[];
        additionalNotes?: string;
        simulateUnavailable?: boolean;
      };

      const trimmedSymptom = typeof symptom === "string" ? symptom.trim() : "";
      if (trimmedSymptom.length < 2 || trimmedSymptom.length > 300) {
        res.status(400).json({
          error: "Please describe the main symptom in 2 to 300 characters.",
          code: "INVALID_SYMPTOM",
        });
        return;
      }

      const validDurations = [
        "less_than_24h",
        "1_to_3_days",
        "4_to_7_days",
        "1_to_2_weeks",
        "more_than_2_weeks",
      ];
      if (!duration || !validDurations.includes(duration)) {
        res.status(400).json({
          error: "Please select how long the symptom has been present.",
          code: "INVALID_DURATION",
        });
        return;
      }

      const validSeverities = ["mild", "moderate", "severe"];
      if (!severity || !validSeverities.includes(severity)) {
        res.status(400).json({
          error: "Please select the symptom severity level.",
          code: "INVALID_SEVERITY",
        });
        return;
      }

      const safeNotes = typeof additionalNotes === "string" ? additionalNotes.trim().slice(0, 500) : "";
      const selectedRedFlags = Array.isArray(redFlags)
        ? redFlags.filter((item): item is string => typeof item === "string").slice(0, 10)
        : [];

      const combinedCheck = detectEmergencySigns(`${trimmedSymptom} ${safeNotes}`);
      hasEmergencyFlag = combinedCheck.isEmergency || selectedRedFlags.length > 0;
      combinedWarnings = Array.from(new Set([...selectedRedFlags, ...combinedCheck.matchedWarnings]));

      if (simulateUnavailable === true) {
        res.status(503).json({
          error:
            "The AI symptom education service is currently unreachable. If symptoms are severe or include emergency warning signs, seek immediate emergency medical care.",
          code: "SIMULATED_UNAVAILABLE",
          emergencyDetected: hasEmergencyFlag,
          matchedWarnings: combinedWarnings,
        });
        return;
      }

      const cleanSymptom = detectUnnecessaryPII(trimmedSymptom).sanitizedText;
      const cleanNotes = detectUnnecessaryPII(safeNotes).sanitizedText;

      const ai = createGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            "The AI symptom education service is currently unavailable. If symptoms are severe or include emergency warning signs, seek immediate emergency medical care.",
          code: "SERVICE_UNAVAILABLE",
          emergencyDetected: hasEmergencyFlag,
          matchedWarnings: combinedWarnings,
        });
        return;
      }

      const durationLabels: Record<string, string> = {
        less_than_24h: "Less than 24 hours",
        "1_to_3_days": "1 to 3 days",
        "4_to_7_days": "4 to 7 days",
        "1_to_2_weeks": "1 to 2 weeks",
        more_than_2_weeks: "More than 2 weeks",
      };

      const prompt = `Provide general, plain-English health education (STRICTLY NON-DIAGNOSTIC and NON-PRESCRIPTIVE) for someone preparing to understand care options for:
- Reported symptom: ${cleanSymptom}
- Duration: ${durationLabels[duration] || duration}
- Self-reported severity: ${severity}
- Checked emergency warning boxes: ${selectedRedFlags.length > 0 ? selectedRedFlags.join(", ") : "None checked"}
- Optional context: ${cleanNotes || "None provided"}

Rules:
- Do NOT diagnose any condition or name a definitive cause.
- Do NOT prescribe or recommend any medications, OTC drug names, or dosages. Only mention general non-drug comfort/monitoring habits (like rest, hydration, noting symptom changes) when appropriate and non-emergent.
- If emergency warning boxes were checked, emergency red flags appear in text, or severity is severe with acute risk, set careUrgencyLevel to "emergency" and clearly advise immediate emergency care (call 911 or visit nearest ER). Otherwise choose "prompt_medical_eval" (for moderate, worsening, or persistent symptoms) or "routine_doctor_visit" (for mild symptoms to discuss with a primary care clinician).
- State uncertainty clearly and encourage consulting a licensed doctor.`;

      const response = await generateWithResilience((model) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.25,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                plainSummary: {
                  type: Type.STRING,
                  description:
                    "Plain-English educational overview without diagnosing diseases or prescribing medicine.",
                },
                careUrgencyLevel: {
                  type: Type.STRING,
                  description:
                    "One of: emergency, prompt_medical_eval, routine_doctor_visit",
                },
                urgencyExplanation: {
                  type: Type.STRING,
                  description:
                    "Clear explanation in simple English about what type of medical care setting is generally appropriate and why.",
                },
                generalComfortTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "3 to 4 safe, non-medication general self-monitoring or comfort habits (no drugs or dosages).",
                },
                warningSignsToWatch: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "3 to 5 specific red-flag symptoms that require immediate emergency medical attention.",
                },
                questionsForDoctor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "3 to 4 practical questions the person can ask a doctor or nurse.",
                },
                uncertaintyNote: {
                  type: Type.STRING,
                  description:
                    "Explicit reminder of uncertainty and that only a licensed clinician can examine and diagnose.",
                },
              },
              required: [
                "plainSummary",
                "careUrgencyLevel",
                "urgencyExplanation",
                "generalComfortTips",
                "warningSignsToWatch",
                "questionsForDoctor",
                "uncertaintyNote",
              ],
            },
          },
        })
      );

      const rawJson = response.text?.trim();
      if (!rawJson) {
        throw new Error("Empty structured response from Gemini");
      }

      const parsed = JSON.parse(rawJson) as {
        plainSummary: string;
        careUrgencyLevel: string;
        urgencyExplanation: string;
        generalComfortTips: string[];
        warningSignsToWatch: string[];
        questionsForDoctor: string[];
        uncertaintyNote: string;
      };

      const finalUrgency = hasEmergencyFlag
        ? "emergency"
        : parsed.careUrgencyLevel === "emergency" ||
            parsed.careUrgencyLevel === "prompt_medical_eval" ||
            parsed.careUrgencyLevel === "routine_doctor_visit"
          ? parsed.careUrgencyLevel
          : severity === "severe"
            ? "prompt_medical_eval"
            : "routine_doctor_visit";

      res.json({
        guidance: {
          ...parsed,
          careUrgencyLevel: finalUrgency,
        },
        emergencyDetected: hasEmergencyFlag || finalUrgency === "emergency",
        matchedWarnings: combinedWarnings,
      });
    } catch (err: unknown) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
        code: mapped.code,
        emergencyDetected: hasEmergencyFlag,
        matchedWarnings: combinedWarnings,
      });
    }
  });

  // Mount Vite middleware in development or static dist in production
  const distPath = path.resolve(__dirname, "dist");
  const isProd = process.env.NODE_ENV === "production" || (!process.env.VITE_DEV && fs.existsSync(path.join(distPath, "index.html")) && process.argv[1]?.endsWith("server.ts") && process.env.npm_lifecycle_event === "start");

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI HealthGuide server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
