import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Home      from './pages/Home';
import Success   from './pages/Success';
import AuthPage  from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import LoadingSpinner from './components/LoadingSpinner';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-juninas flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

function AppContent() {
  const [success, setSuccess] = useState(null);

  if (success) return <Success data={success} onReset={() => setSuccess(null)} />;

  return (
    <Routes>
      <Route path="/" element={<Home onSuccess={(data) => setSuccess(data)} />} />
      <Route path="/admin/login" element={<AuthPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
            background: 'rgba(26,0,37,0.95)',
            color: '#F5E7D3',
            border: '1px solid rgba(199,154,59,0.3)',
          },
          success: { iconTheme: { primary: '#C21874', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
