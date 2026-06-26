import { useEffect, useRef } from 'react';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifIcon({ type }) {
  if (type === 'like')
    return (
      <span className="w-8 h-8 flex items-center justify-center bg-red-500 border-2 border-black text-white text-xs shrink-0">
        <i className="fa-solid fa-heart" />
      </span>
    );
  return (
    <span className="w-8 h-8 flex items-center justify-center bg-blue-500 border-2 border-black text-white text-xs shrink-0">
      <i className="fa-solid fa-comment" />
    </span>
  );
}

export default function NotificationDropdown({
  notifications,
  loading,
  markingAll = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) {
  const ref = useRef(null);

  // Tutup dropdown saat pointer down di luar komponen
  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  return (
    // onPointerDown stopPropagation agar event tidak bubble ke document listener
    <div
      ref={ref}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute right-0 top-full mt-2 w-[340px] max-h-[480px] flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[200]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#536600]">
        <span className="font-display font-black text-white uppercase tracking-tight text-sm">
          Notifications
        </span>
        <button
          onClick={onMarkAllAsRead}
          disabled={markingAll}
          className="font-mono text-[10px] font-black uppercase text-[#caf300] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {markingAll && <i className="fa-solid fa-spinner fa-spin" />}
          Mark all read
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin mr-2" />
            <span className="font-mono text-xs">Loading...</span>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <i className="fa-solid fa-bell-slash text-2xl" />
            <span className="font-mono text-xs">No notifications yet</span>
          </div>
        )}

        {!loading &&
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => !notif.is_read && onMarkAsRead(notif.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 border-b-2 border-black/10 text-left hover:bg-[#caf300]/20 transition-colors ${
                notif.is_read ? 'opacity-60' : 'bg-[#caf300]/10'
              }`}
            >
              {/* Avatar aktor */}
              <div className="shrink-0 w-8 h-8 border-2 border-black overflow-hidden">
                {notif.actor?.avatar_url ? (
                  <img
                    src={notif.actor.avatar_url}
                    alt={notif.actor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#536600] flex items-center justify-center text-white font-black text-xs">
                    {notif.actor?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>

              {/* Teks */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-black leading-snug">
                  <span className="font-black">{notif.actor?.name ?? 'Someone'}</span>{' '}
                  {notif.type === 'like' ? 'menyukai' : 'berkomentar di'} postmu
                  {notif.post_title ? (
                    <span className="italic truncate block text-gray-500">
                      &ldquo;{notif.post_title}&rdquo;
                    </span>
                  ) : null}
                </p>
                <span className="font-mono text-[10px] text-gray-400 mt-0.5 block">
                  {timeAgo(notif.created_at)}
                </span>
              </div>

              {/* Type icon */}
              <NotifIcon type={notif.type} />

              {/* Unread dot */}
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
              )}
            </button>
          ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t-4 border-black bg-gray-50">
          <span className="font-mono text-[10px] text-gray-400">
            Showing last {notifications.length} notifications
          </span>
        </div>
      )}
    </div>
  );
}
