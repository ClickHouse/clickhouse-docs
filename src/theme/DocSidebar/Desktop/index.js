import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import Logo from '@theme/Logo';
import CollapseButton from '@theme/DocSidebar/Desktop/CollapseButton';
import Content from '@theme/DocSidebar/Desktop/Content';
import styles from './styles.module.scss';
import SearchBar from "../../SearchBar";
function DocSidebarDesktop({path, sidebar, onCollapse, isHidden, ...props}) {
  const {
    navbar: {hideOnScroll},
    docs: {
      sidebar: {hideable},
    },
  } = useThemeConfig();

  const sidebarRef = useRef(null);

  useEffect(() => {
    // Get all current active links
    const activeLinks = sidebarRef.current?.querySelectorAll('.menu__link--active');
    // last entry should be deepest
    const activeLink = activeLinks[activeLinks.length - 1];
    if (activeLink) {
      const linkRect = activeLink.getBoundingClientRect();
      const isVisible = (
        linkRect.top >= 0 && 
        linkRect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
    
      // Only scroll if the link is not already in view
      if (!isVisible) {
        activeLink.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        });
      }
    }
  }, [path]);

  return (
    <div
      ref={sidebarRef}
      className={clsx(
        styles.sidebar,
        hideOnScroll && styles.sidebarWithHideableNavbar,
        isHidden && styles.sidebarHidden,
        'padding-top--md'
      )}
      >
      {hideOnScroll && <Logo tabIndex={-1} className={styles.sidebarLogo} />}
      <div className={styles.sidebarSearchContainer}>
        <SearchBar />
      </div>
      <Content path={path} sidebar={sidebar} />
      {hideable && <CollapseButton onClick={onCollapse} />}
    </div>
  );
}
export default React.memo(DocSidebarDesktop);
