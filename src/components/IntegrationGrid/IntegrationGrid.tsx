import React, { useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CUICard from '@site/src/components/CUICard';
// @ts-ignore
import integrationsData from '@site/static/integrations.json';
// @ts-ignore
import integrationsCustomData from '@site/static/integrations_custom.json';
import styles from './styles.module.scss';

type IntegrationData = {
  slug: string;
  integration_logo: string;
  integration_type: string[];
  integration_title?: string;
  integration_tier?: string;
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
  // Combine integrations from both JSON files and normalize logo paths
  const integrations: IntegrationData[] = useMemo(() => {
    // Process custom integrations to fix logo paths
    const processedCustomData = integrationsCustomData.map(integration => ({
      ...integration,
      integration_logo: integration.integration_logo.startsWith('/static/')
        ? integration.integration_logo.replace('/static/', '/')
        : integration.integration_logo
    }));

    return [...integrationsData, ...processedCustomData];
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  // Get unique integration types for filter buttons
  const integrationTypes = useMemo(() => {
    const types = new Set<string>();
    integrations.forEach(integration => {
      integration.integration_type.forEach(type => {
        types.add(type);
      });
    });

    // Custom sort order
    const sortOrder = [
      'ClickPipes',
      'Language client',
      'Data ingestion',
      'Data visualization',
      'AI/ML',
      'Data integration',
      'Data management',
      'Security governance',
      'SQL client'
    ];

    return Array.from(types).sort((a, b) => {
      const indexA = sortOrder.indexOf(a);
      const indexB = sortOrder.indexOf(b);

      // If both items are in the sort order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one item is in the sort order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither item is in the sort order, fall back to alphabetical
      return a.localeCompare(b);
    });
  }, [integrations]);

  // Get unique integration tiers for tier filter buttons
  const integrationTiers = useMemo(() => {
    const tiers = new Set<string>();
    integrations.forEach(integration => {
      if (integration.integration_tier) {
        tiers.add(integration.integration_tier);
      }
    });
    return Array.from(tiers).sort();
  }, [integrations]);

  // Filter and group integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      const matchesSearch = integration.integration_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           integration.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilter === 'All' ||
                           integration.integration_type.some(type => type === selectedFilter);

      const matchesTier = selectedTier === 'All' ||
                         integration.integration_tier === selectedTier;

      return matchesSearch && matchesFilter && matchesTier;
    });
  }, [integrations, searchTerm, selectedFilter, selectedTier]);

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
      <div className={styles.filterContainer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Integration Type Filters - First Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            className={`${styles.filterButton} ${selectedFilter === 'All' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('All')}
            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
          >
            All
          </button>
          {integrationTypes.map(type => (
            <button
              key={type}
              className={`${styles.filterButton} ${selectedFilter === type ? styles.active : ''}`}
              onClick={() => setSelectedFilter(type)}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              {getProperCapitalization(type)}
            </button>
          ))}
        </div>

        {/* Integration Tier Filters - Second Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            className={`${styles.filterButton} ${selectedTier === 'All' ? styles.active : ''}`}
            onClick={() => setSelectedTier('All')}
            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
          >
            All Tiers
          </button>
          {integrationTiers.map(tier => (
            <button
              key={tier}
              className={`${styles.filterButton} ${selectedTier === tier ? styles.active : ''}`}
              onClick={() => setSelectedTier(tier)}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Sections */}
      {selectedFilter === 'All' ? (
        // Show sections grouped by type
        Array.from(groupedIntegrations.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, typeIntegrations]) => (
            <section key={type} className={styles.integrationSection}>
              <h2 className={styles.sectionTitle}>
                {getProperCapitalization(type)}
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
            {getProperCapitalization(selectedFilter)}
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

function getProperCapitalization(text: string): string {
  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'ai/ml': 'AI/ML',
    'clickpipes': 'ClickPipes',
    'data ingestion': 'Data ingestion',
    'data integration': 'Data integration',
    'data management': 'Data management',
    'data visualization': 'Data visualization',
    'deployment method': 'Deployment method',
    'language client': 'Language client',
    'security governance': 'Security governance',
    'sql client': 'SQL client'
  };

  const lowerText = text.toLowerCase();
  if (specialCases[lowerText]) {
    return specialCases[lowerText];
  }

  // Default capitalization
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getSectionDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'ClickPipes': 'ClickPipes is an integration engine that makes ingesting massive volumes of data from a diverse set of sources as simple as clicking a few buttons.',
    'Data ingestion': 'Streamline your data pipelines with ClickHouse! Seamless integrations ensure efficient ingestion, optimizing real-time analytics.',
    'Data visualization': 'Illuminate your data stories! ClickHouse integrations enhance visualization, making insights more vivid & actionable.',
    'SQL client': 'Access and query ClickHouse databases using familiar SQL client tools and interfaces.',
    'Language client': 'Code in your comfort zone! ClickHouse\'s language client integrations make data access fluent across multiple programming languages.',
    'AI/ML': 'Leverage ClickHouse for machine learning and AI workloads with integrated ML tools and frameworks.',
    'Data management': 'Manage, monitor, and optimize your ClickHouse data with specialized management tools.',
    'Data integration': 'Integrate ClickHouse with your existing data infrastructure and workflows.',
    'Security governance': 'Implement security and governance frameworks for your ClickHouse environment.'
  };
  return descriptions[type] || 'Integrate ClickHouse with specialized tools and services.';
}