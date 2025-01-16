import React from 'react'
import { Link } from 'react-router'

export default function StudentHomePage() {
  return (
    <h1 className="text-lg">
      Check out the open projects
      <Link to="/app/projects" className="text-blue-700"> here</Link>
    </h1>
  )
}
