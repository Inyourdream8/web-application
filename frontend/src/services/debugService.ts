import { useDebugApi } from '../utils/debugger';

export interface DebugMetrics {
  api_calls: number;
  errors: number;
  memory_snapshots: number;
}

export interface DebugError {
  timestamp: string;
  type: string;
  message: string;
  context: string;
}

export interface PerformanceIssue {
  type: string;
  details: string;
}

export interface DebugSessionData {
  status: string;
  metrics: DebugMetrics;
  latest_errors: DebugError[];
  performance_issues: PerformanceIssue[];
}

class DebugService {
  private debugApi = useDebugApi();

  async getDebugStatus(): Promise<DebugSessionData> {
    return this.debugApi.callApi('/api/debug/status', () =>
      fetch('/api/debug/status').then(res => res.json())
    );
  }

  async startDebugSession(): Promise<void> {
    await this.debugApi.callApi('/api/debug/session/start', () =>
      fetch('/api/debug/session/start', { method: 'POST' })
    );
  }

  async stopDebugSession(): Promise<DebugSessionData> {
    return this.debugApi.callApi('/api/debug/session/end', () =>
      fetch('/api/debug/session/end', { method: 'POST' }).then(res => res.json())
    );
  }

  async takeMemorySnapshot(): Promise<void> {
    await this.debugApi.callApi('/api/debug/memory/snapshot', () =>
      fetch('/api/debug/memory/snapshot', { method: 'POST' })
    );
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.debugApi.callApi('/api/debug/performance', () =>
      fetch('/api/debug/performance').then(res => res.json())
    );
  }

  async getLogs(): Promise<string[]> {
    return this.debugApi.callApi('/api/debug/logs', () =>
      fetch('/api/debug/logs').then(res => res.json())
    ).then(data => data.logs);
  }

  async getAnalysis(): Promise<any> {
    return this.debugApi.callApi('/api/debug/analysis', () =>
      fetch('/api/debug/analysis').then(res => res.json())
    );
  }

  async setBreakpoint(endpoint: string, condition: string): Promise<void> {
    await this.debugApi.callApi('/api/debug/breakpoints', () =>
      fetch('/api/debug/breakpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, condition }),
      })
    );
  }

  async startTrace(operation: string, duration: number = 30): Promise<void> {
    await this.debugApi.callApi('/api/debug/trace', () =>
      fetch('/api/debug/trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation, duration }),
      })
    );
  }
}

export const debugService = new DebugService();
export default debugService;