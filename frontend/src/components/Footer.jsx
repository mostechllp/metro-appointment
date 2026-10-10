import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/assets/images/logo/logo.webp"
            alt="Metro Starcare Logo"
            style={{ height: 46, marginBottom: 12 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <p>
            Metro Starcare Medical Centre, under Metro Medical Group, is
            committed to providing world-class healthcare services with
            compassion, excellence, and personalised attention for every
            patient.
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/starcare.uae" className="footer-social" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
            <a href="https://www.facebook.com/share/15BroPchCk/" className="footer-social" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.linkedin.com/company/metro-starcare/posts/" className="footer-social" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
          </div>
        </div>


        <div>
          <h2>Contact</h2>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">📞</span>
              <span><a href="tel:+971528415113">+971 52 841 5113</a></span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <span><a href="mailto:info@metrostarcare.ae">info@metrostarcare.ae</a></span>
            </li>
            <li>
              <span className="contact-icon">📍</span>
              <span>Malabar Plaza, Rolla, Sharjah, UAE</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Metro Starcare. All rights reserved.</p>
      </div>
    </footer>
  );
}