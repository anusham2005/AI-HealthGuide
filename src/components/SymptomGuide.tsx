import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardPlus,
  MessageSquareText,
  PhoneCall,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  COMMON_SYMPTOM_SUGGESTIONS,
  DURATION_OPTIONS,
  SYMPTOM_RED_FLAG_CHECKBOXES,
} from "../data/healthReferenceData";
import {
  AppSection,
  DurationOption,
  SeverityLevel,
  SymptomFormInput,
  SymptomGuidanceData,
} from "../types/health";

interface SymptomGuideProps {
  onSendToVisitPrep: (payload: {
    symptom: string;
    durationLabel: string;
    severityLabel: string;
    notes: string;
    suggestedQuestions: string[];
  }) => void;
  onAskInChat: (prompt: string) => void;
  onNavigate: (section: AppSection) => void;
}

interface FieldErrors {
  symptom?: string;
  duration?: string;
  severity?: string;
}

const SEVERITY_OPTIONS: Array<{
  value: SeverityLevel;
  title: string;
  description: string;
}> = [
  {
    value: SeverityLevel.MILD,
    title: "Mild",
    description:
      "Noticeable discomfort, but able to rest, drink fluids, and handle normal daily tasks.",
  },
  {
    value: SeverityLevel.MODERATE,
    title: "Moderate",
    description:
      "Interferes with work, sleep, or daily comfort, without acute emergency warning signs.",
  },
  {
    value: SeverityLevel.SEVERE,
    title: "Severe",
    description:
      "Intense, rapidly worsening, or makes basic activities very difficult—requires prompt or urgent medical attention.",
  },
];

export const SymptomGuide: React.FC<SymptomGuideProps> = ({
  onSendToVisitPrep,
  onAskInChat,
  onNavigate,
}) => {
  const [form, setForm] = useState<SymptomFormInput>({
    symptom: "",
    duration: "",
    severity: "",
    redFlags: [],
    additionalNotes: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<SymptomGuidanceData | null>(null);
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [matchedWarnings, setMatchedWarnings] = useState<string[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);
  const resultPanelRef = React.useRef<HTMLDivElement>(null);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedSymptom = form.symptom.trim();

    if (trimmedSymptom.length < 2) {
      errors.symptom = "Please enter the main symptom (at least 2 characters).";
    } else if (trimmedSymptom.length > 300) {
      errors.symptom = "Please describe the symptom in 300 characters or fewer.";
    }

    if (!form.duration) {
      errors.duration = "Please choose how long this symptom has lasted.";
    }

    if (!form.severity) {
      errors.severity = "Please select a severity level (Mild, Moderate, or Severe).";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (errors.symptom) {
        document.getElementById("symptom-input")?.focus();
      } else {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return false;
    }
    return true;
  };

  const toggleRedFlag = (flag: string) => {
    setForm((prev) => {
      const exists = prev.redFlags.includes(flag);
      return {
        ...prev,
        redFlags: exists
          ? prev.redFlags.filter((item) => item !== flag)
          : [...prev.redFlags, flag],
      };
    });
  };

  const submitGuidanceRequest = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);
    resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    try {
      const response = await fetch("/api/symptom-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json().catch(() => ({}))) as {
        guidance?: SymptomGuidanceData;
        error?: string;
        emergencyDetected?: boolean;
        matchedWarnings?: string[];
      };

      if (typeof data.emergencyDetected === "boolean") {
        setEmergencyDetected(data.emergencyDetected);
      } else {
        setEmergencyDetected(form.redFlags.length > 0);
      }

      if (Array.isArray(data.matchedWarnings)) {
        setMatchedWarnings(data.matchedWarnings);
      } else {
        setMatchedWarnings(form.redFlags);
      }

      if (!response.ok || !data.guidance) {
        setApiError(
          data.error ||
            "Unable to load educational symptom guidance right now. If symptoms are severe or urgent, seek medical care directly."
        );
        return;
      }

      setResult(data.guidance);
    } catch {
      setEmergencyDetected(form.redFlags.length > 0);
      setMatchedWarnings(form.redFlags);
      setApiError(
        "Could not connect to the symptom guidance service. Please try again or review Emergency Warning Signs if you need urgent guidance."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitGuidanceRequest();
  };

  const handleReset = () => {
    setForm({
      symptom: "",
      duration: "",
      severity: "",
      redFlags: [],
      additionalNotes: "",
    });
    setFieldErrors({});
    setApiError(null);
    setResult(null);
    setEmergencyDetected(false);
    setMatchedWarnings([]);
  };

  const durationLabel =
    DURATION_OPTIONS.find((d) => d.value === form.duration)?.label || "";
  const severityLabel =
    SEVERITY_OPTIONS.find((s) => s.value === form.severity)?.title || "";

  const urgencyBadgeMeta = (
    level: SymptomGuidanceData["careUrgencyLevel"]
  ): { title: string; boxStyle: string; textStyle: string } => {
    if (level === "emergency" || emergencyDetected) {
      return {
        title: "Immediate Emergency Medical Care Recommended",
        boxStyle: "border-red-300 bg-red-50",
        textStyle: "text-red-900",
      };
    }
    if (level === "prompt_medical_eval") {
      return {
        title: "Prompt Clinical Evaluation Recommended (Same-Day / Urgent Care or Doctor)",
        boxStyle: "border-amber-300 bg-amber-50/80",
        textStyle: "text-amber-950",
      };
    }
    return {
      title: "Routine Healthcare Professional Visit / Self-Monitoring",
      boxStyle: "border-blue-200 bg-blue-50/70",
      textStyle: "text-blue-950",
    };
  };

  return (
    <section
      aria-labelledby="symptom-guide-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
    >
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold text-blue-800">
          Structured Symptom Reflection · Non-Diagnostic Educational Tool
        </p>
        <h1
          id="symptom-guide-heading"
          className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
        >
          Symptom Guidance Form
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Organize a symptom by duration, severity, and emergency red flags to view plain-English educational context and prepare questions for a licensed healthcare professional. This tool never diagnoses diseases or prescribes medicine.
        </p>
      </div>

      {/* Live Immediate Warning if User Checks Any Red-Flag Box */}
      {form.redFlags.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-6 h-6 text-red-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-display text-base font-bold text-red-900">
                You selected an emergency warning sign
              </p>
              <p className="text-sm text-slate-800 leading-relaxed">
                Symptoms such as{" "}
                <strong className="font-semibold">
                  {form.redFlags.join("; ").toLowerCase()}
                </strong>{" "}
                require immediate emergency medical evaluation. Please call{" "}
                <strong className="tabular-nums">911</strong> (or your local emergency number) or go to the nearest emergency room right away rather than waiting on this form.
              </p>
            </div>
          </div>

          <a
            href="tel:911"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Call 911 Immediately</span>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-6 border border-slate-200 rounded-2xl bg-white p-6 sm:p-8 space-y-6"
        >
          {/* 1. Symptom Input */}
          <div className="space-y-2">
            <label
              htmlFor="symptom-input"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              1. Main Symptom <span className="text-red-700">*</span>
            </label>
            <input
              id="symptom-input"
              type="text"
              value={form.symptom}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, symptom: e.target.value }));
                if (fieldErrors.symptom) {
                  setFieldErrors((prev) => ({ ...prev, symptom: undefined }));
                }
              }}
              aria-invalid={Boolean(fieldErrors.symptom)}
              aria-describedby={
                fieldErrors.symptom ? "symptom-field-error" : "symptom-helper"
              }
              placeholder="e.g., Sore throat and mild cough"
              className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-lg border text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors.symptom
                  ? "border-red-600 focus:border-red-700 focus:ring-red-700/20"
                  : "border-slate-300 focus:border-blue-700 focus:ring-blue-700/20"
              }`}
            />
            {fieldErrors.symptom ? (
              <p
                id="symptom-field-error"
                role="alert"
                className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.symptom}</span>
              </p>
            ) : (
              <p id="symptom-helper" className="text-xs text-slate-500">
                Quick-fill common examples:
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {COMMON_SYMPTOM_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, symptom: suggestion }));
                    setFieldErrors((prev) => ({ ...prev, symptom: undefined }));
                  }}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-800 font-medium transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Duration */}
          <fieldset className="space-y-2.5">
            <legend className="font-display text-sm font-semibold text-slate-900">
              2. How long has it lasted? <span className="text-red-700">*</span>
            </legend>
            {fieldErrors.duration && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.duration}</span>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DURATION_OPTIONS.map((opt) => {
                const selected = form.duration === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm tabular-nums ${
                      selected
                        ? "border-blue-700 bg-blue-50/70 text-blue-950 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={opt.value}
                      checked={selected}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          duration: opt.value as DurationOption,
                        }));
                        setFieldErrors((prev) => ({ ...prev, duration: undefined }));
                      }}
                      className="w-4 h-4 accent-blue-700"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 3. Severity */}
          <fieldset className="space-y-2.5">
            <legend className="font-display text-sm font-semibold text-slate-900">
              3. Symptom Severity <span className="text-red-700">*</span>
            </legend>
            {fieldErrors.severity && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.severity}</span>
              </p>
            )}
            <div className="space-y-2.5">
              {SEVERITY_OPTIONS.map((sev) => {
                const selected = form.severity === sev.value;
                return (
                  <label
                    key={sev.value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? "border-blue-700 bg-blue-50/70"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={sev.value}
                      checked={selected}
                      onChange={() => {
                        setForm((prev) => ({ ...prev, severity: sev.value }));
                        setFieldErrors((prev) => ({ ...prev, severity: undefined }));
                      }}
                      className="w-4 h-4 mt-1 accent-blue-700 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="block text-sm font-semibold text-slate-900">
                        {sev.title}
                      </span>
                      <span className="block text-xs text-slate-600 leading-relaxed">
                        {sev.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 4. Emergency Red-Flag Checkboxes */}
          <fieldset className="space-y-2.5 pt-2 border-t border-slate-200">
            <legend className="font-display text-sm font-semibold text-slate-900">
              4. Are any emergency warning signs present? (Select all that apply)
            </legend>
            <p className="text-xs text-slate-600">
              Checking any item below highlights urgent emergency instructions right away.
            </p>
            <div className="space-y-2">
              {SYMPTOM_RED_FLAG_CHECKBOXES.map((flag) => {
                const checked = form.redFlags.includes(flag);
                return (
                  <label
                    key={flag}
                    className={`flex items-start gap-3 min-h-[44px] px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors text-xs sm:text-sm ${
                      checked
                        ? "border-red-400 bg-red-50 text-red-950 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRedFlag(flag)}
                      className="w-4 h-4 mt-0.5 accent-red-700 shrink-0"
                    />
                    <span className="leading-snug">{flag}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 5. Optional Context */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <label
              htmlFor="symptom-notes"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              5. Optional Non-Identifying Notes
            </label>
            <textarea
              id="symptom-notes"
              rows={2}
              maxLength={400}
              value={form.additionalNotes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
              }
              placeholder="Optional: e.g., worse in the morning, no fever noticed (do not include personal IDs)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
            <div className="flex justify-between text-xs text-slate-500 tabular-nums">
              <span>Avoid personal names, phone numbers, or IDs</span>
              <span>{form.additionalNotes.length} / 400</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-semibold text-sm sm:text-base transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <span>
                {isLoading ? "Generating Guidance..." : "Get Educational Guidance"}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {/* Results / Empty / Loading / Error Column */}
        <div
          ref={resultPanelRef}
          aria-live="polite"
          className="lg:col-span-6 border border-slate-200 rounded-2xl bg-white p-6 sm:p-8 min-h-[440px] flex flex-col justify-between"
        >
          {/* Empty State */}
          {!isLoading && !apiError && !result && (
            <div className="my-auto py-10 text-center space-y-4 max-w-md mx-auto">
              <p className="text-xs font-semibold text-blue-800">
                Educational Guidance Preview
              </p>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Complete the symptom form to view educational guidance
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once submitted, this panel displays a plain-English educational overview, general care-setting considerations, red-flag signs to watch for, and questions you can copy directly into your Doctor Visit Preparation checklist.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.EMERGENCY)}
                  className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100/70 text-red-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Need Emergency Warning Signs Right Now?</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div
              role="status"
              aria-label="Loading symptom educational guidance"
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-7 w-3/4 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && apiError && (
            <div role="alert" className="my-auto space-y-4">
              {emergencyDetected && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-2">
                  <p className="font-display text-sm font-bold text-red-900">
                    Emergency Warning Signs Noted: Seek Urgent Care Immediately
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    Even while the AI education service is offline, your input flagged urgent warning signs ({matchedWarnings.join("; ")}). Call <strong>911</strong> or go to the nearest emergency room immediately.
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="w-5 h-5 text-red-700 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Symptom Guidance Service Unavailable
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {apiError}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pl-8">
                  <button
                    type="button"
                    onClick={() => void submitGuidanceRequest()}
                    className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate(AppSection.EMERGENCY)}
                    className="min-h-[42px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 transition-colors"
                  >
                    Open Emergency Reference
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Populated Guidance Output */}
          {!isLoading && !apiError && result && (
            <div className="space-y-6">
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <p className="text-xs font-semibold text-blue-800">
                  General Educational Information · Not a Medical Diagnosis
                </p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Guidance for: {form.symptom.trim()}
                </h2>
                <p className="text-xs text-slate-500 tabular-nums">
                  Reported Duration: {durationLabel} · Reported Severity:{" "}
                  {severityLabel}
                </p>
              </div>

              {/* Care Urgency Banner */}
              {(() => {
                const meta = urgencyBadgeMeta(result.careUrgencyLevel);
                return (
                  <div className={`rounded-xl border p-4 space-y-2 ${meta.boxStyle}`}>
                    <p className={`font-display text-sm font-bold ${meta.textStyle}`}>
                      {meta.title}
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {result.urgencyExplanation}
                    </p>
                    {(result.careUrgencyLevel === "emergency" || emergencyDetected) && (
                      <div className="pt-1 flex flex-wrap gap-2 tabular-nums">
                        <a
                          href="tel:911"
                          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold"
                        >
                          <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Call 911 Emergency Dispatch</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Plain-English Overview */}
              <div className="space-y-1.5">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Plain-English Educational Overview
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result.plainSummary}
                </p>
              </div>

              {/* Non-Medication General Habits */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  General Non-Medication Comfort &amp; Monitoring Habits
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed">
                  {result.generalComfortTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Warning Signs to Watch */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-display text-sm font-semibold text-red-900">
                  Seek Urgent or Emergency Care Immediately If You Notice:
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed">
                  {result.warningSignsToWatch.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>

              {/* Questions for a Doctor */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Questions to Discuss With a Healthcare Professional
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed">
                  {result.questionsForDoctor.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Uncertainty & Non-Diagnostic Statement */}
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                <strong className="font-semibold text-slate-700">
                  Clinical Uncertainty Note:
                </strong>{" "}
                {result.uncertaintyNote}
              </div>

              {/* Seamless Workflow Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onSendToVisitPrep({
                      symptom: form.symptom.trim(),
                      durationLabel,
                      severityLabel,
                      notes: form.additionalNotes.trim(),
                      suggestedQuestions: result.questionsForDoctor,
                    })
                  }
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <ClipboardPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Send to Doctor Visit Prep</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskInChat(
                      `In simple English, what general educational questions should I prepare for a doctor visit regarding "${form.symptom.trim()}" that has lasted ${durationLabel.toLowerCase()}?`
                    )
                  }
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <MessageSquareText className="w-4 h-4" aria-hidden="true" />
                  <span>Ask Follow-Up in Health Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
