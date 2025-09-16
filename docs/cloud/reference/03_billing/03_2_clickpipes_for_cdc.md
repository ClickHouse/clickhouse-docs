---
sidebar_label: 'ClickPipes - PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: 'ClickPipes for PostgreSQL CDC'
description: 'Overview of billing for PostgreSQL CDC ClickPipes'
---

# ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

This section outlines the pricing model for our Postgres Change Data Capture (CDC)
connector in ClickPipes. In designing this model, our goal was to keep pricing
highly competitive while staying true to our core vision:

> Making it seamless and
affordable for customers to move data from Postgres to ClickHouse for
real-time analytics.

The connector is over **5x more cost-effective** than external
ETL tools and similar features in other database platforms.

:::note
Pricing will start being metered in monthly bills beginning **September 1st, 2025,**
for all customers (both existing and new) using Postgres CDC ClickPipes. Until
then, usage is free. Customers have a 3-month window starting May 29 (GA announcement)
to review and optimize their costs if needed, although we expect most will not need
to make any changes.
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

## Ingested data {#ingested-data}

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

## Compute {#compute}

This dimension covers the compute units provisioned per service just for Postgres
ClickPipes. Compute is shared across all Postgres pipes within a service. **It
is provisioned when the first Postgres pipe is created and deallocated when no
Postgres CDC pipes remain**. The amount of compute provisioned depends on your
organization's tier:

| Tier                         | Cost                                          |
|------------------------------|-----------------------------------------------|
| **Basic Tier**               | 0.5 compute unit per service — $0.10 per hour |
| **Scale or Enterprise Tier** | 1 compute unit per service — $0.20 per hour   |

## Example {#example}

Let's say your service is in Scale tier and has the following setup:

- 2 Postgres ClickPipes running continuous replication
- Each pipe ingests 500 GB of data changes (CDC) per month
- When the first pipe is kicked off, the service provisions **1 compute unit under the Scale Tier** for Postgres CDC

### Monthly cost breakdown {#cost-breakdown}

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