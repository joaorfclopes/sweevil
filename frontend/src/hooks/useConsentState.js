import { useEffect, useState } from 'react';

const STORAGE_KEY = 'trackingConsent';

function loadGA4() {
  if (document.querySelector('script[data-ga4]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-HBQH4F9S1J';
  s.setAttribute('data-ga4', '1');
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-HBQH4F9S1J');
}

function loadMetaPixel() {
  if (window.fbq) return;
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', '2233543283842019');
  window.fbq('track', 'PageView');
}

export function useConsentState() {
  const [consent, setConsent] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (consent?.analytics) loadGA4();
    if (consent?.marketing) loadMetaPixel();
  }, [consent]);

  const acceptAll = () => {
    const c = { analytics: true, marketing: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setConsent(c);
  };

  const rejectAll = () => {
    const c = { analytics: false, marketing: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setConsent(c);
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
  };

  return { consent, acceptAll, rejectAll, resetConsent };
}
