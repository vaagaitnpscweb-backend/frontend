
import { Link } from 'react-router-dom';
import '../Styles/Footer.css';
import logoImg from '../assets/logoImg.jpeg';

function Footer() {
  // வாட்ஸ்அப் மெசேஜ் லிங்க் செட்டப்
  const whatsappUrl = "https://wa.me/917806886449?text=Hi%20Vaagai%20Tuition,%20I%20have%20a%20query.";

  return (
    <footer className="vaagai-footer">
      <div className="footer-container">
        
        {/* பிரிவு 1: லோகோ மற்றும் அறிமுகம் */}
        <div className="footer-section about-section">
          <div className="footer-logo-title">
            <img src={logoImg} alt="Vaagai Logo" className="footer-logo" />
            <h2>வாகை டியூஷன்</h2>
          </div>
          <p className="footer-desc">
            TNPSC, RRB, SI, PC போன்ற போட்டித் தேர்வுகளுக்குத் தயாராகும் மாணவர்களுக்கான சிறந்த ஆன்லைன் தேர்வு மற்றும் வழிகாட்டி தளம். வெற்றிப் படிக்கட்டு!
          </p>
        </div>

        {/* பிரிவு 2: முக்கிய லிங்குகள் */}
        <div className="footer-section links-section">
          <h3>முக்கிய லிங்குகள்</h3>
          <ul>
            <li><Link to="/">🏠 முகப்பு (Home)</Link></li>
            <li><Link to="/current-affairs">📰 நடப்பு நிகழ்வுகள்</Link></li>
            <li><Link to="/free-quiz">📚 இலவச தேர்வுகள்</Link></li>
            <li><Link to="/premium">💎 பிரீமியம் பேக்குகள்</Link></li>
          </ul>
        </div>

        {/* பிரிவு 3: தேர்வுகள் */}
        <div className="footer-section exams-section">
          <h3>தேர்வுகள் (Exams)</h3>
          <ul>
            <li><Link to="/tnpsc">📖 TNPSC தேர்வுகள்</Link></li>
            <li><Link to="/rrb">📖 RRB ரயில்வே</Link></li>
            <li><Link to="/si">📖 SI தேர்வுகள்</Link></li>
            <li><Link to="/pc">📖 PC தேர்வுகள்</Link></li>
          </ul>
        </div>

        {/* பிரிவு 4: உங்கள் உண்மையான தொடர்பு விபரங்கள் 🌟 */}
        <div className="footer-section contact-section">
          <h3>தொடர்புக்கு</h3>
          <p>📧 vaagaitnpscweb@Gmail.com</p>
          <p>📞 +91 78068 86449</p>
          
          <div className="social-icons">
            {/* இன்ஸ்டாகிராம் லிங்க் */}
            <a 
              href="https://www.instagram.com/vaagai_tuition_online?igsh=ZjlxeXd4d3U5a2R6" 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon instagram"
            >
              📸 Instagram
            </a>

            {/* பேஸ்புக் லிங்க் */}
            <a 
              href="https://www.facebook.com/share/1BUe7snMD9/" 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon facebook"
            >
              🔵 Facebook
            </a>

            {/* வாட்ஸ்அப் லிங்க் */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon whatsapp"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* கீழ் காப்பிரைட் வரிசை */}
      <div className="footer-bottom">
        <p>&copy; 2026 வாகை டியூஷன். All Rights Reserved. Designed with ❤️ by Anand S.</p>
      </div>
    </footer>
  );
}

export default Footer;
