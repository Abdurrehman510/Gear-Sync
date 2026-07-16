'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push('/dashboard'); // Non-admins redirected to customer dashboard
          }
        } else {
          setIsAdmin(false);
          router.push('/login?redirect=/admin');
        }
      } catch (err) {
        setIsAdmin(false);
        router.push('/login');
      }
    }
    checkAdmin();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 143px)', 
          backgroundColor: 'var(--oxford-blue-3)' 
        }}
      >
        <div className="spinner"></div>
        <style jsx>{`
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border-left-color: var(--international-orange-engineering);
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // Don't flash layout while redirecting
  }

  return (
    <div style={{ display: 'flex', backgroundColor: 'var(--oxford-blue-2)', minHeight: 'calc(100vh - 143px)' }} className="admin-container">
      <Sidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }} className="admin-content-pane">
        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 991px) {
          .admin-container {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            min-height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid var(--space-cadet) !important;
          }
          .admin-content-pane {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
