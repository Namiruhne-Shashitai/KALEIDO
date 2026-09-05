import type { ReactNode } from 'react';
import { useApp } from '../store';
import { Avatar, Icon, KaleidoLogo } from '../ui';
import type { Route } from '../types';

const NAV: { id: Route; icon: string; key: string }[] = [
  { id: 'feed', icon: 'home', key: 'feed' },
  { id: 'chats', icon: 'chat', key: 'chats' },
  { id: 'create', icon: 'plus', key: 'create' },
  { id: 'store', icon: 'bag', key: 'store' },
  { id: 'personas', icon: 'users', key: 'personas' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { user, route, nav, t, logout, updateSettings, mode } = useApp();
  const unreadNotifs = user?.notifs.filter(n => !n.read).length ?? 0;
  const unreadChats = user?.chats.reduce((a, c) => a + c.unread, 0) ?? 0;

  const badge = (id: Route) => (id === 'chats' ? unreadChats : 0);

  return (
    <div className="h-full flex">
      {/* -------- sidebar (desktop) -------- */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r p-4"
        style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--surface) 72%, transparent)' }}>
        <button onClick={() => nav('feed')} className="flex items-center gap-2.5 px-2 py-2 mb-4 group">
          <span className="transition-transform duration-500 group-hover:rotate-[120deg]"><KaleidoLogo size={32} /></span>
          <span className="font-display font-extrabold text-xl tracking-tight">Kaleido</span>
        </button>
        <nav className="flex flex-col gap-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => nav(n.id)}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[14.5px] transition-all duration-200"
              style={route.route === n.id || (n.id === 'chats' && route.route === 'chat')
                ? { background: 'color-mix(in srgb, var(--a1) 16%, transparent)', color: 'var(--text)' }
                : { color: 'var(--sub)' }}>
              <span style={route.route === n.id ? { color: 'var(--a1)' } : undefined}><Icon name={n.icon} size={19} /></span>
              {t(n.key)}
              {badge(n.id) > 0 && (
                <span className="ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--a1)', color: '#fff' }}>{badge(n.id)}</span>
              )}
            </button>
          ))}
          <button onClick={() => nav('settings')}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[14.5px] transition-all duration-200"
            style={route.route === 'settings' ? { background: 'color-mix(in srgb, var(--a1) 16%, transparent)' } : { color: 'var(--sub)' }}>
            <Icon name="gear" size={19} />{t('settings')}
          </button>
          <button onClick={() => nav('notifications')}
            className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[14.5px] transition-all duration-200"
            style={route.route === 'notifications' ? { background: 'color-mix(in srgb, var(--a1) 16%, transparent)' } : { color: 'var(--sub)' }}>
            <Icon name="bell" size={19} />{t('notifications')}
            {unreadNotifs > 0 && (
              <span className="ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--a2)', color: '#1a1206' }}>{unreadNotifs}</span>
            )}
          </button>
        </nav>
        <div className="mt-auto">
          <div className="card p-3 flex items-center gap-3">
            <Avatar src={user?.personas.find(p => p.id === user.activePersonaId)?.avatar} size={38} />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <button onClick={logout} className="text-xs flex items-center gap-1 transition hover:opacity-70" style={{ color: 'var(--sub)' }}>
                <Icon name="logout" size={12} />{t('signOut')}
              </button>
            </div>
            <button onClick={() => updateSettings({ mode: mode === 'dark' ? 'light' : 'dark' })}
              className="w-9 h-9 rounded-full grid place-items-center transition-all hover:scale-110 active:scale-95"
              style={{ background: 'var(--surface2)', color: 'var(--a2)' }} title={t('mode')}>
              <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* -------- main column -------- */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 shrink-0 border-b"
          style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 82%, transparent)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => nav('feed')} className="flex items-center gap-2">
            <KaleidoLogo size={26} />
            <span className="font-display font-extrabold text-lg tracking-tight">Kaleido</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => updateSettings({ mode: mode === 'dark' ? 'light' : 'dark' })}
              className="w-9 h-9 rounded-full grid place-items-center transition active:scale-90"
              style={{ background: 'var(--surface)', color: 'var(--a2)' }}>
              <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <button onClick={() => nav('notifications')} className="relative w-9 h-9 rounded-full grid place-items-center transition active:scale-90"
              style={{ background: 'var(--surface)' }}>
              <Icon name="bell" size={17} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-bold grid place-items-center"
                  style={{ background: 'var(--a2)', color: '#1a1206' }}>{unreadNotifs}</span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 pb-16 lg:pb-0">{children}</main>

        {/* mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t flex items-stretch justify-around px-2 pt-1.5"
          style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)', backdropFilter: 'blur(14px)', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
          {NAV.slice(0, 2).map(n => (
            <MobileTab key={n.id} n={n} active={route.route === n.id || (n.id === 'chats' && route.route === 'chat')} badgeN={badge(n.id)} />
          ))}
          <button onClick={() => nav('create')} className="relative -top-4 self-center w-14 h-14 rounded-2xl grid place-items-center shadow-lg transition-transform active:scale-90"
            style={{ background: 'linear-gradient(135deg, var(--a1), var(--a2))', color: '#fff' }}>
            <Icon name="plus" size={26} />
          </button>
          {NAV.slice(2).map(n => (
            <MobileTab key={n.id} n={n} active={route.route === n.id} badgeN={0} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileTab({ n, active, badgeN }: { n: { id: Route; icon: string; key: string }; active: boolean; badgeN: number }) {
  const { t, nav } = useApp();
  return (
    <button onClick={() => nav(n.id)} className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[58px] transition-all duration-200"
      style={{ color: active ? 'var(--a1)' : 'var(--sub)' }}>
      <Icon name={n.icon} size={21} />
      <span className="text-[10.5px] font-semibold">{t(n.key)}</span>
      {badgeN > 0 && (
        <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold grid place-items-center"
          style={{ background: 'var(--a1)', color: '#fff' }}>{badgeN}</span>
      )}
    </button>
  );
}
