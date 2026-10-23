import React from "react";
import { Info, PhoneCall } from "lucide-react";
import { AppSection } from "../types/health";

interface DisclaimerBannerProps {
  onOpenEmergency: () => void;
  activeSection: AppSection;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  onOpenEmergency,
  activeSection,
}) => {
  return (
    <div
      role="region"
      aria-label="Medical disclaimer and emergency notice"
      className="bg-blue-50/80 border-b border-blue-200/80 no-print"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-slate-800">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-900">
              General Health Education Only:
            </strong>{" "}
            AI HealthGuide does not diagnose medical conditions, prescribe medicine, or replace a licensed doctor.
          </p>
        </div>

        {activeSection !== AppSection.EMERGENCY && (
          <button
            type="button"
            onClick={onOpenEmergency}
            className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-[32px] text-red-800 hover:text-red-900 font-semibold underline underline-offset-4 whitespace-nowrap shrink-0 self-start sm:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 rounded"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Medical emergency? Call 911 or view warning signs</span>
          </button>
        )}
      </div>
    </div>
  );
};
