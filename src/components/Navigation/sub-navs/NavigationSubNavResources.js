import React from 'react'
import { useState } from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import { NavigationLink } from '../parts'
import NavigationChevron from '../parts/NavigationChevron'
import NavigationSubNav from '../parts/NavigationSubNav'
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const SUBNAV_CLOSE_DELAY = 250

export default function NavigationSubNavResources() {
  const [activeSubNav, setActiveSubNav] = useState(null)
  const { i18n } = useDocusaurusContext();

  const isSubNavActive = (name) => activeSubNav === name
  const currentLocale = i18n.currentLocale;
  return (
    <ul className='ch-nav-v2-sub-nav-resources ch-nav-v2-list'>
      {currentLocale === 'en' && (
        <li>
          <NavigationLink
            href='https://clickhouse.com/user-stories'
            onClick={galaxyOnClick('topNav.resourcesMenu.userStoriesSelect')}>
            {translate({
              id: 'topNav.navItems.resources.User stories',
              message: 'User stories',
            })}
          </NavigationLink>
        </li>
      )}
      <li>
        <NavigationLink
          href='https://clickhouse.com/blog'
          onClick={galaxyOnClick('topNav.resourcesMenu.blogSelect')}>
          {translate({
            id: 'topNav.navItems.resources.Blog',
            message: 'Blog',
          })}
        </NavigationLink>
      </li>
      <li>
          <NavigationLink
            href='https://clickhouse.com/company/events'
            onClick={galaxyOnClick('topNav.resourcesMenu.eventsSelect')}>
            {translate({
                id: 'topNav.navItems.resources.Events',
                message: 'Events',
            })}
          </NavigationLink>
      </li>
      <li>
          <NavigationLink
              href='https://clickhouse.com/learn'
              onClick={galaxyOnClick('topNav.resourcesMenu.learnSelect')}>
              {translate({
                  id: 'topNav.navItems.resources.Learn',
                  message: 'Learning and certification',
              })}
          </NavigationLink>
      </li>
      <li
        onMouseEnter={() => {
          setActiveSubNav('comparisons')
        }}
        onMouseLeave={() => {
          setActiveSubNav(null)
        }}>
        <NavigationLink
          onClick={() => {
            setActiveSubNav(
              isSubNavActive('comparisons') ? null : 'comparisons'
            )
          }}
          className={`w-full items-center justify-between ${isSubNavActive('comparisons') ? 'active' : ''
            }`}>
          <span>{translate({
            id: 'topNav.navItems.resources.Comparisons',
            message: 'Comparisons',
          })}</span>
          <NavigationChevron
            className={
              isSubNavActive('comparisons')
                ? 'rotate-90 text-primary-300 md-mid:rotate-0'
                : 'text-neutral-500'
            }
          />
        </NavigationLink>
        <NavigationSubNav isOpen={isSubNavActive('comparisons')}>
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/bigquery'
              onClick={galaxyOnClick('topNav.comparisonsMenu.bigQuerySelect')}
              className='block w-full'>
              {translate({
                id: 'topNav.navItems.resources.BigQuery',
                message: 'BigQuery',
              })}
            </NavigationLink>
          </li>
          {currentLocale === 'en' && (
            <li>
              <NavigationLink
                href='https://clickhouse.com/comparison/postgresql'
                onClick={galaxyOnClick('topNav.comparisonsMenu.postgreSqlSelect')}
                className='block w-full'>
                {translate({
                  id: 'topNav.navItems.resources.PostgreSQL',
                  message: 'PostgreSQL',
                })}
              </NavigationLink>
            </li>
          )}
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/redshift'
              onClick={galaxyOnClick('topNav.comparisonsMenu.redshiftSelect')}
              className='block w-full'>
              {translate({
                id: 'topNav.navItems.resources.Redshift',
                message: 'Redshift',
              })}
            </NavigationLink>
          </li>
          {currentLocale === 'en' && (
            <li>
              <NavigationLink
                href='https://clickhouse.com/comparison/rockset'
                onClick={galaxyOnClick('topNav.comparisonsMenu.rocksetSelect')}
                className='block w-full'>
                {translate({
                  id: 'topNav.navItems.resources.Rockset',
                  message: 'Rockset',
                })}
              </NavigationLink>
            </li>
          )}
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/snowflake'
              onClick={galaxyOnClick('topNav.comparisonsMenu.snowflakeSelect')}
              className='block w-full'>
              {translate({
                id: 'topNav.navItems.resources.Snowflake',
                message: 'Snowflake',
              })}
            </NavigationLink>
          </li>
        </NavigationSubNav>
      </li>
      <li>
        <NavigationLink
          href='https://clickhouse.com/videos'
          onClick={galaxyOnClick('topNav.resourcesMenu.videosSelect')}
          className='block w-full'>
          {translate({
            id: 'topNav.navItems.resources.Videos',
            message: 'Videos',
          })}
        </NavigationLink>
      </li>
      <li>
        <NavigationLink
          href='https://clickhouse.com/demos'
          onClick={galaxyOnClick('topNav.resourcesMenu.demosSelect')}
          className='block w-full'>
          {translate({
            id: 'topNav.navItems.resources.Demos',
            message: 'Demos',
          })}
        </NavigationLink>
      </li>
    </ul>
  )
}
