import React from 'react';
import {useCollapsible, useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import {usePluginData} from "@docusaurus/useGlobalData";
import DropdownNavbarItem from "./DropdownNavbarItem";
import MobileMenuItem from "./MobileMenuItem";
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
// The primary menu displays the navbar items
export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {menuItems} = usePluginData("ch-header-plugin")
  return (
    <>
      <ul className="menu__list">
        {menuItems.map((item, i) => {
          if (item.menuItems) {
          return (
            <DropdownNavbarItem
              {...item}
              onClick={() => mobileSidebar.toggle()}
              key={i}
            />
          )
          }
          return (
            <li>
              <MobileMenuItem {...item} close={() => mobileSidebar.toggle()}/>
            </li>
          )
        })}
      </ul>
      <div className="nav-items-btns">
        <a href="https://clickhouse.cloud/signIn" className="sign-in ch-menu">
          <button className="click-button">Sign in</button>
        </a>
        <a href="https://clickhouse.cloud/signUp" className="click-button-anchor">
          <button className="click-button primary-btn">Get started</button>
        </a>
      </div>
    </>
  );
}
