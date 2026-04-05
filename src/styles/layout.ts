import { Platform } from 'react-native';

export const APP_PAGE_GUTTER = 8;
export const SCROLL_TO_TOP_SIDE_OFFSET = APP_PAGE_GUTTER;
export const SCROLL_TO_TOP_BOTTOM_OFFSET =
  Platform.select({
    ios: 108,
    android: 96,
    default: 96,
  }) ?? 96;

// Tab bar visual height (excludes safe area / home indicator)
export const TAB_BAR_HEIGHT = (Platform.select({ ios: 49, android: 56, default: 49 }) ??
  49) as number;

// Standard breathing room between last content item and the bottom boundary
export const CONTENT_BREATHING_ROOM = 24;

// Button heights — all interactive buttons must use one of these values
export const BUTTON_HEIGHT_SM = 36;
export const BUTTON_HEIGHT_MD = 44;
export const BUTTON_HEIGHT_LG = 52;

// Minimum touch target — never go below this for any interactive element
export const MIN_TOUCH_TARGET = 44;

// List spacing
export const LIST_SEPARATOR_HEIGHT = 12;
export const LIST_ITEM_GAP = 8;
export const LIST_HORIZONTAL_GAP = 12;

// Elevation scale (Android elevation / iOS shadow reference)
export const ELEVATION_CARD = 2;
export const ELEVATION_OVERLAY = 6;
export const ELEVATION_MODAL = 12;
