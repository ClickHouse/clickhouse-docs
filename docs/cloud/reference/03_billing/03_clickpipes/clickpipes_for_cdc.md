---
sidebar_label: 'PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: 'ClickPipes for PostgreSQL CDC'
description: 'Overview of billing for PostgreSQL CDC ClickPipes'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'cdc pricing', 'costs', 'pricing']
---

# ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

This section outlines the pricing model for the Postgres Change Data Capture (CDC)
connector in ClickPipes. In designing this model, the goal was to keep pricing
highly competitive while staying true to our core vision:

> Making it seamless and
affordable for customers to move data from Postgres to ClickHouse for
real-time analytics.

The connector is over **5x more cost-effective** than external
ETL tools and similar features in other database platforms.

:::note
Pricing started being metered in monthly bills on **September 1st, 2025**
for all customers (both existing and new) using Postgres CDC ClickPipes.
:::

## Pricing dimensions {#pricing-dimensions}

There are two main dimensions to pricing:

1. **Ingested Data**: The raw, uncompressed bytes coming from Postgres and
   ingested into ClickHouse.
2. **Compute**: The compute units provisioned per service manage multiple
   Postgres CDC ClickPipes and are separate from the compute units used by the
   ClickHouse Cloud service. This additional compute is dedicated specifically
   to Postgres CDC ClickPipes. Compute is billed at the service level, not per
   individual pipe. Each compute unit includes 2 vCPUs and 8 GB of RAM.

### Ingested data {#ingested-data}

The Postgres CDC connector operates in two main phases:

- **Initial load / resync**: This captures a full snapshot of Postgres tables
  and occurs when a pipe is first created or re-synced.
- **Continuous Replication (CDC)**: Ongoing replication of changes—such as inserts,
  updates, deletes, and schema changes—from Postgres to ClickHouse.

In most use cases, continuous replication accounts for over 90% of a ClickPipe
life cycle. Because initial loads involve transferring a large volume of data all
at once, we offer a lower rate for that phase.

| Phase                            | Cost         |
|----------------------------------|--------------|
| **Initial load / resync**        | $0.10 per GB |
| **Continuous Replication (CDC)** | $0.20 per GB |

### Compute {#compute}

This dimension covers the compute units provisioned per service just for Postgres
ClickPipes. Compute is shared across all Postgres pipes within a service. **It
is provisioned when the first Postgres pipe is created and deallocated when no
Postgres CDC pipes remain**. The amount of compute provisioned depends on your
organization's tier:

| Tier                         | Cost                                          |
|------------------------------|-----------------------------------------------|
| **Basic Tier**               | 0.5 compute unit per service — $0.10 per hour |
| **Scale or Enterprise Tier** | 1 compute unit per service — $0.20 per hour   |

### Example {#example}

Let's say your service is in Scale tier and has the following setup:

- 2 Postgres ClickPipes running continuous replication
- Each pipe ingests 500 GB of data changes (CDC) per month
- When the first pipe is kicked off, the service provisions **1 compute unit under the Scale Tier** for Postgres CDC

#### Monthly cost breakdown {#cost-breakdown}

**Ingested Data (CDC)**:

$$ 2 \text{ pipes} \times 500 \text{ GB} = 1,000 \text{ GB per month} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**Compute**:

$$1 \text{ compute unit} \times \$0.20/\text{hr} \times 730 \text{ hours (approximate month)} = \$146$$

:::note
Compute is shared across both pipes
:::

**Total Monthly Cost**:

$$\$200 \text{ (ingest)} + \$146 \text{ (compute)} = \$346$$

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

Postgres CDC ClickPipes pricing began appearing on monthly bills starting
**September 1st, 2025**, for all customers (both existing and new).

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