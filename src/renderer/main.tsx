import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/index';
import { App } from './App';
import './index.css';

const root = document.getElementById('root')!;
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
