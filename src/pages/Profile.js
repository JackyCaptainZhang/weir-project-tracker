import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  // 自动补全email
  useEffect(() => {
    if (user.username && !user.email) {
      axios.get(`/api/user/search?username=${user.username}`)
        .then(res => {
          const newUser = { ...user, email: res.data.email };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div>
      <Navbar />
      <div style={{ margin: '60px 80px' }}>
        <h2>Profile</h2>
        <div style={{ margin: '30px 0', fontSize: 18 }}>
          <div><b>User Name:</b> {user.username || '-'}</div>
          <div><b>Email:</b> {user.email || '-'}</div>
          <div><b>Department:</b> {user.department || '-'}</div>
          {user.isAdmin && <div style={{ color: 'green', fontWeight: 600 }}>Admin</div>}
        </div>
        {user.isAdmin && (
          <button
            style={{ margin: '20px 0', padding: '10px 24px', fontSize: 18, background: '#c8b89a', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            onClick={() => navigate('/admin')}
          >
            进入管理后台
          </button>
        )}
        <h3>Action Logs made by you</h3>
        <ul>
          <li>2024-05-01 Created checklist item "xxx"</li>
          <li>2024-05-02 Completed checklist item "yyy"</li>
        </ul>
        <h3>Manage</h3>
        <ul>
          <li>Manage your department checklist items</li>
          {user.isAdmin && <li>Manage Admin List (Only user in admin list has this option)</li>}
        </ul>
      </div>
    </div>
  );
};

export default Profile; 