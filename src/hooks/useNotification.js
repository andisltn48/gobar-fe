import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const POLL_INTERVAL = 30000; // poll setiap 30 detik

export function useNotification(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);

  // Fetch unread count saja (ringan, dipakai untuk polling)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data?.data?.unread_count ?? 0);
    } catch (err) {
      // silent fail — jangan ganggu UI
      console.warn('[useNotification] fetchUnreadCount error:', err?.response?.status);
    }
  }, [user]);

  // Fetch daftar notifikasi lengkap
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=20');
      setNotifications(res.data?.data ?? []);
      // Update unread count dari data yang sudah di-fetch
      const unread = (res.data?.data ?? []).filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark satu notif sebagai dibaca
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[useNotification] markAsRead error:', err?.response?.data ?? err?.message);
    }
  }, []);

  // Mark semua sebagai dibaca
  const markAllAsRead = useCallback(async () => {
    if (markingAll) return; // cegah double-click
    setMarkingAll(true);
    try {
      await api.patch('/notifications/read-all');
      // Update state lokal secara optimistic
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[useNotification] markAllAsRead error:', err?.response?.data ?? err?.message);
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll]);

  // Toggle dropdown: saat dibuka, fetch notifikasi terbaru
  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (!prev) fetchNotifications();
      return !prev;
    });
  }, [fetchNotifications]);

  const close = useCallback(() => setOpen(false), []);

  // Polling unread count setiap 30 detik
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount(); // initial fetch
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markingAll,
    open,
    toggleOpen,
    close,
    markAsRead,
    markAllAsRead,
  };
}
