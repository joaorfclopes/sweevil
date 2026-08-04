# Booking datepicker — month/weekday localisation

**Date**: 2026-08-04
**Branch**: `claude/bookings-modal-translations-iymdhe`

## Problem

The MUI `DateCalendar` in the bookings flow always rendered its month header and
weekday columns in English ("August 2026", "S M T W T F S"), regardless of the
selected language. `LocalizationProvider` was mounted with only
`dateAdapter={AdapterDayjs}` and no `adapterLocale`, so the dayjs adapter fell
back to the default English locale. The calendar never went through i18n at all.

## Changes

- `frontend/src/utils/datePickerLocale.js` (new) — registers `dayjs/locale/pt`
  and maps an i18next language tag to a dayjs locale. Region suffixes are
  stripped (`pt-PT` -> `pt`) and unknown tags fall back to `en`, mirroring
  i18n's `fallbackLng`.
- `frontend/src/screens/BookingScreen.jsx` — pass
  `adapterLocale={datePickerLocale(i18n.language)}`.
- `frontend/src/components/BookingsAdminTab.jsx` — same, on both of its
  `LocalizationProvider`s; pulled `i18n` off the existing `useTranslation()`.

### Two deliberate overrides to the dayjs `pt` locale

Both live in `datePickerLocale.js`:

1. **Months capitalised** — dayjs ships them lowercase ("agosto"), correct
   mid-sentence but not for a standalone header. Now reads "Agosto 2026",
   matching the English header.
2. **`weekdaysMin` replaced** — dayjs uses the ordinal forms
   (`Do, 2ª, 3ª, 4ª, 5ª, 6ª, Sa`) and the picker renders only the *first
   character*, which headed the columns with bare digits: `2 3 4 5 6 S D`.
   Replaced with the conventional initials so the header reads `S T Q Q S S D`
   (Portuguese weeks start Monday). English is untouched.

Override 2 was found by the test suite, not by inspection — the naive
`adapterLocale` fix alone produces the digit headers.

Safe to override globally: `formatDateDay`/`formatDateDayHour` in `utils.js`
slice raw strings rather than using dayjs, and nothing else in `src/` formats
month or weekday names.

## Tests

`frontend/src/__tests__/datePickerLocale.test.jsx` (new, TDD — written first and
confirmed red). Covers the language-tag mapping and fallbacks, the locale
overrides, and renders a real `DateCalendar` per language asserting the month
header and weekday columns. Also asserts every `LocalizationProvider` in both
booking components passes `adapterLocale`, so a new picker can't regress.

`npx vitest run` → **44 passed (3 files)**. `npx vite build` succeeds.

## Notes

- `dayjs.extend(updateLocale)` is called in the util rather than `index.jsx`, so
  importing the util is self-sufficient and testable in isolation. The existing
  `dayjs.extend(utc)` stays in `index.jsx`.
