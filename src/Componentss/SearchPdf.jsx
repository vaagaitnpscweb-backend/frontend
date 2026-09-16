import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function SearchPdfs() {
  const [allPdfs, setAllPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasedPdfIds, setPurchasedPdfIds] = useState([]);
  const navigate = useNavigate();

  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 1. அனைத்து PDF மெட்டீரியல்களையும் டேட்டாபேஸில் இருந்து எடுத்தல்
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/all-pdfs`, { headers: { 'user-email': 'abcdanand970@gmail.com' } })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pdfs) {
          setAllPdfs(data.pdfs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching all PDFs:", err);
        setLoading(false);
      });

    if (user && user.email) {
      fetch(`${API_BASE}/api/user/purchased-pdfs?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const formattedIds = (data.purchasedIds || []).map(id => Number(id));
            setPurchasedPdfIds(formattedIds);
          }
        })
        .catch(err => console.error("Error fetching purchases:", err));
    }
  }, []);

  // 2. PDF திறக்கும் அல்லது அக்சஸ் சரிபார்க்கும் முறை
  const handleOpenPdf = async (pdf, type = 'question') => {
    const driveUrl = type === 'question' ? pdf.questionPdfLink : pdf.answerPdfLink;
    const title = type === 'question' ? pdf.title : `${pdf.title} - Answer Key`;

    if (!driveUrl) {
      alert("❌ PDF link not available!");
      return;
    }

    if (pdf.isFree) {
      openDrivePreview(driveUrl);
      return;
    }

    if (!user) {
      alert("🔐 Please log in first to access this material!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/check-access?email=${user.email}&pdfId=${pdf.id || pdf._id}`);
      const data = await res.json();

      if (data.success && data.hasAccess) {
        openDrivePreview(driveUrl);
      } else {
        const confirmBuy = window.confirm(`இந்த PDF-ன் விலை ₹${pdf.price || 5}. வாகை பிரீமியம் திட்டம் அல்லது தனிப்பட்ட கட்டணம் செலுத்திப் பெற விரும்புகிறீர்களா?`);
        if (confirmBuy) {
          navigate('/premium');
        }
      }
    } catch (err) {
      console.error("Access check error:", err);
      alert("அக்சஸ் சரிபார்ப்பில் பிழை ஏற்பட்டது.");
    }
  };

  const openDrivePreview = (driveUrl) => {
    let finalUrl = driveUrl.trim();
    if (finalUrl.includes('drive.google.com')) {
      const match = finalUrl.match(/\/d\/(.+?)\/(view|preview)?/) || finalUrl.match(/id=(.+?)(&|$)/);
      if (match && match[1]) {
        finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    window.open(finalUrl, '_blank');
  };

  // தேடும் வார்த்தைக்கு ஏற்ப வடிகட்டுதல் (Filtering)
  const filteredPdfs = allPdfs.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.examType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#0d9488', fontWeight: 'bold' }}>🔄 Loading PDF Database...</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ color: '#0f766e', marginBottom: '8px' }}>🔍 Search PDF Materials</h1>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>தேவையான தலைப்பு அல்லது வகுப்பு/தேர்வின் பெயரிட்டு உடனே PDF-களைத் தேடுங்கள்.</p>

      {/* 🔍 Search Input Box */}
      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text"
          placeholder="உதாரணத்திற்கு: 10th Tamil, TNPSC Group 4, Maths..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 18px',
            fontSize: '16px',
            border: '2px solid #cbd5e1',
            borderRadius: '8px',
            outline: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {filteredPdfs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          {searchQuery ? `"${searchQuery}" தொடர்பான PDF மெட்டீரியல்கள் எதுவும் கிடைக்கவில்லை.` : 'தேடத் தொடங்குங்கள்...'}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', width: '60px' }}>S.No</th>
                <th style={{ padding: '12px 16px' }}>Material Title</th>
                <th style={{ padding: '12px 16px', width: '110px' }}>Category</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPdfs.map((p, idx) => {
                const isFree = p.isFree === true || p.isFree === 'true' || Number(p.price) === 0;

                return (
                  <tr key={p.id || p._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>{p.title}</td>
                    <td style={{ padding: '12px 16px', color: '#0f766e', fontWeight: 'bold' }}>{p.examType}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: isFree ? '#dcfce7' : '#fef9c3', 
                        color: isFree ? '#15803d' : '#854d0e', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {isFree ? '🎉 FREE' : `₹ ${p.price || 5}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleOpenPdf(p, 'question')} 
                          style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                        >
                          📄 Qn PDF
                        </button>
                        {p.answerPdfLink && (
                          <button 
                            onClick={() => handleOpenPdf(p, 'answer')} 
                            style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                          >
                            🔑 Ans PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SearchPdfs;