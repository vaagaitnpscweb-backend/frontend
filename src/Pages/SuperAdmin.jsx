import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SuperAdmin() {
  const [pendingData, setPendingData] = useState({ quizzes: [], news: [], pdfs: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔌 அப்ரூவலுக்கு காத்திருக்கும் ஃபைல்களை சர்வரில் இருந்து பெற
  const fetchPendingItems = (userEmail) => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/pending-items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-email': userEmail
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("API பிழை அல்லது அனுமதி இல்லை!");
        return res.json();
      })
      .then(data => { 
        if (data.success) {
          setPendingData({
            quizzes: data.quizzes || [],
            news: data.news || [],
            pdfs: data.pdfs || []
          });
        }
      })
      .catch(err => {
        console.error("தரவைப் பெற முடியவில்லை:", err);
      })
      .finally(() => setLoading(false));
  };

  // 🔐 செக்யூரிட்டி செக் மற்றும் டேட்டா ஃபெட்ச்
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin' || user.email === 'abcdanand970@gmail.com') { 
        const timer = setTimeout(() => fetchPendingItems(user.email), 0);
        return () => clearTimeout(timer);
      } else {
        alert("⚠️ உங்களுக்கு இந்தப் பக்கத்தை அணுக அனுமதி இல்லை!");
        navigate('/');
      }
    } else {
      alert("🔐 தயவுசெய்து முதலில் லாகின் செய்யவும்!");
      navigate('/');
    }
  }, [navigate]);

  // 👍 வொர்க்கர் ஃபைல்களை லைவ் செய்ய அப்ரூவல் செய்யும் ஃபங்ஷன்
  const handleApprove = (type, id) => {
    const confirmApprove = window.confirm("இந்த ஃபைலை வெப்சைட்டில் லைவ் செய்யலாமா தலைவா?");
    if (!confirmApprove) return;

    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;

    fetch('http://localhost:5000/api/admin/approve-item', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-email': user ? user.email : ''
      },
      body: JSON.stringify({ type, id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("🎯 சபாஷ் தலைவா! இந்த ஃபைல் வெற்றிகரமாக வெப்சைட்டில் லைவ் செய்யப்பட்டது!");
        if (user) fetchPendingItems(user.email);
      } else {
        alert("❌ அப்ரூவ் செய்வதில் தோல்வி: " + (data.message || "ஏதோ தவறு நடந்துள்ளது!"));
      }
    })
    .catch(err => {
      console.error("Approve Error:", err);
      alert("சர்வருடன் இணைக்க முடியவில்லை!");
    });
  };

  // ❌ வொர்க்கர் ஃபைலில் தப்பு இருந்தால் நிராகரிக்கும் (Reject) புதிய ஃபங்ஷன் 🌟
  const handleReject = (type, id) => {
    const reason = window.prompt("⚠️ இந்த ஃபைலை நிராகரிக்கக் காரணம் என்ன தலைவா? (வொர்க்கருக்குத் தெரியப்படுத்த):");
    if (reason === null) return; // கேன்சல் செய்தால் அப்படியே நின்றுவிடும்
    if (reason.trim() === "") {
      alert("தயவுசெய்து நிராகரிப்பதற்கான காரணத்தை டைப் செய்யவும் தலைவா!");
      return;
    }

    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;

    fetch('http://localhost:5000/api/admin/reject-item', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-email': user ? user.email : ''
      },
      body: JSON.stringify({ type, id, reason: reason })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("📉 ஃபைல் வெற்றிகரமாக நிராகரிக்கப்பட்டது! வொர்க்கர் டேஷ்போர்டில் அப்டேட் ஆகிவிடும்.");
        if (user) fetchPendingItems(user.email);
      } else {
        alert("❌ ரிஜெக்ட் செய்வதில் பிழை!");
      }
    })
    .catch(err => console.error("Reject Error:", err));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '20px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
        ⏳ பாதுகாப்பான சரிபார்ப்பு மற்றும் தரவுகள் ஏற்றப்படுகின்றன...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#7f1d1d', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
        <h1>👑 வாகை டியூஷன் – Super Admin மாஸ்டர் அப்ரூவல் போர்டு</h1>
        <p>வொர்க்கர்ஸ் (WFH) பதிவேற்றிய ஃபைல்களைச் சரிபார்த்து லைவ் செய்யக்கூடிய முதன்மைப் பக்கம்.</p>
      </div>

      {/* 🧠 1. குவிஸ் அப்ரூவல் செக்ஷன் */}
      <div style={{ marginBottom: '40px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ color: '#1e3a8a', borderBottom: '2px solid #2563eb', paddingBottom: '8px' }}>
          📝 Free Quiz வினாக்கள் அப்ரூவலுக்கு உள்ளவை ({pendingData.quizzes.length})
        </h3>
        {pendingData.quizzes.length === 0 ? <p>காலி 👍</p> : pendingData.quizzes.map(q => (
          <div key={q.id} style={{ padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><b>Q.No {q.id} [{q.category}]:</b> {q.question}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleApprove('quiz', q.id)} style={{ background: '#166534', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Approve OK</button>
              <button onClick={() => handleReject('quiz', q.id)} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* 📰 2. நடப்பு நிகழ்வுகள் அப்ரூவல் செக்ஷன் */}
      <div style={{ marginBottom: '40px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ color: '#166534', borderBottom: '2px solid #166534', paddingBottom: '8px' }}>
          📰 Current Affairs செய்திகள் அப்ரூவலுக்கு உள்ளவை ({pendingData.news.length})
        </h3>
        {pendingData.news.length === 0 ? <p>காலி 👍</p> : pendingData.news.map(n => (
          <div key={n.id} style={{ padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><b>[{n.date} - {n.category}]:</b> {n.title}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleApprove('news', n.id)} style={{ background: '#166534', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Approve OK</button>
              <button onClick={() => handleReject('news', n.id)} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* 📚 3. பெய்டு மெட்டீரியல்ஸ் அப்ரூவல் செக்ஷன் (View PDF & Reject வசதியுடன் 🌟) */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ color: '#854d0e', borderBottom: '2px solid #ca8a04', paddingBottom: '8px' }}>
          📚 ₹5 Exam PDFs (TNPSC, RRB, SI, PC) அப்ரூவலுக்கு உள்ளவை ({pendingData.pdfs.length})
        </h3>
        {pendingData.pdfs.length === 0 ? <p>காலி 👍</p> : pendingData.pdfs.map(p => (
          <div key={p.id} style={{ padding: '15px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{p.examType}</span>
              <h4 style={{ margin: '5px 0 0 0', color: '#1e293b' }}>{p.title}</h4>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* 👁️ வினாத்தாளைப் படித்துப் பார்க்க புதிய பட்டன் */}
              <a href={p.questionPdfLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#0284c7', color: 'white', padding: '8px 14px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>👁️ View Qn PDF</a>
              
              {/* 🔑 விடைக்குறிப்பைப் படித்துப் பார்க்க புதிய பட்டன் */}
              <a href={p.answerPdfLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#4f46e5', color: 'white', padding: '8px 14px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>👁️ View Ans PDF</a>
              
              {/* 👍 அப்ரூவ் பட்டன் */}
              <button onClick={() => handleApprove('pdf', p.id)} style={{ background: '#166534', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>✅ Approve OK</button>
              
              {/* ❌ ரிஜெக்ட் பட்டன் */}
              <button onClick={() => handleReject('pdf', p.id)} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>❌ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuperAdmin;