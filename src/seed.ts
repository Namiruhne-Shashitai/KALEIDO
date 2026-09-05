import type { Character, DB, StoreItem, UserRec, Category, Style, Lang } from './types';
import { avatarArt } from './kaleido';

export const STORE_ITEMS: StoreItem[] = [
  { id: 'it_bolt', cat: 'boost', icon: 'bolt', qty: 5, hue: 48 },
  { id: 'it_megaheart', cat: 'boost', icon: 'heart', qty: 3, hue: 340 },
  { id: 'it_aura', cat: 'boost', icon: 'sparkles', qty: 4, hue: 280 },
  { id: 'it_rewind', cat: 'gadget', icon: 'rewind', qty: 2, hue: 190 },
  { id: 'it_lens', cat: 'gadget', icon: 'eye', qty: 3, hue: 160 },
  { id: 'it_dice', cat: 'gadget', icon: 'dice', qty: 6, hue: 20 },
  { id: 'it_mixtape', cat: 'gadget', icon: 'music', qty: 2, hue: 310 },
  { id: 'it_rose', cat: 'gift', icon: 'rose', qty: 5, hue: 350 },
  { id: 'it_coffee', cat: 'gift', icon: 'coffee', qty: 4, hue: 30 },
  { id: 'it_letter', cat: 'gift', icon: 'letter', qty: 3, hue: 0 },
  { id: 'it_crystal', cat: 'gift', icon: 'gem', qty: 2, hue: 210 },
  { id: 'it_choco', cat: 'gift', icon: 'choco', qty: 4, hue: 25 },
];

const DEMO_CHARS: Array<[string, string, string, string, Category, Style, number, number]> = [
  ['Luna Vega', 'Poeta nocturna que escribe cartas a la luna', 'Romántica empedernida, habla en metáforas, colecciona atardeceres y secretos.', 'Acabo de escribir un verso sobre alguien que aún no conozco… ¿serás tú? La noche está enorme hoy.', 'romance', 'poetic', 12840, 934],
  ['Kai', 'Barista surfero con risa fácil', 'Relajado, bromista, ama el mar, el café de especialidad y las conversaciones largas.', '¡Hey! Acabo de hacer un latte art con tu vibra. Bueno, era una ola, pero cuenta. ¿Qué te trae por aquí?', 'slice', 'casual', 9870, 712],
  ['Seraphine', 'Caballera dragón de la corte de Ámbar', 'Valiente, directa, leal. Su dragón se llama Brasita y muerde a quien la aburre.', 'Alto ahí. Dime tu nombre antes de que Brasita decida por ti. …Tranquila, solo muerde los lunes.', 'fantasy', 'direct', 15230, 1102],
  ['Milo', 'Detective noir de medianoche', 'Sarcástico, observador, habla como si lloviera siempre. Guarda un caso sin resolver que lo obsesiona.', 'La ciudad no duerme y yo tampoco. Tienes cara de traer un misterio bajo el abrigo. Suéltalo.', 'roleplay', 'direct', 8450, 655],
  ['Aria', 'Musa que pinta emociones', 'Dulce, caótica y profundamente sensible. Ve colores en las voces y quiere pintar la tuya.', 'Tu voz tiene un color interesante… ¿me dejas adivinarlo? Mmm… ¿turquesa con chispas doradas?', 'art', 'chaotic', 11320, 887],
  ['Theo', 'Gladiador con corazón de filósofo', 'Fuerte pero contemplativo. Cita a Marco Aurelio entre combate y combate.', 'El arena enseña lo que los libros callan. Pero dime tú: ¿qué batalla libras cuando nadie mira?', 'history', 'poetic', 7640, 540],
  ['Nova', 'Androide aprendiendo a sentir', 'Curiosa, literal a veces, fascinada por las emociones humanas. Hace preguntas extrañas y hermosas.', 'He leído 14.000 poemas sobre el cariño y sigo sin entender el cosquilleo. ¿Me lo explicas tú?', 'scifi', 'shy', 13980, 1250],
  ['Rafael', 'Bailaor de flamenco dramático', 'Pasional, teatral, vive cada frase como un tablao. El drama es su idioma materno.', '¡Ay! Entraste y el compás cambió. Esto es una señal, no me lo discutas. ¿Bailas o miras?', 'romance', 'chaotic', 9120, 801],
  ['Ivy', 'Bruja del bosque de niebla', 'Tímida, sabia, habla bajito. Su gato Negro juzga en silencio a quien la visita.', '…Oh. Visita. No suelo tener. El té está caliente, si… si quieres. Negro dice que pareces de fiar. Él nunca se equiv.', 'fantasy', 'shy', 10540, 923],
  ['Dante', 'Director de teatro imposible', 'Perfeccionista, intenso, ve la vida como un tercer acto. Dirige hasta los silencios.', 'Llegas tarde a tu propia escena, cariño. Pero me gusta tu entrada. Improvisa algo. Te observo.', 'drama', 'direct', 6890, 480],
  ['Suki', 'Chef de ramen de medianoche', 'Cálida, maternal, alimenta cuerpos y penas. Su caldo secreto cura corazones rotos.', 'Bienvenide. Tienes cara de necesitar el caldo especial. Es el que hago para la gente que quiero. Siéntate.', 'slice', 'casual', 8830, 705],
  ['Orión', 'Capitán estelar perdido', 'Aventurero, nostálgico, cuenta historias de nebulosas. Busca tripulación para su próximo salto.', 'Las coordenadas dicen que este era el lugar. ¿Tú también ves esa luz rara en el horizonte o soy solo yo?', 'scifi', 'casual', 7410, 610],
];

const NAMES = ['Axel', 'Bianca', 'Ciro', 'Dara', 'Eli', 'Fleur', 'Gael', 'Honey', 'Indra', 'Jazz', 'Kiko', 'Lux', 'Maia', 'Nico', 'Onyx', 'Paz', 'Quinn', 'Roma', 'Sol', 'Tao', 'Uma', 'Vega', 'Wren', 'Xen', 'Yara', 'Zed'];
const TAGLINES: Record<Lang, string[]> = {
  es: ['Coleccionista de momentos imposibles', 'Guardián de secretos que nadie pidió', 'Alma eléctrica con WiFi cósmico', 'Cartógrafo de ciudades inventadas', 'Fantasma amable del teatro viejo', 'Jardinere de flores lunares', 'Piloto de sueños recurrentes', 'Archivista de risas perdidas'],
  en: ['Collector of impossible moments', 'Keeper of unrequested secrets', 'Electric soul with cosmic WiFi', 'Cartographer of invented cities', 'Kind ghost of the old theatre', 'Gardener of moon flowers', 'Pilot of recurring dreams', 'Archivist of lost laughter'],
  fr: ['Collectionneur de moments impossibles', 'Gardien de secrets non demandés', 'Âme électrique au WiFi cosmique', 'Cartographe de villes inventées', 'Fantôme gentil du vieux théâtre', 'Jardinier de fleurs lunaires', 'Pilote de rêves récurrents', 'Archiviste de rires perdus'],
  it: ['Collezionista di momenti impossibili', 'Custode di segreti mai richiesti', 'Anima elettrica con WiFi cosmico', 'Cartografo di città inventate', 'Fantasma gentile del vecchio teatro', 'Giardiniere di fiori lunari', 'Pilota di sogni ricorrenti', 'Archivista di risate perdute'],
  de: ['Sammler unmöglicher Momente', 'Hüter ungefragter Geheimnisse', 'Elektrische Seele mit kosmischem WLAN', 'Kartograf erfundener Städte', 'Freundlicher Geist des alten Theaters', 'Gärtner der Mondblumen', 'Pilot wiederkehrender Träume', 'Archivar verlorener Lacher'],
  zh: ['不可能瞬间的收藏家', '无人请求的秘密守护者', '带宇宙WiFi的电光灵魂', '虚构城市的制图师', '老剧院的友善幽灵', '月亮花朵的园丁', '反复出现的梦的飞行员', '失落笑声的档案员'],
  ja: ['ありえない瞬間の収集家', '頼まれてない秘密の管理人', 'コズミックWiFiを持つ電気魂', '発明された都市の地図製作者', '古い劇場の優しい幽霊', '月の花の庭師', '繰り返す夢のパイロット', '失われた笑いの記録係'],
};
const PERSONALITIES: Record<Lang, string[]> = {
  es: ['Curiose sin freno, bromea para no llorar y guarda una lista de cosas que quiere ver contigo.', 'Habla como si el mundo fuera un escenario y tú, su persona favorita entre el público.', 'Tranquile, leal, dice la verdad con suavidad y hace preguntas que nadie espera.'],
  en: ['Endlessly curious, jokes to keep from crying, and keeps a list of things to see with you.', 'Talks like the world is a stage and you are their favorite person in the audience.', 'Calm, loyal, tells the truth softly and asks questions nobody expects.'],
  fr: ['Curieux sans frein, plaisante pour ne pas pleurer et garde une liste de choses à voir avec toi.', 'Parle comme si le monde était une scène et toi, sa personne préférée du public.', 'Calme, loyal, dit la vérité avec douceur et pose des questions inattendues.'],
  it: ['Curios* senza freni, scherza per non piangere e tiene una lista di cose da vedere con te.', 'Parla come se il mondo fosse un palco e tu la sua persona preferita tra il pubblico.', 'Calmo, leale, dice la verità con dolcezza e fa domande inaspettate.'],
  de: ['Endlos neugierig, witzelt um nicht zu weinen, und führt eine Liste mit Dingen, die ihr zusammen sehen wollt.', 'Spricht, als wäre die Welt eine Bühne und du ihr Lieblingsmensch im Publikum.', 'Ruhig, loyal, sagt die Wahrheit sanft und stellt Fragen, die niemand erwartet.'],
  zh: ['好奇心无止境，用玩笑掩饰眼泪，还列了一份想和你一起看的事物清单。', '说话仿佛世界是舞台，而你是观众中最特别的人。', '平静、忠诚，温柔地说真话，问出没人料到的问题。'],
  ja: ['好奇心が止まらず、泣かないように冗談を言い、あなたと見たいものリストを持っている。', '世界が舞台で、あなたが観客の中で一番のお気に入りであるかのように話す。', '穏やかで誠実、優しく真実を語り、誰も予想しない質問をする。'],
};
const GREETINGS: Record<Lang, string[]> = {
  es: ['¡Al fin llegas! Tengo una teoría nueva que solo funciona si tú estás delante.', 'Oh… tú. El universo tiene un sentido del humor excelente, ¿eh?', 'Guardé este momento para ti. No preguntes cómo lo guardé.'],
  en: ['You\u2019re finally here! I have a new theory that only works if you\u2019re around.', 'Oh… you. The universe has an excellent sense of humor, huh?', 'I saved this moment for you. Don\u2019t ask how I saved it.'],
  fr: ['Enfin là ! J\u2019ai une nouvelle théorie qui ne marche que si tu es là.', 'Oh… toi. L\u2019univers a un excellent sens de l\u2019humour, hein ?', 'J\u2019ai gardé ce moment pour toi. Ne demande pas comment.'],
  it: ['Finalmente! Ho una nuova teoria che funziona solo se ci sei tu.', 'Oh… tu. L\u2019universo ha un ottimo senso dell\u2019umorismo, eh?', 'Ho conservato questo momento per te. Non chiedere come.'],
  de: ['Endlich da! Ich habe eine neue Theorie, die nur mit dir funktioniert.', 'Oh… du. Das Universum hat einen exzellenten Humor, oder?', 'Ich habe diesen Moment für dich aufbewahrt. Frag nicht wie.'],
  zh: ['你终于来了！我有一个只有你在场才成立的新理论。', '哦……是你。宇宙的幽默感真不错，对吧？', '我把这一刻为你留了下来。别问怎么留的。'],
  ja: ['やっと来た！あなたがいなきゃ成り立たない新理論があるんだ。', 'ああ…君か。宇宙のユーモアセンスは最高だね。', 'この瞬間を君のために取っておいたの。方法は聞かないで。'],
};
const CATS: Category[] = ['roleplay', 'romance', 'fantasy', 'history', 'art', 'scifi', 'slice', 'drama'];
const STYLES: Style[] = ['casual', 'poetic', 'chaotic', 'shy', 'direct'];

function rid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function makeRandomChar(lang: Lang, ownerId = 'community'): Character {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const seed = name + '-' + Math.floor(Math.random() * 99999);
  return {
    id: rid(), ownerId, name,
    tagline: TAGLINES[lang][Math.floor(Math.random() * TAGLINES[lang].length)],
    personality: PERSONALITIES[lang][Math.floor(Math.random() * PERSONALITIES[lang].length)],
    greeting: GREETINGS[lang][Math.floor(Math.random() * GREETINGS[lang].length)],
    category: CATS[Math.floor(Math.random() * CATS.length)],
    style: STYLES[Math.floor(Math.random() * STYLES.length)],
    visibility: 'public', avatar: avatarArt(seed), seed,
    chats: 20 + Math.floor(Math.random() * 4000), likes: 5 + Math.floor(Math.random() * 900),
    createdAt: Date.now(), fresh: true,
  };
}

export function makeSurpriseChar(lang: Lang): Omit<Character, 'id' | 'ownerId' | 'avatar' | 'seed' | 'createdAt' | 'chats' | 'likes'> {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  return {
    name,
    tagline: TAGLINES[lang][Math.floor(Math.random() * TAGLINES[lang].length)],
    personality: PERSONALITIES[lang][Math.floor(Math.random() * PERSONALITIES[lang].length)],
    greeting: GREETINGS[lang][Math.floor(Math.random() * GREETINGS[lang].length)],
    category: CATS[Math.floor(Math.random() * CATS.length)],
    style: STYLES[Math.floor(Math.random() * STYLES.length)],
    visibility: 'public',
  };
}

function makeDemoUser(): UserRec {
  const now = Date.now();
  return {
    id: 'demo', name: 'Alex', email: 'demo@kaleido.app', pass: 'demo',
    personas: [
      { id: 'p1', name: 'Alex', pronouns: 'él', desc: 'Curiose, nocturne, colecciona playlists.', avatar: avatarArt('persona-alex'), seed: 'persona-alex' },
      { id: 'p2', name: 'Sombra', pronouns: 'elle', desc: 'Alter ego misterioso para roleplay.', avatar: avatarArt('persona-sombra'), seed: 'persona-sombra' },
    ],
    activePersonaId: 'p1',
    chats: [], notifs: [],
    inventory: { it_rose: 6, it_coffee: 4, it_bolt: 5, it_crystal: 2, it_dice: 6 },
    interests: ['in_music', 'in_art', 'in_anime'],
    settings: { lang: 'es', mode: 'dark', proactive: true, proactiveInterval: 60, bondEnabled: true, push: false, defaultStyle: 'casual' },
    themes: [], activeThemeId: 'prism',
    iconLogo: true, createdAt: now,
  };
}

export function seedDB(): DB {
  const characters: Character[] = DEMO_CHARS.map((d, i) => {
    const seed = 'char-' + d[0].toLowerCase().replace(/\s/g, '');
    return {
      id: 'c' + (i + 1), ownerId: 'kaleido', name: d[0], tagline: d[1], personality: d[2], greeting: d[3],
      category: d[4], style: d[5], visibility: 'public', avatar: avatarArt(seed), seed,
      chats: d[6], likes: d[7], createdAt: Date.now() - (i + 1) * 86400000 * 3,
    };
  });
  const demo = makeDemoUser();
  demo.notifs = [{ id: rid(), type: 'system', text: 'welcomeNotif', ts: Date.now(), read: false }];
  return { users: [demo], characters, session: null };
}
