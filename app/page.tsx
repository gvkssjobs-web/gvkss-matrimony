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

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Redirect to dashboard or admin page
      const userRole = currentUser.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
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
          console.error('Failed to fetch brides and grooms');
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
    // Handle search logic here
    console.log('Search:', { searchType, minAge, maxAge, minHeight, maxHeight });
  };

  const handleProfileIdSearch = () => {
    // Handle profile ID search
    console.log('Profile ID Search:', profileId);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Quick Search Section */}
      <div className="quick-search-container" style={{
        background: '#fff',
        border: '1px solid #90EE90',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '30px',
        alignItems: 'flex-start'
      }}>
        {/* Left Side - Form */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #E94B6A',
            paddingBottom: '10px',
            width: '66%'
          }}>
            Quick Search
          </h2>

          {/* Looking For */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#555' }}>
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
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#555' }}>
              <strong>Age</strong>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '80px'
                }}
              >
                {Array.from({ length: 28 }, (_, i) => i + 18).map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              <span style={{ color: '#666' }}>to</span>
              <select
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '80px'
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
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#555' }}>
              <strong>Height</strong>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={minHeight}
                onChange={(e) => setMinHeight(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '120px'
                }}
              >
                <option value="">Select</option>
                {heightOptions.map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
              <span style={{ color: '#666' }}>to</span>
              <select
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '120px'
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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

        {/* Right Side - Image */}
        <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '400px',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <Image
              src="/images.jpg"
              alt="Happy Couple"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>

      {/* Profile ID Search */}
      <div style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #E94B6A',
          paddingBottom: '10px'
        }}>
          Profile ID Search
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            placeholder="Enter Profile ID"
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              flex: 1,
              maxWidth: '300px'
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
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Brides and Grooms Side by Side */}
      <div className="brides-grooms-container" style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Brides Section */}
        <div style={{
          flex: '1',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #E94B6A',
            paddingBottom: '10px'
          }}>
            Brides
          </h2>
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading brides...
            </div>
          ) : brides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No brides found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {brides.map((bride) => {
                const getPhotoUrl = () => {
                  const photoUrl = bride.photo_s3_url || bride.photo;
                  if (!photoUrl) return null;
                  
                  // Check if photo is from S3 (more robust detection)
                  const isS3Url = photoUrl && (
                    photoUrl.includes('s3.amazonaws.com') || 
                    photoUrl.includes('.s3.') ||
                    photoUrl.includes('s3-') ||
                    photoUrl.includes('amazonaws.com')
                  );
                  
                  // Use PostgreSQL blob API for S3 URLs to avoid CORS issues
                  if (isS3Url && bride.id) {
                    return `/api/photo?userId=${bride.id}`;
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
                  
                  return `/${normalizedUrl}`;
                };

                return (
                  <div
                    key={bride.id}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
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
                          alt={bride.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('/api/photo')) {
                              img.style.display = 'none';
                            } else if (bride.id && (bride.photo_s3_url || bride.photo)?.includes('s3')) {
                              img.src = `/api/photo?userId=${bride.id}`;
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
                          {bride.name ? bride.name[0].toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    {/* Info Section */}
                    <div style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#E94B6A', marginBottom: '5px', fontSize: '14px' }}>
                        ID: {bride.id}
                      </div>
                      <div style={{ color: '#333', fontSize: '15px', fontWeight: '500' }}>
                        {bride.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Grooms Section */}
        <div style={{
          flex: '1',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #E94B6A',
            paddingBottom: '10px'
          }}>
            Grooms
          </h2>
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading grooms...
            </div>
          ) : grooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No grooms found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {grooms.map((groom) => {
                const getPhotoUrl = () => {
                  const photoUrl = groom.photo_s3_url || groom.photo;
                  if (!photoUrl) return null;
                  
                  // Check if photo is from S3 (more robust detection)
                  const isS3Url = photoUrl && (
                    photoUrl.includes('s3.amazonaws.com') || 
                    photoUrl.includes('.s3.') ||
                    photoUrl.includes('s3-') ||
                    photoUrl.includes('amazonaws.com')
                  );
                  
                  // Use PostgreSQL blob API for S3 URLs to avoid CORS issues
                  if (isS3Url && groom.id) {
                    return `/api/photo?userId=${groom.id}`;
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
                  
                  return `/${normalizedUrl}`;
                };

                return (
                  <div
                    key={groom.id}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
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
                          alt={groom.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('/api/photo')) {
                              img.style.display = 'none';
                            } else if (groom.id && (groom.photo_s3_url || groom.photo)?.includes('s3')) {
                              img.src = `/api/photo?userId=${groom.id}`;
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
                          {groom.name ? groom.name[0].toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    {/* Info Section */}
                    <div style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#E94B6A', marginBottom: '5px', fontSize: '14px' }}>
                        ID: {groom.id}
                      </div>
                      <div style={{ color: '#333', fontSize: '15px', fontWeight: '500' }}>
                        {groom.name}
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
        @media (max-width: 968px) {
          .quick-search-container {
            flex-direction: column !important;
          }
          .brides-grooms-container {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
