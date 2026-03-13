import { Platform, type ViewStyle } from 'react-native';

type WebViewStyle = ViewStyle & {
  boxShadow?: string;
};

export function getOverlayShadowStyle(radius: number): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      borderRadius: radius,
      boxShadow: '0 6px 18px rgba(17, 24, 39, 0.12)',
    } as WebViewStyle;
  }

  return {
    borderRadius: radius,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  };
}

export function getCardDepthShadowStyle(radius: number): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      borderRadius: radius,
      boxShadow: '0 0 18px rgba(17, 24, 39, 0.14)',
    } as WebViewStyle;
  }

  return {
    borderRadius: radius,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  };
}
