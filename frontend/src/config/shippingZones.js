const EUROPEAN_COUNTRIES = [
  "AD","AL","AT","BA","BE","BG","BY","CH","CY","CZ","DE","DK","EE","ES",
  "FI","FR","GB","GE","GR","HR","HU","IE","IS","IT","LI","LT","LU","LV",
  "MC","MD","ME","MK","MT","NL","NO","PL","RO","RS","SE","SI","SK","SM",
  "TR","UA","VA","XK",
];

export const ZONES = {
  PT_MAINLAND: { label: "Portugal", price: 3.99 },
  PT_ISLANDS:  { label: "Portugal Islands", price: 6.99 },
  EUROPE:      { label: "Europe", price: 9.99 },
  WORLD:       { label: "International", price: 19.99 },
};

export function getShippingZone(country, postalCode) {
  if (country === "PT") {
    const prefix = parseInt(String(postalCode).replace(/\D/g, "").substring(0, 4));
    if (prefix >= 9000) return "PT_ISLANDS";
    return "PT_MAINLAND";
  }
  if (EUROPEAN_COUNTRIES.includes(country)) return "EUROPE";
  return "WORLD";
}

export function getShippingPrice(country, postalCode, itemsPrice) {
  if (itemsPrice >= 40) return 0;
  return ZONES[getShippingZone(country, postalCode)].price;
}

export function getShippingLabel(country, postalCode, itemsPrice) {
  if (itemsPrice >= 40) return "Free shipping";
  const zone = getShippingZone(country, postalCode);
  return `Shipping to ${ZONES[zone].label} — €${ZONES[zone].price.toFixed(2)}`;
}
