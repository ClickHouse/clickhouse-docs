---
slug: /en/data-modeling/overview
title: Data Modelling Overview
description: Overview of Data Modelling
keywords: [data modelling, schema design, dictionary, materialized view, data compression, denormalizing data]
---

# Data Modeling 

This section is about data modeling in ClickHouse and contains the following topics:

| Page                                                                    | Description                                                                                                                                                                                   |
|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/docs/en/data-modeling/schema-design)                   | Discusses ClickHouse schema design for optimal performance, considering factors like queries, data updates, latency, and volume.                                                              |
| [Dictionary](/docs/en/dictionary)                                       | An explainer on how to define and use dictionaries to improve query performance and enrich data.                                                                                              |
| [Materialized View](/docs/en/materialized-view)                         | Information on Materialized Views and Refreshable Materialized Views in ClickHouse.                                                                                                           |
| [Data Compression](/docs/en/data-compression/compression-in-clickhouse) | Discusses various compression modes in ClickHouse and how to optimize data storage and query performance by choosing the right compression method for your specific data types and workloads. |
| [Denormalizing Data](/docs/en/data-modeling/denormalization)            | Discusses the denormalization approach used in ClickHouse which aims to improve query performance by storing related data in a single table.                                                  |
