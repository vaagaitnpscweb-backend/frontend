import React, { useState, useEffect } from 'react';
import '../Styles/Splash.css';
import logoImg from '../assets/logoImg.jpeg';

function Splash({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2 வினாடிகள் (2000ms) கழித்து ஸ்பிளாஷ் ஸ்கிரீன் மறையும்
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // லோடிங் உண்மையாக இருந்தால் ஸ்பிளாஷ் ஸ்கிரீன் காட்டும்
  if (loading) {
    return (
      <div className="splash-screen-container">
        <div className="splash-logo-wrapper">
          <img src={logoImg} alt="Vaagai Logo" className="splash-logo-img" />
          <h1 className="splash-title">வாகை</h1>
          <p className="splash-subtitle">வெற்றிப் படிக்கட்டு...</p>
        </div>
        <div className="splash-spinner"></div>
      </div>
    );
  }

  // லோடிங் முடிந்ததும் மெயின் ஆப் (Navbar, Home) தெரியும்
  return <>{children}</>;
}

export default Splash;