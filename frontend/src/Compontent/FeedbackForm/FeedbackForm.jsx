import React, { useState } from 'react';
import { feedbackAPI } from '../../services/api';
import './FeedbackForm.css';

const FeedbackSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await feedbackAPI.submit(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 5
      });
    } catch (error) {
      setError(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="feedback-section">
      <h2 className="feedback-title">Share Your Feedback</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Thank you for your feedback! We appreciate your input.
        </div>
      )}

      <div className="feedback-container">
        <div className="feedback-form-container">
          <h3>Submit Your Feedback</h3>
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Subject (Optional)"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Rating:</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        <div className="feedback-info">
          <h3>Why Your Feedback Matters</h3>
          <ul>
            <li>Help us improve our services</li>
            <li>Share your experience with others</li>
            <li>Contribute to better governance</li>
            <li>Make a difference in your community</li>
          </ul>
          
          <div className="feedback-stats">
            <div className="stat-item">
              <h4>4.5</h4>
              <p>Average Rating</p>
            </div>
            <div className="stat-item">
              <h4>1000+</h4>
              <p>Happy Users</p>
            </div>
            <div className="stat-item">
              <h4>95%</h4>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
