import React from 'react';
import Link from '@docusaurus/Link';
import {NavbarSecondaryMenuFiller} from '@docusaurus/theme-common';
import SearchBar from "../../SearchBar";
import styles from './styles.module.css'

function BlogSidebarMobileSecondaryMenu({sidebar}) {
  return (
    <>
      <div className={styles.searchBarContainer}>
        <SearchBar/>
      </div>
      <ul className="menu__list">
        {sidebar.items.map((item) => (
          <li key={item.permalink} className="menu__list-item">
            <Link
              isNavLink
              to={item.permalink}
              className="menu__link"
              activeClassName="menu__link--active">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function BlogSidebarMobile(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
