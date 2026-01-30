'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser, User } from '@/lib/auth';
import Link from 'next/link';

interface UserData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionsOpenForId, setActionsOpenForId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<{ id: number; name: string | null } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const actionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    fetchUsers();
  }, [router]);

  // Position actions dropdown in portal when open so it's never clipped
  useEffect(() => {
    if (!actionsOpenForId || !actionsButtonRef.current) {
      setDropdownPosition(null);
      return;
    }
    const filtered = users
      .filter((u) => u.id !== user?.id)
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (u.name || '').toLowerCase().includes(q) || String(u.id).includes(q);
      });
    const index = filtered.findIndex((u) => u.id === actionsOpenForId);
    const openDropdownUp = index === 0 || index >= filtered.length - 2;
    const rect = actionsButtonRef.current.getBoundingClientRect();
    setDropdownPosition({
      left: rect.right - 140,
      top: openDropdownUp ? rect.top : rect.bottom,
      openUp: openDropdownUp,
    });
  }, [actionsOpenForId, users, user?.id, searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: number, action: 'reject' | 'accept' | 'delete') => {
    setActionsOpenForId(null);
    setError('');

    if (action === 'delete') {
      const target = users.find((u) => u.id === userId);
      setDeleteConfirmFor({ id: userId, name: target?.name ?? null });
      return;
    }

    try {
      if (action === 'reject' || action === 'accept') {
        const status = action === 'reject' ? 'rejected' : 'accepted';
        const response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, status }),
        });

        if (response.ok) {
          setSuccess(`User ${action === 'reject' ? 'rejected' : 'accepted'} successfully`);
          setTimeout(() => setSuccess(''), 3000);
          fetchUsers(); // Refresh the list
        } else {
          const data = await response.json();
          setError(data.error || `Failed to ${action} user`);
        }
      }
    } catch (err) {
      setError(`An error occurred while ${action + 'ing'} user`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmFor) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${deleteConfirmFor.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
        setDeleteConfirmFor(null);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('An error occurred while deleting user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="p-8 rounded-3xl shadow-2xl border border-pink-100" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Link
              href="/admin/add_user"
              className="font-bold transition-colors"
              style={{ color: '#E94B6A' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C7365A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#E94B6A'}
            >
              + Add User
            </Link>
          </div>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 border-2 rounded-xl bg-white"
              style={{ borderColor: '#FF8AA2', color: '#111827' }}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = users
                      .filter((u) => u.id !== user?.id)
                      .filter((u) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.trim().toLowerCase();
                        const matchName = (u.name || '').toLowerCase().includes(q);
                        const matchId = String(u.id).includes(q);
                        return matchName || matchId;
                      });
                    return filtered.map((u, index) => {
                      const openDropdownUp = index === 0 || index >= filtered.length - 2;
                      const getStatusBadge = (status: string | null) => {
                        if (!status || status === 'pending') {
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                              Pending
                            </span>
                          );
                        }
                        if (status === 'accepted') {
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                              Accepted
                            </span>
                          );
                        }
                        if (status === 'rejected') {
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                              Rejected
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                            Unknown
                          </span>
                        );
                      };

                      return (
                    <tr
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer"
                      onClick={() => router.push(`/${u.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/${u.id}`); } }}
                    >
                      <td className="p-4">{u.id}</td>
                      <td className="p-4">{u.name || '-'}</td>
                      <td className="p-4">
                        {getStatusBadge(u.status)}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <button
                              ref={actionsOpenForId === u.id ? actionsButtonRef : undefined}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actionsOpenForId === u.id) {
                                  setActionsOpenForId(null);
                                } else {
                                  actionsButtonRef.current = e.currentTarget;
                                  setActionsOpenForId(u.id);
                                }
                              }}
                              className="px-3 py-1.5 border-2 rounded-xl bg-white transition-colors flex items-center gap-1"
                              style={{ borderColor: '#FF8AA2', color: '#111827' }}
                              aria-haspopup="true"
                              aria-expanded={actionsOpenForId === u.id}
                            >
                              Actions
                              <svg className={`w-4 h-4 transition-transform ${actionsOpenForId === u.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                      </td>
                    </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {users
            .filter((u) => u.id !== user?.id)
            .filter((u) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.trim().toLowerCase();
              return (u.name || '').toLowerCase().includes(q) || String(u.id).includes(q);
            }).length === 0 && !loading && (
            <div className="text-center py-8 text-zinc-500">
              No users found{searchQuery.trim() ? ' matching search' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Actions dropdown - rendered in portal so all three options are always visible */}
      {actionsOpenForId && dropdownPosition && typeof document !== 'undefined' && createPortal(
        (() => {
          const targetUser = users.find((u) => u.id === actionsOpenForId);
          if (!targetUser) return null;
          const status = targetUser.status?.toLowerCase() || null;
          const showReject = status !== 'rejected';
          const showAccept = status !== 'accepted';
          return (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 1000 }}
                aria-hidden="true"
                onClick={(e) => { e.stopPropagation(); setActionsOpenForId(null); }}
              />
              <div
                role="menu"
                className="fixed py-1 min-w-[140px] rounded-lg border-2 bg-white shadow-xl"
                style={{
                  zIndex: 1001,
                  borderColor: '#FF8AA2',
                  left: dropdownPosition.left,
                  ...(dropdownPosition.openUp
                    ? { bottom: `calc(100vh - ${dropdownPosition.top}px + 4px)` }
                    : { top: dropdownPosition.top + 4 }),
                }}
              >
                {showReject && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => { e.stopPropagation(); handleAction(targetUser.id, 'reject'); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors first:rounded-t-md"
                    style={{ color: '#C7365A' }}
                  >
                    Reject
                  </button>
                )}
                {showAccept && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => { e.stopPropagation(); handleAction(targetUser.id, 'accept'); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors ${!showReject ? 'first:rounded-t-md' : ''}`}
                    style={{ color: '#15803d' }}
                  >
                    Accept
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(targetUser.id, 'delete'); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors rounded-b-md"
                  style={{ color: '#dc2626' }}
                >
                  Delete
                </button>
              </div>
            </>
          );
        })(),
        document.body
      )}

      {/* Delete confirmation pop-up - rendered in portal so it always appears on top */}
      {deleteConfirmFor && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999 }}
          onClick={() => !deleting && setDeleteConfirmFor(null)}
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="rounded-2xl shadow-2xl border-2 p-6 max-w-sm w-full bg-white"
            style={{ borderColor: '#FF8AA2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-lg font-bold mb-3" style={{ color: '#111827' }}>
              Delete user?
            </h2>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
              Delete user {deleteConfirmFor.name ? `"${deleteConfirmFor.name}"` : ''} (ID: {deleteConfirmFor.id})? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => !deleting && setDeleteConfirmFor(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl font-semibold border-2 transition-colors disabled:opacity-50"
                style={{ borderColor: '#FF8AA2', color: '#C7365A', backgroundColor: '#FFF' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#C7365A' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ProtectedRoute>
  );
}
