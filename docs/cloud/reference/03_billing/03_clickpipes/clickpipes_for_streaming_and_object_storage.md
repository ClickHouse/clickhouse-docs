---
sidebar_label: 'Streaming and object storage'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: 'ClickPipes for streaming and object storage'
description: 'Overview of billing for streaming and object storage ClickPipes'
doc_type: 'reference'
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'

# ClickPipes for streaming and object storage {#clickpipes-for-streaming-object-storage}

This section outlines the pricing model of ClickPipes for streaming and object storage.

## What does the ClickPipes pricing structure look like? {#what-does-the-clickpipes-pricing-structure-look-like}

It consists of two dimensions:

- **Compute**: Price **per unit per hour**.
  Compute represents the cost of running the ClickPipes replica pods whether they actively ingest data or not.
  It applies to all ClickPipes types.
- **Ingested data**: Price **per GB**.
  The ingested data rate applies to all streaming ClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  for the data transferred via the replica pods. The ingested data size (GB) is charged based on bytes received from the source (uncompressed or compressed).

## What are ClickPipes replicas? {#what-are-clickpipes-replicas}

ClickPipes ingests data from remote data sources via a dedicated infrastructure
that runs and scales independently of the ClickHouse Cloud service.
For this reason, it uses dedicated compute replicas.

## What is the default number of replicas and their size? {#what-is-the-default-number-of-replicas-and-their-size}

Each ClickPipe defaults to 1 replica that is provided with 512 MiB of RAM and 0.125 vCPU (XS).
This corresponds to **0.0625** ClickHouse compute units (1 unit = 8 GiB RAM, 2 vCPUs).

## What are the ClickPipes public prices? {#what-are-the-clickpipes-public-prices}

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

## How does it look in an illustrative example? {#how-does-it-look-in-an-illustrative-example}

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

## FAQ for streaming and object storage ClickPipes {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>