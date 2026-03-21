// ─── Typography Scale ─────────────────────────────────────────────────────────
// All sizes in points, lineHeights in points.
// Fonts: Urbanist (body/UI) + MonarchParadox (hero/display only)
// Usage: import { type } from '../styles/typography'; then type.body.md

export const type = {
  display: {
    hero:  { fontSize: 30, lineHeight: 34, fontFamily: 'MonarchParadox', letterSpacing: 3 },
    xl:    { fontSize: 28, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.4 },
    lg:    { fontSize: 24, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  },
  heading: {
    xl:    { fontSize: 22, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
    lg:    { fontSize: 20, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
    md:    { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
    sm:    { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  },
  body: {
    lg:    { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    md:    { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
    sm:    { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  },
  label: {
    lg:    { fontSize: 14, lineHeight: 18, fontWeight: '600' as const },
    md:    { fontSize: 13, lineHeight: 16, fontWeight: '600' as const },
    sm:    { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
    xs:    { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
  },
  caption: {
    md:    { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
    sm:    { fontSize: 11, lineHeight: 14, fontWeight: '500' as const },
  },
} as const;

export type TypographyKey = keyof typeof type;
