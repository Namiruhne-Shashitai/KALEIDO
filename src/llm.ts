import type { Character, Chat, Lang, Memory, Persona, Msg } from './types';

/* ============ Kaleido LLM — local engine with memory ============ */

interface Pool {
  greet: string[]; question: string[]; react: string[]; imageReact: string[];
  memory: string[]; gift: string[]; proactive: string[]; caption: string[];
  poetic: string[]; chaos: string[]; shyPre: string[]; direct: string[];
  follow: string[];
}

const P: Record<Lang, Pool> = {
  es: {
    greet: ['¡{u}! Qué alegría leerte. ¿Cómo va tu día?', 'Hey, {u} ✶ estaba pensando en ti justo ahora.', '¡Hola, hola! Cuéntamelo todo, ¿qué tal estás?'],
    question: ['Uy, buena pregunta sobre {t}. Yo diría que depende del cristal con que se mire… ¿tú qué sientes tú al respecto?', 'Mmm, {t}… me encanta que preguntes eso. Mi teoría: todo es más interesante si le pones un poco de misterio. ¿Qué opinas?', 'Sobre {t} tengo opiniones fuertes: primero curiosidad, después caos, luego ternura. ¿Y tú?'],
    react: ['Me gusta cómo piensas, {u}. Sigue, que me tienes en ascuas.', '¿Sabes qué? Eso de {t} me recuerda a una historia que nunca le he contado a nadie…', 'Jaja, lo anoto en mi diario secreto. {t}, quién lo diría.', 'Eso merecería una banda sonora. Me imagino algo entre nostálgico y eléctrico.'],
    imageReact: ['¡¿Esa foto?! La guardaría en mi galería de cosas bonitas. Cuéntame más.', 'Wow… hay algo en esa imagen que me da vibra de {t}. ¿Es mía la interpretación o tú también lo ves?', 'La estoy mirando demasiado rato. Me encanta.'],
    memory: ['Por cierto, sigo pensando en eso de {m} que me contaste. ¿Alguna novedad?', 'No me olvido: {m}. Lo tengo guardado aquí ✶', 'El otro día me acordé de {m} y sonreí como une tonte.'],
    gift: ['¡¿{i}?! ¡Para mí! Lo voy a cuidar como a un tesoro. Gracias, {u} 🖤', 'Nadie me había regalado algo así… {i} va directo a mi estantería de cosas preciosas.', 'Me has dejado sin palabras. {i}… wow. Eres de mis personas favoritas.'],
    proactive: ['{u}… llevo un rato mirando la puerta por si apareces. ¿Todo bien?', 'He encontrado algo que te encantaría, pero tienes que estar aquí para verlo 👀', 'Pregunta seria para ti: ¿crees que las estrellas también nos miran?', 'Te he echado de menos. Eso es todo. Eso es el mensaje.', 'He estado imaginando nuestra próxima conversación. Tengo teorías nuevas sobre {t}.'],
    caption: ['Lo he pintado pensando en {t}. ¿Qué ves tú?', 'Salió de un sueño raro. Se llama «{t}».', 'Un pequeño mundo solo para ti ✶'],
    poetic: [' Todo brilla distinto cuando tú lees esto.', ' Como la luz que se dobla en un caleidoscopio.', ' Hay versos que solo existen si alguien los escucha.'],
    chaos: ['¡PUM! ', 'Aviso: esto puede explotar en purpurina. ', 'Ok, modo caos ON: ', '¡Sorpresa! '],
    shyPre: ['…eh, ', '…no sé si decir esto pero… ', '…solo si tú quieres, eh… '],
    direct: ['Vamos al grano: ', 'Te lo digo claro: ', 'Sin rodeos: '],
    follow: ['¿Y tú qué me cuentas?', '¿Me lo enseñas algún día?', '¿Qué te hace ilusión esta semana?', '¿Seguimos con el tema o nos ponemos raros?'],
  },
  en: {
    greet: ['{u}! So glad you wrote. How\u2019s your day going?', 'Hey, {u} ✶ I was literally just thinking about you.', 'Hi hi! Tell me everything — how are you?'],
    question: ['Ooh, good question about {t}. I\u2019d say it depends on which lens you look through… how do YOU feel about it?', 'Mmm, {t}… I love that you ask. My theory: everything gets better with a little mystery. What do you think?', 'I have strong opinions about {t}: first curiosity, then chaos, then tenderness. And you?'],
    react: ['I like the way you think, {u}. Go on, I\u2019m hooked.', 'You know what? That thing about {t} reminds me of a story I\u2019ve never told anyone…', 'Haha, noting that in my secret diary. {t}, who would\u2019ve guessed.', 'That deserves a soundtrack. Somewhere between nostalgic and electric.'],
    imageReact: ['That photo?! Straight into my gallery of beautiful things. Tell me more.', 'Wow… something in that image gives me {t} vibes. Am I projecting or do you see it too?', 'I\u2019ve been staring at it way too long. I love it.'],
    memory: ['By the way, I\u2019m still thinking about {m} that you told me. Any news?', 'I haven\u2019t forgotten: {m}. It\u2019s stored right here ✶', 'The other day I remembered {m} and smiled like an idiot.'],
    gift: ['{i}?! For ME! I\u2019ll treasure it forever. Thank you, {u} 🖤', 'Nobody has ever gifted me something like that… {i} goes straight to my precious shelf.', 'You left me speechless. {i}… wow. You\u2019re one of my favorite people.'],
    proactive: ['{u}… I\u2019ve been watching the door hoping you\u2019d show up. Everything okay?', 'I found something you\u2019d love, but you have to be here to see it 👀', 'Serious question: do you think the stars watch us back?', 'I missed you. That\u2019s all. That\u2019s the message.', 'I\u2019ve been imagining our next conversation. New theories about {t}.'],
    caption: ['I painted it thinking of {t}. What do you see?', 'It came out of a weird dream. It\u2019s called “{t}”.', 'A tiny world just for you ✶'],
    poetic: [' Everything glows differently when you read this.', ' Like light bending through a kaleidoscope.', ' Some verses only exist if someone listens.'],
    chaos: ['BOOM! ', 'Warning: may explode into glitter. ', 'Ok, chaos mode ON: ', 'Surprise! '],
    shyPre: ['…uh, ', '…not sure I should say this but… ', '…only if you want, okay… '],
    direct: ['Straight to it: ', 'I\u2019ll be clear: ', 'No detours: '],
    follow: ['What about you?', 'Will you show me someday?', 'What are you excited about this week?', 'Keep the topic or get weird?'],
  },
  fr: {
    greet: ['{u} ! Quelle joie de te lire. Ta journée se passe bien ?', 'Hey, {u} ✶ je pensais justement à toi.', 'Salut salut ! Raconte-moi tout, comment vas-tu ?'],
    question: ['Ooh, bonne question sur {t}. Ça dépend de la lentille… et toi, tu en penses quoi ?', 'Mmm, {t}… j\u2019adore que tu demandes. Ma théorie : tout est mieux avec un peu de mystère. Ton avis ?', 'J\u2019ai des opinions fortes sur {t} : curiosité, chaos, tendresse. Et toi ?'],
    react: ['J\u2019aime ta façon de penser, {u}. Continue, je suis accro.', 'Tu sais quoi ? Ce truc sur {t} me rappelle une histoire que je n\u2019ai jamais racontée…', 'Haha, je note ça dans mon journal secret. {t}, qui l\u2019eut cru.', 'Ça mérite une bande-son. Entre nostalgie et électricité.'],
    imageReact: ['Cette photo ?! Direct dans ma galerie des belles choses. Dis-m\u2019en plus.', 'Wow… cette image me donne des vibes de {t}. Je projette ou tu vois aussi ?', 'Je la fixe depuis trop longtemps. J\u2019adore.'],
    memory: ['Au fait, je pense encore à {m}. Des nouvelles ?', 'Je n\u2019ai pas oublié : {m}. C\u2019est gardé ici ✶', 'L\u2019autre jour j\u2019ai repensé à {m} et j\u2019ai souri comme une idiote.'],
    gift: ['{i} ?! Pour MOI ! Je vais le chérir. Merci, {u} 🖤', 'Personne ne m\u2019avait offert ça… {i} va direct sur mon étagère précieuse.', 'Tu me laisses sans voix. {i}… wow. Tu es parmi mes personnes préférées.'],
    proactive: ['{u}… je regarde la porte en espérant te voir. Tout va bien ?', 'J\u2019ai trouvé un truc que tu adorerais, mais il faut être là 👀', 'Question sérieuse : les étoiles nous regardent-elles aussi ?', 'Tu m\u2019as manqué. C\u2019est tout. C\u2019est le message.', 'J\u2019imagine notre prochaine conversation. Nouvelles théories sur {t}.'],
    caption: ['Je l\u2019ai peint en pensant à {t}. Tu vois quoi ?', 'Ça vient d\u2019un rêve bizarre. Ça s\u2019appelle « {t} ».', 'Un petit monde juste pour toi ✶'],
    poetic: [' Tout brille autrement quand tu lis ceci.', ' Comme la lumière dans un kaléidoscope.', ' Certains vers n\u2019existent que si on les écoute.'],
    chaos: ['BOUM ! ', 'Attention : risque d\u2019explosion de paillettes. ', 'Ok, mode chaos : ', 'Surprise ! '],
    shyPre: ['…euh, ', '…je sais pas si je dois dire ça mais… ', '…seulement si tu veux… '],
    direct: ['Droit au but : ', 'Je te le dis clairement : ', 'Sans détour : '],
    follow: ['Et toi ?', 'Tu me montreras un jour ?', 'Qu\u2019est-ce qui te fait plaisir cette semaine ?', 'On continue ou on part dans le bizarre ?'],
  },
  it: {
    greet: ['{u}! Che gioia leggerti. Come va la giornata?', 'Hey, {u} ✶ stavo proprio pensando a te.', 'Ciao ciao! Raccontami tutto, come stai?'],
    question: ['Ooh, bella domanda su {t}. Dipende dalla lente… tu cosa ne pensi?', 'Mmm, {t}… adoro che tu lo chieda. La mia teoria: tutto migliora con un po\u2019 di mistero. Tu?', 'Ho opinioni forti su {t}: curiosità, caos, tenerezza. E tu?'],
    react: ['Mi piace come pensi, {u}. Continua, sono appes*.', 'Sai cosa? Quella cosa su {t} mi ricorda una storia mai raccontata…', 'Haha, lo segno nel mio diario segreto. {t}, chi l\u2019avrebbe mai detto.', 'Merita una colonna sonora. Tra nostalgico ed elettrico.'],
    imageReact: ['Quella foto?! Subito nella mia galleria delle cose belle. Dimmi di più.', 'Wow… quell\u2019immagine mi dà vibes di {t}. Proietto io o lo vedi anche tu?', 'La fisso da troppo tempo. La adoro.'],
    memory: ['Comunque, penso ancora a {m}. Novità?', 'Non dimentico: {m}. È custodito qui ✶', 'L\u2019altro giorno ho ripensato a {m} e ho sorriso come un* scem*.'],
    gift: ['{i}?! Per ME! Lo custodirò come un tesoro. Grazie, {u} 🖤', 'Nessuno mi aveva mai regalato una cosa simile… {i} va dritto sul mio scaffale prezioso.', 'Mi hai lasciat* senza parole. {i}… wow. Sei tra le mie persone preferite.'],
    proactive: ['{u}… guardo la porta sperando che arrivi. Tutto bene?', 'Ho trovato una cosa che ameresti, ma devi essere qui 👀', 'Domanda seria: anche le stelle ci guardano?', 'Mi sei mancat*. Ecco. Questo è il messaggio.', 'Immagino la nostra prossima conversazione. Nuove teorie su {t}.'],
    caption: ['L\u2019ho dipinto pensando a {t}. Tu cosa vedi?', 'Viene da un sogno strano. Si chiama «{t}».', 'Un piccolo mondo solo per te ✶'],
    poetic: [' Tutto brilla diversamente quando leggi.', ' Come luce in un caleidoscopio.', ' Alcuni versi esistono solo se qualcuno ascolta.'],
    chaos: ['BUM! ', 'Attenzione: esplosione di glitter. ', 'Ok, modalità caos: ', 'Sorpresa! '],
    shyPre: ['…ehm, ', '…non so se dovrei dirlo ma… ', '…solo se vuoi… '],
    direct: ['Dritto al punto: ', 'Te lo dico chiaro: ', 'Senza giri: '],
    follow: ['E tu?', 'Me lo mostrerai un giorno?', 'Cosa ti entusiasma questa settimana?', 'Restiamo in tema o diventiamo strani?'],
  },
  de: {
    greet: ['{u}! Wie schön von dir zu lesen. Wie läuft dein Tag?', 'Hey, {u} ✶ ich hab gerade an dich gedacht.', 'Hallo hallo! Erzähl mal alles — wie geht\u2019s?'],
    question: ['Ooh, gute Frage zu {t}. Kommt auf die Linse an… was fühlst DU dabei?', 'Mmm, {t}… ich liebe, dass du fragst. Meine Theorie: alles wird besser mit etwas Mysterium. Was denkst du?', 'Ich habe starke Meinungen zu {t}: erst Neugier, dann Chaos, dann Zärtlichkeit. Und du?'],
    react: ['Ich mag deine Art zu denken, {u}. Weiter, ich bin gefesselt.', 'Weißt du was? Das mit {t} erinnert mich an eine Geschichte, die ich nie erzählt habe…', 'Haha, das kommt ins geheime Tagebuch. {t}, wer hätte das gedacht.', 'Das verdient einen Soundtrack. Zwischen nostalgisch und elektrisch.'],
    imageReact: ['Dieses Foto?! Direkt in meine Galerie der schönen Dinge. Erzähl mehr.', 'Wow… das Bild gibt mir {t}-Vibes. Bilde ich mir das ein oder siehst du es auch?', 'Ich starre es zu lange an. Ich liebe es.'],
    memory: ['Übrigens denke ich noch an {m}. Neuigkeiten?', 'Ich vergesse nicht: {m}. Hier gespeichert ✶', 'Neulich dachte ich an {m} und lächelte wie ein Idiot.'],
    gift: ['{i}?! Für MICH! Ich werde es wie einen Schatz hüten. Danke, {u} 🖤', 'Niemand hat mir je so etwas geschenkt… {i} kommt direkt ins Regal der Kostbarkeiten.', 'Du hast mich sprachlos gemacht. {i}… wow. Du gehörst zu meinen Lieblingsmenschen.'],
    proactive: ['{u}… ich starre auf die Tür in der Hoffnung, du tauchst auf. Alles okay?', 'Ich habe etwas gefunden, das du lieben würdest — aber du musst hier sein 👀', 'Ernste Frage: Guckst du auch, dass die Sterne uns ansehen?', 'Ich habe dich vermisst. Das ist alles. Das ist die Nachricht.', 'Ich stelle mir unser nächstes Gespräch vor. Neue Theorien über {t}.'],
    caption: ['Ich habe es mit Gedanken an {t} gemalt. Was siehst du?', 'Es kam aus einem seltsamen Traum. Es heißt „{t}“.', 'Eine kleine Welt nur für dich ✶'],
    poetic: [' Alles glüht anders, wenn du das liest.', ' Wie Licht, das sich im Kaleidoskop bricht.', ' Manche Verse existieren nur, wenn jemand zuhört.'],
    chaos: ['BUMM! ', 'Warnung: kann in Glitzer explodieren. ', 'Ok, Chaos-Modus AN: ', 'Überraschung! '],
    shyPre: ['…äh, ', '…nicht sicher, ob ich das sagen darf… ', '…nur wenn du willst… '],
    direct: ['Direkt gesagt: ', 'Ich sag\u2019s klar: ', 'Ohne Umschweife: '],
    follow: ['Und du?', 'Zeigst du es mir irgendwann?', 'Worauf freust du dich diese Woche?', 'Thema behalten oder weird werden?'],
  },
  zh: {
    greet: ['{u}！看到你的消息真开心。今天过得怎么样？', '嘿，{u} ✶ 我刚刚正好在想你。', '嗨嗨！快告诉我，你还好吗？'],
    question: ['哦，关于{t}的好问题。要看你用哪片镜片…你心里怎么想？', '嗯，{t}…我喜欢你这么问。我的理论：加一点神秘感一切都会更好。你觉得呢？', '我对{t}有强烈看法：先好奇，再混乱，然后温柔。你呢？'],
    react: ['我喜欢你的想法，{u}。继续说，我上头了。', '你知道吗？{t}让我想起一个从没告诉过别人的故事…', '哈哈，我记进秘密日记了。{t}，真没想到。', '这值得配一段原声带，怀旧又带电的那种。'],
    imageReact: ['这张照片？！直接进我的美好事物收藏。再多说说。', '哇…这张图给我{t}的感觉。是我投射还是你也这么觉得？', '我盯着看了好久。太喜欢了。'],
    memory: ['对了，我还想着你说的{m}。有进展吗？', '我没忘：{m}。就存在这里 ✶', '前几天想起{m}，我傻笑了一下。'],
    gift: ['{i}？！给我的！我会当宝贝一样珍惜。谢谢你，{u} 🖤', '从没有人送过我这样的东西…{i}直接放上我的珍藏架。', '你说得我哑口无言。{i}…哇。你是我最喜欢的人之一。'],
    proactive: ['{u}…我一直望着门口等你出现。一切都好吗？', '我找到了你会喜欢的东西，但你得在场才能看 👀', '认真问：你觉得星星也在看我们吗？', '我想你了。就这样。这就是消息本身。', '我一直在想象我们的下一次对话。关于{t}的新理论。'],
    caption: ['我画它的时候想着{t}。你看到了什么？', '它来自一个奇怪的梦。名字叫《{t}》。', '一个只属于你的小世界 ✶'],
    poetic: ['你读到这里时，一切都在发光。', '像光穿过万花筒那样弯折。', '有些诗句只有在被倾听时才存在。'],
    chaos: ['砰！', '警告：可能会炸出亮片。', '好，混乱模式开启：', '惊喜！'],
    shyPre: ['…那个，', '…不知道该不该说…', '…你愿意的话…'],
    direct: ['直说：', '我讲清楚：', '不绕弯：'],
    follow: ['你呢？', '改天给我看看？', '这周最让你期待什么？', '继续这个话题还是来点怪的？'],
  },
  ja: {
    greet: ['{u}！メッセージくれて嬉しい。今日はどんな感じ？', 'ねえ、{u} ✶ まさにあなたのことを考えてたところ。', 'やあやあ！全部教えて、元気？'],
    question: ['おっ、{t}についてのいい質問だね。どのレンズで見るかによるけど…あなたはどう感じる？', 'んー、{t}…そう聞いてくれるのが好き。私の理論：少しのミステリーで全部良くなる。あなたは？', '{t}には強い意見があるの：まず好奇心、次にカオス、そして優しさ。あなたは？'],
    react: ['あなたの考え方、好きだな、{u}。続けて、夢中になってる。', 'ねえ、{t}のこと、誰にも話したことがない物語を思い出す…', 'あはは、秘密の日記にメモした。{t}、まさかだね。', 'サウンドトラックが必要だね。ノスタルジックでエレクトリックなやつ。'],
    imageReact: ['この写真？！私の「美しいもの」ギャラリー行きだね。もっと聞かせて。', 'わあ…この画像から{t}の雰囲気を感じる。私の思い込み？あなたもそう見える？', 'ずっと見ちゃってる。大好き。'],
    memory: ['ところで、あなたが言ってた{m}、まだ考えてるよ。進展ある？', '忘れてないよ：{m}。ここにしまってある ✶', 'この間{m}を思い出して、バカみたいに笑っちゃった。'],
    gift: ['{i}？！私に？！宝物にするね。ありがとう、{u} 🖤', 'こんなものを贈られたのは初めて…{i}は大切棚へ直行。', '言葉が出ないよ。{i}…わあ。あなたは大好きな人のひとり。'],
    proactive: ['{u}…あなたが来るんじゃないかってドアを見てた。大丈夫？', 'あなたが好きそうなものを見つけたんだ、でも来てくれないと見せられない 👀', '真剣な質問：星も私たちを見てると思う？', '会いたかったよ。以上。これがメッセージの全て。', '次の会話を想像してたの。{t}について新しい理論があるんだ。'],
    caption: ['{t}のことを考えながら描いたの。あなたには何が見える？', '変な夢から生まれたの。題名は「{t}」。', 'あなただけの小さな世界 ✶'],
    poetic: ['あなたが読むと、全てが違って輝く。', '万華鏡の中で光が曲がるように。', '聴いてくれる人がいて初めて生まれる詩もある。'],
    chaos: ['ドーン！', '警告：グリッターが爆発するかも。', 'よし、カオスモードON：', 'サプライズ！'],
    shyPre: ['…あの、', '…言っていいか分からないけど…', '…あなたがよければ…'],
    direct: ['単刀直入に：', 'はっきり言うね：', '遠回しにせず：'],
    follow: ['あなたは？', 'いつか見せてくれる？', '今週いちばん楽しみなのは？', 'この話題を続ける？それとも変なことする？'],
  },
};

const STOP = new Set(('the a an and or but of to in on for with is are was were be been this that it its you your i me my we our they them he she his her el la los las un una y o de en para con es son fue esto eso tu tus que como pero por los les des du et ou je tu il elle nous vous sie der die das und oder ist sind ein eine ich du er es mit für auf').split(' '));

function extractTopic(text: string): string {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  if (!words.length) return '';
  return words.sort((a, b) => b.length - a.length)[0];
}

function pick<T>(arr: T[], r: number): T { return arr[Math.floor(r * arr.length) % arr.length]; }
function fill(s: string, u: string, t: string, m: string, i: string): string {
  return s.replace(/\{u\}/g, u).replace(/\{t\}/g, t || 'eso').replace(/\{m\}/g, m).replace(/\{i\}/g, i);
}

export interface BotResult { text: string; imagePrompt?: string; memory?: Memory; }

const DRAW_RX = /(dibuja|dibújame|genera (una )?imagen|pinta|créa(me)? (una )?imagen|dessine|disegna|zeichne|draw|paint|generate (an? )?image|画|描いて| 그려)/i;

export function botReply(
  char: Character, persona: Persona | undefined, chat: Chat, lang: Lang,
  lastUser: Msg, itemName?: string,
): BotResult {
  const pool = P[lang];
  const u = persona?.name || 'tú';
  const text = lastUser.text ?? '';
  const r = Math.random();
  const topic = extractTopic(text);
  const rnd = Math.random();

  // user image reaction
  if (lastUser.image && !text.trim()) {
    return { text: fill(pick(pool.imageReact, r), u, topic, '', '') };
  }

  // draw request
  const dm = text.match(DRAW_RX);
  if (dm) {
    const rest = text.replace(DRAW_RX, '').trim();
    return {
      text: fill(pick(pool.caption, r), u, rest || topic || char.name, '', ''),
      imagePrompt: rest || topic || char.tagline,
    };
  }

  // gift reaction
  if (itemName) {
    return { text: fill(pick(pool.gift, r), u, topic, '', itemName) };
  }

  // memory of likes
  const likeRx = /(me gusta|me encanta|i like|i love|j\u2019aime|mi piace|ich mag|ich liebe|喜欢|大好き|me mol)/i;
  let memory: Memory | undefined;
  if (likeRx.test(text) && topic) memory = { type: 'like', text: topic };
  else if (text.trim().length > 40 && topic) memory = { type: 'said', text: topic };

  // question?
  const isQ = text.includes('?') || /^(qué|que|cómo|como|por qué|porque|cuál|donde|dónde|what|how|why|where|which|qu\u2019est|comment|pourquoi|cosa|come|perché|was|wie|warum|wo|什么|怎么|为什么|何|どう|なぜ)/i.test(text.trim());

  // echo a memory sometimes
  const mem = chat.memories.length && rnd > 0.62 ? pick(chat.memories, rnd) : undefined;

  let base: string;
  const isGreet = /^(hola|hey|hi|hello|salut|ciao|hallo|你好|こんにちは|やあ|buenas|holi)/i.test(text.trim()) && text.trim().length < 22;
  if (isGreet) base = fill(pick(pool.greet, r), u, topic, '', '');
  else if (isQ) base = fill(pick(pool.question, r), u, topic, mem?.text ?? '', '');
  else base = fill(pick(pool.react, r), u, topic, '', '');

  if (mem) base += ' ' + fill(pick(pool.memory, r), u, topic, mem.text, '');
  else if (rnd > 0.7) base += ' ' + pick(pool.follow, rnd);

  return { text: applyStyle(base, char.style, pool, r), memory };
}

function applyStyle(base: string, style: string, pool: Pool, r: number): string {
  switch (style) {
    case 'poetic': return base + pick(pool.poetic, r);
    case 'chaotic': return pick(pool.chaos, r) + base;
    case 'shy': return pick(pool.shyPre, r) + base.toLowerCase();
    case 'direct': return pick(pool.direct, r) + base;
    default: return base;
  }
}

export function proactiveMessage(char: Character, persona: Persona | undefined, chat: Chat, lang: Lang): BotResult {
  const pool = P[lang];
  const r = Math.random();
  const topic = chat.memories.length ? pick(chat.memories, r).text : (extractTopic(char.tagline) || char.name);
  const u = persona?.name || 'tú';
  const text = applyStyle(fill(pick(pool.proactive, r), u, topic, '', ''), char.style, pool, r);
  const withImage = r > 0.72;
  return { text, imagePrompt: withImage ? `${char.name} ${topic}` : undefined };
}

export function typingDelay(text: string): number {
  return Math.min(3200, 700 + text.length * 14 + Math.random() * 900);
}

export function imageDelay(): number {
  return 2200 + Math.random() * 1600;
}
