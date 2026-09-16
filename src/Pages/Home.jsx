import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css';
import logoImg from '../assets/logoImg.jpeg';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      title: "Corruption Free Society",
      desc: "Honest effort & dedication - Realize your government job dream with Vaagai Tuition!"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1548810930-e66865234a95?auto=format&fit=crop&w=1200&q=80",
      title: "Save Water, Save Life",
      desc: "Harvest rainwater and elevate underground water levels for a sustainable future."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
      title: "Plant Trees, Protect Nature",
      desc: "Plant a sapling today to preserve green environment for future generations."
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "TNPSC Group 4 & Model Tests Announced!", description: "Model tests are live now.", pdfLink: "", targetUrl: "/mocktest" },
    { id: 2, title: "Mixed Subject Online Mock Tests Live!", description: "Practice daily tests.", pdfLink: "", targetUrl: "/mocktest" }
  ]);

  const [studyMaterials, setStudyMaterials] = useState([
    { id: 1, text: "📕 Tamil Grammar Notes & Model Question Sets [Vaagai Special]", link: "/premium" },
    { id: 2, text: "📘 General Knowledge - Important Articles & Science", link: "/mocktest" },
    { id: 3, text: "📙 Aptitude & Mental Ability - Shortcut Methods", link: "/mocktest" }
  ]);

  // Master Admin Live App Notifications State for Scrolling Ticker
  const [masterNotifications, setMasterNotifications] = useState([
    "📢 Welcome to Vaagai Tuition Center! New CBT Mock Exams are live now.",
    "🚀 Attend daily tests and boost your exam preparation points!"
  ]);

  useEffect(() => {
    fetch(`${API_BASE}/api/home/slides`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.slides.length > 0) {
          const validSlides = data.slides.filter(s => s.image && s.image.trim() !== '');
          if (validSlides.length > 0) {
            setSlides(validSlides);
          }
        }
      })
      .catch(() => console.log("Using default fallback slides."));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/notifications/public`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => console.log("Using default fallback notifications."));
  }, []);

  // Fetch Master Admin App Notifications for bottom ticker
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/app-notifications`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setMasterNotifications(data.notifications.map(n => n.message || n.text || n));
        }
      })
      .catch(() => console.log("Using default fallback master ticker."));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const examCategories = [
    { id: 'tamil', title: '📖 பொதுத் தமிழ் (Tamil)', desc: 'இலக்கியம், இலக்கணம் மற்றும் உரைநடை சார்ந்த முக்கிய வினா வங்கி.', link: '/mocktest', color: '#1e3a8a' },
    { id: 'maths', title: '🧮 கணிதம் (Maths & Aptitude)', desc: 'வேகமாக கணக்கிடும் குறுக்கு வழிகளுடன் கூடிய பயிற்சித் தேர்வுகள்.', link: '/mocktest', color: '#0284c7' },
    { id: 'science', title: '🔬 அறிவியல் (Science)', desc: 'இயற்பியல், வேதியியல் மற்றும் உயிரியல் முக்கிய மாதிரி வினாக்கள்.', link: '/mocktest', color: '#059669' },
    { id: 'social', title: '🏛️ சமூக அறிவியல் (Social)', desc: 'வரலாறு, புவியியல் மற்றும் இந்திய அரசியலமைப்பு வினாத்தாள்கள்.', link: '/mocktest', color: '#dc2626' }
  ];

  const handleOpenPdf = (driveUrl) => {
    if (!driveUrl || driveUrl.trim() === '') return;
    let finalUrl = driveUrl.trim();
    if (finalUrl.includes('drive.google.com')) {
      const match = finalUrl.match(/\/file\/d\/([^/]+)/) || finalUrl.match(/\/d\/([^/]+)/) || finalUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="home-page-container">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-brand-block">
            <img src={logoImg} alt="Vaagai Logo" className="hero-logo-animated" />
            <div className="hero-text-block">
              <h1>வாகை டியூஷன் ஆன்லைன்</h1>
              <p className="hero-subtitle">வெற்றிப் படிக்கட்டு! அரசுப் பணியே நமது இலக்கு!</p>
            </div>
          </div>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => navigate('/mocktest')}>🚀 Start Mock Test</button>
            <button className="hero-btn-secondary" onClick={() => navigate('/premium')}>💎 Premium Test Packs</button>
          </div>
        </div>
      </section>

      {/* 2. IMAGE SLIDER SECTION */}
      {slides.length > 0 && (
        <section className="image-slider-section">
          <div className="slider-wrapper">
            {slides.map((slide, index) => (
              <div 
                key={slide.id || index} 
                className={`slide-item ${index === currentSlide ? 'slide-active' : ''}`}
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${slide.image})` }}
              >
                <div className="slide-text-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.desc}</p>
                </div>
              </div>
            ))}
            <div className="slider-dots">
              {slides.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${index === currentSlide ? 'dot-active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                ></span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. UPDATES & STUDY MATERIALS SECTION */}
      <section className="updates-dashboard-section">
        <div className="updates-container">
          
          <div className="update-box notification-box">
            <div className="box-header notification-header">
              <h3>🔔 Exam Notifications</h3>
            </div>
            <div className="box-content">
              <ul>
                {notifications.map((note) => (
                  <li key={note.id || note._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(note.targetUrl || '/mocktest')}>
                    <div>
                      <b>{note.title}</b>
                      {note.description && <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>{note.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {note.pdfLink && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenPdf(note.pdfLink); }} 
                          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          📄 PDF
                        </button>
                      )}
                      <span className="new-tag">New</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="update-box material-box">
            <div className="box-header material-header">
              <h3>📚 Study Materials & Notes</h3>
            </div>
            <div className="box-content scroll-wrapper">
              <div className="auto-scroll-container">
                {[...studyMaterials, ...studyMaterials].map((mat, index) => (
                  <div key={index} className="scroll-item" onClick={() => navigate(mat.link)}>
                    📌 {mat.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXAM CATEGORIES CARDS */}
      <section className="categories-section">
        <h2 className="section-title">🎯 Topic-wise Practice Categories</h2>
        <div className="categories-grid">
          {examCategories.map((exam) => (
            <div 
              key={exam.id} 
              className="exam-card"
              style={{ borderTop: `5px solid ${exam.color}` }}
              onClick={() => navigate(exam.link)}
            >
              <h3>{exam.title}</h3>
              <p>{exam.desc}</p>
              <span className="exam-card-link" style={{ color: exam.color }}>Start Practice &rarr;</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MASTER ADMIN NOTIFICATION TICKER BOX (Bottom Scrolling Ticker) */}
      <section className="master-notification-ticker-section">
        <div className="ticker-card">
          <div className="ticker-badge">📢 Master Alert</div>
          <div className="ticker-text-wrapper">
            <div className="ticker-sliding-content">
              {masterNotifications.map((msg, idx) => (
                <span key={idx} className="ticker-message-item">⭐ {msg} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
