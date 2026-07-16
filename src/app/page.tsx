'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats numbers animation values
  const [stats, setStats] = useState({
    customers: 0,
    tools: 0,
    experience: 0,
    rate: 0,
  });

  useEffect(() => {
    // Fetch top services
    async function fetchServices() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          // Take the first 4 services for homepage showcase
          setServices(data.services.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();

    // Stats counter animation simulation
    const interval = setInterval(() => {
      setStats((prev) => {
        const nextCustomers = prev.customers < 8000 ? prev.customers + 400 : 8000;
        const nextTools = prev.tools < 22 ? prev.tools + 1 : 22;
        const nextExperience = prev.experience < 50 ? prev.experience + 2 : 50;
        const nextRate = prev.rate < 99 ? prev.rate + 3 : 99;
        
        if (
          nextCustomers === 8000 && 
          nextTools === 22 && 
          nextExperience === 50 && 
          nextRate === 99
        ) {
          clearInterval(interval);
        }
        
        return {
          customers: nextCustomers,
          tools: nextTools,
          experience: nextExperience,
          rate: nextRate,
        };
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            "name": "GearSync Premium Auto Maintenance & Repair Services",
            "image": "http://localhost:3000/assets/images/logo.png",
            "description": "Expert diagnostics and repairs by certified mechanics to keep your vehicle running smoothly.",
            "url": "http://localhost:3000",
            "telephone": "+91 98253 49583",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "21 King Street",
              "addressLocality": "Melbourne",
              "addressCountry": "AU"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "08:00",
                "closes": "18:00"
              }
            ],
            "priceRange": "$$"
          })
        }}
      />
      <article>
        
        {/* HERO SECTION */}
        <section 
          className="hero has-bg-image" 
          aria-label="home" 
          style={{ backgroundImage: "url('/assets/images/hero-bg.jpg')" }}
        >
          <div className="container">
        
            <div className="hero-content">
              <p className="section-subtitle :dark" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>
                Expert Engineers & Skilled Mechanics
              </p>
              <h1 className="h1 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>
                Reliable Auto Maintenance & Repair Services
              </h1>
              <p className="section-text">
                Our team of experienced professionals is dedicated to keeping your vehicle in peak condition with top-quality repair and maintenance services.
              </p>
              <Link href="/services" className="btn">
                <span className="span">Explore Our Services</span>
                <span className="material-symbols-rounded">arrow_forward</span>
              </Link>
            </div>
        
            <figure className="hero-banner" style={{ display: 'block' }}>
              <img 
                src="/assets/images/hero-banner.png" 
                width="1228" 
                height="789" 
                alt="Red sports car in service" 
                className="move-anim" 
              />
            </figure>
        
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section 
          className="section service has-bg-image" 
          aria-labelledby="service-label" 
          style={{ backgroundImage: "url('/assets/images/service-bg.jpg')" }}
        >
          <div className="container" style={{ textAlign: 'center' }}>

            <p className="section-subtitle :light" id="service-label" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>
              Our Services
            </p>
            <h2 className="h2 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', marginBlockEnd: '50px' }}>
              High-Quality Auto Repair & Maintenance
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBlock: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <ul className="service-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBlockEnd: '50px' }}>
                
                {/* Dynamically render services */}
                {services.map((service, index) => {
                  // Render the red car banner in the middle of a grid row for large screens
                  if (index === 2) {
                    return (
                      <React.Fragment key="hybrid-row">
                        <li className="service-banner" style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src="/assets/images/services-5.png" 
                            width="646" 
                            height="380" 
                            loading="lazy" 
                            alt="Red Car in Service" 
                            className="move-anim" 
                          />
                        </li>
                        <li key={service._id} style={{ textAlign: 'left' }}>
                          <ServiceCard 
                            id={service._id}
                            name={service.name}
                            description={service.description}
                            price={service.price}
                            duration={service.duration}
                            category={service.category}
                            image={service.image}
                          />
                        </li>
                      </React.Fragment>
                    );
                  }
                  return (
                    <li key={service._id} style={{ textAlign: 'left' }}>
                      <ServiceCard 
                        id={service._id}
                        name={service.name}
                        description={service.description}
                        price={service.price}
                        duration={service.duration}
                        category={service.category}
                        image={service.image}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/services" className="btn">
                <span className="span">View All Services</span>
                <span className="material-symbols-rounded">arrow_forward</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section className="section about has-before" aria-labelledby="about-label" id="about">
          <div className="container">

            <figure className="about-banner">
              <img 
                src="/assets/images/about-banner.png" 
                width="540" 
                height="540" 
                loading="lazy"
                alt="Auto repair tools and equipment" 
                className="w-100" 
              />
            </figure>

            <div className="about-content">

              <p className="section-subtitle :dark" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>About Us</p>
              <h2 className="h2 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)', marginBlockEnd: '20px' }}>
                Committed to Quality & Customer Satisfaction
              </h2>

              <p className="section-text" style={{ marginBlockEnd: '20px' }}>
                At GearSync, we take pride in delivering top-tier auto repair and maintenance services. With a team of experienced mechanics, cutting-edge tools, and a passion for excellence, we ensure your vehicle receives the best care possible.
              </p>

              <p className="section-text" style={{ marginBlockEnd: '30px' }}>
                Our commitment to quality, efficiency, and customer satisfaction has earned us a reputation for reliability and trustworthiness in the automotive industry.
              </p>

              <ul className="about-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <li className="about-item">
                  <p><strong className="display-1 strong" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>{stats.customers >= 8000 ? '8K+' : stats.customers}</strong> Satisfied Customers</p>
                </li>
                <li className="about-item">
                  <p><strong className="display-1 strong" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>{stats.tools}+</strong> Advanced Tools & Equipment</p>
                </li>
                <li className="about-item">
                  <p><strong className="display-1 strong" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>{stats.experience}+</strong> Years of Industry Experience</p>
                </li>
                <li className="about-item">
                  <p><strong className="display-1 strong" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>{stats.rate}%</strong> Project Success Rate</p>
                </li>
              </ul>

            </div>

          </div>
        </section>

        {/* WORK SECTION */}
        <section className="section work" aria-labelledby="work-label" id="work">
          <div className="container">

            <p className="section-subtitle :light" id="work-label" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Our Work</p>
            <h2 className="h2 section-title" style={{ fontFamily: 'var(--ff-chakra-petch)', color: 'var(--white)', marginBlockEnd: '40px' }}>
              Recent Projects We've Completed
            </h2>

            <ul className="has-scrollbar" style={{ display: 'flex', gap: '30px', overflowX: 'auto', paddingBlockEnd: '20px' }}>

              <li className="scrollbar-item" style={{ minWidth: '320px', flex: '1 0 33%' }}>
                <div className="work-card">
                  <figure className="card-banner img-holder" style={{ '--width': 350, '--height': 406 } as React.CSSProperties}>
                    <img 
                      src="/assets/images/work-1.jpg" 
                      width="350" 
                      height="406" 
                      loading="lazy" 
                      alt="Engine Repair Service"
                      className="img-cover" 
                    />
                  </figure>
                  <div className="card-content">
                    <p className="card-subtitle" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Auto Repair</p>
                    <h3 className="h3 card-title" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Engine Overhaul & Repair</h3>
                    <Link href="/book" className="card-btn">
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </li>

              <li className="scrollbar-item" style={{ minWidth: '320px', flex: '1 0 33%' }}>
                <div className="work-card">
                  <figure className="card-banner img-holder" style={{ '--width': 350, '--height': 406 } as React.CSSProperties}>
                    <img 
                      src="/assets/images/work-2.jpg" 
                      width="350" 
                      height="406" 
                      loading="lazy" 
                      alt="Car Tire Replacement"
                      className="img-cover" 
                    />
                  </figure>
                  <div className="card-content">
                    <p className="card-subtitle" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Auto Repair</p>
                    <h3 className="h3 card-title" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Tire Replacement & Balancing</h3>
                    <Link href="/book" className="card-btn">
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </li>

              <li className="scrollbar-item" style={{ minWidth: '320px', flex: '1 0 33%' }}>
                <div className="work-card">
                  <figure className="card-banner img-holder" style={{ '--width': 350, '--height': 406 } as React.CSSProperties}>
                    <img 
                      src="/assets/images/work-3.jpg" 
                      width="350" 
                      height="406" 
                      loading="lazy" 
                      alt="Battery Replacement"
                      className="img-cover" 
                    />
                  </figure>
                  <div className="card-content">
                    <p className="card-subtitle" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Auto Repair</p>
                    <h3 className="h3 card-title" style={{ fontFamily: 'var(--ff-chakra-petch)' }}>Battery Replacement & Maintenance</h3>
                    <Link href="/book" className="card-btn">
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </li>

            </ul>

          </div>
        </section>

      </article>

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

        .scrollbar-item {
          scroll-snap-align: start;
        }
      `}</style>
    </>
  );
}
