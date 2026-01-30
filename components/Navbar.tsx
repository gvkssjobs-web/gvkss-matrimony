'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCurrentUser, User, isAdmin } from '@/lib/auth';

function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setPhotoError(false);

    if (currentUser && !currentUser.id && currentUser.email) {
      fetch(`/api/auth/current-user?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.user?.id) {
            const updatedUser = { 
              ...currentUser, 
              id: data.user.id,
              photo: data.user.photo || currentUser.photo
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        })
        .catch(err => console.error('Failed to refresh user:', err));
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.avatar-dropdown')) setShowDropdown(false);
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const getPhotoUrl = (user: User) => {
    if (!user.photo) return '';
    if (user.photo.startsWith('http')) return user.photo;
    if (user.id) return `/api/photo?userId=${user.id}`;
    return `/${user.photo}`;
  };

  return (
    <nav className="fixed w-full z-50 bg-pink-600 transition-all duration-200" style={{ top: '30px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
        
        {/* Left: Logo - fills navbar height */}
        <Link href="/" className="flex items-center h-full shrink-0 hover:opacity-90 transition-opacity">
          <Image src="/logo.jpg" alt="Logo" width={120} height={56} className="object-contain object-left h-full w-auto" priority />
        </Link>

        {/* Right: Links + Auth */}
        <div className="flex items-center gap-4">

          {/* Navigation Links */}
          <Link href="/" className="text-white font-medium hover:opacity-80 transition-opacity">Home</Link>
          <Link
            href="#contact"
            className="text-white font-medium hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contact Us
          </Link>

          {/* User / Auth Buttons */}
          {user ? (
            <div className="relative avatar-dropdown">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white font-semibold overflow-hidden border-2 border-white shadow-md">
                  {user.photo && !photoError ? (
                    <img
                      src={getPhotoUrl(user)}
                      alt={user.name || user.email}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <span className="text-lg text-pink-600">{getInitials(user.name, user.email)}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-white">{user.name || 'User'}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">ID: {user.id || 'N/A'}</p>
                  </div>
                  {isAdmin(user) ? (
                    <Link href="/admin" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Admin Panel</Link>
                  ) : (
                    <Link href={user.id ? `/${user.id}` : '/'} onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile Info</Link>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      setUser(null);
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="px-5 py-2 font-semibold rounded-lg bg-white text-pink-600 shadow hover:bg-gray-100 transition"
              >
                Registration
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 font-semibold rounded-lg bg-white text-pink-600 shadow hover:bg-gray-100 transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
