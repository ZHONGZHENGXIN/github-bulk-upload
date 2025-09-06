import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// import { register, showUpdateAvailableNotification } from './utils/serviceWorker';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 暂时禁用 Service Worker 以避免部署问题
// TODO: 在ZEABUR配置正确的MIME类型后重新启用
// if (import.meta.env.PROD) {
//   register({
//     onSuccess: (registration) => {
//       console.log('Service Worker registered successfully:', registration);
//     },
//     onUpdate: (registration) => {
//       console.log('Service Worker updated:', registration);
//       showUpdateAvailableNotification(registration);
//     },
//   });
// }