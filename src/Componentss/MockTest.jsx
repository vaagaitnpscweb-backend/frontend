import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/MockTest.css';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function MockTest() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {};
  });
  const isMasterAdmin = (currentUser.email || '').toLowerCase() === 'abcdanand970@gmail.com' || currentUser.role === 'admin';
  const isSubscribed = currentUser.isSubscribed || currentUser.subscriptionStatus === 'ACTIVE' || isMasterAdmin;

  const [pageAlert, setPageAlert] = useState({ show: false, message: '', type: 'info' });

  const triggerAlert = (message, type = 'info') => {
    setPageAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setPageAlert({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  const [onlineTests, setOnlineTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Main Category Tab: 'free' or 'paid'
  const [selectedMainTab, setSelectedMainTab] = useState('free');

  // Exam States (CBT Mode)
  const [activeTest, setActiveTest] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // CBT Advanced States: { [index]: { selectedOption, status: 'answered' | 'marked' | 'visited' } }
  const [questionStatusMap, setQuestionStatusMap] = useState({});
  
  const [examCompleted, setExamCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [examHistory, setExamHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(currentUser.points || 0);
  const [attendedTestsList, setAttendedTestsList] = useState(currentUser.attendedTests || []);

  // Custom Test Creation Modal/State for Paid Users
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopics, setCustomTopics] = useState(['Tamil']);
  const [customCount, setCustomCount] = useState(15);
  const [customDuration, setCustomDuration] = useState(10);
  const [customTitle, setCustomTitle] = useState('My Custom Practice Test');

  const fetchTests = () => {
    fetch(`${API_BASE}/api/tests/public`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.tests)) {
          setOnlineTests(data.tests.filter(t => t.status === 'active'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Tests fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const historyKey = `vaagai_quiz_history_${currentUser.email || 'guest'}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) setExamHistory(JSON.parse(savedHistory));

    const attendedKey = `vaagai_attended_${currentUser.email || 'guest'}`;
    const savedAttended = localStorage.getItem(attendedKey);
    if (savedAttended) setAttendedTestsList(JSON.parse(savedAttended));

    fetchTests();
  }, [currentUser.email]);

  useEffect(() => {
    if (!examStarted || examCompleted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, examStarted, examCompleted]);

  const getTestScheduleStatus = (test) => {
    if (!test.startTime) return { status: 'LIVE', label: '🟢 Live Now' };

    const now = new Date().getTime();
    const startTimeMs = new Date(test.startTime).getTime();
    const durationMs = (Number(test.durationMinutes) || 15) * 60 * 1000;
    const endTimeMs = test.endTime ? new Date(test.endTime).getTime() : (startTimeMs + durationMs);

    if (now < startTimeMs) {
      const formattedStartTime = new Date(test.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { status: 'UPCOMING', label: `⏳ Starts at ${formattedStartTime}` };
    }
    if (now > endTimeMs) return { status: 'EXPIRED', label: '❌ Test Ended' };
    return { status: 'LIVE', label: '🟢 Live Now' };
  };

  const proceedToTest = async (test, customQns = null) => {
    setActiveTest(test);
    setLoading(true);

    try {
      let testQns = customQns;
      if (!testQns) {
        const res = await fetch(`${API_BASE}/api/quiz/questions`);
        const data = await res.json();

        if (data.success && data.questions.length > 0) {
          const rawTopics = test.selectedTopics && test.selectedTopics.length > 0 ? test.selectedTopics : [test.topic || 'Tamil'];
          const cleanTopics = rawTopics.map(t => t.trim().toLowerCase());

          if (test.selectionType === 'selective' && test.selectedQuestionIds && test.selectedQuestionIds.length > 0) {
            testQns = data.questions.filter(q => test.selectedQuestionIds.includes(q.id || q._id));
          } else {
            testQns = data.questions.filter(q => cleanTopics.includes((q.topic || q.category || '').trim().toLowerCase()));
          }

          if (testQns.length === 0) testQns = data.questions.slice(0, test.totalQuestions || 20);
        }
      }

      if (!testQns || testQns.length === 0) {
        triggerAlert("No questions available for this test!", "error");
        setLoading(false);
        return;
      }

      const finalQns = testQns.slice(0, test.totalQuestions || 20);
      setQuizQuestions(finalQns);

      // Initialize CBT Status Map
      const initialMap = {};
      finalQns.forEach((_, idx) => {
        initialMap[idx] = { selectedOption: null, status: 'not-visited' };
      });
      initialMap[0] = { selectedOption: null, status: 'not-answered' }; // First question marked as visited/not-answered
      setQuestionStatusMap(initialMap);

      setTimeLeft((Number(test.durationMinutes) || 15) * 60);
      setExamStarted(true);
      setExamCompleted(false);
      setCurrentQuestionIndex(0);
    } catch (err) {
      triggerAlert("Unable to connect to server!", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Handle Custom Test Generation for Paid Users
  const handleGenerateCustomTest = async (e) => {
    e.preventDefault();
    if (!isSubscribed) {
      triggerAlert("Custom Question sets are exclusively for Subscribed / Paid users!", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quiz/questions`);
      const data = await res.json();
      if (data.success && data.questions.length > 0) {
        const cleanTopics = customTopics.map(t => t.trim().toLowerCase());
        let filtered = data.questions.filter(q => cleanTopics.includes((q.topic || q.category || '').trim().toLowerCase()));
        if (filtered.length === 0) filtered = data.questions;

        // Shuffle & slice
        const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, customCount);
        const customTestObj = {
          id: 'custom_' + Date.now(),
          title: customTitle,
          examType: 'Custom Practice',
          totalQuestions: shuffled.length,
          durationMinutes: customDuration,
          isFree: false,
          isCustom: true
        };
        setShowCustomModal(false);
        proceedToTest(customTestObj, shuffled);
      } else {
        triggerAlert("Failed to load question pool.", "error");
        setLoading(false);
      }
    } catch (err) {
      triggerAlert("Error generating custom test.", "error");
      setLoading(false);
    }
  };

  const handleStartTest = async (test) => {
    if (!currentUser.email) {
      triggerAlert("Please log in first to attend the test!", "warning");
      return;
    }

    const testUniqueId = String(test.id || test._id);

    if (attendedTestsList.includes(testUniqueId) && !isMasterAdmin && !test.isCustom) {
      triggerAlert("You have already completed this test! Retests are not allowed.", "warning");
      return;
    }

    const schedule = getTestScheduleStatus(test);
    if (schedule.status === 'UPCOMING' && !isMasterAdmin && !test.isCustom) {
      triggerAlert(`Test has not started yet. Starts at: ${schedule.label}`, "warning");
      return;
    }
    if (schedule.status === 'EXPIRED' && !isMasterAdmin && !test.isCustom) {
      triggerAlert("This test has expired!", "error");
      return;
    }

    if (!test.isFree && test.price > 0 && !isSubscribed) {
      const payConfirm = window.confirm(`This is a paid test (₹${test.price}). Proceed to payment?`);
      if (!payConfirm) return;

      try {
        const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: test.price })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) return triggerAlert("Could not initiate payment order!", "error");

        const options = {
          key: "rzp_test_TCtg24wJm0gqRH",
          amount: orderData.amount,
          currency: "INR",
          name: "Vaagai Tuition",
          description: test.title,
          order_id: orderData.orderId,
          handler: async (response) => {
            await fetch(`${API_BASE}/api/payment/success`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: currentUser.email,
                bookId: testUniqueId,
                bookTitle: test.title,
                price: test.price
              })
            });
            proceedToTest(test);
          },
          prefill: { email: currentUser.email, name: currentUser.name }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (e) {
        triggerAlert("Payment gateway error!", "error");
      }
      return;
    }

    proceedToTest(test);
  };

  // CBT Palette Navigation & Option Selection
  const handleSelectOptionCBT = (option) => {
    setQuestionStatusMap(prev => ({
      ...prev,
      [currentQuestionIndex]: { selectedOption: option, status: 'answered' }
    }));
  };

  const handleMarkForReview = () => {
    setQuestionStatusMap(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...prev[currentQuestionIndex], status: 'marked' }
    }));
    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setQuestionStatusMap(prev => ({
        ...prev,
        [nextIdx]: { ...prev[nextIdx], status: prev[nextIdx].status === 'not-visited' ? 'not-answered' : prev[nextIdx].status }
      }));
      setCurrentQuestionIndex(nextIdx);
    }
  };

  const handleClearResponse = () => {
    setQuestionStatusMap(prev => ({
      ...prev,
      [currentQuestionIndex]: { selectedOption: null, status: 'not-answered' }
    }));
  };

  const handleNavigateQuestion = (idx) => {
    setQuestionStatusMap(prev => ({
      ...prev,
      [idx]: { ...prev[idx], status: prev[idx].status === 'not-visited' ? 'not-answered' : prev[idx].status }
    }));
    setCurrentQuestionIndex(idx);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (questionStatusMap[index]?.selectedOption === q.correctAnswer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const totalQuestions = quizQuestions.length;

  const handleFinalSubmit = async () => {
    const confirmSub = window.confirm("Are you sure you want to submit the exam?");
    if (!confirmSub && timeLeft > 0) return;

    setExamCompleted(true);
    const testUniqueId = String(activeTest?.id || activeTest?._id || 'custom');

    const updatedAttended = [...attendedTestsList, testUniqueId];
    setAttendedTestsList(updatedAttended);
    localStorage.setItem(`vaagai_attended_${currentUser.email || 'guest'}`, JSON.stringify(updatedAttended));

    const newPoints = totalPoints + score;
    setTotalPoints(newPoints);

    if (currentUser.email && !activeTest?.isCustom) {
      try {
        await fetch(`${API_BASE}/api/tests/submit-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            testId: testUniqueId,
            testTitle: activeTest?.title || 'Mock Test',
            isFree: activeTest?.isFree ?? true,
            score: score,
            totalQuestions: totalQuestions
          })
        });

        const updatedUser = { ...currentUser, points: newPoints, attendedTests: updatedAttended };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } catch (e) {
        console.error("Score sync failed", e);
      }
    }

    const newResult = {
      testTitle: activeTest ? activeTest.title : 'Mock Test',
      date: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      obtainedScore: score,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    };

    const updatedHistory = [newResult, ...examHistory];
    setExamHistory(updatedHistory);
    localStorage.setItem(`vaagai_quiz_history_${currentUser.email || 'guest'}`, JSON.stringify(updatedHistory));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '1.2rem', color: '#0d9488', fontWeight: 'bold' }}>
        🔄 Loading tests... Please wait.
      </div>
    );
  }

  // Filter lists for 2-column division
  const freeTestsList = onlineTests.filter(t => t.isFree);
  const paidTestsList = onlineTests.filter(t => !t.isFree);

  return (
    <div className="quiz-page-container">
      {pageAlert.show && (
        <div className={`inpage-toast ${pageAlert.type}`}>
          <span>{pageAlert.type === 'success' ? '✅' : pageAlert.type === 'error' ? '❌' : '⚠️'}</span>
          <span>{pageAlert.message}</span>
        </div>
      )}

      {!examStarted && !examCompleted && (
        <div className="quiz-dashboard-flow">
          <div className="quiz-start-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>🏆 Online CBT Mock Exams</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {currentUser.email && (
                  <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13.5px' }}>
                    ⭐ Total Points: {totalPoints}
                  </div>
                )}
                {/* Custom Question Set Button for Paid Users */}
                <button
                  onClick={() => {
                    if (!isSubscribed) {
                      triggerAlert("Custom Questions feature is exclusively for Subscribed / Paid members!", "warning");
                    } else {
                      setShowCustomModal(true);
                    }
                  }}
                  style={{
                    background: isSubscribed ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#cbd5e1',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: isSubscribed ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    boxShadow: isSubscribed ? '0 4px 12px rgba(245,158,11,0.3)' : 'none'
                  }}
                >
                  ⚡ Create Custom CBT Test {isSubscribed ? '' : '🔒 (Paid)'}
                </button>
              </div>
            </div>

            {/* Main Tabs: Free vs Paid */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              <button
                onClick={() => setSelectedMainTab('free')}
                style={{
                  background: selectedMainTab === 'free' ? '#0f766e' : '#f1f5f9',
                  color: selectedMainTab === 'free' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13.5px'
                }}
              >
                🎉 Free Mock Tests ({freeTestsList.length})
              </button>
              <button
                onClick={() => setSelectedMainTab('paid')}
                style={{
                  background: selectedMainTab === 'paid' ? '#0f766e' : '#f1f5f9',
                  color: selectedMainTab === 'paid' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13.5px'
                }}
              >
                💎 Paid / Premium Tests ({paidTestsList.length})
              </button>
            </div>

            {/* Test Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
              {(selectedMainTab === 'free' ? freeTestsList : paidTestsList).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '30px', gridColumn: '1 / -1' }}>No tests available in this section right now.</p>
              ) : (
                (selectedMainTab === 'free' ? freeTestsList : paidTestsList).map((t) => {
                  const testUniqueId = String(t.id || t._id);
                  const isAttended = attendedTestsList.includes(testUniqueId);
                  const schedule = getTestScheduleStatus(t);
                  const isUpcoming = schedule.status === 'UPCOMING';
                  const isExpired = schedule.status === 'EXPIRED';

                  return (
                    <div key={testUniqueId} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            {t.examType || 'General'}
                          </span>
                          <span style={{ background: t.isFree ? '#dcfce7' : '#fef9c3', color: t.isFree ? '#15803d' : '#854d0e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                            {t.isFree ? '🎉 FREE' : `💳 ₹${t.price}`}
                          </span>
                        </div>

                        <h3 style={{ margin: '10px 0 6px 0', color: '#1e293b', fontSize: '16px' }}>{t.title}</h3>

                        <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>📊 Questions: <b>{t.totalQuestions} Qns</b></span>
                          <span>⏱️ Duration: <b>{t.durationMinutes} Minutes</b></span>
                          <span style={{ color: isUpcoming ? '#d97706' : isExpired ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                            📅 {schedule.label}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={(isUpcoming || isAttended) && !isMasterAdmin}
                        onClick={() => handleStartTest(t)}
                        style={{
                          background: isAttended ? '#64748b' : isUpcoming ? '#94a3b8' : isExpired ? '#ef4444' : '#17a983',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: ((isUpcoming || isAttended) && !isMasterAdmin) ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          width: '100%'
                        }}
                      >
                        {isAttended ? '✓ Already Completed' : isUpcoming ? `⏳ Locked (${schedule.label.replace('⏳ Starts at ', '')})` : isExpired ? 'Test Ended' : '🖥️ Launch CBT Exam'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Exam History */}
          <div className="quiz-history-card">
            <div className="history-header">
              <h3>📜 CBT Exam Performance History</h3>
            </div>
            {examHistory.length > 0 ? (
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Test Title</th>
                      <th>Date & Time</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examHistory.map((res, idx) => (
                      <tr key={idx}>
                        <td><b>{res.testTitle}</b></td>
                        <td>{res.date} - <span className="text-muted">{res.time}</span></td>
                        <td className="font-weight-bold" style={{ color: '#0f766e' }}>{res.obtainedScore} / {res.total}</td>
                        <td>{res.percentage}%</td>
                        <td>
                          <span className={`badge-status ${res.percentage >= 50 ? 'pass' : 'fail'}`}>
                            {res.percentage >= 50 ? '🎯 Pass' : '👎 Need Practice'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-history-box">
                👋 You haven't taken any mock tests yet. Launch a test above to begin!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🖥️ REAL CBT EXAM INTERFACE (Real Exam Screen Layout) */}
      {examStarted && !examCompleted && quizQuestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          {/* CBT Top Header Bar */}
          <div style={{ background: '#0f172a', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8' }}>{activeTest?.title || 'Online CBT Examination'}</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Candidate: {currentUser.name || currentUser.email || 'Student'}</span>
            </div>
            <div style={{ background: timeLeft < 300 ? '#ef4444' : '#1e293b', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', border: '1px solid rgba(255,255,255,0.2)' }}>
              ⏱️ Time Left: <span style={{ fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* CBT Main Split Body */}
          <div style={{ display: 'flex', flex: '1', flexWrap: 'wrap' }}>
            
            {/* Left Question Panel */}
            <div style={{ flex: '1', minWidth: '320px', padding: '24px', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                  <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 'bold', color: '#0f766e' }}>
                    {quizQuestions[currentQuestionIndex].topic || "General"}
                  </span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '20px', lineHeight: '1.5' }}>
                  {quizQuestions[currentQuestionIndex].question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected = questionStatusMap[currentQuestionIndex]?.selectedOption === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOptionCBT(option)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #0f766e' : '1.5px solid #e2e8f0',
                          background: isSelected ? '#f0fdfa' : '#f8fafc',
                          color: '#1e293b',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: isSelected ? '#0f766e' : '#e2e8f0', color: isSelected ? '#fff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span style={{ fontSize: '14px' }}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleClearResponse}
                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}
                  >
                    Clear Response
                  </button>
                  <button
                    onClick={handleMarkForReview}
                    style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}
                  >
                    Mark for Review & Next
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                  >
                    &larr; Prev
                  </button>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => {
                        const nextIdx = currentQuestionIndex + 1;
                        setQuestionStatusMap(prev => ({
                          ...prev,
                          [nextIdx]: { ...prev[nextIdx], status: prev[nextIdx].status === 'not-visited' ? 'not-answered' : prev[nextIdx].status }
                        }));
                        setCurrentQuestionIndex(nextIdx);
                      }}
                      style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Save & Next &rarr;
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                    >
                      🎯 Submit Exam
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Right CBT Question Palette Panel */}
            <div style={{ width: '300px', background: '#f1f5f9', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid #e2e8f0' }}>
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Question Palette</h4>
                
                {/* Status Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '11px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span> Answered ({Object.values(questionStatusMap).filter(s => s.status === 'answered').length})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '3px' }}></span> Not Answered ({Object.values(questionStatusMap).filter(s => s.status === 'not-answered').length})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }}></span> Marked ({Object.values(questionStatusMap).filter(s => s.status === 'marked').length})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: '#cbd5e1', borderRadius: '3px' }}></span> Not Visited ({Object.values(questionStatusMap).filter(s => s.status === 'not-visited').length})</div>
                </div>

                {/* Grid of Question Numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                  {quizQuestions.map((_, qIdx) => {
                    const st = questionStatusMap[qIdx]?.status || 'not-visited';
                    let bgCol = '#cbd5e1';
                    let textCol = '#334155';
                    if (st === 'answered') { bgCol = '#10b981'; textCol = '#fff'; }
                    else if (st === 'not-answered') { bgCol = '#ef4444'; textCol = '#fff'; }
                    else if (st === 'marked') { bgCol = '#f59e0b'; textCol = '#fff'; }

                    const isCurrent = qIdx === currentQuestionIndex;

                    return (
                      <button
                        key={qIdx}
                        onClick={() => handleNavigateQuestion(qIdx)}
                        style={{
                          background: bgCol,
                          color: textCol,
                          border: isCurrent ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '6px',
                          height: '36px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px',
                          boxShadow: isCurrent ? '0 0 0 2px rgba(15,23,42,0.3)' : 'none'
                        }}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleFinalSubmit}
                style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '16px', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}
              >
                🏁 Final Submit Exam
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📊 Result Screen */}
      {examCompleted && (
        <div className="result-and-review-wrapper">
          <div className="quiz-result-card">
            <h2>📊 Exam Results</h2>
            <div className="result-score-circle">
              <span className="user-score">{score}</span>
              <span className="total-score">/ {totalQuestions}</span>
            </div>
            <p className="result-feedback">
              {score >= (totalQuestions / 2) ? `🎉 Great job! You earned ${score} points! Total: ${totalPoints} Points.` : `👍 Keep practicing! Total Points: ${totalPoints}.`}
            </p>

            <div className="result-summary-grid">
              <div className="summary-item correct">✅ Correct: <strong>{score}</strong></div>
              <div className="summary-item wrong">❌ Wrong: <strong>{totalQuestions - score}</strong></div>
              <div className="summary-item percentage">📈 Score: <strong>{totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</strong></div>
            </div>

            <div className="result-action-buttons">
              <button className="review-toggle-btn" onClick={() => setShowReview(!showReview)}>
                {showReview ? "👁️ Hide Review" : "📄 Review Answers"}
              </button>
              <button className="restart-exam-btn" onClick={() => {
                setExamStarted(false);
                setExamCompleted(false);
                setShowReview(false);
                fetchTests();
              }}>
                🏠 Return to Tests
              </button>
            </div>
          </div>

          {showReview && (
            <div className="answer-review-section">
              <h3 className="review-title">📝 Answer Review</h3>
              {quizQuestions.map((q, index) => {
                const userAnswer = questionStatusMap[index]?.selectedOption;
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id || index} className={`review-card-item ${isCorrect ? 'item-correct' : 'item-wrong'}`}>
                    <div className="review-item-header">
                      <span className="review-index">Question {index + 1}</span>
                      <span className={`review-status-badge ${isCorrect ? 'status-pass' : 'status-fail'}`}>
                        {isCorrect ? "Correct" : userAnswer ? "Wrong" : "Unattempted"}
                      </span>
                    </div>
                    <h4>{q.question}</h4>
                    <div className="review-options-group">
                      {q.options.map((opt, oIdx) => {
                        let optClass = "review-opt";
                        if (opt === q.correctAnswer) optClass += " opt-right-answer";
                        if (opt === userAnswer && opt !== q.correctAnswer) optClass += " opt-wrong-selected";
                        return (
                          <div key={oIdx} className={optClass}>
                            <span className="opt-indicator">{opt === q.correctAnswer ? "✅" : opt === userAnswer ? "❌" : "•"}</span>
                            {opt} {opt === userAnswer && <span className="user-choice-tag">(Your Choice)</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ⚡ Custom CBT Test Generator Modal for Paid Users */}
      {showCustomModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f766e' }}>⚡ Custom CBT Practice Generator</h3>
              <button onClick={() => setShowCustomModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleGenerateCustomTest}>
              <div style={{ marginBottom: '14px' }}>
                <label className="modal-label">Test Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>

              <div className="grid-2-col">
                <div>
                  <label className="modal-label">Questions Count</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={customCount}
                    onChange={(e) => setCustomCount(Number(e.target.value))}
                    required
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="modal-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    required
                    className="modal-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="modal-label">Select Topics (Comma separated or default)</label>
                <select
                  multiple
                  value={customTopics}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setCustomTopics(options);
                  }}
                  className="modal-input"
                  style={{ height: '90px' }}
                >
                  <option value="Tamil">Tamil</option>
                  <option value="Maths">Maths</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Current Affairs">Current Affairs</option>
                </select>
                <small style={{ color: '#64748b', fontSize: '11px' }}>Hold Ctrl/Cmd to select multiple topics.</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn-modal-cancel">Cancel</button>
                <button type="submit" className="btn-modal-submit">🚀 Launch Custom CBT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockTest;
