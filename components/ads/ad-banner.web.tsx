import React, { useEffect, useRef, useState } from 'react';

const ADSENSE_CLIENT_ID = 'ca-pub-8460185175778038';
const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function loadAdSenseScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src*="adsbygoogle"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${ADSENSE_SCRIPT_URL}?client=${ADSENSE_CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

export function AdBanner() {
  const pushed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function tryPush() {
      const container = containerRef.current;
      if (!container || container.offsetWidth === 0) {
        // Container not laid out yet, retry
        requestAnimationFrame(tryPush);
        return;
      }

      if (!pushed.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch {
          // AdSense not ready
        }
      }

      // Check if the ad actually rendered content
      setTimeout(() => {
        if (cancelled) return;
        const ins = container.querySelector('ins');
        if (!ins || ins.offsetHeight === 0) {
          setHidden(true);
        }
      }, 3000);
    }

    loadAdSenseScript()
      .then(() => {
        if (!cancelled) requestAnimationFrame(tryPush);
      })
      .catch(() => {
        if (!cancelled) setHidden(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      style={{
        textAlign: 'center',
        margin: '8px 0',
        overflow: 'hidden',
        width: '100%',
        minHeight: 50,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
