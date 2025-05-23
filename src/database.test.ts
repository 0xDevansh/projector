import { DataSource } from 'typeorm'
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { User } from './models/User.js' // Adjust path as necessary
import { Student } from './models/Student.js' // Adjust path as necessary
import { Professor, Project } from './models/ProfessorProject.js' // Adjust path as necessary
import { Application } from './models/Application.js' // Adjust path as necessary
import { Analytics } from './models/Analytics.js' // Adjust path as necessary
import { addProject, getProjects, initDatabase as actualInitDatabase, getProjectById } from './database.js' // Adjust path
import type { ProjectTSType, DegreeCode, DeptCode, ProjectDuration, ProjectType } from './types.js' // Adjust path
import { nanoid } from 'nanoid'


// Use a global variable for the DataSource if initDatabase modifies it,
// or re-export AppDataSource from database.ts and import it here.
// For this example, assuming initDatabase sets up a global or accessible DataSource.
let testDataSource: DataSource

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)

const commonProjectProps = {
  description: 'Test description',
  vacancy: 2,
  profKerberos: 'prof1', // Default prof
}

const sampleProjects: Partial<ProjectTSType>[] = [
  { // 0
    ...commonProjectProps,
    title: 'Project Alpha (Open, Stipend, Recent)',
    projectType: ['sura' as ProjectType],
    duration: ['summer' as ProjectDuration],
    eligibleDegrees: ['btech' as DegreeCode, 'mtech' as DegreeCode],
    eligibleDepartments: ['cse' as DeptCode, 'ee' as DeptCode],
    stipendProvided: true,
    minYear: 1,
    lastApplyDate: tomorrow,
    projectStatus: 'open',
    profKerberos: 'prof1',
  },
  { // 1
    ...commonProjectProps,
    title: 'Project Beta (Open, No Stipend, Old)',
    projectType: ['btp' as ProjectType],
    duration: ['semester' as ProjectDuration],
    eligibleDegrees: ['dual' as DegreeCode],
    eligibleDepartments: ['mech' as DeptCode],
    stipendProvided: false,
    minYear: 3,
    lastApplyDate: yesterday, // Application passed
    projectStatus: 'open',
    profKerberos: 'prof2',
  },
  { // 2
    ...commonProjectProps,
    title: 'Project Gamma (Draft, Stipend)',
    projectType: ['minor' as ProjectType, 'sura' as ProjectType],
    duration: ['winter' as ProjectDuration],
    stipendProvided: true,
    minYear: 2,
    lastApplyDate: tomorrow,
    projectStatus: 'draft',
    profKerberos: 'prof1',
  },
  { // 3
    ...commonProjectProps,
    title: 'Project Delta (Closed)',
    projectType: ['thesis' as ProjectType],
    duration: ['year' as ProjectDuration],
    stipendProvided: false,
    minYear: 4,
    lastApplyDate: yesterday,
    projectStatus: 'closed',
    profKerberos: 'prof3',
  },
  { // 4
    ...commonProjectProps,
    title: 'Project Epsilon (Open, Stipend, Year 2 min, CSE only)',
    projectType: ['sura' as ProjectType],
    duration: ['summer' as ProjectDuration],
    eligibleDegrees: ['btech' as DegreeCode],
    eligibleDepartments: ['cse' as DeptCode],
    stipendProvided: true,
    minYear: 2,
    lastApplyDate: tomorrow,
    projectStatus: 'open',
    profKerberos: 'prof1',
  },
  { // 5
    ...commonProjectProps,
    title: 'Project Zeta (Open, No Stipend, BTP/MTP, MECH/EE)',
    projectType: ['btp' as ProjectType, 'mtp' as ProjectType],
    duration: ['semester' as ProjectDuration, 'year' as ProjectDuration],
    eligibleDegrees: ['btech' as DegreeCode, 'mtech' as DegreeCode, 'dual' as DegreeCode],
    eligibleDepartments: ['mech' as DeptCode, 'ee' as DeptCode],
    stipendProvided: false,
    minYear: 1,
    lastApplyDate: tomorrow,
    projectStatus: 'open',
    profKerberos: 'prof2',
  },
]

async function seedProject(projectData: Partial<ProjectTSType>) {
  const profUser = User.create({ kerberos: projectData.profKerberos, name: projectData.profKerberos, email: `${projectData.profKerberos}@example.com`, type: 'prof' })
  await testDataSource.manager.save(profUser)
  const prof = Professor.create({ kerberos: projectData.profKerberos, user: profUser })
  await testDataSource.manager.save(prof)

  const projectToCreate = {
    id: nanoid(8),
    ...projectData,
    prof: prof, // Link to the Professor entity
  }
  // TypeORM expects array fields to be passed as arrays, it handles serialization
  const newProject = Project.create(projectToCreate as any) // Cast to any if types mismatch due to prof object
  return await testDataSource.manager.save(newProject)
}


describe('getProjects - Backend Filtering Logic', () => {
  beforeAll(async () => {
    testDataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:', // In-memory SQLite for tests
      entities: [User, Student, Professor, Project, Application, Analytics],
      synchronize: true, // Automatically create schema
    })
    await testDataSource.initialize()
    // Replace actual initDatabase with a no-op or one that uses testDataSource if needed
    // For now, we assume database.ts uses AppDataSource which we are replacing here.
    // This is a common pattern: main code uses exported AppDataSource, tests replace it.
  })

  afterAll(async () => {
    await testDataSource.destroy()
  })

  beforeEach(async () => {
    // Clear all project data and re-seed
    await testDataSource.getRepository(Project).clear()
    await testDataSource.getRepository(Professor).clear()
    await testDataSource.getRepository(User).clear()
    for (const projData of sampleProjects) {
      await seedProject(projData)
    }
  })

  afterEach(async () => {
    // No specific cleanup needed here if beforeEach handles full clear & re-seed
  })

  it('Test 1: No filters returns all open projects', async () => {
    const projects = await getProjects({})
    expect(projects.length).toBe(4) // Alpha, Beta, Epsilon, Zeta are open
    expect(projects.map(p => p.title).sort()).toEqual([
      'Project Alpha (Open, Stipend, Recent)',
      'Project Beta (Open, No Stipend, Old)', // Still open, even if lastApplyDate passed (applyDateNotPassed filter handles this)
      'Project Epsilon (Open, Stipend, Year 2 min, CSE only)',
      'Project Zeta (Open, No Stipend, BTP/MTP, MECH/EE)',
    ].sort())
  })

  it('Test 2: profKerberos filter', async () => {
    const projects = await getProjects({ profKerberos: 'prof1' })
    expect(projects.length).toBe(2)
    expect(projects.every(p => p.profKerberos === 'prof1')).toBe(true)
    expect(projects.map(p => p.title).sort()).toEqual([
        'Project Alpha (Open, Stipend, Recent)',
        'Project Epsilon (Open, Stipend, Year 2 min, CSE only)',
    ].sort())
  })

  it('Test 3: stipendProvided filter', async () => {
    let projects = await getProjects({ stipendProvided: true })
    expect(projects.length).toBe(2) // Alpha, Epsilon
    expect(projects.every(p => p.stipendProvided === true)).toBe(true)

    projects = await getProjects({ stipendProvided: false })
    expect(projects.length).toBe(2) // Beta, Zeta
    expect(projects.every(p => p.stipendProvided === false)).toBe(true)
  })
  
  it('Test 4: minYear filter', async () => {
    // minYear in DB <= filter.minYear (projects suitable for students of at least this year)
    // This seems counter-intuitive. The filter means "projects available to students of this year or higher"
    // So a project with minYear=1 should show if filter.minYear=1 or filter.minYear=2
    // A project with minYear=3 should NOT show if filter.minYear=2
    // The query is `minYear <= :minYear`. So if I filter for year 2 students, projects with minYear 1 and 2 should show.
    const projects = await getProjects({ minYear: 2 }) // Students in year 2
    expect(projects.length).toBe(3) // Alpha (1), Epsilon (2), Zeta (1) are <= 2
    expect(projects.map(p => p.title).sort()).toEqual([
        'Project Alpha (Open, Stipend, Recent)', // minYear 1
        'Project Epsilon (Open, Stipend, Year 2 min, CSE only)', // minYear 2
        'Project Zeta (Open, No Stipend, BTP/MTP, MECH/EE)', // minYear 1
    ].sort())

    const projectsForYear3 = await getProjects({ minYear: 3 })
    expect(projectsForYear3.length).toBe(4) // Alpha(1), Beta(3), Epsilon(2), Zeta(1)
  })

  it('Test 5: applyDateNotPassed filter', async () => {
    const projects = await getProjects({ applyDateNotPassed: true })
    expect(projects.length).toBe(3) // Alpha, Epsilon, Zeta have future apply dates
    expect(projects.every(p => new Date(p.lastApplyDate) >= today)).toBe(true)
     expect(projects.map(p => p.title).sort()).toEqual([
        'Project Alpha (Open, Stipend, Recent)',
        'Project Epsilon (Open, Stipend, Year 2 min, CSE only)',
        'Project Zeta (Open, No Stipend, BTP/MTP, MECH/EE)',
    ].sort())
  })

  it('Test 6: projectType filter', async () => {
    let projects = await getProjects({ projectType: 'sura' })
    expect(projects.length).toBe(2) // Alpha, Epsilon
    expect(projects.every(p => p.projectType.includes('sura' as ProjectType))).toBe(true)

    projects = await getProjects({ projectType: 'sura,btp' })
    expect(projects.length).toBe(4) // Alpha, Epsilon (sura), Beta (btp), Zeta (btp)
    expect(projects.some(p => p.projectType.includes('sura' as ProjectType))).toBe(true)
    expect(projects.some(p => p.projectType.includes('btp' as ProjectType))).toBe(true)
  })

  it('Test 7: duration filter', async () => {
    let projects = await getProjects({ duration: 'summer' })
    expect(projects.length).toBe(2) // Alpha, Epsilon
    expect(projects.every(p => p.duration.includes('summer' as ProjectDuration))).toBe(true)

    projects = await getProjects({ duration: 'summer,semester' })
    expect(projects.length).toBe(4) // Alpha, Epsilon (summer), Beta, Zeta (semester)
  })

  it('Test 8: eligibleDegrees filter', async () => {
    let projects = await getProjects({ eligibleDegrees: 'btech' })
    // Alpha (btech,mtech), Epsilon (btech), Zeta (btech,mtech,dual)
    expect(projects.length).toBe(3) 
    expect(projects.every(p => p.eligibleDegrees?.includes('btech' as DegreeCode))).toBe(true)

    projects = await getProjects({ eligibleDegrees: 'btech,dual' })
    // Alpha (btech,mtech), Epsilon (btech), Zeta (btech,mtech,dual), Beta (dual)
    expect(projects.length).toBe(4)
  })

  it('Test 9: eligibleDepartments filter', async () => {
    let projects = await getProjects({ eligibleDepartments: 'cse' })
    // Alpha (cse,ee), Epsilon (cse)
    expect(projects.length).toBe(2)
    expect(projects.every(p => p.eligibleDepartments?.includes('cse' as DeptCode))).toBe(true)

    projects = await getProjects({ eligibleDepartments: 'cse,mech' })
    // Alpha (cse,ee), Epsilon (cse), Beta (mech), Zeta (mech,ee)
    expect(projects.length).toBe(4)
  })
  
  it('Test 10: Combination of filters', async () => {
    const filters = {
      projectType: 'sura',
      stipendProvided: true,
      minYear: 1,
      eligibleDepartments: 'cse',
      applyDateNotPassed: true,
    }
    const projects = await getProjects(filters)
    // Should match Alpha and Epsilon
    // Alpha: sura, summer, [btech,mtech], [cse,ee], stipend=true, minYear=1, tomorrow, open, prof1
    // Epsilon: sura, summer, [btech], [cse], stipend=true, minYear=2, tomorrow, open, prof1
    expect(projects.length).toBe(2) 
    expect(projects.every(p => 
        p.projectType.includes('sura' as ProjectType) &&
        p.stipendProvided === true &&
        p.minYear! >= 1 && // project.minYear should be >= filter.minYear (typo in prev test comment)
                            // The query is `minYear <= :minYear`. So if filter.minYear=1, project.minYear must be <=1.
                            // This means the project is suitable for students UP TO year 'filter.minYear'.
                            // My sample data minYear means "minimum year student should be in".
                            // The query `project.minYear <= filter.minYear` is correct for "project is available to students in year X (filter) or below".
                            // However, the UI interpretation is "minimum student year", so a student in year `Y` sees projects with `minYear <= Y`.
                            // Let's assume `filter.minYear` means "the student's current year".
                            // So, projects shown should have `project.minYear <= student's current year`.
                            // The sample data has minYear 1 and 2. If student is year 1 (filter.minYear=1), only projects with project.minYear=1 show.
        p.eligibleDepartments?.includes('cse' as DeptCode) &&
        new Date(p.lastApplyDate) >= today
    )).toBe(true)
  })

   it('Test 10b: Combination of filters (minYear corrected interpretation)', async () => {
    // A student who is in year 1 (filter.minYear = 1)
    // should see projects that require AT MOST year 1 (project.minYear <= 1)
    const filters = {
      projectType: 'sura',
      stipendProvided: true,
      minYear: 1, // Student is in year 1
      eligibleDepartments: 'cse',
      applyDateNotPassed: true,
    }
    const projects = await getProjects(filters)
    // Alpha: sura, summer, [btech,mtech], [cse,ee], stipend=true, minYear=1, tomorrow, open, prof1
    // Epsilon: minYear=2, so it should NOT be included if student is year 1.
    expect(projects.length).toBe(1) 
    expect(projects[0].title).toBe('Project Alpha (Open, Stipend, Recent)')
  })


  it('Test 11: Filters resulting in No Projects', async () => {
    const filters = { projectType: 'nonexistent', profKerberos: 'prof1' }
    const projects = await getProjects(filters)
    expect(projects.length).toBe(0)
  })

  it('Test 12: getDrafts parameter includes draft projects', async () => {
    const projects = await getProjects({}, true) // getDrafts = true
    // Should include open (Alpha, Beta, Epsilon, Zeta) + draft (Gamma)
    expect(projects.length).toBe(5)
    expect(projects.some(p => p.projectStatus === 'draft')).toBe(true)
    expect(projects.find(p => p.title === 'Project Gamma (Draft, Stipend)')).toBeDefined()
  })
   it('Test 12b: getDrafts with other filters', async () => {
    const projects = await getProjects({ profKerberos: 'prof1' }, true)
    // Prof1 has Alpha (open), Epsilon (open), Gamma (draft)
    expect(projects.length).toBe(3)
    expect(projects.some(p => p.projectStatus === 'draft' && p.profKerberos === 'prof1')).toBe(true)
  })
})
