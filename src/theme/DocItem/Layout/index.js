import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import EditThisPage from '@theme/EditThisPage';
import styles from './styles.module.css';
import Translate from "@docusaurus/Translate";
import IconClose from "@theme/Icon/Close";
import {useLocation} from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import RelatedBlogs from "../../../components/RelatedBlogs/RelatedBlogs";
/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const {frontMatter, toc} = useDoc();
  const windowSize = useWindowSize();
  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden;
  const mobile = canRender ? <DocItemTOCMobile /> : undefined;
  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? (
      <DocItemTOCDesktop />
    ) : undefined;
  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({children}) {
  const docTOC = useDocTOC();
  const {metadata, frontMatter} = useDoc();
  const {editUrl} = metadata;

  const location = useLocation();
  const context = useDocusaurusContext();

  const [showPopup, setShowPopup] = useState(false)
  useEffect(() => {

    const userClosed = window.localStorage.getItem('doc-translate-card-banner')
    let isDocsHome = false;

    if (
        location.pathname.endsWith('/docs/jp/') ||
        location.pathname.endsWith('/docs/ru/') ||
        location.pathname.endsWith('/docs/zh/')
    ) {
      isDocsHome = true
    }

    if (context.i18n.currentLocale === 'en') {
      setShowPopup(false);
    } else {
      if ((isDocsHome && !userClosed)) {
        setShowPopup(false);
      } else if (!isDocsHome && !userClosed) {
        setShowPopup(true);
      } else if (!isDocsHome && userClosed==='closed') {
        setShowPopup(false);
      }
    }
  }, [])

  return (
    <div className="row" style={{flexWrap: 'nowrap'}}>
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            {/* Add EditThisPage link at the top */}
            <div className={styles.docHeaderContainer}>
              <DocBreadcrumbs />
              {editUrl && <EditThisPage editUrl={editUrl} />}
            </div>
            {showPopup && (<div className={styles.docCloudCard}>
              <div className={styles.docCloudCardHeader}>
                <h6><Translate>This documentation is translated with the help of AI</Translate></h6>
                <button
                    className={styles.docCloudClose}
                    onClick={() => {
                      setShowPopup(false)
                      window.localStorage.setItem('doc-translate-card-banner', 'closed')
                    }}>
                  <IconClose color="var(--ifm-color-emphasis-600)" width={10} height={10}/>
                </button>
              </div>
              <p className={styles.docCloudCardContent}><Translate>Spotted a translation issue? Help us to improve it by reporting translation
                issues.</Translate>
              </p>
              <a href='https://github.com/ClickHouse/clickhouse-docs/issues/new?template=translation_issue.yaml'
                 className={clsx(styles.docCloudCardLink, 'click-button primary-btn')}><Translate>Report an issue</Translate></a>
            </div>)}
            
            <DocVersionBadge />
            
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          {frontMatter.show_related_blogs === true ? <RelatedBlogs frontMatter={frontMatter}/> : <></>}
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}
