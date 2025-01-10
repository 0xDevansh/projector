import type { ExtendedUser } from '../types.js'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './AuthContext.js'
import { TooltipProvider } from './components/ui/tooltip.js'
import AppLayout from './layouts/AppLayout.js'
import { About } from './pages/About.js'
import { Home } from './pages/Home.js'
import { Login } from './pages/Login.js'
import NotFound from './pages/NotFound.js'
import Onboarding from './pages/Onboarding.js'
import ProjectDetails from './pages/ProjectDetails.js'

export function createApp(isLoggedIn: boolean, user?: ExtendedUser) {
  return (
    <React.StrictMode>
      <AuthProvider initialIsLoggedIn={isLoggedIn} initialUser={user}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="app" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="login" element={<Login />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="project/:id" element={<ProjectDetails />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </React.StrictMode>
  )
}
