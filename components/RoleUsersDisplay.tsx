'use client';

import { useState, useEffect } from 'react';
import UserCard from './UserCard';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  photo: string | null;
  phone_number: string | null;
  profession: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
}

interface RoleUsersDisplayProps {
  roles: string[]; // Array of roles to display, e.g., ['silver'] or ['silver', 'gold']
  currentUserId?: number; // ID of the current logged-in user to exclude
  searchQuery?: string; // Search query to filter users
  filters?: {
    role: string;
    gender: string;
    minAge: string;
    maxAge: string;
  }; // Filter options
}

export default function RoleUsersDisplay({ roles, currentUserId, searchQuery = '', filters }: RoleUsersDisplayProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roles]);

  const fetchUsers = async () => {
    try {
      const rolesParam = roles.join(',');
      const response = await fetch(`/api/users/by-roles?roles=${encodeURIComponent(rolesParam)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-lg text-zinc-600">Loading users...</div>
        </div>
      </div>
    );
  }

  // Filter out the current user
  let filteredUsers = currentUserId 
    ? users.filter(user => user.id !== currentUserId)
    : users;

  // Apply search filter if searchQuery is provided
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredUsers = filteredUsers.filter(user => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const profession = (user.profession || '').toLowerCase();
      const phone = (user.phone_number || '').toLowerCase();
      
      return name.includes(query) || 
             email.includes(query) || 
             profession.includes(query) ||
             phone.includes(query);
    });
  }

  // Apply filters if provided
  if (filters) {
    // Role filter
    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.gender && user.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    // Age range filter
    if (filters.minAge) {
      const minAge = parseInt(filters.minAge);
      if (!isNaN(minAge)) {
        filteredUsers = filteredUsers.filter(user => 
          user.age !== null && user.age >= minAge
        );
      }
    }

    if (filters.maxAge) {
      const maxAge = parseInt(filters.maxAge);
      if (!isNaN(maxAge)) {
        filteredUsers = filteredUsers.filter(user => 
          user.age !== null && user.age <= maxAge
        );
      }
    }
  }

  if (filteredUsers.length === 0) {
    const hasFilters = filters && (
      filters.role !== 'all' || 
      filters.gender !== 'all' || 
      filters.minAge !== '' || 
      filters.maxAge !== ''
    );
    
    let message = 'No other users found';
    if (searchQuery && hasFilters) {
      message = 'No users found matching your search and filters';
    } else if (searchQuery) {
      message = 'No users found matching your search';
    } else if (hasFilters) {
      message = 'No users found matching your filters';
    }
    
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-zinc-600">{message}</div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div className="grid grid-cols-3 gap-6" style={{ width: '100%', margin: '0 auto' }}>
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
