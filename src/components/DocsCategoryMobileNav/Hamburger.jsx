import React from 'react';
import styles from '../DocsCategoryMobileNav/styles.module.css'

const Hamburger = ({onClick}) =>
{
  return(
      <svg className={styles.docsNavBurger}
           width="30"
           height="30"
           viewBox="0 0 30 30"
           aria-hidden="true"
           onClick={onClick}
      >
        <path stroke="currentColor" stroke-linecap="round"
              stroke-miterlimit="10"
              stroke-width="2" d="M4 7h22M4 15h22M4 23h22"></path>
      </svg>
  );
}

export default Hamburger;