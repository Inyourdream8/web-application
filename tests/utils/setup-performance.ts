import { performance } from 'perf_hooks';

declare global {
  namespace jest {
    interface Context {
      measurePerformance: (name: string) => PerformanceTimer;
      getPerformanceMetrics: () => PerformanceMetrics;
    }
  }
}

interface PerformanceTimer {
  start: () => void;
  end: () => number;
}

interface PerformanceMetrics {
  loadTime?: number;
  memoryUsage?: number;
  apiResponseTime?: number;
}

beforeEach(function() {
  const metrics: PerformanceMetrics = {};
  
  this.measurePerformance = (name: string): PerformanceTimer => {
    let startTime: number;
    
    return {
      start: () => {
        startTime = performance.now();
      },
      end: () => {
        const duration = performance.now() - startTime;
        switch (name) {
          case 'load':
            metrics.loadTime = duration;
            break;
          case 'api':
            metrics.apiResponseTime = duration;
            break;
        }
        return duration;
      }
    };
  };

  this.getPerformanceMetrics = () => {
    metrics.memoryUsage = process.memoryUsage().heapUsed;
    return metrics;
  };
});

afterEach(function() {
  const metrics = this.getPerformanceMetrics();
  // @ts-ignore
  if (this.currentTest) {
    // @ts-ignore
    this.currentTest.performanceMetrics = metrics;
  }
});