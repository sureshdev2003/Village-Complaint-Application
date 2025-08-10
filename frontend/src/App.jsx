import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Compontent/Header/Header';
import ComplaintForm from './Pages/ComplaintForm/ComplaintForm';
import Home from './Pages/Home/Home';
import Login from './Compontent/Login/Login';
import Register from './Compontent/Register/Register';
import Status from './Pages/Status/status';
 import MyComplaints from './Pages/MyComplaints/MyComplaints';
import AdminApp from './Admin/AdminApp';

const AppLayout = () => {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register', '/admin/login'];
  const shouldHideHeader = hideHeaderRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {!shouldHideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/complaint/:category" element={<ComplaintForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/status" element={<Status />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
