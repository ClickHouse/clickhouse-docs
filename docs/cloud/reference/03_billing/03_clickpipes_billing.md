---
sidebar_label: 'ClickPipes'
slug: /cloud/reference/billing/clickpipes
title: 'ClickPipes billing'
description: 'Overview of ClickPipes billing'
---

import ClickPipesFAQ from '../../_snippets/_clickpipes_faq.md'

## ClickPipes for streaming and object storage {#clickpipes-for-streaming-object-storage}

This section outlines the pricing model of ClickPipes for streaming and object storage.

### What does the ClickPipes pricing structure look like? {#what-does-the-clickpipes-pricing-structure-look-like}

It consists of two dimensions:

- **Compute**: Price **per unit per hour**.
  Compute represents the cost of running the ClickPipes replica pods whether they actively ingest data or not.
  It applies to all ClickPipes types.
- **Ingested data**: Price **per GB**.
  The ingested data rate applies to all streaming ClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  for the data transferred via the replica pods. The ingested data size (GB) is charged based on bytes received from the source (uncompressed or compressed).

### What are ClickPipes replicas? {#what-are-clickpipes-replicas}

ClickPipes ingests data from remote data sources via a dedicated infrastructure
that runs and scales independently of the ClickHouse Cloud service.
For this reason, it uses dedicated compute replicas.

### What is the default number of replicas and their size? {#what-is-the-default-number-of-replicas-and-their-size}

Each ClickPipe defaults to 1 replica that is provided with 512 MiB of RAM and 0.125 vCPU (XS).
This corresponds to **0.0625** ClickHouse compute units (1 unit = 8 GiB RAM, 2 vCPUs).

### What are the ClickPipes public prices? {#what-are-the-clickpipes-public-prices}

- Compute: \$0.20 per unit per hour (\$0.0125 per replica per hour for the default replica size)
- Ingested data: \$0.04 per GB

The price for the Compute dimension depends on the **number** and **size** of replica(s) in a ClickPipe. The default replica size can be adjusted using vertical scaling, and each replica size is priced as follows:

| Replica Size               | Compute Units | RAM     | vCPU   | Price per Hour |
|----------------------------|---------------|---------|--------|----------------|
| Extra Small (XS) (default) | 0.0625        | 512 MiB | 0.125. | $0.0125        |
| Small (S)                  | 0.125         | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25          | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5           | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0           | 8 GiB   | 2.0    | $0.20          |

### How does it look in an illustrative example? {#how-does-it-look-in-an-illustrative-example}

The following examples assume a single M-sized replica, unless explicitly mentioned.

<table><thead>
  <tr>
    <th></th>
    <th>100 GB over 24h</th>
    <th>1 TB over 24h</th>
    <th>10 TB over 24h</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Streaming ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>With 4 replicas: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>Object Storage ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _Only ClickPipes compute for orchestration,
effective data transfer is assumed by the underlying Clickhouse Service_

## ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

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

### Pricing dimensions {#pricing-dimensions}

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

## FAQ for streaming and object storage ClickPipes {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>