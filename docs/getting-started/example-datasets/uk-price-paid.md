---
description: 'Learn how to use projections to improve the performance of queries that
  you run frequently using the UK property dataset, which contains data about prices
  paid for real-estate property in England and Wales'
sidebar_label: 'UK property prices'
slug: /getting-started/example-datasets/uk-price-paid
title: 'The UK property prices dataset'
doc_type: 'guide'
---

This data contains prices paid for real-estate property in England and Wales. The data is available since 1995, and the size of the dataset in uncompressed form is about 4 GiB (which will only take about 278 MiB in ClickHouse).

- Source: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- Description of the fields: https://www.gov.uk/guidance/about-the-price-paid-data
- Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

## Create the table {#create-table}

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

## Preprocess and insert the data {#preprocess-import-data}

We will use the `url` function to stream the data into ClickHouse. We need to preprocess some of the incoming data first, which includes:
- splitting the `postcode` to two different columns - `postcode1` and `postcode2`, which is better for storage and queries
- converting the `time` field to date as it only contains 00:00 time
- ignoring the [UUid](../../sql-reference/data-types/uuid.md) field because we don't need it for analysis
- transforming `type` and `duration` to more readable `Enum` fields using the [transform](../../sql-reference/functions/other-functions.md#transform) function
- transforming the `is_new` field from a single-character string (`Y`/`N`) to a [UInt8](/sql-reference/data-types/int-uint) field with 0 or 1
- drop the last two columns since they all have the same value (which is 0)

The `url` function streams the data from the web server into your ClickHouse table. The following command inserts 5 million rows into the `uk_price_paid` table:

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

Wait for the data to insert - it will take a minute or two depending on the network speed.

## Validate the data {#validate-data}

Let's verify it worked by seeing how many rows were inserted:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

At the time this query was run, the dataset had 27,450,499 rows. Let's see what the storage size is of the table in ClickHouse:

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

Notice the size of the table is just 221.43 MiB!

## Run some queries {#run-queries}

Let's run some queries to analyze the data:

### Query 1. Average price per year {#average-price}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80
)
FROM uk.uk_price_paid
GROUP BY year
ORDER BY year
```

### Query 2. average price per year in London {#average-price-london}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100
)
FROM uk.uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

Something happened to home prices in 2020! But that is probably not a surprise...

### Query 3. The most expensive neighborhoods {#most-expensive-neighborhoods}

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

## Speeding up queries with projections {#speeding-up-queries-with-projections}

We can speed up these queries with projections. See ["Projections"](/data-modeling/projections) for examples with this dataset.

### Test it in the playground {#playground}

The dataset is also available in the [Online Playground](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX).
