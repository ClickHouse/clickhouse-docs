import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg button--docs"
            to="/en/intro">
            Documentation
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://clickhouse.com/cloud/">
            Try ClickHouse
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <div className="homepage-wrapper">
    <Layout
      title={`ClickHouse Documentation`}
      description="The official ClickHouse documentation website">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
    </div>
  );
}
