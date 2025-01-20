import React from 'react'
import { Link } from 'react-router'

export function About() {
  return (
    <div className="about">
      <title>About - Projects Portal</title>
      <p>
        The Projector is a central portal for projects under professors. This site is under construction, so please
        don't expect everything to work perfectly :)
      </p>
      <p>
        If you find a bug or want to request for a feature, feel free to
        <Link to="mailto:me2241111@mech.iitd.ac.in"> drop an email at me2241111@mech.iitd.ac.in</Link>
      </p>
    </div>
  )
}
