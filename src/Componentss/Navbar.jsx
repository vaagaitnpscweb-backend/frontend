import { useState, useEffect, useRef } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import '../Styles/Navbar.css'; 
import logoImg from '../assets/logoImg.jpeg';

function Navbar({ setShowLogin, user, setUser }) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  // Dropdown States
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

  const navRef = useRef(null);

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

  const navigate = useNavigate(); 

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setActiveTab(''); 
        setIsMobileMenuOpen(false); 
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
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

        {/* லோகோ */}
        <div className="nav-logo-section desktop-only-logo">
          <Link to="/" onClick={() => setActiveTab('home')}>
            <img src={logoImg} alt="Vaagai Logo" className="round-logo" />
          </Link>
        </div>

        {/* சர்ச் பாக்ஸ் */}
        <div className="nav-search-container">
          <div className="google-search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="TNPSC, RRB, SI, PC தேர்வுகளைத் தேடுங்கள்..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit} 
            />
            {searchQuery && (
              <span className="clear-icon" onClick={() => setSearchQuery('')}>✕</span>
            )}
          </div>
        </div>

        {/* லாகின் / அவுட் பகுதி (கார்ட் நீக்கப்பட்டது) */}
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
          <img src={logoImg} alt="Logo" className="mobile-menu-logo" />
          <div className="mobile-menu-user-section" style={{ width: '100%' }}>
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

          <li className={`tab-item ${activeTab === 'free-quiz' ? 'active' : ''}`}>
            <Link to="/free-quiz" onClick={() => { setActiveTab('free-quiz'); setIsMobileMenuOpen(false); }}>📚 Free Quiz</Link>
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
