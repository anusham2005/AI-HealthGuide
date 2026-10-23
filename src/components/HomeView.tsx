import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  MessageSquareText,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import heroImage from "../assets/images/hero_healthcare_consultation_1792770249773.jpg";
import visitPrepImage from "../assets/images/care_visit_preparation_1792770249734.jpg";
import {
  SAMPLE_CARE_RESOURCES,
  STARTER_CHAT_QUESTIONS,
} from "../data/healthReferenceData";
import { AppSection } from "../types/health";
import { ResilientImage } from "./ResilientImage";

interface HomeViewProps {
  onNavigate: (section: AppSection) => void;
  onStartChatWithPrompt: (prompt: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onStartChatWithPrompt,
}) => {
  const [directoryFilter, setDirectoryFilter] = useState<
    "all" | "Public Helpline" | "Sample Clinic"
  >("all");
  const [directorySearch, setDirectorySearch] = useState("");

  const filteredResources = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return SAMPLE_CARE_RESOURCES.filter((res) => {
      if (directoryFilter === "Public Helpline" && res.isSimulatedFacility) {
        return false;
      }
      if (directoryFilter === "Sample Clinic" && !res.isSimulatedFacility) {
        return false;
      }
      if (!q) return true;
      return (
        res.name.toLowerCase().includes(q) ||
        res.summary.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q)
      );
    });
  }, [directoryFilter, directorySearch]);

  return (
    <div className="space-y-16 sm:space-y-20 pb-8">
      {/* Hero Section: 2-Column Balanced Split */}
      <section
        aria-labelledby="hero-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-blue-800">
              <span>General Health Education</span>
              <span aria-hidden="true">·</span>
              <span>Non-Diagnostic Guidance</span>
              <span aria-hidden="true">·</span>
              <span>Visit Preparation</span>
            </div>

            <h1
              id="hero-heading"
              className="font-display text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance]"
            >
              Clear, calm health information before and between doctor visits.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Explore everyday health topics in plain English, organize your symptoms by duration and severity, prepare thoughtful questions for your clinician, and quickly check emergency warning signs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate(AppSection.CHAT)}
                className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Ask Health Education Chat</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate(AppSection.SYMPTOMS)}
                className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Open Symptom Guide</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Safety Boundary: AI HealthGuide provides general educational information only. It cannot diagnose illnesses, prescribe medications, or access hospital records.
            </p>
          </div>

          <div className="lg:col-span-5">
            <ResilientImage
              src={heroImage}
              alt="Clinician welcoming a patient in a bright, calm consultation office with a stethoscope and notebook on a wooden desk"
              fallbackTitle="AI HealthGuide Consultation Support"
              fallbackSubtitle="Plain-English health education and visit preparation tools"
              containerClassName="w-full h-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Full-Width Urgent Care Quick-Access Strip Below Hero Split */}
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldAlert
              className="w-5 h-5 text-red-700 shrink-0 mt-0.5 sm:mt-0"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-800 leading-relaxed">
              <strong className="font-semibold text-red-900">
                Experiencing severe symptoms right now?
              </strong>{" "}
              Chest pain, trouble breathing, stroke signs, severe bleeding, or thoughts of self-harm require immediate emergency medical care (<strong className="tabular-nums">911</strong> or <strong className="tabular-nums">988</strong>).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(AppSection.EMERGENCY)}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-red-800 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 self-start md:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>View Emergency Warning Signs</span>
          </button>
        </div>
      </section>

      {/* Core Capabilities: Asymmetric Bento Grid */}
      <section
        aria-labelledby="capabilities-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="max-w-2xl space-y-2">
          <h2
            id="capabilities-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
          >
            Four practical tools for informed care conversations
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every section is built around clear clinical boundaries—helping you understand general health concepts and communicate effectively with licensed professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 01. Featured Span-2 Card: AI Health Education Chatbot */}
          <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-blue-800">
                  01. Gemini-Powered Health Education
                </span>
                <MessageSquareText
                  className="w-5 h-5 text-blue-700 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                AI Health Information Chatbot
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Ask general health questions and receive answers in simple, everyday English. The assistant asks helpful clarifying questions, highlights uncertainty, recognizes emergency warning signs, and never diagnoses conditions or prescribes drugs.
              </p>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Try a common health education question:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_CHAT_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => onStartChatWithPrompt(q.prompt)}
                      className="min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs sm:text-sm text-slate-700 hover:text-blue-800 font-medium transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Server-side Gemini integration · No personal IDs required
              </span>
              <button
                type="button"
                onClick={() => onNavigate(AppSection.CHAT)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Start Chatting</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 02. Span-1 Card: Symptom Guidance Form */}
          <div className="border border-slate-200 rounded-2xl bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-blue-800">
                  02. Structured Self-Reflection
                </span>
                <Stethoscope
                  className="w-5 h-5 text-blue-700 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Symptom Guidance Form
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter a symptom, how long it has lasted, and its severity to receive non-diagnostic educational notes, red-flag checks, and care-setting guidance.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate(AppSection.SYMPTOMS)}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Check Symptom Guidance</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 03. Span-2 Split Media Card: Doctor Visit Preparation Tool */}
          <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white overflow-hidden grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-blue-800">
                    03. Appointment Checklist
                  </span>
                  <ClipboardCheck
                    className="w-5 h-5 text-blue-700 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Doctor Visit Preparation Tool
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Appointments move quickly. Build a printable one-page summary with your main concern, symptom timeline, current supplements or allergies, and key questions so nothing gets forgotten.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.VISIT_PREP)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span>Build Visit Checklist</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="md:col-span-5 min-h-[200px]">
              <ResilientImage
                src={visitPrepImage}
                alt="Organized printed health checklist and pen beside a glass of water near a bright window"
                fallbackTitle="Printable Visit Summary"
                fallbackSubtitle="Organize questions and symptom notes"
                containerClassName="w-full h-full min-h-[200px] bg-slate-100"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 04. Span-1 Card: Urgent & Emergency Warning Reference */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-red-800">
                  04. Rapid Triage Reference
                </span>
                <ShieldAlert
                  className="w-5 h-5 text-red-700 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Emergency Warning Section
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review critical warning signs—including chest pressure, F.A.S.T. stroke signs, severe breathing distress, and crisis lifelines—plus Urgent Care vs. ER comparisons.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate(AppSection.EMERGENCY)}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
              >
                <span>Open Emergency Reference</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Public Helplines & Sample Care Reference Directory */}
      <section
        aria-labelledby="directory-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-blue-800">
              Care Navigation &amp; Transparent Sample Data
            </p>
            <h2
              id="directory-heading"
              className="font-display text-2xl font-bold text-slate-900 tracking-tight"
            >
              Emergency Helplines &amp; Sample Clinic Reference
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              National emergency numbers (<strong className="tabular-nums">911</strong> and <strong className="tabular-nums">988</strong>) are real public services. Local clinic entries below are clearly labeled{" "}
              <strong className="font-semibold text-slate-800">
                Sample Demo Listings
              </strong>{" "}
              because external hospital directories and electronic medical records are not connected to this web app.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              role="group"
              aria-label="Filter care reference directory"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
            >
              {(
                [
                  { id: "all", label: "All" },
                  { id: "Public Helpline", label: "Public Helplines" },
                  { id: "Sample Clinic", label: "Sample Clinics" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDirectoryFilter(tab.id)}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    directoryFilter === tab.id
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <label htmlFor="directory-search" className="sr-only">
                Search care directory
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="directory-search"
                type="search"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search listings..."
                className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              />
            </div>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-8 text-center space-y-3">
            <p className="font-display text-base font-semibold text-slate-900">
              No reference listings match &ldquo;{directorySearch}&rdquo;
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Clear your search filter to view public crisis helplines and illustrative sample clinic examples.
            </p>
            <button
              type="button"
              onClick={() => {
                setDirectoryFilter("all");
                setDirectorySearch("");
              }}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset Directory Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span
                      className={
                        item.isSimulatedFacility
                          ? "font-semibold text-amber-800"
                          : "font-semibold text-blue-800"
                      }
                    >
                      {item.isSimulatedFacility
                        ? "Sample Data · Not a Live Hospital Connection"
                        : "Verified Public Emergency / Crisis Number"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{item.availability}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 text-sm">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 tabular-nums">
                    {item.contactDisplay}
                  </span>
                  {!item.isSimulatedFacility && (
                    <button
                      type="button"
                      onClick={() => onNavigate(AppSection.EMERGENCY)}
                      className="text-xs font-semibold text-red-700 hover:text-red-800 underline underline-offset-4 whitespace-nowrap shrink-0"
                    >
                      Emergency Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
