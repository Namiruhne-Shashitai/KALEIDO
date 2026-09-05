import { useEffect, useRef, useState } from 'react';
import { useApp, uid } from '../store';
import { Field, Icon, Modal, Seg, Toggle, inputCls, inputStyle } from '../ui';
import { GRADIENT_PRESETS, PRESETS, extractPaletteFromImage, fileToDataUrl, gradientCss, makeIconDataUrl } from '../kaleido';
import { LANGS } from '../i18n';
import type { Palette, SavedTheme, Style } from '../types';

const INTERESTS = ['in_anime', 'in_gaming', 'in_music', 'in_art', 'in_travel', 'in_books', 'in_fitness', 'in_cooking', 'in_fashion', 'in_tech', 'in_nature', 'in_film'];
const STYLES: Style[] = ['casual', 'poetic', 'chaotic', 'shy', 'direct'];
const base: Pick<SavedTheme, 'cropX' | 'cropY' | 'blur' | 'opacity'> = { cropX: 50, cropY: 50, blur: 0, opacity: 0.5 };

export default function SettingsScreen() {
  const { user, t, mode, updateSettings, updateUser, setInterests, applyTheme, deleteTheme, resetTheme, saveTheme, logout, applyIcon, nav } = useApp();
  const [bgImg, setBgImg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const bgFile = useRef<HTMLInputElement>(null);
  const iconFile = useRef<HTMLInputElement>(null);
  const [iconImg, setIconImg] = useState<string | undefined>(user?.iconImg);
  const [iconLogo, setIconLogo] = useState(user?.iconLogo ?? true);
  const [iconPreview, setIconPreview] = useState('');

  useEffect(() => { setIconImg(user?.iconImg); setIconLogo(user?.iconLogo ?? true); }, [user?.id]); // eslint-disable-line
  useEffect(() => {
    let alive = true;
    makeIconDataUrl({ img: iconImg, logo: iconLogo }).then(u => { if (alive) setIconPreview(u); });
    return () => { alive = false; };
  }, [iconImg, iconLogo]);

  if (!user) return null;
  const active = user.activeThemeId;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 pb-32 flex flex-col gap-5">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight anim-fade-up">{t('settings')}</h1>

        {/* ---------- profile ---------- */}
        <Section icon="users" title={t('profileSec')} delay={0}>
          <Field label={t('name')}>
            <input className={inputCls} style={inputStyle} defaultValue={user.name} key={user.id + user.name}
              onBlur={e => e.target.value.trim() && updateUser({ name: e.target.value.trim() })} />
          </Field>
          <div className="mt-4">
            <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
              <Icon name="sparkles" size={14} />{t('interests')}
            </p>
            <p className="text-xs mt-0.5 mb-2.5" style={{ color: 'var(--sub)' }}>{t('interestsHint')}</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => {
                const on = user.interests.includes(i);
                const full = user.interests.length >= 3 && !on;
                return (
                  <button key={i} disabled={full}
                    onClick={() => setInterests(on ? user.interests.filter(x => x !== i) : [...user.interests, i])}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-90 ${full ? 'opacity-35' : ''}`}
                    style={on ? { background: 'var(--a1)', color: '#fff' } : { background: 'var(--surface2)', color: 'var(--sub)' }}>
                    {on && '✓ '}{t(i)}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ---------- language ---------- */}
        <Section icon="globe" title={t('languageSec')} delay={1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGS.map(l => (
              <button key={l.id} onClick={() => updateSettings({ lang: l.id })}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-[14px] transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={user.settings.lang === l.id
                  ? { background: 'var(--a1)', color: '#fff' }
                  : { background: 'var(--surface2)', color: 'var(--text)' }}>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                  style={{ background: user.settings.lang === l.id ? 'rgba(255,255,255,.22)' : 'var(--line)' }}>{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ---------- appearance ---------- */}
        <Section icon="palette" title={t('appearance')} delay={2}>
          <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('mode')}</p>
          <div className="max-w-[240px]">
            <Seg value={mode} onChange={m => updateSettings({ mode: m as 'light' | 'dark' })}
              options={[{ id: 'light', label: '☀ ' + t('light') }, { id: 'dark', label: '☾ ' + t('dark') }]} />
          </div>

          <p className="text-[13px] font-semibold mt-5 mb-2" style={{ color: 'var(--sub)' }}>{t('themePresets')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.keys(PRESETS).map(pid => {
              const p = PRESETS[pid][mode];
              return (
                <button key={pid} onClick={() => applyTheme(pid)}
                  className={`card p-2.5 flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105 hover:-rotate-1 active:scale-95 ${active === pid ? 'ring-2 ring-[var(--a1)]' : ''}`}
                  style={{ borderColor: active === pid ? 'var(--a1)' : 'var(--line)' }}>
                  <span className="flex gap-1">
                    {[p.a1, p.a2, p.a3].map((c, i) => (
                      <span key={i} className="w-3.5 h-3.5 rounded-full border transition-transform hover:scale-125" style={{ background: c, borderColor: 'rgba(0,0,0,.15)' }} />
                    ))}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: active === pid ? 'var(--a1)' : 'var(--sub)' }}>{t('th_' + pid)}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[13px] font-semibold mt-5 mb-2 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
            <Icon name="layers" size={14} />{t('gradientPresets')}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GRADIENT_PRESETS.map(g => {
              const id = 'gp:' + g.id;
              return (
                <button key={g.id} onClick={() => saveTheme({ id, name: t('gradientBg'), gradient: g, ...base })}
                  className={`h-14 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 gradient-live ${active === id ? 'ring-2 ring-[var(--text)]' : ''}`}
                  style={{ background: gradientCss(g), backgroundSize: '180% 180%' }} title={t('gradientBg')} />
                );
            })}
          </div>

          <GradientBuilder onApply={(g) => saveTheme({ id: 'cg:' + uid(), name: t('customGradient'), gradient: g, ...base })} />

          <p className="text-[13px] font-semibold mt-5 mb-2 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
            <Icon name="image" size={14} />{t('imageBg')}
          </p>
          <button onClick={() => bgFile.current?.click()}
            className="w-full card border-dashed p-5 flex items-center justify-center gap-2.5 font-bold text-[14px] transition-all hover:scale-[1.01] active:scale-[.99]"
            style={{ borderColor: 'var(--a3)', color: 'var(--a3)' }}>
            <Icon name="camera" size={18} />{t('upload')}
          </button>
          <input ref={bgFile} type="file" accept="image/*" className="hidden"
            onChange={async e => { const f = e.target.files?.[0]; if (f) setBgImg(await fileToDataUrl(f, 1000)); e.target.value = ''; }} />

          {user.themes.length > 0 && (
            <>
              <p className="text-[13px] font-semibold mt-5 mb-2" style={{ color: 'var(--sub)' }}>{t('savedThemes')}</p>
              <div className="flex flex-wrap gap-2">
                {user.themes.map(th => (
                  <div key={th.id} className={`flex items-center gap-1 pl-1 pr-2 py-1 rounded-full border transition-all ${active === th.id ? 'ring-2 ring-[var(--a1)]' : ''}`}
                    style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                    <button onClick={() => applyTheme(th.id)} className="flex items-center gap-2 transition hover:opacity-75">
                      <span className="w-7 h-7 rounded-full overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
                        {th.image
                          ? <img src={th.image} alt="" className="w-full h-full object-cover" />
                          : <span className="block w-full h-full gradient-live" style={{ background: th.gradient ? gradientCss(th.gradient) : 'var(--a1)', backgroundSize: '180% 180%' }} />}
                      </span>
                      <span className="text-[12px] font-bold max-w-[110px] truncate">{th.name}</span>
                    </button>
                    <button onClick={() => deleteTheme(th.id)} className="w-5 h-5 grid place-items-center rounded-full transition hover:scale-110"
                      style={{ color: 'var(--danger)' }}><Icon name="x" size={11} /></button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={resetTheme}
            className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all hover:scale-[1.02] active:scale-95"
            style={{ borderColor: 'var(--line)', color: 'var(--sub)' }}>
            <Icon name="rewind" size={15} />{t('resetTheme')}
          </button>
        </Section>

        {/* ---------- app icon ---------- */}
        <Section icon="star" title={t('appIcon')} delay={3}>
          <p className="text-[13px] mb-4" style={{ color: 'var(--sub)' }}>{t('iconDesc')}</p>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col items-center gap-1.5">
              <img src={iconPreview} alt="icon" className="w-24 h-24 rounded-[22%] shadow-xl transition-transform hover:scale-105 hover:rotate-3" style={{ border: '1px solid var(--line)' }} />
              <span className="text-[11px] font-bold" style={{ color: 'var(--sub)' }}>Kaleido</span>
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-3">
              <div className="flex gap-2">
                <button onClick={() => iconFile.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all active:scale-95"
                  style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                  <Icon name="image" size={15} />{t('upload')}
                </button>
                {iconImg && (
                  <button onClick={() => setIconImg(undefined)} className="px-3.5 py-2 rounded-xl text-[13px] font-bold transition active:scale-95"
                    style={{ background: 'var(--surface2)', color: 'var(--sub)' }}>{t('cancel')}</button>
                )}
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-[13.5px] font-semibold">{t('showLogo')}</span>
                <Toggle on={iconLogo} onChange={setIconLogo} />
              </label>
              <button onClick={() => applyIcon(iconImg, iconLogo)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-extrabold transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'var(--a1)', color: '#fff' }}>
                <Icon name="check" size={16} />{t('applyIcon')}
              </button>
            </div>
          </div>
          <input ref={iconFile} type="file" accept="image/*" className="hidden"
            onChange={async e => { const f = e.target.files?.[0]; if (f) setIconImg(await fileToDataUrl(f, 640)); e.target.value = ''; }} />
        </Section>

        {/* ---------- bots ---------- */}
        <Section icon="sparkles" title={t('botsSec')} delay={4}>
          <div className="flex items-center justify-between gap-4">
            <div><p className="font-bold text-[14px]">{t('proactive')}</p><p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>{t('proactiveDesc')}</p></div>
            <Toggle on={user.settings.proactive} onChange={v => updateSettings({ proactive: v })} />
          </div>
          {user.settings.proactive && (
            <div className="mt-3.5 anim-fade">
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('interval')}</p>
              <Seg value={String(user.settings.proactiveInterval)} onChange={v => updateSettings({ proactiveInterval: Number(v) })}
                options={[{ id: '30', label: t('sec30') }, { id: '60', label: t('min1') }, { id: '120', label: t('min2') }, { id: '300', label: t('min5') }]} />
            </div>
          )}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
            <div><p className="font-bold text-[14px]">{t('bondToggle')}</p><p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>{t('bondDesc')}</p></div>
            <Toggle on={user.settings.bondEnabled} onChange={v => updateSettings({ bondEnabled: v })} />
          </div>
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
            <div><p className="font-bold text-[14px]">{t('pushToggle')}</p><p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>{t('pushDesc')}</p></div>
            <Toggle on={user.settings.push} onChange={v => updateSettings({ push: v })} />
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
            <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('replyStyleDefault')}</p>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button key={s} onClick={() => updateSettings({ defaultStyle: s })}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                  style={user.settings.defaultStyle === s ? { background: 'var(--a2)', color: '#1a1206' } : { background: 'var(--surface2)', color: 'var(--sub)' }}>
                  {t('st' + s[0].toUpperCase() + s.slice(1))}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- data ---------- */}
        <Section icon="lock" title={t('dataSec')} delay={5}>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-bold border transition-all active:scale-95"
              style={{ borderColor: 'var(--line)' }}>
              <Icon name="logout" size={15} />{t('signOut')}
            </button>
            <button onClick={() => setConfirmReset(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all active:scale-95"
              style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)' }}>
              <Icon name="trash" size={15} />{t('resetData')}
            </button>
          </div>
          <button onClick={() => nav('feed')} className="mt-3 text-xs underline underline-offset-4" style={{ color: 'var(--sub)' }}>← {t('goToFeed')}</button>
        </Section>
      </div>

      {bgImg && <BgEditor img={bgImg} onClose={() => setBgImg(null)} onSave={th => { saveTheme(th); setBgImg(null); }} />}

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title={t('resetData')}>
        <p className="text-sm" style={{ color: 'var(--sub)' }}>{t('resetDataConfirm')}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setConfirmReset(false)} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
          <button onClick={() => { localStorage.removeItem('kaleido_db_v2'); location.reload(); }}
            className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>{t('confirm')}</button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ icon, title, children, delay }: { icon: string; title: string; children: React.ReactNode; delay: number }) {
  return (
    <section className="card p-5 anim-fade-up" style={{ animationDelay: `${delay * 60}ms` }}>
      <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: 'var(--surface2)', color: 'var(--a1)' }}>
          <Icon name={icon} size={16} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ================= gradient builder ================= */
function GradientBuilder({ onApply }: { onApply: (g: { c1: string; c2: string; c3: string; angle: number }) => void }) {
  const { t } = useApp();
  const [c1, setC1] = useState('#ff5c7a');
  const [c2, setC2] = useState('#ffb03a');
  const [c3, setC3] = useState('#1d1526');
  const [angle, setAngle] = useState(130);
  return (
    <div className="mt-5">
      <p className="text-[13px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
        <Icon name="wand" size={14} />{t('customGradient')}
      </p>
      <div className="card overflow-hidden">
        <div className="h-20 gradient-live transition-all duration-500" style={{ background: `linear-gradient(${angle}deg, ${c1}, ${c2} 55%, ${c3})`, backgroundSize: '180% 180%' }} />
        <div className="p-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          {[{ v: c1, s: setC1 }, { v: c2, s: setC2 }, { v: c3, s: setC3 }].map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-[12px] font-bold" style={{ color: 'var(--sub)' }}>
              <input type="color" value={c.v} onChange={e => c.s(e.target.value)} />{i + 1}
            </label>
          ))}
          <label className="flex items-center gap-2 text-[12px] font-bold flex-1 min-w-[140px]" style={{ color: 'var(--sub)' }}>
            {t('angle')}
            <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} className="flex-1" />
            {angle}°
          </label>
          <button onClick={() => onApply({ c1, c2, c3, angle })}
            className="px-4 py-2 rounded-xl text-[13px] font-extrabold transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {t('applyBg')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= image background editor ================= */
function BgEditor({ img, onClose, onSave }: { img: string; onClose: () => void; onSave: (t: SavedTheme) => void }) {
  const { t } = useApp();
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [blur, setBlur] = useState(7);
  const [opacity, setOpacity] = useState(0.42);
  const [pal, setPal] = useState<Palette | null>(null);
  const [preview, setPreview] = useState(true);
  const drag = useRef<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });

  useEffect(() => { let a = true; extractPaletteFromImage(img).then(p => { if (a) setPal(p); }); return () => { a = false; }; }, [img]);

  const vars = pal ? {
    '--bg': pal.bg, '--surface': pal.surface, '--surface2': pal.surface2, '--text': pal.text,
    '--sub': pal.sub, '--line': pal.line, '--a1': pal.a1, '--a2': pal.a2, '--a3': pal.a3,
  } as React.CSSProperties : undefined;

  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, on: true }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    setCropX(v => Math.max(0, Math.min(100, v - (e.clientX - drag.current.x) * 0.25)));
    setCropY(v => Math.max(0, Math.min(100, v - (e.clientY - drag.current.y) * 0.25)));
    drag.current.x = e.clientX; drag.current.y = e.clientY;
  };
  const onUp = () => { drag.current.on = false; };

  return (
    <Modal open onClose={onClose} title={t('imageBg')} wide>
      <div className="grid sm:grid-cols-[300px_1fr] gap-5">
        {/* phone mock preview */}
        <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[28px] overflow-hidden border-4 drag-none cursor-grab active:cursor-grabbing select-none"
          style={{ borderColor: 'var(--line)', ...(vars ?? {}), background: 'var(--bg)', color: 'var(--text)' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${img})`, backgroundSize: 'cover',
            backgroundPosition: `${cropX}% ${cropY}%`,
            filter: `blur(${blur}px)`, opacity, transform: 'scale(1.15)',
          }} />
          <div className="absolute inset-0" style={{ background: `color-mix(in srgb, ${pal?.bg ?? '#000'} 45%, transparent)` }} />
          {preview && (
            <div className="absolute inset-0 flex flex-col p-3">
              <div className="flex items-center gap-2 py-2">
                <span className="w-7 h-7 rounded-full" style={{ background: 'var(--a1)' }} />
                <span className="text-[11px] font-bold">Luna Vega</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--surface2)', color: 'var(--a2)' }}>{t('preview')}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 justify-end pb-2">
                <div className="self-start max-w-[80%] text-[10.5px] px-2.5 py-1.5 rounded-xl rounded-bl-sm" style={{ background: 'var(--surface)' }}>
                  {t('feedSub')}
                </div>
                <div className="self-end max-w-[80%] text-[10.5px] px-2.5 py-1.5 rounded-xl rounded-br-sm" style={{ background: 'var(--a1)', color: '#fff' }}>
                  Kaleido ✶
                </div>
                <div className="self-start px-2.5 py-2 rounded-xl rounded-bl-sm flex gap-1" style={{ background: 'var(--surface)' }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 pb-1">
                <span className="flex-1 h-8 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                <span className="w-8 h-8 rounded-full" style={{ background: 'var(--a1)' }} />
              </div>
            </div>
          )}
          <span className="absolute bottom-2 inset-x-0 text-center text-[9.5px] font-bold px-3" style={{ color: 'var(--text)', opacity: 0.75 }}>
            {t('cropHint')}
          </span>
        </div>

        {/* controls */}
        <div className="flex flex-col gap-4">
          {pal && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold mr-1" style={{ color: 'var(--sub)' }}>{t('themePresets')}:</span>
              {[pal.a1, pal.a2, pal.a3, pal.bg].map((c, i) => (
                <span key={i} className="w-7 h-7 rounded-full border anim-pop" style={{ background: c, borderColor: 'var(--line)', animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          )}
          <Slider label={t('blur')} icon="eye" value={blur} min={0} max={24} onChange={setBlur} suffix="px" />
          <Slider label={t('opacity')} icon="layers" value={Math.round(opacity * 100)} min={10} max={100} onChange={v => setOpacity(v / 100)} suffix="%" />
          <label className="flex items-center justify-between gap-3 card px-4 py-3 cursor-pointer">
            <span className="text-[13.5px] font-semibold flex items-center gap-2"><Icon name="crop" size={15} />{t('interactivePreview')}</span>
            <Toggle on={preview} onChange={setPreview} />
          </label>
          <div className="flex gap-2 mt-auto">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
            <button disabled={!pal} onClick={() => onSave({ id: 'img:' + uid(), name: t('imageBg'), image: img, cropX, cropY, blur, opacity, extraction: pal ?? undefined })}
              className="flex-1 py-2.5 rounded-xl font-extrabold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--a1)', color: '#fff' }}>
              {t('applyBg')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Slider({ label, icon, value, min, max, onChange, suffix }: {
  label: string; icon: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix: string;
}) {
  return (
    <label className="card px-4 py-3 block">
      <span className="flex items-center justify-between text-[13px] font-bold mb-2">
        <span className="flex items-center gap-2" style={{ color: 'var(--text)' }}><Icon name={icon} size={14} />{label}</span>
        <span style={{ color: 'var(--a2)' }}>{value}{suffix}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
