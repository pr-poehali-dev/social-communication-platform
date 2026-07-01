import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PHOTO_1 = 'https://cdn.poehali.dev/projects/aceb0664-3776-45e4-829c-bbbdc5f1fcf2/files/e3506af5-ebb0-4927-ba0f-53d5edbb7fe2.jpg';
const PHOTO_2 = 'https://cdn.poehali.dev/projects/aceb0664-3776-45e4-829c-bbbdc5f1fcf2/files/ddcd54f1-cae6-4567-a476-0ec10b55dba8.jpg';

type Tab = 'feed' | 'messages' | 'friends' | 'notifications' | 'profile';

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'feed', icon: 'House', label: 'Лента' },
  { id: 'messages', icon: 'MessageCircle', label: 'Сообщения' },
  { id: 'friends', icon: 'Users', label: 'Друзья' },
  { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
];

const EMOJI_POOL = ['🌿', '🎧', '🌸', '🏔️', '☕', '📷', '🌙', '🔥', '🍋', '🎨', '🐝', '🌊'];

type Story = { name: string; emoji: string; own?: boolean };
type Post = { id: number; name: string; handle: string; emoji: string; time: string; text: string; image: string | null; likes: number; liked: boolean; comments: number };
type Msg = { from: 'me' | 'them'; text: string; time: string };
type Chat = { id: number; name: string; emoji: string; online: boolean; messages: Msg[] };
type Friend = { id: number; name: string; emoji: string; mutual: number; online: boolean };

const INIT_STORIES: Story[] = [
  { name: 'Вы', emoji: '✨', own: true },
  { name: 'Аня', emoji: '🌿' },
  { name: 'Марк', emoji: '🎧' },
  { name: 'Лена', emoji: '🌸' },
  { name: 'Дима', emoji: '🏔️' },
  { name: 'Соня', emoji: '☕' },
  { name: 'Кир', emoji: '📷' },
];

const INIT_POSTS: Post[] = [
  { id: 1, name: 'Анна Соколова', handle: '@anna', emoji: '🌿', time: '12 мин', text: 'Нашла идеальное место для утреннего кофе. Тишина, свет и ничего лишнего — именно так должно начинаться утро.', image: PHOTO_1, likes: 248, liked: false, comments: 32 },
  { id: 2, name: 'Дмитрий Орлов', handle: '@dmitry', emoji: '🏔️', time: '1 ч', text: 'Рассвет в горах напоминает, как мало нужно для счастья. Просто быть здесь.', image: PHOTO_2, likes: 512, liked: false, comments: 64 },
  { id: 3, name: 'Лена Ким', handle: '@lena', emoji: '🌸', time: '3 ч', text: 'Минимализм — это не про пустоту. Это про пространство для важного.', image: null, likes: 96, liked: false, comments: 18 },
];

const INIT_CHATS: Chat[] = [
  { id: 1, name: 'Анна Соколова', emoji: '🌿', online: true, messages: [{ from: 'them', text: 'Привет! Идём завтра на кофе?', time: '12:38' }, { from: 'me', text: 'Конечно, во сколько?', time: '12:39' }, { from: 'them', text: 'Договорились, до завтра!', time: '12:40' }] },
  { id: 2, name: 'Марк Лебедев', emoji: '🎧', online: true, messages: [{ from: 'them', text: 'Скинул новый плейлист 🎶', time: '11:05' }] },
  { id: 3, name: 'Лена Ким', emoji: '🌸', online: false, messages: [{ from: 'them', text: 'Как продвигается проект?', time: '09:22' }] },
  { id: 4, name: 'Дима Орлов', emoji: '🏔️', online: false, messages: [{ from: 'them', text: 'Ты видел эти фотки?', time: 'Вчера' }] },
];

const INIT_FRIENDS: Friend[] = [
  { id: 1, name: 'Анна Соколова', emoji: '🌿', mutual: 12, online: true },
  { id: 2, name: 'Марк Лебедев', emoji: '🎧', mutual: 8, online: true },
  { id: 3, name: 'Лена Ким', emoji: '🌸', mutual: 23, online: false },
  { id: 4, name: 'Дмитрий Орлов', emoji: '🏔️', mutual: 5, online: false },
  { id: 5, name: 'Соня Белова', emoji: '☕', mutual: 17, online: true },
  { id: 6, name: 'Кирилл Новак', emoji: '📷', mutual: 3, online: false },
];

const NOTIFS = [
  { emoji: '🌸', name: 'Лена Ким', action: 'оценила вашу публикацию', time: '2 мин', icon: 'Heart' },
  { emoji: '🎧', name: 'Марк Лебедев', action: 'прокомментировал: «Отлично!»', time: '18 мин', icon: 'MessageCircle' },
  { emoji: '🌿', name: 'Анна Соколова', action: 'начала на вас подписываться', time: '1 ч', icon: 'UserPlus' },
  { emoji: '☕', name: 'Соня Белова', action: 'добавила вас в друзья', time: '4 ч', icon: 'UserCheck' },
];

function nowTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ emoji, size = 44 }: { emoji: string; size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full bg-secondary shrink-0" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {emoji}
    </div>
  );
}

/* ---------- Модальное окно ---------- */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/60 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Лента ---------- */
function Feed({ stories, posts, onAddStory, onCreate, onLike, onOpenComments }: {
  stories: Story[]; posts: Post[]; onAddStory: () => void;
  onCreate: (text: string) => void; onLike: (id: number) => void; onOpenComments: (p: Post) => void;
}) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-3xl border border-border/60 p-5">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {stories.map((s, i) => (
            <button key={s.name + i} onClick={s.own ? onAddStory : () => toast(`История · ${s.name}`)}
              className="flex flex-col items-center gap-2 shrink-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
              <div className={`p-[2px] rounded-full ${s.own ? 'bg-border' : 'story-ring'} hover-scale`}>
                <div className="p-[2px] bg-card rounded-full">
                  <div className="relative">
                    <Avatar emoji={s.emoji} size={60} />
                    {s.own && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center border-2 border-card">
                        <Icon name="Plus" size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground max-w-[64px] truncate">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/60 p-4 flex items-center gap-3">
        <Avatar emoji="😊" />
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onCreate(text); setText(''); } }}
          placeholder="Что нового?" className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-[15px]" />
        <button onClick={() => { if (text.trim()) { onCreate(text); setText(''); } }}
          className="flex items-center gap-2 bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all">
          <Icon name="ImagePlus" size={16} /> Пост
        </button>
      </div>

      {posts.map((p, i) => (
        <article key={p.id} className="bg-card rounded-3xl border border-border/60 p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
          <header className="flex items-center gap-3 mb-4">
            <Avatar emoji={p.emoji} />
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.handle} · {p.time}</p>
            </div>
            <button onClick={() => toast('Пост скрыт из ленты')} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="MoreHorizontal" size={20} />
            </button>
          </header>
          <p className="text-[15px] leading-relaxed mb-4">{p.text}</p>
          {p.image && (
            <div className="rounded-2xl overflow-hidden mb-4 border border-border/60">
              <img src={p.image} alt="" className="w-full h-72 object-cover hover-scale" />
            </div>
          )}
          <footer className="flex items-center gap-6 text-muted-foreground">
            <button onClick={() => onLike(p.id)} className={`flex items-center gap-2 text-sm transition-colors ${p.liked ? 'text-accent' : 'hover:text-foreground'}`}>
              <Icon name="Heart" size={19} className={p.liked ? 'fill-accent' : ''} /> {p.likes}
            </button>
            <button onClick={() => onOpenComments(p)} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
              <Icon name="MessageCircle" size={19} /> {p.comments}
            </button>
            <button onClick={() => toast('Ссылка на пост скопирована')} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
              <Icon name="Send" size={19} />
            </button>
            <button onClick={() => toast('Сохранено в закладки')} className="ml-auto hover:text-foreground transition-colors">
              <Icon name="Bookmark" size={19} />
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}

/* ---------- Сообщения + окно чата ---------- */
function ChatWindow({ chat, onBack, onSend }: { chat: Chat; onBack: () => void; onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat.messages.length]);
  return (
    <div className="bg-card rounded-3xl border border-border/60 flex flex-col h-[70vh] animate-fade-in overflow-hidden">
      <header className="flex items-center gap-3 p-4 border-b border-border/60">
        <button onClick={onBack} className="hover:bg-secondary rounded-full p-1.5 transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <Avatar emoji={chat.emoji} size={40} />
        <div>
          <p className="font-medium leading-tight">{chat.name}</p>
          <p className="text-xs text-muted-foreground">{chat.online ? 'в сети' : 'был(а) недавно'}</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
        {chat.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm animate-scale-in ${m.from === 'me' ? 'bg-foreground text-background rounded-br-md' : 'bg-secondary text-foreground rounded-bl-md'}`}>
              {m.text}
              <span className={`block text-[10px] mt-1 ${m.from === 'me' ? 'text-background/60' : 'text-muted-foreground'}`}>{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <footer className="p-3 border-t border-border/60 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onSend(text); setText(''); } }}
          placeholder="Сообщение…" className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
        <button onClick={() => { if (text.trim()) { onSend(text); setText(''); } }}
          className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
          <Icon name="Send" size={18} />
        </button>
      </footer>
    </div>
  );
}

function Messages({ chats, onOpen, onAdd }: { chats: Chat[]; onOpen: (c: Chat) => void; onAdd: () => void }) {
  return (
    <div className="bg-card rounded-3xl border border-border/60 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <h2 className="font-display text-3xl">Сообщения</h2>
        <button onClick={onAdd} className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
          <Icon name="Plus" size={20} />
        </button>
      </div>
      {chats.map((c) => {
        const last = c.messages[c.messages.length - 1];
        return (
          <button key={c.id} onClick={() => onOpen(c)} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0 text-left">
            <div className="relative">
              <Avatar emoji={c.emoji} size={52} />
              {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{c.name}</p>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{last?.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{last?.from === 'me' ? 'Вы: ' : ''}{last?.text}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Друзья ---------- */
function Friends({ friends, onAdd, onMessage }: { friends: Friend[]; onAdd: () => void; onMessage: (f: Friend) => void }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-3xl">Друзья</h2>
        <button onClick={onAdd} className="flex items-center gap-2 text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all">
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {friends.map((f, i) => (
          <div key={f.id} className="bg-card rounded-3xl border border-border/60 p-5 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
            <div className="relative">
              <Avatar emoji={f.emoji} size={56} />
              {f.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.mutual} общих друзей</p>
            </div>
            <button onClick={() => onMessage(f)} className="text-sm font-medium px-4 py-2 rounded-full bg-secondary hover:bg-border active:scale-95 transition-all">
              Написать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Уведомления ---------- */
function Notifications() {
  return (
    <div className="bg-card rounded-3xl border border-border/60 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <h2 className="font-display text-3xl">Уведомления</h2>
        <button onClick={() => toast('Все отмечены как прочитанные')} className="text-sm text-accent font-medium hover:opacity-80 transition-opacity">
          Прочитать всё
        </button>
      </div>
      {NOTIFS.map((n, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border/40 last:border-0 hover:bg-secondary/40 transition-colors">
          <div className="relative">
            <Avatar emoji={n.emoji} />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center border-2 border-card">
              <Icon name={n.icon} size={13} />
            </span>
          </div>
          <p className="flex-1 text-sm leading-snug">
            <span className="font-medium">{n.name}</span> <span className="text-muted-foreground">{n.action}</span>
          </p>
          <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Профиль ---------- */
function Profile() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-accent/20 via-secondary to-secondary" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-card flex items-center justify-center text-5xl">😊</div>
          </div>
          <h2 className="font-display text-3xl leading-none">Александр Юрьев</h2>
          <p className="text-muted-foreground text-sm mt-1">@alex · Москва</p>
          <p className="text-[15px] leading-relaxed mt-4 max-w-md">Дизайнер и любитель тишины. Создаю простые вещи, которые приятно использовать.</p>
          <div className="flex gap-8 mt-5">
            {[['128', 'Постов'], ['2.4k', 'Подписчиков'], ['312', 'Подписок']].map(([n, l]) => (
              <div key={l}><p className="font-display text-2xl leading-none">{n}</p><p className="text-xs text-muted-foreground mt-1">{l}</p></div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => toast('Редактирование профиля скоро появится')} className="flex-1 bg-foreground text-background font-medium py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
              Редактировать
            </button>
            <button onClick={() => toast('Настройки открыты')} className="px-4 py-2.5 rounded-full border border-border hover:bg-secondary active:scale-95 transition-all">
              <Icon name="Settings" size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[PHOTO_1, PHOTO_2, PHOTO_1, PHOTO_2, PHOTO_1, PHOTO_2].map((src, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border/60">
            <img src={src} alt="" className="w-full h-full object-cover hover-scale" />
          </div>
        ))}
      </div>
    </div>
  );
}

const Index = () => {
  const [tab, setTab] = useState<Tab>('feed');
  const [search, setSearch] = useState('');
  const [stories, setStories] = useState(INIT_STORIES);
  const [posts, setPosts] = useState(INIT_POSTS);
  const [chats, setChats] = useState(INIT_CHATS);
  const [friends, setFriends] = useState(INIT_FRIENDS);
  const [openChat, setOpenChat] = useState<Chat | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const goTo = (t: Tab) => { setTab(t); setOpenChat(null); };

  const addStory = () => {
    setStories((s) => [s[0], { name: 'Я сейчас', emoji: '📸' }, ...s.slice(1)]);
    toast('История опубликована ✨');
  };

  const createPost = (text: string) => {
    setPosts((p) => [{ id: Date.now(), name: 'Александр Юрьев', handle: '@alex', emoji: '😊', time: 'только что', text, image: null, likes: 0, liked: false, comments: 0 }, ...p]);
    toast('Пост опубликован');
  };

  const likePost = (id: number) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x));

  const openChatFor = (c: Chat) => { setOpenChat(c); };

  const sendMsg = (text: string) => {
    if (!openChat) return;
    const updated: Chat = { ...openChat, messages: [...openChat.messages, { from: 'me', text, time: nowTime() }] };
    setOpenChat(updated);
    setChats((cs) => cs.map((c) => c.id === updated.id ? updated : c));
    setTimeout(() => {
      const reply: Msg = { from: 'them', text: 'Понял тебя! 🙂', time: nowTime() };
      setOpenChat((cur) => cur && cur.id === updated.id ? { ...cur, messages: [...cur.messages, reply] } : cur);
      setChats((cs) => cs.map((c) => c.id === updated.id ? { ...c, messages: [...c.messages, reply] } : c));
    }, 1100);
  };

  const messageFriend = (f: Friend) => {
    const existing = chats.find((c) => c.name === f.name);
    if (existing) { setTab('messages'); setOpenChat(existing); return; }
    const chat: Chat = { id: Date.now(), name: f.name, emoji: f.emoji, online: f.online, messages: [] };
    setChats((cs) => [chat, ...cs]);
    setTab('messages'); setOpenChat(chat);
  };

  const addContact = () => {
    const name = newName.trim();
    if (!name) return;
    const emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    const id = Date.now();
    setFriends((fs) => [{ id, name, emoji, mutual: 0, online: true }, ...fs]);
    setChats((cs) => [{ id: id + 1, name, emoji, online: true, messages: [] }, ...cs]);
    setNewName(''); setShowAdd(false);
    toast(`${name} добавлен(а) в контакты`);
  };

  const filtered = search.trim()
    ? posts.filter((p) => (p.text + p.name + p.handle).toLowerCase().includes(search.toLowerCase()))
    : posts;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => goTo('feed')} className="font-display text-2xl tracking-tight mr-auto select-none">
            tihо<span className="text-accent">.</span>
          </button>
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 flex-1 max-w-xs">
            <Icon name="Search" size={16} className="text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); if (e.target.value) setTab('feed'); }}
              placeholder="Поиск людей и постов" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
            {search && <button onClick={() => setSearch('')}><Icon name="X" size={15} className="text-muted-foreground" /></button>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-6">
        <div className="md:flex md:gap-6">
          <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0 sticky top-24 self-start">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${tab === n.id ? 'bg-foreground text-background' : 'hover:bg-secondary text-foreground'}`}>
                <Icon name={n.icon} size={20} />
                <span className="text-sm font-medium">{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            {tab === 'feed' && <Feed stories={stories} posts={filtered} onAddStory={addStory} onCreate={createPost} onLike={likePost} onOpenComments={(p) => toast(`Комментарии · ${p.comments}`)} />}
            {tab === 'messages' && (openChat
              ? <ChatWindow chat={openChat} onBack={() => setOpenChat(null)} onSend={sendMsg} />
              : <Messages chats={chats} onOpen={openChatFor} onAdd={() => setShowAdd(true)} />)}
            {tab === 'friends' && <Friends friends={friends} onAdd={() => setShowAdd(true)} onMessage={messageFriend} />}
            {tab === 'notifications' && <Notifications />}
            {tab === 'profile' && <Profile />}
          </div>
        </div>
      </main>

      <button onClick={() => setShowAdd(true)}
        className="md:hidden fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="UserPlus" size={24} />
      </button>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border/60">
        <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => goTo(n.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors ${tab === n.id ? 'text-accent' : 'text-muted-foreground'}`}>
              <Icon name={n.icon} size={22} />
              <span className="text-[10px]">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showAdd && (
        <Modal title="Добавить контакт" onClose={() => { setShowAdd(false); setNewName(''); }}>
          <p className="text-sm text-muted-foreground mb-4">Введите имя или @никнейм человека, которого хотите добавить.</p>
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addContact(); }}
            placeholder="Например: Мария Иванова" className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground mb-4" />
          <button onClick={addContact} disabled={!newName.trim()}
            className="w-full bg-foreground text-background font-medium py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100">
            Добавить и начать чат
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Index;
