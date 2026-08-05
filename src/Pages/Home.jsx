import { useState, useEffect } from 'react';
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

  // Notifications & Materials States (English Default)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "🔥 TNPSC Group 4 Results & Counseling Dates Announced!", link: "/tnpsc" },
    { id: 2, text: "🆕 RRB NTPC New Vacancy Notification Released!", link: "/rrb" },
    { id: 3, text: "📢 TN Police SI Exam Online Application Started!", link: "/si" }
  ]);

  const [studyMaterials, setStudyMaterials] = useState([
    { id: 1, text: "📕 10th Standard Tamil Grammar Notes [Vaagai Special]", link: "/tnpsc" },
    { id: 2, text: "📘 General Knowledge - Important Articles of Indian Constitution", link: "/free-quiz" },
    { id: 3, text: "📙 Aptitude & Mental Ability - Simple & Compound Interest Tricks", link: "/rrb" }
  ]);

  // 🌐 Fetch Live Slides, Notifications, & Materials from Backend
  useEffect(() => {
    // 1. Fetch Slides from Backend
    fetch(`${API_BASE}/api/home/slides`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(err => console.log("Using default fallback slides."));

    // 2. Fetch Notifications
    fetch(`${API_BASE}/api/home/notifications`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.notifications.length > 0) {
          const mappedNotes = data.notifications.map(n => ({
            id: n.id,
            text: n.text,
            link: n.text.includes("RRB") ? "/rrb" : n.text.includes("SI") ? "/si" : "/tnpsc"
          }));
          setNotifications(mappedNotes);
        }
      })
      .catch(err => console.log("Using default notifications."));

    // 3. Fetch PDFs
    fetch(`${API_BASE}/api/home/pdfs`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.pdfs.length > 0) {
          const mappedPdfs = data.pdfs.map(p => ({
            id: p.id,
            text: `📄 ${p.title} [${p.size || 'PDF'}]`,
            link: "/premium"
          }));
          setStudyMaterials(mappedPdfs);
        }
      })
      .catch(err => console.log("Using default study materials."));
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
    { id: 'tnpsc', title: '📖 TNPSC Exams', desc: 'Dedicated question packs & study notes for Group 2, Group 4 & VAO.', link: '/tnpsc', color: '#1e3a8a' },
    { id: 'rrb', title: '🚂 RRB Railways', desc: 'Maths, Reasoning & GK practice sets for NTPC, Group D & ALP exams.', link: '/rrb', color: '#0284c7' },
    { id: 'si', title: '👮 SI Exams', desc: 'Special psychology & general science sections for Sub-Inspector exams.', link: '/si', color: '#059669' },
    { id: 'pc', title: '🎖️ PC Exams', desc: 'Mock tests and simplified revision guides for Police Constable exams.', link: '/pc', color: '#dc2626' }
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
        <h2 className="section-title">🎯 Exam Categories</h2>
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