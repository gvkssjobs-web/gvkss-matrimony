'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

interface NotificationItem {
  notification_id: number;
  user_id: number;
  created_at: string;
  name: string | null;
  email: string;
  status: string | null;
}

export default function AdminNotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<{ userId: number; name: string | null; notificationId: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId: number) => {
    setActingId(userId);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'accepted' }),
      });
      if (response.ok) {
        setSuccess('User accepted');
        setTimeout(() => setSuccess(''), 2000);
        fetchNotifications();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept');
      }
    } catch (err) {
      setError('Failed to accept');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (userId: number) => {
    setActingId(userId);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'rejected' }),
      });
      if (response.ok) {
        setSuccess('User rejected');
        setTimeout(() => setSuccess(''), 2000);
        fetchNotifications();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reject');
      }
    } catch (err) {
      setError('Failed to reject');
    } finally {
      setActingId(null);
    }
  };

  const handleDismiss = async (notificationId: number) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));
      }
    } catch (err) {
      setError('Failed to dismiss');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmFor) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${deleteConfirmFor.userId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('User deleted');
        setTimeout(() => setSuccess(''), 2000);
        setDeleteConfirmFor(null);
        fetchNotifications();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="w-full max-w-3xl mx-auto mt-20 px-4">
        <div className="p-8 rounded-3xl shadow-2xl border border-pink-100 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
              Notifications
            </h1>
            <Link
              href="/admin"
              className="font-semibold"
              style={{ color: '#E94B6A' }}
            >
              ← Admin Panel
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No new registration notifications.</div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n) => (
                <li
                  key={n.notification_id}
                  className="relative border-2 rounded-xl p-4 bg-gray-50/50"
                  style={{ borderColor: '#FF8AA2' }}
                >
                  <button
                    type="button"
                    onClick={() => handleDismiss(n.notification_id)}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
                    aria-label="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="pr-8">
                    <p className="font-semibold text-gray-800">
                      New user registered: {n.name || 'N/A'} (ID: {n.user_id})
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{n.email}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => handleReject(n.user_id)}
                      disabled={actingId === n.user_id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border-2 transition"
                      style={{ borderColor: '#C7365A', color: '#C7365A' }}
                      title="Reject"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(n.user_id)}
                      disabled={actingId === n.user_id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border-2 transition"
                      style={{ borderColor: '#15803d', color: '#15803d' }}
                      title="Accept"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmFor({ userId: n.user_id, name: n.name, notificationId: n.notification_id })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border-2 transition"
                      style={{ borderColor: '#dc2626', color: '#dc2626' }}
                      title="Delete user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {deleteConfirmFor && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-[99999]"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => !deleting && setDeleteConfirmFor(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border-2"
            style={{ borderColor: '#FF8AA2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2 text-gray-800">Delete user?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Delete {deleteConfirmFor.name ? `"${deleteConfirmFor.name}"` : ''} (ID: {deleteConfirmFor.userId})? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => !deleting && setDeleteConfirmFor(null)}
                className="px-4 py-2 rounded-xl font-semibold border-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-red-600"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
