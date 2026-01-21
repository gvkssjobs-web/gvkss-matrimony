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
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="p-8 rounded-3xl shadow-2xl border border-green-100" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Link
              href="/"
              className="font-bold transition-colors"
              style={{ color: '#16A34A' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#15803D'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#16A34A'}
            >
              + Add User
            </Link>
          </div>

          {error && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

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
                    <th className="text-left p-4">Created At</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
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
                          style={{ borderColor: '#22C55E', color: '#111827' }}
                          onFocus={(e) => e.target.style.borderColor = '#16A34A'}
                          onBlur={(e) => e.target.style.borderColor = '#22C55E'}
                          disabled={u.id === user?.id}
                        >
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {u.id === user?.id && (
                          <span className="text-sm text-zinc-500">(You)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-zinc-500">
              No users found
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
