import React from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import LinkWithArrow from '../../LinkWithArrow'
import { NavigationLink } from '../parts'

export default function NavigationSubNavUseCases() {
  return (
    <>
      <ul className='ch-nav-v2-sub-nav-use-cases'>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/real-time-analytics'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.realTimeAnalyticsSelect'
            )}>
            Real-time analytics
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/machine-learning-and-data-science'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.machineLearningSelect'
            )}>
            Machine learning and GenAI
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/business-intelligence'
            onClick={galaxyOnClick('topNav.useCasesMenu.bizIntelSelect')}>
            Business intelligence
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/use-cases/logging-and-metrics'
            onClick={galaxyOnClick(
              'topNav.useCasesMenu.loggingAndMetricsSelect'
            )}>
            Logs, events, and traces
          </NavigationLink>
        </li>
        <li className='mobile-item'>
          {/* This is the mobile link, the desktop link is futher down */}
          <NavigationLink
            href='https://clickhouse.com/use-cases'
            onClick={galaxyOnClick('topNav.useCasesMenu.allUseCasesSelect')}>
            All use cases
          </NavigationLink>
        </li>
      </ul>

      {/* This is the desktop link, the mobile link is in the <ul> above */}
      <LinkWithArrow
        href='https://clickhouse.com/use-cases'
        onClick={galaxyOnClick('topNav.useCasesMenu.allUseCasesSelect')}
        className='hidden w-full rounded-b-lg border-t border-neutral-700 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-700/25 hover:text-primary-300 md-mid:block'>
        All use cases
      </LinkWithArrow>
    </>
  )
}
