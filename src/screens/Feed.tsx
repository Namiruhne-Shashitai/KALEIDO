import { useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { Icon, Modal, Seg } from '../ui';
import type { Category, Character } from '../types';

const CATS: Category[] = ['roleplay', 'romance', 'fantasy', 'history', 'art', 'scifi', 'slice', 'drama'];

export default function Feed() {
  const { chars, user, t, startChat, nav, refreshFeed, refreshing } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState('trending');
  const [filterOpen, setFilterOpen] = useState(false);
  const [pull, setPull] = useState(0);
  const drag = useRef<{ y: number; on: boolean }>({ y: 0, on: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const persona = user?.personas.find(p => p.id === user.activePersonaId);

  const list = useMemo(() => {
    let l = chars.filter(c =>
      (cat === 'all' || c.category === cat) &&
      (!q.trim() || (c.name + ' ' + c.tagline).toLowerCase().includes(q.toLowerCase())),
    );
    if (sort === 'new') l = [...l].sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === 'az') l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'chats') l = [...l].sort((a, b) => b.chats - a.chats);
    else l = [...l].sort((a, b) => (b.likes * 2 + b.chats) - (a.likes * 2 + a.chats));
    return l;
  }, [chars, q, cat, sort]);

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

  /* ---- pull to refresh ---- */
  const onDown = (e: React.PointerEvent) => {
    if ((scrollRef.current?.scrollTop ?? 1) <= 0) { drag.current = { y: e.clientY, on: true }; }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.on || refreshing) return;
    if ((scrollRef.current?.scrollTop ?? 1) > 4) { setPull(0); return; }
    const dy = e.clientY - drag.current.y;
    if (dy > 0) setPull(Math.min(130, dy * 0.45));
  };
  const onUp = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    if (pull > 62) { refreshFeed(); }
    setPull(0);
  };

  const pullState = refreshing ? 'refreshing' : pull > 62 ? 'release' : pull > 8 ? 'pull' : 'idle';

  return (
    <div ref={scrollRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-24">
        {/* pull indicator */}
        <div className="flex flex-col items-center justify-end overflow-hidden" style={{ height: refreshing ? 64 : Math.min(64, pull * 0.55), transition: drag.current.on ? 'none' : 'height .3s cubic-bezier(.2,.8,.3,1)' }}>
          <div className="flex items-center gap-3 py-3">
            <div className="pull-spinner" style={{ transform: `rotate(${pull * 2.4}deg)` }}>
              <div className="w-8 h-8 rounded-full kaleido-ring p-[3px]"><div className="w-full h-full rounded-full" style={{ background: 'var(--bg)' }} /></div>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--sub)' }}>
              {t(pullState === 'refreshing' ? 'refreshing' : pullState === 'release' ? 'releaseHint' : 'pullHint')}
            </span>
          </div>
        </div>

        {/* header */}
        <div className="flex items-end justify-between gap-4 pt-2">
          <div>
            <h1 className="font-display font-extrabold text-[28px] lg:text-4xl tracking-tight anim-fade-up">
              {t('helloUser', { name: persona?.name ?? user?.name ?? 'Kaleido' })}
            </h1>
            <p className="mt-1 font-medium anim-fade-up" style={{ color: 'var(--sub)', animationDelay: '.06s' }}>{t('feedSub')}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full shrink-0"
            style={{ background: 'color-mix(in srgb, var(--a3) 15%, transparent)', color: 'var(--a3)' }}>
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--a3)' }} />{t('liveFeed')}
          </div>
        </div>

        {/* controls */}
        <div className="mt-5 flex gap-2.5 anim-fade-up" style={{ animationDelay: '.1s' }}>
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--sub)' }}><Icon name="search" size={17} /></span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchPh')}
              className="w-full rounded-full pl-10 pr-4 py-2.5 text-[14.5px] outline-none transition focus:ring-2 focus:ring-[var(--a1)]/50"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
          </div>
          <button onClick={() => setFilterOpen(true)}
            className="w-11 h-11 grid place-items-center rounded-full border transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{ background: (cat !== 'all' || sort !== 'trending') ? 'var(--a1)' : 'var(--surface)', borderColor: 'var(--line)', color: (cat !== 'all' || sort !== 'trending') ? '#fff' : 'var(--text)' }}>
            <Icon name="filter" size={18} />
          </button>
        </div>

        {/* category chips */}
        <div className="mt-3.5 flex gap-2 overflow-x-auto no-scrollbar pb-1 anim-fade-up" style={{ animationDelay: '.14s' }}>
          {(['all', ...CATS] as const).map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95"
              style={cat === c
                ? { background: 'var(--text)', color: 'var(--bg)' }
                : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--sub)' }}>
              {c === 'all' ? t('all') : t(c)}
            </button>
          ))}
        </div>

        <div className="mt-4 mb-3 text-[12.5px] font-semibold flex items-center gap-2" style={{ color: 'var(--sub)' }}>
          <Icon name="grid" size={14} />{t('charsCount', { n: list.length })}
        </div>

        {/* grid */}
        {refreshing ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton w-16 h-16 rounded-full mx-auto" />
                <div className="skeleton h-4 w-2/3 rounded-lg mx-auto mt-3" />
                <div className="skeleton h-3 w-full rounded-lg mt-2.5" />
                <div className="skeleton h-3 w-4/5 rounded-lg mt-1.5" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="card py-6">
            <div className="flex flex-col items-center text-center px-6">
              <Icon name="search" size={30} className="mb-3" style={{ color: 'var(--sub)' }} />
              <p className="font-display font-bold text-lg">{t('noResults')}</p>
              <button onClick={() => { setQ(''); setCat('all'); setSort('trending'); }}
                className="mt-4 px-4 py-2 rounded-full text-sm font-bold transition active:scale-95"
                style={{ background: 'var(--a1)', color: '#fff' }}>{t('clearFilters')}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {list.map((c, i) => (
              <CharCard key={c.id} c={c} i={i} fmt={fmt}
                mine={user?.id === c.ownerId}
                onOpen={() => startChat(c.id)}
                onEdit={() => nav('create', { editCharId: c.id })}
                onProfile={() => nav('profile', { charId: c.id })} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* filter modal */}
      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title={t('filters')} sheet>
        <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('category')}</p>
        <div className="flex flex-wrap gap-2">
          {(['all', ...CATS] as const).map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all"
              style={cat === c ? { background: 'var(--a1)', color: '#fff' } : { background: 'var(--surface2)', color: 'var(--sub)' }}>
              {c === 'all' ? t('all') : t(c)}
            </button>
          ))}
        </div>
        <p className="text-[13px] font-semibold mt-5 mb-2" style={{ color: 'var(--sub)' }}>{t('sort')}</p>
        <Seg value={sort} onChange={setSort} options={[
          { id: 'trending', label: t('sortTrending') }, { id: 'new', label: t('sortNew') },
          { id: 'chats', label: t('sortChats') }, { id: 'az', label: t('sortAZ') },
        ]} />
        <button onClick={() => setFilterOpen(false)} className="mt-5 w-full py-2.5 rounded-xl font-bold transition active:scale-[.98]"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}>{t('close')}</button>
      </Modal>
    </div>
  );
}

function CharCard({ c, i, fmt, mine, onOpen, onEdit, onProfile, t }: {
  c: Character; i: number; fmt: (n: number) => string; mine: boolean;
  onOpen: () => void; onEdit: () => void; onProfile: () => void;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const fresh = c.fresh && Date.now() - c.createdAt < 1000 * 60 * 60 * 5;
  return (
    <div className="card lift relative p-4 cursor-pointer anim-fade-up group" style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
      onClick={onProfile}>
      {fresh && (
        <span className="absolute top-3 left-3 text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full pulse-dot"
          style={{ background: 'var(--a3)', color: '#06231d' }}>{t('newTag')}</span>
      )}
      {c.visibility === 'private' && (
        <span className="absolute top-3 right-3 w-6 h-6 grid place-items-center rounded-full"
          style={{ background: 'var(--surface2)', color: 'var(--sub)' }}><Icon name="lock" size={12} /></span>
      )}
      <div className="flex justify-center">
        <div className="rounded-full overflow-hidden w-20 h-20 transition-transform duration-700 group-hover:rotate-[100deg]"
          style={{ border: '2.5px solid var(--line)' }}>
          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" draggable={false} />
        </div>
      </div>
      <h3 className="font-display font-bold text-[15.5px] mt-3 text-center truncate">{c.name}</h3>
      <p className="text-[12.5px] leading-snug mt-1 text-center line-clamp-2 min-h-[32px]" style={{ color: 'var(--sub)' }}>{c.tagline}</p>
      <div className="mt-2.5 flex items-center justify-center gap-1">
        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--a2)' }}>
          {t(c.category)}
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-3 text-[11.5px] font-semibold" style={{ color: 'var(--sub)' }}>
        <span className="flex items-center gap-1"><Icon name="chat" size={12} />{fmt(c.chats)}</span>
        <span className="flex items-center gap-1"><Icon name="heart" size={12} />{fmt(c.likes)}</span>
      </div>
      {mine && (
        <div className="mt-2.5 flex gap-1.5">
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="flex-1 py-1.5 rounded-lg text-[12px] font-bold transition hover:brightness-110 active:scale-95"
            style={{ background: 'var(--surface2)' }}>{t('editMsg')}</button>
          <button onClick={e => { e.stopPropagation(); onOpen(); }}
            className="flex-1 py-1.5 rounded-lg text-[12px] font-bold transition hover:brightness-110 active:scale-95"
            style={{ background: 'var(--a1)', color: '#fff' }}>{t('startChat')}</button>
        </div>
      )}
      {!mine && (
        <button onClick={e => { e.stopPropagation(); onOpen(); }}
          className="mt-2.5 w-full py-1.5 rounded-lg text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-all active:scale-95 max-lg:opacity-100"
          style={{ background: 'color-mix(in srgb, var(--a1) 18%, transparent)', color: 'var(--a1)' }}>
          {t('startChat')}
        </button>
      )}
    </div>
  );
}
