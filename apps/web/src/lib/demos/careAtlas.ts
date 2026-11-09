export type Clinic = {
  id: string;
  name: string;
  specialty: string;
  lat: number;
  lon: number;
  zip: string;
  languages: string;
  slidingScale: number;
  acceptsMedicaid: number;
  waitDays: number;
  transitAccess: number;
  cashVisitEstimate: number;
  phone: string;
  notes: string;
};

export type Profile = {
  lat: number;
  lon: number;
  uninsured: boolean;
  medicaid?: boolean;
  incomeBand: string;
  languages: string[];
  specialty: string;
  maxMiles: number;
};

export const CLINICS: Clinic[] = [
  {
    id: "ca-01",
    name: "Paint Branch Community Health",
    specialty: "primary",
    lat: 39.012,
    lon: -76.921,
    zip: "20740",
    languages: "en,es",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 5,
    transitAccess: 1,
    cashVisitEstimate: 45,
    phone: "301-555-0142",
    notes: "FQHC. Walk-in mornings for primary care.",
  },
  {
    id: "ca-02",
    name: "Riverdale Sliding Care Clinic",
    specialty: "primary",
    lat: 38.961,
    lon: -76.935,
    zip: "20737",
    languages: "en,es,am",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 12,
    transitAccess: 1,
    cashVisitEstimate: 35,
    phone: "301-555-0198",
    notes: "Strong Amharic interpreter coverage.",
  },
  {
    id: "ca-03",
    name: "College Park Behavioral Collective",
    specialty: "behavioral",
    lat: 38.989,
    lon: -76.94,
    zip: "20740",
    languages: "en",
    slidingScale: 1,
    acceptsMedicaid: 0,
    waitDays: 18,
    transitAccess: 1,
    cashVisitEstimate: 60,
    phone: "301-555-0111",
    notes: "Sliding scale therapy; no Medicaid billing.",
  },
  {
    id: "ca-04",
    name: "Greenbelt Women's Health Access",
    specialty: "obgyn",
    lat: 39.004,
    lon: -76.875,
    zip: "20770",
    languages: "en,es",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 9,
    transitAccess: 0,
    cashVisitEstimate: 80,
    phone: "301-555-0177",
    notes: "Title X funded reproductive care.",
  },
  {
    id: "ca-05",
    name: "Beltway Concierge Medicine",
    specialty: "primary",
    lat: 38.995,
    lon: -76.93,
    zip: "20740",
    languages: "en",
    slidingScale: 0,
    acceptsMedicaid: 0,
    waitDays: 2,
    transitAccess: 0,
    cashVisitEstimate: 275,
    phone: "301-555-0100",
    notes: "Cash-pay only boutique practice.",
  },
  {
    id: "ca-06",
    name: "Hyattsville Multi-Specialty Hub",
    specialty: "multi",
    lat: 38.955,
    lon: -76.945,
    zip: "20781",
    languages: "en,es,zh",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 14,
    transitAccess: 1,
    cashVisitEstimate: 55,
    phone: "301-555-0166",
    notes: "Primary + dental + behavioral under one roof.",
  },
  {
    id: "ca-07",
    name: "Laurel Urgent Access",
    specialty: "urgent",
    lat: 39.099,
    lon: -76.848,
    zip: "20707",
    languages: "en,es",
    slidingScale: 0,
    acceptsMedicaid: 1,
    waitDays: 0,
    transitAccess: 1,
    cashVisitEstimate: 140,
    phone: "301-555-0133",
    notes: "Same-day urgent care; limited charity slots.",
  },
  {
    id: "ca-08",
    name: "Takoma Dental Equity",
    specialty: "dental",
    lat: 38.975,
    lon: -77.012,
    zip: "20912",
    languages: "en,es,fr",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 21,
    transitAccess: 1,
    cashVisitEstimate: 70,
    phone: "301-555-0188",
    notes: "Sliding-scale cleanings and extractions.",
  },
];

function milesBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function scoreClinic(clinic: Clinic, profile: Profile) {
  const reasons: string[] = [];
  let score = 0;
  const distance = milesBetween(profile, clinic);
  if (distance > profile.maxMiles) {
    return { score: -1, distance, reasons: ["Outside max travel radius"] };
  }
  const proximity = Math.max(0, 30 - distance);
  score += proximity;
  reasons.push(`${distance.toFixed(1)} mi away (+${proximity.toFixed(1)})`);

  if (profile.uninsured || profile.incomeBand === "low") {
    if (clinic.slidingScale) {
      score += 25;
      reasons.push("Sliding-scale / charity care (+25)");
    } else {
      score -= 15;
      reasons.push("No sliding scale (−15)");
    }
  }
  if (clinic.acceptsMedicaid && profile.medicaid) {
    score += 15;
    reasons.push("Accepts Medicaid (+15)");
  }
  const langs = new Set(clinic.languages.split(","));
  const overlap = profile.languages.filter((l) => langs.has(l));
  if (overlap.length) {
    score += 12 * overlap.length;
    reasons.push(`Language match: ${overlap.join(", ")} (+${12 * overlap.length})`);
  }
  if (clinic.specialty === profile.specialty || clinic.specialty === "multi") {
    score += 20;
    reasons.push(`Specialty fit: ${clinic.specialty} (+20)`);
  } else {
    score -= 10;
    reasons.push("Specialty mismatch (−10)");
  }
  if (clinic.waitDays <= 7) {
    score += 8;
    reasons.push(`Short wait (${clinic.waitDays}d) (+8)`);
  } else if (clinic.waitDays > 21) {
    score -= 6;
    reasons.push(`Long wait (${clinic.waitDays}d) (−6)`);
  }
  if (clinic.transitAccess) {
    score += 5;
    reasons.push("Transit-accessible (+5)");
  }
  return { score, distance, reasons };
}

export function matchClinics(profile: Profile, clinics: Clinic[] = CLINICS) {
  return clinics
    .map((clinic) => ({ clinic, ...scoreClinic(clinic, profile) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score);
}

export function buildPrepChecklist(profile: Profile, clinic: Clinic | null) {
  const items = [
    { id: "id", label: "Photo ID", required: true },
    { id: "address", label: "Proof of address (≤60 days)", required: true },
  ];
  if (profile.uninsured || profile.incomeBand === "low") {
    items.push({
      id: "income",
      label: "Income proof for charity-care / sliding-scale",
      required: true,
    });
  }
  if (profile.medicaid) {
    items.push({ id: "medicaid", label: "Medicaid member ID", required: true });
  }
  items.push({
    id: "questions",
    label: "Write 3 questions you want answered",
    required: false,
  });
  return {
    clinicName: clinic?.name ?? null,
    estimatedCashVisit: clinic?.cashVisitEstimate ?? null,
    items,
  };
}
