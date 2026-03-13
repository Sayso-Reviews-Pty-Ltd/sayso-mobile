import { Platform, type ViewStyle } from 'react-native';

type WebViewStyle = ViewStyle & { boxShadow?: string };

// Tailwind shadow-md equivalent
export const CARD_SHADOW_MD: ViewStyle = Platform.OS === 'web'
  ? ({ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)' } as WebViewStyle)
  : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 6,
      elevation: 4,
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
