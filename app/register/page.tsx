'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    gender: '', // Bride/Groom
    dob: '',
    education: '',
    job: '',
    city: '',
    photo: null as File | null,
    photoPreview: '',
    phone: '',
    phoneCode: '+91',
    partnerPreference: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'silver'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setFormData({ ...formData, photo: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoPreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const calculateAge = (dob: string): number | null => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let photoPath = null;

      // Upload photo if provided
      if (formData.photo) {
        setUploadingPhoto(true);
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);

        const uploadResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: photoFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          setError(uploadError.error || 'Failed to upload photo');
          setLoading(false);
          setUploadingPhoto(false);
          return;
        }

        const uploadData = await uploadResponse.json();
        photoPath = uploadData.path;
        setUploadingPhoto(false);
      }

      // Calculate age from DOB
      const age = calculateAge(formData.dob);

      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneCode + formData.phone,
          role: formData.plan,
          gender: formData.gender,
          photo: photoPath,
          profession: formData.job,
          age: age,
          // Additional fields that might need database columns
          education: formData.education,
          city: formData.city,
          dob: formData.dob,
          partnerPreference: formData.partnerPreference,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If photo was uploaded, update the user's photo blob in database
        if (formData.photo && data.user?.id) {
          try {
            const updatePhotoFormData = new FormData();
            updatePhotoFormData.append('photo', formData.photo);
            updatePhotoFormData.append('userId', data.user.id.toString());
            
            await fetch('/api/upload/photo', {
              method: 'POST',
              body: updatePhotoFormData,
            });
          } catch (err) {
            console.error('Failed to update photo blob:', err);
            // Non-critical error, continue with registration
          }
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(`/${formData.plan}`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="w-full" style={{ 
      background: 'var(--bg)',
      padding: '20px',
      paddingTop: 'calc(82px + 20px)',
      minHeight: 'calc(100vh - 82px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="w-full max-w-lg rounded-3xl shadow-2xl p-8 border" style={{ 
        backgroundColor: 'var(--card)', 
        borderColor: 'var(--border)', 
        boxShadow: 'var(--shadow)' 
      }}>
        <div className="mb-6">
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: 'var(--text)',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Create Your Account
          </h1>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Join MyMatrimony and find your perfect match
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ 
            backgroundColor: 'var(--secondary)', 
            borderColor: 'var(--primary)', 
            color: 'var(--primary)', 
            border: '1px solid' 
          }}>
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Gender - Bride/Groom */}
          <div>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select (Bride/Groom)</option>
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Education */}
          <div>
            <input
              type="text"
              placeholder="Enter Your Education"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Job */}
          <div>
            <input
              type="text"
              placeholder="Enter Your Job/Profession"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* City */}
          <div>
            <input
              type="text"
              placeholder="Enter Your City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Photo */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: 'var(--text)', 
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Photo
            </label>
            {formData.photoPreview && (
              <div className="mb-3" style={{ textAlign: 'center' }}>
                <img 
                  src={formData.photoPreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '150px', 
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid var(--border)'
                  }} 
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Phone */}
          <div className="flex gap-2">
            <select
              value={formData.phoneCode}
              onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
              className="w-24 px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              placeholder="Enter Your Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Partner Preference (Optional) */}
          <div>
            <textarea
              placeholder="Partner Preference (Optional)"
              value={formData.partnerPreference}
              onChange={(e) => setFormData({ ...formData, partnerPreference: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Your Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Plan */}
          <div>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="silver">Silver Plan</option>
              <option value="gold">Gold Plan</option>
              <option value="platinum">Platinum Plan</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
              boxShadow: '0 12px 22px rgba(233,75,106,.22)'
            }}
            onMouseEnter={(e) => !loading && !uploadingPhoto && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && !uploadingPhoto && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading || uploadingPhoto ? (uploadingPhoto ? 'Uploading Photo...' : 'Submitting...') : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
