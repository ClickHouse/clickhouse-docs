---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'Usage Limits'
title: 'Usage limits'
description: 'Describes the recommended usage limits in ClickHouse Cloud'
doc_type: reference
---

While ClickHouse is known for its speed and reliability, optimal performance is achieved within certain operating parameters. For example, having too many tables, databases or parts could negatively impact performance. To avoid this, Clickhouse Cloud has guardrails set up for several types of items. You can find details of these guardrails below.

:::tip
If you've run up against one of these guardrails, it's possible that you are implementing your use case in an unoptimized way. Contact our support team and we will gladly help you refine your use case to avoid exceeding the guardrails or look together at how we can increase them in a controlled manner. 
:::

| Dimension | Limit |
|-----------|-------|
|**Databases**| 1000|
|**Tables**| 5000|
|**Columns**| ∼1000 (wide format is preferred to compact)|
|**Partitions**| 50k|
|**Parts**| 100k across the entire instance|
|**Part size**| 150gb|
|**Services per organization**| 20 (soft)|
|**Services per warehouse**| 5 (soft)|
|**Low cardinality**| 10k or less|
|**Primary keys in a table**| 4-5 that sufficiently filter down the data|
|**Query concurrency**| 1000|
|**Batch ingest**| anything > 1M will be split by the system in 1M row blocks|

:::note
For Single Replica Services, the maximum number of databases is restricted to 100, and the maximum number of tables is restricted to 500. In addition, storage for Basic Tier Services is limited to 1 TB.
:::
