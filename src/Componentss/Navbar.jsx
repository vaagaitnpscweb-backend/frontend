import { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import '../Styles/Navbar.css'; 
import logoImg from '../assets/logoImg.jpeg';

function Navbar({ setShowLogin, user, setUser }) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const navigate = useNavigate(); 

  const tabs = [
    { id: 'home', name: '🏠 Home', link: '/' },
    { id: 'current-affairs', name: '📰 Daily Current Affairs', link: '/current-affairs' },
    { id: 'free-quiz', name: '📚 Free Quiz', link: '/free-quiz', className: 'free-quiz-tab' },
    { id: 'premium', name: '💎 Premium Question Packs', link: '/premium', className: 'premium-tab' },
    { id: 'rrb', name: '📖 RRB Questions', link: '/rrb' },
    { id: 'tnpsc', name: '📖 TNPSC Questions', link: '/tnpsc' },
    { id: 'si', name: '📖 SI Questions', link: '/si' },
    { id: 'pc', name: '📖 PC Questions', link: '/pc' },
    { id: 'purchases', name: '👤 My Purchases', link: '/purchases', className: 'my-purchases-tab' }
  ];

  // 🔍 எக்ஸ்ட்ரா லாஜிக்: மாணவர்கள் Enter தட்டும்போது சர்ச் பக்கத்திற்கு அழைத்துச் செல்லும் ஃபங்ஷன்
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

  // ✕ பட்டனை அழுத்தும்போது சர்ச் வேல்யூவை கிளியர் செய்துவிட்டு ஹோம் பேஜுக்கு கொண்டு வரும்
  const handleClearSearch = () => {
    setSearchQuery(''); // 👈 பிழை சரிசெய்யப்பட்டது (setQuery-க்கு பதில் setSearchQuery)
    navigate('/');
    setActiveTab('home');
  };

  const handleTabClick = (tab, e) => {
    e.preventDefault(); 

    // பயனர் லாகின் செய்யவில்லை என்றால் My Purchases பார்க்க முடியாது
    if (tab.id === 'purchases' && !user) {
      setShowLogin(true); 
      setIsMobileMenuOpen(false);
      return; 
    }

    setActiveTab(tab.id);
    setIsMobileMenuOpen(false); 
    navigate(tab.link); 
  };

  // 🚪 Logout செய்யும் பொதுவான ஃபங்ஷன்
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="google-navbar">
      <div className="nav-top-row">
        
        {/* ☰ மொபைல் மெனு பட்டன் */}
        <button 
          className="mobile-menu-toggle-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* டெஸ்க்டாப் லோகோ */}
        <div className="nav-logo-section desktop-only-logo">
          <Link to="/" onClick={() => setActiveTab('home')}>
            <img src={logoImg} alt="Vaagai Logo" className="round-logo" />
          </Link>
        </div>

        {/* 🔍 நடுப்பகுதி: சர்ச் பாக்ஸ் */}
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
              <span className="clear-icon" onClick={handleClearSearch}>✕</span>
            )}
          </div>
        </div>

        {/* 💻 டெஸ்க்டாப் ஆக்சன்கள் */}
        <div className="nav-profile-actions desktop-only-actions">
          <div className="nav-cart">
            🛒 <span className="cart-badge">0</span>
          </div>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontWeight: '600', 
                color: '#ffffff', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                padding: '6px 12px', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                👤 {user.name || user.username || "மாணவர்"}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#d32f2f', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* மெனு லிஸ்ட் */}
      <div className={`nav-bottom-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* 📱 மொபைல் மெனு ஹெடர் */}
        <div className="mobile-menu-header">
          <img src={logoImg} alt="Vaagai Logo" className="mobile-menu-logo" />
          <div className="mobile-menu-user-section" style={{ width: '100%' }}>
            {user ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '5px' }}>
                  👤 {user.name || user.username || "மாணவர்"}
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <button className="mobile-menu-login-btn" onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }}>
                🔑 Login / Register
              </button>
            )}
          </div>
        </div>

        <ul className="tabs-list">
          {tabs.map((tab) => (
            <li 
              key={tab.id} 
              className={`tab-item ${tab.className || ''} ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Link to={tab.link} onClick={(e) => handleTabClick(tab, e)}>
                {tab.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;