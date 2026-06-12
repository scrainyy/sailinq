/**
 * Sailinq — motyw graficzny wyciągnięty z makiet.
 * Tu zmieniasz kolory całej aplikacji w jednym miejscu.
 */

export const SailinqColors = {
  // Tła
  bg: '#0A1A2C', // głębokie navy (główne tło)
  bgGradientTop: '#0E2236',
  bgGradientBottom: '#081522',
  surface: '#13283D', // karty
  surfaceAlt: '#16304A', // jaśniejsze karty / pola
  surfaceMuted: '#0F2235',

  // Akcenty
  mint: '#57E0C6', // główny przycisk / akcent
  mintDark: '#0A1A2C', // tekst NA mięcie
  gold: '#E6A93E', // verified skipper / odznaki

  // Tekst
  text: '#FFFFFF',
  textMuted: '#8DA2B5',
  textFaint: '#5C7184',

  // Linie / obramowania
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  // Stany
  like: '#57E0C6',
  nope: '#FF6B6B',
  star: '#E6A93E',
} as const;

export const SailinqRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const SailinqSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
