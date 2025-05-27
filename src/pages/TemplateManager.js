import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';

// 通用输入弹窗组件
function InputModal({ visible, title, placeholder, onOk, onCancel }) {
  const [value, setValue] = useState('');
  useEffect(() => { if (visible) setValue(''); }, [visible]);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{title}</div>
        <input
          style={{ width: '100%', fontSize: 17, padding: 8, borderRadius: 6, border: '1.5px solid #bbb', marginBottom: 18 }}
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => onOk(value)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#6c63ff', color: '#fff', fontSize: 16, fontWeight: 600, marginRight: 12 }}>OK</button>
          <button onClick={onCancel} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// 通用确认弹窗组件
function ConfirmModal({ visible, title, content, onOk, onCancel }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 16, marginBottom: 18 }}>{content}</div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onOk} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#d32f2f', color: '#fff', fontSize: 16, fontWeight: 600, marginRight: 12 }}>确认</button>
          <button onClick={onCancel} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }}>取消</button>
        </div>
      </div>
    </div>
  );
}

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultTemplates, setDefaultTemplates] = useState([]); // [{department, templateId}]
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [hoveredTemplate, setHoveredTemplate] = useState(null); // 当前悬停的模板对象
  const [departments, setDepartments] = useState([]); // 所有部门
  const [confirmDelete, setConfirmDelete] = useState({ show: false, tpl: null });

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/template', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(res.data);
    } catch (err) {
      alert('Failed to fetch templates');
    }
    setLoading(false);
  };

  // Fetch all default templates
  const fetchDefaultTemplates = async () => {
    try {
      const res = await axios.get('/api/default-template', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDefaultTemplates(res.data || []);
    } catch (err) {
      setDefaultTemplates([]);
    }
  };

  // 获取所有部门（仅用于管理员创建模板时下拉）
  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/department/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDepartments(res.data.map(dep => dep.name));
    } catch (err) {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchDefaultTemplates();
    if (user.isAdmin) fetchDepartments();
  }, []);

  // Edit template
  const handleEdit = (tpl) => {
    setEditing({ ...tpl });
    setIsNew(false);
  };

  // New template
  const handleNew = () => {
    setEditing({ name: '', department: user.department, content: [] });
    setIsNew(true);
  };

  // Save template (unified)
  const handleSave = async () => {
    // 校验所有模板项不能为空
    if (!editing.name.trim()) {
      alert('Template name cannot be empty!');
      return;
    }
    if (editing.content.some(item => !item || !item.trim())) {
      alert('All template items must be filled!');
      return;
    }
    try {
      if (isNew) {
        await axios.post('/api/template', editing, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.put(`/api/template/${editing._id}`, {
          name: editing.name,
          content: editing.content
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setEditing(null);
      fetchTemplates();
      fetchDefaultTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  // Cancel editing
  const handleCancel = () => setEditing(null);

  // Template item operations (all local)
  const handleItemChange = (idx, value) => {
    const newContent = [...editing.content];
    newContent[idx] = value;
    setEditing({ ...editing, content: newContent });
  };
  const handleAddItem = () => setEditing({ ...editing, content: [...editing.content, ''] });
  const handleRemoveItem = (idx) => {
    const newContent = [...editing.content];
    newContent.splice(idx, 1);
    setEditing({ ...editing, content: newContent });
  };

  // 删除模板
  const handleDeleteTemplate = (tpl) => {
    setConfirmDelete({ show: true, tpl });
  };
  const doDeleteTemplate = async () => {
    const tpl = confirmDelete.tpl;
    setConfirmDelete({ show: false, tpl: null });
    if (!tpl) return;
    try {
      await axios.delete(`/api/template/${tpl._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTemplates();
      fetchDefaultTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // 设为默认模板
  const handleSetDefault = async (tpl) => {
    try {
      await axios.post('/api/default-template', {
        department: tpl.department,
        templateId: tpl._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDefaultTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Set default failed');
    }
  };

  // 判断某模板是否为其部门的默认模板
  const isDefaultTemplate = (tpl) => {
    const found = defaultTemplates.find(dt => dt.department === tpl.department);
    return found && found.templateId === tpl._id;
  };

  // 按部门分组模板
  const groupedTemplates = templates.reduce((acc, tpl) => {
    if (!acc[tpl.department]) acc[tpl.department] = [];
    acc[tpl.department].push(tpl);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <h2>Template Management</h2>
        {loading ? <div>Loading...</div> : (
          <>
            <button onClick={handleNew}>Create New Template</button>
            <div style={{ marginTop: 24 }}>
              {Object.entries(groupedTemplates).sort().map(([dept, tpls]) => (
                <div key={dept} style={{ marginBottom: 32 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, margin: '16px 0 8px', color: '#b48a00' }}>{dept}</div>
                  <ul style={{ marginLeft: 24 }}>
                    {tpls.map(tpl => {
                      const isDefault = isDefaultTemplate(tpl);
                      return (
                        <li key={tpl._id} style={{ marginBottom: 8, position: 'relative' }}>
                          <b
                            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                            onMouseEnter={() => setHoveredTemplate(tpl)}
                            onMouseLeave={() => setHoveredTemplate(null)}
                          >{tpl.name}</b>
                          {/* Tooltip for template details */}
                          {hoveredTemplate && hoveredTemplate._id === tpl._id && (
                            <div
                              style={{
                                position: 'absolute', right: '110%', top: '50%', transform: 'translateY(-50%)', zIndex: 2000,
                                background: '#fff', border: '1px solid #ccc', borderRadius: 6,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: 12, minWidth: 260
                              }}
                            >
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>{tpl.name} Details</div>
                              <ol style={{ margin: 0, paddingLeft: 18 }}>
                                {tpl.content && tpl.content.length > 0 ? tpl.content.map((item, idx) => (
                                  <li key={idx} style={{ fontSize: 15, marginBottom: 2 }}>{item}</li>
                                )) : <li style={{ color: '#888' }}>No items</li>}
                              </ol>
                            </div>
                          )}
                          <button onClick={() => handleEdit(tpl)} style={{ marginLeft: 8 }}>Edit</button>
                          {isDefault ? (
                            <span style={{ marginLeft: 16, color: '#b48a00', fontWeight: 700 }}>Default</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDeleteTemplate(tpl)}
                                style={{ marginLeft: 8, color: 'red' }}
                              >Delete</button>
                              <button
                                onClick={() => handleSetDefault(tpl)}
                                style={{ marginLeft: 8 }}
                              >Set as Default</button>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal for editing/creating template */}
        {editing && (
          <>
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.25)', zIndex: 1000
            }} onClick={handleCancel} />
            <div style={{
              position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              background: '#fff', borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: 32, minWidth: 400, zIndex: 1001
            }}>
              <h3 style={{ marginTop: 0 }}>{isNew ? 'Create Template' : 'Edit Template'}</h3>
              <div style={{ marginBottom: 12 }}>
                Name: <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                {user.isAdmin ? (
                  <>
                    Department: <select value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })}>
                      {departments.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    Department: <span style={{ fontWeight: 600 }}>{user.department}</span>
                  </>
                )}
              </div>
              <div>
                <b>Template Items:</b>
                {editing.content.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <input
                      value={item}
                      onChange={e => handleItemChange(idx, e.target.value)}
                      style={{ width: 300 }}
                    />
                    <button onClick={() => handleRemoveItem(idx)} style={{ marginLeft: 4 }}>Delete</button>
                  </div>
                ))}
                <button onClick={handleAddItem} style={{ marginTop: 8 }}>Add Item</button>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          visible={confirmDelete.show}
          title="确认删除模板"
          content={confirmDelete.tpl ? `确定要删除模板 "${confirmDelete.tpl.name}" 吗？` : ''}
          onOk={doDeleteTemplate}
          onCancel={() => setConfirmDelete({ show: false, tpl: null })}
        />
      </div>
    </>
  );
};

export default TemplateManager; 