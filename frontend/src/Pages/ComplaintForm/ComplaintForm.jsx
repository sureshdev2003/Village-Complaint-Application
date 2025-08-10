import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI, uploadAPI, utils } from '../../services/api';
import "./ComplaintForm.css";

const ComplaintForm = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'medium',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    isAnonymous: false
  });

  const [photos, setPhotos] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  // Get user data if authenticated
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setFormData(prev => ({
        ...prev,
        contactName: userObj.name || '',
        contactPhone: userObj.phone || '',
        contactEmail: userObj.email || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can upload a maximum of 5 photos.');
      return;
    }
    setPhotos(files);
  };

  const uploadFiles = async () => {
    if (photos.length === 0) return [];

    try {
      const uploadPromises = photos.map(file => uploadAPI.uploadSingle(file));
      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults.map(result => result.data.url);
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('Failed to upload files. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload files first
      const uploadedUrls = await uploadFiles();

      // Prepare complaint data
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: category.replace(/-/g, ' '),
        location: formData.location,
        urgency: formData.urgency,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail || null,
        isAnonymous: formData.isAnonymous,
        images: uploadedUrls
      };

      // Submit complaint
      const response = await complaintAPI.submit(complaintData);
      
      setComplaintId(response.data.complaintId);
      setSubmitted(true);
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        location: '',
        urgency: 'medium',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        isAnonymous: false
      });
      setPhotos([]);
      setUploadedFiles([]);

    } catch (error) {
      setError(error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = () => {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="complaint-form-container">
      <h2>Complaint Form for: {getCategoryDisplayName()}</h2>

      {!submitted ? (
        <div className="form-layout">
          <form className="complaint-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <input
              type="text"
              name="title"
              placeholder="Complaint Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Describe your complaint in detail..."
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location of Issue"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>

            {!formData.isAnonymous && (
              <>
                <input
                  type="text"
                  name="contactName"
                  placeholder="Your Name"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="tel"
                  name="contactPhone"
                  placeholder="Phone Number"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />

                <input
                  type="email"
                  name="contactEmail"
                  placeholder="Email (Optional)"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </>
            )}

            <div className="anonymous-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                />
                Submit anonymously
              </label>
            </div>

            <div className="file-upload-section">
              <input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
              <p className="photo-hint">You can upload up to 5 photos (JPEG, PNG, GIF).</p>
            </div>

            {photos.length > 0 && (
              <div className="photo-preview">
                <h4>Selected Photos:</h4>
                <div className="preview-grid">
                  {photos.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      className="preview-img"
                    />
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      ) : (
        <div className="success-message">
          <h3>Thank you! Your complaint has been submitted successfully.</h3>
          <p><strong>Complaint ID:</strong> {complaintId}</p>
          <p>You can track your complaint status using this ID.</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/status')}>Track Status</button>
            <button onClick={() => {
              setSubmitted(false);
              setComplaintId('');
            }}>Submit Another Complaint</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
