import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Serverless ClickHouse',
    Svg: require('../../static/img/Instance@2x.png').default,
    url: 'https://clickhouse.com/cloud/',
    target2: '_blank',
    description: (
      <>
        Get started immediately! No infrastructure to manage, automatic scaling and world-class security
      </>
    ),
  },
  {
    title: 'Quick Start',
    Svg: require('../../static/img/Schedule@2x.png').default,
    url: 'quick-start',
    target2: '_self',
    description: (
      <>
        Download and run ClickHouse, create a database and table, and insert your data 
      </>
    ),
  },
  {
    title: 'Technical References',
    Svg: require('../../static/img/Docs@2x.png').default,
    url: 'en',
    target2: '_self',
    description: (
      <>
        Reference guides for SQL, functions, database engines, table engines, operations, building ClickHouse, and more
      </>
    ),
  },
];

function Feature({Svg, title, url, target2, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <a href={url} target={target2} ><img src={Svg} width="100px" alt={title} /></a>
      </div>
      <div className="text--center padding-horiz--md">
        <h3><a href={url} target={target2}>{title}</a></h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
