// import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router';
import Home from './pages/Home.js';
import About from './pages/About.js';

export function createApp () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/app/' element={Home} />
        <Route path='/app/about' element={About} />
      </Routes>
    </BrowserRouter>
  )
}