'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevLink('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'If an account exists with this email, you will receive a password reset link.');
        setEmailSent(data.emailSent === true);
        if (data.devLink) setDevLink(data.devLink);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
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
      flexDirection: 'column',
    }}>
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border" style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <div className="mb-6">
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
            Forgot Password
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: emailSent ? 'rgb(220 252 231)' : 'rgb(254 249 195)', border: emailSent ? '1px solid rgb(34 197 94)' : '1px solid rgb(202 138 4)', color: emailSent ? 'rgb(22 101 52)' : 'rgb(113 63 18)' }}>
            {message}
            {devLink && !emailSent && (
              <p className="mt-2 text-xs break-all">
                <strong>Test link:</strong>{' '}
                <a href={devLink} style={{ color: 'var(--primary)' }}>{devLink}</a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))', boxShadow: '0 12px 22px rgba(233,75,106,.22)' }}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
