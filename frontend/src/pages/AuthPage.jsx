import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const formatPhone = (v) => {
  const d = v.replace(/\D/g,'').slice(0,11);
  if (d.length<=2) return d;
  if (d.length<=6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length<=10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [tipo, setTipo] = useState('instagram');
  const [form, setForm] = useState({ name:'', identifier:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
  const handlePhone = (e) => setForm({...form, identifier: formatPhone(e.target.value)});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.identifier, form.password);
        toast.success(`Bem-vindo(a), ${(user.name||user.instagram||'').split(' ')[0]}! 🌽`);
        navigate(user.role === 'admin' ? '/admin' : '/');
      } else {
        if (!form.name.trim()) return toast.error('Informe seu nome');
        const payload = tipo === 'instagram'
          ? { name: form.name, instagram: form.identifier, password: form.password }
          : { name: form.name, phone: form.identifier, password: form.password };
        const user = await register(payload);
        toast.success(`Conta criada! Bem-vindo(a), ${user.name.split(' ')[0]}! 🎉`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Algo deu errado');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-juninas flex flex-col">
      <Bandeirinhas />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-float inline-block">🌽</div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E7D3' }}>Você nas Juninas</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(233,209,181,0.5)' }}>Juninas do Rio 2026</p>
          </div>
          <div className="card-glass p-6">
            <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(199,154,59,0.12)' }}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={mode===m ? { background:'rgba(255,255,255,0.15)', color:'#F5E7D3', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' } : { color:'rgba(233,209,181,0.6)' }}>
                  {m === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>Seu nome</label>
                    <input name="name" type="text" className="input-dark" placeholder="Como quer ser chamado(a)" value={form.name} onChange={handleChange} autoFocus />
                  </div>
                  <div className="flex rounded-xl p-1" style={{ background: 'rgba(199,154,59,0.08)' }}>
                    {['instagram','telefone'].map(t => (
                      <button key={t} type="button" onClick={() => { setTipo(t); setForm(f=>({...f,identifier:''})); }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={tipo===t ? { background:'rgba(255,255,255,0.15)', color:'#F5E7D3' } : { color:'rgba(233,209,181,0.5)' }}>
                        {t === 'instagram' ? '@ Instagram' : '📱 Telefone'}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>
                  {mode==='login' ? '@ Instagram ou Telefone' : tipo==='instagram' ? '@ Instagram' : 'Telefone'}
                </label>
                <input className="input-dark" name="identifier"
                  type={mode==='register' && tipo==='telefone' ? 'tel' : 'text'}
                  placeholder={mode==='login' ? 'instagram ou (21) 99999-9999' : tipo==='instagram' ? 'seuinstagram' : '(21) 99999-9999'}
                  value={form.identifier}
                  onChange={mode==='register' && tipo==='telefone' ? handlePhone : handleChange}
                  autoCapitalize="none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>Senha</label>
                <input className="input-dark" type="password" name="password"
                  placeholder={mode==='register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  value={form.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm"/> : mode==='login' ? 'Entrar na festa 🎉' : 'Criar minha conta 🌽'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Bandeirinhas />
    </div>
  );
}
