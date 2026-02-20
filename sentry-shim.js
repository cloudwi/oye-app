// 웹 빌드 시 @sentry/react-native 대체용 shim
module.exports = {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  wrap: (c) => c,
  ReactNativeTracing: class {},
  ReactNavigationInstrumentation: class {},
};
