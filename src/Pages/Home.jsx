import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css';
import logoImg from '../assets/logoImg.jpeg';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 📸 ஸ்லைடர் இமேஜஸ் (Fallback Default Data)
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

  // Notifications & Materials States
  const [notifications, setNotifications] = useState([
    { id: 1, text: "🔥 TNPSC Group 4 & Model Tests Announced!", link: "/free-quiz" },
    { id: 2, text: "🆕 Mixed Subject Online Mock Tests Live!", link: "/free-quiz" },
    { id: 3, text: "📢 Daily Current Affairs & Tamil Practice Started!", link: "/free-quiz" }
  ]);

  const [studyMaterials, setStudyMaterials] = useState([
    { id: 1, text: "📕 Tamil Grammar Notes & Model Question Sets [Vaagai Special]", link: "/premium" },
    { id: 2, text: "📘 General Knowledge - Important Articles & Science", link: "/free-quiz" },
    { id: 3, text: "📙 Aptitude & Mental Ability - Shortcut Methods", link: "/free-quiz" }
  ]);

  // 🌐 Fetch Live Slides from Backend (Safe Filter Applied)
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
      .catch(err => console.log("Using default fallback slides."));
  }, []);

  // Auto Slide Timer (4 Seconds)
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const examCategories = [
    { id: 'tamil', title: '📖 பொதுத் தமிழ் (Tamil)', desc: 'இலக்கியம், இலக்கணம் மற்றும் உரைநடை சார்ந்த முக்கிய வினா வங்கி.', link: '/free-quiz', color: '#1e3a8a' },
    { id: 'maths', title: '🧮 கணிதம் (Maths & Aptitude)', desc: 'வேகமாக கணக்கிடும் குறுக்கு வழிகளுடன் கூடிய பயிற்சித் தேர்வுகள்.', link: '/free-quiz', color: '#0284c7' },
    { id: 'science', title: '🔬 அறிவியல் (Science)', desc: 'இயற்பியல், வேதியியல் மற்றும் உயிரியல் முக்கிய மாதிரி வினாக்கள்.', link: '/free-quiz', color: '#059669' },
    { id: 'social', title: '🏛️ சமூக அறிவியல் (Social)', desc: 'வரலாறு, புவியியல் மற்றும் இந்திய அரசியலமைப்பு வினாத்தாள்கள்.', link: '/free-quiz', color: '#dc2626' }
  ];

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
            <button className="hero-btn-primary" onClick={() => navigate('/free-quiz')}>🚀 Start Free Quiz</button>
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
                  <li key={note.id} onClick={() => navigate(note.link)}>
                    {note.text} <span className="new-tag">New</span>
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

    </div>
  );
}

export default Home;
