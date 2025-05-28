import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    department: '',
    password: '',
    repeatPassword: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('/api/department/list')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.username || !form.email || !form.department || !form.password || !form.repeatPassword) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        department: form.department
      });
      setSuccess('Register success! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 200, marginTop: 100 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
        <label>User Name</label>
        <input name="username" value={form.username} onChange={handleChange} style={{ marginBottom: 10, height: 28 }} />
        <label>Email Address</label>
        <input name="email" value={form.email} onChange={handleChange} style={{ marginBottom: 10, height: 28 }} />
        <label>Department</label>
        <select name="department" value={form.department} onChange={handleChange} style={{ marginBottom: 10, height: 32 }}>
          <option value="">Select department</option>
          {departments.map(dep => (
            <option key={dep._id} value={dep._id}>{dep.name}</option>
          ))}
        </select>
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} style={{ marginBottom: 10, height: 28 }} />
        <label>Repeat Password</label>
        <input type="password" name="repeatPassword" value={form.repeatPassword} onChange={handleChange} style={{ marginBottom: 20, height: 28 }} />
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
        <button type="submit" style={{ height: 40, background: '#c8b89a', fontSize: 24 }}>Register</button>
      </form>
    </div>
  );
};

export default Register; 