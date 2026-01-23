'use client';

import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

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

export default function UsersDisplay() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/public');
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'platinum':
        return 'bg-blue-600 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-zinc-400 text-white';
      default:
        return 'bg-zinc-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-lg text-zinc-600">Loading members...</div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-zinc-600">No users found</div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent mb-3" style={{ backgroundImage: 'linear-gradient(to right, #111827, #16A34A, #111827)' }}>
            Our Members
          </h2>
          <p className="text-lg" style={{ color: '#374151' }}>Discover our community members</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="group relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setIsLoginModalOpen(true)}
            >
              {/* Modern Card Design */}
              <div className="relative bg-gradient-to-br from-zinc-800/90 via-zinc-800/95 to-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-700/50 backdrop-blur-sm h-full shadow-xl hover:shadow-2xl hover:shadow-zinc-900/50 transition-all duration-300">
                {/* Photo Section - Clear */}
                <div className="relative h-72 overflow-hidden">
                  {user.photo ? (
                    <img
                      src={(() => {
                        // If photo is from S3 and we have user ID, use PostgreSQL blob API to avoid CORS issues
                        if (user.id && user.photo?.includes('s3')) {
                          return `/api/photo?userId=${user.id}`;
                        }
                        
                        // Normalize the photo URL
                        let photoUrl = user.photo.trim();
                        
                        // Fix malformed URLs (https:/ instead of https://)
                        if (photoUrl.startsWith('https:/') && !photoUrl.startsWith('https://')) {
                          photoUrl = photoUrl.replace('https:/', 'https://');
                        }
                        if (photoUrl.startsWith('http:/') && !photoUrl.startsWith('http://')) {
                          photoUrl = photoUrl.replace('http:/', 'http://');
                        }
                        
                        // Handle full URLs
                        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                          return photoUrl;
                        }
                        
                        // Handle relative paths
                        if (photoUrl.startsWith('/')) {
                          return photoUrl;
                        }
                        
                        // Default: prepend / for relative paths
                        return `/${photoUrl}`;
                      })()}
                      alt={user.name || user.email}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // If we're already using the API endpoint and it fails, show placeholder
                        if (img.src.includes('/api/photo')) {
                          img.style.display = 'none';
                        } else if (user.id && user.photo?.includes('s3')) {
                          // Try fallback to PostgreSQL blob API if S3 fails
                          img.src = `/api/photo?userId=${user.id}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 flex items-center justify-center">
                      <div className="text-7xl font-bold text-zinc-400">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Role Badge - Top Right */}
                  {user.role && user.role !== 'admin' && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-md ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent" />
                </div>

                {/* Blurred Info Section */}
                <div className="p-6 space-y-3 relative z-10" style={{ backgroundColor: '#FFFFFF' }}>
                  <div className="space-y-2 blur-md">
                    <div className="text-lg font-bold text-white">
                      {user.name || 'User'}
                    </div>
                    <div className="text-sm text-zinc-300">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 blur-md text-sm text-zinc-400">
                    {user.profession && (
                      <div>Profession: {user.profession}</div>
                    )}
                    {user.age && (
                      <div>Age: {user.age}</div>
                    )}
                    {user.gender && (
                      <div>Gender: {user.gender}</div>
                    )}
                    {user.phone_number && (
                      <div>Phone: {user.phone_number}</div>
                    )}
                  </div>
                </div>

                {/* Login Overlay - Appears on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 bg-white/90 backdrop-blur-md">
                  <div className="transform scale-95 group-hover:scale-100 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLoginModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Login to View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
