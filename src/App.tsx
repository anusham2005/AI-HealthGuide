import React, { useCallback, useEffect, useState } from "react";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { EmergencySection } from "./components/EmergencySection";
import { Footer } from "./components/Footer";
import { HealthChatbot } from "./components/HealthChatbot";
import { HomeView } from "./components/HomeView";
import { Navbar } from "./components/Navbar";
import { SymptomGuide } from "./components/SymptomGuide";
import { VisitPrepTool } from "./components/VisitPrepTool";
import {
  AppSection,
  ChatMessage,
  EmergencyCheckInfo,
  VisitPrepState,
} from "./types/health";

function parseHashToSection(hash: string): AppSection {
  const clean = hash.replace(/^#/, "").trim().toLowerCase();
  switch (clean) {
    case AppSection.CHAT:
      return AppSection.CHAT;
    case AppSection.SYMPTOMS:
      return AppSection.SYMPTOMS;
    case AppSection.VISIT_PREP:
      return AppSection.VISIT_PREP;
    case AppSection.EMERGENCY:
      return AppSection.EMERGENCY;
    default:
      return AppSection.OVERVIEW;
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(() =>
    typeof window !== "undefined"
      ? parseHashToSection(window.location.hash)
      : AppSection.OVERVIEW
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatEmergencyBanner, setChatEmergencyBanner] =
    useState<EmergencyCheckInfo | null>(null);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string>("");

  const [visitPrep, setVisitPrep] = useState<VisitPrepState>({
    appointmentReason: "",
    symptomTimeline: "",
    medicationsAndAllergies: [],
    questionsToAsk: [],
    personalGoals: "",
  });

  const [handoffBanner, setHandoffBanner] = useState<string | null>(null);

  const handleNavigate = useCallback((section: AppSection) => {
    setActiveSection(section);
    if (typeof window !== "undefined") {
      const targetHash = `#${section}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, "", targetHash);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActiveSection(parseHashToSection(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  const handleStartChatWithPrompt = useCallback(
    (prompt: string) => {
      setPendingChatPrompt(prompt);
      handleNavigate(AppSection.CHAT);
    },
    [handleNavigate]
  );

  const handleSendToVisitPrep = useCallback(
    (payload: {
      symptom: string;
      durationLabel: string;
      severityLabel: string;
      notes: string;
      suggestedQuestions: string[];
    }) => {
      setVisitPrep((prev) => {
        const existingTexts = new Set(prev.questionsToAsk.map((q) => q.text));
        const mergedQuestions = [...prev.questionsToAsk];
        payload.suggestedQuestions.forEach((qText, idx) => {
          if (!existingTexts.has(qText)) {
            mergedQuestions.push({
              id: `from-symptom-${Date.now()}-${idx}`,
              text: qText,
            });
          }
        });

        const timelineSummary = [
          `Duration: ${payload.durationLabel}`,
          `Self-reported severity: ${payload.severityLabel}`,
          payload.notes ? `Notes: ${payload.notes}` : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return {
          ...prev,
          appointmentReason:
            prev.appointmentReason.trim() ||
            `Discuss ${payload.symptom.toLowerCase()}`,
          symptomTimeline: prev.symptomTimeline.trim()
            ? `${prev.symptomTimeline.trim()}\n${timelineSummary}`
            : timelineSummary,
          questionsToAsk: mergedQuestions,
        };
      });

      setHandoffBanner(
        `Added "${payload.symptom}" notes and suggested clinician questions to your Doctor Visit Preparation checklist.`
      );
      handleNavigate(AppSection.VISIT_PREP);
    },
    [handleNavigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <DisclaimerBanner
        activeSection={activeSection}
        onOpenEmergency={() => handleNavigate(AppSection.EMERGENCY)}
      />

      {handoffBanner && activeSection === AppSection.VISIT_PREP && (
        <div
          role="status"
          className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print"
        >
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 flex items-center justify-between gap-4 text-xs sm:text-sm text-blue-950">
            <span>{handoffBanner}</span>
            <button
              type="button"
              onClick={() => setHandoffBanner(null)}
              className="font-semibold text-blue-800 hover:text-blue-950 underline underline-offset-2 shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {activeSection === AppSection.OVERVIEW && (
          <HomeView
            onNavigate={handleNavigate}
            onStartChatWithPrompt={handleStartChatWithPrompt}
          />
        )}

        {activeSection === AppSection.CHAT && (
          <HealthChatbot
            messages={chatMessages}
            setMessages={setChatMessages}
            activeEmergencyBanner={chatEmergencyBanner}
            setActiveEmergencyBanner={setChatEmergencyBanner}
            initialPrompt={pendingChatPrompt}
            onClearInitialPrompt={() => setPendingChatPrompt("")}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection === AppSection.SYMPTOMS && (
          <SymptomGuide
            onSendToVisitPrep={handleSendToVisitPrep}
            onAskInChat={handleStartChatWithPrompt}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection === AppSection.VISIT_PREP && (
          <VisitPrepTool
            visitPrep={visitPrep}
            onChangeVisitPrep={setVisitPrep}
          />
        )}

        {activeSection === AppSection.EMERGENCY && (
          <EmergencySection onNavigate={handleNavigate} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

