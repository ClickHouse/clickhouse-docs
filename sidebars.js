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
      items: [
        "en/intro",
        "en/quick-start",
        "en/tutorial",
        "en/getting-started/install",
      ],
    },
    {
      type: "category",
      label: "Concepts",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "en/concepts/why-clickhouse-is-so-fast",
        "en/concepts/olap",
        "en/about-us/distinctive-features",
        "en/concepts/glossary",
        {
          type: "category",
          label: "FAQ",
          collapsed: true,
          collapsible: true,
          items: [
              "en/faq/general/index",
              "en/faq/general/mapreduce",
              "en/faq/general/ne-tormozit",
              "en/faq/general/olap",
              "en/faq/general/who-is-using-clickhouse",
              "en/concepts/why-clickhouse-is-so-fast",
          ],
        }
      ],
    },
    {
      type: "category",
      label: "Starter Guides",
      collapsed: false,
      collapsible: false,
      items: [
        "en/guides/creating-tables",
        "en/guides/inserting-data",
        "en/guides/writing-queries",
        "en/guides/developer/mutations",
      ],
    },
    {
      type: "category",
      label: "Use Case Guides",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "Observability",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "Introduction",
              id: "en/use-cases/observability/index",
            },
            "en/use-cases/observability/schema-design",
            "en/use-cases/observability/managing-data",
            "en/use-cases/observability/integrating-opentelemetry",
            "en/use-cases/observability/grafana",
            "en/use-cases/observability/demo-application",
          ]
        },
      ]
    },
    {
      type: "category",
      label: "Migration Guides",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
            label: "BigQuery",
            collapsed: true,
            collapsible: true,
            items: [
              {
                type: "doc",
                id: "en/migrations/bigquery/equivalent-concepts",
              },
              {
                type: "doc",
                id: "en/migrations/bigquery/migrating-to-clickhouse-cloud",
              },
              {
                type: "doc",
                id: "en/migrations/bigquery/loading-data",
              },
            ]
        },
        "en/migrations/snowflake",
        {
          type: "category",
          label: "PostgreSQL",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              id: "en/migrations/postgres/overview",
              label: "Introduction",
            },
            "en/integrations/data-ingestion/dbms/postgresql/index",
            "en/integrations/data-ingestion/dbms/postgresql/postgres-vs-clickhouse",
            "en/migrations/postgres/dataset",
            "en/migrations/postgres/designing-schemas",
            "en/migrations/postgres/data-modeling-techniques",
            "en/integrations/data-ingestion/dbms/postgresql/rewriting-postgres-queries",
            "en/integrations/data-ingestion/dbms/postgresql/inserting-data",
            "en/integrations/data-ingestion/dbms/postgresql/data-type-mappings",
          ],
        },
        "en/integrations/data-ingestion/dbms/mysql/index",
        "en/integrations/data-ingestion/redshift/index",
        "en/integrations/data-ingestion/dbms/dynamodb/index",
        {
          type: "doc",
          id: "en/integrations/migration/rockset",
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
      items: [
        "en/getting-started/index",
        "en/getting-started/example-datasets/amazon-reviews",
        "en/getting-started/example-datasets/amplab-benchmark",
        "en/getting-started/example-datasets/brown-benchmark",
        "en/getting-started/example-datasets/cell-towers",
        "en/getting-started/example-datasets/covid19",
        "en/getting-started/example-datasets/criteo",
        "en/getting-started/example-datasets/environmental-sensors",
        "en/getting-started/example-datasets/github",
        "en/getting-started/example-datasets/github-events",
        "en/getting-started/example-datasets/laion",
        "en/getting-started/example-datasets/menus",
        "en/getting-started/example-datasets/metrica",
        "en/getting-started/example-datasets/noaa",
        "en/getting-started/example-datasets/nyc-taxi",
        "en/getting-started/example-datasets/nypd_complaint_data",
        "en/getting-started/example-datasets/ontime",
        "en/getting-started/example-datasets/opensky",
        "en/getting-started/example-datasets/recipes",
        "en/getting-started/example-datasets/reddit-comments",
        "en/getting-started/example-datasets/stackoverflow",
        "en/getting-started/example-datasets/star-schema",
        "en/getting-started/example-datasets/tw-weather",
        "en/getting-started/example-datasets/tpcds",
        "en/getting-started/example-datasets/tpch",
        "en/getting-started/example-datasets/uk-price-paid",
        "en/getting-started/example-datasets/wikistat",
        "en/getting-started/example-datasets/youtube-dislikes",
        ],
      }
  ],

  cloud: [
    {
      type: "category",
      label: "Get Started",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "en/cloud-index",
        {
          type: "doc",
          id: "en/get-started/cloud-quick-start",
        },
        "en/get-started/sql-console",
        "en/get-started/query-insights",
        "en/get-started/query-endpoints",
        "en/cloud/manage/dashboards",
        "en/cloud/support",
      ],
    },
    {
      type: "category",
      label: "Managing Cloud",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "en/cloud/manage/service-types",
        "en/cloud/manage/integrations",
        "en/cloud/manage/backups",
        {
          type: "category",
          label: "Monitoring",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/prometheus",
           
          ],
        },
        {
          type: "category",
          label: "Billing",
          items: [
            "en/cloud/manage/billing",
            "en/cloud/manage/billing/payment-thresholds",
            "en/cloud/manage/troubleshooting-billing-issues",
            ,
            {
              type: "category",
              label: "Marketplace",
              items: [
                "en/cloud/manage/billing/marketplace/index",
                "en/cloud/manage/billing/marketplace/aws-marketplace-payg",
                "en/cloud/manage/billing/marketplace/aws-marketplace-committed",
                "en/cloud/manage/billing/marketplace/gcp-marketplace-payg",
                "en/cloud/manage/billing/marketplace/gcp-marketplace-committed",
                "en/cloud/manage/billing/marketplace/azure-marketplace-payg",
                "en/cloud/manage/billing/marketplace/azure-marketplace-committed",
              ],
            },
          ],
        },
        "en/cloud/manage/settings",
        "en/cloud/manage/replica-aware-routing",
        "en/cloud/manage/scaling",
        "en/cloud/manage/service-uptime",
        "en/cloud/manage/notifications",
        "en/cloud/manage/upgrades",
        "en/cloud/manage/account-close",
        "en/cloud/manage/postman",
        "en/faq/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Cloud API",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        {
          type: "doc",
          id: "en/cloud/manage/api/api-overview",
        },
        "en/cloud/manage/openapi",
        {
          type: "category",
          label: "API Reference",
          items: [
            "en/cloud/manage/api/invitations-api-reference",
            "en/cloud/manage/api/keys-api-reference",
            "en/cloud/manage/api/members-api-reference",
            "en/cloud/manage/api/organizations-api-reference",
            "en/cloud/manage/api/services-api-reference",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Cloud Reference ",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "en/cloud/reference/architecture",
        "en/cloud/reference/shared-merge-tree",
        "en/cloud/reference/warehouses",
        "en/cloud/reference/byoc",
        {
          type: "category",
          label: "Changelogs",
          collapsed: true,
          items: [
            "en/cloud/reference/changelog",
            {
              type: "category",
              label: "Release Notes",
              collapsed: true,
              items: [
                "en/cloud/changelogs/changelog-24-10",
                "en/cloud/changelogs/changelog-24-8",
                "en/cloud/changelogs/changelog-24-6",
                "en/cloud/changelogs/changelog-24-5",
                "en/fast-release-24-2"
              ]
            }
          ],
        },
        "en/cloud/reference/cloud-compatibility",
        "en/cloud/reference/supported-regions",
      ],
    },
    {
      type: "category",
      label: "Best Practices",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "en/cloud/bestpractices/bulkinserts",
        "en/cloud/bestpractices/asyncinserts",
        "en/cloud/bestpractices/avoidmutations",
        "en/cloud/bestpractices/avoidnullablecolumns",
        "en/cloud/bestpractices/avoidoptimizefinal",
        "en/cloud/bestpractices/partitioningkey",
        "en/cloud/bestpractices/usagelimits",
      ],
    },
    {
      type: "category",
      label: "Security",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "en/cloud/security/shared-responsibility-model",
        {
          type: "category",
          label: "Cloud Access Management",
          items: [
            "en/cloud/security/cloud-access-management",
            "en/cloud/security/cloud-authentication",
            "en/cloud/security/saml-sso-setup",
            "en/cloud/security/common-access-management-queries",
            "en/cloud/security/inviting-new-users",
          ],
        },
        {
          type: "category",
          label: "Connectivity",
          items: [
            "en/cloud/security/setting-ip-filters",
            {
              type: "category",
              label: "Private Networking",
              items: [
                "en/cloud/security/private-link-overview",
                "en/cloud/security/aws-privatelink",
                "en/cloud/security/gcp-private-service-connect",
                "en/cloud/security/azure-privatelink",
              ],
            },
            "en/cloud/security/accessing-s3-data-securely",
            "en/cloud/security/cloud-endpoints-api",
          ],
        },
        "en/cloud/security/cmek",
        "en/cloud/security/audit-logging",
        {
          type: "category",
          label: "Privacy and Compliance",
          collapsed: true,
          collapsible: true,
          items: [
            "en/cloud/security/compliance-overview",
            "en/cloud/security/personal-data-access",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Migrating to Cloud",
      collapsed: false,
      collapsible: false,
      items: [
        "en/integrations/migration/index",
        "en/integrations/migration/clickhouse-to-cloud",
        "en/integrations/migration/clickhouse-local-etl",
        "en/integrations/migration/etl-tool-to-clickhouse",
        "en/integrations/migration/object-storage-to-clickhouse",
        "en/integrations/migration/upload-a-csv-file",
        {
          type: "link",
          label: "Rockset",
          href: "/en/migrations/rockset",
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
      items: [
        {
          type: "doc",
          id: "en/sql-reference/index",
        },
        {
          type: "doc",
          id: "en/sql-reference/syntax",
        },
        {
          type: "doc",
          id: "en/sql-reference/formats",
        },
        // {
        //   type: "doc",
        //   id: "en/sql-reference/ansi",
        // },
        {
          type: "category",
          label: "Data Types",
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/data-types",
            },
          ],
        },
        {
          type: "category",
          label: "Statements",
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/statements",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Engines",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "en/engines",
        },
      ],
    },
    {
      type: "category",
      label: "Functions",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "Regular Functions",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/functions",
            },
          ],
        },
        {
          type: "category",
          label: "Aggregate Functions",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/aggregate-functions",
            },
          ],
        },
        {
          type: "category",
          label: "Table Functions",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/table-functions",
            },
          ],
        },
        {
          type: "category",
          label: "Window Functions",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "en/sql-reference/window-functions",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Other Features",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "en/sql-reference/operators",
        },
        {
          type: "doc",
          id: "en/sql-reference/distributed-ddl",
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
        id: "en/integrations/index",
      },
      items: []
    },
    {
      type: "category",
      label: "Language Clients",
      collapsed: false,
      collapsible: false,
      items: [
        "en/interfaces/cpp",
        "en/integrations/language-clients/go/index",
        "en/integrations/language-clients/js",
        {
          type: "category",
          label: "Java",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "Overview",
              id: "en/integrations/language-clients/java/index"
            },
            // "en/integrations/language-clients/java/index",
            "en/integrations/language-clients/java/client-v2",
            "en/integrations/language-clients/java/client-v1",
            "en/integrations/language-clients/java/jdbc-driver",
            "en/integrations/language-clients/java/r2dbc"
          ]
        },
        "en/integrations/language-clients/python/index",
        "en/integrations/language-clients/rust",
        {
          type: "category",
          label: "Third-party Clients",
          collapsed: true,
          collapsible: true,
          items: [
            "en/interfaces/third-party/client-libraries"
          ],
        },
      ],
    },
    {
      type: "category",
      label: "ClickPipes",
      collapsed: false,
      collapsible: false,
      items: [
        "en/integrations/data-ingestion/clickpipes/index",
        "en/integrations/data-ingestion/clickpipes/kafka",
        "en/integrations/data-ingestion/clickpipes/object-storage",
        "en/integrations/data-ingestion/clickpipes/kinesis",
        "en/integrations/data-ingestion/clickpipes/secure-kinesis",
        {
          type: "category",
          label: "ClickPipes for Postgres",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-ingestion/clickpipes/postgres/index",
            {
              type: "category",
              label: "Source",
              items: [
                "en/integrations/data-ingestion/clickpipes/postgres/source/rds",
                "en/integrations/data-ingestion/clickpipes/postgres/source/supabase",
                "en/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql",
                "en/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres",
                "en/integrations/data-ingestion/clickpipes/postgres/source/neon-postgres",
                "en/integrations/data-ingestion/clickpipes/postgres/source/crunchy-postgres",
                "en/integrations/data-ingestion/clickpipes/postgres/source/generic",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Native Clients & Interfaces",
      collapsed: false,
      collapsible: false,
      items: [
        "en/interfaces/cli",
        "en/integrations/sql-clients/sql-console",
        {
          type: "category",
          label: "Drivers and Interfaces",
          collapsed: true,
          collapsible: true,
          items: [
            "en/interfaces/overview",
            "en/interfaces/http",
            "en/interfaces/tcp",
            "en/interfaces/jdbc",
            "en/interfaces/mysql",
            "en/interfaces/odbc",
            "en/interfaces/postgresql",
            "en/interfaces/prometheus",
            "en/interfaces/grpc",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Data Sources",
      collapsed: false,
      collapsible: true,
      items: [
        {
          type: "category",
          label: "AWS S3",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
           "en/integrations/data-ingestion/s3/index",
           "en/integrations/data-ingestion/s3/performance"
          ],
        },
        {
          type: "doc",
          id: "en/integrations/data-ingestion/dbms/postgresql/index",
          label: "PostgreSQL",
        },
        {
          type: "category",
          label: "Kafka",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-ingestion/kafka/index",
            "en/integrations/data-ingestion/kafka/kafka-clickhouse-connect-sink",
            "en/integrations/data-ingestion/kafka/confluent/custom-connector",
            "en/integrations/data-ingestion/kafka/msk/index",
            "en/integrations/data-ingestion/kafka/kafka-vector",
            "en/integrations/data-ingestion/kafka/kafka-table-engine",
            "en/integrations/data-ingestion/kafka/confluent/index",
            "en/integrations/data-ingestion/kafka/confluent/kafka-connect-http",
            "en/integrations/data-ingestion/kafka/kafka-connect-jdbc",
            "en/integrations/data-ingestion/kafka/kafka-table-engine-named-collections"
          ],
        },
        {
          type: "category",
          label: "Apache Spark",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-ingestion/apache-spark/index",
            "en/integrations/data-ingestion/apache-spark/spark-native-connector",
            "en/integrations/data-ingestion/apache-spark/spark-jdbc",
          ],
        },
        {
          type: "doc",
          id: "en/integrations/data-ingestion/dbms/mysql/index",
          label: "MySQL",
        },
        {
          type: "link",
          label: "Cassandra",
          href: "/en/sql-reference/dictionaries#cassandra",
        },
        {
          type: "link",
          label: "Redis",
          href: "/en/sql-reference/table-functions/redis",
        },
        "en/engines/table-engines/integrations/rabbitmq",
        "en/engines/table-engines/integrations/mongodb",
        "en/integrations/data-ingestion/gcs/index",
        "en/engines/table-engines/integrations/hive",
        "en/engines/table-engines/integrations/hudi",
        "en/engines/table-engines/integrations/iceberg",
        "en/integrations/data-ingestion/s3-minio",
        "en/sql-reference/table-functions/deltalake",
        {
          type: "link",
          label: "RocksDB",
          href: "/en/engines/table-engines/integrations/embedded-rocksdb"
        },
        "en/integrations/data-visualization/splunk-and-clickhouse",
        "en/engines/table-engines/integrations/sqlite",
        "en/engines/table-engines/integrations/nats",
        "en/integrations/data-ingestion/emqx/index",
        "en/integrations/data-ingestion/insert-local-files",
        "en/integrations/data-ingestion/dbms/jdbc-with-clickhouse",
        "en/integrations/data-ingestion/dbms/odbc-with-clickhouse"
      ],
    },
    {
      type: "category",
      label: "Data Visualization",
      collapsed: true,
      collapsible: true,
      items: [
        "en/integrations/data-visualization",
        "en/integrations/data-visualization/deepnote",
        "en/integrations/data-visualization/astrato-and-clickhouse",
        "en/integrations/data-visualization/draxlr-and-clickhouse",
        "en/integrations/data-visualization/embeddable-and-clickhouse",
        "en/integrations/data-visualization/explo-and-clickhouse",
        {
          type: "category",
          label: "Grafana",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-visualization/grafana/index",
            "en/integrations/data-visualization/grafana/query-builder",
            "en/integrations/data-visualization/grafana/config",
          ],
        },
        "en/integrations/data-visualization/hashboard-and-clickhouse",
        "en/integrations/data-visualization/looker-and-clickhouse",
        "en/integrations/data-visualization/looker-studio-and-clickhouse",
        "en/integrations/data-visualization/metabase-and-clickhouse",
        "en/integrations/data-visualization/mitzu-and-clickhouse",
        "en/integrations/data-visualization/omni-and-clickhouse",
        "en/integrations/data-visualization/powerbi-and-clickhouse",
        "en/integrations/data-visualization/quicksight-and-clickhouse",
        "en/integrations/data-visualization/rocketbi-and-clickhouse",
        "en/integrations/data-visualization/superset-and-clickhouse",
        {
          type: "category",
          label: "Tableau",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-visualization/tableau/tableau-and-clickhouse",
            "en/integrations/data-visualization/tableau/tableau-online-and-clickhouse",
            "en/integrations/data-visualization/tableau/tableau-connection-tips",
            "en/integrations/data-visualization/tableau/tableau-analysis-tips",
          ],
        },
        "en/integrations/data-visualization/zingdata-and-clickhouse",
      ],
    },
    {
      type: "category",
      label: "Data Formats",
      collapsed: true,
      collapsible: true,
      link: {
        type: "doc",
        id: "en/integrations/data-ingestion/data-formats/intro",
      },
      items: [
        "en/interfaces/schema-inference",
        "en/integrations/data-ingestion/data-formats/binary",
        "en/integrations/data-ingestion/data-formats/csv-tsv",
        {
          type: "category",
          label: "JSON",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/data-ingestion/data-formats/json/intro",
            "en/integrations/data-ingestion/data-formats/json/loading",
            "en/integrations/data-ingestion/data-formats/json/inference",
            "en/integrations/data-ingestion/data-formats/json/schema",
            "en/integrations/data-ingestion/data-formats/json/exporting",
            "en/integrations/data-ingestion/data-formats/json/formats",
            "en/integrations/data-ingestion/data-formats/json/other",
          ],
        },
        "en/integrations/data-ingestion/data-formats/parquet",
        "en/integrations/data-ingestion/data-formats/sql",
        "en/integrations/data-ingestion/data-formats/arrow-avro-orc",
        "en/integrations/data-ingestion/data-formats/templates-regex",
        {
          type: "doc",
          id: "en/interfaces/formats",
          label: "View all formats...",
        },
      ],
    },
    {
      type: "category",
      label: "Data Ingestion",
      collapsed: true,
      collapsible: true,
      items: [
        "en/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse",
        "en/integrations/data-ingestion/aws-glue/index",
        "en/integrations/data-ingestion/etl-tools/apache-beam",
        "en/integrations/data-ingestion/etl-tools/dbt/index",
        "en/integrations/data-ingestion/etl-tools/fivetran/index",
        "en/integrations/data-ingestion/etl-tools/nifi-and-clickhouse",
        "en/integrations/data-ingestion/etl-tools/dlt-and-clickhouse",
        "en/integrations/data-ingestion/etl-tools/vector-to-clickhouse",
      ],
    },
    {
      type: "category",
      label: "Tools",
      collapsed: true,
      collapsible: true,
      items: [
        {
          type: "category",
          label: "SQL Clients",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/sql-clients/datagrip",
            "en/integrations/sql-clients/dbeaver",
            "en/integrations/sql-clients/dbvisualizer",
            "en/integrations/sql-clients/jupysql",
            "en/integrations/sql-clients/qstudio",
            "en/integrations/sql-clients/tablum",
          ],
        },
        {
          type: "category",
          label: "Data Integration",
          collapsed: true,
          collapsible: true,
          items: [
            "en/integrations/no-code/retool",
            "en/integrations/deployment/easypanel/index"
          ],
        },{
          type: "category",
          label: "Misc",
          collapsed: true,
          collapsible: true,
          items: [
            "en/interfaces/third-party/gui",
            "en/interfaces/third-party/proxy",
            {
              type: "doc",
              id: "en/interfaces/third-party/integrations",
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
      label: "Updating Data",
      collapsed: false,
      collapsible: false,
      items: [
        "en/managing-data/updates",
        {
          type: "link",
          label: "Update Mutations",
          href: "/en/sql-reference/statements/alter/update"
        },
        {
          type: "doc",
          label: "Lightweight Updates",
          id: "en/guides/developer/lightweight-update"
        },
        {
          type: "doc",
          label: "ReplacingMergeTree",
          id: "en/migrations/postgres/replacing-merge-tree"
        },
      ]
    },
    {
      type: "category",
        label: "Deleting Data",
        collapsed: false,
        collapsible: false,
        items: [
          {
            type: "doc",
            label: "Overview",
            id: "en/managing-data/deletes",
          },
          {
            type: "doc",
            label: "Lightweight Deletes",
            id: "en/guides/developer/lightweight-delete"
          },
          {
            type: "link",
            label: "Delete Mutations",
            href: "/en/sql-reference/statements/alter/delete"
          },
          {
            type: "link",
            label: "Truncate Table",
            href: "/en/sql-reference/statements/truncate"
          },
          {
            type: "link",
            label: "Drop Partition",
            href: "/en/sql-reference/statements/alter/partition#drop-partitionpart"
          }
        ]
      },
      {
      type: "category",
      label: "Data Modeling",
      collapsed: false,
      collapsible: false,
      items: [
        "en/data-modeling/schema-design",
        {
          type: "category",
          label: "Dictionary",
          collapsible: true,
          collapsed: true,
          items: [
            "en/dictionary/index",
            "en/sql-reference/dictionaries/index",
          ],
        },
        {
          type: "category",
          label: "Materialized View",
          collapsible: true,
          collapsed: true,
          items: [
            "en/materialized-view/index",
            "en/materialized-view/refreshable-materialized-view"
          ],
        },
        {
          type: "category",
          label: "Data Compression",
          collapsed: true,
          collapsible: true,
          items: [
            {
              label: "Overview",
              type: "doc",
              id: "en/data-compression/compression-in-clickhouse",
            },
            "en/data-compression/compression-modes"
          ],
        },
        "en/data-modeling/denormalization",
      ],
    },
    {
      type: "category",
      label: "Advanced Guides",
      collapsed: false,
      collapsible: false,
      items: [
        "en/guides/developer/alternative-query-languages",
        "en/guides/developer/cascading-materialized-views",
        "en/guides/developer/debugging-memory-issues",
        "en/guides/developer/deduplicating-inserts-on-retries",
        "en/guides/developer/deduplication",
        "en/guides/developer/time-series-filling-gaps",
        "en/sql-reference/transactions",
        "en/guides/developer/ttl",
        "en/guides/developer/understanding-query-execution-with-the-analyzer",
        "en/guides/joining-tables",
      ],
    },
    {
      type: "category",
      label: "Performance and Optimizations",
      collapsed: false,
      collapsible: false,
      items: [
        "en/operations/analyzer",
        "en/guides/best-practices/asyncinserts",
        "en/guides/best-practices/avoidmutations",
        "en/guides/best-practices/avoidnullablecolumns",
        "en/guides/best-practices/avoidoptimizefinal",
        "en/guides/best-practices/bulkinserts",
        "en/guides/best-practices/partitioningkey",
        "en/guides/best-practices/skipping-indexes",
        "en/guides/best-practices/sparse-primary-indexes",
        "en/operations/optimizing-performance/sampling-query-profiler",
        "en/operations/performance-test",
        "en/operations/query-cache",
      ]
    }
  ],

  aboutClickHouse: [
    {
      type: "category",
      label: "About ClickHouse",
      link: {
        type: "doc",
        id: "en/about-us/intro",
      },
      collapsed: false,
      collapsible: false,
      items: [
        "en/about-us/adopters",
        "en/about-us/support",
        "en/settings/beta-and-experimental-features",
        "en/about-us/cloud",
        "en/about-us/history",
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
          dirName: "en/whats-new",
        }
      ]
    },
    {
      type: "category",
      label: "Development and Contributing",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "en/development",
        },
        "en/operations/optimizing-performance/profile-guided-optimization",
        {
          type: "category",
          label: "Native Protocol",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "en/native-protocol",
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
      items: [
        "en/faq/general/columnar-database",
        "en/faq/general/dbms-naming",
        "en/faq/integration/index",
        "en/faq/integration/json-import",
        "en/faq/integration/oracle-odbc",
        "en/faq/operations/delete-old-data",
        "en/faq/operations/index",
        "en/faq/operations/separate_storage",
        "en/faq/use-cases/index",
        "en/faq/use-cases/key-value",
        "en/faq/use-cases/time-series",
      ],
    }
  ],

  serverAdmin: [
    {
      type: "category",
      label: "Manage and Deploy",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "Deployment and Scaling",
          collapsed: true,
          collapsible: true,
          items: [
            "en/deployment-guides/terminology",
            "en/deployment-guides/horizontal-scaling",
            "en/deployment-guides/replicated",
            "en/architecture/cluster-deployment",
          ]
        },
        "en/guides/separation-storage-compute",
        "en/guides/sizing-and-hardware-recommendations",
        "en/guides/sre/keeper/index",
        "en/guides/sre/network-ports",
        "en/guides/sre/scaling-clusters",
        "en/faq/operations/multi-region-replication",
        "en/faq/operations/production",
        "en/operations/cluster-discovery",
        "en/operations/monitoring",
        "en/operations/opentelemetry",
        "en/operations/quotas",
        "en/operations/ssl-zookeeper",
        "en/operations/startup-scripts",
        "en/operations/storing-data",
        "en/operations/allocation-profiling",
        "en/operations/backup",
        "en/operations/caches",
        "en/operations/workload-scheduling",
        "en/operations/update",
        "en/guides/troubleshooting",
        "en/operations/tips",
        "en/sql-reference/distributed-ddl",
      ],
    },
    {
      type: "category",
      label: "Settings",
      collapsed: false,
      collapsible: false,
      items: [
        "en/operations/settings/index",
        "en/operations/server-configuration-parameters/settings",
        "en/operations/settings/composable-protocols",
        "en/operations/settings/constraints-on-settings",
        "en/operations/settings/settings-formats",
        "en/operations/settings/memory-overcommit",
        "en/operations/settings/merge-tree-settings",
        // "en/operations/settings/mysql-binlog-client",
        "en/operations/settings/permissions-for-queries",
        "en/operations/settings/query-complexity",
        "en/operations/settings/settings-query-level",
        "en/operations/settings/settings",
        "en/operations/settings/settings-profiles",
        "en/operations/settings/settings-users",
        "en/operations/named-collections",
        "en/operations/configuration-files",
      ],
    },
    {
      type: "category",
      label: "System Tables",
      collapsed: true,
      collapsible: true,
      items: [
        "en/operations/system-tables/index",
        "en/operations/system-tables/asynchronous_insert_log",
        "en/operations/system-tables/asynchronous_inserts",
        "en/operations/system-tables/asynchronous_loader",
        "en/operations/system-tables/asynchronous_metric_log",
        "en/operations/system-tables/asynchronous_metrics",
        "en/operations/system-tables/azure_queue_settings",
        "en/operations/system-tables/backup_log",
        "en/operations/system-tables/blob_storage_log",
        "en/operations/system-tables/build_options",
        "en/operations/system-tables/clusters",
        "en/operations/system-tables/columns",
        "en/operations/system-tables/contributors",
        "en/operations/system-tables/crash-log",
        "en/operations/system-tables/current-roles",
        "en/operations/system-tables/dashboards",
        "en/operations/system-tables/data_skipping_indices",
        "en/operations/system-tables/data_type_families",
        "en/operations/system-tables/database_engines",
        "en/operations/system-tables/databases",
        "en/operations/system-tables/detached_parts",
        "en/operations/system-tables/detached_tables",
        "en/operations/system-tables/dictionaries",
        "en/operations/system-tables/disks",
        "en/operations/system-tables/distributed_ddl_queue",
        "en/operations/system-tables/distribution_queue",
        "en/operations/system-tables/dns_cache",
        "en/operations/system-tables/dropped_tables",
        "en/operations/system-tables/dropped_tables_parts",
        "en/operations/system-tables/enabled-roles",
        "en/operations/system-tables/error_log",
        "en/operations/system-tables/errors",
        "en/operations/system-tables/events",
        "en/operations/system-tables/functions",
        "en/operations/system-tables/grants",
        "en/operations/system-tables/graphite_retentions",
        "en/operations/system-tables/information_schema",
        "en/operations/system-tables/jemalloc_bins",
        "en/operations/system-tables/kafka_consumers",
        "en/operations/system-tables/licenses",
        "en/operations/system-tables/merge_tree_settings",
        "en/operations/system-tables/merges",
        "en/operations/system-tables/metric_log",
        "en/operations/system-tables/metrics",
        "en/operations/system-tables/moves",
        "en/operations/system-tables/mutations",
        "en/operations/system-tables/numbers",
        "en/operations/system-tables/numbers_mt",
        "en/operations/system-tables/one",
        "en/operations/system-tables/opentelemetry_span_log",
        "en/operations/system-tables/part_log",
        "en/operations/system-tables/parts",
        "en/operations/system-tables/parts_columns",
        "en/operations/system-tables/processes",
        "en/operations/system-tables/processors_profile_log",
        "en/operations/system-tables/projections",
        "en/operations/system-tables/query_cache",
        "en/operations/system-tables/query_log",
        "en/operations/system-tables/query_metric_log",
        "en/operations/system-tables/query_thread_log",
        "en/operations/system-tables/query_views_log",
        "en/operations/system-tables/quota_limits",
        "en/operations/system-tables/quota_usage",
        "en/operations/system-tables/quotas",
        "en/operations/system-tables/quotas_usage",
        "en/operations/system-tables/replicas",
        "en/operations/system-tables/replicated_fetches",
        "en/operations/system-tables/replication_queue",
        "en/operations/system-tables/role-grants",
        "en/operations/system-tables/roles",
        "en/operations/system-tables/row_policies",
        "en/operations/system-tables/s3_queue_settings",
        "en/operations/system-tables/scheduler",
        "en/operations/system-tables/schema_inference_cache",
        "en/operations/system-tables/server_settings",
        "en/operations/system-tables/session_log",
        "en/operations/system-tables/settings",
        "en/operations/system-tables/settings_changes",
        "en/operations/system-tables/settings_profile_elements",
        "en/operations/system-tables/settings_profiles",
        "en/operations/system-tables/stack_trace",
        "en/operations/system-tables/storage_policies",
        "en/operations/system-tables/symbols",
        "en/operations/system-tables/table_engines",
        "en/operations/system-tables/tables",
        "en/operations/system-tables/text_log",
        "en/operations/system-tables/time_zones",
        "en/operations/system-tables/trace_log",
        "en/operations/system-tables/user_processes",
        "en/operations/system-tables/users",
        "en/operations/system-tables/view_refreshes",
        "en/operations/system-tables/zookeeper",
        "en/operations/system-tables/zookeeper_connection",
        "en/operations/system-tables/zookeeper_log",
      ]
    },
    {
      type: "category",
      label: "Security and Authentication",
      collapsed: false,
      collapsible: false,
      items: [
        "en/guides/sre/user-management/index",
        {
          type: "category",
          label: "External Authenticators",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "Overview",
              id: "en/operations/external-authenticators/index",
            },
            {
              type: "category",
              label: "SSL",
              collapsed: true,
              collapsible: true,
              items: [
                "en/guides/sre/user-management/ssl-user-auth",
                "en/guides/sre/configuring-ssl",
                "en/operations/external-authenticators/ssl-x509",
              ],
            },
            {
              type: "category",
              label: "LDAP",
              collapsed: true,
              collapsible: true,
              items: [
                "en/operations/external-authenticators/ldap",
                "en/guides/sre/user-management/configuring-ldap",
              ],
            },
            "en/operations/external-authenticators/http",
            "en/operations/external-authenticators/kerberos",
          ],
        },
      ]
    },
    {
      type: "category",
      label: "Tools and Utilities",
      collapsed: false,
      collapsible: false,
      items: [
        {
          label: "Overview",
          id: "en/operations/utilities/index",
          type: "doc",
        },
        "en/operations/utilities/backupview",
        "en/operations/utilities/clickhouse-benchmark",
        "en/operations/utilities/clickhouse-compressor",
        "en/operations/utilities/clickhouse-disks",
        "en/operations/utilities/clickhouse-format",
        "en/operations/utilities/clickhouse-keeper-client",
        "en/operations/utilities/clickhouse-local",
        "en/operations/utilities/clickhouse-obfuscator",
        "en/operations/utilities/odbc-bridge",
        "en/tools-and-utilities/static-files-disk-uploader",
        "en/getting-started/playground",   
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
        "en/chdb/index",
        "en/chdb/getting-started"
      ],
    },
    {
      type: "category",
      label: "Language Integrations",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "en/chdb/install/python",
        "en/chdb/install/nodejs",
        "en/chdb/install/go",
        "en/chdb/install/rust",
        "en/chdb/install/bun",
        "en/chdb/install/c",
      ],
    },
    {
      type: "category",
      label: "Developer Guides",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "en/chdb/guides/jupysql",
        "en/chdb/guides/querying-pandas",
        "en/chdb/guides/querying-apache-arrow",
        "en/chdb/guides/querying-s3-bucket",
        "en/chdb/guides/querying-parquet",
        "en/chdb/guides/query-remote-clickhouse",
        "en/chdb/guides/clickhouse-local" 
      ],
    },
    {
      type: "category",
      label: "Technical Reference",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "en/chdb/data-formats",
        "en/chdb/sql-reference" 
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
  russia: [
    {
      type: "autogenerated",
      dirName: "ru",
    },
  ],
  chinese: [
    {
      type: "autogenerated",
      dirName: "zh",
    },
  ],
  docs_japanese: [
    {
      type: "category",
      label: "イントロダクション",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/intro",
        "ja/quick-start",
        "ja/tutorial",
        "ja/getting-started/install",
      ],
    },
    {
      type: "category",
      label: "コンセプト",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/concepts/why-clickhouse-is-so-fast",
        "ja/concepts/olap",
        "ja/about-us/distinctive-features",
        "ja/concepts/glossary",
        {
          type: "category",
          label: "FAQ",
          collapsed: true,
          collapsible: true,
          items: [
              "ja/faq/general/index",
              "ja/faq/general/mapreduce",
              "ja/faq/general/ne-tormozit",
              "ja/faq/general/olap",
              "ja/faq/general/who-is-using-clickhouse",
              "ja/concepts/why-clickhouse-is-so-fast",
          ],
        }
      ],
    },
    {
      type: "category",
      label: "スターター ガイド",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/guides/creating-tables",
        "ja/guides/inserting-data",
        "ja/guides/writing-queries",
        "ja/guides/developer/mutations",
      ],
    },
    {
      type: "category",
      label: "ユースケース ガイド",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "オブザーバビリティ",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "イントロダクション",
              id: "ja/use-cases/observability/index",
            },
            "ja/use-cases/observability/schema-design",
            "ja/use-cases/observability/managing-data",
            "ja/use-cases/observability/integrating-opentelemetry",
            "ja/use-cases/observability/grafana",
            "ja/use-cases/observability/demo-application",
          ]
        },
      ]
    },
    {
      type: "category",
      label: "マイグレーション ガイド",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
            label: "BigQuery",
            collapsed: true,
            collapsible: true,
            items: [
              {
                type: "doc",
                id: "ja/migrations/bigquery/equivalent-concepts",
              },
              {
                type: "doc",
                id: "ja/migrations/bigquery/migrating-to-clickhouse-cloud",
              },
              {
                type: "doc",
                id: "ja/migrations/bigquery/loading-data",
              },
            ]
        },
        "ja/migrations/snowflake",
        {
          type: "category",
          label: "PostgreSQL",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              id: "ja/migrations/postgres/overview",
              label: "イントロダクション",
            },
            "ja/integrations/data-ingestion/dbms/postgresql/index",
            "ja/integrations/data-ingestion/dbms/postgresql/postgres-vs-clickhouse",
            "ja/migrations/postgres/dataset",
            "ja/migrations/postgres/designing-schemas",
            "ja/migrations/postgres/data-modeling-techniques",
            "ja/integrations/data-ingestion/dbms/postgresql/rewriting-postgres-queries",
            "ja/integrations/data-ingestion/dbms/postgresql/inserting-data",
            "ja/integrations/data-ingestion/dbms/postgresql/data-type-mappings",
          ],
        },
        "ja/integrations/data-ingestion/dbms/mysql/index",
        "ja/integrations/data-ingestion/redshift/index",
        "ja/integrations/data-ingestion/dbms/dynamodb/index",
        {
          type: "doc",
          id: "ja/integrations/migration/rockset",
          label: "Rockset",
        },
      ],
    },
      {
      type: "category",
      label: "データセットの例",
      className: "top-nav-item",
      collapsed: true,
      collapsible: true,
      items: [
        "ja/getting-started/index",
        "ja/getting-started/example-datasets/amazon-reviews",
        "ja/getting-started/example-datasets/amplab-benchmark",
        "ja/getting-started/example-datasets/brown-benchmark",
        "ja/getting-started/example-datasets/cell-towers",
        "ja/getting-started/example-datasets/covid19",
        "ja/getting-started/example-datasets/criteo",
        "ja/getting-started/example-datasets/environmental-sensors",
        "ja/getting-started/example-datasets/github",
        "ja/getting-started/example-datasets/github-events",
        "ja/getting-started/example-datasets/laion",
        "ja/getting-started/example-datasets/menus",
        "ja/getting-started/example-datasets/metrica",
        "ja/getting-started/example-datasets/noaa",
        "ja/getting-started/example-datasets/nyc-taxi",
        "ja/getting-started/example-datasets/nypd_complaint_data",
        "ja/getting-started/example-datasets/ontime",
        "ja/getting-started/example-datasets/opensky",
        "ja/getting-started/example-datasets/recipes",
        "ja/getting-started/example-datasets/reddit-comments",
        "ja/getting-started/example-datasets/stackoverflow",
        "ja/getting-started/example-datasets/star-schema",
        "ja/getting-started/example-datasets/tw-weather",
        "ja/getting-started/example-datasets/uk-price-paid",
        "ja/getting-started/example-datasets/wikistat",
        "ja/getting-started/example-datasets/youtube-dislikes",
        ],
      }
  ],
  cloud_japanese: [
    {
      type: "category",
      label: "はじめに",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "ja/cloud-index",
        {
          type: "doc",
          id: "ja/get-started/cloud-quick-start",
        },
        "ja/get-started/sql-console",
        "ja/get-started/query-insights",
        "ja/get-started/query-endpoints",
        "ja/cloud/support",
      ],
    },
    {
      type: "category",
      label: "Cloudの管理",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "ja/cloud/manage/service-types",
        "ja/cloud/manage/integrations",
        "ja/cloud/manage/backups",
        {
          type: "category",
          label: "請求",
          items: [
            "ja/cloud/manage/billing",
            "ja/cloud/manage/billing/payment-thresholds",
            "ja/cloud/manage/troubleshooting-billing-issues",
            ,
            {
              type: "category",
              label: "Marketplace",
              items: [
                "ja/cloud/manage/billing/marketplace/index",
                "ja/cloud/manage/billing/marketplace/aws-marketplace-payg",
                "ja/cloud/manage/billing/marketplace/aws-marketplace-committed",
                "ja/cloud/manage/billing/marketplace/gcp-marketplace-payg",
                "ja/cloud/manage/billing/marketplace/gcp-marketplace-committed",
                "ja/cloud/manage/billing/marketplace/azure-marketplace-payg",
                "ja/cloud/manage/billing/marketplace/azure-marketplace-committed",
              ],
            },
          ],
        },
        "ja/cloud/manage/settings",
        "ja/cloud/manage/scaling",
        "ja/cloud/manage/service-uptime",
        "ja/cloud/manage/notifications",
        "ja/cloud/manage/upgrades",
        "ja/cloud/manage/account-close",
        "ja/cloud/manage/postman",
        "ja/faq/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Cloud API",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        {
          type: "doc",
          id: "ja/cloud/manage/api/api-overview",
        },
        "ja/cloud/manage/openapi",
        {
          type: "category",
          label: "APIリファレンス",
          items: [
            "ja/cloud/manage/api/invitations-api-reference",
            "ja/cloud/manage/api/keys-api-reference",
            "ja/cloud/manage/api/members-api-reference",
            "ja/cloud/manage/api/organizations-api-reference",
            "ja/cloud/manage/api/services-api-reference",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Cloudリファレンス ",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "ja/cloud/reference/architecture",
        "ja/cloud/reference/shared-merge-tree",
        "ja/cloud/reference/compute-compute-separation",
        "ja/cloud/reference/byoc",
        {
          type: "category",
          label: "Changelogs",
          collapsed: true,
          items: [
            "ja/cloud/reference/changelog",
            {
              type: "category",
              label: "Release Notes",
              collapsed: true,
              items: [
                "ja/cloud/changelogs/changelog-24-6",
                "ja/cloud/changelogs/changelog-24-5"
              ]
            }
          ],
        },
        "ja/cloud/reference/cloud-compatibility",
        "ja/cloud/reference/supported-regions",
      ],
    },
    {
      type: "category",
      label: "ベストプラクティス",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "ja/cloud/bestpractices/bulkinserts",
        "ja/cloud/bestpractices/asyncinserts",
        "ja/cloud/bestpractices/avoidmutations",
        "ja/cloud/bestpractices/avoidnullablecolumns",
        "ja/cloud/bestpractices/avoidoptimizefinal",
        "ja/cloud/bestpractices/partitioningkey",
      ],
    },
    {
      type: "category",
      label: "セキュリティ",
      collapsed: false,
      collapsible: false,
      className: "top-nav-item",
      items: [
        "ja/cloud/security/shared-responsibility-model",
        {
          type: "category",
          label: "Cloudアクセス管理",
          items: [
            "ja/cloud/security/cloud-access-management",
            "ja/cloud/security/cloud-authentication",
            "ja/cloud/security/saml-sso-setup",
            "ja/cloud/security/common-access-management-queries",
          ],
        },
        {
          type: "category",
          label: "接続",
          items: [
            "ja/cloud/security/setting-ip-filters",
            {
              type: "category",
              label: "プライベートネットワーキング",
              items: [
                "ja/cloud/security/private-link-overview",
                "ja/cloud/security/aws-privatelink",
                "ja/cloud/security/gcp-private-service-connect",
                "ja/cloud/security/azure-privatelink",
              ],
            },
            "ja/cloud/security/accessing-s3-data-securely",
            "ja/cloud/security/cloud-endpoints-api",
          ],
        },
        "ja/cloud/security/cmek",
        "ja/cloud/security/audit-logging",
        {
          type: "category",
          label: "プライバシーとコンプライアンス",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/cloud/security/compliance-overview",
            "ja/cloud/security/personal-data-access",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Cloudへのマイグレーション",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/integrations/migration/index",
        "ja/integrations/migration/clickhouse-to-cloud",
        "ja/integrations/migration/clickhouse-local-etl",
        "ja/integrations/migration/etl-tool-to-clickhouse",
        "ja/integrations/migration/object-storage-to-clickhouse",
        "ja/integrations/migration/upload-a-csv-file",
        {
          type: "link",
          label: "Rockset",
          href: "/ja/migrations/rockset",
        },
      ],
    },
  ],
  sqlreference_japanese: [
    {
      type: "category",
      label: "イントロダクション",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "doc",
          id: "ja/sql-reference/index",
        },
        {
          type: "doc",
          id: "ja/sql-reference/syntax",
        },
        {
          type: "doc",
          id: "ja/sql-reference/formats",
        },
        // {
        //   type: "doc",
        //   id: "ja/sql-reference/ansi",
        // },
        {
          type: "category",
          label: "データタイプ",
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/data-types",
            },
          ],
        },
        {
          type: "category",
          label: "ステートメント",
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/statements",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "エンジン",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "ja/engines",
        },
      ],
    },
    {
      type: "category",
      label: "関数",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "一般的な関数",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/functions",
            },
          ],
        },
        {
          type: "category",
          label: "集約関数",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/aggregate-functions",
            },
          ],
        },
        {
          type: "category",
          label: "テーブル関数",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/table-functions",
            },
          ],
        },
        {
          type: "category",
          label: "ウィンドウ関数",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "ja/sql-reference/window-functions",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "その他の機能",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "autogenerated",
          dirName: "ja/sql-reference/operators",
        },
        {
          type: "doc",
          id: "ja/sql-reference/distributed-ddl",
        },
      ],
    },
  ],

  integrations_japanese: [
    {
      type: "category",
      label: "ClickPipes",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/integrations/data-ingestion/clickpipes/index",
        "ja/integrations/data-ingestion/clickpipes/kafka",
        "ja/integrations/data-ingestion/clickpipes/object-storage",
        "ja/integrations/data-ingestion/clickpipes/kinesis",
        "ja/integrations/data-ingestion/clickpipes/secure-kinesis",
        "ja/integrations/data-ingestion/clickpipes/postgres",
      ],
    },
    {
      type: "category",
      label: "全ての統合",
      link: {
        type: "doc",
        id: "ja/integrations/index",
      },
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "category",
          label: "AWS S3",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
           "ja/integrations/data-ingestion/s3/index",
           "ja/integrations/data-ingestion/s3/performance"
          ],
        },
        {
          type: "category",
          label: "Kafka",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/data-ingestion/kafka/index",
            "ja/integrations/data-ingestion/kafka/kafka-clickhouse-connect-sink",
            "ja/integrations/data-ingestion/kafka/confluent/custom-connector",
            "ja/integrations/data-ingestion/kafka/msk/index",
            "ja/integrations/data-ingestion/kafka/kafka-vector",
            "ja/integrations/data-ingestion/kafka/kafka-table-engine",
            "ja/integrations/data-ingestion/kafka/confluent/index",
            "ja/integrations/data-ingestion/kafka/confluent/kafka-connect-http",
            "ja/integrations/data-ingestion/kafka/kafka-connect-jdbc",
          ],
        },
        "ja/integrations/data-ingestion/etl-tools/dbt/index",
        "ja/integrations/data-ingestion/etl-tools/fivetran/index",
        "ja/integrations/data-ingestion/apache-spark/index",
        "ja/integrations/data-ingestion/aws-glue/index",
        "ja/integrations/data-ingestion/insert-local-files",
        "ja/integrations/data-ingestion/dbms/jdbc-with-clickhouse",
        "ja/integrations/data-ingestion/dbms/odbc-with-clickhouse",
        {
          type: "category",
          label: "その他...",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse",
            {
              type: "link",
              label: "Cassandra",
              href: "/ja/sql-reference/dictionaries#cassandra",
            },
            "ja/sql-reference/table-functions/deltalake",
            "ja/integrations/data-ingestion/etl-tools/dlt-and-clickhouse",
            "ja/integrations/deployment/easypanel/index",
            "ja/engines/table-engines/integrations/embedded-rocksdb",
            "ja/integrations/data-ingestion/emqx/index",
            "ja/engines/table-engines/integrations/hive",
            "ja/engines/table-engines/integrations/hudi",
            "ja/engines/table-engines/integrations/iceberg",
            "ja/integrations/data-ingestion/s3-minio",
            "ja/engines/table-engines/integrations/mongodb",
            "ja/engines/table-engines/integrations/nats",
            "ja/integrations/data-ingestion/etl-tools/nifi-and-clickhouse",
            "ja/integrations/prometheus",
            "ja/engines/table-engines/integrations/rabbitmq",
            {
              type: "link",
              label: "Redis",
              href: "/ja/sql-reference/dictionaries#redis",
            },
            "ja/integrations/data-visualization/splunk-and-clickhouse",
            "ja/engines/table-engines/integrations/sqlite",
            "ja/integrations/data-ingestion/etl-tools/vector-to-clickhouse",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "データフォーマット",
      link: {
        type: "doc",
        id: "ja/integrations/data-ingestion/data-formats/intro",
      },
      collapsed: false,
      collapsible: false,
      items: [
        "ja/integrations/data-ingestion/data-formats/binary",
        "ja/integrations/data-ingestion/data-formats/csv-tsv",
        {
          type: "category",
          label: "JSON",
          className: "top-nav-item",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/data-ingestion/data-formats/json/intro",
            "ja/integrations/data-ingestion/data-formats/json/loading",
            "ja/integrations/data-ingestion/data-formats/json/inference",
            "ja/integrations/data-ingestion/data-formats/json/schema",
            "ja/integrations/data-ingestion/data-formats/json/exporting",
            "ja/integrations/data-ingestion/data-formats/json/formats",
            "ja/integrations/data-ingestion/data-formats/json/other",
          ],
        },
        "ja/integrations/data-ingestion/data-formats/parquet",
        "ja/integrations/data-ingestion/data-formats/sql",
        "ja/integrations/data-ingestion/data-formats/arrow-avro-orc",
        "ja/integrations/data-ingestion/data-formats/templates-regex",
        {
          type: "doc",
          id: "ja/interfaces/formats",
          label: "全てのフォーマットを見る...",
        },
      ],
    },
    {
          type: "category",
      label: "クライアントとドライバ",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/integrations/clickhouse-client-local",
        "ja/integrations/cli",
        "ja/operations/utilities/clickhouse-local",
        "ja/integrations/sql-clients/sql-console",
        "ja/getting-started/playground",
        "ja/integrations/language-clients/js",
        "ja/integrations/language-clients/java/index",
        "ja/integrations/language-clients/python/index",
        "ja/integrations/language-clients/rust",
        {
          type: "category",
          label: "全ての言語を見る",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/language-clients/js",
            "ja/integrations/language-clients/java/index",
            "ja/integrations/language-clients/go/index",
            "ja/integrations/language-clients/python/index",
            "ja/integrations/language-clients/rust",
          ],
        },
        {
          type: "category",
          label: "ドライバとインターフェース",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/interfaces/overview",
            "ja/interfaces/cli",
            "ja/interfaces/cpp",
            "ja/interfaces/http",
            "ja/interfaces/tcp",
            "ja/interfaces/jdbc",
            "ja/interfaces/mysql",
            "ja/interfaces/odbc",
            "ja/interfaces/postgresql",
            "ja/interfaces/prometheus",
            "ja/interfaces/schema-inference",
            "ja/interfaces/grpc",
            {
              type: "category",
              label: "サードパーティインターフェース",
              collapsed: true,
              collapsible: true,
              items: [
                {
                  type: "autogenerated",
                  dirName: "ja/interfaces/third-party",
                },
              ],
            },
          ],
        },
        {
          type: "category",
          label: "SQLクライアント",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/sql-clients/datagrip",
            "ja/integrations/sql-clients/dbeaver",
            "ja/integrations/sql-clients/dbvisualizer",
            "ja/integrations/sql-clients/jupysql",
            "ja/integrations/sql-clients/qstudio",
            "ja/integrations/sql-clients/tablum",
          ],
        },
        {
          type: "category",
          label: "ビジネスインテリジェンス",
          collapsed: true,
          collapsible: true,
          items: [
            "ja/integrations/data-visualization",
            "ja/integrations/data-visualization/deepnote",
            "ja/integrations/data-visualization/draxlr-and-clickhouse",
            "ja/integrations/data-visualization/embeddable-and-clickhouse",
            "ja/integrations/data-visualization/explo-and-clickhouse",
            {
              type: "category",
              label: "Grafana",
              className: "top-nav-item",
              collapsed: true,
              collapsible: true,
              items: [
                "ja/integrations/data-visualization/grafana/index",
                "ja/integrations/data-visualization/grafana/query-builder",
                "ja/integrations/data-visualization/grafana/config",
              ],
            },
            "ja/integrations/data-visualization/hashboard-and-clickhouse",
            "ja/integrations/data-visualization/looker-and-clickhouse",
            "ja/integrations/data-visualization/looker-studio-and-clickhouse",
            "ja/integrations/data-visualization/metabase-and-clickhouse",
            "ja/integrations/data-visualization/mitzu-and-clickhouse",
            "ja/integrations/data-visualization/omni-and-clickhouse",
            "ja/integrations/data-visualization/powerbi-and-clickhouse",
            "ja/integrations/data-visualization/quicksight-and-clickhouse",
            "ja/integrations/data-visualization/rocketbi-and-clickhouse",
            "ja/integrations/data-visualization/superset-and-clickhouse",
            "ja/integrations/data-visualization/tableau-and-clickhouse",
            "ja/integrations/data-visualization/tableau-online-and-clickhouse",
            "ja/integrations/data-visualization/zingdata-and-clickhouse",
          ],
        },
        {
          type: "category",
          label: "ノーコードプラットフォーム",
          collapsed: true,
          collapsible: true,
          items: ["ja/integrations/no-code/retool"],
        },
      ],
    },
  ],

  managingData_japanese: [
    {
      type: "category",
      label: "データの更新",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/managing-data/updates",
        {
          type: "link",
          label: "物理更新",
          href: "/ja/sql-reference/statements/alter/update"
        },
        {
          type: "doc",
          label: "論理更新",
          id: "ja/guides/developer/lightweight-update"
        },
        {
          type: "doc",
          label: "ReplacingMergeTree",
          id: "ja/migrations/postgres/replacing-merge-tree"
        },
      ]
    },
    {
      type: "category",
        label: "Dataの削除",
        collapsed: false,
        collapsible: false,
        items: [
          {
            type: "doc",
            label: "概要",
            id: "ja/managing-data/deletes",
          },
          {
            type: "doc",
            label: "論理削除",
            id: "ja/guides/developer/lightweight-delete"
          },
          {
            type: "link",
            label: "物理削除",
            href: "/ja/sql-reference/statements/alter/delete"
          },
          {
            type: "link",
            label: "Truncate Table",
            href: "/ja/sql-reference/statements/truncate"
          },
          {
            type: "link",
            label: "Drop Partition",
            href: "/ja/sql-reference/statements/alter/partition#drop-partitionpart"
          }
        ]
      },
      {
      type: "category",
      label: "データモデリング",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/data-modeling/schema-design",
        "ja/dictionary/index",
        {
          type: "category",
          label: "Materialized View",
          collapsible: true,
          collapsed: true,
          items: [
            "ja/materialized-view/index",
            // "/ja/materialized-view/refreshable-materialized-view"
          ],
        },
        {
          type: "category",
          label: "Data Compression",
          collapsed: true,
          collapsible: true,
          items: [
            {
              label: "概要",
              type: "doc",
              id: "ja/data-compression/compression-in-clickhouse",
            },
            "ja/data-compression/compression-modes"
          ],
        },
        "ja/data-modeling/denormalization",
      ],
    },
    {
      type: "category",
      label: "高度なガイド",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/guides/developer/alternative-query-languages",
        "ja/guides/developer/cascading-materialized-views",
        "ja/guides/developer/debugging-memory-issues",
        "ja/guides/developer/deduplicating-inserts-on-retries",
        "ja/guides/developer/deduplication",
        "ja/guides/developer/time-series-filling-gaps",
        "ja/guides/developer/ttl",
        "ja/guides/developer/understanding-query-execution-with-the-analyzer",
        "ja/guides/joining-tables",
      ],
    },
    {
      type: "category",
      label: "パフォーマンスと最適化",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/operations/analyzer",
        "ja/guides/best-practices/asyncinserts",
        "ja/guides/best-practices/avoidmutations",
        "ja/guides/best-practices/avoidnullablecolumns",
        "ja/guides/best-practices/avoidoptimizefinal",
        "ja/guides/best-practices/bulkinserts",
        "ja/guides/best-practices/partitioningkey",
        "ja/guides/best-practices/skipping-indexes",
        "ja/guides/best-practices/sparse-primary-indexes",
        "ja/operations/optimizing-performance/sampling-query-profiler",
        "ja/operations/performance-test",
        "ja/operations/query-cache",
      ]
    }
  ],

  aboutClickHouse_japanese: [
    {
      type: "category",
      label: "ClickHouseとは",
      link: {
        type: "doc",
        id: "ja/about-us/intro",
      },
      collapsed: false,
      collapsible: false,
      items: [
        "ja/about-us/adopters",
        "ja/about-us/support",
        "ja/settings/beta-and-experimental-features",
        "ja/about-us/cloud",
        "ja/about-us/history",
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
          dirName: "ja/whats-new",
        }
      ]
    },
    {
      type: "category",
      label: "開発とコントリビューション",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/operations/optimizing-performance/profile-guided-optimization",
        {
          type: "autogenerated",
          dirName: "ja/development",
        },
        {
          type: "category",
          label: "Native Protocol",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "autogenerated",
              dirName: "ja/native-protocol",
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
      items: [
        "ja/faq/general/columnar-database",
        "ja/faq/general/dbms-naming",
        "ja/faq/integration/index",
        "ja/faq/integration/json-import",
        "ja/faq/integration/oracle-odbc",
        "ja/faq/operations/delete-old-data",
        "ja/faq/operations/index",
        "ja/faq/operations/separate_storage",
        "ja/faq/use-cases/index",
        "ja/faq/use-cases/key-value",
        "ja/faq/use-cases/time-series",
      ],
    }
  ],

  serverAdmin_japanese: [
    {
      type: "category",
      label: "デプロイとスケーリング",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/deployment-guides/horizontal-scaling",
        "ja/deployment-guides/replicated",
        "ja/deployment-guides/terminology",
        "ja/architecture/cluster-deployment",
        "ja/guides/separation-storage-compute",
        "ja/guides/sizing-and-hardware-recommendations",
        "ja/guides/sre/keeper/index",
        "ja/guides/sre/network-ports",
        "ja/guides/sre/scaling-clusters",
        "ja/faq/operations/multi-region-replication",
        "ja/faq/operations/production",
        "ja/operations/cluster-discovery",
        "ja/operations/monitoring",
        "ja/operations/opentelemetry",
        "ja/operations/quotas",
        "ja/operations/ssl-zookeeper",
        "ja/operations/startup-scripts",
        "ja/operations/storing-data",
        "ja/operations/allocation-profiling",
        "ja/operations/backup",
        "ja/operations/caches",
        "ja/operations/workload-scheduling",
        "ja/operations/update",
        "ja/guides/troubleshooting",
        "ja/operations/tips",
        "ja/sql-reference/distributed-ddl",
      ],
    },
    {
      type: "category",
      label: "設定",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/operations/settings/index",
        "ja/operations/server-configuration-parameters/settings",
        "ja/operations/settings/composable-protocols",
        "ja/operations/settings/constraints-on-settings",
        "ja/operations/settings/settings-formats",
        "ja/operations/settings/memory-overcommit",
        "ja/operations/settings/merge-tree-settings",
        // "ja/operations/settings/mysql-binlog-client",
        "ja/operations/settings/permissions-for-queries",
        "ja/operations/settings/query-complexity",
        "ja/operations/settings/settings-query-level",
        "ja/operations/settings/settings",
        "ja/operations/settings/settings-profiles",
        "ja/operations/settings/settings-users",
        "ja/operations/named-collections",
        "ja/operations/configuration-files",
      ],
    },
    {
      type: "category",
      label: "System Tables",
      collapsed: true,
      collapsible: true,
      items: [
        "ja/operations/system-tables/index",
        "ja/operations/system-tables/asynchronous_insert_log",
        "ja/operations/system-tables/asynchronous_inserts",
        "ja/operations/system-tables/asynchronous_loader",
        "ja/operations/system-tables/asynchronous_metric_log",
        "ja/operations/system-tables/asynchronous_metrics",
        "ja/operations/system-tables/backup_log",
        "ja/operations/system-tables/blob_storage_log",
        "ja/operations/system-tables/build_options",
        "ja/operations/system-tables/clusters",
        "ja/operations/system-tables/columns",
        "ja/operations/system-tables/contributors",
        "ja/operations/system-tables/crash-log",
        "ja/operations/system-tables/current-roles",
        "ja/operations/system-tables/dashboards",
        "ja/operations/system-tables/data_skipping_indices",
        "ja/operations/system-tables/data_type_families",
        "ja/operations/system-tables/database_engines",
        "ja/operations/system-tables/databases",
        "ja/operations/system-tables/detached_parts",
        "ja/operations/system-tables/detached_tables",
        "ja/operations/system-tables/dictionaries",
        "ja/operations/system-tables/disks",
        "ja/operations/system-tables/distributed_ddl_queue",
        "ja/operations/system-tables/distribution_queue",
        "ja/operations/system-tables/dns_cache",
        "ja/operations/system-tables/dropped_tables",
        "ja/operations/system-tables/dropped_tables_parts",
        "ja/operations/system-tables/enabled-roles",
        "ja/operations/system-tables/error_log",
        "ja/operations/system-tables/errors",
        "ja/operations/system-tables/events",
        "ja/operations/system-tables/functions",
        "ja/operations/system-tables/grants",
        "ja/operations/system-tables/graphite_retentions",
        "ja/operations/system-tables/information_schema",
        "ja/operations/system-tables/jemalloc_bins",
        "ja/operations/system-tables/kafka_consumers",
        "ja/operations/system-tables/licenses",
        "ja/operations/system-tables/merge_tree_settings",
        "ja/operations/system-tables/merges",
        "ja/operations/system-tables/metric_log",
        "ja/operations/system-tables/metrics",
        "ja/operations/system-tables/moves",
        "ja/operations/system-tables/mutations",
        "ja/operations/system-tables/numbers",
        "ja/operations/system-tables/numbers_mt",
        "ja/operations/system-tables/one",
        "ja/operations/system-tables/opentelemetry_span_log",
        "ja/operations/system-tables/part_log",
        "ja/operations/system-tables/parts",
        "ja/operations/system-tables/parts_columns",
        "ja/operations/system-tables/processes",
        "ja/operations/system-tables/processors_profile_log",
        "ja/operations/system-tables/query_cache",
        "ja/operations/system-tables/query_log",
        "ja/operations/system-tables/query_thread_log",
        "ja/operations/system-tables/query_views_log",
        "ja/operations/system-tables/quota_limits",
        "ja/operations/system-tables/quota_usage",
        "ja/operations/system-tables/quotas",
        "ja/operations/system-tables/quotas_usage",
        "ja/operations/system-tables/replicas",
        "ja/operations/system-tables/replicated_fetches",
        "ja/operations/system-tables/replication_queue",
        "ja/operations/system-tables/role-grants",
        "ja/operations/system-tables/roles",
        "ja/operations/system-tables/row_policies",
        "ja/operations/system-tables/scheduler",
        "ja/operations/system-tables/schema_inference_cache",
        "ja/operations/system-tables/server_settings",
        "ja/operations/system-tables/session_log",
        "ja/operations/system-tables/settings",
        "ja/operations/system-tables/settings_changes",
        "ja/operations/system-tables/settings_profile_elements",
        "ja/operations/system-tables/settings_profiles",
        "ja/operations/system-tables/stack_trace",
        "ja/operations/system-tables/storage_policies",
        "ja/operations/system-tables/symbols",
        "ja/operations/system-tables/table_engines",
        "ja/operations/system-tables/tables",
        "ja/operations/system-tables/text_log",
        "ja/operations/system-tables/time_zones",
        "ja/operations/system-tables/trace_log",
        "ja/operations/system-tables/user_processes",
        "ja/operations/system-tables/users",
        "ja/operations/system-tables/view_refreshes",
        "ja/operations/system-tables/zookeeper",
        "ja/operations/system-tables/zookeeper_connection",
        "ja/operations/system-tables/zookeeper_log",
      ]
    },
    {
      type: "category",
      label: "セキュリティと認証",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/guides/sre/user-management/index",
        {
          type: "category",
          label: "外部認証",
          collapsed: true,
          collapsible: true,
          items: [
            {
              type: "doc",
              label: "概要",
              id: "ja/operations/external-authenticators/index",
            },
            {
              type: "category",
              label: "SSL",
              collapsed: true,
              collapsible: true,
              items: [
                "ja/guides/sre/user-management/ssl-user-auth",
                "ja/guides/sre/configuring-ssl",
                "ja/operations/external-authenticators/ssl-x509",
              ],
            },
            {
              type: "category",
              label: "LDAP",
              collapsed: true,
              collapsible: true,
              items: [
                "ja/operations/external-authenticators/ldap",
                "ja/guides/sre/user-management/configuring-ldap",
              ],
            },
            "ja/operations/external-authenticators/http",
            "ja/operations/external-authenticators/kerberos",
          ],
        },
      ]
    },
    {
      type: "category",
      label: "ツールとユーティリティ",
      collapsed: false,
      collapsible: false,
      items: [
        {
          label: "概要",
          id: "ja/operations/utilities/index",
          type: "doc",
        },
        "ja/operations/utilities/backupview",
        "ja/operations/utilities/clickhouse-benchmark",
        "ja/operations/utilities/clickhouse-compressor",
        // "ja/operations/utilities/clickhouse-copier",
        "ja/operations/utilities/clickhouse-disks",
        "ja/operations/utilities/clickhouse-format",
        "ja/operations/utilities/clickhouse-keeper-client",
        "ja/operations/utilities/clickhouse-local",
        "ja/operations/utilities/clickhouse-obfuscator",
        "ja/operations/utilities/odbc-bridge",
        "ja/tools-and-utilities/static-files-disk-uploader",
        "ja/getting-started/playground",   
      ],
    }
  ],

  chd_japaneseb: [
    {
      type: "category",
      label: "chDB",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/chdb/index",
        "ja/chdb/data-formats",
        "ja/chdb/sql-reference"
      ],
    },
    {
      type: "category",
      label: "言語クライアント",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/chdb/install/python",
        "ja/chdb/install/nodejs",
        "ja/chdb/install/go",
        "ja/chdb/install/rust",
        "ja/chdb/install/bun",
        "ja/chdb/install/c",
      ],
    },
    {
      type: "category",
      label: "ガイド",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        "ja/chdb/guides/jupysql",
        "ja/chdb/guides/querying-pandas",
        "ja/chdb/guides/querying-apache-arrow",
        "ja/chdb/guides/querying-s3-bucket",
        "ja/chdb/guides/querying-parquet",
        "ja/chdb/guides/query-remote-clickhouse",
        "ja/chdb/guides/clickhouse-local" 
      ],
    },
    {
      type: "category",
      label: "統合",
      className: "top-nav-item",
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: "link",
          label: "JupySQL",
          href: "https://jupysql.ploomber.io/ja/latest/integrations/chdb.html",
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
      label: "chDBとは",
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
          label: "chDBの誕生",
          href: "https://auxten.com/the-birth-of-chdb/",
        },
        {
          type: "link",
          label: "ClickHouse, Inc.への参加",
          href: "https://clickhouse.com/blog/welcome-chdb-to-clickhouse",
        },
        {
          type: "link",
          label: "チームとコントリビューター",
          href: "https://github.com/chdb-io/chdb#contributors",
        },
      ],
    },
  ],
  // Used for generating the secondary nav mobile menu (DocsCategoryDropdown)
  dropdownCategories : [
    {
      type: 'category',
      label: 'Getting Started',
      //description: 'Learn how to use ClickHouse',
      items: [
        {
          type: 'link',
          label: 'Introduction',
          //description: 'An introduction to ClickHouse',
          href: '/docs'
        },
        {
          type: 'link',
          label: 'Starter Guides',
          //description: 'Start here when learning ClickHouse',
          href: '/docs/en/guides/creating-tables'
        },
        {
          type: 'link',
          label: 'Concepts',
          //description: 'Core concepts to know',
          href: '/docs/en/concepts/why-clickhouse-is-so-fast'
        },
        {
          type: 'link',
          label: 'Migration Guides',
          //description: 'Migrate your database to ClickHouse',
          href: '/docs/en/migrations/bigquery'
        },
        {
          type: 'link',
          label: 'Use Case Guides',
          //description: 'Common use case guides for ClickHouse',
          href: '/docs/en/migrations/bigquery'
        },
        {
          type: 'link',
          label: 'Example datasets',
          //description: 'Helpful datasets and tutorials',
          href: '/docs/en/getting-started/example-datasets'
        },
      ]
    },
    {
        type: 'category',
        label: 'Cloud',
        //description: 'The fastest way to deploy ClickHouse',
        items: [
          {
            type: 'link',
            label: 'Get Started',
            //description: 'Start quickly with ClickHouse Cloud',
            href: '/docs/en/cloud/overview'
          },
          {
            type: 'link',
            label: 'Best Practices',
            //description: 'How to get the most out of ClickHouse Cloud',
            href: '/docs/en/cloud/bestpractices/bulk-inserts'
          },
          {
            type: 'link',
            label: 'Managing Cloud',
            //description: 'Manage your ClickHouse Cloud services',
            href: '/docs/en/cloud/manage/service-types'
          },
          {
            type: 'link',
            label: 'Security',
            //description: 'Secure your ClickHouse Cloud services',
            href: '/docs/en/cloud/security/shared-responsibility-model'
          },
          {
            type: 'link',
            label: 'Cloud API',
            //description: 'Automate your ClickHouse Cloud services',
            href: '/docs/en/cloud/manage/api/api-overview'
          },
          {
            type: 'link',
            label: 'Migrating to Cloud',
            //description: 'Migrate your database to ClickHouse Cloud',
            href: '/docs/en/integrations/migration'
          },
          {
            type: 'link',
            label: 'Cloud Reference',
            //description: 'Understanding how ClickHouse Cloud works',
            href: '/docs/en/cloud/reference/architecture'
          },
        ]
    },
    {
        type: 'category',
        label: 'Managing Data',
        //description: 'How to manage data in ClickHouse',
        items: [
        {
          type: 'link',
          label: 'Updating Data',
          //description: 'Updating and replacing data in ClickHouse',
          href: '/docs/en/updating-data'
        },
        {
          type: 'link',
          label: 'Data Modeling',
          //description: 'Optimize your schema and data model',
          href: '/docs/en/data-modeling/schema-design'
        },
        {
          type: 'link',
          label: 'Deleting Data',
          //description: 'Deleting data in ClickHouse',
          href: '/docs/en/deletes'
        },
        {
          type: 'link',
          label: 'Performance and Optimizations',
          //description: 'Guides to help you optimize ClickHouse',
          href: '/docs/en/operations/optimizing-performance/profile-guided-optimization'
        }
      ]
    },
    {
      type: 'category',
      label: 'Server Admin',
      //description: 'Manage and deploy ClickHouse',
      items: [
        {
          type: 'link',
          label: 'Deployments and Scaling',
          //description: 'How to deploy ClickHouse',
          href: '/docs/en/architecture/cluster-deployment'
        },
        {
          type: 'link',
          label: 'Security and Authentication',
          //description: 'Secure your ClickHouse deployment',
          href: '/docs/en/operations/external-authenticators/http'
        },
        {
          type: 'link',
          label: 'Settings',
          //description: 'Configure ClickHouse',
          href: '/docs/en/operations/settings'
        },
        {
          type: 'link',
          label: 'Tools and Utilities',
          //description: 'Tools to help you manage ClickHouse',
          href: '/docs/en/operations/utilities/backupview'
        },
        {
          type: 'link',
          label: 'System Tables',
          //description: 'Metadata tables to help you manage ClickHouse',
          href: '/docs/en/operations/system-tables/asynchronous_insert_log'
        }
      ]
    },
    {
      type: 'category',
      label: 'SQL Reference',
      //description: 'Reference documentation for ClickHouse features',
      items: [
        {
          type: 'link',
          label: 'Introduction',
          //description: 'Learn ClickHouse syntax',
          href: '/docs/en/sql-reference'
        },
        {
          type: 'link',
          label: 'Functions',
          //description: 'Hundreds of built-in functions to help you analyze your data',
          href: '/docs/en/sql-reference/functions'
        },
        {
          type: 'link',
          label: 'Engines',
          //description: 'Use the right table and database engines for your data',
          href: '/docs/en/engines/database-engines'
        },
        {
          type: 'link',
          label: 'Other Features',
          //description: 'Learn about other features in ClickHouse',
          href: '/docs/en/sql-reference/operators'
        }
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      //description: 'Integrations, clients, and drivers to use with ClickHouse',
      items: [
        {
          type: 'link',
          label: 'ClickPipes',
          //description: 'The easiest way to ingest data into ClickHouse',
          href: '/docs/en/integrations/clickpipes'
        },
        {
          type: 'link',
          label: 'Data Formats',
          //description: 'Explore data formats supported by ClickHouse',
          href: '/docs/en/integrations/data-formats'
        },
        {
          type: 'link',
          label: 'All Integrations',
          //description: 'Integrate ClickHouse with other databases and applications',
          href: '/docs/en/integrations'
        },
        {
          type: 'link',
          label: 'Clients and Drivers',
          //description: 'Choose a client or driver to connect to ClickHouse',
          href: '/docs/en/integrations/sql-clients/clickhouse-client-local'
        },
      ]
    },
    {
      type: 'category',
      label: 'chDB',
      //description: 'chDB is an embedded version of ClickHouse',
      items: [
        {
          type: 'link',
          label: 'Learn chDB',
          //description: 'Learn how to use chDB',
          href: '/docs/en/chdb'
        },
        {
          type: 'link',
          label: 'Guides',
          //description: 'Guides to help you use chDB',
          href: '/docs/en/chdb/guides/jupysql'
        },
        {
          type: 'link',
          label: 'Language Clients',
          //description: 'Connect to chDB using a language client',
          href: '/docs/en/chdb/install/python'
        },
      ]
    },
    {
      type: 'category',
      label: 'About',
      //description: 'Learn more about ClickHouse',
      items: [
        {
          type: 'link',
          label: 'About ClickHouse',
          //description: 'Learn about ClickHouse',
          href: '/docs/en/about-us/adopters'
        },
        {
          type: 'link',
          label: 'Changelogs',
          //description: 'View the latest changes in ClickHouse',
          href: '/docs/en/whats-new/security-changelog'
        },
        {
          type: 'link',
          label: 'Support',
          //description: 'Get support from ClickHouse engineers',
          href: '/docs/en/about-us/support'
        },
        {
          type: 'link',
          label: 'Development and Contributing',
          //description: 'Learn how to contribute to ClickHouse',
          href: '/docs/en/development/developer-instruction'
        }
      ]
    },
  ]};

module.exports = sidebars;
