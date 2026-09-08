import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/FreeQuiz.css';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function FreeQuiz() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isMasterAdmin = currentUser.email === 'abcdanand970@gmail.com' || currentUser.role === 'admin';

  // 🔔 In-Page Alert State
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

  const [activeTest, setActiveTest] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examCompleted, setExamCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [examHistory, setExamHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const fetchTests = () => {
    const headers = {
      'Content-Type': 'application/json',
      'user-email': currentUser.email || 'abcdanand970@gmail.com'
    };

    fetch(`${API_BASE}/api/tests/public`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.tests)) {
          const activeTests = data.tests.filter(t => t.status === 'active');
          setOnlineTests(activeTests);
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
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setExamHistory(parsed);
      const points = parsed.reduce((sum, item) => sum + (item.obtainedScore || 0), 0);
      setTotalPoints(points);
    }

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
    if (!test.startTime) {
      return { status: 'LIVE', label: '🟢 Live Now' };
    }

    const now = new Date().getTime();
    const startTimeMs = new Date(test.startTime).getTime();
    const durationMs = (Number(test.durationMinutes) || 15) * 60 * 1000;
    const endTimeMs = test.endTime ? new Date(test.endTime).getTime() : (startTimeMs + durationMs);

    if (now < startTimeMs) {
      const formattedStartTime = new Date(test.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { status: 'UPCOMING', label: `⏳ Starts at ${formattedStartTime}` };
    }

    if (now > endTimeMs) {
      return { status: 'EXPIRED', label: '❌ Test Ended' };
    }

    return { status: 'LIVE', label: '🟢 Live Now' };
  };

  const handleStartTest = async (test) => {
    if (!currentUser.email) {
      triggerAlert("Please log in first to attend the test!", "warning");
      return;
    }

    const schedule = getTestScheduleStatus(test);
    if (schedule.status === 'UPCOMING' && !isMasterAdmin) {
      triggerAlert(`This test has not started yet. Starts at: ${new Date(test.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, "warning");
      return;
    }
    if (schedule.status === 'EXPIRED' && !isMasterAdmin) {
      triggerAlert("This test has already expired!", "error");
      return;
    }

    setActiveTest(test);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/quiz/questions`);
      const data = await res.json();

      if (data.success && data.questions.length > 0) {
        let testQns = [];
        const rawTopics = test.selectedTopics && test.selectedTopics.length > 0
          ? test.selectedTopics
          : [test.topic || 'Tamil'];

        const cleanTopics = rawTopics.map(t => t.trim().toLowerCase());

        if (test.selectionType === 'selective' && test.selectedQuestionIds && test.selectedQuestionIds.length > 0) {
          testQns = data.questions.filter(q => test.selectedQuestionIds.includes(q.id || q._id));
        } else {
          const matched = data.questions.filter(q => {
            const qTopic = (q.topic || q.category || '').trim().toLowerCase();
            return cleanTopics.includes(qTopic);
          });
          testQns = matched.slice(0, test.totalQuestions || 20);
        }

        if (testQns.length === 0) {
          testQns = data.questions.slice(0, test.totalQuestions || 20);
        }

        setQuizQuestions(testQns);
        setTimeLeft((Number(test.durationMinutes) || 15) * 60);
        setExamStarted(true);
        setExamCompleted(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
      } else {
        triggerAlert("No questions found for this test!", "error");
      }
    } catch (err) {
      triggerAlert("Unable to connect to the server!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option });
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const totalQuestions = quizQuestions.length;

  const handleFinalSubmit = () => {
    setExamCompleted(true);

    const earnedPoints = score;
    const newTotalPoints = totalPoints + earnedPoints;
    setTotalPoints(newTotalPoints);

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

    const historyKey = `vaagai_quiz_history_${currentUser.email || 'guest'}`;
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (!isMasterAdmin) return triggerAlert("Only Master Admin can clear test history!", "error");
    if (window.confirm("Do you want to clear your test history?")) {
      const historyKey = `vaagai_quiz_history_${currentUser.email || 'guest'}`;
      localStorage.removeItem(historyKey);
      setExamHistory([]);
      setTotalPoints(0);
      triggerAlert("Test history cleared!", "info");
    }
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

  return (
    <div className="quiz-page-container">
      {/* 🔔 Floating In-Page Banner Alert */}
      {pageAlert.show && (
        <div className={`inpage-toast ${pageAlert.type}`}>
          <span>{pageAlert.type === 'success' ? '✅' : pageAlert.type === 'error' ? '❌' : '⚠️'}</span>
          <span>{pageAlert.message}</span>
        </div>
      )}

      {!examStarted && !examCompleted && (
        <div className="quiz-dashboard-flow">
          <div className="quiz-start-card" style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ color: '#0f766e', margin: 0 }}>🏆 Online Mock Tests</h2>
              {currentUser.email && (
                <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                  ⭐ Total Points: {totalPoints} Points
                </div>
              )}
            </div>

            {onlineTests.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No live tests available right now.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
                {onlineTests.map((t) => {
                  const schedule = getTestScheduleStatus(t);
                  const isUpcoming = schedule.status === 'UPCOMING';
                  const isExpired = schedule.status === 'EXPIRED';

                  return (
                    <div key={t.id || t._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
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
                        disabled={isUpcoming && !isMasterAdmin}
                        onClick={() => handleStartTest(t)}
                        style={{
                          background: isUpcoming ? '#94a3b8' : isExpired ? '#ef4444' : '#17a983',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: (isUpcoming && !isMasterAdmin) ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          width: '100%'
                        }}
                      >
                        {isUpcoming ? `⏳ Please Wait (${schedule.label.replace('⏳ Starts at ', '')})` : isExpired ? 'Test Expired' : '🚀 Start Test'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="quiz-history-card">
            <div className="history-header">
              <h3>📜 Exam Performance History</h3>
              {isMasterAdmin && examHistory.length > 0 && (
                <button className="clear-history-btn" onClick={clearHistory}>🗑️ Clear History (Admin)</button>
              )}
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
                👋 You haven't taken any tests yet. Choose a test above to start!
              </div>
            )}
          </div>
        </div>
      )}

      {examStarted && !examCompleted && quizQuestions.length > 0 && (
        <div className="live-exam-box">
          <div className="exam-top-status">
            <span className="question-counter">Question: <strong>{currentQuestionIndex + 1}</strong> / {totalQuestions}</span>
            <span className={`exam-timer ${timeLeft < 300 ? 'timer-danger' : ''}`}>⏱️ Time: {formatTime(timeLeft)}</span>
          </div>

          <span className="exam-cat-badge">{quizQuestions[currentQuestionIndex].topic || quizQuestions[currentQuestionIndex].category || "General"}</span>
          <div className="quiz-question-section">
            <h3>{quizQuestions[currentQuestionIndex].question}</h3>
          </div>

          <div className="quiz-options-list">
            {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${selectedAnswers[currentQuestionIndex] === option ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="option-prefix">{String.fromCharCode(65 + idx)})</span> {option}
              </button>
            ))}
          </div>

          <div className="exam-nav-buttons">
            <button className="nav-prev-btn" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>&larr; Previous</button>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button className="nav-next-btn" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next &rarr;</button>
            ) : (
              <button className="nav-submit-btn" onClick={handleFinalSubmit}>🎯 Submit Exam</button>
            )}
          </div>
        </div>
      )}

      {examCompleted && (
        <div className="result-and-review-wrapper">
          <div className="quiz-result-card">
            <h2>📊 Exam Results</h2>
            <div className="result-score-circle">
              <span className="user-score">{score}</span>
              <span className="total-score">/ {totalQuestions}</span>
            </div>
            <p className="result-feedback">{score >= (totalQuestions / 2) ? "🎉 Great job! Your score was recorded successfully." : "👍 Keep practicing to improve your score!"}</p>

            <div className="result-summary-grid">
              <div className="summary-item correct">✅ Correct: <strong>{score}</strong></div>
              <div className="summary-item wrong">❌ Wrong: <strong>{totalQuestions - score}</strong></div>
              <div className="summary-item percentage">📈 Percentage: <strong>{totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</strong></div>
            </div>

            <div className="result-action-buttons">
              <button className="review-toggle-btn" onClick={() => setShowReview(!showReview)}>
                {showReview ? "👁️ Hide Review" : "📄 Review Answers"}
              </button>
              <button className="restart-exam-btn" onClick={() => {
                setExamStarted(false);
                setExamCompleted(false);
                setShowReview(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                fetchTests();
              }}>
                🏠 Return to Tests
              </button>
            </div>
          </div>

          {showReview && (
            <div className="answer-review-section">
              <h3 className="review-title">📝 Answer Analysis & Review</h3>
              {quizQuestions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id || index} className={`review-card-item ${isCorrect ? 'item-correct' : 'item-wrong'}`}>
                    <div className="review-item-header">
                      <span className="review-index">Question {index + 1}</span>
                      <span className="review-cat">{q.topic || q.category || "General"}</span>
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
    </div>
  );
}

export default FreeQuiz;
