/**
 * @plots/tracking - Privacy-first analytics SDK
 * 
 * Usage:
 * ```typescript
 * import { PlotsAnalytics } from '@plots/tracking';
 * 
 * const plots = new PlotsAnalytics('proj_xxx');
 * plots.track('button_click', { button: 'cta' });
 * plots.signup({ plan: 'pro' });
 * plots.purchase(29.99, { product: 'subscription' });
 * ```
 */

export interface PlotsConfig {
  projectId: string;
  apiUrl?: string;
  debug?: boolean;
}

export interface EventProperties {
  [key: string]: any;
}

export class PlotsAnalytics {
  private projectId: string;
  private apiUrl: string;
  private debug: boolean;

  constructor(projectId: string, options?: { apiUrl?: string; debug?: boolean }) {
    this.projectId = projectId;
    this.apiUrl = options?.apiUrl || 'https://plots.sh';
    this.debug = options?.debug || false;

    if (this.debug) {
      console.log('[Plots] Initialized with project:', projectId);
    }
  }

  /**
   * Track a custom event
   */
  track(event: string, properties?: EventProperties): void {
    if (typeof window === 'undefined') return;

    const payload = {
      project_id: this.projectId,
      event,
      path: window.location.pathname,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString(),
      properties: properties || {},
    };

    this._send(payload);
  }

  /**
   * Track a pageview
   */
  pageview(path?: string): void {
    if (typeof window === 'undefined') return;

    const payload = {
      project_id: this.projectId,
      event: 'pageview',
      path: path || window.location.pathname,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString(),
    };

    this._send(payload);
  }

  /**
   * Track user signup
   */
  signup(properties?: EventProperties): void {
    this.track('signup', properties);
  }

  /**
   * Track a purchase/conversion
   */
  purchase(value: number, properties?: EventProperties): void {
    this.track('purchase', {
      ...properties,
      value,
    });
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: EventProperties): void {
    this.track('identify', {
      user_id: userId,
      ...traits,
    });
  }

  /**
   * Track button click
   */
  click(label: string, properties?: EventProperties): void {
    this.track('click', {
      label,
      ...properties,
    });
  }

  /**
   * Track form submission
   */
  submit(formName: string, properties?: EventProperties): void {
    this.track('submit', {
      form: formName,
      ...properties,
    });
  }

  /**
   * Send event to API
   */
  private _send(payload: any): void {
    const endpoint = `${this.apiUrl}/ingest`;

    if (this.debug) {
      console.log('[Plots] Sending event:', payload);
    }

    // Use sendBeacon if available (better for page unload events)
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(endpoint, JSON.stringify(payload));
      if (this.debug && !success) {
        console.warn('[Plots] sendBeacon failed, event may not have been sent');
      }
    } else {
      // Fallback to fetch with keepalive
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((error) => {
        if (this.debug) {
          console.error('[Plots] Failed to send event:', error);
        }
      });
    }
  }
}

/**
 * Create a new Plots instance
 */
export function createPlots(projectId: string, options?: { apiUrl?: string; debug?: boolean }): PlotsAnalytics {
  return new PlotsAnalytics(projectId, options);
}

// Default export
export default PlotsAnalytics;
