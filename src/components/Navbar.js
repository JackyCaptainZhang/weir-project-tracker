import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosInstance';

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

  // 新增全局信息
  const [today, setToday] = useState('');
  const [unfinishedProjectCount, setUnfinishedProjectCount] = useState(0);
  const [unfinishedChecklistCount, setUnfinishedChecklistCount] = useState(0);
  const [unfinishedProjects, setUnfinishedProjects] = useState([]);
  const [deptChecklistStats, setDeptChecklistStats] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // 获取用户部门ObjectId
  const userDepartmentId = user.departmentId || (user.department && user.department._id) || user.department;

  useEffect(() => {
    // 设置今天日期
    const now = new Date();
    setToday(now.toISOString().slice(0, 10));
    // 获取未完成项目列表
    axios.get('/api/project/unfinished-list').then(res => {
      const projects = res.data || [];
      setUnfinishedProjects(projects);
      setUnfinishedProjectCount(projects.length);
    }).catch(() => {
      setUnfinishedProjects([]);
      setUnfinishedProjectCount(0);
    });
    // 获取本部门未完成checklist统计（新接口）
    if (userDepartmentId && typeof userDepartmentId === 'string' && userDepartmentId.length === 24) {
      axios.get(`/api/checklist/unfinished-dept-checklists?departmentId=${userDepartmentId}`).then(res => {
        const data = res.data || [];
        setDeptChecklistStats(data);
        setUnfinishedChecklistCount(data.length);
      }).catch((err) => {
        setDeptChecklistStats([]);
        setUnfinishedChecklistCount(0);
      });
    } else {
      setDeptChecklistStats([]);
      setUnfinishedChecklistCount(0);
    }
  }, [userDepartmentId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  // TODO: 后续根据用户权限动态渲染菜单
  return (
    <>
      {/* 弹框样式 */}
      <style>{`
        .modal-mask {
          position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.18); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: #fff; border-radius: 10px; padding: 32px 36px; min-width: 320px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        .modal-content h3 { margin-top: 0; }
        .modal-content ul { padding-left: 18px; }
        .modal-content button { margin-top: 18px; padding: 6px 18px; border-radius: 6px; border: none; background: #b48a00; color: #fff; font-size: 16px; cursor: pointer; }
      `}</style>
      {/* 弹框内容 */}
      {showProjectModal && (
        <div className="modal-mask" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>未完成项目列表</h3>
            <ul>
              {unfinishedProjects.length === 0 ? <li>暂无未完成项目</li> :
                unfinishedProjects.map(p => (
                  <li key={p.projectId || p._id}>{p.name}（进度：{p.progress || 0}%）</li>
                ))}
            </ul>
            <button onClick={() => setShowProjectModal(false)}>关闭</button>
          </div>
        </div>
      )}
      {showChecklistModal && (
        <div className="modal-mask" onClick={() => setShowChecklistModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>本部门未完成checklist项目</h3>
            <ul>
              {deptChecklistStats.length === 0 ? <li>暂无未完成checklist项目</li> :
                deptChecklistStats.map(item => (
                  <li key={item.checklistId}>{item.projectName}（未完成项: {item.unfinishedItemCount}，进度: {item.progress || 0}%）</li>
                ))}
            </ul>
            <button onClick={() => setShowChecklistModal(false)}>关闭</button>
          </div>
        </div>
      )}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 0 0', width: '100%' }}>
        {/* 上方logo+标题整体 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
          <img src="/weir-project-tracker/WeirLogo.png" alt="Weir Logo" style={{ height: '28px', marginBottom: '5px' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00325c', letterSpacing: 1 }}>Project Tracking System</span>
        </div>
        {/* 下方菜单和用户信息 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1600, padding: '0 40px' }}>
          {/* 居中菜单单独一行 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
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
          </div>
          {/* 用户信息区固定在右上角 */}
          {user && user.username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'fixed', right: 40, top: 24, zIndex: 1000 }}>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>Log out</button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div
                    style={{ width: 50, height: 50, borderRadius: '50%', background: '#c8b89a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#222', textAlign: 'center' }}
                    title={user.username || 'User'}
                  >
                    {displayName}
                  </div>
                </Link>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {user.department?.name || (typeof user.department === 'string' ? user.department : '') || user.departmentId || 'No Dept'}
                </div>
              </div>
            </div>
          )}
          {/* 统计信息框固定在左上角 */}
          {user && user.username && (
            <div style={{ border: '2px solid red', borderRadius: 8, padding: '6px 18px', minWidth: 220, textAlign: 'right', background: '#fffbe6', color: '#333', fontSize: 15, position: 'fixed', left: 24, top: 24, zIndex: 1000, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div>Today: <b>{today}</b></div>
              <div onClick={() => setShowProjectModal(true)} style={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Total UNFINISHED Projects: <b style={{ color: '#d32f2f' }}>{unfinishedProjectCount}</b></div>
              <div onClick={() => setShowChecklistModal(true)} style={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                Your Dept
                <span style={{ fontSize: 13, marginLeft: 4, marginRight: 4, fontWeight: 'bold', color: '#222' }}>
                  ({user.department?.name || (typeof user.department === 'string' ? user.department : '') || user.departmentId || 'No Dept'})
                </span>
                BLOCKED Project: <b style={{ color: '#b48a00' }}>{unfinishedChecklistCount}</b>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar; 