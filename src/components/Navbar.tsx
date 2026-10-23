import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { AppSection } from "../types/health";

interface NavbarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: AppSection.OVERVIEW, label: "Overview" },
  { id: AppSection.CHAT, label: "Health Chat" },
  { id: AppSection.SYMPTOMS, label: "Symptom Guide" },
  { id: AppSection.VISIT_PREP, label: "Visit Prep" },
  { id: AppSection.EMERGENCY, label: "Urgent Care" },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (section: AppSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 py-3">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            handleSelect(AppSection.OVERVIEW);
          }}
          className="font-display text-base sm:text-xl font-bold tracking-tight text-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 rounded"
        >
          AI HealthGuide
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(item.id);
                }}
                className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                  isActive
                    ? "border-blue-700 text-blue-800 font-semibold"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (+ accessible mobile drawer trigger on small screens) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect(AppSection.EMERGENCY)}
            className={`min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 ${
              activeSection === AppSection.EMERGENCY
                ? "bg-red-800 text-white"
                : "bg-red-700 text-white hover:bg-red-800"
            }`}
          >
            Emergency Signs
          </button>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Accessible Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-primary-nav"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(item.id);
                }}
                className={`flex items-center w-full min-h-[44px] px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
};
