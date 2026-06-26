import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/events', label: 'Events', icon: 'fa-solid fa-calendar-days' },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: 'fa-solid fa-trophy' },
];

export default function SidebarAdmin() {
  const { user, logout } = useAuth();

  if (user?.role !== 'admin') return null;

  return (
    <aside className="hidden md:flex w-64 bg-surface border-r-4 border-black min-h-screen p-sm flex-col shrink-0 sticky top-0">
      {/* Admin Badge */}
      <div className="mb-lg border-b-4 border-black pb-md">
        <div className="font-display text-headline-md font-black text-on-surface tracking-tighter">
          GOWESBARENG<span className="text-[#caf300]">.ADMIN</span>
        </div>
        <div className="flex items-center gap-xs mt-sm">
          <div className="w-10 h-10 border-4 border-black bg-[#caf300] shadow-neo flex items-center justify-center text-[#171e00] font-display text-label-md shrink-0">
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
                      ? 'bg-[#caf300] text-[#171e00] border-black shadow-neo'
                      : 'text-on-surface border-transparent hover:border-black hover:bg-surface-variant hover:shadow-neo-sm'
                  }`
                }
              >
                <i className={`${link.icon} text-[16px] w-5 text-center`} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-md border-t-4 border-black space-y-xs">
        <Link
          to="/"
          className="flex items-center gap-xs text-[#006970] hover:bg-surface-variant p-xs border-4 border-transparent font-label text-label-sm uppercase transition-neo"
        >
          <i className="fa-solid fa-arrow-left text-[16px] w-5 text-center" />
          EXIT ADMIN
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-xs text-error hover:bg-surface-variant p-xs border-4 border-transparent font-label text-label-sm uppercase transition-neo text-left"
        >
          <i className="fa-solid fa-right-from-bracket text-[16px] w-5 text-center" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
