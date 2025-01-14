import React, { forwardRef } from 'react'
const NavigationLink = forwardRef(
  function NavigationLink(
    { className = '', href = '', children, isHovered = false, ...props },
    ref
  ) {
    return (
      <a
        ref={ref}
        href={href}
        {...props}
        className={`ch-nav-v2-link ${className} ${isHovered ? 'hover' : ''}`}>
        {children}
      </a>
    )
  }
)

export default NavigationLink
