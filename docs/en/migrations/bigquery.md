---
sidebar_label: BigQuery
sidebar_position: 20
slug: /en/migrations/bigquery
description: Migrating from BigQuery to ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, bigquery]
---

# Migrating from BigQuery to ClickHouse

This guide shows how to migrate data from [BigQuery](https://cloud.google.com/bigquery) to ClickHouse.

In this guide, we first export a table to [Google's object store (GCS)](https://cloud.google.com/storage) and then import that data into [ClickHouse Cloud](https://clickhouse.com/cloud). These steps need to be repeated for each table you wish to export from BigQuery to ClickHouse.

## How long will exporting data to ClickHouse take?

Exporting data from BigQuery to ClickHouse is dependent on the size of your dataset. As a comparison, it takes about an hour to export the [4TB public Ethereum dataset](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) from BigQuery to ClickHouse using this guide.

| Table                                                                                             | Rows          | Files Exported | Data Size | BigQuery Export | Slot Time       | ClickHouse Import |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23 secs         | 37 min          | 15.4 secs         |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1 min 38 sec    | 1 day 8hrs      | 18 mins 5 secs    |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5 min 46 sec    | 5 days 19 hr    | 34 mins 55 secs   |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16 sec          | 1 hr 51 min     | 39.4 secs         |
| Total                                                                                             | 8.26 billion  | 23,577         | 3.982TB   | 8 min 3 sec     | \> 6 days 5 hrs | 53 mins 45 secs   |

## 1. Export table data to GCS

In this step, we utilize the [BigQuery SQL workspace](https://cloud.google.com/bigquery/docs/bigquery-web-ui) to execute our SQL commands. Below, we export a BigQuery table named `mytable` to a GCS bucket using the [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) statement.

```sql
EXPORT DATA
    OPTIONS (
        uri = 'gs://mybucket/mytable/*.parquet',
        format = 'PARQUET',
        overwrite = true
    )
AS (
    SELECT * FROM mytable
);
```

In the above query, we export our BigQuery table to the [Parquet data format](https://parquet.apache.org/). We also have a `*` character in our `uri` parameter. This ensures the output is sharded into multiple files, with a numerically increasing suffix, should the export exceed 1GB of data.

This approach has a number of advantages:

- Google allows up to 50TB per day to be exported to GCS for free. Users only pay for GCS storage.
- Exports produce multiple files automatically, limiting each to a maximum of 1GB of table data. This is beneficial to ClickHouse since it allows imports to be parallelized.
- Parquet, as a column-oriented format, represents a better interchange format since it is inherently compressed and faster for BigQuery to export and ClickHouse to query

## 2. Importing data into ClickHouse from GCS

Once the export is complete, we can import this data into a ClickHouse table. You can use the [ClickHouse SQL console](/docs/en/integrations/sql-clients/sql-console) or [`clickhouse-client`](/docs/en/integrations/sql-clients/cli) to execute the commands below.

You must first [create your table](/docs/en/sql-reference/statements/create/table) in ClickHouse:

```sql
CREATE TABLE default.mytable
(
	`timestamp` DateTime64(6),
	`some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

After creating the table, we enable parallel inserts on selects to speed up our export:

```sql
SET parallel_distributed_insert_select = 1;
```

Finally, we can insert the data from GCS into our ClickHouse table using the [`INSERT INTO SELECT` command](/docs/en/sql-reference/statements/insert-into#inserting-the-results-of-select), which inserts data into a table based on the results from a `SELECT` query.

To retrieve the data to `INSERT`, we can use the [s3Cluster function](/docs/en/sql-reference/table-functions/s3Cluster) to retrieve data from our GCS bucket since GCS is interoperable with [Amazon S3](https://aws.amazon.com/s3/):

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') as some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

The `ACCESS_ID` and `SECRET` used in the above query is your [HMAC key](https://cloud.google.com/storage/docs/authentication/hmackeys) associated with your GCS bucket.

:::note Use `ifNull` when exporting nullable columns
In the above query, we use the [`ifNull` function](/docs/en/sql-reference/functions/functions-for-nulls#ifnull) with the `some_text` column to insert data into our ClickHouse table with a default value. You can also make your columns in ClickHouse [`Nullable`](/docs/en/sql-reference/data-types/nullable), but this is not recommended as it may affect negatively performance.
:::

## 3. Testing successful data export

To test whether your data was properly inserted, simply run a `SELECT` query on your new table:

```sql
SELECT * FROM mytable limit 10;
```

To export more BigQuery tables, simply redo the steps above for each additional table.

## Further reading and support

In addition to this guide, we also recommend reading our blog post that shows [how to use ClickHouse to speed up BigQuery](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries).

If you are having issues transferring data from BigQuery to ClickHouse, please feel free to contact us at support@clickhouse.com.