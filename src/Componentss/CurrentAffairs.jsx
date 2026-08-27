import React, { useState, useEffect } from 'react';
import '../Styles/CurrentAffairs.css';

const API_BASE = 'https://vaagai-tuition-backend.onrender.com';

function CurrentAffairs() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/ca/all`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setNewsList(data.news || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Current Affairs API Error:", err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'TamilNadu', 'National', 'International', 'Sports', 'Awards'];

  const filteredNews = newsList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDate = !searchDate || item.date === searchDate;
    return matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#0d9488', fontWeight: 'bold' }}>
        🔄 Loading daily current affairs...
      </div>
    );
  }

  return (
    <div className="ca-page-container">
      <div className="ca-header">
        <h1>📰 Daily Current Affairs</h1>
        <p>Important current affairs for TNPSC, RRB, SI, and PC exams in simple Tamil.</p>
        <div style={{ marginTop: '10px', background: '#fef3c7', color: '#92400e', padding: '8px 15px', borderRadius: '6px', display: 'inline-block', fontSize: '13.5px', fontWeight: 'bold' }}>
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

        <div className="ca-categories-scroll">
          {categories.map((cat, idx) => (
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
          filteredNews.map((news) => (
            <div key={news.id || news._id} className="ca-news-card">
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
            ⚠️ Sorry! No current affairs available for the selected date or category.
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentAffairs;
