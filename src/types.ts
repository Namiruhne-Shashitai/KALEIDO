export type Lang = 'es' | 'en' | 'fr' | 'it' | 'de' | 'zh' | 'ja';

export type Route =
  | 'feed' | 'chats' | 'create' | 'store' | 'personas'
  | 'settings' | 'notifications' | 'chat' | 'profile';

export type Category = 'roleplay' | 'romance' | 'fantasy' | 'history' | 'art' | 'scifi' | 'slice' | 'drama';
export type Style = 'casual' | 'poetic' | 'chaotic' | 'shy' | 'direct';
export type Mode = 'light' | 'dark';

export interface Palette {
  bg: string; surface: string; surface2: string; text: string;
  sub: string; line: string; a1: string; a2: string; a3: string;
}

export interface SavedTheme {
  id: string;
  name: string;
  preset?: string;            // theme preset id
  gradient?: { c1: string; c2: string; c3: string; angle: number };
  image?: string;             // dataURL background
  cropX: number; cropY: number;
  blur: number; opacity: number;
  extraction?: Palette;       // colors extracted from image
}

export interface Persona {
  id: string; name: string; pronouns: string; desc: string; avatar: string; seed: string;
}

export interface Character {
  id: string; ownerId: string; name: string; tagline: string;
  personality: string; greeting: string;
  category: Category; style: Style;
  visibility: 'public' | 'private';
  avatar: string; seed: string;
  chats: number; likes: number; createdAt: number; fresh?: boolean;
}

export interface Msg {
  id: string; role: 'user' | 'bot';
  text?: string; image?: string; prompt?: string;
  itemId?: string; gift?: boolean;
  ts: number; edited?: boolean;
}

export interface Memory { type: 'like' | 'said' | 'asked'; text: string; }

export interface Chat {
  id: string; charId: string; personaId: string;
  messages: Msg[]; bond: number; memories: Memory[];
  lastUserAt: number; lastProactiveAt: number;
  unread: number; createdAt: number;
}

export interface Notif {
  id: string; type: 'proactive' | 'gift' | 'system' | 'image';
  text: string; charId?: string; chatId?: string;
  ts: number; read: boolean;
}

export interface Settings {
  lang: Lang;
  mode: Mode;
  proactive: boolean;
  proactiveInterval: number;   // seconds
  bondEnabled: boolean;
  push: boolean;
  defaultStyle: Style;
}

export interface UserRec {
  id: string; name: string; email: string; pass: string;
  personas: Persona[]; activePersonaId: string;
  chats: Chat[]; notifs: Notif[];
  inventory: Record<string, number>;
  interests: string[];
  settings: Settings;
  themes: SavedTheme[]; activeThemeId: string;
  iconImg?: string; iconLogo: boolean;
  createdAt: number;
}

export interface DB {
  users: UserRec[];
  characters: Character[];
  session: string | null;
}

export interface StoreItem {
  id: string; cat: 'boost' | 'gadget' | 'gift';
  icon: string;              // icon name
  qty: number;               // units received on claim
  hue: number;
}

export interface Toast { id: number; text: string; kind: 'ok' | 'warn' | 'danger' | 'info'; }

export interface RouteState { route: Route; chatId?: string; charId?: string; editCharId?: string; }
