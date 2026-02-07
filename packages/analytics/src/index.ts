// Client-side analytics SDK for custom events
// Used by developers to track custom events beyond pageviews

interface TrackOptions {
  [key: string]: string | number | boolean;
}

interface PlotsConfig {
  apiUrl?: string;
  projectId?: string;
}

let config: PlotsConfig = {
  apiUrl: "https://plots.sh/api",
};

export function init(options: PlotsConfig) {
  config = { ...config, ...options };
  
  // Auto-detect project ID from script tag if not provided
  if (!config.projectId && typeof document !== "undefined") {
    const script = document.querySelector('script[data-project]');
    if (script) {
      config.projectId = script.getAttribute('data-project') || undefined;
    }
  }
}

export async function track(event: string, properties?: TrackOptions) {
  if (!config.projectId) {
    console.warn("[Plots] No project ID configured");
    return;
  }

  try {
    await fetch(`${config.apiUrl}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: config.projectId,
        event,
        properties,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("[Plots] Failed to track event:", error);
  }
}

export function pageview() {
  track("pageview");
}

// Auto-init from script tag
if (typeof document !== "undefined") {
  const script = document.currentScript;
  if (script) {
    const projectId = script.getAttribute('data-project');
    if (projectId) {
      init({ projectId });
      // Track initial pageview
      pageview();
      
      // Track SPA navigation
      if (typeof window !== "undefined") {
        const originalPushState = history.pushState;
        history.pushState = function(...args) {
          originalPushState.apply(this, args);
          pageview();
        };
        
        window.addEventListener('popstate', () => {
          pageview();
        });
      }
    }
  }
}
