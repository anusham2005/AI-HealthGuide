import React from "react";
import { AppSection } from "../types/health";

interface FooterProps {
  onNavigate: (section: AppSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
          <div className="md:col-span-6 space-y-3">
            <p className="font-display text-lg font-bold text-slate-900">
              AI HealthGuide – Smart Healthcare Assistant
            </p>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Designed for general health education, doctor visit organization, and recognizing urgent warning signs. Information provided by this application is educational and never replaces individualized care, diagnosis, or treatment from a qualified healthcare professional.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Data &amp; Privacy Notice: Sample clinic listings and checklists are illustrative only and are not connected to live hospitals, emergency dispatch systems, or electronic health records (EHR). Avoid entering personal identifiers such as full names, addresses, or ID numbers.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <p className="font-display text-sm font-semibold text-slate-900">
              Tools &amp; Sections
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.OVERVIEW)}
                  className="min-h-[40px] text-slate-600 hover:text-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.CHAT)}
                  className="min-h-[40px] text-slate-600 hover:text-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                >
                  Health Information Chat
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.SYMPTOMS)}
                  className="min-h-[40px] text-slate-600 hover:text-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                >
                  Symptom Guidance Form
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.VISIT_PREP)}
                  className="min-h-[40px] text-slate-600 hover:text-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                >
                  Doctor Visit Preparation
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <p className="font-display text-sm font-semibold text-slate-900">
              Immediate Urgent Help
            </p>
            <p className="text-sm text-slate-600 leading-relaxed tabular-nums">
              Medical Emergency: <strong className="text-slate-900">911</strong> (US/CA),{" "}
              <strong className="text-slate-900">112</strong> (EU), or{" "}
              <strong className="text-slate-900">999</strong> (UK).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed tabular-nums">
              Suicide &amp; Crisis Lifeline:{" "}
              <strong className="text-slate-900">Call or text 988</strong> (US/CA).
            </p>
            <button
              type="button"
              onClick={() => onNavigate(AppSection.EMERGENCY)}
              className="inline-flex items-center min-h-[40px] text-sm font-semibold text-red-700 hover:text-red-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 rounded"
            >
              Review Emergency Warning Signs
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>AI HealthGuide · Educational Healthcare Reference</p>
          <p>Non-Diagnostic · Non-Prescriptive · Consult a Licensed Physician</p>
        </div>
      </div>
    </footer>
  );
};
