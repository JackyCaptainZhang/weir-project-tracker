import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import ChecklistItemPopup from '../components/ChecklistItemPopup';
import departments from '../config/departments';

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

function DepartmentBlock({
  dep, idx, nodeSize, fontSize, arrowLength, ballSize, ballOffset, checklistWidth, checklist, onCheck, onComment, canOperate, hovered, setHovered, setPopup, popup, isCurrent, detailPopupRef, userDepartment, projectId, refreshChecklists, isOrange, showBall, onlyCircleAndArrow, onlyCard, setChecklists
}) {
  const [popupDirection, setPopupDirection] = useState('right');
  const itemRefs = useRef([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [defaultTemplateId, setDefaultTemplateId] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null); // 悬停模板对象
  const [showInputModal, setShowInputModal] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState({ show: false, tpl: null });
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (!hovered || hovered.depIdx !== idx) return;
    const ref = itemRefs.current[hovered.itemIdx];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      const popupWidth = 340; // 估算弹窗宽度
      if (window.innerWidth - rect.right < popupWidth + 24) {
        setPopupDirection('left');
      } else {
        setPopupDirection('right');
      }
    }
  }, [hovered, idx]);

  // 新的颜色逻辑
  let nodeColor = '#fff';
  let nodeTextColor = '#333';
  if (isOrange) {
    nodeColor = '#ffa500';
    nodeTextColor = '#fff';
  } else if ((checklist?.progress || 0) === 100) {
    nodeColor = '#00c800';
    nodeTextColor = '#fff';
  }

  // 加载本部门所有模板和默认模板id
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await axios.get('/api/template', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const list = res.data.filter(t => t.department === dep);
      setTemplates(list);
      // 获取默认模板id
      const defRes = await axios.get('/api/default-template/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDefaultTemplateId(defRes.data?.templateId || null);
    } catch {
      setTemplates([]);
      setDefaultTemplateId(null);
    }
    setLoadingTemplates(false);
  };

  if (onlyCircleAndArrow) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: nodeSize }}>
        <div style={{ width: nodeSize, height: nodeSize, borderRadius: '50%', background: nodeColor, border: '2.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: fontSize, color: nodeTextColor, zIndex: 2, overflow: 'hidden', textAlign: 'center', lineHeight: 1.1, padding: 6 }}>{dep}</div>
        {idx < departments.length - 1 && (
          <div style={{ position: 'relative', width: arrowLength, height: nodeSize, display: 'flex', alignItems: 'center' }}>
            <svg width={arrowLength} height={ballSize+8} style={{ display: 'block' }}>
              <line x1="0" y1={ballSize/2+4} x2={arrowLength-18} y2={ballSize/2+4} stroke="#00c800" strokeWidth="5" />
              <polygon points={`${arrowLength-18},${ballSize/2-2} ${arrowLength},${ballSize/2+4} ${arrowLength-18},${ballSize/2+10}`} fill="#00c800" />
            </svg>
            {showBall && (
              <div style={{ position: 'absolute', left: ballOffset, top: (nodeSize-ballSize)/2, zIndex: 3 }}>
                <div style={{ width: ballSize, height: ballSize, borderRadius: '50%', background: '#00c800', border: '2.5px solid #fff', boxShadow: '0 0 8px #00c800' }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  if (onlyCard) {
    return (
      <div style={{ background: '#fff8c6', padding: 20, minWidth: checklistWidth, maxWidth: checklistWidth, border: '1.5px solid #ccc', borderRadius: 12, position: 'relative', minHeight: 320 }}>
        <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
          <span style={{ color: '#444' }}>Progress: </span>
          <span style={{ color: '#00c800', fontSize: 22 }}>{checklist.progress || 0}%</span>
        </div>
        {/* 仅本部门显示添加item和删除item按钮（进度条下方） */}
        {dep === userDepartment && checklist.progress !== 100 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#00c800', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                setShowInputModal(true);
              }}
            >+ 添加检查项</button>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#ff4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                setShowDeleteModal(true);
                setSelectedToDelete([]);
              }}
            >删除检查项</button>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#007bff', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                fetchTemplates();
                setShowTemplateModal(true);
              }}
            >从模板加载</button>
          </div>
        )}
        {checklist && checklist.items && checklist.items.length > 0 ? checklist.items.map((item, itemIdx) => {
          const isOwnDept = dep === userDepartment;
          return (
            <div key={item._id || itemIdx} style={{ marginBottom: 18, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  readOnly
                  style={{ marginRight: 10, cursor: isOwnDept ? 'pointer' : 'not-allowed', width: 18, height: 18 }}
                  checked={item.status === 'complete'}
                  disabled={!isOwnDept || item.status === 'complete'}
                  onClick={async () => {
                    if (isOwnDept && item.status !== 'complete') {
                      // 先本地更新
                      setChecklists(prev => prev.map((cl, clIdx) =>
                        cl.department === dep
                          ? { ...cl, items: cl.items.map((it, itIdx) => itIdx === itemIdx ? { ...it, status: 'complete' } : it) }
                          : cl
                      ));
                      // 弹窗填写评论
                      setPopup({ mode: 'complete', depIdx: idx, itemIdx, itemId: item._id });
                    }
                  }}
                />
                <span
                  style={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setPopup({ mode: 'detail', depIdx: idx, itemIdx, itemId: item._id })}
                >{item.content}</span>
              </div>
              {/* 横线仅作分隔，不可点 */}
              <div
                style={{ height: 2, background: '#e0e0a0', margin: '8px 0', borderRadius: 1 }}
              />
            </div>
          );
        }) : <div style={{ color: '#aaa', textAlign: 'center' }}>No items</div>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: checklistWidth, maxWidth: checklistWidth }}>
      {/* 顶部：固定高度，圆圈+箭头垂直居中 */}
      <div style={{ height: nodeSize + 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 部门圆圈 */}
        <div style={{ width: nodeSize, height: nodeSize, borderRadius: '50%', background: nodeColor, border: '2.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: fontSize, color: nodeTextColor, zIndex: 2, overflow: 'hidden', textAlign: 'center', lineHeight: 1.1, padding: 6 }}>{dep}</div>
        {/* 箭头svg+小球 */}
        {idx < departments.length - 1 && (
          <div style={{ position: 'relative', width: arrowLength, height: nodeSize, display: 'flex', alignItems: 'center' }}>
            <svg width={arrowLength} height={ballSize+8} style={{ display: 'block' }}>
              <line x1="0" y1={ballSize/2+4} x2={arrowLength-18} y2={ballSize/2+4} stroke="#00c800" strokeWidth="5" />
              <polygon points={`${arrowLength-18},${ballSize/2-2} ${arrowLength},${ballSize/2+4} ${arrowLength-18},${ballSize/2+10}`} fill="#00c800" />
            </svg>
            {showBall && (
              <div style={{ position: 'absolute', left: ballOffset, top: (nodeSize-ballSize)/2, zIndex: 3 }}>
                <div style={{ width: ballSize, height: ballSize, borderRadius: '50%', background: '#00c800', border: '2.5px solid #fff', boxShadow: '0 0 8px #00c800' }}></div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* checklist 框 */}
      <div style={{ background: '#fff8c6', padding: 20, minWidth: checklistWidth, maxWidth: checklistWidth, border: '1.5px solid #ccc', borderRadius: 12, position: 'relative', minHeight: 320 }}>
        <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
          <span style={{ color: '#444' }}>Progress: </span>
          <span style={{ color: '#00c800', fontSize: 22 }}>{checklist.progress || 0}%</span>
        </div>
        {/* 仅本部门显示添加item和删除item按钮（进度条下方） */}
        {dep === userDepartment && checklist.progress !== 100 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#00c800', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                setShowInputModal(true);
              }}
            >+ 添加检查项</button>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#ff4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                setShowDeleteModal(true);
                setSelectedToDelete([]);
              }}
            >删除检查项</button>
            <button
              style={{
                background: loadingAction ? '#aaa' : '#007bff', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontSize: 16, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600
              }}
              disabled={loadingAction}
              onClick={() => {
                if (loadingAction) return;
                fetchTemplates();
                setShowTemplateModal(true);
              }}
            >从模板加载</button>
          </div>
        )}
        {checklist && checklist.items && checklist.items.length > 0 ? checklist.items.map((item, itemIdx) => {
          const isOwnDept = dep === userDepartment;
          return (
            <div key={item._id || itemIdx} style={{ marginBottom: 18, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  readOnly
                  style={{ marginRight: 10, cursor: isOwnDept ? 'pointer' : 'not-allowed', width: 18, height: 18 }}
                  checked={item.status === 'complete'}
                  disabled={!isOwnDept || item.status === 'complete'}
                  onClick={async () => {
                    if (isOwnDept && item.status !== 'complete') {
                      // 先本地更新
                      setChecklists(prev => prev.map((cl, clIdx) =>
                        cl.department === dep
                          ? { ...cl, items: cl.items.map((it, itIdx) => itIdx === itemIdx ? { ...it, status: 'complete' } : it) }
                          : cl
                      ));
                      // 弹窗填写评论
                      setPopup({ mode: 'complete', depIdx: idx, itemIdx, itemId: item._id });
                    }
                  }}
                />
                <span
                  style={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setPopup({ mode: 'detail', depIdx: idx, itemIdx, itemId: item._id })}
                >{item.content}</span>
              </div>
              {/* 横线仅作分隔，不可点 */}
              <div
                style={{ height: 2, background: '#e0e0a0', margin: '8px 0', borderRadius: 1 }}
              />
            </div>
          );
        }) : <div style={{ color: '#aaa', textAlign: 'center' }}>No items</div>}
      </div>
      {/* 从模板加载弹窗 */}
      {showTemplateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={e => { if (e.target === e.currentTarget) setShowTemplateModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18 }}>选择模板加载检查项</div>
            {loadingTemplates ? <div>加载中...</div> : (
              templates.length === 0 ? <div style={{ color: '#888', fontSize: 16 }}>暂无可用模板</div> : (
                <ul style={{ paddingLeft: 0 }}>
                  {templates.map(tpl => (
                    <li key={tpl._id} style={{ marginBottom: 10, listStyle: 'none', display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <span
                        style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline dotted' }}
                        onMouseEnter={() => setHoveredTemplate(tpl)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                      >{tpl.name}</span>
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
                      {tpl._id === defaultTemplateId && <span style={{ marginLeft: 8, color: '#b48a00', fontWeight: 700, fontSize: 15 }}>默认模板</span>}
                      <button
                        style={{ marginLeft: 18, background: loadingAction ? '#aaa' : '#00c800', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 15, cursor: loadingAction ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                        disabled={loadingAction}
                        onClick={() => {
                          if (loadingAction) return;
                          setConfirmLoad({ show: true, tpl });
                        }}
                      >加载</button>
                    </li>
                  ))}
                </ul>
              )
            )}
            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <button onClick={() => setShowTemplateModal(false)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }} disabled={loadingAction}>关闭</button>
            </div>
            {/* 加载模板确认弹窗 */}
            <ConfirmModal
              visible={confirmLoad.show}
              title="确认加载模板"
              content="加载模板会丢失目前的检查单，是否确认加载？"
              onOk={async () => {
                setShowTemplateModal(false);
                setConfirmLoad({ show: false, tpl: null });
                setLoadingAction(true);
                const tpl = confirmLoad.tpl;
                if (!tpl) { setLoadingAction(false); return; }
                try {
                  // 先批量删除所有未完成的检查项
                  if (checklist.items && checklist.items.length > 0) {
                    const toDelete = checklist.items.filter(item => item.status !== 'complete').map(item => item._id);
                    if (toDelete.length > 0) {
                      await axios.post('/api/checklist/item/batch-delete', { itemIds: toDelete });
                    }
                  }
                  // 批量添加
                  await axios.post('/api/checklist/item/batch-add', {
                    checklistId: checklist._id,
                    contents: tpl.content,
                    forceTemplateSystem: true
                  });
                  if (typeof refreshChecklists === 'function') await refreshChecklists();
                } catch (err) {
                  alert('加载失败: ' + (err.response?.data?.message || err.message));
                } finally {
                  setLoadingAction(false);
                }
              }}
              onCancel={() => setConfirmLoad({ show: false, tpl: null })}
            />
          </div>
        </div>
      )}
      {/* 删除检查项弹窗 */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18 }}>删除未完成的检查项</div>
            <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 18 }}>
              {(checklist.items?.filter(item => item.status !== 'complete')?.length > 0) ? checklist.items.filter(item => item.status !== 'complete').map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedToDelete.includes(item._id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedToDelete([...selectedToDelete, item._id]);
                      else setSelectedToDelete(selectedToDelete.filter(id => id !== item._id));
                    }}
                    style={{ marginRight: 10 }}
                  />
                  <span style={{ fontSize: 16 }}>{item.content}</span>
                </div>
              )) : <div style={{ color: '#888', fontSize: 16 }}>暂无可删除的未完成项</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#333', fontSize: 16 }} disabled={loadingAction}>取消</button>
              <button
                disabled={selectedToDelete.length === 0 || deleting || loadingAction}
                style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: selectedToDelete.length === 0 || deleting || loadingAction ? '#aaa' : '#ff4444', color: '#fff', fontSize: 16, fontWeight: 600, cursor: selectedToDelete.length === 0 || deleting || loadingAction ? 'not-allowed' : 'pointer' }}
                onClick={async () => {
                  if (!selectedToDelete.length || loadingAction) return;
                  setDeleting(true);
                  setLoadingAction(true);
                  try {
                    await axios.post('/api/checklist/item/batch-delete', { itemIds: selectedToDelete });
                    setShowDeleteModal(false);
                    setSelectedToDelete([]);
                    if (typeof refreshChecklists === 'function') await refreshChecklists();
                  } catch (err) {
                    alert('删除失败: ' + (err.response?.data?.message || err.message));
                  } finally {
                    setDeleting(false);
                    setLoadingAction(false);
                  }
                }}
              >确认删除</button>
            </div>
          </div>
        </div>
      )}
      {/* 添加检查项自定义弹窗 */}
      <InputModal
        visible={showInputModal}
        title="请输入检查项内容"
        placeholder="检查项内容"
        onOk={async (content) => {
          if (!content || loadingAction) return;
          setLoadingAction(true);
          try {
            await axios.post('/api/checklist/item/batch-add', {
              checklistId: checklist._id,
              contents: [content]
            });
            setShowInputModal(false);
            if (typeof refreshChecklists === 'function') await refreshChecklists();
          } catch (err) {
            alert('添加失败: ' + (err.response?.data?.message || err.message));
          } finally {
            setLoadingAction(false);
          }
        }}
        onCancel={() => setShowInputModal(false)}
      />
    </div>
  );
}

const ProjectDetail = () => {
  const { id: projectId } = useParams();
  const [popup, setPopup] = useState(null); // {mode, depIdx, itemIdx}
  const [hovered, setHovered] = useState(null); // {depIdx, itemIdx}
  const [project, setProject] = useState(null);
  const [checklists, setChecklists] = useState([]); // 带items的checklist
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nodeSize = 110; // 圆圈直径更大
  const fontSize = 22;
  const checklistWidth = 260;
  const checklistGap = 48;
  const arrowLength = 110;
  const ballSize = 24;
  const ballOffset = arrowLength / 2 - ballSize / 2;
  const detailPopupRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userDepartment = user.department;

  // 刷新project
  const refreshProject = async () => {
    try {
      const projRes = await axios.get(`/api/project/${projectId}`);
      setProject(projRes.data);
    } catch {}
  };

  // 刷新checklists
  const refreshChecklists = async () => {
    try {
      const checklistRes = await axios.get(`/api/checklist/department/list-with-items?projectId=${projectId}`);
      setChecklists(checklistRes.data);
      await refreshProject();
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const projRes = await axios.get(`/api/project/${projectId}`);
        if (!isMounted) return;
        setProject(projRes.data);
        // 获取所有部门checklist
        const checklistRes = await axios.get(`/api/checklist/department/list-with-items?projectId=${projectId}`);
        if (!isMounted) return;
        const checklistsRaw = checklistRes.data;
        console.log('checklistsRaw', checklistsRaw);
        // 并发获取每个checklist的item
        const checklistsWithItems = await Promise.all(
          checklistsRaw.map(async (cl) => {
            const itemsRes = await axios.get(`/api/checklist/item/list?checklistId=${cl._id}`);
            return { ...cl, items: itemsRes.data };
          })
        );
        console.log('checklistsWithItems', checklistsWithItems);
        if (!isMounted) return;
        setChecklists(checklistsWithItems);
        setLoading(false);
      } catch (err) {
        setError('Failed to load project');
        setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [projectId]);

  // 点击空白处关闭详情弹窗
  useEffect(() => {
    if (!popup || popup.mode !== 'detail') return;
    function handleClick(e) {
      if (detailPopupRef.current && !detailPopupRef.current.contains(e.target)) {
        setPopup(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popup]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!project) return null;
  console.log('project', project);
  console.log('checklists', checklists);

  // checklist数据结构：project.checklists为数组，每个部门一个
  // checklist: { department: 'Sales', items: [ { _id, name, completed, ... } ] }

  // 计算小球和橙色部门逻辑
  // 1. 找到第一个未完成的部门索引
  const firstUnfinishedIdx = departments.findIndex(dep => {
    const cl = checklists.find(cl => cl.department === dep);
    return !cl || (cl.progress || 0) < 100;
  });
  // 2. 全部完成时不显示小球和橙色

  return (
    <div>
      <Navbar />
      <div style={{ margin: '40px 60px' }}>
        <h2>{project.name} <span style={{ color: project.status === 'finished' ? 'gray' : 'green', fontSize: 18, marginLeft: 12 }}>
          {project.status === 'finished' ? 'Finished' : 'In Progress'}
          <span style={{ color: '#00c800', fontWeight: 700, marginLeft: 10 }}>({project.progress || 0}%)</span>
        </span></h2>
        {/* checklist横向滚动区域 */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 48, width: 'max-content', paddingLeft: 24 }}>
            {/* Start+第一个部门 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: nodeSize+24 }}>
              <div style={{ background: '#00c800', color: '#fff', padding: '14px 28px', borderRadius: 12, marginBottom: 18, fontSize: 20, minWidth: 120, textAlign: 'center' }}>Start at {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '---'}</div>
            </div>
            {departments.map((dep, idx) => (
              <DepartmentBlock
                key={dep}
                dep={dep}
                idx={idx}
                nodeSize={nodeSize}
                fontSize={fontSize}
                arrowLength={arrowLength}
                ballSize={ballSize}
                ballOffset={ballOffset}
                checklistWidth={checklistWidth}
                checklist={checklists.find(cl => cl.department === dep) || { items: [] }}
                onCheck={()=>{}}
                onComment={()=>{}}
                canOperate={false}
                hovered={hovered}
                setHovered={setHovered}
                setPopup={setPopup}
                popup={popup}
                isOrange={firstUnfinishedIdx === idx}
                showBall={firstUnfinishedIdx > 0 && idx === firstUnfinishedIdx - 1}
                detailPopupRef={detailPopupRef}
                userDepartment={userDepartment}
                projectId={projectId}
                refreshChecklists={refreshChecklists}
                setChecklists={setChecklists}
              />
            ))}
            {/* Finish */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: nodeSize+24 }}>
              <div style={{ background: '#009cff', color: '#fff', padding: '14px 28px', borderRadius: 12, marginBottom: 18, fontSize: 20, minWidth: 100, textAlign: 'center' }}>Finish</div>
            </div>
          </div>
        </div>
        {/* checklist弹窗 */}
        {popup && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.15)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={e => {
              if (e.target === e.currentTarget) setPopup(null);
            }}
          >
            <ChecklistItemPopup
              mode={popup.mode}
              onClose={() => setPopup(null)}
              title={(popup.depIdx !== undefined && popup.itemIdx !== undefined && checklists.find(cl => cl.department === departments[popup.depIdx]) && checklists.find(cl => cl.department === departments[popup.depIdx]).items[popup.itemIdx]) ? `${departments[popup.depIdx]}: ${checklists.find(cl => cl.department === departments[popup.depIdx]).items[popup.itemIdx].content}` : undefined}
              itemId={popup.itemId}
              itemDepartment={popup.depIdx !== undefined ? departments[popup.depIdx] : undefined}
              userDepartment={userDepartment}
              refreshChecklists={refreshChecklists}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail; 