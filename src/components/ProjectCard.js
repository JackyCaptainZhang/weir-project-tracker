import React from 'react';

const ProjectCard = ({ name, status, days, createdAt, progress, isFinished, onClick, createdBy }) => {
  return (
    <div
      style={{
        width: 500,
        background: '#c8b89a',
        margin: '30px 0',
        padding: 20,
        border: '1px solid #333',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        boxShadow: onClick ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        position: 'relative',
      }}
      onClick={onClick}
      onMouseOver={e => { if (onClick) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
      onMouseOut={e => { if (onClick) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 18 }}>{status}</div>
      </div>
      {isFinished ? (
        <div style={{ fontSize: 16, marginTop: 5 }}>
          finished at {createdAt}, <b>{days}</b> days in total
        </div>
      ) : (
        <div style={{ fontSize: 16, marginTop: 5 }}>
          {days} Days Since {createdAt}
        </div>
      )}
      <div style={{ fontSize: 16, marginTop: 5, color: '#0070c0' }}>
        Progress: <b>{progress ?? 0}%</b>
      </div>
      <div style={{ position: 'absolute', right: 18, bottom: 12, color: '#444', fontSize: 15, textAlign: 'right' }}>
        Created by: <b>{createdBy?.username || '-'}</b>
      </div>
    </div>
  );
};

export default ProjectCard; 