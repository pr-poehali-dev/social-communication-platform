import { useState } from 'react';
import Icon from '@/components/ui/icon';

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

const STORIES = [
  { name: 'Вы', emoji: '✨', own: true },
  { name: 'Аня', emoji: '🌿' },
  { name: 'Марк', emoji: '🎧' },
  { name: 'Лена', emoji: '🌸' },
  { name: 'Дима', emoji: '🏔️' },
  { name: 'Соня', emoji: '☕' },
  { name: 'Кир', emoji: '📷' },
  { name: 'Ника', emoji: '🌙' },
];

const POSTS = [
  {
    name: 'Анна Соколова',
    handle: '@anna',
    emoji: '🌿',
    time: '12 мин',
    text: 'Нашла идеальное место для утреннего кофе. Тишина, свет и ничего лишнего — именно так должно начинаться утро.',
    image: PHOTO_1,
    likes: 248,
    comments: 32,
  },
  {
    name: 'Дмитрий Орлов',
    handle: '@dmitry',
    emoji: '🏔️',
    time: '1 ч',
    text: 'Рассвет в горах напоминает, как мало нужно для счастья. Просто быть здесь.',
    image: PHOTO_2,
    likes: 512,
    comments: 64,
  },
  {
    name: 'Лена Ким',
    handle: '@lena',
    emoji: '🌸',
    time: '3 ч',
    text: 'Минимализм — это не про пустоту. Это про пространство для важного.',
    image: null,
    likes: 96,
    comments: 18,
  },
];

const CHATS = [
  { name: 'Анна Соколова', emoji: '🌿', msg: 'Договорились, до завтра!', time: '12:40', unread: 2 },
  { name: 'Марк Лебедев', emoji: '🎧', msg: 'Скинул новый плейлист 🎶', time: '11:05', unread: 0 },
  { name: 'Лена Ким', emoji: '🌸', msg: 'Печатает…', time: '09:22', unread: 1 },
  { name: 'Дима Орлов', emoji: '🏔️', msg: 'Ты видел эти фотки?', time: 'Вчера', unread: 0 },
];

const FRIENDS = [
  { name: 'Анна Соколова', emoji: '🌿', mutual: 12, online: true },
  { name: 'Марк Лебедев', emoji: '🎧', mutual: 8, online: true },
  { name: 'Лена Ким', emoji: '🌸', mutual: 23, online: false },
  { name: 'Дмитрий Орлов', emoji: '🏔️', mutual: 5, online: false },
  { name: 'Соня Белова', emoji: '☕', mutual: 17, online: true },
  { name: 'Кирилл Новак', emoji: '📷', mutual: 3, online: false },
];

const NOTIFS = [
  { emoji: '🌸', name: 'Лена Ким', action: 'оценила вашу публикацию', time: '2 мин', icon: 'Heart' },
  { emoji: '🎧', name: 'Марк Лебедев', action: 'прокомментировал: «Отлично!»', time: '18 мин', icon: 'MessageCircle' },
  { emoji: '🌿', name: 'Анна Соколова', action: 'начала на вас подписываться', time: '1 ч', icon: 'UserPlus' },
  { emoji: '☕', name: 'Соня Белова', action: 'добавила вас в друзья', time: '4 ч', icon: 'UserCheck' },
];

function Avatar({ emoji, size = 44 }: { emoji: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-secondary shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}

function StoryRow() {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
      {STORIES.map((s, i) => (
        <button
          key={s.name}
          className="flex flex-col items-center gap-2 shrink-0 group animate-fade-in"
          style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
        >
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
  );
}

function PostCard({ post, index }: { post: typeof POSTS[number]; index: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <article
      className="bg-card rounded-3xl border border-border/60 p-5 animate-fade-in"
      style={{ animationDelay: `${150 + index * 90}ms`, opacity: 0 }}
    >
      <header className="flex items-center gap-3 mb-4">
        <Avatar emoji={post.emoji} />
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight">{post.name}</p>
          <p className="text-xs text-muted-foreground">{post.handle} · {post.time}</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </header>
      <p className="text-[15px] leading-relaxed mb-4">{post.text}</p>
      {post.image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-border/60">
          <img src={post.image} alt="" className="w-full h-72 object-cover hover-scale" />
        </div>
      )}
      <footer className="flex items-center gap-6 text-muted-foreground">
        <button
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-accent' : 'hover:text-foreground'}`}
        >
          <Icon name="Heart" size={19} className={liked ? 'fill-accent' : ''} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
          <Icon name="MessageCircle" size={19} />
          {post.comments}
        </button>
        <button className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
          <Icon name="Send" size={19} />
        </button>
        <button className="ml-auto hover:text-foreground transition-colors">
          <Icon name="Bookmark" size={19} />
        </button>
      </footer>
    </article>
  );
}

function Feed() {
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-3xl border border-border/60 p-5">
        <StoryRow />
      </div>
      <div className="bg-card rounded-3xl border border-border/60 p-4 flex items-center gap-3">
        <Avatar emoji="😊" />
        <input
          placeholder="Что нового?"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-[15px]"
        />
        <button className="flex items-center gap-2 bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
          <Icon name="ImagePlus" size={16} />
          Пост
        </button>
      </div>
      {POSTS.map((p, i) => (
        <PostCard key={p.handle} post={p} index={i} />
      ))}
    </div>
  );
}

function Messages() {
  return (
    <div className="bg-card rounded-3xl border border-border/60 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/60">
        <h2 className="font-display text-3xl">Сообщения</h2>
      </div>
      {CHATS.map((c) => (
        <button
          key={c.name}
          className="w-full flex items-center gap-3 p-4 hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0 text-left"
        >
          <Avatar emoji={c.emoji} size={52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{c.name}</p>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{c.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate">{c.msg}</p>
              {c.unread > 0 && (
                <span className="shrink-0 ml-2 w-5 h-5 text-xs rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Friends() {
  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-display text-3xl px-1">Друзья</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {FRIENDS.map((f, i) => (
          <div
            key={f.name}
            className="bg-card rounded-3xl border border-border/60 p-5 flex items-center gap-4 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
          >
            <div className="relative">
              <Avatar emoji={f.emoji} size={56} />
              {f.online && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.mutual} общих друзей</p>
            </div>
            <button className="text-sm font-medium px-4 py-2 rounded-full bg-secondary hover:bg-border transition-colors">
              Профиль
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Notifications() {
  return (
    <div className="bg-card rounded-3xl border border-border/60 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/60">
        <h2 className="font-display text-3xl">Уведомления</h2>
      </div>
      {NOTIFS.map((n, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-border/40 last:border-0 hover:bg-secondary/40 transition-colors"
        >
          <div className="relative">
            <Avatar emoji={n.emoji} />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center border-2 border-card">
              <Icon name={n.icon} size={13} />
            </span>
          </div>
          <p className="flex-1 text-sm leading-snug">
            <span className="font-medium">{n.name}</span>{' '}
            <span className="text-muted-foreground">{n.action}</span>
          </p>
          <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

function Profile() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-accent/20 via-secondary to-secondary" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-card flex items-center justify-center text-5xl">
              😊
            </div>
          </div>
          <h2 className="font-display text-3xl leading-none">Александр Юрьев</h2>
          <p className="text-muted-foreground text-sm mt-1">@alex · Москва</p>
          <p className="text-[15px] leading-relaxed mt-4 max-w-md">
            Дизайнер и любитель тишины. Создаю простые вещи, которые приятно использовать.
          </p>
          <div className="flex gap-8 mt-5">
            {[['128', 'Постов'], ['2.4k', 'Подписчиков'], ['312', 'Подписок']].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl leading-none">{n}</p>
                <p className="text-xs text-muted-foreground mt-1">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-foreground text-background font-medium py-2.5 rounded-full hover:opacity-90 transition-opacity">
              Редактировать
            </button>
            <button className="px-4 py-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <span className="font-display text-2xl tracking-tight mr-auto select-none">
            tihо<span className="text-accent">.</span>
          </span>
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 flex-1 max-w-xs">
            <Icon name="Search" size={16} className="text-muted-foreground" />
            <input
              placeholder="Поиск людей и постов"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-6">
        <div className="md:flex md:gap-6">
          <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0 sticky top-24 self-start">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                  tab === n.id ? 'bg-foreground text-background' : 'hover:bg-secondary text-foreground'
                }`}
              >
                <Icon name={n.icon} size={20} />
                <span className="text-sm font-medium">{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            {tab === 'feed' && <Feed />}
            {tab === 'messages' && <Messages />}
            {tab === 'friends' && <Friends />}
            {tab === 'notifications' && <Notifications />}
            {tab === 'profile' && <Profile />}
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border/60">
        <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors ${
                tab === n.id ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <Icon name={n.icon} size={22} />
              <span className="text-[10px]">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
