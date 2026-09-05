import { useState } from 'react';
import { useApp } from '../store';
import { Avatar, BondMeter, EmptyState, Icon, Modal, timeAgo } from '../ui';
import { STORE_ITEMS } from '../seed';

export default function ChatsList() {
  const { db, user, t, nav, startChat, typing, deleteChat } = useApp();
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  if (!user) return null;

  const chats = user.chats
    .map(c => ({ c, char: db.characters.find(x => x.id === c.charId) }))
    .filter(x => x.char && (!q.trim() || x.char.name.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.c.messages[b.c.messages.length - 1]?.ts ?? 0) - (a.c.messages[a.c.messages.length - 1]?.ts ?? 0));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 pb-28">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight anim-fade-up">{t('yourChats')}</h1>
        <div className="relative mt-4 anim-fade-up" style={{ animationDelay: '.06s' }}>
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--sub)' }}><Icon name="search" size={17} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchPh')}
            className="w-full rounded-full pl-10 pr-4 py-2.5 text-[14.5px] outline-none focus:ring-2 focus:ring-[var(--a1)]/50"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
        </div>

        {chats.length === 0 ? (
          <div className="card mt-6">
            <EmptyState icon="chat" title={q ? t('noResults') : t('noChats')} desc={q ? undefined : t('noChatsDesc')}
              action={!q ? (
                <button onClick={() => nav('feed')} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--a1)', color: '#fff' }}>
                  <Icon name="home" size={16} />{t('goToFeed')}
                </button>
              ) : undefined} />
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            {chats.map(({ c, char }, i) => {
              const last = c.messages[c.messages.length - 1];
              const item = last?.itemId ? STORE_ITEMS.find(x => x.id === last.itemId) : undefined;
              const isTyping = !!typing[c.id];
              return (
                <div key={c.id} className="card lift flex items-center gap-3 p-3 cursor-pointer anim-slide-r relative group"
                  style={{ animationDelay: `${Math.min(i * 45, 320)}ms` }} onClick={() => startChat(char!.id)}>
                  <Avatar src={char!.avatar} size={52} ring={isTyping} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-[15px] truncate">{char!.name}</h3>
                      {user.settings.bondEnabled && c.bond > 0 && <BondMeter bond={c.bond} size="sm" />}
                      <span className="ml-auto text-[11px] font-semibold shrink-0" style={{ color: 'var(--sub)' }}>
                        {last ? timeAgo(last.ts, t) : ''}
                      </span>
                    </div>
                    <p className="text-[13px] truncate mt-0.5 flex items-center gap-1.5" style={{ color: isTyping ? 'var(--a1)' : 'var(--sub)' }}>
                      {isTyping ? (
                        <><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></>
                      ) : last?.image ? (
                        <><Icon name="image" size={13} />{t('photo')}</>
                      ) : item ? (
                        <><Icon name={item.icon} size={13} />{t(item.id)}</>
                      ) : (
                        <span className={c.unread > 0 ? 'font-bold' : ''} style={c.unread > 0 ? { color: 'var(--text)' } : undefined}>
                          {last?.role === 'user' ? '→ ' : ''}{last?.text ?? ''}
                        </span>
                      )}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="min-w-[22px] h-[22px] px-1.5 rounded-full grid place-items-center text-[11px] font-extrabold shrink-0 pulse-dot"
                      style={{ background: 'var(--a1)', color: '#fff' }}>{c.unread}</span>
                  )}
                  <button onClick={e => { e.stopPropagation(); setToDelete(c.id); }}
                    className="w-8 h-8 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 max-lg:opacity-60 transition-all hover:scale-110 shrink-0"
                    style={{ background: 'var(--surface2)', color: 'var(--danger)' }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title={t('deleteChat')}>
        <p className="text-sm" style={{ color: 'var(--sub)' }}>{t('deleteConfirm')}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setToDelete(null)} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
          <button onClick={() => { if (toDelete) deleteChat(toDelete); setToDelete(null); }}
            className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>{t('delete')}</button>
        </div>
      </Modal>
    </div>
  );
}
