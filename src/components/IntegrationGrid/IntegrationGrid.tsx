import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CUICard from '@site/src/components/CUICard';
// @ts-ignore
import integrationsData from '@site/static/integrations.json';
import styles from './styles.module.scss';

type IntegrationData = {
  slug: string;
  integration_logo: string;
  integration_type: string[];
  integration_title?: string;
};

export function IntegrationGrid() {
  const integrations: IntegrationData[] = integrationsData;

  if (integrations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No integrations found with complete metadata.</p>
      </div>
    );
  }

  return (
    <div className={styles.integrationGrid} style={{
      display: 'grid',
      gap: '24px',
      margin: '32px 0'
    }}>
      {integrations.map((integration, index) => (
        <Link
          key={index}
          to={integration.slug}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <CUICard>
            <CUICard.Header className="p-6 text-center">
              <img
                src={useBaseUrl(integration.integration_logo)}
                alt={`${integration.integration_title || integration.slug} logo`}
                style={{ width: '3rem', height: '3rem', margin: '0 auto' }}
              />
            </CUICard.Header>
            <CUICard.Body className="p-6 pt-0 text-center">
              <h3 className="text-lg font-semibold mb-2">
                {integration.integration_title || integration.slug}
              </h3>
            </CUICard.Body>
          </CUICard>
        </Link>
      ))}
    </div>
  );
}