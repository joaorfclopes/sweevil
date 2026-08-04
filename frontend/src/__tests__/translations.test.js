import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const localesDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/locales');
const LANGS = ['en', 'pt'];

const load = (lang, file) => JSON.parse(readFileSync(join(localesDir, lang, file), 'utf8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flatten(value, path));
    } else {
      acc[path] = value;
    }
    return acc;
  }, {});

const namespaces = readdirSync(join(localesDir, 'en')).filter((f) => f.endsWith('.json'));

describe('translations', () => {
  it('exposes the same namespaces in every language', () => {
    for (const lang of LANGS) {
      expect(
        readdirSync(join(localesDir, lang))
          .filter((f) => f.endsWith('.json'))
          .sort()
      ).toEqual([...namespaces].sort());
    }
  });

  describe.each(namespaces)('%s', (file) => {
    const en = flatten(load('en', file));
    const pt = flatten(load('pt', file));

    it('has identical key sets across languages', () => {
      expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
    });

    it('has no empty values', () => {
      for (const lang of LANGS) {
        const entries = Object.entries(flatten(load(lang, file)));
        const empty = entries.filter(([, v]) => typeof v === 'string' && v.trim() === '');
        expect(empty.map(([k]) => `${lang}:${k}`)).toEqual([]);
      }
    });

    it('keeps interpolation placeholders consistent across languages', () => {
      const placeholders = (value) =>
        typeof value === 'string' ? (value.match(/\{\{\s*\w+\s*\}\}/g) || []).sort() : [];
      const mismatched = Object.keys(en).filter(
        (key) => placeholders(en[key]).join() !== placeholders(pt[key]).join()
      );
      expect(mismatched).toEqual([]);
    });
  });

  describe('booking exclusivity info modal', () => {
    it('provides the modal body copy in every language', () => {
      for (const lang of LANGS) {
        const { booking } = load(lang, 'translation.json');
        expect(typeof booking.exclusivityInfo).toBe('string');
        expect(booking.exclusivityInfo.trim().length).toBeGreaterThan(0);
      }
    });

    it('provides the modal close label in every language', () => {
      for (const lang of LANGS) {
        const { booking } = load(lang, 'translation.json');
        expect(typeof booking.closeInfo).toBe('string');
        expect(booking.closeInfo.trim().length).toBeGreaterThan(0);
      }
    });

    it('actually translates the modal body rather than reusing the Portuguese copy', () => {
      const en = load('en', 'translation.json').booking.exclusivityInfo;
      const pt = load('pt', 'translation.json').booking.exclusivityInfo;
      expect(en).not.toEqual(pt);
      expect(en).not.toMatch(/design é uma peça original/i);
    });
  });

  it('does not hardcode the booking modal copy in BookingScreen', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../screens/BookingScreen.jsx'),
      'utf8'
    );
    expect(source).not.toMatch(/Cada design é uma peça original/);
    expect(source).toMatch(/t\('booking\.exclusivityInfo'\)/);
  });
});
