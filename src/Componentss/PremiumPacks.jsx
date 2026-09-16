import { useState } from 'react';
import '../Styles/Premium.css';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function PremiumPacks() {
  // 🏆 பிரீமியம் திட்டங்கள்
  const plans = [
    {
      id: 'sub_silver_399',
      type: 'subscription',
      name: '🥈 Silver Pack',
      price: 399,
      duration: '3 Months (3 மாதங்கள்)',
      features: [
        '✅ 3 மாதங்கள் முழு வேலிடிட்டி',
        '✅ அனைத்து ஆன்லைன் தேர்வுகளும் 100% இலவசம்',
        '✅ அனைத்து தேர்வு PDF மெட்டீரியல்களும் 100% இலவசம்',
        '✅ உடனடி தேர்வு முடிவுகள் & விடைக்குறிப்புகள்'
      ],
      badgeClass: 'silver-card',
      btnClass: 'silver-btn'
    },
    {
      id: 'sub_gold_699',
      type: 'subscription',
      name: '🥇 Gold Pack',
      price: 699,
      duration: '6 Months (6 மாதங்கள்)',
      features: [
        '✅ 6 மாதங்கள் முழு வேலிடிட்டி',
        '✅ அனைத்து ஆன்லைன் மாதிரி தேர்வுகள் இலவச அக்சஸ்',
        '✅ பிரீமியம் தேர்வு PDF மெட்டீரியல்கள் இலவசம்',
        '✅ வினா வங்கி (Question Bank) முழு இலவச பயன்பாடு'
      ],
      badgeClass: 'gold-card active-plan',
      btnClass: 'gold-btn',
      isPopular: true
    },
    {
      id: 'sub_platinum_1199',
      type: 'subscription',
      name: '💎 Platinum Pack',
      price: 1199,
      duration: '1 Year (1 வருடம்)',
      features: [
        '✅ 1 வருடம் (12 மாதங்கள்) முழு அன்லிமிடெட் அக்சஸ்',
        '✅ தளத்தில் உள்ள அத்தனை ஆன்லைன் தேர்வுகளும் இலவசம்',
        '✅ அனைத்து TNPSC, RRB, SI PDF மெட்டீரியல்களும் இலவசம்',
        '✅ தினசரி நடப்பு நிகழ்வுகள் & புதிய தேர்வுகள் உடனடி அக்சஸ்'
      ],
      badgeClass: 'platinum-card',
      btnClass: 'platinum-btn'
    }
  ];

  const [selectedItem, setSelectedItem] = useState(null);
  const [orderFlow, setOrderFlow] = useState(null);
  const [generatedOrderNo, setGeneratedOrderNo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // லாகின் செய்துள்ள பயனரின் விவரங்களை எடுத்தல்
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  // 🏠 தொடர்பு விவரங்கள்
  const [customerDetails, setCustomerDetails] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.contact || '',
    email: currentUser?.email || ''
  });

  const handleInitiateBuy = (item) => {
    setSelectedItem(item);
    setErrorMessage('');
    setOrderFlow('checkout');
  };

  // 💳 Razorpay பேமெண்ட் மற்றும் சந்தா ஆர்டர் உருவாக்கும் செயல்முறை
  const handleConfirmPayment = async () => {
    if (!selectedItem) return;

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      setErrorMessage("தயவுசெய்து உங்கள் பெயர் மற்றும் மொபைல் எண்ணை உள்ளிடவும்!");
      return;
    }

    setOrderFlow('processing');
    setErrorMessage('');

    const userEmail = customerDetails.email
      ? customerDetails.email.trim().toLowerCase()
      : currentUser?.email
      ? currentUser.email.trim().toLowerCase()
      : `${customerDetails.phone}@vaagaituition.com`;

    try {
      // 1. Backend-ல் Razorpay Order உருவாக்க கோரிக்கை அனுப்புதல்
      const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(selectedItem.price) })
      });
      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.orderId) {
        setErrorMessage('❌ கட்டணம் உருவாக்குவதில் சிக்கல். Server இணைப்பைச் சரிபார்க்கவும்!');
        setOrderFlow('checkout');
        return;
      }

      const randomNo = `VG-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedOrderNo(randomNo);

      // 2. Razorpay Checkout Options
      const options = {
        key: "rzp_live_TXSfHBesNhHuXM",
        amount: orderData.amount,
        currency: "INR",
        name: "Vaagai Tuition",
        description: `Purchase: ${selectedItem.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. பேமெண்ட் வெற்றிகரமாக முடிந்ததும் Backend-ல் ஆர்டரைச் சேமித்தல்
          const payload = {
            email: userEmail,
            bookId: selectedItem.id.toString(),
            bookTitle: selectedItem.name,
            price: selectedItem.price,
            orderNo: randomNo,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            shippingAddress: {
              name: customerDetails.name,
              phone: customerDetails.phone,
              address: 'Digital Subscription (All Tests & PDFs Free)',
              pincode: 'Digital'
            }
          };

          const saveRes = await fetch(`${API_BASE}/api/payment/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const saveData = await saveRes.json();
          if (saveData && saveData.success) {
            setOrderFlow('success_slip');
          } else {
            setErrorMessage('ஆர்டர் சேமிப்பதில் சிக்கல்: ' + (saveData?.message || 'தெரியாத பிழை'));
            setOrderFlow('checkout');
          }
        },
        prefill: {
          name: customerDetails.name,
          email: userEmail,
          contact: customerDetails.phone
        },
        theme: { color: "#0f766e" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment Error:', error);
      setErrorMessage('கட்டணம் செலுத்துவதில் நெட்வொர்க் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்!');
      setOrderFlow('checkout');
    }
  };

  const isCheckoutValid = () => {
    return Boolean(customerDetails.name?.trim() && customerDetails.phone?.trim());
  };

  return (
    <div className="premium-page-container">
      {/* 1. பிரீமியம் திட்டங்கள் மட்டும் */}
      <div className="premium-header">
        <h2>🏆 வாகை பிரீமியம் திட்டங்கள்</h2>
        <p>
          திட்டத்தில் இணைந்து இணையதளத்தில் உள்ள <b>அனைத்து ஆன்லைன் தேர்வுகள்</b> மற்றும் <b>PDF மெட்டீரியல்களை இலவசமாகப்</b> பெறுங்கள்!
        </p>
      </div>

      <div className="pricing-plans-container">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.badgeClass}`}>
            {plan.isPopular && <div className="best-value-badge">★ BEST VALUE</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              ₹{plan.price}
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                {plan.duration}
              </span>
            </div>
            <ul className="plan-features">
              {plan.features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
            <button
              className={`buy-plan-btn ${plan.btnClass}`}
              onClick={() => handleInitiateBuy(plan)}
            >
              இப்போதே வாங்கு (₹{plan.price})
            </button>
          </div>
        ))}
      </div>

      {/* 3. ஆர்டர் பாப்-அப் மாடல் */}
      {orderFlow && (
        <div className="order-modal-overlay">
          <div className="order-modal-box">
            {orderFlow === 'checkout' && (
              <div>
                <span className="close-slip-btn" onClick={() => setOrderFlow(null)}>
                  ✕
                </span>
                <h3>👑 பிரீமியம் சந்தா விவரம்</h3>
                
                {errorMessage && (
                  <div style={{ background: '#ffeeec', color: '#dc2626', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', margin: '8px 0' }}>
                    {errorMessage}
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', margin: '12px 0' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#0f766e' }}>
                    {selectedItem?.name}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#16a34a', fontWeight: 'bold' }}>
                    கட்டணம்: ₹{selectedItem?.price}
                  </p>
                </div>

                <div className="address-form-container">
                  <input
                    type="text"
                    placeholder="உங்கள் பெயர் *"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="address-input"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="மொபைல் எண் (WhatsApp எண்) *"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    className="address-input"
                    required
                  />
                  <input
                    type="email"
                    placeholder="மின்னஞ்சல் (Email) *"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    className="address-input"
                    required
                  />
                </div>

                <button
                  className="place-order-confirm-btn"
                  disabled={!isCheckoutValid()}
                  onClick={handleConfirmPayment}
                >
                  💳 Razorpay மூலம் கட்டணம் செலுத்துக (₹{selectedItem?.price})
                </button>
              </div>
            )}

            {orderFlow === 'processing' && (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div className="spinner"></div>
                <h3>🔄 கட்டணம் செயலாக்கப்படுகிறது...</h3>
                <p style={{ color: '#64748b', fontSize: '13px' }}>தயவுசெய்து காத்திருக்கவும்.</p>
              </div>
            )}

            {orderFlow === 'success_slip' && (
              <div>
                <span className="close-slip-btn" onClick={() => setOrderFlow(null)}>
                  ✕
                </span>
                <h3 style={{ color: '#059669' }}>🎉 ஆர்டர் வெற்றிகரமாக முடிந்தது!</h3>
                <div className="invoice-slip">
                  <p><b>திட்டம்:</b> {selectedItem?.name}</p>
                  <p><b>செலுத்திய தொகை:</b> ₹{selectedItem?.price}</p>
                  <p><b>ஆர்டர் எண்:</b> {generatedOrderNo}</p>
                  <p><b>மாணவர் பெயர்:</b> {customerDetails.name}</p>
                  
                  <div style={{ marginTop: '10px', padding: '8px', background: '#ecfdf5', borderRadius: '4px', color: '#065f46', fontSize: '13px' }}>
                    🌟 உங்கள் பிரீமியம் திட்டம் ஆக்டிவேட் செய்யப்பட்டது. ஆன்லைன் தேர்வுகள் மற்றும் PDF மெட்டீரியல்களை இப்போது இலவசமாகப் பயன்படுத்தலாம்!
                  </div>
                </div>
                <button className="download-slip-btn" onClick={() => setOrderFlow(null)}>
                  சரி (Done)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumPacks;
