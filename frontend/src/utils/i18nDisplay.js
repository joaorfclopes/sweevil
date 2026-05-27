export function displayName(item, lang) {
  if (!item) return '';
  if (lang === 'pt') return item.namePt || item.name;
  return item.name;
}

export function displayDescription(item, lang) {
  if (!item) return '';
  if (!item.useDescriptionTranslation) return item.description;
  return (lang === 'pt' ? item.descriptionPt : item.descriptionEn) || item.description;
}
