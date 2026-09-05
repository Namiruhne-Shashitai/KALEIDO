import { useState } from 'react';
import { useApp } from '../store';
import { Icon, KaleidoLogo, inputCls, inputStyle } from '../ui';

export default function Auth() {
  const { t, login, signup, demoLogin } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setBusy(true); setErr(null);
    setTimeout(() => {
      const r = mode === 'login' ? login(email, pass) : signup(name, email, pass);
      if (r) setErr(t(r));
      setBusy(false);
    }, 450);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* left — prism stage */}
      <div className="hidden lg:flex w-[46%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #221531, #14101c 55%, #0d2622)' }}>
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl anim-float"
          style={{ background: 'conic-gradient(from 90deg, var(--a1), var(--a2), var(--a3), var(--a1))' }} />
        <div className="absolute bottom-10 -left-24 w-[380px] h-[380px] rounded-full opacity-15 blur-3xl anim-float"
          style={{ background: 'conic-gradient(from 200deg, var(--a3), var(--a1), var(--a2), var(--a3))', animationDelay: '1.2s' }} />
        <div className="relative flex items-center gap-3 anim-fade-up">
          <KaleidoLogo size={38} />
          <span className="font-display font-extrabold text-3xl tracking-tight">Kaleido</span>
        </div>
        <div className="relative max-w-md">
          <div className="flex gap-2 mb-6 anim-fade-up" style={{ animationDelay: '.1s' }}>
            {['var(--a1)', 'var(--a2)', 'var(--a3)'].map((c, i) => (
              <span key={i} className="h-1.5 w-10 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <h1 className="font-display font-extrabold text-5xl leading-[1.05] tracking-tight anim-fade-up" style={{ animationDelay: '.15s' }}>
            {t('tagline')}
          </h1>
          <p className="mt-5 text-lg leading-relaxed anim-fade-up" style={{ color: 'var(--sub)', animationDelay: '.25s' }}>
            {t('authHero2')}
          </p>
        </div>
        <p className="relative text-sm anim-fade-up" style={{ color: 'var(--sub)', animationDelay: '.35s' }}>{t('authHero1')}</p>
      </div>

      {/* right — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm anim-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <KaleidoLogo size={34} />
            <span className="font-display font-extrabold text-2xl">Kaleido</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl tracking-tight">
            {mode === 'login' ? t('welcomeBack') : t('createAccount')}
          </h2>
          <div className="mt-6 flex flex-col gap-3.5">
            {mode === 'signup' && (
              <input className={inputCls} style={inputStyle} placeholder={t('name')} value={name}
                onChange={e => setName(e.target.value)} />
            )}
            <input className={inputCls} style={inputStyle} placeholder={t('email')} type="email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            <input className={inputCls} style={inputStyle} placeholder={t('password')} type="password" value={pass}
              onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            {err && (
              <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl anim-pop"
                style={{ color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 12%, transparent)' }}>
                <Icon name="alert" size={16} />{err}
              </div>
            )}
            <button onClick={submit} disabled={busy}
              className="mt-1 w-full py-3 rounded-xl font-display font-bold text-[15px] transition-all duration-200 hover:brightness-110 active:scale-[.98] disabled:opacity-60"
              style={{ background: 'var(--a1)', color: '#fff' }}>
              {busy ? '…' : mode === 'login' ? t('login') : t('signup')}
            </button>
            <button onClick={demoLogin}
              className="w-full py-3 rounded-xl font-semibold text-[14px] border transition-all hover:brightness-110 active:scale-[.98]"
              style={{ borderColor: 'var(--line)', color: 'var(--text)', background: 'var(--surface)' }}>
              ✶ {t('tryDemo')}
            </button>
          </div>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(null); }}
            className="mt-6 text-sm font-medium underline underline-offset-4 transition hover:opacity-75"
            style={{ color: 'var(--sub)' }}>
            {mode === 'login' ? t('noAcc') : t('haveAcc')}
          </button>
        </div>
      </div>
    </div>
  );
}
