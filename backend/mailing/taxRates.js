const TAX_RATES = {
  AT: { rate: 0.20,  display: "20%",   label: "VAT" },
  BE: { rate: 0.21,  display: "21%",   label: "VAT" },
  BG: { rate: 0.20,  display: "20%",   label: "VAT" },
  CY: { rate: 0.19,  display: "19%",   label: "VAT" },
  CZ: { rate: 0.21,  display: "21%",   label: "VAT" },
  DE: { rate: 0.19,  display: "19%",   label: "VAT" },
  DK: { rate: 0.25,  display: "25%",   label: "VAT" },
  EE: { rate: 0.22,  display: "22%",   label: "VAT" },
  ES: { rate: 0.21,  display: "21%",   label: "IVA" },
  FI: { rate: 0.255, display: "25.5%", label: "VAT" },
  FR: { rate: 0.20,  display: "20%",   label: "TVA" },
  GR: { rate: 0.24,  display: "24%",   label: "VAT" },
  HR: { rate: 0.25,  display: "25%",   label: "VAT" },
  HU: { rate: 0.27,  display: "27%",   label: "VAT" },
  IE: { rate: 0.23,  display: "23%",   label: "VAT" },
  IT: { rate: 0.22,  display: "22%",   label: "IVA" },
  LT: { rate: 0.21,  display: "21%",   label: "VAT" },
  LU: { rate: 0.17,  display: "17%",   label: "VAT" },
  LV: { rate: 0.21,  display: "21%",   label: "VAT" },
  MT: { rate: 0.18,  display: "18%",   label: "VAT" },
  NL: { rate: 0.21,  display: "21%",   label: "VAT" },
  PL: { rate: 0.23,  display: "23%",   label: "VAT" },
  PT: { rate: 0.23,  display: "23%",   label: "IVA" },
  RO: { rate: 0.19,  display: "19%",   label: "VAT" },
  SE: { rate: 0.25,  display: "25%",   label: "VAT" },
  SI: { rate: 0.22,  display: "22%",   label: "VAT" },
  SK: { rate: 0.23,  display: "23%",   label: "VAT" },
};

export function getTax(country, itemsPrice) {
  const entry = TAX_RATES[country];
  if (!entry) return null;
  const amount = Number((itemsPrice * entry.rate / (1 + entry.rate)).toFixed(2));
  return { label: entry.label, display: entry.display, amount };
}
