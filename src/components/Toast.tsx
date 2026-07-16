'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid #10b981',
      text: '#10b981',
      icon: <CheckCircle2 className="toast-icon" size={20} />
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid #ef4444',
      text: '#ef4444',
      icon: <AlertCircle className="toast-icon" size={20} />
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: '1px solid #3b82f6',
      text: '#3b82f6',
      icon: <AlertCircle className="toast-icon" size={20} />
    }
  }[type];

  return (
    <div
      className="toast-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#0a0f1d',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        ...typeStyles,
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ color: typeStyles.text, display: 'flex', alignItems: 'center' }}>
        {typeStyles.icon}
      </div>
      <p style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--ff-mulish)', flex: 1, color: '#e5e7eb' }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
