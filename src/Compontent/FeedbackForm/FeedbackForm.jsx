import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState([
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

  const [formData, setFormData] = useState({
    name: '',
    review: '',
    stars: 0,
    image: null,
    imageUrl: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: file, imageUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.review || !formData.stars || !formData.imageUrl) return;

    const newFeedback = {
      name: formData.name,
      image: formData.imageUrl,
      review: formData.review,
      stars: parseInt(formData.stars)
    };

    setFeedbacks(prev => [...prev, newFeedback]);

    // Reset form
    setFormData({ name: '', review: '', stars: 0, image: null, imageUrl: '' });
  };

  return (
    <section className="feedback-section">
      <h2 className="feedback-title">Share Your Feedback</h2>

      {/* Feedback Form */}
      <form className="feedback-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />

        <textarea
          name="review"
          placeholder="Your Feedback"
          value={formData.review}
          onChange={handleInputChange}
          required
        />

        <select name="stars" value={formData.stars} onChange={handleInputChange} required>
          <option value="">Rating</option>
          <option value="1">1 ★</option>
          <option value="2">2 ★★</option>
          <option value="3">3 ★★★</option>
          <option value="4">4 ★★★★</option>
          <option value="5">5 ★★★★★</option>
        </select>

        <input type="file" accept="image/*" onChange={handleImageUpload} required />

        {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="preview-img" />}

        <button type="submit">Submit</button>
      </form>

      {/* Feedback Display */}
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
