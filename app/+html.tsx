import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
        />
        <title>오늘의 예감</title>
        <meta name="description" content="매일 아침, AI가 전해주는 나만의 특별한 예감" />
        <meta name="theme-color" content="#6366F1" />
        <meta property="og:title" content="오늘의 예감" />
        <meta property="og:description" content="매일 아침, AI가 전해주는 나만의 특별한 예감" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yegam.today" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="오늘의 예감" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="오늘의 예감" />
        <meta name="twitter:description" content="매일 아침, AI가 전해주는 나만의 특별한 예감" />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://yegam.today" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="오늘의 예감" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveStyle = `
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  #root {
    display: flex;
    height: 100%;
  }
`;
