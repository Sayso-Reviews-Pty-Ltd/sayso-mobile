import { Platform } from 'react-native';

export const APP_PAGE_GUTTER = 8;
export const SCROLL_TO_TOP_SIDE_OFFSET = APP_PAGE_GUTTER;
export const SCROLL_TO_TOP_BOTTOM_OFFSET = Platform.select({
  ios: 108,
  android: 96,
  default: 96,
}) ?? 96;
