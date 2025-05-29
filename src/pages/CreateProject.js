import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from '../api/axiosInstance';

// 通用确认弹窗组件
function ConfirmModal({ visible, title, content, onOk, onCancel }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 16, marginBottom: 18, whiteSpace: 'pre-line' }}>{content}</div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onOk} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#6c63ff', color: '#fff', fontSize: 16, fontWeight: 600, marginRight: 12 }}>确认</button>
          <button onClick={onCancel} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }}>取消</button>
        </div>
      </div>
    </div>
  );
}

const CreateProject = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [defaultTemplates, setDefaultTemplates] = useState([]); // [{department, templateId}]
  const [templateNames, setTemplateNames] = useState({}); // {department: templateName}
  const [fetchingTpl, setFetchingTpl] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canCreate = user.department === 'Sales' || user.isAdmin;

  // 获取所有默认模板及模板名
  const fetchDefaultTemplates = async () => {
    setFetchingTpl(true);
    try {
      const res = await axios.get('/api/default-template', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDefaultTemplates(res.data || []);
      // 拉取所有模板
      const tplIds = (res.data || []).map(dt => dt.templateId).filter(Boolean);
      if (tplIds.length > 0) {
        const tplRes = await axios.get('/api/template', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAllTemplates(tplRes.data);
        // 拉取所有模板名
        const tplNameMap = {};
        tplIds.forEach(id => {
          const tpl = tplRes.data.find(t => t._id === id);
          if (tpl) tplNameMap[tpl.department] = tpl.name;
        });
        setTemplateNames(tplNameMap);
      } else {
        setAllTemplates([]);
        setTemplateNames({});
      }
    } catch {
      setDefaultTemplates([]);
      setAllTemplates([]);
      setTemplateNames({});
    }
    setFetchingTpl(false);
  };

  useEffect(() => {
    fetchDefaultTemplates();
    axios.get('/api/department/list')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name) {
      setError('Project name is required');
      return;
    }
    setShowConfirm(true);
  };

  // 真正创建
  const doCreate = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await axios.post('/api/project/add', { name });
      if (res.data.project && res.data.checklists) {
        setSuccess('Project created successfully!');
        setName('');
      } else {
        throw new Error('Project created but checklists not initialized');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  // 生成弹窗内容
  const confirmContent = `你即将创建项目【${name}】\n检查单会按照默认模板初始化：\n` +
    departments.map(dep => {
      // 兼容dt.department为对象或字符串
      const defaultTpl = defaultTemplates.find(dt => {
        const dtDeptId = dt.department?._id ? String(dt.department._id) : String(dt.departmentId || dt.department);
        return dtDeptId === String(dep._id);
      });
      let tplName = '无默认模板';
      if (defaultTpl) {
        const tplObj = allTemplates.find(tpl => String(tpl._id) === String(defaultTpl.templateId?._id || defaultTpl.templateId));
        tplName = tplObj ? tplObj.name : '有默认模板';
      } else {
      }
      return `${dep.name} - ${tplName}`;
    }).join('\n');

  return (
    <div>
      <Navbar />
      <div style={{ margin: '60px 80px' }}>
        <h2>Create New Project</h2>
        {canCreate ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 400 }}>
            <label style={{ fontSize: 18, marginBottom: 8 }}>Project Name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              style={{ height: 36, fontSize: 18, marginBottom: 16 }}
              placeholder="Enter project name"
            />
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
            <button type="submit" style={{ height: 40, background: '#c8b89a', fontSize: 20 }} disabled={loading || fetchingTpl}>{loading ? 'Creating...' : 'Create'}</button>
          </form>
        ) : (
          <div style={{ color: 'red', fontSize: 18, marginTop: 30 }}>Only Sales or Admin can create projects.</div>
        )}
        <ConfirmModal
          visible={showConfirm}
          title="确认创建项目"
          content={confirmContent}
          onOk={doCreate}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </div>
  );
};

export default CreateProject; 