'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser, isAdmin, User } from '@/lib/auth';
import { raasiOptions, starOptions, padamOptions, gothramOptions } from '@/lib/registration-options';

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
  status: string | null;
  marriageStatus?: string | null;
}

type EditFormState = { [K in keyof UserProfile]?: UserProfile[K] | null };

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({});
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<{ id: number; name: string | null } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Require login to view any profile
    const currentUser = getCurrentUser();
    if (!currentUser) {
      const profileId = params.id as string;
      router.replace(`/login?redirect=/${profileId}`);
      return;
    }

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
        // Admin can view every record; users can view their own profile or accepted profiles
        const viewer = getCurrentUser();
        const isViewingOwnProfile = viewer && viewer.id && viewer.id === parseInt(params.id as string);
        if (!isAdmin(viewer) && !isViewingOwnProfile && data.status && data.status !== 'accepted') {
          router.push('/status');
          return;
        }
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
  }, [params.id, router]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (editing && user) {
      setEditForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        address: user.address ?? '',
        gender: user.gender ?? '',
        marriageStatus: user.marriageStatus ?? '',
        dob: user.dob ?? '',
        birthTime: user.birthTime ?? '',
        birthPlace: user.birthPlace ?? '',
        height: user.height ?? '',
        complexion: user.complexion ?? '',
        star: user.star ?? '',
        raasi: user.raasi ?? '',
        gothram: user.gothram ?? '',
        padam: user.padam ?? '',
        uncleGothram: user.uncleGothram ?? '',
        educationCategory: user.educationCategory ?? '',
        educationDetails: user.educationDetails ?? '',
        employedIn: user.employedIn ?? '',
        occupation: user.occupation ?? '',
        occupationInDetails: user.occupationInDetails ?? '',
        annualIncome: user.annualIncome ?? '',
        siblingsInfo: user.siblingsInfo ?? null,
      });
    }
  }, [editing, user]);

  useEffect(() => {
    if (!actionsOpen || !actionsButtonRef.current) {
      setDropdownPosition(null);
      return;
    }
    const rect = actionsButtonRef.current.getBoundingClientRect();
    setDropdownPosition({
      left: rect.right - 140,
      top: rect.bottom,
      openUp: false,
    });
  }, [actionsOpen]);

  const handleProfileAction = async (action: 'reject' | 'accept' | 'delete') => {
    if (!user) return;
    setActionsOpen(false);
    setError('');
    if (action === 'delete') {
      setDeleteConfirmFor({ id: user.id, name: user.name ?? null });
      return;
    }
    try {
      const status = action === 'reject' ? 'rejected' : 'accepted';
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status }),
      });
      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, status } : null));
        setSaveSuccess(`User ${action === 'reject' ? 'rejected' : 'accepted'}`);
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(`Failed to ${action} user`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmFor) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${deleteConfirmFor.id}`, { method: 'DELETE' });
      if (response.ok) {
        setDeleteConfirmFor(null);
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!user || !currentUser) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const payload: Record<string, unknown> = {};
      const keys = ['name', 'email', 'phoneNumber', 'address', 'gender', 'marriageStatus', 'dob', 'birthTime', 'birthPlace', 'height', 'complexion', 'star', 'raasi', 'gothram', 'padam', 'uncleGothram', 'educationCategory', 'educationDetails', 'employedIn', 'occupation', 'occupationInDetails', 'annualIncome', 'siblingsInfo'] as const;
      keys.forEach((k) => {
        if (k in editForm) payload[k] = (editForm as Record<string, unknown>)[k];
      });

      // Add currentUserEmail for authentication
      payload.currentUserEmail = currentUser.email;

      // Use admin endpoint for admins, user endpoint for regular users
      const isAdminUser = isAdmin(currentUser);
      const apiUrl = isAdminUser 
        ? `/api/admin/users/${user.id}`
        : `/api/users/${user.id}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : null));
        setEditing(false);
        setSaveSuccess('Profile updated successfully');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        setSaveError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setSaveError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

                {/* Edit button: Show for admin or user viewing their own profile */}
                {currentUser && !editing && (isAdmin(currentUser) || (currentUser.id && user && currentUser.id === user.id)) && (
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 border-2 rounded-xl font-semibold transition-colors"
                      style={{ borderColor: '#E94B6A', color: '#E94B6A' }}
                    >
                      Edit
                    </button>
                    {/* Actions dropdown: Admin only */}
                    {isAdmin(currentUser) && (
                      <div className="relative inline-block">
                        <button
                          ref={actionsButtonRef}
                          type="button"
                          onClick={(e) => { actionsButtonRef.current = e.currentTarget; setActionsOpen(!actionsOpen); }}
                          className="px-3 py-1.5 border-2 rounded-xl bg-white transition-colors flex items-center gap-1"
                          style={{ borderColor: '#FF8AA2', color: '#111827' }}
                          aria-haspopup="true"
                          aria-expanded={actionsOpen}
                        >
                          Actions
                          <svg className={`w-4 h-4 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {editing && (
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setSaveError(''); }}
                      className="px-4 py-2 border-2 rounded-xl font-semibold transition-colors"
                      style={{ borderColor: '#6b7280', color: '#6b7280' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {(saveError || saveSuccess) && (
                  <div className={`mb-4 px-4 py-3 rounded-lg ${saveError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                    {saveError || saveSuccess}
                  </div>
                )}
              </div>

              {/* User Details (admin only) */}
              {currentUser && isAdmin(currentUser) && user && (
                <div className="space-y-4 mb-6">
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: 'var(--text)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}
                  >
                    User Details
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex gap-2 text-base items-center">
                      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Phone Number:</span>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.phoneNumber ?? ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value || null }))}
                          className="flex-1 px-3 py-2 border-2 rounded-lg"
                          style={{ borderColor: 'var(--border)' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text)' }}>{user.phoneNumber || '-'}</span>
                      )}
                    </div>
                    <div className="flex gap-2 text-base items-center">
                      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Address:</span>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.address ?? ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value || null }))}
                          className="flex-1 px-3 py-2 border-2 rounded-lg"
                          style={{ borderColor: 'var(--border)' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text)' }}>{user.address || '-'}</span>
                      )}
                    </div>
                    <div className="flex gap-2 text-base items-center">
                      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Email:</span>
                      {editing ? (
                        <input
                          type="email"
                          value={editForm.email ?? ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value || null }))}
                          className="flex-1 px-3 py-2 border-2 rounded-lg"
                          style={{ borderColor: 'var(--border)' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text)' }}>{user.email || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                    {editing && (
                      <>
                        <div className="flex gap-2 text-base items-center">
                          <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Name:</span>
                          <input
                            type="text"
                            value={editForm.name ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        </div>
                        <div className="flex gap-2 text-base items-center">
                          <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Gender:</span>
                          <select
                            value={editForm.gender ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            <option value="bride">Bride</option>
                            <option value="groom">Groom</option>
                          </select>
                        </div>
                        <div className="flex gap-2 text-base items-center">
                          <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Marriage Status:</span>
                          <input
                            type="text"
                            value={editForm.marriageStatus ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, marriageStatus: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        </div>
                      </>
                    )}
                    {(editing || user.dob) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Date of Birth:</span>
                        {editing ? (
                          <input
                            type="date"
                            value={editForm.dob ? String(editForm.dob).slice(0, 10) : ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, dob: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.dob ? new Date(user.dob).toLocaleDateString() : '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.birthTime) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Birth Time:</span>
                        {editing ? (
                          <input
                            type="text"
                            placeholder="e.g. 14:30"
                            value={editForm.birthTime ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, birthTime: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.birthTime ? formatBirthTime(user.birthTime) : '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.birthPlace) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Birth Place:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.birthPlace ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, birthPlace: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.birthPlace || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.height) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Height:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.height ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, height: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.height || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.complexion) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Complexion:</span>
                        {editing ? (
                          <select
                            value={editForm.complexion ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, complexion: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            <option value="fair">Fair</option>
                            <option value="wheatish">Wheatish</option>
                            <option value="dark">Dark</option>
                          </select>
                        ) : (
                          <span className="capitalize" style={{ color: 'var(--text)' }}>{user.complexion || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.star) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Star:</span>
                        {editing ? (
                          <select
                            value={editForm.star ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, star: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            {starOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.star || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.raasi) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Raasi:</span>
                        {editing ? (
                          <select
                            value={editForm.raasi ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, raasi: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            {raasiOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.raasi || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.gothram) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Gothram:</span>
                        {editing ? (
                          <select
                            value={editForm.gothram ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, gothram: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            {gothramOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.gothram || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.padam) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Padam:</span>
                        {editing ? (
                          <select
                            value={editForm.padam ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, padam: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            {padamOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.padam || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.uncleGothram) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '120px' }}>Uncle Gothram:</span>
                        {editing ? (
                          <select
                            value={editForm.uncleGothram ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, uncleGothram: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            {gothramOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.uncleGothram || '-'}</span>
                        )}
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
                    {(editing || user.educationCategory) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Education Category:</span>
                        {editing ? (
                          <select
                            value={editForm.educationCategory ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, educationCategory: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg bg-white"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select</option>
                            <option value="school">School</option>
                            <option value="diploma">Diploma</option>
                            <option value="graduate">Graduate</option>
                            <option value="post-graduate">Post Graduate</option>
                            <option value="doctorate">Doctorate</option>
                          </select>
                        ) : (
                          <span className="capitalize" style={{ color: 'var(--text)' }}>{user.educationCategory ? user.educationCategory.replace('-', ' ') : '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.educationDetails) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Education Details:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.educationDetails ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, educationDetails: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.educationDetails || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.employedIn) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Employed In:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.employedIn ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, employedIn: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.employedIn || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.occupation) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Occupation:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.occupation ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, occupation: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.occupation || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.occupationInDetails) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Occupation in Details:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.occupationInDetails ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, occupationInDetails: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.occupationInDetails || '-'}</span>
                        )}
                      </div>
                    )}
                    {(editing || user.annualIncome) && (
                      <div className="flex gap-2 text-base items-center">
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--muted)', minWidth: '160px' }}>Annual Income:</span>
                        {editing ? (
                          <input
                            type="text"
                            value={editForm.annualIncome ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, annualIncome: e.target.value || null }))}
                            className="flex-1 px-3 py-2 border-2 rounded-lg"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text)' }}>{user.annualIncome || '-'}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions dropdown (admin) - portal */}
      {actionsOpen && dropdownPosition && user && currentUser && isAdmin(currentUser) && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 1000 }}
            aria-hidden="true"
            onClick={() => setActionsOpen(false)}
          />
          <div
            role="menu"
            className="fixed py-1 min-w-[140px] rounded-lg border-2 bg-white shadow-xl"
            style={{
              zIndex: 1001,
              borderColor: '#FF8AA2',
              left: dropdownPosition.left,
              top: dropdownPosition.top + 4,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); handleProfileAction('reject'); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors first:rounded-t-md"
              style={{ color: '#C7365A' }}
            >
              Reject
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); handleProfileAction('accept'); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors"
              style={{ color: '#15803d' }}
            >
              Accept
            </button>
            <button
              type="button"
              role="menuitem"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleProfileAction('delete'); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors rounded-b-md"
              style={{ color: '#dc2626' }}
            >
              Delete
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Delete confirmation (admin) - portal */}
      {deleteConfirmFor && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999 }}
          onClick={() => !deleting && setDeleteConfirmFor(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full border-2"
            style={{ borderColor: '#FF8AA2' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Delete user?</h3>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>
              Delete user {deleteConfirmFor.name ? `"${deleteConfirmFor.name}"` : ''} (ID: {deleteConfirmFor.id})? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => !deleting && setDeleteConfirmFor(null)}
                className="px-4 py-2 rounded-xl font-semibold border-2"
                style={{ borderColor: '#6b7280', color: '#6b7280' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onMouseDown={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl font-semibold text-white"
                style={{ backgroundColor: '#dc2626' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
