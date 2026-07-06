import { NavLink, Outlet, useLocation } from 'react-router-dom';

const Icon = ({ name }: { name: 'today' | 'history' | 'settings' }) => {
  const paths = {
    today: 'M4 12h3l2-7 4 14 2-7h5',
    history: 'M4 19V9m6 10V5m6 14v-7m4 7V3',
    settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6L16.5 7.5m-9 9L6 18m12 0-1.5-1.5m-9-9L6 6',
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
};

const links = [
  { to: '/', label: 'Today', icon: 'today' as const },
  { to: '/history', label: 'History', icon: 'history' as const },
  { to: '/settings', label: 'Settings', icon: 'settings' as const },
];

export const AppShell = () => {
  const sessionMode = useLocation().pathname === '/workout';
  return (
    <div className={`app-shell ${sessionMode ? 'session-mode' : ''}`}>
      {!sessionMode ? (
        <aside className="sidebar">
          <div className="brand" aria-label="LiftTrack">
            <span className="brand-mark" aria-hidden="true">H</span>
            <span>LiftTrack</span>
          </div>
          <nav aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                <Icon name={link.icon} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          <p className="privacy-note">Private to this browser</p>
        </aside>
      ) : null}
      <main className="main-content">
        <Outlet />
      </main>
      {!sessionMode ? (
        <nav className="mobile-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
};
