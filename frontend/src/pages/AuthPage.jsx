import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthPage() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciais incorretas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-juninas flex flex-col">
      <Bandeirinhas />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-float inline-block">🌽</div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E7D3' }}>Admin</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(233,209,181,0.5)' }}>Você nas Juninas</p>
          </div>
          <div className="card-glass p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>@ Instagram ou Telefone</label>
                <input className="input-dark" placeholder="admin" value={form.identifier}
                  onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} required autoCapitalize="none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>Senha</label>
                <input className="input-dark" type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Bandeirinhas />
    </div>
  );
}
