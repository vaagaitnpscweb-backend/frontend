import { useState } from 'react';
import '../Styles/Login.css';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function Login({ showLogin, setShowLogin, setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState(''); 

  if (!showLogin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
    
    const payload = isSignUp 
      ? { name, email, contact, password } 
      : { email, password };

    try {
      // 🔌 Render நேரலை சர்வர் ஏபிஐ கால்
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        
        // லாகின் ஆன யூசர் விபரங்களை பிரௌசர் மெமரியிலும், ஆப் ஸ்டேட்டிலும் சேமிக்கிறோம்
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 🌟 App.jsx-இன் ஸ்டேட்டை அப்டேட் செய்கிறோம்
        setUser(data.user); 
        
        // ஃபீல்டுகளை கிளியர் செய்து மாடலை மூடுகிறோம்
        setName(''); 
        setEmail(''); 
        setContact(''); 
        setPassword('');
        setShowLogin(false);
      } else {
        alert(data.message || "ஏதோ தவறு நடந்துள்ளது!");
      }
    } catch (error) {
      console.error("🎯 Auth Error Detail:", error);
      alert("சர்வருடன் இணைக்க முடியவில்லை! இணைய இணைப்பை சரிபார்க்கவும்.");
    }
  };

  return (
    <div className="login-modal-overlay" onClick={() => setShowLogin(false)}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setShowLogin(false)}>✕</button>
        
        <div className="login-form-header">
          <h2>{isSignUp ? "🆕 புதிய கணக்கு உருவாக்குக" : "🔐 STUDENT LOGIN"}</h2>
          <p>{isSignUp ? "வாகை தளத்தில் இணைந்து தேர்வுக்கு தயாராகுங்கள்" : "உங்கள் கணக்கில் உள்நுழையவும்"}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>பெயர் (Name)</label>
                <input 
                  type="text" 
                  placeholder="உங்கள் பெயரை உள்ளிடவும்" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>தொடர்பு எண் (Contact Number)</label>
                <input 
                  type="text" 
                  placeholder="உங்களது போன் நம்பர்" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>மின்னஞ்சல் (Email)</label>
            <input 
              type="email" 
              placeholder="username@gmail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>கடவுச்சொல் (Password)</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="form-submit-btn">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="form-toggle-link">
          {isSignUp ? (
            <p>ஏற்கனவே கணக்கு உள்ளதா? <span onClick={() => { setIsSignUp(false); setPassword(''); }}>Login செய்யுங்க</span></p>
          ) : (
            <p>புதிய மாணவரா? <span onClick={() => { setIsSignUp(true); setPassword(''); }}>இங்கே கணக்கை உருவாக்குங்க</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;