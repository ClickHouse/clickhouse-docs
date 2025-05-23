// Important note: When linking to pages, you must link to the file path
// and NOT the URL slug

// The top bar nav links are defined in src/theme/Navbar/Content/index.js

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "category",
      label: "Introduction",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "introduction-index" },
      items: [
        "intro",
        "quick-start",
        "tutorial",
        {
          type: "category",
          label: "Install",
          collapsed: false,
          collapsible: false,
          link: { type: "doc", id: "getting-started/install/install" },
          items: [
            "getting-started/install/debian_ubuntu",
            "getting-started/install/redhat",
            "getting-started/install/other_linux",
            "getting-started/install/macos",
            "getting-started/install/windows",
            "getting-started/install/docker",
            "getting-started/install/quick-install-curl",
            "getting-started/install/advanced",
          ],
        },
        "deployment-modes",
      ],
    },
    {
      type: "category",
      label: "Concepts",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "concepts/index" },
      items: [
        "concepts/olap",
        "concepts/why-clickhouse-is-so-fast",
        "about-us/distinctive-features",
        "concepts/glossary",
        {
          type: "category",
          label: "FAQ",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "faq/index" },
          items: [
            "faq/general/index",
            "faq/general/mapreduce",
            "faq/general/ne-tormozit",
            "faq/general/olap",
            "faq/general/who-is-using-clickhouse",
          ],
        }
      ],
    },
    {
      type: "category",
      label: "Starter Guides",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "starter-guides/index" },
      items: [
        "guides/creating-tables",
        "guides/inserting-data",
        "guides/writing-queries",
        "guides/developer/mutations",
      ],
    },
    {
      type: "category",
      label: "Best Practices",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "best-practices/index" },
      items: [
        "best-practices/sizing-and-hardware-recommendations",
        "best-practices/choosing_a_primary_key",
        "best-practices/select_data_type",
        "best-practices/use_materialized_views",
        "best-practices/minimize_optimize_joins",
        "best-practices/partitioning_keys",
        "best-practices/selecting_an_insert_strategy",
        "best-practices/using_data_skipping_indices",
        "best-practices/avoid_mutations",
        "best-practices/avoid_optimize_final",
        "best-practices/json_type"
      ],
    },
    {
      type: "category",
      label: "Use Case Guides",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "use-cases/index" },
      items: [
        {
          type: "category",
          label: "Observability",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "use-cases/observability/index" },
          items: [
            "use-cases/observability/introduction",
            "use-cases/observability/schema-design",
            "use-cases/observability/managing-data",
            "use-cases/observability/integrating-opentelemetry",
            "use-cases/observability/grafana",
            "use-cases/observability/demo-application",
          ]
        },
        {
          type: "category",
          label: "Time-Series",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "use-cases/time-series/index" },
          items: [
            "use-cases/time-series/date-time-data-types",
            "use-cases/time-series/basic-operations",
            "use-cases/time-series/analysis-functions",
            "use-cases/time-series/storage-efficiency",
            "use-cases/time-series/query-performance"
          ]
        },
        {
          type: "category",
          label: "Data lake",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "use-cases/data_lake/index" },
          items: [
            "use-cases/data_lake/glue_catalog",
            "use-cases/data_lake/unity_catalog"
          ]
        }
      ]
    },
    {
      type: "category",
      label: "Migration Guides",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "migrations/index" },
      items: [
        {
          type: "category",
          label: "BigQuery",
          link: { type: "doc", id: "migrations/bigquery/index" },
          items: [
            {
              type: "doc",
              id: "migrations/bigquery/equivalent-concepts",
            },
            {
              type: "doc",
              id: "migrations/bigquery/migrating-to-clickhouse-cloud",
            },
            {
              type: "doc",
              id: "migrations/bigquery/loading-data",
            },
          ]
        },
        "migrations/snowflake",
        {
          type: "category",
          label: "PostgreSQL",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "migrations/postgres/index" },
          items: [
            {
              type: "doc",
              id: "migrations/postgres/overview",
              label: "Overview",
            },
            "migrations/postgres/dataset",
            "migrations/postgres/rewriting-queries",
            "migrations/postgres/data-modeling-techniques",
            "migrations/postgres/appendix"
          ],
        },
        "integrations/data-ingestion/dbms/mysql/index",
        "integrations/data-ingestion/redshift/index",
        "integrations/data-ingestion/dbms/dynamodb/index",
        {
          type: "doc",
          id: "integrations/migration/rockset",
          label: "Rockset",
        },
      ],
    },
    {
      type: "category",
      label: "Example Datasets",
      className: "top-nav-item",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "getting-started/index" },
      items: [
        {
          type: "autogenerated",
          dirName: "getting-started/example-datasets",
        }
      ]
    }
  ],

  cloud: [
    {
      type: "category",
      label: "Get Started",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/get-started/index" },
      items: [
        "cloud-index",
        {
          type: "doc",
          id: "cloud/get-started/cloud-quick-start",
        },
        "cloud/get-started/sql-console",
        "cloud/get-started/query-insights",
        "cloud/get-started/query-endpoints",
        "cloud/manage/dashboards",
        "cloud/support",
      ],
    },
    {
      type: "category",
      label: "Best Practices",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/bestpractices/index" },
      items: [
        "cloud/bestpractices/usagelimits",
        "cloud/bestpractices/multitenancy",
      ],
    },
    {
      type: "category",
      label: "Managing Cloud",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/manage/index" },
      items: [
        "cloud/manage/cloud-tiers",
        "cloud/manage/integrations",
        {
          type: "category",
          label: "Backups",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "cloud/manage/backups/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "cloud/manage/backups",
            }
          ]
        },
        {
          type: "category",
          label: "Monitoring",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/prometheus",

          ],
        },
        {
          type: "category",
          label: "Billing",
          link: { type: "doc", id: "cloud/manage/billing/index" },
          items: [
            "cloud/manage/billing",
            "cloud/manage/billing/payment-thresholds",
            "cloud/manage/troubleshooting-billing-issues",
            {
              type: "category",
              label: "Marketplace",
              link: { type: "doc", id: "cloud/manage/billing/marketplace/index" },
              items: [
                "cloud/manage/billing/marketplace/overview",
                "cloud/manage/billing/marketplace/aws-marketplace-payg",
                "cloud/manage/billing/marketplace/aws-marketplace-committed",
                "cloud/manage/billing/marketplace/gcp-marketplace-payg",
                "cloud/manage/billing/marketplace/gcp-marketplace-committed",
                "cloud/manage/billing/marketplace/azure-marketplace-payg",
                "cloud/manage/billing/marketplace/azure-marketplace-committed",
              ],
            }
          ],
        },
        "cloud/manage/settings",
        "cloud/manage/replica-aware-routing",
        "cloud/manage/scaling",
        "cloud/manage/service-uptime",
        "cloud/manage/notifications",
        "cloud/manage/upgrades",
        "cloud/manage/account-close",
        "cloud/manage/postman",
        "faq/troubleshooting",
        "cloud/manage/network-data-transfer",
        {
          type: "category",
          label: "Jan 2025 Changes FAQ",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "cloud/manage/jan2025_faq/index" },
          items: [
            "cloud/manage/jan2025_faq/summary",
            "cloud/manage/jan2025_faq/new_tiers",
            "cloud/manage/jan2025_faq/plan_migrations",
            "cloud/manage/jan2025_faq/dimensions",
            "cloud/manage/jan2025_faq/billing",
            "cloud/manage/jan2025_faq/scaling",
            "cloud/manage/jan2025_faq/backup",
          ],
        }
      ],
    },
    {
      type: "category",
      label: "Cloud API",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/manage/api/index" },
      items: [
        "cloud/manage/api/api-overview",
        "cloud/manage/openapi",
        {
          type: 'link',
          label: "API Reference",
          href: "https://clickhouse.com/docs/cloud/manage/api/swagger",
        }
      ],
    },
    {
      type: "category",
      label: "Cloud Reference ",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/reference/index" },
      items: [
        "cloud/reference/architecture",
        "cloud/reference/shared-merge-tree",
        "cloud/reference/warehouses",
        "cloud/reference/byoc",
        {
          type: "category",
          link: { type: "doc", id: "cloud/reference/changelogs-index" },
          label: "Changelogs",
          collapsed: true,
          items: [
            "cloud/reference/changelog",
            {
              type: "category",
              label: "Release Notes",
              collapsed: true,
              link: { type: "doc", id: "cloud/reference/release-notes-index" },
              items: [
                "cloud/changelogs/changelog-25_1-25_4",
                "cloud/changelogs/changelog-24-12",
                "cloud/changelogs/changelog-24-10",
                "cloud/changelogs/changelog-24-8",
                "cloud/changelogs/changelog-24-6",
                "cloud/changelogs/changelog-24-5",
                "cloud/changelogs/fast-release-24-2"
              ]
            }
          ],
        },
        "cloud/reference/cloud-compatibility",
        "cloud/reference/supported-regions"
      ],
    },
    {
      type: "category",
      label: "Security",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      link: { type: "doc", id: "cloud/security/index" },
      items: [
        "cloud/security/shared-responsibility-model",
        {
          type: "category",
          label: "Cloud Access Management",
          link: { type: "doc", id: "cloud/security/cloud-access-management/index" },
          items: [
            "cloud/security/cloud-access-management/cloud-access-management",
            "cloud/security/cloud-access-management/cloud-authentication",
            "cloud/security/saml-sso-setup",
            "cloud/security/common-access-management-queries",
            "cloud/security/inviting-new-users",
          ],
        },
        {
          type: "category",
          label: "Connectivity",
          link: { type: "doc", id: "cloud/security/connectivity-overview" },
          items: [
            "cloud/security/setting-ip-filters",
            {
              type: "category",
              label: "Private Networking",
              link: { type: "doc", id: "cloud/security/private-link-overview" },
              items: [
                "cloud/security/aws-privatelink",
                "cloud/security/gcp-private-service-connect",
                "cloud/security/azure-privatelink",
              ],
            },
            "cloud/security/accessing-s3-data-securely",
            "cloud/security/cloud-endpoints-api",
          ],
        },
        "cloud/security/cmek",
        "cloud/security/audit-logging",
        {
          type: "category",
          label: "Privacy and Compliance",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "cloud/security/privacy-compliance-overview" },
          items: [
            "cloud/security/compliance-overview",
            "cloud/security/personal-data-access",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Migrating to Cloud",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "integrations/migration/index" },
      items: [
        "integrations/migration/overview",
        "integrations/migration/clickhouse-to-cloud",
        "integrations/migration/clickhouse-local-etl",
        "integrations/migration/etl-tool-to-clickhouse",
        "integrations/migration/object-storage-to-clickhouse",
        "integrations/migration/upload-a-csv-file",
        {
          type: "link",
          label: "Rockset",
          href: "/migrations/rockset",
        },
      ],
    },
  ],

  sqlreference: [
    {
      type: "category",
      label: "Introduction",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "sql-reference/index" },
      items: [
        {
          type: "doc",
          id: "sql-reference/syntax",
        },
        {
          type: "doc",
          id: "sql-reference/formats",
        },
        // {
        //   type: "doc",
        //   id: "sql-reference/ansi",
        // },
        {
          type: "category",
          label: "Data Types",
          link: { type: "doc", id: "sql-reference/data-types/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/data-types",
            },
          ],
        },
        {
          type: "category",
          label: "Statements",
          link: { type: "doc", id: "sql-reference/statements/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/statements",
            },
          ],
        },
        {
          type: "category",
          label: "Operators",
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/operators",
            },
          ]
        },
      ],
    },
    {
      type: "category",
      label: "Engines",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "engines/index" },
      items: [
        {
          type: "autogenerated",
          dirName: "engines",
        },
      ],
    },
    {
      type: "category",
      label: "Functions",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "sql-reference/functions/index" },
      items: [
        {
          type: "category",
          label: "Regular Functions",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "sql-reference/functions/regular-functions-index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/functions",
            },
          ],
        },
        {
          type: "category",
          label: "Aggregate Functions",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "sql-reference/aggregate-functions/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/aggregate-functions",
            },
            {
              type: "category",
              label: "Combinator examples",
              collapsed: true,
              collapsible: true,
              items: [
                {
                  type: "autogenerated",
                  dirName: "guides/examples/aggregate_function_combinators",
                }
              ]
            },
          ],
        },
        {
          type: "category",
          label: "Table Functions",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "sql-reference/table-functions/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/table-functions",
            },
          ],
        },
        {
          type: "category",
          label: "Window Functions",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "sql-reference/window-functions/index" },
          items: [
            {
              type: "autogenerated",
              dirName: "sql-reference/window-functions",
            },
          ],
        },
      ],
    },
  ],

  integrations: [
    {
      type: "category",
      label: "All Integrations",
      link: {
        type: "doc",
        id: "integrations/index",
      },
      items: []
    },
    {
      type: "category",
      label: "Language Clients",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "integrations/language-clients/index" },
      items: [
        "interfaces/cpp",
        "integrations/language-clients/go/index",
        "integrations/language-clients/js",
        {
          type: "category",
          label: "Java",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "Overview",
              id: "integrations/language-clients/java/index"
            },
            // "integrations/language-clients/java/index",
            "integrations/language-clients/java/client/client",
            "integrations/language-clients/java/jdbc/jdbc",
            "integrations/language-clients/java/r2dbc"
          ]
        },
        "integrations/language-clients/python/index",
        "integrations/language-clients/rust",
        {
          type: "category",
          label: "Third-party Clients",
          collapsed: true,
          collapsible: true,
          items: [
            "interfaces/third-party/client-libraries"
          ],
        },
      ],
    },
    {
      type: "category",
      label: "ClickPipes",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "integrations/data-ingestion/clickpipes/index" },
      items: [
        "integrations/data-ingestion/clickpipes/kafka",
        "integrations/data-ingestion/clickpipes/object-storage",
        "integrations/data-ingestion/clickpipes/kinesis",
        "integrations/data-ingestion/clickpipes/secure-kinesis",
        "integrations/data-ingestion/clickpipes/aws-privatelink",
        {
          type: "category",
          label: "ClickPipes for Postgres",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/clickpipes/postgres/index",
            "integrations/data-ingestion/clickpipes/postgres/deduplication",
            "integrations/data-ingestion/clickpipes/postgres/ordering_keys",
            "integrations/data-ingestion/clickpipes/postgres/toast",
            "integrations/data-ingestion/clickpipes/postgres/schema-changes",
            "integrations/data-ingestion/clickpipes/postgres/faq",
            "integrations/data-ingestion/dbms/postgresql/connecting-to-postgresql",
            "integrations/data-ingestion/dbms/postgresql/inserting-data",
            {
              type: "category",
              label: "Operations",
              items: [
                "integrations/data-ingestion/clickpipes/postgres/add_table",
                "integrations/data-ingestion/clickpipes/postgres/pause_and_resume",
                "integrations/data-ingestion/clickpipes/postgres/remove_table",
                "integrations/data-ingestion/clickpipes/postgres/table_resync",
              ],
            },
            {
              type: "category",
              label: "Source",
              items: [
                "integrations/data-ingestion/clickpipes/postgres/source/rds",
                "integrations/data-ingestion/clickpipes/postgres/source/aurora",
                "integrations/data-ingestion/clickpipes/postgres/source/supabase",
                "integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql",
                "integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres",
                "integrations/data-ingestion/clickpipes/postgres/source/neon-postgres",
                "integrations/data-ingestion/clickpipes/postgres/source/crunchy-postgres",
                "integrations/data-ingestion/clickpipes/postgres/source/generic",
                "integrations/data-ingestion/clickpipes/postgres/source/timescale",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "ClickPipes for MySQL",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/clickpipes/mysql/index",
            "integrations/data-ingestion/clickpipes/mysql/faq",
            {
              type: "category",
              label: "Source",
              items: [
                "integrations/data-ingestion/clickpipes/mysql/source/rds",
                "integrations/data-ingestion/clickpipes/mysql/source/aurora",
                "integrations/data-ingestion/clickpipes/mysql/source/rds_maria",
                "integrations/data-ingestion/clickpipes/mysql/source/gcp"
              ],
            },
            "integrations/data-ingestion/clickpipes/mysql/datatypes"
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Native Clients & Interfaces",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "interfaces/native-clients-interfaces-index" },
      items: [
        "interfaces/cli",
        {
          type: "category",
          label: "Drivers and Interfaces",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "interfaces/overview" },
          items: [
            "interfaces/http",
            "interfaces/tcp",
            "interfaces/jdbc",
            "interfaces/mysql",
            "interfaces/odbc",
            "interfaces/postgresql",
            "interfaces/prometheus",
            "interfaces/ssh",
            "interfaces/grpc",
          ],
        },
        "integrations/sql-clients/sql-console",
        "interfaces/third-party/index"
      ],
    },
    {
      type: "category",
      label: "Data Sources",
      collapsed: false,
      collapsible: true,
      link: { type: "doc", id: "integrations/data-ingestion/data-sources-index" },
      items: [
        {
          type: "category",
          label: "AWS S3",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/s3/index",
            "integrations/data-ingestion/s3/performance"
          ],
        },
        "integrations/data-sources/postgres",
        {
          type: "category",
          label: "Kafka",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/kafka/index",
            "integrations/data-ingestion/kafka/kafka-clickhouse-connect-sink",
            "integrations/data-ingestion/kafka/confluent/custom-connector",
            "integrations/data-ingestion/kafka/msk/index",
            "integrations/data-ingestion/kafka/kafka-vector",
            "integrations/data-ingestion/kafka/kafka-table-engine",
            "integrations/data-ingestion/kafka/confluent/index",
            "integrations/data-ingestion/kafka/confluent/kafka-connect-http",
            "integrations/data-ingestion/kafka/kafka-connect-jdbc",
            "integrations/data-ingestion/kafka/kafka-table-engine-named-collections"
          ],
        },
        "integrations/data-sources/mysql",
        "integrations/data-sources/cassandra",
        "integrations/data-sources/redis",
        "integrations/data-sources/rabbitmq",
        "integrations/data-sources/mongodb",
        "integrations/data-ingestion/gcs/index",
        "integrations/data-sources/hive",
        "integrations/data-sources/hudi",
        "integrations/data-sources/iceberg",
        "integrations/data-ingestion/s3-minio",
        "integrations/data-sources/deltalake",
        "integrations/data-sources/rocksdb",
        "integrations/data-visualization/splunk-and-clickhouse",
        "integrations/data-sources/sqlite",
        "integrations/data-sources/nats",
        "integrations/data-ingestion/emqx/index",
        "integrations/data-ingestion/insert-local-files",
        "integrations/data-ingestion/dbms/jdbc-with-clickhouse",
        "integrations/data-ingestion/dbms/odbc-with-clickhouse"
      ],
    },
    {
      type: "category",
      label: "Data Visualization",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "integrations/data-visualization/index" },
      items: [
        "integrations/data-visualization/deepnote",
        "integrations/data-visualization/astrato-and-clickhouse",
        "integrations/data-visualization/chartbrew-and-clickhouse",
        "integrations/data-visualization/draxlr-and-clickhouse",
        "integrations/data-visualization/embeddable-and-clickhouse",
        "integrations/data-visualization/explo-and-clickhouse",
        {
          type: "category",
          label: "Grafana",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-visualization/grafana/index",
            "integrations/data-visualization/grafana/query-builder",
            "integrations/data-visualization/grafana/config",
          ],
        },
        "integrations/data-visualization/hashboard-and-clickhouse",
        "integrations/data-visualization/looker-and-clickhouse",
        "integrations/data-visualization/looker-studio-and-clickhouse",
        "integrations/data-visualization/luzmo-and-clickhouse",
        "integrations/data-visualization/metabase-and-clickhouse",
        "integrations/data-visualization/mitzu-and-clickhouse",
        "integrations/data-visualization/omni-and-clickhouse",
        "integrations/data-visualization/powerbi-and-clickhouse",
        "integrations/data-visualization/quicksight-and-clickhouse",
        "integrations/data-visualization/rill-and-clickhouse",
        "integrations/data-visualization/rocketbi-and-clickhouse",
        "integrations/data-visualization/superset-and-clickhouse",
        {
          type: "category",
          label: "Tableau",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-visualization/tableau/tableau-and-clickhouse",
            "integrations/data-visualization/tableau/tableau-online-and-clickhouse",
            "integrations/data-visualization/tableau/tableau-connection-tips",
            "integrations/data-visualization/tableau/tableau-analysis-tips",
          ],
        },
        "integrations/data-visualization/zingdata-and-clickhouse",
      ],
    },
    {
      type: "category",
      label: "Data Formats",
      collapsed: true,
      collapsible: true,
      link: {
        type: "doc",
        id: "integrations/data-ingestion/data-formats/intro",
      },
      items: [
        "interfaces/schema-inference",
        "integrations/data-ingestion/data-formats/binary",
        "integrations/data-ingestion/data-formats/csv-tsv",
        {
          type: "category",
          label: "JSON",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "integrations/data-ingestion/data-formats/json/intro" },
          items: [
            "integrations/data-ingestion/data-formats/json/loading",
            "integrations/data-ingestion/data-formats/json/inference",
            "integrations/data-ingestion/data-formats/json/schema",
            "integrations/data-ingestion/data-formats/json/exporting",
            "integrations/data-ingestion/data-formats/json/formats",
            "integrations/data-ingestion/data-formats/json/other",
          ],
        },
        "integrations/data-ingestion/data-formats/parquet",
        "integrations/data-ingestion/data-formats/sql",
        "integrations/data-ingestion/data-formats/arrow-avro-orc",
        "integrations/data-ingestion/data-formats/templates-regex",
        {
          type: "category",
          label: "View All Formats",
          link: {
            type: "doc",
            id: "interfaces/formats",
          },
          items: [
            {
              type: "autogenerated",
              dirName: "interfaces/formats",
            }
          ]
        },
      ],
    },
    {
      type: "category",
      label: "Data Ingestion",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "integrations/data-ingestion/data-ingestion-index" },
      items: [
        "integrations/data-ingestion/etl-tools/airbyte-and-clickhouse",
        {
          type: "category",
          label: "Apache Spark",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/apache-spark/index",
            "integrations/data-ingestion/apache-spark/spark-native-connector",
            "integrations/data-ingestion/apache-spark/spark-jdbc",
          ],
        },
        "integrations/data-ingestion/aws-glue/index",
        {
          type: "category",
          label: "Azure Data Factory",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "integrations/data-ingestion/azure-data-factory/index" },
          items: [
            "integrations/data-ingestion/azure-data-factory/overview",
            "integrations/data-ingestion/azure-data-factory/using_azureblobstorage",
            "integrations/data-ingestion/azure-data-factory/using_http_interface",
          ],
        },
        "integrations/data-ingestion/azure-synapse/index",
        "integrations/data-ingestion/etl-tools/apache-beam",
        {
          type: "category",
          label: "Google Dataflow",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "integrations/data-ingestion/google-dataflow/dataflow",
            "integrations/data-ingestion/google-dataflow/java-runner",
            "integrations/data-ingestion/google-dataflow/templates",
            {
              type: "category",
              label: "Dataflow Templates",
              className: "top-nav-item",
              collapsed: true,
              collapsible: true,
              items: [
                "integrations/data-ingestion/google-dataflow/templates/bigquery-to-clickhouse",
              ],
            },
          ],
        },
        "integrations/data-ingestion/etl-tools/dbt/index",
        "integrations/data-ingestion/etl-tools/dlt-and-clickhouse",
        "integrations/data-ingestion/etl-tools/fivetran/index",
        "integrations/data-ingestion/etl-tools/nifi-and-clickhouse",
        "integrations/data-ingestion/etl-tools/vector-to-clickhouse",
      ],
    },
    {
      type: "category",
      label: "Tools",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "integrations/tools/index" },
      items: [
        {
          type: "category",
          label: "SQL Clients",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "integrations/sql-clients/index" },
          items: [
            "integrations/sql-clients/datagrip",
            "integrations/sql-clients/dbeaver",
            "integrations/sql-clients/dbvisualizer",
            "integrations/sql-clients/jupysql",
            "integrations/sql-clients/qstudio",
            "integrations/sql-clients/tablum",
            "integrations/sql-clients/marimo",
          ],
        },
        {
          type: "category",
          label: "Data Integrations",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "integrations/tools/data-integration/index" },
          items: [
            "integrations/tools/data-integration/retool/index",
            "integrations/tools/data-integration/easypanel/index",
            "integrations/tools/data-integration/splunk/index"
          ],
        },
        {
          type: "category",
          label: "Misc",
          link: { type: "doc", id: "integrations/misc/index" },
          collapsed: true,
          collapsible: true,
          items: [
            "interfaces/third-party/gui",
            "interfaces/third-party/proxy",
            {
              type: "doc",
              id: "interfaces/third-party/integrations",
              label: "Third-party Libraries",
            },
          ],
        },
      ],
    },
  ],

  managingData: [
    {
      type: "category",
      label: "Core Concepts",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "managing-data/core-concepts/index" },
      items: [
        "managing-data/core-concepts/parts",
        "managing-data/core-concepts/partitions",
        "managing-data/core-concepts/merges",
        "managing-data/core-concepts/shards",
        "managing-data/core-concepts/primary-indexes",
        "managing-data/core-concepts/academic_overview"
      ]
    },
    {
      type: "category",
      label: "Updating Data",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "managing-data/updating-data/index" },
      items: [
        "managing-data/updating-data/overview",
        "managing-data/updating-data/update_mutations",
        {
          type: "doc",
          label: "Lightweight Updates",
          id: "guides/developer/lightweight-update"
        },
        {
          type: "doc",
          label: "ReplacingMergeTree",
          id: "guides/developer/replacing-merge-tree"
        },
      ]
    },
    {
      type: "category",
      label: "Deleting Data",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "managing-data/deleting-data/index" },
      items: [
        "managing-data/deleting-data/overview",
        {
          type: "doc",
          label: "Lightweight Deletes",
          id: "guides/developer/lightweight-delete"
        },
        "managing-data/deleting-data/delete_mutations",
        "managing-data/truncate",
        "managing-data/drop_partition",
      ]
    },
    {
      type: "category",
      label: "Data Modeling",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "data-modeling/index" },
      items: [
        "data-modeling/schema-design",
        {
          type: "category",
          label: "Dictionary",
          collapsible: true,
          collapsed: true,
          items: [
            "dictionary/index",
            "sql-reference/dictionaries/index",
          ],
        },
        {
          type: "category",
          label: "Materialized Views",
          collapsible: true,
          collapsed: true,
          link: { type: "doc", id: "materialized-view/index" },
          items: [
            "materialized-view/incremental-materialized-view",
            "materialized-view/refreshable-materialized-view"
          ],
        },
        "data-modeling/projections",
        {
          type: "category",
          label: "Data Compression",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "data-compression/compression-in-clickhouse" },
          items: [
            "data-compression/compression-modes"
          ],
        },
        "data-modeling/denormalization",
        "data-modeling/backfilling",
      ],
    },
    {
      type: "category",
      label: "Advanced Guides",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "guides/developer/index" },
      items: [
        "guides/developer/alternative-query-languages",
        "guides/developer/cascading-materialized-views",
        "guides/developer/debugging-memory-issues",
        "guides/developer/deduplicating-inserts-on-retries",
        "guides/developer/deduplication",
        "guides/developer/time-series-filling-gaps",
        "sql-reference/transactions",
        "guides/developer/ttl",
        "guides/developer/understanding-query-execution-with-the-analyzer",
        "guides/joining-tables",
      ],
    },
    {
      type: "category",
      label: "Performance and Optimizations",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "guides/best-practices/index" },
      items: [
        "guides/best-practices/query-optimization",
        "guides/best-practices/sparse-primary-indexes",
        "guides/best-practices/query-parallelism",
        "guides/best-practices/partitioningkey",
        "guides/best-practices/skipping-indexes",
        "guides/best-practices/prewhere",
        "guides/best-practices/bulkinserts",
        "guides/best-practices/asyncinserts",
        "guides/best-practices/avoidmutations",
        "guides/best-practices/avoidnullablecolumns",
        "guides/best-practices/avoidoptimizefinal",
        "operations/analyzer",
        "operations/optimizing-performance/sampling-query-profiler",
        "operations/query-cache",
        "operations/query-condition-cache",
        "operations/userspace-page-cache",
        "operations/performance-test",
      ]
    }
  ],

  aboutClickHouse: [
    {
      type: "category",
      label: "About ClickHouse",
      link: {
        type: "doc",
        id: "about-us/index",
      },
      collapsed: false,
      collapsible: false,
      items: [
        "about-us/intro",
        "about-us/adopters",
        "about-us/support",
        "about-us/beta-and-experimental-features",
        "about-us/cloud",
        "about-us/history",
      ],
    },
    {
      type: "category",
      label: "Changelogs",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "whats-new",
        }
      ]
    },
    {
      type: "category",
      label: "Development and Contributing",
      collapsed: false,
      collapsible: false,
      link: {
        type: "doc",
        id: "development/index",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "development",
        },
        "operations/optimizing-performance/profile-guided-optimization",
        {
          type: "category",
          label: "Native Protocol",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "native-protocol",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "FAQ",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "about-us/about-faq-index" },
      items: [
        "faq/general/columnar-database",
        "faq/general/dbms-naming",
        "faq/integration/index",
        "faq/integration/json-import",
        "faq/integration/oracle-odbc",
        "faq/operations/delete-old-data",
        "faq/operations/index",
        "faq/operations/separate_storage",
        "faq/use-cases/index",
        "faq/use-cases/key-value",
        "faq/use-cases/time-series",
      ],
    }
  ],

  serverAdmin: [
    {
      type: "category",
      label: "Manage and Deploy",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "guides/manage-and-deploy-index" },
      items: [
        {
          type: "category",
          label: "Deployment and Scaling",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "deployment-guides/index" },
          items: [
            "deployment-guides/terminology",
            "deployment-guides/horizontal-scaling",
            "deployment-guides/replicated",
            "deployment-guides/parallel-replicas",
            "architecture/cluster-deployment",
          ]
        },
        "guides/separation-storage-compute",
        "guides/sre/keeper/index",
        "guides/sre/network-ports",
        "guides/sre/scaling-clusters",
        "faq/operations/multi-region-replication",
        "faq/operations/production",
        "operations/cluster-discovery",
        "operations/monitoring",
        "operations/opentelemetry",
        "operations/quotas",
        "operations/ssl-zookeeper",
        "operations/startup-scripts",
        "operations/storing-data",
        "operations/allocation-profiling",
        "operations/backup",
        "operations/caches",
        "operations/workload-scheduling",
        "operations/update",
        "guides/troubleshooting",
        "operations/tips",
        "sql-reference/distributed-ddl",
      ],
    },
    {
      type: "category",
      label: "Settings",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "operations/settings/index" },
      items: [
        "operations/settings/overview",
        "operations/server-configuration-parameters/settings",
        "operations/settings/settings",
        "operations/settings/merge-tree-settings",
        "operations/settings/settings-formats",
        "operations/settings/composable-protocols",
        "operations/settings/constraints-on-settings",
        "operations/settings/memory-overcommit",
        // "operations/settings/mysql-binlog-client",
        "operations/settings/permissions-for-queries",
        "operations/settings/query-complexity",
        "operations/settings/server-overload",
        "operations/settings/settings-query-level",
        "operations/settings/settings-profiles",
        "operations/settings/settings-users",
        "operations/named-collections",
        "operations/configuration-files",
      ],
    },
    {
      type: "category",
      label: "System Tables",
      collapsed: true,
      collapsible: true,
      link: { type: "doc", id: "operations/system-tables/index" },
      items: [
        {
          type: "autogenerated",
          dirName: "operations/system-tables",
        }
      ]
    },
    {
      type: "category",
      label: "Security and Authentication",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "guides/sre/index" },
      items: [
        "guides/sre/user-management/index",
        {
          type: "category",
          label: "External Authenticators",
          collapsed: true,
          collapsible: true,
          link: { type: "doc", id: "operations/external-authenticators/index" },
          items: [
            {
              type: "category",
              label: "SSL",
              collapsed: true,
              collapsible: true,
              items: [
                "guides/sre/user-management/ssl-user-auth",
                "guides/sre/configuring-ssl",
                "operations/external-authenticators/ssl-x509",
              ],
            },
            {
              type: "category",
              label: "LDAP",
              collapsed: true,
              collapsible: true,
              items: [
                "operations/external-authenticators/ldap",
                "guides/sre/user-management/configuring-ldap",
              ],
            },
            "operations/external-authenticators/http",
            "operations/external-authenticators/kerberos",
          ],
        },
      ]
    },
    {
      type: "category",
      label: "Tools and Utilities",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "operations/utilities/index" },
      items: [
        "operations/utilities/backupview",
        "operations/utilities/clickhouse-benchmark",
        "operations/utilities/clickhouse-compressor",
        "operations/utilities/clickhouse-disks",
        "operations/utilities/clickhouse-format",
        "operations/utilities/clickhouse-keeper-client",
        "operations/utilities/clickhouse-local",
        "operations/utilities/clickhouse-obfuscator",
        "operations/utilities/odbc-bridge",
        "tools-and-utilities/static-files-disk-uploader",
        "getting-started/playground",
      ],
    }],

  chdb: [
    {
      type: "category",
      label: "chDB",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "chdb/index",
        "chdb/getting-started"
      ],
    },
    {
      type: "category",
      label: "Language Integrations",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "chdb/install/index" },
      items: [
        "chdb/install/python",
        "chdb/install/nodejs",
        "chdb/install/go",
        "chdb/install/rust",
        "chdb/install/bun",
        "chdb/install/c",
      ],
    },
    {
      type: "category",
      label: "Developer Guides",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "chdb/guides/index" },
      items: [
        "chdb/guides/jupysql",
        "chdb/guides/querying-pandas",
        "chdb/guides/querying-apache-arrow",
        "chdb/guides/querying-s3-bucket",
        "chdb/guides/querying-parquet",
        "chdb/guides/query-remote-clickhouse",
        "chdb/guides/clickhouse-local"
      ],
    },
    {
      type: "category",
      label: "Technical Reference",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      link: { type: "doc", id: "chdb/reference/index" },
      items: [
        "chdb/reference/data-formats",
        "chdb/reference/sql-reference"
      ],
    },
    {
      type: "category",
      label: "Integrations",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "link",
          label: "JupySQL",
          href: "https://jupysql.ploomber.io/en/latest/integrations/chdb.html",
        },
        {
          type: "link",
          label: "chdb-lambda",
          href: "https://github.com/chdb-io/chdb-lambda",
        },
        {
          type: "link",
          label: "chdb-cli",
          href: "https://github.com/chdb-io/chdb-go?tab=readme-ov-file#chdb-go-cli",
        },
      ],
    },
    {
      type: "category",
      label: "About chDB",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "link",
          label: "Discord",
          href: "https://discord.gg/Njw5YXSPPc",
        },
        {
          type: "link",
          label: "Birth of chDB",
          href: "https://auxten.com/the-birth-of-chdb/",
        },
        {
          type: "link",
          label: "Joining ClickHouse, Inc.",
          href: "https://clickhouse.com/blog/welcome-chdb-to-clickhouse",
        },
        {
          type: "link",
          label: "Team and Contributors",
          href: "https://github.com/chdb-io/chdb#contributors",
        },
      ],
    },

  ],

  // Used for generating the top nav menu and secondary nav mobile menu (DocsCategoryDropdown) AND top navigation menu
  dropdownCategories: [
    {
      type: "category",
      label: "Getting Started",
      description: "Learn how to use ClickHouse",
      customProps: {
        href: "/introduction-clickhouse",
        sidebar: "docs"
      },
      items: [
        {
          type: "link",
          label: "Introduction",
          description: "An introduction to ClickHouse",
          href: "/intro"
        },
        {
          type: "link",
          label: "Concepts",
          description: "Core concepts to know",
          href: "/concepts"
        },
        {
          type: "link",
          label: "Starter Guides",
          description: "Start here when learning ClickHouse",
          href: "/starter-guides"
        },
        {
          type: "link",
          label: "Best Practices",
          description: "Follow best practices with ClickHouse",
          href: "/best-practices"
        },
        {
          type: "link",
          label: "Migration Guides",
          description: "Migrate your database to ClickHouse",
          href: "/migrations/migrations"
        },
        {
          type: "link",
          label: "Use Case Guides",
          description: "Common use case guides for ClickHouse",
          href: "/use-cases"
        },
        {
          type: "link",
          label: "Example datasets",
          description: "Helpful datasets and tutorials",
          href: "/getting-started/example-datasets"
        },
      ]
    },
    {
      type: "category",
      label: "Cloud",
      description: "The fastest way to deploy ClickHouse",
      customProps: {
        href: "/cloud/overview",
        sidebar: "cloud"
      },
      items: [
        {
          type: "link",
          label: "Get Started",
          description: "Start quickly with ClickHouse Cloud",
          href: "/cloud/get-started/"
        },
        {
          type: "link",
          label: "Best Practices",
          description: "How to get the most out of ClickHouse Cloud",
          href: "/cloud/bestpractices/"
        },
        {
          type: "link",
          label: "Managing Cloud",
          description: "Manage your ClickHouse Cloud services",
          href: "/cloud/bestpractices"
        },
        {
          type: "link",
          label: "Cloud API",
          description: "Automate your ClickHouse Cloud services",
          href: "/cloud/manage/cloud-api/"
        },
        {
          type: "link",
          label: "Cloud Reference",
          description: "Understanding how ClickHouse Cloud works",
          href: "/cloud/reference/"
        },
        {
          type: "link",
          label: "Security",
          description: "Secure your ClickHouse Cloud services",
          href: "/cloud/security/"
        },
        {
          type: "link",
          label: "Migrating to Cloud",
          description: "Migrate your database to ClickHouse Cloud",
          href: "/integrations/migration"
        },
      ]
    },
    {
      type: "category",
      label: "Manage Data",
      customProps: {
        href: "/updating-data",
        sidebar: "managingData"
      },
      description: "How to manage data in ClickHouse",
      items: [
        {
          type: "link",
          label: "Core Data Concepts",
          description: "Understand internal concepts in ClickHouse",
          href: "/managing-data/core-concepts"
        },
        {
          type: "link",
          label: "Updating Data",
          description: "Updating and replacing data in ClickHouse",
          href: "/updating-data"
        },
        {
          type: "link",
          label: "Deleting data",
          description: "Deleting data in ClickHouse",
          href: "/managing-data/deleting-data/overview"
        },
        {
          type: "link",
          label: "Data Modeling",
          description: "Optimize your schema and data model",
          href: "/data-modeling/overview"
        },
        {
          type: "link",
          label: "Performance and Optimizations",
          description: "Guides to help you optimize ClickHouse",
          href: "/operations/overview"
        }
      ]
    },
    {
      type: "category",
      label: "Server Admin",
      customProps: {
        href: "/guides/manage-and-deploy-index",
        sidebar: "serverAdmin"
      },
      description: "Manage and deploy ClickHouse",
      items: [
        {
          type: "link",
          label: "Deployments and Scaling",
          description: "How to deploy ClickHouse",
          href: "/deployment-guides/index"
        },
        {
          type: "link",
          label: "Security and Authentication",
          description: "Secure your ClickHouse deployment",
          href: "/security-and-authentication"
        },
        {
          type: "link",
          label: "Settings",
          description: "Configure ClickHouse",
          href: "/operations/settings"
        },
        {
          type: "link",
          label: "Tools and Utilities",
          description: "Tools to help you manage ClickHouse",
          href: "/operations/utilities"
        },
        {
          type: "link",
          label: "System Tables",
          description: "Metadata tables to help you manage ClickHouse",
          href: "/operations/system-tables"
        }
      ]
    },
    {
      type: "category",
      label: "Reference",
      customProps: {
        href: "/sql-reference",
        sidebar: "sqlreference"
      },
      description: "Reference documentation for ClickHouse features",
      items: [
        {
          type: "link",
          label: "Introduction",
          description: "Learn ClickHouse syntax",
          href: "/sql-reference"
        },
        {
          type: "link",
          label: "Functions",
          description: "Hundreds of built-in functions to help you analyze your data",
          href: "/sql-reference/functions"
        },
        {
          type: "link",
          label: "Engines",
          description: "Use the right table and database engines for your data",
          href: "/engines"
        },
      ]
    },
    {
      type: "category",
      label: "Integrations",
      description: "Integrations, clients, and drivers to use with ClickHouse",
      customProps: {
        href: "/integrations",
        sidebar: "integrations"
      },
      items: [
        {
          type: "link",
          label: "All Integrations",
          description: "Integrate ClickHouse with other databases and applications",
          href: "/integrations"
        },
        {
          type: "link",
          label: "Language Clients",
          description: "Use your favorite language to work with ClickHouse",
          href: "/integrations/language-clients"
        },
        {
          type: "link",
          label: "ClickPipes",
          description: "The easiest way to ingest data into ClickHouse",
          href: "/integrations/clickpipes"
        },
        {
          type: "link",
          label: "Native Clients & Interfaces",
          description: "Choose a client and interface to connect to ClickHouse",
          href: "/interfaces/natives-clients-and-interfaces"
        },
        {
          type: "link",
          label: "Data Sources",
          description: "Load data into ClickHouse from your prefered source",
          href: "/integrations/index"
        },
        {
          type: "link",
          label: "Data Visualization",
          description: "Connect ClickHouse to your favorite visualization tool",
          href: "/integrations/data-visualization"
        },
        {
          type: "link",
          label: "Data Formats",
          description: "Explore data formats supported by ClickHouse",
          href: "/integrations/data-formats"
        },
        {
          type: "link",
          label: "Data Ingestion",
          description: "Ingest data into ClickHouse with a range of ELT tools",
          href: "/integrations/data-ingestion-overview"
        }
      ]
    },
    {
      type: "category",
      label: "chDB",
      description: "chDB is an embedded version of ClickHouse",
      customProps: {
        href: "/chdb",
        sidebar: "chdb"
      },
      items: [
        {
          type: "link",
          label: "Learn chDB",
          description: "Learn how to use chDB",
          href: "/chdb"
        },
        {
          type: "link",
          label: "Language Integrations",
          description: "Connect to chDB using a language client",
          href: "/chdb/install"
        },
        {
          type: "link",
          label: "Guides",
          description: "Guides to help you use chDB",
          href: "/chdb/guides"
        },
      ]
    },
    {
      type: "category",
      label: "About",
      customProps: {
        href: "/about",
        sidebar: "aboutClickHouse"
      },
      description: "Learn more about ClickHouse",
      items: [
        {
          type: "link",
          label: "Adopters",
          description: "ClickHouse adopters",
          href: "/about-us/adopters"
        },
        {
          type: "link",
          label: "Changelogs",
          description: "View the latest changes in ClickHouse",
          href: "/whats-new/security-changelog"
        },
        {
          type: "link",
          label: "Support",
          description: "Get support from ClickHouse engineers",
          href: "/about-us/support"
        },
        {
          type: "link",
          label: "Development and Contributing",
          description: "Learn how to contribute to ClickHouse",
          href: "/development/developer-instruction"
        }
      ]
    },
  ],

};

module.exports = sidebars
