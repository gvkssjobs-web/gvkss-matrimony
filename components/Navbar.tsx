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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

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
      className="fixed w-full z-50 transition-all duration-200 top-[28px]"
      style={{
        background: 'linear-gradient(90deg, #5A071F 0%, #A41644 50%, #5A071F 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Subtle wave at bottom - dark to match maroon, no light band */}
      <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1200 12" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(90,7,31,0.5)" d="M0,12 Q300,0 600,12 T1200,12 L1200,12 L0,12 Z" />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex justify-between items-center relative">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center h-full max-h-14 sm:max-h-16 shrink-0 overflow-visible bg-transparent [&_span]:!bg-transparent [&_img]:!bg-transparent" onClick={() => setShowMobileMenu(false)}>
          <span className="flex items-center h-full max-h-14 sm:max-h-16 overflow-visible" style={{ filter: 'drop-shadow(0 0 4px rgba(253, 8, 8, 0.35)) drop-shadow(0 0 8px rgba(255,255,255,0.15))' }}>
            <span className="flex items-center h-full max-h-14 sm:max-h-16 mix-blend-multiply">
              <Image src="/logo.png" alt="Deepthi Matrimony" width={160} height={56} className="object-contain object-left max-h-10 sm:max-h-14 h-auto w-auto max-w-[130px] sm:max-w-[200px]" priority />
            </span>
          </span>
        </Link>

        {/* Desktop: Links + Auth */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link href="/" className="font-medium text-white" style={{ color: '#FFF1F4' }}>
            Home
          </Link>
          <Link
            href="#contact"
            className="font-medium text-white"
            style={{ color: '#FFF1F4' }}
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
              <svg className="w-5 h-5" style={{ color: '#FFF1F4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFF1F4', color: '#E94B6A', borderColor: '#E94B6A' }}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative avatar-dropdown">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity text-white" style={{ color: '#FFF1F4' }}>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white font-semibold overflow-hidden border-2 border-white shadow-md shrink-0">
                  {user.photo && !photoError ? (
                    <img
                      src={getPhotoUrl(user)}
                      alt={user.name || user.email}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <span className="text-sm sm:text-lg" style={{ color: '#E94B6A' }}>{getInitials(user.name, user.email)}</span>
                  )}
                </div>
                <span className="text-sm font-semibold hidden lg:inline" style={{ color: '#FFF1F4' }}>{user.name || 'User'}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFF1F4' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]" style={{ isolation: 'isolate' }}>
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
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    style={{ color: '#E94B6A' }}
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
                className="px-5 py-2 font-semibold rounded-lg shadow-md border transition hover:opacity-90"
                style={{ backgroundColor: '#F7E2DC', color: '#7A0F2E', borderColor: '#E6B8C3' }}
              >
                Registration
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 font-semibold rounded-lg shadow border transition hover:opacity-90"
                style={{ backgroundColor: '#F7E2DC', color: '#7A0F2E', borderColor: '#E6B8C3' }}
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger + Auth */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="relative avatar-dropdown">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center justify-center w-9 h-9 rounded-full bg-white font-semibold overflow-hidden border-2 border-white shadow-md" style={{ color: '#E94B6A' }}>
                {user.photo && !photoError ? (
                  <img src={getPhotoUrl(user)} alt="" className="w-full h-full object-cover" onError={() => setPhotoError(true)} />
                ) : (
                  <span className="text-sm">{getInitials(user.name, user.email)}</span>
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">ID: {user.id || 'N/A'}</p>
                  </div>
                  {isAdmin(user) ? (
                    <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Admin Panel</Link>
                  ) : (
                    <Link href={user.id ? `/${user.id}` : '/'} onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                  )}
                  <button onClick={() => { localStorage.removeItem('user'); setUser(null); window.location.href = '/'; }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" style={{ color: '#E94B6A' }}>Logout</button>
                </div>
              )}
            </div>
          )}
          {!user && (
            <div className="flex gap-2">
              <Link href="/login" className="px-3 py-1.5 text-sm font-semibold rounded-lg border" style={{ backgroundColor: '#F7E2DC', color: '#7A0F2E', borderColor: '#E6B8C3' }}>Login</Link>
              <Link href="/register" className="px-3 py-1.5 text-sm font-semibold rounded-lg border" style={{ backgroundColor: '#F7E2DC', color: '#7A0F2E', borderColor: '#E6B8C3' }}>Register</Link>
            </div>
          )}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg hover:bg-white/20 transition" aria-label="Menu">
            <svg className="w-6 h-6" style={{ color: '#FFF1F4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/20 bg-black/10">
          <div className="px-4 py-3 flex flex-col gap-2">
            <Link href="/" onClick={() => setShowMobileMenu(false)} className="py-2 font-medium" style={{ color: '#FFF1F4' }}>Home</Link>
            <Link href="#contact" onClick={(e) => { e.preventDefault(); setShowMobileMenu(false); document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="py-2 font-medium" style={{ color: '#FFF1F4' }}>Contact Us</Link>
            {user && isAdmin(user) && (
              <Link href="/admin/notification" onClick={() => setShowMobileMenu(false)} className="py-2 font-medium flex items-center gap-2" style={{ color: '#FFF1F4' }}>
                Notifications {notificationCount > 0 && <span className="px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#FFF1F4', color: '#E94B6A' }}>{notificationCount}</span>}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
