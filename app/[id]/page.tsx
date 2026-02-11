'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser, isAdmin, User } from '@/lib/auth';
import { raasiOptions, starOptions, padamOptions, gothramOptions } from '@/lib/registration-options';
import { time24To12 } from '@/lib/format-time';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  surname: string | null;
  role: string;
  photo: string | null;
  phoneNumber: string | null;
  phoneNumber2: string | null;
  fatherName: string | null;
  fatherOccupation: string | null;
  fatherContact: string | null;
  motherName: string | null;
  motherOccupation: string | null;
  motherContact: string | null;
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
  photoCount?: number;
  photoIndices?: number[];
}

type EditFormState = { [K in keyof UserProfile]?: UserProfile[K] | null } & { gothramOther?: string | null; uncleGothramOther?: string | null; surname?: string | null };

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
  const [photoIndex, setPhotoIndex] = useState(0);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);

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
        const viewer = getCurrentUser();
        const viewerEmail = viewer?.email ? encodeURIComponent(viewer.email) : '';
        const response = await fetch(`/api/users/${userId}?viewerEmail=${viewerEmail}`);
        
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
        surname: user.surname ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        phoneNumber2: user.phoneNumber2 ?? '',
        fatherName: user.fatherName ?? '',
        fatherOccupation: user.fatherOccupation ?? '',
        fatherContact: user.fatherContact ?? '',
        motherName: user.motherName ?? '',
        motherOccupation: user.motherOccupation ?? '',
        motherContact: user.motherContact ?? '',
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
        gothram: user.gothram && gothramOptions.includes(user.gothram) ? user.gothram : (user.gothram ? 'Other' : ''),
        gothramOther: user.gothram && !gothramOptions.includes(user.gothram) ? user.gothram : '',
        padam: user.padam ?? '',
        uncleGothram: user.uncleGothram && gothramOptions.includes(user.uncleGothram) ? user.uncleGothram : (user.uncleGothram ? 'Other' : ''),
        uncleGothramOther: user.uncleGothram && !gothramOptions.includes(user.uncleGothram) ? user.uncleGothram : '',
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
    if (user?.id) setPhotoIndex(0);
  }, [user?.id]);

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
      const data = await response.json();
      if (response.ok) {
        if (action === 'reject' && data.deleted) {
          router.push('/admin');
          return;
        }
        setUser((prev) => (prev ? { ...prev, status } : null));
        setSaveSuccess(`User ${action === 'reject' ? 'rejected' : 'accepted'}`);
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
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

  const isLate = (v: string | null | undefined) => {
    const s = (v || '').toLowerCase().trim();
    return s === 'late' || s.startsWith('late ');
  };

  const getAge = (dobStr: string | null | undefined): number | null => {
    if (!dobStr) return null;
    const birth = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validateEditForm = (): string | null => {
    if (!editForm.name?.trim()) return 'Name is required';
    if (!editForm.surname?.trim()) return 'Surname is required';
    if (!editForm.phoneNumber?.trim()) return 'Phone Number 1 is required';
    if (!editForm.gender) return 'Gender is required';
    if (!editForm.marriageStatus) return 'Marriage Status is required';
    if (!editForm.dob) return 'Date of Birth is required';
    const age = getAge(editForm.dob);
    if (age !== null && age <= 21) return 'Age must be greater than 21';
    if (!editForm.birthTime) return 'Birth Time is required';
    if (!editForm.birthPlace?.trim()) return 'Birth Place is required';
    if (!editForm.height?.trim()) return 'Height is required';
    if (!editForm.complexion) return 'Complexion is required';
    if (!editForm.star) return 'Star is required';
    if (!editForm.raasi) return 'Rasi is required';
    if (!editForm.gothram) return 'Gothram is required';
    if (editForm.gothram === 'Other' && !editForm.gothramOther?.trim()) return 'Please enter Gothram';
    if (!editForm.uncleGothram) return 'Uncle Gothram (Menamama) is required';
    if (editForm.uncleGothram === 'Other' && !editForm.uncleGothramOther?.trim()) return 'Please enter Uncle Gothram (Menamama)';
    if (!editForm.educationCategory) return 'Education Category is required';
    if (!editForm.educationDetails?.trim()) return 'Education Details is required';
    if (!editForm.employedIn?.trim()) return 'Employed In is required';
    if (editForm.fatherName?.trim() && !isLate(editForm.fatherName)) {
      if (!editForm.fatherOccupation?.trim()) return 'Father Occupation is required';
      if (!editForm.fatherContact?.trim()) return 'Father Contact is required';
    }
    if (editForm.motherName?.trim() && !isLate(editForm.motherName)) {
      if (!editForm.motherOccupation?.trim()) return 'Mother Occupation is required';
      if (!editForm.motherContact?.trim()) return 'Mother Contact is required';
    }
    return null;
  };

  const handleSave = async () => {
    if (!user || !currentUser) return;
    const validationError = validateEditForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    if ((user.photoCount ?? 1) < 2) {
      setSaveError('At least 2 photos are required');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const payload: Record<string, unknown> = {};
      const keys = ['name', 'email', 'phoneNumber', 'phoneNumber2', 'address', 'gender', 'marriageStatus', 'dob', 'birthTime', 'birthPlace', 'height', 'complexion', 'star', 'raasi', 'padam', 'educationCategory', 'educationDetails', 'employedIn', 'occupation', 'occupationInDetails', 'annualIncome', 'siblingsInfo', 'fatherName', 'fatherOccupation', 'fatherContact', 'motherName', 'motherOccupation', 'motherContact'] as const;
      keys.forEach((k) => {
        if (k in editForm) payload[k] = (editForm as Record<string, unknown>)[k];
      });
      if (isLate(editForm.fatherName)) {
        payload.fatherOccupation = null;
        payload.fatherContact = null;
      }
      if (isLate(editForm.motherName)) {
        payload.motherOccupation = null;
        payload.motherContact = null;
      }
      payload.gothram = editForm.gothram === 'Other' ? (editForm.gothramOther ?? '') : (editForm.gothram ?? '');
      payload.uncleGothram = editForm.uncleGothram === 'Other' ? (editForm.uncleGothramOther ?? '') : (editForm.uncleGothram ?? '');

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

  const photoCount = user?.photoCount ?? 1;
  const photoIndices = user?.photoIndices ?? (photoCount >= 1 ? Array.from({ length: photoCount }, (_, i) => i) : [0]);
  const getPhotoUrl = (index?: number) => {
    if (!user?.id) return null;
    const i = index ?? photoIndex;
    return `/api/photo?userId=${user.id}&index=${i}`;
  };

  const refetchUser = async () => {
    if (!params.id || !user?.id) return;
    const viewer = getCurrentUser();
    const viewerEmail = viewer?.email ? encodeURIComponent(viewer.email) : '';
    const response = await fetch(`/api/users/${params.id}?viewerEmail=${viewerEmail}`);
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    if (!user || !currentUser || (user.photoCount ?? 1) <= 2) return;
    setSaveError('');
    try {
      const isAdminUser = isAdmin(currentUser);
      const apiUrl = isAdminUser ? `/api/admin/users/${user.id}` : `/api/users/${user.id}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserEmail: currentUser.email,
          clearPhotoIndex: index,
        }),
      });
      if (response.ok) await refetchUser();
      else {
        const data = await response.json();
        setSaveError(data.error || 'Failed to remove photo');
      }
    } catch {
      setSaveError('Failed to remove photo');
    }
  };

  const handleAddPhoto = async (index: number, file: File) => {
    if (!user || !currentUser || (user.photoCount ?? 0) >= 4) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setSaveError('Please select an image under 5MB');
      return;
    }
    setUploadingPhotoIndex(index);
    setSaveError('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('userId', user.id.toString());
      fd.append('index', String(index));
      const response = await fetch('/api/upload/photo', { method: 'POST', body: fd });
      if (response.ok) await refetchUser();
      else {
        const data = await response.json();
        setSaveError(data.error || 'Failed to upload photo');
      }
    } catch {
      setSaveError('Failed to upload photo');
    } finally {
      setUploadingPhotoIndex(null);
    }
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
    <div className="profile-page-root">
    <div className="w-full min-h-screen px-3 sm:px-4 lg:px-6 py-4 sm:py-6 overflow-x-hidden" style={{ 
      backgroundColor: 'var(--bg)'
    }}>
      <div style={{ width: '100%', margin: '0 auto'}}>
       
        {/* Profile Card */}
            <div className="rounded-2xl shadow-lg overflow-hidden border-2" style={{ borderColor: '#E7C9D1', backgroundColor: '#FBF0F2' }}>
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Profile Photo Carousel (Full Height) */}
            <div className="w-full md:w-1/3 flex-shrink-0 relative pt-4 sm:pt-5 pl-2 pr-2" style={{ minHeight: 'clamp(280px, 50vh, 600px)', backgroundColor: '#FBF0F2' }}>
              {/* Prev/Next at top-right */}
              {photoCount > 1 && (
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((i) => (i > 0 ? i - 1 : i))}
                    disabled={photoIndex <= 0}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/90 text-white hover:bg-zinc-700 shadow-md disabled:opacity-40 disabled:cursor-default disabled:hover:bg-zinc-800/90"
                    aria-label="Previous photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((i) => (i < photoCount - 1 ? i + 1 : i))}
                    disabled={photoIndex >= photoCount - 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/90 text-white hover:bg-zinc-700 shadow-md disabled:opacity-40 disabled:cursor-default disabled:hover:bg-zinc-800/90"
                    aria-label="Next photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              <div className="w-full h-full relative flex items-start justify-center">
                <img
                  key={photoIndex}
                  src={getPhotoUrl() || ''}
                  alt={`${user.name} – photo ${photoIndex + 1}`}
                  className="w-full h-full object-contain object-top"
                  style={{ minHeight: 'clamp(280px, 45vh, 600px)', maxWidth: '100%', maxHeight: '100%' }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.photo-placeholder')) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'photo-placeholder w-full h-full flex items-center justify-center text-6xl font-bold';
                      placeholder.style.minHeight = 'clamp(280px, 45vh, 600px)';
                      placeholder.style.backgroundColor = 'var(--secondary)';
                      placeholder.style.color = 'var(--muted)';
                      placeholder.textContent = user.name ? user.name[0].toUpperCase() : '?';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              {photoCount > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {Array.from({ length: photoCount }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-zinc-800' : 'bg-zinc-400'}`}
                      aria-label={`Go to photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 p-3 sm:p-4 lg:p-8 flex flex-col" style={{ backgroundColor: '#FBF0F2' }}>
              {/* Header: Profile ID left, Edit/Actions right */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xl font-bold mb-1" style={{ color: '#15803d' }}>Profile ID: {user.id}</p>
                  <p className="text-base" style={{ color: '#3A3A3A' }}>
                    {user.name || 'N/A'}{user.surname ? ` ${user.surname}` : ''}
                    {user.gender && (
                      <span className="capitalize">, {user.gender === 'bride' ? 'female' : user.gender === 'groom' ? 'male' : user.gender}</span>
                    )}
                    {user.marriageStatus && <span> - {user.marriageStatus}</span>}
                  </p>
                </div>
                {/* Edit / Actions buttons - right corner */}
                {currentUser && !editing && (isAdmin(currentUser) || (currentUser.id && user && currentUser.id === user.id)) && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
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
              </div>
              {(saveError || saveSuccess) && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${saveError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                  {saveError || saveSuccess}
                </div>
              )}

              {/* Personal Information - directly under header */}
              <div className="space-y-4">
                {/* Personal Information - ALL personal/contact/family details, empty fields hidden in view mode */}
                <div>
                  <h2 className="text-xl font-bold mb-2 pb-1.5" style={{ color: '#7A0F2E', borderBottom: '2px solid #E7C9D1' }}>
                    Personal Information
                  </h2>
                  <div>
                    {(() => {
                      const hasVal = (v: unknown) => v != null && String(v).trim() !== '' && String(v).trim() !== '-';
                      const isOwner = currentUser?.id && user && currentUser.id === user.id;
                      const canSeePrivate = currentUser && (editing || isAdmin(currentUser) || isOwner);
                      const rows: Array<{ label: string; show: boolean; input?: string; type?: string; render?: React.ReactNode }> = [];
                      if (editing || hasVal(user.name)) rows.push({ label: 'Name', show: true, input: 'name', type: 'text', render: editing ? undefined : (user.name || '') + (user.surname ? ` ${user.surname}` : '') });
                      if (canSeePrivate && (editing || hasVal(user.surname))) rows.push({ label: 'Surname', show: true, input: 'surname', type: 'text' });
                      if (editing || hasVal(user.gender)) rows.push({ label: 'Gender', show: true, input: 'gender', render: editing ? undefined : (user.gender === 'bride' ? 'Bride' : user.gender === 'groom' ? 'Groom' : user.gender || '') });
                      if (editing || hasVal(user.marriageStatus)) rows.push({ label: 'Marital Status', show: true, input: 'marriageStatus', type: 'text' });
                      if (editing || hasVal(user.dob)) rows.push({ label: 'Date of Birth', show: true, input: 'dob', render: editing ? undefined : (user.dob ? new Date(user.dob).toLocaleDateString() : '') });
                      if (editing || hasVal(user.birthTime)) rows.push({ label: 'Birth Time', show: true, input: 'birthTime', render: editing ? undefined : (user.birthTime ? time24To12(user.birthTime) : '') });
                      if (editing || hasVal(user.birthPlace)) rows.push({ label: 'Birth Place', show: true, input: 'birthPlace', type: 'text' });
                      if (editing || hasVal(user.height)) rows.push({ label: 'Height', show: true, input: 'height', type: 'text' });
                      if (editing || hasVal(user.complexion)) rows.push({ label: 'Complexion', show: true, input: 'complexion', render: editing ? undefined : (user.complexion ? String(user.complexion) : '') });
                      if (editing || hasVal(user.star)) rows.push({ label: 'Star', show: true, input: 'star', render: editing ? undefined : (user.star || '') });
                      if (editing || hasVal(user.raasi)) rows.push({ label: 'Rasi', show: true, input: 'raasi', render: editing ? undefined : (user.raasi || '') });
                      if (editing || hasVal(user.padam)) rows.push({ label: 'Padam', show: true, input: 'padam', render: editing ? undefined : (user.padam || '') });
                      if (editing || hasVal(user.gothram)) rows.push({ label: 'Gothram', show: true, input: 'gothram', render: editing ? undefined : (user.gothram || '') });
                      if (editing || hasVal(user.uncleGothram)) rows.push({ label: 'Uncle Gothram (Menamama)', show: true, input: 'uncleGothram', render: editing ? undefined : (user.uncleGothram || '') });
                      if (canSeePrivate && (editing || hasVal(user.phoneNumber))) rows.push({ label: 'Phone Number', show: true, input: 'phoneNumber', type: 'text' });
                      if (canSeePrivate && (editing || hasVal(user.phoneNumber2))) rows.push({ label: 'Alternate Number', show: true, input: 'phoneNumber2', type: 'text' });
                      if (canSeePrivate && (editing || hasVal(user.address))) rows.push({ label: 'Address', show: true, input: 'address', type: 'text' });
                      if (canSeePrivate && (editing || hasVal(user.email))) rows.push({ label: 'Email', show: true, input: 'email', type: 'email' });
                      if (editing || user.siblingsInfo) rows.push({ label: 'Siblings', show: true, input: 'siblingsInfo', render: editing ? undefined : (user.siblingsInfo && typeof user.siblingsInfo === 'object' ? (() => { const s = user.siblingsInfo as Record<string, number>; return `Total Brother(s): ${s.brothers ?? 0}, Married: ${s.brothersMarried ?? 0}. Total Sister(s): ${s.sisters ?? 0}, Married: ${s.sistersMarried ?? 0}`; })() : String(user.siblingsInfo || '')) });
                      if (editing || hasVal(user.fatherName)) rows.push({ label: 'Father Name', show: true, input: 'fatherName', type: 'text' });
                      if (editing || hasVal(user.fatherOccupation)) rows.push({ label: 'Father Occupation', show: true, input: 'fatherOccupation', type: 'text' });
                      if (canSeePrivate && (editing || hasVal(user.fatherContact))) rows.push({ label: 'Father Contact', show: true, input: 'fatherContact', type: 'text' });
                      if (editing || hasVal(user.motherName)) rows.push({ label: 'Mother Name', show: true, input: 'motherName', type: 'text' });
                      if (editing || hasVal(user.motherOccupation)) rows.push({ label: 'Mother Occupation', show: true, input: 'motherOccupation', type: 'text' });
                      if (canSeePrivate && (editing || hasVal(user.motherContact))) rows.push({ label: 'Mother Contact', show: true, input: 'motherContact', type: 'text' });
                      if (rows.length === 0 && !editing) return <p className="py-4 px-4 text-sm" style={{ color: '#3A3A3A' }}>No personal information added yet.</p>;
                      return rows.map((row, i) => (
                        <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-1.5 px-0">
                          <span className="font-semibold shrink-0 text-xs sm:text-sm" style={{ minWidth: 'clamp(120px, 25vw, 200px)', color: '#3A3A3A' }}>{row.label}</span>
                          {editing && row.input ? (
                            row.input === 'gender' ? (
                              <select value={editForm.gender ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}>
                                <option value="">Select</option>
                                <option value="bride">Bride</option>
                                <option value="groom">Groom</option>
                              </select>
                            ) : row.input === 'complexion' ? (
                              <select value={editForm.complexion ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, complexion: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}>
                                <option value="">Select</option>
                                <option value="fair">Fair</option>
                                <option value="wheatish">Wheatish</option>
                                <option value="dark">Dark</option>
                              </select>
                            ) : row.input === 'dob' ? (
                              <input type="date" value={editForm.dob ? String(editForm.dob).slice(0, 10) : ''} onChange={(e) => setEditForm((f) => ({ ...f, dob: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'birthTime' ? (
                              <input type="text" placeholder="e.g. 2:30 PM or 14:30" value={editForm.birthTime ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, birthTime: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} title="Store as 24h (14:30) or display as 12h (2:30 PM)" />
                            ) : row.input === 'star' ? (
                              <select value={editForm.star ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, star: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}><option value="">Select</option>{starOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                            ) : row.input === 'raasi' ? (
                              <select value={editForm.raasi ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, raasi: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}><option value="">Select</option>{raasiOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                            ) : row.input === 'padam' ? (
                              <select value={editForm.padam ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, padam: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}><option value="">Select</option>{padamOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                            ) : row.input === 'gothram' ? (
                              <div className="flex-1 flex gap-2"><select value={editForm.gothram ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, gothram: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}><option value="">Select</option>{gothramOptions.map((o) => <option key={o} value={o}>{o}</option>)}<option value="Other">Other</option></select>{editForm.gothram === 'Other' && <input type="text" placeholder="Enter Gothram" value={editForm.gothramOther ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, gothramOther: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />}</div>
                            ) : row.input === 'uncleGothram' ? (
                              <div className="flex-1 flex gap-2"><select value={editForm.uncleGothram ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, uncleGothram: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}><option value="">Select</option>{gothramOptions.map((o) => <option key={o} value={o}>{o}</option>)}<option value="Other">Other</option></select>{editForm.uncleGothram === 'Other' && <input type="text" placeholder="Enter Uncle Gothram" value={editForm.uncleGothramOther ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, uncleGothramOther: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />}</div>
                            ) : row.input === 'siblingsInfo' ? (
                              <textarea value={editForm.siblingsInfo != null ? (typeof editForm.siblingsInfo === 'string' ? editForm.siblingsInfo : JSON.stringify(editForm.siblingsInfo, null, 2)) : ''} onChange={(e) => { const v = e.target.value.trim(); if (!v) { setEditForm((f) => ({ ...f, siblingsInfo: null })); return; } try { setEditForm((f) => ({ ...f, siblingsInfo: JSON.parse(v) })); } catch {} }} className="flex-1 px-3 py-2 border-2 rounded-lg text-sm min-h-[60px]" style={{ borderColor: 'var(--border)' }} placeholder='{"brothers": 0, "sisters": 1}' />
                            ) : row.input === 'fatherName' ? (
                              <input type="text" value={editForm.fatherName ?? ''} onChange={(e) => { const v = e.target.value || null; setEditForm((f) => ({ ...f, fatherName: v, ...(isLate(v) ? { fatherOccupation: null, fatherContact: null } : {}) })); }} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'fatherOccupation' ? (
                              <input type="text" value={editForm.fatherOccupation ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, fatherOccupation: e.target.value || null }))} disabled={isLate(editForm.fatherName)} className="flex-1 px-3 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'fatherContact' ? (
                              <input type="tel" value={editForm.fatherContact ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, fatherContact: e.target.value || null }))} disabled={isLate(editForm.fatherName)} className="flex-1 px-3 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'motherName' ? (
                              <input type="text" value={editForm.motherName ?? ''} onChange={(e) => { const v = e.target.value || null; setEditForm((f) => ({ ...f, motherName: v, ...(isLate(v) ? { motherOccupation: null, motherContact: null } : {}) })); }} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'motherOccupation' ? (
                              <input type="text" value={editForm.motherOccupation ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, motherOccupation: e.target.value || null }))} disabled={isLate(editForm.motherName)} className="flex-1 px-3 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)' }} />
                            ) : row.input === 'motherContact' ? (
                              <input type="tel" value={editForm.motherContact ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, motherContact: e.target.value || null }))} disabled={isLate(editForm.motherName)} className="flex-1 px-3 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)' }} />
                            ) : (
                              <input type={(row.type as 'text'|'email'|'tel') || 'text'} value={String((editForm as Record<string, unknown>)[row.input!] ?? '')} onChange={(e) => setEditForm((f) => ({ ...f, [row.input!]: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />
                            )
                          ) : (
                            <span className="text-sm flex-1" style={{ color: '#3A3A3A' }}>{row.render ?? String((user as unknown as Record<string, unknown>)[row.input!] ?? '-')}</span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Educational & Professional Information - empty fields hidden in view mode */}
                <div>
                  <h2 className="text-xl font-bold mb-2 pb-1.5" style={{ color: '#7A0F2E', borderBottom: '2px solid #E7C9D1' }}>
                    Educational & Professional Information
                  </h2>
                  <div>
                    {(() => {
                      const hasVal = (v: unknown) => v != null && String(v).trim() !== '' && String(v).trim() !== '-';
                      const eduRows = [
                        { label: 'Education Category', key: 'educationCategory', val: user.educationCategory ? String(user.educationCategory).replace('-', ' ') : '', isSelect: true },
                        { label: 'Education in Detail', key: 'educationDetails', val: user.educationDetails || '', isSelect: false },
                        { label: 'Employed In', key: 'employedIn', val: user.employedIn || '', isSelect: false },
                        { label: 'Occupation', key: 'occupation', val: user.occupation || '', isSelect: false },
                        { label: 'Occupation in Details', key: 'occupationInDetails', val: user.occupationInDetails || '', isSelect: false },
                        { label: 'Annual Income', key: 'annualIncome', val: user.annualIncome || '', isSelect: false },
                      ].filter(r => editing || hasVal(r.val));
                      if (eduRows.length === 0 && !editing) return <p className="py-4 px-4 text-sm" style={{ color: '#3A3A3A' }}>No educational information added yet.</p>;
                      return eduRows.map((row, i) => (
                        <div key={row.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-1.5 px-0">
                          <span className="font-semibold shrink-0 text-xs sm:text-sm" style={{ minWidth: 'clamp(120px, 25vw, 200px)', color: '#3A3A3A' }}>{row.label}</span>
                          {editing ? (
                            row.isSelect ? (
                              <select value={editForm.educationCategory ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, educationCategory: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg bg-white" style={{ borderColor: 'var(--border)' }}>
                                <option value="">Select</option>
                                <option value="school">School</option>
                                <option value="diploma">Diploma</option>
                                <option value="graduate">Graduate</option>
                                <option value="post-graduate">Post Graduate</option>
                                <option value="doctorate">Doctorate</option>
                              </select>
                            ) : (
                              <input type="text" value={String((editForm as Record<string, unknown>)[row.key] ?? '')} onChange={(e) => setEditForm((f) => ({ ...f, [row.key]: e.target.value || null }))} className="flex-1 px-3 py-2 border-2 rounded-lg" style={{ borderColor: 'var(--border)' }} />
                            )
                          ) : (
                            <span className="text-sm flex-1 capitalize" style={{ color: '#3A3A3A' }}>{row.val || '-'}</span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Photos (edit): add/remove, 2–4 required - shown when editing, below Educational */}
                {editing && (isAdmin(currentUser) || (currentUser?.id && user && currentUser.id === user.id)) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3 pb-2" style={{ color: '#7A0F2E', borderBottom: '2px solid #E7C9D1' }}>
                      Photos <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '14px' }}>(2–4 required; use arrows on left to scroll)</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map((i) => {
                        const hasPhoto = photoIndices.includes(i);
                        return (
                          <div key={i} className="relative rounded-xl border-2 overflow-hidden aspect-square" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}>
                            {hasPhoto ? (
                              <>
                                <img
                                  src={getPhotoUrl(i) || ''}
                                  alt={`Photo ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {(photoCount ?? 1) > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(i)}
                                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center text-sm font-bold hover:bg-red-600"
                                    aria-label="Remove photo"
                                  >
                                    ×
                                  </button>
                                )}
                              </>
                            ) : (photoCount ?? 0) < 4 ? (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2">
                                {uploadingPhotoIndex === i ? (
                                  <span className="text-sm" style={{ color: 'var(--muted)' }}>Uploading...</span>
                                ) : (
                                  <>
                                    <span className="text-2xl text-zinc-400 mb-1">+</span>
                                    <span className="text-xs text-center" style={{ color: 'var(--muted)' }}>Add photo</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAddPhoto(i, file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                      {photoCount ?? 0} of 4 photos. Minimum 2 required. Use the arrows on the left image to scroll through photos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      {actionsOpen && dropdownPosition && user && currentUser && isAdmin(currentUser) && typeof document !== 'undefined' && createPortal(
        <div style={{ display: 'contents' }}>
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
            {user.status?.toLowerCase() !== 'rejected' && (
              <button
                type="button"
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); handleProfileAction('reject'); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors first:rounded-t-md"
                style={{ color: '#C7365A' }}
              >
                Reject
              </button>
            )}
            {user.status?.toLowerCase() !== 'accepted' && (
              <button
                type="button"
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); handleProfileAction('accept'); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-pink-50 transition-colors ${user.status?.toLowerCase() === 'rejected' ? 'first:rounded-t-md' : ''}`}
                style={{ color: '#15803d' }}
              >
                Accept
              </button>
            )}
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
        </div>,
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
