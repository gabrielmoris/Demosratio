const ROMAN_VALUES: [string, number][] = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1],
];

/** "XVI" -> 16. Returns NaN for text that is not a Roman numeral. */
export const romanToInt = (roman: string): number => {
  const text = roman.toUpperCase();
  let value = 0;
  let i = 0;
  while (i < text.length) {
    const match = ROMAN_VALUES.find(([symbol]) => text.startsWith(symbol, i));
    if (!match) return NaN;
    value += match[1];
    i += match[0].length;
  }
  return value;
};

/** 16 -> "XVI" */
export const intToRoman = (num: number): string => {
  let out = '';
  for (const [symbol, value] of ROMAN_VALUES) {
    while (num >= value) {
      out += symbol;
      num -= value;
    }
  }
  return out || 'I';
};
