import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store';
import { BondMeter, Icon, Modal, Spinner } from '../ui';

const PAGE = 6;

export default function ProfileScreen() {
  const { db, route, user, t, nav, startChat, deleteChat } = useApp();
  const char = db.characters.find(c => c.id === route.charId);
  const chat = user?.chats.find(c => c.charId === route.charId);

  const allImages = useMemo(() => {
    if (!chat) return [];
    return chat.messages.filter(m => m.image).map(m => ({ id: m.id, src: m.image!, prompt: m.prompt, ts: m.ts, role: m.role }));
  }, [chat]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  useEffect(() => setPage(1), [route.charId]);

  if (!char) return null;
  const shown = allImages.slice(0, page * PAGE);
  const owner = char.ownerId === 'kaleido' ? 'Kaleido' : char.ownerId === 'community' ? t('community') : (user?.id === char.ownerId ? user.name : t('community'));

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => { setPage(p => p + 1); setLoading(false); }, 650);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-28">
        {/* hero */}
        <div className="relative pt-8 text-center anim-fade-up">
          <button onClick={() => (chat ? nav('chats') : nav('feed'))}
            className="absolute left-0 top-8 w-10 h-10 grid place-items-center rounded-full transition active:scale-90"
            style={{ background: 'var(--surface)' }}>
            <Icon name="arrowL" size={18} />
          </button>
          <div className="inline-block rounded-full p-[3px] kaleido-ring" style={{ animationDuration: '6s' }}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-4" style={{ borderColor: 'var(--bg)' }}>
              <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mt-4">{char.name}</h1>
          <p className="mt-1 text-[15px] font-medium" style={{ color: 'var(--sub)' }}>{char.tagline}</p>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11.5px] font-bold px-3 py-1 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--a2)' }}>{t(char.category)}</span>
            <span className="text-[11.5px] font-bold px-3 py-1 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--a3)' }}>
              {t('st' + char.style[0].toUpperCase() + char.style.slice(1))}
            </span>
            {char.visibility === 'private' && (
              <span className="text-[11.5px] font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--sub)' }}>
                <Icon name="lock" size={11} />{t('privateTag')}
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold mt-2" style={{ color: 'var(--sub)' }}>{t('byUser', { name: owner })}</p>

          <div className="mt-4 flex items-center justify-center gap-5 text-sm font-bold">
            <span className="flex items-center gap-1.5"><Icon name="chat" size={15} style={{ color: 'var(--a1)' }} />{char.chats.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><Icon name="heart" size={15} style={{ color: 'var(--a1)' }} />{char.likes.toLocaleString()}</span>
            {user?.settings.bondEnabled && chat && (
              <span className="flex items-center gap-1.5"><BondMeter bond={chat.bond} size="sm" />{chat.bond}</span>
            )}
          </div>

          <div className="mt-5 flex justify-center gap-2.5">
            <button onClick={() => startChat(char.id)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-display font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--a1)', color: '#fff' }}>
              <Icon name="chat" size={17} />{t('startChat')}
            </button>
            {user?.id === char.ownerId && (
              <>
                <button onClick={() => nav('create', { editCharId: char.id })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold border transition-all active:scale-95"
                  style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
                  <Icon name="pencil" size={15} />{t('editMsg')}
                </button>
                {chat && (
                  <button onClick={() => deleteChat(chat.id)}
                    className="w-11 h-11 grid place-items-center rounded-full border transition-all active:scale-95"
                    style={{ borderColor: 'var(--line)', color: 'var(--danger)' }}>
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* personality */}
        {char.personality && (
          <div className="card p-5 mt-7 anim-fade-up" style={{ animationDelay: '.08s' }}>
            <h2 className="font-display font-bold text-lg mb-2">{t('personality')}</h2>
            <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--sub)' }}>{char.personality}</p>
          </div>
        )}

        {/* gallery */}
        <div className="mt-7 anim-fade-up" style={{ animationDelay: '.14s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><Icon name="sparkles" size={19} style={{ color: 'var(--a3)' }} />{t('gallery')}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--sub)' }}>{t('galleryDesc')}</p>
            </div>
            <span className="text-[12.5px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              {t('showing', { a: shown.length, b: allImages.length })}
            </span>
          </div>

          {allImages.length === 0 ? (
            <div className="card mt-4 flex flex-col items-center text-center py-10 px-6">
              <Icon name="image" size={32} style={{ color: 'var(--sub)' }} />
              <p className="mt-3 text-sm max-w-xs" style={{ color: 'var(--sub)' }}>{t('noImages')}</p>
              <button onClick={() => startChat(char.id)} className="mt-4 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'var(--a3)', color: '#06231d' }}>
                {t('startChat')}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shown.map((im, i) => (
                  <div key={im.id} className="card overflow-hidden group anim-pop" style={{ animationDelay: `${(i % PAGE) * 50}ms` }}>
                    <button onClick={() => setLightbox(im.src)} className="block w-full aspect-square overflow-hidden">
                      <img src={im.src} alt={im.prompt ?? ''} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108" draggable={false} />
                    </button>
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] truncate" style={{ color: 'var(--sub)' }}>{im.prompt ? `✶ ${im.prompt}` : t('imageReady')}</span>
                      <a href={im.src} download={`kaleido-${im.id}.jpg`} title={t('download')}
                        className="w-7 h-7 rounded-full grid place-items-center shrink-0 transition-all hover:scale-110 active:scale-90"
                        style={{ background: 'var(--surface2)', color: 'var(--a3)' }}>
                        <Icon name="download" size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {shown.length < allImages.length && (
                <div className="mt-5 flex flex-col items-center gap-3">
                  <button onClick={loadMore} disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                    {loading ? <Spinner size={16} /> : <Icon name="chevD" size={15} />}
                    {loading ? t('refreshing') : t('loadMore')}
                  </button>
                  <span className="text-[12px]" style={{ color: 'var(--sub)' }}>{t('showing', { a: shown.length, b: allImages.length })}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title={t('imageReady')} wide>
        {lightbox && (
          <div className="flex flex-col items-center gap-3">
            <img src={lightbox} alt="" className="rounded-2xl max-h-[60dvh] w-auto" />
            <a href={lightbox} download={`kaleido-${Date.now()}.jpg`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              <Icon name="download" size={16} />{t('download')}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
