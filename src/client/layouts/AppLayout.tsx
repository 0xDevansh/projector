import { Header } from './Header.js'
import { Outlet } from 'react-router'
import React from 'react'

export default function AppLayout() {
return <div className="app">
  <Header />
  <Outlet />
</div>
}