import React from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import LinkWithArrow from '../../LinkWithArrow'
import { NavigationLink } from '../parts'
import { translate } from '@docusaurus/Translate';

export default function NavigationSubNavUseCases() {
  return (
    <>
      <ul className='ch-nav-v2-sub-nav-use-cases ch-nav-v2-list'>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/real-time-analytics'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.realTimeAnalyticsSelect'
            )}>
            {translate({
              id: 'topNav.navItems.use_cases.Real-time analytics',
              message: 'Real-time analytics',
            })}
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/machine-learning-and-data-science'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.machineLearningSelect'
            )}>
            {translate({
              id: 'topNav.navItems.use_cases.Machine learning and GenAI',
              message: 'Machine learning and GenAI',
            })}
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/data-warehousing'
            onClick={galaxyOnClick('topNav.useCasesMenu.bizIntelSelect')}>
            {translate({
              id: 'topNav.navItems.use_cases.Business intelligence',
              message: 'Data warehousing',
            })}
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/observability'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.loggingAndMetricsSelect'
            )}>
            {translate({
              id: 'topNav.navItems.use_cases.Logs, events, and traces',
              message: 'Observability',
            })}
          </NavigationLink>
        </li>
        <li className='ch-nav-v2-mobile-item'>
          {/* This is the mobile link, the desktop link is futher down */}
          <NavigationLink
            href='https://clickhouse.com/use-cases'
            onClick={galaxyOnClick('topNav.useCasesMenu.allUseCasesSelect')}>
            {translate({
              id: 'topNav.navItems.use_cases.All use cases',
              message: 'All use cases',
            })}
          </NavigationLink>
        </li>
      </ul>

      {/* This is the desktop link, the mobile link is in the <ul> above */}
      <LinkWithArrow
        href='https://clickhouse.com/use-cases'
        onClick={galaxyOnClick('topNav.useCasesMenu.allUseCasesSelect')}
        className='ch-nav-v2-desktop-item ch-nav-v2-link-with-arrow'>
        {translate({
          id: 'topNav.navItems.use_cases.All use cases',
          message: 'All use cases',
        })}
      </LinkWithArrow>
    </>
  )
}
