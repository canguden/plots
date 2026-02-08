/**
 * @plots/tracking/react - React hooks for Plots Analytics
 * 
 * Usage:
 * ```tsx
 * import { PlotsProvider, usePlots } from '@plots/tracking/react';
 * 
 * function App() {
 *   return (
 *     <PlotsProvider projectId="proj_xxx">
 *       <YourApp />
 *     </PlotsProvider>
 *   );
 * }
 * 
 * function Button() {
 *   const plots = usePlots();
 *   return <button onClick={() => plots.track('click')}>Click</button>;
 * }
 * ```
 */

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { PlotsAnalytics, EventProperties } from './index';

interface PlotsContextValue {
  track: (event: string, properties?: EventProperties) => void;
  pageview: (path?: string) => void;
  signup: (properties?: EventProperties) => void;
  purchase: (value: number, properties?: EventProperties) => void;
  identify: (userId: string, traits?: EventProperties) => void;
  click: (label: string, properties?: EventProperties) => void;
  submit: (formName: string, properties?: EventProperties) => void;
}

const PlotsContext = createContext<PlotsContextValue | null>(null);

interface PlotsProviderProps {
  projectId: string;
  apiUrl?: string;
  debug?: boolean;
  autoPageview?: boolean;
  children: ReactNode;
}

/**
 * Plots Analytics Provider Component
 */
export function PlotsProvider({ 
  projectId, 
  apiUrl, 
  debug = false,
  autoPageview = true,
  children 
}: PlotsProviderProps) {
  const plotsRef = useRef<PlotsAnalytics | null>(null);

  // Initialize analytics
  useEffect(() => {
    if (!plotsRef.current) {
      plotsRef.current = new PlotsAnalytics(projectId, { apiUrl, debug });
      
      // Track initial pageview
      if (autoPageview) {
        plotsRef.current.pageview();
      }
    }
  }, [projectId, apiUrl, debug, autoPageview]);

  const contextValue: PlotsContextValue = {
    track: (event, properties) => plotsRef.current?.track(event, properties),
    pageview: (path) => plotsRef.current?.pageview(path),
    signup: (properties) => plotsRef.current?.signup(properties),
    purchase: (value, properties) => plotsRef.current?.purchase(value, properties),
    identify: (userId, traits) => plotsRef.current?.identify(userId, traits),
    click: (label, properties) => plotsRef.current?.click(label, properties),
    submit: (formName, properties) => plotsRef.current?.submit(formName, properties),
  };

  return (
    <PlotsContext.Provider value={contextValue}>
      {children}
    </PlotsContext.Provider>
  );
}

/**
 * Hook to access Plots Analytics
 */
export function usePlots(): PlotsContextValue {
  const context = useContext(PlotsContext);
  
  if (!context) {
    throw new Error('usePlots must be used within a PlotsProvider');
  }
  
  return context;
}

/**
 * Hook to track pageviews on route changes
 */
export function usePlotsPageviews() {
  const { pageview } = usePlots();
  
  useEffect(() => {
    pageview();
  }, [typeof window !== 'undefined' ? window.location.pathname : '']);
}

/**
 * Hook to track component mount
 */
export function usePlotsMount(eventName: string, properties?: EventProperties) {
  const { track } = usePlots();
  
  useEffect(() => {
    track(eventName, properties);
  }, []); // Only on mount
}

/**
 * Hook to track clicks
 */
export function usePlotsClick(label: string, properties?: EventProperties) {
  const { click } = usePlots();
  
  return () => click(label, properties);
}
