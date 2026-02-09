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
  const [brides, setBrides] = useState<Array<{ id: number; name: string; photo: string | null; photo_s3_url: string | null; photoCount?: number }>>([]);
  const [grooms, setGrooms] = useState<Array<{ id: number; name: string; photo: string | null; photo_s3_url: string | null; photoCount?: number }>>([]);
  const [photoIndices, setPhotoIndices] = useState<Record<number, number>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [profileType, setProfileType] = useState<'bride' | 'groom'>('bride');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Admin can stay on home; only non-admin users need status check
      if (currentUser.role !== 'admin') {
        const checkUserStatus = async () => {
          try {
            const response = await fetch(`/api/users/${currentUser.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.status && data.status !== 'accepted') {
                router.push('/status');
                return;
              }
            }
          } catch (err) {
            console.error('Failed to check user status:', err);
          }
          setLoading(false);
        };
        checkUserStatus();
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
            photo_s3_url: bride.photo_s3_url || null,
            photoCount: bride.photoCount ?? 1
          })));
          setGrooms(data.grooms.map((groom: any) => ({
            id: groom.id,
            name: groom.name || 'N/A',
            photo: groom.photo || null,
            photo_s3_url: groom.photo_s3_url || null,
            photoCount: groom.photoCount ?? 1
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
        background: '#FBF0F2',
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
            top: '60px',
            right: '100px',
            width: '400px',
            maxWidth: 'calc(100% - 40px)',
            zIndex: 5,

            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '25px',
            padding: '30px',

            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            border: 'none',
            color: '#fff' // base text color
          }}>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#fff'
            }}>
              Quick Search
            </h2>

            {/* Looking For */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.85)'
              }}>
                Looking For
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
                  <span style={{ fontSize: '16px', color: '#fff' }}>Bride</span>
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
                  <span style={{ fontSize: '16px', color: '#fff' }}>Groom</span>
                </label>
              </div>
            </div>

            {/* Age */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.85)'
              }}>
                Age
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
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age} style={{ color: '#000' }}>
                      {age}
                    </option>
                  ))}
                </select>

                <span style={{ color: 'rgba(255,255,255,0.7)' }}>to</span>

                <select
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '80px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age} style={{ color: '#000' }}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.85)'
              }}>
                Height
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
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <option value="" style={{ color: '#000' }}>Select</option>
                  {heightOptions.map(height => (
                    <option key={height} value={height} style={{ color: '#000' }}>
                      {height}
                    </option>
                  ))}
                </select>

                <span style={{ color: 'rgba(255,255,255,0.7)' }}>to</span>

                <select
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '120px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <option value="" style={{ color: '#000' }}>Select</option>
                  {heightOptions.map(height => (
                    <option key={height} value={height} style={{ color: '#000' }}>
                      {height}
                    </option>
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
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Search
            </button>

          </div>

        </div>
      </div>

      {/* Unified Section: Profile ID Search, Brides, and Grooms */}
      <div style={{
        background: '#FBF0F2',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        {/* Profile ID Search */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '5px',
            color: '#333',
            borderBottom: 'none',
            paddingBottom: '10px',
            textAlign: 'center'
          }}>
            Profile ID Search
          </h2>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center' }}>
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
                borderRadius: '10px',
                fontSize: '16px',
                flex: 1,
                maxWidth: '300px',
                border: '3px solid #333'
              }}
            />
            <button
              onClick={handleProfileIdSearch}
              style={{
                padding: '10px 25px',
                background: 'linear-gradient(135deg, #7A0F2E, #A41644)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
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
          background: '#FBF0F2',
          borderRadius: '8px'
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
              backgroundColor: '#FBF0F2',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setProfileType('bride')}
                style={{
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: profileType === 'bride' ? '23px 0 0 23px' : '0',
                  backgroundColor: profileType === 'bride' ? '#7A0F2E' : '#FBF0F2',
                  color: profileType === 'bride' ? '#FFFFFF' : '#9333EA',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (profileType !== 'bride') {
                    e.currentTarget.style.backgroundColor = '#FDF3F5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (profileType !== 'bride') {
                    e.currentTarget.style.backgroundColor = '#FBF0F2';
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
                  backgroundColor: profileType === 'groom' ? '#7A0F2E' : '#FBF0F2',
                  color: profileType === 'groom' ? '#FFFFFF' : '#9333EA',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (profileType !== 'groom') {
                    e.currentTarget.style.backgroundColor = '#FDF3F5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (profileType !== 'groom') {
                    e.currentTarget.style.backgroundColor = '#FBF0F2';
                  }
                }}
              >
                Groom
              </button>
            </div>
          </div>

          {/* Profiles Grid */}
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#3A3A3A' }}>
              Loading {profileType === 'bride' ? 'brides' : 'grooms'}...
            </div>
          ) : (profileType === 'bride' ? brides : grooms).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#3A3A3A' }}>
              No {profileType === 'bride' ? 'brides' : 'grooms'} found
            </div>
          ) : (
            <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
              {(profileType === 'bride' ? brides : grooms).map((profile) => {
                const photoCount = profile.photoCount ?? 1;
                const photoIndex = photoIndices[profile.id] ?? 0;

                const getPhotoUrl = (index?: number) => {
                  const idx = index ?? photoIndex;
                  const photoUrl = profile.photo_s3_url || profile.photo;
                  if (!profile.id) return null;
                  if (photoCount > 1) return `/api/photo?userId=${profile.id}&index=${idx}`;
                  if (!photoUrl) return `/api/photo?userId=${profile.id}&index=0`;
                  const isS3Url = photoUrl && (photoUrl.includes('s3.amazonaws.com') || photoUrl.includes('.s3.') || photoUrl.includes('s3-') || photoUrl.includes('amazonaws.com'));
                  if (isS3Url || photoUrl.startsWith('local-')) return `/api/photo?userId=${profile.id}&index=0`;
                  let normalizedUrl = photoUrl.trim();
                  if (normalizedUrl.startsWith('https:/') && !normalizedUrl.startsWith('https://')) normalizedUrl = normalizedUrl.replace('https:/', 'https://');
                  if (normalizedUrl.startsWith('http:/') && !normalizedUrl.startsWith('http://')) normalizedUrl = normalizedUrl.replace('http:/', 'http://');
                  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) return normalizedUrl;
                  if (normalizedUrl.startsWith('/')) return normalizedUrl;
                  return `/api/photo?userId=${profile.id}&index=0`;
                };

                const setPhotoIndex = (next: number) => {
                  setPhotoIndices(prev => ({ ...prev, [profile.id]: next }));
                };

                return (
                  <div
                    key={profile.id}
                    onClick={() => router.push(`/${profile.id}`)}
                    style={{
                      borderRadius: '6px',
                      background: '#FBF0F2',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: '2px solid #E7C9D1'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Photo Section */}
                    <div                     style={{
                      width: '100%',
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #FBF0F2 0%, #FDF3F5 100%)'
                    }}>
                      {photoCount > 1 && (
                        <div className="absolute top-2 right-2 z-10 flex gap-1" style={{ top: 8, right: 8 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setPhotoIndex(photoIndex <= 0 ? photoCount - 1 : photoIndex - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                            aria-label="Previous photo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoIndex(photoIndex >= photoCount - 1 ? 0 : photoIndex + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                            aria-label="Next photo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      )}
                      {getPhotoUrl() ? (
                        <img
                          key={photoIndex}
                          src={getPhotoUrl() || ''}
                          alt={profile.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('/api/photo')) img.style.display = 'none';
                            else if (profile.id) { img.src = `/api/photo?userId=${profile.id}&index=0`; }
                            else img.style.display = 'none';
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
                      <div style={{ color: '#3A3A3A', fontSize: '15px', fontWeight: '500' }}>
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
