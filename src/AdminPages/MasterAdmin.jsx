import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/MasterAdmin.css';
import logoImg from '../assets/logoImg.jpeg';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MasterAdmin() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (err) {}
    }
    return {};
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(currentUser.email));
  const isMasterAdmin = currentUser.email === 'abcdanand970@gmail.com' || currentUser.role === 'admin';

  // 🔔 In-Page Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3500);
  };

  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(isMasterAdmin ? 'dashboard' : 'questions');
  const [selectedTopicTab, setSelectedTopicTab] = useState('All');
  const [selectedPdfExamTab, setSelectedPdfExamTab] = useState('All');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [questionPage, setQuestionPage] = useState(1);
  const [testPage, setTestPage] = useState(1);
  const [caPage, setCaPage] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);
  const itemsPerPage = 10;

  const [usersList, setUsersList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [livePdfs, setLivePdfs] = useState([]);
  const [freeTestsList, setFreeTestsList] = useState([]);
  const [slideList, setSlideList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [caList, setCaList] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [viewingQuestion, setViewingQuestion] = useState(null);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [selectedRadioIndex, setSelectedRadioIndex] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    topic: 'Tamil',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  const [showCaForm, setShowCaForm] = useState(false);
  const [editingCaId, setEditingCaId] = useState(null);
  const [caFormData, setCaFormData] = useState({
    date: '',
    category: 'General',
    title: '',
    description: '',
    tags: ''
  });

  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [testFormData, setTestFormData] = useState({
    examType: 'Online Test',
    title: '',
    selectedTopics: ['Tamil'],
    selectionType: 'random',
    selectedQuestionIds: [],
    totalQuestions: 20,
    durationMinutes: 15,
    isFree: true,
    price: 0,
    startTime: '',
    endTime: ''
  });

  const [previewTest, setPreviewTest] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    contact: '',
    role: 'student'
  });

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editingPdfId, setEditingPdfId] = useState(null);
  const [pdfFormData, setPdfFormData] = useState({
    examType: '10th',
    title: '',
    questionPdfLink: '',
    answerPdfLink: '',
    isFree: true,
    price: 0
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: adminUserId.trim(), password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          setActiveTab(
            data.user.email === 'abcdanand970@gmail.com' || data.user.role === 'admin'
              ? 'dashboard'
              : 'questions'
          );
        } else {
          setLoginError(data.message || 'Invalid Credentials');
        }
      })
      .catch(() => setLoginError('Server connection failed'))
      .finally(() => setLoginLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const loadAllData = () => {
    const headers = { 
      'Content-Type': 'application/json',
      'user-email': currentUser.email || 'abcdanand970@gmail.com' 
    };

    fetch(`${API_BASE}/api/admin/users`, { headers })
      .then(res => res.json()).then(data => { if (data.success) setUsersList(data.users || []); })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/quiz/questions`)
      .then(res => res.json()).then(data => { if (data.success) setQuizzesList(data.questions || []); })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/admin/all-pdfs`, { headers })
      .then(res => res.json()).then(data => { if (data.success) setLivePdfs(data.pdfs || []); })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/admin/all-tests`, { headers })
      .then(res => res.json()).then(data => { if (data.success) setFreeTestsList(data.tests || []); })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/home/slides`)
      .then(res => res.json()).then(data => {
        if (data.success && data.slides) setSlideList(data.slides);
      })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/ca/all`)
      .then(res => res.json()).then(data => {
        if (data.success) setCaList(data.news || []);
      })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/admin/orders`, { headers })
      .then(res => res.json()).then(data => {
        if (data.success) {
          const orders = data.orders || [];
          setOrdersList(orders);
          const rev = orders.filter(o => !o.status?.includes('REFUNDED')).reduce((sum, o) => sum + (o.price || 0), 0);
          setTotalRevenue(rev);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (isLoggedIn) loadAllData();
  }, [isLoggedIn]);

  const handleRefundPayment = async (order) => {
    if (!isMasterAdmin) return showNotification("Permission denied!", "error");
    const confirmRefund = window.confirm(`Are you sure you want to refund ₹${order.price}?`);
    if (!confirmRefund) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/refund-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ orderId: order._id, orderNo: order.orderNo, reason: 'Admin requested refund' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('Payment refunded successfully!', 'success');
      } else {
        showNotification(data.message || 'Refund failed.', 'error');
      }
      loadAllData();
    } catch (err) {
      showNotification('Server connection error during refund.', 'error');
    }
  };

  const handleOpenPdf = (driveUrl) => {
    if (!driveUrl || driveUrl.trim() === '') return showNotification("PDF Link is not available!", "warning");
    let finalUrl = driveUrl.trim();
    if (finalUrl.includes('drive.google.com')) {
      const match = finalUrl.match(/\/file\/d\/([^/]+)/) || finalUrl.match(/\/d\/([^/]+)/) || finalUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    window.open(finalUrl, '_blank');
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setSelectedRadioIndex(null);
    setQuestionFormData({
      topic: selectedTopicTab !== 'All' ? selectedTopicTab : 'Tamil',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestionId(q.id || q._id);
    const options = q.options && q.options.length ? q.options : ['', '', '', ''];
    const corrAns = q.correctAnswer || '';
    const foundIdx = options.findIndex(opt => opt && opt.trim() === corrAns.trim());
    setSelectedRadioIndex(foundIdx !== -1 ? foundIdx : null);

    setQuestionFormData({
      topic: q.topic || q.category || 'Tamil',
      question: q.question || '',
      options: options,
      correctAnswer: corrAns
    });
    setShowQuestionModal(true);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionFormData.options];
    updatedOptions[index] = value;
    setQuestionFormData({
      ...questionFormData,
      options: updatedOptions,
      correctAnswer: selectedRadioIndex === index ? value.trim() : questionFormData.correctAnswer
    });
  };

  const handleSelectRadioOption = (index) => {
    setSelectedRadioIndex(index);
    const chosenVal = questionFormData.options[index] ? questionFormData.options[index].trim() : '';
    setQuestionFormData({
      ...questionFormData,
      correctAnswer: chosenVal
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!questionFormData.question || !questionFormData.question.trim()) return showNotification("Please enter question text!", "warning");
    const cleanedOptions = questionFormData.options.map(opt => (opt ? opt.trim() : ''));
    if (cleanedOptions.some(opt => !opt)) return showNotification("Please fill in all 4 options!", "warning");

    const trimmedCorrectAnswer = questionFormData.correctAnswer ? questionFormData.correctAnswer.trim() : '';
    if (!trimmedCorrectAnswer || !cleanedOptions.includes(trimmedCorrectAnswer)) {
      return showNotification("Please select the correct option radio button!", "warning");
    }

    const payload = {
      type: 'quiz',
      id: editingQuestionId,
      subject: 'General',
      topic: questionFormData.topic,
      category: questionFormData.topic,
      questionSet: 'Topic Test',
      question: questionFormData.question.trim(),
      options: cleanedOptions,
      correctAnswer: trimmedCorrectAnswer,
      status: 'active'
    };

    const endpoint = editingQuestionId ? `${API_BASE}/api/admin/edit-item` : `${API_BASE}/api/quiz/add`;
    const method = editingQuestionId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) return showNotification(data.message || 'Error saving question.', 'error');
      setShowQuestionModal(false);
      loadAllData();
      showNotification('Question saved successfully!', 'success');
    } catch (err) {
      showNotification('Unable to connect to server.', 'error');
    }
  };

  const handleDeleteQuestion = async (id, text) => {
    if (!window.confirm(`Delete question: "${text}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/reject-item`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ type: 'quiz', id, reason: 'Deleted by Admin' })
      });
      loadAllData();
      showNotification('Question removed!', 'info');
    } catch (err) { console.error(err); }
  };

  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestFormData({
      examType: 'Online Test',
      title: '',
      selectedTopics: ['Tamil'],
      selectionType: 'random',
      selectedQuestionIds: [],
      totalQuestions: 20,
      durationMinutes: 15,
      isFree: true,
      price: 0,
      startTime: '',
      endTime: ''
    });
    setShowTestModal(true);
  };

  const handleOpenEditTest = (t) => {
    setEditingTestId(t.id || t._id);
    setTestFormData({
      examType: t.examType || 'Online Test',
      title: t.title || '',
      selectedTopics: t.selectedTopics || ['Tamil'],
      selectionType: t.selectionType || 'random',
      selectedQuestionIds: t.selectedQuestionIds || [],
      totalQuestions: t.totalQuestions || 20,
      durationMinutes: t.durationMinutes || 15,
      isFree: t.isFree ?? true,
      price: t.price || 0,
      startTime: t.startTime ? t.startTime.substring(0, 16) : '',
      endTime: t.endTime ? t.endTime.substring(0, 16) : ''
    });
    setShowTestModal(true);
  };

  const handleToggleTopicCheckbox = (topic) => {
    const current = testFormData.selectedTopics || [];
    if (current.includes(topic)) {
      if (current.length === 1) return showNotification("Select at least one topic!", "warning");
      setTestFormData({ ...testFormData, selectedTopics: current.filter(t => t !== topic) });
    } else {
      setTestFormData({ ...testFormData, selectedTopics: [...current, topic] });
    }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();

    if (!testFormData.title.trim()) return showNotification('Enter test title.', 'warning');
    if (!testFormData.selectedTopics?.length) return showNotification('Select at least one topic.', 'warning');

    const payload = {
      id: editingTestId,
      examType: testFormData.examType,
      title: testFormData.title.trim(),
      selectedTopics: testFormData.selectedTopics,
      selectionType: testFormData.selectionType || 'random',
      selectedQuestionIds: testFormData.selectedQuestionIds || [],
      totalQuestions: Number(testFormData.totalQuestions) || 20,
      durationMinutes: Number(testFormData.durationMinutes) || 15,
      isFree: Boolean(testFormData.isFree),
      price: testFormData.isFree ? 0 : Number(testFormData.price || 0),
      startTime: testFormData.startTime ? testFormData.startTime : null,
      endTime: testFormData.endTime ? testFormData.endTime : null,
      status: 'active'
    };

    const endpoint = editingTestId ? `${API_BASE}/api/admin/edit-test` : `${API_BASE}/api/admin/add-test`;
    const method = editingTestId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) return showNotification(data.message || 'Test save failed.', 'error');
      setShowTestModal(false);
      loadAllData();
      showNotification('Test saved successfully!', 'success');
    } catch (err) {
      showNotification('Server error while saving test.', 'error');
    }
  };

  const handleDeleteTest = async (testId, title) => {
    if (!window.confirm(`Delete Test: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-test/${testId}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
      showNotification('Test deleted!', 'info');
    } catch (err) { console.error(err); }
  };

  const handleOpenTestPreview = (t) => {
    const testQuestions = quizzesList.filter(q => (t.selectedTopics || []).includes(q.topic || q.category));
    setPreviewTest({ test: t, questions: testQuestions });
  };

  const formatDateTime12Hr = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const d = new Date(dateTimeStr);
    if (Number.isNaN(d.getTime())) return dateTimeStr;

    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleOpenAddPdf = () => {
    setEditingPdfId(null);
    setPdfFormData({ examType: '10th', title: '', questionPdfLink: '', answerPdfLink: '', isFree: true, price: 0 });
    setShowPdfModal(true);
  };

  const handleOpenEditPdf = (pdf) => {
    setEditingPdfId(pdf.id || pdf._id);
    setPdfFormData({
      examType: pdf.examType || '10th',
      title: pdf.title || '',
      questionPdfLink: pdf.questionPdfLink || '',
      answerPdfLink: pdf.answerPdfLink || '',
      isFree: pdf.isFree ?? true,
      price: pdf.price || 0
    });
    setShowPdfModal(true);
  };

  const handleSavePdf = async (e) => {
    e.preventDefault();
    if (!pdfFormData.questionPdfLink) return showNotification("Provide Question PDF link!", "warning");

    const payload = {
      id: editingPdfId,
      title: pdfFormData.title.trim(),
      examType: pdfFormData.examType,
      questionPdfLink: pdfFormData.questionPdfLink.trim(),
      answerPdfLink: pdfFormData.answerPdfLink ? pdfFormData.answerPdfLink.trim() : '',
      isFree: pdfFormData.isFree,
      price: pdfFormData.isFree ? 0 : Number(pdfFormData.price),
      status: 'active'
    };

    try {
      const res = await fetch(editingPdfId ? `${API_BASE}/api/admin/edit-pdf` : `${API_BASE}/api/paid-pdfs/worker-upload`, {
        method: editingPdfId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowPdfModal(false);
        loadAllData();
        showNotification('PDF saved successfully!', 'success');
      }
    } catch (err) { showNotification('Server error saving PDF', 'error'); }
  };

  const handleDeletePdf = async (pdfId, title) => {
    if (!window.confirm(`Delete PDF: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-pdf/${pdfId}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
      showNotification('PDF removed!', 'info');
    } catch (err) { console.error(err); }
  };

  const handleSaveCa = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(editingCaId ? `${API_BASE}/api/admin/edit-ca` : `${API_BASE}/api/ca/add-direct`, {
        method: editingCaId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify(editingCaId ? { id: editingCaId, ...caFormData } : caFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowCaForm(false);
        setEditingCaId(null);
        loadAllData();
        showNotification('Current affairs saved!', 'success');
      }
    } catch (err) { showNotification('Server error', 'error'); }
  };

  const handleDeleteCa = async (id, title) => {
    if (!window.confirm(`Delete News: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-ca/${id}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
      showNotification('News deleted!', 'info');
    } catch (err) { console.error(err); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/save-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ id: editingUserId, ...userFormData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowUserModal(false);
        loadAllData();
        showNotification('User saved successfully!', 'success');
      }
    } catch (err) { showNotification('Error saving user', 'error'); }
  };

  const handleDeleteUser = async (email) => {
    if (!isMasterAdmin) return showNotification("Permission denied!", "error");
    if (!window.confirm(`Delete: "${email}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ email })
      });
      loadAllData();
      showNotification('User deleted!', 'info');
    } catch (err) { console.error(err); }
  };

  const handleAddSlide = () => setSlideList([...slideList, { id: Date.now(), image: '', title: '', desc: '', expiryDate: '' }]);
  const handleSlideChange = (idx, f, v) => setSlideList(slideList.map((s, i) => i === idx ? { ...s, [f]: v } : s));
  const handleDeleteSlide = (idx) => setSlideList(slideList.filter((_, i) => i !== idx));

  const handleSaveAllSlides = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/admin/update-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ slides: slideList })
      });
      showNotification('Slides updated!', 'success');
      loadAllData();
    } catch (err) { showNotification('Slide update error', 'error'); }
  };

  const filteredQuestions = selectedTopicTab === 'All' ? quizzesList : quizzesList.filter(q => (q.topic === selectedTopicTab || q.category === selectedTopicTab));
  const filteredPdfs = selectedPdfExamTab === 'All' ? livePdfs : livePdfs.filter(p => p.examType === selectedPdfExamTab);
  const filteredUsers = usersList.filter(u => u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()));

  const paginatedQuestions = filteredQuestions.slice((questionPage - 1) * itemsPerPage, questionPage * itemsPerPage);
  const totalQuestionPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const paginatedTests = freeTestsList.slice((testPage - 1) * itemsPerPage, testPage * itemsPerPage);
  const totalTestPages = Math.ceil(freeTestsList.length / itemsPerPage);

  const paginatedCa = caList.slice((caPage - 1) * itemsPerPage, caPage * itemsPerPage);
  const paginatedPdfs = filteredPdfs.slice((pdfPage - 1) * itemsPerPage, pdfPage * itemsPerPage);
  const totalPdfPages = Math.ceil(filteredPdfs.length / itemsPerPage);

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaf5f2' }}>
        <div style={{ width: '360px', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={logoImg} alt="Logo" style={{ width: '55px', height: '55px', borderRadius: '50%' }} />
            <h2 style={{ color: '#17a983', margin: '10px 0 4px 0' }}>Vaagai Admin</h2>
          </div>
          {loginError && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '10px' }}>⚠️ {loginError}</p>}
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="User ID" value={adminUserId} onChange={e => setAdminUserId(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <button type="submit" disabled={loginLoading} style={{ width: '100%', padding: '10px', background: '#17a983', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{loginLoading ? 'Verifying...' : 'Log In'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* 🔔 Floating In-Page Toast */}
      {toast.show && (
        <div className={`inpage-toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="Logo" className="sidebar-logo" />
          <span className="sidebar-title">VAAGAI TUITION</span>
        </div>

        <nav className="sidebar-nav">
          {isMasterAdmin && (
            <>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span className="nav-icon">📊</span> Dashboard</button>
              <button className={`nav-item ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}><span className="nav-icon">👑</span> Subscribers ({ordersList.filter(o => !o.status?.includes('REFUNDED')).length})</button>
              <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><span className="nav-icon">👥</span> Users ({usersList.length})</button>
            </>
          )}
          <button className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}><span className="nav-icon">❓</span> Question Bank ({quizzesList.length})</button>
          <button className={`nav-item ${activeTab === 'freetest' ? 'active' : ''}`} onClick={() => setActiveTab('freetest')}><span className="nav-icon">📝</span> Online Tests ({freeTestsList.length})</button>
          <button className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}><span className="nav-icon">📚</span> PDF Materials ({livePdfs.length})</button>
          <button className={`nav-item ${activeTab === 'slider' ? 'active' : ''}`} onClick={() => setActiveTab('slider')}><span className="nav-icon">🖼️</span> Home Slider ({slideList.length}/10)</button>
          <button className={`nav-item ${activeTab === 'ca' ? 'active' : ''}`} onClick={() => setActiveTab('ca')}><span className="nav-icon">📰</span> Current Affairs ({caList.length})</button>
          {isMasterAdmin && <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><span className="nav-icon">💳</span> Orders & Refunds</button>}
          <button className="nav-item" onClick={handleLogout}><span className="nav-icon">⏻</span> Logout</button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="top-navbar">
          <button className="menu-toggle">☰</button>
          <div className="top-nav-right">
            <button className="top-icon-btn" onClick={() => window.location.reload()}>🔄</button>
            <img src={logoImg} alt="Admin" className="admin-avatar" />
          </div>
        </header>

        <main className="content-area">
          {activeTab === 'freetest' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">MANAGE ONLINE & SCHEDULED TESTS</h2>
                <button onClick={handleOpenAddTest} className="btn-add-primary">+ Add Test</button>
              </div>
              <div className="admin-card">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Test Title</th>
                      <th>Topics</th>
                      <th>Schedule (IST)</th>
                      <th>Qns</th>
                      <th>Duration</th>
                      <th style={{ textAlign: 'center', width: '150px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTests.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No tests found.</td></tr>
                    ) : (
                      paginatedTests.map((t, idx) => (
                        <tr key={t.id || t._id || idx}>
                          <td>{(testPage - 1) * itemsPerPage + idx + 1}</td>
                          <td><b>{t.title}</b></td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(t.selectedTopics || ['Tamil']).map((tp, i) => (
                                <span key={i} style={{ background: '#f1f5f9', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                  {tp}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            {t.startTime ? (
                              <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>
                                ⏱️ {formatDateTime12Hr(t.startTime)}
                              </span>
                            ) : (
                              <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12px' }}>
                                🟢 Always Live
                              </span>
                            )}
                          </td>
                          <td>{t.totalQuestions} Qns</td>
                          <td>{t.durationMinutes} Mins</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => handleOpenTestPreview(t)} className="btn-action-round bg-view" title="Preview">👁</button>
                              <button onClick={() => handleOpenEditTest(t)} className="btn-action-round bg-edit" title="Edit">✏</button>
                              <button onClick={() => handleDeleteTest(t.id || t._id, t.title)} className="btn-action-round bg-delete" title="Delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
        <footer className="footer-copyright">Vaagai Tuition © 2026. All rights reserved.</footer>
      </div>

      {showTestModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingTestId ? '✏️ Edit Test' : '➕ Add Test'}</h3>
            <form onSubmit={handleSaveTest}>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Test Title</label>
                <input type="text" value={testFormData.title} onChange={e => setTestFormData({ ...testFormData, title: e.target.value })} required className="modal-input" placeholder="e.g. TNPSC General Mock Test" />
              </div>

              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <label className="modal-label" style={{ color: '#0f766e', marginBottom: '8px' }}>Topics:</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['Tamil', 'Maths', 'Science', 'Social Science', 'Current Affairs'].map(topic => (
                    <label key={topic} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={testFormData.selectedTopics.includes(topic)} onChange={() => handleToggleTopicCheckbox(topic)} />
                      <b>{topic}</b>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="modal-label">Total Questions</label>
                  <input type="number" min="1" value={testFormData.totalQuestions} onChange={e => setTestFormData({ ...testFormData, totalQuestions: Number(e.target.value) })} required className="modal-input" />
                </div>
                <div>
                  <label className="modal-label">Duration (Minutes)</label>
                  <input type="number" min="1" value={testFormData.durationMinutes} onChange={e => setTestFormData({ ...testFormData, durationMinutes: Number(e.target.value) })} required className="modal-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="modal-label">Test Access</label>
                  <select value={testFormData.isFree ? 'free' : 'paid'} onChange={e => setTestFormData({ ...testFormData, isFree: e.target.value === 'free', price: e.target.value === 'free' ? 0 : 5 })} className="modal-input">
                    <option value="free">🎉 Free Test</option>
                    <option value="paid">💳 Paid Test (₹)</option>
                  </select>
                </div>
                {!testFormData.isFree && (
                  <div>
                    <label className="modal-label">Price (₹)</label>
                    <input type="number" min="1" value={testFormData.price} onChange={e => setTestFormData({ ...testFormData, price: Number(e.target.value) })} required className="modal-input" />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="modal-label">Start Time (Scheduled Date & Time)</label>
                  <input
                    type="datetime-local"
                    value={testFormData.startTime}
                    onChange={e => setTestFormData({ ...testFormData, startTime: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="modal-label">End Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={testFormData.endTime}
                    onChange={e => setTestFormData({ ...testFormData, endTime: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowTestModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">{editingTestId ? 'Update Test' : 'Save Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewTest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f766e' }}>👁️ Test Preview: {previewTest.test.title}</h3>
              <button onClick={() => setPreviewTest(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div>
              {previewTest.questions.slice(0, 10).map((q, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{i + 1}. {q.question}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px' }}>
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} style={{ color: opt === q.correctAnswer ? '#16a34a' : '#475569', fontWeight: opt === q.correctAnswer ? 'bold' : 'normal' }}>
                        {String.fromCharCode(65 + oIdx)}) {opt} {opt === q.correctAnswer && '✅'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterAdmin;
