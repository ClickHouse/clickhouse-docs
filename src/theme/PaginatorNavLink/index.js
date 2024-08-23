import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'
export default function PaginatorNavLink(props) {
  const {permalink, title, subLabel, isNext} = props;
  return (
    <Link
      className={clsx(
        'pagination-nav__link',
        isNext ? 'pagination-nav__link--next' : 'pagination-nav__link--prev',
        styles.paginationNavLink
      )}
      to={permalink}>
      {!isNext && (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.2751 19.175L10.3251 18.125L5.4501 13.25H21.6001V11.75H5.4501L10.3251 6.87501L9.2751 5.82501L2.5751 12.5L9.2751 19.175Z" fill="currentColor"/>
        </svg>
      )}
      <div className={styles.paginationNavContent}>
        {subLabel && <div className="pagination-nav__sublabel">{subLabel}</div>}
        <div className={clsx(styles.paginationNavLabel, 'pagination-nav__label' )}>{title}</div>
      </div>
      {isNext && (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7249 19.175L13.6749 18.125L18.5499 13.25H2.3999V11.75H18.5499L13.6749 6.87501L14.7249 5.82501L21.4249 12.5L14.7249 19.175Z" fill="currentColor"/>
        </svg>
      )}
    </Link>
  );
}
