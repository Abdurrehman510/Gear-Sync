'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) {
      setToastMsg({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { // Wait, the route is `/api/auth/login`!
        // Ah, let's use the correct endpoint `/api/auth/login`
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg({ message: 'Login successful! Redirecting...', type: 'success' });
        router.refresh();
        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        setToastMsg({ message: data.message || 'Authentication failed', type: 'error' });
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
          maxWidth: '450px',
          backgroundColor: 'var(--oxford-blue-1)',
          borderRadius: '16px',
          border: '1px solid var(--space-cadet)',
          padding: '40px 30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '10px' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
            Sign in to manage your appointments and services
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email field */}
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 42px',
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

          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
              Password
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
                  padding: '12px 12px 12px 42px',
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
                <LogIn size={18} />
                <span className="span">Sign In</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--space-cadet)', paddingTop: '20px' }}>
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
            New to GearSync?{' '}
            <Link 
              href="/register" 
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
              <span>Create Account</span>
              <ArrowRight size={14} />
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
