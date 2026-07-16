'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Wrench, Users, ArrowLeft } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Appointments', href: '/admin/appointments', icon: <Calendar size={20} /> },
    { label: 'Services Manager', href: '/admin/services', icon: <Wrench size={20} /> },
    { label: 'Users & Roles', href: '/admin/users', icon: <Users size={20} /> },
  ];

  return (
    <aside 
      className="admin-sidebar"
      style={{
        width: '260px',
        backgroundColor: 'var(--oxford-blue-3)',
        borderRight: '1px solid var(--space-cadet)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 'calc(100vh - 85px)', // Navbar height offset
        padding: '24px 16px',
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h2 
          style={{ 
            color: 'var(--white)', 
            fontFamily: 'var(--ff-chakra-petch)', 
            fontSize: '1.8rem', 
            fontWeight: 'var(--fw-700)', 
            letterSpacing: '1px',
            textTransform: 'uppercase',
            paddingLeft: '8px'
          }}
        >
          Admin Console
        </h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: isActive ? 'var(--white)' : 'var(--cadet-blue-creyola)',
                    backgroundColor: isActive ? 'var(--international-orange-engineering)' : 'transparent',
                    fontSize: '1.5rem',
                    fontFamily: 'var(--ff-chakra-petch)',
                    fontWeight: 'var(--fw-600)',
                    transition: 'all 0.25s ease',
                    textDecoration: 'none'
                  }}
                  className="sidebar-link"
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--space-cadet)', paddingTop: '20px' }}>
        <Link 
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--cadet-blue-creyola)',
            fontSize: '1.4rem',
            fontFamily: 'var(--ff-chakra-petch)',
            textDecoration: 'none',
            paddingLeft: '8px'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cadet-blue-creyola)')}
        >
          <ArrowLeft size={16} />
          <span>Customer Dashboard</span>
        </Link>
      </div>

      <style jsx>{`
        .sidebar-link:hover {
          color: var(--white) !important;
          background-color: ${pathname !== '/admin' ? 'var(--space-cadet)' : ''};
        }
      `}</style>
    </aside>
  );
}
