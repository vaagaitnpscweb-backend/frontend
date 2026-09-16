import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App';
import '../Styles/CurrentAffairs.css';

function CurrentAffairs() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    // அட்மின் பேனலில் இருந்து 7 மணிக்கு ஷோ ஆகும் மாணவர்களுக்கான எண்ட்ஸ்பாயிண்ட்
    fetch(`${API_BASE_URL}/api/current-affairs/student-view`)
      .then(res => res.json())
      .then(data => {
        // Data format array ஆகவோ அல்லது success object ஆகவோ வரலாம்
        const items = Array.isArray(data) ? data : (data.news || data.currentAffairs || []);
        setNewsList(items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Current Affairs API Error:", err);
        setLoading(false);
      });
  }, []);

  // டேட்டாவில் உள்ள அனைத்து கேட்டகிரிகளையும் (Tamil Nadu, India, World, Sports, Political, Custom) டைனமிக் ஆக எடுக்க
  const dynamicCategories = ['All', ...new Set(newsList.map(item => item.category).filter(Boolean))];

  // கேட்டகிரி மற்றும் தேதி அடிப்படையில் ஃபில்டர் செய்தல்
  const filteredNews = newsList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    // publishAt அல்லது date ஃபார்மட்டைச் சரிபார்த்தல்
    const itemDateStr = item.date || (item.publishAt ? item.publishAt.split('T')[0] : '');
    const matchesDate = !searchDate || itemDateStr === searchDate;

    return matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#0f766e', fontWeight: 'bold' }}>
        🔄 Loading daily current affairs...
      </div>
    );
  }

  return (
    <div className="ca-page-container">
      <div className="ca-header">
        <h1>📰 Daily Current Affairs</h1>
        <p>Important current affairs for TNPSC, RRB, SI, and PC exams in simple Tamil & English.</p>
        <div className="ca-notice-badge">
          ⏰ Note: Daily current affairs updates will be published live every day at 07:00 PM.
        </div>
      </div>

      <div className="ca-filter-bar">
        <div className="date-picker-box">
          <label>📆 Select Date:</label>
          <input 
            type="date" 
            value={searchDate} 
            onChange={(e) => setSearchDate(e.target.value)}
            className="ca-date-input"
          />
          {searchDate && <button className="clear-date-btn" onClick={() => setSearchDate('')}>✕ Clear</button>}
        </div>

        {/* Dynamic Categories Scroll Bar */}
        <div className="ca-categories-scroll">
          {dynamicCategories.map((cat, idx) => (
            <button
              key={idx}
              className={`ca-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? '📌 All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-content-grid">
        {filteredNews.length > 0 ? (
          filteredNews.map((news) => {
            const displayDate = news.date || (news.publishAt ? new Date(news.publishAt).toLocaleDateString() : '');
            return (
              <div key={news.id || news._id} className="ca-news-card">
                <div className="card-top-info">
                  <span className="news-cat-badge">{news.category}</span>
                  <span className="news-date">📅 {displayDate}</span>
                </div>

                {/* Tamil Title & Description */}
                <h2 className="news-title">{news.titleTa || news.title}</h2>
                <p className="news-desc" style={{ whiteSpace: 'pre-line' }}>{news.descTa || news.description}</p>

                {/* English Title & Description Block */}
                {(news.titleEn || news.descEn) && (
                  <div className="news-english-box">
                    <h4 className="news-title-en">{news.titleEn}</h4>
                    <p className="news-desc-en" style={{ whiteSpace: 'pre-line' }}>{news.descEn}</p>
                  </div>
                )}

                {/* Tags */}
                <div className="news-tags">
                  {news.tags && news.tags.map((tag, i) => (
                    <span key={i} className="tag-item">#{tag}</span>
                  ))}
                </div>

                {/* PDF Download Link */}
                {news.pdfUrl && (
                  <div style={{ marginTop: '12px' }}>
                    <a 
                      href={news.pdfUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="ca-pdf-download-btn"
                    >
                      📥 Download PDF Notes
                    </a>
                  </div>
                )}

                {/* 🎯 Verify Skill Button */}
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button 
                    onClick={() => navigate(`/free-quiz?date=${displayDate}&topic=Current Affairs`)}
                    className="ca-verify-btn"
                  >
                    🎯 Verify Skill ({displayDate})
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-news-found">
            ⚠️ Sorry! No current affairs available for the selected date or category. Check back at 7 PM!
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentAffairs;
