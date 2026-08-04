import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import datePickerLocale from '../utils/datePickerLocale';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const REFERENCE = dayjs('2026-08-04');

const renderCalendar = (language) =>
  render(
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={datePickerLocale(language)}>
      <DateCalendar referenceDate={REFERENCE} />
    </LocalizationProvider>
  );

describe('datePickerLocale', () => {
  it('maps the app languages to a dayjs locale', () => {
    expect(datePickerLocale('pt')).toBe('pt');
    expect(datePickerLocale('en')).toBe('en');
  });

  it('resolves region-suffixed language tags to their base locale', () => {
    expect(datePickerLocale('pt-PT')).toBe('pt');
    expect(datePickerLocale('en-US')).toBe('en');
  });

  it('falls back to English for unknown or missing languages', () => {
    expect(datePickerLocale('de')).toBe('en');
    expect(datePickerLocale('')).toBe('en');
    expect(datePickerLocale(undefined)).toBe('en');
  });

  it('registers the Portuguese locale with dayjs', () => {
    expect(dayjs.Ls.pt).toBeDefined();
    expect(dayjs('2026-08-04').locale('pt').format('MMMM')).toBe('Agosto');
  });

  it('capitalises every Portuguese month name for standalone display', () => {
    expect(dayjs.Ls.pt.months).toEqual([
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
    ]);
  });

  it('does not change the English locale', () => {
    expect(dayjs('2026-08-04').locale('en').format('MMMM YYYY')).toBe('August 2026');
  });
});

describe('DateCalendar localisation', () => {
  it('renders the month header in Portuguese', () => {
    renderCalendar('pt');
    expect(screen.getByText('Agosto 2026')).toBeInTheDocument();
  });

  it('renders the month header in English', () => {
    renderCalendar('en');
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('heads the columns with Portuguese weekday initials, starting on Monday', () => {
    const { container } = renderCalendar('pt');
    const headings = [...container.querySelectorAll('.MuiDayCalendar-weekDayLabel')].map(
      (el) => el.textContent
    );
    expect(headings).toEqual(['S', 'T', 'Q', 'Q', 'S', 'S', 'D']);
  });

  it('keeps the English weekday headings unchanged, starting on Sunday', () => {
    const { container } = renderCalendar('en');
    const headings = [...container.querySelectorAll('.MuiDayCalendar-weekDayLabel')].map(
      (el) => el.textContent
    );
    expect(headings).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('falls back to the English calendar for an unknown language', () => {
    renderCalendar('de');
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });
});

describe('booking date pickers', () => {
  it.each([['screens/BookingScreen.jsx'], ['components/BookingsAdminTab.jsx']])(
    '%s passes a language-aware adapterLocale to every LocalizationProvider',
    (file) => {
      const source = readFileSync(join(srcDir, file), 'utf8');
      const providers = source.match(/<LocalizationProvider[^>]*>/g) || [];
      expect(providers.length).toBeGreaterThan(0);
      for (const provider of providers) {
        expect(provider).toMatch(/adapterLocale=\{datePickerLocale\(i18n\.language\)\}/);
      }
    }
  );
});
