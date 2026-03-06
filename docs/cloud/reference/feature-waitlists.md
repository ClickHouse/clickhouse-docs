---
sidebar_label: 'Feature Waitlists'
title: 'Feature Waitlists'
description: 'ClickHouse Cloud features currently available in Private Preview with waitlist sign-up.'
slug: /cloud/reference/feature-waitlists
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'private preview', 'waitlist', 'early access', 'upcoming features']
---

ClickHouse Cloud regularly introduces new capabilities through a **Private Preview** program before they become generally available (GA). Private Preview features are production-quality but may have limited availability, evolving interfaces, or restricted regional support as the team gathers feedback and iterates.

To try a Private Preview feature, join its waitlist using the links below. Once approved, you will receive access credentials and onboarding instructions from the ClickHouse team.

:::note
For information on **Beta** and **Experimental** feature settings in ClickHouse (OSS and Cloud), see the [Beta and Experimental Features](/beta-and-experimental-features) page.
:::

## What Private Preview means {#what-private-preview-means}

- The feature is under active development toward general availability
- Access is granted on a per-organization basis through a waitlist
- The ClickHouse team provides support to Private Preview participants
- Functionality, APIs, or configuration may change before GA
- The feature may not be available in all regions or cloud providers
- There is no additional cost for participating in a Private Preview unless otherwise noted

## ClickPipes connectors {#clickpipes-connectors}

| Feature | Description | Waitlist |
|---|---|---|
| [BigQuery connector](/integrations/clickpipes/bigquery/overview) | Replicate data from Google BigQuery into ClickHouse Cloud. Currently supports initial load with GCS staging. | [Join waitlist](https://clickhouse.com/cloud/clickpipes) |

## Cloud infrastructure {#cloud-infrastructure}

| Feature | Description | Waitlist |
|---|---|---|
| [BYOC for GCP](/cloud/reference/byoc/overview) | Deploy ClickHouse Cloud in your own Google Cloud account. BYOC for AWS is [generally available](/cloud/reference/byoc/overview). | [Join waitlist](https://clickhouse.com/cloud/bring-your-own-cloud) |
| [BYOC for Azure](/cloud/reference/byoc/overview) | Deploy ClickHouse Cloud in your own Azure account. Currently in Private Preview. | [Join waitlist](https://clickhouse.com/cloud/bring-your-own-cloud) |
| [ClickHouse Government](https://clickhouse.com/blog/clickHouse-government-aws) | ClickHouse Cloud for government and public sector workloads with FIPS 140-3 support. Available in Private Preview on AWS. | [Join waitlist](https://clickhouse.com/government) |

## Query engine and performance {#query-engine-and-performance}

| Feature | Description | Waitlist |
|---|---|---|
| Distributed Cache | Unified caching layer across compute nodes for improved query performance on shared storage. | [Join waitlist](https://clickhouse.com/cloud/distributed-cache-waitlist) |

## Data platform {#data-platform}

| Feature | Description | Waitlist |
|---|---|---|
| [Data Lakehouse](/use-cases/data-lake) | Query and manage data across ClickHouse and open table formats like Iceberg. | [Join waitlist](https://clickhouse.com/cloud/data-lakehouse-waitlist) |
| [Managed Postgres](/cloud/managed-postgres) | Managed Postgres on NVMe storage with native CDC integration into ClickHouse Cloud. | [Join waitlist](https://clickhouse.com/cloud/postgres) |

## Previously in Private Preview {#previously-in-private-preview}

The following features have graduated from Private Preview and are now generally available or in Public Beta:

| Feature | Current status | Documentation |
|---|---|---|
| Postgres CDC ClickPipe | GA (Jun 2025) | [Documentation](/integrations/clickpipes/postgres) |
| MySQL CDC ClickPipe | Public Beta (Jul 2025) | [Documentation](/integrations/clickpipes/mysql) |
| MongoDB CDC ClickPipe | Public Beta (Jan 2026) | [Documentation](/integrations/clickpipes/mongodb) |
| BYOC for AWS | GA (Feb 2025) | [Documentation](/cloud/reference/byoc/overview) |
| Managed ClickStack | Beta (Feb 2026) | [Documentation](/use-cases/observability/clickstack) |
| ClickHouse AI (Ask AI & Remote MCP Server) | Public Beta (Sep 2025) | [Documentation](https://clickhouse.com/blog/agentic-analytics-ask-ai-agent-and-remote-mcp-server-beta-launch) |
| ClickHouse Cloud on Azure | GA | [Documentation](/cloud/reference/supported-regions) |
| ClickHouse Cloud on GCP | GA | [Documentation](/cloud/reference/supported-regions) |
| ClickPipes for Kafka | GA | [Documentation](/integrations/clickpipes/kafka) |
| Azure Blob Storage ClickPipe | GA | [Documentation](/integrations/clickpipes/object-storage/abs/overview) |
| Text indexes (inverted indexes) | GA (ClickHouse 26.2) | [Documentation](/engines/table-engines/mergetree-family/textindexes) |
| Vector similarity index | GA (ClickHouse 25.8) | [Documentation](/engines/table-engines/mergetree-family/annindexes) |
