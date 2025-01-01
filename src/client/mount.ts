import { createRoot } from 'react-dom/client'
import { createApp } from './App.js';
import axios from 'axios';

const rootElement =
  document.getElementById('root') || document.createElement('div');
console.log('MOUNTING');
const root = createRoot(rootElement)

// fetch auth data
const res = await axios.get('http://localhost:8080/api/check-auth')
if (res.data.error == null) {
  root.render(createApp(true, res.data.data))
} else {
  root.render(createApp(false, undefined))
}