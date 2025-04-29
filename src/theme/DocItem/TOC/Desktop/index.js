import React, {useEffect, useState} from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import TOC from '@theme/TOC';
import clsx from "clsx";
import IconClose from '@theme/Icon/Close';
import styles from './styles.module.css'
import Feedback from '../../../../components/Feedback';

export default function DocItemTOCDesktop() {
  const {toc, frontMatter} = useDoc();
  const [isClosed, setClosed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('doc-cloud-card-banner') === 'closed';
    }
    return false;
  });

  return (
    <div className={clsx(styles.docTOCContainer, 'theme-doc-toc-desktop-container')}>
      <TOC
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level}
        className={clsx(styles.docTOC, ThemeClassNames.docs.docTocDesktop)}
      />
      <div style={{'marginTop': '32px'}}>
        <Feedback side ={toc.length >= 7 ? 'left' : 'bottom'}/>
      </div>

      {
        !isClosed && (
          <div className={styles.docCloudCard}>
            <div className={styles.docCloudCardHeader}>
              <h6>Try ClickHouse Cloud for FREE</h6>
              <button
                className={styles.docCloudClose}
                onClick={() => {
                  setClosed(true)
                  window.sessionStorage.setItem('doc-cloud-card-banner', 'closed');
                }}>
                <IconClose color="var(--ifm-color-emphasis-600)" width={10} height={10}/>
              </button>
            </div>
            <p className={styles.docCloudCardContent}>Separation of storage and compute, automatic scaling, built-in SQL console, and lots more. $300 in free credits when signing up.</p>
            <a href='https://console.clickhouse.cloud/signUp?loc=doc-card-banner' className={clsx(styles.docCloudCardLink, 'click-button primary-btn')}>Try it for Free</a>
          </div>
        )
      }
    </div>
  );
}
