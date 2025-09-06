import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleLogin from './components/auth/SimpleLogin';
import './index.css';

// 简单的测试应用
const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleLogin />
    </div>
  );
};

// 如果直接运行这个文件，渲染测试应用
if (import.meta.url.includes('test-app')) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>,
  );
}

export default TestApp;