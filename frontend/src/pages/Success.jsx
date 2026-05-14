import React, { useEffect } from 'react';
import Bandeirinhas from '../components/Bandeirinhas';

export default function Success({ data, onReset }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-juninas flex flex-col">
      <Bandeirinhas />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="animate-pop">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="font-display text-3xl font-bold mb-3" style={{ color: '#F5E7D3' }}>
            Momento enviado!
          </h1>
          <p className="text-base mb-2" style={{ color: 'rgba(233,209,181,0.7)' }}>
            Obrigado, <span style={{ color: '#C79A3B', fontWeight: 700 }}>@{data?.instagram}</span>!
          </p>
          <p className="text-sm mb-8" style={{ color: 'rgba(233,209,181,0.5)' }}>
            Seu momento pode aparecer nos nossos reels e redes sociais. ✨
          </p>

          <div className="card-glass p-6 mb-8 max-w-xs mx-auto">
            <p className="text-4xl mb-2">🌽</p>
            <p className="font-display font-bold text-xl mb-1" style={{ color: '#F5E7D3' }}>
              Você faz parte das Juninas!
            </p>
            <p className="text-sm" style={{ color: 'rgba(233,209,181,0.6)' }}>
              Siga @juninasdorio para ver seu conteúdo aparecer.
            </p>
          </div>

          <div className="space-y-3">
            <button className="btn-primary" onClick={onReset}>
              📲 Enviar outro momento
            </button>
          </div>
        </div>
      </div>
      <Bandeirinhas />
    </div>
  );
}
