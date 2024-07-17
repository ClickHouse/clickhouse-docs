import React from 'react'
import Nbsp from '../Nbsp'

export default function LinkWithArrow({
  children,
  className = '',
  ...props
}) {
  return (
    <a {...props} className={`group/linkWithArrow ${className}`}>
      {children}
      <Nbsp />
      <span className='relative whitespace-nowrap'>
        <span className='opacity-0'>-&gt;</span>
        <span className='absolute left-0 top-1/2 block -translate-y-1/2 transition-all group-hover/linkWithArrow:indent-1'>
          -&gt;
        </span>
      </span>
    </a>
  )
}
