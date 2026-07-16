'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Clock, DollarSign, ArrowLeft, MessageSquare, ShieldCheck, User } from 'lucide-react';
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

interface ReviewItem {
  _id: string;
  customer: {
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<ServiceItem | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Service Details and Reviews
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        // 1. Fetch Service details
        const serviceRes = await fetch(`/api/services/${id}`);
        if (serviceRes.ok) {
          const serviceData = await serviceRes.json();
          setService(serviceData.service);
        } else {
          setToastMsg({ message: 'Service not found.', type: 'error' });
        }

        // 2. Fetch Reviews
        await loadReviews();

        // 3. Check login status
        const authRes = await fetch('/api/auth/me');
        setIsLoggedIn(authRes.ok);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviewsRes = await fetch(`/api/reviews?serviceId=${id}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews);
        setStats(reviewsData.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || comment.length < 5) {
      setToastMsg({ message: 'Comment must be at least 5 characters long.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: id, rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg({ message: data.message || 'Review posted successfully!', type: 'success' });
        setComment('');
        setRating(5);
        await loadReviews(); // Reload list
      } else {
        setToastMsg({ message: data.message || 'Failed to submit review.', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ message: 'Connection issue while submitting review.', type: 'error' });
    } finally {
      setSubmitting(false);
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

  if (!service) {
    return (
      <div style={{ textAlign: 'center', paddingBlock: '80px', backgroundColor: 'var(--oxford-blue-3)', minHeight: 'calc(100vh - 143px)' }}>
        <h2 style={{ color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontSize: '2.4rem' }}>Service not found</h2>
        <Link href="/services" style={{ color: 'var(--pastel-pink)', textDecoration: 'underline', marginTop: '15px', display: 'inline-block' }}>
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": service.name,
            "description": service.description,
            "provider": {
              "@type": "AutoRepair",
              "name": "GearSync"
            },
            "offers": {
              "@type": "Offer",
              "price": service.price,
              "priceCurrency": "USD"
            },
            "hoursAvailable": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "08:00",
                "closes": "18:00"
              }
            ]
          })
        }}
      />
      <section style={{ backgroundColor: 'var(--oxford-blue-3)', minHeight: 'calc(100vh - 143px)', paddingBlock: '40px' }}>
        <div className="container">
        
        {/* Back Link */}
        <Link 
          href="/services" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--cadet-blue-creyola)', 
            marginBottom: '30px',
            fontSize: '1.5rem',
            fontFamily: 'var(--ff-chakra-petch)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cadet-blue-creyola)')}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>

        {/* Content Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }} className="details-grid">
          
          {/* LEFT: Service Details & Booking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div 
              style={{
                backgroundColor: 'var(--oxford-blue-1)',
                border: '1px solid var(--space-cadet)',
                borderRadius: '16px',
                padding: '40px 30px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              <span 
                style={{ 
                  fontSize: '1.2rem', 
                  textTransform: 'uppercase', 
                  fontWeight: 'var(--fw-700)', 
                  color: 'var(--international-orange-engineering)',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(197, 24, 0, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontFamily: 'var(--ff-chakra-petch)',
                  display: 'inline-block',
                  marginBottom: '20px'
                }}
              >
                {service.category}
              </span>

              <h1 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '3.6rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px' }}>
                {service.name}
              </h1>

              <p style={{ fontSize: '1.6rem', color: 'var(--cadet-blue-creyola)', lineHeight: '1.8', marginBlockEnd: '30px' }}>
                {service.description}
              </p>

              {/* Price & Duration Grid */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '20px', 
                  backgroundColor: 'var(--oxford-blue-3)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--space-cadet)',
                  marginBlockEnd: '30px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: 'var(--international-orange-engineering)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase' }}>Duration</p>
                    <p style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>{service.duration} mins</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: 'var(--international-orange-engineering)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--cadet-blue-creyola)', textTransform: 'uppercase' }}>Service Cost</p>
                    <p style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>${service.price}</p>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <Link 
                href={`/book?serviceId=${service._id}`} 
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  height: '52px',
                  fontSize: '1.6rem'
                }}
              >
                <span className="span">Schedule Service Appointment</span>
                <span className="material-symbols-rounded">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Reviews Aggregator & Submissions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Reviews Summary Stats */}
            <div 
              style={{
                backgroundColor: 'var(--oxford-blue-1)',
                border: '1px solid var(--space-cadet)',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h2 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '2.2rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={22} className="text-orange" style={{ color: 'var(--international-orange-engineering)' }} />
                <span>Customer Reviews</span>
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBlockEnd: '10px' }}>
                <span style={{ fontSize: '4.8rem', color: 'var(--white)', fontWeight: 'var(--fw-700)', fontFamily: 'var(--ff-chakra-petch)' }}>
                  {stats.averageRating}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '2px', marginBlockEnd: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={18} 
                        fill={star <= Math.round(stats.averageRating) ? '#f59e0b' : 'none'}
                        color={star <= Math.round(stats.averageRating) ? '#f59e0b' : 'var(--space-cadet)'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                    Based on {stats.totalReviews} verified ratings
                  </span>
                </div>
              </div>
            </div>

            {/* Submit a Review Form */}
            <div 
              style={{
                backgroundColor: 'var(--oxford-blue-1)',
                border: '1px solid var(--space-cadet)',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span>Write a Verified Review</span>
              </h3>

              {!isLoggedIn ? (
                <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>
                  Please <Link href="/login" style={{ color: 'var(--white)', textDecoration: 'underline' }}>Login</Link> to write a review. Only customers who have completed this service are verified to review.
                </p>
              ) : (
                <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  {/* Rating Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem', color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-600)' }}>Rating:</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{ color: star <= rating ? '#f59e0b' : 'var(--cadet-blue-creyola)', cursor: 'pointer', transition: 'transform 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <Star size={22} fill={star <= rating ? '#f59e0b' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <textarea
                      placeholder="Share your experience with this service..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--ff-chakra-petch)'
                    }}
                  >
                    {submitting ? 'Posting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews list scroll panel */}
            <div 
              style={{
                backgroundColor: 'var(--oxford-blue-1)',
                border: '1px solid var(--space-cadet)',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                flex: 1
              }}
            >
              <h3 style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', fontSize: '1.8rem', fontWeight: 'var(--fw-700)', marginBlockEnd: '20px' }}>
                All Feedback Comments
              </h3>

              {reviewsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '30px' }}>
                  <div className="inner-spinner"></div>
                </div>
              ) : reviews.length === 0 ? (
                <p style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)', textAlign: 'center', paddingBlock: '30px' }}>
                  No reviews yet for this service. Be the first to try it and leave feedback!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  {reviews.map((rev) => (
                    <div 
                      key={rev._id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--oxford-blue-3)',
                        borderRadius: '10px',
                        border: '1px solid var(--space-cadet)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--white)' }}>
                          <div style={{ padding: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <User size={14} />
                          </div>
                          <span style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-600)' }}>{rev.customer.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={12} 
                              fill={star <= rev.rating ? '#f59e0b' : 'none'}
                              color={star <= rev.rating ? '#f59e0b' : 'var(--space-cadet)'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '1.35rem', color: 'var(--cadet-blue-creyola)', lineHeight: '1.6' }}>
                        {rev.comment}
                      </p>
                      <div style={{ textAlign: 'right', marginTop: '6px' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--sonic-silver)' }}>
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

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
        .details-grid {
          grid-template-columns: 1.2fr 1fr;
        }
        @media (max-width: 991px) {
          .details-grid {
            grid-template-columns: 1fr !important;
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
    </>
  );
}
