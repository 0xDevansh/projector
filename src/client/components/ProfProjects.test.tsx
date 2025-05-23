import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ProfProjects from './ProfProjects' // Adjust path as necessary
import { AuthContext } from '../AuthContext' // Adjust path
import * as types from '../../types' // Mocked below

// Mock useSWR
const mockUseSWR = vi.fn()
vi.mock('swr', () => ({
  default: (...args: any[]) => mockUseSWR(...args),
}))

// Mock types to provide data for select options
vi.mock('../../types.ts', async () => {
  const actual = await vi.importActual('../../types.ts')
  return {
    ...actual,
    projectType: { disa: 'DISA', sura: 'SURA', thesis: 'Thesis' },
    projectDuration: { summer: 'Summer', semester: 'Semester' },
    degreeName: { btech: 'BTech', mtech: 'MTech' },
    deptData: { cse: { name: 'CSE', type: 'department' }, ee: { name: 'EE', type: 'department' } },
  }
})

// Mock ProjectCard to simplify testing project rendering
vi.mock('./ProjectCard.js', () => ({
  default: ({ project, profView }: { project: types.ProjectTSType, profView?: boolean }) => (
    <div data-testid={`project-card-${project.id}`} data-profview={profView ? 'true' : 'false'}>
      {project.title}
    </div>
  ),
}))

// Mock NoProjectsFound from its own module (ProfProjects.tsx exports it)
// No need to mock ProfProjects.js as a whole if NoProjectsFound is a named export from ProfProjects.tsx
// If it's re-exported, this is fine. Given the previous test, this structure is assumed.
vi.mock('./ProfProjects.js', async () => {
    const actual = await vi.importActual('./ProfProjects.js');
    return {
        ...actual, // Preserve other exports if any
        NoProjectsFound: ({ forProf }: { forProf?: boolean }) => (
            <div data-testid="no-projects-found">
                {forProf ? "You have no projects matching the current filters." : "No projects found"}
            </div>
        ),
    };
});


// Mock react-router Link component
vi.mock('react-router', () => ({
  Link: (props: any) => <a {...props} href={props.to}>{props.children}</a>,
}))

const mockUser = {
  user: { kerberos: 'testprof', name: 'Test Professor', email: 'testprof@example.com', type: 'prof' as types.UserType },
  type: 'prof' as types.UserType,
}

describe('ProfProjects Component', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
    // Default mock for /api/projects (other projects) and /api/my-projects
    mockUseSWR.mockImplementation((key) => {
      if (key === '/api/projects') { // For "Other open projects"
        return { data: { data: [] }, isLoading: false, error: null }
      }
      if (typeof key === 'string' && key.startsWith('/api/my-projects')) { // For "Your Projects"
        return { data: { data: [] }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ user: mockUser, loading: false, logout: vi.fn(), login: vi.fn(), setUser: vi.fn() }}>
        <ProfProjects />
      </AuthContext.Provider>
    )
  }

  it('Test 1: Renders filter UI elements for "Your Projects"', () => {
    renderComponent()
    // Filters are for "Your Projects"
    expect(screen.getByText('Filter Your Projects')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration')).toBeInTheDocument()
    // ... (other filter elements as in StudentProjects)
    expect(screen.getByLabelText('Stipend Provided')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeInTheDocument()
  })

  it('Test 4: Initial load calls /api/my-projects with default filters', async () => {
    renderComponent()
    await waitFor(() => {
      // Check for /api/my-projects call with applyDateNotPassed=true
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?applyDateNotPassed=true'))
      // Also check that /api/projects (for other projects) is called without these filters
      expect(mockUseSWR).toHaveBeenCalledWith('/api/projects')
    })
  })

  it('Test 2: Applies a single filter to "Your Projects" and verifies API call', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => { // Wait for initial load
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?applyDateNotPassed=true'))
    })
    mockUseSWR.mockClear() // Clear after initial load

    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('SURA')) // Assumes 'SURA' is a valid option from mocked types

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?projectType=sura&applyDateNotPassed=true'))
    })
  })

  it('Test 3: Applies multiple filters to "Your Projects" and verifies API call', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => { // Wait for initial load
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?applyDateNotPassed=true'))
    })
    mockUseSWR.mockClear()

    const durationSelect = screen.getByLabelText('Duration')
    await user.click(durationSelect)
    await user.click(screen.getByText('Summer')) // Assumes 'Summer' is valid

    const stipendCheckbox = screen.getByLabelText('Stipend Provided')
    await user.click(stipendCheckbox)
    
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?duration=summer&stipendProvided=true&applyDateNotPassed=true'))
    })
  })

  it('Test 5a: Displays "You have no projects matching the current filters." for "Your Projects"', async () => {
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === 'string' && key.startsWith('/api/my-projects')) {
        return { data: { data: [] }, isLoading: false, error: null }
      }
      if (key === '/api/projects') {
        return { data: { data: [] }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })
    renderComponent()
    await waitFor(() => {
      // Check specific message for prof's filtered projects
      expect(screen.getByText('You have no projects matching the current filters.')).toBeInTheDocument()
    })
  })

  it('Test 5b: Displays filtered "Your Projects"', async () => {
    const profsOwnProjects = [
      { id: 'myproj1', title: 'My Super Project', projectType: ['sura'], duration: ['summer'], lastApplyDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), profKerberos: 'testprof', description: 'My Desc', vacancy: 1, stipendProvided: false },
      { id: 'myproj2', title: 'My Other Project', projectType: ['thesis'], duration: ['semester'], lastApplyDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), profKerberos: 'testprof', description: 'My Other Desc', vacancy: 2, stipendProvided: true },
    ]
    
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === 'string' && key.startsWith('/api/my-projects')) {
        if (key.includes('projectType=sura')) {
          return { data: { data: [profsOwnProjects[0]] }, isLoading: false, error: null }
        }
        return { data: { data: profsOwnProjects }, isLoading: false, error: null }
      }
      if (key === '/api/projects') { // Other projects remain empty for this test
        return { data: { data: [] }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })

    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('My Super Project')).toBeInTheDocument()
      expect(screen.getByText('My Other Project')).toBeInTheDocument()
    })
    
    mockUseSWR.mockClear()

    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('SURA'))
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?projectType=sura&applyDateNotPassed=true'))
      expect(screen.getByText('My Super Project')).toBeInTheDocument()
      expect(screen.queryByText('My Other Project')).not.toBeInTheDocument()
    })
  })
  
  it('Test 6: "Other open projects" are fetched without filters and displayed', async () => {
    const otherProjectsData = [
      { id: 'other1', title: 'External Project X', projectType: ['sura'], duration: ['summer'], lastApplyDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), profKerberos: 'anotherprof', description: 'External Desc X', vacancy: 1, stipendProvided: false },
    ]
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === 'string' && key.startsWith('/api/my-projects')) {
        return { data: { data: [] }, isLoading: false, error: null } // No "Your Projects"
      }
      if (key === '/api/projects') {
        return { data: { data: otherProjectsData }, isLoading: false, error: null } // "Other Projects"
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })
    
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('External Project X')).toBeInTheDocument()
      // Ensure this call doesn't have the student-facing filters
      expect(mockUseSWR).toHaveBeenCalledWith('/api/projects') 
    })
    
    // Apply a filter for "Your Projects"
    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('SURA'))
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      // This call is for "My Projects"
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/my-projects?projectType=sura&applyDateNotPassed=true'))
      // This call for "Other Projects" should have been made again (or SWR serves cache) but importantly, without the new filters
      expect(mockUseSWR).toHaveBeenCalledWith('/api/projects') 
      expect(screen.getByText('External Project X')).toBeInTheDocument() // Still visible
    })
  })
})
