---
slug: /cloud/get-started/cloud/use-cases/data_lake_and_warehouse
title: 'Data warehousing'
description: 'Build modern data warehouse architectures by combining the flexibility of data lakes with ClickHouse Cloud's performance'
keywords: ['data warehousing', 'data lake', 'Iceberg', 'Delta Lake', 'Hudi', 'Parquet', 'open table formats', 'hybrid architecture']
sidebar_label: 'Data warehousing'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import data_warehousing from '@site/static/images/cloud/onboard/discover/use_cases/data-warehousing.png';

Data lakes provide flexible, scalable storage for all types of data on cloud
Data lakes leverage cloud object storage to store all types of data in a flexible and scalable way. By adding open table formats and a high-performance query engine
like ClickHouse to it, you can bring database-grade capabilities — ACID transactions,
schema enforcement, and fast analytical queries to your data lake without
sacrificing flexibility.

This combination brings performance together with interoperable, cost effective storage to support your traditional analytics and modern AI/ML workloads.

:::tip ClickHouse Academy
Take the free [Data Warehousing with ClickHouse](https://clickhouse.com/learn/data-warehousing) course to learn more.
:::

## Components of a data lake architecture {#components-of-the-architecture}

A modern data lake architecture has several distinct but interconnected
layers that combine the flexibility of lake storage with data warehouse
capabilities. You can substitute components and evolve each layer
independently.

<Image img={data_warehousing} alt="Components of a data lake architecture" size="md"/>

| Layer               | Description                                                                                                                                                                                                                                                                                                                                    |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Data sources**        | Common data sources include operational databases, streaming platforms, IoT devices, application logs, and external providers.                                                                                                                                                                                                              |
| **Query engine**        | Processes analytical queries against data in object storage, using the metadata and optimizations provided by the table format layer. Supports SQL and other query languages to analyze large volumes of data efficiently.                                                                                     |
| **Technical data catalog**    | The [data catalog](https://clickhouse.com/engineering-resources/data-catalog) acts as a central repository for metadata, storing and managing table definitions, schemas, partitioning information, and access control policies. Enables data discovery, lineage tracking, and governance across the data platform.                             |
| **Table format**  | The [table format](https://clickhouse.com/engineering-resources/open-table-formats) manages the logical organization of data files into tables, providing database-like features such as ACID transactions, schema enforcement and evolution, time travel, and performance optimizations like data skipping and clustering. |
| **Object storage**      | This layer provides scalable, durable, and cost-effective storage for all data files and metadata. It persists data in open formats, enabling direct access from multiple tools and systems.                                                                                                                          |
| **Client applications** | Various tools and applications that connect to the platform to query data, visualize insights, or build data products. These can include BI tools, data science notebooks, custom applications, and ETL/ELT tools.                                                                                                                            |

## Benefits of combining data lakes with a data warehouse {#benefits-of-this-architecture}

Adding open table formats and a dedicated query engine to your data lake offers
significant advantages over both traditional data warehouses and raw data lakes:

### Compared to traditional data warehouses {#compared-to-traditional-data-warehouses}

| # | Benefit                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | **Cost efficiency**                              | Data lakes use inexpensive object storage rather than proprietary storage formats, significantly reducing storage costs compared to data warehouses that charge premium prices for their integrated storage.                                                                                                                                                                                                                          |
| 2 | **Component flexibility and interchangeability** | With a data lake architecture, you can substitute individual components like query engines or table formats without replacing the entire system. This reduces vendor lock-in and lets you adapt to changing needs without disruptive migrations. |
| 3 | **Open format support**                          | Data is stored in open file formats like Parquet, allowing direct access from various tools without vendor lock-in, unlike proprietary data warehouse formats that restrict access to their ecosystem.                                                                                                                                                                                                                              |
| 4 | **AI/ML integration**                            | Open storage formats give machine learning frameworks and Python/R libraries direct access to data, whereas data warehouses typically require you to extract data before using it for advanced analytics.                                                                                                                                                                                                                                         |
| 5 | **Independent scaling**                          | Storage and compute are separated, allowing each to scale independently based on actual needs, unlike many data warehouses that scale them together.                                                                                                                                                                                                                                                                              |

### What open table formats add to your data lake {#compared-to-data-lakes}

| # | Benefit                     | Description                                                                                                                                                                                         |
|---|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | **Query performance**       | Open table formats use indexing, statistics, and data layout optimizations that let SQL queries run at speeds comparable to data warehouses, overcoming the poor performance of querying raw files. |
| 2 | **Data consistency**        | Through ACID transaction support, open table formats ensure consistency during concurrent operations, solving a major limitation of raw data lakes where file conflicts can corrupt data.          |
| 3 | **Schema management**       | Table formats enforce schema validation and track schema evolution, preventing the "data swamp" problem common in data lakes where data becomes unusable due to schema inconsistencies.                |
| 4 | **Governance capabilities** | Open table formats and catalogs provide fine-grained access control and auditing features at row/column levels, addressing the limited security controls in basic data lakes.                                            |
| 5 | **BI Tool support**         | A dedicated query engine offers SQL interfaces and optimizations that make the data compatible with standard BI tools, unlike raw data lakes that require additional processing layers before visualization.           |

## Where does ClickHouse fit? {#where-does-clickhouse-fit}

ClickHouse serves as the analytical query engine in a data lake architecture.
It can directly query Parquet files in S3, Azure Blob Storage, or Google Cloud
Storage using its columnar engine to return fast results even on massive datasets.
This means you can analyze your lake data without moving or transforming it first.

For more advanced capabilities, ClickHouse integrates with open table formats
like Apache Iceberg, Delta Lake, and Apache Hudi. You can connect to these table
formats directly or through data catalogs like AWS Glue Catalog, Unity Catalog, Iceberg REST and more — and still get fast query performance.

With ClickHouse as your query engine, you get the speed of a dedicated analytical
database while keeping the openness of your data lake: interchangeable components,
open formats, and unified data management.

## Hybrid architecture: The best of both worlds {#hybrid-architecture-the-best-of-both-worlds}

Beyond querying your data lake, ClickHouse's native storage engine gives you
another option. For use cases that demand ultra-low latency — real-time
dashboards, operational analytics, or interactive user experiences — you can
store performance-critical data directly in ClickHouse's native format.

This lets you build a tiered data strategy: hot, frequently accessed data lives
in ClickHouse's optimized storage for sub-second query responses, while the
complete data history stays accessible in the data lake. You choose where data
lives based on performance requirements, not technical limitations.
