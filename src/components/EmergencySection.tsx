import React, { useMemo, useState } from "react";
import { AlertTriangle, PhoneCall, Search, RotateCcw } from "lucide-react";
import {
  CARE_SETTING_COMPARISON,
  EMERGENCY_WARNING_ITEMS,
} from "../data/healthReferenceData";
import { AppSection, EmergencyCategory } from "../types/health";

interface EmergencySectionProps {
  onNavigate: (section: AppSection) => void;
}

const CATEGORY_FILTERS: Array<{ id: EmergencyCategory; label: string }> = [
  { id: "all", label: "All Warning Signs" },
  { id: "cardiac", label: "Heart & Chest" },
  { id: "breathing", label: "Breathing" },
  { id: "neurological", label: "Brain & Stroke" },
  { id: "injury_allergy", label: "Injury & Allergy" },
  { id: "mental_health", label: "Mental Health" },
];

export const EmergencySection: React.FC<EmergencySectionProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return EMERGENCY_WARNING_ITEMS.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!query) return true;
      const searchable = [
        item.title,
        item.categoryLabel,
        item.immediateAction,
        ...item.plainSigns,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <section
      aria-labelledby="emergency-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10"
    >
      {/* Top Urgent Action Callout */}
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50/80 p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-start gap-3.5">
          <AlertTriangle
            className="w-7 h-7 text-red-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-800">
              Immediate Emergency Action · Do Not Wait for Online Guidance
            </p>
            <h1
              id="emergency-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight [text-wrap:balance]"
            >
              Emergency Warning Signs &amp; Urgent Medical Guidance
            </h1>
            <p className="text-base text-slate-800 leading-relaxed max-w-3xl">
              If you or someone near you is experiencing a medical emergency,{" "}
              <strong className="font-semibold text-red-900">
                call your local emergency number immediately
              </strong>{" "}
              or go to the nearest hospital emergency department. Do not rely on a web app or chatbot during an acute crisis.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3 tabular-nums">
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Call 911 (Emergency Dispatch)</span>
          </a>
          <a
            href="tel:988"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-800 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Call or Text 988 (Suicide &amp; Crisis Lifeline)</span>
          </a>
          <span className="text-xs sm:text-sm text-slate-700 px-1">
            International: <strong>112</strong> (EU) · <strong>999</strong> (UK) · <strong>000</strong> (AU)
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div
            role="group"
            aria-label="Filter warning signs by body system"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl"
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    active
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <label htmlFor="emergency-search" className="sr-only">
              Search emergency warning signs
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="emergency-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search signs (e.g., stroke, breathing)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
          </div>
        </div>

        {/* Warning Signs List or Empty State */}
        {filteredItems.length === 0 ? (
          <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-8 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-slate-900">
              No matching warning sign categories found
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              If someone looks seriously ill, is in severe pain, or you feel unsure whether a symptom is life-threatening, always err on the side of calling emergency services right away.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Show All Warning Signs</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="text-xs text-red-700 font-semibold">
                    <span>{item.categoryLabel}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Seek Immediate Emergency Care</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {item.title}
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
                    {item.plainSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 text-sm text-slate-800">
                  <strong className="font-semibold text-slate-900">
                    Recommended Action:{" "}
                  </strong>
                  {item.immediateAction}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Room vs Urgent Care vs Primary Care Reference Table */}
      <div className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Choosing Where to Seek Medical Care
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl">
            General educational comparison of care settings. Coverage, hours, and services vary by region—always call emergency dispatch if you suspect a life-threatening emergency.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-700">
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Care Setting
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Typical Access
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  General Examples
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Not Intended For
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {CARE_SETTING_COMPARISON.map((row) => (
                <tr key={row.setting} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 align-top whitespace-nowrap">
                    {row.setting}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-600 align-top tabular-nums">
                    {row.typicalWaitAndAccess}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-700 align-top leading-relaxed">
                    {row.appropriateExamples}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-600 align-top leading-relaxed">
                    {row.notDesignedFor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Planning a non-emergency appointment instead? Use our checklist builder to organize questions for your clinician.
          </p>
          <button
            type="button"
            onClick={() => onNavigate(AppSection.VISIT_PREP)}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-blue-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Prepare for a Non-Urgent Doctor Visit
          </button>
        </div>
      </div>
    </section>
  );
};
