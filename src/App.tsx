import type { CSSProperties } from 'react';
import { AppProvider, useApp } from './store';
import { ToastHost } from './ui';
import Auth from './screens/Auth';
import Shell from './screens/Shell';
import Feed from './screens/Feed';
import ChatsList from './screens/Chats';
import ChatScreen from './screens/Chat';
import CreateScreen, { PersonasScreen } from './screens/Create';
import ProfileScreen from './screens/Profile';
import StoreScreen from './screens/Store';
import NotificationsScreen from './screens/Notifications';
import SettingsScreen from './screens/Settings';

function Screen() {
  const { route } = useApp();
  switch (route.route) {
    case 'chats': return <ChatsList />;
    case 'chat': return <ChatScreen />;
    case 'create': return <CreateScreen key={route.editCharId ?? 'new'} />;
    case 'store': return <StoreScreen />;
    case 'personas': return <PersonasScreen />;
    case 'settings': return <SettingsScreen />;
    case 'notifications': return <NotificationsScreen />;
    case 'profile': return <ProfileScreen key={route.charId} />;
    default: return <Feed />;
  }
}

function Body() {
  const { user, themeVars, bgLayer } = useApp();
  return (
    <div className="h-full relative" style={{ ...(themeVars as CSSProperties), background: 'var(--bg)', color: 'var(--text)' }}>
      {bgLayer && (
        <div key={(bgLayer.img ?? bgLayer.css ?? '') + bgLayer.blur + bgLayer.opacity} className="absolute inset-0 pointer-events-none anim-fade overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: bgLayer.img ? `url(${bgLayer.img})` : bgLayer.css,
            backgroundSize: 'cover',
            backgroundPosition: `${bgLayer.cropX}% ${bgLayer.cropY}%`,
            filter: `blur(${(bgLayer.blur ?? 0) + 3}px)`,
            opacity: bgLayer.opacity ?? 0.4,
            transform: 'scale(1.12)',
          }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--bg) 30%, transparent)' }} />
        </div>
      )}
      <div className="relative z-10 h-full">
        {user ? <Shell><Screen /></Shell> : <Auth />}
      </div>
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Body />
    </AppProvider>
  );
}
