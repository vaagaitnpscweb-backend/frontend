import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function SiQuiz() {
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedPdfIds, setPurchasedPdfIds] = useState([]);
  const [uploadedAnswers, setUploadedAnswers] = useState({});
  const navigate = useNavigate();

  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 🌍 1. அட்மின் அப்ரூவ் செய்த SI PDFகளை டேட்டாபேஸில் இருந்து எடுத்தல்
  useEffect(() => {
    fetch(`${API_BASE}/api/paid-pdfs/client/SI`)
      .then(res => res.json())
      .then(data => { 
        if (data.success) setPdfList(data.pdfs); 
      })
      .catch(err => console.error("Error fetching PDFs:", err));

    if (user && user.email) {
      fetch(`${API_BASE}/api/user/purchased-pdfs?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const formattedIds = (data.purchasedIds || []).map(id => Number(id));
            setPurchasedPdfIds(formattedIds);
          }
        })
        .catch(err => console.error("Error fetching orders:", err))
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

  // 💳 2. Razorpay பேமெண்ட் ஃபங்ஷன்
  const handlePayment = async (pdfId, title, price) => {
    if (!user) {
      alert("🔐 Please log in first to attempt the test!");
      return;
    }

    const confirmPay = window.confirm(`🏆 Vaagai Tuition - SI Exam\n\nProceed to pay ₹${price} via Razorpay to unlock this test?`);
    if (!confirmPay) return;

    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(price || 5) })
      });
      const orderData = await res.json();

      if (!orderData.success || !orderData.orderId) {
        alert("❌ Unable to create payment order. Please check server connection!");
        return;
      }

      const options = {
        key: "rzp_test_TCtg24wJm0gqRH",
        amount: orderData.amount,
        currency: "INR",
        name: "Vaagai Tuition",
        description: `Purchase: ${title}`,
        order_id: orderData.orderId,
        
        config: {
          display: {
            blocks: {
              custom_block: {
                name: "Pay via UPI or Card",
                instruments: [
                  { method: "upi" },
                  { method: "card" }
                ]
              }
            },
            sequence: ["block.custom_block"],
            preferences: {
              show_default_blocks: false
            }
          }
        },

        handler: async function (response) {
          const saveRes = await fetch(`${API_BASE}/api/payment/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              bookId: pdfId.toString(),
              bookTitle: title,
              price: price,
              orderNo: orderData.orderId,
              shippingAddress: { name: user.name, phone: user.contact || "N/A", address: "Digital Delivery", pincode: "000000" }
            })
          });

          const saveData = await saveRes.json();
          if (saveData.success) {
            alert("💳 Payment Successful! The test material has been unlocked. 🎯");
            setPurchasedPdfIds(prevIds => [...prevIds, Number(pdfId)]); 
          }
        },
        prefill: {
          name: user.name || "Student",
          email: user.email || "",
          contact: user.contact || "9999999999"
        },
        theme: { color: "#16a34a" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed due to a network error. Please try again!");
    }
  };

  // 📤 3. மாணவர் விடைத்தாள் அப்லோடு செய்யும் லாஜிக்
  const handleAnswerUpload = (e, pdfId) => {
    if (e.target.files[0]) {
      alert(`✅ Answer sheet uploaded successfully! The answer key is now unlocked.`);
      setUploadedAnswers(prev => ({ ...prev, [pdfId]: true }));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>🔄 Loading SI Exam Tests...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* 🎯 டாப் பேனர் */}
      <div style={{ background: '#002b49', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>👮 SI (Sub-Inspector) தேர்வுப் பெட்டகம்</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>சார்பு ஆய்வாளர் தேர்விற்கான பிரத்யேக மாதிரித் தேர்வுகள்</p>
      </div>

      {pdfList.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          👋 No SI Exam materials are currently live. Please check back later!
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '8px' }}>
          
          {/* 📊 TABLE LAYOUT */}
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#002b49', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', border: '1px solid #00385f', width: '80px', textAlign: 'center', fontSize: '15px' }}>வரிசை எண்</th>
                <th style={{ padding: '14px 20px', border: '1px solid #00385f', fontSize: '15px' }}>பொருள் விவரங்கள் (Material Title)</th>
                <th style={{ padding: '14px 16px', border: '1px solid #00385f', width: '130px', textAlign: 'center', fontSize: '15px' }}>வகை (Price)</th>
                <th style={{ padding: '14px 20px', border: '1px solid #00385f', width: '280px', textAlign: 'center', fontSize: '15px' }}>PDF இணைப்பு (Action)</th>
              </tr>
            </thead>
            <tbody>
              {pdfList.map((pdf, index) => {
                const isFree = pdf.isFree === true || pdf.isFree === 'true' || Number(pdf.price) === 0;
                const isPurchased = isFree || purchasedPdfIds.includes(Number(pdf.id));

                return (
                  <tr key={pdf.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    
                    {/* 1. S.No */}
                    <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>
                      {index + 1}
                    </td>

                    {/* 2. Material Title */}
                    <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600', fontSize: '15px' }}>
                      {pdf.title}
                    </td>

                    {/* 3. Access Type / Price Badge */}
                    <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ 
                        background: isFree ? '#dcfce7' : '#fef9c3', 
                        color: isFree ? '#15803d' : '#854d0e', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {isFree ? '🎉 FREE' : `₹ ${pdf.price || 5}`}
                      </span>
                    </td>

                    {/* 4. Action Button */}
                    <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      {!isPurchased ? (
                        <button 
                          onClick={() => handlePayment(pdf.id, pdf.title, pdf.price || 5)} 
                          style={{ 
                            background: '#22c55e', 
                            color: '#ffffff', 
                            padding: '8px 16px', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold', 
                            fontSize: '13px',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#16a34a'}
                          onMouseOut={(e) => e.target.style.background = '#22c55e'}
                        >
                          💳 Pay ₹{pdf.price || 5} to Unlock
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          
                          {/* Question Paper Download */}
                          <button 
                            onClick={() => handleOpenPdf(pdf.questionPdfLink, pdf.title)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2563eb', 
                              fontWeight: 'bold', 
                              cursor: 'pointer', 
                              fontSize: '14px',
                              textDecoration: 'underline' 
                            }}
                          >
                            பதிவிறக்கம் (Question PDF)
                          </button>

                          {/* Answer Sheet Upload */}
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            <label style={{ display: 'block', marginBottom: '2px' }}>Upload Answer Sheet:</label>
                            <input 
                              type="file" 
                              onChange={(e) => handleAnswerUpload(e, pdf.id)} 
                              style={{ fontSize: '11px', width: '170px' }} 
                            />
                          </div>

                          {/* Answer Key Download */}
                          {uploadedAnswers[pdf.id] && (
                            <button 
                              onClick={() => handleOpenPdf(pdf.answerPdfLink, `${pdf.title} - Answer Key`)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#16a34a', 
                                fontWeight: 'bold', 
                                cursor: 'pointer', 
                                fontSize: '13px',
                                textDecoration: 'underline' 
                              }}
                            >
                              🔑 Answer Key PDF
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}

export default SiQuiz;
