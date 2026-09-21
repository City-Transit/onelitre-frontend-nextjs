'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/session';
import { API_BASE_URL } from '@/lib/api-base-url';
import type { Notification, User } from '@/lib/types';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Live-updates via a socket.io connection to the backend's /notifications namespace (see
 * NotificationsGateway) — the socket authenticates with the same bearer token apiFetch uses (see
 * lib/session.ts), not a cookie, since the API is cross-domain from the frontend. Falls back to
 * whatever was loaded on mount if the socket never connects. */
export function NotificationBell({ user }: { user: User | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    apiFetch('/notifications')
      .then((data: Notification[]) => {
        if (!cancelled) setNotifications(data);
      })
      .catch(() => {});

    const socket: Socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token: getAccessToken() },
      transports: ['websocket'],
    });
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await apiFetch('/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex items-center px-1 py-1 text-paper"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-[10px] border border-line bg-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-mono text-[13px] font-bold text-paper">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="font-mono text-[11px] text-frost hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center font-mono text-[12px] text-paper/60">
                Nothing yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`block w-full border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-paper/5 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[13px] font-bold text-paper">{n.title}</span>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-paprika" />}
                  </div>
                  <p className="mt-1 text-[12px] text-paper/80">{n.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-paper/50">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
