import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { compressImage, validateVideo, isVideo } from '../utils/compress';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: 'forro',     emoji: '💃', label: 'Forró' },
  { id: 'comida',    emoji: '🌽', label: 'Comida' },
  { id: 'show',      emoji: '🎶', label: 'Show' },
  { id: 'casal',     emoji: '❤️', label: 'Casal' },
  { id: 'quadrilha', emoji: '👒', label: 'Quadrilha' },
  { id: 'diversao',  emoji: '🎡', label: 'Diversão' },
  { id: 'vibe',      emoji: '✨', label: 'Minha vibe' },
];

const TIPS = [
  { emoji: '💃', text: 'Grave dançando forró' },
  { emoji: '🌽', text: 'Mostre sua comida favorita' },
  { emoji: '❤️', text: 'Capture momentos espontâneos' },
  { emoji: '🎶', text: 'Grave o momento mais animado do show' },
  { emoji: '👒', text: 'Mostre sua experiência na vila' },
  { emoji: '📱', text: 'Vídeos verticais ficam melhores nos reels' },
];

const STEPS = ['início', 'categoria', 'mídia', 'autorização'];

export default function Home({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [instagram, setInstagram] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [auths, setAuths] = useState({ auth_repost: true, auth_mention: true, auth_promo: true });
  const fileRef = useRef();

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  const handleFileSelect = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (isVideo(f)) {
        await validateVideo(f);
        setFile(f);
        setPreview({ url: URL.createObjectURL(f), type: 'video' });
      } else {
        setCompressing(true);
        const compressed = await compressImage(f, (p) => setUploadProgress(p));
        setFile(compressed);
        setPreview({ url: URL.createObjectURL(compressed), type: 'image' });
        setCompressing(false);
        setUploadProgress(0);
      }
      setStep(3);
    } catch (err) {
      toast.error(err.message);
      setCompressing(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('instagram', instagram);
      fd.append('name', name);
      fd.append('category', category);
      fd.append('auth_repost', auths.auth_repost ? '1' : '0');
      fd.append('auth_mention', auths.auth_mention ? '1' : '0');
      fd.append('auth_promo', auths.auth_promo ? '1' : '0');

      await api.post('/uploads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded / e.total) * 100)),
      });

      onSuccess({ instagram, category });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-juninas flex flex-col">
      <Bandeirinhas />

      {/* Progress */}
      {step > 0 && (
        <div className="px-4 pt-3">
          <div className="max-w-sm mx-auto">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* STEP 0 — Landing */}
          {step === 0 && (
            <div className="text-center animate-slide-up">
              <div className="text-7xl mb-6 animate-float inline-block">🌽</div>
              <h1 className="font-display text-3xl font-bold mb-3" style={{ color: '#F5E7D3' }}>
                Você nas Juninas
              </h1>
              <p className="text-base mb-8 leading-relaxed" style={{ color: 'rgba(233,209,181,0.7)' }}>
                "Seus melhores momentos podem virar parte da nossa história."
              </p>

              {/* Dicas */}
              <div className="card-glass p-4 mb-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#C79A3B' }}>
                  🎥 Dicas pra aparecer nos vídeos oficiais
                </p>
                {TIPS.map((t, i) => (
                  <div key={i} className="tip-item">
                    <span className="text-lg flex-shrink-0">{t.emoji}</span>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary text-lg py-4" onClick={() => setStep(1)}>
                📲 Enviar Meu Momento
              </button>
            </div>
          )}

          {/* STEP 1 — Instagram */}
          {step === 1 && (
            <div className="animate-slide-up">
              <button onClick={() => setStep(0)} className="text-sm mb-6 flex items-center gap-1" style={{ color: '#C79A3B' }}>
                ← Voltar
              </button>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5E7D3' }}>Quem é você?</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(233,209,181,0.6)' }}>Vamos te creditar direitinho nos reels!</p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#C79A3B' }}>@ Instagram *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: '#C79A3B' }}>@</span>
                    <input className="input-dark pl-8" placeholder="seuinstagram" value={instagram}
                      onChange={e => setInstagram(e.target.value.replace(/^@/, ''))}
                      autoCapitalize="none" autoCorrect="off" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(199,154,59,0.7)' }}>Nome (opcional)</label>
                  <input className="input-dark" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <button className="btn-primary" disabled={!instagram.trim()} onClick={() => setStep(2)}>
                Continuar →
              </button>
            </div>
          )}

          {/* STEP 2 — Categoria */}
          {step === 2 && (
            <div className="animate-slide-up">
              <button onClick={() => setStep(1)} className="text-sm mb-6 flex items-center gap-1" style={{ color: '#C79A3B' }}>
                ← Voltar
              </button>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5E7D3' }}>Qual o clima?</h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(233,209,181,0.6)' }}>Escolha a categoria do seu momento</p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className={`category-card ${category === cat.id ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}>
                    <div className="cat-emoji text-2xl mb-1 transition-transform duration-200">{cat.emoji}</div>
                    <div className="text-xs font-semibold" style={{ color: '#E9D1B5' }}>{cat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button className="btn-primary" disabled={!category} onClick={() => fileRef.current?.click()}>
                  {compressing ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Comprimindo... {uploadProgress}%
                    </span>
                  ) : '📸 Escolher foto ou vídeo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>
          )}

          {/* STEP 3 — Preview + Autorização */}
          {step === 3 && (
            <div className="animate-slide-up">
              <button onClick={() => setStep(2)} className="text-sm mb-4 flex items-center gap-1" style={{ color: '#C79A3B' }}>
                ← Trocar arquivo
              </button>
              <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#F5E7D3' }}>Ficou bom? 🔥</h2>

              {/* Preview */}
              {preview && (
                <div className="rounded-2xl overflow-hidden mb-4 aspect-video bg-black">
                  {preview.type === 'video'
                    ? <video src={preview.url} controls className="w-full h-full object-contain" />
                    : <img src={preview.url} alt="preview" className="w-full h-full object-contain" />
                  }
                </div>
              )}

              {/* Info do upload */}
              <div className="card-glass p-3 mb-4 flex items-center gap-3">
                <span className="text-xl">{CATEGORIES.find(c => c.id === category)?.emoji}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#C79A3B' }}>{CATEGORIES.find(c => c.id === category)?.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(233,209,181,0.6)' }}>@{instagram}</p>
                </div>
              </div>

              {/* Autorizações */}
              <div className="card-glass p-4 mb-5">
                <p className="text-xs font-bold mb-3" style={{ color: '#C79A3B' }}>Autorizo as Juninas do Rio a:</p>
                {[
                  { key: 'auth_repost', label: 'Fazer repost nas redes sociais' },
                  { key: 'auth_mention', label: 'Me marcar no Instagram' },
                  { key: 'auth_promo', label: 'Usar em reels e materiais promocionais' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={auths[key]}
                      onChange={e => setAuths(a => ({ ...a, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded" style={{ accentColor: '#C21874' }} />
                    <span className="text-xs" style={{ color: 'rgba(233,209,181,0.8)' }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Upload progress */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#C79A3B' }}>
                    <span>Enviando...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <button className="btn-primary text-lg py-4" onClick={handleSubmit} disabled={uploading}>
                {uploading
                  ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" /> {uploadProgress}%</span>
                  : '🌽 Enviar meu momento!'
                }
              </button>
            </div>
          )}
        </div>
      </div>

      <Bandeirinhas />
    </div>
  );
}
