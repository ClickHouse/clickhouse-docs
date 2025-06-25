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
queries is through the use of _Projections_. Projections help optimize
queries by creating a reordering of data by attributes of interest. This can be:

1. A complete reordering
2. A subset of the original table with a different order
3. A precomputed aggregation (similar to a Materialized View) but with an ordering
   aligned to the aggregation.

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## How do Projections work? {#how-do-projections-work}

Practically, a Projection can be thought of as an additional, hidden table to the
original table. The projection can have a different row order, and therefore a 
different primary index, to that of the original table and it can automatically 
and incrementally pre-compute aggregate values. As a result, using Projections 
provide two "tuning knobs" for speeding up query execution:

- **Properly using primary indexes**
- **Pre-computing aggregates**

Projections are in some ways similar to [Materialized Views](/materialized-views)
, which also allow you to have multiple row orders and pre-compute aggregations
at insert time. 
Projections are automatically updated and 
kept in-sync with the original table, unlike Materialized Views, which are
explicitly updated. When a query targets the original table, 
ClickHouse automatically samples the primary keys and chooses a table that can 
generate the same correct result, but requires the least amount of data to be 
read as shown in the figure below:

<Image img={projections_1} size="lg" alt="Projections in ClickHouse"/>

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

## Examples {#examples}

### Filtering on columns which aren't in the primary key {#filtering-without-using-primary-keys}

In this example, we'll show you how to add a projection to a table.
We'll also look at how the projection can be used to speed up queries which filter
on columns which are not in the primary key of a table.

For this example, we'll be using the New York Taxi Data
dataset available at [sql.clickhouse.com](https://sql.clickhouse.com/) which is ordered 
by `pickup_datetime`.

Let's write a simple query to find all the trip IDs for which passengers 
tipped their driver greater than $200:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice that because we are filtering on `tip_amount` which is not in the `ORDER BY`, ClickHouse 
had to do a full table scan. Let's speed this query up.

So as to preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

To add a projection we use the `ALTER TABLE` statement together with the `ADD PROJECTION`
statement:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

It is necessary after adding a projection to use the `MATERIALIZE PROJECTION` 
statement so that the data in it is physically ordered and rewritten according
to the specified query above:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Let's run the query again now that we've added the projection:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice how we were able to decrease the query time substantially, and needed to scan
less rows.

We can confirm that our query above did indeed use the projection we made by
querying the `system.query_log` table:

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='<query_id>'
```

```response
   ┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
   │ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
   │↳  tip_amount,                                                                ↴│                                  │
   │↳  trip_id,                                                                   ↴│                                  │
   │↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
   │↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
   └───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### Using projections to speed up UK price paid queries {#using-projections-to-speed-up-UK-price-paid}

To demonstrate how projections can be used to speed up query performance, let's
take a look at an example using a real life dataset. For this example we'll be 
using the table from our [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
tutorial with 30.03 million rows. This dataset is also available within our 
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
environment.

If you would like to see how the table was created and data inserted, you can
refer to ["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)
page.

We can run two simple queries on this dataset. The first lists the counties in London which
have the highest prices paid, and the second calculates the average price for the counties:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Notice that despite being very fast how a full table scan of all 30.03 million rows occurred for both queries, due 
to the fact that neither `town` nor `price` were in our `ORDER BY` statement when we
created the table:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Let's see if we can speed this query up using projections.

To preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

We create and populate projection `prj_oby_town_price` which produces an 
additional (hidden) table with a primary index, ordering by town and price, to 
optimize the query that lists the counties in a specific town for the highest 
paid prices:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

The [`mutations_sync`](/operations/settings/settings#mutations_sync) setting is
used to force synchronous execution.

We create and populate projection `prj_gby_county` – an additional (hidden) table
that incrementally pre-computes the avg(price) aggregate values for all existing
130 UK counties:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk.uk_price_paid_with_projections
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
paid prices again, we see an improvement in query performance:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Likewise, for the query that lists the U.K. counties with the three highest 
average-paid prices:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Note that both queries target the original table, and that both queries resulted
in a full table scan (all 30.03 million rows got streamed from disk) before we 
created the two projections.

Also, note that the query that lists the counties in London for the three highest
paid prices is streaming 2.17 million rows. When we directly used a second table
optimized for this query, only 81.92 thousand rows were streamed from disk.

The reason for the difference is that currently, the `optimize_read_in_order` 
optimization mentioned above isn't supported for projections.

We inspect the `system.query_log` table to see that ClickHouse 
automatically used the two projections for the two queries above (see the 
projections column below):

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' ms' AS query_duration,
        formatReadableQuantity(read_rows) AS read_rows,
  projections
FROM clusterAllReplicas(default, system.query_log)
WHERE (type = 'QueryFinish') AND (tables = ['default.uk_price_paid_with_projections'])
ORDER BY initial_query_start_time DESC
  LIMIT 2
FORMAT Vertical
```

```response
Row 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 ms
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

Row 2:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
query_duration: 11 ms
read_rows:      2.29 million
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2 rows in set. Elapsed: 0.006 sec.
```

### Further examples {#further-examples}

The following examples use the same UK price dataset, contrasting queries with and without projections.

In order to preserve our original table (and performance), we again create a copy of the table using `CREATE AS` and `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

Let's create an aggregate projection by the dimensions `toYear(date)`, `district`, and `town`:

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

Populate the projection for existing data. (Without materializing it, the projection will be created for only newly inserted data):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

The following queries contrast performance with and without projections. To disable projection use we use the setting [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), which is enabled by default.

#### Query 1. Average price per year {#average-price-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC

```
The results should be the same, but the performance better on the latter example!


#### Query 2. Average price per year in London {#average-price-london-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```


```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

#### Query 3. The most expensive neighborhoods {#most-expensive-neighborhoods-projections}

The condition (date >= '2020-01-01') needs to be modified so that it matches the projection dimension (`toYear(date) >= 2020)`:

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

Again, the result is the same but notice the improvement in query performance for the 2nd query.


## Related content {#related-content}
- [A Practical Introduction to Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Materialized Views](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
