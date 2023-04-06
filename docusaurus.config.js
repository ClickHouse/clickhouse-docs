const darkTheme = require('prism-react-renderer/themes/vsDark')

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'ClickHouse Docs',
	tagline:
		'Documentation, quick starts, user guides, technical references, FAQs and more...',
	url: 'https://clickhouse.com',
	// url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bookish-disco-5997zvo.pages.github.io',
	baseUrl: '/docs/',
	baseUrlIssueBanner: true,
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'throw',
	favicon: 'img/favicon.ico',
	organizationName: 'ClickHouse',
	trailingSlash: false,
	projectName: 'clickhouse-docs',
	markdown: {
		mermaid: true,
	},
	themes: ['@docusaurus/theme-mermaid'],
	scripts: ['/docs/js/analytics.js'],
	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editCurrentVersion: true,
					breadcrumbs: false,
					editUrl: ({ docPath }) => {
						if (
							docPath.includes('en/development') ||
							docPath.includes('en/engines') ||
							docPath.includes('en/getting-started') ||
							docPath.includes('en/interfaces') ||
							docPath.includes('en/operations') ||
							docPath.includes('en/sql-reference') ||
							docPath.startsWith('ru') ||
							docPath.startsWith('zh')
						) {
							return (
								'https://github.com/ClickHouse/ClickHouse/tree/master/docs/' +
								docPath
							)
						} else {
							return (
								'https://github.com/ClickHouse/clickhouse-docs/blob/main/docs/' +
								docPath
							)
						}
					},
					showLastUpdateTime: false,
					sidebarCollapsed: true,
					routeBasePath: '/',
				},
				blog: {
					path: 'knowledgebase',
					blogTitle: 'ClickHouse Knowledge Base',
					blogDescription: 'Knowledge Base',
					blogSidebarTitle: 'All KB articles',
					routeBasePath: '/knowledgebase',
					postsPerPage: 10,
					blogSidebarCount: 'ALL',
					feedOptions: {
						type: 'all',
						title: 'ClickHouse Knowledge Base Feed',
						description:
							'Feed of articles posted to the ClickHouse Knowledge Base',
						copyright: `Copyright &copy; 2016&ndash;${new Date().getFullYear()} ClickHouse, Inc. ClickHouse Docs provided under the Creative Commons CC BY-NC-SA 4.0 license. ClickHouse&reg; is a registered trademark of ClickHouse, Inc.`,
						language: 'en',
						createFeedItems: async (params) => {
							const { blogPosts, defaultCreateFeedItems, ...rest } = params
							return defaultCreateFeedItems({
								// keep only the 10 most recent blog posts in the feed
								blogPosts: blogPosts.filter((item, index) => index < 10),
								...rest,
							})
						},
					},
				},
				theme: {
					customCss: [require.resolve('./src/css/custom.scss')],
				},
				gtag: {
					trackingID: 'G-KF1LLRTQ5Q',
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			algolia: {
				appId: '62VCH2MD74',
				apiKey: '2363bec2ff1cf20b0fcac675040107c3',
				indexName: 'clickhouse',
				contextualSearch: false,
				searchPagePath: 'search',
			},
			image: 'img/logo.png',
			docs: {
				sidebar: {
					autoCollapseCategories: true,
				},
			},
			//      autoCollapseSidebarCategories: true,
			navbar: {
				hideOnScroll: false,

				logo: {
					alt: 'ClickHouse',
					src: 'img/ch_logo_docs.svg',
					srcDark: 'img/ch_logo_docs_dark.svg',
					href: 'https://clickhouse.com/',
				},
				items: [
					{
						type: 'dropdown',
						label: 'Product',
						hoverable: true,
						className: 'ch-menu',
						position: 'left',
						items: [
							{
								label: 'ClickHouse',
								to: 'https://clickhouse.com/clickhouse',
							},
							{
								label: 'ClickHouse Cloud',
								to: 'https://clickhouse.com/cloud',
							},
						],
					},

					{
						type: 'dropdown',
						hoverable: true,
						label: 'Resources',
						className: 'ch-menu',
						position: 'left',
						items: [
							{
								to: '/docs/en/intro',
								label: 'Docs',
							},
							{
								label: 'ClickHouse Academy',
								to: 'https://clickhouse.com/learn',
							},
							{
								label: 'Upcoming training',
								to: 'https://clickhouse.com/company/news-events',
							},
							{
								label: 'Blog',
								to: 'https://clickhouse.com/blog',
							},
							{
								label: 'Support Program',
								to: 'https://clickhouse.com/support/program',
							},
						],
					},
					{
						position: 'left',
						label: 'Use Cases',
						className: 'ch-menu',
						to: 'https://clickhouse.com/customer-stories',
					},
					{
						position: 'left',
						label: 'Pricing',
						className: 'ch-menu',
						to: 'https://clickhouse.com/pricing',
					},
					{
						type: 'html',
						value: `
                <div class="nav-items-btns">
                  <a href="https://clickhouse.cloud/signIn" class="sign-in navbar__item navbar__link ch-menu">
                    Sign in
                  </a>
                  <a href="https://clickhouse.cloud/signUp" class="click-button-anchor">
                    <button class="click-button primary-btn">Get started</button>
                  </a>
                </div>`,
						position: 'right',
					},
				],
			},
			footer: {
				style: 'light',
				links: [
					{
						label: 'Trademark',
						to: 'https://clickhouse.com/legal/trademark-policy',
					},
					{
						label: 'Privacy',
						to: 'https://clickhouse.com/legal/privacy-policy',
					},
					{
						label: 'Security',
						to: 'https://trust.clickhouse.com/',
					},
					{
						label: 'Terms of Service',
						to: 'https://clickhouse.com/legal/agreements/terms-of-service',
					},
				],
				copyright: `© 2016&ndash;${new Date().getFullYear()} ClickHouse, Inc.`,
			},
			prism: {
				theme: darkTheme,
				darkTheme: darkTheme,
				additionalLanguages: ['java', 'cpp'],
				magicComments: [
					// Remember to extend the default highlight class name as well!
					{
						className: 'theme-code-block-highlighted-line',
						line: 'highlight-next-line',
						block: { start: 'highlight-start', end: 'highlight-end' },
					},
				],
			},
			colorMode: {
				disableSwitch: false,
				respectPrefersColorScheme: true,
				defaultMode: 'dark',
			},
			/*      announcementBar: {
              id: 'support_us',
              content:
                'Check out our new 25-minute video on <a href="https://clickhouse.com/company/events/getting-started-with-clickhouse/" target="_blank"> Getting Started with ClickHouse</a>',
              backgroundColor: '#0057b7',
              textColor: '#ffffff',
              isCloseable: false,
            },
      */
		}),

	plugins: [
		'docusaurus-plugin-sass',
		'remark-docusaurus-tabs',
		function (context, options) {
			return {
				name: 'docusaurus-plugin',
				async postBuild({ siteConfig = {}, routesPaths = [], outDir }) {
					// Print out to console all the rendered routes.
					routesPaths.map((route) => {
						console.log(route)
					})
				},
			}
		},
		[
			'@docusaurus/plugin-client-redirects',
			{
				redirects: [
					{
						from: '/en/about-us/performance',
						to: '/en/concepts/why-clickhouse-is-so-fast',
					},
					{
						from: '/en/guides/improving-query-performance/skipping-indexes',
						to: '/en/optimize/skipping-indexes',
					},
					{ from: '/en/analyze', to: '/en/sql-reference' },
					{ from: '/en/engines', to: '/en/engines/table-engines/' },
					{ from: '/en/guides', to: '/en/guides/creating-tables' },
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-cardinality',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-intro',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-multiple',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-uuids',
						to: '/en/optimize/sparse-primary-indexes',
					},
					{
						from: '/en/integrations/data-ingestion/dbms/',
						to: '/en/integrations',
					},
					{
						from: '/en/integrations/data-ingestion/etl-tools',
						to: '/en/integrations',
					},
					{ from: '/en/integrations/intro', to: '/en/integrations' },
					{ from: '/en/integrations/language-clients', to: '/en/integrations' },
					{
						from: '/en/integrations/migration/clickhouse-local',
						to: '/en/cloud/migration/clickhouse-local',
					},
					{
						from: '/en/integrations/migration/clickhouse-to-cloud',
						to: '/en/cloud/migration/clickhouse-to-cloud',
					},
					{
						from: '/en/integrations/migration/etl-tool-to-clickhouse',
						to: '/en/cloud/migration/etl-tool-to-clickhouse',
					},
					{ from: '/en/integrations/sql-clients', to: '/en/integrations' },
					{ from: '/en/interfaces', to: '/en/interfaces/overview' },
					{ from: '/en/native-protocol', to: '/en/native-protocol/basics' },
					{ from: '/en/manage/users', to: '/en/operations/access-rights' },
					{ from: '/en/manage', to: '/en/operations/access-rights' },
					{
						from: '/en/manage/configuration',
						to: '/en/operations/configuration-files',
					},
					{
						from: '/en/manage/replication-and-sharding',
						to: '/en/guides/sre/keeper/clickhouse-keeper',
					},
					{
						from: '/en/integrations/sql-clients/datagrip',
						to: '/en/integrations/datagrip',
					},
					{
						from: '/en/integrations/sql-clients/dbeaver',
						to: '/en/integrations/dbeaver',
					},
					{
						from: '/en/integrations/sql-clients/jupysql',
						to: '/en/integrations/jupysql',
					},
					{
						from: '/en/integrations/sql-clients/tablum.io',
						to: '/en/integrations/tablumio',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-layout',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-lifetime',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-sources',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-structure',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-hierarchical',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/external-dicts-dict-polygon',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/external-dictionaries/regexp-tree',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql-reference/dictionaries/internal-dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/operations/clickhouse-keeper/',
						to: '/en/guides/sre/keeper/clickhouse-keeper',
					},
					{
						from: '/en/connect-a-ui/grafana-and-clickhouse',
						to: '/en/integrations/grafana',
					},
					{
						from: '/en/connect-a-ui/metabase-and-clickhouse',
						to: '/en/integrations/metabase',
					},
					{
						from: '/en/connect-a-ui/rocketbi-and-clickhouse',
						to: '/en/integrations/rocketbi',
					},
					{
						from: '/en/connect-a-ui/superset-and-clickhouse',
						to: '/en/integrations/superset',
					},
					{
						from: '/en/connect-a-ui/tableau-and-clickhouse',
						to: '/en/integrations/tableau',
					},
					{
						from: '/en/integrations/language-clients/python/intro',
						to: '/en/integrations/python',
					},
					{
						from: '/en/integrations/language-clients/python/driver-api',
						to: '/en/integrations/python',
					},
					{
						from: '/en/integrations/language-clients/python/queries',
						to: '/en/integrations/python',
					},
					{
						from: '/en/integrations/language-clients/python/inserts',
						to: '/en/integrations/python',
					},
					{
						from: '/en/integrations/language-clients/python/options',
						to: '/en/integrations/python',
					},
					{ from: '/en/integrations/go/intro', to: '/en/integrations/go' },
					{
						from: '/en/integrations/go/choosing-a-client',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go/introduction',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go/installation',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go/clickhouse-api',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go/database-sql-api',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/go/clickhouse-go/performance-tips',
						to: '/en/integrations/go',
					},
					{
						from: '/en/integrations/language-clients/java',
						to: '/en/integrations/java',
					},
					{
						from: '/en/integrations/language-clients/java/jdbc',
						to: '/en/integrations/java',
					},
					{
						from: '/en/integrations/language-clients/java/client',
						to: '/en/integrations/java',
					},
					{
						from: '/en/integrations/language-clients/java/r2dbc',
						to: '/en/integrations/java',
					},
					{
						from: '/en/integrations/redshift/migrate-redshift-to-clickhouse',
						to: '/en/integrations/redshift',
					},
					{
						from: '/en/integrations/redshift/redshift-push-to-clickhouse',
						to: '/en/integrations/redshift',
					},
					{
						from: '/en/integrations/redshift/redshift-pull-to-clickhouse',
						to: '/en/integrations/redshift',
					},
					{
						from: '/en/integrations/redshift/redshift-pivot-to-clickhouse',
						to: '/en/integrations/redshift',
					},
					{
						from: '/en/integrations/nifi-and-clickhouse',
						to: '/en/integrations/nifi',
					},
					{
						from: '/en/integrations/kafka/intro',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-choosing-an-approach',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-table-engine',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/self-managed',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/self-managed/connect-sink',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/self-managed/jdbc',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/self-managed/vector',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/cloud',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/cloud/confluent',
						to: '/en/integrations/kafka',
					},
					{ from: '/en/integrations/s3/s3-intro', to: '/en/integrations/s3' },
					{
						from: '/en/integrations/s3/s3-table-functions',
						to: '/en/integrations/s3',
					},
					{
						from: '/en/integrations/s3/s3-table-engine',
						to: '/en/integrations/s3',
					},
					{
						from: '/en/integrations/s3/s3-merge-tree',
						to: '/en/integrations/s3',
					},
					{
						from: '/en/integrations/s3/s3-optimizing-performance',
						to: '/en/integrations/s3',
					},
					{
						from: '/en/guides/sre/configuring-s3-for-clickhouse-use',
						to: '/en/integrations/s3',
					},
					{ from: '/en/guides/sre/s3-multi-region', to: '/en/integrations/s3' },
					{
						from: '/en/guides/sre/gcs-multi-region',
						to: '/en/integrations/gcs',
					},
					{
						from: '/en/integrations/s3/gcs-merge-tree',
						to: '/en/integrations/gcs',
					},
					{
						from: '/en/integrations/s3/s3-minio',
						to: '/en/integrations/minio',
					},
					{
						from: '/en/integrations/kafka/cloud/amazon-msk/',
						to: '/en/integrations/msk',
					},
					{
						from: '/en/integrations/vector-to-clickhouse',
						to: '/en/integrations/vector',
					},
					{
						from: '/en/integrations/airbyte-and-clickhouse',
						to: '/en/integrations/airbyte',
					},
					{
						from: '/en/integrations/postgresql/postgres-with-clickhouse',
						to: '/en/integrations/postgresql',
					},
					{
						from: '/en/integrations/postgresql/postgres-with-clickhouse-database-engine',
						to: '/en/integrations/postgresql',
					},
					{ from: '/en/integrations/mqtt', to: '/en/integrations/emqx' },
					{
						from: '/en/integrations/emqx/emqx-intro',
						to: '/en/integrations/emqx',
					},
					{
						from: '/en/integrations/emqx/clickhouse-service-set-up',
						to: '/en/integrations/emqx',
					},
					{
						from: '/en/integrations/emqx/create-emqx-cloud-deployment',
						to: '/en/integrations/emqx',
					},
					{
						from: '/en/integrations/emqx/emqx-cloud-data-integration',
						to: '/en/integrations/emqx',
					},
					{
						from: '/en/integrations/emqx/workflow-samples',
						to: '/en/integrations/emqx',
					},
					{
						from: '/en/integrations/dbt/dbt-intro',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-setup',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-connecting',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-view-model',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-table-model',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-incremental-model',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-snapshot',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-seeds',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/integrations/dbt/dbt-limitations',
						to: '/en/integrations/dbt',
					},
					{
						from: '/en/development',
						to: '/en/development/developer-instruction',
					},
					{
						from: '/en/guides/sre/keeper/clickhouse-keeper-uuid',
						to: '/en/guides/sre/keeper/clickhouse-keeper',
					},
					{
						from: '/en/guides/sre/user-management/alter-permissions',
						to: '/en/operations/access-rights',
					},
					{
						from: '/en/guides/sre/users-and-roles',
						to: '/en/operations/access-rights',
					},
					{
						from: '/en/integrations/data-formats/parquet-arrow-avro-orc',
						to: '/en/integrations/data-formats/parquet',
					},
					{
						from: '/en/integrations/mysql/mysql-with-clickhouse',
						to: '/en/integrations/mysql',
					},
					{
						from: '/en/integrations/mysql/mysql-with-clickhouse-database-engine',
						to: '/en/integrations/mysql',
					},
					{
						from: '/en/guides/developer/working-with-json',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/guides/developer/working-with-json/json-intro',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/guides/developer/working-with-json/json-load-data',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/guides/developer/working-with-json/json-other-approaches',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/guides/developer/working-with-json/json-semi-structured',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/guides/developer/working-with-json/json-structured',
						to: '/en/integrations/data-formats/json',
					},
					{
						from: '/en/get-started/sql-console/opening',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/get-started/sql-console/exploring-tables',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/get-started/sql-console/filtering',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/get-started/sql-console/creating',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/get-started/sql-console/advanced',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/get-started/sql-console/visualizing',
						to: '/en/get-started/sql-console',
					},
					{
						from: '/en/connect-a-ui',
						to: '/en/integrations/data-visualization',
					},
					{
						from: '/en/development/browse_code',
						to: '/en/development/developer-instruction',
					},
					{
						from: '/en/development/browse-code',
						to: '/en/development/developer-instruction',
					},
					{
						from: '/en/development/build_cross_arm',
						to: '/en/development/build-cross-arm',
					},
					{
						from: '/en/development/build_cross_osx',
						to: '/en/development/build-cross-osx',
					},
					{
						from: '/en/development/build_osx',
						to: '/en/development/build-osx',
					},
					{
						from: '/en/development/developer_instruction',
						to: '/en/development/developer-instruction',
					},
					{
						from: '/en/database_engines/',
						to: '/en/engines/database-engines/',
					},
					{
						from: '/en/engines/database_engines/',
						to: '/en/engines/database-engines/',
					},
					{
						from: '/en/database_engines/lazy',
						to: '/en/engines/database-engines/lazy',
					},
					{
						from: '/en/engines/database_engines/lazy',
						to: '/en/engines/database-engines/lazy',
					},
					{
						from: '/en/database_engines/mysql',
						to: '/en/engines/database-engines/mysql',
					},
					{
						from: '/en/engines/database_engines/mysql',
						to: '/en/engines/database-engines/mysql',
					},
					{
						from: '/en/engines/table_engines/',
						to: '/en/engines/table-engines/',
					},
					{
						from: '/en/guides/developer/full-text-search',
						to: '/en/engines/table-engines/mergetree-family/invertedindexes',
					},
					{ from: '/en/operations/troubleshooting/', to: '/knowledgebase' },
					{
						from: '/en/operations/table_engines/',
						to: '/en/engines/table-engines/',
					},
					{
						from: '/en/engines/table_engines/integrations/',
						to: '/en/engines/table-engines/integrations/',
					},
					{
						from: '/en/engines/table_engines/integrations/hdfs',
						to: '/en/engines/table-engines/integrations/hdfs',
					},
					{
						from: '/en/operations/table_engines/hdfs',
						to: '/en/engines/table-engines/integrations/hdfs',
					},
					{
						from: '/en/engines/table_engines/integrations/jdbc',
						to: '/en/engines/table-engines/integrations/jdbc',
					},
					{
						from: '/en/operations/table_engines/jdbc',
						to: '/en/engines/table-engines/integrations/jdbc',
					},
					{
						from: '/en/integrations/kafka/kafka-connect-jdbc',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-vector',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/clickhouse-kafka-connect-sink',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/engines/table_engines/integrations/kafka',
						to: '/en/engines/table-engines/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-connect-http',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-connect-options',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/operations/table_engines/kafka',
						to: '/en/engines/table-engines/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kakfa-intro',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/integrations/kafka/kafka-connect-intro',
						to: '/en/integrations/kafka',
					},
					{
						from: '/en/engines/table_engines/integrations/mysql',
						to: '/en/engines/table-engines/integrations/mysql',
					},
					{
						from: '/en/operations/table_engines/mysql',
						to: '/en/engines/table-engines/integrations/mysql',
					},
					{
						from: '/en/engines/table_engines/integrations/odbc',
						to: '/en/engines/table-engines/integrations/odbc',
					},
					{
						from: '/en/operations/table_engines/odbc',
						to: '/en/engines/table-engines/integrations/odbc',
					},
					{
						from: '/en/engines/table-engines/log-family/log-family',
						to: '/en/engines/table-engines/log-family/',
					},
					{
						from: '/en/engines/table_engines/log_family/',
						to: '/en/engines/table-engines/log-family/',
					},
					{
						from: '/en/engines/table_engines/log_family/log',
						to: '/en/engines/table-engines/log-family/log',
					},
					{
						from: '/en/operations/table_engines/log',
						to: '/en/engines/table-engines/log-family/log',
					},
					{
						from: '/en/engines/table_engines/log_family/stripelog',
						to: '/en/engines/table-engines/log-family/stripelog',
					},
					{
						from: '/en/operations/table_engines/stripelog',
						to: '/en/engines/table-engines/log-family/stripelog',
					},
					{
						from: '/en/engines/table_engines/log_family/tinylog',
						to: '/en/engines/table-engines/log-family/tinylog',
					},
					{
						from: '/en/operations/table_engines/tinylog',
						to: '/en/engines/table-engines/log-family/tinylog',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/',
						to: '/en/engines/table-engines/mergetree-family/',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/aggregatingmergetree',
						to: '/en/engines/table-engines/mergetree-family/aggregatingmergetree',
					},
					{
						from: '/en/operations/table_engines/aggregatingmergetree',
						to: '/en/engines/table-engines/mergetree-family/aggregatingmergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/collapsingmergetree',
						to: '/en/engines/table-engines/mergetree-family/collapsingmergetree',
					},
					{
						from: '/en/operations/table_engines/collapsingmergetree',
						to: '/en/engines/table-engines/mergetree-family/collapsingmergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/custom_partitioning_key',
						to: '/en/engines/table-engines/mergetree-family/custom-partitioning-key',
					},
					{
						from: '/en/operations/table_engines/custom_partitioning_key',
						to: '/en/engines/table-engines/mergetree-family/custom-partitioning-key',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/graphitemergetree',
						to: '/en/engines/table-engines/mergetree-family/graphitemergetree',
					},
					{
						from: '/en/operations/table_engines/graphitemergetree',
						to: '/en/engines/table-engines/mergetree-family/graphitemergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/mergetree',
						to: '/en/engines/table-engines/mergetree-family/mergetree',
					},
					{
						from: '/en/operations/table_engines/mergetree',
						to: '/en/engines/table-engines/mergetree-family/mergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/replacingmergetree',
						to: '/en/engines/table-engines/mergetree-family/replacingmergetree',
					},
					{
						from: '/en/operations/table_engines/replacingmergetree',
						to: '/en/engines/table-engines/mergetree-family/replacingmergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/replication',
						to: '/en/engines/table-engines/mergetree-family/replication',
					},
					{
						from: '/en/operations/table_engines/replication',
						to: '/en/engines/table-engines/mergetree-family/replication',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/summingmergetree',
						to: '/en/engines/table-engines/mergetree-family/summingmergetree',
					},
					{
						from: '/en/operations/table_engines/summingmergetree',
						to: '/en/engines/table-engines/mergetree-family/summingmergetree',
					},
					{
						from: '/en/engines/table_engines/mergetree_family/versionedcollapsingmergetree',
						to: '/en/engines/table-engines/mergetree-family/versionedcollapsingmergetree',
					},
					{
						from: '/en/operations/table_engines/versionedcollapsingmergetree',
						to: '/en/engines/table-engines/mergetree-family/versionedcollapsingmergetree',
					},
					{
						from: '/en/engines/table_engines/special/',
						to: '/en/engines/table-engines/special/',
					},
					{
						from: '/en/engines/table_engines/special/buffer',
						to: '/en/engines/table-engines/special/buffer',
					},
					{
						from: '/en/operations/table_engines/buffer',
						to: '/en/engines/table-engines/special/buffer',
					},
					{
						from: '/en/engines/table_engines/special/dictionary',
						to: '/en/engines/table-engines/special/dictionary',
					},
					{
						from: '/en/operations/table_engines/dictionary',
						to: '/en/engines/table-engines/special/dictionary',
					},
					{
						from: '/en/engines/table_engines/special/distributed',
						to: '/en/engines/table-engines/special/distributed',
					},
					{
						from: '/en/operations/table_engines/distributed',
						to: '/en/engines/table-engines/special/distributed',
					},
					{
						from: '/en/engines/table_engines/special/external_data',
						to: '/en/engines/table-engines/special/external-data',
					},
					{
						from: '/en/operations/table_engines/external_data',
						to: '/en/engines/table-engines/special/external-data',
					},
					{
						from: '/en/engines/table_engines/special/file',
						to: '/en/engines/table-engines/special/file',
					},
					{
						from: '/en/operations/table_engines/file',
						to: '/en/engines/table-engines/special/file',
					},
					{
						from: '/en/engines/table_engines/special/generate',
						to: '/en/engines/table-engines/special/generate',
					},
					{
						from: '/en/operations/table_engines/generate',
						to: '/en/engines/table-engines/special/generate',
					},
					{
						from: '/en/engines/table_engines/special/join',
						to: '/en/engines/table-engines/special/join',
					},
					{
						from: '/en/operations/table_engines/join',
						to: '/en/engines/table-engines/special/join',
					},
					{
						from: '/en/engines/table_engines/special/materializedview',
						to: '/en/engines/table-engines/special/materializedview',
					},
					{
						from: '/en/operations/table_engines/materializedview',
						to: '/en/engines/table-engines/special/materializedview',
					},
					{
						from: '/en/engines/table_engines/special/memory',
						to: '/en/engines/table-engines/special/memory',
					},
					{
						from: '/en/operations/table_engines/memory',
						to: '/en/engines/table-engines/special/memory',
					},
					{
						from: '/en/engines/table_engines/special/merge',
						to: '/en/engines/table-engines/special/merge',
					},
					{
						from: '/en/operations/table_engines/merge',
						to: '/en/engines/table-engines/special/merge',
					},
					{
						from: '/en/engines/table_engines/special/null',
						to: '/en/engines/table-engines/special/null',
					},
					{
						from: '/en/operations/table_engines/null',
						to: '/en/engines/table-engines/special/null',
					},
					{
						from: '/en/engines/table_engines/special/set',
						to: '/en/engines/table-engines/special/set',
					},
					{
						from: '/en/operations/table_engines/set',
						to: '/en/engines/table-engines/special/set',
					},
					{
						from: '/en/engines/table_engines/special/url',
						to: '/en/engines/table-engines/special/url',
					},
					{
						from: '/en/operations/table_engines/url',
						to: '/en/engines/table-engines/special/url',
					},
					{
						from: '/en/engines/table_engines/special/view',
						to: '/en/engines/table-engines/special/view',
					},
					{
						from: '/en/operations/table_engines/view',
						to: '/en/engines/table-engines/special/view',
					},
					{
						from: '/en/introduction/possible_silly_questions',
						to: '/knowledgebase',
					},
					{ from: '/en/getting_started/', to: '/en/quick-start' },
					{ from: '/en/getting-started/', to: '/en/quick-start' },
					{
						from: '/en/guides/ingest/tab_separated_values',
						to: '/en/getting-started/example-datasets/nypd_complaint_data',
					},
					{
						from: '/en/getting_started/example_datasets/',
						to: '/en/getting-started/example-datasets/',
					},
					{
						from: '/en/getting_started/example_datasets/amplab_benchmark',
						to: '/en/getting-started/example-datasets/amplab-benchmark',
					},
					{
						from: '/en/getting_started/example_datasets/criteo',
						to: '/en/getting-started/example-datasets/criteo',
					},
					{
						from: '/en/getting_started/example_datasets/metrica',
						to: '/en/getting-started/example-datasets/metrica',
					},
					{
						from: '/en/getting_started/example_datasets/nyc_taxi',
						to: '/en/getting-started/example-datasets/nyc-taxi',
					},
					{
						from: '/en/getting_started/example_datasets/ontime',
						to: '/en/getting-started/example-datasets/ontime',
					},
					{
						from: '/en/getting_started/example_datasets/star_schema',
						to: '/en/getting-started/example-datasets/star-schema',
					},
					{
						from: '/en/getting_started/example_datasets/wikistat',
						to: '/en/getting-started/example-datasets/wikistat',
					},
					{ from: '/en/getting_started/install', to: '/en/install' },
					{ from: '/en/operations/requirements', to: '/en/install' },
					{
						from: '/en/getting_started/playground',
						to: '/en/getting-started/playground',
					},
					{ from: '/en/getting_started/tutorial', to: '/en/tutorial' },
					{ from: '/en/guide/', to: '/en/whats-new/cloud-compatibility' },
					{
						from: '/en/guides/apply_catboost_model',
						to: '/en/sql-reference/functions/other-functions',
					},
					{
						from: '/en/guides/developer/apply-catboost-model',
						to: '/en/sql-reference/functions/other-functions',
					},
					{ from: '/en/commercial/cloud', to: '/en/cloud/overview' },
					{ from: '/en/formats', to: '/en/interfaces/formats' },
					{ from: '/en/formats/capnproto', to: '/en/interfaces/formats' },
					{ from: '/en/formats/csv', to: '/en/interfaces/formats' },
					{ from: '/en/formats/csvwithnames', to: '/en/interfaces/formats' },
					{ from: '/en/formats/json', to: '/en/interfaces/formats' },
					{ from: '/en/formats/jsoncompact', to: '/en/interfaces/formats' },
					{ from: '/en/formats/jsoneachrow', to: '/en/interfaces/formats' },
					{ from: '/en/formats/native', to: '/en/interfaces/formats' },
					{ from: '/en/formats/null', to: '/en/interfaces/formats' },
					{ from: '/en/formats/pretty', to: '/en/interfaces/formats' },
					{ from: '/en/formats/prettycompact', to: '/en/interfaces/formats' },
					{
						from: '/en/formats/prettycompactmonoblock',
						to: '/en/interfaces/formats',
					},
					{ from: '/en/formats/prettynoescapes', to: '/en/interfaces/formats' },
					{ from: '/en/formats/prettyspace', to: '/en/interfaces/formats' },
					{ from: '/en/formats/rowbinary', to: '/en/interfaces/formats' },
					{ from: '/en/formats/tabseparated', to: '/en/interfaces/formats' },
					{ from: '/en/formats/tabseparatedraw', to: '/en/interfaces/formats' },
					{
						from: '/en/formats/tabseparatedwithnames',
						to: '/en/interfaces/formats',
					},
					{
						from: '/en/formats/tabseparatedwithnamesandtypes',
						to: '/en/interfaces/formats',
					},
					{ from: '/en/formats/tskv', to: '/en/interfaces/formats' },
					{ from: '/en/formats/values', to: '/en/interfaces/formats' },
					{ from: '/en/formats/vertical', to: '/en/interfaces/formats' },
					{ from: '/en/formats/verticalraw', to: '/en/interfaces/formats' },
					{ from: '/en/formats/xml', to: '/en/interfaces/formats' },
					{ from: '/en/interfaces/http_interface', to: '/en/interfaces/http' },
					{
						from: '/en/interfaces/third_party/',
						to: '/en/interfaces/third-party/',
					},
					{
						from: '/en/interfaces/third-party/client_libraries',
						to: '/en/interfaces/third-party/client-libraries',
					},
					{
						from: '/en/interfaces/third-party_client_libraries',
						to: '/en/interfaces/third-party/client-libraries',
					},
					{
						from: '/en/interfaces/third-party_gui',
						to: '/en/interfaces/third-party/gui',
					},
					{
						from: '/en/introduction/distinctive_features',
						to: '/en/about-us/distinctive-features',
					},
					{
						from: '/en/introduction/features_considered_disadvantages',
						to: '/en/about-us/distinctive-features',
					},
					{
						from: '/en/introduction/ya_metrika_task',
						to: '/en/about-us/history',
					},
					{
						from: '/en/operations/access_rights',
						to: '/en/operations/access-rights',
					},
					{
						from: '/en/guides/sre/user-management/access-rights',
						to: '/en/operations/access-rights',
					},
					{
						from: '/en/operations/configuration_files',
						to: '/en/operations/configuration-files',
					},
					{
						from: '/en/operations/optimizing_performance/',
						to: '/en/operations/optimizing-performance/',
					},
					{
						from: '/en/operations/optimizing_performance/sampling_query_profiler',
						to: '/en/operations/optimizing-performance/sampling-query-profiler',
					},
					{
						from: '/en/operations/performance/sampling_query_profiler',
						to: '/en/operations/optimizing-performance/sampling-query-profiler',
					},
					{
						from: '/en/operations/performance_test',
						to: '/en/operations/performance-test',
					},
					{
						from: '/en/operations/server_configuration_parameters/',
						to: '/en/operations/server-configuration-parameters/',
					},
					{
						from: '/en/operations/server_settings/',
						to: '/en/operations/server-configuration-parameters/',
					},
					{
						from: '/en/operations/server_configuration_parameters/settings',
						to: '/en/operations/server-configuration-parameters/settings',
					},
					{
						from: '/en/operations/server_settings/settings',
						to: '/en/operations/server-configuration-parameters/settings',
					},
					{
						from: '/en/operations/settings/constraints_on_settings',
						to: '/en/operations/settings/constraints-on-settings',
					},
					{
						from: '/en/operations/settings/permissions_for_queries',
						to: '/en/operations/settings/permissions-for-queries',
					},
					{
						from: '/en/operations/settings/query_complexity',
						to: '/en/operations/settings/query-complexity',
					},
					{
						from: '/en/operations/settings/settings_profiles',
						to: '/en/operations/settings/settings-profiles',
					},
					{
						from: '/en/operations/settings/settings_users',
						to: '/en/operations/settings/settings-users',
					},
					{
						from: '/en/operations/system_tables',
						to: '/en/operations/system-tables/',
					},
					{ from: '/en/system_tables', to: '/en/operations/system-tables/' },
					{
						from: '/en/system_tables/system.asynchronous_metrics',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.clusters',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.columns',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.databases',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.dictionaries',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.events',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.functions',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.merges',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.metrics',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.numbers',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.numbers_mt',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.one',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.parts',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.processes',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.replicas',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.settings',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.tables',
						to: '/en/operations/system-tables/',
					},
					{
						from: '/en/system_tables/system.zookeeper',
						to: '/en/operations/system-tables/',
					},
					{ from: '/en/operations/utils/', to: '/en/operations/utilities/' },
					{
						from: '/en/operations/utils/clickhouse-benchmark',
						to: '/en/operations/utilities/clickhouse-benchmark',
					},
					{
						from: '/en/operations/utils/clickhouse-copier',
						to: '/en/operations/utilities/clickhouse-copier',
					},
					{
						from: '/en/operations/utils/clickhouse-local',
						to: '/en/operations/utilities/clickhouse-local',
					},
					{ from: '/en/utils', to: '/en/operations/utilities/' },
					{
						from: '/en/utils/clickhouse-copier',
						to: '/en/operations/utilities/clickhouse-copier',
					},
					{
						from: '/en/utils/clickhouse-local',
						to: '/en/operations/utilities/clickhouse-local',
					},
					{ from: '/en/query_language/', to: '/en/sql-reference' },
					// { from: '/en/sql_reference/', to: '/en/sql-reference/index' },
					{
						from: '/en/query_language/agg_functions/',
						to: '/en/sql-reference/aggregate-functions/',
					},
					{
						from: '/en/sql_reference/aggregate_functions/',
						to: '/en/sql-reference/aggregate-functions/',
					},
					{
						from: '/en/query_language/agg_functions/combinators',
						to: '/en/sql-reference/aggregate-functions/combinators',
					},
					{
						from: '/en/sql_reference/aggregate_functions/combinators',
						to: '/en/sql-reference/aggregate-functions/combinators',
					},
					{
						from: '/en/query_language/agg_functions/parametric_functions',
						to: '/en/sql-reference/aggregate-functions/parametric-functions',
					},
					{
						from: '/en/sql_reference/aggregate_functions/parametric_functions',
						to: '/en/sql-reference/aggregate-functions/parametric-functions',
					},
					{
						from: '/en/query_language/agg_functions/reference',
						to: '/en/sql-reference/aggregate-functions/reference',
					},
					{
						from: '/en/sql_reference/aggregate_functions/reference',
						to: '/en/sql-reference/aggregate-functions/reference',
					},
					{ from: '/en/sql_reference/ansi', to: '/en/sql-reference/ansi' },
					{ from: '/en/data_types/', to: '/en/sql-reference/data-types/' },
					{
						from: '/en/sql_reference/data_types/',
						to: '/en/sql-reference/data-types/',
					},
					{
						from: '/en/data_types/nested_data_structures/aggregatefunction',
						to: '/en/sql-reference/data-types/aggregatefunction',
					},
					{
						from: '/en/sql_reference/data_types/aggregatefunction',
						to: '/en/sql-reference/data-types/aggregatefunction',
					},
					{
						from: '/en/data_types/array',
						to: '/en/sql-reference/data-types/array',
					},
					{
						from: '/en/sql_reference/data_types/array',
						to: '/en/sql-reference/data-types/array',
					},
					{
						from: '/en/data_types/boolean',
						to: '/en/sql-reference/data-types/boolean',
					},
					{
						from: '/en/sql_reference/data_types/boolean',
						to: '/en/sql-reference/data-types/boolean',
					},
					{
						from: '/en/data_types/date',
						to: '/en/sql-reference/data-types/date',
					},
					{
						from: '/en/sql_reference/data_types/date',
						to: '/en/sql-reference/data-types/date',
					},
					{
						from: '/en/data_types/datetime',
						to: '/en/sql-reference/data-types/datetime',
					},
					{
						from: '/en/sql_reference/data_types/datetime',
						to: '/en/sql-reference/data-types/datetime',
					},
					{
						from: '/en/data_types/datetime64',
						to: '/en/sql-reference/data-types/datetime64',
					},
					{
						from: '/en/sql_reference/data_types/datetime64',
						to: '/en/sql-reference/data-types/datetime64',
					},
					{
						from: '/en/data_types/decimal',
						to: '/en/sql-reference/data-types/decimal',
					},
					{
						from: '/en/sql_reference/data_types/decimal',
						to: '/en/sql-reference/data-types/decimal',
					},
					{
						from: '/en/sql-reference/data-types/domains/overview',
						to: '/en/sql-reference/data-types/domains/',
					},
					{
						from: '/en/sql_reference/data_types/domains/',
						to: '/en/sql-reference/data-types/domains/',
					},
					{
						from: '/en/data_types/domains/ipv4',
						to: '/en/sql-reference/data-types/domains/ipv4',
					},
					{
						from: '/en/sql_reference/data_types/domains/ipv4',
						to: '/en/sql-reference/data-types/domains/ipv4',
					},
					{
						from: '/en/data_types/domains/ipv6',
						to: '/en/sql-reference/data-types/domains/ipv6',
					},
					{
						from: '/en/sql_reference/data_types/domains/ipv6',
						to: '/en/sql-reference/data-types/domains/ipv6',
					},
					{
						from: '/en/data_types/domains/overview',
						to: '/en/sql-reference/data-types/domains/',
					},
					{
						from: '/en/sql_reference/data_types/domains/overview',
						to: '/en/sql-reference/data-types/domains/',
					},
					{
						from: '/en/data_types/enum',
						to: '/en/sql-reference/data-types/enum',
					},
					{
						from: '/en/sql_reference/data_types/enum',
						to: '/en/sql-reference/data-types/enum',
					},
					{
						from: '/en/data_types/fixedstring',
						to: '/en/sql-reference/data-types/fixedstring',
					},
					{
						from: '/en/sql_reference/data_types/fixedstring',
						to: '/en/sql-reference/data-types/fixedstring',
					},
					{
						from: '/en/data_types/float',
						to: '/en/sql-reference/data-types/float',
					},
					{
						from: '/en/sql_reference/data_types/float',
						to: '/en/sql-reference/data-types/float',
					},
					{
						from: '/en/data_types/int_uint',
						to: '/en/sql-reference/data-types/int-uint',
					},
					{
						from: '/en/sql_reference/data_types/int_uint',
						to: '/en/sql-reference/data-types/int-uint',
					},
					{
						from: '/en/data_types/nested_data_structures/',
						to: '/en/sql-reference/data-types/nested-data-structures/nested',
					},
					{
						from: '/en/sql_reference/data_types/nested_data_structures/',
						to: '/en/sql-reference/data-types/nested-data-structures/nested',
					},
					{
						from: '/en/data_types/nested_data_structures/nested',
						to: '/en/sql-reference/data-types/nested-data-structures/nested',
					},
					{
						from: '/en/sql_reference/data_types/nested_data_structures/nested',
						to: '/en/sql-reference/data-types/nested-data-structures/nested',
					},
					{
						from: '/en/data_types/nullable',
						to: '/en/sql-reference/data-types/nullable',
					},
					{
						from: '/en/sql_reference/data_types/nullable',
						to: '/en/sql-reference/data-types/nullable',
					},
					{
						from: '/en/sql_reference/data_types/simpleaggregatefunction',
						to: '/en/sql-reference/data-types/simpleaggregatefunction',
					},
					{
						from: '/en/data_types/special_data_types/',
						to: '/en/sql-reference/data-types/special-data-types/',
					},
					{
						from: '/en/sql_reference/data_types/special_data_types/',
						to: '/en/sql-reference/data-types/special-data-types/',
					},
					{
						from: '/en/data_types/special_data_types/expression',
						to: '/en/sql-reference/data-types/special-data-types/expression',
					},
					{
						from: '/en/sql_reference/data_types/special_data_types/expression',
						to: '/en/sql-reference/data-types/special-data-types/expression',
					},
					{
						from: '/en/data_types/special_data_types/interval',
						to: '/en/sql-reference/data-types/special-data-types/interval',
					},
					{
						from: '/en/sql_reference/data_types/special_data_types/interval',
						to: '/en/sql-reference/data-types/special-data-types/interval',
					},
					{
						from: '/en/data_types/special_data_types/nothing',
						to: '/en/sql-reference/data-types/special-data-types/nothing',
					},
					{
						from: '/en/sql_reference/data_types/special_data_types/nothing',
						to: '/en/sql-reference/data-types/special-data-types/nothing',
					},
					{
						from: '/en/data_types/special_data_types/set',
						to: '/en/sql-reference/data-types/special-data-types/set',
					},
					{
						from: '/en/sql_reference/data_types/special_data_types/set',
						to: '/en/sql-reference/data-types/special-data-types/set',
					},
					{
						from: '/en/data_types/string',
						to: '/en/sql-reference/data-types/string',
					},
					{
						from: '/en/sql_reference/data_types/string',
						to: '/en/sql-reference/data-types/string',
					},
					{
						from: '/en/data_types/tuple',
						to: '/en/sql-reference/data-types/tuple',
					},
					{
						from: '/en/sql_reference/data_types/tuple',
						to: '/en/sql-reference/data-types/tuple',
					},
					{
						from: '/en/data_types/uuid',
						to: '/en/sql-reference/data-types/uuid',
					},
					{
						from: '/en/sql_reference/data_types/uuid',
						to: '/en/sql-reference/data-types/uuid',
					},
					{
						from: '/en/query_language/dicts/',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict_hierarchical',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict_hierarchical',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict_layout',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict_layout',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict_lifetime',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict_lifetime',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict_sources',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict_sources',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/external_dicts_dict_structure',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/external_dictionaries/external_dicts_dict_structure',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/dicts/internal_dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/sql_reference/dictionaries/internal_dicts',
						to: '/en/sql-reference/dictionaries',
					},
					{
						from: '/en/query_language/functions/',
						to: '/en/sql-reference/functions/',
					},
					{
						from: '/en/sql_reference/functions/',
						to: '/en/sql-reference/functions/',
					},
					{
						from: '/en/query_language/functions/arithmetic_functions',
						to: '/en/sql-reference/functions/arithmetic-functions',
					},
					{
						from: '/en/sql_reference/functions/arithmetic_functions',
						to: '/en/sql-reference/functions/arithmetic-functions',
					},
					{
						from: '/en/query_language/functions/array_functions',
						to: '/en/sql-reference/functions/array-functions',
					},
					{
						from: '/en/sql_reference/functions/array_functions',
						to: '/en/sql-reference/functions/array-functions',
					},
					{
						from: '/en/query_language/functions/array_join',
						to: '/en/sql-reference/functions/array-join',
					},
					{
						from: '/en/sql_reference/functions/array_join',
						to: '/en/sql-reference/functions/array-join',
					},
					{
						from: '/en/query_language/functions/bit_functions',
						to: '/en/sql-reference/functions/bit-functions',
					},
					{
						from: '/en/sql_reference/functions/bit_functions',
						to: '/en/sql-reference/functions/bit-functions',
					},
					{
						from: '/en/query_language/functions/bitmap_functions',
						to: '/en/sql-reference/functions/bitmap-functions',
					},
					{
						from: '/en/sql_reference/functions/bitmap_functions',
						to: '/en/sql-reference/functions/bitmap-functions',
					},
					{
						from: '/en/query_language/functions/comparison_functions',
						to: '/en/sql-reference/functions/comparison-functions',
					},
					{
						from: '/en/sql_reference/functions/comparison_functions',
						to: '/en/sql-reference/functions/comparison-functions',
					},
					{
						from: '/en/query_language/functions/conditional_functions',
						to: '/en/sql-reference/functions/conditional-functions',
					},
					{
						from: '/en/sql_reference/functions/conditional_functions',
						to: '/en/sql-reference/functions/conditional-functions',
					},
					{
						from: '/en/query_language/functions/date_time_functions',
						to: '/en/sql-reference/functions/date-time-functions',
					},
					{
						from: '/en/sql_reference/functions/date_time_functions',
						to: '/en/sql-reference/functions/date-time-functions',
					},
					{
						from: '/en/query_language/functions/encoding_functions',
						to: '/en/sql-reference/functions/encoding-functions',
					},
					{
						from: '/en/sql_reference/functions/encoding_functions',
						to: '/en/sql-reference/functions/encoding-functions',
					},
					{
						from: '/en/query_language/functions/ext_dict_functions',
						to: '/en/sql-reference/functions/ext-dict-functions',
					},
					{
						from: '/en/sql_reference/functions/ext_dict_functions',
						to: '/en/sql-reference/functions/ext-dict-functions',
					},
					{
						from: '/en/query_language/functions/functions_for_nulls',
						to: '/en/sql-reference/functions/functions-for-nulls',
					},
					{
						from: '/en/sql_reference/functions/functions_for_nulls',
						to: '/en/sql-reference/functions/functions-for-nulls',
					},
					{
						from: '/en/query_language/functions/geo',
						to: '/en/sql-reference/functions/geo/',
					},
					{
						from: '/en/sql_reference/functions/geo',
						to: '/en/sql-reference/functions/geo/',
					},
					{
						from: '/en/query_language/functions/hash_functions',
						to: '/en/sql-reference/functions/hash-functions',
					},
					{
						from: '/en/sql_reference/functions/hash_functions',
						to: '/en/sql-reference/functions/hash-functions',
					},
					{
						from: '/en/query_language/functions/in_functions',
						to: '/en/sql-reference/functions/in-functions',
					},
					{
						from: '/en/sql_reference/functions/in_functions',
						to: '/en/sql-reference/functions/in-functions',
					},
					{
						from: '/en/query_language/functions/introspection',
						to: '/en/sql-reference/functions/introspection',
					},
					{
						from: '/en/sql_reference/functions/introspection',
						to: '/en/sql-reference/functions/introspection',
					},
					{
						from: '/en/query_language/functions/ip_address_functions',
						to: '/en/sql-reference/functions/ip-address-functions',
					},
					{
						from: '/en/sql_reference/functions/ip_address_functions',
						to: '/en/sql-reference/functions/ip-address-functions',
					},
					{
						from: '/en/query_language/functions/json_functions',
						to: '/en/sql-reference/functions/json-functions',
					},
					{
						from: '/en/sql_reference/functions/json_functions',
						to: '/en/sql-reference/functions/json-functions',
					},
					{
						from: '/en/query_language/functions/logical_functions',
						to: '/en/sql-reference/functions/logical-functions',
					},
					{
						from: '/en/sql_reference/functions/logical_functions',
						to: '/en/sql-reference/functions/logical-functions',
					},
					{
						from: '/en/query_language/functions/machine_learning_functions',
						to: '/en/sql-reference/functions/machine-learning-functions',
					},
					{
						from: '/en/sql_reference/functions/machine_learning_functions',
						to: '/en/sql-reference/functions/machine-learning-functions',
					},
					{
						from: '/en/query_language/functions/math_functions',
						to: '/en/sql-reference/functions/math-functions',
					},
					{
						from: '/en/sql_reference/functions/math_functions',
						to: '/en/sql-reference/functions/math-functions',
					},
					{
						from: '/en/query_language/functions/other_functions',
						to: '/en/sql-reference/functions/other-functions',
					},
					{
						from: '/en/sql_reference/functions/other_functions',
						to: '/en/sql-reference/functions/other-functions',
					},
					{
						from: '/en/query_language/functions/random_functions',
						to: '/en/sql-reference/functions/random-functions',
					},
					{
						from: '/en/sql_reference/functions/random_functions',
						to: '/en/sql-reference/functions/random-functions',
					},
					{
						from: '/en/query_language/functions/rounding_functions',
						to: '/en/sql-reference/functions/rounding-functions',
					},
					{
						from: '/en/sql_reference/functions/rounding_functions',
						to: '/en/sql-reference/functions/rounding-functions',
					},
					{
						from: '/en/query_language/functions/splitting_merging_functions',
						to: '/en/sql-reference/functions/splitting-merging-functions',
					},
					{
						from: '/en/sql_reference/functions/splitting_merging_functions',
						to: '/en/sql-reference/functions/splitting-merging-functions',
					},
					{
						from: '/en/query_language/functions/string_functions',
						to: '/en/sql-reference/functions/string-functions',
					},
					{
						from: '/en/sql_reference/functions/string_functions',
						to: '/en/sql-reference/functions/string-functions',
					},
					{
						from: '/en/query_language/functions/string_replace_functions',
						to: '/en/sql-reference/functions/string-replace-functions',
					},
					{
						from: '/en/sql_reference/functions/string_replace_functions',
						to: '/en/sql-reference/functions/string-replace-functions',
					},
					{
						from: '/en/query_language/functions/string_search_functions',
						to: '/en/sql-reference/functions/string-search-functions',
					},
					{
						from: '/en/sql_reference/functions/string_search_functions',
						to: '/en/sql-reference/functions/string-search-functions',
					},
					{
						from: '/en/query_language/functions/type_conversion_functions',
						to: '/en/sql-reference/functions/type-conversion-functions',
					},
					{
						from: '/en/sql_reference/functions/type_conversion_functions',
						to: '/en/sql-reference/functions/type-conversion-functions',
					},
					{
						from: '/en/query_language/functions/url_functions',
						to: '/en/sql-reference/functions/url-functions',
					},
					{
						from: '/en/sql_reference/functions/url_functions',
						to: '/en/sql-reference/functions/url-functions',
					},
					{
						from: '/en/query_language/functions/uuid_functions',
						to: '/en/sql-reference/functions/uuid-functions',
					},
					{
						from: '/en/sql_reference/functions/uuid_functions',
						to: '/en/sql-reference/functions/uuid-functions',
					},
					{
						from: '/en/query_language/functions/ym_dict_functions',
						to: '/en/sql-reference/functions/ym-dict-functions',
					},
					{
						from: '/en/sql_reference/functions/ym_dict_functions',
						to: '/en/sql-reference/functions/ym-dict-functions',
					},
					{
						from: '/en/query_language/operators',
						to: '/en/sql-reference/operators/',
					},
					{
						from: '/en/sql_reference/operators',
						to: '/en/sql-reference/operators/',
					},
					{
						from: '/en/sql_reference/statements/',
						to: '/en/sql-reference/statements/',
					},
					{
						from: '/en/query_language/alter',
						to: '/en/sql-reference/statements/alter/',
					},
					{
						from: '/en/sql_reference/statements/alter',
						to: '/en/sql-reference/statements/alter/',
					},
					{
						from: '/en/sql-reference/statements/alter/index',
						to: '/en/sql-reference/statements/alter/skipping-index',
					},
					{
						from: '/en/query_language/create',
						to: '/en/sql-reference/statements/create/',
					},
					{
						from: '/en/sql_reference/statements/create',
						to: '/en/sql-reference/statements/create/',
					},
					{
						from: '/en/query_language/insert_into',
						to: '/en/sql-reference/statements/insert-into',
					},
					{
						from: '/en/sql_reference/statements/insert_into',
						to: '/en/sql-reference/statements/insert-into',
					},
					{
						from: '/en/query_language/misc',
						to: '/en/sql-reference/statements/',
					},
					{
						from: '/en/sql-reference/statements/misc',
						to: '/en/sql-reference/statements/',
					},
					{
						from: '/en/sql_reference/statements/misc',
						to: '/en/sql-reference/statements/',
					},
					{
						from: '/en/query_language/select',
						to: '/en/sql-reference/statements/select/',
					},
					{
						from: '/en/sql_reference/statements/select',
						to: '/en/sql-reference/statements/select/',
					},
					{
						from: '/en/query_language/show',
						to: '/en/sql-reference/statements/show',
					},
					{
						from: '/en/sql_reference/statements/show',
						to: '/en/sql-reference/statements/show',
					},
					{
						from: '/en/query_language/system',
						to: '/en/sql-reference/statements/system',
					},
					{
						from: '/en/sql_reference/statements/system',
						to: '/en/sql-reference/statements/system',
					},
					{ from: '/en/query_language/syntax', to: '/en/sql-reference/syntax' },
					{ from: '/en/sql_reference/syntax', to: '/en/sql-reference/syntax' },
					{
						from: '/en/query_language/table_functions/',
						to: '/en/sql-reference/table-functions/',
					},
					{
						from: '/en/sql_reference/table_functions/',
						to: '/en/sql-reference/table-functions/',
					},
					{
						from: '/en/query_language/table_functions/file',
						to: '/en/sql-reference/table-functions/file',
					},
					{
						from: '/en/sql_reference/table_functions/file',
						to: '/en/sql-reference/table-functions/file',
					},
					{
						from: '/en/query_language/table_functions/generate',
						to: '/en/sql-reference/table-functions/generate',
					},
					{
						from: '/en/sql_reference/table_functions/generate',
						to: '/en/sql-reference/table-functions/generate',
					},
					{
						from: '/en/query_language/table_functions/hdfs',
						to: '/en/sql-reference/table-functions/hdfs',
					},
					{
						from: '/en/sql_reference/table_functions/hdfs',
						to: '/en/sql-reference/table-functions/hdfs',
					},
					{
						from: '/en/query_language/table_functions/input',
						to: '/en/sql-reference/table-functions/input',
					},
					{
						from: '/en/sql_reference/table_functions/input',
						to: '/en/sql-reference/table-functions/input',
					},
					{
						from: '/en/query_language/table_functions/jdbc',
						to: '/en/sql-reference/table-functions/jdbc',
					},
					{
						from: '/en/sql_reference/table_functions/jdbc',
						to: '/en/sql-reference/table-functions/jdbc',
					},
					{
						from: '/en/query_language/table_functions/merge',
						to: '/en/sql-reference/table-functions/merge',
					},
					{
						from: '/en/sql_reference/table_functions/merge',
						to: '/en/sql-reference/table-functions/merge',
					},
					{
						from: '/en/query_language/table_functions/mysql',
						to: '/en/sql-reference/table-functions/mysql',
					},
					{
						from: '/en/sql_reference/table_functions/mysql',
						to: '/en/sql-reference/table-functions/mysql',
					},
					{
						from: '/en/query_language/table_functions/numbers',
						to: '/en/sql-reference/table-functions/numbers',
					},
					{
						from: '/en/sql_reference/table_functions/numbers',
						to: '/en/sql-reference/table-functions/numbers',
					},
					{
						from: '/en/query_language/table_functions/odbc',
						to: '/en/sql-reference/table-functions/odbc',
					},
					{
						from: '/en/sql_reference/table_functions/odbc',
						to: '/en/sql-reference/table-functions/odbc',
					},
					{
						from: '/en/query_language/table_functions/remote',
						to: '/en/sql-reference/table-functions/remote',
					},
					{
						from: '/en/sql_reference/table_functions/remote',
						to: '/en/sql-reference/table-functions/remote',
					},
					{
						from: '/en/query_language/table_functions/url',
						to: '/en/sql-reference/table-functions/url',
					},
					{
						from: '/en/sql_reference/table_functions/url',
						to: '/en/sql-reference/table-functions/url',
					},
					{ from: '/en/whats_new/', to: '/en/whats-new/changelog/' },
					{ from: '/en/changelog/', to: '/en/whats-new/changelog/' },
					{ from: '/en/whats_new/changelog/', to: '/en/whats-new/changelog/' },
					{ from: '/en/changelog/2017', to: '/en/whats-new/changelog/2017' },
					{
						from: '/en/whats_new/changelog/2017',
						to: '/en/whats-new/changelog/2017',
					},
					{ from: '/en/changelog/2018', to: '/en/whats-new/changelog/2018' },
					{
						from: '/en/whats_new/changelog/2018',
						to: '/en/whats-new/changelog/2018',
					},
					{ from: '/en/changelog/2019', to: '/en/whats-new/changelog/2019' },
					{
						from: '/en/whats_new/changelog/2019',
						to: '/en/whats-new/changelog/2019',
					},
					{ from: '/en/extended_roadmap', to: '/en/whats-new/roadmap' },
					{ from: '/en/roadmap', to: '/en/whats-new/roadmap' },
					{ from: '/en/whats_new/roadmap', to: '/en/whats-new/roadmap' },
					{
						from: '/en/security_changelog',
						to: '/en/whats-new/security-changelog',
					},
					{
						from: '/en/whats_new/security_changelog',
						to: '/en/whats-new/security-changelog',
					},
					{ from: '/en/home/', to: '/en/intro' },
					{ from: '/en/introduction/', to: '/en/intro' },
					{ from: '/en/introduction/adopters', to: '/en/about-us/adopters' },
					{
						from: '/en/introduction/distinctive-features',
						to: '/en/about-us/distinctive-features',
					},
					{ from: '/en/introduction/history', to: '/en/about-us/history' },
					{
						from: '/en/introduction/performance',
						to: '/en/concepts/why-clickhouse-is-so-fast',
					},
					{ from: '/en/', to: '/en/intro' },
					{ from: '/', to: '/en/intro' },
					{ from: '/en/getting-started/tutorial', to: '/en/tutorial' },
					{ from: '/en/getting-started/install', to: '/en/install' },
					{ from: '/quick-start', to: '/en/quick-start' },
					{ from: '/ru/whats-new/index', to: '/ru/whats-new/' },
					{ from: '/en/faq', to: '/knowledgebase' },
					// { from: '/en/faq/billing', to: '/knowledgebase' },
					// { from: '/en/faq/troubleshooting', to: '/knowledgebase' },
					// { from: '/en/faq/operations', to: '/knowledgebase' },
					// { from: '/en/faq/integration', to: '/knowledgebase' },
					// { from: '/en/faq/general', to: '/knowledgebase' },
					// { from: '/en/faq/use-cases', to: '/knowledgebase' },
					{
						from: '/en/manage/security',
						to: '/en/guides/sre/configuring-ldap',
					},
					{
						from: '/en/manage/security/ip-egress-traffic-list',
						to: '/en/manage/security/cloud-endpoints-api',
					},
				],
			},
		],
	],
	customFields: {
		secondaryNavItems: [
			{
				type: 'docSidebar',
				label: 'Docs',
				className: 'ch-menu',
				position: 'left',
				to: '/docs/en/intro',
				sidebarId: 'docs',
			},
			{
				type: 'docSidebar',
				label: 'Cloud',
				sidebarId: 'cloud',
				className: 'ch-menu',
				position: 'left',
				to: '/docs/en/cloud/index',
			},
			{
				type: 'docSidebar',
				label: 'SQL Reference',
				sidebarId: 'sqlreference',
				className: 'ch-menu',
				position: 'left',
				to: '/docs/en/sql-reference',
			},
			{
				label: 'Knowledge Base',
				className: 'ch-menu',
				position: 'left',
				to: 'knowledgebase',
			},
			{
				type: 'dropdown',
				hoverable: false,
				html:
					'<svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
					'<path d="M6.95 12.6496L9.75 5.26628H11.0333L13.8333 12.6496H12.55L11.9 10.7663H8.91667L8.25 12.6496H6.95ZM9.28333 9.69961H11.5L10.4167 6.64961H10.3667L9.28333 9.69961ZM2.08333 10.7996L1.21667 9.93294L4.33333 6.83294C3.94444 6.39961 3.60556 5.95228 3.31667 5.49094C3.02778 5.03005 2.77222 4.54405 2.55 4.03294H3.83333C4.02222 4.41072 4.22222 4.74672 4.43333 5.04094C4.64444 5.33561 4.89444 5.64405 5.18333 5.96628C5.63889 5.47739 6.01667 4.97472 6.31667 4.45828C6.61667 3.94139 6.86667 3.3885 7.06667 2.79961H0.25V1.58294H4.55V0.349609H5.78333V1.58294H10.0833V2.79961H8.3C8.07778 3.53294 7.78333 4.24116 7.41667 4.92428C7.05 5.60783 6.59444 6.25516 6.05 6.86628L7.53333 8.36628L7.06667 9.63294L5.16667 7.73294L2.08333 10.7996Z" fill="currentColor"/>\n' +
					'</svg>',
				position: 'right',
				items: [
					{
						label: 'English',
						to: '/en/intro',
					},
					{
						label: 'Russian',
						to: '/ru',
					},
					{
						label: 'Chinese',
						to: '/zh',
					},
				],
			},
		],
	},
}

module.exports = config
