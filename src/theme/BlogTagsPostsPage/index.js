import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useBlogTagsPostsPageTitle } from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogPostItems from '@theme/BlogPostItems';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import Heading from '@theme/Heading';
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import styles from './styles.module.css';
import BlogBreadcrumbs from "../../components/BlogBreadcrumbs/BlogBreadcrumbs";
import { useHistory } from 'react-router-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function BlogTagsPostsPageMetadata({ tag }) {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  );
}
function BlogTagsPostsPageContent({ tag, items, sidebar, listMetadata }) {
  const title = useBlogTagsPostsPageTitle(tag);
  const history = useHistory();
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();

  return (
    <BlogLayout sidebar={sidebar}>
      {tag.unlisted && <Unlisted />}
      <header className="margin-bottom--xl">
        <BlogBreadcrumbs />
        <h1 className={styles.kbTitle}>Knowledge Base</h1>
        <ButtonGroup
          onClick={function Nav(value) { value === 'recent' ? history.push(`/docs/knowledgebase`) : history.push(`/docs/knowledgebase/tags`) }}
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
          selected="grouped_by_tags"
          type="default"
        />
        <Heading as="h1" className={styles.postsTagged}>{title}</Heading>
        {tag.description && <p>{tag.description}</p>}
      </header>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={listMetadata} />
    </BlogLayout>
  );
}
export default function BlogTagsPostsPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}>
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
