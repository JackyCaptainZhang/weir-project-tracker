import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import axios from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

const FinishedProjects = () => {
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

  const finished = projects.filter(p => p.status === 'finished');

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginLeft: 250, marginTop: 60 }}>
        {finished.map((p) => {
          const createdDate = p.createdAt ? new Date(p.createdAt) : null;
          const finishedDate = p.finishedAt ? new Date(p.finishedAt) : null;
          const days = (createdDate && finishedDate) ? Math.max(0, Math.ceil((finishedDate - createdDate) / (1000*60*60*24))) : '--';
          return (
            <ProjectCard
              key={p._id}
              name={p.name}
              status={p.status}
              days={days}
              createdAt={finishedDate ? finishedDate.toLocaleDateString() : '--'}
              progress={p.progress}
              isFinished={true}
              onClick={() => navigate(`/project/${p._id}`)}
              createdBy={p.createdBy}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FinishedProjects; 