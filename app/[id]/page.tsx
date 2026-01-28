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
  occupation: string | null;
  occupationInDetails: string | null;
  annualIncome: string | null;
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

  // Format 24-hour time (e.g. "14:30" or "14:30:00") to 12-hour format (e.g. "2:30 PM")
  const formatBirthTime = (timeStr: string | null) => {
    if (!timeStr) return '';

    // Keep only the time part if there is a date prefix
    const onlyTime = timeStr.trim().split(' ')[0];

    const parts = onlyTime.split(':');
    if (parts.length < 2) return timeStr; // fallback to original if unexpected format

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (Number.isNaN(hours)) return timeStr;

    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${suffix}`;
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
      padding: '20px 0',
      paddingTop: 'calc(20px + 10px)'
    }}>
      <div style={{ width: '100%', margin: '0 auto'}}>
       
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
                {/* Personal Information (all personal + astrological) */}
                <div className="space-y-4">
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}
                  >
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {user.dob && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Date of Birth:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {new Date(user.dob).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {user.birthTime && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Birth Time:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {formatBirthTime(user.birthTime)}
                        </span>
                      </div>
                    )}
                    {user.birthPlace && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Birth Place:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.birthPlace}
                        </span>
                      </div>
                    )}
                    {user.height && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Height:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.height}
                        </span>
                      </div>
                    )}
                    {user.complexion && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Complexion:
                        </span>
                        <span className="capitalize" style={{ color: 'var(--text)' }}>
                          {user.complexion}
                        </span>
                      </div>
                    )}
                    {user.star && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Star:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.star}
                        </span>
                      </div>
                    )}
                    {user.raasi && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Raasi:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.raasi}
                        </span>
                      </div>
                    )}
                    {user.gothram && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Gothram:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.gothram}
                        </span>
                      </div>
                    )}
                    {user.padam && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Padam:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.padam}
                        </span>
                      </div>
                    )}
                    {user.uncleGothram && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Uncle Gothram:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.uncleGothram}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Educational & Professional Information */}
                <div className="space-y-4">
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}
                  >
                    Educational & Professional Information
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {user.educationCategory && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Education Category:
                        </span>
                        <span className="capitalize" style={{ color: 'var(--text)' }}>
                          {user.educationCategory.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    {user.educationDetails && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Education Details:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.educationDetails}
                        </span>
                      </div>
                    )}
                    {user.employedIn && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Employed In:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.employedIn}
                        </span>
                      </div>
                    )}
                    {user.occupation && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Occupation:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.occupation}
                        </span>
                      </div>
                    )}
                    {user.occupationInDetails && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Occupation in Details:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.occupationInDetails}
                        </span>
                      </div>
                    )}
                    {user.annualIncome && (
                      <div className="flex gap-2 text-base">
                        <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          Annual Income:
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          {user.annualIncome}
                        </span>
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
