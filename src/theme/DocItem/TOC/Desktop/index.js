import React, {useEffect, useState} from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import TOC from '@theme/TOC';
import clsx from "clsx";
import IconClose from '@theme/Icon/Close';
import styles from './styles.module.css'
import Feedback from '../../../../components/Feedback';

const AD_DATA_ENDPOINT = 'https://cms.clickhouse-dev.com:1337/api/docs-ad'

export default function DocItemTOCDesktop() {
  const {toc, frontMatter} = useDoc();
  const [isClosed, setClosed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('doc-cloud-card-banner') === 'closed';
    }
    return false;
  });
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [href, setHref] = useState(null);
  const [label, setLabel] = useState(null);
  const [tag, setTag] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchAdData = async () => {
        const cacheKey = 'doc-cloud-card-banner-attributes';
        let attributes = {};

        // Get cached ad data from session
        if (window.sessionStorage.getItem(cacheKey)) {
          try {
            attributes = JSON.parse(window.sessionStorage.getItem(cacheKey));
          } catch (e) {
            console.log('Failed to parse cached ad attributes', e);
          }
        }

        // Fetch new ad data if not in session
        if (
            !attributes
            || !attributes.hasOwnProperty('title')
            || !attributes.hasOwnProperty('description')
            || !attributes.hasOwnProperty('href')
            || !attributes.hasOwnProperty('label')
            || !attributes.hasOwnProperty('tag')
        ) {
          try {
            const response = await window.fetch(AD_DATA_ENDPOINT);
            const { data } = await response.json();

            if (data && typeof data === 'object' && data.hasOwnProperty('attributes')) {
              attributes = data.attributes;
              window.sessionStorage.setItem(cacheKey, JSON.stringify(attributes));
            }
          } catch (e) {
            console.log('Failed to fetch ad content', e);
          }
        }

        return attributes;
      }

      // Set ad states
      fetchAdData().then(attributes => {
        setTitle(attributes?.title || null);
        setDescription(attributes?.description || null);
        setHref(attributes?.href || null);
        setLabel(attributes?.label || null);
        setTag(attributes?.tag || null)
      })

    }
  }, [setTitle, setDescription, setHref, setLabel, setTag]);

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
        !isClosed && title && description && href && label && (
          <div className={styles.docCloudCard}>
            <div className={styles.docCloudCardHeader}>
              <h6>{title}</h6>
              <button
                className={styles.docCloudClose}
                onClick={() => {
                  setClosed(true)
                  window.sessionStorage.setItem('doc-cloud-card-banner', 'closed');
                }}>
                <IconClose color="var(--ifm-color-emphasis-600)" width={10} height={10}/>
              </button>
            </div>
            <p className={styles.docCloudCardContent}>{description}</p>
            <a href={href} className={clsx(styles.docCloudCardLink, 'click-button primary-btn')}>{label}</a>
          </div>
        )
      }
    </div>
  );
}
