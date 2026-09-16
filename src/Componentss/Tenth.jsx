import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🚀 Render Live Backend Base URL
const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function Tenth() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // 📄 Pagination States (20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/all-pdfs`, { headers: { 'user-email': 'abcdanand970@gmail.com' } })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pdfs) {
          // Filter 10th standard PDFs
          const filtered = data.pdfs.filter(p => p.examType === '10th' || p.title?.toLowerCase().includes('10th'));
          setPdfs(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleOpenPdf = async (pdf, type = 'question') => {
    const driveUrl = type === 'question' ? pdf.questionPdfLink : pdf.answerPdfLink;
    const title = type === 'question' ? pdf.title : `${pdf.title} - Answer Key`;

    if (!driveUrl) {
      alert("❌ PDF file is not available!");
      return;
    }

    // 1. PDF முற்றிலும் இலவசம் எனில் நேரடியாகத் திறக்கலாம்
    if (pdf.isFree) {
      openDrivePreview(driveUrl);
      return;
    }

    if (!user || !user.email) {
      alert("🔐 Please log in first to access this material!");
      return;
    }

    try {
      // 2. சப்ஸ்கிரிப்ஷன் வைத்துள்ளாரா அல்லது ஏற்கனவே பணம் செலுத்தியுள்ளாரா என சரிபார்க்கவும்
      const res = await fetch(`${API_BASE}/api/user/check-access?email=${user.email}&pdfId=${pdf.id || pdf._id}`);
      const data = await res.json();

      if (data.success && data.hasAccess) {
        // 🟢 சப்ஸ்கிரிப்ஷன் அல்லது பேமெண்ட் செய்துள்ளார் -> டவுன்லோட் அனுமதிக்கப்படும்
        openDrivePreview(driveUrl);
      } else {
        // 🔴 கட்டணம் செலுத்த வேண்டும்
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

  const paginatedPdfs = pdfs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(pdfs.length / itemsPerPage);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#0d9488', fontWeight: 'bold' }}>🔄 Loading 10th Materials...</div>;
  }

  return (
    <div className="materials-container" style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ color: '#0f766e', marginBottom: '8px' }}>📚 10th Standard Question Papers</h1>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>Free and Paid model question papers for 10th standard students. (சப்ஸ்கிரிப்ஷன் வைத்துள்ள மாணவர்களுக்கு அனைத்து PDF-களும் முற்றிலும் இலவசம்!)</p>

      {pdfs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>No 10th materials uploaded yet. Check back soon!</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', width: '60px' }}>S.No</th>
                <th style={{ padding: '12px 16px' }}>Question Name / Title</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Type / Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '200px' }}>Download / View</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPdfs.map((p, idx) => {
                const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={p.id || p._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#64748b' }}>{serialNo}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>{p.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: p.isFree ? '#dcfce7' : '#fef9c3', 
                        color: p.isFree ? '#15803d' : '#854d0e', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {p.isFree ? '🎉 FREE' : `💳 ₹ ${p.price || 5}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '25px', flexWrap: 'wrap' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{ padding: '8px 14px', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            &laquo; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              style={{
                padding: '8px 14px',
                background: currentPage === num ? '#0f766e' : '#fff',
                color: currentPage === num ? '#fff' : '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {num}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{ padding: '8px 14px', background: currentPage === totalPages ? '#f1f5f9' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default Tenth;
