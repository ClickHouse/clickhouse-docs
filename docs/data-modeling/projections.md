---
slug: /data-modeling/projections
title: 'Projections'
description: 'Page describing what projections are, how they can be used to improve
query performance, and how they differ from materialized views.'
keywords: ['projection', 'projections', 'query optimization']
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# Projections

## Introduction {#introduction}

ClickHouse offers various mechanisms of speeding up analytical queries on large
amounts of data for real-time scenarios. One such mechanism to speed up your
queries is through the use of so-called _Projections_. Projections help optimize
queries by creating a subset of data that contains only attributes of interest,
at the exclusion of others. 

## How do Projections work? {#how-do-projections-work}

Practically, a Projection can be thought of as an additional, hidden table to the
original table. The projection can have a different row order, and therefore a 
different primary index, to that of the original table and it can automatically 
and incrementally pre-compute aggregate values. As a result, using Projections 
helps to tune the first two of three "tuning knobs" that you have control over 
for speeding up query execution:
- **Properly utilizing primary indexes**
- **Pre-computing aggregates**
- Increasing the level of parallelism used inside the ClickHouse query processing
  engine.

Projections are in some ways similar to [Materialized Views](/materialized-views)
, which also allow you to have multiple row orders and incremental aggregation. 
Unlike Materialized Views, however, Projections are automatically updated and 
kept in-sync with the original table. When a query targets the original table, 
ClickHouse automatically samples the primary keys and chooses a table that can 
generate the same correct result, but requires the least amount of data to be 
read as shown in the figure below:

<Image img={projections_1} size="lg" alt="Projections in ClickHouse"/>

## Examples {#examples}

### Filtering on columns which aren't in the primary key {#filtering-without-using-primary-keys}

In this example, we'll show you how to add a projection to a table.
We'll also look at how the projection can be used to speed up queries which filter
on columns which are not in the primary key of a table.

For this example, we'll be using a subset of the [New York Taxi Data](/getting-started/example-datasets/nyc-taxi)
dataset. Go ahead and create the table noting that data is sorted on disk by
`pickup_datetime` and `dropoff_datetime`:

```sql
CREATE TABLE trips(
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
--highlight-next-line
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

Next we'll insert 10% of the data into the table from an S3 bucket:

```sql
INSERT INTO trips SELECT
  trip_id,
  pickup_datetime,
  dropoff_datetime,
  pickup_longitude,
  pickup_latitude,
  dropoff_longitude,
  dropoff_latitude,
  passenger_count,
  trip_distance,
  fare_amount,
  extra,
  tip_amount,
  tolls_amount,
  total_amount,
  payment_type,
  pickup_ntaname,
  dropoff_ntaname
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz', 'TabSeparatedWithNames')
```

Let's write a simple query to find all of the trip IDs for which passengers 
tipped their driver greater than $200:

```sql
SELECT 
    tip_amount,
    trip_id,
    dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0
```

```sql
   ┌─tip_amount─┬────trip_id─┬─trip_duration_min─┐
1. │     233.25 │ 1211709305 │                18 │
2. │     222.88 │ 1203166979 │                41 │
3. │        215 │ 1211976534 │                16 │
   └────────────┴────────────┴───────────────────┘

3 rows in set. Elapsed: 0.009 sec. 
--highlight-next-line
Processed 3.00 million rows, 
12.12 MB (328.04 million rows/s., 1.33 GB/s.)
Peak memory usage: 161.34 KiB.
```

Notice that because we are filtering on `tip_amount` which is not in the primary
key ClickHouse had to do a full table scan of all 3 million rows. Although the 
query took only 0.009 seconds to return the result, we are using only 10% of data
in the dataset. It's therefore plausible that running this query on the full 
dataset could take as long as 9 seconds. Let's improve this.

To add a projection we use the `ALTER TABLE` statement together with the `ADD PROJECTION`
statement:

```sql
ALTER TABLE trips
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

It is necessary after adding a projection to use the `MATERIALIZE PROJECTION` 
statement so that the data in it is physically recalculated and ordered according
to the specified query above:

```sql
ALTER TABLE trips MATERIALIZE PROJECTION prj_tip_amount
```

Let's run the query again now that we've added the projection:

```sql
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0
```

```sql
Query id: db460660-c1e7-4f57-87e4-40bd46a9d052

   ┌─tip_amount─┬────trip_id─┬─trip_duration_min─┐
1. │        215 │ 1211976534 │                16 │
2. │     222.88 │ 1203166979 │                41 │
3. │     233.25 │ 1211709305 │                18 │
   └────────────┴────────────┴───────────────────┘

3 rows in set. Elapsed: 0.005 sec.
--highlight-next-line
Processed 10.97 thousand rows,
175.55 KB (2.20 million rows/s., 35.13 MB/s.)
Peak memory usage: 58.08 KiB.
```

Notice how we were able to decrease the query time from 0.009 seconds to 0.005
seconds and we scanned only 10.97 thousand rows instead of 3 million.

We can confirm that our query above did indeed use the projection we made by
querying the `system.query_log` table:

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='db460660-c1e7-4f57-87e4-40bd46a9d052'
```

```response
   ┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
1. │ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
   │↳  tip_amount,                                                                ↴│                                  │
   │↳  trip_id,                                                                   ↴│                                  │
   │↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
   │↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
   └───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### Using projections to speed up UK price paid queries {#using-projections-to-speed-up-UK-price-paid}

To demonstrate how Projections can be used to speed up query performance, let's
take a look at an example using a real life dataset. For this example we'll be 
using the table from our [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
tutorial with 30.03 million rows. This dataset is also available within our 
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
environment.

If you've not done so already, run the queries below to create the table and 
insert the data.

<details>
<summary>Create and insert data</summary>
```sql title="Create Table"
CREATE TABLE uk_price_paid
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

```sql title="Preprocess and insert the data"
INSERT INTO uk_price_paid
WITH
   splitByChar(' ', postcode) AS p
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    p[1] AS postcode1,
    p[2] AS postcode2,
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
    'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
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
</details>

We can run a simple query on this dataset that lists the counties in London which
have the highest prices paid:

```sql
SELECT
  county,
  price
FROM uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```response
   ┌─county─────────┬─────price─┐
1. │ GREATER LONDON │ 594300000 │
2. │ GREATER LONDON │ 569200000 │
3. │ GREATER LONDON │ 542540820 │
   └────────────────┴───────────┘
// highlight-next-line
3 rows in set. Elapsed: 0.028 sec. Processed 30.03 million rows, 72.71 MB (1.06 billion rows/s., 2.57 GB/s.)
Peak memory usage: 719.45 KiB.
```

Notice above how a full table scan of all 30.03 million rows occurred, due to 
the fact that `town` was not one of the keys in our ORDER BY statement when we
created the table:

```sql
CREATE TABLE uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

For the original example table `uk_price_paid`, we will create (and populate) two
projections.

Let's see if we can speed this query up using Projections. To keep things tidy 
and simple in our playground, we first duplicate the table `uk_price_paid` as 
`uk_price_paid_with_projections`:

```sql
CREATE TABLE uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk_price_paid_with_projections SELECT * FROM uk_price_paid;
```

We create and populate projection `prj_oby_town_price` which produces an 
additional (hidden) table with a primary index, ordering by town and price, to 
optimize the query that lists the counties in a specific town for the highest 
paid prices:

```sql
ALTER TABLE uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```
```sql
ALTER TABLE uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

The [`mutations_sync`](/operations/settings/settings#mutations_sync) setting is
used to force synchronous execution.

We create and populate projection prj_gby_county – an additional (hidden) table
that incrementally pre-computes the avg(price) aggregate values for all existing
130 UK counties:

```sql
ALTER TABLE uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_gby_county)
SETTINGS mutations_sync = 1
```

:::note
If there is a `GROUP BY` clause used in a projection like in the `prj_gby_county`
projection above, then the underlying storage engine for the (hidden) table 
becomes `AggregatingMergeTree`, and all aggregate functions are converted to 
`AggregateFunction`. This ensures proper incremental data aggregation.
:::

The figure below is a visualization of the main table `uk_price_paid_with_projections`
and its two projections:

<Image img={projections_2} size="lg" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

If we now run the query that lists the counties in London for the three highest 
paid prices again, we see a dramatic difference in performance, from 0.028 sec 
down to 0.012 sec:

```sql title="Query (with projections)"
SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
```
```sql
Query id: dd2cb0ff-7082-4b71-a03c-9260d470a302 -- Note: this will be different for each user

↘ Progress: 2.29 million rows, 16.06 MB (188.06 million rows/s., 1.32 GB/s.)  99↓ Progress: 2.29 million rows, 16.06 MB (188.06 million rows/s., 1.32 GB/s.)  99
   ┌─county─────────┬─────price─┐
1. │ GREATER LONDON │ 594300000 │
2. │ GREATER LONDON │ 569200000 │
3. │ GREATER LONDON │ 542540820 │
   └────────────────┴───────────┘

3 rows in set. Elapsed: 0.012 sec. Processed 2.29 million rows, 16.06 MB (186.83 million rows/s., 1.31 GB/s.)
Peak memory usage: 193.73 KiB.
```

Likewise, for the query that lists the U.K. counties with the three highest 
average paid prices:

```sql
SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
SETTINGS log_queries=1
```

```response
Query id: 7efd131f-5091-4124-89b2-2505d31ca465

   ┌─county─────────────────┬────────avg(price)─┐
1. │ GREATER LONDON         │ 427152.7303796859 │
2. │ WINDSOR AND MAIDENHEAD │ 423806.3374685812 │
3. │ WEST NORTHAMPTONSHIRE  │ 414738.3185798591 │
   └────────────────────────┴───────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

Note that both queries target the original table, and that both queries resulted
in a full table scan (all 30.03 million rows got streamed from disk) before we 
created the two projections.

Also, note that the query that lists the counties in London for the three highest
paid prices is streaming 2.17 million rows. When we directly used a second table
optimized for this query, only 81.92 thousand rows were streamed from disk.

The reason for the difference is that currently, the `optimize_read_in_order` 
optimization mentioned above isn’t supported for projections.

We inspect the `system.query_log` table in order to see that ClickHouse 
automatically used the two projections for the two queries above (see the 
projections column below):

```sql
HELLO
```

## When to use Projections? {#when-to-use-projections}

Projections are an appealing feature for new users as they are automatically 
maintained as data is inserted. Furthermore, queries can just be sent to a 
single table where the projections are exploited where possible to speed up 
the response time.

This is in contrast to Materialized Views, where the user has to select the 
appropriate optimized target table or rewrite their query, depending on the 
filters. This places greater emphasis on user applications and increases 
client-side complexity.

Despite these advantages, projections come with some inherent limitations which
users should be aware of and thus should be deployed sparingly.

- Projections don't allow using different TTL for the source table and the 
  (hidden) target table, materialized views allow different TTLs.
- Projections don't currently support `optimize_read_in_order` for the (hidden) 
  target table.
- Lightweight updates and deletes are not supported for tables with projections.
- Materialized Views can be chained: the target table of one Materialized View 
  can be the source table of another Materialized View, and so on. This is not 
  possible with projections.
- Projections don't support joins, but Materialized Views do.
- Projections don't support filters (`WHERE` clause), but Materialized Views do.

We recommend using projections when:

- A complete re-ordering of the data is required. While the expression in the 
  projection can, in theory, use a `GROUP BY,` materialized views are more 
  effective for maintaining aggregates. The query optimizer is also more likely
  to exploit projections that use a simple reordering, i.e., `SELECT * ORDER BY x`.
  Users can select a subset of columns in this expression to reduce storage 
  footprint.
- Users are comfortable with the associated increase in storage footprint and 
  overhead of writing data twice. Test the impact on insertion speed and 
  [evaluate the storage overhead](/data-compression/compression-in-clickhouse).

## Related content {#related-content}
- [A Practical Introduction to Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Materialized Views](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
