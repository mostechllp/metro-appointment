import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img
            src="/assets/images/logo/logo.webp"
            alt="Metro Starcare Logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="nav-logo-text">
            <span className="brand">Metro Starcare</span>
            <span className="sub">Metro Medical Group</span>
          </div>
        </Link>

        <div className="nav-emergency">
          <a href="tel:+971528415113" className="emergency-badge">
            <span className="pulse"></span>
            <span>+971 52 841 5113</span>
          </a>
        </div>
      </div>
    </nav>
  );
}