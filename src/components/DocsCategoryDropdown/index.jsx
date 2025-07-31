import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Link from "@docusaurus/Link";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { translate } from "@docusaurus/Translate";
import Translate from "@docusaurus/Translate";

import styles from "./styles.module.css";

function DocsCategoryDropdown({ dropdownCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState({
    top: "0px",
    left: "0px",
  });
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
        left =
          triggerRect.left + triggerRect.width / 2 - dropdownRect.width / 2;
      }

      // Ensure the dropdown doesn't go off-screen
      left = Math.max(
        10,
        Math.min(left, viewportWidth - dropdownRect.width - 10),
      );

      setDropdownStyles({
        top: `${triggerRect.bottom}px`, // Align the dropdown below the menu item
        left: `${left}px`, // Align the dropdown with the menu item
      });
    }
  }, [isOpen]); // This runs when the dropdown is opened

  let sidebar = null;

  // Safely call useDocsSidebar
  try {
    sidebar = useDocsSidebar();
  } catch (e) { }

  // Guard against undefined sidebar
  const isSelected =
    sidebar && sidebar.name && dropdownCategory
      ? sidebar.name === dropdownCategory.customProps.sidebar
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
        <Link
          className={`${styles.docsNavDropdownToolbarTopLevelLink} ${isSelected ? styles.docsNavSelected : ""
            }`}
          href={dropdownCategory.customProps.href}
        >
          <Translate
            id={`sidebar.dropdownCategories.category.${dropdownCategory.label}`}
            description={`Translation for ${dropdownCategory.label}`}
          >
            {dropdownCategory.label}
          </Translate>
        </Link>{" "}
        <DropdownCaret />
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
      <Link href={link} className={styles.docsNavDropdownToolbarTopLevelLink}>
        <span>{title}</span>
      </Link>
    </div>
  );
};

const DropdownContent = ({
  dropdownCategory,
  handleMouseLeave,
  dropdownStyles,
  dropdownMenuRef,
}) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      ref={dropdownMenuRef}
      className={styles.docsNavDropdownMenu}
      style={{ position: "fixed", ...dropdownStyles }}
    >
      <div
        key={99}
        className={`${styles.docsNavMenuItem} ${hovered === 99 ? styles.docsNavHovered : ""}`}
        onMouseEnter={() => setHovered(99)}
        onMouseLeave={() => setHovered(null)}
      >
        <Link
          to={dropdownCategory.customProps.href}
          className={styles.docsNavMenuHeader}
          onClick={handleMouseLeave}
        >
          <Translate
            id={`sidebar.dropdownCategories.category.${dropdownCategory.label}`}
            description={`Translation for ${dropdownCategory.label}`}
          >
            {dropdownCategory.label}
          </Translate>
        </Link>
        <div className={styles.docsNavMenuDescription}>
          <Translate
            id={`sidebar.dropdownCategories.category.description.${dropdownCategory.label}`}
            description={`Translation for ${dropdownCategory.label} description`}
          >
            {dropdownCategory.description}
          </Translate>
        </div>
      </div>
      <hr className={styles.docsNavMenuDivider} />
      <div className={styles.docsNavMenuItems}>
        {dropdownCategory.items.map((item, index) => (
          <div
            key={index}
            className={`${styles.docsNavMenuItem} ${hovered === index ? styles.docsNavHovered : ""}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to={item.href}
              className={styles.docsNavItemTitle}
              onClick={handleMouseLeave}
            >
              <Translate
                id={`sidebar.dropdownCategories.category.${dropdownCategory.label}.${item.label}`}
                description={`Translation for ${dropdownCategory.label}.${item.label}`}
              >
                {item.label}
              </Translate>

            </Link>
            <div className={styles.docsNavItemDescription}>
              <Translate
                id={`sidebar.dropdownCategories.category.${dropdownCategory.label}.${item.label}.description`}
                description={`Translation for ${dropdownCategory.label}.${item.label} description`}
              >
                {item.description}
              </Translate>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DropdownCaret = () => {
  const commonStyle = {
    width: "6px",
    height: "10px",
    fill: "none",
    color: "#6B7280",
  };

  const rotatedIconStyle = {
    ...commonStyle,
    transform: "rotate(90deg)",
  };

  return (
    <span style={{ marginLeft: "8px" }}>
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
