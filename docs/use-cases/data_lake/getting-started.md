---
title: 'Getting started with open table formats'
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

# Getting Started with Data Lakes {#data-lake-getting-started}

:::note[TL;DR]
A hands-on walkthrough of querying data lake tables, accelerating them with MergeTree, and writing results back to Iceberg. All steps use public datasets and work on both Cloud and OSS.
:::

Screenshots in this guide are from the [ClickHouse Cloud](https://console.clickhouse.cloud) SQL console. All queries work on both Cloud and self-managed deployments.

<VerticalStepper headerLevel="h2">

## Query Iceberg data directly {#query-directly}

The fastest way to start is with the [`icebergS3()`](/sql-reference/table-functions/iceberg) table function — point it at an Iceberg table in S3 and query immediately, no setup required.

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

For repeated access, create a table using the Iceberg table engine so you don't need to pass the path every time. The data stays in S3 — no data is duplicated:

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

Most organizations manage Iceberg tables through a data catalog to centralize the table metadata and data discovery. ClickHouse supports connecting to your catalog using the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine, exposing all catalog tables as a ClickHouse database. This is the more scalable path so as new Iceberg tables are created, they are always accessible in ClickHouse without additional work. 

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

Regardless of which method you used above — table function, table engine, or catalog — the same ClickHouse SQL works across all of them:

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

- [Querying directly](/use-cases/data-lake/getting-started/querying-directly) — All four formats, cluster variants, table engines, caching
- [Connecting to catalogs](/use-cases/data-lake/getting-started/connecting-catalogs) — Full Unity Catalog walkthrough with Delta and Iceberg
- [Accelerating analytics](/use-cases/data-lake/getting-started/accelerating-analytics) — Schema optimization, indexing, ~40x speedup demo
- [Writing to data lakes](/use-cases/data-lake/getting-started/writing-data) — Raw writes, aggregated writes, type mapping
- [Support matrix](/use-cases/data-lake/support-matrix) — Feature comparison across formats and storage backends
