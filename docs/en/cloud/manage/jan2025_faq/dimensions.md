---
title: New Pricing Dimensions
slug: /en/cloud/manage/jan-2025-faq/pricing-dimensions
keywords: [new pricing, dimensions]
description: Pricing dimensions for data transfer and ClickPipes
---

import NetworkPricing from '@site/docs/en/cloud/manage/_snippets/_network_transfer_rates.md';


The following dimensions have been added to the new ClickHouse Cloud pricing.

:::note
Data transfer and ClickPipes pricing will not apply to legacy plans, i.e. Development, Production, and Dedicated, until 24 March 2025.
:::

## Data Transfer Pricing

### How are users charged for data transfer, and will this vary across organization tiers and regions?

- Users will pay for data transfer along two dimensions — public internet egress and inter-region egress. There are no charges for intra-region data transfer or Private Link/Private Service Connect use and data transfer. However, we reserve the right to implement additional data transfer pricing dimensions if we see usage patterns that impact our ability to charge users appropriately.
- Data transfer pricing will vary by Cloud Service Provider (CSP) and region.
- Data transfer pricing will **not** vary between organizational tiers.
- Public egress pricing is based only on the origin region. Inter-region (or cross-region) pricing depends on both the origin and destination regions.

<NetworkPricing/>

### Will data transfer pricing be tiered as usage increases?

Data transfer prices will **not** be tiered as usage increases. Note that the pricing varies by region and cloud service provider.

## ClickPipes Pricing

### Why are we introducing a pricing model for ClickPipes now?

To offer a reliable, large-scale, data ingestion service we decided to initially launch ClickPipes for free. The idea was to gather feedback, refine features, and ensure it meets user needs. As the platform has grown and effectively stood the test of time by moving trillions of rows, introducing a pricing model allows us to continue improving the service, maintaining the infrastructure, and providing dedicated support and new connectors.

### What does the ClickPipes pricing structure look like?

It consists of two dimensions:

* **Compute**: Price per unit per hour. Compute represents the cost of running the ClickPipes replicas, whether they actively ingest data or not. It applies to all ClickPipes types.
* **Ingested data**: per GB pricing. The ingested data rate applies to all streaming ClickPipes (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, and Azure Event Hubs) for the data transferred via the replica pods.

### What are the ClickPipes public prices?

- Compute: `$0.20` per unit per hour
- Ingested data: `$0.04` per GB

### How does it look in an illustrative example?

For example, ingesting 1 TB of data over 24 hours using the Kafka connector using a single replica (0.25 compute unit) will cost:

`0.25 x 0.20 x 24 + 0.04 x 1000 = $41.2`

For object storage connectors (S3 and GCS), only the ClickPipes compute cost is incurred since the ClickPipes pod is not processing data but only orchestrating the transfer, which is operated by the underlying ClickHouse service: 

`0.25 x 0.20 x 24 = $1.2`

### When does the new pricing model take effect?

The new pricing model will take effect for all organizations created after **January 27th, 2025**.

### What happens to current users?

Existing users that have not migrated to the new plan will have a **8 week grace period** during which the ClickPipes service will continue to be offered for free. Billing will automatically start for ClickPipes for existing users on **March 24th, 2025.**
