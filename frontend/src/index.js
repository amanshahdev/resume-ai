/**
 * index.js - React Application Entry Point
 *
 * WHAT: Mounts the root React component into the DOM.
 * HOW:  Uses React 18's createRoot API for concurrent mode support.
 * WHY:  Required by Create React App as the Webpack entry point.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
