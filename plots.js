// Plots Analytics - Client Script
// Privacy-first, lightweight analytics

(function() {
  'use strict';
  
  const script = document.currentScript;
  const projectId = script?.getAttribute('data-project');
  const apiUrl = script?.getAttribute('data-api') || 'https://plots.sh/api';
  
  if (!projectId) {
    console.warn('[Plots] No project ID provided');
    return;
  }

  // Send event
  function send(event, data = {}) {
    const payload = {
      project_id: projectId,
      event,
      path: location.pathname,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString(),
      ...data
    };

    const endpoint = `${apiUrl}/ingest`;
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track pageview
  function pageview() {
    send('pageview');
  }

  // Track custom event
  function track(name, props) {
    send(name, { properties: props });
  }

  // Initial pageview
  pageview();

  // SPA navigation support
  let lastPath = location.pathname;
  
  ['pushState', 'replaceState'].forEach(method => {
    const original = history[method];
    history[method] = function() {
      original.apply(this, arguments);
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        pageview();
      }
    };
  });

  window.addEventListener('popstate', () => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      pageview();
    }
  });

  // Expose global API
  window.plots = { track };
})();
