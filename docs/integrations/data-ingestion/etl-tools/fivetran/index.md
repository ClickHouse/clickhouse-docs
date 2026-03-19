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
  - website: 'https://github.com/ClickHouse/clickhouse-fivetran-destination'
keywords: ['fivetran', 'data movement', 'etl', 'clickhouse destination', 'automated data platform', 'history mode', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Fivetran and ClickHouse Cloud

<ClickHouseSupportedBadge/>

## Overview {#overview}

[Fivetran](https://www.fivetran.com) is the automated data movement platform moving data out of, into and across your cloud data platforms.

[ClickHouse Cloud](https://clickhouse.com/cloud) is supported as a [Fivetran destination](https://fivetran.com/docs/destinations/clickhouse), allowing users to load data from various sources into ClickHouse. Open Source ClickHouse version is not supported as destination.

The destination connector is developed and maintained together by ClickHouse and Fivetran. The source code is available on [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination).

:::note
[ClickHouse Cloud destination](https://fivetran.com/docs/destinations/clickhouse) is currently in **Beta** but we are working to make it generally available soon.
:::

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Key features {#key-features}

- **Automatic schema creation** — destination tables and databases are created automatically based on source schema.
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
