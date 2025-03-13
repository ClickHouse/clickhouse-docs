import React from 'react'
import { galaxyOnClick, useInitGalaxy } from '../../lib/galaxy/galaxy'
import { NavigationItem } from './parts'
import NavigationSubNavProducts from './sub-navs/NavigationSubNavProducts'
import NavigationSubNavResources from './sub-navs/NavigationSubNavResources'
import NavigationSubNavUseCases from './sub-navs/NavigationSubNavUseCases'
import { translate } from '@docusaurus/Translate';
import './styles.scss'

export default function Navigation({
  onItemClick,
  onItemClickOutside,
  onItemEnter,
  onItemLeave,
  className = '',
  ...props
}) {
  useInitGalaxy()

  const topLevelEvents = {
    onClick(...args) {
      if (onItemClick) onItemClick(...args)
    },
    onClickOutside(...args) {
      if (onItemClickOutside) onItemClickOutside(...args)
    },
    onMouseEnter(...args) {
      if (onItemEnter) onItemEnter(...args)
    },
    onMouseLeave(...args) {
      if (onItemLeave) onItemLeave(...args)
    }
  }

  return (
    <nav className={`ch-nav-v2 ${className}`} {...props}>
      <div>
        <ul>
          <li>
            <NavigationItem {...topLevelEvents} label={translate({
              id: 'topNav.navItems.Products',
              message: 'Products',
            })}>
              <NavigationSubNavProducts />
            </NavigationItem>
          </li>
          <li>
            <NavigationItem {...topLevelEvents} label={translate({
              id: 'topNav.navItems.Use cases',
              message: 'Use cases',
            })}>
              <NavigationSubNavUseCases />
            </NavigationItem>
          </li>
          <li>
            <NavigationItem
              {...topLevelEvents}
              label={translate({
                id: 'topNav.navItems.Docs',
                message: 'Docs',
              })}
              link={{
                href: 'https://clickhouse.com/docs',
                onClick: galaxyOnClick('topNav.navItems.docsSelect')
              }}
            />
          </li>
          <li>
            <NavigationItem {...topLevelEvents} label={translate({
              id: 'topNav.navItems.Resources',
              message: 'Resources',
            })}>
              <NavigationSubNavResources />
            </NavigationItem>
          </li>
          <li>
            <NavigationItem
              {...topLevelEvents}
              label={translate({
                id: 'topNav.navItems.Pricing',
                message: 'Pricing',
              })}
              link={{
                href: '/pricing',
                onClick: galaxyOnClick('topNav.navItems.pricingSelect')
              }}
            />
          </li>
          <li>
            <NavigationItem
              {...topLevelEvents}
              label={translate({
                id: 'topNav.navItems.Contact us',
                message: 'Contact us',
              })}
              link={{
                href: '/company/contact?loc=nav',
                onClick: galaxyOnClick('topNav.navItems.contactUsSelect')
              }}
            />
          </li>
        </ul>
      </div>
    </nav>
  )
}
