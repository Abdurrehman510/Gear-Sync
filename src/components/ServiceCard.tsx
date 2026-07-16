'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, DollarSign } from 'lucide-react';

export interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string;
}

export default function ServiceCard({
  id,
  name,
  description,
  price,
  duration,
  category,
  image,
}: ServiceCardProps) {
  return (
    <div className="service-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <figure className="card-icon" style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src={image || '/assets/images/services-1.png'} 
          width="110" 
          height="110" 
          loading="lazy" 
          alt={name} 
          style={{ objectFit: 'contain' }}
        />
      </figure>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span 
          style={{ 
            fontSize: '1.1rem', 
            textTransform: 'uppercase', 
            fontWeight: 'var(--fw-700)', 
            color: 'var(--international-orange-engineering)',
            letterSpacing: '1px',
            backgroundColor: 'rgba(197, 24, 0, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--ff-chakra-petch)'
          }}
        >
          {category}
        </span>
      </div>

      <h3 className="h3 card-title" style={{ marginBottom: '12px' }}>
        <Link href={`/services/${id}`} style={{ display: 'inline', color: 'inherit' }}>
          {name}
        </Link>
      </h3>

      <p className="card-text" style={{ fontSize: '1.4rem', color: 'var(--sonic-silver)', flex: 1, marginBottom: '20px', lineHeight: '1.6' }}>
        {description.length > 120 ? `${description.slice(0, 117)}...` : description}
      </p>

      {/* Stats row */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '15px', 
          borderTop: '1px solid var(--light-gray)',
          marginBlockEnd: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--white)' }}>
          <Clock size={16} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
          <span style={{ fontSize: '1.3rem', fontFamily: 'var(--ff-chakra-petch)' }}>{duration} mins</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--white)' }}>
          <DollarSign size={16} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>{price}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Link 
          href={`/services/${id}`} 
          className="btn-link" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '1.4rem', 
            fontWeight: 'var(--fw-600)',
            textTransform: 'uppercase',
            color: 'var(--white)',
            fontFamily: 'var(--ff-chakra-petch)',
            marginBlockEnd: 0
          }}
        >
          <span>Reviews & Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
