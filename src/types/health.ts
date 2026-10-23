export enum AppSection {
  OVERVIEW = "overview",
  CHAT = "chat",
  SYMPTOMS = "symptoms",
  VISIT_PREP = "visit-prep",
  EMERGENCY = "emergency",
}

export enum SeverityLevel {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
}

export type DurationOption =
  | "less_than_24h"
  | "1_to_3_days"
  | "4_to_7_days"
  | "1_to_2_weeks"
  | "more_than_2_weeks";

export interface EmergencyCheckInfo {
  isEmergency: boolean;
  isCrisisLineRelevant: boolean;
  matchedWarnings: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  emergency?: EmergencyCheckInfo;
  privacyNoticeTriggered?: boolean;
}

export interface SymptomFormInput {
  symptom: string;
  duration: DurationOption | "";
  severity: SeverityLevel | "";
  redFlags: string[];
  additionalNotes: string;
}

export interface SymptomGuidanceData {
  plainSummary: string;
  careUrgencyLevel: "emergency" | "prompt_medical_eval" | "routine_doctor_visit";
  urgencyExplanation: string;
  generalComfortTips: string[];
  warningSignsToWatch: string[];
  questionsForDoctor: string[];
  uncertaintyNote: string;
}

export interface VisitPrepItem {
  id: string;
  text: string;
}

export interface VisitPrepState {
  appointmentReason: string;
  symptomTimeline: string;
  medicationsAndAllergies: VisitPrepItem[];
  questionsToAsk: VisitPrepItem[];
  personalGoals: string;
}

export type EmergencyCategory =
  | "all"
  | "cardiac"
  | "breathing"
  | "neurological"
  | "injury_allergy"
  | "mental_health";

export interface EmergencyWarningItem {
  id: string;
  category: Exclude<EmergencyCategory, "all">;
  categoryLabel: string;
  title: string;
  plainSigns: string[];
  immediateAction: string;
}

export interface CareSettingComparisonRow {
  setting: string;
  typicalWaitAndAccess: string;
  appropriateExamples: string;
  notDesignedFor: string;
}

export interface SampleCareResource {
  id: string;
  name: string;
  type: "Public Helpline" | "Sample Urgent Care" | "Sample Community Clinic";
  availability: string;
  contactDisplay: string;
  summary: string;
  isSimulatedFacility: boolean;
}
