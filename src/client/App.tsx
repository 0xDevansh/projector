import type { ExtendedUser } from '../types.js'
import axios from 'axios'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { SWRConfig } from 'swr'
import { AuthProvider } from './AuthContext.js'
import { TooltipProvider } from './components/ui/tooltip.js'
import AppLayout from './layouts/AppLayout.js'
import About from './pages/About.js'
import ApplicationDetails from './pages/ApplicationDetails.js'
import { CreateProject } from './pages/CreateProject.js'
import EditProfile from './pages/EditProfile.js'
import { EditProject } from './pages/EditProject.js'
import { Home } from './pages/Home.js'
import NotFound from './pages/NotFound.js'
import Onboarding from './pages/Onboarding.js'
import Profile from './pages/Profile.js'
import ProjectDetails from './pages/ProjectDetails.js'
import Projects from './pages/Projects.js'
// import { FilteredProjects } from './components/FilteredProjects.js'

export function createApp(isLoggedIn: boolean, user?: ExtendedUser) {
  return (
    <React.StrictMode>
      <SWRConfig value={{
        refreshInterval: 10000,
        fetcher: (url: string) => axios.get(url).then(res => res.data),
      }}
      >
        <AuthProvider initialIsLoggedIn={isLoggedIn} initialUser={user}>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="app" element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="onboarding" element={<Onboarding />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/create" element={<CreateProject />} />
                  {/* <Route path="projects/filter" element={<FilteredProjects />} /> */}
                  <Route path="project/:id" element={<ProjectDetails />} />
                  <Route path="project/:id/edit" element={<EditProject />} />
                  <Route path="project/:projectId/applications/:applicationId" element={<ApplicationDetails />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="profile/edit" element={<EditProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </SWRConfig>
    </React.StrictMode>
  )
}
