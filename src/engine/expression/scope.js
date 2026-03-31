const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function toFiniteNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

export function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(toFiniteNumber(value) * factor) / factor;
}

export function payment(principal, annualRate, years) {
  const amount = toFiniteNumber(principal);
  const rate = toFiniteNumber(annualRate) / 100 / 12;
  const periods = Math.max(1, Math.round(toFiniteNumber(years) * 12));

  if (rate === 0) {
    return amount / periods;
  }

  const factor = (1 + rate) ** periods;
  return (amount * rate * factor) / (factor - 1);
}

export function amortization(principal, annualRate, years) {
  const amount = toFiniteNumber(principal);
  const periods = Math.max(1, Math.round(toFiniteNumber(years) * 12));
  const monthlyRate = toFiniteNumber(annualRate) / 100 / 12;
  const monthlyPayment = payment(amount, annualRate, years);
  const rows = [];
  let balance = amount;

  for (let month = 1; month <= periods; month += 1) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = Math.min(balance, monthlyPayment - interestPaid);
    balance = Math.max(0, balance - principalPaid);

    const yearIndex = Math.ceil(month / 12);
    if (!rows[yearIndex - 1]) {
      rows[yearIndex - 1] = {
        year: yearIndex,
        principalPaid: 0,
        interestPaid: 0,
        balance: amount,
      };
    }

    rows[yearIndex - 1].principalPaid += principalPaid;
    rows[yearIndex - 1].interestPaid += interestPaid;
    rows[yearIndex - 1].balance = balance;
  }

  return rows.map((row) => ({
    ...row,
    principalPaid: round(row.principalPaid, 2),
    interestPaid: round(row.interestPaid, 2),
    balance: round(row.balance, 2),
  }));
}

export const defaultHelpers = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  sqrt: Math.sqrt,
  round,
  payment,
  amortization,
  formatCurrency(value) {
    return currencyFormatter.format(toFiniteNumber(value));
  },
  hasErrors(errors = {}) {
    return Object.values(errors).some(Boolean);
  },
};

export function createExpressionScope({
  state = {},
  derived = {},
  runtime = {},
  locals = {},
  extras = {},
} = {}) {
  return {
    ...defaultHelpers,
    state,
    derived,
    runtime,
    ...state,
    ...derived,
    ...locals,
    ...extras,
  };
}
