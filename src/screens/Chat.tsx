import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { Avatar, BondMeter, Icon, Modal, inputCls, inputStyle } from '../ui';
import { STORE_ITEMS } from '../seed';
import { fileToDataUrl } from '../kaleido';
import type { Msg } from '../types';

export default function ChatScreen() {
  const { db, route, user, t, typing, generating, sendMessage, editMessage, deleteMessage, rewindTo, regenerateLast, useItem, nav, clearUnread, updateUser } = useApp();
  const chat = user?.chats.find(c => c.id === route.chatId);
  const char = db.characters.find(c => c.id === chat?.charId);
  const persona = user?.personas.find(p => p.id === chat?.personaId);

  const [text, setText] = useState('');
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'rewind' | 'delete'; id: string } | null>(null);
  const [activeMsg, setActiveMsg] = useState<string | null>(null);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [stick, setStick] = useState(true);
  const [pill, setPill] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const isTyping = !!chat && !!typing[chat.id];
  const isGenerating = !!chat && !!generating[chat.id];

  useEffect(() => { if (chat && chat.unread > 0) clearUnread(chat.id); }, [route.chatId]); // eslint-disable-line
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
  }, [route.chatId]);

  const prevLen = useRef(chat?.messages.length ?? 0);
  useEffect(() => {
    const len = chat?.messages.length ?? 0;
    if (len > prevLen.current && !stick) setPill(p => p + (len - prevLen.current));
    prevLen.current = len;
    if (stick) requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }));
  }, [chat?.messages.length, isTyping, isGenerating]); // eslint-disable-line

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    setStick(near);
    if (near) setPill(0);
  };

  const send = () => {
    if (!chat || !text.trim()) return;
    sendMessage(chat.id, text);
    setText('');
  };

  const onFile = async (f: File | undefined | null) => {
    if (!f || !chat) return;
    const url = await fileToDataUrl(f, 800);
    sendMessage(chat.id, undefined, url);
  };

  const inv = useMemo(() => STORE_ITEMS.map(it => ({ ...it, n: user?.inventory[it.id] ?? 0 })).filter(it => it.n > 0), [user?.inventory]);

  if (!chat || !char || !user) return null;

  return (
    <div className="h-full flex flex-col relative">
      {/* header */}
      <div className="flex items-center gap-3 px-3 lg:px-6 h-16 shrink-0 border-b"
        style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 80%, transparent)', backdropFilter: 'blur(12px)' }}>
        <button onClick={() => nav('chats')} className="lg:hidden w-9 h-9 grid place-items-center rounded-full transition active:scale-90" style={{ background: 'var(--surface)' }}>
          <Icon name="arrowL" size={18} />
        </button>
        <button onClick={() => nav('profile', { charId: char.id })} className="flex items-center gap-3 min-w-0 flex-1 group">
          <Avatar src={char.avatar} size={42} ring={isTyping || isGenerating} />
          <span className="min-w-0 text-left">
            <span className="font-display font-bold text-[15.5px] block truncate group-hover:underline underline-offset-4">{char.name}</span>
            <span className="text-[12px] font-medium block truncate" style={{ color: isTyping ? 'var(--a1)' : 'var(--sub)' }}>
              {isTyping ? t('botTyping') : isGenerating ? t('generatingImage') : `@${char.category} · ${t('st' + char.style[0].toUpperCase() + char.style.slice(1))}`}
            </span>
          </span>
        </button>
        {user.settings.bondEnabled && (
          <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
            <BondMeter bond={chat.bond} />
            <span className="text-[10.5px] font-bold" style={{ color: 'var(--sub)' }}>{t('bondLevel')} {chat.bond}</span>
          </div>
        )}
        <button onClick={() => {
          const idx = user.personas.findIndex(p => p.id === chat.personaId);
          if (user.personas.length < 2) return;
          const next = user.personas[(idx + 1) % user.personas.length];
          updateUser({ chats: user.chats.map(c => c.id === chat.id ? { ...c, personaId: next.id } : c) });
        }} title={t('myPersonas')} className="shrink-0 transition active:scale-90">
          <Avatar src={persona?.avatar} size={32} />
        </button>
        <button onClick={() => nav('profile', { charId: char.id })} className="w-9 h-9 grid place-items-center rounded-full transition active:scale-90 shrink-0" style={{ background: 'var(--surface)' }}>
          <Icon name="dots" size={17} />
        </button>
      </div>

      {/* messages */}
      <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 lg:px-6 py-4 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
          {chat.messages.map(m => (
            <Bubble key={m.id} m={m} charAvatar={char.avatar} charName={char.name}
              t={t} active={activeMsg === m.id}
              onTap={() => setActiveMsg(activeMsg === m.id ? null : m.id)}
              onEdit={() => { setEditing({ id: m.id, text: m.text ?? '' }); setActiveMsg(null); }}
              onDelete={() => { setConfirm({ kind: 'delete', id: m.id }); setActiveMsg(null); }}
              onRewind={() => { setConfirm({ kind: 'rewind', id: m.id }); setActiveMsg(null); }}
              onRegen={() => { regenerateLast(chat.id); setActiveMsg(null); }}
              onImage={setLightbox} isLastBot={m.role === 'bot' && chat.messages[chat.messages.length - 1]?.id === m.id} />
          ))}
          {isTyping && (
            <div className="flex items-end gap-2 anim-fade">
              <Avatar src={char.avatar} size={28} />
              <div className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center" style={{ background: 'var(--surface)' }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          {isGenerating && (
            <div className="flex items-end gap-2 anim-fade">
              <Avatar src={char.avatar} size={28} />
              <div className="rounded-2xl rounded-bl-md p-2.5" style={{ background: 'var(--surface)' }}>
                <div className="skeleton w-44 h-44 rounded-xl grid place-items-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full kaleido-ring p-[3px] anim-spin-slow" style={{ animationDuration: '2s' }}>
                      <div className="w-full h-full rounded-full" style={{ background: 'var(--surface)' }} />
                    </div>
                    <span className="text-[11.5px] font-bold" style={{ color: 'var(--sub)' }}>{t('generatingImage')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* new replies pill */}
      {pill > 0 && (
        <button onClick={() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); setPill(0); }}
          className="absolute left-1/2 -translate-x-1/2 bottom-40 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] shadow-xl anim-pop"
          style={{ background: 'var(--a1)', color: '#fff' }}>
          <Icon name="chevD" size={15} />{t('newMsgs')} ({pill})
        </button>
      )}

      {/* composer */}
      <div className="shrink-0 px-3 lg:px-6 pb-1.5 pt-1" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <div className="flex gap-1">
            <button onClick={() => setAttachOpen(true)} className="w-10 h-10 grid place-items-center rounded-full transition-all hover:scale-105 active:scale-90 shrink-0" style={{ background: 'var(--surface)', color: 'var(--a3)' }}>
              <Icon name="image" size={19} />
            </button>
            <button onClick={() => setItemsOpen(true)} className="relative w-10 h-10 grid place-items-center rounded-full transition-all hover:scale-105 active:scale-90 shrink-0" style={{ background: 'var(--surface)', color: 'var(--a2)' }}>
              <Icon name="gift" size={19} />
              {inv.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full text-[9px] font-bold grid place-items-center" style={{ background: 'var(--a2)', color: '#1a1206' }}>{inv.reduce((a, b) => a + b.n, 0)}</span>}
            </button>
          </div>
          <textarea rows={1} value={text} placeholder={t('typeMsg')}
            onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="flex-1 resize-none rounded-3xl px-4 py-2.5 text-[15px] outline-none transition focus:ring-2 focus:ring-[var(--a1)]/50 max-h-[120px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
          <button onClick={send} disabled={!text.trim()}
            className="w-11 h-11 grid place-items-center rounded-full transition-all hover:scale-105 active:scale-90 disabled:opacity-35 shrink-0"
            style={{ background: 'var(--a1)', color: '#fff' }}>
            <Icon name="send" size={19} />
          </button>
        </div>
        {/* disclaimer */}
        <p className="max-w-3xl mx-auto text-center text-[10px] leading-snug mt-1.5 mb-1 px-4" style={{ color: 'var(--sub)', opacity: 0.8 }}>
          {t('disclaimer')}
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { onFile(e.target.files?.[0]); e.target.value = ''; }} />

      {/* attach sheet */}
      <Modal open={attachOpen} onClose={() => setAttachOpen(false)} title={t('photo')} sheet>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setAttachOpen(false); fileRef.current?.click(); }} className="card lift p-5 flex flex-col items-center gap-2.5">
            <Icon name="image" size={30} style={{ color: 'var(--a3)' }} />
            <span className="font-bold text-sm">{t('fromGallery')}</span>
          </button>
          <button onClick={() => { setAttachOpen(false); camRef.current?.click(); }} className="card lift p-5 flex flex-col items-center gap-2.5">
            <Icon name="camera" size={30} style={{ color: 'var(--a1)' }} />
            <span className="font-bold text-sm">{t('takePhoto')}</span>
          </button>
        </div>
        <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}><Icon name="sparkles" size={13} />{t('askToDraw')}</p>
      </Modal>

      {/* items sheet */}
      <Modal open={itemsOpen} onClose={() => setItemsOpen(false)} title={t('items')} sheet>
        {inv.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--sub)' }}>{t('noItems')}</p>
            <button onClick={() => { setItemsOpen(false); nav('store'); }} className="mt-4 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'var(--a1)', color: '#fff' }}>{t('goStore')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {inv.map(it => (
              <div key={it.id} className="card p-3 text-center relative">
                {it.n < 5 && (
                  <span className="absolute top-2 right-2 w-5 h-5 grid place-items-center rounded-full" style={{ background: 'color-mix(in srgb, var(--warn) 20%, transparent)', color: 'var(--warn)' }}>
                    <Icon name="alert" size={11} />
                  </span>
                )}
                <span className="w-11 h-11 mx-auto rounded-xl grid place-items-center" style={{ background: `hsla(${it.hue},70%,55%,.16)`, color: `hsl(${it.hue},75%,60%)` }}>
                  <Icon name={it.icon} size={22} />
                </span>
                <p className="text-[12.5px] font-bold mt-1.5 leading-tight">{t(it.id)}</p>
                <p className="text-[11px] font-bold mt-0.5" style={{ color: it.n < 5 ? 'var(--warn)' : 'var(--sub)' }}>×{it.n}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => { useItem(chat.id, it.id, false); setItemsOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95" style={{ background: 'var(--surface2)' }}>{t('useInChat')}</button>
                  <button onClick={() => { useItem(chat.id, it.id, true); setItemsOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95" style={{ background: 'var(--a1)', color: '#fff' }}>{t('giftIt')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t('editMsg')}>
        <textarea rows={4} value={editing?.text ?? ''} onChange={e => setEditing(s => s ? { ...s, text: e.target.value } : s)}
          className={inputCls + ' resize-none'} style={inputStyle} />
        <div className="flex gap-2 mt-4">
          <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
          <button onClick={() => { if (editing) { editMessage(chat.id, editing.id, editing.text); setEditing(null); } }}
            className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--a1)', color: '#fff' }}>{t('saveChanges')}</button>
        </div>
      </Modal>

      {/* confirm modal */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.kind === 'rewind' ? t('rewindMsg') : t('deleteMsg')}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--sub)' }}>
          {confirm?.kind === 'rewind' ? t('rewindConfirm') : t('deleteConfirm')}
        </p>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
          <button onClick={() => {
            if (!confirm) return;
            if (confirm.kind === 'rewind') rewindTo(chat.id, confirm.id); else deleteMessage(chat.id, confirm.id);
            setConfirm(null);
          }} className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>{t('confirm')}</button>
        </div>
      </Modal>

      {/* lightbox */}
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title={t('imageReady')} wide>
        {lightbox && (
          <div className="flex flex-col items-center gap-3">
            <img src={lightbox} alt="" className="rounded-2xl max-h-[60dvh] w-auto" />
            <a href={lightbox} download={`kaleido-${Date.now()}.jpg`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition active:scale-95"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              <Icon name="download" size={16} />{t('download')}
            </a>
          </div>
        )}
      </Modal>

    </div>
  );
}

/* ================= bubble ================= */
function Bubble({ m, charAvatar, charName, t, active, onTap, onEdit, onDelete, onRewind, onRegen, onImage, isLastBot }: {
  m: Msg; charAvatar: string; charName: string;
  t: (k: string, v?: Record<string, string | number>) => string;
  active: boolean; onTap: () => void; onEdit: () => void; onDelete: () => void; onRewind: () => void; onRegen: () => void;
  onImage: (src: string) => void; isLastBot: boolean;
}) {
  const isUser = m.role === 'user';
  const item = m.itemId ? STORE_ITEMS.find(i => i.id === m.itemId) : undefined;
  const [burst, setBurst] = useState(!!m.itemId);
  useEffect(() => {
    if (!m.itemId) return;
    const to = setTimeout(() => setBurst(false), 1300);
    return () => clearTimeout(to);
  }, []); // eslint-disable-line

  return (
    <div className={`flex items-end gap-2 group ${isUser ? 'flex-row-reverse' : ''} anim-fade-up`} onClick={onTap}>
      {!isUser && <Avatar src={charAvatar} size={28} className="mb-0.5" />}
      <div className={`relative max-w-[82%] sm:max-w-[70%] ${isUser ? 'items-end' : ''}`}>
        {/* item bubble */}
        {item && (
          <div className="relative rounded-2xl rounded-br-md px-4 py-3 flex items-center gap-3 border"
            style={{ background: `hsla(${item.hue},70%,55%,.12)`, borderColor: `hsla(${item.hue},70%,55%,.35)` }}>
            {burst && <ItemBurst hue={item.hue} icon={item.icon} />}
            <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: `hsla(${item.hue},70%,55%,.2)`, color: `hsl(${item.hue},80%,62%)` }}>
              <Icon name={item.icon} size={20} />
            </span>
            <span>
              <span className="block text-[13px] font-bold">{m.gift ? t('giftedItem', { item: t(item.id), name: charName }) : t('usedItem', { item: t(item.id) })}</span>
              <span className="block text-[11px] font-semibold" style={{ color: 'var(--sub)' }}>{m.gift ? `+12 ${t('bondLevel')}` : `+6 ${t('bondLevel')}`}</span>
            </span>
          </div>
        )}
        {/* normal bubble */}
        {!item && (
          <div className="rounded-2xl px-4 py-2.5"
            style={isUser
              ? { background: 'var(--a1)', color: '#fff', borderBottomRightRadius: 6 }
              : { background: 'var(--surface)', borderBottomLeftRadius: 6 }}>
            {m.image && (
              <button onClick={e => { e.stopPropagation(); onImage(m.image!); }} className="block mb-1.5 overflow-hidden rounded-xl">
                <img src={m.image} alt="" className="max-h-64 w-auto object-cover transition-transform duration-500 hover:scale-[1.03]" draggable={false} />
              </button>
            )}
            {m.text && <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>}
            {m.prompt && !m.text && <p className="text-[13px] italic opacity-80">✶ {m.prompt}</p>}
            <span className="flex items-center justify-end gap-1.5 mt-0.5">
              {m.edited && <span className="text-[10px] opacity-60">{t('edited')}</span>}
              <span className="text-[10px] opacity-55">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        )}
        {/* actions */}
        {active && (
          <div className={`absolute -top-9 z-20 flex gap-0.5 p-1 rounded-full border anim-pop shadow-lg ${isUser ? 'right-0' : 'left-0'}`}
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }} onClick={e => e.stopPropagation()}>
            {m.text && <Act icon="pencil" label={t('editMsg')} fn={onEdit} />}
            {isUser && <Act icon="rewind" label={t('rewindMsg')} fn={onRewind} />}
            {isLastBot && !isUser && <Act icon="refresh" label={t('regenerate')} fn={onRegen} />}
            <Act icon="trash" label={t('deleteMsg')} fn={onDelete} danger />
          </div>
        )}
      </div>
    </div>
  );
}

function Act({ icon, label, fn, danger }: { icon: string; label: string; fn: () => void; danger?: boolean }) {
  return (
    <button onClick={fn} title={label} className="w-8 h-8 grid place-items-center rounded-full transition-all hover:scale-110 active:scale-90"
      style={{ color: danger ? 'var(--danger)' : 'var(--text)', background: 'var(--surface2)' }}>
      <Icon name={icon} size={14} />
    </button>
  );
}

function ItemBurst({ hue, icon }: { hue: number; icon: string }) {
  return (
    <span className="absolute inset-0 grid place-items-center pointer-events-none z-10">
      <span className="burst-anim w-16 h-16 rounded-2xl grid place-items-center"
        style={{ background: `hsla(${hue},80%,60%,.9)`, color: '#fff', boxShadow: `0 0 40px hsla(${hue},80%,60%,.7)` }}>
        <Icon name={icon} size={30} />
      </span>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="confetti-bit absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${hue + i * 22},80%,62%)`,
            ['--cx' as string]: `${Math.cos(i / 10 * Math.PI * 2) * 70}px`,
            ['--cy' as string]: `${Math.sin(i / 10 * Math.PI * 2) * 70}px`,
            animationDelay: `${i * 0.02}s`,
          }} />
      ))}
    </span>
  );
}
