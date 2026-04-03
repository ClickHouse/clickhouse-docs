import React, { useEffect, useState } from 'react';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import TOC from '@theme/TOC';
import clsx from "clsx";
import IconClose from '@theme/Icon/Close';
import styles from './styles.module.scss'
import Feedback from '../../../../components/Feedback';
import { galaxyOnClick } from '@site/src/lib/galaxy/galaxy';
import { useStrapiClient } from '@site/src/lib/useStrapiClient';

const AD_CLOSED_KEY = 'doc-cloud-card-banner';

// Module-level cache — survives client-side navigation, resets on hard reload
let cachedAd = null;

export default function DocItemTOCDesktop() {
  const { toc, frontMatter } = useDoc();
  const { client: strapiClient } = useStrapiClient();
  const [isClosed, setClosed] = useState(
    () => globalThis.window?.localStorage.getItem(AD_CLOSED_KEY) === 'closed'
  );
  const [ad, setAd] = useState(cachedAd);

  useEffect(() => {
    if (cachedAd) return;

    let cancelled = false;

    const fetchAd = async () => {
      try {
        const { data } = await strapiClient.single('docs-ad').find();
        if (!cancelled && data && typeof data === 'object') {
          cachedAd = {
            title: data.title,
            description: data.description,
            href: data.href,
            label: data.label,
            tag: data.tag,
          };
          setAd(cachedAd);
        }
      } catch (e) {
        console.log('Failed to fetch ad content', e);
      }
    };

    fetchAd();
    return () => { cancelled = true; };
  }, [strapiClient]);

  return (
    <div className={clsx(styles.docTOCContainer, 'theme-doc-toc-desktop-container')}>
      <TOC
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level}
        className={clsx(styles.docTOC, ThemeClassNames.docs.docTocDesktop)}
      />
      <div>
        <Feedback side={toc.length >= 7 ? 'left' : 'bottom'} />
      </div>

      {!isClosed && ad && (
        <div className={styles.docCloudCardAd}>
          <div className={styles.docCloudCardHeader}>
            <h6>{ad.title}</h6>
            <button
              className={styles.docCloudClose}
              onClick={() => {
                setClosed(true);
                galaxyOnClick('docs.sidebarCloudAdvert.advertDismissed');
                window.localStorage.setItem(AD_CLOSED_KEY, 'closed');
              }}>
              <IconClose color="var(--ifm-color-emphasis-600)" width={10} height={10} />
            </button>
          </div>
          <p className={styles.docCloudCardContent}>{ad.description}</p>
          <a
            href={ad.href}
            className={clsx(styles.docCloudCardLink, 'click-button primary-btn')}
            onClick={() => { galaxyOnClick('docs.sidebarCloudAdvert.clickedThrough'); }}
          >
            {ad.label}
          </a>
        </div>
      )}
    </div>
  );
}
