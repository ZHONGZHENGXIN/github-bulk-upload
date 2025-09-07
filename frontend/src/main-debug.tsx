import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 调试用的简单应用
const DebugApp: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    console.log('React app mounted successfully');
    
    // 通知加载完成
    setTimeout(() => {
      document.body.classList.add('app-loaded');
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            投资流程管理系统
          </h1>
          <p className="mt-2 text-gray-600">
            {mounted ? '✅ 应用已成功加载' : '⏳ 正在加载...'}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>环境: {import.meta.env.MODE}</p>
            <p>API地址: {import.meta.env.VITE_API_URL || '未配置 (将使用默认)'}</p>
            <p>调试模式: {import.meta.env.VITE_DEBUG || '未设置'}</p>
            <p>应用环境: {import.meta.env.VITE_APP_ENV || '未设置'}</p>
            <p>时间: {new Date().toLocaleString()}</p>
            <p>用户代理: {navigator.userAgent.substring(0, 50)}...</p>
          </div>
          <div className="mt-8">
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                alert('系统正常工作！');
                console.log('Button clicked - system working');
              }}
            >
              测试按钮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

console.log('Starting React app...');

const root = document.getElementById('root');
if (root) {
  console.log('Root element found, mounting React app...');
  
  // 清空root元素的初始内容
  root.innerHTML = '';
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <DebugApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red; font-family: Arial;">错误: 找不到根元素</div>';
}