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
export default function BlogTagsListPage({tags, sidebar}) {
  const title = translateTagsPageTitle();
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <BlogBreadcrumbs/>
        <Heading as="h1">{title}</Heading>
        <BrowserOnly>
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
            selected="grouped_by_tags"
            type="default"
        />
        </BrowserOnly>
        <TagsListByLetter tags={tags} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
