import React from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import BlogBreadcrumbs from "../../components/BlogBreadcrumbs/BlogBreadcrumbs";
import { useHistory } from 'react-router-dom';
import Translate from "@docusaurus/Translate";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';

function BlogListPageMetadata(props) {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props) {

  const history = useHistory()
  const { metadata, items, sidebar } = props;
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();

  return (
    <BlogLayout sidebar={sidebar}>
      <BlogBreadcrumbs />
      <h1 className={styles.kbTitle}>
        <Translate id={`theme.blog.title`} description={`Translation for Knowledge Base`}>Knowledge Base</Translate>
      </h1>
      <ButtonGroup
        onClick={function Nav(value) {
          if (typeof window !== 'undefined') {
            value === 'recent' ? history.push(`/docs/knowledgebase`) : history.push(`/docs/knowledgebase/tags`)
          }
        }}
        options={[
          {
            label: 'Recent',
            value: 'recent'
          },
          {
            label: 'Grouped by tags',
            value: 'grouped_by_tags'
          },
        ]}
        selected="recent"
        type="default"
      />
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}
export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
