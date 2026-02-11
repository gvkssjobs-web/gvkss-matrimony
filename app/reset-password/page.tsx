'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token.trim()) {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (pwd: string): string[] => {
    const errs: string[] = [];
    if (pwd.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errs.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errs.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errs.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errs.push('One special character');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const pwdErrs = validatePassword(password);
    if (pwdErrs.length > 0) {
      setError('Password must have: ' + pwdErrs.join(', '));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full px-3 sm:px-4 py-6 sm:py-8" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border text-center mx-auto" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Password has been reset successfully.</p>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>Redirecting you to sign in...</p>
          <Link href="/login" className="inline-block mt-4 font-semibold" style={{ color: 'var(--primary)' }}>Sign in now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 py-6 sm:py-8" style={{
      background: 'var(--bg)',
      minHeight: 'calc(100vh - 84px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border mx-auto" style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <div className="mb-6">
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
            Set new password
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            {error}
          </div>
        )}

        {!token.trim() ? (
          <div className="text-center">
            <Link href="/forgot-password" className="font-semibold" style={{ color: 'var(--primary)' }}>Request a new reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 rounded focus:outline-none flex items-center justify-center"
                  style={{ color: 'var(--muted)' }}
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c0 4.478 2.943 8.268 7 9.543 2.767 1.128 5.878 1.128 8.61 0a9.953 9.953 0 003.117-1.117m5.858-.908L4.031 4.031m13.938 13.938L4.031 4.031" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 p-1 rounded focus:outline-none flex items-center justify-center"
                  style={{ color: 'var(--muted)' }}
                  title={showConfirmPassword ? 'Hide password' : 'View password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'View password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c0 4.478 2.943 8.268 7 9.543 2.767 1.128 5.878 1.128 8.61 0a9.953 9.953 0 003.117-1.117m5.858-.908L4.031 4.031m13.938 13.938L4.031 4.031" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))', boxShadow: '0 12px 22px rgba(233,75,106,.22)' }}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
