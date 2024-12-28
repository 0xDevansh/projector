import React from 'react';
import { NavLink } from 'react-router';

export function Header() {
  return <header className='flex flex-row justify-around px-8 py-4'>
    <h1 className='text-xl font-bold'>Projects Portal (name WIP)</h1>
    <div className='space-x-8'>
      <NavLink to="/app">Home</NavLink>
      <NavLink to="/app/about">About</NavLink>
    </div>
  </header>
}