import { useState } from 'react';
import '../Styles/Login.css';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function Login({ showLogin, setShowLogin, setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [loginInput, setLoginInput] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);

  if (!showLogin) return null;

  const handleClose = () => {
    setShowLogin(false);
    setIsSignUp(false);
    setIsForgotPassword(false);
    setLoginInput('');
    setName('');
    setEmail('');
    setContact('');
    setDistrict('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        // பாஸ்வேர்ட் ரீசெட் செய்ய (தேவைப்பட்டால்)
        alert("Password reset functionality.");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        // 🚀 நேரடி சைன் அப் (OTP இன்றி)
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, contact, district, password })
        });
        const data = await res.json();
        if (data.success) {
          alert("Account created successfully!");
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          handleClose();
        } else {
          alert(data.message || "Registration failed.");
        }
      } else {
        // 🚀 நேரடி லாகின்
        const res = await fetch(`${API_BASE}/api/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginInput, password })
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          handleClose();
        } else {
          alert(data.message || "Invalid credentials!");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert("Unable to connect to the server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="login-form-header">
          <div className="login-logo-badge">
            <span>🎓</span>
          </div>
          <h2>
            {isForgotPassword 
              ? "Password Recovery" 
              : isSignUp 
                ? "Create Student Account" 
                : "Student Sign In"}
          </h2>
          <p>
            {isForgotPassword 
              ? "Enter your email to reset password" 
              : isSignUp 
                ? "Fill in all your details to get started" 
                : "Access your dashboard securely"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="username@gmail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>District *</label>
                <select 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)} 
                  required
                >
                  <option value="">Select your district</option>
                  <option value="Dharmapuri">Dharmapuri</option>
                  <option value="Krishnagiri">Krishnagiri</option>
                  <option value="Salem">Salem</option>
                  <option value="Namakkal">Namakkal</option>
                  <option value="Erode">Erode</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                  <option value="Other">Other Districts</option>
                </select>
              </div>
            </>
          )}
          
          {!isSignUp && (
            <div className="form-group">
              <label>Email Address *</label>
              <input 
                type="text" 
                placeholder="Enter your email" 
                value={loginInput} 
                onChange={(e) => setLoginInput(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Register Now" : "Sign In"}
          </button>
        </form>

        {/* Toggle Links */}
        <div className="form-toggle-link">
          {isSignUp ? (
            <p>Already have an account? <span onClick={() => { setIsSignUp(false); setPassword(''); }}>Sign In</span></p>
          ) : (
            <p>New student? <span onClick={() => { setIsSignUp(true); setPassword(''); }}>Create an account</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
