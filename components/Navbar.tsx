'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, User, isAdmin } from '@/lib/auth';

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setPhotoError(false); // Reset photo error when user changes
    // Debug: log user photo
    if (currentUser) {
      console.log('User object:', currentUser);
      console.log('User photo:', currentUser.photo);
      console.log('User ID:', currentUser.id);
      // ALWAYS ensure user has ID - fetch from API if missing
      if (!currentUser.id && currentUser.email) {
        console.log('User ID missing, fetching from API...');
        fetch(`/api/auth/current-user?email=${encodeURIComponent(currentUser.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.id) {
              const updatedUser = { 
                ...currentUser, 
                id: data.user.id,
                photo: data.user.photo || currentUser.photo 
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              console.log('Updated user with ID:', updatedUser);
            }
          })
          .catch(err => console.error('Failed to refresh user data:', err));
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.avatar-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };


  return (
    <>
      <nav id="theme-navbar" className='fixed w-full z-50 top-0 transition-all duration-200' style={{ backgroundColor: '#e95353', borderBottom: 'none' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
          <div className='flex justify-between items-center gap-4'>
            {/* Logo */}
            <Link href="/" className='flex items-center gap-2 hover:opacity-90 transition-opacity'>
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                width={50} 
                height={40}
                style={{ width: 'auto', height: 'auto', maxHeight: '50px' }}
                className="h-auto"
                priority
              />
            </Link>

            {/* Navigation Links */}
            <div className='flex items-center gap-6'>
              <Link 
                href="/" 
                className='text-white font-medium hover:opacity-80 transition-opacity'
                style={{ color: pathname === '/' ? '#FFFFFF' : '#FFFFFF' }}
              >
                Home
              </Link>
              <Link 
                href="#contact" 
                className='text-white font-medium hover:opacity-80 transition-opacity'
                onClick={(e) => {
                  e.preventDefault();
                  const footer = document.querySelector('footer');
                  if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Contact Us
              </Link>
            </div>

            {/* Login Button / User Menu */}
            <div className='flex items-center gap-3'>
            {/* Notifications Bell Icon */}
            {user && (
              <button
                className='p-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 relative'
                aria-label="Notifications"
                type="button"
                style={{ backgroundColor: 'transparent' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-pink-600 text-xs font-bold rounded-full flex items-center justify-center border-2 border-pink-600">
                  2
                </span>
              </button>
            )}

            {user ? (
              <div className="relative avatar-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                  aria-label="User menu"
                >
                  {/* Avatar Frame */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white font-semibold overflow-hidden border-2 border-white shadow-md">
                    {user.photo && !photoError ? (
                      <img
                        src={(() => {
                          if (!user.photo && user.id) {
                            return `/api/photo?userId=${user.id}`;
                          }
                          if (!user.photo) return '';
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
                        })()}
                        alt={user.name || user.email}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.src.includes('/api/photo')) {
                            setPhotoError(true);
                          } else {
                            const isS3Url = user.photo && (
                              user.photo.includes('s3.amazonaws.com') || 
                              user.photo.includes('.s3.') ||
                              user.photo.includes('s3-') ||
                              user.photo.includes('amazonaws.com')
                            );
                            if (isS3Url && user.id) {
                              img.src = `/api/photo?userId=${user.id}`;
                              img.onerror = () => setPhotoError(true);
                            } else if (isS3Url && user.email) {
                              fetch(`/api/auth/current-user?email=${encodeURIComponent(user.email)}`)
                                .then(res => res.json())
                                .then(data => {
                                  if (data.user && data.user.id) {
                                    const updatedUser = { ...user, id: data.user.id };
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                    setUser(updatedUser);
                                    img.src = `/api/photo?userId=${data.user.id}`;
                                    img.onerror = () => setPhotoError(true);
                                  } else {
                                    setPhotoError(true);
                                  }
                                })
                                .catch(() => setPhotoError(true));
                            } else {
                              setPhotoError(true);
                            }
                          }
                        }}
                      />
                    ) : (
                      <span className="text-lg" style={{ color: '#E94B6A' }}>{getInitials(user.name, user.email)}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                      {user.name || 'User'}
                    </span>
                    <span className="text-xs" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                      ID: {user.id || 'N/A'}
                    </span>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    style={{ color: '#FFFFFF' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold" style={{ color: '#333' }}>
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs" style={{ color: '#666' }}>
                        ID: {user.id || 'N/A'}
                      </p>
                    </div>
                    <Link
                      href={user.id ? `/${user.id}` : '/'}
                      onClick={() => setShowDropdown(false)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                      style={{ color: '#333' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Info</span>
                    </Link>
                    {isAdmin(user) && pathname !== '/admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        style={{ color: '#333' }}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        localStorage.removeItem('user');
                        setUser(null);
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                      style={{ color: '#E94B6A' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className='px-5 py-2 text-white font-semibold rounded-lg transition-all duration-200'
                  style={{ 
                    backgroundColor: '#9333EA',
                    boxShadow: '0 2px 4px rgba(147, 51, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7E22CE';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(147, 51, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#9333EA';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(147, 51, 234, 0.3)';
                  }}
                >
                  Free Registration
                </Link>
                <Link
                  href="/login"
                  className='px-5 py-2 font-semibold rounded-lg transition-all duration-200'
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    color: '#E94B6A',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF1F4';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  Login
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;