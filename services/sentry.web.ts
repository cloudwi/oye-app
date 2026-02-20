// 웹: @sentry/react-native는 import.meta 사용으로 웹 번들 호환 불가
// 웹에서는 Sentry 비활성화 (필요 시 @sentry/browser 별도 설치)

export function initSentry() {
  if (__DEV__) {
    console.log('Sentry: 웹 환경에서는 비활성화됩니다.');
  }
}

export const Sentry = {
  captureException(_error: unknown, _context?: any) {},
  captureMessage(_message: string) {},
};
