import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from './pages/Home.js';
import AppLayout from './layouts/AppLayout.js';
import { About } from './pages/About.js';
import NotFound from './pages/NotFound.js';
import { Login } from './pages/Login.js';
import { AuthProvider, OauthUserData } from './AuthContext.js';


export function createApp (isLoggedIn: boolean, user?: OauthUserData) {
  return (
    <React.StrictMode>
      <AuthProvider initialIsLoggedIn={isLoggedIn} initialUser={user}>
        <BrowserRouter>
          <Routes>
            <Route path='app' element={<AppLayout />} >
              <Route index element={<Home />} />
              <Route path='about' element={<About />} />
              <Route path='login' element={<Login />} />
              <Route path='*' element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  )
}