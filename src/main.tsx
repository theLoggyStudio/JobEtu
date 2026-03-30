import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { applyThemeToDocument } from './utils/applyTheme';
import { useAuthStore } from './store/authStore';
import './styles/global.css';

applyThemeToDocument();
void useAuthStore.getState().restoreSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
