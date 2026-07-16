'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Menu, X, ShieldAlert } from 'lucide-react';

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'mechanic' | 'admin';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check authentication status on mount and path changes
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    checkAuth();
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'Services', href: '/services' },
    { label: 'Work', href: '/#work' },
  ];

  return (
    <header className={`header ${pathname !== '/' || isScrolled ? 'active' : ''}`} style={{ transition: 'var(--transition)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* LOGO */}
        <Link href="/" className="logo">
          <img src="/assets/images/logo.png" alt="GearSync home" style={{ display: 'block', height: '80px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`} data-navbar>
          <ul className="navbar-list" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link 
                  href={link.href} 
                  className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Conditional Auth Links */}
            {user ? (
              <>
                <li>
                  <Link 
                    href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="navbar-link"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.role === 'admin' ? <ShieldAlert size={16} /> : <LayoutDashboard size={16} />}
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li className="mobile-only-auth">
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="navbar-link"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left' }}
                  >
                    <LogOut size={16} />
                    <span>Logout ({user.name.split(' ')[0]})</span>
                  </button>
                </li>
              </>
            ) : (
              <li className="mobile-only-auth">
                <Link 
                  href="/login" 
                  className="navbar-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <div className="desktop-only-auth" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '1.4rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                Hello, {user.name.split(' ')[0]}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'auto', height: '40px' }}
              >
                <LogOut size={16} />
                <span className="span" style={{ fontSize: '1.3rem' }}>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="btn btn-primary desktop-only-auth"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'auto', height: '40px' }}
            >
              <User size={16} />
              <span className="span" style={{ fontSize: '1.3rem' }}>Sign In</span>
            </Link>
          )}

          <Link href="/book" className="btn btn-primary" style={{ padding: '10px 20px', height: '40px', display: 'flex', alignItems: 'center' }}>
            <span className="span" style={{ fontSize: '1.3rem' }}>Book Now</span>
            <span className="material-symbols-rounded" style={{ fontSize: '18px', marginLeft: '5px' }}>arrow_forward</span>
          </Link>

          {/* Hamburger Menu Icon */}
          <button 
            className="nav-toggle-btn" 
            aria-label="toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ display: 'none' }} /* Hidden by default, shown in media queries */
          >
            {isMenuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
          </button>
        </div>

      </div>

      {/* Styled toggle menu overrides (Inline CSS helper for responsiveness where style.css isn't fully binding) */}
      <style jsx global>{`
        @media (max-width: 991px) {
          .nav-toggle-btn {
            display: block !important;
          }
          .navbar {
            display: none !important;
          }
          .navbar.active {
            display: block !important;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: var(--oxford-blue-3);
            padding: 20px;
            border-block-start: 1px solid var(--space-cadet);
            box-shadow: var(--shadow);
            z-index: 10;
          }
          .navbar-list {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          .desktop-only-auth {
            display: none !important;
          }
        }
        @media (min-width: 992px) {
          .mobile-only-auth {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
