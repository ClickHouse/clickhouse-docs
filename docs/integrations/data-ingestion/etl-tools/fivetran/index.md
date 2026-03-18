---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: 'Use Fivetran to move data from any source into ClickHouse Cloud with automated schema creation, deduplication, and History Mode (SCD Type 2).'
title: 'Fivetran and ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['fivetran', 'data movement', 'etl', 'clickhouse destination', 'automated data platform', 'history mode', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Fivetran and ClickHouse Cloud

<ClickHouseSupportedBadge/>

## Overview {#overview}

[Fivetran](https://www.fivetran.com) is an automated data movement platform that extracts data from sources, transforms it, and loads it into destinations.

The [ClickHouse Cloud destination](https://fivetran.com/docs/destinations/clickhouse) allows you to load data from any Fivetran-supported source into ClickHouse Cloud. The connector is currently in **Beta** and supports [History Mode (SCD Type 2)](https://fivetran.com/docs/destinations/clickhouse) for tracking complete record change history.

The destination connector is developed and maintained by ClickHouse. The source code is available on [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination).

## Supported setups {#supported-setups}

| Setup | Supported |
|-------|-----------|
| ClickHouse Cloud (all tiers) | Yes |
| ClickHouse Cloud BYOC | Yes |
| Self-hosted ClickHouse (MergeTree only) | No |

The connector requires [SharedMergeTree](/cloud/reference/shared-merge-tree)-based engines and uses the `Replicated` database engine internally.

## Key features {#key-features}

- **Automatic schema creation** — destination tables and databases are created automatically based on source schema.
- **SharedReplacingMergeTree** — all destination tables use `SharedReplacingMergeTree` versioned by `_fivetran_synced` for automatic deduplication.
- **History Mode (SCD Type 2)** — preserves complete history of all record versions for point-in-time analysis and audit trails.
- **Retry on network failures** — transient network errors are retried with exponential backoff. Duplicates from retries are handled by `ReplacingMergeTree`.
- **Configurable batch sizes** — tune write, select, mutation, and hard delete batch sizes via a JSON configuration file.

## Limitations {#limitations}

- Adding, removing, or modifying primary key columns is not supported.
- Custom ClickHouse settings on `CREATE TABLE` statements are not supported.
- Role-based grants are not fully supported — the connector's grants check only queries direct user grants. Use [direct grants](/integrations/fivetran/troubleshooting#role-based-grants) instead.

## Related pages {#related-pages}

- [Setup Guide](/integrations/fivetran/setup-guide) — step-by-step configuration instructions
- [Technical Reference](/integrations/fivetran/reference) — type mappings, table engines, metadata columns
- [Troubleshooting & Best Practices](/integrations/fivetran/troubleshooting) — common errors and optimization tips

## Additional resources {#additional-resources}

- [Fivetran ClickHouse destination docs](https://fivetran.com/docs/destinations/clickhouse)
- [Fivetran ClickHouse setup guide](https://fivetran.com/docs/destinations/clickhouse/setup-guide)
- [ClickHouse Fivetran destination on GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination)
- [ClickHouse Support](/about-us/support)
