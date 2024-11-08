import './i18n'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThirdwebProvider } from 'thirdweb/react';
import AppProvider from './context';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ThirdwebProvider>

  </React.StrictMode>
);