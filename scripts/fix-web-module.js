const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// script 태그에 type="module" 추가 (import.meta 호환)
html = html.replace(
  /<script src="(.*?)" defer><\/script>/g,
  '<script src="$1" type="module"></script>'
);

// +html.tsx가 output:"single" 모드에서 무시되므로, 빌드 후처리로 head 태그 주입
const headTags = `
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no" />
    <title>오늘의 예감 - AI 운세, 궁합, 로또 번호 추천</title>
    <meta name="description" content="매일 아침 AI가 전해주는 나만의 운세, 연인/친구 궁합, 로또 번호 추천까지. 오늘의 예감으로 하루를 시작하세요." />
    <meta name="keywords" content="운세,오늘의운세,궁합,로또,로또번호추천,AI운세,오늘의예감,무료운세,매일운세,연인궁합,친구궁합" />
    <meta name="theme-color" content="#6366F1" />
    <meta name="google-adsense-account" content="ca-pub-8460185175778038" />
    <meta property="og:title" content="오늘의 예감 - AI 운세, 궁합, 로또" />
    <meta property="og:description" content="매일 아침 AI가 전해주는 나만의 운세, 연인/친구 궁합, 로또 번호 추천까지. 오늘의 예감으로 하루를 시작하세요." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://yegam.today" />
    <meta property="og:image" content="https://yegam.today/og-image.png" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="오늘의 예감" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="오늘의 예감 - AI 운세, 궁합, 로또" />
    <meta name="twitter:description" content="매일 아침 AI가 전해주는 나만의 운세, 연인/친구 궁합, 로또 번호 추천까지." />
    <meta name="twitter:image" content="https://yegam.today/og-image.png" />
    <link rel="canonical" href="https://yegam.today" />
    <meta name="google" content="notranslate" />
    <meta http-equiv="content-language" content="ko" />
    <meta name="apple-itunes-app" content="app-id=6759439435" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="오늘의 예감" />
    <link rel="preconnect" href="https://api.yegam.today" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8460185175778038" crossorigin="anonymous"></script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"오늘의 예감","url":"https://yegam.today","description":"매일 아침 AI가 전해주는 나만의 운세, 궁합, 로또 번호 추천","inLanguage":"ko"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"오늘의 예감","description":"매일 아침 AI가 전해주는 나만의 운세, 연인/친구 궁합, 로또 번호 추천","operatingSystem":"iOS","applicationCategory":"LifestyleApplication","offers":{"@type":"Offer","price":"0","priceCurrency":"KRW"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","ratingCount":"1","bestRating":"5","worstRating":"1"}}</script>`;

// lang="en" → lang="ko" 변경
html = html.replace('<html lang="en">', '<html lang="ko" translate="no">');

// 기존 viewport, title 제거 (중복 방지)
html = html.replace(
  /<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" \/>/,
  ''
);
html = html.replace(/<title>.*?<\/title>/, '');

// </head> 앞에 태그 주입
html = html.replace('</head>', headTags + '\n  </head>');

fs.writeFileSync(indexPath, html);
console.log('Fixed: Added type="module" to script tags and injected head tags in dist/index.html');
