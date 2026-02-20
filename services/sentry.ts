import * as SentryNative from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('Sentry: DSN이 설정되지 않아 비활성화됩니다.');
    }
    return;
  }

  SentryNative.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.2,
    beforeSend(event) {
      if (__DEV__) return null;
      return event;
    },
  });
}

export const Sentry = {
  captureException(error: unknown, context?: any) {
    SentryNative.captureException(error, context);
  },
  captureMessage(message: string) {
    SentryNative.captureMessage(message);
  },
};
