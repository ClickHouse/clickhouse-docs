import React from 'react'

export default function NavigationChevron({
  direction = 'right',
  className = '',
  ...props
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='6'
      height='10'
      fill='none'
      viewBox='0 0 6 10'
      className={`ch-nav-v2-chevron ${direction} ${className}`}
      {...props}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m1 9 4-4-4-4'
      />
    </svg>
  )
}
