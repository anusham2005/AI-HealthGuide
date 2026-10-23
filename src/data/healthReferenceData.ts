import {
  CareSettingComparisonRow,
  DurationOption,
  EmergencyWarningItem,
  SampleCareResource,
  VisitPrepState,
} from "../types/health";

export const DURATION_OPTIONS: Array<{ value: DurationOption; label: string }> = [
  { value: "less_than_24h", label: "Less than 24 hours" },
  { value: "1_to_3_days", label: "1 to 3 days" },
  { value: "4_to_7_days", label: "4 to 7 days" },
  { value: "1_to_2_weeks", label: "1 to 2 weeks" },
  { value: "more_than_2_weeks", label: "More than 2 weeks" },
];

export const COMMON_SYMPTOM_SUGGESTIONS: string[] = [
  "Sore throat and mild cough",
  "Dull headache behind forehead",
  "Seasonal nasal congestion",
  "Mild stomach discomfort after meals",
  "Daytime fatigue and poor sleep",
  "Lower back stiffness",
];

export const SYMPTOM_RED_FLAG_CHECKBOXES: string[] = [
  "Chest pain, pressure, or tightness",
  "Difficulty breathing or shortness of breath at rest",
  "Sudden facial drooping, arm weakness, or slurred speech",
  "Severe uncontrolled bleeding or coughing/vomiting blood",
  "Swelling of lips, tongue, or throat",
  "Confusion, fainting, or inability to stay awake",
];

export const STARTER_CHAT_QUESTIONS: Array<{
  label: string;
  prompt: string;
}> = [
  {
    label: "Cold vs. seasonal allergies",
    prompt:
      "In simple English, what are the general differences between a common cold and seasonal allergies, and when should someone see a doctor?",
  },
  {
    label: "Preparing for blood pressure check",
    prompt:
      "How can I prepare for a routine blood pressure check at a clinic, and what general questions should I ask my doctor?",
  },
  {
    label: "Hydration & rest during mild illness",
    prompt:
      "What general non-medication hydration and rest habits do clinicians usually share for mild viral symptoms, and what warning signs mean urgent care is needed?",
  },
  {
    label: "Understanding lab test discussions",
    prompt:
      "What general questions can help me understand routine blood test results when talking with my primary care doctor?",
  },
];

export const SUGGESTED_DOCTOR_QUESTIONS: string[] = [
  "What are the most common possibilities we should consider or rule out?",
  "Are any diagnostic tests needed right now, or is watchful waiting appropriate?",
  "What specific warning signs mean I should seek urgent or emergency care?",
  "How might my daily routine, sleep, or nutrition affect these symptoms?",
  "When should we schedule a follow-up if things stay the same or change?",
];

export const SAMPLE_VISIT_PREP_TEMPLATE: VisitPrepState = {
  appointmentReason:
    "Sample Entry: Recurring afternoon tension headaches and eye strain over the past 10 days.",
  symptomTimeline:
    "Sample Entry: Started roughly 10 days ago on workdays around 3:00 PM; usually mild to moderate, improves slightly after resting in a quiet room.",
  medicationsAndAllergies: [
    { id: "sample-med-1", text: "Sample: Daily multivitamin with breakfast" },
    { id: "sample-med-2", text: "Sample Allergy: Penicillin (childhood rash)" },
  ],
  questionsToAsk: [
    {
      id: "sample-q-1",
      text: "Could screen ergonomics, hydration, or sleep changes be contributing to these headaches?",
    },
    {
      id: "sample-q-2",
      text: "What red-flag headache symptoms should prompt an immediate urgent evaluation?",
    },
    {
      id: "sample-q-3",
      text: "Should I keep a daily symptom diary before our next check-in?",
    },
  ],
  personalGoals:
    "Sample Entry: Understand safe everyday adjustments I can make at work and know clearly when follow-up care is needed.",
};

export const EMERGENCY_WARNING_ITEMS: EmergencyWarningItem[] = [
  {
    id: "cardiac",
    category: "cardiac",
    categoryLabel: "Heart & Chest",
    title: "Chest Pain, Pressure, or Upper-Body Discomfort",
    plainSigns: [
      "Uncomfortable pressure, squeezing, fullness, or pain in the center or left side of the chest lasting more than a few minutes or coming back.",
      "Pain or discomfort spreading to one or both arms, the back, neck, jaw, or upper stomach.",
      "Chest discomfort accompanied by cold sweats, nausea, sudden dizziness, or shortness of breath.",
    ],
    immediateAction:
      "Call 911 (or your local emergency number) immediately. Do not drive yourself to the hospital if ambulance services are available.",
  },
  {
    id: "breathing",
    category: "breathing",
    categoryLabel: "Breathing",
    title: "Severe Difficulty Breathing or Airway Distress",
    plainSigns: [
      "Gasping for air, inability to speak in full sentences, or sudden shortness of breath while resting.",
      "Bluish, grayish, or pale tint around the lips, tongue, or fingernails.",
      "Noisy, high-pitched wheezing or stridor that rapidly worsens.",
    ],
    immediateAction:
      "Call emergency services right away and keep the person upright in a comfortable position while awaiting paramedics.",
  },
  {
    id: "neurological",
    category: "neurological",
    categoryLabel: "Brain & Stroke (F.A.S.T.)",
    title: "Sudden Stroke Signs, Fainting, or Seizures",
    plainSigns: [
      "F — Face Drooping: One side of the face droops or feels numb when smiling.",
      "A — Arm Weakness: One arm feels weak, numb, or drifts downward when raised.",
      "S — Speech Difficulty: Slurred speech, trouble finding words, or difficulty understanding simple sentences.",
      "T — Time to Call Emergency Services: Also seek emergency help for a sudden 'worst headache of life', new seizure, fainting, or sudden confusion.",
    ],
    immediateAction:
      "Call 911 immediately and note the exact time symptoms first appeared—early hospital treatment is time-critical.",
  },
  {
    id: "injury_allergy",
    category: "injury_allergy",
    categoryLabel: "Injury, Bleeding & Allergy",
    title: "Severe Allergic Reaction, Uncontrolled Bleeding, or Major Trauma",
    plainSigns: [
      "Rapid swelling of the lips, tongue, face, or throat, or hives paired with trouble breathing or dizziness (anaphylaxis).",
      "Heavy bleeding that does not slow after firm, continuous direct pressure, or coughing/vomiting blood.",
      "Head, neck, or spine injury with drowsiness, vomiting, or unequal pupils; deep burns; or suspected poisoning/overdose.",
    ],
    immediateAction:
      "Call local emergency services immediately. For suspected poisoning in the US, you can also call Poison Control at 1-800-222-1222 if the person is awake and breathing.",
  },
  {
    id: "mental_health",
    category: "mental_health",
    categoryLabel: "Mental Health Crisis",
    title: "Thoughts of Self-Harm, Suicide, or Acute Emotional Crisis",
    plainSigns: [
      "Thoughts or statements about wanting to end one's life, hurting oneself, or feeling unable to stay safe.",
      "Severe panic, disorientation, or inability to care for basic personal safety.",
    ],
    immediateAction:
      "Call or text 988 (in the US & Canada) to reach the free, confidential 24/7 Suicide & Crisis Lifeline, call 911, or go to the nearest emergency room.",
  },
];

export const CARE_SETTING_COMPARISON: CareSettingComparisonRow[] = [
  {
    setting: "Emergency Department (ER / 911)",
    typicalWaitAndAccess: "Open 24/7 · Triaged by medical urgency",
    appropriateExamples:
      "Chest pain, trouble breathing, stroke signs, severe bleeding, major head trauma, anaphylaxis, seizures, loss of consciousness.",
    notDesignedFor:
      "Routine checkups, mild colds, or non-urgent administrative health forms.",
  },
  {
    setting: "Urgent Care Walk-In Clinic",
    typicalWaitAndAccess: "Extended daily hours · Same-day walk-in",
    appropriateExamples:
      "Minor cuts or sprains, mild-to-moderate ear pain, sore throat, painful urination, or mild fever without emergency warning signs.",
    notDesignedFor:
      "Life-threatening chest pain, stroke symptoms, severe shortness of breath, or major trauma.",
  },
  {
    setting: "Primary Care Clinician",
    typicalWaitAndAccess: "Scheduled visit · Continuity of care",
    appropriateExamples:
      "Ongoing or recurring symptoms, preventive screenings, chronic health education, lab reviews, and personalized medical plans.",
    notDesignedFor:
      "Sudden, rapidly worsening, or life-threatening medical emergencies.",
  },
];

export const SAMPLE_CARE_RESOURCES: SampleCareResource[] = [
  {
    id: "res-911",
    name: "Local Emergency Medical Services",
    type: "Public Helpline",
    availability: "24/7 Immediate Dispatch",
    contactDisplay: "911 (US/CA) · 112 (EU) · 999 (UK)",
    summary:
      "Immediate ambulance and emergency medical response for life-threatening physical or medical emergencies.",
    isSimulatedFacility: false,
  },
  {
    id: "res-988",
    name: "Suicide & Crisis Lifeline",
    type: "Public Helpline",
    availability: "24/7 Free & Confidential",
    contactDisplay: "Call or Text 988 (US & Canada)",
    summary:
      "Free, confidential crisis support for anyone experiencing emotional distress, self-harm thoughts, or a mental health crisis.",
    isSimulatedFacility: false,
  },
  {
    id: "res-sample-uc",
    name: "Harborview Walk-In Urgent Care (Sample Listing)",
    type: "Sample Urgent Care",
    availability: "Daily 08:00 – 20:00 (Sample Schedule)",
    contactDisplay: "(555) 014-2200 · Sample Demo Entry",
    summary:
      "Illustrative example showing how non-emergency walk-in clinics handle minor injuries and same-day evaluations. Not connected to a live hospital network.",
    isSimulatedFacility: true,
  },
  {
    id: "res-sample-pcp",
    name: "BlueOak Community Family Practice (Sample Listing)",
    type: "Sample Community Clinic",
    availability: "Mon–Fri 08:30 – 17:00 (Sample Schedule)",
    contactDisplay: "(555) 019-4810 · Sample Demo Entry",
    summary:
      "Illustrative example of a primary care office for preventive checkups and ongoing symptom follow-up. No live scheduling or medical record connection.",
    isSimulatedFacility: true,
  },
];
