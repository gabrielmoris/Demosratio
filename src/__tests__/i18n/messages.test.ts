import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { routing } from '@/src/i18n/routing';
import { codeToLanguage } from '@/src/locale';

type Messages = { [key: string]: string | Messages };

const MESSAGES_DIR = path.resolve(__dirname, '../../../messages');
const load = (locale: string): Messages =>
  JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8'));

const flatten = (messages: Messages, prefix = ''): Record<string, string> =>
  Object.entries(messages).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') acc[prefix + key] = value;
    else Object.assign(acc, flatten(value, `${prefix}${key}.`));
    return acc;
  }, {});

/** {name} / {count, plural, ...} placeholders, whether "#" is used, and how many plural branches. */
const shape = (text: string) => ({
  placeholders: [...new Set([...text.matchAll(/\{(\w+)\s*[,}]/g)].map(m => m[1]))].sort(),
  hash: text.includes('#'),
  branches: (text.match(/\b(one|other)\s*\{/g) ?? []).length,
});

const spanish = flatten(load('es'));
const others = routing.locales.filter(l => l !== 'es');

describe('translations', () => {
  it('has a message file and a switcher name for every locale', () => {
    const files = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    expect(files.sort()).toEqual([...routing.locales].sort());
    expect(Object.keys(codeToLanguage).sort()).toEqual([...routing.locales].sort());
  });

  it.each(others)('%s has exactly the same keys as es', locale => {
    const keys = Object.keys(flatten(load(locale)));
    const missing = Object.keys(spanish).filter(k => !keys.includes(k));
    const extra = keys.filter(k => !(k in spanish));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it.each(others)('%s keeps the placeholders of es', locale => {
    const messages = flatten(load(locale));
    const wrong = Object.keys(spanish).filter(
      k => k in messages && JSON.stringify(shape(messages[k])) !== JSON.stringify(shape(spanish[k]))
    );
    expect(wrong).toEqual([]);
  });

  it.each(others)('%s has no empty translations', locale => {
    const empty = Object.entries(flatten(load(locale))).filter(([, v]) => !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });
});
