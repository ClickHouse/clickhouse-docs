const fs = require('fs');
const path = require('path');

function extractVersions(siteDir) {
  // Extract latest OSS version from index.md (2025 changelog)
  function getLatestOSSVersion() {
    try {
      // Check 2025 changelog first (index.md)
      const changelog2025Path = path.join(siteDir, 'docs/whats-new/changelog/index.md');
      if (fs.existsSync(changelog2025Path)) {
        const content = fs.readFileSync(changelog2025Path, 'utf8');
        
        // Look for the first version pattern like "25.7"
        const versionMatch = content.match(/ClickHouse release v(\d+\.\d+)/);
        if (versionMatch) {
          const version = versionMatch[1];
          // Create anchor link (e.g., "25.7" -> "#257")
          const anchor = version.replace('.', '');
          return {
            version: `v${version}`,
            link: `/docs/whats-new/changelog#${anchor}`
          };
        }
      }
      
      // Fallback to 2024 changelog
      const changelog2024Path = path.join(siteDir, 'docs/whats-new/changelog/2024.md');
      const content = fs.readFileSync(changelog2024Path, 'utf8');
      
      // Look for the first version pattern like "24.12"
      const versionMatch = content.match(/ClickHouse release (?:v)?(\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : '24.12.1';
      return {
        version: `v${version}`,
        link: `/docs/whats-new/changelog/2024`
      };
    } catch (error) {
      console.warn('Could not extract OSS version:', error.message);
      return {
        version: 'v25.7',
        link: '/docs/whats-new/changelog#257'
      };
    }
  }

  // Extract latest Cloud version from changelog directory
  function getLatestCloudVersion() {
    try {
      const changelogDir = path.join(siteDir, 'docs/cloud/changelogs');
      const files = fs.readdirSync(changelogDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const match = file.match(/(\d+)_(\d+)\.md$/);
          if (match) {
            // Convert "06" to "6", "04" to "4", etc.
            const major = match[1];
            const minor = parseInt(match[2], 10).toString();
            return {
              version: `${major}.${minor}`,
              file: file,
              link: `/docs/changelogs/${major}.${minor}`
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => {
          // Sort by version number (descending)
          const [aMajor, aMinor] = a.version.split('.').map(Number);
          const [bMajor, bMinor] = b.version.split('.').map(Number);
          
          if (aMajor !== bMajor) return bMajor - aMajor;
          return bMinor - aMinor;
        });

      if (files.length > 0) {
        return {
          version: `v${files[0].version}`,
          link: files[0].link
        };
      }
      
      return {
        version: 'v25.6',
        link: '/docs/changelogs/25.6'
      };
    } catch (error) {
      console.warn('Could not extract Cloud version:', error.message);
      return {
        version: 'v25.6',
        link: '/docs/changelogs/25.6'
      };
    }
  }

  const ossVersionInfo = getLatestOSSVersion();
  const cloudVersionInfo = getLatestCloudVersion();

  return {
    oss: {
      version: ossVersionInfo.version,
      link: ossVersionInfo.link
    },
    cloud: {
      version: cloudVersionInfo.version,
      link: cloudVersionInfo.link
    },
    generatedAt: new Date().toISOString()
  };
}

module.exports = function versionExtractorPlugin(context, options) {
  return {
    name: 'version-extractor-plugin',
    
    async loadContent() {
      const versions = extractVersions(context.siteDir);
      return versions;
    },

    async contentLoaded({ content, actions }) {
      const { createData } = actions;
      
      // Create a JSON file that can be imported
      await createData('versions.json', JSON.stringify(content, null, 2));
      
      // Also create a JS module for easier importing
      const jsContent = `export default ${JSON.stringify(content, null, 2)};`;
      await createData('versions.js', jsContent);
      
      console.log('🔍 Extracted versions:', content);
    },

    getClientModules() {
      return [];
    }
  };
};