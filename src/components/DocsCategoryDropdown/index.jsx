import React, {useState} from 'react';
import { useHistory } from 'react-router-dom';
import styles from './styles.module.css';

function DocsCategoryDropdown({dropdownCategory}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div 
      className={styles.docsNavDropdownContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.docsNavDropdownToolbarLink}>{dropdownCategory.title} <DropdownCaret /></span>
      {isOpen && (
        <DropdownContent dropdownCategory={dropdownCategory} handleMouseLeave={handleMouseLeave} />
      )}
    </div>
  );
}

const DropdownContent = ({dropdownCategory, handleMouseLeave}) => {
  const [hovered, setHovered] = useState(null);
  const history = useHistory();

  const handleNavigation = (path) => {
    handleMouseLeave()
    history.push(path);
  };

  return (
    <div className={styles.docsNavDropdownMenu}>
      <div className={styles.docsNavMenuHeader}>{dropdownCategory.title}</div>
      <div className={styles.docsNavMenuDescription}>{dropdownCategory.description}</div>
      <hr className={styles.docsNavMenuDivider} />
      <div className={styles.docsNavMenuItems}>
        {dropdownCategory.menuItems.map((item, index) => (
          <div
            key={index}
            className={`${styles.docsNavMenuItem} ${hovered === index ? styles.docsNavHovered : ''}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              handleNavigation(item.link);
            }}
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
        style={rotatedIconStyle} // Makes the arrow point down
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
