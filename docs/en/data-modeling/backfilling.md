---
slug: /en/data-modeling/backfilling
title: Backfilling Data
description: How to use backfill large datasets in ClickHouse
keywords: [materialized views, backfilling, inserting data, resilent data load]
---

# Backfilling Data

Whether new to ClickHouse or responsible for an existing deployment, users will invariably need to backfill data. This task requires tables to be populated with historical data. In some cases, this is relatively simple but can become more complex when materialized views need to also be populated. This guide documents some techniques for this task that users can apply to their usecase.

:::important
This guide assumes users are already familar with the concept of [Incremental Materialized Views]() and data loading using table functions such as [s3]() and [gcs]().
:::

## Example dataset

Throughout this guide we use a PyPI dataset. Each row in this dataset represents a Python package download using a tool such as `pip`. 

The subset used for example purposes covers a single day - `2024-12-17` and is  available publically at `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`. For example, users can query with:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

The full dataset for this bucket contains over `320GB` of parquet files. We thus intentionally target subsets using glob patterns in our examples below.

We assume the user is consuming a stream of this data e.g. from Kafka or object storage, for data after this date. The schema for this data is shown below:

```sql

```

:::note
The full PyPi dataset, consisting of over 1 trillion rows, is available in our public demo environment [clickpy.clickhouse.com](https://clickpy.clickhouse.com). For further details on this dataset, including how the demo exploits materialized views for performance and how the data is populated daily, see [here](https://github.com/ClickHouse/clickpy).
:::

## Backfilling scenarios

Backfilling is typically needed when a stream of data is being consumed from a point in time. This data is being inserted into ClickHouse tables with [incremental materialized views]() trigging on blocks as they are inserted. These views may be transforming the data prior to insert or computing aggregates and sending results to target tables for later use my downstream applications. 

We will attempt to cover the following scenarios:

1. **Backfilling data with existing data ingestion** - Data is already inserting and historical data needs to be backfilled. This historical data has been identified.
2. **Backfilling data with no existing data ingestion** - Users have yet to start streaming new data into ClickHouse but have prepared their table and materialized views. They are ready to ingest.
3. **Adding materialized views to existing tables** - New materialized views need to be added to a setup for which historical data has been populated and data is already streaming. A timestamp, or montonotically increasing column, which can be used to identify a point in the stream is useful here and avoids pauses in data ingestion. 

For scenarios (1) and (2) we assume data will be backfilled from object storage. In all cases we aim to avoid pauses in data insertion.

We recommend backfilling historical data from object storage. While data should be exported to Parquet where possible for optimal read performance and compression (reduced network transfer), with a file size of around 150MB typically prefered, ClickHouse supports over [70 file formats]().

### Using duplicate tables and views

For all of the scenarios we rely on the the concept of a "duplicate tables and views". These tables and views represent copies of those used for the live streaming data, and allow the backfill to be performed in isolation with an easy means of recovery should failure occur. For example, we have the following main `pypi` table and materialized view which computes the number of downloads per python project:

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `version` String
)
ENGINE = MergeTree
ORDER BY (project, timestamp)

CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
AS SELECT
    project,
    count() AS count
FROM pypi
GROUP BY project
```

We populate the main table, and associated view, with a subset of the data:

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads


┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15 thousand rows, 769.23 KB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

Now suppose we wish to load another subset `{101..200}`. While we could insert directly into `pypi`, we can do this backfill in isolation by creating duplicate tables. 

Should the backfill fail, we have not impacted our main tables and can simply [truncate]() our duplicates tables and repeat.

To create new copies of these views we can use the `CREATE TABLE AS` clause with the suffix `_v2`:

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT
    project,
    count() AS count
FROM pypi_v2
GROUP BY project
```

We populate this with our 2nd subset of approximately the same size, and confirm the successful load.

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49 thousand rows, 763.90 KB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```

If at any point during this 2nd load we experienced a failure we could simply [truncate]() our `pypi_v2` and `pypi_downloads_v2` and repeat the data load.

With our data load complete, we can move the data from our duplicate tables to the main tables using the `ALTER TABLE MOVE PARTITION` clause.

```sql
ALTER TABLE pypi
    (MOVE PARTITION () FROM pypi_v2)

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads
    (MOVE PARTITION () FROM pypi_downloads_v2)

0 rows in set. Elapsed: 0.389 sec.
```

We can now confirm `pypi` and `pypi_downloads` contain the complete data. `pypi_downloads_v2` and `pypi_v2` can be safely dropped.

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01 million
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01 million
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

Importantly, the `MOVE PARTITION` operation is both lightweight (exploiting hardlinks) and is atomic i.e. it either fails or succeeds with no intermediate state.

We exploit this process heavily in our backfilling scenarios below. 

This process requires users to choose the size of each insert operation. Larger inserts i.e. more rows, will mean less `MOVE PARTITION` operations are required. However, this must be balanced against the cost in the event of an insert failure e.g. due to network interruption, to recover.

:::note
ClickPipes uses this approach when loading data from object storage, automatically creating duplicates of the target table and its materialized views, and avoiding the need for the user to perform the above steps. By also using multiple workers (each with their own duplicates), data can be loaded quickly with exactly-once semantic. For those interested, further details can be found [in this blog](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).
:::

### Scenario 1: Backfilling data with existing data ingestion

In this scenario, data is already inserting and a timestamp or montonotically increasing column can be identified from which historical data needs to be backfilled. 

For example, in our PyPI data suppose we have data loaded. We can identify the minimum timestamp, and thus our "checkpoint".

```sql


```

From the above, we know we need to load data prior to `2024-12-17 09:00:00`. Using our earlier process, we create duplicate tables and views and load the subset.



create shadow tables and materialized views. Insert into them using the column or time identifer. Attach partitions to their corresponding live versions.

clickpipes - can use with clickpipes - better as its exactly once.

If not using clickpipes, INSERT INTO SELECT in batches. Where you could envisage shadow tables for each batch.


### Scenario 2: Backfilling data with no existing data ingestion

Identifiy a time value or monotonically increasing id. Modify all materialized views such that they only apply to values > this id or time value.

Start stream.

Backfill as above.


### Scenario 3: Adding materialized views to existing tables

Ideally users can identify a point in time or montonotically increasing column, which can be used to establish a consistent point in the stream.

Identifiy a time value or monotonically increasing id. Add new materialized views such that it only applies to values > this id or time value.


Either:

1. create a shadown of the target materialized view. Populate with a query - INSERT INTO SELCT. This can be memory hungry. Can spool to disk but still risky.
2. Do in batches (1)
3. Create a null table engine of the main table. create a shadown of the target mv - trigger off null table. Insert into the data. ATTACH partitions to real mv target table. Drop the mv and null table. Control memory with settings.





### Using Clickpipes



## Backfilling materialized views




### Using Clickpipes

pypi

stop ingest

1. CREATE MV on pypi
2. CREATE TABLE pypi_v2 AS pypi
3. EXCHANGE pypi_v2 AND pypi

pypi_v2 has all the data. We attach the partitions from pypi_v2 to pypi.


Start ingest

backfill to


