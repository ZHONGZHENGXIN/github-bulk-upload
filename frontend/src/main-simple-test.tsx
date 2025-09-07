import React from 'react';
import ReactDOM from 'react-dom/client';

// 最简单的测试应用
const SimpleTestApp: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          投资流程管理系统
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          ✅ React应用运行正常
        </p>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '1.5rem' }}>
          <p>构建时间: {new Date().toLocaleString()}</p>
          <p>环境: {process.env.NODE_ENV || 'development'}</p>
        </div>
        <button 
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => alert('系统正常工作！')}
        >
          测试按钮
        </button>
      </div>
    </div>
  );
};

// 挂载应用
const root = document.getElementById('root');
if (root) {
  root.innerHTML = '';
  ReactDOM.createRoot(root).render(<SimpleTestApp />);
} else {
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">错误: 找不到根元素</div>';
}