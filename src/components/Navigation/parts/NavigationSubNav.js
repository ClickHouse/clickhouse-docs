import React from 'react'
export default function NavigationSubNav({
  isOpen,
  children
}) {
  return (
    <ul
      className={`ch-nav-v2-sub-nav ${isOpen ? 'open' : ''}`}>
      {children}
    </ul>
  )
}
