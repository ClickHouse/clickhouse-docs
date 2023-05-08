import React from 'react';
import {Collapsible, useCollapsible} from "@docusaurus/theme-common";
import clsx from "clsx";
import MobileMenuItem from "./MobileMenuItem";
import NavbarNavLink from '@theme/NavbarItem/NavbarNavLink';

function DropdownNavbarItem({
                              menuItems,
  name,
                              className,
                              position, // Need to destructure position from props so that it doesn't get passed on.
                              onClick,
                              ...props
                            }) {
  const {collapsed, toggleCollapsed} = useCollapsible({
    initialState: true,
  });
  
  return (
    <li
      className={clsx('menu__list-item', {
        'menu__list-item--collapsed': collapsed,
      })}>
      <NavbarNavLink
        role="button"
        className={clsx(
          'menu__link menu__link--sublist menu__link--sublist-caret',
          className,
        )}
        label={name}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}>
        {name}
      </NavbarNavLink>
      <Collapsible lazy className="menu__list" collapsed={collapsed}>
        <MobileMenuItem
          menuItems={menuItems}
          close={() => toggleCollapsed()}
        />
      </Collapsible>
    </li>
  );
}

export default DropdownNavbarItem;