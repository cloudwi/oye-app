import React, { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = 'ca-pub-8460185175778038';
const ADSENSE_SLOT_ID = 'YYYYYYYYYY';
const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function loadAdSenseScript() {
  if (document.querySelector(`script[src*="adsbygoogle"]`)) return;

  const script = document.createElement('script');
  script.src = `${ADSENSE_SCRIPT_URL}?client=${ADSENSE_CLIENT_ID}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    loadAdSenseScript();

    if (!pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense not ready yet
      }
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '8px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
