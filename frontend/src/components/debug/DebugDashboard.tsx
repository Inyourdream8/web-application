import React, { useState, useEffect } from 'react';
import { useDebugApi } from '../../utils/debugger';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface PerformanceMetrics {
  timestamp: string;
  cpu_percent: number;
  memory_usage: number;
  api_calls: number;
}

interface DebugSession {
  status: string;
  metrics: {
    api_calls: number;
    errors: number;
    memory_snapshots: number;
  };
  latest_errors: Array<{
    timestamp: string;
    type: string;
    message: string;
    context: string;
  }>;
  performance_issues: Array<{
    type: string;
    details: string;
  }>;
}

const DebugDashboard: React.FC = () => {
  const [session, setSession] = useState<DebugSession | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { callApi } = useDebugApi();

  useEffect(() => {
    fetchDebugStatus();
    const interval = setInterval(fetchDebugStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDebugStatus = async () => {
    try {
      const data = await callApi('/api/debug/status', () =>
        fetch('/api/debug/status').then(res => res.json())
      );
      setSession(data);
    } catch (error) {
      console.error('Error fetching debug status:', error);
    }
  };

  const startDebugSession = async () => {
    try {
      await callApi('/api/debug/session/start', () =>
        fetch('/api/debug/session/start', { method: 'POST' })
      );
      setIsRecording(true);
      fetchDebugStatus();
    } catch (error) {
      console.error('Error starting debug session:', error);
    }
  };

  const stopDebugSession = async () => {
    try {
      const data = await callApi('/api/debug/session/end', () =>
        fetch('/api/debug/session/end', { method: 'POST' }).then(res => res.json())
      );
      setIsRecording(false);
      setSession(data);
    } catch (error) {
      console.error('Error stopping debug session:', error);
    }
  };

  const takeMemorySnapshot = async () => {
    try {
      await callApi('/api/debug/memory/snapshot', () =>
        fetch('/api/debug/memory/snapshot', { method: 'POST' })
      );
      fetchDebugStatus();
    } catch (error) {
      console.error('Error taking memory snapshot:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Debug Dashboard</h1>
        <div className="space-x-4">
          {!isRecording ? (
            <button
              onClick={startDebugSession}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Debug Session
            </button>
          ) : (
            <button
              onClick={stopDebugSession}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop Debug Session
            </button>
          )}
          <button
            onClick={takeMemorySnapshot}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Take Memory Snapshot
          </button>
        </div>
      </div>

      {session && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-500">API Calls</p>
                <p className="text-2xl font-bold">{session.metrics.api_calls}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-500">Errors</p>
                <p className="text-2xl font-bold">{session.metrics.errors}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-500">Memory Snapshots</p>
                <p className="text-2xl font-bold">
                  {session.metrics.memory_snapshots}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Performance Issues</h2>
            <div className="space-y-4">
              {session.performance_issues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
                >
                  <p className="font-semibold">{issue.type}</p>
                  <p className="text-gray-600">{issue.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <h2 className="text-xl font-semibold mb-4">Latest Errors</h2>
            <div className="space-y-4">
              {session.latest_errors.map((error, index) => (
                <div
                  key={index}
                  className="bg-red-50 border-l-4 border-red-400 p-4"
                >
                  <div className="flex justify-between">
                    <p className="font-semibold">{error.type}</p>
                    <p className="text-gray-500">{error.timestamp}</p>
                  </div>
                  <p className="text-gray-600">{error.message}</p>
                  <p className="text-gray-500 text-sm">Context: {error.context}</p>
                </div>
              ))}
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow col-span-2">
              <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
              <LineChart width={800} height={400} data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu_percent"
                  stroke="#8884d8"
                  name="CPU Usage %"
                />
                <Line
                  type="monotone"
                  dataKey="memory_usage"
                  stroke="#82ca9d"
                  name="Memory Usage (MB)"
                />
                <Line
                  type="monotone"
                  dataKey="api_calls"
                  stroke="#ffc658"
                  name="API Calls/sec"
                />
              </LineChart>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugDashboard;