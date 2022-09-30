---
sidebar_label: Billing
slug: /en/manage/billing
---

# Billing

## Pricing

For pricing information see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing) page.  To understand what can affect your bill, and ways that you
can manage your spend, keep reading.

## FAQs

### What is a Read Unit?
Read Unit is a measure of the GET operations on the Object Store (for example, AWS S3).

### How is Storage on disk calculated?
ClickHouse Cloud uses cloud storage (AWS S3) and is metered on the compressed size (replication is included in the price).

### How do I estimate compression?

Compression can vary quite a bit by dataset. It is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields), and how the user sets up the schema (using optional codecs or not, for instance). It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well. See the [optimizing](/docs/en/optimize/) documentation for guidance, and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example. 
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query `SELECT formatReadableSize(total_bytes) FROM system.tables WHERE name = <your table name>`. 

### What tools does ClickHouse offer to estimate the cost for running a service in the cloud if I have a self-managed deployment?
The Query log captures key metrics in order to estimate the cost of running a workload in ClickHouse Cloud. Please contact ClickHouse Cloud support support@clickhouse.com with questions on migration.

### Do Backups count towards total storage?
ClickHouse Cloud offers two free backups at no additional cost. Backups do not count towards storage. 


### What billing options are available for ClickHouse Cloud (Beta)?
ClickHouse Cloud (Beta) supports the following billing options:
- Self-service monthly (in USD, via credit card)
- Direct-sales annual / multi-year (through pre-paid “ClickHouse Credits”, in USD)


### How long is the billing cycle?
Billing follows a ~30 day billing cycle and the start date is tracked as the date when the ClickHouse Cloud Organization was created.

### What controls does ClickHouse Cloud offer to manage costs?

- Trial and Annual Commit customers will be notified with automated emails when the consumption hits certain thresholds - 50%, 75, and 90% so that users can take action.

- ClickHouse Cloud (Beta) allows users to set a maximum auto-scaling limit on their compute via [Advanced scaling control](/docs/en/manage/scaling.mdx), a significant cost factor for analytical workloads.

- The [Advanced scaling control](/docs/en/manage/scaling.mdx) lets you set memory limits - min 24GB and max of 384GB, with an option to control the behavior of pausing/idling during inactivity. 

### If I have multiple services, do I get an invoice per service or a consolidated invoice?
A consolidated invoice is generated for all services in a given organization for a billing period.


### If I add my credit card and upgrade ahead of time before my trial period and credits expire will I be charged?
All costs incurred during the trial period will draw down from the trial credits first after which the credit card on file will be charged for overages.

## How can I keep track of my spending?
ClickHouse Cloud console includes a Usage display that gives detailed information about usage per service on Compute and Storage. This can be used to understand the cost breakdown by metered units.

## Reducing your costs

### What are the areas of optimization to manage costs effectively when running ClickHouse Cloud?
There are several [areas of optimization](/docs/en/manage/tuning-for-cloud-cost-efficiency.md), some of them include
- Batching inserts  in place of frequent small-size inserts will reduce your Write Unit cost
- Ensure your batch inserts fit into the compact part thresholds
- Fewer columns in tables 
- Choosing a [partition key](/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key.md) such that the inserts goes into the fewer number of partitions


## Sample scenarios and associated cost

### Dev/Test scenario ~ $567
- Active workload ~50% time
- 24 GB RAM
- 6 CPU
- 256 GB Data
- 7M PUT, 9M GET
- 600 GB write, 6 TB read 

### Steady workload scenario ~$3,511
- Active workload ~100% time
- 96 GB RAM
- 24 CPU
- 5 TB Data
- 43M PUT, 25M GET
- 6 TB write, 128 TB read

### Heavy usage scenario for ad-hoc analytics ~$2,596
- Active workload ~25% time
- 192 GB RAM
- 48 CPU
- 4 TB Data
- 70M PUT, 90M GET
- 6 TB write, 60 TB read 


