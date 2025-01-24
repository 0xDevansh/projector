import { Linkedin, Mail } from 'lucide-react'
import React from 'react'

const teamMembers = [
  {
    name: 'Devansh Kandpal',
    role: 'Lead Developer',
    image: 'https://media.licdn.com/dms/image/v2/D4D35AQEoRu_xd0XeHg/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1732652223564?e=1738353600&v=beta&t=Pb8fNlObX-Ycxfz-1OiQBZTw5bNu-aDcUcSm1CZeoYo',
    email: 'me2241111@mech.iitd.ac.in',
    linkedin: 'https://www.linkedin.com/in/devansh-kandpal/',
  },
  {
    name: 'Arush Bansal',
    role: 'Mentor',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQHyELYGX9ntjQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1721581443485?e=1743033600&v=beta&t=WRd6kOC5aUepCiHYRPAxOGsLvwfAbrdHMZSadH5wz_4',
    email: 'me2241111@mech.iitd.ac.in',
    linkedin: 'https://www.linkedin.com/in/arush-bansal/',
  },
]

export default function About() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="h2">About the Project Portal</h2>
        <p className="text-lg">

          This portal has been created by team Phoenix, with the collaboration of&nbsp;
          <a
            href="https://devclub.iitd.ac.in/"
            className="text-blue-800"
          >
            DevClub
          </a>
          {' '}
          and&nbsp;
          <a href="https://sac.iitd.ac.in/" className="text-blue-800">Student Affair's Council</a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-6 h3">Our Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <TeamMember key={member.name} {...member} />
          ))}
        </div>
      </section>

      <section className="bg-white px-7 py-5 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Contact Us</h2>
        <p className="mb-4">Have any questions or suggestions? Found a bug? (we're sure there might be some lurking) Feel free to contact us from any of the below options. New ideas are welcome, though keep in mind that this is a prototype version of the website.</p>
        <ul className="space-y-2">
          <li>
            <strong>Email:</strong>
            {' '}
            <a href="mailto:me2241111@mech.iitd.ac.in" className="text-indigo-600 hover:underline">
              me2241111@mech.iitd.ac.in
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}

function TeamMember({ name, role, image, email, linkedin }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <img
        src={image || '/placeholder.svg'}
        alt={name}
        width={150}
        height={150}
        className="rounded-full mx-auto mb-4"
      />
      <h3 className="text-lg font-semibold text-center mb-1">{name}</h3>
      <p className="text-slate-600 text-center mb-4">{role}</p>
      <div className="flex justify-center space-x-4">
        <a
          href={`mailto:${email}`}
          className="text-slate-600 hover:text-indigo-600 transition-colors"
          aria-label={`Email ${name}`}
        >
          <Mail className="w-5 h-5" />
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-indigo-600 transition-colors"
          aria-label={`${name}'s LinkedIn profile`}
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
