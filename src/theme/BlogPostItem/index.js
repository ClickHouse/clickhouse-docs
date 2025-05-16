import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import BlogBreadcrumbs from "../../components/BlogBreadcrumbs/BlogBreadcrumbs";
import {useLocation} from '@docusaurus/router';
// apply a bottom margin in list view
function useContainerClassName() {
  return 'margin-bottom--xl';
}
export default function BlogPostItem({children, className}) {
  const location = useLocation()
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      {location.pathname.includes('/knowledgebase') || location.pathname.includes('/knowledgebase/tags/') ? <div></div> : <BlogBreadcrumbs/>}
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
