import type { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

const KAKAO_APP_KEY =
  process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? '9a09ffd0172882098f151551e8e85f11';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(appJson.expo as ExpoConfig),
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      ...appJson.expo.ios.infoPlist,
      CFBundleURLTypes: [
        { CFBundleURLSchemes: [`kakao${KAKAO_APP_KEY}`] },
      ],
    },
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#6366F1',
        dark: {
          backgroundColor: '#151718',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#6366F1',
        defaultChannel: 'fortune',
      },
    ],
    ['@react-native-seoul/kakao-login', { kakaoAppKey: KAKAO_APP_KEY }],
    'expo-secure-store',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: 'cloudwi',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: 'ca-app-pub-8460185175778038~3639846464',
      },
    ],
    'expo-tracking-transparency',
    'expo-font',
    'expo-image',
    'expo-sharing',
    'expo-web-browser',
  ],
});
