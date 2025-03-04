import React from 'react'

export default function PageHeader({ title, path }: { title: string, path?: string }) {
  return (
    <div className="rounded-xl mb-5">
      <p>{path}</p>
      <h1 className="h4 md:h2 lexend drop-shadow-lg">{title}</h1>
    </div>
  )
}
