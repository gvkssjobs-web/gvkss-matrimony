'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, User } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<'bride' | 'groom'>('bride');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);
  const [minHeight, setMinHeight] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [profileId, setProfileId] = useState('');
  const [brides, setBrides] = useState<Array<{ id: number; name: string; photo: string | null; photo_s3_url: string | null }>>([]);
  const [grooms, setGrooms] = useState<Array<{ id: number; name: string; photo: string | null; photo_s3_url: string | null }>>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileType, setProfileType] = useState<'bride' | 'groom'>('bride');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Redirect to admin page if admin, otherwise stay on home page
      const userRole = currentUser.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  // Fetch brides and grooms from database
  useEffect(() => {
    const fetchBridesAndGrooms = async () => {
      try {
        setDataLoading(true);
        const response = await fetch('/api/users/brides-grooms');
        if (response.ok) {
          const data = await response.json();
          setBrides(data.brides.map((bride: any) => ({
            id: bride.id,
            name: bride.name || 'N/A',
            photo: bride.photo || null,
            photo_s3_url: bride.photo_s3_url || null
          })));
          setGrooms(data.grooms.map((groom: any) => ({
            id: groom.id,
            name: groom.name || 'N/A',
            photo: groom.photo || null,
            photo_s3_url: groom.photo_s3_url || null
          })));
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch brides and grooms:', response.status, errorData);
        }
      } catch (error) {
        console.error('Error fetching brides and grooms:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchBridesAndGrooms();
  }, []);

  // Show loading state while checking user
  if (loading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
          </div>
          <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>Redirecting...</div>
        </div>
      </div>
    );
  }

  // Generate height options
  const heightOptions = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      const heightStr = `${feet}ft ${inches}in`;
      heightOptions.push(heightStr);
    }
  }

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    params.set('type', searchType);
    if (minAge) params.set('minAge', minAge.toString());
    if (maxAge) params.set('maxAge', maxAge.toString());
    if (minHeight) params.set('minHeight', minHeight);
    if (maxHeight) params.set('maxHeight', maxHeight);
    
    // Redirect to search results page
    router.push(`/search?${params.toString()}`);
  };

  const handleProfileIdSearch = () => {
    // Handle profile ID search
    if (profileId.trim()) {
      router.push(`/${profileId.trim()}`);
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto'}}>
      {/* Quick Search with Background Image */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ 
          width: '100%', 
          height: '565px',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Static Background Image */}
          <Image
            src="/Media.jpg"
            alt="Happy Couple"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />

          {/* Quick Search Overlay */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '145px',
            width: '400px',
            maxWidth: 'calc(100% - 40px)',
            zIndex: 5,

            background: 'rgba(255, 255, 255, 0.35)',      // light glacy tone
            backdropFilter: 'blur(12px)',                // frosted effect
            WebkitBackdropFilter: 'blur(12px)',          // Safari support
            borderRadius: '25px',
            padding: '30px',

            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',  // subtle depth
            border: '1px solid rgba(255, 255, 255, 0.4)'  // soft edge
          }}>

            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#333',
              borderBottom: 'none',
              paddingBottom: '10px',
              width: 'fit-content'
            }}>
              Quick Search
            </h2>

            {/* Looking For */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                <strong>Looking For</strong>
              </label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="searchType"
                    value="bride"
                    checked={searchType === 'bride'}
                    onChange={(e) => setSearchType(e.target.value as 'bride' | 'groom')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#E94B6A' }}
                  />
                  <span style={{ fontSize: '16px', color: '#333' }}>Bride</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="searchType"
                    value="groom"
                    checked={searchType === 'groom'}
                    onChange={(e) => setSearchType(e.target.value as 'bride' | 'groom')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#E94B6A' }}
                  />
                  <span style={{ fontSize: '16px', color: '#333' }}>Groom</span>
                </label>
              </div>
            </div>

            {/* Age */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                <strong>Age</strong>
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '80px',
                    background: '#fff',
                    color: '#333',
                    border: 'none'
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
                <span style={{ color: '#333' }}>to</span>
                <select
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '80px',
                    background: '#fff',
                    color: '#333',
                    border: 'none'
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                <strong>Height</strong>
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={minHeight}
                  onChange={(e) => setMinHeight(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '120px',
                    background: '#fff',
                    color: '#333',
                    border: 'none'
                  }}
                >
                  <option value="">Select</option>
                  {heightOptions.map(height => (
                    <option key={height} value={height}>{height}</option>
                  ))}
                </select>
                <span style={{ color: '#333' }}>to</span>
                <select
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '120px',
                    background: '#fff',
                    color: '#333',
                    border: 'none'
                  }}
                >
                  <option value="">Select</option>
                  {heightOptions.map(height => (
                    <option key={height} value={height}>{height}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              style={{
                padding: '12px 30px',
                background: '#E94B6A',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Unified Section: Profile ID Search, Brides, and Grooms */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        {/* Profile ID Search */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            borderBottom: 'none',
            paddingBottom: '10px',
            textAlign: 'center'
          }}>
            Profile ID Search
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="text"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleProfileIdSearch();
                }
              }}
              placeholder="Enter Profile ID"
              style={{
                padding: '10px 15px',
                borderRadius: '4px',
                fontSize: '16px',
                flex: 1,
                maxWidth: '300px',
                border: 'none'
              }}
            />
            <button
              onClick={handleProfileIdSearch}
              style={{
                padding: '10px 25px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Toggle Button and Profiles Section */}
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          {/* Toggle Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '30px' 
          }}>
            <div style={{
              display: 'flex',
              borderRadius: '25px',
              border: '2px solid #9333EA',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setProfileType('bride')}
                style={{
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: profileType === 'bride' ? '23px 0 0 23px' : '0',
                  backgroundColor: profileType === 'bride' ? '#3B82F6' : '#FFFFFF',
                  color: profileType === 'bride' ? '#FFFFFF' : '#9333EA',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (profileType !== 'bride') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (profileType !== 'bride') {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                Bride
              </button>
              <button
                onClick={() => setProfileType('groom')}
                style={{
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: profileType === 'groom' ? '0 23px 23px 0' : '0',
                  backgroundColor: profileType === 'groom' ? '#3B82F6' : '#FFFFFF',
                  color: profileType === 'groom' ? '#FFFFFF' : '#9333EA',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (profileType !== 'groom') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (profileType !== 'groom') {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                Groom
              </button>
            </div>
          </div>

          {/* Profiles Grid */}
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading {profileType === 'bride' ? 'brides' : 'grooms'}...
            </div>
          ) : (profileType === 'bride' ? brides : grooms).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No {profileType === 'bride' ? 'brides' : 'grooms'} found
            </div>
          ) : (
            <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
              {(profileType === 'bride' ? brides : grooms).map((profile) => {
                const getPhotoUrl = () => {
                  const photoUrl = profile.photo_s3_url || profile.photo;
                  
                  // If no photo URL but we have user ID, use blob API
                  if (!photoUrl && profile.id) {
                    return `/api/photo?userId=${profile.id}`;
                  }
                  
                  if (!photoUrl) return null;
                  
                  // Check if photo is from S3 (more robust detection)
                  const isS3Url = photoUrl && (
                    photoUrl.includes('s3.amazonaws.com') || 
                    photoUrl.includes('.s3.') ||
                    photoUrl.includes('s3-') ||
                    photoUrl.includes('amazonaws.com')
                  );
                  
                  // Use PostgreSQL blob API for S3 URLs to avoid CORS issues
                  if (isS3Url && profile.id) {
                    return `/api/photo?userId=${profile.id}`;
                  }
                  
                  // If photo starts with "local-", it means it's stored in DB blob
                  if (photoUrl.startsWith('local-') && profile.id) {
                    return `/api/photo?userId=${profile.id}`;
                  }
                  
                  // Normalize the photo URL
                  let normalizedUrl = photoUrl.trim();
                  
                  // Fix malformed URLs
                  if (normalizedUrl.startsWith('https:/') && !normalizedUrl.startsWith('https://')) {
                    normalizedUrl = normalizedUrl.replace('https:/', 'https://');
                  }
                  if (normalizedUrl.startsWith('http:/') && !normalizedUrl.startsWith('http://')) {
                    normalizedUrl = normalizedUrl.replace('http:/', 'http://');
                  }
                  
                  // Handle full URLs
                  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
                    return normalizedUrl;
                  }
                  
                  // Handle relative paths
                  if (normalizedUrl.startsWith('/')) {
                    return normalizedUrl;
                  }
                  
                  // If we have user ID but no valid URL, use blob API
                  if (profile.id) {
                    return `/api/photo?userId=${profile.id}`;
                  }
                  
                  return `/${normalizedUrl}`;
                };

                return (
                  <div
                    key={profile.id}
                    onClick={() => router.push(`/${profile.id}`)}
                    style={{
                      borderRadius: '6px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Photo Section */}
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)'
                    }}>
                      {getPhotoUrl() ? (
                        <img
                          src={getPhotoUrl() || ''}
                          alt={profile.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('/api/photo')) {
                              img.style.display = 'none';
                            } else if (profile.id && (profile.photo_s3_url || profile.photo)?.includes('s3')) {
                              img.src = `/api/photo?userId=${profile.id}`;
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '48px',
                          fontWeight: 'bold',
                          color: '#ccc'
                        }}>
                          {profile.name ? profile.name[0].toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    {/* Info Section */}
                    <div style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#E94B6A', marginBottom: '5px', fontSize: '14px' }}>
                        ID: {profile.id}
                      </div>
                      <div style={{ color: '#333', fontSize: '15px', fontWeight: '500' }}>
                        {profile.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .search-section {
            padding: 20px !important;
          }
          .height-select {
            width: 100% !important;
          }
        }
        @media (max-width: 1200px) {
          .profiles-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 968px) {
          .quick-search-container {
            flex-direction: column !important;
          }
          .profiles-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .profiles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .profiles-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
