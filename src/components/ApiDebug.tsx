import { useEffect, useState } from 'react';

export const ApiDebug = () => {
  const [info, setInfo] = useState({
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    apiUrl: import.meta.env.VITE_API_URL || 'not set',
    windowOrigin: window.location.origin,
  });

  useEffect(() => {
    console.log('🔧 API Debug Info:', info);
  }, []);

  // Solo mostrar en desarrollo
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1f2937',
      color: '#fff',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
    }}>
      <div><strong>🔧 API Debug</strong></div>
      <div>Mode: {info.mode}</div>
      <div>Dev: {info.dev ? 'Yes' : 'No'}</div>
      <div>API URL: {info.apiUrl}</div>
      <div>Origin: {info.windowOrigin}</div>
    </div>
  );
};

