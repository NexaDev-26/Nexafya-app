/**
 * Notifications Panel Component
 * Displays and manages user notifications with in-app SPA routing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, X, CheckCircle, AlertCircle, Info, Clock,
  Trash2, ShoppingBag, FlaskConical, CreditCard, MessageSquare
} from 'lucide-react';
import { useNotification } from './NotificationSystem';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, AppNotification, NotificationType } from '../services/notificationService';
import { usePreferences } from '../contexts/PreferencesContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** SPA navigate callback — receives a view key like 'consultations', 'orders', etc. */
  onNavigate?: (view: string) => void;
}

// ─── SPA routing: map actionUrl paths → view keys ────────────────────────────
const ACTION_URL_TO_VIEW: Record<string, string> = {
  '/consultations':           'consultations',
  '/orders':                  'orders',
  '/health':                  'resources',
  '/profile':                 'profile',
  '/messages':                'messages',
  '/care-center-labs':        'care-center-labs',
  '/care-center':             'care-center',
  '/insurance':               'insurance',
  '/payments':                'payments',
};

function resolveView(actionUrl?: string): string | null {
  if (!actionUrl) return null;
  const path = actionUrl.split('?')[0]; // strip query params
  return ACTION_URL_TO_VIEW[path] ?? null;
}

// ─── Safe Firestore Timestamp → Date ─────────────────────────────────────────
function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();             // Firestore Timestamp
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000); // plain object
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(value: any): string {
  const d = toDate(value);
  if (!d) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)   return 'Just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)    return `${diffH}h ago`;
  return d.toLocaleDateString();
}

// ─── Icon per notification type ───────────────────────────────────────────────
function NotifIcon({ type }: { type: NotificationType }) {
  const cls = 'flex-shrink-0 mt-0.5';
  switch (type) {
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_CONFIRMED':
    case 'APPOINTMENT_CANCELLED':
      return <Clock   className={`${cls} text-blue-500`}   size={20} />;
    case 'PAYMENT_SUCCESS':
      return <CreditCard className={`${cls} text-emerald-500`} size={20} />;
    case 'PAYMENT_FAILED':
      return <AlertCircle className={`${cls} text-red-500`} size={20} />;
    case 'ORDER_UPDATE':
      return <ShoppingBag className={`${cls} text-orange-500`} size={20} />;
    case 'NEW_MESSAGE':
      return <MessageSquare className={`${cls} text-purple-500`} size={20} />;
    case 'PRESCRIPTION_READY':
      return <FlaskConical className={`${cls} text-violet-500`} size={20} />;
    case 'MEDICATION_REMINDER':
      return <Clock className={`${cls} text-amber-500`} size={20} />;
    case 'SOS_ALERT':
      return <AlertCircle className={`${cls} text-red-600`} size={20} />;
    case 'ARTICLE_PUBLISHED':
      return <CheckCircle className={`${cls} text-teal-500`} size={20} />;
    default:
      return <Info className={`${cls} text-gray-400`} size={20} />;
  }
}

// ─── Priority badge colour ────────────────────────────────────────────────────
const PRIORITY_DOT: Record<string, string> = {
  URGENT: 'bg-red-500',
  HIGH:   'bg-orange-400',
  NORMAL: 'bg-blue-500',
  LOW:    'bg-gray-400',
};

// ─────────────────────────────────────────────────────────────────────────────
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const { t } = usePreferences();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Load + subscribe ──────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const notifs = await notificationService.getNotifications(user.id, user.role, 50);
      setNotifications(notifs);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    loadNotifications();

    // Real-time subscription — updates badge + list live
    const unsubscribe = notificationService.subscribeToNotifications(user.id, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen, user?.id, loadNotifications]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      notify('Failed to mark as read', 'error');
    }
  }, [notify]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      notify('All notifications marked as read', 'success');
    } catch {
      notify('Failed to mark all as read', 'error');
    }
  }, [user?.id, notify]);

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      notify('Failed to delete notification', 'error');
    }
  }, [notify]);

  const handleNotificationClick = useCallback((notif: AppNotification) => {
    // Mark as read if unread
    if (!notif.read && notif.id) handleMarkAsRead(notif.id);
    // SPA-safe navigation
    const view = resolveView(notif.actionUrl);
    if (view && onNavigate) {
      onNavigate(view);
      onClose();
    }
  }, [handleMarkAsRead, onNavigate, onClose]);

  if (!isOpen) return null;

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed top-[4.5rem] right-4 z-[100] w-full max-w-sm max-h-[calc(100vh-6rem)] flex flex-col bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="text-blue-600 dark:text-blue-400" size={22} />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-none">
                {t('notifications')}
              </h3>
              {unreadCount > 0 && (
                <p className="text-[11px] text-gray-400 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-bold"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-1 shrink-0">
          {(['all', 'unread'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              <span className="animate-pulse">Loading notifications…</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Bell size={44} className="text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            displayed.map((notif) => (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleNotificationClick(notif)}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm group ${
                  notif.read
                    ? 'bg-gray-50 dark:bg-[#0A1B2E]/40 border-gray-100 dark:border-gray-700/30'
                    : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/40'
                }`}
              >
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${PRIORITY_DOT[notif.priority] ?? 'bg-blue-500'}`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                    {formatTime(notif.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => notif.id && handleDelete(e, notif.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all shrink-0 mt-0.5"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
            <p className="text-[11px] text-center text-gray-400">
              Showing {displayed.length} of {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </>
  );
};
