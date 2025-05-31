import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!account || !password) {
      setError('Please enter username/email and password');
      return;
    }
    // 判断是邮箱还是用户名
    const payload = account.includes('@')
      ? { email: account, password }
      : { username: account, password };
    try {
      const res = await axios.post('/api/auth/login', payload);
      localStorage.setItem('token', res.data.token);
      // 登录后只查一次isAdmin
      let isAdmin = false;
      try {
        const adminRes = await axios.get('/api/admin/is-admin', {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        isAdmin = adminRes.data.isAdmin || adminRes.data.$isAdmin;
      } catch {}
      // 新增：兼容多种department结构，确保有departmentId
      const dept = res.data.department;
      const departmentId = res.data.departmentId || (typeof dept === 'object' ? dept._id : dept);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id || res.data.id,
        username: res.data.username,
        department: dept,
        departmentId,
        email: res.data.email,
        isAdmin
      }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h1>Welcome To Weir Project Tracking System</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 400 }}>
        <label>Username / Email</label>
        <input value={account} onChange={e => setAccount(e.target.value)} style={{ marginBottom: 20, height: 32 }} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: 20, height: 32 }} />
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" style={{ height: 40, background: '#c8b89a', fontSize: 24 }}>Login</button>
      </form>
      <div style={{ marginTop: 20 }}>
        <Link to="/register" style={{ textDecoration: 'none', color: '#666' }}>Register User</Link>
      </div>
    </div>
  );
};

export default Login; 