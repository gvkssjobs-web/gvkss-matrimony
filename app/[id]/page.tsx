'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  photo: string | null;
  phoneNumber: string | null;
  gender: string | null;
  dob: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  height: string | null;
  complexion: string | null;
  star: string | null;
  raasi: string | null;
  gothram: string | null;
  padam: string | null;
  uncleGothram: string | null;
  educationCategory: string | null;
  educationDetails: string | null;
  employedIn: string | null;
  address: string | null;
  createdAt: string;
  siblingsInfo: any;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userId = params.id as string;
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user profile');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError('An error occurred while loading the profile');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const getPhotoUrl = () => {
    if (!user) return null;
    
    if (!user.photo && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    if (!user.photo) return null;
    
    const isS3Url = user.photo && (
      user.photo.includes('s3.amazonaws.com') || 
      user.photo.includes('.s3.') ||
      user.photo.includes('s3-') ||
      user.photo.includes('amazonaws.com')
    );
    
    if (isS3Url && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    if (user.photo.startsWith('local-') && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    let photoUrl = user.photo.trim();
    
    if (photoUrl.startsWith('https:/') && !photoUrl.startsWith('https://')) {
      photoUrl = photoUrl.replace('https:/', 'https://');
    }
    if (photoUrl.startsWith('http:/') && !photoUrl.startsWith('http://')) {
      photoUrl = photoUrl.replace('http:/', 'http://');
    }
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    if (photoUrl.startsWith('/')) {
      return photoUrl;
    }
    
    if (user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    return `/${photoUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
          </div>
          <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>{error || 'User not found'}</h1>
          <Link 
            href="/" 
            className="px-6 py-2 rounded-lg text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen" style={{ 
      backgroundColor: 'var(--bg)',
      padding: '20px',
      paddingTop: 'calc(20px + 10px)'
    }}>
      <div style={{ width: '100%', margin: '0 auto'}}>
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Profile Photo (Full Height) */}
            <div className="w-full md:w-1/3 flex-shrink-0" style={{ minHeight: '600px', backgroundColor: '#f5f5f5' }}>
              <div className="w-full h-full relative flex items-center justify-center">
                {getPhotoUrl() ? (
                  <img
                    src={getPhotoUrl() || ''}
                    alt={user.name}
                    className="w-full h-full object-contain"
                    style={{ minHeight: '600px', maxWidth: '100%', maxHeight: '100%' }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src.includes('/api/photo')) {
                        img.style.display = 'none';
                      } else if (user.id && user.photo?.includes('s3')) {
                        img.src = `/api/photo?userId=${user.id}`;
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold" style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)', minHeight: '600px' }}>
                    {user.name ? user.name[0].toUpperCase() : '?'}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 p-8">
              {/* Heading Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                    {user.name || 'N/A'}
                  </h1>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-lg" style={{ color: 'var(--muted)' }}>Profile ID: {user.id}</p>
                  {user.gender && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold text-white capitalize"
                      style={{
                        backgroundColor: user.gender === 'bride' ? '#E94B6A' : '#3B82F6'
                      }}
                    >
                      {user.gender === 'bride' ? 'Bride' : user.gender === 'groom' ? 'Groom' : user.gender}
                    </span>
                  )}
                </div>
              </div>

              {/* Details Sections */}
              <div className="space-y-6">
                {/* Personal Details Section 1 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.dob && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Date of Birth</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{new Date(user.dob).toLocaleDateString()}</p>
                      </div>
                    )}
                    {user.birthTime && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Birth Time</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.birthTime}</p>
                      </div>
                    )}
                    {user.birthPlace && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Birth Place</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.birthPlace}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Details Section 2 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.height && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Height</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.height}</p>
                      </div>
                    )}
                    {user.complexion && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Complexion</label>
                        <p className="text-base capitalize" style={{ color: 'var(--text)' }}>{user.complexion}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Astrological Details */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                    Astrological Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.star && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Star</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.star}</p>
                      </div>
                    )}
                    {user.raasi && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Raasi</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.raasi}</p>
                      </div>
                    )}
                    {user.gothram && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Gothram</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.gothram}</p>
                      </div>
                    )}
                    {user.padam && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Padam</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.padam}</p>
                      </div>
                    )}
                    {user.uncleGothram && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Uncle Gothram</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.uncleGothram}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education & Career */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                    Education & Career
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.educationCategory && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Education Category</label>
                        <p className="text-base capitalize" style={{ color: 'var(--text)' }}>{user.educationCategory.replace('-', ' ')}</p>
                      </div>
                    )}
                    {user.educationDetails && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Education Details</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.educationDetails}</p>
                      </div>
                    )}
                    {user.employedIn && (
                      <div>
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Employed In</label>
                        <p className="text-base" style={{ color: 'var(--text)' }}>{user.employedIn}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
