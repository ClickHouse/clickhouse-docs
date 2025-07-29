---
sidebar_label: 'Overview'
slug: /cloud/manage/billing/overview
title: 'Pricing'
description: 'Overview page for ClickHouse Cloud pricing'
---

import ClickPipesFAQ from '../09_jan2025_faq/_snippets/_clickpipes_faq.md'

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes). 
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) example {#amazon-web-services-aws-example}

:::note
- Prices reflect AWS us-east-1 pricing.
- Explore applicable data transfer and ClickPipes charges [here](jan2025_faq/dimensions.md).
:::

### Basic: from $66.52 per month {#basic-from-6652-per-month}

Best for: Departmental use cases with smaller data volumes that do not have hard reliability guarantees.

**Basic tier service**
- 1 replica x 8 GiB RAM, 2 vCPU
- 500 GB of compressed data
- 500 GB of backup of data
- 10 GB of public internet egress data transfer
- 5 GB of cross-region data transfer

Pricing breakdown for this example:

<table><thead>
  <tr>
    <th></th>
    <th>Active 6 hours a day</th>
    <th>Active 12 hours a day</th>
    <th>Active 24 hours a day</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$39.91</td>
    <td>\$79.83</td>
    <td>\$159.66</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
  </tr>
  <tr>
    <td>Public internet egress data transfer</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
  </tr>
  <tr>
    <td>Cross-region data transfer</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>\$66.52</td>
    <td>\$106.44</td>
    <td>\$186.27</td>
  </tr>
</tbody>
</table>

### Scale (always-on, auto-scaling): from $499.38 per month {#scale-always-on-auto-scaling-from-49938-per-month}

Best for: workloads requiring enhanced SLAs (2+ replica services), scalability, and advanced security.

**Scale tier service**
- Active workload ~100% time
- Auto-scaling maximum configurable to prevent runaway bills
- 100 GB of public internet egress data transfer
- 10 GB of cross-region data transfer

Pricing breakdown for this example:

<table><thead>
  <tr>
    <th></th>
    <th>Example 1</th>
    <th>Example 2</th>
    <th>Example 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>2 replicas x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2 replicas x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3 replicas x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>1 TB of data + 1 backup<br></br>\$50.60</td>
    <td>2 TB of data + 1 backup<br></br>\$101.20</td>
    <td>3 TB of data + 1 backup<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>Public internet egress data transfer</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>Cross-region data transfer</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>\$499.38</td>
    <td>\$986.92</td>
    <td>\$1,474.47</td>
  </tr>
</tbody>
</table>

### Enterprise: Starting prices vary {#enterprise-starting-prices-vary}

Best for: large scale, mission critical deployments that have stringent security and compliance needs

**Enterprise tier service**
- Active workload ~100% time
- 1 TB of public internet egress data transfer
- 500 GB of cross-region data transfer

<table><thead>
  <tr>
    <th></th>
    <th>Example 1</th>
    <th>Example 2</th>
    <th>Example 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>2 replicas x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2 replicas x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>5 TB + 1 backup<br></br>\$253.00</td>
    <td>10 TB + 1 backup<br></br>\$506.00</td>
    <td>20 TB + 1 backup<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>Public internet egress data transfer</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
  </tr>
  <tr>
    <td>Cross-region data transfer</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>\$2,669.40</td>
    <td>\$5,207.99</td>
    <td>\$9,713.79</td>
  </tr>
</tbody>
</table>

## Frequently asked questions {#faqs}

### How is compute metered? {#how-is-compute-metered}

ClickHouse Cloud meters compute on a per-minute basis, in 8G RAM increments. 
Compute costs will vary by tier, region, and cloud service provider.

### How is storage on disk calculated? {#how-is-storage-on-disk-calculated}

ClickHouse Cloud uses cloud object storage and usage is metered on the compressed size of data stored in ClickHouse tables. 
Storage costs are the same across tiers and vary by region and cloud service provider. 

### Do backups count toward total storage? {#do-backups-count-toward-total-storage}

Storage and backups are counted towards storage costs and billed separately. 
All services will default to one backup, retained for a day. 
Users who need additional backups can do so by configuring additional [backups](backups/overview.md) under the settings tab of the Cloud console.

### How do I estimate compression? {#how-do-i-estimate-compression}

Compression can vary from dataset to dataset. 
How much it varies is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields), 
and how the user sets up the schema (using optional codecs or not, for instance). 
It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well. 
See the [optimizing documentation](/optimize/asynchronous-inserts) for guidance and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example. 
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query:

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### What tools does ClickHouse offer to estimate the cost of running a service in the cloud if I have a self-managed deployment? {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

The ClickHouse query log captures [key metrics](/operations/system-tables/query_log) that can be used to estimate the cost of running a workload in ClickHouse Cloud. 
For details on migrating from self-managed to ClickHouse Cloud please refer to the [migration documentation](/cloud/migration/clickhouse-to-cloud), and contact [ClickHouse Cloud support](https://console.clickhouse.cloud/support) if you have further questions.

### What billing options are available for ClickHouse Cloud? {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud supports the following billing options:

- Self-service monthly (in USD, via credit card).
- Direct-sales annual / multi-year (through pre-paid "ClickHouse Credits", in USD, with additional payment options).
- Through the AWS, GCP, and Azure marketplaces (either pay-as-you-go (PAYG) or commit to a contract with ClickHouse Cloud through the marketplace).

### How long is the billing cycle? {#how-long-is-the-billing-cycle}

Billing follows a monthly billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### What controls does ClickHouse Cloud offer to manage costs for Scale and Enterprise services? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- Trial and Annual Commit customers are notified automatically by email when their consumption hits certain thresholds: `50%`, `75%`, and `90%`. This allows users to proactively manage their usage.
- ClickHouse Cloud allows users to set a maximum auto-scaling limit on their compute via [Advanced scaling control](/manage/scaling), a significant cost factor for analytical workloads.
- The [Advanced scaling control](/manage/scaling) lets you set memory limits with an option to control the behavior of pausing/idling during inactivity.

### What controls does ClickHouse Cloud offer to manage costs for Basic services? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- The [Advanced scaling control](/manage/scaling) lets you control the behavior of pausing/idling during inactivity. Adjusting memory allocation is not supported for Basic services.
- Note that the default setting pauses the service after a period of inactivity.

### If I have multiple services, do I get an invoice per service or a consolidated invoice? {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

A consolidated invoice is generated for all services in a given organization for a billing period.

### If I add my credit card and upgrade before my trial period and credits expire, will I be charged? {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

When a user converts from trial to paid before the 30-day trial period ends, but with credits remaining from the trial credit allowance,
we continue to draw down from the trial credits during the initial 30-day trial period, and then charge the credit card.

### How can I keep track of my spending? {#how-can-i-keep-track-of-my-spending}

The ClickHouse Cloud console provides a Usage display that details usage per service. This breakdown, organized by usage dimensions, helps you understand the cost associated with each metered unit.

### How do I access my invoice for my marketplace subscription to the ClickHouse Cloud service? {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

All marketplace subscriptions are billed and invoiced by the marketplace. You can view your invoice through the respective cloud provider marketplace directly.

### Why do the dates on the Usage statements not match my Marketplace Invoice? {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace billing follows the calendar month cycle.
For example, for usage between dates 01-Dec-2024 and 01-Jan-2025, 
an invoice is generated between 3-Jan and 5-Jan-2025

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered 
and reported over 30 days starting from the day of sign up.

The usage and invoice dates will differ if these dates are not the same. Since usage statements track usage by day for a given service, users can rely on statements to see the breakdown of costs.

### Are there any restrictions around the usage of prepaid credits? {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud prepaid credits (whether direct through ClickHouse, or via a cloud provider's marketplace) 
can only be leveraged for the terms of the contract. 
This means they can be applied on the acceptance date, or a future date, and not for any prior periods. 
Any overages not covered by prepaid credits must be covered by a credit card payment or marketplace monthly billing.

### Is there a difference in ClickHouse Cloud pricing, whether paying through the cloud provider marketplace or directly to ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

There is no difference in pricing between marketplace billing and signing up directly with ClickHouse. 
In either case, your usage of ClickHouse Cloud is tracked in terms of ClickHouse Cloud Credits (CHCs), 
which are metered in the same way and billed accordingly.

### How is compute-compute separation billed? {#how-is-compute-compute-separation-billed}

When creating a service in addition to an existing service, 
you can choose if this new service should share the same data with the existing one. 
If yes, these two services now form a [warehouse](../reference/warehouses.md). 
A warehouse has the data stored in it with multiple compute services accessing this data.

As the data is stored only once, you only pay for one copy of data, though multiple services are accessing it. 
You pay for compute as usual — there are no additional fees for compute-compute separation / warehouses.
By leveraging shared storage in this deployment, users benefit from cost savings on both storage and backups.

Compute-compute separation can save you a significant amount of ClickHouse Credits in some cases. 
A good example is the following setup:

1. You have ETL jobs that are running 24/7 and ingesting data into the service. These ETL jobs do not require a lot of memory so they can run on a small instance with, for example, 32 GiB of RAM.

2. A data scientist on the same team that has ad hoc reporting requirements, says they need to run a query that requires a significant amount of memory - 236 GiB, however does not need high availability and can wait and rerun queries if the first run fails.

In this example you, as an administrator for the database, can do the following:

1. Create a small service with two replicas 16 GiB each - this will satisfy the ETL jobs and provide high availability.

2. For the data scientist, you can create a second service in the same warehouse with only one replica with 236 GiB. You can enable idling for this service so you will not be paying for this service when the data scientist is not using it.

Cost estimation (per month) for this example on the **Scale Tier**:
- Parent service active 24 hours day: 2 replicas x 16 GiB 4 vCPU per replica
- Child service: 1 replica x 236 GiB 59 vCPU per replica per replica
- 3 TB of compressed data + 1 backup
- 100 GB of public internet egress data transfer
- 50 GB of cross-region data transfer

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>Child service</span><br/><span>active 1 hour/day</span></th>
    <th><span>Child service</span><br/><span>active 2 hours/day</span></th>
    <th><span>Child service</span><br/><span>active 4 hours/day</span></th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$1,142.43</td>
    <td>\$1,410.97</td>
    <td>\$1,948.05</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
  </tr>
  <tr>
    <td>Public internet egress data transfer</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>Cross-region data transfer</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>\$1,307.31</td>
    <td>\$1,575.85</td>
    <td>\$2,112.93</td>
  </tr>
</tbody>
</table>

Without warehouses, you would have to pay for the amount of memory that the data engineer needs for his queries. 
However, combining two services in a warehouse and idling one of them helps you save money.

## ClickPipes pricing {#clickpipes-pricing}

### ClickPipes for Postgres CDC {#clickpipes-for-postgres-cdc}

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

#### Pricing dimensions {#pricing-dimensions}

There are two main dimensions to pricing:

1. **Ingested Data**: The raw, uncompressed bytes coming from Postgres and
   ingested into ClickHouse.
2. **Compute**: The compute units provisioned per service manage multiple
   Postgres CDC ClickPipes and are separate from the compute units used by the
   ClickHouse Cloud service. This additional compute is dedicated specifically
   to Postgres CDC ClickPipes. Compute is billed at the service level, not per
   individual pipe. Each compute unit includes 2 vCPUs and 8 GB of RAM.

#### Ingested data {#ingested-data}

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

#### Compute {#compute}

This dimension covers the compute units provisioned per service just for Postgres
ClickPipes. Compute is shared across all Postgres pipes within a service. **It
is provisioned when the first Postgres pipe is created and deallocated when no
Postgres CDC pipes remain**. The amount of compute provisioned depends on your
organization's tier:

| Tier                         | Cost                                          |
|------------------------------|-----------------------------------------------|
| **Basic Tier**               | 0.5 compute unit per service — $0.10 per hour |
| **Scale or Enterprise Tier** | 1 compute unit per service — $0.20 per hour   |

#### Example {#example}

Let's say your service is in Scale tier and has the following setup:

- 2 Postgres ClickPipes running continuous replication
- Each pipe ingests 500 GB of data changes (CDC) per month
- When the first pipe is kicked off, the service provisions **1 compute unit under the Scale Tier** for Postgres CDC

##### Monthly cost breakdown {#cost-breakdown}

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
 
### ClickPipes for streaming and object storage {#clickpipes-for-streaming-object-storage}

This section outlines the pricing model of ClickPipes for streaming and object storage.

#### What does the ClickPipes pricing structure look like? {#what-does-the-clickpipes-pricing-structure-look-like}

It consists of two dimensions

- **Compute**: Price per unit per hour
  Compute represents the cost of running the ClickPipes replica pods whether they actively ingest data or not.
  It applies to all ClickPipes types.
- **Ingested data**: per GB pricing
  The ingested data rate applies to all streaming ClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  for the data transferred via the replica pods. The ingested data size (GB) is charged based on bytes received from the source (uncompressed or compressed).

#### What are ClickPipes replicas? {#what-are-clickpipes-replicas}

ClickPipes ingests data from remote data sources via a dedicated infrastructure
that runs and scales independently of the ClickHouse Cloud service.
For this reason, it uses dedicated compute replicas.

#### What is the default number of replicas and their size? {#what-is-the-default-number-of-replicas-and-their-size}

Each ClickPipe defaults to 1 replica that is provided with 2 GiB of RAM and 0.5 vCPU.
This corresponds to **0.25** ClickHouse compute units (1 unit = 8 GiB RAM, 2 vCPUs).

#### What are the ClickPipes public prices? {#what-are-the-clickpipes-public-prices}

- Compute: \$0.20 per unit per hour (\$0.05 per replica per hour)
- Ingested data: \$0.04 per GB

#### How does it look in an illustrative example? {#how-does-it-look-in-an-illustrative-example}

The following examples assume a single replica unless explicitly mentioned.

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

## ClickPipes pricing FAQ {#clickpipes-pricing-faq}

Below, you will find frequently asked questions about CDC ClickPipes and streaming
and object-based storage ClickPipes. 

### FAQ for Postgres CDC ClickPipes {#faq-postgres-cdc-clickpipe}

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

### FAQ for streaming and object storage ClickPipes {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>
