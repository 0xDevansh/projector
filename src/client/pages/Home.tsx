import { BookOpen, Briefcase, UserPlus } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import { Button } from '../components/ui/button.js'
import { useToast } from '../hooks/use-toast.js'
import { loginLink } from '../layouts/Header'

export function Home() {
  const ctx = React.useContext(AuthContext)
  const navigate = useNavigate()
  const { toast } = useToast()
  const onPostProject = () => {
    if (!ctx?.isLoggedIn || !ctx?.user) {
      window.location.href = loginLink
    }
    else if (ctx?.user.type === 'student') {
      toast({ title: 'You are not a professor :)' })
    }
    else {
      navigate('/app/projects/create')
    }
  }
  return (
    <div className="home">
      <title>Home - Projects Portal</title>

      <div className="space-y-12 mt-5">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4 lexend">Welcome to Projects Portal</h1>
          <p className="text-xl font-semibold text-slate-600 max-w-2xl mx-auto">
            We help professors and students collaborate for innovative research projects.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-indigo-700" />}
            title="Professors"
            description="Post your research projects and find talented students to collaborate with."
            action={{
              text: 'Post a Project',
              handler: onPostProject,
            }}
          />
          <FeatureCard
            icon={<UserPlus className="w-8 h-8 text-indigo-700" />}
            title="Students"
            description="Discover exciting research opportunities and apply to projects that match your interests."
            action={{
              text: 'Browse Projects',
              href: '/app/projects',
            }}
          />
          <FeatureCard
            icon={<Briefcase className="w-8 h-8 text-indigo-700" />}
            title="Collaboration"
            description="Work together on groundbreaking research and gain valuable academic experience."
            action={{
              text: 'Learn More',
              href: '/app/about',
            }}
          />
        </section>

        <section className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4 text-slate-700">
            <li>Professors post research projects with detailed descriptions and requirements.</li>
            <li>Students browse available projects and submit applications to those that interest them.</li>
            <li>Professors review applications and select suitable candidates for their projects.</li>
          </ol>
        </section>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, action }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-full">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{description}</p>
      {action.handler && (
        <Button
          onClick={action.handler}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700"
        >
          {action.text}
        </Button>
      )}
      {action.href && (
        <Link
          to={action.href}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700"
        >
          {action.text}
        </Link>
      )}
    </div>
  )
}
