import React, { useState, useEffect } from 'react';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MyPurchases() {
  const [purchasedPdfs, setPurchasedPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // 📄 PDF-ஐ புதிய விண்டோவில் திறக்கும் ஃபங்ஷன்
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>🔄 உங்கள் கொள்முதல்களை ஏற்றுகிறது...</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}>
        <h2>🔐 லாகின் தேவை</h2>
        <p>நீங்கள் வாங்கிய PDF பாடக் குறிப்புகளைப் பார்க்க முதலில் லாகின் செய்யவும்.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* 🎯 ஹெடர் பேனர் */}
      <div style={{ background: '#002b49', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>👤 எனது கொள்முதல் (My Purchases)</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>நீங்கள் வாங்கிய அனைத்து வினாத்தாள்கள் மற்றும் பாடக் குறிப்புகள்</p>
      </div>

      {purchasedPdfs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <h3>📭 நீங்கள் இன்னும் எந்த PDF பாடக் குறிப்புகளையும் வாங்கவில்லை.</h3>
          <p>தேர்வுப் பிரிவுகளுக்குச் சென்று உங்களுக்குத் தேவையான மாதிரித் தேர்வுகளை அன்லாக் செய்யுங்கள்!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#002b49', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', border: '1px solid #00385f', width: '60px', textAlign: 'center' }}>வரிசை எண்</th>
                <th style={{ padding: '14px 20px', border: '1px solid #00385f' }}>பாடக் குறிப்பு தலைப்பு</th>
                <th style={{ padding: '14px 16px', border: '1px solid #00385f', textAlign: 'center' }}>செலுத்திய தொகை</th>
                <th style={{ padding: '14px 20px', border: '1px solid #00385f', textAlign: 'center' }}>அக்சஸ் / டவுன்லோடு</th>
              </tr>
            </thead>
            <tbody>
              {purchasedPdfs.map((item, index) => (
                <tr key={item._id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600' }}>
                    {item.bookTitle || item.title || 'Exam PDF Pack'}
                  </td>
                  <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                    ₹ {item.price || 0}
                  </td>
                  <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      {item.questionPdfLink && (
                        <button
                          onClick={() => handleOpenPdf(item.questionPdfLink, item.bookTitle)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                        >
                          📄 Qn PDF
                        </button>
                      )}
                      {item.answerPdfLink && (
                        <button
                          onClick={() => handleOpenPdf(item.answerPdfLink, `${item.bookTitle} - Answer Key`)}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
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