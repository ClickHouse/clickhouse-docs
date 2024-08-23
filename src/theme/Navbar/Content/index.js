import React from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ScrollableElement from "../../ScrollableElement";
import ColorModeToggle from "../../../components/ColorModeToggler";
import { usePluginData } from "@docusaurus/useGlobalData";
import GlobalMenu from "./GlobalMenu";
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}

function useNavbarSecondaryItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useDocusaurusContext().siteConfig.customFields.secondaryNavItems ?? [];
}

function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <NavbarItem {...item} key={i} />
      ))}
    </>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const secondaryItems = useNavbarSecondaryItems();
  const [secLeftItems, secRightItems] = splitNavbarItems(secondaryItems);

  const {
    github: { stars },
    menuItems,
  } = usePluginData("ch-header-plugin");

  return (
    <div className={`${styles.navbarHeaderContainer} navbar-header`}>
      <div className={clsx("navbar__inner", styles.navbarInner)}>
        <div className={styles.navbarLogo}>
          <NavbarLogo />
        </div>
        <GlobalMenu items={menuItems} />

        <div className={styles.navRight}>
          <a
            key="github-stars-nav"
            href="https://github.com/ClickHouse/ClickHouse?utm_source=clickhouse&utm_medium=website&utm_campaign=website-nav"
            target="_blank"
            className={styles.githubStars}
          >
            <div className={styles.githubStarsContainer}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 1.75C4.27062 1.75 1.25 4.77062 1.25 8.5C1.25 11.4869 3.18219 14.0097 5.86531 14.9041C6.20281 14.9631 6.32937 14.7606 6.32937 14.5834C6.32937 14.4231 6.32094 13.8916 6.32094 13.3263C4.625 13.6384 4.18625 12.9128 4.05125 12.5331C3.97531 12.3391 3.64625 11.74 3.35938 11.5797C3.12312 11.4531 2.78562 11.1409 3.35094 11.1325C3.8825 11.1241 4.26219 11.6219 4.38875 11.8244C4.99625 12.8453 5.96656 12.5584 6.35469 12.3813C6.41375 11.9425 6.59094 11.6472 6.785 11.4784C5.28312 11.3097 3.71375 10.7275 3.71375 8.14563C3.71375 7.41156 3.97531 6.80406 4.40563 6.33156C4.33812 6.16281 4.10187 5.47094 4.47312 4.54281C4.47312 4.54281 5.03844 4.36563 6.32937 5.23469C6.86937 5.08281 7.44313 5.00687 8.01688 5.00687C8.59063 5.00687 9.16438 5.08281 9.70438 5.23469C10.9953 4.35719 11.5606 4.54281 11.5606 4.54281C11.9319 5.47094 11.6956 6.16281 11.6281 6.33156C12.0584 6.80406 12.32 7.40312 12.32 8.14563C12.32 10.7359 10.7422 11.3097 9.24031 11.4784C9.485 11.6894 9.69594 12.0944 9.69594 12.7272C9.69594 13.63 9.6875 14.3556 9.6875 14.5834C9.6875 14.7606 9.81406 14.9716 10.1516 14.9041C12.8178 14.0097 14.75 11.4784 14.75 8.5C14.75 4.77062 11.7294 1.75 8 1.75Z"
                  fill="currentColor"
                />
              </svg>

              <span className={styles.githubText}>
                {Intl.NumberFormat("en", {
                  notation: "compact",
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
                  .format(stars)
                  .toLowerCase()}
              </span>
            </div>
          </a>
          <a
            href="https://clickhouse.cloud/signIn?loc=docs-nav-signIn-cta"
            className={clsx("sign-in navbar__link ch-menu", styles.signIn)}
          >
            Sign in
          </a>
          <a
            href="https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta"
            className="click-button-anchor"
          >
            <button className="click-button primary-btn">Get started</button>
          </a>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        </div>
      </div>
      <div className={clsx("secondary-nav--items", styles.secondaryMenu)}>
        <ScrollableElement
          className={`${styles.secondaryMenuLeft} secondary-nav--items-left`}
        >
          <NavbarItems items={secLeftItems} />
        </ScrollableElement>

        <div
          className={`${styles.secondaryMenuRight} secondary-nav--items-right`}
        >
          <NavbarItems items={secRightItems} />
          <ColorModeToggle className="navbar-color-toggle" />
        </div>
      </div>
    </div>
  );
}
