'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser, User } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RoleUsersDisplay from '@/components/RoleUsersDisplay';
import RoleFilterBar from '@/components/RoleFilterBar';

export default function SilverPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role !== 'silver') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleClearFilters = () => {
    setFilterRole('all');
    setFilterGender('all');
    setFilterMinAge('');
    setFilterMaxAge('');
  };

  useEffect(() => {
    const handleResetFilters = () => {
      handleClearFilters();
    };
    window.addEventListener('resetFilters', handleResetFilters);
    return () => {
      window.removeEventListener('resetFilters', handleResetFilters);
    };
  }, []);

  if (loading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen pb-12" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="w-full mx-auto pt-8 px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #111827, #16A34A, #111827)' }}>Silver</span>{' '}
              <span style={{ color: '#111827' }}>Dashboard</span>
            </h1>
            <p className="text-lg" style={{ color: '#374151' }}>Browse all Silver members</p>
          </div>
          
          <RoleFilterBar
            availableRoles={['silver']}
            selectedRole={filterRole}
            selectedGender={filterGender}
            minAge={filterMinAge}
            maxAge={filterMaxAge}
            searchQuery={searchQuery}
            onRoleChange={setFilterRole}
            onGenderChange={setFilterGender}
            onMinAgeChange={setFilterMinAge}
            onMaxAgeChange={setFilterMaxAge}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />
          <RoleUsersDisplay 
            roles={['silver']} 
            currentUserId={user.id} 
            searchQuery={searchQuery}
            filters={{
              role: filterRole,
              gender: filterGender,
              minAge: filterMinAge,
              maxAge: filterMaxAge,
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
