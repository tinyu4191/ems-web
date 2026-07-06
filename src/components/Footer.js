import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Tectiiko Technology · EMS Platform</span>
    </footer>
  );
}

export default Footer;