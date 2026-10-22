function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function monthlyInterest(balance: number, annualRate: number) {
  return balance * (annualRate / 12);
}

function standardPayment(principal: number, annualRate: number, months = 120) {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function runStandard({
  principal,
  annualRate,
  months = 120,
}: {
  principal: number;
  annualRate: number;
  months?: number;
}) {
  let balance = principal;
  const payment = standardPayment(principal, annualRate, months);
  let totalPaid = 0;
  let totalInterest = 0;
  let m = 0;
  while (balance > 0.01 && m < months + 24) {
    m += 1;
    const interest = monthlyInterest(balance, annualRate);
    let principalPaid = Math.min(balance, payment - interest);
    const paid = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);
    totalPaid += paid;
    totalInterest += interest;
  }
  return {
    id: "standard",
    name: "Standard 10-year",
    months: m,
    monthlyPayment: round2(payment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    forgiven: 0,
  };
}

export function runIdr({
  principal,
  annualRate,
  agi,
  familySize = 1,
  povertyBase = 15650,
  povertyPerPerson = 5500,
  paymentShare = 0.1,
  forgivenessMonths = 240,
}: {
  principal: number;
  annualRate: number;
  agi: number;
  familySize?: number;
  povertyBase?: number;
  povertyPerPerson?: number;
  paymentShare?: number;
  forgivenessMonths?: number;
}) {
  const poverty = povertyBase + Math.max(0, familySize - 1) * povertyPerPerson;
  const payment = (Math.max(0, agi - poverty) * paymentShare) / 12;
  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;
  let m = 0;
  while (balance > 0.01 && m < forgivenessMonths) {
    m += 1;
    const interest = monthlyInterest(balance, annualRate);
    totalInterest += interest;
    if (payment <= interest) {
      balance += interest - payment;
      totalPaid += payment;
    } else {
      balance = Math.max(0, balance - (payment - interest));
      totalPaid += payment;
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
    note:
      forgiven > 0
        ? `Remaining $${round2(forgiven)} forgiven after ${forgivenessMonths} months (demo rule).`
        : "Paid off before forgiveness horizon.",
  };
}

export function runForbearanceTrap({
  principal,
  annualRate,
  pauseMonths = 12,
  repayMonths = 120,
}: {
  principal: number;
  annualRate: number;
  pauseMonths?: number;
  repayMonths?: number;
}) {
  let accrued = 0;
  for (let i = 0; i < pauseMonths; i++) {
    accrued += monthlyInterest(principal + accrued, annualRate);
  }
  const capitalized = principal + accrued;
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
    warning:
      "Interest accrued during forbearance is capitalized — balance jumps before repayment resumes.",
  };
}

export function compareScenarios(input: {
  principal: number;
  annualRate: number;
  agi: number;
  familySize?: number;
  pauseMonths?: number;
}) {
  const standard = runStandard(input);
  const idr = runIdr(input);
  const forbearance = runForbearanceTrap(input);
  const cheapestCash = [standard, idr].sort((a, b) => a.totalPaid - b.totalPaid)[0];
  return {
    scenarios: [standard, idr, forbearance],
    insight: {
      lowestCashOutlay: cheapestCash.id,
      forbearancePenaltyVsStandard: round2(forbearance.totalPaid - standard.totalPaid),
      idrVsStandardCash: round2(idr.totalPaid - standard.totalPaid),
    },
  };
}
