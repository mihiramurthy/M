/** Student loan amortization + simplified IDR + forbearance capitalization. */

export function monthlyInterest(balance, annualRate) {
  return balance * (annualRate / 12);
}

/** Standard fixed payment for n months. */
export function standardPayment(principal, annualRate, months = 120) {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function runStandard({ principal, annualRate, months = 120 }) {
  let balance = principal;
  const payment = standardPayment(principal, annualRate, months);
  const schedule = [];
  let totalPaid = 0;
  let totalInterest = 0;
  let m = 0;

  while (balance > 0.01 && m < months + 24) {
    m += 1;
    const interest = monthlyInterest(balance, annualRate);
    let principalPaid = payment - interest;
    if (principalPaid > balance) principalPaid = balance;
    const paid = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);
    totalPaid += paid;
    totalInterest += interest;
    if (m <= 360) {
      schedule.push({
        month: m,
        payment: round2(paid),
        interest: round2(interest),
        balance: round2(balance),
      });
    }
  }

  return {
    id: "standard",
    name: "Standard 10-year",
    months: m,
    monthlyPayment: round2(payment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    forgiven: 0,
    endingBalance: round2(balance),
    scheduleSample: sampleSchedule(schedule),
  };
}

/**
 * Simplified PAYE-like IDR:
 * payment = max(0, 0.10 * (AGI - povertyGuideline) / 12)
 * Forgiveness after 240 months of qualifying payments (demo rule).
 */
export function runIdr({
  principal,
  annualRate,
  agi,
  familySize = 1,
  povertyBase = 15650,
  povertyPerPerson = 5500,
  paymentShare = 0.1,
  forgivenessMonths = 240,
}) {
  const poverty = povertyBase + Math.max(0, familySize - 1) * povertyPerPerson;
  const annualDiscretionary = Math.max(0, agi - poverty);
  const payment = (annualDiscretionary * paymentShare) / 12;

  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;
  const schedule = [];
  let m = 0;

  while (balance > 0.01 && m < forgivenessMonths) {
    m += 1;
    const interest = monthlyInterest(balance, annualRate);
    totalInterest += interest;
    if (payment <= interest) {
      // negative amortization — unpaid interest accrues (simplified demo)
      balance += interest - payment;
      totalPaid += payment;
      schedule.push({
        month: m,
        payment: round2(payment),
        interest: round2(interest),
        balance: round2(balance),
      });
    } else {
      const principalPaid = payment - interest;
      balance = Math.max(0, balance - principalPaid);
      totalPaid += payment;
      schedule.push({
        month: m,
        payment: round2(payment),
        interest: round2(interest),
        balance: round2(balance),
      });
    }
  }

  const forgiven = balance > 0.01 ? balance : 0;
  return {
    id: "idr",
    name: "IDR (PAYE-like 10% discretionary)",
    months: m,
    monthlyPayment: round2(payment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    forgiven: round2(forgiven),
    endingBalance: round2(forgiven > 0 ? 0 : balance),
    povertyGuideline: poverty,
    scheduleSample: sampleSchedule(schedule),
    note:
      forgiven > 0
        ? `Remaining $${round2(forgiven)} forgiven after ${forgivenessMonths} months (demo rule).`
        : "Paid off before forgiveness horizon.",
  };
}

/**
 * Forbearance trap: pause payments for `pauseMonths`, capitalize accrued interest,
 * then resume standard repayment on the new principal.
 */
export function runForbearanceTrap({
  principal,
  annualRate,
  pauseMonths = 12,
  repayMonths = 120,
}) {
  let balance = principal;
  let accrued = 0;
  for (let i = 0; i < pauseMonths; i++) {
    accrued += monthlyInterest(balance + accrued, annualRate);
  }
  const capitalized = balance + accrued;
  const after = runStandard({
    principal: capitalized,
    annualRate,
    months: repayMonths,
  });

  return {
    id: "forbearance",
    name: `Forbearance ${pauseMonths}mo then Standard`,
    pauseMonths,
    interestCapitalized: round2(accrued),
    balanceAfterCapitalization: round2(capitalized),
    months: pauseMonths + after.months,
    monthlyPayment: after.monthlyPayment,
    totalPaid: after.totalPaid,
    totalInterest: round2(accrued + after.totalInterest),
    forgiven: 0,
    endingBalance: after.endingBalance,
    scheduleSample: after.scheduleSample,
    warning:
      "Interest accrued during forbearance is capitalized — balance jumps before repayment resumes.",
  };
}

export function compareScenarios(input) {
  const standard = runStandard(input);
  const idr = runIdr(input);
  const forbearance = runForbearanceTrap(input);
  const cheapestCash = [standard, idr].sort((a, b) => a.totalPaid - b.totalPaid)[0];

  return {
    input: {
      principal: input.principal,
      annualRate: input.annualRate,
      agi: input.agi,
      familySize: input.familySize ?? 1,
    },
    scenarios: [standard, idr, forbearance],
    insight: {
      lowestCashOutlay: cheapestCash.id,
      forbearancePenaltyVsStandard: round2(
        forbearance.totalPaid - standard.totalPaid
      ),
      idrVsStandardCash: round2(idr.totalPaid - standard.totalPaid),
    },
  };
}

function sampleSchedule(schedule) {
  if (schedule.length <= 12) return schedule;
  const picks = [];
  for (let i = 0; i < 6; i++) picks.push(schedule[i]);
  picks.push(schedule[Math.floor(schedule.length / 2)]);
  for (let i = schedule.length - 5; i < schedule.length; i++) picks.push(schedule[i]);
  return picks;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
