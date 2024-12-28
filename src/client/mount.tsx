import { createRoot } from 'react-dom/client'
import { createApp } from './App.js'
const rootElement =
  document.getElementById('root') || document.createElement('div');

const root = createRoot(rootElement)
root.render(createApp())