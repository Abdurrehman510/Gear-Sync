'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, Clipboard, FileText, CheckCircle2 } from 'lucide-react';
import Toast from '@/components/Toast';
import confetti from 'canvas-confetti';

interface ServiceItem {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  image: string;
}

interface SlotItem {
  slot: string;
  available: boolean;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('serviceId');

  // App states
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Today's date string format YYYY-MM-DD for min date attribute
  const [minDate, setMinDate] = useState('');

  // 1. Session check and load services
  useEffect(() => {
    async function init() {
      // Set min date constraint
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setMinDate(`${yyyy}-${mm}-${dd}`);

      // Authenticate check
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        setToastMsg({ message: 'Authentication required. Redirecting to login...', type: 'error' });
        setTimeout(() => {
          router.push(`/login?redirect=/book${initialServiceId ? `?serviceId=${initialServiceId}` : ''}`);
        }, 1500);
        return;
      }

      // Fetch Services list
      try {
        const servicesRes = await fetch('/api/services');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.services);
          
          // Auto select if initial ID passed
          if (initialServiceId) {
            const found = servicesData.services.find((s: ServiceItem) => s._id === initialServiceId);
            if (found) setSelectedService(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    }
    init();
  }, [initialServiceId, router]);

  // 2. Fetch available slots when Service or Date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedService || !date) {
        setSlots([]);
        setSelectedSlot('');
        return;
      }

      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await fetch(`/api/appointments/slots?serviceId=${selectedService._id}&date=${date}`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots);
        }
      } catch (err) {
        console.error('Error fetching slots', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedService, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !selectedSlot) {
      setToastMsg({ message: 'Please select a service, date, and time slot.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService._id,
          date,
          timeSlot: selectedSlot,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingSuccess(true);
        // Confetti effect!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setToastMsg({ message: data.message || 'Booking reservation failed', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection error during reservation.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 143px)',
          backgroundColor: 'var(--oxford-blue-3)',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <div 
          style={{
            backgroundColor: 'var(--oxford-blue-1)',
            border: '1px solid var(--space-cadet)',
            borderRadius: '16px',
            padding: '50px 40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            animation: 'slideIn 0.4s ease-out'
          }}
        >
          <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <CheckCircle2 size={70} />
          </div>
          <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '3rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '15px' }}>
            Booking Confirmed!
          </h2>
          <p style={{ fontSize: '1.6rem', color: 'var(--cadet-blue-creyola)', lineHeight: '1.6', marginBlockEnd: '30px' }}>
            Your reservation for **{selectedService?.name}** on **{date}** at **{selectedSlot}** was successful. Redirecting to your dashboard...
          </p>
          <div className="bar-loader"></div>
        </div>
        <style jsx>{`
          .bar-loader {
            height: 4px;
            width: 100%;
            background-color: var(--space-cadet);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
          }
          .bar-loader::after {
            content: '';
            display: block;
            height: 100%;
            width: 50%;
            background-color: var(--international-orange-engineering);
            position: absolute;
            animation: loadingBar 1.5s infinite linear;
          }
          @keyframes loadingBar {
            0% { left: -50%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section style={{ backgroundColor: 'var(--oxford-blue-3)', minHeight: 'calc(100vh - 143px)', paddingBlock: '60px' }}>
      <div className="container">
        
        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <p className="section-subtitle :light" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Scheduler</p>
          <h1 className="h2 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', marginBlockEnd: '20px' }}>
            Book Service Appointment
          </h1>
          <p style={{ fontSize: '1.6rem', color: 'var(--cadet-blue-creyola)', maxWidth: '600px', margin: '0 auto' }}>
            Secure your timeslot in 3 simple steps. Our system updates availability instantly.
          </p>
        </div>

        {/* Multi-step form layout */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form 
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'var(--oxford-blue-1)',
              border: '1px solid var(--space-cadet)',
              borderRadius: '16px',
              padding: '30px 40px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}
          >
            
            {/* STEP 1: Select Service */}
            <div style={{ borderBlockEnd: '1px solid var(--space-cadet)', paddingBlockEnd: '25px' }}>
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'var(--international-orange-engineering)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>1</span>
                <span>Choose Auto Service</span>
              </h3>

              {loadingServices ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '20px' }}>
                  <div className="inner-spinner"></div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                  {services.map((s) => {
                    const isSelected = selectedService?._id === s._id;
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setSelectedService(s)}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--international-orange-engineering)' : 'var(--space-cadet)',
                          backgroundColor: isSelected ? 'rgba(197, 24, 0, 0.08)' : 'var(--oxford-blue-3)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'var(--fw-700)', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)' }}>
                          {s.name}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: 'var(--cadet-blue-creyola)', width: '100%' }}>
                          <span>{s.duration} mins</span>
                          <span style={{ fontWeight: 'var(--fw-700)', color: 'var(--white)' }}>${s.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 2: Choose Date */}
            <div style={{ borderBlockEnd: '1px solid var(--space-cadet)', paddingBlockEnd: '25px' }}>
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'var(--international-orange-engineering)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>2</span>
                <span>Select Calendar Date</span>
              </h3>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '300px' }}>
                <span style={{ position: 'absolute', left: '12px', color: 'var(--cadet-blue-creyola)', pointerEvents: 'none' }}>
                  <CalendarIcon size={18} />
                </span>
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    backgroundColor: 'var(--oxford-blue-3)',
                    border: '1px solid var(--space-cadet)',
                    borderRadius: '8px',
                    color: 'var(--white)',
                    fontSize: '1.5rem',
                    fontFamily: 'var(--ff-mulish)',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {/* STEP 3: Choose Time Slot */}
            <div style={{ borderBlockEnd: '1px solid var(--space-cadet)', paddingBlockEnd: '25px' }}>
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'var(--international-orange-engineering)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>3</span>
                <span>Available Slots</span>
              </h3>

              {!selectedService || !date ? (
                <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                  Please complete step 1 (choose service) and step 2 (select date) to query availability.
                </p>
              ) : loadingSlots ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '15px' }}>
                  <div className="inner-spinner"></div>
                </div>
              ) : slots.length === 0 ? (
                <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                  Loading timeslots...
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }} className="slots-grid">
                  {slots.map((item) => {
                    const isSelected = selectedSlot === item.slot;
                    const isAvailable = item.available;

                    return (
                      <button
                        key={item.slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(item.slot)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '8px',
                          fontFamily: 'var(--ff-chakra-petch)',
                          fontSize: '1.4rem',
                          fontWeight: 'var(--fw-600)',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          backgroundColor: isSelected 
                            ? 'var(--international-orange-engineering)' 
                            : isAvailable 
                              ? 'var(--oxford-blue-3)' 
                              : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected 
                            ? 'var(--white)' 
                            : isAvailable 
                              ? 'var(--white)' 
                              : 'var(--sonic-silver)',
                          border: '1px solid',
                          borderColor: isSelected 
                            ? 'var(--international-orange-engineering)' 
                            : isAvailable 
                              ? 'var(--space-cadet)' 
                              : 'rgba(255, 255, 255, 0.05)',
                          textDecoration: isAvailable ? 'none' : 'line-through',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 4: Notes */}
            <div>
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'var(--international-orange-engineering)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>4</span>
                <span>Vehicle Details & Notes (Optional)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  placeholder="Tell us about your vehicle model, year, and specific issues or concerns..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
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
                ></textarea>
                <div style={{ textAlign: 'right', fontSize: '1.15rem', color: 'var(--cadet-blue-creyola)' }}>
                  {notes.length}/500 characters
                </div>
              </div>
            </div>

            {/* Submit Reservation */}
            <button
              type="submit"
              disabled={submitting || !selectedService || !date || !selectedSlot}
              className="btn btn-primary"
              style={{
                marginTop: '15px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '52px',
                fontSize: '1.6rem',
                fontFamily: 'var(--ff-chakra-petch)'
              }}
            >
              {submitting ? (
                <div className="btn-spinner"></div>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span className="span">Confirm Service Reservation</span>
                </>
              )}
            </button>

          </form>
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
        .slots-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 767px) {
          .slots-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        .inner-spinner {
          border: 3px solid rgba(255, 255, 255, 0.1);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border-left-color: var(--international-orange-engineering);
          animation: spin 1s linear infinite;
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
    </section>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 143px)', backgroundColor: 'var(--oxford-blue-3)' }}>
        <div className="spinner"></div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
