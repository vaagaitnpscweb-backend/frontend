import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/MasterAdmin.css';
import logoImg from '../assets/logoImg.jpeg';
import { fetchTamilWord } from '../utils/tamilTransliterate';

//const API_BASE = 'http://localhost:5000';
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MasterAdmin() {
  const navigate = useNavigate();

  // 🔐 1. Auth State & Current User Check
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

  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // 🎯 Navigation States
  const [activeTab, setActiveTab] = useState(isMasterAdmin ? 'dashboard' : 'questions');
  const [selectedTopicTab, setSelectedTopicTab] = useState('All');
  const [selectedPdfExamTab, setSelectedPdfExamTab] = useState('All');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // 📄 Pagination States
  const [questionPage, setQuestionPage] = useState(1);
  const [testPage, setTestPage] = useState(1);
  const [caPage, setCaPage] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);
  const itemsPerPage = 10;

  // ⌨️ Tamil Typing Switch
  const [isTamilMode, setIsTamilMode] = useState(true);

  // 📊 Live Data States
  const [usersList, setUsersList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [livePdfs, setLivePdfs] = useState([]);
  const [freeTestsList, setFreeTestsList] = useState([]);
  const [slideList, setSlideList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [caList, setCaList] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // 👁️ Question Read-Only View Modal State
  const [viewingQuestion, setViewingQuestion] = useState(null);

  // ➕ Question Modal States
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    topic: 'தமிழ்',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  // 📰 Current Affairs Toggle & Form States
  const [showCaForm, setShowCaForm] = useState(false);
  const [editingCaId, setEditingCaId] = useState(null);
  const [caFormData, setCaFormData] = useState({
    date: '',
    category: 'TamilNadu',
    title: '',
    description: '',
    tags: ''
  });

  // ➕ Online Mock Test Modal States
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [testFormData, setTestFormData] = useState({
    examType: 'Online Test',
    title: '',
    selectedTopics: ['தமிழ்'],
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

  // ➕ User Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    contact: '',
    role: 'student'
  });

  // 📚 PDF Material Modal States
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
    if (!isMasterAdmin) {
      alert("⚠️ உங்களுக்கு அனுமதி இல்லை!");
      return;
    }
    const confirmRefund = window.confirm(`⚠️ நிச்சயமாக ₹${order.price} தொகையைத் திருப்பி அளிக்க விரும்புகிறீர்களா?`);
    if (!confirmRefund) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/refund-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ orderId: order._id, orderNo: order.orderNo, reason: 'Admin requested refund' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ பணம் வெற்றிகரமாகத் திருப்பி அளிக்கப்பட்டது (Refunded)!');
      } else {
        alert(data.message || '❌ Refund செய்வதில் சிக்கல்.');
      }
      loadAllData();
    } catch (err) {
      console.error('Refund error:', err);
      alert('❌ Server connection error during refund.');
    }
  };

  const handleTamilKeyDown = async (e, field) => {
    if (isTamilMode && (e.key === ' ' || e.key === 'Enter')) {
      const text = questionFormData[field] || '';
      const words = text.trim().split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        e.preventDefault();
        const tamilWord = await fetchTamilWord(lastWord);
        words[words.length - 1] = tamilWord;
        const newText = words.join(' ') + (e.key === ' ' ? ' ' : '');
        setQuestionFormData({ ...questionFormData, [field]: newText });
      }
    }
  };

  const handleCaTamilKeyDown = async (e, field) => {
    if (isTamilMode && (e.key === ' ' || e.key === 'Enter')) {
      const text = caFormData[field] || '';
      const words = text.trim().split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        e.preventDefault();
        const tamilWord = await fetchTamilWord(lastWord);
        words[words.length - 1] = tamilWord;
        const newText = words.join(' ') + (e.key === ' ' ? ' ' : '');
        setCaFormData({ ...caFormData, [field]: newText });
      }
    }
  };

  const handleOptionTamilKeyDown = async (e, index) => {
    if (isTamilMode && (e.key === ' ' || e.key === 'Enter')) {
      const text = questionFormData.options[index] || '';
      const words = text.trim().split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        e.preventDefault();
        const tamilWord = await fetchTamilWord(lastWord);
        words[words.length - 1] = tamilWord;
        const newText = words.join(' ') + (e.key === ' ' ? ' ' : '');
        const updatedOptions = [...questionFormData.options];
        updatedOptions[index] = newText;
        setQuestionFormData({ ...questionFormData, options: updatedOptions });
      }
    }
  };

  const handleOpenPdf = (driveUrl) => {
    if (!driveUrl || driveUrl.trim() === '') {
      alert("❌ PDF Link is not available!");
      return;
    }
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
    setQuestionFormData({ topic: selectedTopicTab !== 'All' ? selectedTopicTab : 'தமிழ்', question: '', options: ['', '', '', ''], correctAnswer: '' });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestionId(q.id || q._id);
    setQuestionFormData({ topic: q.topic || q.category || 'தமிழ்', question: q.question || '', options: q.options || ['', '', '', ''], correctAnswer: q.correctAnswer || '' });
    setShowQuestionModal(true);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionFormData.options];
    updatedOptions[index] = value;
    setQuestionFormData({ ...questionFormData, options: updatedOptions });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!questionFormData.question || !questionFormData.question.trim()) {
      alert("⚠️ தயவுசெய்து வினாவை உள்ளிடவும்!");
      return;
    }

    if (!questionFormData.correctAnswer) {
      alert("⚠️ தயவுசெய்து சரியான விடையைத் தேர்ந்தெடுக்கவும்!");
      return;
    }

    const cleanedOptions = questionFormData.options.map(opt => (opt ? opt.trim() : ''));
    const trimmedCorrectAnswer = questionFormData.correctAnswer.trim();

    if (!cleanedOptions.includes(trimmedCorrectAnswer)) {
      alert("⚠️ சரியான விடையானது கொடுக்கப்பட்டுள்ள விருப்பங்களில் (Options) ஒன்றாக இருக்க வேண்டும்!");
      return;
    }

    const payload = {
      type: 'quiz',
      id: editingQuestionId,
      subject: 'TNPSC',
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
        headers: { 
          'Content-Type': 'application/json', 
          'user-email': currentUser.email || 'abcdanand970@gmail.com' 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        alert(data.message || '❌ வினாவை சேமிக்க முடியவில்லை.');
        return;
      }

      setShowQuestionModal(false);
      loadAllData();
      alert('🎉 வினா வெற்றிகரமாக சேமிக்கப்பட்டது!');
    } catch (err) {
      console.error('Question save error:', err);
      alert('❌ சர்வருடன் இணைக்க முடியவில்லை. Backend ஆன்லைனில் உள்ளதா என சரிபார்க்கவும்.');
    }
  };

  const handleDeleteQuestion = async (id, text) => {
    if (!window.confirm(`Delete question: "${text}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reject-item`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ type: 'quiz', id, reason: 'Deleted by Admin' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || '❌ Error deleting item.');
      }
      loadAllData();
    } catch (err) { console.error(err); }
  };

  // Current Affairs Handlers
  const handleSaveCa = async (e) => {
    e.preventDefault();
    const endpoint = editingCaId ? `${API_BASE}/api/admin/edit-ca` : `${API_BASE}/api/ca/add-direct`;
    const method = editingCaId ? 'PUT' : 'POST';
    const payload = editingCaId ? { id: editingCaId, ...caFormData } : caFormData;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || '❌ Current Affairs save failed.');
        return;
      }

      alert('🎉 Current Affairs saved successfully!');
      setEditingCaId(null);
      setShowCaForm(false);
      setCaFormData({ date: '', category: 'TamilNadu', title: '', description: '', tags: '' });
      loadAllData();
    } catch (err) {
      console.error('Current Affairs save error:', err);
      alert('❌ Server error!');
    }
  };

  const handleEditCa = (item) => {
    setEditingCaId(item.id || item._id);
    setCaFormData({ date: item.date || '', category: item.category || 'TamilNadu', title: item.title || '', description: item.description || '', tags: Array.isArray(item.tags) ? item.tags.join(';') : (item.tags || '') });
    setShowCaForm(true);
  };

  const handleDeleteCa = async (id, title) => {
    if (!window.confirm(`Delete Current Affairs: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-ca/${id}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
    } catch (err) { console.error(err); }
  };

  // Online Mock Test Handlers
  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestFormData({ examType: 'Online Test', title: '', selectedTopics: ['தமிழ்'], selectionType: 'random', selectedQuestionIds: [], totalQuestions: 20, durationMinutes: 15, isFree: true, price: 0, startTime: '', endTime: '' });
    setShowTestModal(true);
  };

  const handleOpenEditTest = (t) => {
    setEditingTestId(t.id || t._id);
    setTestFormData({ examType: t.examType || 'Online Test', title: t.title || '', selectedTopics: t.selectedTopics || ['தமிழ்'], selectionType: t.selectionType || 'random', selectedQuestionIds: t.selectedQuestionIds || [], totalQuestions: t.totalQuestions || 20, durationMinutes: t.durationMinutes || 15, isFree: t.isFree ?? true, price: t.price || 0, startTime: t.startTime ? t.startTime.substring(0, 16) : '', endTime: t.endTime ? t.endTime.substring(0, 16) : '' });
    setShowTestModal(true);
  };

  const handleToggleTopicCheckbox = (topic) => {
    const current = testFormData.selectedTopics || [];
    if (current.includes(topic)) {
      if (current.length === 1) return alert("⚠️ குறைந்தபட்சம் 1 பாடமாவது வேண்டும்!");
      setTestFormData({ ...testFormData, selectedTopics: current.filter(t => t !== topic) });
    } else {
      setTestFormData({ ...testFormData, selectedTopics: [...current, topic] });
    }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();

    if (!testFormData.title.trim()) {
      alert('⚠️ Test title-ஐ உள்ளிடவும்.');
      return;
    }

    if (!testFormData.selectedTopics?.length) {
      alert('⚠️ குறைந்தபட்சம் 1 topic தேர்வு செய்யவும்.');
      return;
    }

    if (Number(testFormData.totalQuestions) < 1) {
      alert('⚠️ குறைந்தபட்சம் 1 question வேண்டும்.');
      return;
    }

    if (Number(testFormData.durationMinutes) < 1) {
      alert('⚠️ Test duration குறைந்தபட்சம் 1 minute இருக்க வேண்டும்.');
      return;
    }

    const endpoint = editingTestId ? `${API_BASE}/api/admin/edit-test` : `${API_BASE}/api/admin/add-test`;
    const method = editingTestId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ id: editingTestId, ...testFormData, status: 'active' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || '❌ Test save failed.');
        return;
      }

      setShowTestModal(false);
      loadAllData();
      alert('🎉 தேர்வு உருவாக்கப்பட்டது!');
    } catch (err) {
      console.error('Test save error:', err);
      alert('❌ Server connection error.');
    }
  };

  const handleDeleteTest = async (testId, title) => {
    if (!window.confirm(`Delete Test: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-test/${testId}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
    } catch (err) { console.error(err); }
  };

  const handleOpenTestPreview = (t) => {
    let testQuestions = t.selectionType === 'selective' && t.selectedQuestionIds ? quizzesList.filter(q => t.selectedQuestionIds.includes(q.id || q._id)) : quizzesList.filter(q => (t.selectedTopics || []).includes(q.topic || q.category));
    setPreviewTest({ test: t, questions: testQuestions });
  };

  // 📚 PDF Material Handlers
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
    if (!pdfFormData.questionPdfLink) return alert("⚠️ Provide question PDF link!");

    const isSchoolExam = pdfFormData.examType === '10th' || pdfFormData.examType === '12th';
    const pdfPrice = Number(pdfFormData.price);

    if (!pdfFormData.isFree && (!Number.isFinite(pdfPrice) || pdfPrice <= 0)) {
      alert('⚠️ Paid PDF-க்கு valid price கொடுக்கவும்.');
      return;
    }

    const payload = { 
      id: editingPdfId, 
      title: pdfFormData.title.trim(),
      examType: pdfFormData.examType, 
      questionPdfLink: pdfFormData.questionPdfLink.trim(), 
      answerPdfLink: isSchoolExam ? '' : (pdfFormData.answerPdfLink ? pdfFormData.answerPdfLink.trim() : ''),
      isFree: pdfFormData.isFree,
      price: pdfFormData.isFree ? 0 : pdfPrice, 
      status: 'active' 
    };

    const endpoint = editingPdfId ? `${API_BASE}/api/admin/edit-pdf` : `${API_BASE}/api/paid-pdfs/worker-upload`;
    const method = editingPdfId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, { 
        method, 
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowPdfModal(false);
        loadAllData();
        alert('🎉 PDF saved/updated successfully!');
      } else {
        alert(data.message || 'Error updating PDF');
      }
    } catch (err) {
      console.error('PDF save error:', err);
      alert('❌ PDF save/update செய்ய முடியவில்லை. Server connection-ஐ சரிபார்க்கவும்.');
    }
  };

  const handleDeletePdf = async (pdfId, title) => {
    if (!window.confirm(`Delete PDF: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-pdf/${pdfId}`, { method: 'DELETE', headers: { 'user-email': currentUser.email || 'abcdanand970@gmail.com' } });
      loadAllData();
    } catch (err) { console.error(err); }
  };

  // User Handlers
  const handleOpenAddUser = () => { if (!isMasterAdmin) return alert("⚠️ அனுமதி இல்லை!"); setEditingUserId(null); setUserFormData({ name: '', email: '', contact: '', role: 'student' }); setShowUserModal(true); };
  const handleOpenEditUser = (u) => { if (!isMasterAdmin) return alert("⚠️ அனுமதி இல்லை!"); setEditingUserId(u._id || u.id); setUserFormData({ name: u.name, email: u.email, contact: u.contact || '', role: u.role || 'student' }); setShowUserModal(true); };
  
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
        alert('🎉 User saved successfully!');
      } else {
        alert(data.message || 'Error saving user');
      }
    } catch (err) {
      alert('Server connection error!');
    }
  };

  const handleDeleteUser = async (email) => {
    if (!isMasterAdmin) return alert("⚠️ அனுமதி இல்லை!");
    if (email.trim().toLowerCase() === 'abcdanand970@gmail.com') {
      alert("⚠️ Master Admin-ஐ நீக்க முடியாது!");
      return;
    }
    if (!window.confirm(`Delete student: "${email}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/delete-user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'user-email': currentUser.email || 'abcdanand970@gmail.com' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || '❌ Error deleting user.');
      }
      loadAllData();
    } catch (err) { console.error(err); }
  };

  // Slide Handlers
  const handleAddSlide = () => { if (slideList.length >= 10) return alert('Max 10 slides.'); setSlideList([...slideList, { id: Date.now(), image: '', title: '', desc: '', expiryDate: '' }]); };
  const handleSlideChange = (idx, f, v) => {
    setSlideList(prev => prev.map((slide, i) => (
      i === idx ? { ...slide, [f]: v } : slide
    )));
  };

  const handleSlideImageUpload = (idx, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Image file மட்டும் upload செய்யவும்.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlideList(prev => prev.map((slide, i) => (
        i === idx ? { ...slide, image: reader.result } : slide
      )));
    };
    reader.onerror = () => alert('❌ Image read செய்ய முடியவில்லை.');
    reader.readAsDataURL(file);
  };

  const handleDeleteSlide = (idx) => { if (!window.confirm('Delete slide?')) return; setSlideList(slideList.filter((_, i) => i !== idx)); };
  const handleSaveAllSlides = async (e) => {
    e.preventDefault();
    if (slideList.some(slide => !slide.title?.trim())) {
      alert('⚠️ ஒவ்வொரு slide-க்கும் Title கொடுக்கவும்.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/update-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-email': currentUser.email || 'abcdanand970@gmail.com'
        },
        body: JSON.stringify({ slides: slideList })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update slides');
      }
      alert('🎉 Slides updated!');
      loadAllData();
    } catch (err) {
      console.error('Slide update error:', err);
      alert(`❌ Slides update செய்ய முடியவில்லை: ${err.message}`);
    }
  };

  // Filters & Pagination Slicing
  const filteredQuestions = selectedTopicTab === 'All' ? quizzesList : quizzesList.filter(q => (q.topic === selectedTopicTab || q.category === selectedTopicTab));
  const filteredPdfs = selectedPdfExamTab === 'All' ? livePdfs : livePdfs.filter(p => p.examType === selectedPdfExamTab);

  const filteredUsers = usersList.filter(u => {
    const query = userSearchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const contactMatch = u.contact?.toLowerCase().includes(query);
    return nameMatch || emailMatch || contactMatch;
  });

  const paginatedQuestions = filteredQuestions.slice((questionPage - 1) * itemsPerPage, questionPage * itemsPerPage);
  const totalQuestionPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const paginatedTests = freeTestsList.slice((testPage - 1) * itemsPerPage, testPage * itemsPerPage);
  const totalTestPages = Math.ceil(freeTestsList.length / itemsPerPage);

  const paginatedCa = caList.slice((caPage - 1) * itemsPerPage, caPage * itemsPerPage);
  const totalCaPages = Math.ceil(caList.length / itemsPerPage);

  const paginatedPdfs = filteredPdfs.slice((pdfPage - 1) * itemsPerPage, pdfPage * itemsPerPage);
  const totalPdfPages = Math.ceil(filteredPdfs.length / itemsPerPage);

  const subscribedOrders = ordersList.filter(o => !o.status?.includes('REFUNDED'));

  const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  };

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
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="Logo" className="sidebar-logo" />
          <span className="sidebar-title">VAAGAI TUITION</span>
        </div>

        <nav className="sidebar-nav">
          {isMasterAdmin && (
            <>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span className="nav-icon">📊</span> Dashboard</button>
              <button className={`nav-item ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}><span className="nav-icon">👑</span> Subscribers ({subscribedOrders.length})</button>
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
          {isMasterAdmin && activeTab === 'dashboard' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">DASHBOARD</h2></div>
              <div className="stats-grid">
                <div className="stat-card"><div><div className="stat-title">Total Questions</div><div className="stat-value">{quizzesList.length}</div></div><div className="stat-icon-wrapper icon-blue">❓</div></div>
                <div className="stat-card"><div><div className="stat-title">Registered Users</div><div className="stat-value">{usersList.length}</div></div><div className="stat-icon-wrapper icon-orange">👥</div></div>
                <div className="stat-card"><div><div className="stat-title">Total Revenue</div><div className="stat-value" style={{ color: '#16a34a' }}>₹{totalRevenue}</div></div><div className="stat-icon-wrapper icon-cyan" style={{ background: '#16a34a' }}>₹</div></div>
              </div>
            </div>
          )}

          {isMasterAdmin && activeTab === 'subscribers' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">SUBSCRIBED MEMBERS LIST ({subscribedOrders.length})</h2></div>
              <div className="admin-card">
                <table className="custom-table">
                  <thead><tr><th style={{ width: '40px' }}>#</th><th>Order ID</th><th>Student / Buyer</th><th>Course / Plan Title</th><th>Amount Paid</th><th>Payment Status</th><th style={{ textAlign: 'center', width: '130px' }}>Action</th></tr></thead>
                  <tbody>
                    {subscribedOrders.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>இன்னும் சந்தாதாரர்கள் யாரும் இணையவில்லை.</td></tr> :
                      subscribedOrders.map((sub, idx) => (
                        <tr key={sub._id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{sub.orderNo || sub._id}</b></td>
                          <td><div><b>{sub.shippingAddress?.name || 'Student'}</b></div><span style={{ fontSize: '12px', color: '#64748b' }}>{sub.shippingAddress?.phone || 'Digital Member'}</span></td>
                          <td><b>{sub.bookTitle}</b></td>
                          <td style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{sub.price}</td>
                          <td><span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>🟢 Active Member</span></td>
                          <td style={{ textAlign: 'center' }}><button onClick={() => handleRefundPayment(sub)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refund</button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">QUESTION BANK ({filteredQuestions.length} வினாக்கள்)</h2><button onClick={handleOpenAddQuestion} className="btn-add-primary">+ Add Question</button></div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {['All', 'தமிழ்', 'கணிதம்', 'அறிவியல்', 'சமூக அறிவியல்', 'நடப்பு நிகழ்வுகள்'].map(topic => (
                  <button key={topic} onClick={() => { setSelectedTopicTab(topic); setQuestionPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', border: selectedTopicTab === topic ? '2px solid #17a983' : '1px solid #cbd5e1', background: selectedTopicTab === topic ? '#17a983' : '#ffffff', color: selectedTopicTab === topic ? '#ffffff' : '#475569', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>{topic === 'All' ? '🌐 அனைத்து வினாக்களும்' : topic}</button>
                ))}
              </div>
              <div className="admin-card">
                <table className="custom-table">
                  <thead><tr><th style={{ width: '40px' }}>#</th><th>Topic</th><th>Question</th><th>Correct Answer</th><th style={{ textAlign: 'center', width: '130px' }}>Action</th></tr></thead>
                  <tbody>
                    {paginatedQuestions.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>வினாக்கள் எதுவும் இல்லை.</td></tr> :
                      paginatedQuestions.map((q, idx) => (
                        <tr key={q.id || q._id || idx}>
                          <td>{(questionPage - 1) * itemsPerPage + idx + 1}</td>
                          <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>{q.topic || q.category || 'தமிழ்'}</span></td>
                          <td><b>{q.question}</b></td>
                          <td style={{ color: '#16a34a', fontWeight: 'bold' }}>{q.correctAnswer}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => setViewingQuestion(q)} className="btn-action-round bg-view" title="View Question">👁</button>
                              <button onClick={() => handleOpenEditQuestion(q)} className="btn-action-round bg-edit" title="Edit">✏</button>
                              <button onClick={() => handleDeleteQuestion(q.id || q._id, q.question)} className="btn-action-round bg-delete" title="Delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                {totalQuestionPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                    <button disabled={questionPage === 1} onClick={() => setQuestionPage(questionPage - 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>&laquo; Prev</button>
                    {Array.from({ length: totalQuestionPages }, (_, i) => i + 1).map(num => <button key={num} onClick={() => setQuestionPage(num)} style={{ padding: '6px 12px', background: questionPage === num ? '#17a983' : '#fff', color: questionPage === num ? '#fff' : '#334155', cursor: 'pointer' }}>{num}</button>)}
                    <button disabled={questionPage === totalQuestionPages} onClick={() => setQuestionPage(questionPage + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next &raquo;</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'freetest' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">MANAGE ONLINE & SCHEDULED TESTS</h2><button onClick={handleOpenAddTest} className="btn-add-primary">+ Add Test</button></div>
              <div className="admin-card">
                <table className="custom-table">
                  <thead><tr><th style={{ width: '40px' }}>#</th><th>Test Title</th><th>Topics</th><th>Schedule</th><th>Qns</th><th>Duration</th><th style={{ textAlign: 'center', width: '150px' }}>Action</th></tr></thead>
                  <tbody>
                    {paginatedTests.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No tests found.</td></tr> :
                      paginatedTests.map((t, idx) => (
                        <tr key={t.id || t._id || idx}>
                          <td>{(testPage - 1) * itemsPerPage + idx + 1}</td>
                          <td><b>{t.title}</b></td>
                          <td><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{(t.selectedTopics || ['தமிழ்']).map((tp, i) => <span key={i} style={{ background: '#f1f5f9', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{tp}</span>)}</div></td>
                          <td>{t.startTime ? <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 'bold' }}>⏱️ {formatDateTime(t.startTime)}</span> : <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12px' }}>🟢 Always Live</span>}</td>
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
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 📚 PDF MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">MANAGE EXAM PDF MATERIALS ({filteredPdfs.length})</h2>
                <button onClick={handleOpenAddPdf} className="btn-add-primary">+ Add PDF</button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {['All', '10th', '12th', 'TNPSC', 'RRB', 'SI', 'PC', 'General'].map(exam => (
                  <button
                    key={exam}
                    onClick={() => { setSelectedPdfExamTab(exam); setPdfPage(1); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: selectedPdfExamTab === exam ? '2px solid #17a983' : '1px solid #cbd5e1',
                      background: selectedPdfExamTab === exam ? '#17a983' : '#ffffff',
                      color: selectedPdfExamTab === exam ? '#ffffff' : '#475569',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {exam === 'All' ? '🌐 All Classes / Exams' : exam}
                  </button>
                ))}
              </div>

              <div className="admin-card">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Material Title</th>
                      <th>Exam / Class Category</th>
                      <th>Access Type / Price</th>
                      <th style={{ textAlign: 'center', width: '180px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPdfs.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No PDF materials found for this category.</td></tr>
                    ) : (
                      paginatedPdfs.map((p, idx) => (
                        <tr key={p.id || p._id || idx}>
                          <td>{(pdfPage - 1) * itemsPerPage + idx + 1}</td>
                          <td><b>{p.title}</b></td>
                          <td>
                            <span style={{ background: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 'bold' }}>
                              {p.examType || 'General'}
                            </span>
                          </td>
                          <td>
                            <span style={{ background: p.isFree ? '#dcfce7' : '#fef9c3', color: p.isFree ? '#15803d' : '#854d0e', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                              {p.isFree ? '🎉 FREE' : `₹ ${p.price || 5}`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => handleOpenPdf(p.questionPdfLink)} className="btn-action-round bg-view" title="View Question PDF">👁</button>
                              {p.answerPdfLink ? (
                                <button onClick={() => handleOpenPdf(p.answerPdfLink)} className="btn-action-round bg-key" title="View Answer Key PDF">🔑</button>
                              ) : (
                                <span className="action-placeholder"></span>
                              )}
                              <button onClick={() => handleOpenEditPdf(p)} className="btn-action-round bg-edit" title="Edit PDF">✏</button>
                              <button onClick={() => handleDeletePdf(p.id || p._id, p.title)} className="btn-action-round bg-delete" title="Delete PDF">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {totalPdfPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                    <button disabled={pdfPage === 1} onClick={() => setPdfPage(pdfPage - 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>&laquo; Prev</button>
                    {Array.from({ length: totalPdfPages }, (_, i) => i + 1).map(num => <button key={num} onClick={() => setPdfPage(num)} style={{ padding: '6px 12px', background: pdfPage === num ? '#17a983' : '#fff', color: pdfPage === num ? '#fff' : '#334155', cursor: 'pointer' }}>{num}</button>)}
                    <button disabled={pdfPage === totalPdfPages} onClick={() => setPdfPage(pdfPage + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next &raquo;</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ca' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">MANAGE DAILY CURRENT AFFAIRS ({caList.length})</h2><button onClick={() => { setShowCaForm(!showCaForm); setEditingCaId(null); setCaFormData({ date: '', category: 'TamilNadu', title: '', description: '', tags: '' }); }} className="btn-add-primary">{showCaForm ? '✕ Close' : '+ Add Current Affairs'}</button></div>
              {showCaForm && (
                <div className="admin-card" style={{ maxWidth: '750px', margin: '0 auto 25px auto' }}>
                  <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>{editingCaId ? '✏️ Edit News' : '➕ Publish News'}</h3>
                  <form onSubmit={handleSaveCa}>
                    <div style={{ marginBottom: '12px' }}><label className="modal-label">Date:</label><input type="date" value={caFormData.date} onChange={e => setCaFormData({ ...caFormData, date: e.target.value })} required className="modal-input" /></div>
                    <div style={{ marginBottom: '12px' }}><label className="modal-label">Category:</label><select value={caFormData.category} onChange={e => setCaFormData({ ...caFormData, category: e.target.value })} className="modal-input"><option value="TamilNadu">TamilNadu</option><option value="National">National</option><option value="International">International</option><option value="Sports">Sports</option><option value="Awards">Awards</option></select></div>
                    <div style={{ marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}><label className="modal-label" style={{ margin: 0 }}>Title:</label><button type="button" onClick={() => setIsTamilMode(!isTamilMode)} style={{ background: isTamilMode ? '#17a983' : '#64748b', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer' }}>{isTamilMode ? '⌨️ Tamil: ON' : '⌨️ English'}</button></div><input type="text" value={caFormData.title} onChange={e => setCaFormData({ ...caFormData, title: e.target.value })} onKeyDown={e => handleCaTamilKeyDown(e, 'title')} required className="modal-input" /></div>
                    <div style={{ marginBottom: '12px' }}><label className="modal-label">Description:</label><textarea value={caFormData.description} onChange={e => setCaFormData({ ...caFormData, description: e.target.value })} onKeyDown={e => handleCaTamilKeyDown(e, 'description')} required className="modal-input" style={{ height: '90px' }}></textarea></div>
                    <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setShowCaForm(false)} className="btn-modal-cancel" style={{ flex: '1' }}>Cancel</button><button type="submit" style={{ background: '#17a983', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: '2' }}>{editingCaId ? 'Update' : 'Publish'}</button></div>
                  </form>
                </div>
              )}
              <div className="admin-card">
                <table className="custom-table">
                  <thead><tr><th style={{ width: '40px' }}>#</th><th>Date & Category</th><th>Title</th><th style={{ textAlign: 'center', width: '140px' }}>Action</th></tr></thead>
                  <tbody>
                    {paginatedCa.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No news.</td></tr> :
                      paginatedCa.map((item, idx) => (
                        <tr key={item.id || item._id || idx}>
                          <td>{(caPage - 1) * itemsPerPage + idx + 1}</td>
                          <td><div><b>{item.date}</b></div><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{item.category}</span></td>
                          <td><b>{item.title}</b></td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => alert(item.description)} className="btn-action-round bg-view" title="View">👁</button>
                              <button onClick={() => handleEditCa(item)} className="btn-action-round bg-edit" title="Edit">✏</button>
                              <button onClick={() => handleDeleteCa(item.id || item._id, item.title)} className="btn-action-round bg-delete" title="Delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👥 USERS DIRECTORY TAB WITH SEARCH */}
          {isMasterAdmin && activeTab === 'users' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">REGISTERED STUDENTS DIRECTORY ({filteredUsers.length})</h2>
                <button onClick={handleOpenAddUser} className="btn-add-primary">+ Add User</button>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search by Name, Email or Phone Number..." 
                  value={userSearchQuery} 
                  onChange={e => setUserSearchQuery(e.target.value)} 
                  style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}
                />
              </div>

              <div className="admin-card">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Contact No</th>
                      <th>Role</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No users found matching your search.</td></tr>
                    ) : (
                      filteredUsers.map((u, idx) => (
                        <tr key={u._id || u.id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{u.name}</b></td>
                          <td>{u.email}</td>
                          <td>{u.contact || 'N/A'}</td>
                          <td>
                            <span style={{ background: u.role === 'admin' ? '#dcfce7' : '#f1f5f9', color: u.role === 'admin' ? '#15803d' : '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {u.role || 'student'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => alert(`Name: ${u.name}\nEmail: ${u.email}\nPhone: ${u.contact || 'N/A'}`)} className="btn-action-round bg-view" title="View User">👁</button>
                              <button onClick={() => handleOpenEditUser(u)} className="btn-action-round bg-edit" title="Edit User">✏</button>
                              <button onClick={() => handleDeleteUser(u.email)} className="btn-action-round bg-delete" title="Delete User">🗑</button>
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

          {isMasterAdmin && activeTab === 'orders' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">TRANSACTIONS & REFUNDS</h2></div>
              <div className="admin-card">
                <table className="custom-table">
                  <thead><tr><th>Order No</th><th>Title</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                  <tbody>
                    {ordersList.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No orders.</td></tr> :
                      ordersList.map((o, idx) => {
                        const isRefunded = o.status?.includes('REFUNDED');
                        return (
                          <tr key={idx}>
                            <td><b>{o.orderNo || o._id}</b></td>
                            <td>{o.bookTitle}</td>
                            <td style={{ fontWeight: 'bold', color: isRefunded ? '#94a3b8' : '#16a34a', textDecoration: isRefunded ? 'line-through' : 'none' }}>₹{o.price}</td>
                            <td><span style={{ color: isRefunded ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{o.status}</span></td>
                            <td style={{ textAlign: 'center' }}>{!isRefunded ? <button onClick={() => handleRefundPayment(o)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Refund</button> : <span style={{ fontSize: '12px', color: '#64748b' }}>✓ Returned</span>}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'slider' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">HOMEPAGE BANNER SLIDES ({slideList.length}/10)</h2><button onClick={handleAddSlide} className="btn-add-primary">+ Add Slide</button></div>
              <div className="admin-card">
                <form onSubmit={handleSaveAllSlides}>
                  {slideList.length === 0 ? <p style={{ color: '#94a3b8', padding: '20px 0' }}>No slides added.</p> :
                    slideList.map((slide, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e2e8f0', borderLeft: '4px solid #17a983' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><b>Slide #{idx + 1}</b><button type="button" onClick={() => handleDeleteSlide(idx)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑 Delete</button></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '15px', alignItems: 'center' }}>
                          <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Image:</label><input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e.target.files[0])} style={{ display: 'block', marginTop: '4px', fontSize: '12px' }} />{slide.image && <img src={slide.image} alt="Slide" style={{ width: '110px', height: '55px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px' }} />}</div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Title:</label>
                            <input type="text" value={slide.title || ''} onChange={(e) => handleSlideChange(idx, 'title', e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Description:</label>
                            <input type="text" value={slide.desc || ''} onChange={(e) => handleSlideChange(idx, 'desc', e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Expiry Date:</label><input type="date" value={slide.expiryDate || ''} onChange={(e) => handleSlideChange(idx, 'expiryDate', e.target.value)} style={{ width: '100%', padding: '7px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
                        </div>
                      </div>
                    ))
                  }
                  {slideList.length > 0 && <button type="submit" style={{ padding: '10px 20px', background: '#17a983', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save All Slides</button>}
                </form>
              </div>
            </div>
          )}
        </main>
        <footer className="footer-copyright">Vaagai Tuition © 2026. All rights reserved.</footer>
      </div>

      {/* 👁️ Question View Modal (Read-Only) */}
      {viewingQuestion && (
        <div className="modal-overlay" onClick={() => setViewingQuestion(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f766e' }}>👁️ வினா பார்வை (Read-Only)</h3>
              <button onClick={() => setViewingQuestion(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="modal-label">Topic / பாடம்</label>
              <input 
                type="text" 
                value={viewingQuestion.topic || viewingQuestion.category || 'தமிழ்'} 
                readOnly 
                className="modal-input" 
                style={{ background: '#f8fafc', color: '#0284c7', fontWeight: 'bold' }} 
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="modal-label">Question / வினா</label>
              <textarea 
                value={viewingQuestion.question} 
                readOnly 
                className="modal-input" 
                style={{ height: '75px', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }} 
              />
            </div>

            <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label className="modal-label" style={{ color: '#0f766e', marginBottom: '8px' }}>Options / விருப்பங்கள்:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {viewingQuestion.options && viewingQuestion.options.map((opt, idx) => {
                  const isCorrect = opt === viewingQuestion.correctAnswer;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '8px 10px', 
                        borderRadius: '4px', 
                        background: isCorrect ? '#dcfce7' : '#ffffff', 
                        border: isCorrect ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        color: isCorrect ? '#15803d' : '#334155',
                        fontWeight: isCorrect ? 'bold' : 'normal',
                        fontSize: '13px'
                      }}
                    >
                      <span>{String.fromCharCode(65 + idx)})</span> {opt} {isCorrect && ' ✅'}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label className="modal-label">Correct Answer / சரியான விடை</label>
              <input 
                type="text" 
                value={viewingQuestion.correctAnswer} 
                readOnly 
                className="modal-input" 
                style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: 'bold' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setViewingQuestion(null)} 
                className="btn-modal-cancel" 
                style={{ padding: '8px 20px' }}
              >
                மூடுக (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 PDF Modal */}
      {showPdfModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>
              {editingPdfId ? '✏️ Edit PDF Material' : '➕ Add Exam PDF Material'}
            </h3>
            <form onSubmit={handleSavePdf}>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Exam / Class Category (தேர்வு அல்லது வகுப்பு பிரிவு)</label>
                <select value={pdfFormData.examType} onChange={e => setPdfFormData({ ...pdfFormData, examType: e.target.value })} className="modal-input">
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard (+2)</option>
                  <option value="TNPSC">TNPSC</option>
                  <option value="RRB">RRB</option>
                  <option value="SI">SI</option>
                  <option value="PC">PC</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Access Type</label>
                <select value={pdfFormData.isFree ? 'free' : 'paid'} onChange={e => {
                  const isFree = e.target.value === 'free';
                  setPdfFormData({ ...pdfFormData, isFree, price: isFree ? 0 : 5 });
                }} className="modal-input">
                  <option value="free">🎉 Free</option>
                  <option value="paid">💳 Paid (₹)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Material Title</label>
                <input type="text" placeholder="e.g. 10th Science Unit 1 Model Test" value={pdfFormData.title} onChange={e => setPdfFormData({ ...pdfFormData, title: e.target.value })} required className="modal-input" />
              </div>

              {!pdfFormData.isFree && (
                <div style={{ marginBottom: '12px' }}>
                  <label className="modal-label">Price (₹)</label>
                  <input type="number" min="1" value={pdfFormData.price} onChange={e => setPdfFormData({ ...pdfFormData, price: e.target.value })} required className="modal-input" />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">📄 Question Paper (Google Drive Link)</label>
                <input type="url" placeholder="https://drive.google.com/file/d/.../view" value={pdfFormData.questionPdfLink} onChange={e => setPdfFormData({ ...pdfFormData, questionPdfLink: e.target.value })} required className="modal-input" />
              </div>

              {pdfFormData.examType !== '10th' && pdfFormData.examType !== '12th' && (
                <div style={{ marginBottom: '15px' }}>
                  <label className="modal-label">🔑 Answer Key (Google Drive Link) - Optional</label>
                  <input type="url" placeholder="https://drive.google.com/file/d/.../view (Optional)" value={pdfFormData.answerPdfLink} onChange={e => setPdfFormData({ ...pdfFormData, answerPdfLink: e.target.value })} className="modal-input" />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowPdfModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">{editingPdfId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 Test Modal */}
      {showTestModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingTestId ? '✏️ Edit Test' : '➕ Add Test'}</h3>
            <form onSubmit={handleSaveTest}>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Test Title</label>
                <input type="text" value={testFormData.title} onChange={e => setTestFormData({ ...testFormData, title: e.target.value })} required className="modal-input" placeholder="e.g. TNPSC General Tamil Mock Test" />
              </div>

              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <label className="modal-label" style={{ color: '#0f766e', marginBottom: '8px' }}>Topics:</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['தமிழ்', 'கணிதம்', 'அறிவியல்', 'சமூக அறிவியல்', 'நடப்பு நிகழ்வுகள்'].map(topic => (
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

              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Start Time (Optional - Schedule)</label>
                <input type="datetime-local" value={testFormData.startTime} onChange={e => setTestFormData({ ...testFormData, startTime: e.target.value })} className="modal-input" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowTestModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">{editingTestId ? 'Update Test' : 'Save Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ Preview Test Modal */}
      {previewTest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f766e' }}>👁️ Test Preview: {previewTest.test.title}</h3>
              <button onClick={() => setPreviewTest(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '15px', fontSize: '13px', color: '#64748b' }}>
              <span>⏱️ Duration: <b>{previewTest.test.durationMinutes} Mins</b> | </span>
              <span>📊 Total Qns: <b>{previewTest.test.totalQuestions}</b> | </span>
              <span>🎯 Available Qns Matched: <b>{previewTest.questions.length}</b></span>
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
            <div style={{ textAlign: 'right', marginTop: '15px' }}>
              <button onClick={() => setPreviewTest(null)} className="btn-modal-cancel">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ❓ Question Modal */}
      {showQuestionModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingQuestionId ? '✏️ Edit Question' : '➕ Add Question'}</h3>
            <form onSubmit={handleSaveQuestion}>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Topic</label>
                <select value={questionFormData.topic} onChange={e => setQuestionFormData({ ...questionFormData, topic: e.target.value })} className="modal-input">
                  <option value="தமிழ்">தமிழ்</option>
                  <option value="கணிதம்">கணிதம்</option>
                  <option value="அறிவியல்">அறிவியல்</option>
                  <option value="சமூக அறிவியல்">சமூக அறிவியல்</option>
                  <option value="நடப்பு நிகழ்வுகள்">நடப்பு நிகழ்வுகள்</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="modal-label">Question</label>
                <textarea value={questionFormData.question} onChange={e => setQuestionFormData({ ...questionFormData, question: e.target.value })} onKeyDown={e => handleTamilKeyDown(e, 'question')} required className="modal-input" style={{ height: '70px' }} />
              </div>
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <label className="modal-label" style={{ color: '#0f766e' }}>Options (Select radio for correct answer):</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name="correctOption" checked={questionFormData.correctAnswer === questionFormData.options[idx] && questionFormData.options[idx] !== ''} onChange={() => setQuestionFormData({ ...questionFormData, correctAnswer: questionFormData.options[idx] })} />
                      <input type="text" placeholder={`Option ${lbl}`} value={questionFormData.options[idx]} onChange={e => handleOptionChange(idx, e.target.value)} onKeyDown={e => handleOptionTamilKeyDown(e, idx)} required className="modal-input" style={{ padding: '6px' }} />
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="modal-label">Correct Answer</label>
                <input type="text" value={questionFormData.correctAnswer} readOnly className="modal-input" style={{ background: '#f1f5f9', fontWeight: 'bold', color: '#15803d' }} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👥 User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0 }}>{editingUserId ? '✏️ Edit Student / User' : '➕ Add New User'}</h3>
            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Name (பெயர்)</label>
                <input type="text" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} required className="modal-input" placeholder="Enter name" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Valid Email ID (சரியான மின்னஞ்சல்)</label>
                <input type="email" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} required className="modal-input" placeholder="example@gmail.com" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label className="modal-label">Contact No (தொலைபேசி எண்)</label>
                <input type="text" value={userFormData.contact} onChange={e => setUserFormData({ ...userFormData, contact: e.target.value })} className="modal-input" placeholder="Phone number" />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="modal-label">Role (பதவி / பங்கு)</label>
                <select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })} className="modal-input">
                  <option value="student">Student</option>
                  <option value="user">User</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">{editingUserId ? 'Update User' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterAdmin;
