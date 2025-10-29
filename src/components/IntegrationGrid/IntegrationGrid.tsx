import React, { useState, useMemo, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import CUICard from '@site/src/components/CUICard';
import styles from './styles.module.scss';

type CMSIntegrationData = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    category: string;
    supportLevel: string;
    docsLink?: string;
    logo?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
    logo_dark?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
};

type IntegrationData = {
  slug: string;
  docsLink?: string;
  integration_logo: string;
  integration_logo_dark?: string;
  integration_type: string[];
  integration_title?: string;
  integration_tier?: string;
};

function IntegrationCard({ integration }: { integration: IntegrationData }) {
  const { colorMode } = useColorMode();

  // Convert ClickHouse docs URLs to relative links
  const getNavigationLink = (docsLink: string | undefined, slug: string): string => {
    if (!docsLink) {
      return slug;
    }

    // Check if it's a ClickHouse docs URL
    const clickhouseDocsMatch = docsLink.match(/https:\/\/clickhouse\.com\/docs\/(.+)/);
    if (clickhouseDocsMatch) {
      // Convert to relative link by removing the domain and keeping everything after /docs
      return `/${clickhouseDocsMatch[1]}`;
    }

    // For external URLs, return as-is
    return docsLink;
  };

  // Select appropriate logo based on theme and availability
  const getLogoSrc = (): string => {
    // If we're in dark mode and dark logo is available, use it
    if (colorMode === 'dark' && integration.integration_logo_dark) {
      return integration.integration_logo_dark;
    }
    // Otherwise, use the regular logo
    return integration.integration_logo;
  };

  const linkTo = getNavigationLink(integration.docsLink, integration.slug);

  // Check if this is an external link (not to clickhouse.com/docs)
  const isExternalLink = linkTo.startsWith('http') && !linkTo.includes('clickhouse.com/docs');

  return (
    <div className={styles.cardWrapper}>
      <Link
        to={linkTo}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <CUICard style={{ position: 'relative' }}>
          {/* Tier Icon in top right corner */}
          {integration.integration_tier && integration.integration_tier !== 'community' && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1,
              opacity: 0.7
            }}>
              {getTierIcon(integration.integration_tier)}
            </div>
          )}
          <CUICard.Body>
          <CUICard.Header>
            <img
              src={getLogoSrc()}
              alt={`${integration.integration_title || integration.slug} logo`}
            />
          </CUICard.Header>
          <CUICard.Footer>
              {integration.integration_title}
          </CUICard.Footer>
          </CUICard.Body>
        </CUICard>
      </Link>
      {/* External link overlay */}
      {isExternalLink && (
        <div className={styles.externalLinkOverlay}>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      )}
    </div>
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

// Helper function to transform CMS data to the expected format
function transformCMSData(cmsData: CMSIntegrationData[]): IntegrationData[] {
  // Mapping from CMS category to display-friendly integration type
  const categoryMapping: { [key: string]: string } = {
    'AI_ML': 'AI/ML',
    'CLICKPIPES': 'ClickPipes',
    'DATA_INGESTION': 'Data ingestion',
    'DATA_INTEGRATION': 'Data integration',
    'DATA_MANAGEMENT': 'Data management',
    'DATA_VISUALIZATION': 'Data visualization',
    'LANGUAGE_CLIENT': 'Language client',
    'SECURITY_GOVERNANCE': 'Security governance',
    'SQL_CLIENT': 'SQL client'
  };

  return cmsData.map(item => {
    // Map category to integration_type array
    const integrationTypes = item.attributes.category ? [categoryMapping[item.attributes.category] || item.attributes.category] : [];

    // Map supportLevel to integration_tier
    const integrationTier = item.attributes.supportLevel?.toLowerCase() || '';

    return {
      slug: item.attributes.slug.startsWith('/') ? item.attributes.slug : `/${item.attributes.slug}`,
      docsLink: item.attributes.docsLink,
      integration_logo: item.attributes.logo?.data?.attributes.url ? `https://cms.clickhouse-dev.com:1337${item.attributes.logo.data.attributes.url}` : '',
      integration_logo_dark: item.attributes.logo_dark?.data?.attributes.url ? `https://cms.clickhouse-dev.com:1337${item.attributes.logo_dark.data.attributes.url}` : undefined,
      integration_type: integrationTypes,
      integration_title: item.attributes.name,
      integration_tier: integrationTier
    };
  });
}

// Custom hook for fetching CMS data
function useCMSIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackPath = useBaseUrl('/integrations-fallback.json');

  useEffect(() => {
    const fetchIntegrations = async () => {
      // Step 1: Load fallback data first for immediate display
      try {
        const fallbackResponse = await fetch(fallbackPath, {
          cache: 'force-cache' // Use cached version if available
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const transformedData = transformCMSData(fallbackData.data || []);
          setIntegrations(transformedData);
          setError(null);
          setLoading(false); // Show content immediately with fallback data
          console.log('Loaded fallback integrations data');
        } else {
          console.warn('Fallback file not available, will try CMS only');
        }
      } catch (fallbackErr) {
        console.error('Failed to load fallback integrations data:', fallbackErr);
        // Continue to try CMS even if fallback fails
      }

      // Step 2: Try to fetch fresh data from CMS with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('CMS request timed out after 8 seconds');
        }, 8000); // 8 second timeout

        const response = await fetch(
          'https://cms.clickhouse-dev.com:1337/api/integrations?populate[]=logo&populate[]=logo_dark',
          {
            signal: controller.signal,
            // Add headers to help with CORS and caching
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = transformCMSData(data.data || []);

        // Update with fresh CMS data
        setIntegrations(transformedData);
        setError(null);
        console.log('Successfully updated with fresh CMS data');
      } catch (cmsErr) {
        // CMS fetch failed, but that's okay - we already have fallback data
        if (cmsErr instanceof Error) {
          if (cmsErr.name === 'AbortError') {
            console.log('CMS request was aborted due to timeout, using fallback data');
          } else {
            console.error('Error loading integrations from CMS:', cmsErr.message);
          }
        }

        // Only set error if we don't have any integrations data at all
        if (integrations.length === 0) {
          setError('Unable to load integrations. Please try refreshing the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [fallbackPath]);

  return { integrations, loading, error };
}

export function IntegrationGrid() {
  const { integrations, loading, error } = useCMSIntegrations();

  // Initialize state from localStorage or default values
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('integrations-search') || '';
    }
    return '';
  });

  const [selectedFilter, setSelectedFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('integrations-filter') || 'All';
    }
    return 'All';
  });

  const [selectedTier, setSelectedTier] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('integrations-tier') || 'All';
    }
    return 'All';
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('integrations-search', searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('integrations-filter', selectedFilter);
    }
  }, [selectedFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('integrations-tier', selectedTier);
    }
  }, [selectedTier]);

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
      'Language client',
      'ClickPipes',
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

    // Custom sort order for tiers
    const tierSortOrder = ['core', 'partner', 'community'];

    return Array.from(tiers).sort((a, b) => {
      const indexA = tierSortOrder.indexOf(a);
      const indexB = tierSortOrder.indexOf(b);

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

  // Filter and group integrations
  const filteredIntegrations = useMemo(() => {
    const filtered = integrations.filter(integration => {
      const matchesSearch = integration.integration_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           integration.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilter === 'All' ||
                           integration.integration_type.some(type => type === selectedFilter);

      const matchesTier = selectedTier === 'All' ||
                         integration.integration_tier === selectedTier;

      return matchesSearch && matchesFilter && matchesTier;
    });

    // Sort filtered results by tier first, then by title
    return filtered.sort((a, b) => {
      // Define tier priority order
      const tierOrder = ['core', 'partner', 'community', ''];
      const tierA = a.integration_tier || '';
      const tierB = b.integration_tier || '';

      const tierIndexA = tierOrder.indexOf(tierA);
      const tierIndexB = tierOrder.indexOf(tierB);

      // If tiers are different, sort by tier priority
      if (tierIndexA !== tierIndexB) {
        return tierIndexA - tierIndexB;
      }

      // If tiers are the same, sort by title alphabetically
      return (a.integration_title || '').localeCompare(b.integration_title || '');
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

    // Sort each group by tier first, then by title
    grouped.forEach((integrationsArray, key) => {
      integrationsArray.sort((a, b) => {
        // Define tier priority order
        const tierOrder = ['core', 'partner', 'community', ''];
        const tierA = a.integration_tier || '';
        const tierB = b.integration_tier || '';

        const tierIndexA = tierOrder.indexOf(tierA);
        const tierIndexB = tierOrder.indexOf(tierB);

        // If tiers are different, sort by tier priority
        if (tierIndexA !== tierIndexB) {
          return tierIndexA - tierIndexB;
        }

        // If tiers are the same, sort by title alphabetically
        return (a.integration_title || '').localeCompare(b.integration_title || '');
      });
    });

    return grouped;
  }, [filteredIntegrations]);

  // Handle loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading integrations...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-danger)' }}>
        <p>Failed to load integrations: {error}</p>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  // Handle empty state
  if (integrations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No integrations found.</p>
      </div>
    );
  }

  return (
    <div className={styles.integrationsContainer}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by integration"
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px'}}>
          <button
            className={`${styles.filterButton} ${selectedTier === 'All' ? styles.active : ''}`}
            onClick={() => setSelectedTier('All')}
            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
          >
            All tiers
          </button>
          {integrationTiers.map(tier => (
            <button
              key={tier}
              className={`${styles.filterButton} ${selectedTier === tier ? styles.active : ''}`}
              onClick={() => setSelectedTier(tier)}
              style={{
                padding: '6px 12px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getTierIcon(tier, true)}
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Sections */}
      {selectedFilter === 'All' ? (
        // Show sections grouped by type
        Array.from(groupedIntegrations.entries())
          .sort(([a], [b]) => {
            // Use the same sort order as the filter buttons
            const sortOrder = [
              'Language client',
              'ClickPipes',
              'Data ingestion',
              'Data visualization',
              'AI/ML',
              'Data integration',
              'Data management',
              'Security governance',
              'SQL client'
            ];

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
          })
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

function getTierIcon(tier: string, withMargin = false): React.ReactNode {
  const marginStyle = withMargin ? { marginRight: '6px' } : {};

  switch (tier) {
    case 'core':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={marginStyle}>
          <path d="M1.30762 1.39073C1.30762 1.3103 1.37465 1.22986 1.46849 1.22986H2.64824C2.72868 1.22986 2.80912 1.29689 2.80912 1.39073V14.4886C2.80912 14.5691 2.74209 14.6495 2.64824 14.6495H1.46849C1.38805 14.6495 1.30762 14.5825 1.30762 14.4886V1.39073Z" fill="currentColor" />
          <path d="M4.2832 1.39073C4.2832 1.3103 4.35023 1.22986 4.44408 1.22986H5.62383C5.70427 1.22986 5.7847 1.29689 5.7847 1.39073V14.4886C5.7847 14.5691 5.71767 14.6495 5.62383 14.6495H4.44408C4.36364 14.6495 4.2832 14.5825 4.2832 14.4886V1.39073Z" fill="currentColor" />
          <path d="M7.25977 1.39073C7.25977 1.3103 7.3268 1.22986 7.42064 1.22986H8.60039C8.68083 1.22986 8.76127 1.29689 8.76127 1.39073V14.4886C8.76127 14.5691 8.69423 14.6495 8.60039 14.6495H7.42064C7.3402 14.6495 7.25977 14.5825 7.25977 14.4886V1.39073Z" fill="currentColor" />
          <path d="M10.2354 1.39073C10.2354 1.3103 10.3024 1.22986 10.3962 1.22986H11.576C11.6564 1.22986 11.7369 1.29689 11.7369 1.39073V14.4886C11.7369 14.5691 11.6698 14.6495 11.576 14.6495H10.3962C10.3158 14.6495 10.2354 14.5825 10.2354 14.4886V1.39073Z" fill="currentColor" />
          <path d="M13.2256 6.6057C13.2256 6.52526 13.2926 6.44482 13.3865 6.44482H14.5662C14.6466 6.44482 14.7271 6.51186 14.7271 6.6057V9.27354C14.7271 9.35398 14.6601 9.43442 14.5662 9.43442H13.3865C13.306 9.43442 13.2256 9.36739 13.2256 9.27354V6.6057Z" fill="currentColor" />
        </svg>
      );
    case 'partner':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={marginStyle}>
          <polyline points="12.5 9.5 10 12 6 11 2.5 8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
          <polyline points="4.54 4.41 8 3.5 11.46 4.41" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
          <path d="M2.15,3.78 L0.55,6.95 A0.5,0.5 0,0,0 0.77,7.62 L2.5,8.5 L4.54,4.41 L2.82,3.55 A0.5,0.5 0,0,0 2.15,3.78 Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
          <path d="M13.5,8.5 L15.23,7.62 A0.5,0.5 0,0,0 15.45,6.95 L13.85,3.78 A0.5,0.5 0,0,0 13.18,3.55 L11.46,4.41 Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
          <path d="M11.5,4.5 L9,4.5 L6.15,7.27 A0.5,0.5 0,0,0 6.24,8.05 C7.33,8.74 8.81,8.72 10,7.5 L12.5,9.5 L13.5,8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
          <polyline points="7.75 13.5 5.15 12.85 3.5 11.67" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
        </svg>
      );
    case 'community':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" style={marginStyle}>
          <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
        </svg>
      );
    default:
      return null;
  }
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