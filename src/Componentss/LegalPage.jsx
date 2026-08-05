import { useState } from 'react';

const LegalPages = () => {
  const [activeTab, setActiveTab] = useState('contact');

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      {/* 📑 டேப் பட்டன்கள் */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('contact')} 
          style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', borderBottom: activeTab === 'contact' ? '3px solid #1e3a8a' : 'none', color: activeTab === 'contact' ? '#1e3a8a' : '#4a5568' }}
        >
          Contact Us
        </button>
        <button 
          onClick={() => setActiveTab('terms')} 
          style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', borderBottom: activeTab === 'terms' ? '3px solid #1e3a8a' : 'none', color: activeTab === 'terms' ? '#1e3a8a' : '#4a5568' }}
        >
          Terms & Conditions
        </button>
        <button 
          onClick={() => setActiveTab('refund')} 
          style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', borderBottom: activeTab === 'refund' ? '3px solid #1e3a8a' : 'none', color: activeTab === 'refund' ? '#1e3a8a' : '#4a5568' }}
        >
          Refund Policy
        </button>
      </div>

      {/* 📞 1. CONTACT US SECTION */}
      {activeTab === 'contact' && (
        <div>
          <h2 style={{ color: '#1e3a8a' }}>Contact Us (தொடர்பு கொள்ள)</h2>
          <hr />
          <p>உங்களுக்கு ஏதேனும் சந்தேகங்கள் அல்லது தொழில்நுட்ப உதவிகள் தேவைப்பட்டால் எங்களை தாராளமாக தொடர்பு கொள்ளலாம்.</p>
          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px', lineHeight: '1.8' }}>
            <p><strong>Business Name:</strong> Vaagai Tuition</p>
            <p><strong>Proprietor:</strong> Anand S</p>
            <p><strong>Address:</strong> 1/49, Dhathanayaickenpalayam, Tamil Nadu, India.</p>
            <p><strong>Email:</strong> abcdanand970@gmail.com</p>
            <p><strong>Phone:</strong> +91 9944069357</p>
          </div>
        </div>
      )}

      {/* 📄 2. TERMS & CONDITIONS SECTION */}
      {activeTab === 'terms' && (
        <div>
          <h2 style={{ color: '#1e3a8a' }}>Terms & Conditions (விதிமுறைகள்)</h2>
          <hr />
          <div style={{ lineHeight: '1.8', color: '#2d3748' }}>
            <p>✍️ <strong>Vaagai Tuition</strong> தளம் வழங்கும் ஆன்லைன் தேர்வுகள் மற்றும் PDF மெட்டீரியல்கள் அனைத்தும் மாணவர்களின் கல்விப் பயன்பாட்டிற்கு மட்டுமே வழங்கப்படுகிறது.</p>
            <p>✍️ இந்தத் தளத்தில் உள்ள வினாடி வினாக்கள் மற்றும் மெட்டீரியல்களை அனுமதியின்றி வணிக ரீதியாக நகலெடுக்கவோ அல்லது மறுவிற்பனை செய்யவோ கண்டிப்பாகக் கூடாது.</p>
            <p>✍️ கட்டணச் சேவைகளைப் பயன்படுத்தும்போது மாணவர்கள் தங்களின் சரியான விபரங்களை மட்டுமே வழங்க வேண்டும்.</p>
          </div>
        </div>
      )}

      {/* 💰 3. REFUND POLICY SECTION */}
      {activeTab === 'refund' && (
        <div>
          <h2 style={{ color: '#1e3a8a' }}>Refund & Cancellation Policy (பணம் திரும்பப் பெறுதல்)</h2>
          <hr />
          <div style={{ lineHeight: '1.8', color: '#2d3748' }}>
            <p>❌ <strong>டிஜிட்டல் மெட்டீரியல்ஸ் கொள்கை:</strong> நாம் வழங்குவது ஆன்லைன் தேர்வுகள் மற்றும் டவுன்லோட் செய்யக்கூடிய டிஜிட்டல் PDF மெட்டீரியல்கள் என்பதால், ஒருமுறை பணம் செலுத்திவிட்டால் எந்த சூழ்நிலையிலும் அதைத் திரும்பப் பெற (Refund) அல்லது ரத்து செய்ய (Cancel) முடியாது.</p>
            <p>🛠️ <strong>தொழில்நுட்பக் கோளாறு (Technical Issue):</strong> ஒருவேளை உங்கள் வங்கிக் கணக்கில் இருந்து பணம் கழிக்கப்பட்டு, வெப்சைட்டில் மெட்டீரியல் அன்லாக் ஆகவில்லை என்றால், கவலைப்பட வேண்டாம் தலைவா! 48 மணி நேரத்திற்குள் <strong>abcdanand970@gmail.com</strong> என்ற மின்னஞ்சலுக்கு உங்கள் பேமெண்ட் ஐடியுடன் (Payment ID) மெசேஜ் அனுப்பினால், உடனடியாக சரிபார்க்கப்பட்டு மெட்டீரியல் அன்லாக் செய்து தரப்படும்.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalPages;