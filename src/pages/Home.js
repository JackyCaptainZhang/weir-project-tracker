import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import axios from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const active = projects.filter(p => p.status !== 'finished');

  return (
    <div>
      <Navbar />
      <div style={{ marginLeft: 250, marginTop: 60 }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {active.map((p) => {
          const createdDate = p.createdAt ? new Date(p.createdAt) : null;
          const days = createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000*60*60*24)) : '--';
          return (
            <ProjectCard
              key={p._id}
              name={p.name}
              status={p.status}
              days={days}
              createdAt={createdDate ? createdDate.toLocaleDateString() : '--'}
              progress={p.progress}
              onClick={() => navigate(`/project/${p._id}`)}
              createdBy={p.createdBy}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Home; 