import React, { useEffect } from 'react';
import { getVideoEmbedInfo } from '@/utils/videoHelper';

let tiktokScriptPromise = null;

function loadTikTokScript() {
  if (typeof document === 'undefined') return Promise.resolve();

  const existing = document.querySelector('script[data-tiktok-embed="true"]');
  if (existing) return Promise.resolve();

  if (!tiktokScriptPromise) {
    tiktokScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.dataset.tiktokEmbed = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el reproductor de TikTok.'));
      document.body.appendChild(script);
    });
  }

  return tiktokScriptPromise;
}

export default function VideoEmbed({ url, className = '' }) {
  const info = getVideoEmbedInfo(url);

  useEffect(() => {
    if (info?.platform === 'TikTok' && info?.id) {
      loadTikTokScript().catch(() => {});
    }
  }, [info?.platform, info?.id]);

  if (!info?.embedUrl) return null;

  if (info.platform === 'YouTube') {
    return (
      <div className={`relative h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700 ${className}`}>
        <iframe
          src={info.embedUrl}
          title="Video de YouTube"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    );
  }

  if (info.platform === 'TikTok' && info.id) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700 bg-black ${className}`}>
        <blockquote
          className="tiktok-embed w-full h-full"
          cite={`https://www.tiktok.com/v/${info.id}`}
          data-video-id={info.id}
          style={{ maxWidth: '605px', minWidth: '325px' }}
        >
          <section>
            <a target="_blank" rel="noopener noreferrer" title="tiktok.com" href={`https://www.tiktok.com/v/${info.id}`}>
              TikTok
            </a>
          </section>
        </blockquote>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-zinc-700 p-4 bg-slate-50 dark:bg-zinc-900 ${className}`}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        No pudimos incrustar automáticamente este enlace, pero sigue disponible para abrirlo.
      </p>
      <a
        href={info.embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#b08968] dark:text-orange-200 font-semibold underline break-all"
      >
        Ver video
      </a>
    </div>
  );
}
