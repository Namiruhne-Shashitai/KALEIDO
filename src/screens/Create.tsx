import { useMemo, useRef, useState } from 'react';
import { useApp, uid } from '../store';
import { Avatar, Field, Icon, Modal, Seg, inputCls, inputStyle } from '../ui';
import { fileToDataUrl, kaleido } from '../kaleido';
import { makeSurpriseChar } from '../seed';
import type { Category, Persona, Style } from '../types';

const CATS: Category[] = ['roleplay', 'romance', 'fantasy', 'history', 'art', 'scifi', 'slice', 'drama'];
const STYLES: Style[] = ['casual', 'poetic', 'chaotic', 'shy', 'direct'];

export default function CreateScreen() {
  const { db, route, t, lang, user, createCharacter, updateCharacter, deleteCharacter, startChat, nav, toast } = useApp();
  const editing = route.editCharId ? db.characters.find(c => c.id === route.editCharId) : undefined;
  const [seed, setSeed] = useState(editing?.seed ?? 'ch-' + uid());
  const [customAvatar, setCustomAvatar] = useState<string | null>(editing && !editing.seed.startsWith('char-') && !editing.seed.startsWith('ch-') ? editing.avatar : null);
  const [form, setForm] = useState({
    name: editing?.name ?? '', tagline: editing?.tagline ?? '', personality: editing?.personality ?? '',
    greeting: editing?.greeting ?? '', category: editing?.category ?? ('romance' as Category),
    style: editing?.style ?? user?.settings.defaultStyle ?? ('casual' as Style),
    visibility: editing?.visibility ?? ('public' as 'public' | 'private'),
  });
  const [surprising, setSurprising] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const avatarSrc = useMemo(() => customAvatar ?? kaleido(seed, 384), [customAvatar, seed]);

  const surprise = () => {
    setSurprising(true);
    let i = 0;
    const iv = setInterval(() => {
      setSeed('ch-' + uid());
      if (++i > 6) {
        clearInterval(iv);
        const s = makeSurpriseChar(lang);
        setForm(f => ({ ...f, ...s }));
        setCustomAvatar(null);
        setSurprising(false);
      }
    }, 90);
  };

  const save = () => {
    if (!form.name.trim()) { toast(t('fillAll'), 'warn'); return; }
    if (editing) {
      updateCharacter(editing.id, { ...form, avatar: avatarSrc, seed });
      toast(t('charSaved'), 'ok');
    } else {
      const c = createCharacter(form, avatarSrc, seed);
      toast(t('charCreated'), 'ok');
      startChat(c.id);
      return;
    }
    nav('feed');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 pb-28">
        <div className="flex items-center justify-between anim-fade-up">
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight">{editing ? t('editChar') : t('newChar')}</h1>
          <button onClick={surprise} disabled={surprising}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13.5px] transition-all active:scale-95 ${surprising ? 'anim-wiggle' : 'hover:brightness-110'}`}
            style={{ background: 'linear-gradient(120deg, var(--a1), var(--a2))', color: '#fff' }}>
            <Icon name="dice" size={17} />{t('surprise')}
          </button>
        </div>
        <p className="text-sm mt-1 mb-6" style={{ color: 'var(--sub)' }}>{t('surpriseDesc')}</p>

        {/* avatar */}
        <div className="card p-5 flex flex-col sm:flex-row items-center gap-5 anim-fade-up" style={{ animationDelay: '.05s' }}>
          <div className={`relative ${surprising ? 'anim-wiggle' : ''}`}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 transition-transform hover:scale-105" style={{ borderColor: 'var(--line)' }}>
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => { setSeed('ch-' + uid()); setCustomAvatar(null); }} title={t('shuffle')}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full grid place-items-center border transition-all hover:rotate-180 duration-500"
              style={{ background: 'var(--a3)', color: '#06231d', borderColor: 'var(--bg)' }}>
              <Icon name="refresh" size={15} />
            </button>
          </div>
          <div className="flex-1 w-full">
            <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('avatar')}</p>
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all hover:scale-[1.02] active:scale-95"
                style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
                <Icon name="camera" size={15} />{t('upload')}
              </button>
              {customAvatar && (
                <button onClick={() => setCustomAvatar(null)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition active:scale-95"
                  style={{ background: 'var(--surface2)', color: 'var(--sub)' }}>
                  <Icon name="rewind" size={15} />{t('shuffle')}
                </button>
              )}
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={async e => { const f = e.target.files?.[0]; if (f) setCustomAvatar(await fileToDataUrl(f, 384)); e.target.value = ''; }} />

        {/* fields */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="card p-5 flex flex-col gap-4 anim-fade-up" style={{ animationDelay: '.1s' }}>
            <Field label={t('charName')}>
              <input className={inputCls} style={inputStyle} value={form.name} placeholder="Luna, Kai, Nova…"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label={t('charTagline')}>
              <input className={inputCls} style={inputStyle} value={form.tagline}
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            </Field>
            <div>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--sub)' }}>{t('category')}</p>
              <div className="flex flex-wrap gap-2">
                {CATS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                    style={form.category === c ? { background: 'var(--a1)', color: '#fff' } : { background: 'var(--surface2)', color: 'var(--sub)' }}>
                    {t(c)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5 flex flex-col gap-4 anim-fade-up" style={{ animationDelay: '.15s' }}>
            <Field label={t('personality')}>
              <textarea rows={3} className={inputCls + ' resize-none'} style={inputStyle} placeholder={t('personalityPh')}
                value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} />
            </Field>
            <Field label={t('greeting')}>
              <textarea rows={2} className={inputCls + ' resize-none'} style={inputStyle}
                value={form.greeting} onChange={e => setForm(f => ({ ...f, greeting: e.target.value }))} />
            </Field>
            <div>
              <p className="text-[13px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
                <Icon name="chat" size={14} />{t('replyStyle')}
              </p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, style: s }))}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                    style={form.style === s ? { background: 'var(--a2)', color: '#1a1206' } : { background: 'var(--surface2)', color: 'var(--sub)' }}>
                    {t('st' + s[0].toUpperCase() + s.slice(1))}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--sub)' }}>
                <Icon name={form.visibility === 'public' ? 'globe' : 'lock'} size={14} />{t('visibility')}
              </p>
              <Seg value={form.visibility} onChange={v => setForm(f => ({ ...f, visibility: v as 'public' | 'private' }))}
                options={[{ id: 'public', label: t('community') }, { id: 'private', label: t('privateTag') }]} />
              <p className="text-xs mt-1.5" style={{ color: 'var(--sub)' }}>
                {form.visibility === 'public' ? t('publicDesc') : t('privateDesc')}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 anim-fade-up" style={{ animationDelay: '.2s' }}>
            {editing && (
              <button onClick={() => setConfirmDel(true)}
                className="w-12 h-12 grid place-items-center rounded-xl border transition-all active:scale-95 shrink-0"
                style={{ borderColor: 'var(--line)', color: 'var(--danger)' }}>
                <Icon name="trash" size={18} />
              </button>
            )}
            <button onClick={save}
              className="flex-1 py-3 rounded-xl font-display font-bold text-[15px] transition-all hover:brightness-110 active:scale-[.98]"
              style={{ background: 'var(--a1)', color: '#fff' }}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title={t('deleteChar')}>
        <p className="text-sm" style={{ color: 'var(--sub)' }}>{t('deleteCharConfirm')}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setConfirmDel(false)} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
          <button onClick={() => { if (editing) deleteCharacter(editing.id); setConfirmDel(false); nav('feed'); }}
            className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>{t('delete')}</button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= Personas ================= */
export function PersonasScreen() {
  const { user, t, savePersona, deletePersona, setActivePersona, toast } = useApp();
  const [editing, setEditing] = useState<Persona | null>(null);
  const [open, setOpen] = useState(false);

  if (!user) return null;
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 pb-28">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight anim-fade-up">{t('myPersonas')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sub)' }}>{t('personasDesc')}</p>

        <button onClick={() => { setEditing({ id: uid(), name: '', pronouns: '', desc: '', avatar: '', seed: 'p-' + uid() }); setOpen(true); }}
          className="mt-5 w-full card p-4 flex items-center justify-center gap-2 font-bold text-[14px] border-dashed transition-all hover:scale-[1.01] active:scale-[.99] anim-fade-up"
          style={{ borderColor: 'var(--a1)', color: 'var(--a1)', animationDelay: '.05s' }}>
          <Icon name="plus" size={17} />{t('newPersona')}
        </button>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {user.personas.map((p, i) => (
            <div key={p.id} className="card p-4 flex gap-3.5 items-start anim-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Avatar src={p.avatar || kaleido(p.seed, 256)} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold truncate">{p.name}</h3>
                  {p.id === user.activePersonaId && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--a3)', color: '#06231d' }}>{t('active')}</span>
                  )}
                </div>
                {p.pronouns && <p className="text-[12px] font-semibold" style={{ color: 'var(--a2)' }}>{p.pronouns}</p>}
                {p.desc && <p className="text-[12.5px] mt-1 line-clamp-2" style={{ color: 'var(--sub)' }}>{p.desc}</p>}
                <div className="mt-2.5 flex gap-1.5">
                  {p.id !== user.activePersonaId && (
                    <button onClick={() => { setActivePersona(p.id); toast(t('active') + ': ' + p.name, 'ok'); }}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition active:scale-95" style={{ background: 'var(--a1)', color: '#fff' }}>
                      {t('setActive')}
                    </button>
                  )}
                  <button onClick={() => { setEditing(p); setOpen(true); }}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition active:scale-95" style={{ background: 'var(--surface2)' }}>
                    {t('editMsg')}
                  </button>
                  {user.personas.length > 1 && (
                    <button onClick={() => deletePersona(p.id)}
                      className="w-8 h-8 grid place-items-center rounded-lg transition active:scale-95" style={{ background: 'var(--surface2)', color: 'var(--danger)' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('newPersona')} sheet>
        {editing && <PersonaForm key={editing.id} p={editing} onDone={() => setOpen(false)} onSave={savePersona} />}
      </Modal>
    </div>
  );
}

function PersonaForm({ p, onDone, onSave }: { p: Persona; onDone: () => void; onSave: (p: Persona) => void }) {
  const { t } = useApp();
  const [f, setF] = useState(p);
  const [custom, setCustom] = useState(p.avatar || null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarSrc = custom ?? kaleido(f.seed, 256);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--line)' }}>
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => { setF(x => ({ ...x, seed: 'p-' + uid() })); setCustom(null); }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full grid place-items-center transition hover:rotate-180 duration-500"
            style={{ background: 'var(--a3)', color: '#06231d' }}>
            <Icon name="refresh" size={13} />
          </button>
        </div>
        <button onClick={() => fileRef.current?.click()} className="text-[13px] font-bold underline underline-offset-4" style={{ color: 'var(--a1)' }}>
          {t('upload')}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={async e => { const file = e.target.files?.[0]; if (file) setCustom(await fileToDataUrl(file, 256)); e.target.value = ''; }} />
      </div>
      <Field label={t('name')}><input className={inputCls} style={inputStyle} value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} /></Field>
      <Field label={t('pronouns')}><input className={inputCls} style={inputStyle} value={f.pronouns} placeholder="él / ella / elle / they…" onChange={e => setF(x => ({ ...x, pronouns: e.target.value }))} /></Field>
      <Field label={t('desc')}><textarea rows={2} className={inputCls + ' resize-none'} style={inputStyle} value={f.desc} onChange={e => setF(x => ({ ...x, desc: e.target.value }))} /></Field>
      <div className="flex gap-2">
        <button onClick={onDone} className="flex-1 py-2.5 rounded-xl font-bold border" style={{ borderColor: 'var(--line)' }}>{t('cancel')}</button>
        <button onClick={() => { if (!f.name.trim()) return; onSave({ ...f, avatar: avatarSrc }); onDone(); }}
          className="flex-1 py-2.5 rounded-xl font-bold" style={{ background: 'var(--a1)', color: '#fff' }}>{t('save')}</button>
      </div>
    </div>
  );
}
