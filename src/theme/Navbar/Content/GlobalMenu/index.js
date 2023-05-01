import React from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import styles from './styles.module.css'

const GlobalMenu = ({
  items
                    }) => {
  return (
    <NavigationMenu.Root
      className={styles.navRoot}
      delayDuration={0}>
      <NavigationMenu.List className={styles.navListRoot}>
        <>
          {items.map((menuItem) => {
            if (menuItem.href) {
              return (
                <NavigationMenu.Item key={menuItem.name}>
                  <NavigationMenu.Link
                    className={styles.topLevelNavItem}
                    href={menuItem.href}>
                    {menuItem.name}
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              )
            } else if (
              menuItem.menuItems &&
              (menuItem?.menuItems ?? []).length > 0
            ) {
              return (
                <NavigationMenu.Item key={menuItem.name}>
                  <NavigationMenu.Trigger className={styles.topLevelNavItem}>
                    {menuItem.name}
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content className={styles.navContent}>
                    <div className={styles.menuItemContainer}>
                      {menuItem.menuItems.map((subMenuItem) => {
                        return (
                          <div
                            key={subMenuItem.name}
                            className='flex grow flex-col w-full'>
                            <div className='bg-neutral-725 bg-opacity-90 border-b border-neutral-700 border-opacity-40 mb-4'>
                              <ListItem
                                href={subMenuItem.href}
                                className='rounded-none bg-opacity-10 pl-4 group lg:min-w-[9.5rem]'>
                                <div
                                  data-size='sm'
                                  className='text-neutral-100 group-hover:text-neutral-0'
                                  data-weight='semibold'>
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
                                        className='mx-auto rounded-none group'>
                                        <div className='flex gap-4'>
                                          <img
                                            src={deepMenuItem.icon}
                                            alt={deepMenuItem.name}
                                            width={24}
                                            height={24}
                                          />
                                          <div className='flex flex-col gap-0.5'>
                                            <div size='sm'>
                                              {deepMenuItem.name}
                                            </div>
                                            <div
                                              weight='normal'
                                              size='sm'
                                              className='text-neutral-300 group-hover:text-neutral-0'>
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
                                        className='w-full pl-4 group'>
                                        <div
                                          weight='medium'
                                          size='sm'
                                          className='text-neutral-300 group-hover:text-neutral-0 whitespace-nowrap'>
                                          {deepMenuItem.name}
                                        </div>
                                      </ListItem>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              )
            }
          })}
        </>

        <NavigationMenu.Indicator className={styles.navIndicator}>
          <div className={styles.navIndicatorContent} />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className={styles.navMenuViewportContainer}>
        <NavigationMenu.Viewport className={styles.navMenuViewport} />
      </div>
    </NavigationMenu.Root>
  )
}

const ListItem = React.forwardRef(
  ({ className, children, title, href, target, ...props }, forwardedRef) => {
    if (href) {
      return (
        <NavigationMenu.Link asChild>
          <a
            className={`${styles.linkStyle} ${className??''}`}
            href={href}
            target={target}
            {...props}
            ref={forwardedRef}>
            <div className='font-medium'>{title}</div>
            <span>{children}</span>
          </a>
        </NavigationMenu.Link>
      )
    }
    return null
  }
)

export default GlobalMenu
