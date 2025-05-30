import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosInstance from '../api/axiosInstance';

const tabs = [
  { key: 'users', label: 'User Management' },
  { key: 'departments', label: 'Department Management' },
  { key: 'admins', label: 'Admin Management' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [editDept, setEditDept] = useState({});
  const [adminInput, setAdminInput] = useState('');
  const [message, setMessage] = useState('');

  // 获取所有用户
  const fetchUsers = () => {
    axios.get('/api/user/list').then(res => setUsers(res.data)).catch(() => setUsers([]));
  };
  // 获取所有部门
  const fetchDepartments = () => {
    axios.get('/api/department/list').then(res => setDepartments(res.data)).catch(() => setDepartments([]));
  };
  // 获取所有管理员
  const fetchAdmins = () => {
    axios.get('/api/admin/list').then(res => setAdmins(res.data)).catch(() => setAdmins([]));
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'departments') fetchDepartments();
    if (activeTab === 'admins') { fetchAdmins(); fetchUsers(); }
    setMessage('');
    setAdminInput('');
  }, [activeTab]);

  // 前端模糊搜索用户（非管理员）
  const adminUsernames = new Set(admins.map(a => a.username));
  const filteredAddableUsers = adminInput
    ? users.filter(u => u.username.toLowerCase().includes(adminInput.toLowerCase()) && !adminUsernames.has(u.username))
    : [];

  // 添加管理员
  const handleAddAdmin = (username) => {
    if (!username) return;
    axios.post('/api/admin/add', { username })
      .then(() => { setMessage('Added admin!'); fetchAdmins(); setAdminInput(''); })
      .catch(err => setMessage(err.response?.data?.message || 'Failed'));
  };
  // 移除管理员
  const handleRemoveAdmin = (username) => {
    axios.post('/api/admin/remove', { username })
      .then(() => { setMessage('Removed admin!'); fetchAdmins(); })
      .catch(err => setMessage(err.response?.data?.message || 'Failed'));
  };
  // 新增部门
  const handleAddDept = async () => {
    if (!newDept) return;
    try {
      // 1. 新增部门（不带order）
      await axios.post('/api/department/add', { name: newDept });
      setMessage('Added department!');
      setNewDept('');
      // 2. 获取最新部门列表
      const res = await axios.get('/api/department/list');
      const allDepts = res.data;
      // 3. 找到最大order
      const maxOrder = allDepts.length === 0
        ? 0
        : Math.max(...allDepts.map(dep => typeof dep.order === 'number' ? dep.order : 0));
      // 4. 找到新加的部门（假设name唯一）
      const newDeptObj = allDepts.find(dep => dep.name === newDept);
      if (!newDeptObj) return;
      // 5. 组装order数组
      const updated = allDepts.map(dep => ({
        _id: dep._id,
        order: dep._id === newDeptObj._id ? maxOrder + 1 : dep.order
      }));
      // 6. 调用update-order接口
      await axiosInstance.put('/api/department/update-order', { departments: updated });
      // 7. 刷新
      fetchDepartments();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };
  // 编辑部门
  const handleEditDept = (id) => {
    if (!editDept[id]) return;
    axios.put(`/api/department/edit/${id}`, { name: editDept[id] })
      .then(() => {
        setMessage('Edited department!');
        fetchDepartments();
        const newEditDept = { ...editDept };
        delete newEditDept[id];
        setEditDept(newEditDept);
      })
      .catch(err => setMessage(err.response?.data?.message || 'Failed'));
  };
  // 删除部门
  const handleDeleteDept = (id) => {
    axios.delete(`/api/department/delete/${id}`)
      .then(() => { setMessage('Deleted department!'); fetchDepartments(); })
      .catch(err => setMessage(err.response?.data?.message || 'Failed'));
  };

  // 用户管理tab的模糊搜索
  const [searchUser, setSearchUser] = useState('');
  const filteredUsers = searchUser
    ? users.filter(u => u.username.toLowerCase().includes(searchUser.toLowerCase()))
    : users;

  // 拖拽排序处理（fetch+token+新API风格）
  const [originalDepartments, setOriginalDepartments] = useState([]);
  useEffect(() => {
    setOriginalDepartments(departments);
  }, [departments]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newDepartments = Array.from(departments);
    const [reorderedItem] = newDepartments.splice(result.source.index, 1);
    newDepartments.splice(result.destination.index, 0, reorderedItem);
    // 组装order数据
    const updatedDepartments = newDepartments.map((dept, index) => ({
      _id: dept._id,
      order: index
    }));
    setDepartments(newDepartments);
    try {
      console.log('请求体:', { departments: updatedDepartments });
      const response = await axiosInstance.put('/api/department/update-order', { departments: updatedDepartments });
      console.log('响应:', response.data);
      setDepartments(response.data.departments || newDepartments);
    } catch (error) {
      console.error('更新顺序失败:', error, error?.response?.data);
      setDepartments(originalDepartments);
      alert('更新顺序失败，请重试');
    }
  };

  return (
    <div>
      <div style={{ margin: '60px 80px' }}>
        <h2>Admin Panel</h2>
        <div style={{ display: 'flex', gap: 30, marginBottom: 30 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ fontSize: 18, padding: '8px 24px', background: activeTab === tab.key ? '#c8b89a' : '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {message && <div style={{ color: 'green', marginBottom: 10 }}>{message}</div>}
        {activeTab === 'users' && (
          <div>
            <h3>User Management</h3>
            <div style={{ marginBottom: 10 }}>
              <input placeholder="Search by username" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
            </div>
            <table border="1" cellPadding="8" style={{ minWidth: 500, background: '#fff' }}>
              <thead><tr><th>Username</th><th>Email</th><th>Department</th></tr></thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={3} style={{ color: 'red', textAlign: 'center' }}>User not found</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.department}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'departments' && (
          <div>
            <h3>Department Management</h3>
            <div style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input 
                placeholder="New department name" 
                value={newDept} 
                onChange={e => setNewDept(e.target.value)} 
                style={{ height: 36, fontSize: 16, borderRadius: 6, border: '1.5px solid #b48a00', padding: '0 12px', outline: 'none' }}
              />
              <button 
                onClick={handleAddDept} 
                style={{ height: 36, background: '#b48a00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, padding: '0 22px', cursor: 'pointer' }}
              >Add</button>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="departments-droppable" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                  >
                    {departments.map((dep, idx) => (
                      <Draggable key={dep._id} draggableId={dep._id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.7 : 1,
                              background: '#fffbe6',
                              border: '1.5px solid #b48a00',
                              borderRadius: 12,
                              boxShadow: '0 2px 12px rgba(180,138,0,0.07)',
                              padding: '22px 32px',
                              minWidth: 320,
                              maxWidth: 360,
                              marginBottom: 10,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 12,
                              cursor: 'grab',
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#b48a00', marginBottom: 8 }}>Department</div>
                            <input 
                              value={editDept[dep._id] !== undefined ? editDept[dep._id] : dep.name} 
                              onChange={e => setEditDept({ ...editDept, [dep._id]: e.target.value })} 
                              style={{ fontSize: 17, borderRadius: 6, border: '1.5px solid #bbb', padding: '6px 12px', width: '100%', marginBottom: 8 }}
                            />
                            <div style={{ display: 'flex', gap: 16 }}>
                              <button 
                                onClick={() => handleEditDept(dep._id)} 
                                style={{ background: '#b48a00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, padding: '6px 22px', cursor: 'pointer' }}
                              >Edit</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
        {activeTab === 'admins' && (
          <div>
            <h3>Admin Management</h3>
            <div style={{ marginBottom: 10 }}>
              <input
                placeholder="Username to add as admin"
                value={adminInput}
                onChange={e => setAdminInput(e.target.value)}
                autoComplete="off"
              />
              <button onClick={() => handleAddAdmin(adminInput)}>Add Admin</button>
              {/* 实时模糊搜索可添加的用户 */}
              {filteredAddableUsers.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #ccc', marginTop: 4, maxHeight: 120, overflowY: 'auto', width: 250 }}>
                  {filteredAddableUsers.map(u => (
                    <div
                      key={u._id}
                      style={{ padding: '4px 10px', cursor: 'pointer' }}
                      onClick={() => handleAddAdmin(u.username)}
                    >
                      {u.username} <span style={{ color: '#888', fontSize: 12 }}>({u.department})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <table border="1" cellPadding="8" style={{ minWidth: 400, background: '#fff' }}>
              <thead><tr><th>Username</th><th>Actions</th></tr></thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td colSpan={2} style={{ color: 'gray', textAlign: 'center' }}>No admin</td></tr>
                ) : (
                  admins.map(a => (
                    <tr key={a.username}>
                      <td>{a.username}</td>
                      <td>
                        {a.username === 'jzhang78-admin'
                          ? <span style={{ color: '#888' }}>Protected</span>
                          : <button onClick={() => handleRemoveAdmin(a.username)}>Remove Admin</button>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 