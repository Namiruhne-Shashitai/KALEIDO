import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Character, Chat, DB, Lang, Mode, Msg, Palette, Persona, Route, RouteState,
  SavedTheme, Settings, Toast, UserRec,
} from './types';
import { STORE_ITEMS, makeRandomChar, seedDB } from './seed';
import { botReply, imageDelay, proactiveMessage, typingDelay } from './llm';
import { PRESETS, gradientCss, kaleido, makeIconDataUrl } from './kaleido';
import { translate } from './i18n';

const KEY = 'kaleido_db_v2';

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const db = JSON.parse(raw) as DB;
      if (db && Array.isArray(db.users) && Array.isArray(db.characters)) return db;
    }
  } catch { /* corrupted */ }
  return seedDB();
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function detectLang(): Lang {
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return (['es', 'en', 'fr', 'it', 'de', 'zh', 'ja'] as Lang[]).includes(nav as Lang) ? (nav as Lang) : 'es';
}

function shade(hex: string, l: number): string {
  const h = hex.replace('#', '');
  const n = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (l > 0 ? (255 - v) * l : v * l))));
  return '#' + n.map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}
function mixHex(a: string, b: string, t: number): string {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const ca = [parseInt(pa.slice(0, 2), 16), parseInt(pa.slice(2, 4), 16), parseInt(pa.slice(4, 6), 16)];
  const cb = [parseInt(pb.slice(0, 2), 16), parseInt(pb.slice(2, 4), 16), parseInt(pb.slice(4, 6), 16)];
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

interface Ctx {
  db: DB; user: UserRec | null; chars: Character[];
  route: RouteState; nav: (r: Route, p?: Partial<RouteState>) => void;
  lang: Lang; mode: Mode;
  t: (k: string, v?: Record<string, string | number>) => string;
  toasts: Toast[]; toast: (text: string, kind?: Toast['kind']) => void;
  typing: Record<string, boolean>; generating: Record<string, boolean>;
  refreshing: boolean;
  themeVars: Record<string, string>;
  bgLayer: { css?: string; img?: string; cropX: number; cropY: number; blur: number; opacity: number } | null;
  // auth
  login: (email: string, pass: string) => string | null;
  signup: (name: string, email: string, pass: string) => string | null;
  demoLogin: () => void; logout: () => void;
  // chat
  startChat: (charId: string) => void;
  sendMessage: (chatId: string, text?: string, image?: string) => void;
  editMessage: (chatId: string, msgId: string, newText: string) => void;
  deleteMessage: (chatId: string, msgId: string) => void;
  rewindTo: (chatId: string, msgId: string) => void;
  regenerateLast: (chatId: string) => void;
  useItem: (chatId: string, itemId: string, asGift: boolean) => void;
  deleteChat: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
  claimItem: (itemId: string) => void;
  // notifs
  markAllRead: () => void;
  openNotif: (id: string) => void;
  // characters
  createCharacter: (data: Partial<Character>, avatar: string, seed: string) => Character;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  refreshFeed: () => Promise<void>;
  // personas
  savePersona: (p: Persona) => void;
  deletePersona: (id: string) => void;
  setActivePersona: (id: string) => void;
  // settings / theming
  updateSettings: (patch: Partial<Settings>) => void;
  setInterests: (list: string[]) => void;
  saveTheme: (theme: SavedTheme) => void;
  applyTheme: (id: string) => void;
  deleteTheme: (id: string) => void;
  resetTheme: () => void;
  applyIcon: (img: string | undefined, logo: boolean) => Promise<void>;
  updateUser: (patch: Partial<UserRec>) => void;
}

const C = createContext<Ctx | null>(null);
export function useApp(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error('useApp outside provider');
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB);
  const [route, setRoute] = useState<RouteState>({ route: 'feed' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const dbRef = useRef(db); dbRef.current = db;
  const routeRef = useRef(route); routeRef.current = route;
  const toastId = useRef(1);

  const user = useMemo(() => db.users.find(u => u.id === db.session) ?? null, [db]);
  const lang: Lang = user?.settings.lang ?? detectLang();
  const mode: Mode = user?.settings.mode ?? 'dark';

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ }
  }, [db]);

  const t = (k: string, v?: Record<string, string | number>) => translate(k, lang, v);

  const toast = (text: string, kind: Toast['kind'] = 'info') => {
    const id = toastId.current++;
    setToasts(prev => [...prev.slice(-3), { id, text, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3400);
  };

  const nav = (r: Route, p?: Partial<RouteState>) => setRoute({ route: r, ...p });

  /* ---------- theme ---------- */
  const activeTheme: SavedTheme | null = useMemo(
    () => user?.themes.find(x => x.id === user.activeThemeId) ?? null,
    [user],
  );
  const themeVars = useMemo(() => {
    let pal: Palette;
    if (activeTheme?.extraction) pal = activeTheme.extraction;
    else if (activeTheme?.gradient) {
      const g = activeTheme.gradient;
      const dark = mode === 'dark';
      pal = {
        bg: dark ? shade(g.c3, -0.35) : shade(g.c1, 0.82),
        surface: dark ? shade(g.c3, -0.2) : shade(g.c1, 0.9),
        surface2: dark ? shade(g.c3, -0.02) : shade(g.c2, 0.78),
        text: dark ? '#f7f3fa' : '#1d1526',
        sub: dark ? mixHex('#f7f3fa', g.c3, 0.5) : mixHex('#1d1526', g.c1, 0.35),
        line: dark ? mixHex(g.c3, '#ffffff', 0.16) : mixHex(g.c1, '#1d1526', 0.16),
        a1: g.c1, a2: g.c2, a3: shade(g.c2, dark ? 0.15 : -0.1),
      };
    } else {
      const pid = activeTheme?.preset ?? user?.activeThemeId ?? 'prism';
      pal = (PRESETS[pid] ?? PRESETS.prism)[mode];
    }
    return {
      '--bg': pal.bg, '--surface': pal.surface, '--surface2': pal.surface2,
      '--text': pal.text, '--sub': pal.sub, '--line': pal.line,
      '--a1': pal.a1, '--a2': pal.a2, '--a3': pal.a3,
    } as Record<string, string>;
  }, [activeTheme, mode, user]);

  const bgLayer = useMemo(() => {
    if (!activeTheme) return null;
    if (activeTheme.image) return {
      img: activeTheme.image, cropX: activeTheme.cropX, cropY: activeTheme.cropY,
      blur: activeTheme.blur, opacity: activeTheme.opacity,
    };
    if (activeTheme.gradient) return {
      css: gradientCss(activeTheme.gradient), cropX: 50, cropY: 50,
      blur: 0, opacity: activeTheme.opacity ?? 0.55,
    };
    return null;
  }, [activeTheme]);

  /* ---------- favicon / launcher icon ---------- */
  useEffect(() => {
    let alive = true;
    makeIconDataUrl({ img: user?.iconImg, logo: user?.iconLogo ?? true }).then(url => {
      if (!alive) return;
      const el = document.getElementById('kaleido-favicon') as HTMLLinkElement | null;
      if (el) el.href = url;
    });
    return () => { alive = false; };
  }, [user?.iconImg, user?.iconLogo, user?.id]);

  /* ---------- db helpers ---------- */
  const patchUser = (id: string, fn: (u: UserRec) => UserRec) =>
    setDb(prev => ({ ...prev, users: prev.users.map(u => (u.id === id ? fn(u) : u)) }));

  const patchChat = (userId: string, chatId: string, fn: (c: Chat) => Chat) =>
    patchUser(userId, u => ({ ...u, chats: u.chats.map(c => (c.id === chatId ? fn(c) : c)) }));

  function pushNotif(u: UserRec, n: Omit<Notif0, 'id' | 'ts' | 'read'>): Notif0[] {
    return [{ id: uid(), ts: Date.now(), read: false, ...n }, ...u.notifs].slice(0, 60);
  }
  type Notif0 = import('./types').Notif;

  function notify(title: string, body: string) {
    if (document.hidden && user?.settings.push && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(title, { body, icon: (document.getElementById('kaleido-favicon') as HTMLLinkElement)?.href }); } catch { /* noop */ }
    }
  }

  /* ---------- LLM plumbing ---------- */
  function deliverBotMessage(userId: string, chatId: string, msg: Msg, kind: 'reply' | 'proactive' | 'image') {
    const r = routeRef.current;
    const inChat = r.route === 'chat' && r.chatId === chatId && !document.hidden;
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id !== userId) return u;
        const chat = u.chats.find(c => c.id === chatId);
        const char = prev.characters.find(c => c.id === chat?.charId);
        let notifs = u.notifs;
        if (!inChat) {
          const name = char?.name ?? 'Kaleido';
          const key = kind === 'proactive' ? 'notifProactive' : kind === 'image' ? 'notifImage' : 'notifProactive';
          notifs = pushNotif(u, { type: kind === 'image' ? 'image' : 'proactive', text: translate(key, u.settings.lang, { name }), chatId, charId: chat?.charId });
          notify('Kaleido · ' + name, msg.text ?? '✶');
        }
        return {
          ...u, notifs,
          chats: u.chats.map(c => c.id === chatId ? { ...c, messages: [...c.messages, msg], unread: inChat ? c.unread : c.unread + 1 } : c),
        };
      }),
    }));
    if (!inChat) {
      const char = dbRef.current.characters.find(c => c.id === dbRef.current.users.find(u => u.id === userId)?.chats.find(ch => ch.id === chatId)?.charId);
      toast(t(kind === 'image' ? 'notifImage' : 'notifProactive', { name: char?.name ?? 'Kaleido' }), kind === 'image' ? 'ok' : 'info');
    }
  }

  function scheduleReply(userId: string, chatId: string, userMsg: Msg, opts?: { itemName?: string; proactive?: boolean }) {
    const d = dbRef.current;
    const u = d.users.find(x => x.id === userId);
    const chat = u?.chats.find(c => c.id === chatId);
    const char = d.characters.find(c => c.id === chat?.charId);
    if (!u || !chat || !char) return;
    const persona = u.personas.find(p => p.id === chat.personaId);
    const res = opts?.proactive
      ? proactiveMessage(char, persona, chat, u.settings.lang)
      : botReply(char, persona, chat, u.settings.lang, userMsg, opts?.itemName);

    setTimeout(() => {
      setTyping(p => ({ ...p, [chatId]: false }));
      const finish = (msg: Msg) => {
        if (res.memory) {
          patchUser(userId, uu => ({
            ...uu,
            chats: uu.chats.map(c => c.id === chatId
              ? { ...c, memories: [...c.memories.filter(m => m.text !== res.memory!.text), res.memory!].slice(-10) }
              : c),
          }));
        }
        deliverBotMessage(userId, chatId, msg, opts?.proactive ? 'proactive' : res.imagePrompt ? 'image' : 'reply');
        setGenerating(p => ({ ...p, [chatId]: false }));
      };
      if (res.imagePrompt) {
        setGenerating(p => ({ ...p, [chatId]: true }));
        setTimeout(() => {
          const img = kaleido(res.imagePrompt + '·' + Math.random().toString(36).slice(2, 6), 512);
          finish({ id: uid(), role: 'bot', text: res.text, image: img, prompt: res.imagePrompt, ts: Date.now() });
        }, imageDelay());
      } else {
        finish({ id: uid(), role: 'bot', text: res.text, ts: Date.now() });
      }
    }, typingDelay(res.text));
    setTyping(p => ({ ...p, [chatId]: true }));
  }

  /* ---------- proactive engine ---------- */
  useEffect(() => {
    const iv = setInterval(() => {
      const d = dbRef.current;
      const u = d.users.find(x => x.id === d.session);
      if (!u || !u.settings.proactive || document.hidden === undefined) return;
      const now = Date.now();
      const span = u.settings.proactiveInterval * 1000;
      const eligible = u.chats.filter(c =>
        c.messages.length > 0 &&
        !typingRef.current[c.id] &&
        now - Math.max(c.lastUserAt, c.lastProactiveAt, c.createdAt) > span &&
        now - c.lastProactiveAt > span * 0.8,
      );
      if (!eligible.length) return;
      const chat = eligible[Math.floor(Math.random() * eligible.length)];
      patchChat(u.id, chat.id, c => ({ ...c, lastProactiveAt: now }));
      scheduleReply(u.id, chat.id, chat.messages[chat.messages.length - 1], { proactive: true });
    }, 7000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const typingRef = useRef(typing); typingRef.current = typing;

  /* ---------- auth ---------- */
  const login = (email: string, pass: string) => {
    const u = dbRef.current.users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.pass !== pass) return 'badLogin';
    setDb(p => ({ ...p, session: u.id }));
    setRoute({ route: 'feed' });
    return null;
  };
  const signup = (name: string, email: string, pass: string) => {
    if (!name.trim() || !email.trim() || !pass.trim()) return 'fillAll';
    if (dbRef.current.users.some(x => x.email.toLowerCase() === email.toLowerCase())) return 'userExists';
    const seedP = 'persona-' + uid();
    const u: UserRec = {
      id: uid(), name: name.trim(), email: email.trim(), pass,
      personas: [{ id: seedP, name: name.trim(), pronouns: '', desc: '', avatar: kaleido(seedP, 256), seed: seedP }],
      activePersonaId: seedP, chats: [], notifs: [{ id: uid(), type: 'system', text: 'welcomeNotif', ts: Date.now(), read: false }],
      inventory: { it_rose: 3, it_coffee: 2 }, interests: [],
      settings: { lang: detectLang(), mode: 'dark', proactive: true, proactiveInterval: 60, bondEnabled: true, push: false, defaultStyle: 'casual' },
      themes: [], activeThemeId: 'prism', iconLogo: true, createdAt: Date.now(),
    };
    setDb(p => ({ ...p, users: [...p.users, u], session: u.id }));
    setRoute({ route: 'feed' });
    return null;
  };
  const demoLogin = () => {
    setDb(p => {
      const has = p.users.some(u => u.id === 'demo');
      return { ...p, users: has ? p.users : [...p.users, seedDB().users[0]], session: 'demo' };
    });
    setRoute({ route: 'feed' });
  };
  const logout = () => setDb(p => ({ ...p, session: null }));

  /* ---------- chat actions ---------- */
  const startChat = (charId: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const char = dbRef.current.characters.find(c => c.id === charId);
    if (!u || !char) return;
    const existing = u.chats.find(c => c.charId === charId);
    if (existing) { nav('chat', { chatId: existing.id, charId }); clearUnread(existing.id); return; }
    const chatId = uid();
    const chat: Chat = {
      id: chatId, charId, personaId: u.activePersonaId,
      messages: [{ id: uid(), role: 'bot', text: char.greeting, ts: Date.now() }],
      bond: 0, memories: [], lastUserAt: Date.now(), lastProactiveAt: Date.now(), unread: 0, createdAt: Date.now(),
    };
    patchUser(u.id, uu => ({ ...uu, chats: [chat, ...uu.chats] }));
    setDb(p => ({ ...p, characters: p.characters.map(c => c.id === charId ? { ...c, chats: c.chats + 1 } : c) }));
    nav('chat', { chatId, charId });
  };

  const sendMessage = (chatId: string, text?: string, image?: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    if (!u || (!text?.trim() && !image)) return;
    const msg: Msg = { id: uid(), role: 'user', text: text?.trim() || undefined, image, ts: Date.now() };
    patchChat(u.id, chatId, c => ({ ...c, messages: [...c.messages, msg], lastUserAt: msg.ts }));
    scheduleReply(u.id, chatId, msg);
  };

  const editMessage = (chatId: string, msgId: string, newText: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    if (!u || !newText.trim()) return;
    const chat = u.chats.find(c => c.id === chatId);
    const idx = chat?.messages.findIndex(m => m.id === msgId) ?? -1;
    if (!chat || idx < 0) return;
    const original = chat.messages[idx];
    const updated: Msg = { ...original, text: newText.trim(), edited: true };
    if (original.role === 'bot') {
      patchChat(u.id, chatId, c => ({ ...c, messages: c.messages.map(m => m.id === msgId ? updated : m) }));
      return;
    }
    // user message: truncate everything after and regenerate bot reply
    patchChat(u.id, chatId, c => ({ ...c, messages: [...c.messages.slice(0, idx), updated], lastUserAt: Date.now() }));
    scheduleReply(u.id, chatId, updated);
  };

  const deleteMessage = (chatId: string, msgId: string) =>
    patchChat(dbRef.current.session!, chatId, c => ({ ...c, messages: c.messages.filter(m => m.id !== msgId) }));

  const rewindTo = (chatId: string, msgId: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const chat = u?.chats.find(c => c.id === chatId);
    const idx = chat?.messages.findIndex(m => m.id === msgId) ?? -1;
    if (!u || !chat || idx < 0) return;
    const kept = chat.messages.slice(0, idx);
    patchChat(u.id, chatId, c => ({ ...c, messages: kept }));
    const last = kept[kept.length - 1];
    if (last && last.role === 'user') scheduleReply(u.id, chatId, last);
  };

  const regenerateLast = (chatId: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const chat = u?.chats.find(c => c.id === chatId);
    if (!u || !chat) return;
    let kept = [...chat.messages];
    while (kept.length && kept[kept.length - 1].role === 'bot') kept.pop();
    const last = kept[kept.length - 1];
    if (!last || last.role !== 'user') return;
    patchChat(u.id, chatId, c => ({ ...c, messages: kept }));
    scheduleReply(u.id, chatId, last);
  };

  const useItem = (chatId: string, itemId: string, asGift: boolean) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const count = u?.inventory[itemId] ?? 0;
    if (!u || count <= 0) return;
    const itemName = translate(itemId, u.settings.lang);
    const char = dbRef.current.characters.find(c => c.id === u.chats.find(ch => ch.id === chatId)?.charId);
    patchUser(u.id, uu => ({ ...uu, inventory: { ...uu.inventory, [itemId]: count - 1 } }));
    const msg: Msg = { id: uid(), role: 'user', itemId, gift: asGift, ts: Date.now() };
    patchChat(u.id, chatId, c => ({
      ...c,
      messages: [...c.messages, msg],
      lastUserAt: msg.ts,
      bond: u.settings.bondEnabled ? c.bond + (asGift ? 12 : 6) : c.bond,
    }));
    const left = count - 1;
    if (left === 0) setTimeout(() => toast(t('outOfStock', { item: itemName }), 'danger'), 900);
    else if (left < 5) setTimeout(() => toast(t('lowStock', { item: itemName, n: left }), 'warn'), 900);
    if (asGift && char) {
      patchUser(u.id, uu => ({ ...uu, notifs: pushNotif(uu, { type: 'gift', text: t('notifGift', { name: char.name }), chatId, charId: char.id }) }));
    }
    scheduleReply(u.id, chatId, msg, { itemName });
  };

  const deleteChat = (chatId: string) => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, chats: u.chats.filter(c => c.id !== chatId) }));
    if (routeRef.current.chatId === chatId) nav('chats');
  };

  const clearUnread = (chatId: string) => {
    const s = dbRef.current.session;
    if (s) patchChat(s, chatId, c => ({ ...c, unread: 0 }));
  };

  const claimItem = (itemId: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!u || !item) return;
    patchUser(u.id, uu => ({ ...uu, inventory: { ...uu.inventory, [itemId]: (uu.inventory[itemId] ?? 0) + item.qty } }));
    toast(t('claimed', { n: item.qty }), 'ok');
  };

  /* ---------- notifications ---------- */
  const markAllRead = () => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, notifs: u.notifs.map(n => ({ ...n, read: true })) }));
  };
  const openNotif = (id: string) => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session);
    const n = u?.notifs.find(x => x.id === id);
    if (!u || !n) return;
    patchUser(u.id, uu => ({ ...uu, notifs: uu.notifs.map(x => x.id === id ? { ...x, read: true } : x) }));
    if (n.chatId) {
      nav('chat', { chatId: n.chatId, charId: n.charId });
      clearUnread(n.chatId);
    } else nav('feed');
  };

  /* ---------- characters ---------- */
  const createCharacter = (data: Partial<Character>, avatar: string, seed: string): Character => {
    const u = dbRef.current.users.find(x => x.id === dbRef.current.session)!;
    const char: Character = {
      id: uid(), ownerId: u.id, name: data.name || 'Kaleido', tagline: data.tagline || '',
      personality: data.personality || '', greeting: data.greeting || t('startConv') + ' ✶',
      category: data.category || 'roleplay', style: data.style || u.settings.defaultStyle,
      visibility: data.visibility || 'private', avatar, seed,
      chats: 0, likes: 0, createdAt: Date.now(),
    };
    setDb(p => ({ ...p, characters: [char, ...p.characters] }));
    return char;
  };
  const updateCharacter = (id: string, patch: Partial<Character>) =>
    setDb(p => ({ ...p, characters: p.characters.map(c => c.id === id ? { ...c, ...patch } : c) }));
  const deleteCharacter = (id: string) => {
    const s = dbRef.current.session;
    setDb(p => ({ ...p, characters: p.characters.filter(c => c.id !== id) }));
    if (s) patchUser(s, u => ({ ...u, chats: u.chats.filter(c => c.charId !== id) }));
  };

  const refreshFeed = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1400));
    const fresh = [0, 1, 2].map(() => makeRandomChar(lang));
    setDb(p => ({ ...p, characters: [...fresh, ...p.characters] }));
    setRefreshing(false);
  };

  /* ---------- personas ---------- */
  const savePersona = (p: Persona) => {
    const s = dbRef.current.session;
    if (!s) return;
    patchUser(s, u => {
      const exists = u.personas.some(x => x.id === p.id);
      return { ...u, personas: exists ? u.personas.map(x => x.id === p.id ? p : x) : [...u.personas, p] };
    });
  };
  const deletePersona = (id: string) => {
    const s = dbRef.current.session;
    if (!s) return;
    patchUser(s, u => {
      const rest = u.personas.filter(p => p.id !== id);
      if (!rest.length) return u;
      return { ...u, personas: rest, activePersonaId: u.activePersonaId === id ? rest[0].id : u.activePersonaId };
    });
  };
  const setActivePersona = (id: string) => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, activePersonaId: id }));
  };

  /* ---------- settings / theming ---------- */
  const updateSettings = (patch: Partial<Settings>) => {
    const s = dbRef.current.session;
    if (!s) return;
    patchUser(s, u => ({ ...u, settings: { ...u.settings, ...patch } }));
    if (patch.push) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(p => { if (p === 'denied') toast(t('pushDenied'), 'warn'); });
      }
    }
  };
  const setInterests = (list: string[]) => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, interests: list.slice(0, 3) }));
  };
  const saveTheme = (theme: SavedTheme) => {
    const s = dbRef.current.session;
    if (!s) return;
    patchUser(s, u => ({
      ...u,
      themes: [...u.themes.filter(x => x.id !== theme.id), theme],
      activeThemeId: theme.id,
    }));
    toast(t('themeSaved', { name: theme.name }), 'ok');
  };
  const applyTheme = (id: string) => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, activeThemeId: id }));
  };
  const deleteTheme = (id: string) => {
    const s = dbRef.current.session;
    if (!s) return;
    patchUser(s, u => ({
      ...u, themes: u.themes.filter(x => x.id !== id),
      activeThemeId: u.activeThemeId === id ? 'prism' : u.activeThemeId,
    }));
  };
  const resetTheme = () => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, activeThemeId: 'prism' }));
    toast(t('themeReset'), 'ok');
  };
  const applyIcon = async (img: string | undefined, logo: boolean) => {
    const s = dbRef.current.session;
    if (!s) return;
    const url = await makeIconDataUrl({ img, logo });
    const el = document.getElementById('kaleido-favicon') as HTMLLinkElement | null;
    if (el) el.href = url;
    patchUser(s, u => ({ ...u, iconImg: img, iconLogo: logo }));
    toast(t('iconApplied'), 'ok');
  };
  const updateUser = (patch: Partial<UserRec>) => {
    const s = dbRef.current.session;
    if (s) patchUser(s, u => ({ ...u, ...patch }));
  };

  const chars = useMemo(() => {
    if (!user) return db.characters.filter(c => c.visibility === 'public');
    return db.characters.filter(c => c.visibility === 'public' || c.ownerId === user.id);
  }, [db.characters, user]);

  const value: Ctx = {
    db, user, chars, route, nav, lang, mode, t, toasts, toast, typing, generating, refreshing,
    themeVars, bgLayer, login, signup, demoLogin, logout,
    startChat, sendMessage, editMessage, deleteMessage, rewindTo, regenerateLast,
    useItem, deleteChat, clearUnread, claimItem, markAllRead, openNotif,
    createCharacter, updateCharacter, deleteCharacter, refreshFeed,
    savePersona, deletePersona, setActivePersona,
    updateSettings, setInterests, saveTheme, applyTheme, deleteTheme, resetTheme, applyIcon, updateUser,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}
