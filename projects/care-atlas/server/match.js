/** Haversine distance in miles */
export function milesBetween(a, b) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Explainable clinic ranking for underinsured / language-sensitive care search.
 * Scores are intentional and auditable — not a black-box recommender.
 */
export function scoreClinic(clinic, profile) {
  const reasons = [];
  let score = 0;

  const distance = milesBetween(
    { lat: profile.lat, lon: profile.lon },
    { lat: clinic.lat, lon: clinic.lon }
  );
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
  const overlap = (profile.languages || []).filter((l) => langs.has(l));
  if (overlap.length) {
    score += 12 * overlap.length;
    reasons.push(`Language match: ${overlap.join(", ")} (+${12 * overlap.length})`);
  }

  if (clinic.specialty === profile.specialty || clinic.specialty === "multi") {
    score += 20;
    reasons.push(`Specialty fit: ${clinic.specialty} (+20)`);
  } else {
    score -= 10;
    reasons.push(`Specialty mismatch (−10)`);
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

export function matchClinics(clinics, profile) {
  return clinics
    .map((clinic) => {
      const result = scoreClinic(clinic, profile);
      return { clinic, ...result };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score);
}

export function buildPrepChecklist(profile, clinic) {
  const items = [
    {
      id: "id",
      label: "Photo ID (driver’s license, state ID, or passport)",
      required: true,
    },
    {
      id: "address",
      label: "Proof of address dated within 60 days",
      required: true,
    },
  ];

  if (profile.uninsured || profile.incomeBand === "low") {
    items.push({
      id: "income",
      label: "Income proof for charity-care / sliding-scale application (pay stub or benefit letter)",
      required: true,
    });
    items.push({
      id: "household",
      label: "Household size attestation",
      required: false,
    });
  }

  if (profile.medicaid) {
    items.push({
      id: "medicaid",
      label: "Medicaid member ID card",
      required: true,
    });
  }

  if (clinic?.specialty === "behavioral" || profile.specialty === "behavioral") {
    items.push({
      id: "meds",
      label: "Current medication list and prior diagnoses (if any)",
      required: false,
    });
  }

  items.push({
    id: "symptoms",
    label: "One-page symptom timeline (when it started, what makes it worse)",
    required: false,
  });

  items.push({
    id: "questions",
    label: "Write 3 questions you want answered before you leave",
    required: false,
  });

  return {
    clinicName: clinic?.name ?? null,
    estimatedCashVisit: clinic?.cashVisitEstimate ?? null,
    items,
  };
}
