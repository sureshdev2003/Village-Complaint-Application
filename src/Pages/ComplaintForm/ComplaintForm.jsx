import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./ComplaintForm.css";

const ComplaintForm = () => {
  const { category } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    complaint: '',
    photos: [],
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      photos: files,
    }));
  };

  const handleSubmit = () => {
    // Simulate sending to backend
    console.log('Submitted Data:', formData);
    alert('Complaint Submitted Successfully!');
    setSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      location: '',
      complaint: '',
      photos: [],
    });
  };

  // Auto-submit once 3 images are uploaded
  useEffect(() => {
    if (formData.photos.length === 3) {
      handleSubmit();
    }
  }, [formData.photos]);

  return (
   <div className="complaint-form-container">
  <h2>Complaint Form for: {category.replace(/-/g, " ")}</h2>

  {!submitted ? (
    <div className="form-layout">
      <form className="complaint-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          pattern="[0-9]{10}"
          maxLength="10"
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

        <textarea
          name="complaint"
          placeholder="Describe your complaint..."
          rows="5"
          value={formData.complaint}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
        />
        <p className="photo-hint">You can upload up to 3 photos (JPEG, PNG).</p>

        <button type="submit">Submit Complaint</button>
      </form>

      {/* Preview section beside the form */}
      <div className="photo-preview-vertical">
        {formData.photos.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`preview-${idx}`}
            className="preview-img-vertical"
          />
        ))}
      </div>
    </div>
  ) : (
    <p className="submitted-msg">Thank you! Your complaint has been submitted.</p>
  )}
</div>

  );
};

export default ComplaintForm;
