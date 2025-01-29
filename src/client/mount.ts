import axios from 'axios'
import { createRoot } from 'react-dom/client'
import { createApp } from './App.js'

async function mount() {
  const rootElement
    = document.getElementById('root') || document.createElement('div')
  const root = createRoot(rootElement)

  // fetch auth data
  const res = await axios.get('/api/check-auth')
  if (res.data.data) {
    root.render(createApp(true, res.data.data))
  }
  else {
    root.render(createApp(false, undefined))
  }
}

mount()
