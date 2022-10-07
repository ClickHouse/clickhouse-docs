import React from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';
export default function NotFound() {
  return (
    <>
      <PageMetadata
        title={translate({
          id: 'theme.NotFound.title',
          message: 'Page Not Found',
        })}
      />
      <Layout>
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3 notfound">
              <h1 className="hero__title">
                  <font color="gray">Page Not Found</font>
              </h1>
              <p>
                  We could not find what you're looking for! Our docs have recently gone through a major reorganization, so it is possilbe that
                  the content still exists but the link was changed.
                  Try the <a href="https://clickhouse.com/docs/en/home/">docs home page</a> or using the search bar above to find what you are looking for.
              </p>
              <p>
                  Please open a Github issue at <a href="https://github.com/ClickHouse/clickhouse-docs/issues">https://github.com/ClickHouse/clickhouse-docs/issues</a> and let us know our link is broken.
              </p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
