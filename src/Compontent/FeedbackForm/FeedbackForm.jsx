import React, { useState } from 'react';
import './FeedbackForm.css'; // Include styling in this CSS file

const FeedbackSection = () => {
  const [feedbacks] = useState([
    {
      name: "Sunil",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      review: "Great support and quick action taken!",
      stars: 4
    },
    {
      name: "Sri Kannan",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      review: "Clean design and good responsiveness.",
      stars: 5
    }
  ]);

  return (
    <section className="feedback-section">
      <h2 className="feedback-title">What People Say</h2>
      <div className="feedback-cards">
        {feedbacks.map((item, index) => (
          <div className="feedback-card" key={index}>
            <div className="quote">❝</div>
            <p className="review">{item.review}</p>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: i < item.stars ? "#FF5733" : "#ccc" }}>★</span>
              ))}
            </div>
            <div className="user">
              <img src={item.image} alt={item.name} />
              <h4>{item.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeedbackSection;
