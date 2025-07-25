import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Compontent/Header/Header';
import ComplaintForm from './Pages/ComplaintForm/ComplaintForm';
import Home from './Pages/Home/Home';
// import Complaints from './pages/Complaints';
// import Status from './pages/Status';
// import About from './pages/About';
// import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/complaints" element={<Complaints />} />
        <Route path="/status" element={<Status />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        <Route path="/complaint/:category" element={<ComplaintForm />} />
      </Routes>
    </Router>
  );
}

export default App;
