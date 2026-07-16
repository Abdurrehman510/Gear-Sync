'use client';

import React, { useState, useEffect } from 'react';
import { Users, User, Shield, Key, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import Toast from '@/components/Toast';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'mechanic' | 'admin';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        // 1. Fetch current session to identify logged-in admin ID
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentAdminId(meData.user.userId);
        }

        // 2. Fetch all user accounts
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch (err) {
        console.error(err);
        setToastMsg({ message: 'Failed to retrieve user accounts.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    if (id === currentAdminId) {
      setToastMsg({ message: 'Accidental lockout guard: Cannot modify your own admin role.', type: 'error' });
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setToastMsg({ message: 'User role updated successfully!', type: 'success' });
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: newRole as any } : u))
        );
      } else {
        const data = await res.json();
        setToastMsg({ message: data.message || 'Failed to update user role.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'A network connection issue occurred.', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (id === currentAdminId) {
      setToastMsg({ message: 'Accidental lockout guard: Cannot delete your own admin account.', type: 'error' });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user account "${userEmail}"? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setToastMsg({ message: 'User account deleted successfully!', type: 'success' });
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        const data = await res.json();
        setToastMsg({ message: data.message || 'Deletion failed.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection error during account deletion.', type: 'error' });
    }
  };

  const getRoleBadgeStyle = (role: UserItem['role']) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <Shield size={14} /> };
      case 'mechanic':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Key size={14} /> };
      case 'customer':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <User size={14} /> };
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
          Users & Access Roles
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
          Manage client accounts, assign system roles, and revoke authorization.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          color: '#f59e0b'
        }}
      >
        <AlertTriangle size={24} style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '1.35rem', margin: 0, lineHeight: '1.5' }}>
          <strong>Accidental Lockout Protection Enabled:</strong> You cannot delete or change the role of the account you are currently logged in with.
        </p>
      </div>

      {/* Users table */}
      <div 
        style={{
          backgroundColor: 'var(--oxford-blue-1)',
          border: '1px solid var(--space-cadet)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--space-cadet)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>User Profile</th>
                <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Registered Email</th>
                <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Joined Date</th>
                <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Access level</th>
                <th style={{ padding: '12px 16px', fontSize: '1.25rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isSelf = currentAdminId === item._id;
                const badge = getRoleBadgeStyle(item.role);
                const joinDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                  <tr 
                    key={item._id} 
                    style={{ borderBottom: '1px solid var(--space-cadet)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    
                    {/* User Profile */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '50%', color: 'var(--white)' }}>
                          <User size={16} />
                        </div>
                        <div>
                          <p style={{ fontSize: '1.45rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', margin: 0 }}>
                            {item.name}
                          </p>
                          {isSelf && (
                            <span style={{ fontSize: '1.1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 'var(--fw-700)' }}>
                              <ShieldCheck size={12} />
                              <span>Current Session</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '16px', fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                      {item.email}
                    </td>

                    {/* Joined Date */}
                    <td style={{ padding: '16px', fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                      {joinDate}
                    </td>

                    {/* Role Dropdown */}
                    <td style={{ padding: '16px' }}>
                      {isSelf ? (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '50px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontSize: '1.3rem',
                            fontWeight: 'var(--fw-600)',
                            fontFamily: 'var(--ff-chakra-petch)'
                          }}
                        >
                          {badge.icon}
                          <span style={{ textTransform: 'capitalize' }}>{item.role}</span>
                        </span>
                      ) : (
                        <select
                          value={item.role}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--oxford-blue-3)',
                            border: '1px solid var(--space-cadet)',
                            borderRadius: '6px',
                            color: badge.color,
                            fontWeight: 'var(--fw-700)',
                            fontFamily: 'var(--ff-chakra-petch)',
                            fontSize: '1.35rem',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '150px'
                          }}
                        >
                          <option value="customer" style={{ color: '#3b82f6' }}>Customer</option>
                          <option value="mechanic" style={{ color: '#f59e0b' }}>Mechanic</option>
                          <option value="admin" style={{ color: '#ef4444' }}>Admin</option>
                        </select>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleDeleteUser(item._id, item.email)}
                        disabled={isSelf}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: isSelf ? 'var(--sonic-silver)' : '#ef4444',
                          fontSize: '1.3rem',
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          border: '1px solid',
                          borderColor: isSelf ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: isSelf ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                          transition: 'all 0.2s',
                          opacity: isSelf ? 0.3 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelf) {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelf) {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                            e.currentTarget.style.color = '#ef4444';
                          }
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
