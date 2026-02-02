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
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setPhotoError(false);

    // Refresh user from API so we have latest id (e.g. after admin accept, id changes to 5000+)
    if (currentUser?.email) {
      fetch(`/api/auth/current-user?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const updatedUser = {
              ...currentUser,
              id: data.user.id,
              name: data.user.name ?? currentUser.name,
              role: data.user.role ?? currentUser.role,
              photo: data.user.photo ?? currentUser.photo,
              phoneNumber: data.user.phoneNumber ?? currentUser.phoneNumber,
              gender: data.user.gender ?? currentUser.gender,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        })
        .catch(() => {});
    }
    if (currentUser && isAdmin(currentUser)) {
      fetch('/api/admin/notifications')
        .then(res => res.json())
        .then(data => setNotificationCount(Array.isArray(data.notifications) ? data.notifications.length : 0))
        .catch(() => setNotificationCount(0));
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
    <nav
      className="fixed w-full z-50 transition-all duration-200 overflow-hidden"
      style={{
        top: '30px',
        background: 'linear-gradient(90deg, #FFB6C1 0%, #FF69B4 50%, #E91E8C 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Optional subtle wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1200 12" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.15)" d="M0,12 Q300,0 600,12 T1200,12 L1200,12 L0,12 Z" />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center relative">
        {/* Left: Logo - larger, no hover, transparent over gradient */}
        <Link href="/" className="nav-logo flex items-center h-full shrink-0 bg-transparent [&_span]:!bg-transparent [&_img]:!bg-transparent">
          <span className="flex items-center h-full mix-blend-multiply">
            <Image src="/logo.png" alt="Deepthi Matrimony" width={180} height={64} className="object-contain object-left h-full w-auto min-w-[140px]" priority />
          </span>
        </Link>

        {/* Right: Links + Auth */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white font-medium">
            Home
          </Link>
          <Link
            href="#contact"
            className="text-white font-medium"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contact Us
          </Link>

          {user && isAdmin(user) && (
            <Link
              href="/admin/notification"
              className="relative p-2.5 rounded-lg hover:bg-white/20 transition"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-white text-pink-600 text-xs font-bold rounded-full flex items-center justify-center border-2 border-pink-600">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Link>
          )}

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
                className="px-5 py-2 font-semibold rounded-lg bg-white text-black shadow-md hover:bg-gray-100 transition"
              >
                Registration
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 font-semibold rounded-lg bg-white text-black shadow hover:bg-gray-100 transition"
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
