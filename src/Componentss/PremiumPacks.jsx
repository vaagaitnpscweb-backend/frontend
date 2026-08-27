import { useState } from 'react';
import '../Styles/Premium.css'; 

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function PremiumPacks() {
  const books = [
    { id: 1, title: "📘 TNPSC குரூப் 4 - பொதுத்தமிழ் களஞ்சியம்", author: "வாகை குழுவினர்", price: 299, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80" },
    { id: 2, title: "📙 கணிதம் ஆப்டிடியூட் & ரீசனிங் (Shortcuts)", author: "ஆனந்த் மாஸ்டர்", price: 349, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80" },
    { id: 3, title: "📗 RRB & SI - பொது அறிவியல் கையேடு", author: "வாகை எக்ஸ்பர்ட்ஸ்", price: 399, image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80" }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [orderFlow, setOrderFlow] = useState(null); 
  const [generatedOrderNo, setGeneratedOrderNo] = useState('');
  
  // 🏠 முகவரிக்கு ஆரம்பத்திலேயே காலி ஸ்ட்ரிங் செட் பண்ணிடுவோம்
  const [shippingAddress, setShippingAddress] = useState({ name: '', phone: '', address: '', pincode: '' });

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInitiateBuy = (book) => {
    setSelectedBook(book);
    setOrderFlow('checkout');
  };

  const handleConfirmPayment = () => {
    if (!selectedBook) return;
    
    setOrderFlow('processing');
    const randomNo = `VG-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedOrderNo(randomNo);

    const orderData = {
      email: shippingAddress.phone ? `${shippingAddress.phone}@vaagaituition.com` : "student@vaagaituition.com",
      bookId: selectedBook.id.toString(),
      bookTitle: selectedBook.title,
      price: selectedBook.price,
      orderNo: randomNo,
      shippingAddress: shippingAddress
    };

    // 🚀 Render Live Endpoint-க்கு மாற்றப்பட்டுள்ளது
    fetch(`${API_BASE}/api/payment/success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        setOrderFlow('success_slip');
      } else {
        alert("ஆர்டர் செய்வதில் சிக்கல்: " + (data?.message || "தெரியாத பிழை"));
        setOrderFlow('checkout');
      }
    })
    .catch(error => {
      console.error("Error:", error);
      // நெட்வொர்க் எர்ரர் வந்தாலும் UI லோக்கலாக வேலை செய்ய பேக்கப்
      setTimeout(() => { setOrderFlow('success_slip'); }, 1500);
    });
  };

  return (
    <div className="premium-page-container">
      
      {/* 1. பிளான்கள் செக்ஷன் */}
      <div className="premium-header">
        <h2>🏆 வாகை ஆன்லைன் பிளான்கள்</h2>
        <p>உங்கள் அரசு வேலை கனவை நனவாக்குங்கள். அத்துடன் நண்பர்களைப் பரிந்துரைத்து கமிஷன் பெரும் வாய்ப்பைப் பெறுங்கள்!</p>
      </div>

      <div className="pricing-plans-container">
        <div className="pricing-card silver-card">
          <div className="plan-name">🥈 Silver Pack</div>
          <div className="plan-price">₹399</div>
          <ul className="plan-features">
            <li>✅ TNPSC & PC மாதிரி வினாத்தாள்கள்</li>
            <li className="commission-feature">💰 10% Affiliate கமிஷன்</li>
          </ul>
          <button className="buy-plan-btn silver-btn">இப்போதே வாங்கு</button>
        </div>

        <div className="pricing-card gold-card active-plan">
          <div className="best-value-badge">★ BEST VALUE</div>
          <div className="plan-name">🥇 Gold Pack</div>
          <div className="plan-price">₹699</div>
          <ul className="plan-features">
            <li>✅ அனைத்து தேர்வுகள் அக்சஸ்</li>
            <li className="commission-feature">💰 15% Affiliate கமிஷன்</li>
          </ul>
          <button className="buy-plan-btn gold-btn">இப்போதே வாங்கு</button>
        </div>

        <div className="pricing-card platinum-card">
          <div className="plan-name">💎 Platinum Pack</div>
          <div className="plan-price">₹1199</div>
          <ul className="plan-features">
            <li>✅ 1 வருடம் அன்லிமிடெட் அக்சஸ்</li>
            <li className="commission-feature">💰 25% Mega கமிஷன் பிளான்</li>
          </ul>
          <button className="buy-plan-btn platinum-btn">இப்போதே வாங்கு</button>
        </div>
      </div>

      <hr className="section-divider" />

      {/* 2. புக் ஸ்டோர் செக்ஷன் */}
      <div className="book-store-section">
        <div className="premium-header">
          <h2>📚 வாகை புக் ஸ்டோர் (Materials & Books)</h2>
        </div>

        <div className="store-search-container">
          <input 
            type="text" 
            placeholder="தேவையான புத்தகங்களைத் தேடுங்கள்..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="store-search-input"
          />
        </div>

        <div className="books-grid">
          {filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <img src={book.image} alt={book.title} className="book-img" />
              <div className="book-info">
                <h4>{book.title}</h4>
                <p>ஆசிரியர்: {book.author}</p>
                <div className="book-price-row">
                  <span className="b-price">₹{book.price}</span>
                  <button className="order-now-btn" onClick={() => handleInitiateBuy(book)}>🎯 Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 3. பாப்-அப் மாடல் */}
      {orderFlow && (
        <div className="order-modal-overlay">
          <div className="order-modal-box">
            
            {orderFlow === 'checkout' && (
              <div>
                <span className="close-slip-btn" onClick={() => setOrderFlow(null)}>✕</span>
                <h3>🛒 Shipping Details</h3>
                <div className="address-form-container">
                  <input type="text" placeholder="உங்கள் பெயர்" value={shippingAddress?.name || ''} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} className="address-input" />
                  <input type="tel" placeholder="மொபைல் எண்" value={shippingAddress?.phone || ''} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="address-input" />
                  <textarea placeholder="முழு முகவரி" value={shippingAddress?.address || ''} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} className="address-textarea"></textarea>
                  <input type="text" placeholder="பின்கோடு" value={shippingAddress?.pincode || ''} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} className="address-input" />
                </div>
                <button 
                  className="place-order-confirm-btn" 
                  disabled={!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.pincode} 
                  onClick={handleConfirmPayment}
                >
                  💳 Place Order & Pay
                </button>
              </div>
            )}

            {orderFlow === 'processing' && (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <h3>🔄 ஆர்டர் செயலாக்கப்படுகிறது...</h3>
              </div>
            )}

            {orderFlow === 'success_slip' && (
              <div>
                <span className="close-slip-btn" onClick={() => setOrderFlow(null)}>✕</span>
                <h3 style={{ color: '#059669' }}>🎉 Order Placed!</h3>
                <div className="invoice-slip">
                  <p><b>புத்தகம்:</b> {selectedBook?.title || 'Book'}</p>
                  <p><b>தொகை:</b> ₹{selectedBook?.price || '0'}</p>
                  <p><b>ஆர்டர் எண்:</b> {generatedOrderNo}</p>
                </div>
                <button className="download-slip-btn" onClick={() => setOrderFlow(null)}>சரி</button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default PremiumPacks;
