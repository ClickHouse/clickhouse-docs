import React from 'react'
import styles from './styles.module.css'
import useBaseUrl from "@docusaurus/core/lib/client/exports/useBaseUrl";

function MobileMenuItem({
  href,
  name,
  target = '_self',
  menuItems = [],
  close
}) {
  if (href && menuItems.length === 0) {
    return (
      <a
        key={name}
        href={href}
        target={target}
        className='menu__link'>
        {name}
      </a>
    )
  }

  if (menuItems.length > 0) {
    return (
      <div className={styles.collapseContainer}>
        {menuItems.map((subitem) => {
          if (subitem.menuItems && subitem.menuItems.length > 0) {
            // @ts-ignore
            // @ts-ignore
            return (
              <div className={styles.subMenu}>
                {subitem.name && (
                  <div className={styles.subItemName}>{subitem.name}</div>
                )}
                {subitem.menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={close}
                    className='menu__link'
                    data-hasitems={true}
                  >
                    <div
                      className={styles.menuItem}
                      data-icon={item.icon ? 'true' : 'false'}>
                      {item.icon && (
                        <div className={styles.icon} style={{
                          // @ts-ignore
                          "--icon": `url(${item.icon})`
                        }} />
                      )}
                      <div className={styles.itemContainer}>
                        <div
                          data-color='primary'
                          data-icon={item.icon && item.icon.length > 0}
                          className={styles.name}
                          data-weight={item.icon ? 'normal' : 'medium'}>
                          {item.name}
                        </div>
                        {item.description && (
                          <div
                            data-size='sm'
                            data-color='secondary'
                            data-weight='normal'
                            className='mt-1'>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )
          } else if (subitem?.href) {
            return (
              <a
                key={subitem.name}
                href={subitem.href}
                className='menu__link'>
                {subitem.name}
              </a>
            )
          }
          return null
        })}
      </div>
    )
  }

  return null
}

export default MobileMenuItem
