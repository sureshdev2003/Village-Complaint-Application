import { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can send formData to backend here using FormData or fetch
    console.log('Submitted Data:', formData);
    alert('Complaint Submitted Successfully!');
    setFormData({
      name: '',
      phone: '',
      location: '',
      complaint: '',
      photos: [],
    });
  };

  return (
    <div className="complaint-form-container">
      <h2>Complaint Form for: {category.replace(/-/g, " ")}</h2>
      <form className="complaint-form" onSubmit={handleSubmit}>
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
    </div>
  );
};

export default ComplaintForm;
