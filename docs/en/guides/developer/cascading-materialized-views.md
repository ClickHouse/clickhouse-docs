---
slug: /en/guides/developer/cascading-materialized-views
sidebar_label: Materialized Views
description: HowTo use multiple materialized views from a source table.
keywords: [materialized view, how to, aggregation]
---

# Materialized views

This example demonstrates how to create a Materialized View, and then how to cascade a second Materialized View on to the first. In this page, you will see how to do it, many of the possibilities, and the limitations.
Different use cases can be answered by creating a Materialized view using a second Materialized view as the source.

Example:

We will use a fake dataset with the number of views per hour for a group of domain names.

Our Goal

1. We need the data aggregated by month for each domain name,
2. We also need the data aggregated by year for each domain name.

You could choose one of these options:
write queries that will read and aggregate the data during the SELECT request
prepare the data at the ingest time to a new format
Prepare the data at the time of ingest to a specific aggregation.

Preparing the data using Materialized views will allow you to limit the amount of data and calculation ClickHouse needs to do, making your SELECT requests faster.

## Source table for the materialized views
Create the source table, because our goals involve reporting on the aggregated data and not the individual rows, we can parse it, pass the information on to the Materialized Views, and discard the actual incoming data.  This meets our goals and saves on storage so we will use the `Null` table engine.

```sql
CREATE DATABASE IF NOT EXISTS analytics;
```

```sql
CREATE TABLE analytics.hourly_data
(
    `domain_name` String,
    `event_time` DateTime,
    `count_views` UInt64
)
ENGINE = Null
```

:::note
You can create a materialized view on a Null table. So the data written to the table will end up affecting the view, but the original raw data will still be discarded.
:::

## Monthly aggregated table and materialized view

For the first Materialized View, we need to create the `Target` table, for this example, it will be `analytics.monthly_aggregated_data` and we will store the sum of the views by month and domain name.

```sql
CREATE TABLE analytics.monthly_aggregated_data
(
    `domain_name` String,
    `month` Date,
    `sumCountViews` AggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (domain_name, month)
```

The Materialized View that will forward the data on the target table will look like this:

```sql
CREATE MATERIALIZED VIEW analytics.monthly_aggregated_data_mv
TO analytics.monthly_aggregated_data
AS
SELECT
    toDate(toStartOfMonth(event_time)) AS month,
    domain_name,
    sumState(count_views) AS sumCountViews
FROM analytics.hourly_data
GROUP BY
    domain_name,
    month
```


## Yearly aggregated table and materialized view

Now we will create the second Materialized view that will be linked to our previous target table `monthly_aggregated_data`.

First, we will create a new target table that will store the sum of views aggregated by year for each domain name.
```sql
CREATE TABLE analytics.year_aggregated_data
(
    `domain_name` String,
    `year` UInt16,
    `sumCountViews` UInt64
)
ENGINE = SummingMergeTree()
ORDER BY (domain_name, year)
```

This step defines the cascade. The `FROM` statement will use the `monthly_aggregated_data` table, this means the data flow will be:
  1. The data comes to the `hourly_data` table.
  2. ClickHouse will forward the data received to the first Materialized View `monthly_aggregated_data` table,
  3. Finally, the data received in step 2 will be forwarded to the `year_aggregated_data`.

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
A common misinterpretation when working with Materialized views is that data is read from the table, This is not how `Materialized views` work; the data forwarded is the inserted block, not the final result in your table.

Let's imagine in this example that the engine used in `monthly_aggregated_data` is a CollapsingMergeTree, the data forwarded to our second Materialized view `year_aggregated_data` will not be the final result of the collapsed table, it will forward the block of data with the fields defined as in the `SELECT ... GROUP BY`.

If you are using CollapsingMergeTree, ReplacingMergeTree, or even SummingMergeTree and you plan to create a cascade Materialized view you need to understand the limitations described here.
:::

## Sample data

Now is the time to test our cascade materialized view by inserting some data:
```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

If you SELECT the contents of `analytics.hourly_data` you will see the following because the table engine is `Null`, but the data was processed.
```sql
SELECT * FROM analytics.hourly_data
```
```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

We have used a small dataset to be sure we can follow and compare the result with what we are expecting, once your flow is correct with a small data set, you could just move to a large amount of data.

## Results

If you try to query the target table by selecting the `sumCountViews` field, you will see the binary representation (in some terminals), as the value is not stored as a number but as an AggregateFunction type.
To get the final result of the aggregation you should use the `-Merge` suffix.

You can see the special characters stored in AggregateFunction with this query:
```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```
```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

3 rows in set. Elapsed: 0.003 sec.
```

Instead, let's try using the `Merge` suffix to get the `sumCountViews` value:
```sql
SELECT
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data;
```
```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

In the `AggregatingMergeTree` we have defined the `AggregateFunction` as `sum`, so we can use the `sumMerge`. When we use the function `avg` on the `AggregateFunction`, we will use `avgMerge`, and so forth.

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

Now we can review that the Materialized Views answer the goal we have defined.

Now that we have the data stored in the target table `monthly_aggregated_data` we can get the data aggregated by month for each domain name:

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
   domain_name,
   month
```

```response
┌──────month─┬─domain_name────┬─sumCountViews─┐
│ 2020-01-01 │ clickhouse.com │             6 │
│ 2019-01-01 │ clickhouse.com │             1 │
│ 2019-02-01 │ clickhouse.com │             5 │
└────────────┴────────────────┴───────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

The data aggregated by year for each domain name:
```sql
SELECT
   year,
   domain_name,
   sum(sumCountViews)
FROM analytics.year_aggregated_data
GROUP BY
   domain_name,
   year
```
```response
┌─year─┬─domain_name────┬─sum(sumCountViews)─┐
│ 2019 │ clickhouse.com │                  6 │
│ 2020 │ clickhouse.com │                  6 │
└──────┴────────────────┴────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```
