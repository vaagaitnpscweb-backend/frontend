import React, { useState } from 'react'; // 👈 useState இம்போர்ட் சரிசெய்யப்பட்டது
import { useNavigate } from 'react-router-dom';
import '../Styles/AdminLogin.css'; // 👈 CSS இம்போர்ட் 
import logoImg from '../assets/logoImg.jpeg'; // 👈 வாகை லோகோ இம்போர்ட்

function AdminLogin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // 🚀 Render-ன் ஆன்லைன் Backend URL மாற்றப்பட்டுள்ளது
    fetch('https://vaagai-tuition-backend.onrender.com/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // அட்மின் தரவை LocalStorage-ல் சேமிக்கிறது (MasterAdmin பேஜ் ஓப்பன் ஆக இது மிக முக்கியம்)
          localStorage.setItem('user', JSON.stringify(data.user));
          alert('👑 Welcome Back to Vaagai Master Admin Board!');
          navigate('/masteradmin');
        } else {
          setErrorMsg(data.message || 'Invalid Username or Password!');
        }
      })
      .catch(err => {
        console.error(err);
        setErrorMsg('Server Connection Failed!');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        
        {/* 1. பச்சை நிற மேல் பகுதி */}
        <div className="admin-card-header">
          <h2>Welcome Back !</h2>
          <p>Sign in to continue.</p>

          {/* மையத்தில் வரும் வாகை லோகோ பாக்ஸ் */}
          <div className="admin-logo-badge">
            <img src={logoImg} alt="Vaagai Logo" />
          </div>
        </div>

        {/* 2. ஃபார்ம் பகுதி */}
        <div className="admin-card-body">
          {errorMsg && (
            <div className="admin-error-box">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="admin-form-group">
              <label>Username</label>
              <input
                type="text"
                className="admin-form-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <input
                type="password"
                className="admin-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="admin-checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button type="submit" className="admin-btn-login" disabled={loading}>
              {loading ? 'Verifying...' : 'Log In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
