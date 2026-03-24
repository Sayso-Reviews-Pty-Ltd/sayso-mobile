import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Prerequisites:
 *
 * iOS — Universal Links (associatedDomains) require the Associated Domains
 * entitlement to be enabled in your Apple Developer account and the app
 * provisioning profile. The web server must host an Apple App Site Association
 * (AASA) file at https://sayso.co.za/.well-known/apple-app-site-association.
 *
 * Android — App Links (autoVerify) require a Digital Asset Links file hosted
 * at https://sayso.co.za/.well-known/assetlinks.json listing the app's
 * SHA-256 certificate fingerprint(s).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Sayso',
  slug: 'sayso-mobile',
  version: '0.1.0',
  scheme: 'sayso',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  backgroundColor: '#722F37',
  androidStatusBar: {
    backgroundColor: '#722F37',
    barStyle: 'light-content',
    translucent: false,
  },
  androidNavigationBar: {
    backgroundColor: '#722F37',
    barStyle: 'light-content',
  },

  ios: {
    bundleIdentifier:
      process.env.BUNDLE_IDENTIFIER ?? 'co.sayso.mobile',
    infoPlist: {
      UIViewControllerBasedStatusBarAppearance: true,
    },
    // Universal links — lets web URLs open the app directly on iOS.
    // Requires Associated Domains entitlement in Apple Developer console.
    associatedDomains: [
      'applinks:sayso.co.za',
      'applinks:www.sayso.co.za',
    ],
  },

  android: {
    package: process.env.ANDROID_PACKAGE ?? 'co.sayso.mobile',
    // App Links — lets web URLs open the app directly on Android.
    // Requires /.well-known/assetlinks.json hosted on sayso.co.za.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'sayso.co.za' },
          { scheme: 'https', host: 'www.sayso.co.za' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  plugins: [
    './plugins/with-transport-security',
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#722F37',
        sounds: [],
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Sayso uses your location to show nearby venues.',
        locationWhenInUsePermission:
          'Sayso uses your location to show nearby venues.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Sayso uses your camera so you can take photos for your profile and reviews.',
      },
    ],
  ],

  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '0e7b9bc0-8c7c-4428-9306-c0c3823ab216',
    },
  },
});
