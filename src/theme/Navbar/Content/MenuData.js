import React from 'react';
import Translate from '@docusaurus/Translate';

export const dropdownCategories = [
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Get started">Get started</Translate>,
    description: <Translate id="sidebar.dropdownCategories.category.description.Get started">Learn how to use ClickHouse</Translate>,
    customProps: {
      href: "/introduction-clickhouse",
      sidebar: "docs"
    },
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Introduction">Introduction</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Introduction.description">An introduction to ClickHouse</Translate>,
        href: "/intro"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Concepts">Concepts</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Concepts.description">Core concepts to know</Translate>,
        href: "/concepts"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Starter guides">Starter guides</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Starter guides.description">Start here when learning ClickHouse</Translate>,
        href: "/starter-guides"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Best practices">Best practices</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Best practices.description">Follow best practices with ClickHouse</Translate>,
        href: "/best-practices"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Migration guides">Migration guides</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Migration guides.description">Migrate your database to ClickHouse</Translate>,
        href: "/integrations/migration/overview"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Use case guides">Use case guides</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Use case guides.description">Common use case guides for ClickHouse</Translate>,
        href: "/use-cases"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Example datasets">Example datasets</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Example datasets.description">Helpful datasets and tutorials</Translate>,
        href: "/getting-started/example-datasets"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Get started.Tips and community wisdom">Tips and community wisdom</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Get started.Tips and community wisdom.description">Tips and tricks from the community</Translate>,
        href: "/tips-and-tricks/community-wisdom"
      }
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Cloud">Cloud</Translate>,
    description: <Translate id="sidebar.dropdownCategories.category.description.Cloud">The fastest way to deploy ClickHouse</Translate>,
    customProps: {
      href: "/cloud/overview",
      sidebar: "cloud"
    },
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Cloud.Get Started">Get Started</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Cloud.Get Started.description">Start quickly with ClickHouse Cloud</Translate>,
        href: "/cloud/get-started/"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Cloud.Features">Features</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Cloud.Features.description">Features offered by ClickHouse Cloud</Translate>,
        href: "/cloud/manage/cloud-tiers"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Cloud.Guides">Guides</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Cloud.Guides.description">ClickHouse Cloud guides</Translate>,
        href: "/cloud/guides"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Cloud.Reference">Reference</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Cloud.Reference.description">Reference docs for ClickHouse Cloud</Translate>,
        href: "/cloud/reference/"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Cloud.Managed Postgres">Managed Postgres (Preview)</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Cloud.Managed Postgres.description">Managed PostgreSQL service</Translate>,
        href: "/cloud/managed-postgres/overview"
      },
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Manage data">Manage data</Translate>,
    customProps: {
      href: "/updating-data",
      sidebar: "managingData"
    },
    description: <Translate id="sidebar.dropdownCategories.category.description.Manage data">How to manage data in ClickHouse</Translate>,
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Manage data.Core data concepts">Core data concepts</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Manage data.Core data concepts.description">Understand internal concepts in ClickHouse</Translate>,
        href: "/managing-data/core-concepts"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Manage data.Updating data">Updating data</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Manage data.Updating data.description">Updating and replacing data in ClickHouse</Translate>,
        href: "/updating-data"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Manage data.Deleting data">Deleting data</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Manage data.Deleting data.description">Deleting data in ClickHouse</Translate>,
        href: "/managing-data/deleting-data/overview"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Manage data.Data modeling">Data modeling</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Manage data.Data modeling.description">Optimize your schema and data model</Translate>,
        href: "/data-modeling/overview"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Manage data.Performance and optimizations">Performance and optimizations</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Manage data.Performance and optimizations.description">Guides to help you optimize ClickHouse</Translate>,
        href: "/operations/overview"
      }
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Server admin">Server admin</Translate>,
    customProps: {
      href: "/guides/manage-and-deploy-index",
      sidebar: "serverAdmin"
    },
    description: <Translate id="sidebar.dropdownCategories.category.description.Server admin">Manage and deploy ClickHouse</Translate>,
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Server admin.Deployments and scaling">Deployments and scaling</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Server admin.Deployments and scaling.description">How to deploy ClickHouse</Translate>,
        href: "/deployment-guides/index"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Server admin.Security and authentication">Security and authentication</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Server admin.Security and authentication.description">Secure your ClickHouse deployment</Translate>,
        href: "/security-and-authentication"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Server admin.Settings">Settings</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Server admin.Settings.description">Configure ClickHouse</Translate>,
        href: "/operations/settings"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Server admin.Tools and utilities">Tools and utilities</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Server admin.Tools and utilities.description">Tools to help you manage ClickHouse</Translate>,
        href: "/operations/utilities"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Server admin.System tables">System tables</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Server admin.System tables.description">Metadata tables to help you manage ClickHouse</Translate>,
        href: "/operations/system-tables"
      }
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Reference">Reference</Translate>,
    customProps: {
      href: "/sql-reference",
      sidebar: "sqlreference"
    },
    description: <Translate id="sidebar.dropdownCategories.category.description.Reference">Reference documentation for ClickHouse features</Translate>,
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Reference.Introduction">Introduction</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Reference.Introduction.description">Learn ClickHouse syntax</Translate>,
        href: "/sql-reference"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Reference.Functions">Functions</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Reference.Functions.description">Hundreds of built-in functions to help you analyze your data</Translate>,
        href: "/sql-reference/functions"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Reference.Engines">Engines</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Reference.Engines.description">Use the right table and database engines for your data</Translate>,
        href: "/engines"
      },
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.Integrations">Integrations</Translate>,
    description: <Translate id="sidebar.dropdownCategories.category.description.Integrations">Integrations, clients, and drivers to use with ClickHouse</Translate>,
    customProps: {
      href: "/integrations",
      sidebar: "integrations"
    },
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.All integrations">All integrations</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.All integrations.description">Integrate ClickHouse with other databases and applications</Translate>,
        href: "/integrations"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Language clients">Language clients</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Language clients.description">Use your favorite language to work with ClickHouse</Translate>,
        href: "/integrations/language-clients"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.ClickPipes">ClickPipes</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.ClickPipes.description">The easiest way to ingest data into ClickHouse</Translate>,
        href: "/integrations/clickpipes"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Native clients & interfaces">Native clients & interfaces</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Native clients & interfaces.description">Choose a client and interface to connect to ClickHouse</Translate>,
        href: "/interfaces/natives-clients-and-interfaces"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Data sources">Data sources</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Data sources.description">Load data into ClickHouse from your prefered source</Translate>,
        href: "/integrations/data-sources/index"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Data visualization">Data visualization</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Data visualization.description">Connect ClickHouse to your favorite visualization tool</Translate>,
        href: "/integrations/data-visualization"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Data formats">Data formats</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Data formats.description">Explore data formats supported by ClickHouse</Translate>,
        href: "/integrations/data-formats"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.Integrations.Data ingestion">Data ingestion</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.Integrations.Data ingestion.description">Ingest data into ClickHouse with a range of ELT tools</Translate>,
        href: "/integrations/data-ingestion-overview"
      }
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.ClickStack">ClickStack</Translate>,
    description: <Translate id="sidebar.dropdownCategories.category.description.ClickStack">ClickStack - The ClickHouse Observability Stack</Translate>,
    customProps: {
      href: "/use-cases/observability/clickstack/overview",
      sidebar: "clickstack"
    },
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Getting started">Getting started</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Getting started.description">Get started with ClickStack</Translate>,
        href: "/use-cases/observability/clickstack/getting-started"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Sample datasets">Sample datasets</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Sample datasets.description">Learn ClickStack with sample datasets</Translate>,
        href: "/use-cases/observability/clickstack/sample-datasets"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Architecture">Architecture</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Architecture.description">Familiarize yourself with the ClickStack architecture</Translate>,
        href: "/use-cases/observability/clickstack/sample-datasets"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Deployment">Deployment</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Deployment.description">Choose a ClickStack deployment mode</Translate>,
        href: "/use-cases/observability/clickstack/deployment"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Ingesting data">Ingesting data</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Ingesting data.description">Ingest data into ClickStack</Translate>,
        href: "/use-cases/observability/clickstack/ingesting-data"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Configuration options">Configuration options</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Configuration options.description">Deploy ClickStack in production</Translate>,
        href: "/use-cases/observability/clickstack/production"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Production">Production</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Production.description">Deploy ClickStack in production</Translate>,
        href: "/use-cases/observability/clickstack/production"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.ClickStack.Integration examples">Integration examples</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.ClickStack.Integration examples.description">Integration quick start guides</Translate>,
        href: "/use-cases/observability/clickstack/integration-guides"
      }
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.chDB">chDB</Translate>,
    description: <Translate id="sidebar.dropdownCategories.category.description.chDB">chDB is an embedded version of ClickHouse</Translate>,
    customProps: {
      href: "/chdb",
      sidebar: "chdb"
    },
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.chDB.Learn chDB">Learn chDB</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.chDB.Learn chDB.description">Learn how to use chDB</Translate>,
        href: "/chdb"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.chDB.Language integrations">Language integrations</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.chDB.Language integrations.description">Connect to chDB using a language client</Translate>,
        href: "/chdb/install"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.chDB.Guides">Guides</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.chDB.Guides.description">Guides to help you use chDB</Translate>,
        href: "/chdb/guides"
      },
    ]
  },
  {
    type: "category",
    label: <Translate id="sidebar.dropdownCategories.category.About">About</Translate>,
    customProps: {
      href: "/about",
      sidebar: "aboutClickHouse"
    },
    description: <Translate id="sidebar.dropdownCategories.category.description.About">Learn more about ClickHouse</Translate>,
    items: [
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.About.Adopters">Adopters</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.About.Adopters.description">ClickHouse adopters</Translate>,
        href: "/about-us/adopters"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.About.Changelogs">Changelogs</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.About.Changelogs.description">View the latest changes in ClickHouse</Translate>,
        href: "/category/changelog"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.About.Support">Support</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.About.Support.description">Get support from ClickHouse engineers</Translate>,
        href: "/about-us/support"
      },
      {
        type: "link",
        label: <Translate id="sidebar.dropdownCategories.category.About.Development and contributing">Development and contributing</Translate>,
        description: <Translate id="sidebar.dropdownCategories.category.About.Development and contributing.description">Learn how to contribute to ClickHouse</Translate>,
        href: "/development/developer-instruction"
      }
    ]
  },
];
