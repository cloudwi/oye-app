// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 웹 빌드 시 @sentry/* 패키지를 빈 shim으로 대체
  // @sentry 패키지들이 import.meta를 사용하여 웹 번들에서 SyntaxError 발생
  if (
    platform === 'web' &&
    (moduleName.startsWith('@sentry/') || moduleName.startsWith('@sentry-internal/'))
  ) {
    return {
      filePath: require.resolve('./sentry-shim.js'),
      type: 'sourceFile',
    };
  }

  // 웹 빌드 시 zustand ESM 빌드(import.meta.env 사용)를 CJS로 강제 해석
  if (platform === 'web' && moduleName.startsWith('zustand/')) {
    const subpath = moduleName.slice('zustand/'.length);
    const cjsPath = path.join(__dirname, 'node_modules', 'zustand', subpath + '.js');
    try {
      require.resolve(cjsPath);
      return {
        filePath: cjsPath,
        type: 'sourceFile',
      };
    } catch {}
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
