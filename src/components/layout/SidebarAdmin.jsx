import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'terminal' },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/events', label: 'Events', icon: 'explore' },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: 'equalizer' },
];

export default function SidebarAdmin() {
  const { user } = useAuth();

  if (user?.role !== 'admin') return null;

  return (
    <aside className="w-64 bg-surface border-r-4 border-black min-h-screen p-sm flex flex-col shrink-0 sticky top-0">
      {/* Admin Badge */}
      <div className="mb-lg border-b-4 border-black pb-md">
        <div className="font-display text-headline-md font-black text-on-surface tracking-tighter">
          GOWESBARENG<span className="text-primary-fixed">.ADMIN</span>
        </div>
        <div className="flex items-center gap-xs mt-sm">
          <div className="w-10 h-10 border-4 border-black bg-secondary-container neo-shadow flex items-center justify-center text-on-secondary-container font-display text-label-md shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="font-label text-label-md text-on-surface">{user?.name}</div>
            <div className="font-label text-label-sm text-on-surface-variant uppercase">Admin</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-xs">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-sm p-sm font-label text-label-md uppercase transition-neo border-4 ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container border-black shadow-neo'
                      : 'text-on-surface border-transparent hover:border-black hover:bg-surface-variant hover:shadow-neo-sm'
                  }`
                }
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-md border-t-4 border-black space-y-xs">
        <a
          href="#"
          className="flex items-center gap-xs text-on-surface hover:bg-surface-variant p-xs border-4 border-transparent font-label text-label-sm uppercase transition-neo"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          HELP
        </a>
        <a
          href="#"
          className="flex items-center gap-xs text-error hover:bg-surface-variant p-xs border-4 border-transparent font-label text-label-sm uppercase transition-neo"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          LOGOUT
        </a>
      </div>
    </aside>
  );
}
