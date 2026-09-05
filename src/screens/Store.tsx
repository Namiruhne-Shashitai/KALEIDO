import { useState } from 'react';
import { useApp } from '../store';
import { EmptyState, Icon, Seg } from '../ui';
import { STORE_ITEMS } from '../seed';

export default function StoreScreen() {
  const { user, t, claimItem, nav } = useApp();
  const [tab, setTab] = useState('store');
  const [pop, setPop] = useState<string | null>(null);

  const claim = (id: string) => {
    claimItem(id);
    setPop(id);
    setTimeout(() => setPop(null), 700);
  };

  const cats: { id: 'boost' | 'gadget' | 'gift'; key: string }[] = [
    { id: 'boost', key: 'boosts' }, { id: 'gadget', key: 'gadgets' }, { id: 'gift', key: 'gifts' },
  ];

  const owned = STORE_ITEMS.map(it => ({ ...it, n: user?.inventory[it.id] ?? 0 })).filter(x => x.n > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-28">
        <div className="anim-fade-up">
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: 'linear-gradient(135deg, var(--a1), var(--a2))', color: '#fff' }}>
              <Icon name="bag" size={18} />
            </span>
            {t('storeTitle')}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--sub)' }}>{t('storeSub')}</p>
        </div>

        <div className="mt-5 max-w-xs anim-fade-up" style={{ animationDelay: '.06s' }}>
          <Seg value={tab} onChange={setTab} options={[{ id: 'store', label: t('store') }, { id: 'inv', label: `${t('inventory')} (${owned.reduce((a, b) => a + b.n, 0)})` }]} />
        </div>

        {tab === 'store' ? (
          <div className="mt-6 flex flex-col gap-7">
            {cats.map((cat, ci) => (
              <section key={cat.id} className="anim-fade-up" style={{ animationDelay: `${ci * 70}ms` }}>
                <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: ['var(--a1)', 'var(--a3)', 'var(--a2)'][ci] }} />
                  {t(cat.key)}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {STORE_ITEMS.filter(i => i.cat === cat.id).map(it => {
                    const n = user?.inventory[it.id] ?? 0;
                    return (
                      <div key={it.id} className="card lift p-4 text-center relative overflow-hidden">
                        <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                          style={{ background: 'color-mix(in srgb, var(--a3) 18%, transparent)', color: 'var(--a3)' }}>
                          {t('free')}
                        </span>
                        <span className={`w-14 h-14 mx-auto rounded-2xl grid place-items-center ${pop === it.id ? 'anim-pop' : ''}`}
                          style={{ background: `hsla(${it.hue},72%,55%,.15)`, color: `hsl(${it.hue},78%,60%)` }}>
                          <Icon name={it.icon} size={26} />
                        </span>
                        <h3 className="font-bold text-[13.5px] mt-2.5 leading-tight">{t(it.id)}</h3>
                        <p className="text-[11.5px] font-bold mt-1" style={{ color: 'var(--sub)' }}>+{it.qty} · {t('owned', { n })}</p>
                        <button onClick={() => claim(it.id)}
                          className={`mt-2.5 w-full py-2 rounded-xl text-[12.5px] font-extrabold transition-all hover:brightness-110 active:scale-90 ${pop === it.id ? 'anim-pop' : ''}`}
                          style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                          {pop === it.id ? `+${it.qty} ✓` : t('claim')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-[13px] mb-4 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
              <Icon name="alert" size={14} style={{ color: 'var(--warn)' }} />{t('invDesc')}
            </p>
            {owned.length === 0 ? (
              <div className="card">
                <EmptyState icon="bag" title={t('emptyInv')} desc={t('storeSub')}
                  action={<button onClick={() => setTab('store')} className="px-5 py-2.5 rounded-full font-bold" style={{ background: 'var(--a1)', color: '#fff' }}>{t('goStore')}</button>} />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {owned.map((it, i) => (
                  <div key={it.id} className="card p-4 text-center relative anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    {it.n < 5 && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full live-dot"
                        style={{ background: 'color-mix(in srgb, var(--warn) 20%, transparent)', color: 'var(--warn)' }}>
                        <Icon name="alert" size={10} />×{it.n}
                      </span>
                    )}
                    <span className="w-14 h-14 mx-auto rounded-2xl grid place-items-center"
                      style={{ background: `hsla(${it.hue},72%,55%,.15)`, color: `hsl(${it.hue},78%,60%)` }}>
                      <Icon name={it.icon} size={26} />
                    </span>
                    <h3 className="font-bold text-[13.5px] mt-2.5 leading-tight">{t(it.id)}</h3>
                    <p className="text-[13px] font-extrabold mt-1" style={{ color: it.n < 5 ? 'var(--warn)' : 'var(--a3)' }}>×{it.n}</p>
                    <button onClick={() => nav('chats')}
                      className="mt-2.5 w-full py-2 rounded-xl text-[12.5px] font-bold transition-all active:scale-95"
                      style={{ background: 'color-mix(in srgb, var(--a1) 16%, transparent)', color: 'var(--a1)' }}>
                      {t('useInChat')} →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
