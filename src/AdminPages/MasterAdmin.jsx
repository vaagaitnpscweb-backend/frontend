import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
/*import '../Styles/MasterAdmin.css';*/
import logoImg from '../assets/logoImg.jpeg';
import { fetchTamilWord } from '../utils/tamilTransliterate';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MasterAdmin() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : {};
    } catch {
      return {};
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(currentUser.email));
  const isMasterAdmin =
    (currentUser.email || '').toLowerCase() === 'abcdanand970@gmail.com' ||
    currentUser.role === 'admin';

  // 🔔 Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  // 📱 Mobile Sidebar State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth States
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 🎯 Navigation & Dropdowns
  const [activeTab, setActiveTab] = useState(isMasterAdmin ? 'dashboard' : 'questions');
  const [selectedTopicTab, setSelectedTopicTab] = useState('All');

  // 🔍 Refund Mobile Search Filter State
  const [refundMobileSearch, setRefundMobileSearch] = useState('');

  // Dropdown States for Sidebar Submenus
  const [reportsSubmenuOpen, setReportsSubmenuOpen] = useState(false);
  const [manageSubmenuOpen, setManageSubmenuOpen] = useState(false);
  const [notificationSubmenuOpen, setNotificationSubmenuOpen] = useState(false);

  // 📊 Live Data States
  const [usersList, setUsersList] = useState([]);
  const [subscribersList, setSubscribersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [workersList, setWorkersList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [livePdfs, setLivePdfs] = useState([]);
  const [freeTestsList, setFreeTestsList] = useState([]);
  const [slideList, setSlideList] = useState([]);
  const [caList, setCaList] = useState([]);

  // 🔔 Notification Management States (With Start & End Date/Time)
  const [examNotifsList, setExamNotifsList] = useState([
    { 
      id: 1, 
      title: "TNPSC Group 4 & Model Tests Announced!", 
      description: "Model tests are live now.", 
      pdfLink: "", 
      targetUrl: "/mocktest",
      fromDate: new Date().toISOString().split('T')[0],
      fromTime: '00:00',
      toDate: '',
      toTime: '23:59'
    }
  ]);
  const [studyNotesList, setStudyNotesList] = useState([
    { 
      id: 1, 
      text: "📕 Tamil Grammar Notes & Model Question Sets [Vaagai Special]", 
      link: "/premium", 
      pdfLink: "",
      fromDate: new Date().toISOString().split('T')[0],
      fromTime: '00:00',
      toDate: '',
      toTime: '23:59'
    }
  ]);
  const [masterAlertsList, setMasterAlertsList] = useState([
    "📢 Welcome to Vaagai Tuition Center! New CBT Mock Exams are live now.",
    "🚀 Attend daily tests and boost your exam preparation points!"
  ]);

  // Modal States for Notifications with Start/End Time
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [editingNotifId, setEditingNotifId] = useState(null);
  const [notifFormData, setNotifFormData] = useState({ 
    title: '', 
    description: '', 
    pdfLink: '', 
    targetUrl: '/mocktest',
    fromDate: new Date().toISOString().split('T')[0],
    fromTime: '00:00',
    toDate: '',
    toTime: '23:59'
  });

  // 🖼️ Home Slider Modal & Form States
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    image: '',
    fromDate: new Date().toISOString().split('T')[0],
    fromTime: '00:00',
    toDate: '',
    toTime: '23:59',
    status: 'Active',
    order: 1
  });

  // 📰 Current Affairs State & Form
  const [showCaModal, setShowCaModal] = useState(false);
  const [editingCaId, setEditingCaId] = useState(null);
  const [customCategories, setCustomCategories] = useState([
    'Tamil Nadu', 'India', 'World', 'Sports', 'Political', 'TNPSC', 'RRB', 'SI', 'PC', 'General'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [caFormData, setCaFormData] = useState({
    category: 'Tamil Nadu',
    title: '',
    description: '',
    publishDate: new Date().toISOString().split('T')[0],
    pdfUrl: ''
  });
  const [viewingCa, setViewingCa] = useState(null);

  // 📂 Manage Sub-feature States (UPGRADED for Question Sets)
  const [questionSetsList, setQuestionSetsList] = useState([
    { id: 1, category: 'Tamil', subCategory: 'இலக்கணம் (Grammar)', status: 'Active' },
    { id: 2, category: 'Tamil', subCategory: 'இலக்கியம் (Literature)', status: 'Active' },
    { id: 3, category: 'Maths', subCategory: 'Simplification', status: 'Active' },
    { id: 4, category: 'Science', subCategory: 'Physics', status: 'Active' },
    { id: 5, category: 'General', subCategory: 'General Knowledge', status: 'Active' }
  ]);
  const [showQsetModal, setShowQsetModal] = useState(false);
  const [editingQsetId, setEditingQsetId] = useState(null);
  const [qsetFormData, setQsetFormData] = useState({ category: '', subCategory: '', status: 'Active' });

  const [districtsList, setDistrictsList] = useState(['Dharmapuri', 'Salem', 'Krishnagiri', 'Chennai']);
  const [statesList, setStatesList] = useState(['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh']);
  const [newItemName, setNewItemName] = useState('');

  // 🔒 Worker Form & Toggle State
  const [showCreateWorkerForm, setShowCreateWorkerForm] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    password: '',
    contact: '',
    allowedTabs: ['questions', 'materials', 'slider', 'current-affairs', 'notifications'],
    menuPermissions: {
      questions: { view: true, edit: true, delete: false },
      freetest: { view: true, edit: true, delete: false },
      materials: { view: true, edit: true, delete: false },
      slider: { view: true, edit: true, delete: false },
      'current-affairs': { view: true, edit: true, delete: false },
      notifications: { view: true, edit: true, delete: false }
    }
  });

  // 📊 Reports Submenu States & Date Filters
  const [reportType, setReportType] = useState('regular');
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [reportFromDate, setReportFromDate] = useState(firstDayOfMonthStr);
  const [reportToDate, setReportToDate] = useState(todayStr);
  const [reportsList, setReportsList] = useState([]);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Pagination
  const [questionPage, setQuestionPage] = useState(1);
  const [testPage, setTestPage] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);
  const [caPage, setCaPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & View States
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [selectedRadioIndex, setSelectedRadioIndex] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    category: 'Tamil',
    subCategory: 'இலக்கணம் (Grammar)',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  // 🔤 Tamil Transliteration On/Off State
  const [isTamilTypingEnabled, setIsTamilTypingEnabled] = useState(true);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    contact: ''
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

  // 🆕 Generate Dynamic Topics from Managed Question Sets List
  const availableTestTopics = questionSetsList
    .filter(q => q.status === 'Active')
    .reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      if (!acc[curr.category].includes(curr.subCategory)) {
        acc[curr.category].push(curr.subCategory);
      }
      return acc;
    }, {});

  // 📝 Online Test Form State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testModalStep, setTestModalStep] = useState(1);
  const [editingTestId, setEditingTestId] = useState(null);
  const [testFormData, setTestFormData] = useState({
    examType: 'Online Test',
    title: '',
    selectedTopics: ['இலக்கணம் (Grammar)'],
    topicQuestionCounts: { 'இலக்கணம் (Grammar)': 20 },
    questionSelectionType: 'Random',
    totalQuestions: 20,
    durationMinutes: 15,
    isFree: true,
    price: 0,
    fromDate: new Date().toISOString().split('T')[0],
    fromTime: '00:00',
    toDate: '',
    toTime: '23:59'
  });
  const [previewTest, setPreviewTest] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    'user-email': currentUser.email || 'abcdanand970@gmail.com'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: adminUserId.trim(), password: adminPassword })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          setActiveTab(data.user.role === 'admin' ? 'dashboard' : 'questions');
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

  const fetchUsers = useCallback(() => {
    fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsersList(d.users || []); });
  }, [currentUser.email]);

  const fetchSubscribers = useCallback(() => {
    setIsDataLoading(true);
    fetch(`${API_BASE}/api/admin/subscriptions`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSubscribersList(d.subscriptions || []); })
      .finally(() => setIsDataLoading(false));
  }, [currentUser.email]);

  const fetchOrders = useCallback(() => {
    setIsDataLoading(true);
    fetch(`${API_BASE}/api/admin/orders`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrdersList(d.orders || []); })
      .finally(() => setIsDataLoading(false));
  }, [currentUser.email]);

  const fetchWorkers = useCallback(() => {
    fetch(`${API_BASE}/api/admin/workers`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { if (d.success) setWorkersList(d.workers || []); });
  }, [currentUser.email]);

  const fetchCurrentAffairsAdmin = useCallback(() => {
    setIsDataLoading(true);
    fetch(`${API_BASE}/api/current-affairs/admin-all`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCaList(d); })
      .catch(() => {})
      .finally(() => setIsDataLoading(false));
  }, [currentUser.email]);

  const fetchSlides = useCallback(() => {
    setIsDataLoading(true);
    fetch(`${API_BASE}/api/admin/slides`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.slides)) {
          setSlideList(d.slides);
        } else {
          fetch(`${API_BASE}/api/home/slides`)
            .then(res => res.json())
            .then(resData => { if (resData.success) setSlideList(resData.slides || []); });
        }
      })
      .catch(() => {})
      .finally(() => setIsDataLoading(false));
  }, [currentUser.email]);

  const fetchPointsReport = useCallback(() => {
    setIsReportLoading(true);
    const query = new URLSearchParams({
      type: reportType,
      from: reportFromDate || '',
      to: reportToDate || ''
    }).toString();

    fetch(`${API_BASE}/api/admin/user-test-points?${query}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.reports)) {
          setReportsList(d.reports);
        } else if (Array.isArray(d)) {
          setReportsList(d);
        } else {
          setReportsList([]);
        }
      })
      .catch(() => {
        setReportsList([]);
      })
      .finally(() => setIsReportLoading(false));
  }, [reportType, reportFromDate, reportToDate, currentUser.email]);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (activeTab === 'dashboard') {
      setIsDataLoading(true);
      fetchOrders();
      fetchSubscribers();
      fetchUsers();
      setIsDataLoading(false);

      if (quizzesList.length === 0) {
        fetch(`${API_BASE}/api/quiz/questions`)
          .then((r) => r.json())
          .then((d) => { if (d.success) setQuizzesList(d.questions || []); });
      }
    }

    if (activeTab === 'subscribers') fetchSubscribers();
    if (activeTab === 'orders' || activeTab === 'refund_management') {
      fetchOrders();
      fetchUsers();
      fetchSubscribers();
    }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'control') fetchWorkers();
    if (activeTab === 'current-affairs') fetchCurrentAffairsAdmin();
    if (activeTab === 'reports') fetchPointsReport();
    if (activeTab === 'slider') fetchSlides();

    if (activeTab === 'questions' && quizzesList.length === 0) {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/quiz/questions`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setQuizzesList(d.questions || []); })
        .finally(() => setIsDataLoading(false));
    }

    if (activeTab === 'freetest' && freeTestsList.length === 0) {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/admin/all-tests`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { if (d.success) setFreeTestsList(d.tests || []); })
        .finally(() => setIsDataLoading(false));
    }

    if (activeTab === 'materials' && livePdfs.length === 0) {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/admin/all-pdfs`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { if (d.success) setLivePdfs(d.pdfs || []); })
        .finally(() => setIsDataLoading(false));
    }
  }, [activeTab, isLoggedIn, currentUser.email, fetchOrders, fetchSubscribers, fetchUsers, fetchWorkers, fetchCurrentAffairsAdmin, fetchPointsReport, fetchSlides]);

  const handleSaveCurrentAffairs = async (e) => {
    e.preventDefault();
    let scheduledTime = caFormData.publishDate;
    if (scheduledTime && !scheduledTime.includes('T')) {
      scheduledTime = `${scheduledTime}T19:00:00`;
    }

    const payload = {
      category: caFormData.category,
      title: caFormData.title,
      description: caFormData.description,
      titleTa: caFormData.title,
      descTa: caFormData.description,
      publishAt: scheduledTime,
      pdfUrl: caFormData.pdfUrl
    };

    try {
      const url = editingCaId 
        ? `${API_BASE}/api/current-affairs/${editingCaId}`
        : `${API_BASE}/api/current-affairs/add`;
      const method = editingCaId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotification(editingCaId ? 'Current Affair updated!' : 'Saved with 7 PM schedule!', 'success');
        setShowCaModal(false);
        setEditingCaId(null);
        fetchCurrentAffairsAdmin();
      } else {
        showNotification('Failed to save current affairs', 'error');
      }
    } catch {
      showNotification('Server error', 'error');
    }
  };

  const handleDeleteCurrentAffairs = async (id) => {
    if (!window.confirm('Delete this current affair?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/current-affairs/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showNotification('Deleted successfully!', 'info');
        fetchCurrentAffairsAdmin();
      }
    } catch {
      showNotification('Error deleting', 'error');
    }
  };

  const refreshActiveTabData = () => {
    if (activeTab === 'dashboard') {
      fetchOrders();
      fetchSubscribers();
      fetchUsers();
    }
    if (activeTab === 'questions') {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/quiz/questions`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setQuizzesList(d.questions || []); })
        .finally(() => setIsDataLoading(false));
    }
    if (activeTab === 'freetest') {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/admin/all-tests`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { if (d.success) setFreeTestsList(d.tests || []); })
        .finally(() => setIsDataLoading(false));
    }
    if (activeTab === 'materials') {
      setIsDataLoading(true);
      fetch(`${API_BASE}/api/admin/all-pdfs`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { if (d.success) setLivePdfs(d.pdfs || []); })
        .finally(() => setIsDataLoading(false));
    }
    if (activeTab === 'slider') fetchSlides();
    if (activeTab === 'current-affairs') fetchCurrentAffairsAdmin();
    if (activeTab === 'orders' || activeTab === 'refund_management') {
      fetchOrders();
      fetchUsers();
      fetchSubscribers();
    }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'control') fetchWorkers();
    if (activeTab === 'reports') fetchPointsReport();
    showNotification('Refreshing data...', 'info');
  };

  const handleDeleteOrder = async (orderNo) => {
    if (!window.confirm(`Delete Order: ${orderNo}?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/refund-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ orderNo, reason: 'Deleted by Admin' })
      });
      fetchOrders();
      showNotification('Order removed!', 'info');
    } catch {
      showNotification('Error deleting order', 'error');
    }
  };

  const handleProcessRefund = async (orderNo) => {
    const reason = window.prompt(`Order ${orderNo}-க்கு ரீஃபண்ட் செய்வதற்கான காரணத்தை உள்ளிடவும்:`, 'Student Request / Cancelled');
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/refund-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ orderNo, reason })
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status)) {
        showNotification('ரீஃபண்ட் வெற்றிகரமாகச் செய்யப்பட்டது!', 'success');
        fetchOrders();
      } else {
        showNotification(data.message || 'ரீஃபண்ட் செய்ய முடியவில்லை!', 'error');
      }
    } catch {
      showNotification('சர்வர் பிழை! மீண்டும் முயற்சிக்கவும்.', 'error');
    }
  };

  const handleDeleteTest = async (testId, title) => {
    if (!window.confirm(`Delete Test: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-test/${testId}`, { method: 'DELETE', headers: authHeaders });
      setFreeTestsList((prev) => prev.filter((t) => (t.id || t._id) !== testId));
      showNotification('Test deleted!', 'info');
    } catch {
      showNotification('Error deleting test', 'error');
    }
  };

  const handleDeletePdf = async (pdfId, title) => {
    if (!window.confirm(`Delete PDF: "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-pdf/${pdfId}`, { method: 'DELETE', headers: authHeaders });
      setLivePdfs((prev) => prev.filter((p) => (p.id || p._id) !== pdfId));
      showNotification('PDF removed!', 'info');
    } catch {
      showNotification('Error deleting PDF', 'error');
    }
  };

  const handleOpenAddSlide = () => {
    setEditingSlideId(null);
    setSlideFormData({
      title: '',
      image: '',
      fromDate: new Date().toISOString().split('T')[0],
      fromTime: '00:00',
      toDate: '',
      toTime: '23:59',
      status: 'Active',
      order: slideList.length + 1
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide) => {
    setEditingSlideId(slide.id || slide._id);
    setSlideFormData({
      title: slide.title || '',
      image: slide.image || '',
      fromDate: slide.fromDate || new Date().toISOString().split('T')[0],
      fromTime: slide.fromTime || '00:00',
      toDate: slide.toDate || '',
      toTime: slide.toTime || '23:59',
      status: slide.status || 'Active',
      order: slide.order || 1
    });
    setShowSlideModal(true);
  };

  const handleSlideImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlideFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSlideTitleChange = async (e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      setSlideFormData(prev => ({ ...prev, title: val }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            setSlideFormData(prev => ({ ...prev, title: words.join(' ') + ' ' }));
            return;
          }
        } catch (err) {
          console.error("Slide transliteration error:", err);
        }
      }
    }
    setSlideFormData(prev => ({ ...prev, title: val }));
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!slideFormData.image) {
      return showNotification('Please upload an image!', 'warning');
    }

    try {
      const payload = {
        id: editingSlideId,
        ...slideFormData
      };
      const res = await fetch(`${API_BASE}/api/admin/save-slide`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(editingSlideId ? 'Slide updated successfully!' : 'Slide created successfully!', 'success');
        setShowSlideModal(false);
        fetchSlides();
      } else {
        showNotification(data.message || 'Error saving slide', 'error');
      }
    } catch {
      showNotification('Server connection error!', 'error');
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Delete this slide completely from Home Page and Database?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/delete-slide/${slideId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('Slide removed from Home page!', 'info');
        fetchSlides();
      } else {
        const updated = slideList.filter(s => (s.id || s._id) !== slideId);
        setSlideList(updated);
        await fetch(`${API_BASE}/api/admin/update-slides`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ slides: updated })
        });
        showNotification('Slide deleted!', 'info');
      }
    } catch {
      showNotification('Error deleting slide', 'error');
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerData.name || !newWorkerData.password) {
      return showNotification('பெயர் மற்றும் Password கட்டாயம்!', 'warning');
    }
    
    // Auto-generate Login User ID based on Name
    const autoUserId = newWorkerData.name.toLowerCase().trim().replace(/\s+/g, '_') + '_worker';
    const autoEmail = `${autoUserId}@vaagai.com`;

    const payload = {
      ...newWorkerData,
      email: autoEmail,
      userId: autoUserId
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/add-worker`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`புதிய Worker சேர்க்கப்பட்டார்! Login ID: ${autoUserId}`, 'success');
        setNewWorkerData({
          name: '',
          password: '',
          contact: '',
          allowedTabs: ['questions', 'materials', 'slider', 'current-affairs', 'notifications'],
          menuPermissions: {
            questions: { view: true, edit: true, delete: false },
            freetest: { view: true, edit: true, delete: false },
            materials: { view: true, edit: true, delete: false },
            slider: { view: true, edit: true, delete: false },
            'current-affairs': { view: true, edit: true, delete: false },
            notifications: { view: true, edit: true, delete: false }
          }
        });
        setShowCreateWorkerForm(false);
        fetchWorkers();
      } else {
        showNotification(data.message || 'பிழை!', 'error');
      }
    } catch {
      showNotification('Server Error!', 'error');
    }
  };

  const handleToggleWorkerPermission = async (email, tabId, currentTabs) => {
    const updatedTabs = currentTabs.includes(tabId)
      ? currentTabs.filter((t) => t !== tabId)
      : [...currentTabs, tabId];

    try {
      const res = await fetch(`${API_BASE}/api/admin/update-worker-permissions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ email, allowedTabs: updatedTabs })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('அனுமதிகள் புதுப்பிக்கப்பட்டன!', 'info');
        fetchWorkers();
      }
    } catch {
      showNotification('பிழை!', 'error');
    }
  };

  const handleToggleMenuActionPermission = async (email, tabId, actionType, currentMenuPerms) => {
    const updatedMenuPerms = {
      ...currentMenuPerms,
      [tabId]: {
        view: currentMenuPerms?.[tabId]?.view ?? true,
        edit: currentMenuPerms?.[tabId]?.edit ?? true,
        delete: currentMenuPerms?.[tabId]?.delete ?? false,
        [actionType]: !currentMenuPerms?.[tabId]?.[actionType]
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/update-worker-permissions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ email, menuPermissions: updatedMenuPerms })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showNotification('Menu Action Permissions புதுப்பிக்கப்பட்டன!', 'info');
        fetchWorkers();
      }
    } catch {
      showNotification('பிழை!', 'error');
    }
  };

  const handleDeleteWorker = async (email) => {
    if (!window.confirm(`Worker "${email}" ஐ நீக்க விரும்புகிறீர்களா?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/delete-worker/${email}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Worker நீக்கப்பட்டார்!', 'info');
        fetchWorkers();
      }
    } catch {
      showNotification('பிழை!', 'error');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingUserId ? `${API_BASE}/api/admin/edit-user` : `${API_BASE}/api/admin/add-user`;
      const res = await fetch(endpoint, {
        method: editingUserId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify({ id: editingUserId, ...userFormData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowUserModal(false);
        fetchUsers();
        showNotification('Student saved successfully!', 'success');
      }
    } catch {
      showNotification('Server error', 'error');
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete student "${email}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/delete-user`, {
        method: 'DELETE',
        headers: authHeaders,
        body: JSON.stringify({ email })
      });
      fetchUsers();
      showNotification('மாணவர் நீக்கப்பட்டார்!', 'info');
    } catch {
      showNotification('பிழை!', 'error');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionFormData.question?.trim()) return showNotification('Please enter question text!', 'warning');
    const cleanedOptions = questionFormData.options.map((opt) => opt?.trim() || '');
    if (cleanedOptions.some((opt) => !opt)) return showNotification('Please fill in all 4 options!', 'warning');
    if (!questionFormData.correctAnswer?.trim()) return showNotification('Please select a correct answer using the radio button!', 'warning');

    const payload = {
      type: 'quiz',
      id: editingQuestionId,
      subject: 'TNPSC',
      topic: questionFormData.subCategory, // Mapping subCategory as Topic for compatibility
      category: questionFormData.category,
      subCategory: questionFormData.subCategory,
      questionSet: 'Topic Test',
      question: questionFormData.question.trim(),
      options: cleanedOptions,
      correctAnswer: questionFormData.correctAnswer.trim(),
      status: 'active'
    };

    try {
      const res = await fetch(
        editingQuestionId ? `${API_BASE}/api/admin/edit-item` : `${API_BASE}/api/quiz/add`,
        { method: editingQuestionId ? 'PUT' : 'POST', headers: authHeaders, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setShowQuestionModal(false);
        setQuizzesList([]);
        showNotification('Question saved successfully!', 'success');
      }
    } catch {
      showNotification('Server error', 'error');
    }
  };

  const handleOpenAddPdf = () => {
    setEditingPdfId(null);
    setPdfFormData({ examType: '10th', title: '', questionPdfLink: '', answerPdfLink: '', isFree: true, price: 0 });
    setShowPdfModal(true);
  };

  const handleOpenEditPdf = (p) => {
    setEditingPdfId(p.id || p._id);
    setPdfFormData({
      examType: p.examType || '10th',
      title: p.title || '',
      questionPdfLink: p.questionPdfLink || '',
      answerPdfLink: p.answerPdfLink || '',
      isFree: p.isFree ?? true,
      price: p.price || 0
    });
    setShowPdfModal(true);
  };

  const handleSavePdf = async (e) => {
    e.preventDefault();
    if (!pdfFormData.questionPdfLink) return showNotification('Provide Question PDF link!', 'warning');
    const payload = {
      id: editingPdfId,
      ...pdfFormData,
      status: 'active'
    };

    try {
      const res = await fetch(
        editingPdfId ? `${API_BASE}/api/admin/edit-pdf` : `${API_BASE}/api/paid-pdfs/worker-upload`,
        { method: editingPdfId ? 'PUT' : 'POST', headers: authHeaders, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setShowPdfModal(false);
        setLivePdfs([]);
        showNotification('PDF saved successfully!', 'success');
      }
    } catch {
      showNotification('Server error', 'error');
    }
  };

  // 🆕 Test Modal Open / Reset 2-Step
  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestModalStep(1); // Set to Step 1
    setTestFormData({
      examType: 'Online Test',
      title: '',
      selectedTopics: [],
      topicQuestionCounts: {},
      questionSelectionType: 'Random',
      totalQuestions: 0,
      durationMinutes: 15,
      isFree: true,
      price: 0,
      fromDate: new Date().toISOString().split('T')[0],
      fromTime: '00:00',
      toDate: '',
      toTime: '23:59'
    });
    setShowTestModal(true);
  };

  // 🆕 Test Modal Edit / Reset 2-Step
  const handleOpenEditTest = (t) => {
    setEditingTestId(t.id || t._id);
    setTestModalStep(1); // Set to Step 1
    const selTopics = Array.isArray(t.selectedTopics) && t.selectedTopics.length > 0 ? t.selectedTopics : [t.topic || 'இலக்கணம் (Grammar)'];
    
    const defaultCounts = {};
    selTopics.forEach(top => {
       defaultCounts[top] = t.topicQuestionCounts?.[top] || Math.floor((t.totalQuestions || 20) / selTopics.length);
    });

    setTestFormData({
      examType: t.examType || 'Online Test',
      title: t.title || '',
      selectedTopics: selTopics,
      topicQuestionCounts: t.topicQuestionCounts || defaultCounts,
      questionSelectionType: t.questionSelectionType || 'Random',
      totalQuestions: t.totalQuestions || 20,
      durationMinutes: t.durationMinutes || 15,
      isFree: t.isFree ?? true,
      price: t.price || 0,
      fromDate: t.fromDate || (t.publishDate ? t.publishDate.substring(0, 10) : new Date().toISOString().split('T')[0]),
      fromTime: t.fromTime || '00:00',
      toDate: t.toDate || '',
      toTime: t.toTime || '23:59'
    });
    setShowTestModal(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!testFormData.title.trim()) return showNotification('Enter test title.', 'warning');
    if (!testFormData.selectedTopics || testFormData.selectedTopics.length === 0) {
      return showNotification('Select at least one category/topic for questions!', 'warning');
    }

    const payload = {
      id: editingTestId,
      ...testFormData,
      status: 'active'
    };

    try {
      const res = await fetch(
        editingTestId ? `${API_BASE}/api/admin/edit-test` : `${API_BASE}/api/admin/add-test`,
        { method: editingTestId ? 'PUT' : 'POST', headers: authHeaders, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setShowTestModal(false);
        fetch(`${API_BASE}/api/admin/all-tests`, { headers: authHeaders })
          .then((r) => r.json())
          .then((d) => { if (d.success) setFreeTestsList(d.tests || []); });
        showNotification('Test saved successfully!', 'success');
      } else {
        showNotification(data.message || 'Error saving test', 'error');
      }
    } catch {
      showNotification('Server error', 'error');
    }
  };

  const handleOpenTestPreview = (t) => {
    const testQuestions = quizzesList.filter((q) =>
      (t.selectedTopics || []).includes(q.topic || q.category || q.subCategory)
    );
    setPreviewTest({ test: t, questions: testQuestions });
  };

  const isTabAllowed = (tabKey) => {
    if (isMasterAdmin) return true;
    const allowed = currentUser.allowedTabs || ['questions', 'materials', 'slider', 'current-affairs', 'notifications'];
    return allowed.includes(tabKey) || allowed.includes('*');
  };

  const handleQuestionTextChange = async (e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      setQuestionFormData((prev) => ({ ...prev, question: val }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            setQuestionFormData((prev) => ({ ...prev, question: words.join(' ') + ' ' }));
            return;
          }
        } catch (err) {
          console.error("Transliteration error:", err);
        }
      }
    }
    setQuestionFormData((prev) => ({ ...prev, question: val }));
  };

  const handleOptionTextChange = async (idx, e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      const updatedOptions = [...questionFormData.options];
      updatedOptions[idx] = val;
      setQuestionFormData((prev) => ({
        ...prev,
        options: updatedOptions,
        correctAnswer: selectedRadioIndex === idx ? val.trim() : prev.correctAnswer
      }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            const joinedVal = words.join(' ') + ' ';
            const updatedOptions = [...questionFormData.options];
            updatedOptions[idx] = joinedVal;
            setQuestionFormData((prev) => ({
              ...prev,
              options: updatedOptions,
              correctAnswer: selectedRadioIndex === idx ? joinedVal.trim() : prev.correctAnswer
            }));
            return;
          }
        } catch (err) {
          console.error("Transliteration error:", err);
        }
      }
    }
    const updatedOptions = [...questionFormData.options];
    updatedOptions[idx] = val;
    setQuestionFormData((prev) => ({
      ...prev,
      options: updatedOptions,
      correctAnswer: selectedRadioIndex === idx ? val.trim() : prev.correctAnswer
    }));
  };

  const handlePdfTitleChange = async (e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      setPdfFormData((prev) => ({ ...prev, title: val }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            setPdfFormData((prev) => ({ ...prev, title: words.join(' ') + ' ' }));
            return;
          }
        } catch (err) {
          console.error("Transliteration error:", err);
        }
      }
    }
    setPdfFormData((prev) => ({ ...prev, title: val }));
  };

  const handleTestTitleChange = async (e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      setTestFormData((prev) => ({ ...prev, title: val }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            setTestFormData((prev) => ({ ...prev, title: words.join(' ') + ' ' }));
            return;
          }
        } catch (err) {
          console.error("Test title Transliteration error:", err);
        }
      }
    }
    setTestFormData((prev) => ({ ...prev, title: val }));
  };

  const handleCaSingleTextChange = async (field, e) => {
    const val = e.target.value;
    if (!isTamilTypingEnabled) {
      setCaFormData((prev) => ({ ...prev, [field]: val }));
      return;
    }
    if (val.endsWith(' ')) {
      const trimmed = val.trimEnd();
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        try {
          const tamilWord = await fetchTamilWord(lastWord);
          if (tamilWord) {
            words[words.length - 1] = tamilWord;
            setCaFormData((prev) => ({ ...prev, [field]: words.join(' ') + ' ' }));
            return;
          }
        } catch (err) {
          console.error("CA Single Transliteration error:", err);
        }
      }
    }
    setCaFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Notification Save / Edit / Delete Handlers (with Start & End Date/Time)
  const handleSaveNotificationItem = (e) => {
    e.preventDefault();
    if (!notifFormData.title.trim()) return showNotification('Title is required!', 'warning');

    if (activeTab === 'notif_exam') {
      if (editingNotifId) {
        setExamNotifsList(prev => prev.map(item => (item.id === editingNotifId ? { ...item, ...notifFormData } : item)));
        showNotification('Exam Notification updated!', 'success');
      } else {
        setExamNotifsList(prev => [...prev, { id: Date.now(), ...notifFormData }]);
        showNotification('Exam Notification added!', 'success');
      }
    } else if (activeTab === 'notif_study') {
      if (editingNotifId) {
        setStudyNotesList(prev => prev.map(item => (item.id === editingNotifId ? { ...item, text: notifFormData.title, pdfLink: notifFormData.pdfLink, fromDate: notifFormData.fromDate, fromTime: notifFormData.fromTime, toDate: notifFormData.toDate, toTime: notifFormData.toTime } : item)));
        showNotification('Study Note updated!', 'success');
      } else {
        setStudyNotesList(prev => [...prev, { id: Date.now(), text: notifFormData.title, link: '/premium', pdfLink: notifFormData.pdfLink, fromDate: notifFormData.fromDate, fromTime: notifFormData.fromTime, toDate: notifFormData.toDate, toTime: notifFormData.toTime }]);
        showNotification('Study Note added!', 'success');
      }
    } else if (activeTab === 'notif_master') {
      if (editingNotifId) {
        setMasterAlertsList(prev => prev.map((item, i) => (i === editingNotifId ? notifFormData.title : item)));
        showNotification('Master Alert updated!', 'success');
      } else {
        setMasterAlertsList(prev => [...prev, notifFormData.title]);
        showNotification('Master Alert added!', 'success');
      }
    }
    setShowNotifModal(false);
  };

  const handleDeleteNotificationItem = (id, type) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    if (type === 'exam') {
      setExamNotifsList(prev => prev.filter(item => item.id !== id));
    } else if (type === 'study') {
      setStudyNotesList(prev => prev.filter(item => item.id !== id));
    } else if (type === 'master') {
      setMasterAlertsList(prev => prev.filter((_, idx) => idx !== id));
    }
    showNotification('Deleted successfully!', 'info');
  };

  const handleOpenPdfLink = (pdfUrl) => {
    if (!pdfUrl || pdfUrl.trim() === '') {
      showNotification('No PDF link attached for this notification!', 'warning');
      return;
    }
    let finalUrl = pdfUrl.trim();
    if (finalUrl.includes('drive.google.com')) {
      const match = finalUrl.match(/\/file\/d\/([^/]+)/) || finalUrl.match(/\/d\/([^/]+)/) || finalUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    window.open(finalUrl, '_blank');
  };

  const filteredQuestions = selectedTopicTab === 'All' ? quizzesList : quizzesList.filter((q) => q.topic === selectedTopicTab || q.category === selectedTopicTab);
  const paginatedQuestions = filteredQuestions.slice((questionPage - 1) * itemsPerPage, questionPage * itemsPerPage);
  const paginatedTests = freeTestsList.slice((testPage - 1) * itemsPerPage, testPage * itemsPerPage);
  const paginatedPdfs = livePdfs.slice((pdfPage - 1) * itemsPerPage, pdfPage * itemsPerPage);
  const paginatedCa = caList.slice((caPage - 1) * itemsPerPage, caPage * itemsPerPage);

  const totalSubRevenue = subscribersList
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const totalOrderRevenue = ordersList
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + (o.price || 0), 0);

  const totalRevenue = totalSubRevenue + totalOrderRevenue;

  const getStudentContact = (order) => {
    const directContact = order.userMobile || order.mobile || order.contact || order.phone;
    if (directContact) return directContact;

    const email = (order.userEmail || order.email || '').toLowerCase().trim();
    if (email) {
      if (usersList.length > 0) {
        const matchedUser = usersList.find(
          (u) => (u.email || '').toLowerCase().trim() === email
        );
        if (matchedUser && (matchedUser.contact || matchedUser.mobile || matchedUser.phone)) {
          return matchedUser.contact || matchedUser.mobile || matchedUser.phone;
        }
      }

      if (subscribersList.length > 0) {
        const matchedSub = subscribersList.find(
          (s) => (s.userEmail || s.email || '').toLowerCase().trim() === email
        );
        if (matchedSub && (matchedSub.contact || matchedSub.mobile || matchedSub.phone)) {
          return matchedSub.contact || matchedSub.mobile || matchedSub.phone;
        }
      }
    }

    return 'N/A';
  };

  const refundFilteredOrders = ordersList.filter((order) => {
    if (!refundMobileSearch.trim()) return true;
    const search = refundMobileSearch.trim().toLowerCase();
    const studentPhone = String(getStudentContact(order)).toLowerCase();
    const orderNo = String(order.orderNo || order.id || order._id || '').toLowerCase();
    const userEmail = String(order.userEmail || order.email || '').toLowerCase();
    const studentName = String(order.userName || order.studentName || '').toLowerCase();

    return (
      studentPhone.includes(search) ||
      orderNo.includes(search) ||
      userEmail.includes(search) ||
      studentName.includes(search)
    );
  });

  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <img src={logoImg} alt="Logo" className="login-logo" />
            <h2>Vaagai Admin</h2>
          </div>
          {loginError && <p className="login-error-msg">⚠️ {loginError}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="User ID / Worker Email"
              value={adminUserId}
              onChange={(e) => setAdminUserId(e.target.value)}
              required
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="login-input"
            />
            <button type="submit" disabled={loginLoading} className="login-btn">
              {loginLoading ? 'Verifying...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {toast.show && (
        <div className={`inpage-toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* 📋 Sidebar Menu */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src={logoImg} alt="Logo" className="sidebar-logo" />
          <span className="sidebar-title">VAAGAI TUITION</span>
          <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📊</span> Dashboard
          </button>

          {isMasterAdmin && (
            <button
              className={`nav-item ${activeTab === 'orders' || activeTab === 'refund_management' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">💳</span> All Orders ({ordersList.length})
            </button>
          )}

          {isMasterAdmin && (
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">👥</span> Users ({usersList.length})
            </button>
          )}

          {/* 🔔 NOTIFICATION DROPDOWN MENU */}
          <div className="sidebar-dropdown">
            <button
              type="button"
              className={`nav-item ${activeTab.startsWith('notif_') ? 'active' : ''}`}
              onClick={() => setNotificationSubmenuOpen((prev) => !prev)}
            >
              <span className="nav-icon">🔔</span> Notification {notificationSubmenuOpen ? '▴' : '▾'}
            </button>
            {notificationSubmenuOpen && (
              <div className="submenu-container">
                <button type="button" className={`submenu-item ${activeTab === 'notif_exam' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('notif_exam'); setMobileMenuOpen(false); }}>• Exam Notifications</button>
                <button type="button" className={`submenu-item ${activeTab === 'notif_study' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('notif_study'); setMobileMenuOpen(false); }}>• Study Material & Notes</button>
                <button type="button" className={`submenu-item ${activeTab === 'notif_master' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('notif_master'); setMobileMenuOpen(false); }}>• Master Alert</button>
              </div>
            )}
          </div>

          {isMasterAdmin && (
            <div className="sidebar-dropdown">
              <button
                type="button"
                className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reports'); setReportsSubmenuOpen((prev) => !prev); }}
              >
                <span className="nav-icon">📈</span> Reports {reportsSubmenuOpen ? '▴' : '▾'}
              </button>
              {reportsSubmenuOpen && (
                <div className="submenu-container">
                  <button type="button" className={`submenu-item ${activeTab === 'reports' && reportType === 'regular' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('reports'); setReportType('regular'); setMobileMenuOpen(false); }}>• Free test point</button>
                  <button type="button" className={`submenu-item ${activeTab === 'reports' && reportType === 'premium' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('reports'); setReportType('premium'); setMobileMenuOpen(false); }}>• Paid test point</button>
                  <button type="button" className={`submenu-item ${activeTab === 'reports' && reportType === 'total' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('reports'); setReportType('total'); setMobileMenuOpen(false); }}>• Total points</button>
                </div>
              )}
            </div>
          )}

          {isMasterAdmin && (
            <button
              className={`nav-item ${activeTab === 'control' ? 'active' : ''}`}
              onClick={() => { setActiveTab('control'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">⚙️</span> Access Control
            </button>
          )}

          {isMasterAdmin && (
            <div className="sidebar-dropdown">
              <button
                type="button"
                className={`nav-item ${activeTab.startsWith('manage_') ? 'active' : ''}`}
                onClick={() => setManageSubmenuOpen((prev) => !prev)}
              >
                <span className="nav-icon">📁</span> Manage {manageSubmenuOpen ? '▴' : '▾'}
              </button>
              {manageSubmenuOpen && (
                <div className="submenu-container">
                  <button type="button" className={`submenu-item ${activeTab === 'manage_qset' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('manage_qset'); setMobileMenuOpen(false); }}>• Question Set</button>
                  <button type="button" className={`submenu-item ${activeTab === 'manage_district' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('manage_district'); setMobileMenuOpen(false); }}>• District</button>
                  <button type="button" className={`submenu-item ${activeTab === 'manage_state' ? 'active-sub' : ''}`} onClick={() => { setActiveTab('manage_state'); setMobileMenuOpen(false); }}>• State</button>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '10px 12px 2px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Learn
          </div>

          {isTabAllowed('questions') && (
            <button
              className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('questions'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">❓</span> Question Bank
            </button>
          )}
          {isTabAllowed('materials') && (
            <button
              className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => { setActiveTab('materials'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">📚</span> Pdf Bank
            </button>
          )}
          {isTabAllowed('freetest') && (
            <button
              className={`nav-item ${activeTab === 'freetest' ? 'active' : ''}`}
              onClick={() => { setActiveTab('freetest'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">📝</span> Online Test
            </button>
          )}
          {isTabAllowed('slider') && (
            <button
              className={`nav-item ${activeTab === 'slider' ? 'active' : ''}`}
              onClick={() => { setActiveTab('slider'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">🖼️</span> Home Slider
            </button>
          )}
          {isTabAllowed('current-affairs') && (
            <button
              className={`nav-item ${activeTab === 'current-affairs' ? 'active' : ''}`}
              onClick={() => { setActiveTab('current-affairs'); setMobileMenuOpen(false); }}
            >
              <span className="nav-icon">📰</span> Current Affairs
            </button>
          )}

          <button className="nav-item logout-btn" onClick={handleLogout} style={{ marginTop: '10px' }}>
            <span className="nav-icon">⏻</span> Logout
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="top-navbar">
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div className="top-nav-right">
            <button className="top-icon-btn" onClick={refreshActiveTabData} title="Refresh">
              {isDataLoading ? '⏳' : '🔄'}
            </button>
            <img src={logoImg} alt="Admin" className="admin-avatar" />
          </div>
        </header>

        <main className="content-area">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">DASHBOARD</h2>
              </div>
              
              <div 
                className="stats-grid" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                  gap: '20px', 
                  marginBottom: '20px' 
                }}
              >
                <div className="stat-card">
                  <div>
                    <div className="stat-title">TOTAL USERS</div>
                    <div className="stat-value">{usersList.length}</div>
                  </div>
                  <div className="stat-icon-wrapper icon-orange">👥</div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-title">SUBSCRIBED MEMBERS</div>
                    <div className="stat-value">{subscribersList.filter(s => s.status === 'ACTIVE').length}</div>
                  </div>
                  <div className="stat-icon-wrapper icon-cyan">👑</div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-title">REGISTERED STUDENTS</div>
                    <div className="stat-value">{usersList.length}</div>
                  </div>
                  <div className="stat-icon-wrapper icon-blue">🎓</div>
                </div>
              </div>

              <div 
                className="stat-card" 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)', 
                  color: '#fff',
                  padding: '22px 28px',
                  borderRadius: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  <div className="stat-title" style={{ color: '#a7f3d0', fontSize: '13px', letterSpacing: '0.8px', fontWeight: '700' }}>
                    TOTAL REVENUE
                  </div>
                  <div className="stat-value" style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '4px 0' }}>
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#d1fae5', marginTop: '4px' }}>
                    Orders: ₹{totalOrderRevenue} | Subscriptions: ₹{totalSubRevenue}
                  </div>
                </div>
                <div 
                  className="stat-icon-wrapper" 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: '#fff', 
                    fontSize: '32px',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}
                >
                  💰
                </div>
              </div>
            </div>
          )}

          {/* 🔔 1. EXAM NOTIFICATIONS TAB */}
          {activeTab === 'notif_exam' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">🔔 EXAM NOTIFICATIONS ({examNotifsList.length})</h2>
                <button 
                  onClick={() => {
                    setEditingNotifId(null);
                    setNotifFormData({ 
                      title: '', 
                      description: '', 
                      pdfLink: '', 
                      targetUrl: '/mocktest',
                      fromDate: new Date().toISOString().split('T')[0],
                      fromTime: '00:00',
                      toDate: '',
                      toTime: '23:59'
                    });
                    setShowNotifModal(true);
                  }} 
                  className="btn-add-primary"
                >
                  + Add Exam Notification
                </button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Schedule Time (Start - End)</th>
                      <th>PDF Attachment</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examNotifsList.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No Exam Notifications found.</td></tr>
                    ) : (
                      examNotifsList.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <b 
                              style={{ color: item.pdfLink ? '#0284c7' : 'inherit', cursor: item.pdfLink ? 'pointer' : 'default' }}
                              onClick={() => item.pdfLink && handleOpenPdfLink(item.pdfLink)}
                              title={item.pdfLink ? "Click to view PDF" : ""}
                            >
                              {item.title} {item.pdfLink && '📄'}
                            </b>
                            {item.description && <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.description}</div>}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            <div><b>From:</b> {item.fromDate || 'N/A'} {item.fromTime || ''}</div>
                            <div><b>To:</b> {item.toDate || 'Open / No expiry'} {item.toTime || ''}</div>
                          </td>
                          <td>
                            {item.pdfLink ? (
                              <button onClick={() => handleOpenPdfLink(item.pdfLink)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                View PDF
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>No PDF</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              {item.pdfLink && (
                                <button onClick={() => handleOpenPdfLink(item.pdfLink)} className="btn-action-round bg-view" title="Open PDF">
                                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setEditingNotifId(item.id);
                                  setNotifFormData({ 
                                    title: item.title, 
                                    description: item.description, 
                                    pdfLink: item.pdfLink || '', 
                                    targetUrl: item.targetUrl || '/mocktest',
                                    fromDate: item.fromDate || new Date().toISOString().split('T')[0],
                                    fromTime: item.fromTime || '00:00',
                                    toDate: item.toDate || '',
                                    toTime: item.toTime || '23:59'
                                  });
                                  setShowNotifModal(true);
                                }} 
                                className="btn-action-round bg-edit" 
                                title="Edit"
                              >
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteNotificationItem(item.id, 'exam')} 
                                className="btn-action-round bg-delete" 
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 📚 2. STUDY MATERIAL & NOTES TAB */}
          {activeTab === 'notif_study' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">📚 STUDY MATERIAL & NOTES ({studyNotesList.length})</h2>
                <button 
                  onClick={() => {
                    setEditingNotifId(null);
                    setNotifFormData({ 
                      title: '', 
                      description: '', 
                      pdfLink: '', 
                      targetUrl: '/premium',
                      fromDate: new Date().toISOString().split('T')[0],
                      fromTime: '00:00',
                      toDate: '',
                      toTime: '23:59'
                    });
                    setShowNotifModal(true);
                  }} 
                  className="btn-add-primary"
                >
                  + Add Study Material Note
                </button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Note Title / Text</th>
                      <th>Schedule Time (Start - End)</th>
                      <th>PDF Attachment</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studyNotesList.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No Study Notes found.</td></tr>
                    ) : (
                      studyNotesList.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <b 
                              style={{ color: item.pdfLink ? '#0284c7' : 'inherit', cursor: item.pdfLink ? 'pointer' : 'default' }}
                              onClick={() => item.pdfLink && handleOpenPdfLink(item.pdfLink)}
                              title={item.pdfLink ? "Click to view PDF" : ""}
                            >
                              📌 {item.text} {item.pdfLink && '📄'}
                            </b>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            <div><b>From:</b> {item.fromDate || 'N/A'} {item.fromTime || ''}</div>
                            <div><b>To:</b> {item.toDate || 'Open / No expiry'} {item.toTime || ''}</div>
                          </td>
                          <td>
                            {item.pdfLink ? (
                              <button onClick={() => handleOpenPdfLink(item.pdfLink)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                View PDF
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>No PDF</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              {item.pdfLink && (
                                <button onClick={() => handleOpenPdfLink(item.pdfLink)} className="btn-action-round bg-view" title="Open PDF">
                                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setEditingNotifId(item.id);
                                  setNotifFormData({ 
                                    title: item.text, 
                                    description: '', 
                                    pdfLink: item.pdfLink || '', 
                                    targetUrl: item.link || '/premium',
                                    fromDate: item.fromDate || new Date().toISOString().split('T')[0],
                                    fromTime: item.fromTime || '00:00',
                                    toDate: item.toDate || '',
                                    toTime: item.toTime || '23:59'
                                  });
                                  setShowNotifModal(true);
                                }} 
                                className="btn-action-round bg-edit" 
                                title="Edit"
                              >
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteNotificationItem(item.id, 'study')} 
                                className="btn-action-round bg-delete" 
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 📢 3. MASTER ALERT TAB */}
          {activeTab === 'notif_master' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">📢 MASTER ALERT ({masterAlertsList.length})</h2>
                <button 
                  onClick={() => {
                    setEditingNotifId(null);
                    setNotifFormData({ 
                      title: '', 
                      description: '', 
                      pdfLink: '', 
                      targetUrl: '',
                      fromDate: '',
                      fromTime: '',
                      toDate: '',
                      toTime: ''
                    });
                    setShowNotifModal(true);
                  }} 
                  className="btn-add-primary"
                >
                  + Add Master Alert
                </button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Master Alert Message</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterAlertsList.length === 0 ? (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No Master Alerts found.</td></tr>
                    ) : (
                      masterAlertsList.map((msg, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><b>⭐ {msg}</b></td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button 
                                onClick={() => {
                                  setEditingNotifId(idx);
                                  setNotifFormData({ 
                                    title: msg, 
                                    description: '', 
                                    pdfLink: '', 
                                    targetUrl: '',
                                    fromDate: '',
                                    fromTime: '',
                                    toDate: '',
                                    toTime: ''
                                  });
                                  setShowNotifModal(true);
                                }} 
                                className="btn-action-round bg-edit" 
                                title="Edit"
                              >
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteNotificationItem(idx, 'master')} 
                                className="btn-action-round bg-delete" 
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 💳 All Orders Tab */}
          {isMasterAdmin && activeTab === 'orders' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="page-title">ALL ORDERS ({ordersList.length})</h2>
                
                <button
                  type="button"
                  onClick={() => {
                    setRefundMobileSearch('');
                    setActiveTab('refund_management');
                  }}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 3px 6px rgba(220,38,38,0.25)'
                  }}
                >
                  <span>🔄</span> Refund Management
                </button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Order No</th>
                      <th>Item / Book Title</th>
                      <th>Student Info</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No orders found.</td></tr>
                    ) : (
                      ordersList.map((order, idx) => (
                        <tr key={order.orderNo || order._id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{order.orderNo || order.id || order._id}</b></td>
                          <td>{order.bookTitle || order.itemTitle || order.title || 'Study Material'}</td>
                          <td>
                            <div><b>{order.userName || order.studentName || 'Student'}</b></div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{order.userEmail || order.email || ''}</div>
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#0f766e' }}>₹{order.price || order.amount || 0}</td>
                          <td>
                            <span className={(order.status || '').toUpperCase() === 'PAID' ? 'badge-green' : 'badge-gold'}>
                              {order.status || 'PAID'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => setViewingItem(order)} className="btn-action-round bg-view" title="View Details">
                                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button onClick={() => handleDeleteOrder(order.orderNo || order._id)} className="btn-action-round bg-delete" title="Delete">
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 🔄 REFUND MANAGEMENT PAGE */}
          {isMasterAdmin && activeTab === 'refund_management' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    style={{
                      background: '#4f46e5',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    ⬅ Back to Orders
                  </button>
                  <h2 className="page-title" style={{ color: '#b91c1c', margin: 0 }}>
                    🔄 REFUND MANAGEMENT
                  </h2>
                </div>
              </div>

              <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px', background: '#fef2f2', border: '1.5px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#991b1b' }}>
                    📱 Filter by Student Mobile / Order No:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile number or Order ID..."
                    value={refundMobileSearch}
                    onChange={(e) => setRefundMobileSearch(e.target.value)}
                    className="modal-input"
                    style={{ flex: 1, minWidth: '240px', maxWidth: '380px', padding: '9px 14px', fontSize: '13.5px' }}
                  />
                  {refundMobileSearch && (
                    <button
                      type="button"
                      onClick={() => setRefundMobileSearch('')}
                      style={{ background: '#cbd5e1', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-card table-responsive" style={{ border: '1.5px solid #fecaca', background: '#fff' }}>
                <table className="custom-table">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>#</th>
                      <th>Order No</th>
                      <th>Student Info</th>
                      <th>Mobile Number</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Refund Date</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundFilteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                          பொருத்தமான ஆர்டர்கள் எதுவும் கிடைக்கவில்லை.
                        </td>
                      </tr>
                    ) : (
                      refundFilteredOrders.map((order, idx) => {
                        const isRefunded = (order.status || '').toUpperCase() === 'REFUNDED';
                        const refundDate = order.refundedAt || order.refundDate || order.updatedAt;
                        const studentPhone = getStudentContact(order);

                        return (
                          <tr key={`refund-mgmt-${order.orderNo || order._id || idx}`} style={{ background: isRefunded ? '#fff7ed' : 'transparent' }}>
                            <td>{idx + 1}</td>
                            <td>
                              <b>{order.orderNo || order.id || order._id}</b>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{order.bookTitle || order.itemTitle || 'Material'}</div>
                            </td>
                            <td>
                              <div><b>{order.userName || order.studentName || 'Student'}</b></div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{order.userEmail || order.email || 'N/A'}</div>
                            </td>
                            <td>
                              <b style={{ color: studentPhone !== 'N/A' ? '#0369a1' : '#94a3b8' }}>
                                📞 {studentPhone}
                              </b>
                            </td>
                            <td style={{ fontWeight: 'bold', color: isRefunded ? '#c2410c' : '#0f766e', fontSize: '14px' }}>
                              ₹{order.price || order.amount || 0}
                            </td>
                            <td>
                              <span className={isRefunded ? 'badge-gold' : 'badge-green'} style={{ fontWeight: 'bold' }}>
                                {isRefunded ? 'REFUNDED' : (order.status || 'PAID')}
                              </span>
                            </td>
                            <td style={{ fontSize: '12.5px' }}>
                              {isRefunded && refundDate ? (
                                <span style={{ color: '#9a3412', fontWeight: '600' }}>
                                  📅 {new Date(refundDate).toLocaleDateString()}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {isRefunded ? (
                                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px' }}>
                                  ✓ Refunded
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleProcessRefund(order.orderNo || order.id || order._id)}
                                  style={{
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '7px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '12.5px',
                                    boxShadow: '0 2px 4px rgba(220,38,38,0.25)'
                                  }}
                                >
                                  Refund Now
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👥 Users Tab */}
          {isMasterAdmin && activeTab === 'users' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">REGISTERED STUDENTS / USERS ({usersList.length})</h2>
                <button 
                  onClick={() => {
                    setEditingUserId(null);
                    setUserFormData({ name: '', email: '', contact: '' });
                    setShowUserModal(true);
                  }} 
                  className="btn-add-primary"
                >
                  + Add Student
                </button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email ID</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No users found.</td></tr>
                    ) : (
                      usersList.map((user, idx) => (
                        <tr key={user._id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{user.name || 'Anonymous'}</b></td>
                          <td>{user.email}</td>
                          <td>{user.contact || user.mobile || user.phone || 'N/A'}</td>
                          <td>
                            <span className={user.role === 'admin' ? 'badge-gold' : 'badge-green'}>
                              {user.role || 'student'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button 
                                onClick={() => {
                                  setEditingUserId(user._id || user.id);
                                  setUserFormData({
                                    name: user.name || '',
                                    email: user.email || '',
                                    contact: user.contact || user.mobile || user.phone || ''
                                  });
                                  setShowUserModal(true);
                                }} 
                                className="btn-action-round bg-edit" 
                                title="Edit"
                              >
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.email)} 
                                className="btn-action-round bg-delete" 
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 📂 Manage Submenu Tab (Updated Category & Sub-Category) */}
          {activeTab.startsWith('manage_') && (
            <div>
              {activeTab === 'manage_qset' ? (
                <div>
                  <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="page-title">📁 MANAGE QUESTION SETS (CATEGORIES)</h2>
                    <button
                      onClick={() => {
                        setEditingQsetId(null);
                        setQsetFormData({ category: '', subCategory: '', status: 'Active' });
                        setShowQsetModal(true);
                      }}
                      className="btn-add-primary"
                    >
                      + Add Category / Sub-Category
                    </button>
                  </div>

                  <div className="admin-card table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Category</th>
                          <th>Sub-Category</th>
                          <th style={{textAlign: 'center'}}>Questions Added</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionSetsList.map((item, idx) => {
                          const qCount = quizzesList.filter(q => q.subCategory === item.subCategory || q.topic === item.subCategory || q.category === item.subCategory).length;
                          return (
                            <tr key={item.id || idx}>
                              <td>{idx + 1}</td>
                              <td><b>{item.category}</b></td>
                              <td>{item.subCategory}</td>
                              <td style={{textAlign: 'center', fontWeight: 'bold', color: '#0f766e'}}>{qCount} Qs</td>
                              <td>
                                <span className={item.status === 'Active' ? 'badge-green' : 'badge-gold'}>
                                  {item.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div className="action-buttons-cell">
                                  <button onClick={() => setViewingItem({...item, type: 'qset', count: qCount})} className="btn-action-round bg-view" title="View">
                                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                  </button>
                                  <button onClick={() => {
                                    setEditingQsetId(item.id);
                                    setQsetFormData({ category: item.category, subCategory: item.subCategory, status: item.status });
                                    setShowQsetModal(true);
                                  }} className="btn-action-round bg-edit" title="Edit">
                                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button onClick={() => {
                                    if(window.confirm('Are you sure to delete this sub-category?')) {
                                      setQuestionSetsList(prev => prev.filter(q => q.id !== item.id));
                                      showNotification('Deleted Successfully', 'info');
                                    }
                                  }} className="btn-action-round bg-delete" title="Delete">
                                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {showQsetModal && (
                    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                      <div className="modal-content" style={{ width: '500px', maxWidth: '95vw', background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#0f766e', margin: '0 0 20px 0', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                          {editingQsetId ? '✏️ Edit Category / Sub-Category' : '➕ Add Category / Sub-Category'}
                        </h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if(!qsetFormData.category.trim() || !qsetFormData.subCategory.trim()) return showNotification('All fields are required', 'warning');
                          if (editingQsetId) {
                             setQuestionSetsList(prev => prev.map(q => q.id === editingQsetId ? { ...q, ...qsetFormData } : q));
                             showNotification('Updated successfully', 'success');
                          } else {
                             setQuestionSetsList(prev => [...prev, { id: Date.now(), ...qsetFormData }]);
                             showNotification('Added successfully', 'success');
                          }
                          setShowQsetModal(false);
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <label className="modal-label" style={{ fontWeight: 'bold' }}>Main Category Name</label>
                            <input type="text" value={qsetFormData.category} onChange={(e) => setQsetFormData({...qsetFormData, category: e.target.value})} className="modal-input" required placeholder="Eg: Tamil, Maths..." style={{ width: '100%', padding: '10px' }} />
                          </div>
                          <div style={{ marginBottom: '15px' }}>
                            <label className="modal-label" style={{ fontWeight: 'bold' }}>Sub-Category Name</label>
                            <input type="text" value={qsetFormData.subCategory} onChange={(e) => setQsetFormData({...qsetFormData, subCategory: e.target.value})} className="modal-input" required placeholder="Eg: Grammar, Percentage..." style={{ width: '100%', padding: '10px' }} />
                          </div>
                          <div style={{ marginBottom: '20px' }}>
                            <label className="modal-label" style={{ fontWeight: 'bold' }}>Status</label>
                            <select value={qsetFormData.status} onChange={(e) => setQsetFormData({...qsetFormData, status: e.target.value})} className="modal-input" style={{ width: '100%', padding: '10px' }}>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => setShowQsetModal(false)} className="btn-modal-cancel">Cancel</button>
                            <button type="submit" className="btn-modal-submit">Save Category</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="page-header-row">
                    <h2 className="page-title">
                      {activeTab === 'manage_district' && '📁 MANAGE DISTRICTS'}
                      {activeTab === 'manage_state' && '📁 MANAGE STATES'}
                    </h2>
                  </div>
                  <div className="admin-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder={`Enter new ${activeTab === 'manage_district' ? 'District' : 'State'}...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="modal-input"
                        style={{ flex: 1, padding: '10px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newItemName.trim()) return showNotification('Please enter a valid name!', 'warning');
                          const val = newItemName.trim();
                          if (activeTab === 'manage_district') setDistrictsList(prev => [...prev, val]);
                          if (activeTab === 'manage_state') setStatesList(prev => [...prev, val]);
                          setNewItemName('');
                          showNotification('Item added successfully!', 'success');
                        }}
                        className="btn-add-primary"
                        style={{ padding: '10px 20px' }}
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Name</th>
                            <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeTab === 'manage_district' ? districtsList : statesList).map((item, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td><b>{item}</b></td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => {
                                    if (activeTab === 'manage_district') setDistrictsList(prev => prev.filter((_, i) => i !== idx));
                                    if (activeTab === 'manage_state') setStatesList(prev => prev.filter((_, i) => i !== idx));
                                    showNotification('Item removed!', 'info');
                                  }}
                                  className="btn-action-round bg-delete"
                                  title="Delete"
                                >
                                  <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🖼️ Home Slider Tab */}
          {isTabAllowed('slider') && activeTab === 'slider' && (
            <div>
              <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">MANAGE HOME SLIDER ({slideList.length}/10)</h2>
                <button onClick={handleOpenAddSlide} className="btn-add-primary">+ Add Slider</button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Slide Image</th>
                      <th>Title</th>
                      <th>Show Schedule (From - To)</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slideList.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No slides found. Click "+ Add Slider" to create one.</td></tr>
                    ) : (
                      slideList.map((slide, idx) => (
                        <tr key={slide.id || slide._id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            {slide.image ? (
                              <img src={slide.image} alt={slide.title || 'Slide'} style={{ width: '90px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            ) : 'No Image'}
                          </td>
                          <td><b>{slide.title || 'Untitled Slide'}</b></td>
                          <td style={{ fontSize: '12px' }}>
                            <div><b>From:</b> {slide.fromDate || 'N/A'} {slide.fromTime || ''}</div>
                            <div><b>To:</b> {slide.toDate || 'Open / No expiry'} {slide.toTime || ''}</div>
                          </td>
                          <td><b>{slide.order || (idx + 1)}</b></td>
                          <td>
                            <span className={slide.status === 'Active' ? 'badge-green' : 'badge-gold'}>
                              {slide.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => handleOpenEditSlide(slide)} className="btn-action-round bg-edit" title="Edit">
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => handleDeleteSlide(slide.id || slide._id)} className="btn-action-round bg-delete" title="Delete">
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 📰 Current Affairs Tab */}
          {isTabAllowed('current-affairs') && activeTab === 'current-affairs' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">📰 Current Affairs Management</h2>
                <button onClick={() => {
                  setEditingCaId(null);
                  setCaFormData({
                    category: 'Tamil Nadu',
                    title: '',
                    description: '',
                    publishDate: new Date().toISOString().split('T')[0],
                    pdfUrl: ''
                  });
                  setShowCaModal(true);
                }} className="btn-add-primary">+ Add Current Affair</button>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Schedule Time (7 PM)</th>
                      <th>PDF</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCa.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No current affairs found.</td></tr>
                    ) : (
                      paginatedCa.map((ca, idx) => (
                        <tr key={ca._id || idx}>
                          <td><b>{ca.category}</b></td>
                          <td>
                            <div><b>{ca.title || ca.titleTa}</b></div>
                            {ca.titleEn && ca.titleEn !== (ca.title || ca.titleTa) && (
                              <div style={{ fontSize: '11.5px', color: '#64748b' }}>{ca.titleEn}</div>
                            )}
                          </td>
                          <td>{ca.publishAt ? new Date(ca.publishAt).toLocaleString() : 'N/A'}</td>
                          <td>{ca.pdfUrl ? <a href={ca.pdfUrl} target="_blank" rel="noreferrer">View PDF</a> : 'No PDF'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => setViewingCa(ca)} className="btn-action-round bg-view" title="View">
                                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button onClick={() => {
                                setEditingCaId(ca._id);
                                setCaFormData({
                                  category: ca.category || 'Tamil Nadu',
                                  title: ca.title || ca.titleTa || '',
                                  description: ca.description || ca.descTa || '',
                                  publishDate: ca.publishAt ? ca.publishAt.substring(0, 10) : new Date().toISOString().split('T')[0],
                                  pdfUrl: ca.pdfUrl || ''
                                });
                                setShowCaModal(true);
                              }} className="btn-action-round bg-edit" title="Edit">
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => handleDeleteCurrentAffairs(ca._id)} className="btn-action-round bg-delete" title="Delete">
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

          {/* 📊 Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">
                  {reportType === 'regular' && '📈 Free Test Points Report'}
                  {reportType === 'premium' && '👑 Paid Test Points Report'}
                  {reportType === 'total' && '⭐ Total Points Report'}
                </h2>
              </div>

              <div className="admin-card" style={{ padding: '14px 18px', marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>From Date:</span>
                    <input 
                      type="date" 
                      value={reportFromDate} 
                      onChange={(e) => setReportFromDate(e.target.value)} 
                      className="modal-input" 
                      style={{ padding: '6px 10px', fontSize: '13px' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>To Date:</span>
                    <input 
                      type="date" 
                      value={reportToDate} 
                      onChange={(e) => setReportToDate(e.target.value)} 
                      className="modal-input" 
                      style={{ padding: '6px 10px', fontSize: '13px' }} 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={fetchPointsReport}
                    className="btn-add-primary" 
                    style={{ padding: '7px 18px', fontSize: '13px' }}
                  >
                    🔍 Filter
                  </button>
                </div>
              </div>

              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Mobile Number</th>
                      <th>Email ID</th>
                      <th style={{ textAlign: 'center' }}>Tests Attended</th>
                      <th style={{ textAlign: 'right' }}>
                        {reportType === 'regular' ? 'Free Test Points' : reportType === 'premium' ? 'Paid Test Points' : 'Total Points'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isReportLoading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px' }}>⏳ Loading report data...</td></tr>
                    ) : reportsList.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No records found for the selected filter.</td></tr>
                    ) : (
                      reportsList.map((item, idx) => {
                        const points = reportType === 'regular' 
                          ? (item.freePoints ?? item.points ?? item.totalPoints ?? 0)
                          : reportType === 'premium'
                          ? (item.paidPoints ?? item.points ?? item.totalPoints ?? 0)
                          : (item.totalPoints ?? item.points ?? 0);

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td><b>{item.name || item.studentName || 'Anonymous'}</b></td>
                            <td>{item.mobile || item.contact || 'N/A'}</td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>{item.email || 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{item.testsAttended || item.testCount || 1}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#0f766e', fontSize: '14px' }}>
                              ⭐ {points} Pts
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Access Control Tab */}
          {activeTab === 'control' && (
            <div>
              <div className="page-header-row"><h2 className="page-title">⚙️ Worker Access Control</h2></div>
              
              {/* Button to Toggle Create Work User Form */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateWorkerForm(!showCreateWorkerForm)}
                  style={{
                    background: '#0f766e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14.5px',
                    boxShadow: '0 3px 6px rgba(15,118,110,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{showCreateWorkerForm ? '▲ Hide Form' : '➕ Create Work User'}</span>
                </button>
              </div>

              {showCreateWorkerForm && (
                <div className="admin-card" style={{ maxWidth: '850px', marginBottom: '25px', border: '2px solid #0f766e' }}>
                  <h3 style={{ margin: '0 0 14px 0', color: '#0f766e', fontSize: '16px' }}>Enter Worker Details (Login ID will be auto-generated)</h3>
                  <form onSubmit={handleCreateWorker}>
                    <div className="grid-2-col">
                      <div>
                        <label className="modal-label">Work User Name <span style={{ color: 'red' }}>*</span></label>
                        <input type="text" placeholder="உதாரணமாக: Rajesh Admin" value={newWorkerData.name} onChange={(e) => setNewWorkerData({ ...newWorkerData, name: e.target.value })} required className="modal-input" />
                        <small style={{ color: '#0369a1', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                          Auto Login ID: {newWorkerData.name ? `${newWorkerData.name.toLowerCase().trim().replace(/\s+/g, '_')}_worker` : '---'}
                        </small>
                      </div>
                      <div>
                        <label className="modal-label">Password <span style={{ color: 'red' }}>*</span></label>
                        <input type="password" placeholder="கடவுச்சொல்" value={newWorkerData.password} onChange={(e) => setNewWorkerData({ ...newWorkerData, password: e.target.value })} required className="modal-input" />
                      </div>
                    </div>
                    
                    <div className="grid-2-col" style={{ marginTop: '12px' }}>
                      <div>
                        <label className="modal-label">Contact</label>
                        <input type="text" placeholder="போன் எண்" value={newWorkerData.contact} onChange={(e) => setNewWorkerData({ ...newWorkerData, contact: e.target.value })} className="modal-input" />
                      </div>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                      <label className="modal-label" style={{ fontWeight: 'bold', color: '#0f766e', marginBottom: '8px', display: 'block' }}>
                        Permitted Menus & Individual View / Edit / Delete Options:
                      </label>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { id: 'questions', label: '❓ Question Bank' },
                          { id: 'freetest', label: '📝 Online Test' },
                          { id: 'materials', label: '📚 Pdf Bank' },
                          { id: 'slider', label: '🖼️ Home Slider' },
                          { id: 'current-affairs', label: '📰 Current Affairs' },
                          { id: 'notifications', label: '🔔 Notifications' }
                        ].map((menu) => {
                          const isChecked = newWorkerData.allowedTabs.includes(menu.id);
                          const menuPerms = newWorkerData.menuPermissions[menu.id] || { view: true, edit: true, delete: false };

                          return (
                            <div key={menu.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', flexWrap: 'wrap', gap: '10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '160px' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const updatedTabs = isChecked
                                      ? newWorkerData.allowedTabs.filter((t) => t !== menu.id)
                                      : [...newWorkerData.allowedTabs, menu.id];
                                    setNewWorkerData({ ...newWorkerData, allowedTabs: updatedTabs });
                                  }}
                                />
                                <b>{menu.label}</b>
                              </label>

                              {isChecked && (
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                  <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={menuPerms.view} 
                                      onChange={() => {
                                        const updated = {
                                          ...newWorkerData.menuPermissions,
                                          [menu.id]: { ...menuPerms, view: !menuPerms.view }
                                        };
                                        setNewWorkerData({ ...newWorkerData, menuPermissions: updated });
                                      }}
                                    /> View
                                  </label>
                                  <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={menuPerms.edit} 
                                      onChange={() => {
                                        const updated = {
                                          ...newWorkerData.menuPermissions,
                                          [menu.id]: { ...menuPerms, edit: !menuPerms.edit }
                                        };
                                        setNewWorkerData({ ...newWorkerData, menuPermissions: updated });
                                      }}
                                    /> Edit
                                  </label>
                                  <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={menuPerms.delete} 
                                      onChange={() => {
                                        const updated = {
                                          ...newWorkerData.menuPermissions,
                                          [menu.id]: { ...menuPerms, delete: !menuPerms.delete }
                                        };
                                        setNewWorkerData({ ...newWorkerData, menuPermissions: updated });
                                      }}
                                    /> Delete
                                  </label>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" className="btn-add-primary" style={{ marginTop: '18px' }}>Create Work User</button>
                  </form>
                </div>
              )}

              <div className="admin-card table-responsive">
                <h3 style={{ margin: '0 0 12px 0', color: '#0f766e', fontSize: '15px' }}>Existing Workers List</h3>
                <table className="custom-table">
                  <thead>
                    <tr><th>#</th><th>Name & Login ID</th><th>Menu Access & Action Checkboxes (View / Edit / Delete)</th><th style={{ textAlign: 'center' }}>Delete Worker</th></tr>
                  </thead>
                  <tbody>
                    {workersList.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No workers found.</td></tr>
                    ) : (
                      workersList.map((w, idx) => (
                        <tr key={w._id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{w.name}</b><div style={{ fontSize: '11px', color: '#0369a1' }}>ID: {w.userId || w.email}</div></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {[
                                { id: 'questions', label: '❓ Question Bank' },
                                { id: 'freetest', label: '📝 Online Test' },
                                { id: 'materials', label: '📚 Pdf Bank' },
                                { id: 'slider', label: '🖼️ Home Slider' },
                                { id: 'current-affairs', label: '📰 Current Affairs' },
                                { id: 'notifications', label: '🔔 Notifications' }
                              ].map((menu) => {
                                const isAllowed = (w.allowedTabs || []).includes(menu.id);
                                const menuPerms = (w.menuPermissions && w.menuPermissions[menu.id]) || { view: true, edit: true, delete: false };

                                return (
                                  <div key={menu.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '5px 10px', borderRadius: '4px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                                    <label style={{ fontSize: '11.5px', cursor: 'pointer', minWidth: '130px' }}>
                                      <input
                                        type="checkbox"
                                        checked={isAllowed}
                                        onChange={() => handleToggleWorkerPermission(w.email, menu.id, w.allowedTabs || [])}
                                      />{' '}
                                      <b>{menu.label}</b>
                                    </label>

                                    {isAllowed && (
                                      <div style={{ display: 'flex', gap: '10px' }}>
                                        <label style={{ fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <input 
                                            type="checkbox" 
                                            checked={menuPerms.view ?? true} 
                                            onChange={() => handleToggleMenuActionPermission(w.email, menu.id, 'view', w.menuPermissions)} 
                                          /> View
                                        </label>
                                        <label style={{ fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <input 
                                            type="checkbox" 
                                            checked={menuPerms.edit ?? true} 
                                            onChange={() => handleToggleMenuActionPermission(w.email, menu.id, 'edit', w.menuPermissions)} 
                                          /> Edit
                                        </label>
                                        <label style={{ fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <input 
                                            type="checkbox" 
                                            checked={menuPerms.delete ?? false} 
                                            onChange={() => handleToggleMenuActionPermission(w.email, menu.id, 'delete', w.menuPermissions)} 
                                          /> Delete
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleDeleteWorker(w.email)} className="btn-action-round bg-delete" title="Delete Worker">
                              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Question Bank Tab */}
          {isTabAllowed('questions') && activeTab === 'questions' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">QUESTION BANK</h2>
                <button onClick={() => { 
                  setEditingQuestionId(null); 
                  setSelectedRadioIndex(null); 
                  setQuestionFormData({ 
                    category: Object.keys(availableTestTopics)[0] || 'Tamil', 
                    subCategory: availableTestTopics[Object.keys(availableTestTopics)[0]]?.[0] || '', 
                    question: '', 
                    options: ['', '', '', ''], 
                    correctAnswer: '' 
                  }); 
                  setShowQuestionModal(true); 
                }} className="btn-add-primary">+ Add Question</button>
              </div>
              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead><tr><th>#</th><th>Category & Sub</th><th>Question</th><th>Answer</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                  <tbody>
                    {paginatedQuestions.map((q, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <b>{q.category || 'N/A'}</b><br/>
                          <small style={{color: '#64748b'}}>{q.subCategory || q.topic}</small>
                        </td>
                        <td><b>{q.question}</b></td>
                        <td style={{ color: '#16a34a' }}>{q.correctAnswer}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-buttons-cell">
                            <button onClick={() => setViewingQuestion(q)} className="btn-action-round bg-view" title="View">
                              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button onClick={() => {
                              setEditingQuestionId(q.id || q._id);
                              const options = q.options || ['', '', '', ''];
                              const corrAns = q.correctAnswer || '';
                              const foundIdx = options.findIndex(opt => opt.trim() === corrAns.trim());
                              setSelectedRadioIndex(foundIdx !== -1 ? foundIdx : null);
                              setQuestionFormData({ 
                                category: q.category || 'Tamil', 
                                subCategory: q.subCategory || q.topic || 'இலக்கணம் (Grammar)', 
                                question: q.question, 
                                options, 
                                correctAnswer: corrAns 
                              });
                              setShowQuestionModal(true);
                            }} className="btn-action-round bg-edit" title="Edit">
                              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => {
                              if (window.confirm('Delete question?')) {
                                fetch(`${API_BASE}/api/admin/reject-item`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ type: 'quiz', id: q.id || q._id, reason: 'Deleted' }) }).then(() => setQuizzesList([]));
                              }
                            }} className="btn-action-round bg-delete" title="Delete">
                              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pdf Bank Tab */}
          {isTabAllowed('materials') && activeTab === 'materials' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">PDF BANK</h2>
                <button onClick={handleOpenAddPdf} className="btn-add-primary">+ Add PDF</button>
              </div>
              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead><tr><th>#</th><th>Title</th><th>Category</th><th>Access</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                  <tbody>
                    {paginatedPdfs.map((p, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><b>{p.title}</b></td>
                        <td>{p.examType}</td>
                        <td><span className={p.isFree ? 'badge-green' : 'badge-gold'}>{p.isFree ? 'FREE' : `₹${p.price}`}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-buttons-cell">
                            <button onClick={() => window.open(p.questionPdfLink, '_blank')} className="btn-action-round bg-view" title="View">
                              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button onClick={() => handleOpenEditPdf(p)} className="btn-action-round bg-edit" title="Edit">
                              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDeletePdf(p.id || p._id, p.title)} className="btn-action-round bg-delete" title="Delete">
                              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Online Test Tab */}
          {isTabAllowed('freetest') && activeTab === 'freetest' && (
            <div>
              <div className="page-header-row">
                <h2 className="page-title">ONLINE TEST</h2>
                <button onClick={handleOpenAddTest} className="btn-add-primary">+ Add Test</button>
              </div>
              <div className="admin-card table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Categories / Topics</th>
                      <th>Questions</th>
                      <th>Duration</th>
                      <th>Type</th>
                      <th>Schedule (From - To)</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTests.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No tests found.</td></tr>
                    ) : (
                      paginatedTests.map((t, idx) => (
                        <tr key={t.id || t._id || idx}>
                          <td>{idx + 1}</td>
                          <td><b>{t.title}</b></td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(t.selectedTopics || [t.topic || 'General']).map((top, ti) => (
                                <span key={ti} style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                  {top}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>{t.totalQuestions || 20} Qs</td>
                          <td>{t.durationMinutes} Mins</td>
                          <td><span className={t.isFree ? 'badge-green' : 'badge-gold'}>{t.isFree ? 'FREE' : `₹${t.price}`}</span></td>
                          <td style={{ fontSize: '12px' }}>
                            <div><b>From:</b> {t.fromDate || (t.publishDate ? t.publishDate.substring(0, 10) : 'Immediate')} {t.fromTime || ''}</div>
                            <div><b>To:</b> {t.toDate || 'Open / No expiry'} {t.toTime || ''}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-cell">
                              <button onClick={() => handleOpenTestPreview(t)} className="btn-action-round bg-view" title="Preview">
                                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button onClick={() => handleOpenEditTest(t)} className="btn-action-round bg-edit" title="Edit">
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => handleDeleteTest(t.id || t._id, t.title)} className="btn-action-round bg-delete" title="Delete">
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
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

      {/* 🔔 Notification Add / Edit Modal (With Start & End Date/Time) */}
      {showNotifModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '650px', maxWidth: '95vw', background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#1e293b', margin: '0 0 16px 0', fontSize: '18px' }}>
              {editingNotifId !== null ? '✏️ Edit Notification' : '➕ Add Notification'} ({activeTab === 'notif_exam' ? 'Exam Notification' : activeTab === 'notif_study' ? 'Study Material Note' : 'Master Alert'})
            </h2>
            <form onSubmit={handleSaveNotificationItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                  {activeTab === 'notif_master' ? 'Master Alert Message' : 'Title / Text'} <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder={activeTab === 'notif_master' ? 'Enter master alert message...' : 'Enter title...'}
                  value={notifFormData.title} 
                  onChange={(e) => setNotifFormData({ ...notifFormData, title: e.target.value })} 
                  required 
                  className="modal-input" 
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              {activeTab === 'notif_exam' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Description</label>
                  <input 
                    type="text" 
                    placeholder="Enter short description..."
                    value={notifFormData.description} 
                    onChange={(e) => setNotifFormData({ ...notifFormData, description: e.target.value })} 
                    className="modal-input" 
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                  />
                </div>
              )}

              {activeTab !== 'notif_master' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Start From Date & Time</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="date" 
                          value={notifFormData.fromDate} 
                          onChange={(e) => setNotifFormData({ ...notifFormData, fromDate: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1.2', padding: '8px' }} 
                        />
                        <input 
                          type="time" 
                          value={notifFormData.fromTime} 
                          onChange={(e) => setNotifFormData({ ...notifFormData, fromTime: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1', padding: '8px' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>End To Date & Time</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="date" 
                          value={notifFormData.toDate} 
                          onChange={(e) => setNotifFormData({ ...notifFormData, toDate: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1.2', padding: '8px' }} 
                        />
                        <input 
                          type="time" 
                          value={notifFormData.toTime} 
                          onChange={(e) => setNotifFormData({ ...notifFormData, toTime: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1', padding: '8px' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>PDF Link (Google Drive / Direct URL)</label>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..."
                      value={notifFormData.pdfLink} 
                      onChange={(e) => setNotifFormData({ ...notifFormData, pdfLink: e.target.value })} 
                      className="modal-input" 
                      style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowNotifModal(false)} style={{ padding: '9px 18px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 22px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ Manage Home Slider Modal */}
      {showSlideModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '920px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ color: '#1e293b', margin: '0 0 4px 0', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  MANAGE HOME SLIDER
                </h2>
                <span style={{ fontSize: '13px', color: '#0f766e', fontWeight: 'bold' }}>
                  {editingSlideId ? 'Edit Slider' : 'Add Slider'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#334155' }}>தமிழ் Typing:</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={isTamilTypingEnabled} 
                      onChange={() => setIsTamilTypingEnabled(!isTamilTypingEnabled)} 
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: isTamilTypingEnabled ? '#0f766e' : '#cbd5e1',
                      transition: '.4s', borderRadius: '20px'
                    }}></span>
                    <span style={{
                      position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      transform: isTamilTypingEnabled ? 'translateX(18px)' : 'translateX(0)'
                    }}></span>
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: isTamilTypingEnabled ? '#0f766e' : '#64748b' }}>
                    {isTamilTypingEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowSlideModal(false)}
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ⬅ Back
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSlide}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '15px' }}>Add Slider</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      Title <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter slider title..."
                      value={slideFormData.title} 
                      onChange={handleSlideTitleChange} 
                      required 
                      className="modal-input" 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '14px' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      Image <span style={{ color: 'red' }}>*</span> <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'normal' }}>(Image size W 1080 * H 555 Pixels)</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleSlideImageUpload(e.target.files[0])} 
                      className="modal-input"
                      style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      From <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="date" 
                        value={slideFormData.fromDate} 
                        onChange={(e) => setSlideFormData({ ...slideFormData, fromDate: e.target.value })} 
                        required 
                        className="modal-input" 
                        style={{ flex: '1.2', padding: '8px 10px' }} 
                      />
                      <input 
                        type="time" 
                        value={slideFormData.fromTime} 
                        onChange={(e) => setSlideFormData({ ...slideFormData, fromTime: e.target.value })} 
                        required 
                        className="modal-input" 
                        style={{ flex: '1', padding: '8px 10px' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      To <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="date" 
                        value={slideFormData.toDate} 
                        onChange={(e) => setSlideFormData({ ...slideFormData, toDate: e.target.value })} 
                        className="modal-input" 
                        style={{ flex: '1.2', padding: '8px 10px' }} 
                      />
                      <input 
                        type="time" 
                        value={slideFormData.toTime} 
                        onChange={(e) => setSlideFormData({ ...slideFormData, toTime: e.target.value })} 
                        className="modal-input" 
                        style={{ flex: '1', padding: '8px 10px' }} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      Status <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select 
                      value={slideFormData.status} 
                      onChange={(e) => setSlideFormData({ ...slideFormData, status: e.target.value })} 
                      className="modal-input" 
                      style={{ width: '100%', padding: '9px 12px' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      Order <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      value={slideFormData.order} 
                      onChange={(e) => setSlideFormData({ ...slideFormData, order: Number(e.target.value) })} 
                      required 
                      className="modal-input" 
                      style={{ width: '100%', padding: '9px 12px' }} 
                    />
                  </div>
                </div>

                {slideFormData.image && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Preview:</span>
                    <img src={slideFormData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', border: '1px solid #cbd5e1', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowSlideModal(false)} 
                  style={{ padding: '9px 24px', background: '#fff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '9px 28px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📰 Current Affairs Modal */}
      {showCaModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '850px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>
                {editingCaId ? '✏️ Edit Current Affair' : '➕ Add Current Affair (7 PM Schedule)'}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>தமிழ் Typing:</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isTamilTypingEnabled} 
                    onChange={() => setIsTamilTypingEnabled(!isTamilTypingEnabled)} 
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isTamilTypingEnabled ? '#0f766e' : '#cbd5e1',
                    transition: '.4s', borderRadius: '22px'
                  }}></span>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: isTamilTypingEnabled ? 'translateX(18px)' : 'translateX(0)'
                  }}></span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isTamilTypingEnabled ? '#0f766e' : '#64748b' }}>
                  {isTamilTypingEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSaveCurrentAffairs}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Category Selection:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                  <select 
                    value={caFormData.category} 
                    onChange={(e) => setCaFormData({ ...caFormData, category: e.target.value })} 
                    className="modal-input"
                    style={{ flex: '1', minWidth: '200px', padding: '10px', fontSize: '14px' }}
                  >
                    {customCategories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {['Tamil Nadu', 'India', 'World', 'Sports', 'Political', 'TNPSC', 'RRB', 'SI', 'PC', 'General'].includes(caFormData.category) ? null : (
                    <button 
                      type="button" 
                      onClick={() => {
                        if (window.confirm(`Are you sure to remove category "${caFormData.category}"?`)) {
                          const updatedCats = customCategories.filter(c => c !== caFormData.category);
                          setCustomCategories(updatedCats);
                          setCaFormData({ ...caFormData, category: updatedCats[0] || 'General' });
                          showNotification('Category removed!', 'info');
                        }
                      }}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🗑️ Remove Current Category
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Type new category name here..." 
                    value={newCategoryInput} 
                    onChange={(e) => setNewCategoryInput(e.target.value)} 
                    className="modal-input"
                    style={{ flex: '1', padding: '8px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newCategoryInput.trim()) {
                        const trimmed = newCategoryInput.trim();
                        if (!customCategories.includes(trimmed)) {
                          setCustomCategories([...customCategories, trimmed]);
                          setCaFormData({ ...caFormData, category: trimmed });
                          setNewCategoryInput('');
                          showNotification('New category added successfully!', 'success');
                        } else {
                          showNotification('Category already exists!', 'warning');
                        }
                      }
                    }}
                    style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Publish Date (மாலை 7 மணிக்கு ஷோ ஆகும்):</label>
                <input type="date" value={caFormData.publishDate} onChange={(e) => setCaFormData({ ...caFormData, publishDate: e.target.value })} required className="modal-input" style={{ width: '100%', padding: '10px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  Title {isTamilTypingEnabled && <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 'normal' }}>(Space தட்டும்போது தமிழில் மாறும்)</span>}
                </label>
                <input 
                  type="text" 
                  placeholder="நடப்பு நிகழ்வு தலைப்பை உள்ளிடவும்..." 
                  value={caFormData.title} 
                  onChange={(e) => handleCaSingleTextChange('title', e)} 
                  required 
                  className="modal-input" 
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  Description {isTamilTypingEnabled && <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 'normal' }}>(Space தட்டும்போது தமிழில் மாறும்)</span>}
                </label>
                <textarea 
                  placeholder="நடப்பு நிகழ்வு முழு விவரங்களை இங்கே தட்டச்சு செய்யவும்..." 
                  value={caFormData.description} 
                  onChange={(e) => handleCaSingleTextChange('description', e)} 
                  className="modal-input" 
                  style={{ width: '100%', height: '140px', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>PDF Link (Drive / Web Link)</label>
                <input type="url" placeholder="https://..." value={caFormData.pdfUrl} onChange={(e) => setCaFormData({ ...caFormData, pdfUrl: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowCaModal(false)} className="btn-modal-cancel" style={{ padding: '10px 20px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="btn-modal-submit" style={{ padding: '10px 25px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Current Affair</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Modals */}
      {viewingCa && (
        <div className="modal-overlay" onClick={() => setViewingCa(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>Current Affair Details</h3>
            <p><strong>Category:</strong> {viewingCa.category}</p>
            <p><strong>Title:</strong> {viewingCa.title || viewingCa.titleTa}</p>
            <p><strong>Description:</strong> {viewingCa.description || viewingCa.descTa}</p>
            <p><strong>Schedule:</strong> {new Date(viewingCa.publishAt).toLocaleString()}</p>
            {viewingCa.pdfUrl && <p><a href={viewingCa.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a></p>}
            <button onClick={() => setViewingCa(null)} className="btn-modal-cancel">Close</button>
          </div>
        </div>
      )}

      {/* Universal View Item (Updated for QSET View Modal) */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {viewingItem.type === 'qset' ? (
              <>
                <h3>Question Set Details</h3>
                <p><strong>Category:</strong> {viewingItem.category}</p>
                <p><strong>Sub-Category:</strong> {viewingItem.subCategory}</p>
                <p><strong>Status:</strong> {viewingItem.status}</p>
                <p><strong>Questions Added:</strong> <span style={{color: '#0f766e', fontWeight: 'bold'}}>{viewingItem.count} Qs</span></p>
              </>
            ) : (
              <>
                <h3>Order Details</h3>
                <p><strong>Order No:</strong> {viewingItem.orderNo || viewingItem._id}</p>
                <p><strong>Title:</strong> {viewingItem.bookTitle || viewingItem.itemTitle}</p>
                <p><strong>Amount:</strong> ₹{viewingItem.price}</p>
                <p><strong>Status:</strong> {viewingItem.status}</p>
              </>
            )}
            <button onClick={() => setViewingItem(null)} className="btn-modal-cancel" style={{marginTop: '15px'}}>Close</button>
          </div>
        </div>
      )}

      {viewingQuestion && (
        <div className="modal-overlay" onClick={() => setViewingQuestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Question Details</h3>
            <p><strong>Category:</strong> {viewingQuestion.category}</p>
            <p><strong>Sub-Category:</strong> {viewingQuestion.subCategory || viewingQuestion.topic}</p>
            <p><strong>Question:</strong> {viewingQuestion.question}</p>
            <ul>
              {viewingQuestion.options?.map((opt, i) => (
                <li key={i} style={{ color: opt === viewingQuestion.correctAnswer ? '#16a34a' : 'inherit', fontWeight: opt === viewingQuestion.correctAnswer ? 'bold' : 'normal' }}>
                  {String.fromCharCode(65 + i)}) {opt} {opt === viewingQuestion.correctAnswer && '✅'}
                </li>
              ))}
            </ul>
            <button onClick={() => setViewingQuestion(null)} className="btn-modal-cancel">Close</button>
          </div>
        </div>
      )}

      {/* Question Modal (Upgraded with Main & Sub Category Selection) */}
      {showQuestionModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '900px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>
                {editingQuestionId ? '✏️ Edit Question' : '➕ Add Question'}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>தமிழ் Typing (Tanglish):</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isTamilTypingEnabled} 
                    onChange={() => setIsTamilTypingEnabled(!isTamilTypingEnabled)} 
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isTamilTypingEnabled ? '#0f766e' : '#cbd5e1',
                    transition: '.4s', borderRadius: '22px'
                  }}></span>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: isTamilTypingEnabled ? 'translateX(18px)' : 'translateX(0)'
                  }}></span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isTamilTypingEnabled ? '#0f766e' : '#64748b' }}>
                  {isTamilTypingEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSaveQuestion}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Category</label>
                  <select 
                    value={questionFormData.category} 
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const subCats = availableTestTopics[newCat] || [];
                      setQuestionFormData({ ...questionFormData, category: newCat, subCategory: subCats[0] || '' });
                    }} 
                    className="modal-input"
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                  >
                    {Object.keys(availableTestTopics).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sub-Category</label>
                  <select 
                    value={questionFormData.subCategory} 
                    onChange={(e) => setQuestionFormData({ ...questionFormData, subCategory: e.target.value })} 
                    className="modal-input"
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                  >
                    {(availableTestTopics[questionFormData.category] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  Question Text {isTamilTypingEnabled && <span style={{ fontSize: '11.5px', color: '#0f766e', fontWeight: 'normal' }}>(ஸ்பேஸ் (Space) தட்டும்போது தமிழில் மாறும்)</span>}
                </label>
                <textarea 
                  placeholder="வினாவை இங்கே தட்டச்சு செய்யவும் (எ.கா: thamizh)..." 
                  value={questionFormData.question} 
                  onChange={handleQuestionTextChange} 
                  required 
                  className="modal-input" 
                  style={{ width: '100%', height: '100px', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', color: '#0f766e' }}>
                  Options & Correct Answer (சரியான விடைக்கு எதிரே உள்ள வட்டத்தை (Radio) கிளிக் செய்யவும்):
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <input 
                        type="radio" 
                        name="corrOpt" 
                        checked={selectedRadioIndex === idx} 
                        onChange={() => { 
                          setSelectedRadioIndex(idx); 
                          setQuestionFormData({ ...questionFormData, correctAnswer: questionFormData.options[idx]?.trim() || '' }); 
                        }} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        placeholder={`Option ${lbl}`} 
                        value={questionFormData.options[idx]} 
                        onChange={(e) => handleOptionTextChange(idx, e)} 
                        required 
                        className="modal-input" 
                        style={{ flex: '1', padding: '8px', border: 'none', outline: 'none', fontSize: '14px' }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn-modal-cancel" style={{ padding: '10px 20px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="btn-modal-submit" style={{ padding: '10px 25px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingUserId ? 'Edit Student' : 'Add Student'}</h3>
            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: '10px' }}>
                <label className="modal-label">Name</label>
                <input type="text" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} required className="modal-input" />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="modal-label">Email</label>
                <input type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} required className="modal-input" />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="modal-label">Contact</label>
                <input type="text" value={userFormData.contact} onChange={(e) => setUserFormData({ ...userFormData, contact: e.target.value })} className="modal-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Bank Modal */}
      {showPdfModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '900px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>
                {editingPdfId ? '✏️ Edit PDF Material' : '➕ Add PDF Material'}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>தமிழ் Typing (Tanglish):</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isTamilTypingEnabled} 
                    onChange={() => setIsTamilTypingEnabled(!isTamilTypingEnabled)} 
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isTamilTypingEnabled ? '#0f766e' : '#cbd5e1',
                    transition: '.4s', borderRadius: '22px'
                  }}></span>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: isTamilTypingEnabled ? 'translateX(18px)' : 'translateX(0)'
                  }}></span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isTamilTypingEnabled ? '#0f766e' : '#64748b' }}>
                  {isTamilTypingEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePdf}>
              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Category / Exam Type</label>
                  <select 
                    value={pdfFormData.examType} 
                    onChange={(e) => setPdfFormData({ ...pdfFormData, examType: e.target.value })} 
                    className="modal-input"
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                  >
                    <option value="10th">10th Standard</option>
                    <option value="12th">12th Standard</option>
                    <option value="TNPSC">TNPSC</option>
                    <option value="RRB">RRB</option>
                    <option value="SI">SI Examination</option>
                    <option value="PC">Police Constable</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                    PDF Title {isTamilTypingEnabled && <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 'normal' }}>(Space தட்டும்போது தமிழில் மாறும்)</span>}
                  </label>
                  <input 
                    type="text" 
                    placeholder="பாடக் குறிப்பு தலைப்பு..." 
                    value={pdfFormData.title} 
                    onChange={handlePdfTitleChange} 
                    required 
                    className="modal-input" 
                    style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', color: '#0f766e' }}>
                  Pricing & Subscription Access (விலை மற்றும் சந்தா அணுகல்):
                </label>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input 
                      type="checkbox" 
                      checked={pdfFormData.isFree} 
                      onChange={(e) => setPdfFormData({ ...pdfFormData, isFree: e.target.checked, price: e.target.checked ? 0 : pdfFormData.price })} 
                      style={{ width: '18px', height: '18px' }}
                    />
                    🎁 முற்றிலும் இலவசம் (Free PDF)
                  </label>
                </div>

                {!pdfFormData.isFree && (
                  <div style={{ marginBottom: '15px' }}>
                    <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Individual Price (₹)</label>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="உதாரணமாக: 50" 
                      value={pdfFormData.price} 
                      onChange={(e) => setPdfFormData({ ...pdfFormData, price: Number(e.target.value) })} 
                      className="modal-input" 
                      style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                    />
                  </div>
                )}

                <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '6px', fontSize: '12.5px', color: '#0369a1', lineHeight: '1.5' }}>
                  💡 <b>Note:</b> செயலில் உள்ள சப்ஸ்கிரிப்ஷன் திட்டங்கள் (<b>₹399 (3 Months)</b>, <b>₹699 (6 Months)</b>, <b>₹1199 (1 Year)</b>) வைத்துள்ள மாணவர்களுக்கு நீங்கள் செட் செய்யும் விலை அல்லது இலவச பிடிஎஃப்கள் அனைத்துமே <b>முற்றிலும் இலவசமாக (Free Access)</b> கிடைக்கும்!
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Question PDF Link (Google Drive / Direct URL)</label>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={pdfFormData.questionPdfLink} 
                  onChange={(e) => setPdfFormData({ ...pdfFormData, questionPdfLink: e.target.value })} 
                  required 
                  className="modal-input" 
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Answer Key PDF Link (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={pdfFormData.answerPdfLink} 
                  onChange={(e) => setPdfFormData({ ...pdfFormData, answerPdfLink: e.target.value })} 
                  className="modal-input" 
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowPdfModal(false)} className="btn-modal-cancel" style={{ padding: '10px 20px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="btn-modal-submit" style={{ padding: '10px 25px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save PDF Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 Online Test Modal - 2 Steps Structure */}
      {showTestModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ width: '850px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>
                {editingTestId ? '✏️ Edit Online Test' : '➕ Add Online Test'} <span style={{fontSize: '14px', color: '#64748b', fontWeight: 'normal'}}>(Step {testModalStep} of 2)</span>
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>தமிழ் Typing:</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isTamilTypingEnabled} 
                    onChange={() => setIsTamilTypingEnabled(!isTamilTypingEnabled)} 
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isTamilTypingEnabled ? '#0f766e' : '#cbd5e1',
                    transition: '.4s', borderRadius: '22px'
                  }}></span>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: isTamilTypingEnabled ? 'translateX(18px)' : 'translateX(0)'
                  }}></span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isTamilTypingEnabled ? '#0f766e' : '#64748b' }}>
                  {isTamilTypingEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveTest}>

              {/* =========== STEP 1: Basic Info & Schedule =========== */}
              {testModalStep === 1 && (
                <div className="step-1-container fade-in-animation">
                  <div style={{ marginBottom: '18px' }}>
                    <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                      Online Test Title <span style={{ color: 'red' }}>*</span> {isTamilTypingEnabled && <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 'normal' }}>(Space தட்டும்போது தமிழில் மாறும்)</span>}
                    </label>
                    <input 
                      type="text" 
                      placeholder="தேர்வு தலைப்பு (எ.கா: 10th Tamil Model Test)..." 
                      value={testFormData.title} 
                      onChange={handleTestTitleChange} 
                      required 
                      className="modal-input" 
                      style={{ width: '100%', padding: '10px', fontSize: '14px' }} 
                    />
                  </div>

                  <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '18px' }}>
                    <div>
                      <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Total Questions</label>
                      <input 
                        type="number" 
                        value={testFormData.totalQuestions} 
                        readOnly
                        title="Questions count will be calculated in Step 2"
                        className="modal-input" 
                        style={{ width: '100%', padding: '9px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: 'bold' }} 
                      />
                      <small style={{color: '#64748b', fontSize: '10px'}}>(Calculated in Step 2)</small>
                    </div>
                    <div>
                      <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Question Selection</label>
                      <select 
                        value={testFormData.questionSelectionType || 'Random'} 
                        onChange={(e) => setTestFormData({ ...testFormData, questionSelectionType: e.target.value })} 
                        className="modal-input" 
                        style={{ width: '100%', padding: '9px' }}
                      >
                        <option value="Random">Random</option>
                        <option value="Selective">Selective</option>
                      </select>
                    </div>
                    <div>
                      <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Duration (Mins) <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        value={testFormData.durationMinutes} 
                        onChange={(e) => setTestFormData({ ...testFormData, durationMinutes: Number(e.target.value) })} 
                        required 
                        className="modal-input" 
                        style={{ width: '100%', padding: '9px' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                        Start From Date & Time <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="date" 
                          value={testFormData.fromDate} 
                          onChange={(e) => setTestFormData({ ...testFormData, fromDate: e.target.value })} 
                          required 
                          className="modal-input" 
                          style={{ flex: '1.2', padding: '8px 10px' }} 
                        />
                        <input 
                          type="time" 
                          value={testFormData.fromTime} 
                          onChange={(e) => setTestFormData({ ...testFormData, fromTime: e.target.value })} 
                          required 
                          className="modal-input" 
                          style={{ flex: '1', padding: '8px 10px' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                        End To Date & Time
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="date" 
                          value={testFormData.toDate} 
                          onChange={(e) => setTestFormData({ ...testFormData, toDate: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1.2', padding: '8px 10px' }} 
                        />
                        <input 
                          type="time" 
                          value={testFormData.toTime} 
                          onChange={(e) => setTestFormData({ ...testFormData, toTime: e.target.value })} 
                          className="modal-input" 
                          style={{ flex: '1', padding: '8px 10px' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#0f766e' }}>
                      Test Access & Pricing:
                    </label>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input 
                          type="checkbox" 
                          checked={testFormData.isFree} 
                          onChange={(e) => setTestFormData({ ...testFormData, isFree: e.target.checked, price: e.target.checked ? 0 : testFormData.price })} 
                          style={{ width: '18px', height: '18px' }} 
                        />
                        🎁 இலவச தேர்வு (Free Online Test)
                      </label>

                      {!testFormData.isFree && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>விலை (₹):</span>
                          <input 
                            type="number" 
                            min="1" 
                            placeholder="Price" 
                            value={testFormData.price} 
                            onChange={(e) => setTestFormData({ ...testFormData, price: Number(e.target.value) })} 
                            className="modal-input" 
                            style={{ width: '120px', padding: '6px 10px' }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '2px solid #f1f5f9', paddingTop: '16px' }}>
                    <button type="button" onClick={() => setShowTestModal(false)} className="btn-modal-cancel" style={{ padding: '9px 18px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if(!testFormData.title.trim()) {
                          showNotification('Please enter the Test Title first!', 'warning');
                          return;
                        }
                        if(!testFormData.durationMinutes) {
                          showNotification('Please enter valid duration!', 'warning');
                          return;
                        }
                        setTestModalStep(2);
                      }} 
                      className="btn-add-primary" 
                      style={{ padding: '9px 22px', borderRadius: '6px' }}
                    >
                      Next Step ➡️
                    </button>
                  </div>
                </div>
              )}

              {/* =========== STEP 2: Categories / Topics Selection =========== */}
              {testModalStep === 2 && (
                <div className="step-2-container fade-in-animation">
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                    <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', color: '#0f766e', fontSize: '15px' }}>
                      Select Categories / Topics for Test Questions:
                    </label>
                    
                    {/* Nested Sub-Topics Selection Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                      {Object.keys(availableTestTopics).map((mainTopic) => (
                        <div key={mainTopic} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '13.5px', textTransform: 'uppercase' }}>{mainTopic}</h4>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {availableTestTopics[mainTopic].map((subTopic) => (
                              <label key={subTopic} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                <input 
                                  type="checkbox" 
                                  checked={(testFormData.selectedTopics || []).includes(subTopic)} 
                                  onChange={() => {
                                    const current = testFormData.selectedTopics || [];
                                    const updated = current.includes(subTopic)
                                      ? current.filter(t => t !== subTopic)
                                      : [...current, subTopic];
                                    
                                    const updatedCounts = { ...testFormData.topicQuestionCounts };
                                    if (!current.includes(subTopic)) {
                                      updatedCounts[subTopic] = 10; // Default questions count for new topic
                                    } else {
                                      delete updatedCounts[subTopic];
                                    }
                                    
                                    const total = Object.values(updatedCounts).reduce((sum, val) => sum + (val || 0), 0);

                                    setTestFormData({ 
                                      ...testFormData, 
                                      selectedTopics: updated, 
                                      topicQuestionCounts: updatedCounts,
                                      totalQuestions: total > 0 ? total : 0
                                    });
                                  }} 
                                />
                                {subTopic}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {testFormData.selectedTopics && testFormData.selectedTopics.length > 0 && (
                      <div style={{ marginTop: '20px', borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
                        <label className="modal-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', color: '#b91c1c', fontSize: '14px' }}>
                          Questions Per Topic: <span style={{ color: '#0f766e' }}>(Total: {testFormData.totalQuestions})</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                          {(testFormData.selectedTopics || []).map(topic => (
                            <div key={topic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topic}>
                                {topic}
                              </span>
                              <input 
                                type="number" 
                                min="1" 
                                value={testFormData.topicQuestionCounts?.[topic] || ''}
                                onChange={(e) => {
                                  const counts = { ...testFormData.topicQuestionCounts, [topic]: Number(e.target.value) };
                                  const total = Object.values(counts).reduce((sum, val) => sum + (val || 0), 0);
                                  setTestFormData({ ...testFormData, topicQuestionCounts: counts, totalQuestions: total });
                                }}
                                className="modal-input"
                                style={{ width: '60px', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f1f5f9', paddingTop: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => setTestModalStep(1)} 
                      className="btn-modal-cancel" 
                      style={{ padding: '9px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ⬅️ Back
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setShowTestModal(false)} className="btn-modal-cancel" style={{ padding: '9px 18px', background: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                      <button type="submit" className="btn-modal-submit" style={{ padding: '9px 24px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14.5px', boxShadow: '0 4px 6px rgba(15,118,110,0.3)' }}>
                        ✅ Save Test
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTest && (
        <div className="modal-overlay" onClick={() => setPreviewTest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Test Preview: {previewTest.test.title}</h3>
            {previewTest.questions.map((q, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', marginBottom: '6px' }}>
                <b>{i + 1}. {q.question}</b>
                <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '2px' }}>Answer: {q.correctAnswer}</div>
              </div>
            ))}
            <button onClick={() => setPreviewTest(null)} className="btn-modal-cancel" style={{ marginTop: '8px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterAdmin;
