'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    gender: '', // Bride/Groom
    marriageStatus: '',
    dob: '',
    birthTime: '',
    birthPlace: '',
    height: '',
    complexion: '',
    sisters: [{ name: '', marriageStatus: '' }],
    brothers: [{ name: '', marriageStatus: '' }],
    star: '',
    raasi: '',
    gothram: '',
    padam: '',
    uncleGothram: '',
    educationCategory: '',
    educationDetails: '',
    employedIn: '',
    photo: null as File | null,
    photoPreview: '',
    phone: '',
    phoneCode: '+91',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
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

      // Prepare siblings info
      const siblingsInfo = {
        sisters: formData.sisters.filter(s => s.name.trim() !== ''),
        brothers: formData.brothers.filter(b => b.name.trim() !== '')
      };

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
          gender: formData.gender,
          photo: photoPath,
          age: age,
          dob: formData.dob,
          marriageStatus: formData.marriageStatus,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          height: formData.height,
          complexion: formData.complexion,
          siblingsInfo: siblingsInfo,
          star: formData.star,
          raasi: formData.raasi,
          gothram: formData.gothram,
          padam: formData.padam,
          uncleGothram: formData.uncleGothram,
          educationCategory: formData.educationCategory,
          educationDetails: formData.educationDetails,
          employedIn: formData.employedIn,
          address: formData.address,
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
        router.push('/dashboard');
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

          {/* Marriage Status */}
          <div>
            <select
              value={formData.marriageStatus}
              onChange={(e) => setFormData({ ...formData, marriageStatus: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Marriage Status</option>
              <option value="unmarried">Unmarried</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
              Date of Birth
            </label>
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

          {/* Birth Time */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
              Birth Time
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Birth Place */}
          <div>
            <input
              type="text"
              placeholder="Birth Place"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Height */}
          <div>
            <input
              type="text"
              placeholder="Height (e.g., 5ft 8in)"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Complexion */}
          <div>
            <select
              value={formData.complexion}
              onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Complexion</option>
              <option value="fair">Fair</option>
              <option value="wheatish">Wheatish</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Siblings - Sisters */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
              Sisters (Name, Marriage Status)
            </label>
            {formData.sisters.map((sister, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Sister Name"
                  value={sister.name}
                  onChange={(e) => {
                    const newSisters = [...formData.sisters];
                    newSisters[index].name = e.target.value;
                    setFormData({ ...formData, sisters: newSisters });
                  }}
                  className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <select
                  value={sister.marriageStatus}
                  onChange={(e) => {
                    const newSisters = [...formData.sisters];
                    newSisters[index].marriageStatus = e.target.value;
                    setFormData({ ...formData, sisters: newSisters });
                  }}
                  className="w-32 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Status</option>
                  <option value="married">Married</option>
                  <option value="unmarried">Unmarried</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, sisters: [...formData.sisters, { name: '', marriageStatus: '' }] })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Sister
            </button>
          </div>

          {/* Siblings - Brothers */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
              Brothers (Name, Marriage Status)
            </label>
            {formData.brothers.map((brother, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Brother Name"
                  value={brother.name}
                  onChange={(e) => {
                    const newBrothers = [...formData.brothers];
                    newBrothers[index].name = e.target.value;
                    setFormData({ ...formData, brothers: newBrothers });
                  }}
                  className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <select
                  value={brother.marriageStatus}
                  onChange={(e) => {
                    const newBrothers = [...formData.brothers];
                    newBrothers[index].marriageStatus = e.target.value;
                    setFormData({ ...formData, brothers: newBrothers });
                  }}
                  className="w-32 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Status</option>
                  <option value="married">Married</option>
                  <option value="unmarried">Unmarried</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, brothers: [...formData.brothers, { name: '', marriageStatus: '' }] })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Brother
            </button>
          </div>

          {/* Star */}
          <div>
            <input
              type="text"
              placeholder="Star"
              value={formData.star}
              onChange={(e) => setFormData({ ...formData, star: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Raasi */}
          <div>
            <input
              type="text"
              placeholder="Raasi"
              value={formData.raasi}
              onChange={(e) => setFormData({ ...formData, raasi: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Gothram */}
          <div>
            <input
              type="text"
              placeholder="Gothram"
              value={formData.gothram}
              onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Padam */}
          <div>
            <input
              type="text"
              placeholder="Padam"
              value={formData.padam}
              onChange={(e) => setFormData({ ...formData, padam: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Uncle Gothram */}
          <div>
            <input
              type="text"
              placeholder="Uncle Gothram"
              value={formData.uncleGothram}
              onChange={(e) => setFormData({ ...formData, uncleGothram: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Education Category */}
          <div>
            <select
              value={formData.educationCategory}
              onChange={(e) => setFormData({ ...formData, educationCategory: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Education Category</option>
              <option value="school">School</option>
              <option value="diploma">Diploma</option>
              <option value="graduate">Graduate</option>
              <option value="post-graduate">Post Graduate</option>
              <option value="doctorate">Doctorate</option>
            </select>
          </div>

          {/* Education Details */}
          <div>
            <textarea
              placeholder="Education Details"
              value={formData.educationDetails}
              onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Employed In */}
          <div>
            <input
              type="text"
              placeholder="Employed In"
              value={formData.employedIn}
              onChange={(e) => setFormData({ ...formData, employedIn: e.target.value })}
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

          {/* Address (For Admin) */}
          <div>
            <textarea
              placeholder="Address (For Admin)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
