import React from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import LinkWithArrow from '../../LinkWithArrow'
import { NavigationLink } from '../parts'
import { translate } from '@docusaurus/Translate';
import IconClickhouse from '@site/static/ch-nav-v2-images/icon-clickhouse.svg'
import IconClickhouseCloud from '@site/static/ch-nav-v2-images/icon-clickhouse-cloud.svg'
import IconClickhouseBYOC from '@site/static/ch-nav-v2-images/icon-cloud-byoc.svg'
import IconIntegrations from '@site/static/ch-nav-v2-images/icon-integrations.svg'
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function NavigationSubNavProducts() {
  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;
  return (
    <>
      <ul className='ch-nav-v2-sub-nav-products ch-nav-v2-list'>
        <li>
          <NavigationLink
            href='https://clickhouse.com/cloud'
            onClick={galaxyOnClick('topNav.productMenu.cloudSelect')}
            className='nav-with-icon'>
            <div className='icon'>
              <IconClickhouseCloud />
            </div>
            <span>
              ClickHouse Cloud
              <div className='nav-with-icon__description'>
                {translate({
                  id: 'topNav.navItems.products.clickhouse_cloud_1',
                  message: 'The best way to use ClickHouse.',
                })}
                <br />
                {translate({
                  id: 'topNav.navItems.products.clickhouse_cloud_2',
                  message: 'Available on AWS, GCP, and Azure.',
                })}
              </div>
            </span>
          </NavigationLink>
        </li>
        {currentLocale === 'en' && (
          <li>
            <NavigationLink
              href='https://clickhouse.com/cloud/bring-your-own-cloud'
              onClick={galaxyOnClick('topNav.productMenu.openSourceSelect')}
              className='nav-with-icon'>
              <div className='icon'>
                <IconClickhouseBYOC />
              </div>
              <span>
                {translate({
                  id: 'topNav.navItems.products.byoc_1',
                  message: 'Bring Your Own Cloud',
                })}
                <div className='nav-with-icon__description'>
                  {translate({
                    id: 'topNav.navItems.products.byoc_2',
                    message: 'A fully managed ClickHouse Cloud service,',
                  })}
                  <br />
                  {translate({
                    id: 'topNav.navItems.products.byoc_3',
                    message: 'deployed in your own AWS account.',
                  })}
                </div>
              </span>
            </NavigationLink>
          </li>
        )}
        <li>
          <NavigationLink
            href='https://clickhouse.com/clickhouse'
            onClick={galaxyOnClick('topNav.productMenu.openSourceSelect')}
            className='nav-with-icon'>
            <div className='icon'>
              <IconClickhouse />
            </div>
            <span>
              ClickHouse
              <div className='nav-with-icon__description'>
                {translate({
                  id: 'topNav.navItems.products.oss',
                  message: 'Spin up a database with open-source',
                })}
                <br />
                {translate({
                  id: 'topNav.navItems.products.oss_2',
                  message: 'ClickHouse',
                })}
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
            <span>
              {translate({
                id: 'topNav.navItems.products.integrations',
                message: 'View 100+ integrations',
              })}
            </span>
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
        {translate({
          id: 'topNav.navItems.products.integrations',
          message: 'View 100+ integrations',
        })}
      </LinkWithArrow>
    </>
  )
}
