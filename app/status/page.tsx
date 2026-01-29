'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default function StatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchUserStatus(currentUser.id);
  }, [router]);

  const fetchUserStatus = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        
        // If status is 'accepted', redirect to home
        if (data.status === 'accepted') {
          router.push('/');
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch user status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex min-h-screen flex-col items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  const isPending = status === null || status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <>
      <Navbar />
      <div className="flex-1 flex min-h-screen flex-col items-center justify-center w-full" style={{ paddingTop: '82px', paddingLeft: '0', paddingRight: '0' }}>
        <div className="w-full max-w-2xl mx-auto py-12" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          <div className="bg-white rounded-lg p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {isPending && (
              <>
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4" style={{ color: '#1F2937' }}>
                  Profile Under Review
                </h1>
                <p className="text-lg mb-6" style={{ color: '#4B5563' }}>
                  Please contact them to access your profile
                </p>
              </>
            )}

            {isRejected && (
              <>
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4" style={{ color: '#DC2626' }}>
                  Profile Rejected
                </h1>
                <p className="text-lg mb-6" style={{ color: '#4B5563' }}>
                  Sorry your profile has been rejected. Please contact them
                </p>
              </>
            )}

            {/* Contact Details */}
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#FFF5F7' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#B22222' }}>Contact Details</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="font-medium" style={{ color: '#1F2937' }}>Anchuri Santosh Kumar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <a href="tel:9573166450" className="font-medium hover:underline" style={{ color: '#1F2937' }}>
                      9573166450
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium" style={{ color: '#1F2937' }}>
                      B.N.Reddy Nagar, Vanasathalipuram, Hyderabad
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
