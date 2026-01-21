'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import HomeAuthCard from '@/components/HomeAuthCard';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Redirect to role-specific page
      const userRole = currentUser.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push(`/${userRole}`);
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  // Show loading state while checking user
  if (loading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <div className="text-lg font-medium" style={{ color: '#374151' }}>Redirecting...</div>
        </div>
      </div>
    );
  }

  // Show home page with split-screen layout for non-logged-in users
  return (
    <div className="w-full min-h-screen flex">
      {/* Left Section - Background Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative rounded-r-3xl overflow-hidden min-h-screen bg-zinc-200">
        {/* Background Image */}
        <img
          src="/images.jpeg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          onError={(e) => {
            // Hide image if it fails to load, fallback to background color
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {/* Very subtle dark overlay for text readability only */}
        <div className="absolute inset-0 bg-black/10 z-[1]"></div>
        
        {/* Promotional Text Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white min-h-full">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
            Find your Perfect Match from Lakhs
          </h2>
          <p className="text-xl md:text-2xl font-medium opacity-95 drop-shadow-xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
            — Trusted by Families
          </p>
        </div>
      </div>

      {/* Right Section - Auth Card */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 sm:p-8 min-h-screen" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="w-full max-w-lg mt-8">
          <HomeAuthCard />
        </div>
      </div>
    </div>
  );
}
