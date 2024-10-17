import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import Logo from '@theme/Logo';
import CollapseButton from '@theme/DocSidebar/Desktop/CollapseButton';
import Content from '@theme/DocSidebar/Desktop/Content';
import styles from './styles.module.css';
import SearchBar from "../../SearchBar";
function DocSidebarDesktop({path, sidebar, onCollapse, isHidden, ...props}) {
  const {
    navbar: {hideOnScroll},
    docs: {
      sidebar: {hideable},
    },
  } = useThemeConfig();

  const sidebarRef = useRef(null);

  console.log(sidebarRef)

  useEffect(() => {
    // Get the current active link
    const activeLink = sidebarRef.current?.querySelector('.menu__link--active');
    
    if (activeLink) {
      const linkRect = activeLink.getBoundingClientRect();
      const isVisible = (
        linkRect.top >= 0 && 
        linkRect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
    
      // Only scroll if the link is not already in view
      if (!isVisible) {
        activeLink.scrollIntoView({
          behavior: 'smooth',
          block: 'center', // 'start' or 'end' depending on where you want the link
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
      )}
        style={{position: 'fixed'}}
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
