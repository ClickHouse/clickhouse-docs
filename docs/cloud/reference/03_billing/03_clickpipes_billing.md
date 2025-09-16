---
sidebar_label: 'ClickPipes'
slug: /cloud/reference/billing/clickpipes
title: 'ClickPipes billing'
description: 'Overview of ClickPipes billing'
---

import ClickPipesFAQ from '../../_snippets/_clickpipes_faq.md'

ClickPipes billing occurs along the following two dimensions:
- [ClickPipes for streaming and object storage](/cloud/reference/billing/clickpipes/streaming-and-object-storage)
- [ClickPipes for Postgres CDC](/cloud/reference/billing/clickpipes/postgres-cdc)

# ClickPipes pricing FAQ {#clickpipes-pricing-faq}

Below, you will find frequently asked questions about CDC ClickPipes and streaming
and object-based storage ClickPipes.

## FAQ for Postgres CDC ClickPipes {#faq-postgres-cdc-clickpipe}

<details>

<summary>Is the ingested data measured in pricing based on compressed or uncompressed size?</summary>

The ingested data is measured as _uncompressed data_ coming from Postgres—both
during the initial load and CDC (via the replication slot). Postgres does not
compress data during transit by default, and ClickPipe processes the raw,
uncompressed bytes.

</details>

<details>

<summary>When will Postgres CDC pricing start appearing on my bills?</summary>

Postgres CDC ClickPipes pricing begins appearing on monthly bills starting
**September 1st, 2025**, for all customers—both existing and new. Until then,
usage is free. Customers have a **3-month window** starting from **May 29**
(the GA announcement date) to review and optimize their usage if needed, although
we expect most won't need to make any changes.

</details>

<details>

<summary>Will I be charged if I pause my pipes?</summary>

No data ingestion charges apply while a pipe is paused, since no data is moved.
However, compute charges still apply—either 0.5 or 1 compute unit—based on your
organization's tier. This is a fixed service-level cost and applies across all
pipes within that service.

</details>

<details>

<summary>How can I estimate my pricing?</summary>

The Overview page in ClickPipes provides metrics for both initial load/resync and
CDC data volumes. You can estimate your Postgres CDC costs using these metrics
in conjunction with the ClickPipes pricing.

</details>

<details>

<summary>Can I scale the compute allocated for Postgres CDC in my service?</summary>

By default, compute scaling is not user-configurable. The provisioned resources
are optimized to handle most customer workloads optimally. If your use case
requires more or less compute, please open a support ticket so we can evaluate
your request.

</details>

<details>

<summary>What is the pricing granularity?</summary>

- **Compute**: Billed per hour. Partial hours are rounded up to the next hour.
- **Ingested Data**: Measured and billed per gigabyte (GB) of uncompressed data.

</details>

<details>

<summary>Can I use my ClickHouse Cloud credits for Postgres CDC via ClickPipes?</summary>

Yes. ClickPipes pricing is part of the unified ClickHouse Cloud pricing. Any
platform credits you have will automatically apply to ClickPipes usage as well.

</details>

<details>

<summary>How much additional cost should I expect from Postgres CDC ClickPipes in my existing monthly ClickHouse Cloud spend?</summary>

The cost varies based on your use case, data volume, and organization tier.
That said, most existing customers see an increase of **0–15%** relative to their
existing monthly ClickHouse Cloud spend post trial. Actual costs may vary
depending on your workload—some workloads involve high data volumes with
lesser processing, while others require more processing with less data.

</details>

## FAQ for streaming and object storage ClickPipes {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>