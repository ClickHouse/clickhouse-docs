---
slug: /en/guides/developer/deduplicating-inserts-on-retries
title: Deduplicating Inserts on Retries
description: Preventing duplicate data when retrying insert operations
keywords: [deduplication, deduplicate, insert retries, inserts]
---

Insert operations can sometimes fail due to errors such as timeouts. When inserts fail, data may or may not have been successfully inserted. This guide covers how to enable deduplication on insert retries such that the same data does not get inserted more than once.

When an insert is retried, ClickHouse tries to determine whether the data has already been successfully inserted. If the inserted data is marked as a duplicate, ClickHouse does not insert it into the destination table. However, the user will still receive a successful operation status as if the data had been inserted normally.

## Enabling insert deduplication on retries

### Insert deduplication for tables

**Only `*MergeTree` engines support deduplication on insertion.**

For `*ReplicatedMergeTree` engines, insert deduplication is enabled by default and is controlled by the `replicated_deduplication_window` and `replicated_deduplication_window_seconds` settings. For non-replicated `*MergeTree` engines, deduplication is controlled by the `non_replicated_deduplication_window` setting.

The settings above determine the parameters of the deduplication log for a table. The deduplication log stores a finite number of `block_id`s, which determine how deduplication works (see below).

### Query-level insert deduplication

The setting `insert_deduplicate=1` enables deduplication at the query level. Note that if you insert data with `insert_deduplicate=0`, that data cannot be deduplicated even if you retry an insert with `insert_deduplicate=1`. This is because the `block_id`s are not written for blocks during inserts with `insert_deduplicate=0`.

## How insert deduplication works

When data is inserted into ClickHouse, it is split data into blocks based on the number of rows and bytes.

For tables using `*MergeTree` engines, each block is assigned a unique `block_id`, which is a hash of the data in that block. This `block_id` is used as a unique key for the insert operation. If the same `block_id` is found in the deduplication log, the block is considered a duplicate and is not inserted into the table.

This approach works well for cases where inserts contain different data. However, if the same data is inserted multiple times intentionally, you need to use the `insert_deduplication_token` setting to control the deduplication process. This setting allows you to specify a unique token for each insert, which ClickHouse uses to determine whether the data is a duplicate.

For `INSERT ... VALUES` queries, splitting the inserted data into blocks is deterministic and is determined by settings. Therefore, users should retry insertions with the same settings values as the initial operation.

For `INSERT ... SELECT` queries, it is important that the `SELECT` part of the query returns the same data in the same order for each operation. Note that this is hard to achieve in practical usage. To ensure stable data order on retries, define a precise `ORDER BY` section in the `SELECT` part of the query. Keep in mind that it is possible that the selected table could be updated between retries: the result data could have changed and deduplication will not occur. Additionally, in situations where you are inserting large amounts of data, it is possible that the number of blocks after inserts can overflow the deduplication log window, and ClickHouse won't know to deduplicate the blocks.

## Insert deduplication with materialized views

When a table has one or more materialized views, the inserted data is also inserted into the destination of those views with the defined transformations. The transformed data is also deduplicated on retries. ClickHouse performs deduplications for materialized views in the same way it deduplicates data inserted into the target table.

You can control this process using the following settings for the source table:
- `replicated_deduplication_window`
- `replicated_deduplication_window_seconds`
- `non_replicated_deduplication_window`

You can also use the user profile setting `deduplicate_blocks_in_dependent_materialized_views`.

When inserting blocks into tables under materialized views, ClickHouse calculates the `block_id` by hashing a string that combines the `block_id`s from the source table and additional identifiers. This ensures accurate deduplication within materialized views, allowing data to be distinguished based on its original insertion, regardless of any transformations applied before reaching the destination table under the materialized view.

## Examples

### Identical blocks after materialized view transformations

Identical blocks, which have been generated during transformation inside a materialized view, are not deduplicated because they are based on different inserted data.

Here is an example:

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;
```

```sql
SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

The settings above allow us to select from a table with a series of blocks containing only one row. These small blocks are not squashed and remain the same until they are inserted into a table.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

We need to enable deduplication in materialized view:

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;
```

Here we see that two parts have been inserted into the `dst` table. 2 blocks from select -- 2 parts on insert. The parts contains different data.

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER by all;
```

Here we see that 2 parts have been inserted into the `mv_dst` table. That parts contain the same data, however they are not deduplicated.

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;

SELECT
    *,
    _part
FROM mv_dst
ORDER by all;
```

Here we see that when we retry the inserts, all data is deduplicated. Deduplication works for both the `dst` and `mv_dst` tables.

## Identical blocks on insertion

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;


SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Insertion:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2);

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;
```

With the settings  above, two blocks result from select– as a result, there should be two blocks for insertion into table `dst`. However, we see that only one block has been inserted into table `dst`. This occurred because second block has been deduplicated. It has the same data and the key for deduplication `block_id` which is calculated as a hash from the inserted data. This behaviour is not what was expected. Such cases are a rare occurence, but theoretically is possible. In order to handle such cases correctly, the user has to provide a `insert_deduplication_token`. Let's fix this with the following examples:

## Identical blocks in insertion with `insert_deduplication_token`

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Insertion:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;
```

Two identical blocks have been inserted as expected.

```sql
select 'second attempt';

INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;
```

Retried insertion is deduplicated as expected.

```sql
select 'third attempt';

INSERT INTO dst SELECT
    1 AS key,
    'b' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;
```

That insertion is also deduplicated even though it contains different inserted data. Note that `insert_deduplication_token` has higher priority: ClickHouse does not use the hash sum of data when `insert_deduplication_token` is provided.

## Different insert operations generate the same data after transformation in the underlying table of the materialized view

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

select 'second attempt';

INSERT INTO dst VALUES (2, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;
```

We insert different data each time. However, the same data is inserted into the `mv_dst` table. Data is not deduplicated because the source data was different.

## Different materialized view inserts into one underlying table with equivelant data

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE TABLE mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_first
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

CREATE MATERIALIZED VIEW mv_second
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;
```

Two equal blocks inserted to the table `mv_dst` (as expected).

```sql
select 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;
```

That retry operation is deduplicated on both tables `dst` and `mv_dst`.
