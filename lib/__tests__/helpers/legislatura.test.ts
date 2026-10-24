import { describe, it, expect, afterEach } from 'vitest';
import {
  envLegislaturaId,
  legislaturaLabel,
  parseLegislatura,
  withLegislatura,
} from '@/lib/helpers/legislatura';
import { intToRoman, romanToInt } from '@/lib/helpers/romanNumerals';

describe('romanNumerals', () => {
  it('converts both ways', () => {
    expect(romanToInt('XV')).toBe(15);
    expect(romanToInt('xvi')).toBe(16);
    expect(intToRoman(16)).toBe('XVI');
    expect(intToRoman(49)).toBe('XLIX');
  });

  it('returns NaN for text that is not a Roman numeral instead of looping forever', () => {
    expect(romanToInt('XVA')).toBeNaN();
  });
});

describe('parseLegislatura', () => {
  it('accepts numbers and Roman numerals', () => {
    expect(parseLegislatura('16')).toBe(16);
    expect(parseLegislatura(16)).toBe(16);
    expect(parseLegislatura('XVI')).toBe(16);
    expect(parseLegislatura(' xv ')).toBe(15);
  });

  it('rejects empty and invalid values', () => {
    expect(parseLegislatura(null)).toBeNull();
    expect(parseLegislatura(undefined)).toBeNull();
    expect(parseLegislatura('')).toBeNull();
    expect(parseLegislatura('0')).toBeNull();
    expect(parseLegislatura('-3')).toBeNull();
    expect(parseLegislatura('abc')).toBeNull();
    expect(parseLegislatura('1.5')).toBeNull();
  });
});

describe('legislaturaLabel', () => {
  it('shows the Roman numeral', () => {
    expect(legislaturaLabel(15)).toBe('XV');
  });
});

describe('withLegislatura', () => {
  it('adds the legislatura to urls with and without a query', () => {
    expect(withLegislatura('/api/temas', 16)).toBe('/api/temas?legislatura=16');
    expect(withLegislatura('/api/x?page=2', 16)).toBe('/api/x?page=2&legislatura=16');
  });

  it('leaves the url alone without an id, so the API uses the current one', () => {
    expect(withLegislatura('/api/temas', undefined)).toBe('/api/temas');
  });
});

describe('envLegislaturaId', () => {
  const original = process.env.TARGET_LEGISLATURA;
  afterEach(() => {
    process.env.TARGET_LEGISLATURA = original;
  });

  it('reads TARGET_LEGISLATURA and falls back to XV', () => {
    process.env.TARGET_LEGISLATURA = 'XVI';
    expect(envLegislaturaId()).toBe(16);
    delete process.env.TARGET_LEGISLATURA;
    expect(envLegislaturaId()).toBe(15);
  });
});
