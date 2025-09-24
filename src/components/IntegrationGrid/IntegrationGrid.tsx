import React, { useState, useMemo } from 'react';
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

function IntegrationCard({ integration }: { integration: IntegrationData }) {
  return (
    <Link
      to={integration.slug}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <CUICard>
        <CUICard.Header>
          <img
            src={useBaseUrl(integration.integration_logo)}
            alt={`${integration.integration_title || integration.slug} logo`}
            style={{ width: '3rem', height: '3rem', margin: '0 auto' }}
          />
        </CUICard.Header>
        <CUICard.Body>
            {integration.integration_title}
        </CUICard.Body>
      </CUICard>
    </Link>
  );
}

function IntegrationCards({ integrations }: { integrations: IntegrationData[] }) {
  return (
    <div className={styles.integrationGrid} style={{
      display: 'grid',
      gap: '24px',
      margin: '32px 0'
    }}>
      {integrations.map((integration, index) => (
        <IntegrationCard key={`${integration.slug}-${integration.integration_title || index}`} integration={integration} />
      ))}
    </div>
  );
}

export function IntegrationGrid() {
  const integrations: IntegrationData[] = integrationsData;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Get unique integration types for filter buttons
  const integrationTypes = useMemo(() => {
    const types = new Set<string>();
    integrations.forEach(integration => {
      integration.integration_type.forEach(type => {
        types.add(type);
      });
    });
    return Array.from(types).sort();
  }, [integrations]);

  // Filter and group integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      const matchesSearch = integration.integration_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           integration.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilter === 'All' ||
                           integration.integration_type.some(type => type === selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [integrations, searchTerm, selectedFilter]);

  // Group integrations by type for sectioned view
  const groupedIntegrations = useMemo(() => {
    const grouped = new Map<string, IntegrationData[]>();

    filteredIntegrations.forEach(integration => {
      integration.integration_type.forEach(type => {
        if (!grouped.has(type)) {
          grouped.set(type, []);
        }
        // Avoid duplicates in the same section using slug + title combination
        if (!grouped.get(type)?.find(item => item.slug === integration.slug && item.integration_title === integration.integration_title)) {
          grouped.get(type)?.push(integration);
        }
      });
    });

    // Sort each group by title
    grouped.forEach((integrationsArray, key) => {
      integrationsArray.sort((a, b) => (a.integration_title || '').localeCompare(b.integration_title || ''));
    });

    return grouped;
  }, [filteredIntegrations]);

  if (integrations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No integrations found with complete metadata.</p>
      </div>
    );
  }

  return (
    <div className={styles.integrationsContainer}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by integration..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filter Buttons */}
      <div className={styles.filterContainer}>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'All' ? styles.active : ''}`}
          onClick={() => setSelectedFilter('All')}
        >
          All
        </button>
        {integrationTypes.map(type => (
          <button
            key={type}
            className={`${styles.filterButton} ${selectedFilter === type ? styles.active : ''}`}
            onClick={() => setSelectedFilter(type)}
          >
            {type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Integration Sections */}
      {selectedFilter === 'All' ? (
        // Show sections grouped by type
        Array.from(groupedIntegrations.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, typeIntegrations]) => (
            <section key={type} className={styles.integrationSection}>
              <h2 className={styles.sectionTitle}>
                {type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h2>
              <p className={styles.sectionDescription}>
                {getSectionDescription(type)}
              </p>
              <IntegrationCards integrations={typeIntegrations} />
            </section>
          ))
      ) : (
        // Show filtered results
        <section className={styles.integrationSection}>
          <h2 className={styles.sectionTitle}>
            {selectedFilter.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h2>
          <p className={styles.sectionDescription}>
            {getSectionDescription(selectedFilter)}
          </p>
          <IntegrationCards integrations={filteredIntegrations} />
        </section>
      )}

      {filteredIntegrations.length === 0 && (
        <div className={styles.noResults}>
          <p>No integrations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function getSectionDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'core': 'Essential ClickHouse integrations for the most common data sources and destinations.',
    'data ingestion': 'Streamline your data pipelines with ClickHouse! Seamless integrations ensure efficient ingestion, optimizing real-time analytics.',
    'data visualization': 'Illuminate your data stories! ClickHouse integrations enhance visualization, making insights more vivid & actionable.',
    'language client': 'Code in your comfort zone! ClickHouse\'s language client integrations make data access fluent across multiple programming languages.',
    'data integration': 'Integrate ClickHouse with your existing data infrastructure and workflows.',
    'sql client': 'Access and query ClickHouse databases using familiar SQL client tools and interfaces.',
    'data management': 'Manage, monitor, and optimize your ClickHouse data with specialized management tools.',
    'ai/ml': 'Leverage ClickHouse for machine learning and AI workloads with integrated ML tools and frameworks.',
    'no code': 'Build applications and workflows with ClickHouse using visual, no-code development platforms.',
    'deployment method': 'Deploy and manage ClickHouse instances using various deployment and orchestration tools.',
    'security automation': 'Secure your ClickHouse infrastructure with automated security and compliance tools.',
    'data quality': 'Ensure data quality and reliability in your ClickHouse pipelines.',
    'data governance': 'Implement data governance and compliance frameworks for your ClickHouse environment.',
    'clickpipes': 'ClickPipes is an integration engine that makes ingesting massive volumes of data from a diverse set of sources as simple as clicking a few buttons.'
  };
  return descriptions[type] || 'Integrate ClickHouse with specialized tools and services.';
}