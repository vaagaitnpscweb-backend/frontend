import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function PcQuiz() {
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedPdfIds, setPurchasedPdfIds] = useState([]);
  const [uploadedAnswers, setUploadedAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('free');
  const navigate = useNavigate();

  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    fetch(`${API_BASE}/api/paid-pdfs/client/PC`)
      .then(res => res.json())
      .then(data => { 
        if (data.success) setPdfList(data.pdfs || []); 
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

  const handlePayment = async (pdfId, title, price) => {
    if (!user) {
      alert("🔐 Please log in first to attempt the test!");
      return;
    }

    const confirmPay = window.confirm(`🏆 Vaagai Tuition - PC Test\n\nProceed to pay ₹${price} via Razorpay to unlock this test?`);
    if (!confirmPay) return;

    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(price || 5) })
      });
      const orderData = await res.json();

      if (!orderData.success || !orderData.orderId) {
        alert("❌ Unable to create payment order!");
        return;
      }

      const options = {
        key: "rzp_test_TCtg24wJm0gqRH",
        amount: orderData.amount,
        currency: "INR",
        name: "Vaagai Tuition",
        description: `Purchase: ${title}`,
        order_id: orderData.orderId,
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
        theme: { color: "#d97706" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Payment failed due to a network error.");
    }
  };

  const handleAnswerUpload = (e, pdfId) => {
    if (e.target.files[0]) {
      alert(`✅ Answer sheet uploaded successfully!`);
      setUploadedAnswers(prev => ({ ...prev, [pdfId]: true }));
    }
  };

  const freePdfs = pdfList.filter(pdf => pdf.isFree === true || pdf.isFree === 'true' || Number(pdf.price) === 0);
  const paidPdfs = pdfList.filter(pdf => !(pdf.isFree === true || pdf.isFree === 'true' || Number(pdf.price) === 0));
  const currentDisplayList = activeTab === 'free' ? freePdfs : paidPdfs;

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>🔄 Loading PC Tests...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: '#d97706', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>🛡️ PC இரண்டாம் நிலை காவலர் தேர்வுப் பெட்டகம்</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>காவலர் தேர்வுகளுக்கான மாதிரித் தேர்வுகள்</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('free')}
          style={{
            padding: '12px 24px', borderRadius: '30px', border: '2px solid #16a34a',
            background: activeTab === 'free' ? '#16a34a' : '#ffffff',
            color: activeTab === 'free' ? '#ffffff' : '#16a34a',
            fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
          }}
        >
          🎉 இலவச மாதிரித் தேர்வுகள் ({freePdfs.length})
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          style={{
            padding: '12px 24px', borderRadius: '30px', border: '2px solid #d97706',
            background: activeTab === 'paid' ? '#d97706' : '#ffffff',
            color: activeTab === 'paid' ? '#ffffff' : '#d97706',
            fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
          }}
        >
          💳 கட்டணத் தேர்வுகள் / Paid Tests ({paidPdfs.length})
        </button>
      </div>

      {currentDisplayList.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
          👋 {activeTab === 'free' ? 'இலவசத் தேர்வுகள் எதுவும் இல்லை.' : 'கட்டணத் தேர்வுகள் எதுவும் இல்லை.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#d97706', color: '#ffffff' }}>
                <th style={{ padding: '14px', border: '1px solid #b45309', textAlign: 'center' }}>வரிசை எண்</th>
                <th style={{ padding: '14px 20px', border: '1px solid #b45309' }}>பொருள் விவரங்கள் (Material Title)</th>
                <th style={{ padding: '14px', border: '1px solid #b45309', textAlign: 'center' }}>வகை (Price)</th>
                <th style={{ padding: '14px 20px', border: '1px solid #b45309', textAlign: 'center' }}>PDF இணைப்பு (Action)</th>
              </tr>
            </thead>
            <tbody>
              {currentDisplayList.map((pdf, index) => {
                const isFree = pdf.isFree === true || pdf.isFree === 'true' || Number(pdf.price) === 0;
                const isPurchased = isFree || purchasedPdfIds.includes(Number(pdf.id));

                return (
                  <tr key={pdf.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                    <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', fontWeight: '600' }}>{pdf.title}</td>
                    <td style={{ padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ background: isFree ? '#dcfce7' : '#fef9c3', color: isFree ? '#15803d' : '#854d0e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {isFree ? '🎉 FREE' : `₹ ${pdf.price || 5}`}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      {!isPurchased ? (
                        <button onClick={() => handlePayment(pdf.id, pdf.title, pdf.price || 5)} style={{ background: '#22c55e', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                          💳 Pay ₹{pdf.price || 5} to Unlock
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <button onClick={() => handleOpenPdf(pdf.questionPdfLink, pdf.title)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                            பதிவிறக்கம் (Question PDF)
                          </button>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            <label style={{ display: 'block' }}>Upload Answer Sheet:</label>
                            <input type="file" onChange={(e) => handleAnswerUpload(e, pdf.id)} style={{ fontSize: '11px', width: '170px' }} />
                          </div>
                          {uploadedAnswers[pdf.id] && (
                            <button onClick={() => handleOpenPdf(pdf.answerPdfLink, `${pdf.title} - Answer Key`)} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
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

export default PcQuiz;
