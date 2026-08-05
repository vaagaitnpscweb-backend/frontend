import { useState, useEffect } from 'react';
import '../Styles/FreeQuiz.css';

function FreeQuiz() {
  // 🧠 மாதிரி வினாக்கள் - சர்வர் கனெக்ட் ஆகவில்லை என்றால் இதுவே பேக்கப்பாக வேலை செய்யும் (Fallback)
  const fallbackQuestions = [
    {
      id: 1,
      category: "கணிதம் & உளவியல் (Maths & Aptitude)",
      question: "ஒரு மனிதன் ஒரு வேலை 6 நாட்களில் முடிக்கிறான், மற்றொருவன் 12 நாட்களில் முடிக்கிறான். இருவரும் சேர்ந்து வேலை செய்தால் எத்தனை நாட்களில் முடிப்பார்கள்?",
      options: ["3 நாட்கள்", "4 நாட்கள்", "5 நாட்கள்", "6 நாட்கள்"],
      correctAnswer: "4 நாட்கள்"
    },
    {
      id: 2,
      category: "கணிதம் & உளவியல் (Maths & Aptitude)",
      question: "0.5, 1.5, 4.5, 13.5, .... அடுத்த எண் என்ன?",
      options: ["27.5", "36.5", "40.5", "54.5"],
      correctAnswer: "40.5"
    },
    {
      id: 3,
      category: "பொது அறிவு (General Knowledge)",
      question: "இந்திய அரசியலமைப்பின் தந்தை என்று அழைக்கப்படுபவர் யார்?",
      options: ["மகாத்மா காந்தி", "ஜவஹர்லால் நேரு", "டாக்டர் பி.ஆர். அம்பேத்கர்", "சுபாஷ் சந்திர போஸ்"],
      correctAnswer: "டாக்டர் பி.ஆர். அம்பேத்கர்"
    },
    {
      id: 4,
      category: "பொது அறிவு (General Knowledge)",
      question: "தமிழ்நாட்டின் மிக உயரமான சிகரம் எது?",
      options: ["தொட்டபெட்டா", "ஆனைமுடி", "மகேந்திரகிரி", "முத்துக்கோடு"],
      correctAnswer: "தொட்டபெட்டா"
    },
    {
      id: 5,
      category: "நடப்பு நிகழ்வுகள் (Current Affairs)",
      question: "2026-ஆம் ஆண்டிற்கான உலக கோப்பை கால்பந்து போட்டி எங்கு நடைபெற உள்ளது?",
      options: ["அமெரிக்கா, கனடா & மெக்சிகோ", "பிரான்ஸ் & ஜெர்மனி", "கத்தார் & சவுதி அரேபியா", "இந்தியா & இலங்கை"],
      correctAnswer: "அமெரிக்கா, கனடா & மெக்சிகோ"
    }
  ];

  // 📢 கேள்விகளுக்கான மெயின் ஸ்டேட்
  const [quizQuestions, setQuizQuestions] = useState(fallbackQuestions);
  const [loading, setLoading] = useState(true);

  // எக்ஸாம் ஸ்டேட்ஸ்
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examCompleted, setExamCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);

  // 📊 தேர்வு வரலாற்றைச் சேமிக்கும் ஸ்டேட் (Exam History)
  const [examHistory, setExamHistory] = useState([]);

  // 🌐 வெப்சைட் லோடு ஆகும்போது பேக்எண்ட் API-ல் இருந்து கேள்விகளையும், லோக்கல் ஸ்டோரேஜில் இருந்து ஹிஸ்டரியையும் எடுத்தல்
  useEffect(() => {
    // 1. லோக்கல் ஹிஸ்டரி எடுத்தல்
    const savedHistory = localStorage.getItem('vaagai_quiz_history');
    if (savedHistory) {
      setExamHistory(JSON.parse(savedHistory));
    }

    // 2. பேக்எண்டில் இருந்து லைவ் கேள்விகளை எடுத்தல்
    fetch('http://localhost:5000/api/quiz/questions')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.questions.length > 0) {
          setQuizQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log("பேக்எண்ட் குவிஸ் API இணைக்கப்படவில்லை (Fallback மாதிரி வினாக்கள் பயன்படுத்தப்படுகிறது).");
        setLoading(false);
      });
  }, []);

  // லைவ் டைமர் லாஜிக்
  useEffect(() => {
    if (!examStarted || examCompleted) return;
    if (timeLeft === 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, examStarted, examCompleted]);

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

  // 💾 எக்ஸாம் சப்மிட் செய்யும்போது ரிசல்ட்டை சேவ் செய்யும் லாஜிக்!
  const handleFinalSubmit = () => {
    setExamCompleted(true);

    // புதிய ரிசல்ட் டேட்டா
    const newResult = {
      date: new Date().toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      obtainedScore: score,
      total: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100)
    };

    // பழைய ஹிஸ்டரியுடன் புதிய ரிசல்ட்டை இணைத்து லோக்கல் மெமரியில் சேவ் செய்கிறோம்
    const updatedHistory = [newResult, ...examHistory];
    setExamHistory(updatedHistory);
    localStorage.setItem('vaagai_quiz_history', JSON.stringify(updatedHistory));
  };

  // ஹிஸ்டரியை கிளியர் செய்ய ஒரு ஆப்ஷன்
  const clearHistory = () => {
    if (window.confirm("உங்களது தேர்வு வரலாற்றை அழிக்க வேண்டுமா?")) {
      localStorage.removeItem('vaagai_quiz_history');
      setExamHistory([]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.3rem', color: '#0d9488', fontWeight: 'bold' }}>
        🔄 தினசரி மாதிரித் தேர்வு வினாக்கள் லோடு ஆகிறது...
      </div>
    );
  }

  return (
    <div className="quiz-page-container">
      
      {/* 🏁 1. எக்ஸாம் ஆரம்பிக்கும் முந்தைய ஸ்கிரீன் */}
      {!examStarted && !examCompleted && (
        <div className="quiz-dashboard-flow">
          <div className="quiz-start-card">
            <h2>🏆 தினசரி இலவச மாதிரித் தேர்வு (Daily Free Test)</h2>
            <div className="exam-blueprint">
              <div className="bp-item">📊 மொத்தம்: <strong>{totalQuestions} வினாக்கள்</strong></div>
              <div className="bp-item">⏱️ நேரம்: <strong>40 நிமிடங்கள்</strong></div>
              <div className="bp-item">🎯 தகுதி: <strong>அனைத்து அரசுத் தேர்வு எழுதுபவர்கள்</strong></div>
            </div>
            <button className="start-exam-btn" onClick={() => setExamStarted(true)}>
              🚀 தேர்வை எழுதத் தொடங்கு
            </button>
          </div>

          {/* 📊 மாணவரின் முந்தைய தேர்வு முடிவுகள் காட்டும் டேஷ்போர்டு 🌟 */}
          <div className="quiz-history-card">
            <div className="history-header">
              <h3>📜 உங்களது தேர்வு வரலாறு (Exam Performance History)</h3>
              {examHistory.length > 0 && <button className="clear-history-btn" onClick={clearHistory}>🗑️ Clear History</button>}
            </div>
            
            {examHistory.length > 0 ? (
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>தேதி & நேரம்</th>
                      <th>மதிப்பெண்</th>
                      <th>சதவிகிதம்</th>
                      <th>நிலை (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examHistory.map((res, idx) => (
                      <tr key={idx}>
                        <td>{res.date} - <span className="text-muted">{res.time}</span></td>
                        <td className="font-weight-bold">{res.obtainedScore} / {res.total}</td>
                        <td>{res.percentage}%</td>
                        <td>
                          <span className={`badge-status ${res.percentage >= 50 ? 'pass' : 'fail'}`}>
                            {res.percentage >= 50 ? '🎯 தேர்ச்சி' : '👎 பயிற்சி தேவை'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-history-box">
                👋 நீங்கள் இன்னும் எந்த தேர்வுகளும் எழுதவில்லை. உங்கள் முதல் தேர்வை எழுத மேலே உள்ள பட்டனை கிளிக் செய்யவும்!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📝 2. லைவ் எக்ஸாம் ஸ்கிரீன் */}
      {examStarted && !examCompleted && quizQuestions.length > 0 && (
        <div className="live-exam-box">
          <div className="exam-top-status">
            <span className="question-counter">வினா: <strong>{currentQuestionIndex + 1}</strong> / {totalQuestions}</span>
            <span className={`exam-timer ${timeLeft < 300 ? 'timer-danger' : ''}`}>⏱️ மீதமுள்ள நேரம்: {formatTime(timeLeft)}</span>
          </div>

          <span className="exam-cat-badge">{quizQuestions[currentQuestionIndex].category || "பொதுப் பிரிவு"}</span>
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
            <button className="nav-prev-btn" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>&larr; முந்தைய வினா</button>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button className="nav-next-btn" onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>அடுத்த வினா &rarr;</button>
            ) : (
              <button className="nav-submit-btn" onClick={handleFinalSubmit}>🎯 தேர்வை முடிக்கவும் (Submit)</button>
            )}
          </div>
        </div>
      )}

      {/* 📊 3. தேர்வு முடிவுகள் + ரிவியூ ஆன்சர்ஸ் ஸ்கிரீன் */}
      {examCompleted && (
        <div className="result-and-review-wrapper">
          <div className="quiz-result-card">
            <h2>📊 தேர்வு முடிவுகள் (Exam Results)</h2>
            <div className="result-score-circle">
              <span className="user-score">{score}</span>
              <span className="total-score">/ {totalQuestions}</span>
            </div>
            <p className="result-feedback">{score >= (totalQuestions / 2) ? "🎉 வாழ்த்துகள் தலைவா! இந்த ரிசல்ட் உங்க ஹிஸ்டரில சேவ் ஆகிடுச்சு!" : "👍 தொடர்ந்து பயிற்சி செய்யuங்க தலைவா! ரிசல்ட் சேவ் ஆகிடுச்சு!"}</p>

            <div className="result-summary-grid">
              <div className="summary-item correct">✅ சரியானவை: <strong>{score}</strong></div>
              <div className="summary-item wrong">❌ தவறானவை: <strong>{totalQuestions - score}</strong></div>
              <div className="summary-item percentage">📈 சதவிகிதம்: <strong>{Math.round((score / totalQuestions) * 100)}%</strong></div>
            </div>

            <div className="result-action-buttons">
              <button className="review-toggle-btn" onClick={() => setShowReview(!showReview)}>
                {showReview ? "👁️ ரிவியூவை மறைக்கவும்" : "📄 விடைகளைச் சரிபார்க்கவும் (Review Answers)"}
              </button>
              <button className="restart-exam-btn" onClick={() => {
                setExamStarted(false);
                setExamCompleted(false);
                setShowReview(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setTimeLeft(40 * 60);
              }}>
                🏠 முகப்புப் பலகைக்குச் செல்ல
              </button>
            </div>
          </div>

          {showReview && (
            <div className="answer-review-section">
              <h3 className="review-title">📝 விடைக்குறிப்புகள் பகுப்பாய்வு</h3>
              {quizQuestions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className={`review-card-item ${isCorrect ? 'item-correct' : 'item-wrong'}`}>
                    <div className="review-item-header">
                      <span className="review-index">வினா {index + 1}</span>
                      <span className="review-cat">{q.category || "பொதுப் பிரிவு"}</span>
                      <span className={`review-status-badge ${isCorrect ? 'status-pass' : 'status-fail'}`}>{isCorrect ? "சரியானது" : userAnswer ? "தவறானது" : "எழுதாதது"}</span>
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
                            {opt} {opt === userAnswer && <span className="user-choice-tag">(உங்கள் தேர்வு)</span>}
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