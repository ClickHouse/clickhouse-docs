const darkTheme = require('prism-react-renderer/themes/vsDark')
const path = require("path")

/** @type {import('@docusaurus/types').Config} */
const config = {
	webpack: { 
		jsLoader: (isServer) => ({ 
		  loader: require.resolve('esbuild-loader'), 
		  options: { 
			loader: 'tsx', 
			target: isServer ? 'node12' : 'es2017', 
		  }, 
		}), 
	  },
	title: 'ClickHouse 文档',
	tagline: '文档、快速入门、用户指南、技术参考、常见问题解答等等...',
	url: 'https://clickhouse.com',
	// url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bookish-disco-5997zvo.pages.github.io',
	baseUrl: '/docs/',
	baseUrlIssueBanner: true,
	onBrokenLinks: 'ignore',
	onBrokenMarkdownLinks: 'ignore',
	favicon: 'img/docs_favicon.ico',
	organizationName: 'ClickHouse',
	trailingSlash: false,
	staticDirectories: ['static'],
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
					breadcrumbs: true,
					showLastUpdateTime: false,
					sidebarCollapsed: true,
					routeBasePath: '/',
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
			image: 'img/docs_social_share.png',
			icon: '/img/gareth.png',
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
						label: '价钱',
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
						label: '资源',
						className: 'ch-menu',
						position: 'left',
						items: [
							{
								to: '/docs/',
								label: '文档',
							},
							{
								label: 'ClickHouse学院',
								to: 'https://clickhouse.com/learn',
							},
							{
								label: '即将举行的培训',
								to: 'https://clickhouse.com/company/news-events',
							},
							{
								label: '博客',
								to: 'https://clickhouse.com/blog',
							},
							{
								label: '支持计划',
								to: 'https://clickhouse.com/support/program',
							},
						],
					},
					{
						position: 'left',
						label: '用例',
						className: 'ch-menu',
						to: 'https://clickhouse.com/customer-stories',
					},
					{
						position: 'left',
						label: '价钱',
						className: 'ch-menu',
						to: 'https://clickhouse.com/pricing',
					},
				],
			},
			footer: {
				style: 'light',
				links: [
					{
						label: '商标',
						to: 'https://clickhouse.com/legal/trademark-policy',
					},
					{
						label: '隐私',
						to: 'https://clickhouse.com/legal/privacy-policy',
					},
					{
						label: '安全',
						to: 'https://trust.clickhouse.com/',
					},
					{
						label: '服务条款',
						to: 'https://clickhouse.com/legal/agreements/terms-of-service',
					},
				],
				copyright: `© 2016&ndash;${new Date().getFullYear()} ClickHouse, 合并.`,
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
		path.resolve(__dirname, 'plugins', 'header')
	],
	customFields: {
		secondaryNavItems: [
			{
				type: 'docSidebar',
				label: '文档',
				className: 'ch-menu',
				position: 'left',
				to: '/docs',
				sidebarId: 'docs',
			},
			// {
			// 	type: 'docSidebar',
			// 	label: 'Cloud',
			// 	sidebarId: 'cloud',
			// 	className: 'ch-menu',
			// 	position: 'left',
			// 	to: '/docs/en/cloud/index',
			// },
			// {
			// 	type: 'docSidebar',
			// 	label: 'SQL Reference',
			// 	sidebarId: 'sqlreference',
			// 	className: 'ch-menu',
			// 	position: 'left',
			// 	to: '/docs/en/sql-reference',
			// },
			// {
			// 	label: 'Knowledge Base',
			// 	className: 'ch-menu',
			// 	position: 'left',
			// 	to: 'knowledgebase',
			// },
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
						to: 'en',
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
