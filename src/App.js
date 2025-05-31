import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import FinishedProjects from './pages/FinishedProjects';
import AllProjects from './pages/AllProjects';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import Admin from './pages/Admin';
import TemplateManager from './pages/TemplateManager';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/Navbar';
import AutoLogout from './components/AutoLogout';
import './App.css';

function App() {
  // const location = useLocation();
  // const hideNavbar = location.pathname === '/login' || location.pathname === '/register';
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RequireAuth><Home /><AutoLogout /></RequireAuth>} />
        <Route path="/project/:id" element={<RequireAuth><ProjectDetail /><AutoLogout /></RequireAuth>} />
        <Route path="/finished" element={<RequireAuth><FinishedProjects /><AutoLogout /></RequireAuth>} />
        <Route path="/all" element={<RequireAuth><AllProjects /><AutoLogout /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /><AutoLogout /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateProject /><AutoLogout /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Admin /><AutoLogout /></RequireAuth>} />
        <Route path="/template" element={<RequireAuth><TemplateManager /><AutoLogout /></RequireAuth>} />
      </Routes>
      <footer style={{
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        letterSpacing: 1,
        position: 'fixed',
        left: 0,
        bottom: 0,
        background: 'white',
        zIndex: 999,
        padding: '10px 0',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.03)'
      }}>
        V1.4 @Junchuan Zhang 2025
      </footer>
    </>
  );
}

export default App;
