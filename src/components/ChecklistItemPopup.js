import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

// mode: 'complete' | 'detail'
const ChecklistItemPopup = ({ mode = 'detail', onClose, title, itemId, itemDepartment, userDepartment, refreshChecklists, isAdmin, userId, isOwnDept }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [completeComment, setCompleteComment] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    if (mode !== 'detail' || !itemId) return;
    setLoading(true);
    setError('');
    axios.get(`/api/checklist/item/${itemId}`)
      .then(res => { setItem(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load item'); setLoading(false); });
  }, [mode, itemId]);

  // 彻底移除本地isOwnDept/canOperate判断，直接用props.isOwnDept

  if (mode === 'complete') {
    return (
      <div style={{ background: '#fff8a6', border: '1px solid #ccc', borderRadius: 8, padding: 30, minWidth: 350 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>{title}</div>}
        <div style={{ fontSize: 20, marginBottom: 20 }}>You are about to tick this item,<br />confirm complete?<br />Please write comment messages.</div>
        <textarea
          placeholder="Type in message here"
          style={{ width: '100%', height: 60, marginBottom: 20 }}
          value={completeComment}
          onChange={e => setCompleteComment(e.target.value)}
          disabled={completeLoading}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 16 }}>Cancel</button>
          <button
            style={{ background: '#00e000', color: '#fff', padding: '8px 18px', fontSize: 16, fontWeight: 600, cursor: completeComment.trim() && !completeLoading ? 'pointer' : 'not-allowed', opacity: completeComment.trim() ? 1 : 0.7 }}
            disabled={!completeComment.trim() || completeLoading}
            onClick={async () => {
              if (!completeComment.trim()) return;
              setCompleteLoading(true);
              try {
                await axios.post(`/api/checklist/item/complete/${itemId}`, { comment: completeComment.trim() });
                if (typeof refreshChecklists === 'function') await refreshChecklists();
                onClose && onClose();
              } catch (err) {
                alert('完成失败: ' + (err.response?.data?.message || err.message));
              } finally {
                setCompleteLoading(false);
              }
            }}
          >Confirm Tick</button>
        </div>
      </div>
    );
  }
  // 详情模式
  if (loading) return <div style={{ background: '#fff8a6', padding: 30 }}>Loading...</div>;
  if (error) return <div style={{ background: '#fff8a6', padding: 30, color: 'red' }}>{error}</div>;
  if (!item) return null;
  return (
    <div style={{ background: '#fff8a6', border: '1px solid #ccc', borderRadius: 8, padding: 20, minWidth: 320, maxWidth: 400, position: 'relative' }}>
      {/* 右上角添加评论按钮，仅本部门或管理员可见 */}
      {(isAdmin || isOwnDept) && !showCommentInput && item?.status !== 'complete' && (
        <>
          <button
            style={{ position: 'absolute', top: 16, right: 18, background: '#00b800', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setShowCommentInput(true)}
          >添加评论</button>
          <button
            style={{ position: 'absolute', top: 16, right: 120, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 15, fontWeight: 600, cursor: assignLoading ? 'not-allowed' : 'pointer', marginRight: 8, opacity: assignLoading ? 0.7 : 1 }}
            disabled={assignLoading}
            onClick={() => setShowAssignConfirm(true)}
          >分配该任务给自己</button>
        </>
      )}
      {/* 评论输入框 */}
      {showCommentInput && (
        <div style={{ position: 'absolute', top: 16, right: 18, background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 10, zIndex: 10, minWidth: 220 }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="请输入评论内容"
            style={{ width: '100%', minHeight: 48, fontSize: 15, marginBottom: 8, borderRadius: 4, border: '1px solid #ccc', padding: 6 }}
            disabled={commentLoading}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowCommentInput(false); setCommentText(''); }} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#ccc', color: '#333', fontSize: 15 }}>取消</button>
            <button
              style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#00b800', color: '#fff', fontSize: 15, fontWeight: 600, cursor: commentText.trim() && !commentLoading ? 'pointer' : 'not-allowed', opacity: commentText.trim() ? 1 : 0.7 }}
              disabled={!commentText.trim() || commentLoading}
              onClick={async () => {
                if (!commentText.trim()) return;
                setCommentLoading(true);
                try {
                  await axios.post(`/api/checklist/item/comment/${itemId}`, {
                    content: commentText.trim()
                  });
                  setShowCommentInput(false);
                  setCommentText('');
                  if (typeof refreshChecklists === 'function') await refreshChecklists();
                  // 重新加载item详情
                  setLoading(true);
                  axios.get(`/api/checklist/item/${itemId}`)
                    .then(res => { setItem(res.data); setLoading(false); })
                    .catch(() => { setError('Failed to load item'); setLoading(false); });
                } catch (err) {
                  alert('评论失败: ' + (err.response?.data?.message || err.message));
                } finally {
                  setCommentLoading(false);
                }
              }}
            >提交</button>
          </div>
        </div>
      )}
      {/* 分配确认弹窗 */}
      {showAssignConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={e => { if (e.target === e.currentTarget) setShowAssignConfirm(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18 }}>确认分配</div>
            <div style={{ fontSize: 16, marginBottom: 18 }}>是否要将该任务分配给自己？</div>
            {assignError && <div style={{ color: 'red', marginBottom: 10 }}>{assignError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button onClick={() => setShowAssignConfirm(false)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }} disabled={assignLoading}>取消</button>
              <button
                disabled={assignLoading}
                style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: assignLoading ? '#aaa' : '#1976d2', color: '#fff', fontSize: 16, fontWeight: 600, cursor: assignLoading ? 'not-allowed' : 'pointer' }}
                onClick={async () => {
                  setAssignLoading(true);
                  setAssignError('');
                  try {
                    await axios.put('/api/checklist/item/reassign', {
                      itemId: itemId,
                      userId: userId
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
                    });
                    setShowAssignConfirm(false);
                    if (typeof refreshChecklists === 'function') await refreshChecklists();
                    onClose && onClose();
                  } catch (err) {
                    setAssignError('分配失败: ' + (err.response?.data?.message || err.message));
                  } finally {
                    setAssignLoading(false);
                  }
                }}
              >确认</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{title || 'Item detail'}</div>
      <div style={{ fontSize: 15, marginBottom: 5 }}>
        Created by {item.createdByName || item.createdBy?.username || 'Unknown'} on {item.createdAt ? new Date(item.createdAt).toLocaleString() : '----'}
      </div>
      {item.status === 'complete' && (
        <>
          <div style={{ fontSize: 15, marginBottom: 5 }}>
            Completed by {item.completedByName || item.completedBy?.username || 'Unknown'} on {item.completedAt ? new Date(item.completedAt).toLocaleString() : '----'}
          </div>
          {item.completeComment && <div style={{ fontSize: 15, marginBottom: 10 }}>Comment: {item.completeComment}</div>}
        </>
      )}
      <div style={{ background: '#fff', border: '1px solid #eee', minHeight: 40, padding: 8, borderRadius: 4, marginBottom: 8 }}>
        <b>Messages:</b>
        {item.comments && item.comments.length > 0 ? (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {item.comments.map((c, i) => (
              <li key={c._id || i} style={{ fontSize: 14, marginBottom: 2 }}>{c.content} <span style={{ color: '#888', fontSize: 12 }}>by {c.userName || 'Unknown'} on {c.createdAt ? new Date(c.createdAt).toLocaleString() : '----'}</span></li>
            ))}
          </ul>
        ) : <div style={{ color: '#aaa', fontSize: 14 }}>No messages</div>}
      </div>
    </div>
  );
};

export default ChecklistItemPopup; 