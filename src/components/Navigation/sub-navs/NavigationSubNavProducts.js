import React from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import LinkWithArrow from '../../LinkWithArrow'
import { NavigationLink } from '../parts'

import IconClickhouse from '@site/static/ch-nav-v2-images/icon-clickhouse.svg'
import IconClickhouseCloud from '@site/static/ch-nav-v2-images/icon-clickhouse-cloud.svg'
import IconIntegrations from '@site/static/ch-nav-v2-images/icon-integrations.svg'

export default function NavigationSubNavProducts() {
  return (
    <>
      <ul className='ch-nav-v2-sub-nav-products'>
        <li>
          <NavigationLink
            href='https://clickhouse.com/cloud'
            onClick={galaxyOnClick('topNav.productMenu.cloudSelect')}
            className='nav-with-icon'>
            <IconClickhouse />
            <span>
              ClickHouse Cloud
              <div className='nav-with-icon__description'>
                The best way to use ClickHouse.
                <br />
                Available on AWS, GCP, and Azure.
              </div>
            </span>
          </NavigationLink>
        </li>
        <li>
          <NavigationLink
            href='https://clickhouse.com/clickhouse'
            onClick={galaxyOnClick('topNav.productMenu.openSourceSelect')}
            className='nav-with-icon'>
            <IconClickhouseCloud />
            <span>
              ClickHouse
              <div className='nav-with-icon__description'>
                Spin up a database with open-
                <br />
                source ClickHouse.
              </div>
            </span>
          </NavigationLink>
        </li>

        <li className='mobile-item'>
          <NavigationLink
            href='https://clickhouse.com/integrations'
            className='nav-with-icon'
            onClick={galaxyOnClick(
              'topNav.productMenu.integrationsHighlightSelect'
            )}>
            <IconIntegrations />
            <span>View 100+ integrations</span>
          </NavigationLink>
        </li>
      </ul>
      <LinkWithArrow
        href='https://clickhouse.com/integrations'
        onClick={galaxyOnClick(
          'topNav.productMenu.integrationsHighlightSelect'
        )}
        className='hidden w-full rounded-b-lg border-t border-neutral-700 px-[60px] py-2.5 text-sm font-medium transition-colors hover:bg-neutral-700/25 hover:text-primary-300 md-mid:block'>
        View 100+ integrations
      </LinkWithArrow>
    </>
  )
}
