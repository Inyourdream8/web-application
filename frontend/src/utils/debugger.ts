import { performance } from 'perf_hooks';
import React from 'react';

interface DebugMetrics {
  componentRenderTime: number;
  apiCallDuration: number;
  memoryUsage: number;
  longTasks: Performance[];
}

class FrontendDebugger {
  private static instance: FrontendDebugger;
  private metrics: Map<string, DebugMetrics>;
  private observer: PerformanceObserver;

  private constructor() {
    this.metrics = new Map();
    
    // Set up performance observer
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          console.warn(`Long Task Detected:`, {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      }
    });

    this.observer.observe({ entryTypes: ['longtask', 'measure', 'resource'] });
  }

  static getInstance(): FrontendDebugger {
    if (!FrontendDebugger.instance) {
      FrontendDebugger.instance = new FrontendDebugger();
    }
    return FrontendDebugger.instance;
  }

  startComponentProfiling(componentName: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.logComponentMetrics(componentName, duration);
    };
  }

  async measureApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      this.logApiMetrics(endpoint, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.logApiError(endpoint, error, duration);
      throw error;
    }
  }

  private logComponentMetrics(componentName: string, renderTime: number): void {
    if (renderTime > 16.67) { // Longer than one frame (60fps)
      console.warn(`Slow Component Render:`, {
        component: componentName,
        duration: renderTime,
        timestamp: new Date().toISOString()
      });
    }

    this.updateMetrics(componentName, { componentRenderTime: renderTime });
  }

  private logApiMetrics(endpoint: string, duration: number): void {
    if (duration > 1000) { // Longer than 1 second
      console.warn(`Slow API Call:`, {
        endpoint,
        duration,
        timestamp: new Date().toISOString()
      });
    }

    this.updateMetrics(endpoint, { apiCallDuration: duration });
  }

  private logApiError(endpoint: string, error: any, duration: number): void {
    console.error(`API Call Error:`, {
      endpoint,
      error,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  private updateMetrics(key: string, newMetrics: Partial<DebugMetrics>): void {
    const current = this.metrics.get(key) || {
      componentRenderTime: 0,
      apiCallDuration: 0,
      memoryUsage: 0,
      longTasks: []
    };

    this.metrics.set(key, {
      ...current,
      ...newMetrics
    });
  }

  getMetrics(): Map<string, DebugMetrics> {
    return new Map(this.metrics);
  }

  createDebugReport(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics),
      memory: performance.memory,
      navigationTiming: performance.getEntriesByType('navigation'),
      resourceTiming: performance.getEntriesByType('resource'),
    }, null, 2);
  }
}

export const debugger = FrontendDebugger.getInstance();

// Higher-order component for debugging React components
export function withDebugger<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return function DebugWrapper(props: P) {
    const stopProfiling = debugger.startComponentProfiling(componentName);
    
    React.useEffect(() => {
      return () => {
        stopProfiling();
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}

// Custom hook for debugging API calls
export function useDebugApi() {
  return {
    callApi: async <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => {
      return debugger.measureApiCall(apiCall, endpoint);
    }
  };
}