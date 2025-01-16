---
title: New Pricing Dimensions
slug: /en/cloud/manage/pricing_faq/dimensions
keywords: [new pricing, dimensions]
description: Pricing dimensions for data transfer and ClickPipes
---

The following dimensions have been added to the new ClickHouse Cloud pricing.

## Data Transfer Pricing

:::note
Data transfer and Clickpipes pricing will not apply to legacy plans, i.e. Development and Production, till 24 March 2025.
:::

### How are users charged for data transfer, and will this vary across organization tiers and regions?

- Users will pay for data transfer along two dimensions — public internet egress and inter-region egress. There are no charges for intra-region data transfer or Private Link/Private Service Connect use and data transfer. However, we reserve the right to implement additional data transfer pricing dimensions if we see usage patterns that impact our ability to charge users appropriately.
- Data transfer pricing will vary by Cloud Service Provider (CSP) and region.
- Data transfer pricing will **not** vary between organizational tiers.
- Public egress pricing is based only on the origin region. Inter-region (or cross-region) pricing depends on both the origin and destination regions.

The table below shows how data transfer charges for egress vary across public internet or cross-region by cloud provider and region.

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>Cloud Provider</th>
            <th>Region</th>
            <th>Public Internet Egress</th>
            <th>Same region</th>
            <th>Cross-region</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>`AWS`</td>
            <td>`ap-northeast-1`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-south-1`</td>
            <td>`$0.1384`</td>
            <td>`$0.0000`</td>
            <td>`$0.1104`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-1`</td>
            <td>`$0.1512`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-2`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1248`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-central-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
    </tbody>
</table>

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud Provider</th>
        <th rowSpan="2">Origin Region</th>
        <th rowSpan="2">Public Internet Egress</th>
        <th colSpan="5">Destination region</th>
    </tr>
    <tr>
        <th>Same region</th>
        <th>North America</th>
        <th>Europe</th>
        <th>Asia, Oceania</th>
        <th>Middle East, South America, Africa</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`</td>
        <td>`$0.0720`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`</td>
        <td>`$0.0720`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720`</td>
        <td>`$0.0360`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200`</td>
        <td>`$0.1200`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    </tbody>
</table>

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud Provider</th>
        <th rowSpan="2">Origin Region</th>
        <th rowSpan="2">Public Internet Egress</th>
        <th colSpan="5">Destination region</th>
    </tr>
    <tr>
        <th>Same region</th>
        <th>North America</th>
        <th>Europe</th>
        <th>Asia, Oceania</th>
        <th>Middle East, South America, Africa</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    </tbody>
</table>

*Data transfer charges are in $ per GB of data transferred*

### Will data transfer pricing be tiered as usage increases?

Data transfer prices will **not** be tiered as usage increases. Note that the pricing varies by region and cloud service provider.

## ClickPipes Pricing

### Why are we introducing a pricing model for ClickPipes now?

To offer a reliable, large-scale, data ingestion service we decided to initially launch ClickPipes for free. The idea was to gather feedback, refine features, and ensure it meets user needs. As the platform has grown and effectively stood the test of time by moving trillions of rows, introducing a pricing model allows us to continue improving the service, maintaining the infrastructure, and providing dedicated support and new connectors.

### What does the ClickPipes pricing structure look like?

It consists of two dimensions:

* **Compute**: Price per unit per hour. Compute represents the cost of running the ClickPipes replicas, whether they actively ingest data or not. It applies to all ClickPipes types.
* **Ingested data**: per GB pricing. The ingested data rate applies to all streaming ClickPipes (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, Warpstream, and Azure Event Hubs) for the data transferred via the replica pods.

### What are the ClickPipes public prices?

- Compute: `$0.20` per unit per hour
- Ingested data: `$0.04` per GB

### How does it look in an illustrative example?

For example, ingesting 1 TB of data over 24 hours using the Kafka connector using a single replica (0.5 compute unit) will cost:

`0.5 x 0.20 x 24 + 0.04 x 1000 = $42.4`

For object storage connectors (S3 and GCS), only the ClickPipes compute cost is incurred since the ClickPipes pod is not processing data but only orchestrating the transfer, which is operated by the underlying ClickHouse service: 

`0.5 x 0.20 x 24 = $2.4`

### When does the new pricing model take effect?

The new pricing model will take effect for all organizations created after **January 23rd, 2025**.

### What happens to current users?

Existing users will have a **60-day grace period** during which the ClickPipes service will continue to be offered for free. Billing will automatically start for ClickPipes for existing users on **March 24th, 2025.**
