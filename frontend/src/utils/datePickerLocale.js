import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(updateLocale);

// dayjs ships the Portuguese month names lowercase ("agosto"), which is correct
// mid-sentence. The picker header renders them standalone next to the year, so
// capitalise them to match the English header.
//
// weekdaysMin is overridden too: dayjs uses the ordinal forms ("2ª", "3ª"...),
// and the picker renders only their first character, which would head the
// columns with bare digits. These are the conventional Portuguese initials
// (segunda, terça, quarta, quinta, sexta, sábado, domingo), indexed from Sunday
// as dayjs expects. Portuguese weeks start on Monday, so the picker shows them
// as S T Q Q S S D.
dayjs.updateLocale('pt', {
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
});

const SUPPORTED = ['en', 'pt'];

/**
 * Maps an i18next language tag to a locale the dayjs picker adapter can use.
 * Region suffixes are ignored ("pt-PT" -> "pt") and anything unsupported falls
 * back to English, mirroring i18n's fallbackLng.
 */
export default function datePickerLocale(language) {
  const base = String(language ?? '')
    .toLowerCase()
    .split('-')[0];
  return SUPPORTED.includes(base) ? base : 'en';
}
