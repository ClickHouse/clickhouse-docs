import { themes } from "prism-react-renderer";
import math from "remark-math";
import katex from "rehype-katex";
import chHeader from "./plugins/header.js";
import fixLinks from "./src/hooks/fixLinks.js";
import prismLight from "./src/utils/prismLight";
import prismDark from "./src/utils/prismDark";
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
      src: "/docs/jp/js/kapa_config.js",
      async: false,
    },
    {
      src: "/docs/jp/js/kapa_widget.js",
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
    "ドキュメント、クイックスタートガイド、ユーザーガイド、技術リファレンス、FAQ など、多様な情報をご提供します。",
  url: "https://clickhouse.com",
  // url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bookish-disco-5997zvo.pages.github.io',
  baseUrl: "/docs/jp/",
  baseUrlIssueBanner: true,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  onDuplicateRoutes: "throw",
  onBrokenAnchors: "warn",
  favicon: "img/docs_favicon.ico",
  organizationName: "ClickHouse",
  trailingSlash: false,
  i18n: {
    defaultLocale: "jp",
    locales: ["en", "jp", "zh", "ru", "es"],
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
      },
      es: {
        label: "Español",
        htmlLang: "es",
        path: "es",
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
          blogTitle: "ClickHouse ナレッジベース",
          blogDescription: "ナレッジベース",
          blogSidebarTitle: "すべてのKB記事",
          routeBasePath: "/knowledgebase",
          postsPerPage: 10,
          blogSidebarCount: "ALL",
          feedOptions: {
            type: "all",
            title: "ClickHouse ナレッジベースフィード",
            description: "ClickHouse ナレッジベースに投稿された記事のフィード",
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
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.scss")],
        },
        googleTagManager: {
          containerId: 'GTM-WTNTDT7W',
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
        {name: 'Accept-Language', content: 'ja-JP,ja;q=0.9'},
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
            label: "Trademark",
            to: "https://clickhouse.com/legal/trademark-policy",
          },
          {
            label: "Privacy",
            to: "https://clickhouse.com/legal/privacy-policy",
          },
          {
            label: "Security",
            to: "https://trust.clickhouse.com/",
          },
          {
            label: "Terms of Service",
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
  },
};

module.exports = config;
