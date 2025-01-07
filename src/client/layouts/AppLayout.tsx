import React from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header.js'

export default function AppLayout() {
  return (
    <div className="app">
      <Header />
      <Outlet />
    </div>
  )
}
