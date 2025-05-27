import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import axios from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

const AllProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/project/list')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load projects');
        setLoading(false);
      });
  }, []);

  // 模糊搜索
  const filtered = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Navbar />
      <div style={{ marginLeft: 250, marginTop: 60 }}>
        <input
          placeholder="Search by project name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: 300, height: 32, marginBottom: 30, fontSize: 18 }}
        />
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {filtered.map((p) => {
          const createdDate = p.createdAt ? new Date(p.createdAt) : null;
          const finishedDate = p.finishedAt ? new Date(p.finishedAt) : null;
          const isFinished = p.status === 'finished';
          const days = isFinished
            ? (createdDate && finishedDate ? Math.max(0, Math.ceil((finishedDate - createdDate) / (1000*60*60*24))) : '--')
            : (createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000*60*60*24)) : '--');
          return (
            <ProjectCard
              key={p._id}
              name={p.name}
              status={p.status}
              days={days}
              createdAt={isFinished && finishedDate ? finishedDate.toLocaleDateString() : (createdDate ? createdDate.toLocaleDateString() : '--')}
              progress={p.progress}
              isFinished={isFinished}
              onClick={() => navigate(`/project/${p._id}`)}
              createdBy={p.createdBy}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AllProjects; 