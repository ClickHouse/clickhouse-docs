import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Link from '@docusaurus/Link';
import {useDocsSidebar} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

function DocsCategoryDropdown({ dropdownCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState({ top: '0px', left: '0px' });
  const dropdownMenuRef = useRef(null);
  const triggerRef = useRef(null); // Reference for the individual menu item trigger

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // Use useEffect to update the dropdown position when isOpen changes
  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownMenuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownRect = dropdownMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let left;
      if (triggerRect.left < viewportWidth / 3) {
        // Align to left
        left = triggerRect.left;
      } else if (triggerRect.left > (2 * viewportWidth) / 3) {
        // Align to right
        left = triggerRect.right - dropdownRect.width;
      } else {
        // Align to center
        left = triggerRect.left + (triggerRect.width / 2) - (dropdownRect.width / 2);
      }

      // Ensure the dropdown doesn't go off-screen
      left = Math.max(10, Math.min(left, viewportWidth - dropdownRect.width - 10));

      setDropdownStyles({
        top: `${triggerRect.bottom}px`, // Align the dropdown below the menu item
        left: `${left}px`               // Align the dropdown with the menu item
      });
    }
  }, [isOpen]); // This runs when the dropdown is opened

  let sidebar = null;

  // Safely call useDocsSidebar
  try {
    sidebar = useDocsSidebar();
  } catch (e) {
  }

  // Guard against undefined sidebar
  const isSelected = sidebar && sidebar.name && dropdownCategory
    ? sidebar.name === dropdownCategory.sidebar
    : false;

  return (
    <div
      className={styles.docsNavDropdownContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={styles.docsNavDropdownToolbarLink}
        ref={triggerRef} // Attach the ref to the individual link that triggers the dropdown
      >
        <Link className={`${styles.docsNavDropdownToolbarTopLevelLink} ${
            isSelected ? styles.docsNavSelected : ''
          }`} href={dropdownCategory.link}>{dropdownCategory.title}</Link> <DropdownCaret />
      </span>
      {isOpen && (
        <DropdownContent
          dropdownCategory={dropdownCategory}
          handleMouseLeave={handleMouseLeave}
          dropdownStyles={dropdownStyles} // Pass the dynamic styles to position the dropdown
          dropdownMenuRef={dropdownMenuRef} // Pass the ref to the dropdown content
        />
      )}
    </div>
  );
}

export const DocsCategoryDropdownLinkOnly = ({ title, link }) => {
  return (
    <div className={styles.docsNavDropdownContainer}>
      <Link href={link} className={styles.docsNavDropdownToolbarTopLevelLink}>{title}</Link>
    </div>
  );
}

const DropdownContent = ({ dropdownCategory, handleMouseLeave, dropdownStyles, dropdownMenuRef }) => {
  const [hovered, setHovered] = useState(null);
  const history = useHistory();

  const handleNavigation = (path) => {
    handleMouseLeave();
    history.push(path);
  };

  return (
    <div
      ref={dropdownMenuRef} // Ref for the dropdown menu
      className={styles.docsNavDropdownMenu}
      style={{ position: 'fixed', ...dropdownStyles }}
    >
      <div key={99} // 99 represents the root
            className={`${styles.docsNavMenuItem} ${hovered === 99 ? styles.docsNavHovered : ''}`}
            onMouseEnter={() => setHovered(99)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleNavigation(dropdownCategory.link)}
      >
        <div className={styles.docsNavMenuHeader}>{dropdownCategory.title}</div>
        <div className={styles.docsNavMenuDescription}>{dropdownCategory.description}</div>
      </div>
      <hr className={styles.docsNavMenuDivider} />
      <div className={styles.docsNavMenuItems}>
        {dropdownCategory.menuItems.map((item, index) => (
          <div
            key={index}
            className={`${styles.docsNavMenuItem} ${hovered === index ? styles.docsNavHovered : ''}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleNavigation(item.link)}
          >
            <div className={styles.docsNavItemTitle}>{item.title}</div>
            <div className={styles.docsNavItemDescription}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DropdownCaret = () => {
  const commonStyle = {
    width: '6px',
    height: '10px',
    fill: 'none',
    transition: 'all 0.3s ease',
    color: '#6B7280',
  };

  const rotatedIconStyle = {
    ...commonStyle,
    transform: 'rotate(90deg)',
  };

  return (
    <span style={{ marginLeft: '8px' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="6"
        height="10"
        viewBox="0 0 6 10"
        style={rotatedIconStyle}
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M1 9L5 5 1 1"
        />
      </svg>
    </span>
  );
};

export default DocsCategoryDropdown;
