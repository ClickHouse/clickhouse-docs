import React from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';

export default function NotFound() {
  if (window && window.location.pathname === '/') {
    window.location.pathname = '/docs'
    return <div />
  }

  return (
    <>
      <PageMetadata
        title={translate({
          id: 'theme.NotFound.title',
          message: 'Page not found',
        })}
      />
      <Layout>
        <main className="container margin-vert--xl" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
          <div className="row" style={{ width: '600px'}}>
            <div className="col col--6 col--offset-3 notfound">
              <h1>Ruh-roh! We can't find that page. 😬</h1>
              <p>
                  If this page should exist, <a href="https://github.com/ClickHouse/clickhouse-docs/issues">please open a Github issue</a> and let us know a link is broken.
              </p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
