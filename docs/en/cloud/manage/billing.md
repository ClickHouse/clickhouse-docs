---
sidebar_label: Overview
slug: /en/cloud/manage/billing/overview
title: Pricing
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/en/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and ClickPipes. 
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## FAQs

### How is compute metered?

ClickHouse Cloud meters compute on a per-minute basis, in 8G RAM increments. 
Compute costs will vary by tier, region, and cloud service provider.

### How is storage on disk calculated?

ClickHouse Cloud uses cloud object storage and usage is metered on the compressed size of data stored in ClickHouse tables. 
Storage costs are the same across tiers and vary by region and cloud service provider. 

### Do backups count toward total storage?

Storage and backups are counted towards storage costs and billed separately. 
All services will default to one backup, retained for a day. 
Users who need additional backups can do so by configuring additional [backups](./backups.md) under the settings tab of the Cloud Console.

### How do I estimate compression?

Compression can vary quite a bit by dataset. 
It is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields), 
and how the user sets up the schema (using optional codecs or not, for instance). 
It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well. 
See the [optimizing documentation](/docs/en/optimize/asynchronous-inserts) for guidance and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example. 
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query:

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### What tools does ClickHouse offer to estimate the cost of running a service in the cloud if I have a self-managed deployment?

The ClickHouse query log captures [key metrics](/docs/en/operations/system-tables/query_log) that can be used to estimate the cost of running a workload in ClickHouse Cloud. 
For details on migrating from self-managed to ClickHouse Cloud please refer to the [migration documentation](/docs/en/cloud/migration/clickhouse-to-cloud), and contact [ClickHouse Cloud support](https://clickhouse.cloud/support) if you have further questions.

### What billing options are available for ClickHouse Cloud?

ClickHouse Cloud supports the following billing options:

- Self-service monthly (in USD, via credit card).
- Direct-sales annual / multi-year (through pre-paid "ClickHouse Credits", in USD, with additional payment options).
- Through the AWS, GCP, and Azure marketplaces (either pay-as-you-go (PAYG) or commit to a contract with ClickHouse Cloud through the marketplace).

### How long is the billing cycle?

Billing follows a monthly billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### What controls does ClickHouse Cloud offer to manage costs for Scale and Enterprise services?

- Trial and Annual Commit customers will be notified with automated emails when the consumption hits certain thresholds-50%, 75%, and 90%, so that users can take action.
- ClickHouse Cloud allows users to set a maximum auto-scaling limit on their compute via [Advanced scaling control](/docs/en/manage/scaling), a significant cost factor for analytical workloads.
- The [Advanced scaling control](/docs/en/manage/scaling) lets you set memory limits with an option to control the behavior of pausing/idling during inactivity.

### What controls does ClickHouse Cloud offer to manage costs for Basic services?

- The [Advanced scaling control](/docs/en/manage/scaling) lets you control the behavior of pausing/idling during inactivity. Adjusting memory allocation is not supported for Basic services.
- Note that the default setting pauses the service after a period of inactivity.

### If I have multiple services, do I get an invoice per service or a consolidated invoice?

A consolidated invoice is generated for all services in a given organization for a billing period.

### If I add my credit card and upgrade before my trial period and credits expire, will I be charged?

When a user converts from trial to paid before the 30-day trial period ends, but with credits remaining from the trial credit allowance,
we continue to draw down from the trial credits during the initial 30-day trial period, and then charge the credit card.

### How can I keep track of my spending?

The ClickHouse Cloud console provides a Usage display that details usage per service. This breakdown, organized by usage dimensions, helps you understand the cost associated with each metered unit.

### How do I access my invoice for my marketplace subscription to the ClickHouse Cloud service?

All marketplace subscriptions will be billed and invoiced by the marketplace. You can view your invoice through the respective cloud provider marketplace directly.

### Why do the dates on the Usage statements not match my Marketplace Invoice?

AWS Marketplace billing follows the calendar month cycle.
For example, for usage between dates 01-Dec-2024 and 01-Jan-2025, 
an invoice will be generated between 3-Jan and 5-Jan-2025

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered 
and reported over 30 days starting from the day of sign up.

The usage and invoice dates will differ if these dates are not the same. Since usage statements track usage by day for a given service, users can rely on statements to see the breakdown of costs.

### Are there any restrictions around the usage of prepaid credits?

ClickHouse Cloud prepaid credits (whether direct through ClickHouse, or via a cloud provider's marketplace) 
can only be leveraged for the terms of the contract. 
This means they can be applied on the acceptance date, or a future date, and not for any prior periods. 
Any overages not covered by prepaid credits must be covered by a credit card payment or marketplace monthly billing.

### Is there a difference in ClickHouse Cloud pricing, whether paying through the cloud provider marketplace or directly to ClickHouse?

There is no difference in pricing between marketplace billing and signing up directly with ClickHouse. 
In either case, your usage of ClickHouse Cloud is tracked in terms of ClickHouse Cloud Credits (CHCs), 
which are metered in the same way and billed accordingly.
