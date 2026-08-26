import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';

// Root path director: redirects to /chat if logged in, else /login
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Initializing PulseChat...
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<Navigate to="/chat" replace />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
