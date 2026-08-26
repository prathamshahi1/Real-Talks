import React, { useState, useEffect } from 'react';
import api from './services/api';
import { socket } from './services/socket';
import {
  MessageSquare,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Sparkles
} from 'lucide-react';

function App() {
  const [apiHealth, setApiHealth] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || null);
  const [socketPingResponse, setSocketPingResponse] = useState(null);
  const [pinging, setPinging] = useState(false);

  // 1. Fetch REST API Health
  const checkApiHealth = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await api.get('/health');
      setApiHealth(response.data);
    } catch (err) {
      console.error('API health check failed:', err);
      setApiError(err.response?.data?.message || err.message || 'Failed to reach API server');
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    checkApiHealth();

    // 2. Socket Event Listeners
    const onConnect = () => {
      setSocketConnected(true);
      setSocketId(socket.id);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setSocketId(null);
    };

    const onPong = (data) => {
      setSocketPingResponse(data);
      setPinging(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pong_client', onPong);

    if (socket.connected) {
      setSocketConnected(true);
      setSocketId(socket.id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pong_client', onPong);
    };
  }, []);

  const sendSocketPing = () => {
    if (!socket.connected) return;
    setPinging(true);
    socket.emit('ping_server', { clientTime: Date.now() });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PulseChat
              </h1>
              <p className="text-xs text-indigo-400 font-medium">MERN Real-Time Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Step 1: Environment & Setup
            </span>
            <button
              onClick={checkApiHealth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50"
              title="Refresh Health Status"
            >
              <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        {/* Welcome Banner */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
          <div>
            <span className="inline-block px-2.5 py-0.5 mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 rounded-md border border-indigo-800/50">
              Foundation Active
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-Time Communication Platform
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Scalable, full-stack chat ecosystem built with React 19, Node.js, Express, MongoDB, and Socket.IO.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Core System Ready
            </div>
          </div>
        </div>

        {/* Live Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* REST API Health Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md hover:border-indigo-500/40 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Express REST API</h3>
                    <p className="text-xs text-slate-400">Endpoint: /api/health</p>
                  </div>
                </div>

                {apiLoading ? (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-slate-400 animate-pulse">
                    Connecting...
                  </span>
                ) : apiHealth?.success ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online (200 OK)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Offline
                  </span>
                )}
              </div>

              {apiHealth ? (
                <div className="space-y-2 mt-4 text-xs font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Message:</span>
                    <span className="text-indigo-300">{apiHealth.message}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Server Uptime:</span>
                    <span>{Math.round(apiHealth.uptime)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Environment:</span>
                    <span className="text-emerald-400">{apiHealth.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Sockets:</span>
                    <span>{apiHealth.socketConnections}</span>
                  </div>
                </div>
              ) : apiError ? (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                  {apiError}
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/40 text-xs text-slate-500 italic">
                  Checking backend status...
                </div>
              )}
            </div>

            <button
              onClick={checkApiHealth}
              disabled={apiLoading}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
              Test API Latency & Handshake
            </button>
          </div>

          {/* Socket.IO Real-Time Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md hover:border-violet-500/40 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Socket.IO Engine</h3>
                    <p className="text-xs text-slate-400">Bidirectional WebSocket Transport</p>
                  </div>
                </div>

                {socketConnected ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Connecting...
                  </span>
                )}
              </div>

              <div className="space-y-2 mt-4 text-xs font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Socket ID:</span>
                  <span className="text-violet-300 truncate max-w-[200px]">{socketId || 'Not connected yet'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transport:</span>
                  <span className="text-indigo-400">WebSocket / Polling</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ping Test:</span>
                  <span className={socketPingResponse ? 'text-emerald-400' : 'text-slate-500'}>
                    {socketPingResponse ? 'Echo Received ✅' : 'Idle'}
                  </span>
                </div>
                {socketPingResponse && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Server Response: &quot;{socketPingResponse.message}&quot;
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={sendSocketPing}
              disabled={!socketConnected || pinging}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <Zap className={`w-3.5 h-3.5 ${pinging ? 'animate-bounce' : ''}`} />
              {pinging ? 'Sending Ping...' : 'Emit Real-Time Ping Event'}
            </button>
          </div>
        </div>

        {/* Architecture & Tech Stack Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2 text-indigo-400">
              <Layers className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">React 19 + Vite</h4>
            </div>
            <p className="text-xs text-slate-400">
              Ultra-fast HMR, Tailwind CSS styling, responsive layout system, React Router.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2 text-violet-400">
              <Cpu className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Express + Node</h4>
            </div>
            <p className="text-xs text-slate-400">
              Modular controller-service pattern, HTTP-only cookie JWT auth, security rate-limiting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2 text-emerald-400">
              <Database className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">MongoDB + Mongoose</h4>
            </div>
            <p className="text-xs text-slate-400">
              Indexed schema design for sub-millisecond query performance on chats & messages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Production Security</h4>
            </div>
            <p className="text-xs text-slate-400">
              Bcrypt password hashing, CORS whitelist, input sanitization, error shielding.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        Step 1 Verification Complete • Ready for Step 2 (Authentication & JWT System)
      </footer>
    </div>
  );
}

export default App;
