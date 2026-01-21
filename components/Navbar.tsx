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
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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
      // If user doesn't have photo, try to refresh user data from API
      if (!currentUser.photo) {
        fetch(`/api/auth/current-user?email=${encodeURIComponent(currentUser.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.photo) {
              const updatedUser = { ...currentUser, photo: data.user.photo };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              console.log('Updated user with photo:', updatedUser);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setLoginData({ email: '', password: '' });
        const userRole = data.user.role;
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push(`/${userRole}`);
        }
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <nav id="theme-navbar" className='fixed w-full z-10 top-0 transition-all duration-200 border-b' style={{ backgroundColor: '#FFFFFF', borderColor: '#DCFCE7' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center gap-4'>
            {/* Logo */}
            <Link href="/" className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
              <Image 
                src="/logo.jpg" 
                alt="GVKSS Software Pvt. Ltd." 
                width={100} 
                height={40}
                className="h-auto"
                priority
              />
            </Link>

            {/* Login Button / User Menu */}
            <div className='flex items-center gap-4'>
            {/* Notifications Bell Icon */}
            {user && (
              <button
                className='p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 border border-zinc-700 relative'
                aria-label="Notifications"
                type="button"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {user ? (
              <div className="relative avatar-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
                  aria-label="User menu"
                >
                  {user.photo && !photoError ? (
                    <img
                      src={user.photo.startsWith('/') ? user.photo : `/${user.photo}`}
                      alt={user.name || user.email}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', user.photo);
                        console.error('Attempted path:', user.photo.startsWith('/') ? user.photo : `/${user.photo}`);
                        setPhotoError(true);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', user.photo);
                      }}
                    />
                  ) : (
                    getInitials(user.name, user.email)
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-700 rounded-lg shadow-xl border border-zinc-600 py-2 z-50">
                    <div className="px-4 py-3 border-b border-zinc-600 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                        {user.photo && !photoError ? (
                          <img
                            src={user.photo.startsWith('/') ? user.photo : `/${user.photo}`}
                            alt={user.name || user.email}
                            className="w-full h-full object-cover rounded-full"
                            onError={() => setPhotoError(true)}
                          />
                        ) : (
                          getInitials(user.name, user.email)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // View Profile action
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-600 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>View Profile</span>
                      </div>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isAdmin(user) && pathname !== '/admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-zinc-600 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    {(pathname === '/silver' || pathname === '/gold' || pathname === '/platinum') && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Dispatch custom event to reset filters
                          window.dispatchEvent(new CustomEvent('resetFilters'));
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-600 transition-colors flex items-center justify-between"
                      >
                        <span>Reset Filters</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        localStorage.removeItem('user');
                        router.push('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-600 transition-colors"
                      style={{ color: '#22C55E' }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white text-sm w-40 transition-all duration-200 shadow-sm placeholder:text-[#9CA3AF]"
                  style={{ borderColor: '#22C55E', color: '#111827', borderWidth: '2px' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16A34A';
                    e.target.style.borderWidth = '2px';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#22C55E';
                    e.target.style.borderWidth = '2px';
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white text-sm w-32 transition-all duration-200 shadow-sm placeholder:text-[#9CA3AF]"
                  style={{ borderColor: '#22C55E', color: '#111827', borderWidth: '2px' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16A34A';
                    e.target.style.borderWidth = '2px';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#22C55E';
                    e.target.style.borderWidth = '2px';
                  }}
                />
                {loginError && (
                  <span className="text-red-600 text-xs whitespace-nowrap">{loginError}</span>
                )}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className='px-4 py-2 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                  style={{ backgroundColor: '#16A34A' }}
                  onMouseEnter={(e) => !loginLoading && (e.currentTarget.style.backgroundColor = '#15803D')}
                  onMouseLeave={(e) => !loginLoading && (e.currentTarget.style.backgroundColor = '#16A34A')}
                >
                  {loginLoading ? '...' : 'Login'}
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
        {/* Decorative Horizontal Line - Yellow and Red (at bottom of nav) */}
        <div className="w-full">
          <div className="h-1 bg-yellow-500"></div>
          <div className="h-0.5 bg-green-600"></div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;