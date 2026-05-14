import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { UPLOADS_URL } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const CAT_MAP = {
  forro:'💃',comida:'🌽',show:'🎶',casal:'❤️',quadrilha:'👒',diversao:'🎡',vibe:'✨'
};
const CAT_LABEL = {
  forro:'Forró',comida:'Comida',show:'Show',casal:'Casal',quadrilha:'Quadrilha',diversao:'Diversão',vibe:'Minha vibe'
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('uploads');
  const [filterCat, setFilterCat] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat) params.set('category', filterCat);
      if (filterFeatured) params.set('featured', '1');

      const [u, s] = await Promise.all([
        api.get(`/admin/uploads?${params}`),
        api.get('/admin/stats'),
      ]);
      setUploads(u.data.uploads);
      setStats(s.data.stats);
    } catch { toast.error('Erro ao carregar'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterCat, filterFeatured]);

  const handleDelete = async (id) => {
    if (!confirm('Excluir este conteúdo?')) return;
    try { await api.delete(`/admin/uploads/${id}`); toast.success('Excluído'); fetchAll(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const handleFeatured = async (id) => {
    try { await api.patch(`/admin/uploads/${id}/featured`); fetchAll(); }
    catch { toast.error('Erro'); }
  };

  const copyInstagram = (instagram) => {
    navigator.clipboard.writeText(`@${instagram}`);
    toast.success(`@${instagram} copiado!`);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });

  return (
    <div className="min-h-screen bg-juninas flex flex-col">
      <Bandeirinhas />

      <header className="px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold" style={{ color: '#F5E7D3' }}>Admin · Você nas Juninas</h1>
            <p className="text-xs" style={{ color: '#C79A3B' }}>@{user?.instagram || user?.name}</p>
          </div>
          <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Sair</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="max-w-2xl mx-auto flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {['uploads','stats'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#C21874,#6F2DA8)', color: '#fff' }
                : { color: 'rgba(233,209,181,0.6)' }}>
              {t === 'uploads' ? '📸 Conteúdos' : '📊 Estatísticas'}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {loading ? <div className="flex justify-center py-12"><LoadingSpinner text="Carregando..." /></div> : (
            <>
              {/* UPLOADS */}
              {tab === 'uploads' && (
                <div>
                  {/* Filtros */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                      className="input-dark text-xs py-2 flex-1"
                      style={{ minWidth: 120 }}>
                      <option value="">Todas as categorias</option>
                      {Object.entries(CAT_LABEL).map(([id, label]) => (
                        <option key={id} value={id}>{CAT_MAP[id]} {label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setFilterFeatured(f => !f)}
                      className="btn-secondary text-xs py-2 px-3 flex-shrink-0"
                      style={filterFeatured ? { borderColor: '#C79A3B', color: '#C79A3B' } : {}}>
                      {filterFeatured ? '⭐ Destaques' : '⭐ Todos'}
                    </button>
                  </div>

                  <p className="text-xs mb-3" style={{ color: 'rgba(233,209,181,0.4)' }}>{uploads.length} conteúdo(s)</p>

                  {/* Grid de mídias */}
                  <div className="grid grid-cols-2 gap-3">
                    {uploads.map(u => (
                      <div key={u.id} className="card-glass overflow-hidden">
                        {/* Mídia */}
                        <div className="relative aspect-square bg-black">
                          {u.file_type === 'video'
                            ? <video src={`${UPLOADS_URL}/${u.file_path}`} className="w-full h-full object-cover" muted />
                            : <img src={`${UPLOADS_URL}/${u.file_path}`} alt="" className="w-full h-full object-cover" />
                          }
                          {u.file_type === 'video' && (
                            <div className="absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)' }}>▶</div>
                          )}
                          {u.featured === 1 && (
                            <div className="absolute top-1 left-1 text-xs">⭐</div>
                          )}
                          <div className="absolute bottom-1 left-1 text-sm">{CAT_MAP[u.category]}</div>
                        </div>

                        {/* Info */}
                        <div className="p-2.5">
                          <button onClick={() => copyInstagram(u.instagram)}
                            className="text-xs font-semibold block truncate w-full text-left"
                            style={{ color: '#C79A3B' }}>
                            @{u.instagram}
                          </button>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(233,209,181,0.4)' }}>{formatDate(u.created_at)}</p>

                          {/* Autorizações */}
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {u.auth_repost  === 1 && <span className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(0,124,145,0.2)', color: '#007C91' }}>repost</span>}
                            {u.auth_mention === 1 && <span className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(194,24,116,0.2)', color: '#C21874' }}>marcar</span>}
                            {u.auth_promo   === 1 && <span className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(111,45,168,0.2)', color: '#6F2DA8' }}>promo</span>}
                          </div>

                          {/* Ações */}
                          <div className="flex gap-1.5 mt-2">
                            <a href={`${UPLOADS_URL}/${u.file_path}`} download target="_blank" rel="noreferrer"
                              className="flex-1 text-center text-xs py-1.5 rounded-lg font-medium"
                              style={{ background: 'rgba(0,124,145,0.2)', color: '#007C91' }}>
                              ↓ Baixar
                            </a>
                            <button onClick={() => handleFeatured(u.id)}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                              style={{ background: u.featured ? 'rgba(199,154,59,0.2)' : 'rgba(255,255,255,0.05)', color: u.featured ? '#C79A3B' : 'rgba(233,209,181,0.4)' }}>
                              ⭐
                            </button>
                            <button onClick={() => handleDelete(u.id)}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                              style={{ background: 'rgba(194,24,116,0.15)', color: '#C21874' }}>
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {uploads.length === 0 && (
                    <div className="card-glass p-12 text-center">
                      <p className="text-4xl mb-2">📸</p>
                      <p style={{ color: 'rgba(233,209,181,0.5)' }}>Nenhum conteúdo ainda</p>
                    </div>
                  )}
                </div>
              )}

              {/* STATS */}
              {tab === 'stats' && stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { emoji: '📸', label: 'Total',      value: stats.total },
                      { emoji: '⭐', label: 'Destaques',  value: stats.featured },
                    ].map(s => (
                      <div key={s.label} className="card-glass p-5 text-center">
                        <span className="text-3xl block mb-1">{s.emoji}</span>
                        <p className="text-3xl font-bold" style={{ color: '#F5E7D3' }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(233,209,181,0.5)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="card-glass p-4">
                    <p className="text-xs font-bold mb-3" style={{ color: '#C79A3B' }}>Por Categoria</p>
                    {stats.byCategory.map(c => (
                      <div key={c.category} className="flex items-center justify-between py-1.5">
                        <span className="text-sm" style={{ color: '#E9D1B5' }}>
                          {CAT_MAP[c.category]} {CAT_LABEL[c.category]}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#C79A3B' }}>{c.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card-glass p-4">
                    <p className="text-xs font-bold mb-3" style={{ color: '#C79A3B' }}>Por Tipo</p>
                    {stats.byType.map(t => (
                      <div key={t.file_type} className="flex items-center justify-between py-1.5">
                        <span className="text-sm" style={{ color: '#E9D1B5' }}>
                          {t.file_type === 'video' ? '🎥 Vídeos' : '📷 Fotos'}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#C79A3B' }}>{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Bandeirinhas />
    </div>
  );
}
