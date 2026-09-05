import { useApp } from '../store';
import { EmptyState, Icon, timeAgo } from '../ui';

const ICONS: Record<string, string> = { proactive: 'chat', image: 'sparkles', gift: 'gift', system: 'bell' };
const COLORS: Record<string, string> = { proactive: 'var(--a1)', image: 'var(--a3)', gift: 'var(--a2)', system: 'var(--sub)' };

export default function Notifications() {
  const { user, t, markAllRead, openNotif } = useApp();
  const notifs = user?.notifs ?? [];
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 pb-24">
        <div className="flex items-center justify-between gap-3 anim-fade-up">
          <div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight">{t('notifications')}</h1>
            {unread > 0 && <p className="text-sm mt-0.5 font-semibold" style={{ color: 'var(--a1)' }}>{unread} ●</p>}
          </div>
          <button onClick={markAllRead} disabled={unread === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <Icon name="check" size={15} />{t('markAll')}
          </button>
        </div>

        {notifs.length === 0 ? (
          <div className="mt-8 card">
            <EmptyState icon="bell" title={t('noNotifs')} />
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {notifs.map((n, i) => (
              <button key={n.id} onClick={() => openNotif(n.id)}
                className="card p-3.5 flex items-start gap-3 text-left transition-all hover:brightness-110 anim-slide-r"
                style={{ animationDelay: `${Math.min(i * 35, 300)}ms`, borderColor: n.read ? 'var(--line)' : 'color-mix(in srgb, var(--a1) 40%, var(--line))' }}>
                <span className="w-10 h-10 rounded-full grid place-items-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${COLORS[n.type]} 16%, transparent)`, color: COLORS[n.type] }}>
                  <Icon name={ICONS[n.type] ?? 'bell'} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold leading-snug" style={{ color: n.read ? 'var(--sub)' : 'var(--text)' }}>
                    {n.type === 'system' && n.text === 'welcomeNotif' ? t('welcomeNotif') : n.text}
                  </span>
                  <span className="block text-[12px] mt-0.5" style={{ color: 'var(--sub)' }}>{timeAgo(n.ts, t)}</span>
                </span>
                {!n.read && <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 pulse-dot" style={{ background: 'var(--a1)' }} />}
                {n.chatId && <Icon name="chevR" size={16} className="mt-1.5 shrink-0" style={{ color: 'var(--sub)' }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
