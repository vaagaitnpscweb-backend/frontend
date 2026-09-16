import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css';
import logoImg from '../assets/logoImg.jpeg';

function Navbar({ setShowLogin, user, setUser }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [searchText, setSearchText] = useState('');

  // Dropdown States
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

  const navRef = useRef(null);
  const navigate = useNavigate(); 

  // வெளியேய கிளிக் செய்தால் டிராப்-டவுன் மூடப்படும்
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setSchoolOpen(false);
        setExamOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // 🔍 Search Submit Handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/search-pdfs?query=${encodeURIComponent(searchText.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  // ❌ Clear Search Handler
  const handleClearSearch = () => {
    setSearchText('');
  };

  return (
    <nav className="google-navbar" ref={navRef}>
      <div className="nav-top-row">
        
        {/* ☰ மொபைல் மெனு பட்டன் */}
        <button 
          className="mobile-menu-toggle-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* லோகோ, பிராண்ட் பெயர் மற்றும் சர்ச் பாக்ஸ் (Center aligned) */}
        <div className="nav-logo-search-group">
          <Link to="/" onClick={() => setActiveTab('home')} className="brand-logo-link">
            <img src={logoImg} alt="Vaagai Logo" className="round-logo" />
            <span className="brand-title">Vaagai Tuition Center</span>
          </Link>

          {/* 🔍 Search Input Box with Search & Cancel Buttons */}
          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <div className="nav-search-input-wrapper">
              <span className="search-icon-prefix">🔍</span>
              <input
                type="text"
                placeholder="PDF-களைத் தேடுங்கள்..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="nav-search-input"
              />
              {searchText && (
                <button 
                  type="button" 
                  className="nav-search-cancel-btn" 
                  onClick={handleClearSearch}
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="nav-search-submit-btn">
              Search
            </button>
          </form>
        </div>

        {/* லாகின் / அவுட் பகுதி */}
        <div className="nav-profile-actions desktop-only-actions">
          {user ? (
            <div className="user-profile-box">
              <span className="user-name-badge">👤 {user.name || user.username || "மாணவர்"}</span>
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </div>

      {/* மெனு லிஸ்ட் */}
      <div className={`nav-bottom-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        <div className="mobile-menu-header">
          <div className="mobile-logo-brand-group">
            <img src={logoImg} alt="Logo" className="mobile-menu-logo" />
            <span className="mobile-brand-title">Vaagai Tuition Center</span>
          </div>

          {/* மொபைல் வியூவிற்கான சர்ச் பாக்ஸ் */}
          <form className="mobile-nav-search-form" onSubmit={handleSearchSubmit}>
            <div className="nav-search-input-wrapper">
              <span className="search-icon-prefix">🔍</span>
              <input
                type="text"
                placeholder="PDF-களைத் தேடுங்கள்..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="nav-search-input"
              />
              {searchText && (
                <button type="button" className="nav-search-cancel-btn" onClick={handleClearSearch}>✕</button>
              )}
            </div>
            <button type="submit" className="nav-search-submit-btn">Search</button>
          </form>

          <div className="mobile-menu-user-section" style={{ width: '100%', marginTop: '10px' }}>
            {user ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>
                  👤 {user.name || user.username || "மாணவர்"}
                </div>
                <button onClick={handleLogout} className="mobile-logout-btn">🚪 Logout</button>
              </div>
            ) : (
              <button className="mobile-menu-login-btn" onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }}>
                🔑 Login / Register
              </button>
            )}
          </div>
        </div>

        <ul className="tabs-list">
          <li className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}>
            <Link to="/" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>🏠 Home</Link>
          </li>
          
          <li className={`tab-item ${activeTab === 'current-affairs' ? 'active' : ''}`}>
            <Link to="/current-affairs" onClick={() => { setActiveTab('current-affairs'); setIsMobileMenuOpen(false); }}>📰 Daily Current Affairs</Link>
          </li>

          <li className={`tab-item ${activeTab === 'mocktest' ? 'active' : ''}`}>
            <Link to="/mocktest" onClick={() => { setActiveTab('mocktest'); setIsMobileMenuOpen(false); }}>📚 Mock Test </Link>
          </li>

          <li className={`tab-item ${activeTab === 'premium' ? 'active' : ''}`}>
            <Link to="/premium" onClick={() => { setActiveTab('premium'); setIsMobileMenuOpen(false); }}>💎 Premium Question Packs</Link>
          </li>

          {/* School Materials Dropdown */}
          <li className="tab-item dropdown-container">
            <div 
              className="dropdown-btn-title"
              onClick={(e) => {
                e.stopPropagation();
                setSchoolOpen(!schoolOpen);
                setExamOpen(false);
              }}
            >
              📚 School Materials <span className="arrow">{schoolOpen ? '▴' : '▾'}</span>
            </div>
            {schoolOpen && (
              <div className="dropdown-menu-box">
                <Link to="/tenth" onClick={() => { setSchoolOpen(false); setIsMobileMenuOpen(false); }}>📖 10th Standard PDF</Link>
                <Link to="/twelfth" onClick={() => { setSchoolOpen(false); setIsMobileMenuOpen(false); }}>📖 12th Standard PDF</Link>
              </div>
            )}
          </li>

          {/* Competitive Exams Dropdown */}
          <li className="tab-item dropdown-container">
            <div 
              className="dropdown-btn-title"
              onClick={(e) => {
                e.stopPropagation();
                setExamOpen(!examOpen);
                setSchoolOpen(false);
              }}
            >
              🎯 Competitive Exams <span className="arrow">{examOpen ? '▴' : '▾'}</span>
            </div>
            {examOpen && (
              <div className="dropdown-menu-box">
                <Link to="/tnpsc" onClick={() => { setExamOpen(false); setIsMobileMenuOpen(false); }}>📝 TNPSC Questions</Link>
                <Link to="/rrb" onClick={() => { setExamOpen(false); setIsMobileMenuOpen(false); }}>📝 RRB Questions</Link>
                <Link to="/si" onClick={() => { setExamOpen(false); setIsMobileMenuOpen(false); }}>📝 SI Questions</Link>
                <Link to="/pc" onClick={() => { setExamOpen(false); setIsMobileMenuOpen(false); }}>📝 PC Questions</Link>
              </div>
            )}
          </li>

          <li className={`tab-item ${activeTab === 'purchases' ? 'active' : ''}`}>
            <Link to="/purchases" onClick={(e) => {
              if (!user) { e.preventDefault(); setShowLogin(true); setIsMobileMenuOpen(false); return; }
              setActiveTab('purchases');
              setIsMobileMenuOpen(false);
            }}>👤 My Purchases</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
