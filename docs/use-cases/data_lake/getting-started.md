---
title: 'Getting started with data lakes'
sidebar_label: 'Getting started'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: null
pagination_next: use-cases/data_lake/guides/querying-directly
description: 'A hands-on introduction to querying, accelerating, and writing back data in open table formats with ClickHouse.'
keywords: ['data lake', 'lakehouse', 'getting started', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import iceberg_query_direct from '@site/static/images/datalake/iceberg-query-direct.png';
import iceberg_query_engine from '@site/static/images/datalake/iceberg-query-engine.png';
import iceberg_query from '@site/static/images/datalake/iceberg-query.png';
import clickhouse_query from '@site/static/images/datalake/clickhouse-query.png';

:::note[TL;DR]
A hands-on walkthrough of querying data lake tables, accelerating them with MergeTree, and writing results back to Iceberg. All steps use public datasets and work on both Cloud and OSS.
:::

Screenshots in this guide are from the [ClickHouse Cloud](https://console.clickhouse.cloud) SQL console. All queries work on both Cloud and self-managed deployments.

ClickHouse offers three ways to read open table formats: table functions, table engines, and the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine. **If your tables live in a data catalog** (Glue, Unity Catalog, REST, and others), connect with `DataLakeCatalog` so you can get access to all of your Iceberg/Delta tables in one function. The table function and table engine sections below are best for ad hoc queries or when you know a specific storage path and don't use a catalog.

<VerticalStepper headerLevel="h2">

## Query Iceberg data directly {#query-directly}

The fastest way to start — especially for ad hoc queries or when you don't use a catalog — is the [`icebergS3()`](/sql-reference/table-functions/iceberg) table function. Point it at an Iceberg table in S3 and query immediately, no setup required.

Inspect the schema:

```sql
DESCRIBE icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
```

Run a query:

```sql
SELECT
    url,
    count() AS cnt
FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
GROUP BY url
ORDER BY cnt DESC
LIMIT 5
```

<Image img={iceberg_query_direct} alt="Iceberg Query"/>

ClickHouse reads the Iceberg metadata directly from S3 and infers the schema automatically. The same approach works for [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi), and [`paimon()`](/sql-reference/table-functions/paimon).

**Learn more:** [Querying open table formats directly](/use-cases/data-lake/getting-started/querying-directly) covers all four formats, cluster variants for distributed reads, and storage backend options (S3, Azure, HDFS, local).

## Create a persistent table engine {#table-engine}

When you don't use a catalog but will query the same path repeatedly, create a table using the Iceberg table engine so you don't need to pass the path every time. The data stays in S3 — no data is duplicated:

```sql
CREATE TABLE hits_iceberg
    ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
```

Now query it like any ClickHouse table:

```sql
SELECT
    url,
    count() AS cnt
FROM hits_iceberg
GROUP BY url
ORDER BY cnt DESC
LIMIT 5
```

<Image img={iceberg_query_engine} alt="Iceberg Query"/>

The table engine supports data caching, metadata caching, schema evolution, and time travel. See the [Querying directly](/use-cases/data-lake/getting-started/querying-directly) guide for details on table engine features and the [support matrix](/use-cases/data-lake/support-matrix) for a full feature comparison.

## Connect to a catalog {#connect-catalog}

If your organization uses a data catalog, this is the integration path we recommend. Catalogs centralize table metadata and discovery — instead of managing a table definition for every storage path, connect once with the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine. Every table in the catalog appears as a ClickHouse table, including tables added upstream after you create the connection.

:::important Recommended when you use a catalog
Use `DataLakeCatalog` for production workloads with Glue, Unity Catalog, REST, and other [supported catalogs](/use-cases/data-lake/reference). Table functions and table engines work when you know a specific path, but they don't stay in sync as your catalog grows and require separate credentials or paths per table.
:::

Here's an example connecting to [AWS Glue](/use-cases/data-lake/glue-catalog):

```sql
CREATE DATABASE my_lake
ENGINE = DataLakeCatalog
SETTINGS
    catalog_type = 'glue',
    region = '<your-region>',
    aws_access_key_id = '<your-access-key>',
    aws_secret_access_key = '<your-secret-key>'
```

Each catalog type requires its own connection settings — see the [Catalogs guides](/use-cases/data-lake/reference) for the full list of supported catalogs and their configuration options.

Browse tables and query:

```sql
SHOW TABLES FROM my_lake;
```

```sql
SELECT count(*) FROM my_lake.`<database>.<table>`
```

:::note
Backticks are required around `<database>.<table>` because ClickHouse doesn't natively support more than one namespace.
:::

**Learn more:** [Connecting to a data catalog](/use-cases/data-lake/getting-started/connecting-catalogs) walks through a full Unity Catalog setup with Delta and Iceberg examples.

## Issue a query {#issue-query}

Regardless of which method you used above — table function, table engine, or `DataLakeCatalog` — the same ClickHouse SQL works across all of them. In production with a catalog, query through the `DataLakeCatalog` database; the other examples remain useful for quick tests and path-based access:

```sql
-- Table function
SELECT url, count() AS cnt
FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
GROUP BY url ORDER BY cnt DESC LIMIT 5

-- Table engine
SELECT url, count() AS cnt
FROM hits_iceberg
GROUP BY url ORDER BY cnt DESC LIMIT 5

-- Catalog
SELECT url, count() AS cnt
FROM my_lake.`<database>.<table>`
GROUP BY url ORDER BY cnt DESC LIMIT 5
```

The query syntax is identical — only the `FROM` clause changes. All ClickHouse SQL functions, joins, and aggregations work the same way regardless of the data source.

## Load a subset into ClickHouse {#load-data}

Querying Iceberg directly is convenient, but performance is bounded by network throughput and the file layout. For analytical workloads, load data into a native MergeTree table.

First, run a filtered query over the Iceberg table to get a baseline:

```sql
SELECT
    url,
    count() AS cnt
FROM hits_iceberg
WHERE counterid = 38
GROUP BY url
ORDER BY cnt DESC
LIMIT 5
```

This query scans the full dataset in S3 since Iceberg has no awareness of the `counterid` filter — expect it to take several seconds.

<Image img={iceberg_query} alt="Iceberg Query"/>

Now create a MergeTree table and load the data:

```sql
CREATE TABLE hits_clickhouse
(
    url String,
    eventtime DateTime,
    counterid UInt32
)
ENGINE = MergeTree()
ORDER BY (counterid, eventtime);
```

```sql
INSERT INTO hits_clickhouse
SELECT url, eventtime, counterid
FROM hits_iceberg
```

Re-run the same query against the MergeTree table:

```sql
SELECT
    url,
    count() AS cnt
FROM hits_clickhouse
WHERE counterid = 38
GROUP BY url
ORDER BY cnt DESC
LIMIT 5
```

<Image img={clickhouse_query} alt="ClickHouse Query"/>

Because `counterid` is the first column in the `ORDER BY` key, ClickHouse's sparse primary index skips directly to the relevant granules — only reading the rows for `counterid = 38` instead of scanning all 100 million rows. The result is a dramatic speedup.

The [accelerating analytics](/use-cases/data-lake/getting-started/accelerating-analytics) guide takes this further with `LowCardinality` types, full-text indices, and optimized ordering keys, demonstrating a **~40x improvement** on a 283 million row dataset.

**Learn more:** [Accelerating analytics with MergeTree](/use-cases/data-lake/getting-started/accelerating-analytics) covers schema optimization, full-text indexing, and a complete before/after performance comparison.

## Write back to Iceberg {#write-back}

ClickHouse can also write data back to Iceberg tables, enabling reverse ETL workflows — publishing aggregated results or subsets for consumption by other tools (Spark, Trino, DuckDB, etc.).

Create an Iceberg table for output:

```sql
CREATE TABLE output_iceberg
(
    url String,
    cnt UInt64
)
ENGINE = IcebergS3('https://your-bucket.s3.amazonaws.com/output/', 'access_key', 'secret_key')
```

Write aggregated results:

```sql
SET allow_experimental_insert_into_iceberg = 1;

INSERT INTO output_iceberg
SELECT
    url,
    count() AS cnt
FROM hits_clickhouse
GROUP BY url
ORDER BY cnt DESC
```

The resulting Iceberg table is readable by any Iceberg-compatible engine.

**Learn more:** [Writing data to open table formats](/use-cases/data-lake/getting-started/writing-data) covers writing raw data and aggregated results using the UK Price Paid dataset, including schema considerations when mapping ClickHouse types to Iceberg.

</VerticalStepper>

## Next steps {#next-steps}

Now that you've seen the full workflow, dive deeper into each area:

- [Connecting to catalogs](/use-cases/data-lake/getting-started/connecting-catalogs) — Recommended for catalog-backed workloads; full Unity Catalog walkthrough with Delta and Iceberg
- [Querying directly](/use-cases/data-lake/getting-started/querying-directly) — All four formats, cluster variants, table engines, caching
- [Accelerating analytics](/use-cases/data-lake/getting-started/accelerating-analytics) — Schema optimization, indexing, ~40x speedup demo
- [Writing to data lakes](/use-cases/data-lake/getting-started/writing-data) — Raw writes, aggregated writes, type mapping
- [Support matrix](/use-cases/data-lake/support-matrix) — Feature comparison across formats and storage backends
- [Best practices](/use-cases/data-lake/best-practices) — Access method selection, performance settings, and workload patterns
