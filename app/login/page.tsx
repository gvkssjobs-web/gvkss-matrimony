'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

// Safe redirect: only allow same-origin paths starting with /
function getRedirectPath(redirect: string | null): string | null {
  if (!redirect || typeof redirect !== 'string') return null;
  const path = redirect.startsWith('/') ? redirect : `/${redirect}`;
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getRedirectPath(searchParams.get('redirect'));
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const err = searchParams.get('error');
    const message = searchParams.get('message');
    if (verified === '1') setSuccessMessage('Your email has been verified. You can sign in now.');
    if (message === 'verify_email') setSuccessMessage('Account created. Please check your email to verify your account, then sign in.');
    if (err === 'invalid_token') setError('Invalid or expired verification link.');
    if (err === 'missing_token') setError('Invalid verification link.');
    if (err === 'verify_failed') setError('Verification failed. Please try again or request a new link.');
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      router.push('/');
    }
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        const userRole = data.user.role;
        const userStatus = data.user.status;

        // If they came from a profile link, send them back after login
        if (redirectTo) {
          router.push(redirectTo);
          return;
        }
        // Admin always goes to home; other users go to status if not accepted
        if (userRole === 'admin') {
          router.push('/');
        } else if (userStatus !== 'accepted') {
          router.push('/status');
        } else {
          router.push('/');
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
    <div className="w-full" style={{ 
      background: 'var(--bg)',
      padding: '20px 0',
      paddingTop: 'calc(10px + 1px)',
      minHeight: 'calc(100vh - 82px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
     
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border" style={{ 
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
            Welcome Back
          </h1>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {redirectTo ? 'Please sign in to view this profile.' : 'Sign in to your account to continue'}
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

        {/* Success Message (e.g. after email verification) */}
        {successMessage && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ 
            backgroundColor: 'rgb(220 252 231)', 
            border: '1px solid rgb(34 197 94)', 
            color: 'rgb(22 101 52)' 
          }}>
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
              boxShadow: '0 12px 22px rgba(233,75,106,.22)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 82px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
