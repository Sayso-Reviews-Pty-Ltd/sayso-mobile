/**
 * Design tokens for the LoadMoreButton component.
 *
 * These are the single source of truth for every visual property of
 * the button. Change a value here to update every instance globally.
 *
 * Naming convention mirrors the design-token specification:
 *   category.component.element.variant
 */

/** Primary coral: #722F37 = rgb(114, 47, 55) */
const CORAL = '#722F37';
const CORAL_RGB = '114, 47, 55';

export const LOAD_MORE_TOKENS = {
  color: {
    button: {
      loadMore: {
        /** Resting background — coral tint */
        background:         `rgba(${CORAL_RGB}, 0.09)`,
        /** Pressed / active background */
        backgroundPressed:  `rgba(${CORAL_RGB}, 0.15)`,
        /** Disabled background */
        backgroundDisabled: `rgba(${CORAL_RGB}, 0.05)`,
        /** Label and spinner colour */
        label:              CORAL,
        /** Outlined border colour */
        border:             `rgba(${CORAL_RGB}, 0.18)`,
        /** ActivityIndicator colour — shares label token */
        spinner:            CORAL,
      },
    },
  },

  size: {
    button: {
      loadMore: {
        paddingHorizontal: 20,
        paddingVertical:   12,
      },
    },
  },

  typography: {
    button: {
      loadMore: {
        fontSize:      14,
        fontWeight:    '700' as const,
        letterSpacing: 0,
      },
    },
  },

  radius: {
    button: {
      /** Fully rounded pill shape */
      loadMore: 999,
    },
  },

  spacing: {
    button: {
      loadMore: {
        /** Vertical rhythm above the button */
        marginTop: 16,
      },
    },
  },

  opacity: {
    button: {
      loadMore: {
        pressed:  0.85,
        disabled: 0.55,
      },
    },
  },
} as const;
