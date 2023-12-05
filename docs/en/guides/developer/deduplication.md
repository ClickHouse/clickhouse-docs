---
slug: /en/guides/developer/deduplication
sidebar_label: Deduplication Strategies
sidebar_position: 3
description: Use deduplication when you need to perform frequent upserts, updates and deletes.
---

# Deduplication Strategies

**Deduplication** refers to the process of ***removing duplicate rows of a dataset***. In an OLTP database, this is done easily because each row has a unique primary key-but at the cost of slower inserts. Every inserted row needs to first be searched for and, if found, needs to be replaced.

ClickHouse is built for speed when it comes to data insertion. The storage files are immutable and ClickHouse does not check for an existing primary key before inserting a row-so deduplication involves a bit more effort. This also means that deduplication is not immediate-it is **eventual**, which has a few side effects:

- At any moment in time your table can still have duplicates (rows with the same sorting key)
- The actual removal of duplicate rows occurs during the merging of parts
- Your queries need to allow for the possibility of duplicates

<div class='transparent-table'>

|||
|------|----|
|<img src={require('./images/Deduplication.png').default} class="image" alt="Cassandra logo" style={{width: '16rem', 'background-color': 'transparent'}}/>|ClickHouse provides free training on deduplication and many other topics.  The [Deduplication training course](https://learn.clickhouse.com/visitor_catalog_class/show/1050521/?utm_source=clickhouse&utm_medium=docs) is a good place to start.|

</div>

## Options for deduplication

Deduplication is implemented in ClickHouse using the following table engines:

1. `ReplacingMergeTree` table engine: with this table engine, duplicate rows with the same sorting key are removed during merges. `ReplacingMergeTree` is a good option for emulating upsert behavior (where you want queries to return the last row inserted).

2. Collapsing rows: the `CollapsingMergeTree` and `VersionedCollapsingMergeTree` table engines use a logic where an existing row is "canceled" and a new row is inserted. They are more complex to implement than `ReplacingMergeTree`, but your queries and aggregations can be simpler to write without worrying about whether or not data has been merged yet. These two table engines are useful when you need to update data frequently.

We walk through both of these techniques below. For more details, check out our free on-demand [Deduplication training course](https://learn.clickhouse.com/visitor_catalog_class/show/1050521/).

## Using ReplacingMergeTree for Upserts

Let's look at a simple example where a table contains Hacker News comments with a views column representing the number of times a comment was viewed. Suppose we insert a new row when an article is published and upsert a new row once a day with the total number of views if the value increases:

```sql
CREATE TABLE hackernews_rmt (
    id UInt32,
    author String,
    comment String,
    views UInt64
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (author, id)
```

Let's insert two rows:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

To update the `views` column, insert a new row with the same primary key (notice the new values of the `views` column):

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

The table now has 4 rows:

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

The separate boxes above in the output demonstrate the two parts behind-the-scenes - this data has not been merged yet, so the duplicate rows have not been removed yet. Let's use the `FINAL` keyword in the `SELECT` query, which results in a logical merging of the query result:

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

The result only has 2 rows, and the last row inserted is the row that gets returned.

:::note
Using `FINAL` works OK if you have a small amount of data. If you are dealing with a large amount of data, using `FINAL` is probably not the best option. Let's discuss a better option for finding the latest value of a column…
:::

### Avoiding FINAL

Let's update the `views` column again for both unique rows:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

The table has 6 rows now, because an actual merge hasn't happened yet (only the query-time merge when we used `FINAL`).

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   250 │
│  1 │ ricardo │ This is post #1 │   150 │
└────┴─────────┴─────────────────┴───────┘
```


Instead of using `FINAL`, let's use some business logic - we know that the `views` column is always increasing, so we can select the row with the largest value using the `max` function after grouping by the desired columns:

```sql
SELECT
    id,
    author,
    comment,
    max(views)
FROM hackernews_rmt
GROUP BY (id, author, comment)
```

```response
┌─id─┬─author──┬─comment─────────┬─max(views)─┐
│  2 │ ch_fan  │ This is post #2 │        250 │
│  1 │ ricardo │ This is post #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

Grouping as shown in the query above can actually be more efficient (in terms of query performance) than using the `FINAL` keyword. The `FINAL` keyword forces a query to run in a single thread, while `GROUP BY` executes in parallel.

Our [Deduplication training course](https://learn.clickhouse.com/visitor_catalog_class/show/1050521/) expands on this example, including how to use a `version` column with `ReplacingMergeTree`.

## Using CollapsingMergeTree for Updating Columns Frequently

Updating a column involves deleting an existing row and replacing it with new values. As you have already seen, this type of mutation in ClickHouse happens _eventually_ - during merges. If you have a lot of rows to update, it can actually be more efficient to avoid `ALTER TABLE..UPDATE` and instead just insert the new data alongside the existing data. We could add a column that denotes whether or not the data is stale or new… and there is actually a table engine that already implements this behavior very nicely, especially considering that it deletes the stale data automatically for you. Let's see how it works.

Suppose we track the number of views that a Hacker News comment has using an external system and every few hours, we push the data into ClickHouse. We want the old rows deleted and the new rows to represent the new state of each Hacker News comment. We can use a `CollapsingMergeTree` to implement this behavior.

Let's define a table to store the number of views:

```sql
CREATE TABLE hackernews_views (
    id UInt32,
    author String,
    views UInt64,
    sign Int8
)
ENGINE = CollapsingMergeTree(sign)
PRIMARY KEY (id, author)
```

Notice the `hackernews_views` table has an `Int8` column named sign which is referred to as the **sign** column. The name of the sign column is arbitrary, but the `Int8` data type is required, and notice the column name was passed in to the constructor of the `CollapsingMergeTree` table.

What is the sign column of a `CollapsingMergeTree` table? It represents the _state_ of the row, and the sign column can only be 1 or -1. Here is how it works:

- If two rows have the same primary key (or sort order if that is different than the primary key), but different values of the sign column, then the last row inserted with a +1 becomes the state row and the other rows cancel each other
- Rows that cancel each other out are deleted during merges
- Rows that do not have a matching pair are kept

Let's add a row to the `hackernews_views` table. Since it is the only row for this primary key, we set its state to 1:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

Now suppose we want to change the views column. You insert two rows: one that cancels the existing row, and one that contains the new state of the row:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

The table now has 3 rows with the primary key (123, 'ricardo'):

```sql
SELECT *
FROM hackernews_views
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │   -1 │
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │    1 │
└─────┴─────────┴───────┴──────┘
```

Notice adding `FINAL` returns the current state row:

```sql
SELECT *
FROM hackernews_views
FINAL
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
```

But of course, using `FINAL` is not recommended for large tables.

:::note
The value passed in for the `views` column in our example is not really needed, nor does it have to match the current value of `views` of the old row. In fact, you can cancel a row with just the primary key and a -1:

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## Real-time Updates from Multiple Threads

With a `CollapsingMergeTree` table, rows cancel each other using a sign column, and the state of a row is determined by the last row inserted. But this can be problematic if you are inserting rows from different threads where rows can be inserted out of order. Using the "last" row does not work in this situation.

This is where `VersionedCollapsingMergeTree` comes in handy - it collapses rows just like `CollapsingMergeTree`, but instead of keeping the last row inserted, it keeps the row with the highest value of a version column that you specify.

Let's look at an example. Suppose we want to track the number of views of our Hacker News comments, and the data is updated frequently. We want reporting to use the latest values without forcing or waiting for merges. We start with a table similar to `CollapsedMergeTree`, except we add a column to store the version of the state of the row:

```sql
CREATE TABLE hackernews_views_vcmt (
    id UInt32,
    author String,
    views UInt64,
    sign Int8,
    version UInt32
)
ENGINE = VersionedCollapsingMergeTree(sign, version)
PRIMARY KEY (id, author)
```

Notice the table uses `VersionsedCollapsingMergeTree` as the engine and passes in the **sign column** and a **version column**. Here is the table works:

- It deletes each pair of rows that have the same primary key and version and different sign
- The order that rows were inserted does not matter
- Note that if the version column is not a part of the primary key, ClickHouse adds it to the primary key implicitly as the last field

You use the same type of logic when writing queries - group by the primary key and use clever logic to avoid rows that have been canceled but not deleted yet. Let's add some rows to the `hackernews_views_vcmt` table:

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

Now we update two of the rows and delete one of them. To cancel a row, be sure to include the prior version number (since it is a part of the primary key):

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

We will run the same query as before that cleverly adds and subtracts values based on the sign column:

```sql
SELECT
    id,
    author,
    sum(views * sign)
FROM hackernews_views_vcmt
GROUP BY (id, author)
HAVING sum(sign) > 0
ORDER BY id ASC
```

The result is two rows:

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

Let's force a table merge:

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

There should only be two rows in the result:

```sql
SELECT *
FROM hackernews_views_vcmt
```

```response
┌─id─┬─author──┬─views─┬─sign─┬─version─┐
│  1 │ ricardo │    50 │    1 │       2 │
│  3 │ kenny   │  1000 │    1 │       2 │
└────┴─────────┴───────┴──────┴─────────┘
```

A `VersionedCollapsingMergeTree` table is quite handy when you want to implement deduplication while inserting rows from multiple clients and/or threads.

## Why aren’t my rows being deduplicated?

One reason inserted rows may not be deduplicated is if you are using a non-idempotent function or expression in your `INSERT` statement. For example, if you are inserting rows with the column `createdAt DateTime64(3) DEFAULT now()`, your rows are guaranteed to be unique because each row will have a unique default value for the `createdAt` column. The MergeTree / ReplicatedMergeTree table engine will not know to deduplicate the rows as each inserted row will generate a unique checksum.

In this case, you can specify your own `insert_deduplication_token` for each batch of rows to ensure that multiple inserts of the same batch will not result in the same rows being re-inserted. Please see the [documentation on `insert_deduplication_token`](/docs/en/operations/settings/settings#insert_deduplication_token) for more details about how to use this setting.

