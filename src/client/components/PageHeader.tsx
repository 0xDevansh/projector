import React from 'react'

export default function PageHeader({ title, path }: { title: string, path?: string }) {
  return (
    <div className="px-5 rounded-xl mb-5">
      <p>{path}</p>
      <h1 className="h2 lexend drop-shadow-lg">{title}</h1>
    </div>
  )
}
