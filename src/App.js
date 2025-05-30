import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/project/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
        <Route path="/finished" element={<RequireAuth><FinishedProjects /></RequireAuth>} />
        <Route path="/all" element={<RequireAuth><AllProjects /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateProject /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/template" element={<RequireAuth><TemplateManager /></RequireAuth>} />
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
        V1.0 @Junchuan Zhang 2025
      </footer>
    </>
  );
}

export default App;
