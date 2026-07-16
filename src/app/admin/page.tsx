'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, Users, Wrench, ChevronRight, Activity, Clock, ShieldCheck, CheckCircle } from 'lucide-react';

interface Stats {
  totalAppointments: number;
  totalCustomers: number;
  totalMechanics: number;
  totalRevenue: number;
  statusDistribution: {
    pending: number;
    confirmed: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
  };
  popularServices: Array<{
    name: string;
    category: string;
    bookingsCount: number;
  }>;
}

interface AppointmentItem {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  service: {
    name: string;
    price: number;
  };
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentBookings(data.recentAppointments);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getStatusStyle = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending' };
      case 'confirmed':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Confirmed' };
      case 'in-progress':
        return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', label: 'In Progress' };
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Completed' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Cancelled' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="inner-spinner"></div>
        <style jsx>{`
          .inner-spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            width: 40px;
            height: 40px;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Welcome header */}
      <div>
        <h1 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '6px' }}>
          Overview Panel
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
          Real-time metrics, booking velocity, and total revenue counts.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="kpi-grid">
        {/* Total Revenue */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</p>
            <h3 style={{ fontSize: '2.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)', marginBlockStart: '8px' }}>
              ${stats?.totalRevenue}
            </h3>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10b981' }}>
            <DollarSign size={26} />
          </div>
        </div>

        {/* Total Bookings */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</p>
            <h3 style={{ fontSize: '2.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)', marginBlockStart: '8px' }}>
              {stats?.totalAppointments}
            </h3>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: '#3b82f6' }}>
            <Calendar size={26} />
          </div>
        </div>

        {/* Customers count */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customers</p>
            <h3 style={{ fontSize: '2.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)', marginBlockStart: '8px' }}>
              {stats?.totalCustomers}
            </h3>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px', color: '#a855f7' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Mechanics count */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff Mechanics</p>
            <h3 style={{ fontSize: '2.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)', marginBlockStart: '8px' }}>
              {stats?.totalMechanics}
            </h3>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: '#f59e0b' }}>
            <Wrench size={26} />
          </div>
        </div>
      </div>

      {/* Detailed stats grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }} className="sections-grid">
        
        {/* Status Distribution chart layout */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
            <span>Booking Status Breakdown</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats && Object.entries(stats.statusDistribution).map(([status, count]) => {
              const total = stats.totalAppointments || 1;
              const percent = Math.round((count / total) * 100);
              const meta = getStatusStyle(status as AppointmentItem['status']);

              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem' }}>
                    <span style={{ color: 'var(--white)', textTransform: 'capitalize', fontWeight: 'var(--fw-600)' }}>
                      {meta.label}
                    </span>
                    <span style={{ color: 'var(--cadet-blue-creyola)' }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--oxford-blue-3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        backgroundColor: meta.color, 
                        width: `${percent}%`,
                        transition: 'width 0.5s ease-out',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular services list */}
        <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
            <span>Popular Service Demands</span>
          </h3>

          {stats?.popularServices.length === 0 ? (
            <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)', textAlign: 'center', paddingBlock: '30px' }}>No booking data yet.</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: 0, margin: 0 }}>
              {stats?.popularServices.map((service, index) => (
                <li 
                  key={service.name} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    padding: '12px 16px', 
                    backgroundColor: 'var(--oxford-blue-3)', 
                    borderRadius: '8px',
                    border: '1px solid var(--space-cadet)'
                  }}
                >
                  <span style={{ fontFamily: 'var(--ff-chakra-petch)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', color: 'var(--international-orange-engineering)' }}>
                    0{index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '1.45rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', margin: 0 }}>{service.name}</p>
                    <span style={{ fontSize: '1.15rem', color: 'var(--sonic-silver)', textTransform: 'uppercase' }}>{service.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.6rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)', margin: 0 }}>{service.bookingsCount}</p>
                    <span style={{ fontSize: '1.1rem', color: 'var(--cadet-blue-creyola)' }}>Bookings</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Recent Bookings table */}
      <div 
        style={{ 
          backgroundColor: 'var(--oxford-blue-1)', 
          border: '1px solid var(--space-cadet)', 
          borderRadius: '16px', 
          padding: '24px' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: '20px' }}>
          <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Clock size={20} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
            <span>Recent Bookings Velocity</span>
          </h3>
          <Link 
            href="/admin/appointments" 
            style={{ 
              fontSize: '1.35rem', 
              color: 'var(--cadet-blue-creyola)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontFamily: 'var(--ff-chakra-petch)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cadet-blue-creyola)')}
          >
            <span>View All Log</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)', textAlign: 'center', paddingBlock: '30px' }}>No recent appointments found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--space-cadet)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Service</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Schedule</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((appt) => {
                  const meta = getStatusStyle(appt.status);
                  const formattedDate = new Date(appt.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={appt._id} style={{ borderBottom: '1px solid var(--space-cadet)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', margin: 0 }}>{appt.customer.name}</p>
                        <span style={{ fontSize: '1.15rem', color: 'var(--sonic-silver)' }}>{appt.customer.email}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '1.4rem', color: 'var(--white)' }}>
                        {appt.service.name}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '1.35rem', color: 'var(--white)', display: 'block' }}>{formattedDate}</span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--cadet-blue-creyola)' }}>{appt.timeSlot}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '1.4rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)' }}>
                        ${appt.service.price}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '50px',
                            fontSize: '1.15rem',
                            fontFamily: 'var(--ff-chakra-petch)',
                            fontWeight: 'var(--fw-600)',
                            backgroundColor: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 991px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .sections-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 576px) {
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
