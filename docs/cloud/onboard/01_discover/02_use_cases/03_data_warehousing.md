---
slug: /cloud/get-started/cloud/use-cases/data_lake_and_warehouse
title: 'Data warehousing'
description: 'Build modern data warehouse architectures by combining the flexibility of data lakes with ClickHouse Cloud''s performance'
keywords: ['data warehouse', 'data lake', 'Iceberg', 'Delta Lake', 'Hudi', 'Parquet', 'open table formats', 'hybrid architecture']
sidebar_label: 'Data warehousing'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import data_warehousing from '@site/static/images/cloud/onboard/discover/use_cases/data-warehousing.png';

Data lakes leverage cloud object storage to store all types of data in a flexible and scalable way. By adding open table formats and a high-performance query engine like ClickHouse to it, you can bring database-grade capabilities — ACID transactions, schema enforcement, and fast analytical queries — to your data lake without sacrificing flexibility.

This combination brings performance together with interoperable, cost-effective storage to support your traditional analytics and modern AI/ML workloads.

:::tip ClickHouse Academy
Take the free [Data Warehousing with ClickHouse](https://clickhouse.com/learn/data-warehousing) course to learn more.
:::

## What this architecture gives you {#benefits}

By combining open object storage, table formats, and ClickHouse as your query engine, you get:

| Benefit | Description |
|---------|-------------|
| **Open, interoperable storage** | Data is stored as [Parquet](/integrations/data-formats/parquet) files on commodity object storage — significantly cheaper than proprietary warehouse storage, accessible from any tool, and not locked to a single vendor. You can swap query engines or table formats without disruptive migrations. |
| **Consistent table updates** | Atomic commits to table state mean concurrent writes don't produce corrupt or partial data. This solves one of the biggest problems with raw data lakes. |
| **Schema management** | Enforced validation and tracked schema evolution prevent the "data swamp" problem where data becomes unusable due to schema inconsistencies. |
| **Query performance** | Indexing, statistics, and data layout optimizations like data skipping and clustering let SQL queries run at speeds comparable to a dedicated data warehouse. Combined with ClickHouse's columnar engine, this holds true even on data stored in object storage. |
| **Governance** | Catalogs and table formats provide fine-grained access control and auditing at row and column levels, addressing the limited security controls in basic data lakes. |
| **Separation of storage and compute** | Storage and compute scale independently. While this is standard in modern cloud warehouses, open formats let you choose *which* compute engine scales with your data. |

## How ClickHouse powers your data warehouse {#architecture}

Data flows from streaming platforms and existing warehouses through object storage into ClickHouse, where it's transformed, optimized, and served to your BI tools.

<Image img={data_warehousing} alt="ClickHouse data warehousing architecture" size="md"/>

ClickHouse handles four key parts of the data warehousing workflow: getting data in, querying it, transforming it, and connecting it to the tools your team already uses.

<details open>
<summary>**Data ingestion**</summary>

For bulk data loads, you typically use an object store like S3 as an intermediary. ClickHouse's Parquet reading performance lets you load data at hundreds of millions of rows per second using the [S3 table engine](/engines/table-engines/integrations/s3). For real-time streaming, [ClickPipes](/integrations/clickpipes) connects directly to platforms like Kafka and Confluent.

You can also migrate from existing data warehouses like Snowflake, BigQuery, and Databricks by exporting to object storage and loading into ClickHouse via [table engines](/engines/table-engines).

</details>

<details>
<summary>**Querying**</summary>

You can query data directly from object stores like S3 and GCS, or from data lakes with open table formats like [Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), and [Hudi](/engines/table-engines/integrations/hudi). You can connect to these formats directly or through data catalogs like [AWS Glue Catalog](/use-cases/data-lake/glue-catalog), [Unity Catalog](/use-cases/data-lake/unity-catalog), and [Iceberg REST](/use-cases/data-lake/rest-catalog).

Queries on [materialized views](/materialized-views) are fast because their summarized results are automatically stored in dedicated tables, making applications that rely on them more responsive no matter how much data you're analyzing. While other database providers hide accelerating features behind higher pricing tiers or additional charges, ClickHouse Cloud offers the [query cache](/operations/query-cache), [sparse indexes](/optimize/skipping-indexes), and [projections](/data-modeling/projections) out of the box for repeated and latency-sensitive queries.

ClickHouse supports 70+ file formats and SQL functions for working with dates, arrays, JSON, geo, and approximate aggregations at scale.

</details>

<details>
<summary>**Data transformations**</summary>

Data transformations are common pillars in business intelligence and analytics workflows. Materialized views in ClickHouse automate them — these SQL-based views are triggered when new data is inserted into source tables, so you can extract, aggregate, and modify data as it arrives without building and managing bespoke transformation pipelines.

For more complex modeling workflows, ClickHouse's [dbt integration](/integrations/dbt) lets you define transformations as version-controlled SQL models and migrate existing dbt jobs to run directly on ClickHouse.

</details>

<details>
<summary>**Integrations**</summary>

Whether you use [Tableau](/integrations/tableau), [Looker](/integrations/looker), or another tool that supports the [MySQL interface](/interfaces/mysql), ClickHouse connects out of the box. Companies across financial services, gaming, e-commerce, and more rely on these integrations to unlock value from data as soon as it arrives, powering live dashboards and business intelligence workflows.

ClickHouse also supports a REST interface, so you can build lightweight applications without integrating with complex binary protocols. Flexible [RBAC](/operations/access-rights) and quota controls let you expose read-only tables publicly for client-side data fetching.

</details>

## Hybrid architecture: The best of both worlds {#hybrid-architecture-the-best-of-both-worlds}

Beyond querying your data lake, you can ingest performance-critical data into ClickHouse's native [MergeTree](/engines/table-engines/mergetree-family/mergetree) storage for use cases that demand ultra-low latency — real-time dashboards, operational analytics, or interactive applications.

This gives you a tiered data strategy. Hot, frequently accessed data lives in ClickHouse's optimized storage for sub-second query responses, while the complete data history stays in the lake and remains queryable. You can also use ClickHouse materialized views to continuously transform and aggregate lake data into optimized tables, bridging the two tiers automatically.

You choose where data lives based on performance requirements, not technical limitations.
