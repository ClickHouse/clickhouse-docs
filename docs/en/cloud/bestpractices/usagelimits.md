---
slug: /en/cloud/bestpractices/usage-limits
sidebar_label: Usage Limits
title: Usage Limits
---


## Database Limits
Clickhouse is very fast and reliable, but any database has its limits. For example, having too many tables or databases could negatively affect performance. To avoid that, Clickhouse Cloud has guardrails for several types of items.

:::tip
If you've reached one of those limits, it may mean that you are implementing your use case in an unoptimized way. You can contact our support so we can help you refine your use case to avoid going through the limits or to increase the limits in a guided way. 
:::

# Partitions
Clickhouse Cloud have a limit of **50000** [partitions](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key) per instance

# Parts
Clickhouse Cloud have a limit of **100000** [parts](https://clickhouse.com/docs/en/operations/system-tables/parts) per instance

:::note
For Single Replica Services, the maximum number of Databases is restricted to 100, and the maximum number of Tables is restricted to 500. In addition, Storage for Basic Tier Services is limited to 1 TB.
:::


