const latToCyrMap = {
  dzh: "џ",
  nj: "њ",
  lj: "љ",
  dz: "ѕ",
  zh: "ж",
  sh: "ш",
  ch: "ч",
  gj: "ѓ",
  kj: "ќ",
  a: "а",
  b: "б",
  c: "ц",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "ј",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "кс",
  y: "и",
  z: "з",
};

export const escapeRegExp = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const transliterateLatinToCyrillic = (text) => {
  let cyrStr = text.toLowerCase();
  for (const [lat, cyr] of Object.entries(latToCyrMap)) {
    cyrStr = cyrStr.split(lat).join(cyr);
  }
  return cyrStr;
};

export const buildBilingualRegex = (text) => {
  if (!text) return null;
  const cyrStr = transliterateLatinToCyrillic(text);
  return `${escapeRegExp(text)}|${escapeRegExp(cyrStr)}`;
};

export const buildBilingualTokenRegexes = (text) => {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => buildBilingualRegex(token))
    .filter(Boolean);
};
