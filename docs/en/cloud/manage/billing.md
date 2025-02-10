---
sidebar_label: Overview
slug: /en/cloud/manage/billing/overview
title: Pricing
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/en/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/en/integrations/clickpipes). 
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) Example

:::note
- Prices reflect AWS us-east-1 pricing.
- Explore applicable data transfer and ClickPipes charges [here](jan2025_faq/dimensions.md).
:::

### Basic: from $66.52 per month

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

### Scale (Always-on, Auto-scaling): From $499.38 per month

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
    <td>1TB of data + 1 backup<br></br>\$50.60</td>
    <td>2TB of data + 1 backup<br></br>\$101.20</td>
    <td>3TB of data + 1 backup<br></br>\$151.80</td>
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

### Enterprise: Starting prices vary

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
    <td>2 replicas x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60 </td>
    <td>2 replicas x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99 </td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>5TB + 1 backup<br></br>\$253.00</td>
    <td>10TB + 1 backup<br></br>\$506.00</td>
    <td>20TB + 1 backup<br></br>\$1,012.00</td>
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

## FAQs

### How is compute metered?

ClickHouse Cloud meters compute on a per-minute basis, in 8G RAM increments. 
Compute costs will vary by tier, region, and cloud service provider.

### How is storage on disk calculated?

ClickHouse Cloud uses cloud object storage and is metered on the compressed size of data stored in ClickHouse tables. 
Storage costs are the same across tiers and vary by region and cloud service provider. 

### Do backups count toward total storage?

Storage and backups are counted towards storage costs and billed separately. 
All services will default to one backup, retained for a day. 
Users who need additional backups can do so 
by configuring additional backups under the settings tab of the Cloud Console.

### How do I estimate compression?

Compression can vary quite a bit by dataset. 
It is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields), 
and how the user sets up the schema (using optional codecs or not, for instance). 
It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well. 
See the [optimizing](../../guides/best-practices/index.md) documentation for guidance and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example. 
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query:

```sql
SELECT formatReadableSize(total_bytes) FROM system.tables WHERE name = <your table name>
```

### What tools does ClickHouse offer to estimate the cost of running a service in the cloud if I have a self-managed deployment?

The ClickHouse query log table captures [key metrics](../../operations/system-tables/query_log.md) 
that can be used to estimate the cost of running a workload in ClickHouse Cloud. 
For details on migrating 
from self-managed to ClickHouse Cloud please refer to the [migration documentation](../../integrations/migration/clickhouse-to-cloud.md),
and contact [ClickHouse Cloud support](https://clickhouse.cloud/support) if you have further questions.

### What billing options are available for ClickHouse Cloud?​

ClickHouse Cloud supports the following billing options:
- Self-service monthly (in USD, via credit card).
- Annual commitment / multi-year (through pre-paid "ClickHouse Credits", in USD, with additional payment options).
- Through the AWS, GCP, and Azure marketplaces (either pay-as-you-go (PAYG) or commit to a contract with ClickHouse Cloud through the marketplace).

### How long is the billing cycle?

Billing follows a monthly billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### What tier supports custom compute configurations?

The enterprise tier includes support for custom compute configurations, including high-memory, high-CPU options, and private regions. Please [contact support](https://clickhouse.cloud/support) to learn more about how to set up custom configurations on the enterprise tier.

### What controls does ClickHouse Cloud offer to manage costs for Scale and Enterprise services?

- Trial and Annual Commit customers will be notified with automated emails when the consumption hits certain thresholds-50%, 75%, and 90%, so that users can take action.
- ClickHouse Cloud allows users to set a maximum auto-scaling limit on their compute via [Advanced scaling control](scaling.md), a significant cost factor for analytical workloads.
- The [Advanced scaling control](scaling.md) lets you set memory limits with an option to control the behavior of pausing/idling during inactivity.

### What controls does ClickHouse Cloud offer to manage costs for Basic services?

- The [Advanced scaling control](scaling.md) lets you control the behavior of pausing/idling during inactivity. Adjusting memory allocation is not supported for Basic services.
- Note that the default setting pauses the service after a period of inactivity.
- 
### If I have multiple services, do I get an invoice per service or a consolidated invoice?

A consolidated invoice is generated for all services in a given organization for a billing period.

### If I add my credit card and upgrade before my trial period and credits expire, will I be charged?

When a user converts from trial to paid before the 30-day trial period ends, 
but with credits remaining from the trial credit allowance, 
we continue to draw down from the trial credits during the initial 30-day trial period, 
and then charge the credit card.

### How can I keep track of my spending?

ClickHouse Cloud console includes a Usage display 
that gives detailed information about usage per service on compute and storage. 
This can be used to understand the cost breakdown by metered units.

### How do I access my invoice for my marketplace subscription to the ClickHouse Cloud service?

All marketplace subscriptions will be billed and invoiced by the marketplace. 
You can view your invoice through the respective cloud provider marketplace directly.

### Why do the dates on the Usage statements not match my Marketplace Invoice?

AWS Marketplace billing follows the calendar month cycle e.g., for usage between dates 01-Dec-2024 and 01-Jan-2025, 
an invoice will be generated between 3-Jan and 5-Jan-2025.

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered 
and reported over 30 days starting from the day of sign up.

The usage and invoice dates will differ if these dates are not the same. 
Since usage statements track usage by day for a given service, 
users can rely on statements to see the breakdown of costs.

### Are there any restrictions around the usage of prepaid credits?

ClickHouse Cloud prepaid credits (whether direct through ClickHouse, or via a cloud provider's marketplace) 
can only be leveraged for the terms of the contract. 
This means they can be applied on the acceptance date, or a future date, and not for any prior periods. 
Any overages not covered by prepaid credits must be covered by a credit card payment, or marketplace monthly billing.

### Is there a difference in ClickHouse Cloud pricing, whether paying through the cloud provider marketplace or directly to ClickHouse?

There is no difference in pricing between marketplace billing and signing up directly with ClickHouse.
In either case, your usage of ClickHouse Cloud is tracked in terms of ClickHouse Cloud Credits (CHCs),
which are metered in the same way and billed accordingly.

### How is compute-compute separation billed?

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

The table below shows cost estimation across various parameters for child services
which are active 1, 2 or 4 hours per day:

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th>1 hour per day</th>
    <th>2 hours per day</th>
    <th>4 hours per day</th>
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

## ClickPipes Pricing

### What does the ClickPipes pricing structure look like?

It consists of two dimensions

- **Compute**: Price per unit per hour
    Compute represents the cost of running the ClickPipes replica pods whether they actively ingest data or not. 
    It applies to all ClickPipes types.
- **Ingested data**: per GB pricing
    The ingested data rate applies to all streaming ClickPipes 
    (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs) 
    for the data transferred via the replica pods. The ingested data size (GB) is charged based on bytes received from the source (uncompressed or compressed).

### What are ClickPipes replicas?

ClickPipes ingests data from remote data sources via a dedicated infrastructure 
that runs and scales independently of the ClickHouse Cloud service. 
For this reason, it uses dedicated compute replicas.

### What is the default number of replicas and their size?

Each ClickPipe defaults to 1 replica that is provided with 2 GiB of RAM and 0.5 vCPU. 
This corresponds to **0.25** ClickHouse compute units (1 unit = 8 GiB RAM, 2 vCPUs).

### What are the ClickPipes public prices?

- Compute: \$0.20 per unit per hour (\$0.05 per replica per hour)
- Ingested data: \$0.04 per GB

### How does it look in an illustrative example?

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
    <td>$$(0.25 \times 0.20 \times 24) + (0.04 \times 100) = \$5.20$$</td>
    <td>$$(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.20$$</td>
    <td>With 4 replicas: <br></br> $$(0.25 \times 0.20 \times 24 \times 4) + (0.04 \times 10000) = \$404.80$$</td>
  </tr>
  <tr>
    <td>Object Storage ClickPipe $^*$</td>
    <td>$$(0.25 \times 0.20 \times 24) = \$1.20$$</td>
    <td>$$(0.25 \times 0.20 \times 24) = \$1.20$$</td>
    <td>$$(0.25 \times 0.20 \times 24) = \$1.20$$</td>
  </tr>
</tbody>
</table>

$^1$ _Only ClickPipes compute for orchestration, 
effective data transfer is assumed by the underlying Clickhouse Service_
