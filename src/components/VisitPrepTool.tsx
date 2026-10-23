import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import {
  SAMPLE_VISIT_PREP_TEMPLATE,
  SUGGESTED_DOCTOR_QUESTIONS,
} from "../data/healthReferenceData";
import { VisitPrepState } from "../types/health";

interface VisitPrepToolProps {
  visitPrep: VisitPrepState;
  onChangeVisitPrep: React.Dispatch<React.SetStateAction<VisitPrepState>>;
}

export const VisitPrepTool: React.FC<VisitPrepToolProps> = ({
  visitPrep,
  onChangeVisitPrep,
}) => {
  const [medInput, setMedInput] = useState("");
  const [medError, setMedError] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [usingSampleNotice, setUsingSampleNotice] = useState(false);

  const isChecklistEmpty =
    !visitPrep.appointmentReason.trim() &&
    !visitPrep.symptomTimeline.trim() &&
    visitPrep.medicationsAndAllergies.length === 0 &&
    visitPrep.questionsToAsk.length === 0 &&
    !visitPrep.personalGoals.trim();

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = medInput.trim();
    if (!trimmed) {
      setMedError("Enter a current supplement, medication, or allergy before adding.");
      return;
    }
    setMedError(null);
    onChangeVisitPrep((prev) => ({
      ...prev,
      medicationsAndAllergies: [
        ...prev.medicationsAndAllergies,
        { id: `med-${Date.now()}`, text: trimmed },
      ],
    }));
    setMedInput("");
  };

  const handleRemoveMedication = (id: string) => {
    onChangeVisitPrep((prev) => ({
      ...prev,
      medicationsAndAllergies: prev.medicationsAndAllergies.filter(
        (m) => m.id !== id
      ),
    }));
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customQuestion.trim();
    if (!trimmed) {
      setQuestionError("Type a question for your clinician before clicking Add.");
      return;
    }
    setQuestionError(null);
    onChangeVisitPrep((prev) => ({
      ...prev,
      questionsToAsk: [
        ...prev.questionsToAsk,
        { id: `q-${Date.now()}`, text: trimmed },
      ],
    }));
    setCustomQuestion("");
  };

  const toggleSuggestedQuestion = (questionText: string) => {
    onChangeVisitPrep((prev) => {
      const exists = prev.questionsToAsk.some((q) => q.text === questionText);
      if (exists) {
        return {
          ...prev,
          questionsToAsk: prev.questionsToAsk.filter(
            (q) => q.text !== questionText
          ),
        };
      }
      return {
        ...prev,
        questionsToAsk: [
          ...prev.questionsToAsk,
          { id: `sug-${Date.now()}-${Math.random()}`, text: questionText },
        ],
      };
    });
  };

  const handleLoadSample = () => {
    onChangeVisitPrep(SAMPLE_VISIT_PREP_TEMPLATE);
    setUsingSampleNotice(true);
    setConfirmReset(false);
    setMedError(null);
    setQuestionError(null);
  };

  const handleClearAll = () => {
    onChangeVisitPrep({
      appointmentReason: "",
      symptomTimeline: "",
      medicationsAndAllergies: [],
      questionsToAsk: [],
      personalGoals: "",
    });
    setUsingSampleNotice(false);
    setConfirmReset(false);
    setMedError(null);
    setQuestionError(null);
  };

  const formatPlainTextChecklist = (): string => {
    const lines: string[] = [
      "DOCTOR VISIT PREPARATION SUMMARY (AI HealthGuide)",
      "Note: Personal appointment organization sheet — Not an official medical record.",
      "",
      `1. Main Reason for Visit:\n${visitPrep.appointmentReason.trim() || "Not specified"}`,
      "",
      `2. Symptom Timeline & Severity Notes:\n${visitPrep.symptomTimeline.trim() || "Not specified"}`,
      "",
      "3. Current Medications, Supplements & Allergies:",
      ...(visitPrep.medicationsAndAllergies.length > 0
        ? visitPrep.medicationsAndAllergies.map((m) => `   - ${m.text}`)
        : ["   - None listed"]),
      "",
      "4. Priority Questions for My Clinician:",
      ...(visitPrep.questionsToAsk.length > 0
        ? visitPrep.questionsToAsk.map((q, idx) => `   ${idx + 1}. ${q.text}`)
        : ["   - None listed"]),
      "",
      `5. Goals for This Visit:\n${visitPrep.personalGoals.trim() || "Not specified"}`,
    ];
    return lines.join("\n");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formatPlainTextChecklist());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      // Ignore if clipboard unavailable
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section
      aria-labelledby="visit-prep-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
    >
      {/* Header & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-5 no-print">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-blue-800">
            Patient-Clinician Communication Organizer · Session-Local Only
          </p>
          <h1
            id="visit-prep-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
          >
            Doctor Visit Preparation Tool
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Build a concise checklist to bring to your next appointment. Entries stay in your browser tab only and are never transmitted to hospitals or electronic medical record systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-blue-700" aria-hidden="true" />
            <span>Load Sample Example</span>
          </button>

          {!isChecklistEmpty && (
            <>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Clear All</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="min-h-[36px] px-3 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[36px] px-3 py-1 rounded-md bg-white text-slate-700 text-xs font-medium whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {usingSampleNotice && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs sm:text-sm text-amber-950 flex items-center justify-between gap-4 no-print"
        >
          <span>
            <strong>Sample Data Loaded:</strong> You are viewing an illustrative example checklist. Edit or replace any field with your own appointment notes.
          </span>
          <button
            type="button"
            onClick={() => setUsingSampleNotice(false)}
            aria-label="Dismiss sample data notice"
            className="p-1.5 rounded hover:bg-amber-100 text-amber-900 shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Builder Form (Hidden when printing so printed sheet is clean) */}
        <div className="lg:col-span-7 border border-slate-200 rounded-2xl bg-white p-6 sm:p-8 space-y-6 no-print">
          {/* 1. Main Reason */}
          <div className="space-y-1.5">
            <label
              htmlFor="visit-reason"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              1. Main Reason for Your Visit
            </label>
            <textarea
              id="visit-reason"
              rows={2}
              value={visitPrep.appointmentReason}
              onChange={(e) =>
                onChangeVisitPrep((prev) => ({
                  ...prev,
                  appointmentReason: e.target.value,
                }))
              }
              placeholder="What is the top concern you want to make sure your doctor hears first?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          {/* 2. Symptom Timeline */}
          <div className="space-y-1.5">
            <label
              htmlFor="visit-timeline"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              2. Symptom Timeline &amp; Patterns
            </label>
            <textarea
              id="visit-timeline"
              rows={3}
              value={visitPrep.symptomTimeline}
              onChange={(e) =>
                onChangeVisitPrep((prev) => ({
                  ...prev,
                  symptomTimeline: e.target.value,
                }))
              }
              placeholder="When did it start? Does anything make it better or worse?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          {/* 3. Medications, Supplements & Allergies */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label
              htmlFor="med-allergy-input"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              3. Current Medications, Supplements &amp; Known Allergies
            </label>
            <form onSubmit={handleAddMedication} noValidate className="flex gap-2">
              <input
                id="med-allergy-input"
                type="text"
                value={medInput}
                onChange={(e) => {
                  setMedInput(e.target.value);
                  if (medError) setMedError(null);
                }}
                aria-invalid={Boolean(medError)}
                placeholder="e.g., Vitamin D supplement, or Penicillin allergy"
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add</span>
              </button>
            </form>
            {medError && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{medError}</span>
              </p>
            )}

            {visitPrep.medicationsAndAllergies.length > 0 && (
              <ul className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {visitPrep.medicationsAndAllergies.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/60 text-sm text-slate-800"
                  >
                    <span>{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(item.id)}
                      aria-label={`Remove ${item.text}`}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. Questions to Ask */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <p className="font-display text-sm font-semibold text-slate-900">
              4. Questions to Ask Your Clinician
            </p>
            <p className="text-xs text-slate-600">
              Select from common clinical questions or add your own:
            </p>
            <div className="space-y-2">
              {SUGGESTED_DOCTOR_QUESTIONS.map((qText) => {
                const checked = visitPrep.questionsToAsk.some(
                  (q) => q.text === qText
                );
                return (
                  <label
                    key={qText}
                    className={`flex items-start gap-3 min-h-[44px] px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors text-xs sm:text-sm ${
                      checked
                        ? "border-blue-700 bg-blue-50/70 text-blue-950 font-medium"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSuggestedQuestion(qText)}
                      className="w-4 h-4 mt-0.5 accent-blue-700 shrink-0"
                    />
                    <span className="leading-snug">{qText}</span>
                  </label>
                );
              })}
            </div>

            <form
              onSubmit={handleAddCustomQuestion}
              noValidate
              className="flex gap-2 pt-1"
            >
              <label htmlFor="custom-doctor-question" className="sr-only">
                Add custom question for your doctor
              </label>
              <input
                id="custom-doctor-question"
                type="text"
                value={customQuestion}
                onChange={(e) => {
                  setCustomQuestion(e.target.value);
                  if (questionError) setQuestionError(null);
                }}
                aria-invalid={Boolean(questionError)}
                placeholder="Write a custom question for your doctor..."
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Question</span>
              </button>
            </form>
            {questionError && (
              <p
                role="alert"
                className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{questionError}</span>
              </p>
            )}
          </div>

          {/* 5. Personal Goals */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <label
              htmlFor="visit-goals"
              className="block font-display text-sm font-semibold text-slate-900"
            >
              5. Personal Goals for This Appointment
            </label>
            <input
              id="visit-goals"
              type="text"
              value={visitPrep.personalGoals}
              onChange={(e) =>
                onChangeVisitPrep((prev) => ({
                  ...prev,
                  personalGoals: e.target.value,
                }))
              }
              placeholder="e.g., Understand safe ways to manage discomfort and know when to follow up"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
          </div>
        </div>

        {/* Live Printable Summary Preview */}
        <div className="lg:col-span-5 border border-slate-200 rounded-2xl bg-slate-50/70 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-blue-800">
                Appointment Sheet Preview
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900">
                My Doctor Visit Summary
              </h2>
            </div>

            {!isChecklistEmpty && (
              <div className="flex items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-700" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>

          {isChecklistEmpty ? (
            <div className="py-12 text-center space-y-3">
              <p className="font-display text-base font-semibold text-slate-900">
                Your visit summary is currently empty
              </p>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Fill in any field on the left—or load our sample example—to generate a clean, printable checklist for your appointment.
              </p>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Load Sample Checklist</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-sm text-slate-800">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-500">
                  Main Reason for Visit
                </h3>
                <p className="leading-relaxed text-slate-900">
                  {visitPrep.appointmentReason.trim() || "Not added yet"}
                </p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500">
                  Symptom Timeline &amp; Notes
                </h3>
                <p className="leading-relaxed">
                  {visitPrep.symptomTimeline.trim() || "Not added yet"}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 tabular-nums">
                  Medications, Supplements &amp; Allergies (
                  {visitPrep.medicationsAndAllergies.length})
                </h3>
                {visitPrep.medicationsAndAllergies.length === 0 ? (
                  <p className="text-slate-500">None listed</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {visitPrep.medicationsAndAllergies.map((m) => (
                      <li key={m.id}>{m.text}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 tabular-nums">
                  Questions for My Clinician ({visitPrep.questionsToAsk.length})
                </h3>
                {visitPrep.questionsToAsk.length === 0 ? (
                  <p className="text-slate-500">No questions selected yet</p>
                ) : (
                  <ol className="list-decimal pl-5 space-y-1.5">
                    {visitPrep.questionsToAsk.map((q) => (
                      <li key={q.id} className="leading-relaxed">
                        <div className="flex items-start justify-between gap-2">
                          <span>{q.text}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onChangeVisitPrep((prev) => ({
                                ...prev,
                                questionsToAsk: prev.questionsToAsk.filter(
                                  (item) => item.id !== q.id
                                ),
                              }))
                            }
                            aria-label={`Remove question: ${q.text}`}
                            className="text-slate-400 hover:text-red-700 p-0.5 shrink-0 no-print"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {visitPrep.personalGoals.trim() && (
                <div className="space-y-1 pt-3 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500">
                    Appointment Goals
                  </h3>
                  <p className="leading-relaxed">
                    {visitPrep.personalGoals.trim()}
                  </p>
                </div>
              )}

              <p className="pt-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                Patient-prepared notes via AI HealthGuide · Share with a licensed doctor, nurse practitioner, or pharmacist during your visit.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
