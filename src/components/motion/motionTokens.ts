export type MotionRole = 'hero' | 'subheading' | 'cta' | 'support' | 'listItem';
export type LegacyMotionVariant = 'header' | 'input' | 'card' | 'listItem' | 'cta';
export type MotionVariant = MotionRole | LegacyMotionVariant;
export type MotionPhase = 'enter' | 'exit';

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
  /** Exit Y offset in points; element departs toward this distance */
  exitTranslateY: number;
};

export const MOTION_ROLES: Record<MotionRole, VariantSpec> = {
  //
  // Damping ratio ≈ damping / (2 × √(stiffness × mass))
  // Target ~0.82–0.90: fast settle with a barely-perceptible overshoot that
  // signals physicality without drawing attention to the animation itself.
  //

  // Header anchors the page — fast, authoritative, no scale.
  hero: { stiffness: 350, damping: 30, mass: 1, translateY: 12, scaleFrom: 1, baseDelay: 0, exitTranslateY: -10 },

  // Input follows header, slightly softer.
  subheading: { stiffness: 300, damping: 28, mass: 1, translateY: 10, scaleFrom: 1, baseDelay: 34, exitTranslateY: -8 },

  // Cards arrive with a 3 % scale pop (0.97 → 1.0) — grounded, present.
  support: { stiffness: 260, damping: 26, mass: 1, translateY: 10, scaleFrom: 0.97, baseDelay: 56, exitTranslateY: -6 },

  // List items: lighter mass, tighter travel, no scale (would be too busy).
  listItem: { stiffness: 280, damping: 28, mass: 0.9, translateY: 8, scaleFrom: 1, baseDelay: 52, exitTranslateY: -5 },

  // CTAs snap assertively into place with a 2 % scale hint.
  cta: { stiffness: 320, damping: 28, mass: 1, translateY: 12, scaleFrom: 0.98, baseDelay: 80, exitTranslateY: -9 },
};

const LEGACY_ROLE_MAP: Record<LegacyMotionVariant, MotionRole> = {
  header: 'hero',
  input: 'subheading',
  card: 'support',
  listItem: 'listItem',
  cta: 'cta',
};

/** ms added per sequential item index */
export const STAGGER_STEP = 24;
/** maximum total stagger delay across all items */
export const STAGGER_MAX_DELAY = 200;
/** flat fade duration used when reduce-motion is enabled */
export const REDUCED_MOTION_DURATION = 120;
/**
 * Opacity fades in slightly ahead of the spring settle so the arriving element
 * is visible as it moves — the eye catches motion, not a ghost appearing.
 */
export const OPACITY_LEAD_DURATION = 140;
export const EXIT_OPACITY_DURATION = 120;

export type MotionPhaseTargets = {
  opacityFrom: number;
  opacityTo: number;
  translateYFrom: number;
  translateYTo: number;
  scaleFrom: number;
  scaleTo: number;
  useSpring: boolean;
};

export function resolveMotionRole(variant: MotionVariant | undefined): MotionRole {
  if (!variant) return 'support';
  if (variant in LEGACY_ROLE_MAP) {
    return LEGACY_ROLE_MAP[variant as LegacyMotionVariant];
  }
  return variant as MotionRole;
}

export function getEnterDelay(role: MotionRole, index: number): number {
  const spec = MOTION_ROLES[role];
  return Math.min(spec.baseDelay + index * STAGGER_STEP, STAGGER_MAX_DELAY);
}

export function getExitDelay(role: MotionRole, index: number, maxIndex: number): number {
  const clampedMax = Math.max(index, maxIndex);
  return Math.min(
    MOTION_ROLES[role].baseDelay + (clampedMax - index) * STAGGER_STEP,
    STAGGER_MAX_DELAY
  );
}

export function getMotionPhaseTargets(
  role: MotionRole,
  phase: MotionPhase,
  reducedMotionEnabled: boolean
): MotionPhaseTargets {
  const spec = MOTION_ROLES[role];

  if (reducedMotionEnabled) {
    return phase === 'enter'
      ? {
          opacityFrom: 0,
          opacityTo: 1,
          translateYFrom: 0,
          translateYTo: 0,
          scaleFrom: 1,
          scaleTo: 1,
          useSpring: false,
        }
      : {
          opacityFrom: 1,
          opacityTo: 0,
          translateYFrom: 0,
          translateYTo: 0,
          scaleFrom: 1,
          scaleTo: 1,
          useSpring: false,
        };
  }

  if (phase === 'enter') {
    return {
      opacityFrom: 0,
      opacityTo: 1,
      translateYFrom: spec.translateY,
      translateYTo: 0,
      scaleFrom: spec.scaleFrom,
      scaleTo: 1,
      useSpring: true,
    };
  }

  return {
    opacityFrom: 1,
    opacityTo: 0,
    translateYFrom: 0,
    translateYTo: spec.exitTranslateY,
    scaleFrom: 1,
    scaleTo: spec.scaleFrom < 1 ? Math.max(spec.scaleFrom, 0.96) : 1,
    useSpring: true,
  };
}

/**
 * Backwards-compat export. Use role helpers where possible.
 */
export const MOTION_VARIANTS = MOTION_ROLES;
