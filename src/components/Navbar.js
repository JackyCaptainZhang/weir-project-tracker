import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canCreateProject = user.department === 'Sales' || user.isAdmin;
  const displayName = user.username
    ? (user.username.length > 6 ? user.username.slice(0, 2) + '...' : user.username)
    : 'User';
  const navs = [
    { to: '/', label: 'Active Projects', match: /^\/$/ },
    { to: '/finished', label: 'Finished Projects', match: /^\/finished/ },
    { to: '/all', label: 'All Projects', match: /^\/all/ },
    { to: '/template', label: 'Templates', match: /^\/template/ },
  ];
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  // TODO: 后续根据用户权限动态渲染菜单
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px' }}>
      <div style={{ display: 'flex', gap: 30 }}>
        {navs.map(nav => (
          <Link
            key={nav.to}
            to={nav.to}
            style={{
              textDecoration: 'none',
              color: location.pathname.match(nav.match) ? '#b48a00' : 'black',
              fontWeight: location.pathname.match(nav.match) ? 700 : 400,
              borderBottom: location.pathname.match(nav.match) ? '2px solid #b48a00' : 'none',
              paddingBottom: 2
            }}
          >
            {nav.label}
          </Link>
        ))}
        {canCreateProject && (
          <Link to="/create" style={{ textDecoration: 'none', color: location.pathname === '/create' ? '#b48a00' : 'black', fontWeight: location.pathname === '/create' ? 700 : 400, borderBottom: location.pathname === '/create' ? '2px solid #b48a00' : 'none', paddingBottom: 2 }}>
            Create new Projects
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>Log out</button>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div
            style={{ width: 50, height: 50, borderRadius: '50%', background: '#c8b89a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#222', textAlign: 'center' }}
            title={user.username || 'User'}
          >
            {displayName}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 