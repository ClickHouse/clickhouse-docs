import { useState, useEffect } from 'react';

// Hook to get version information
export function useVersions() {
  const [versions, setVersions] = useState({
    oss: { version: 'v24.12.1', link: '/docs/whats-new/changelog' },
    cloud: { version: 'v25.6', link: '/docs/changelogs/25.6' }
  });

  useEffect(() => {
    // Try to load the generated versions data
    const loadVersions = async () => {
      try {
        // This will work when the plugin generates the data
        const versionData = await import('@generated/version-extractor-plugin/default/versions.js');
        if (versionData.default) {
          setVersions(versionData.default);
        }
      } catch (error) {
        console.warn('Could not load generated versions, using defaults:', error);
        // Fallback to defaults already set in useState
      }
    };

    loadVersions();
  }, []);

  return versions;
}