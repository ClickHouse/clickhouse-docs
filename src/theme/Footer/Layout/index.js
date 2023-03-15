import React from 'react';
import clsx from 'clsx';
import ColorModeToggler from '@site/src/components/ColorModeToggler'
import styles from './styles.module.css'

export default function FooterLayout({style, links, logo, copyright}) {
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      }, styles.footer)}>
      <div className={clsx(styles.container, "container container-fluid")}>
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
        <div className={styles.links}>{links}</div>
      </div>
      <ColorModeToggler />
    </footer>
  );
}
