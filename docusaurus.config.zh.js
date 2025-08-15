import { themes } from "prism-react-renderer";
import math from "remark-math";
import katex from "rehype-katex";
import chHeader from "./plugins/header.js";
import fixLinks from "./src/hooks/fixLinks.js";
import prismLight from "./src/utils/prismLight";
import prismDark from "./src/utils/prismDark";
import glossaryTransformer from "./plugins/glossary-transformer.js";
const remarkCustomBlocks = require('./plugins/remark-custom-blocks');

// Helper function to skip over index.md files.
function skipIndex(items) {
  return items.filter(({ type, id }) => {
    return type !== "doc" || !id.match(/index$/);
  });
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  scripts: [
    {
      src: "/docs/zh/js/kapa_config.js",
      async: false,
    },
    {
      src: "/docs/zh/js/kapa_widget.js",
      async: true,
      defer: true, // execute after document parsing, but before firing DOMContentLoaded event
    }
  ],
  // Settings for Docusaurus Faster - build optimizations
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },
  title: "ClickHouse Docs",
  tagline:
    "我们提供文档、快速入门指南、用户指南、技术参考、常见问题解答等多种信息。",
  url: "https://clickhouse.com",
  // url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bookish-disco-5997zvo.pages.github.io',
  baseUrl: "/docs/zh/",
  baseUrlIssueBanner: true,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  onDuplicateRoutes: "throw",
  onBrokenAnchors: "warn",
  favicon: "img/docs_favicon.ico",
  organizationName: "ClickHouse",
  trailingSlash: false,
  i18n: {
    defaultLocale: "zh",
    locales: ["en", "jp", "zh", "ru"],
    path: "i18n",
    localeConfigs: {
      en: {
        label: "English",
        htmlLang: "en",
        path: "en",
      },
      jp: {
        label: "日本語",
        htmlLang: "jp",
        path: "jp",
      },
      zh: {
        label: "中文",
        htmlLang: "zh",
        path: "zh",
      },
      ru: {
        label: "Русский",
        htmlLang: "ru",
        path: "ru",
      }
    },
  },
  staticDirectories: ["static"],
  projectName: "clickhouse-docs",
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          admonitions: {
            keywords: [
              "note",
              "tip",
              "info",
              "caution",
              "danger",
              "experimental",
              "obsolete",
              "warning",
              "success",
              "important",
              "secondary",
            ],
          },
          sidebarPath: require.resolve("./sidebars.js"),
          // Implements a custom sidebar to override default behaviour where index.md page shows underneath the category name.
          // With this sidebar the category name is clickable to show the index.md contents.
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            return skipIndex(sidebarItems);
          },
          editCurrentVersion: false,
          breadcrumbs: true,
          showLastUpdateTime: false,
          sidebarCollapsed: true,
          routeBasePath: "/",
          remarkPlugins: [math, remarkCustomBlocks],
          beforeDefaultRemarkPlugins: [fixLinks],
          rehypePlugins: [katex],
        },
        blog: {
          path: "knowledgebase",
          blogTitle: "ClickHouse 知识库",
          blogDescription: "知识库",
          blogSidebarTitle: "所有KB文章",
          routeBasePath: "/knowledgebase",
          postsPerPage: 10,
          blogSidebarCount: "ALL",
          feedOptions: {
            type: "all",
            title: "ClickHouse 知识库信息流",
            description: "在ClickHouse知识库中发布的文章信息流",
            copyright: `Copyright &copy; 2016&ndash;${new Date().getFullYear()} ClickHouse, Inc. ClickHouse Docs provided under the Creative Commons CC BY-NC-SA 4.0 license. ClickHouse&reg; is a registered trademark of ClickHouse, Inc.`,
            language: "en",
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params;
              return defaultCreateFeedItems({
                // keep only the 10 most recent blog posts in the feed
                blogPosts: blogPosts.filter((item, index) => index < 10),
                ...rest,
              });
            },
          },
          editUrl: ({ blogPath }) => {
            return (
              "https://github.com/ClickHouse/clickhouse-docs/blob/main/knowledgebase/" +
              blogPath
            );
          },
          remarkPlugins: [math, remarkCustomBlocks, glossaryTransformer],
          beforeDefaultRemarkPlugins: [fixLinks],
          rehypePlugins: [katex],
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.scss")],
        },
        gtag: {
          trackingID: "G-KF1LLRTQ5Q",
        },
      }),
    ],
  ],
  // Inserts tags into the <head></head>
  headTags: [
    {
      // Ask AI component
      tagName: "link",
      attributes: {
        href: "https://widget.kapa.ai",
        rel: "preconnect", // preemptively initiate a connection to resource
      },
    },
    {
      // Google's CDN. Caches all 'static' files in a server near to you
      // to reduce load times.
      tagName: "link",
      attributes: {
        href: "https://www.gstatic.com",
        rel: "preconnect",
        crossorigin: "use-credentials",
      },
    },
    {
      tagName: "link",
      attributes: {
        href: "https://www.googletagmanager.com",
        rel: "preconnect",
      },
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {name: 'Accept-Language', content: 'zh-CN,zh;q=0.9'},
      ],
      algolia: {
        appId: "5H9UG7CX5W",
        apiKey: "4a7bf25cf3edbef29d78d5e1eecfdca5",
        indexName: "clickhouse",
        contextualSearch: false,
        searchPagePath: "search",
      },
      image: "img/docs_social_share.png",
      icon: "/img/gareth.png",
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      //      autoCollapseSidebarCategories: true,
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: "ClickHouse",
          src: "img/ch_logo_docs.svg",
          srcDark: "img/ch_logo_docs_dark.svg",
          href: "https://clickhouse.com/",
        },
        items: [],
      },
      footer: {
        style: "light",
        links: [
          {
            label: "商标",
            to: "https://clickhouse.com/legal/trademark-policy",
          },
          {
            label: "隐私",
            to: "https://clickhouse.com/legal/privacy-policy",
          },
          {
            label: "安全",
            to: "https://trust.clickhouse.com/",
          },
          {
            label: "服务条款",
            to: "https://clickhouse.com/legal/agreements/terms-of-service",
          },
        ],
        copyright: `© 2016&ndash;${new Date().getFullYear()} ClickHouse, Inc.`,
      },
      prism: {
        theme: prismLight,
        darkTheme: prismDark,
        additionalLanguages: ["java", "cpp", "rust", "python", "javascript", "yaml", "bash", "docker"],
        magicComments: [
          // Remember to extend the default highlight class name as well!
          {
            className: "theme-code-block-highlighted-line",
            line: "highlight-next-line",
            block: { start: "highlight-start", end: "highlight-end" },
          },
        ],
      },
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
        defaultMode: "dark",
      },
    }),

  plugins: [
    "docusaurus-plugin-sass",
    function (context, options) {
      return {
        name: "docusaurus-plugin",
        async postBuild({ siteConfig = {}, routesPaths = [], outDir }) {
          // Print out to console all the rendered routes.
          routesPaths.map((route) => {
            //console.log(route)
          });
        },
      };
    },
    [
      "vercel-analytics",
      {
        debug: false,
        mode: "auto",
      },
    ],
    chHeader,
    ['./plugins/tailwind-config.js', {}],
  ],
  customFields: {
    blogSidebarLink: "/docs/knowledgebase", // Used for KB article page
    galaxyApiEndpoint:
      process.env.NEXT_PUBLIC_GALAXY_API_ENDPOINT || "http://localhost:3000",
    secondaryNavItems: [
      {
        type: "dropdown",
        hoverable: "false",
        html:
          '<svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
          '<path d="M6.95 12.6496L9.75 5.26628H11.0333L13.8333 12.6496H12.55L11.9 10.7663H8.91667L8.25 12.6496H6.95ZM9.28333 9.69961H11.5L10.4167 6.64961H10.3667L9.28333 9.69961ZM2.08333 10.7996L1.21667 9.93294L4.33333 6.83294C3.94444 6.39961 3.60556 5.95228 3.31667 5.49094C3.02778 5.03005 2.77222 4.54405 2.55 4.03294H3.83333C4.02222 4.41072 4.22222 4.74672 4.43333 5.04094C4.64444 5.33561 4.89444 5.64405 5.18333 5.96628C5.63889 5.47739 6.01667 4.97472 6.31667 4.45828C6.61667 3.94139 6.86667 3.3885 7.06667 2.79961H0.25V1.58294H4.55V0.349609H5.78333V1.58294H10.0833V2.79961H8.3C8.07778 3.53294 7.78333 4.24116 7.41667 4.92428C7.05 5.60783 6.59444 6.25516 6.05 6.86628L7.53333 8.36628L7.06667 9.63294L5.16667 7.73294L2.08333 10.7996Z" fill="currentColor"/>\n' +
          "</svg>",
        position: "right",
        items: [
          {
            label: "English",
            to: "/",
          },
        ],
      },
    ],
  },
};

module.exports = config;
