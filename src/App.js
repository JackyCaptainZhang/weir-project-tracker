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
import './App.css';

function App() {
  return (
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
  );
}

export default App;
