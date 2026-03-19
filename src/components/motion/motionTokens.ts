export type MotionVariant = 'header' | 'input' | 'card' | 'listItem' | 'cta';

export type VariantSpec = {
  /** Spring stiffness — higher = snappier response */
  stiffness: number;
  /** Spring damping — higher = less oscillation on settle */
  damping: number;
  /** Virtual mass — lower = lighter, quicker feel */
  mass: number;
  /** Initial Y offset in points; element arrives from this distance below */
  translateY: number;
  /**
   * Initial scale factor. Values < 1 produce a subtle "pop-in" as the element
   * springs to full size. Use 1 for variants where scale would read as noise.
   */
  scaleFrom: number;
  /** Base delay in ms before this variant's stagger index begins counting */
  baseDelay: number;
};

export const MOTION_VARIANTS: Record<MotionVariant, VariantSpec> = {
  //
  // Damping ratio ≈ damping / (2 × √(stiffness × mass))
  // Target ~0.82–0.90: fast settle with a barely-perceptible overshoot that
  // signals physicality without drawing attention to the animation itself.
  //

  // Header anchors the page — fast, authoritative, no scale.
  header:   { stiffness: 350, damping: 30, mass: 1,   translateY: 12, scaleFrom: 1,    baseDelay: 0  },

  // Input follows header, slightly softer.
  input:    { stiffness: 300, damping: 28, mass: 1,   translateY: 10, scaleFrom: 1,    baseDelay: 40 },

  // Cards arrive with a 3 % scale pop (0.97 → 1.0) — grounded, present.
  card:     { stiffness: 260, damping: 26, mass: 1,   translateY: 10, scaleFrom: 0.97, baseDelay: 60 },

  // List items: lighter mass, tighter travel, no scale (would be too busy).
  listItem: { stiffness: 280, damping: 28, mass: 0.9, translateY: 8,  scaleFrom: 1,    baseDelay: 52 },

  // CTAs snap assertively into place with a 2 % scale hint.
  cta:      { stiffness: 320, damping: 28, mass: 1,   translateY: 12, scaleFrom: 0.98, baseDelay: 80 },
};

/** ms added per sequential item index */
export const STAGGER_STEP = 20;
/** maximum total stagger delay across all items */
export const STAGGER_MAX_DELAY = 200;
/** flat fade duration used when reduce-motion is enabled */
export const REDUCED_MOTION_DURATION = 120;
/**
 * Opacity fades in slightly ahead of the spring settle so the arriving element
 * is visible as it moves — the eye catches motion, not a ghost appearing.
 */
export const OPACITY_LEAD_DURATION = 140;
