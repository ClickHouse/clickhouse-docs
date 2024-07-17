import React from 'react'
import { useState } from 'react'
import { galaxyOnClick } from '../../../lib/galaxy/galaxy'
import { NavigationLink } from '../parts'
import NavigationChevron from '../parts/NavigationChevron'
import NavigationSubNav from '../parts/NavigationSubNav'

const SUBNAV_CLOSE_DELAY = 250

export default function NavigationSubNavResources() {
  const [activeSubNav, setActiveSubNav] = useState(null)

  const isSubNavActive = (name) => activeSubNav === name

  return (
    <ul className='ch-nav-v2-sub-nav-resources'>
      <li>
        <NavigationLink
          href='https://clickhouse.com/user-stories'
          onClick={galaxyOnClick('topNav.resourcesMenu.userStoriesSelect')}>
          User stories
        </NavigationLink>
      </li>
      <li>
        <NavigationLink
          href='https://clickhouse.com/blog'
          onClick={galaxyOnClick('topNav.resourcesMenu.blogSelect')}>
          Blog
        </NavigationLink>
      </li>
      <li
        onMouseEnter={() => {
          setActiveSubNav('learning')
        }}
        onMouseLeave={() => {
          setActiveSubNav(null)
        }}>
        <NavigationLink
          onClick={() => {
            setActiveSubNav(isSubNavActive('learning') ? null : 'learning')
          }}
          className={`${
            isSubNavActive('learning') ? 'active' : ''
          }`}>
          <span>Learning and Certification</span>
          <NavigationChevron
            className={
              isSubNavActive('learning')
                ? 'rotate-90 text-primary-300 md-mid:rotate-0'
                : 'text-neutral-500'
            }
          />
        </NavigationLink>
        <NavigationSubNav isOpen={isSubNavActive('learning')}>
          <li>
            <NavigationLink
              href='https://clickhouse.com/learn'
              onClick={galaxyOnClick('topNav.learnMenu.academySelect')}
              className='block w-full'>
              ClickHouse Academy
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/company/news-events?category=Free+Training#upcoming-events'
              onClick={galaxyOnClick('topNav.learnMenu.freeTrainingSelect')}
              className='block w-full'>
              Free live training
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/learn/certification'
              onClick={galaxyOnClick('topNav.learnMenu.certificationSelect')}
              className='block w-full'>
              ClickHouse Certification
            </NavigationLink>
          </li>
        </NavigationSubNav>
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
          className={`w-full items-center justify-between ${
            isSubNavActive('comparisons') ? 'active' : ''
          }`}>
          <span>Comparisons</span>
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
              BigQuery
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/postgresql'
              onClick={galaxyOnClick('topNav.comparisonsMenu.postgreSqlSelect')}
              className='block w-full'>
              PostgreSQL
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/redshift'
              onClick={galaxyOnClick('topNav.comparisonsMenu.redshiftSelect')}
              className='block w-full'>
              Redshift
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/rockset'
              onClick={galaxyOnClick('topNav.comparisonsMenu.rocksetSelect')}
              className='block w-full'>
              Rockset
            </NavigationLink>
          </li>
          <li>
            <NavigationLink
              href='https://clickhouse.com/comparison/snowflake'
              onClick={galaxyOnClick('topNav.comparisonsMenu.snowflakeSelect')}
              className='block w-full'>
              Snowflake
            </NavigationLink>
          </li>
        </NavigationSubNav>
      </li>
      <li>
        <NavigationLink
          href='https://clickhouse.com/videos'
          onClick={galaxyOnClick('topNav.resourcesMenu.videosSelect')}
          className='block w-full'>
          Videos
        </NavigationLink>
      </li>
      <li>
        <NavigationLink
          href='https://clickhouse.com/demos'
          onClick={galaxyOnClick('topNav.resourcesMenu.demosSelect')}
          className='block w-full'>
          Demos
        </NavigationLink>
      </li>
    </ul>
  )
}
