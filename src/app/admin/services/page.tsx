'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Wrench, Clock, DollarSign, X, Check } from 'lucide-react';
import Toast from '@/components/Toast';

interface ServiceItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Engine');
  const [image, setImage] = useState('/assets/images/services-1.png');
  
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ message: 'Failed to load services catalog.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (item?: ServiceItem) => {
    if (item) {
      setEditingId(item._id);
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setDuration(item.duration.toString());
      setCategory(item.category);
      setImage(item.image);
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setPrice('');
      setDuration('');
      setCategory('Engine');
      setImage('/assets/images/services-1.png');
    }
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !duration || !category) {
      setToastMsg({ message: 'All fields are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration, 10),
      category,
      image,
    };

    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg({
          message: editingId ? 'Service updated successfully!' : 'Service created successfully!',
          type: 'success',
        });
        handleCloseForm();
        await loadServices(); // Reload services
      } else {
        setToastMsg({ message: data.message || 'Operation failed', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'An unexpected connection error occurred.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the service "${serviceName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setToastMsg({ message: 'Service deleted successfully!', type: 'success' });
        setServices((prev) => prev.filter((s) => s._id !== id));
      } else {
        const data = await res.json();
        setToastMsg({ message: data.message || 'Delete failed', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection error during service deletion.', type: 'error' });
    }
  };

  if (loading && services.length === 0) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '6px' }}>
            Services Manager
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
            Maintain the system service catalog. Add, update, or remove offerings.
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()} 
          className="btn btn-primary"
          style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} />
          <span className="span">Add Service</span>
        </button>
      </div>

      {/* Dynamic Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {services.map((s) => (
          <div 
            key={s._id}
            style={{
              backgroundColor: 'var(--oxford-blue-1)',
              border: '1px solid var(--space-cadet)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}
          >
            {/* Category badge */}
            <span 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontWeight: 'var(--fw-700)',
                color: 'var(--international-orange-engineering)',
                backgroundColor: 'rgba(197, 24, 0, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--ff-chakra-petch)'
              }}
            >
              {s.category}
            </span>

            {/* Icon */}
            <div style={{ marginBlockEnd: '15px' }}>
              <img src={s.image} alt={s.name} width="50" height="50" style={{ objectFit: 'contain' }} />
            </div>

            <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '10px' }}>
              {s.name}
            </h3>

            <p style={{ fontSize: '1.35rem', color: 'var(--sonic-silver)', flex: 1, marginBlockEnd: '20px', lineHeight: '1.6' }}>
              {s.description.length > 150 ? `${s.description.slice(0, 147)}...` : s.description}
            </p>

            {/* Price & Duration */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid var(--space-cadet)', 
                paddingTop: '15px', 
                marginBlockEnd: '20px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--white)', fontSize: '1.3rem' }}>
                <Clock size={14} style={{ color: 'var(--international-orange-engineering)' }} />
                <span>{s.duration} mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--white)', fontSize: '1.4rem', fontWeight: 'var(--fw-700)' }}>
                <DollarSign size={14} style={{ color: 'var(--international-orange-engineering)' }} />
                <span>{s.price}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleOpenForm(s)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--space-cadet)',
                  borderRadius: '6px',
                  color: 'var(--white)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(s._id, s.name)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Toggle Drawer Form overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 9999,
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '100%',
              backgroundColor: 'var(--oxford-blue-1)',
              borderLeft: '1px solid var(--space-cadet)',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 30px rgba(0,0,0,0.5)',
              overflowY: 'auto',
              animation: 'slideLeft 0.3s ease-out'
            }}
          >
            {/* Form Title & Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.2rem', fontWeight: 'var(--fw-700)' }}>
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button 
                onClick={handleCloseForm}
                style={{ color: 'var(--cadet-blue-creyola)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cadet-blue-creyola)')}
              >
                <X size={24} />
              </button>
            </div>

            {/* Service Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Service Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                  Service Title
                </label>
                <input 
                  type="text"
                  placeholder="Engine Tune Up"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--oxford-blue-3)',
                    border: '1px solid var(--space-cadet)',
                    borderRadius: '8px',
                    color: 'var(--white)',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--ff-mulish)',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--oxford-blue-3)',
                    border: '1px solid var(--space-cadet)',
                    borderRadius: '8px',
                    color: 'var(--white)',
                    fontSize: '1.4rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Engine">Engine</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Tires">Tires</option>
                  <option value="Battery">Battery</option>
                  <option value="Steering">Steering</option>
                </select>
              </div>

              {/* Price & Duration Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Cost */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                    Cost ($)
                  </label>
                  <input 
                    type="number"
                    placeholder="120"
                    value={price}
                    min="0"
                    step="0.01"
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--oxford-blue-3)',
                      border: '1px solid var(--space-cadet)',
                      borderRadius: '8px',
                      color: 'var(--white)',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--ff-mulish)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                {/* Duration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                    Duration (mins)
                  </label>
                  <input 
                    type="number"
                    placeholder="60"
                    value={duration}
                    min="10"
                    onChange={(e) => setDuration(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--oxford-blue-3)',
                      border: '1px solid var(--space-cadet)',
                      borderRadius: '8px',
                      color: 'var(--white)',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--ff-mulish)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                  Service Description
                </label>
                <textarea
                  placeholder="Provide details about what this service covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--oxford-blue-3)',
                    border: '1px solid var(--space-cadet)',
                    borderRadius: '8px',
                    color: 'var(--white)',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--ff-mulish)',
                    outline: 'none',
                    resize: 'none'
                  }}
                  required
                ></textarea>
              </div>

              {/* Image selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>
                  Service Icon Card
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', backgroundColor: 'var(--oxford-blue-3)', padding: '10px', borderRadius: '8px' }}>
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const iconPath = `/assets/images/services-${num === 5 ? 6 : num === 6 ? 6 : num}.png`; // Adapt fallback
                    const fixedPath = `/assets/images/services-${num}.png`;
                    const isSelected = image === fixedPath;

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setImage(fixedPath)}
                        style={{
                          padding: '4px',
                          border: isSelected ? '2px solid var(--international-orange-engineering)' : '1px solid transparent',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <img src={fixedPath} alt={`Icon ${num}`} width="35" height="35" style={{ objectFit: 'contain', margin: '0 auto' }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  marginTop: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '46px',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--ff-chakra-petch)',
                  gap: '6px'
                }}
              >
                {submitting ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{editingId ? 'Save Changes' : 'Create Offer'}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <Toast
          message={toastMsg.message}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}

      <style jsx global>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
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
    </div>
  );
}
