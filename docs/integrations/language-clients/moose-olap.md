---
description: 'Get started with the Moose Stack - a code-first approach to building on top of ClickHouse with type-safe schemas and local development'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Developing on ClickHouse with Moose OLAP'
keywords: ['Moose']
doc_type: 'overview'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Developing on ClickHouse with Moose OLAP

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) is a core module of the [Moose Stack](https://docs.fiveonefour.com/moose), an open source developer toolkit for building real-time analytical backends in Typescript and Python. 

Moose OLAP offers developer-friendly abstractions and ORM-like functionality, built natively for ClickHouse.

## Key features of Moose OLAP {#key-features}

- **Schemas as code**: Define your ClickHouse tables in TypeScript or Python with type safety and IDE autocompletion
- **Type-safe queries**: Write SQL queries with type checking and autocompletion support
- **Local development**: Develop and test against local ClickHouse instances without affecting production
- **Migration management**: Version control your schema changes and manage migrations through code
- **Real-time streaming**: Built-in support for pairing ClickHouse with Kafka or Redpanda for streaming ingest
- **REST APIs**: Easily generate fully documented REST APIs on top of your ClickHouse tables and views

## Getting started in under 5 minutes {#getting-started}

For the latest and greatest Installation and Getting Started guides, see the [Moose Stack documentation](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse).

Or follow this guide to get up and running with Moose OLAP on an existing ClickHouse or ClickHouse Cloud deployment in under 5 minutes.

### Prerequisites {#prerequisites}

- **Node.js 20+** OR **Python 3.12+** - Required for TypeScript or Python development
- **Docker Desktop** - For local development environment
- **macOS/Linux** - Windows works via WSL2

<VerticalStepper headerLevel="h3">

### Install Moose {#step-1-install-moose}

Install the Moose CLI globally to your system:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### Set up your project {#step-2-set-up-project}

#### Option A: Use your own existing ClickHouse deployment {#option-a-use-own-clickhouse}

**Important**: Your production ClickHouse will remain untouched. This will just initialize a new Moose OLAP project with data models derived from your ClickHouse tables.

```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript

# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

Your ClickHouse connection string should be in this format:

```bash
https://username:password@host:port/?database=database_name
```

#### Option B: use ClickHouse playground {#option-b-use-clickhouse-playground}

Don't have ClickHouse up and running yet? Use the ClickHouse Playground to try out Moose OLAP!

```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript

# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### Install dependencies {#step-3-install-dependencies}

```bash
# TypeScript
cd my-project
npm install

# Python
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

You should see: `Successfully generated X models from ClickHouse tables`

### Explore your generated models {#step-4-explore-models}

The Moose CLI automatically generates TypeScript interfaces or Python Pydantic models from your existing ClickHouse tables.

Check out your new data models in the `app/index.ts` file.

### Start development {#step-5-start-development}

Start your dev server to spin up a local ClickHouse instance with all your production tables automatically reproduced from your code definitions:

```bash
moose dev
```

**Important**: Your production ClickHouse will remain untouched. This creates a local development environment.

### Seed your local database {#step-6-seed-database}

Seed your data into your local ClickHouse instance:

#### From your own ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### From ClickHouse playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Building with Moose OLAP {#step-7-building-with-moose-olap}

Now that you have your Tables defined in code, you get the same benefits as ORM data models in web apps - type safety and autocomplete when building APIs and Materialized Views on top of your analytical data. As a next step, you could try:
* Building a REST API with [Moose API](https://docs.fiveonefour.com/moose/apis)
* Ingesting or transforming data with [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) or [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)
* Explore going to production with [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) and [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)

</VerticalStepper>

## Get help and stay connected {#get-help-stay-connected}
- **Reference Application**: Check out the open source reference application, [Area Code](https://github.com/514-labs/area-code): a starter repo with all the necessary building blocks for a feature-rich, enterprise-ready application that requires specialized infrastructure. There are two sample applications: User Facing Analytics and Operational Data Warehouse.
- **Slack Community**: Connect with the Moose Stack maintainers [on Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) for support and feedback
- **Watch Tutorials**: Video tutorials, demos, and deep-dives into Moose Stack features [on Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)
- **Contribute**: Check out the code, contribute to the Moose Stack, and report issues [on GitHub](https://github.com/514-labs/moose)
