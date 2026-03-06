// ─────────────────────────────────────────────────────────
// Design System Tokens
// ─────────────────────────────────────────────────────────

export const colors = {
  deepNavy:    '#0B1829',
  navyCard:    '#0F2040',
  navyLight:   '#1A2E4A',
  blue:        '#1565C0',
  teal:        '#00897B',
  amber:       '#FFB300',
  red:         '#EF5350',
  white:       '#F0F4FA',
  gray:        '#90A4AE',
  grayDark:    '#546E7A',
  borderBlue:  '#1E3A5F',
  green:       '#4CAF50',
  purple:      '#AB47BC',
  orange:      '#FF7043',
  deepRed:     '#B71C1C',
  deepTeal:    '#004D40',
} as const;

export const topicColors: Record<string, string> = {
  Economy:        colors.amber,
  Security:       colors.red,
  Healthcare:     colors.teal,
  Infrastructure: colors.blue,
  Governance:     colors.purple,
  Identity:       colors.orange,
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  monoFamily: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const animation = {
  springConfig: { stiffness: 300, damping: 30 },
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } },
  slideRight: { initial: { x: 60, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -60, opacity: 0 }, transition: { duration: 0.3, ease: 'easeInOut' } },
  slideUp: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.4 } },
} as const;

// Sentiment → color interpolation
export function sentimentColor(s: number): string {
  if (s <= -0.3) return colors.deepRed;
  if (s <= -0.1) return colors.red;
  if (s <= 0.1) return colors.navyLight;
  if (s <= 0.3) return colors.teal;
  return colors.deepTeal;
}

export function statusColor(value: number, thresholds = { good: 0.6, warn: 0.3 }): string {
  if (value > thresholds.good) return colors.green;
  if (value > thresholds.warn) return colors.amber;
  return colors.red;
}
