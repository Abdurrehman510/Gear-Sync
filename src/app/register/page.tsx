'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import Toast from '@/components/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pre-load session check
  useEffect(() => {
    async function checkSession() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setToastMsg({ message: 'All fields are required.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToastMsg({ message: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setToastMsg({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg({ message: 'Registration successful! Redirecting to login...', type: 'success' });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setToastMsg({ message: data.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'An unexpected connection error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 143px)',
        backgroundImage: "radial-gradient(circle at 10% 20%, var(--oxford-blue-2) 0%, var(--oxford-blue-3) 90%)",
        padding: '40px 20px',
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--oxford-blue-1)',
          borderRadius: '16px',
          border: '1px solid var(--space-cadet)',
          padding: '40px 30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '10px' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
            Register to schedule services and track repairs online
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="name" style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)' }}>
                <UserIcon size={18} />
              </span>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 42px',
                  backgroundColor: 'var(--oxford-blue-3)',
                  border: '1px solid var(--space-cadet)',
                  borderRadius: '8px',
                  color: 'var(--white)',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--ff-mulish)',
                  outline: 'none',
                  transition: 'border-color 0.25s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--international-orange-engineering)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--space-cadet)')}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email" style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)' }}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 42px',
                  backgroundColor: 'var(--oxford-blue-3)',
                  border: '1px solid var(--space-cadet)',
                  borderRadius: '8px',
                  color: 'var(--white)',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--ff-mulish)',
                  outline: 'none',
                  transition: 'border-color 0.25s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--international-orange-engineering)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--space-cadet)')}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
              Password (min. 6 characters)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)' }}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 42px',
                  backgroundColor: 'var(--oxford-blue-3)',
                  border: '1px solid var(--space-cadet)',
                  borderRadius: '8px',
                  color: 'var(--white)',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--ff-mulish)',
                  outline: 'none',
                  transition: 'border-color 0.25s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--international-orange-engineering)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--space-cadet)')}
                required
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="confirmPassword" style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)' }}>
                <Lock size={18} />
              </span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 42px',
                  backgroundColor: 'var(--oxford-blue-3)',
                  border: '1px solid var(--space-cadet)',
                  borderRadius: '8px',
                  color: 'var(--white)',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--ff-mulish)',
                  outline: 'none',
                  transition: 'border-color 0.25s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--international-orange-engineering)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--space-cadet)')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '46px',
            }}
          >
            {loading ? (
              <div className="btn-spinner"></div>
            ) : (
              <>
                <UserPlus size={18} />
                <span className="span">Register Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--space-cadet)', paddingTop: '20px' }}>
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
            Already have an account?{' '}
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--white)', 
                fontWeight: 'var(--fw-700)', 
                display: 'inline-flex', 
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--international-orange-engineering)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--white)')}
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </p>
        </div>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.message}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}

      <style jsx>{`
        .btn-spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border-left-color: white;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
