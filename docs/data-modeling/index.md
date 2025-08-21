---
slug: /data-modeling/overview
title: 'Data Modelling Overview'
description: 'Overview of Data Modelling'
keywords: ['data modelling', 'schema design', 'dictionary', 'materialized view', 'data compression', 'denormalizing data']
doc_type: 'overview'
---

# Data Modeling 

This section is about data modeling in ClickHouse and contains the following topics:

| Page                                                            | Description                                                                                                                                                                                   |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | Discusses ClickHouse schema design for optimal performance, considering factors like queries, data updates, latency, and volume.                                                              |
| [Dictionary](/dictionary)                                       | An explainer on how to define and use dictionaries to improve query performance and enrich data.                                                                                              |
| [Materialized Views](/materialized-views)                       | Information on Materialized Views and Refreshable Materialized Views in ClickHouse.                                                                                                           |
| [Projections](/data-modeling/projections)| Information on Projections in ClickHouse.|
| [Data Compression](/data-compression/compression-in-clickhouse) | Discusses various compression modes in ClickHouse and how to optimize data storage and query performance by choosing the right compression method for your specific data types and workloads. |
| [Denormalizing Data](/data-modeling/denormalization)            | Discusses the denormalization approach used in ClickHouse which aims to improve query performance by storing related data in a single table.                                                  |
