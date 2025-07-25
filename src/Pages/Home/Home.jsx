import React, { useState,useEffect,useRef } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import FeedbackSection from '../../Compontent/FeedbackForm/FeedbackForm';

const categories = [
  {
    title: "Road & Infrastructure",
    image: "https://cdn-icons-png.flaticon.com/512/252/252035.png",
    description: "Report potholes, broken roads, or damaged public structures."
  },
  {
    title: "Water Supply Issues",
    image: "https://cdn-icons-png.flaticon.com/512/5786/5786379.png",
    description: "Complaints about water leakage, muddy water, or no supply."
  },
  {
    title: "Electricity Problems",
    image: "https://cdn-icons-png.flaticon.com/512/1603/1603856.png",
    description: "Report frequent power cuts, short circuits or broken poles."
  },
  {
    title: "Sanitation & Drainage",
    image: "https://cdn-icons-png.flaticon.com/512/1040/1040230.png",
    description: "Overflowing drains, garbage dumps, or blocked sewer lines."
  },
  {
    title: "Health & Hygiene",
    image: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
    description: "Report medical negligence, mosquito breeding or epidemics."
  },
  {
    title: "Public Safety",
    image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
    description: "Unsafe areas, street crimes, lack of police presence."
  },
  {
    title: "Education Facilities",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135775.png",
    description: "Report missing teachers, school conditions or lack of materials."
  },
  {
    title: "Welfare Scheme Issues",
    image: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    description: "Trouble accessing pensions, ration cards, or housing schemes."
  },
  {
    title: "Pollution & Environment",
    image: "https://cdn-icons-png.flaticon.com/512/2913/2913604.png",
    description: "Illegal waste dumping, tree cutting, or air/water pollution."
  },
  {
    title: "Corruption or Misuse",
    image: "https://cdn-icons-png.flaticon.com/512/753/753318.png",
    description: "Report bribes, fund misuses, or unresponsive officers."
  },
  {
    title: "Others",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    description: "Any issues not listed under the defined categories."
  }
];

const Home = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleCategories = showAll ? categories : categories.slice(0, 6);
const feedbackRef = useRef(null);

useEffect(() => {
  const handleScroll = () => {
    const section = feedbackRef.current;
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (sectionTop < screenHeight - 100) {
      section.classList.add("visible");
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <div className="container">
      {/* Slider */}
      <div className="slider-container">
        <div className="slider">
          <div className="slide bg1"></div>
          <div className="slide bg2"></div>
          <div className="slide bg3"></div>
        </div>
        <div className="content">
          <h1>Welcome to Our Website</h1>
          <p>Empowering Villages Through Technology</p>
        </div>
      </div>

      {/* Categories */}
      <div className="category">
        <h2>Report Issues</h2>
      <div className="category-grid">
        {visibleCategories.map((cat, index) => (
          <Link to={`/complaint/${cat.title.toLowerCase().replace(/ /g, "-")}`} key={index} className="category-link">
            <div className="category-box">
              <img src={cat.image} alt={cat.title} className="category-img" />
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <button className="toggle-button" onClick={() => setShowAll(!showAll)}>
        {showAll ? "Show Less" : "Show All"}
      </button>
      </div>
      {/* Feedback Section */}
<FeedbackSection />


    </div>

  );
};

export default Home;
