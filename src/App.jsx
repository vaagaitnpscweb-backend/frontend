import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { useState } from 'react';
import Navbar from './Componentss/Navbar.jsx';
import Login from './Componentss/Login.jsx';
import bglogoImg from './assets/logoImg.jpeg';

// மெயின் ஹோம் பக்கம்
import Home from './Pages/Home.jsx';

// இம்போர்ட் பாத்:
import CurrentAffairs from './Componentss/CurrentAffairs.jsx';
import FreeQuiz from './Componentss/FreeQuiz.jsx';
import PremiumPacks from './Componentss/PremiumPacks.jsx'; 
import Rrb from './Componentss/RrbQuiz.jsx';
import Tnpsc from './Componentss/TnpscQuiz.jsx'; 
import Si from './Componentss/SiQuiz.jsx';   
import Pc from './Componentss/PcQuiz.jsx';   
import MyPurchases from './Componentss/MyPurchases.jsx';
import Splash from './Componentss/Splash.jsx';
import Footer from './Componentss/Footer.jsx';
import LegalPage from './Componentss/LegalPage.jsx';

// 👑 மாஸ்டர் அட்மின் பக்கங்கள் மட்டும் வைக்கப்பட்டுள்ளன
import AdminLogin from './AdminPages/AdminLogin.jsx';
import MasterAdmin from './AdminPages/MasterAdmin.jsx';

// 🚀 Render Live Backend Base URL
export const API_BASE_URL = 'https://vaagai-tuition-backend.onrender.com';

// 🎯 அட்மின் பக்கங்களில் மட்டும் Navbar & Footer-ஐ மறைப்பதற்கான தனி கம்போனென்ட்
function AppContent({ user, setUser, showLogin, setShowLogin }) {
  const location = useLocation();

  // /masteradmin மற்றும் /adminlogin பக்கங்களில் Navbar மற்றும் Footer தேவையில்லை
  const hideNavbarAndFooter = location.pathname === '/masteradmin' || location.pathname === '/adminlogin';

  return (
    <div>
      {/* Navbar - அட்மின் பக்கங்களில் மறைக்கப்படும் */}
      {!hideNavbarAndFooter && <Navbar setShowLogin={setShowLogin} user={user} setUser={setUser} />}
      
      <Login 
        showLogin={showLogin} 
        setShowLogin={setShowLogin} 
        setUser={setUser} 
      />

      {/* வாட்டர்மார்க் லோகோ பின்னணி */}
      {!hideNavbarAndFooter && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            backgroundImage: `url(${bglogoImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            opacity: 0.06, 
            zIndex: -1,    
            pointerEvents: 'none' 
          }}
        />
      )}

      {/* ரௌட்ஸ் */}
      <Routes>
        {/* 🟢 சாதாரண மாணவர்கள் அணுகக்கூடிய பக்கங்கள் */}
        <Route path="/" element={<Home />} />
        <Route path="/current-affairs" element={<CurrentAffairs />} />
        <Route path="/free-quiz" element={<FreeQuiz />} />
        <Route path="/premium" element={<PremiumPacks />} />
        <Route path="/rrb" element={<Rrb />} />
        <Route path="/tnpsc" element={<Tnpsc />} />
        <Route path="/si" element={<Si />} />
        <Route path="/pc" element={<Pc />} />
        <Route path="/purchases" element={<MyPurchases />} />
        <Route path="/legalpage" element={<LegalPage />} />
        
        {/* 🔐 மாஸ்டர் அட்மின் லாகின் & மெயின் டேஷ்போர்டு பக்கங்கள் மட்டுமே அனுமதிக்கப்பட்டுள்ளது */}
        <Route path='/adminlogin' element={<AdminLogin />} />
        <Route path='/masteradmin' element={<MasterAdmin />} />

        {/* தவறான URL அடித்தால் ஹோம் பக்கத்திற்குத் திருப்ப */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Footer - அட்மின் பக்கங்களில் மறைக்கப்படும் */}
      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Splash>
      <Router>
        <AppContent 
          user={user} 
          setUser={setUser} 
          showLogin={showLogin} 
          setShowLogin={setShowLogin} 
        />
      </Router>
    </Splash>
  );
}

export default App;