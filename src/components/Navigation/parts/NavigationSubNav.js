import React from 'react'
export default function NavigationSubNav({
  isOpen,
  children
}) {
  return (
    <ul
      className={`ch-nav-v2-sub-nav ch-nav-v2-list ${isOpen ? 'open' : ''}`}>
      {children}
    </ul>
  )
}
