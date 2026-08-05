import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/MasterAdmin.css';
import logoImg from '../assets/logoImg.jpeg';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MasterAdmin() {
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

  // 🔐 1. Login Verification States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return parsedUser.role === 'admin' || parsedUser.email === 'abcdanand970@gmail.com';
      } catch (err) {
        console.error('Failed to parse saved user', err);
      }
    }
    return false;
  });

  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic PDF States
  const [pdfItems, setPdfItems] = useState([
    { examType: 'TNPSC', title: '', questionPdfFile: '', answerPdfFile: '', isFree: false, price: 5 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingData, setPendingData] = useState({ quizzes: [], news: [], pdfs: [] });
  const [livePdfs, setLivePdfs] = useState([]); // 📚 Live PDFs List State
  const [usersList, setUsersList] = useState([]);
  
  // Analytics & Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Banner Slide State
  const [slideList, setSlideList] = useState([
    { id: 1, image: '', title: '', desc: '', expiryDate: '' }
  ]);

  // 🔑 2. Login Function
  const handleDirectLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: adminUserId, password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsLoggedIn(true);
        } else {
          setLoginError(data.message || 'Invalid User ID or Password!');
        }
      })
      .catch(err => {
        console.error(err);
        setLoginError('Server connection failed!');
      })
      .finally(() => setLoginLoading(false));
  };

  // 🚪 3. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // 🔌 Fetch Functions
  const fetchPendingItems = () => {
    fetch(`${API_BASE}/api/admin/pending-items`, {
      headers: { 'user-email': 'abcdanand970@gmail.com' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPendingData({ quizzes: data.quizzes || [], news: data.news || [], pdfs: data.pdfs || [] });
        }
      })
      .catch(err => console.error("Error fetching pending items:", err));
  };

  // 📚 லைவ்-ல் உள்ள அனைத்து PDF-களையும் எடுக்கும் ஃபங்ஷன்
  const fetchLivePdfs = () => {
    fetch(`${API_BASE}/api/admin/all-pdfs`, {
      headers: { 'user-email': 'abcdanand970@gmail.com' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setLivePdfs(data.pdfs || []);
      })
      .catch(err => console.error("Error fetching live PDFs:", err));
  };

  const fetchUsersList = () => {
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'user-email': 'abcdanand970@gmail.com' }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setUsersList(data.users); })
      .catch(err => console.error("Error fetching users list:", err));
  };

  const fetchOrdersList = () => {
    fetch(`${API_BASE}/api/admin/orders`, {
      headers: { 'user-email': 'abcdanand970@gmail.com' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrdersList(data.orders || []);
          setTotalRevenue(data.totalRevenue || 0);
        }
      })
      .catch(err => console.error("Error fetching orders list:", err));
  };

  const fetchSlides = () => {
    fetch(`${API_BASE}/api/home/slides`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.slides.length > 0) {
          setSlideList(data.slides);
        }
      })
      .catch(err => console.error("Error fetching slides:", err));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPendingItems();
      fetchLivePdfs();
      fetchSlides();
      fetchUsersList();
      fetchOrdersList();
    }
  }, [isLoggedIn]);

  // PDF Handlers
  const handleAddRow = () => setPdfItems([...pdfItems, { examType: 'TNPSC', title: '', questionPdfFile: '', answerPdfFile: '', isFree: false, price: 5 }]);
  
  const handleRemoveRow = (i) => {
    if (pdfItems.length === 1) return;
    setPdfItems(pdfItems.filter((_, idx) => idx !== i));
  };

  const handleInputChange = (i, field, val) => {
    const updated = [...pdfItems];
    updated[i][field] = val;
    setPdfItems(updated);
  };

  const handleDirectFileUpload = (i, field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...pdfItems];
      updated[i][field] = reader.result;
      setPdfItems(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiplePdfSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (let item of pdfItems) {
        const payload = {
          examType: item.examType,
          title: item.title,
          questionPdfLink: item.questionPdfFile,
          answerPdfLink: item.answerPdfFile,
          isFree: item.isFree,
          price: item.isFree ? 0 : Number(item.price)
        };

        const res = await fetch(`${API_BASE}/api/paid-pdfs/worker-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'user-email': 'abcdanand970@gmail.com' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) successCount++;
      }
      alert(`🎉 Successfully submitted ${successCount} material(s)!`);
      setPdfItems([{ examType: 'TNPSC', title: '', questionPdfFile: '', answerPdfFile: '', isFree: false, price: 5 }]);
      fetchPendingItems();
      fetchLivePdfs();
    } catch (err) {
      alert("❌ An error occurred during submission!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✏️ PDF Title & Price Edit Handler
  const handleEditPdf = (pdf) => {
    const newTitle = window.prompt("Edit Material Title:", pdf.title);
    if (!newTitle) return;

    const isFree = window.confirm("Is this PDF Free? (Click OK for Free, Cancel for Paid)");
    let newPrice = 0;

    if (!isFree) {
      const inputPrice = window.prompt("Enter Amount in ₹:", pdf.price || 5);
      newPrice = inputPrice ? Number(inputPrice) : pdf.price;
    }

    fetch(`${API_BASE}/api/admin/edit-pdf`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'user-email': 'abcdanand970@gmail.com' },
      body: JSON.stringify({ id: pdf.id, title: newTitle, price: newPrice, isFree })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("✏️ PDF details updated successfully!");
          fetchLivePdfs();
        } else {
          alert("❌ " + data.message);
        }
      });
  };

  // 🗑️ PDF Delete Handler
  const handleDeletePdf = (pdfId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    fetch(`${API_BASE}/api/admin/delete-pdf/${pdfId}`, {
      method: 'DELETE',
      headers: { 'user-email': 'abcdanand970@gmail.com' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("🗑️ PDF deleted successfully!");
          fetchLivePdfs();
        } else {
          alert("❌ " + data.message);
        }
      });
  };

  // Approval Handlers
  const handleApprove = (type, id) => {
    fetch(`${API_BASE}/api/admin/approve-item`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'user-email': 'abcdanand970@gmail.com' },
      body: JSON.stringify({ type, id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("🎯 Material approved successfully!");
          fetchPendingItems();
          fetchLivePdfs();
        }
      });
  };

  const handleReject = (type, id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    fetch(`${API_BASE}/api/admin/reject-item`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'user-email': 'abcdanand970@gmail.com' },
      body: JSON.stringify({ type, id, reason })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("📉 Material rejected!");
          fetchPendingItems();
        }
      });
  };

  // Slide Handlers
  const handleRemoveSlideRow = (index) => {
    if (!window.confirm(`Are you sure you want to delete Slide #${index + 1}?`)) return;
    const updated = slideList.filter((_, i) => i !== index);
    setSlideList(updated.length === 0 ? [{ id: 1, image: '', title: '', desc: '', expiryDate: '' }] : updated);
  };

  const handleRemoveSlideImage = (index) => {
    if (!window.confirm(`Are you sure you want to delete the image from Slide #${index + 1}?`)) return;
    const updated = [...slideList];
    updated[index].image = '';
    setSlideList(updated);

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = '';
    }
  };

  const handleAddSlideRow = () => {
    if (slideList.length >= 10) {
      alert("⚠️ Maximum limit reached! You can add up to 10 slides only.");
      return;
    }
    setSlideList([...slideList, { id: slideList.length + 1, image: '', title: '', desc: '', expiryDate: '' }]);
  };

  const handleSlideChange = (index, field, value) => {
    const updated = [...slideList];
    updated[index][field] = value;
    setSlideList(updated);
  };

  const handleDirectImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...slideList];
      updated[index]['image'] = reader.result;
      setSlideList(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSlides = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/update-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': 'abcdanand970@gmail.com' },
        body: JSON.stringify({ slides: slideList })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Banner slides updated successfully!");
        fetchSlides();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("Error saving slides!");
    }
  };

  const totalPending = pendingData.quizzes.length + pendingData.news.length + pendingData.pdfs.length;

  // 🔒 4. LOGIN CARD UI
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#e6f4f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2a9d8f, #264653)',
            color: '#ffffff',
            padding: '30px 25px 50px 25px',
            position: 'relative'
          }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '22px' }}>Welcome Back !</h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Sign in to Master Admin.</p>

            <div style={{
              position: 'absolute',
              bottom: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70px',
              height: '70px',
              background: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <img src={logoImg} alt="Vaagai Logo" style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ padding: '55px 30px 35px 30px' }}>
            {loginError && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '18px'
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleDirectLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  User ID / Username
                </label>
                <input
                  type="text"
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  placeholder="admin"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    backgroundColor: '#eef2f6',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    backgroundColor: '#eef2f6',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#2a9d8f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loginLoading ? 'Verifying...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 🔓 5. MASTER ADMIN BOARD
  return (
    <div className="master-admin-page">
      
      {/* 👈 LEFT SIDEBAR MENU */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img 
            src={logoImg} 
            alt="Vaagai Logo" 
            className="sidebar-logo" 
            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h3 className="sidebar-brand-title">Vaagai Tuition</h3>
            <span className="sidebar-role-tag">👑 Master Admin</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span>📊 Dashboard Overview</span>
          </button>

          <button className={`sidebar-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <span>📚 Upload & Manage PDFs</span>
          </button>

          <button className={`sidebar-btn ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>
            <span>👑 Pending Approvals</span>
            {totalPending > 0 && <span className="badge-count">{totalPending}</span>}
          </button>

          <button className={`sidebar-btn ${activeTab === 'slides' ? 'active' : ''}`} onClick={() => setActiveTab('slides')}>
            <span>🖼️ Banner Slides</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>({slideList.length}/10)</span>
          </button>

          <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span>👥 Enrolled Students</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>({usersList.length})</span>
          </button>

          <button className={`sidebar-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <span>💳 Payment History</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>({ordersList.length})</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-admin-logout">
            🚪 Logout System
          </button>
        </div>
      </aside>

      {/* 👉 RIGHT MAIN CONTENT AREA */}
      <main className="admin-main-content">

        <div className="main-header-panel">
          <h2>
            {activeTab === 'dashboard' && '📊 Overall System Analytics'}
            {activeTab === 'upload' && '📚 Upload & Manage Exam Study Materials'}
            {activeTab === 'approval' && '👑 Master Approval Control Center'}
            {activeTab === 'slides' && '🖼️ Manage Homepage Banner Slides'}
            {activeTab === 'users' && '👥 Registered Student Directory'}
            {activeTab === 'payments' && '💳 Student Payment Transactions'}
          </h2>
          <p>Vaagai Tuition – Master Admin Control Board</p>
        </div>

        {/* TAB 0: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '10px' }}>
            <div style={{ background: '#ffffff', borderLeft: '6px solid #16a34a', padding: '22px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL REGISTERED STUDENTS</span>
              <h2 style={{ margin: '10px 0 0 0', color: '#166534', fontSize: '32px' }}>{usersList.length} Users</h2>
            </div>

            <div style={{ background: '#ffffff', borderLeft: '6px solid #0284c7', padding: '22px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL REVENUE COLLECTED</span>
              <h2 style={{ margin: '10px 0 0 0', color: '#0369a1', fontSize: '32px' }}>₹ {totalRevenue}</h2>
            </div>

            <div style={{ background: '#ffffff', borderLeft: '6px solid #eab308', padding: '22px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>SUCCESSFUL ORDERS</span>
              <h2 style={{ margin: '10px 0 0 0', color: '#a16207', fontSize: '32px' }}>{ordersList.length} Orders</h2>
            </div>
          </div>
        )}

        {/* TAB 1: UPLOAD & MANAGE SECTION */}
        {activeTab === 'upload' && (
          <div>
            <form onSubmit={handleMultiplePdfSubmit} style={{ marginBottom: '40px' }}>
              <h3>➕ Add New PDF Study Material</h3>
              {pdfItems.map((item, index) => (
                <div key={index} className="material-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>📁 Material Item #{index + 1}</span>
                    {pdfItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRow(index)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕ Remove</button>
                    )}
                  </div>

                  <div className="form-grid-top" style={{ gridTemplateColumns: '1fr 2fr 1.5fr' }}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select value={item.examType} onChange={(e) => handleInputChange(index, 'examType', e.target.value)} className="form-control">
                        <option value="TNPSC">TNPSC</option>
                        <option value="RRB">RRB</option>
                        <option value="SI">SI</option>
                        <option value="PC">PC</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Exam Title</label>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => handleInputChange(index, 'title', e.target.value)} 
                        required 
                        className="form-control" 
                        placeholder="e.g., 10th Science - Unit 1 Model Test" 
                      />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <label className="form-label" style={{ color: '#15803d', fontWeight: 'bold' }}>Access Type & Amount</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <select 
                          value={item.isFree ? 'free' : 'paid'} 
                          onChange={(e) => {
                            const isFree = e.target.value === 'free';
                            handleInputChange(index, 'isFree', isFree);
                            if (isFree) handleInputChange(index, 'price', 0);
                          }} 
                          className="form-control"
                          style={{ width: '90px', padding: '6px' }}
                        >
                          <option value="paid">Paid (₹)</option>
                          <option value="free">Free 🎉</option>
                        </select>

                        {!item.isFree && (
                          <input 
                            type="number" 
                            min="1"
                            value={item.price} 
                            onChange={(e) => handleInputChange(index, 'price', e.target.value)} 
                            required 
                            className="form-control" 
                            placeholder="Amount in ₹"
                            style={{ width: '90px', padding: '6px' }}
                          />
                        )}
                        {item.isFree && (
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a' }}>FREE (₹ 0)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-bottom">
                    <div className="form-group">
                      <label className="form-label">📄 Select Question Paper (PDF File)</label>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        required 
                        className="form-control" 
                        onChange={(e) => handleDirectFileUpload(index, 'questionPdfFile', e.target.files[0])}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">🔑 Select Answer Key (PDF File)</label>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        required 
                        className="form-control" 
                        onChange={(e) => handleDirectFileUpload(index, 'answerPdfFile', e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={handleAddRow} className="btn-add-more">
                ➕ Add Another Material Block
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-submit-main">
                {isSubmitting ? "⏳ Uploading Materials..." : `🚀 Submit All ${pdfItems.length} Material(s)`}
              </button>
            </form>

            {/* LIVE PDF MATERIAL MANAGER */}
            <div style={{ marginTop: '30px' }}>
              <h3>📁 Live Approved PDF Materials ({livePdfs.length})</h3>
              {livePdfs.length === 0 ? (
                <p style={{ color: '#64748b' }}>No live materials found 👍</p>
              ) : (
                livePdfs.map(pdf => (
                  <div key={pdf.id} className="pending-item-card" style={{ borderLeft: '4px solid #0284c7' }}>
                    <div>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginRight: '6px' }}>
                        {pdf.examType}
                      </span>
                      <span style={{ background: pdf.isFree ? '#e0f2fe' : '#fef9c3', color: pdf.isFree ? '#0369a1' : '#854d0e', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {pdf.isFree ? 'FREE' : `PAID (₹ ${pdf.price || 5})`}
                      </span>
                      <h4 style={{ margin: '6px 0 0 0', color: '#0f172a' }}>{pdf.title}</h4>
                    </div>

                    <div className="btn-action-group">
                      <button onClick={() => handleEditPdf(pdf)} className="btn-view" style={{ background: '#f59e0b', color: 'white' }}>
                        ✏️ Edit Name & Price
                      </button>
                      <button onClick={() => handleDeletePdf(pdf.id, pdf.title)} className="btn-reject">
                        🗑️ Delete PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPROVAL SECTION */}
        {activeTab === 'approval' && (
          <div>
            <h3>📚 Paid & Free PDF Materials Pending Approval ({pendingData.pdfs.length})</h3>
            {pendingData.pdfs.length === 0 ? <p style={{ color: '#64748b' }}>No pending materials found 👍</p> : pendingData.pdfs.map(p => (
              <div key={p.id} className="pending-item-card">
                <div>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginRight: '6px' }}>{p.examType}</span>
                  <span style={{ background: p.isFree ? '#e0f2fe' : '#fef9c3', color: p.isFree ? '#0369a1' : '#854d0e', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {p.isFree ? 'FREE' : `PAID (₹ ${p.price || 5})`}
                  </span>
                  <h4 style={{ margin: '6px 0 0 0' }}>{p.title}</h4>
                </div>
                <div className="btn-action-group">
                  <a href={p.questionPdfLink} target="_blank" rel="noreferrer" className="btn-view">👁️ View Qn PDF</a>
                  <a href={p.answerPdfLink} target="_blank" rel="noreferrer" className="btn-view">👁️ View Ans PDF</a>
                  <button onClick={() => handleApprove('pdf', p.id)} className="btn-approve">✅ Approve</button>
                  <button onClick={() => handleReject('pdf', p.id)} className="btn-reject">❌ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SLIDES MANAGEMENT */}
        {activeTab === 'slides' && (
          <form onSubmit={handleSaveSlides}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>🖼️ Customize Homepage Banner Slides</h3>
              <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Total: {slideList.length}/10</span>
            </div>

            {slideList.map((slide, index) => (
              <div key={index} className="material-card" style={{ borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <b style={{ color: '#15803d' }}>Slide #{index + 1}</b>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSlideRow(index)} 
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    🗑️ Delete Entire Slide
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">🖼️ Upload Banner Image (Direct File Selection)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    className="form-control" 
                    onChange={(e) => handleDirectImageUpload(index, e.target.files[0])}
                  />

                  {slide.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <img 
                        src={slide.image} 
                        alt={`Slide ${index + 1}`} 
                        style={{ width: '120px', height: '65px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #86efac' }} 
                      />
                      <div>
                        <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                          ✓ Image Attached Successfully
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSlideImage(index)} 
                          style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🗑️ Delete Image Only
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-grid-bottom" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Slide Title</label>
                    <input 
                      type="text" 
                      value={slide.title} 
                      onChange={(e) => handleSlideChange(index, 'title', e.target.value)} 
                      required 
                      className="form-control" 
                      placeholder="Title in English" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Short Description</label>
                    <input 
                      type="text" 
                      value={slide.desc} 
                      onChange={(e) => handleSlideChange(index, 'desc', e.target.value)} 
                      required 
                      className="form-control" 
                      placeholder="Brief description" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ color: '#166534' }}>
                    📅 Expiry Date (Show Until - Optional)
                  </label>
                  <input 
                    type="date" 
                    value={slide.expiryDate || ''} 
                    onChange={(e) => handleSlideChange(index, 'expiryDate', e.target.value)} 
                    className="form-control" 
                  />
                </div>
              </div>
            ))}

            {slideList.length < 10 && (
              <button type="button" onClick={handleAddSlideRow} className="btn-add-more">
                ➕ Add New Slide Block ({slideList.length}/10)
              </button>
            )}

            <button type="submit" className="btn-submit-main">
              💾 Save Banner Slides
            </button>
          </form>
        )}

        {/* TAB 4: REGISTERED STUDENTS LIST */}
        {activeTab === 'users' && (
          <div>
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Contact No</th>
                  <th>System Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#166534' }}>{i + 1}</td>
                    <td><b>{u.name}</b></td>
                    <td>{u.email}</td>
                    <td>{u.contact}</td>
                    <td>
                      <span style={{ background: u.role === 'admin' ? '#dcfce7' : '#f1f5f9', color: u.role === 'admin' ? '#15803d' : '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: PAYMENT HISTORY TABLE */}
        {activeTab === 'payments' && (
          <div>
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                  <th>Order No</th>
                  <th>Book / Exam Material</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                      No payment records found 👍
                    </td>
                  </tr>
                ) : ordersList.map((o, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#166534' }}>{i + 1}</td>
                    <td><b>{o.orderNo || `ORD-${o._id.substring(0, 6)}`}</b></td>
                    <td>{o.bookTitle || 'Exam PDF Pack'}</td>
                    <td style={{ fontWeight: 'bold', color: '#16a34a' }}>₹ {o.price || 0}</td>
                    <td>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

export default MasterAdmin;