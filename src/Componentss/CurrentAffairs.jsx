import { useState, useEffect } from 'react';
import '../Styles/CurrentAffairs.css';

function CurrentAffairs() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchDate, setSearchDate] = useState('');

  // 🌐 வெப்சைட் லோடு ஆகும்போது பேக்எண்டில் இருந்து செய்திகளை எடுத்தல்
  useEffect(() => {
    fetch('http://localhost:5000/api/ca/all')
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setNewsList(data.news);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Current Affairs API Error:", err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'தமிழ்நாடு', 'தேசிய நிகழ்வுகள்', 'சர்வதேச நிகழ்வுகள்', 'விளையாட்டு', 'விருதுகள்'];

  const filteredNews = newsList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDate = !searchDate || item.date === searchDate;
    return matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#0d9488', fontWeight: 'bold' }}>
        🔄 தினசரி நடப்பு நிகழ்வுகள் லோடு ஆகிறது...
      </div>
    );
  }

  return (
    <div className="ca-page-container">
      <div className="ca-header">
        <h1>📰 தினசரி நடப்பு நிகழ்வுகள்</h1>
        <p>TNPSC, RRB, SI, PC தேர்வுகளுக்கான முக்கிய நடப்பு நிகழ்வுகள் உடனுக்குடன் எளிய தமிழில்.</p>
      </div>

      <div className="ca-filter-bar">
        <div className="date-picker-box">
          <label>📆 தேதியைத் தேர்ந்தெடு:</label>
          <input 
            type="date" 
            value={searchDate} 
            onChange={(e) => setSearchDate(e.target.value)}
            className="ca-date-input"
          />
          {searchDate && <button className="clear-date-btn" onClick={() => setSearchDate('')}>✕ Clear</button>}
        </div>

        <div className="ca-categories-scroll">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`ca-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? '📌 அனைத்தும்' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-content-grid">
        {filteredNews.length > 0 ? (
          filteredNews.map((news) => (
            <div key={news.id} className="ca-news-card">
              <div className="card-top-info">
                <span className="news-cat-badge">{news.category}</span>
                <span className="news-date">📅 {news.date}</span>
              </div>
              <h2 className="news-title">{news.title}</h2>
              <p className="news-desc">{news.description}</p>
              <div className="news-tags">
                {news.tags && news.tags.map((tag, i) => (
                  <span key={i} className="tag-item">#{tag}</span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-news-found">
            ⚠️ வருந்துகிறோம்! நீங்கள் தேடிய தேதியிலோ அல்லது பிரிவிலோ தற்போதைக்கு செய்திகள் எதுவும் இல்லை.
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentAffairs;