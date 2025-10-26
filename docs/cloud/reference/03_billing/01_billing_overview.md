---
sidebar_label: 'Overview'
slug: /cloud/manage/billing/overview
title: 'Pricing'
description: 'Overview page for ClickHouse Cloud pricing'
doc_type: 'reference'
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes). 
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) example {#amazon-web-services-aws-example}

:::note
- Prices reflect AWS us-east-1 pricing.
- Explore applicable data transfer and ClickPipes charges [here](/cloud/manage/network-data-transfer).
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

### What is a ClickHouse Credit (CHC)? {#what-is-chc}

A ClickHouse Credit is a unit of credit toward Customer's usage of ClickHouse Cloud equal to one (1) US dollar, to be applied based on ClickHouse's then-current published price list.

### Where can I find legacy pricing? {#find-legacy-pricing}

Legacy pricing information can be found [here](https://clickhouse.com/pricing?legacy=true).

:::note 
If you are being billed through Stripe then you will see that 1 CHC is equal to \$0.01 USD on your Stripe invoice. This is to allow accurate billing on Stripe due to their limitation on not being able to bill fractional quantities of our standard SKU of 1 CHC = \$1 USD.
:::

### How is compute metered? {#how-is-compute-metered}

ClickHouse Cloud meters compute on a per-minute basis, in 8G RAM increments. 
Compute costs will vary by tier, region, and cloud service provider.

### How is storage on disk calculated? {#how-is-storage-on-disk-calculated}

ClickHouse Cloud uses cloud object storage and usage is metered on the compressed size of data stored in ClickHouse tables. 
Storage costs are the same across tiers and vary by region and cloud service provider. 

### Do backups count toward total storage? {#do-backups-count-toward-total-storage}

Storage and backups are counted towards storage costs and billed separately. 
All services will default to one backup, retained for a day. 
Users who need additional backups can do so by configuring additional [backups](/cloud/manage/backups/overview) under the settings tab of the Cloud console.

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

:::note
ClickHouse Cloud credits for PAYG are invoiced in \$0.01 units, allowing us to charge customers for partial ClickHouse credits based on their usage. This differs from committed spend ClickHouse credits, which are purchased in advance in whole \$1 units.
:::

### Can I delete my credit card? {#can-i-delete-my-credit-card}
You can’t remove a credit card in the Billing UI, but you can update it anytime. This helps ensure your organization always has a valid payment method. If you need to remove your credit card, please contact [ClickHouse Cloud support](https://console.clickhouse.cloud/support) for help.

### How long is the billing cycle? {#how-long-is-the-billing-cycle}

Billing follows a monthly billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### If I have an active PAYG marketplace subscription and then sign a committed contract, will my committed credits be consumed first? {#committed-credits-consumed-first-with-active-payg-subscription}

Yes. Usage is consumed with the following payment methods in this order:
- Committed (prepaid) credits
- Marketplace subscription (PAYG)
- Credit card

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

### How do I access my invoices for my subscription to the ClickHouse Cloud service? {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

For direct subscriptions using a credit card:

To view your invoices, select your organization from the left-hand navigation bar in the ClickHouse Cloud UI, then go to Billing. All of your invoices will be listed under the Invoices section.

For subscriptions through a cloud marketplace:

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
If yes, these two services now form a [warehouse](/cloud/reference/warehouses). 
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

For information on ClickPipes billing, please see the dedicated ["ClickPipes billing" section](/cloud/reference/billing/clickpipes).
