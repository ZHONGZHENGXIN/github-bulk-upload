import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 最简单的测试组件
const SimpleApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            投资流程管理系统
          </h1>
          <p className="mt-2 text-gray-600">
            系统正在运行中...
          </p>
          <div className="mt-8">
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              onClick={() => alert('系统正常工作！')}
            >
              测试按钮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}