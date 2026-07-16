'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, AlertCircle, Search } from 'lucide-react';
import Toast from '@/components/Toast';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AppointmentItem {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  service: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  mechanic?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [staff, setStaff] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load bookings and staff
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch appointments
        const apptsRes = await fetch('/api/appointments');
        let apptsData: AppointmentItem[] = [];
        if (apptsRes.ok) {
          const res = await apptsRes.json();
          apptsData = res.appointments;
          setAppointments(apptsData);
        }

        // 2. Fetch mechanics and admins for assignment
        const mechanicsRes = await fetch('/api/users?role=mechanic');
        const adminsRes = await fetch('/api/users?role=admin');
        let staffList: UserItem[] = [];
        
        if (mechanicsRes.ok) {
          const mData = await mechanicsRes.json();
          staffList = [...staffList, ...mData.users];
        }
        if (adminsRes.ok) {
          const aData = await adminsRes.json();
          staffList = [...staffList, ...aData.users];
        }
        setStaff(staffList);
      } catch (err) {
        console.error(err);
        setToastMsg({ message: 'Failed to retrieve administrative data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setToastMsg({ message: `Status updated to ${newStatus} successfully!`, type: 'success' });
        // Update locally
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === id ? { ...appt, status: newStatus as any } : appt))
        );
      } else {
        const data = await res.json();
        setToastMsg({ message: data.message || 'Status update failed.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection issue while updating status.', type: 'error' });
    }
  };

  const handleAssignMechanic = async (id: string, mechanicId: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mechanicId }),
      });

      if (res.ok) {
        setToastMsg({ message: 'Mechanic assigned successfully!', type: 'success' });
        const data = await res.json();
        // Update local state
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === id ? { ...appt, mechanic: data.appointment.mechanic } : appt))
        );
        // Let's force a reload to get correctly populated mechanic detail object
        const reloadRes = await fetch('/api/appointments');
        if (reloadRes.ok) {
          const reloadData = await reloadRes.json();
          setAppointments(reloadData.appointments);
        }
      } else {
        const data = await res.json();
        setToastMsg({ message: data.message || 'Assignment failed.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection issue while assigning mechanic.', type: 'error' });
    }
  };

  // Filter list
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const matchesSearch = 
      appt.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'in-progress': return '#a855f7';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '80px' }}>
        <div className="spinner"></div>
        <style jsx>{`
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            width: 45px;
            height: 45px;
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
      
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '6px' }}>
          Appointments Dispatcher
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
          Review booking schedules, modify progress status, and dispatch mechanics.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--oxford-blue-1)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--space-cadet)',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '350px', width: '100%' }}>
          <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)' }}>
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search name, email, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              backgroundColor: 'var(--oxford-blue-3)',
              border: '1px solid var(--space-cadet)',
              borderRadius: '8px',
              color: 'var(--white)',
              fontSize: '1.4rem',
              outline: 'none',
              fontFamily: 'var(--ff-mulish)'
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '1.25rem',
                fontFamily: 'var(--ff-chakra-petch)',
                fontWeight: 'var(--fw-600)',
                cursor: 'pointer',
                backgroundColor: statusFilter === status ? 'var(--international-orange-engineering)' : 'var(--oxford-blue-3)',
                color: statusFilter === status ? 'var(--white)' : 'var(--cadet-blue-creyola)',
                border: '1px solid',
                borderColor: statusFilter === status ? 'var(--international-orange-engineering)' : 'var(--space-cadet)',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {status === 'all' ? 'All Bookings' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Card */}
      <div 
        style={{
          backgroundColor: 'var(--oxford-blue-1)',
          border: '1px solid var(--space-cadet)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', paddingBlock: '40px', color: 'var(--cadet-blue-creyola)' }}>
            <AlertCircle size={38} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '1.5rem', fontFamily: 'var(--ff-chakra-petch)' }}>No appointments match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--space-cadet)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Service Details</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Schedule</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Staff Dispatch</th>
                  <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Status modifier</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => {
                  const formattedDate = new Date(appt.date).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                  });

                  return (
                    <tr 
                      key={appt._id} 
                      style={{ borderBottom: '1px solid var(--space-cadet)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Customer info */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '50%', color: 'var(--white)' }}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '1.45rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', margin: 0 }}>{appt.customer.name}</p>
                            <span style={{ fontSize: '1.15rem', color: 'var(--sonic-silver)' }}>{appt.customer.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Service info */}
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-600)', color: 'var(--white)', margin: 0 }}>{appt.service.name}</p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', marginTop: '2px' }}>
                          <span>${appt.service.price}</span>
                          <span>|</span>
                          <span>{appt.service.duration} mins</span>
                        </div>
                        {appt.notes && (
                          <div style={{ marginTop: '8px', padding: '6px 10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px dashed var(--space-cadet)' }}>
                            <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', fontStyle: 'italic', margin: 0 }}>
                              "{appt.notes}"
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '1.4rem', color: 'var(--white)', display: 'block' }}>{formattedDate}</span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <Clock size={12} />
                          <span>{appt.timeSlot}</span>
                        </span>
                      </td>

                      {/* Mechanic assignment */}
                      <td style={{ padding: '16px' }}>
                        <select
                          value={appt.mechanic?._id || ''}
                          onChange={(e) => handleAssignMechanic(appt._id, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--oxford-blue-3)',
                            border: '1px solid var(--space-cadet)',
                            borderRadius: '6px',
                            color: 'var(--white)',
                            fontSize: '1.35rem',
                            fontFamily: 'var(--ff-mulish)',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '180px'
                          }}
                        >
                          <option value="">Unassigned</option>
                          {staff.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.role === 'admin' ? 'Admin' : 'Mechanic'})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status select */}
                      <td style={{ padding: '16px' }}>
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateStatus(appt._id, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--oxford-blue-3)',
                            border: '1px solid var(--space-cadet)',
                            borderRadius: '6px',
                            color: getStatusColor(appt.status),
                            fontWeight: 'var(--fw-700)',
                            fontFamily: 'var(--ff-chakra-petch)',
                            fontSize: '1.35rem',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '160px',
                            borderLeft: `3px solid ${getStatusColor(appt.status)}`
                          }}
                        >
                          <option value="pending" style={{ color: '#f59e0b' }}>Pending</option>
                          <option value="confirmed" style={{ color: '#3b82f6' }}>Confirmed</option>
                          <option value="in-progress" style={{ color: '#a855f7' }}>In Progress</option>
                          <option value="completed" style={{ color: '#10b981' }}>Completed</option>
                          <option value="cancelled" style={{ color: '#ef4444' }}>Cancelled</option>
                        </select>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.message}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
}
