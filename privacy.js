'use strict';
(() => {
  const id = document.querySelector('meta[name="doco-analytics-id"]')?.content.trim() || '';
  const banner = document.getElementById('consent-banner');
  const choices = document.getElementById('privacy-choices');
  const accept = document.getElementById('consent-accept');
  const reject = document.getElementById('consent-reject');
  if (!banner || !choices || !accept || !reject || !id) return;

  const key = 'doco_analytics_consent_v1';
  const read = () => {
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
  };
  const write = value => {
    try { localStorage.setItem(key, value); } catch { /* Consent still applies for this page view. */ }
  };
  const load = () => {
    if (document.querySelector('script[data-doco-analytics]')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.docoAnalytics = 'true';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  };
  const apply = value => {
    banner.hidden = true;
    choices.hidden = false;
    if (value === 'accepted') load();
  };
  const choose = value => { write(value); apply(value); };
  accept.addEventListener('click', () => choose('accepted'));
  reject.addEventListener('click', () => choose('rejected'));
  choices.addEventListener('click', () => { banner.hidden = false; banner.querySelector('button')?.focus(); });
  const saved = read();
  if (saved) apply(saved); else banner.hidden = false;
})();
