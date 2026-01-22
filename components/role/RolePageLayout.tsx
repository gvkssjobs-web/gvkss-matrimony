'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser, User, UserRole } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RoleHeader from './RoleHeader';
import AccountInfoCard from './AccountInfoCard';
import BenefitsCard from './BenefitsCard';
import UpgradeSection from './UpgradeSection';
import React from 'react';

interface RolePageLayoutProps {
  role: UserRole;
  benefits: string[];
  upgradeTarget?: 'gold' | 'platinum';
  upgradeTitle?: string;
  upgradeDescription?: string;
  children?: React.ReactNode;
}

export default function RolePageLayout({
  role,
  benefits,
  upgradeTarget,
  upgradeTitle,
  upgradeDescription,
  children,
}: RolePageLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role !== role) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router, role]);

  if (loading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  const roleColors = {
    silver: 'text-slate-600 dark:text-slate-400',
    gold: 'text-amber-600 dark:text-yellow-400',
    platinum: 'text-purple-600 dark:text-purple-400',
  } as const;

  const roleKey = role as 'silver' | 'gold' | 'platinum';

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RoleHeader role={roleKey} userName={user.name || user.email} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AccountInfoCard user={user} roleColor={roleColors[roleKey]} />
            <BenefitsCard benefits={benefits} />
          </div>

          {children || (upgradeTarget && upgradeTitle && upgradeDescription && (
            <UpgradeSection
              targetRole={upgradeTarget}
              title={upgradeTitle}
              description={upgradeDescription}
            />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
