'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomeAuthCard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'register' | 'signin'>('register');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phoneCode: '+91',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'silver'
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(`/${formData.plan}`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
        const userRole = data.user.role;
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push(`/${userRole}`);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl shadow-2xl p-8 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#DCFCE7', boxShadow: 'rgba(0, 0, 0, 0.12)' }}>
      {/* Tab Buttons */}
      <div className="flex mb-8 rounded-xl p-1 border" style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }}>
        <button
          onClick={() => {
            setActiveTab('register');
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm uppercase transition-all duration-200 ${
            activeTab === 'register'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-zinc-600 text-white'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => {
            setActiveTab('signin');
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm uppercase transition-all duration-200 ${
            activeTab === 'signin'
              ? 'text-white shadow-md'
              : 'text-white'
          }`}
          style={activeTab === 'signin' ? { backgroundColor: '#16A34A' } : { backgroundColor: '#4B5563' }}
        >
          Sign In
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: '#ECFDF5', borderColor: '#DCFCE7', color: '#16A34A', border: '1px solid' }}>
          {error}
        </div>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={formData.phoneCode}
              onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
              className="w-24 px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
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
              className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Your Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            >
              <option value="silver">Silver Plan</option>
              <option value="gold">Gold Plan</option>
              <option value="platinum">Platinum Plan</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#16A34A' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#15803D')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#16A34A')}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}

      {/* Sign In Form */}
      {activeTab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="e-mail ID / Mobile Number"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]"
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
              <input
                type="checkbox"
                className="w-4 h-4 rounded focus:ring-2"
                style={{ borderColor: '#22C55E', accentColor: '#16A34A' }}
              />
              <span>Keep me logged in</span>
            </label>
            <Link href="#" className="text-sm hover:underline transition-colors" style={{ color: '#16A34A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#15803D'} onMouseLeave={(e) => e.currentTarget.style.color = '#16A34A'}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#16A34A' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#15803D')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#16A34A')}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      )}
    </div>
  );
}
