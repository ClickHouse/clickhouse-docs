import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
function BlogListPageMetadata(props) {
  const {metadata} = props;
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const {blogDescription, blogTitle, permalink} = metadata;
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
  const {metadata, items, sidebar} = props;
  return (
    <BlogLayout sidebar={sidebar}>
      <h1>Recently Added</h1>
        <ButtonGroup
            onClick={function Da(value){value === 'recent' ? window.location.href = '/docs/knowledgebase' : window.location.href = '/docs/knowledgebase/tags' }}
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
