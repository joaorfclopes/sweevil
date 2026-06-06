export function buildTrackingUrl(carrier, trackingNumber, postalCode) {
  if (!trackingNumber) return null;
  switch (carrier) {
    case 'CTT':
      return `https://appserver.ctt.pt/CustomerArea/PublicArea_Detail?ObjectCodeInput=${trackingNumber}&SearchInput=${trackingNumber}&IsFromPublicArea=true`;
    case 'DPD':
      return `https://tracking.dpd.pt/track-and-trace?reference=${trackingNumber}`;
    case 'DHL':
      return `https://www.dhl.com/pt-en/home/tracking.html?tracking-id=${trackingNumber}&submit=1`;
    case 'GLS':
      return `https://mygls.gls-portugal.pt/e/${trackingNumber}/${postalCode}/en`;
    default:
      return null;
  }
}
