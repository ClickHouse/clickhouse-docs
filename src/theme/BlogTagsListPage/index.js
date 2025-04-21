import React from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  translateTagsPageTitle,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import TagsListByLetter from '@theme/TagsListByLetter';
import SearchMetadata from '@theme/SearchMetadata';
import Heading from '@theme/Heading';
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import BlogBreadcrumbs from "../../components/BlogBreadcrumbs/BlogBreadcrumbs";
import { useHistory } from 'react-router-dom';
import styles from './styles.module.css';
import Translate from "@docusaurus/Translate";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function BlogTagsListPage({ tags, sidebar }) {
  const history = useHistory();
  const title = translateTagsPageTitle();
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();


  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <BlogBreadcrumbs />
        <Heading as="h1" className={styles.kbTitle}><Translate id={`theme.blog.title`} description={`Translation for Knowledge Base`}>Knowledge Base</Translate></Heading>
        <ButtonGroup
          onClick={function Nav(value) { if (typeof window !== 'undefined') { value === 'recent' ? history.push(`/docs/knowledgebase`) : history.push(`/docs/knowledgebase/tags`) } }}
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
        <TagsListByLetter tags={tags} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
