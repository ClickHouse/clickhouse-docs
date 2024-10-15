import React from 'react'
import Nbsp from '../Nbsp'
import styles from './styles.module.scss'

export default function LinkWithArrow({
  children,
  className = '',
  ...props
}) {
  return (
    <a {...props} className={`${styles.LinkWithArrow} ${className}`}>
      {children}
      <Nbsp />
      <span className={styles.LinkWithArrow__Arrow}>
        <span className={styles.LinkWithArrow__ArrowGhost}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className={styles.LinkWithArrow__ArrowSvg}>
              <path fill="currentColor" fillRule="nonzero"
                    d="m8.613.21.094.083 7 7c.029.028.055.059.08.09l-.08-.09a1.008 1.008 0 0 1 .292.675L16 8v.033l-.004.052L16 8a1.008 1.008 0 0 1-.22.625l-.073.082-7 7a1 1 0 0 1-1.497-1.32l.083-.094L12.585 9H1a1 1 0 0 1-.117-1.993L1 7h11.585L7.293 1.707A1 1 0 0 1 7.21.387l.083-.094A1 1 0 0 1 8.613.21Z"/>
          </svg>
        </span>
        <span className={styles.LinkWithArrow__ArrowVisible}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className={styles.LinkWithArrow__ArrowSvg}>
              <path fill="currentColor" fillRule="nonzero"
                    d="m8.613.21.094.083 7 7c.029.028.055.059.08.09l-.08-.09a1.008 1.008 0 0 1 .292.675L16 8v.033l-.004.052L16 8a1.008 1.008 0 0 1-.22.625l-.073.082-7 7a1 1 0 0 1-1.497-1.32l.083-.094L12.585 9H1a1 1 0 0 1-.117-1.993L1 7h11.585L7.293 1.707A1 1 0 0 1 7.21.387l.083-.094A1 1 0 0 1 8.613.21Z"/>
          </svg>
        </span>
      </span>
    </a>
  )
}
