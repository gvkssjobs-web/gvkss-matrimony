'use client';

import { useEffect, useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    fetchUsers();
  }, [router]);

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

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred while updating role');
    }
  };

  const handleAction = async (userId: number, action: 'reject' | 'accept' | 'delete') => {
    setActionsOpenForId(null);
    setError('');
    
    if (action === 'delete') {
      if (!confirm(`Delete user ${userId}? This cannot be undone.`)) return;
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
      } else if (action === 'delete') {
        // For delete, we'll use the same PATCH endpoint with a special status or create a DELETE endpoint
        // For now, let's use a DELETE request to a delete endpoint if it exists
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSuccess('User deleted successfully');
          setTimeout(() => setSuccess(''), 3000);
          fetchUsers(); // Refresh the list
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete user');
        }
      }
    } catch (err) {
      setError(`An error occurred while ${action === 'delete' ? 'deleting' : action + 'ing'} user`);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="p-8 rounded-3xl shadow-2xl border border-pink-100" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Link
              href="/"
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

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 items-center">
            <label className="text-sm font-medium" style={{ color: '#374151' }}>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
              className="px-3 py-1.5 border-2 rounded-lg bg-white"
              style={{ borderColor: '#FF8AA2', color: '#111827' }}
            >
              <option value="all">All Users</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Created At</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((u) => {
                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'pending') return !u.status || u.status === 'pending';
                      return u.status === statusFilter;
                    })
                    .map((u) => {
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
                      className="border-b border-zinc-100 hover:bg-zinc-50"
                    >
                      <td className="p-4">{u.id}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">{u.name || '-'}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1 border-2 rounded-xl bg-white transition-colors"
                          style={{ borderColor: '#FF8AA2', color: '#111827' }}
                          onFocus={(e) => e.target.style.borderColor = '#E94B6A'}
                          onBlur={(e) => e.target.style.borderColor = '#FF8AA2'}
                          disabled={u.id === user?.id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(u.status)}
                      </td>
                      <td className="p-4">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 relative">
                        {u.id === user?.id ? (
                          <span className="text-sm text-zinc-500">(You)</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setActionsOpenForId(actionsOpenForId === u.id ? null : u.id)}
                              className="px-3 py-1.5 border-2 rounded-xl bg-white transition-colors flex items-center gap-1"
                              style={{ borderColor: '#FF8AA2', color: '#111827' }}
                            >
                              Actions
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {actionsOpenForId === u.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  aria-hidden="true"
                                  onClick={() => setActionsOpenForId(null)}
                                />
                                <div
                                  className="absolute right-0 top-full mt-1 z-20 py-1 min-w-[120px] rounded-lg border border-zinc-200 bg-white shadow-lg"
                                  style={{ borderColor: '#FF8AA2' }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleAction(u.id, 'reject')}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 transition-colors"
                                    style={{ color: '#C7365A' }}
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAction(u.id, 'accept')}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 transition-colors"
                                    style={{ color: '#15803d' }}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAction(u.id, 'delete')}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 transition-colors"
                                    style={{ color: '#dc2626' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {users.filter((u) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return !u.status || u.status === 'pending';
            return u.status === statusFilter;
          }).length === 0 && !loading && (
            <div className="text-center py-8 text-zinc-500">
              No users found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
