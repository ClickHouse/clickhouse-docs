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
      <ul className='ch-nav-v2-sub-nav-products ch-nav-v2-list'>
        <li>
          <NavigationLink
            href='https://clickhouse.com/cloud'
            onClick={galaxyOnClick('topNav.productMenu.cloudSelect')}
            className='nav-with-icon'>
            <div className='icon'>
              <IconClickhouse />
            </div>
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
            <div className='icon'>
              <IconClickhouseCloud />
            </div>
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

        <li className='ch-nav-v2-mobile-item'>
          <NavigationLink
            href='https://clickhouse.com/integrations'
            className='nav-with-icon'
            onClick={galaxyOnClick(
              'topNav.productMenu.integrationsHighlightSelect'
            )}>
            <div className='icon'>
              <IconIntegrations />
            </div>
            <span>View 100+ integrations</span>
          </NavigationLink>
        </li>
      </ul>
      <LinkWithArrow
        href='https://clickhouse.com/integrations'
        onClick={galaxyOnClick(
          'topNav.productMenu.integrationsHighlightSelect'
        )}
        style={{
          paddingLeft: '60px'
        }}
        className='ch-nav-v2-desktop-item ch-nav-v2-link-with-arrow'>
        View 100+ integrations
      </LinkWithArrow>
    </>
  )
}
