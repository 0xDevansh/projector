import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from './pages/Home.js';
import AppLayout from './layouts/AppLayout.js';
import { About } from './pages/About.js';
import NotFound from './pages/NotFound.js';


export function createApp () {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='app' element={<AppLayout />} >
            <Route index element={<Home />} />
            <Route path='about' element={<About />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  )
}