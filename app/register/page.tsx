'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Raasi options (zodiac order: Aries to Pisces)
const raasiOptions = [
  'Mesha (Aries) – మేషం ♈',
  'Vrishabha (Taurus) – వృషభం ♉',
  'Mithuna (Gemini) – మిథునం ♊',
  'Karka (Cancer) – కర్కాటకం ♋',
  'Simha (Leo) – సింహం ♌',
  'Kanya (Virgo) – కన్య ♍',
  'Tula (Libra) – తుల ♎',
  'Vrischika (Scorpio) – వృశ్చికం ♏',
  'Dhanu (Sagittarius) – ధనుస్సు ♐',
  'Makara (Capricorn) – మకరం ♑',
  'Kumbha (Aquarius) – కుంభం ♒',
  'Meena (Pisces) – మీనం ♓'
];

// Star options (Nakshatra order)
const starOptions = [
  'Ashwini – అశ్విని',
  'Bharani – భరణి',
  'Krittika – కృత్తిక',
  'Rohini – రోహిణి',
  'Mrigashira – మృగశిర',
  'Ardra – ఆర్ద్ర',
  'Punarvasu – పునర్వసు',
  'Pushya – పుష్య',
  'Ashlesha – ఆశ్లేష',
  'Magha – మఘ',
  'Purva Phalguni – పూర్వ ఫల్గుణి',
  'Uttara Phalguni – ఉత్తర ఫల్గుణి',
  'Hasta – హస్త',
  'Chitra – చిత్ర',
  'Swati – స్వాతి',
  'Vishakha – విశాఖ',
  'Anuradha – అనురాధ',
  'Jyeshtha – జ్యేష్ఠ',
  'Moola – మూల',
  'Purva Ashadha – పూర్వాషాఢ',
  'Uttara Ashadha – ఉత్తరాషాఢ',
  'Shravana – శ్రవణ',
  'Dhanishta – ధనిష్ఠ',
  'Shatabhisha – శతభిష',
  'Purva Bhadrapada – పూర్వ భాద్రపద',
  'Uttara Bhadrapada – ఉత్తర భాద్రపద',
  'Revati – రేవతి'
];

// Padam options
const padamOptions = [
  '1st Padam',
  '2nd Padam',
  '3rd Padam',
  '4th Padam'
];

// Gothram options (alphabetically sorted)
const gothramOptions = [
  'Aarakyamula (ఆరక్యముల)',
  'Akramulakula (అక్రములకుల)',
  'Akyamulakula (అక్యములకుల)',
  'Amalakula (అమలకుల)',
  'Ananthakula (అనంతకుల)',
  'Anubala (అనుబాల)',
  'Anubala Gula (అనుబాల గుల)',
  'Anubha Gula (అనుభ గుల)',
  'Arisetlakula (అరిశెట్లకుల)',
  'Arisistakula (అరిశిష్టకుల)',
  'Arasakula (అరసకుల)',
  'Dhanakula (ధనకుల)',
  'Elisistakula (ఎలిశిష్టకుల)',
  'Gandhiseela (గంథిశీల)',
  'Gandhiseelakula (గంథశీలకుల)',
  'Ganamukukula (గనముకు కుల)',
  'Garnakula (గర్నకుల)',
  'Grandhiseela (గ్రంథిశీల)',
  'Harisistakula (హరిశిష్టకుల)',
  'Hasthakula (హస్తకుల)',
  'Ikshvakukula (ఇక్ష్వాకుకుల)',
  'Kamasista (కమశిష్ట)',
  'Kanalola (కనలోల)',
  'Kanasrila (కనశ్రిల)',
  'Kanasrilakula (కనశ్రిలకుల)',
  'Kanukula (కనుకుల)',
  'Kanyakula (కన్యాకుల)',
  'Karakapala (కరకపల)',
  'Komarsistakula (కొమర్శిష్టాకుల)',
  'Kranu (క్రను)',
  'Kranukula (క్రనుకుల)',
  'Kumarisista (కుమిరిశిష్ట)',
  'Kumarsista (కుమర్శిష్ట)',
  'Mandakula (మందకుల)',
  'Mandhakula (మంధకుల)',
  'Mandu (మండు)',
  'Paipikula (పైపికుల)',
  'Praheenikula (ప్రహీనికుల)',
  'Praheenukula (ప్రహీనుకుల)',
  'Samanakula (సమనకుల)',
  'Sarakula (శరకుల)',
  'Segolla (శెగొల్ల)',
  'Sekotlakula (శెకొట్లకుల)',
  'Sreshta Kundalakula (శ్రేష్ఠ కుండలకుల)',
  'Thanankula (థననకుల)',
  'Thenukula (థెనుకుల)',
  'Uthakalakula (ఉథకలాకుల)',
  'Uthakula (ఉథకుల)',
  'Uthamakula (ఉహ్థమకుల)',
  'Uthasistakula (ఉథశిష్టకుల)',
  'Venkalakula (వెంకలాకుల)',
  'Yanasabikula (యానశబికుల)',
  'Yanasakalulu (యానశకలుల)',
  'Yanasakula (యనశకుల)'
].sort();

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
          gothram: formData.gothram,
          padam: formData.padam,
          uncleGothram: formData.uncleGothram,
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
        
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/status');
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Name <span style={{ color: '#dc2626' }}>*</span></label>
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Gender (Bride/Groom) <span style={{ color: '#dc2626' }}>*</span></label>
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Marriage Status <span style={{ color: '#dc2626' }}>*</span></label>
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

          {/* Raasi */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Raasi <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.raasi}
              onChange={(e) => setFormData({ ...formData, raasi: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.raasi ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Raasi</option>
              {raasiOptions.map((raasi) => (
                <option key={raasi} value={raasi}>{raasi}</option>
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

          {/* Uncle Gothram */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>Uncle Gothram <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              value={formData.uncleGothram}
              onChange={(e) => setFormData({ ...formData, uncleGothram: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: formData.uncleGothram ? 'var(--text)' : '#9CA3AF' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Uncle Gothram</option>
              {gothramOptions.map((gothram) => (
                <option key={gothram} value={gothram}>{gothram}</option>
              ))}
            </select>
          </div>

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

          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
              boxShadow: '0 12px 2 2px rgba(233,75,106,.22)'
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
            <Link href="login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
