import React, {useState} from 'react';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import Layout from '@theme/Layout';
import BackToTopButton from '@theme/BackToTopButton';
import DocPageLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocPageLayoutMain from '@theme/DocRoot/Layout/Main';
import styles from './styles.module.css';
import { useAnchorFix } from '../../hooks/useAnchorFix';
export default function DocPageLayout({children}) {
  useAnchorFix(); // fix for layout shifts which occur when navigating to an anchor
  const sidebar = useDocsSidebar();
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  return (
    <Layout wrapperClassName={styles.docsWrapper}>
      <BackToTopButton />
      <div className={styles.docPage}>
        {sidebar && (
          <DocPageLayoutSidebar
            sidebar={sidebar.items}
            hiddenSidebarContainer={hiddenSidebarContainer}
            setHiddenSidebarContainer={setHiddenSidebarContainer}
          />
        )}
        <DocPageLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
          {children}
        </DocPageLayoutMain>
      </div>
    </Layout>
  );
}
