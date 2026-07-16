'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" style={{ marginTop: 'auto' }}>
      <div className="footer-top section">
        <div className="container">

          {/* Brand & About */}
          <div className="footer-brand">
            <Link href="/" className="logo">
              <img src="/assets/images/logo.png" alt="GearSync - Home" style={{ display: 'block', height: '95px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            <p className="footer-text" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)', marginBlock: '20px 30px' }}>
              At GearSync, we provide top-quality auto repair and maintenance services, ensuring reliability and customer satisfaction with every job.
            </p>

            <ul className="social-list" style={{ display: 'flex', gap: '15px' }}>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/assets/images/facebook.svg" alt="Facebook" width="20" height="20" />
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/assets/images/instagram.svg" alt="Instagram" width="20" height="20" />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src="/assets/images/twitter.svg" alt="Twitter" width="20" height="20" />
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <ul className="footer-list">
            <li>
              <p className="h3" style={{ color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-700)', fontSize: '2rem', marginBottom: '20px' }}>
                Opening Hours
              </p>
            </li>
            <li style={{ marginBottom: '15px' }}>
              <p className="p" style={{ color: 'var(--white)', fontWeight: 'var(--fw-600)' }}>Monday – Saturday</p>
              <span className="span" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>08:00 AM – 06:00 PM</span>
            </li>
            <li>
              <p className="p" style={{ color: 'var(--white)', fontWeight: 'var(--fw-600)' }}>Sunday</p>
              <span className="span" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>Closed</span>
            </li>
          </ul>

          {/* Contact Info */}
          <ul className="footer-list">
            <li>
              <p className="h3" style={{ color: 'var(--white)', fontFamily: 'var(--ff-chakra-petch)', fontWeight: 'var(--fw-700)', fontSize: '2rem', marginBottom: '20px' }}>
                Contact Us
              </p>
            </li>
            <li style={{ marginBottom: '15px' }}>
              <a href="tel:+61398253495" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--international-orange-engineering)' }}>call</span>
                <span className="span" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>+61 3 9825 3495</span>
              </a>
            </li>
            <li style={{ marginBottom: '15px' }}>
              <a href="mailto:info@gearsync.com" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--international-orange-engineering)' }}>mail</span>
                <span className="span" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>info@gearsync.com</span>
              </a>
            </li>
            <li>
              <address className="footer-link address" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontStyle: 'normal' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--international-orange-engineering)' }}>location_on</span>
                <span className="span" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)' }}>21 King Street, Melbourne VIC 3000, Australia</span>
              </address>
            </li>
          </ul>

        </div>

        <img src="/assets/images/footer-shape-3.png" width="637" height="173" loading="lazy" alt="Decorative Shape" className="shape shape-3 move-anim" />

      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p className="copyright" style={{ fontSize: '1.4rem', color: 'var(--cadet-blue-creyola)', zIndex: 1 }}>
            &copy; {new Date().getFullYear()} GearSync. All Rights Reserved.
          </p>
          <img src="/assets/images/footer-shape-2.png" width="778" height="335" loading="lazy" alt="Decorative Shape" className="shape shape-2" />
          <img src="/assets/images/footer-shape-1.png" width="805" height="652" loading="lazy" alt="Red Car Illustration" className="shape shape-1 move-anim" />
        </div>
      </div>
    </footer>
  );
}
