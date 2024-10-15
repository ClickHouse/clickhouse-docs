import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import styles from "./styles.module.css";

const GlobalMenu = ({ items }) => {
  return (
    <NavigationMenu.Root
      className={styles.navigationMenuRoot}
      delayDuration={0}
    >
      <NavigationMenu.List className={styles.navigationMenuList}>
        <>
          {items.map((menuItem) => {
            if (menuItem.href) {
              return (
                <NavigationMenu.Item key={menuItem.name}>
                  <NavigationMenu.Link
                    className={styles.navigationMenuTrigger}
                    href={menuItem.href}
                  >
                    {menuItem.name}
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              );
            } else if (
              menuItem.menuItems &&
              (menuItem?.menuItems ?? []).length > 0
            ) {
              return (
                <NavigationMenu.Item key={menuItem.name}>
                  <NavigationMenu.Trigger
                    className={styles.navigationMenuTrigger}
                  >
                    {menuItem.name}
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content
                    className={
                      menuItem.name === "Use cases"
                        ? styles.useCasesMenuContent
                        : styles.navigationMenuContent
                    }
                  >
                    <div
                      className={
                        menuItem.name === "Use cases"
                          ? styles.useCasesMenuContainer
                          : styles.menuItemContainer
                      }
                    >
                      {menuItem.menuItems.map((subMenuItem) => {
                        return (
                          <div
                            key={subMenuItem.name}
                            className={styles.menuItem}
                          >
                            <div className={styles.menuItemHeader}>
                              <ListItem
                                href={subMenuItem.href}
                                className={styles.subMenuItem}
                                data-header="true"
                              >
                                <div className={styles.deepMenuListItem}>
                                  {subMenuItem.name}
                                </div>
                              </ListItem>
                            </div>
                            <div>
                              {subMenuItem.menuItems.map((deepMenuItem) => {
                                return (
                                  <div key={deepMenuItem.name}>
                                    {deepMenuItem.icon ? (
                                      <ListItem
                                        href={deepMenuItem.href}
                                        key={deepMenuItem.name}
                                        className={styles.deepMenu}
                                      >
                                        <div className={styles.deepMenuContent}>
                                          <div
                                            className={styles.icon}
                                            style={{
                                              // @ts-ignore
                                              "--icon": `url(${deepMenuItem.icon})`,
                                            }}
                                          />
                                          <div className={styles.deepMenuText}>
                                            <div>{deepMenuItem.name}</div>
                                            <div
                                              className={styles.deepMenuDesc}
                                            >
                                              {deepMenuItem.description}
                                            </div>
                                          </div>
                                        </div>
                                      </ListItem>
                                    ) : (
                                      <ListItem
                                        href={deepMenuItem.href}
                                        key={deepMenuItem.name}
                                        target={deepMenuItem.target}
                                        className={styles.subMenuItem}
                                      >
                                        <div
                                          className={styles.deepMenuListItem}
                                        >
                                          {deepMenuItem.name}
                                        </div>
                                      </ListItem>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              );
            }
          })}
        </>

        <NavigationMenu.Indicator className={styles.navigationMenuIndicator}>
          <div className={styles.arrow} />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className={styles.viewportPosition}>
        <NavigationMenu.Viewport className={styles.navigationMenuViewport} />
      </div>
    </NavigationMenu.Root>
  );
};

const ListItem = React.forwardRef(
  ({ className, children, title, href, target, ...props }, forwardedRef) => {
    if (href) {
      return (
        <NavigationMenu.Link asChild>
          <a
            className={`${styles.linkStyle} ${className ?? ""}`}
            href={href}
            target={target}
            {...props}
            ref={forwardedRef}
          >
            {title && <div className={styles.fontMedium}>{title}</div>}
            <span>{children}</span>
          </a>
        </NavigationMenu.Link>
      );
    }
    return null;
  }
);

export default GlobalMenu;
