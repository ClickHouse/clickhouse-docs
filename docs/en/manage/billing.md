---
sidebar_label: Billing
slug: /en/manage/billing
title: Billing
---

## Pricing

For pricing information see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing) page.  To understand what can affect your bill, and ways that you
can manage your spend, keep reading.


## Sample scenarios and associated cost

### Dev/Test scenario ~ $567 per month
- Active workload ~50% time
- 24 GB RAM
- 6 CPU
- 256 GB Data
- 7,000 write units, 9,000 read units
- 600 GB write, 6 TB read 

#### Pricing breakdown for this example:

  | Component |USD Estimate|
  |-----------|------------:|
  | Compute units | $455|
  | Storage        | $15|
  | Read units (~9000 units) | $9|
  | Write units (~7000 units) | $88|

### Steady workload scenario ~$3,511 per month
- Active workload ~100% time
- 96 GB RAM
- 24 CPU
- 5 TB Data
- 43,000 write units, 25,000 read units
- 6 TB write, 128 TB read

#### Pricing breakdown for this example:

  | Component |USD Estimate|
  |-----------|------------:|
  | Compute units | $2660|
  | Storage        | $288|
  | Read units (~25000 units) | $25|
  | Write units (~43000 units) | $538|

### Heavy usage scenario for ad-hoc analytics ~$2,596 per month
- Active workload ~25% time
- 192 GB RAM
- 48 CPU
- 4 TB Data
- 70,000 write units, 90,000 read units
- 6 TB write, 60 TB read 

#### Pricing breakdown for this example:

  | Component |USD Estimate|
  |-----------|------------:|
  | Compute units | $1401|
  | Storage        | $230|
  | Read units (~70000 units) | $90|
  | Write units (~90000 units) | $875|

For help with further estimation, please contact [support](https://clickhouse.cloud/support) if you are already a ClickHouse cloud user, or [sales@clickhouse.com](mailto:sales@clickhouse.com) otherwise.

## FAQs

### What is a "write unit" and how do I estimate it?
 
A single INSERT with less than 16MB of data generates ~0.01 "write unit", so a single "write unit" typically corresponds to ~100 INSERTs.

### What are the best practices to reduce costs, including "write units"?​
There are several [areas of optimization](/docs/en/manage/tuning-for-cloud-cost-efficiency.md), some of them include
- Batching inserts  in place of frequent small-size inserts
- Having fewer columns in tables 
- Choosing a [partition key](/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key.md) so that inserts go into fewer number of partitions
- Avoiding write-heavy operations in ClickHouse, such as mutations, OPTIMIZE FINAL, Nullable columns
### How is storage on disk calculated?
ClickHouse Cloud uses cloud object storage and is metered on the compressed size of data stored in ClickHouse tables.

### How do I estimate compression?

Compression can vary quite a bit by dataset. It is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields), and how the user sets up the schema (using optional codecs or not, for instance). It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well. See the [optimizing](/docs/en/optimize/) documentation for guidance, and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example. 
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query `SELECT formatReadableSize(total_bytes) FROM system.tables WHERE name = <your table name>`. 

### What tools does ClickHouse offer to estimate the cost for running a service in the cloud if I have a self-managed deployment?
The ClickHouse query log captures [key metrics](/docs/en/operations/system-tables/query_log.md) that can be used to estimate the cost of running a workload in ClickHouse Cloud.  For details on migrating from self managed to ClickHouse Cloud please refer to the [migration documentation](/docs/en/integrations/migration/clickhouse-to-cloud.md), and contact ClickHouse Cloud support https://clickhouse.cloud/support if you have further questions.

### Do Backups count towards total storage?
ClickHouse Cloud offers two free backups at no additional cost. Backups do not count towards storage. 

### What billing options are available for ClickHouse Cloud?
ClickHouse Cloud supports the following billing options:
- Self-service monthly (in USD, via credit card)
- Direct-sales annual / multi-year (through pre-paid "ClickHouse Credits", in USD, with additional payment options)

### How long is the billing cycle?
Billing follows a ~30 day billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### What controls does ClickHouse Cloud offer to manage costs?

- Trial and Annual Commit customers will be notified with automated emails when the consumption hits certain thresholds - 50%, 75%, and 90% so that users can take action.
- ClickHouse Cloud allows users to set a maximum auto-scaling limit on their compute via [Advanced scaling control](/docs/en/manage/scaling.mdx), a significant cost factor for analytical workloads.

- The [Advanced scaling control](/docs/en/manage/scaling.mdx) lets you set memory limits with an option to control the behavior of pausing/idling during inactivity. 

### If I have multiple services, do I get an invoice per service or a consolidated invoice?
A consolidated invoice is generated for all services in a given organization for a billing period.


### If I add my credit card and upgrade before my trial period and credits expire, will I be charged?
When a user converts from trial to paid before the 14-day trial period ends, but with credits remaining from the trial credit allowance, we continue to draw down from the trial credits during the initial 14-day trial period, and then charge the credit card.

## How can I keep track of my spending?
ClickHouse Cloud console includes a Usage display that gives detailed information about usage per service on compute and storage. This can be used to understand the cost breakdown by metered units.

![Cost breakdown example](@site/docs/en/manage/images/billing-cost-breakdown.png)



