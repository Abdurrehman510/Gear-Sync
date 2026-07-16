'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, DollarSign, Ban, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import Toast from '@/components/Toast';

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'mechanic' | 'admin';
}

interface AppointmentItem {
  _id: string;
  service: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    image: string;
  };
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  mechanic?: {
    name: string;
    email: string;
  };
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1. Authenticate user
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        // 2. Fetch User appointments
        const apptRes = await fetch('/api/appointments');
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          setAppointments(apptData.appointments);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this service reservation?')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg({ message: 'Reservation cancelled successfully.', type: 'success' });
        // Update local state
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === id ? { ...appt, status: 'cancelled' as const } : appt))
        );
      } else {
        setToastMsg({ message: data.message || 'Cancellation failed.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'A network connection issue occurred.', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  // Helper stats compiler
  const totalBookings = appointments.length;
  const activeBookings = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed' || a.status === 'in-progress').length;
  const completedBookings = appointments.filter((a) => a.status === 'completed').length;

  const getStatusStyle = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending Approval' };
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 143px)', backgroundColor: 'var(--oxford-blue-3)' }}>
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

  return (
    <section style={{ backgroundColor: 'var(--oxford-blue-3)', minHeight: 'calc(100vh - 143px)', paddingBlock: '40px' }}>
      <div className="container">
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '3.2rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '8px' }}>
              Hello, {user?.name}
            </h1>
            <p style={{ fontSize: '1.5rem', color: 'var(--cadet-blue-creyola)' }}>
              Manage your service reservations and review past repair jobs.
            </p>
          </div>
          <Link href="/book" className="btn btn-primary" style={{ height: '46px', display: 'flex', alignItems: 'center' }}>
            <span className="span">New Booking</span>
            <span className="material-symbols-rounded">arrow_forward</span>
          </Link>
        </div>

        {/* Dynamic Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }} className="stats-grid">
          <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--cadet-blue-creyola)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase' }}>Total Bookings</p>
              <h3 style={{ fontSize: '2.4rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>{totalBookings}</h3>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#3b82f6' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase' }}>Active Services</p>
              <h3 style={{ fontSize: '2.4rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>{activeBookings}</h3>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--oxford-blue-1)', border: '1px solid var(--space-cadet)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase' }}>Completed Tasks</p>
              <h3 style={{ fontSize: '2.4rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>{completedBookings}</h3>
            </div>
          </div>
        </div>

        {/* Bookings List section */}
        <div 
          style={{
            backgroundColor: 'var(--oxford-blue-1)',
            border: '1px solid var(--space-cadet)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px' }}>
            Reservation Log
          </h2>

          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', paddingBlock: '60px' }}>
              <AlertCircle size={48} color="var(--cadet-blue-creyola)" style={{ margin: '0 auto 15px' }} />
              <p style={{ fontSize: '1.6rem', color: 'var(--cadet-blue-creyola)', marginBlockEnd: '20px' }}>
                You do not have any appointments scheduled yet.
              </p>
              <Link href="/book" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span className="span">Book Your First Service</span>
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--space-cadet)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Auto Service</th>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Date & Slot</th>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Mechanic</th>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Cost</th>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '1.3rem', color: 'var(--white)', textTransform: 'uppercase', fontFamily: 'var(--ff-chakra-petch)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const statusMeta = getStatusStyle(appt.status);
                    const formattedDate = new Date(appt.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr 
                        key={appt._id} 
                        style={{ borderBottom: '1px solid var(--space-cadet)', transition: 'background-color 0.2s' }}
                        className="table-row"
                      >
                        {/* Service Column */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={appt.service.image} 
                              alt={appt.service.name} 
                              width="40" 
                              height="40" 
                              style={{ objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px' }} 
                            />
                            <div>
                              <p style={{ fontSize: '1.45rem', fontWeight: 'var(--fw-700)', color: 'var(--white)' }}>
                                {appt.service.name}
                              </p>
                              <span style={{ fontSize: '1.2rem', color: 'var(--sonic-silver)' }}>
                                {appt.service.duration} mins duration
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date Column */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: 'var(--white)', fontSize: '1.4rem' }}>{formattedDate}</div>
                          <div style={{ color: 'var(--cadet-blue-creyola)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={12} />
                            <span>{appt.timeSlot}</span>
                          </div>
                        </td>

                        {/* Mechanic Column */}
                        <td style={{ padding: '16px', fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                          {appt.mechanic ? (
                            <div>
                              <p style={{ color: 'var(--white)', fontWeight: 'var(--fw-600)' }}>{appt.mechanic.name}</p>
                              <span style={{ fontSize: '1.15rem' }}>Assigned Mechanic</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '1.3rem', color: 'var(--sonic-silver)', fontStyle: 'italic' }}>Pending Assignment</span>
                          )}
                        </td>

                        {/* Cost Column */}
                        <td style={{ padding: '16px', fontSize: '1.45rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)' }}>
                          ${appt.service.price}
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: '16px' }}>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '50px',
                              fontSize: '1.25rem',
                              fontFamily: 'var(--ff-chakra-petch)',
                              fontWeight: 'var(--fw-600)',
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.color,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {/* Cancellation Trigger */}
                            {(appt.status === 'pending' || appt.status === 'confirmed') && (
                              <button
                                onClick={() => handleCancelBooking(appt._id)}
                                disabled={cancellingId === appt._id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#ef4444',
                                  fontSize: '1.3rem',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                  transition: 'all 0.25s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ef4444';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                                  e.currentTarget.style.color = '#ef4444';
                                }}
                              >
                                <Ban size={14} />
                                <span>Cancel</span>
                              </button>
                            )}

                            {/* Reviews Link */}
                            {appt.status === 'completed' && (
                              <Link
                                href={`/services/${appt.service._id}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#10b981',
                                  fontSize: '1.3rem',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                  transition: 'all 0.25s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#10b981';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                                  e.currentTarget.style.color = '#10b981';
                                }}
                              >
                                <MessageSquare size={14} />
                                <span>Review Service</span>
                              </Link>
                            )}

                            {/* Disabled logs */}
                            {(appt.status === 'cancelled' || appt.status === 'in-progress') && (
                              <span style={{ fontSize: '1.3rem', color: 'var(--sonic-silver)', fontStyle: 'italic' }}>No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.message}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}

      <style jsx global>{`
        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 767px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }
        .table-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </section>
  );
}
