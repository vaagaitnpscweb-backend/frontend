import React, { useState, useEffect } from 'react';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MyPurchases() {
  const [purchasedPdfs, setPurchasedPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    if (user && user.email) {
      // 🌐 பயனர் வாங்கிய அனைத்து PDFகளையும் எடுக்கும் API
      fetch(`${API_BASE}/api/user/purchased-pdfs?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPurchasedPdfs(data.purchasedPdfs || data.orders || []);
          }
        })
        .catch(err => console.error("Error fetching purchases:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 📄 PDF-ஐ புதிய விண்டோவில் திறக்கும் ஃபங்ஷன் (Secure & Responsive)
  const handleOpenPdf = (pdfBase64OrUrl, title) => {
    if (!pdfBase64OrUrl) {
      alert("❌ PDF file is not available!");
      return;
    }

    try {
      if (pdfBase64OrUrl.startsWith('data:application/pdf')) {
        const pdfWindow = window.open("");
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${pdfBase64OrUrl}' style='border:none;'></iframe>`
        );
        pdfWindow.document.title = title || "Vaagai Tuition Material";
      } else {
        window.open(pdfBase64OrUrl, '_blank');
      }
    } catch (err) {
      alert("⚠️ Unable to open PDF. Please allow popups in your browser.");
    }
  };

  // தேடல் (Search) ஃபில்டர்
  const filteredPurchases = purchasedPdfs.filter(item => {
    const title = item.bookTitle || item.title || 'Exam PDF Pack';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '18px', color: '#0f766e', fontWeight: 'bold' }}>
        🔄 உங்கள் கொள்முதல்களை ஏற்றுகிறது... தயவுசெய்து காத்திருக்கவும்.
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '40px', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔐</div>
        <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>லாகின் தேவை (Login Required)</h2>
        <p style={{ color: '#7f1d1d', fontSize: '14px', lineHeight: '1.6' }}>நீங்கள் வாங்கிய PDF பாடக் குறிப்புகள் மற்றும் மாதிரித் தேர்வுகளைப் பார்க்க முதலில் உங்களது கணக்கில் லாகின் செய்யவும்.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* 🎯 நவீன ஹெடர் பேனர் */}
      <div style={{ background: 'linear-gradient(135deg, #0f766e, #115e59)', color: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 10px 25px rgba(15, 118, 110, 0.2)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>👤 எனது கொள்முதல் (My Purchases)</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>நீங்கள் வெற்றிகரமாக வாங்கிய அனைத்து வினாத்தாள்கள் மற்றும் பாடக் குறிப்புகள்</p>
      </div>

      {/* 🔍 தேடல் மற்றும் எண்ணிக்கை பட்டி */}
      {purchasedPdfs.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
            மொத்த கொள்முதல்: <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '4px 10px', borderRadius: '20px' }}>{purchasedPdfs.length} Items</span>
          </div>
          <div style={{ flex: '1', maxWidth: '300px' }}>
            <input 
              type="text" 
              placeholder="🔍 பாடத் தலைப்பைத் தேട..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: '#fff' }}
            />
          </div>
        </div>
      )}

      {purchasedPdfs.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
          <h3 style={{ color: '#334155', marginBottom: '8px' }}>நீங்கள் இன்னும் எந்த PDF பாடக் குறிப்புகளையும் வாங்கவில்லை.</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>தேர்வுப் பிரிவுகளுக்குச் சென்று உங்களுக்குத் தேவையான மாதிரித் தேர்வுகளை அன்லாக் செய்யுங்கள்!</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          <p>⚠️ நீங்கள் தேடிய பெயரில் எந்தப் பாடக் குறிப்பும் கிடைக்கவில்லை.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f766e', color: '#ffffff', fontSize: '14px' }}>
                <th style={{ padding: '16px', width: '70px', textAlign: 'center' }}>வ.எண்</th>
                <th style={{ padding: '16px 20px' }}>பாடக் குறிப்பு தலைப்பு</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>செலுத்திய தொகை</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>அக்சஸ் / டவுன்லோடு</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((item, index) => (
                <tr key={item._id || index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#1e293b', fontWeight: '600', fontSize: '14.5px' }}>
                    {item.bookTitle || item.title || 'Exam PDF Pack'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#16a34a', fontSize: '15px' }}>
                    ₹ {item.price || 0}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      {item.questionPdfLink && (
                        <button
                          onClick={() => handleOpenPdf(item.questionPdfLink, item.bookTitle)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(37, 99, 235, 0.2)', transition: 'transform 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          📄 Qn PDF
                        </button>
                      )}
                      {item.answerPdfLink && (
                        <button
                          onClick={() => handleOpenPdf(item.answerPdfLink, `${item.bookTitle} - Answer Key`)}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(22, 163, 74, 0.2)', transition: 'transform 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          🔑 Ans PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default MyPurchases;
