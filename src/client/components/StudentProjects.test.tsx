import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import StudentProjects from './StudentProjects' // Adjust path as necessary
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
  default: ({ project }: { project: types.ProjectTSType }) => <div data-testid={`project-card-${project.id}`}>{project.title}</div>,
}))

// Mock NoProjectsFound
vi.mock('./ProfProjects.js', () => ({
    NoProjectsFound: () => <div data-testid="no-projects-found">No projects found</div>,
}))


describe('StudentProjects Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseSWR.mockReset()
    // Default mock implementation for projects and applications
    mockUseSWR.mockImplementation((key) => {
      if (key === '/api/applications/mine' || (typeof key === 'string' && key.startsWith('/api/applications/mine'))) {
        return { data: { data: [] }, isLoading: false, error: null }
      }
      if (key === '/api/projects' || (typeof key === 'string' && key.startsWith('/api/projects'))) {
        return { data: { data: [] }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Test 1: Renders filter UI elements', () => {
    render(<StudentProjects />)
    expect(screen.getByLabelText('Project Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration')).toBeInTheDocument()
    expect(screen.getByLabelText('Eligible Degrees')).toBeInTheDocument()
    expect(screen.getByLabelText('Eligible Departments')).toBeInTheDocument()
    expect(screen.getByLabelText('Minimum Year')).toBeInTheDocument()
    expect(screen.getByLabelText('Stipend Provided')).toBeInTheDocument()
    expect(screen.getByLabelText('Accepting Applications')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeInTheDocument()
  })

  it('Test 4: Initial load calls API with default filters', async () => {
    render(<StudentProjects />)
    // Wait for the useEffect in StudentProjects to call handleApplyFilters
    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/projects?applyDateNotPassed=true'))
    })
  })

  it('Test 2: Applies a single filter and verifies API call', async () => {
    const user = userEvent.setup()
    render(<StudentProjects />)

    // Wait for initial load to complete (default filter call)
    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('applyDateNotPassed=true'))
    })
    
    mockUseSWR.mockClear() // Clear mock calls after initial load

    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('SURA')) // Relies on mock of types.projectType

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/projects?projectType=sura&applyDateNotPassed=true'))
    })
  })

  it('Test 3: Applies multiple filters and verifies API call', async () => {
    const user = userEvent.setup()
    render(<StudentProjects />)
    
    await waitFor(() => { // Wait for initial load
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('applyDateNotPassed=true'))
    })
    mockUseSWR.mockClear()

    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('Thesis'))

    const stipendCheckbox = screen.getByLabelText('Stipend Provided')
    await user.click(stipendCheckbox)
    
    const minYearInput = screen.getByLabelText('Minimum Year')
    await user.type(minYearInput, '2')

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/projects?projectType=thesis&stipendProvided=true&minYear=2&applyDateNotPassed=true'))
    })
  })
  
  it('Test 5a: Displays "No projects found" message when API returns empty array', async () => {
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === 'string' && key.startsWith('/api/projects')) {
        return { data: { data: [] }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })
    render(<StudentProjects />)
    await waitFor(() => {
      expect(screen.getByTestId('no-projects-found')).toBeInTheDocument()
    })
  })

  it('Test 5b: Displays filtered projects', async () => {
    const mockProjects = [
      { id: '1', title: 'Project Alpha', projectType: ['sura'], duration: ['summer'], lastApplyDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), profKerberos: 'prof1', description: 'Desc1', vacancy: 1, stipendProvided: false },
      { id: '2', title: 'Project Beta', projectType: ['thesis'], duration: ['semester'], lastApplyDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), profKerberos: 'prof2', description: 'Desc2', vacancy: 2, stipendProvided: true },
    ]
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === 'string' && key.startsWith('/api/projects')) {
        // Simulate filtering based on a query param
        if (key.includes('projectType=sura')) {
          return { data: { data: [mockProjects[0]] }, isLoading: false, error: null }
        }
        return { data: { data: mockProjects }, isLoading: false, error: null }
      }
      return { data: { data: [] }, isLoading: false, error: null }
    })

    const user = userEvent.setup()
    render(<StudentProjects />)

    // Wait for initial load (which might show all or default filtered projects)
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
      expect(screen.getByText('Project Beta')).toBeInTheDocument()
    })
    
    mockUseSWR.mockClear() // Clear calls from initial render

    // Apply a filter that should return only "Project Alpha"
    const projectTypeSelect = screen.getByLabelText('Project Type')
    await user.click(projectTypeSelect)
    await user.click(screen.getByText('SURA'))
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(mockUseSWR).toHaveBeenCalledWith(expect.stringContaining('/api/projects?projectType=sura&applyDateNotPassed=true'))
      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
    })
  })
})
