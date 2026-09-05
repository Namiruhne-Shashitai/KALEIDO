import type { CSSProperties, ReactNode } from 'react';
import { useApp } from './store';

/* ---------------- icons ---------------- */
const PATHS: Record<string, ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /><path d="M9.5 21v-6h5v6" /></>,
  chat: <path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.3c-1.5 0-3-.4-4.2-1.1L3 20l1.2-5A8.3 8.3 0 1 1 21 11.6Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bag: <><path d="M6 8h12l-1.2 13H7.2L6 8Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>,
  users: <><circle cx="9.5" cy="7.5" r="3.5" /><path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><path d="M15.5 4.2a3.5 3.5 0 0 1 0 6.6M21 21v-1a3.5 3.5 0 0 0-2.5-3.4" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" /></>,
  bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19.5a2.2 2.2 0 0 0 4 0" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.5-4.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M19.5 4.5l-1.8 1.8M6.3 17.7l-1.8 1.8" /></>,
  moon: <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5Z" />,
  heart: <path d="M12 20.5C7.2 16.4 3.5 13.2 3.5 9.2 3.5 6.5 5.6 4.5 8.1 4.5c1.6 0 3 .8 3.9 2.2.9-1.4 2.3-2.2 3.9-2.2 2.5 0 4.6 2 4.6 4.7 0 4-3.7 7.2-8.5 11.3Z" />,
  heartFill: <path fill="currentColor" stroke="none" d="M12 20.5C7.2 16.4 3.5 13.2 3.5 9.2 3.5 6.5 5.6 4.5 8.1 4.5c1.6 0 3 .8 3.9 2.2.9-1.4 2.3-2.2 3.9-2.2 2.5 0 4.6 2 4.6 4.7 0 4-3.7 7.2-8.5 11.3Z" />,
  sparkles: <><path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8L12 3Z" /><path d="M19 15l.9 2.4L22.3 18.3l-2.4.9L19 21.6l-.9-2.4-2.4-.9 2.4-.9L19 15Z" /></>,
  send: <path d="m3.5 11.2 17-7.7-7.7 17-2.3-7-7-2.3Z" />,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 4.8-4.8 3 3L16 13l4.5 4.5" /></>,
  camera: <><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.4" /></>,
  gift: <><rect x="4" y="9" width="16" height="4" rx="1" /><path d="M6 13v7h12v-7M12 9v11M12 9s-4.5.3-5.5-2C5.8 5.3 7.5 4 8.8 4.5 11 5.3 12 9 12 9Zm0 0s4.5.3 5.5-2c.7-1.7-1-3-2.3-2.5C13 5.3 12 9 12 9Z" /></>,
  pencil: <path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1ZM14.5 6.5l3 3" />,
  trash: <><path d="M5 7h14M10 4h4M6.5 7l1 13h9l1-13" /><path d="M10 11v5.5M14 11v5.5" /></>,
  rewind: <path d="M11 18.5 4.5 12 11 5.5v13Zm8.5 0L13 12l6.5-6.5v13Z" />,
  refresh: <><path d="M20 12a8 8 0 1 1-2.4-5.7" /><path d="M20 3.5V8h-4.5" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  chevL: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevR: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevD: <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  download: <><path d="M12 3.5V15m0 0 4-4m-4 4-4-4" /><path d="M4.5 20.5h15" /></>,
  filter: <path d="M4 5h16l-6.2 7.2V17l-3.6 2v-6.8L4 5Z" />,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.7 2.6 4 5.3 4 8.5s-1.3 5.9-4 8.5c-2.7-2.6-4-5.3-4-8.5s1.3-5.9 4-8.5Z" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 1.5-1.9-.6-1.1-.4-2.1 1-2.1h2A4.5 4.5 0 0 0 21 12.5C21 7 17 3 12 3Z" /><circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  logout: <><path d="M9.5 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5" /><path d="m16 16.5 4.5-4.5L16 7.5M20 12H9.5" /></>,
  bolt: <path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12l1-7.5Z" />,
  coffee: <><path d="M4.5 9h11v6.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V9Z" /><path d="M15.5 10h1.5a2.5 2.5 0 0 1 0 5h-1.5M7 5.5c0-1 .8-1 .8-2M11 5.5c0-1 .8-1 .8-2" /></>,
  rose: <><circle cx="12" cy="8" r="4.5" /><circle cx="12" cy="8" r="1.6" /><path d="M12 12.5V21m0-4.5c0-2 2-3 4-3m-4 1c0-1.6-1.8-2.5-3.5-2.5" /></>,
  letter: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /></>,
  gem: <><path d="M7 3.5h10l4 5.5-9 11.5L3 9l4-5.5Z" /><path d="M3 9h18M12 20.5 8.5 9 12 3.5 15.5 9 12 20.5Z" /></>,
  choco: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M4 12h16M12 4v16" /></>,
  music: <><path d="M9 18.5V6l11-2.5V16" /><circle cx="6.5" cy="18.5" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>,
  alert: <><path d="M12 3.5 22 20H2L12 3.5Z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.2" r="0.5" fill="currentColor" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.5l3.5 2" /></>,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />,
  arrowL: <><path d="M19.5 12h-15" /><path d="m10.5 6-6 6 6 6" /></>,
  dots: <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
  wand: <><path d="m4 20 10.5-10.5" /><path d="m13 8.5 2.5 2.5M15.5 4v2.5M20 8.5h-2.5M19 3.5l-1.5 1.5M21.5 6 20 7.5" /></>,
  crop: <><path d="M6.5 2.5v13a2 2 0 0 0 2 2h13" /><path d="M2.5 6.5h13a2 2 0 0 1 2 2v13" /></>,
  sort: <path d="M7 3.5v17m0 0-3-3m3 3 3-3M17 20.5v-17m0 0-3 3m3-3 3 3" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3.5 12.5 8.5 4.7 8.5-4.7M3.5 16.5 12 21l8.5-4.5" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
};

export function Icon({ name, size = 20, className = '', style }: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      {PATHS[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ---------------- primitives ---------------- */
export function Avatar({ src, size = 40, className = '', ring }: { src?: string; size?: number; className?: string; ring?: boolean }) {
  return (
    <div className={`relative shrink-0 rounded-full overflow-hidden ${ring ? 'p-[2.5px] kaleido-ring' : ''} ${className}`}
      style={{ width: size, height: size, background: 'var(--surface2)' }}>
      <div className="w-full h-full rounded-full overflow-hidden">
        {src ? <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
          : <div className="w-full h-full grid place-items-center" style={{ color: 'var(--sub)' }}><Icon name="users" size={size * 0.5} /></div>}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!on)} aria-pressed={on}
      className="relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-40"
      style={{ background: on ? 'var(--a1)' : 'var(--line)' }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: on ? 26 : 4 }} />
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide, sheet }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean; sheet?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 anim-fade" style={{ background: 'rgba(8,5,14,.66)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div className={`relative anim-pop w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} ${sheet ? '' : 'sm:mx-4'} max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border overflow-hidden`}
        style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        {title !== undefined && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full transition hover:opacity-70"
              style={{ background: 'var(--surface2)' }}><Icon name="x" size={17} /></button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-5 pt-2 grow">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold mb-1.5 block" style={{ color: 'var(--sub)' }}>{label}</span>
      {children}
      {hint && <span className="text-xs mt-1 block" style={{ color: 'var(--sub)' }}>{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl px-3.5 py-2.5 text-[15px] outline-none transition focus:ring-2 focus:ring-[var(--a1)]/50';
export const inputStyle: CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--text)' };

export function Seg({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--surface2)' }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className="flex-1 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200"
          style={value === o.id ? { background: 'var(--a1)', color: '#fff' } : { color: 'var(--sub)' }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 anim-fade-up">
      <div className="w-20 h-20 rounded-3xl grid place-items-center mb-4 anim-float"
        style={{ background: 'var(--surface2)', color: 'var(--a1)' }}>
        <Icon name={icon} size={34} />
      </div>
      <h3 className="font-display font-bold text-xl">{title}</h3>
      {desc && <p className="mt-1.5 text-sm max-w-xs" style={{ color: 'var(--sub)' }}>{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function BondMeter({ bond, size = 'md' }: { bond: number; size?: 'sm' | 'md' }) {
  const level = Math.min(5, Math.floor(bond / 25));
  const s = size === 'sm' ? 12 : 15;
  return (
    <div className="flex items-center gap-0.5" title={`${bond}`}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ color: i < level ? 'var(--a1)' : 'var(--line)' }}>
          <Icon name={i < level ? 'heartFill' : 'heart'} size={s} />
        </span>
      ))}
    </div>
  );
}

export function KaleidoLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" stroke="var(--a3)" strokeWidth="2" opacity=".5" />
      <path d="M24 6 40 33H8L24 6Z" stroke="var(--a1)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 14 33 30H15L24 14Z" fill="var(--a2)" opacity=".85" />
      <circle cx="24" cy="26" r="3.4" fill="var(--text)" />
    </svg>
  );
}

export function ToastHost() {
  const { toasts } = useApp();
  const colors: Record<string, string> = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)', info: 'var(--a3)' };
  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 items-center pointer-events-none w-[92%] max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className="anim-toast px-4 py-2.5 rounded-2xl border text-sm font-medium shadow-xl flex items-center gap-2.5 w-full"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--text)' }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[t.kind] }} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <div className="rounded-full kaleido-ring" style={{ width: size, height: size, padding: 3 }}>
      <div className="w-full h-full rounded-full" style={{ background: 'var(--surface)' }} />
    </div>
  );
}

export function timeAgo(ts: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return t('ago_now');
  if (m < 60) return t('ago_m', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('ago_h', { n: h });
  return t('ago_d', { n: Math.floor(h / 24) });
}
