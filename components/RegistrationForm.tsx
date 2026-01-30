'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { raasiOptions, starOptions, padamOptions, gothramOptions } from '@/lib/registration-options';

export default function RegistrationForm({ mode }: { mode: 'register' | 'admin_add' }) {
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
    gothramOther: '',
    padam: '',
    uncleGothram: '',
    uncleGothramOther: '',
    educationCategory: '',
    educationDetails: '',
    employedIn: '',
    occupation: '',
    occupationInDetails: '',
    annualIncome: '',
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  const TOTAL_STEPS = 7;
  const [currentStep, setCurrentStep] = useState(1);
  const stepTitles = [
    'Personal & Basic Info',
    'Birth & Physical',
    'Family (Siblings)',
    'Horoscope',
    'Education & Employment',
    'Photo & Contact',
    'Account (Login)'
  ];

  // Validate mandatory fields for current step
  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1: // Personal & Basic Info
        if (!formData.name?.trim()) errors.push('Name is required');
        if (!formData.gender) errors.push('Gender is required');
        if (!formData.marriageStatus) errors.push('Marriage Status is required');
        break;
      case 2: // Birth & Physical
        if (!formData.dob) errors.push('Date of Birth is required');
        if (!formData.birthTime) errors.push('Birth Time is required');
        if (!formData.birthPlace?.trim()) errors.push('Birth Place is required');
        if (!formData.height?.trim()) errors.push('Height is required');
        if (!formData.complexion) errors.push('Complexion is required');
        break;
      case 3: // Family (Siblings) - Optional, no validation needed
        break;
      case 4: // Horoscope
        if (!formData.star) errors.push('Star is required');
        if (!formData.raasi) errors.push('Rasi is required');
        if (!formData.padam) errors.push('Padam is required');
        if (!formData.gothram) errors.push('Gothram is required');
        if (formData.gothram === 'Other' && !formData.gothramOther?.trim()) errors.push('Please enter Gothram');
        if (!formData.uncleGothram) errors.push('Uncle Gothram (Menamama) is required');
        if (formData.uncleGothram === 'Other' && !formData.uncleGothramOther?.trim()) errors.push('Please enter Uncle Gothram (Menamama)');
        break;
      case 5: // Education & Employment
        if (!formData.educationCategory) errors.push('Education Category is required');
        if (!formData.educationDetails?.trim()) errors.push('Education Details is required');
        if (!formData.employedIn?.trim()) errors.push('Employed In is required');
        break;
      case 6: // Photo & Contact
        if (!formData.photo) errors.push('Photo is required');
        if (!formData.phone?.trim()) errors.push('Phone Number is required');
        if (phoneError) errors.push(phoneError);
        if (!formData.address?.trim()) errors.push('Address is required');
        break;
      case 7: // Account (Login)
        if (!formData.email?.trim()) errors.push('Email is required');
        if (emailError) errors.push(emailError);
        if (!formData.password?.trim()) errors.push('Password is required');
        if (passwordErrors.length > 0) errors.push('Password does not meet requirements');
        if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
        break;
    }
    
    if (errors.length > 0) {
      setStepErrors({ ...stepErrors, [currentStep]: errors.join(', ') });
      return false;
    }
    
    // Clear errors for this step if validation passes
    const newErrors = { ...stepErrors };
    delete newErrors[currentStep];
    setStepErrors(newErrors);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const validatePassword = (pwd: string): string[] => {
    const errs: string[] = [];
    if (pwd.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errs.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errs.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errs.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errs.push('One special character');
    return errs;
  };

  const checkEmailAvailability = async (emailToCheck: string) => {
    if (!emailToCheck?.trim()) { setEmailError(''); return; }
    try {
      const res = await fetch(`/api/auth/check-availability?email=${encodeURIComponent(emailToCheck.trim())}`);
      const data = await res.json();
      setEmailError(data.emailTaken ? 'This email is already registered' : '');
    } catch {
      setEmailError('');
    }
  };

  const checkPhoneAvailability = async (phoneToCheck: string) => {
    const full = (formData.phoneCode || '') + (phoneToCheck || '').replace(/\D/g, '');
    if (!full || full.length < 10) { setPhoneError(''); return; }
    try {
      const res = await fetch(`/api/auth/check-availability?phone=${encodeURIComponent(full)}`);
      const data = await res.json();
      setPhoneError(data.phoneTaken ? 'This phone number is already registered' : '');
    } catch {
      setPhoneError('');
    }
  };

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

    const pwdErrs = validatePassword(formData.password);
    if (pwdErrs.length > 0) {
      setError('Password must have: ' + pwdErrs.join(', '));
      setLoading(false);
      return;
    }

    if (emailError || phoneError) {
      setError(emailError || phoneError);
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
          // If S3 is not configured, we can still proceed - photo will be stored in DB during registration
          if (uploadError.error?.includes('AWS S3 storage not configured')) {
            console.warn('S3 not configured, photo will be stored in database during registration');
            photoPath = null; // Will be handled during registration
          } else {
            setError(uploadError.error || 'Failed to upload photo');
            setLoading(false);
            setUploadingPhoto(false);
            return;
          }
        } else {
          const uploadData = await uploadResponse.json();
          photoPath = uploadData.s3Url || uploadData.path || null;
        }
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
          dob: formData.dob,
          marriageStatus: formData.marriageStatus,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          height: formData.height,
          complexion: formData.complexion,
          siblingsInfo: siblingsInfo,
          star: formData.star,
          raasi: formData.raasi,
          gothram: formData.gothram === 'Other' ? formData.gothramOther : formData.gothram,
          padam: formData.padam,
          uncleGothram: formData.uncleGothram === 'Other' ? formData.uncleGothramOther : formData.uncleGothram,
          educationCategory: formData.educationCategory,
          educationDetails: formData.educationDetails,
          employedIn: formData.employedIn,
          occupation: formData.occupation,
          occupationInDetails: formData.occupationInDetails,
          annualIncome: formData.annualIncome,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If photo was provided but not uploaded yet, upload it now with userId
        if (formData.photo && data.user?.id) {
          try {
            const updatePhotoFormData = new FormData();
            updatePhotoFormData.append('photo', formData.photo);
            updatePhotoFormData.append('userId', data.user.id.toString());
            
            const photoUploadResponse = await fetch('/api/upload/photo', {
              method: 'POST',
              body: updatePhotoFormData,
            });
            
            if (!photoUploadResponse.ok) {
              const photoError = await photoUploadResponse.json();
              // If S3 is not configured, that's okay - photo blob will be stored during registration
              if (!photoError.error?.includes('AWS S3 storage not configured')) {
                console.error('Failed to update photo blob:', photoError);
              }
            }
          } catch (err) {
            console.error('Failed to update photo blob:', err);
            // Non-critical error, continue with registration
          }
        }
        
        if (mode === 'admin_add') {
          router.push('/admin');
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/status');
        }
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
      padding: '20px 0',
      paddingTop: 'calc(20px + 10px)',
      minHeight: 'calc(100vh - 82px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
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
            {mode === 'admin_add' ? 'Add User' : 'Create Your Account'}
          </h1>
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

        {/* Step Validation Error */}
        {stepErrors[currentStep] && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ 
            backgroundColor: '#fee2e2', 
            borderColor: '#dc2626', 
            color: '#dc2626', 
            border: '1px solid' 
          }}>
            {stepErrors[currentStep]}
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-between gap-2 flex-wrap" style={{ gap: '8px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 600 }}>
            Step {currentStep} of {TOTAL_STEPS}: {stepTitles[currentStep - 1]}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: i + 1 === currentStep ? 'var(--primary)' : i + 1 < currentStep ? 'var(--primary)' : 'var(--border)',
                  opacity: i + 1 < currentStep ? 0.6 : 1
                }}
              />
            ))}
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Step 1: Personal & Basic Info */}
          {currentStep === 1 && (
            <>
          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (stepErrors[1]) {
                  const newErrors = { ...stepErrors };
                  delete newErrors[1];
                  setStepErrors(newErrors);
                }
              }}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Gender - Bride/Groom */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Gender (Bride/Groom) <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.gender}
              onChange={(e) => {
                setFormData({ ...formData, gender: e.target.value });
                if (stepErrors[1]) {
                  const newErrors = { ...stepErrors };
                  delete newErrors[1];
                  setStepErrors(newErrors);
                }
              }}
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Marriage Status <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.marriageStatus}
              onChange={(e) => {
                setFormData({ ...formData, marriageStatus: e.target.value });
                if (stepErrors[1]) {
                  const newErrors = { ...stepErrors };
                  delete newErrors[1];
                  setStepErrors(newErrors);
                }
              }}
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
            </>
          )}

          {/* Step 2: Birth & Physical */}
          {currentStep === 2 && (
            <>
          {/* DOB */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
              Date of Birth <span style={{ color: '#dc2626' }}>*</span>
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
              Birth Time <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Birth Place */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Birth Place <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Birth Place"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Height */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Height <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Height (e.g., 5ft 8in)"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Complexion */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Complexion <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.complexion}
              onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
              required
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
            </>
          )}

          {/* Step 3: Family (Siblings) */}
          {currentStep === 3 && (
            <>
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
            </>
          )}

          {/* Step 4: Horoscope */}
          {currentStep === 4 && (
            <>
          {/* Star */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Star <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.star}
              onChange={(e) => setFormData({ ...formData, star: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.star ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Star</option>
              {starOptions.map((star) => (
                <option key={star} value={star}>{star}</option>
              ))}
            </select>
          </div>

          {/* Rasi */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Rasi <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.raasi}
              onChange={(e) => setFormData({ ...formData, raasi: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.raasi ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Rasi</option>
              {raasiOptions.map((raasi) => (
                <option key={raasi} value={raasi}>{raasi}</option>
              ))}
            </select>
          </div>

          {/* Padam */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Padam <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.padam}
              onChange={(e) => setFormData({ ...formData, padam: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.padam ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Padam</option>
              {padamOptions.map((padam) => (
                <option key={padam} value={padam}>{padam}</option>
              ))}
            </select>
          </div>

          {/* Gothram */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Gothram <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.gothram}
              onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.gothram ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Gothram</option>
              {gothramOptions.map((gothram) => (
                <option key={gothram} value={gothram}>{gothram}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {formData.gothram === 'Other' && (
              <input
                type="text"
                placeholder="Enter Gothram"
                value={formData.gothramOther}
                onChange={(e) => setFormData({ ...formData, gothramOther: e.target.value })}
                className="w-full mt-2 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            )}
          </div>

          {/* Uncle Gothram (Menamama) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Uncle Gothram (Menamama) <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.uncleGothram}
              onChange={(e) => setFormData({ ...formData, uncleGothram: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.uncleGothram ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Uncle Gothram (Menamama)</option>
              {gothramOptions.map((gothram) => (
                <option key={gothram} value={gothram}>{gothram}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {formData.uncleGothram === 'Other' && (
              <input
                type="text"
                placeholder="Enter Uncle Gothram (Menamama)"
                value={formData.uncleGothramOther}
                onChange={(e) => setFormData({ ...formData, uncleGothramOther: e.target.value })}
                className="w-full mt-2 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            )}
          </div>
            </>
          )}

          {/* Step 5: Education & Employment */}
          {currentStep === 5 && (
            <>
          {/* Education Category */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Education Category <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.educationCategory}
              onChange={(e) => setFormData({ ...formData, educationCategory: e.target.value })}
              required
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Education Details <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea
              placeholder="Education Details"
              value={formData.educationDetails}
              onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Employed In */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Employed In <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Employed In"
              value={formData.employedIn}
              onChange={(e) => setFormData({ ...formData, employedIn: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Occupation */}
          <div>
            <input
              type="text"
              placeholder="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Occupation in Details */}
          <div>
            <textarea
              placeholder="Occupation in Details"
              value={formData.occupationInDetails}
              onChange={(e) => setFormData({ ...formData, occupationInDetails: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Annual Income */}
          <div>
            <input
              type="text"
              placeholder="Annual Income"
              value={formData.annualIncome}
              onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
            </>
          )}

          {/* Step 6: Photo & Contact */}
          {currentStep === 6 && (
            <>
          {/* Photo */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: 'var(--text)', 
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Photo <span style={{ color: '#dc2626' }}>*</span>
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
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Phone Number <span style={{ color: '#dc2626' }}>*</span></label>
            <div className="flex gap-2">
              <select
                value={formData.phoneCode}
                onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                className="w-24 px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: phoneError ? '#dc2626' : 'var(--border)', color: 'var(--text)' }}
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
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setPhoneError(''); }}
                onBlur={() => checkPhoneAvailability(formData.phone)}
                required
                className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: phoneError ? '#dc2626' : 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; setPhoneError(''); }}
              />
            </div>
            {phoneError && <p className="text-sm mt-1" style={{ color: '#dc2626' }}>{phoneError}</p>}
          </div>

          {/* Address (For Admin) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Address (For Admin) <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea
              placeholder="Address (For Admin)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
            </>
          )}

          {/* Step 7: Account (Login) */}
          {currentStep === 7 && (
            <>
          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Email <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setEmailError(''); }}
              onBlur={() => checkEmailAvailability(formData.email)}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: emailError ? '#dc2626' : 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; setEmailError(''); }}
            />
            {emailError && <p className="text-sm mt-1" style={{ color: '#dc2626' }}>{emailError}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Password <span style={{ color: '#dc2626' }}>*</span></label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setPasswordErrors(validatePassword(e.target.value));
                }}
                onBlur={() => setPasswordErrors(validatePassword(formData.password))}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: passwordErrors.length && formData.password ? '#dc2626' : 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded focus:outline-none"
                style={{ color: 'var(--muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c0 4.478 2.943 8.268 7 9.543 2.767 1.128 5.878 1.128 8.61 0a9.953 9.953 0 003.117-1.117m5.858-.908L4.031 4.031m13.938 13.938L4.031 4.031" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
            </p>
            {formData.password && passwordErrors.length > 0 && (
              <ul className="text-sm mt-1 list-disc list-inside" style={{ color: '#dc2626' }}>
                {passwordErrors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Confirm Password <span style={{ color: '#dc2626' }}>*</span></label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Your Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 p-1 rounded focus:outline-none"
                style={{ color: 'var(--muted)' }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c0 4.478 2.943 8.268 7 9.543 2.767 1.128 5.878 1.128 8.61 0a9.953 9.953 0 003.117-1.117m5.858-.908L4.031 4.031m13.938 13.938L4.031 4.031" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
            </>
          )}

          {/* Step navigation */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="flex-1 py-3 font-bold rounded-xl border-2 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--card)' }}
              >
                Previous
              </button>
            ) : (
              <div className="flex-1" />
            )}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 text-white font-bold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                  boxShadow: '0 8px 20px rgba(233,75,106,.22)'
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || uploadingPhoto}
                className="flex-1 py-3 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                  boxShadow: '0 12px 2 2px rgba(233,75,106,.22)'
                }}
                onMouseEnter={(e) => !loading && !uploadingPhoto && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !loading && !uploadingPhoto && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading || uploadingPhoto ? (uploadingPhoto ? 'Uploading Photo...' : 'Submitting...') : mode === 'admin_add' ? 'Add User' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          {mode === 'admin_add' ? (
            <Link href="/admin" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
              Back to Admin Panel
            </Link>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link href="login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
