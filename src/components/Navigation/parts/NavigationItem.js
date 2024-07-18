import React from 'react'
import { useEffect, useRef, useState } from 'react'
import useClickOutside from '../../../hooks/useClickOutside'
import NavigationChevron from './NavigationChevron'
import NavigationLink from './NavigationLink'

export default function NavigationItem({
  label,
  href,
  link,
  children,
  className = '',
  onClick = (item, children, isOpen) => {},
  onClickOutside = (item, children, isOpen) => {},
  onMouseEnter = (item, children, isOpen) => {},
  onMouseLeave = (item, children, isOpen) => {},
  open = false,
  ...props
}) {
  const hasChildren = !!children
  const itemRef = useRef(null)
  const linkRef = useRef(null)
  const childrenRef = useRef(null)
  const [isOpen, setIsOpen] = useState(open)

  const onClickInside = (event) => {
    let openVal = isOpen
    if (children) {
      event.preventDefault();

      if (!openVal) {
        openVal = true
      } else if (linkRef.current?.contains(event.target)) {
        openVal = false
      }
      setIsOpen(openVal)
    }
    onClick(itemRef, children, openVal)
  }

  useClickOutside(itemRef, () => {
    setIsOpen(false)
    onClickOutside(itemRef, children, false)
  })

  const mouseEnter = (event) => {
    setIsOpen(true)
    onMouseEnter(itemRef, children, true)
  }

  const mouseLeave = (event) => {
    setIsOpen(false)
    onMouseEnter(itemRef, children, false)
  }

  const { className: linkClassName, ...linkProps } =
    link || ({ href })

  useEffect(() => {
    const resizeHandler = () => {
      if (childrenRef.current && isOpen) {
        childrenRef.current.style.left = ''

        const rect = childrenRef.current?.getBoundingClientRect()

        if (rect.right > window.innerWidth) {
          childrenRef.current.style.left = `${
            childrenRef.current.offsetLeft -
            (rect.right - window.innerWidth + 5)
          }px`
        }
      }
    }

    window.addEventListener('resize', resizeHandler)
    if (isOpen) resizeHandler()

    return () => window.removeEventListener('resize', resizeHandler)
  }, [childrenRef, isOpen])

  return (
    <div
      className={`ch-nav-v2-item ${className}`}
      ref={itemRef}
      onClick={onClickInside}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      {...props}>
      <NavigationLink
        ref={linkRef}
        {...linkProps}
        isHovered={isOpen}
        className={`${
          !href && !link && !hasChildren ? 'no-link' : ''
        } ${hasChildren ? 'has-children' : ''} ${
          isOpen ? 'open' : ''
        } ${linkClassName}`}>
        <span>{label}</span>
        {hasChildren && (
          <span className='chevron'>
            {/* Mobile */}
            <NavigationChevron
              className={`mobile-chevron ${isOpen ? 'open' : ''}`}
              direction={isOpen ? 'down' : 'right'}
            />

            {/* Desktop */}
            <NavigationChevron
              className={`desktop-chevron ${isOpen ? 'open' : ''}`}
              direction='down'
            />
          </span>
        )}
      </NavigationLink>
      {hasChildren && (
        <div
          ref={childrenRef}
          className={`ch-nav-v2-item__children ${isOpen ? 'open' : ''}`}>
          <div
            className={`${isOpen ? 'open' : ''}`}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
