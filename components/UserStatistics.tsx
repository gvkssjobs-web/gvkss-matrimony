'use client';

import { useState, useEffect } from 'react';

interface UserStatisticsProps {
  availableRoles: string[]; // Roles to show statistics for
}

interface Statistics {
  total: number;
  active: number;
  byRole: {
    gold: number;
    silver: number;
    platinum: number;
  };
}

export default function UserStatistics({ availableRoles }: UserStatisticsProps) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/users/statistics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 w-full p-4 rounded-lg bg-zinc-800">
        <div className="text-zinc-400">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="mb-6 w-full p-4 rounded-lg bg-zinc-800">
      <div className="flex flex-wrap items-center gap-6">
        {/* All Users */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-zinc-400">All Users</div>
            <div className="text-lg font-semibold text-white">{stats.total}</div>
          </div>
        </div>

        {/* Role Statistics */}
        {availableRoles.map((role) => {
          const count = stats.byRole[role as keyof typeof stats.byRole] || 0;
          return (
            <div key={role} className="flex items-center gap-3">
              <div>
                <div className="text-sm text-zinc-400 capitalize">{role}</div>
                <div className="text-lg font-semibold text-white">{count}</div>
              </div>
            </div>
          );
        })}

        {/* Active Users */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-zinc-400">Active</div>
            <div className="text-lg font-semibold text-white">{stats.active}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
