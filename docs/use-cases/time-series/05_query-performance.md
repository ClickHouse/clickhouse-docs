---
title: 'Query performance - Time-series'
sidebar_label: 'Query performance'
description: 'Improving time-series query performance'
slug: /use-cases/time-series/query-performance
keywords: ['time-series']
show_related_blogs: true
doc_type: 'guide'
---

# Time-series query performance

After optimizing storage, the next step is improving query performance. 
This section explores two key techniques: optimizing `ORDER BY` keys and using materialized views. 
We'll see how these approaches can reduce query times from seconds to milliseconds.

## Optimize ORDER BY keys {#time-series-optimize-order-by}

Before attempting other optimizations, you should optimize their ordering key to ensure ClickHouse produces the fastest possible results. 
Choosing the key right largely depends on the queries you're going to run. Suppose most of our queries filter by `project` and `subproject` columns. 
In this case, its a good idea to add them to the ordering key - as well as the time column since we query on time as well:

Let's create another version of the table that has the same column types as `wikistat`, but is ordered by `(project, subproject, time)`.

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

Let's now compare multiple queries to get an idea of how essential our ordering key expression is to performance. Note that we have haven't applied our previous data type and codec optimizations, so any query performance differences are only based on the sort order.

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>Query</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```       
            </td>
            <td style={{ textAlign: 'right' }}>2.381 sec</td>
            <td style={{ textAlign: 'right' }}>1.660 sec</td>
        </tr>

        <tr>
            <td>
```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.148 sec</td>
            <td style={{ textAlign: 'right' }}>0.058 sec</td>
        </tr>
      
        <tr>
            <td>
```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.192 sec</td>
            <td style={{ textAlign: 'right' }}>0.012 sec</td>
        </tr>

        <tr>
            <td>
```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.968 sec</td>
            <td style={{ textAlign: 'right' }}>0.010 sec</td>
        </tr>
      

    </tbody>
</table>

## Materialized views {#time-series-materialized-views}

Another option is to use materialized views to aggregate and store the results of popular queries. These results can be queried instead of the original table. Suppose the following query is executed quite often in our case:

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 2.285 sec. Processed 231.41 million rows, 9.22 GB (101.26 million rows/s., 4.03 GB/s.)
Peak memory usage: 1.50 GiB.
```

### Create materialized view  {#time-series-create-materialized-view}

We can create the following materialized view:

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### Backfilling destination table {#time-series-backfill-destination-table}

This destination table will only be populated when new records are inserted into the `wikistat` table, so we need to do some [backfilling](/docs/data-modeling/backfilling).

The easiest way to do this is using an [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) statement to insert directly into the materialized view's target table [using](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) the view's SELECT query (transformation) :

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

Depending on the cardinality of the raw data set (we have 1 billion rows!), this can be a memory-intensive approach. Alternatively, you can use a variant that requires minimal memory:

* Creating a temporary table with a Null table engine
* Connecting a copy of the normally used materialized view to that temporary table
* Using an INSERT INTO SELECT query, copying all data from the raw data set into that temporary table
* Dropping the temporary table and the temporary materialized view.

With that approach, rows from the raw data set are copied block-wise into the temporary table (which doesn't store any of these rows), and for each block of rows, a partial state is calculated and written to the target table, where these states are incrementally merged in the background.

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

Next, we'll create a materialized view to read from `wikistat_backfill` and write into `wikistat_top`

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

And then finally, we'll populate `wikistat_backfill` from the initial `wikistat` table:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

Once that query's finished, we can delete the backfill table and materialized view:

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

Now we can query the materialized view instead of the original table:

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 0.004 sec.
```

Our performance improvement here is dramatic. 
Before it took just over 2 seconds to compute the answer to this query and now it takes only 4 milliseconds.
