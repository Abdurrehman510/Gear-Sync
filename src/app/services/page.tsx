'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';

interface ServiceItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string;
}

const categories = ['All', 'Engine', 'Brakes', 'Tires', 'Battery', 'Steering'];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchServices = async (cat: string, query: string) => {
    setLoading(true);
    try {
      const url = new URL('/api/services', window.location.origin);
      if (cat !== 'All') url.searchParams.set('category', cat);
      if (query) url.searchParams.set('search', query);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchServices(activeCategory, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  return (
    <section 
      style={{
        minHeight: 'calc(100vh - 143px)',
        backgroundColor: 'var(--oxford-blue-3)',
        paddingBlock: '60px',
      }}
    >
      <div className="container">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <p className="section-subtitle :light" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>
            Catalog
          </p>
          <h1 className="h2 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', marginBlockEnd: '20px' }}>
            Professional Auto Services
          </h1>
          <p style={{ fontSize: '1.6rem', color: 'var(--cadet-blue-creyola)', maxWidth: '600px', margin: '0 auto' }}>
            Choose from our range of expert auto maintenance and repair services. Select a service to see details, reviews, and reserve a slot.
          </p>
        </div>

        {/* Search & Filters */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            marginBottom: '40px',
            backgroundColor: 'var(--oxford-blue-1)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--space-cadet)'
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '500px', width: '100%', margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: '16px', color: 'var(--cadet-blue-creyola)' }}>
              <Search size={20} />
            </span>
            <input 
              type="text" 
              placeholder="Search services (e.g. Engine, Rotor)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                backgroundColor: 'var(--oxford-blue-3)',
                border: '1px solid var(--space-cadet)',
                borderRadius: '8px',
                color: 'var(--white)',
                fontSize: '1.5rem',
                outline: 'none',
                fontFamily: 'var(--ff-mulish)',
              }}
            />
          </div>

          {/* Category tabs */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              flexWrap: 'wrap',
              borderBlockStart: '1px solid var(--space-cadet)',
              paddingTop: '20px'
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '50px',
                    fontFamily: 'var(--ff-chakra-petch)',
                    fontSize: '1.4rem',
                    fontWeight: 'var(--fw-600)',
                    backgroundColor: isActive ? 'var(--international-orange-engineering)' : 'var(--oxford-blue-3)',
                    color: isActive ? 'var(--white)' : 'var(--cadet-blue-creyola)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--international-orange-engineering)' : 'var(--space-cadet)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--white)';
                      e.currentTarget.style.borderColor = 'var(--white)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--cadet-blue-creyola)';
                      e.currentTarget.style.borderColor = 'var(--space-cadet)';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBlock: '80px' }}>
            <div className="spinner"></div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', marginBlock: '80px', color: 'var(--cadet-blue-creyola)' }}>
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--ff-chakra-petch)' }}>No services match your filters.</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              style={{ 
                marginTop: '15px', 
                color: 'var(--white)', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--ff-chakra-petch)',
                fontSize: '1.4rem'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '30px' 
            }}
          >
            {services.map((service) => (
              <div key={service._id}>
                <ServiceCard 
                  id={service._id}
                  name={service.name}
                  description={service.description}
                  price={service.price}
                  duration={service.duration}
                  category={service.category}
                  image={service.image}
                />
              </div>
            ))}
          </div>
        )}

      </div>

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
    </section>
  );
}
