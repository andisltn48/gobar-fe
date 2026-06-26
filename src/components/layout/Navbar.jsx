import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import NotificationDropdown from '../common/NotificationDropdown';

const navLinks = [
  { to: '/', label: 'Feed' },
  { to: '/events', label: 'Events' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/leaderboard', label: 'Rankings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const {
    notifications,
    unreadCount,
    loading,
    markingAll,
    open,
    toggleOpen,
    close,
    markAsRead,
    markAllAsRead,
  } = useNotification(user);

  const isAdminPath = pathname.startsWith('/admin');

  const linksToShow = isAdminPath
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/events', label: 'Events' },
        { to: '/admin/marketplace', label: 'Marketplace' },
        { to: '/admin/leaderboard', label: 'Leaderboard' },
      ]
    : [...navLinks];

  if (!isAdminPath && user) {
    linksToShow.push({ to: '/profile', label: 'Profile' });
  }

  return (
    <>
      {/* ─── Desktop Main Header ─────────────────────────────────────────────── */}
      <header className="bg-[#536600] border-b-4 border-black sticky top-0 z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 hidden md:block">
        <div className="w-full flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link
            to={isAdminPath ? "/admin" : "/"}
            className="font-display text-headline-lg font-black text-white uppercase tracking-tighter hover:text-[#caf300] transition-neo"
          >
            {isAdminPath ? "GOWESBARENG // ADMIN" : "GOWESBARENG"}
          </Link>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-6">
            <div className="flex gap-4">
              {linksToShow.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={
                      isActive
                        ? 'font-mono text-label-md text-[#171e00] underline decoration-4 underline-offset-8 bg-[#caf300] p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer'
                        : 'font-mono text-label-md text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 active:translate-x-0 active:translate-y-0 active:shadow-none p-2 border-4 border-transparent hover:border-black hover:bg-[#caf300] hover:text-[#171e00] cursor-pointer'
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Actions: Post + Bell + User */}
            <div className="flex items-center gap-4 border-l-4 border-black pl-6">
              {user && !isAdminPath && (
                <Link
                  to="/post"
                  className="bg-[#caf300] hover:bg-[#caf300]/95 text-[#171e00] border-4 border-black px-4 py-2 font-display text-sm font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all mr-2"
                >
                  <i className="fa-solid fa-plus text-[16px]" />
                  POST
                </Link>
              )}

              {user && isAdminPath && (
                <Link
                  to="/"
                  className="bg-[#caf300] hover:bg-[#caf300]/95 text-[#171e00] border-4 border-black px-4 py-2 font-display text-sm font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all mr-2"
                >
                  <i className="fa-solid fa-right-from-bracket text-[16px]" />
                  EXIT ADMIN
                </Link>
              )}

              {/* Bell Icon + Dropdown */}
              {user && (
                <div className="relative">
                  <button
                    aria-label="Notifications"
                    onClick={toggleOpen}
                    className="relative p-2 border-4 border-black bg-surface-container-lowest text-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] hover:text-[#171e00] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-bell text-[20px]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 border-2 border-black text-white font-black font-mono text-[10px] flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {open && (
                    <NotificationDropdown
                      notifications={notifications}
                      loading={loading}
                      markingAll={markingAll}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onClose={close}
                    />
                  )}
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="bg-[#caf300] text-[#171e00] font-mono text-label-md font-black uppercase px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {user.name}
                  </div>
                  <button
                    onClick={logout}
                    aria-label="Logout"
                    className="p-2 border-4 border-black bg-surface-container-lowest text-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] hover:text-[#171e00] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-right-from-bracket text-[20px]" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 border-4 border-black bg-surface-container-lowest text-on-surface font-mono text-label-md font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] hover:text-[#171e00] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 flex items-center justify-center"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ─── Mobile Top Header ───────────────────────────────────────────────── */}
      <div className="flex md:hidden justify-between items-center bg-[#536600] border-b-4 border-black px-4 py-3 sticky top-0 z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {user ? (
          <>
            <span className="bg-[#caf300] text-[#171e00] font-mono text-xs font-black uppercase px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[160px] truncate">
              {isAdminPath ? `ADMIN: ${user.name}` : user.name}
            </span>

            <div className="flex items-center gap-2">
              {/* Mobile Bell */}
  
              <div className="relative">
                <button
                  aria-label="Notifications"
                  onClick={toggleOpen}
                  className="relative w-9 h-9 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-[#caf300] transition-all"
                >
                  <i className="fa-solid fa-bell text-sm" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 border-2 border-black text-white font-black font-mono text-[9px] flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="fixed left-2 right-2 top-16 z-[200]">
                    <NotificationDropdown
                      notifications={notifications}
                      loading={loading}
                      markingAll={markingAll}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onClose={close}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="px-2.5 py-1.5 border-2 border-black bg-white text-black font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket" />
                LOGOUT
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="font-display text-xl font-black text-white uppercase tracking-tighter"
            >
              GOWESBARENG
            </Link>
            <Link
              to="/login"
              className="px-3 py-1.5 border-2 border-black bg-white text-black font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] transition-all cursor-pointer"
            >
              Login
            </Link>
          </>
        )}
      </div>

      {/* ─── Mobile Bottom Navigation ────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#536600] border-t-4 border-black flex md:hidden justify-around items-center h-16 shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]">
        {isAdminPath ? (
          <>
            <Link
              to="/admin"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/admin'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-gauge text-lg" />
            </Link>

            <Link
              to="/admin/users"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/admin/users'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-users text-lg" />
            </Link>

            <Link
              to="/admin/events"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/admin/events'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-calendar-days text-lg" />
            </Link>

            <Link
              to="/admin/leaderboard"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/admin/leaderboard'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-trophy text-lg" />
            </Link>

            <Link
              to="/admin/marketplace"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/admin/marketplace'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-store text-lg" />
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center w-12 h-12 transition-all border-2 border-transparent text-[#ffa2a2] hover:text-white"
            >
              <i className="fa-solid fa-house text-lg" />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-rss text-lg" />
            </Link>

            <Link
              to="/events"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/events'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-calendar-days text-lg" />
            </Link>

            <Link
              to="/marketplace"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/marketplace'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-store text-lg" />
            </Link>

            {user && (
              <Link
                to="/post"
                className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                  pathname === '/post'
                    ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent text-white'
                }`}
              >
                <i className="fa-solid fa-circle-plus text-lg" />
              </Link>
            )}

            <Link
              to="/leaderboard"
              className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                pathname === '/leaderboard'
                  ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-transparent text-white'
              }`}
            >
              <i className="fa-solid fa-trophy text-lg" />
            </Link>

            {user && (
              <Link
                to="/profile"
                className={`flex items-center justify-center w-12 h-12 transition-all border-2 ${
                  pathname === '/profile'
                    ? 'bg-[#caf300] border-black text-[#171e00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent text-white'
                }`}
              >
                <i className="fa-solid fa-user text-lg" />
              </Link>
            )}
          </>
        )}
      </nav>
    </>
  );
}
