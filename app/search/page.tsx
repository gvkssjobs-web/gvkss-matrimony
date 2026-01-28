'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: number;
  name: string;
  photo: string | null;
  photo_s3_url: string | null;
  gender: string | null;
  dob: string | null;
  height: string | null;
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchType = searchParams.get('type') || 'bride';
  const minAge = searchParams.get('minAge') || '';
  const maxAge = searchParams.get('maxAge') || '';
  const minHeight = searchParams.get('minHeight') || '';
  const maxHeight = searchParams.get('maxHeight') || '';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        params.set('gender', searchType);
        if (minAge) params.set('minAge', minAge);
        if (maxAge) params.set('maxAge', maxAge);
        if (minHeight) params.set('minHeight', minHeight);
        if (maxHeight) params.set('maxHeight', maxHeight);

        const response = await fetch(`/api/users/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        let filteredUsers = data.users || [];

        // Filter by height on client side (since height is stored as string like "5ft 8in")
        if (minHeight || maxHeight) {
          filteredUsers = filteredUsers.filter((user: SearchResult) => {
            if (!user.height) return false;
            
            // Simple height comparison - convert to comparable format
            const parseHeight = (heightStr: string): number => {
              const match = heightStr.match(/(\d+)ft\s*(\d+)in/i);
              if (match) {
                const feet = parseInt(match[1]);
                const inches = parseInt(match[2]);
                return feet * 12 + inches; // Convert to total inches
              }
              return 0;
            };

            const userHeightInches = parseHeight(user.height);
            if (userHeightInches === 0) return false;

            if (minHeight) {
              const minHeightInches = parseHeight(minHeight);
              if (userHeightInches < minHeightInches) return false;
            }
            if (maxHeight) {
              const maxHeightInches = parseHeight(maxHeight);
              if (userHeightInches > maxHeightInches) return false;
            }
            return true;
          });
        }

        setResults(filteredUsers);
      } catch (err) {
        setError('An error occurred while searching. Please try again.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchType, minAge, maxAge, minHeight, maxHeight]);

  const getPhotoUrl = (user: SearchResult) => {
    const photoUrl = user.photo_s3_url || user.photo;
    
    if (!photoUrl && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    if (!photoUrl) return null;
    
    const isS3Url = photoUrl && (
      photoUrl.includes('s3.amazonaws.com') || 
      photoUrl.includes('.s3.') ||
      photoUrl.includes('s3-') ||
      photoUrl.includes('amazonaws.com')
    );
    
    if (isS3Url && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    if (photoUrl.startsWith('local-') && user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    let normalizedUrl = photoUrl.trim();
    
    if (normalizedUrl.startsWith('https:/') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = normalizedUrl.replace('https:/', 'https://');
    }
    if (normalizedUrl.startsWith('http:/') && !normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http:/', 'http://');
    }
    
    if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
      return normalizedUrl;
    }
    
    if (normalizedUrl.startsWith('/')) {
      return normalizedUrl;
    }
    
    if (user.id) {
      return `/api/photo?userId=${user.id}`;
    }
    
    return `/${normalizedUrl}`;
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="w-full min-h-screen" style={{ 
      backgroundColor: 'var(--bg)',
      padding: '20px 0',
      paddingTop: 'calc(20px + 10px)'
    }}>
      <div className="max-w-7xl mx-auto">
      

        {/* Search Results Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Search Results
          </h1>
          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <span>Looking for: <strong className="capitalize">{searchType}</strong></span>
            {(minAge || maxAge) && (
              <span>Age: <strong>{minAge || '18'}-{maxAge || '45'}</strong></span>
            )}
            {(minHeight || maxHeight) && (
              <span>Height: <strong>{minHeight || 'Any'}-{maxHeight || 'Any'}</strong></span>
            )}
            <span>Found: <strong>{results.length} {results.length === 1 ? 'profile' : 'profiles'}</strong></span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
              </div>
              <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>Searching...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: 'var(--border)' }}>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xl mb-4" style={{ color: 'var(--text)' }}>No profiles found</p>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>Try adjusting your search criteria</p>
                <Link 
                  href="/"
                  className="px-6 py-2 rounded-lg text-white font-semibold inline-block"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
                >
                  New Search
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((user) => {
                  const photoUrl = getPhotoUrl(user);
                  const age = calculateAge(user.dob);

                  return (
                    <div
                      key={user.id}
                      onClick={() => router.push(`/${user.id}`)}
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
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={user.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img.src.includes('/api/photo')) {
                                img.style.display = 'none';
                              } else if (user.id && (user.photo_s3_url || user.photo)?.includes('s3')) {
                                img.src = `/api/photo?userId=${user.id}`;
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
                            {user.name ? user.name[0].toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      {/* Info Section */}
                      <div style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: '#E94B6A', marginBottom: '5px', fontSize: '14px' }}>
                          ID: {user.id}
                        </div>
                        <div style={{ color: '#333', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
                          {user.name}
                        </div>
                        {age && (
                          <div style={{ color: '#666', fontSize: '13px' }}>
                            Age: {age} years
                          </div>
                        )}
                        {user.height && (
                          <div style={{ color: '#666', fontSize: '13px' }}>
                            Height: {user.height}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
          </div>
          <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>Loading search...</div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
