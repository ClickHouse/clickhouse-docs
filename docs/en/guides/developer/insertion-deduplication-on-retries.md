---
slug: /en/guides/developer/insertion-deduplication-on-retries
sidebar_label: Insertion deduplication on retries
sidebar_position: 0
description: On retries inderted data is deduplicated.
---

# What is deduplication on insertion retries?
Some times the result of insert operation is uncertain. For example the case when user gets timeout error. The inserted data could actually be inserted to the destination or not inserted.
Such failed operations should be retried by the user. When a user retries that operations Clickhouse tries to determine if the inserted data has been succesfuly inserted already or not. If that inserted data is marked as duplication then Clickhouse would not insert it to the destination table and user would recieve successful status of operation as if the data has been inserted.

# How enable or disable deduplication of insertion?
Only the enginges from the family of engines `*MergeTree` support the deduplication on insertion.
For engines from `*ReplicatedMergeTree` engine family deduplication is controlled by the settings: `replicated_deduplication_window` and `replicated_deduplication_window_seconds`.
For non-replicated engine family `*MergeTree` deduplication is controlled by the settings: `non_replicated_deduplication_window`.
These settings determine parameters of deduplication log for the table. Deduplication log stores finite amount of `block_id`'s. That set of `block_id`'s determines how deduplication works.
The profile setting `insert_deduplicate` controls deduplication on the query level. Note: all the data which is inserted with `insert_deduplicate=0` would not be deduplicated with the following insertion retry with `insert_deduplicate=1`. There is two reasons for that. First -- there are no `block_id`'s writted for the blocks from the insertion with the settions `insert_deduplicate=0`. Second -- user has to perform retries with the same settins as original operation.

# How insertion deduplication works?
When some data is inserted to the Clickhouse, it is split by rows count and bytes count to the sequence of the blocks. For each such block `*MergeTree` engine calculates hash from the data in that block. That hash is called `block_id` and it is used as a unique key for that operation. That approach works just well enough for the most cases assuming that different insertions contain different data. Othervise you need to use insertion setting `insert_deduplication_token`. That setting gives you precise control over deduplication process. Insertions only with equal `insert_deduplication_token` is deduplicated with each other.

Each time that data is inserted to the destination table, `block_id` is written to the deduplication log. For each insertion the condition is checked that there is no such `block_id` in deduplication log. If `block_id` is found in deduplication log, than the block is considered as duplicate. Note that Deduplication log stores finite count of `block_id`'s. Only insertions which meet the deduplication log window parameters have chances to be deduplicated.

For `INSERT VALUES` queries splitting the inserted data to the block is deterministic and it is determined by settings. Therefore user should retry insertions with the same settings values as they were at first operation.

For `INSERT SELECT` queries it is important that `SELECT` part of the query returns the same data in the same order each try. That is hard to achive in practical usage for many reasons. In order to achieve the stable data order on retries you could define precise `ORDER BY` section in `SELECT` part of the query. But the selected table could be updated between retries therefore the result data could change. Also there are could be a lot of data as a result a lot of blocks after sptitting inserted data by rows count and bytes count. That count of blocks might overflow deduplication log window.


# How insertion deduplication works with materialized views?
When a table has one or several materialized views, the inserted data is also inserted to the destination of that views with some defined transformation.
That transformed data also has to be deduplicated on retries. Clickhouse deduplicates it in the same way it deduplicates data which is inserted into target table.
User could control that process with settings on the table under materialized view: `replicated_deduplication_window`, `replicated_deduplication_window_seconds` and `non_replicated_deduplication_window`. Also user could use profile setting `deduplicate_blocks_in_dependent_materialized_views`.
For the blocks inserted in tables under materialized views Clickhouse calculates `block_id` as hash from a string which contains concatenation of `block_id`'s for the the source table and other parts which helps to distinguish blocks after materialised views transformation, like source view's id and the sequential number of that block. That makes deduplication for materialised views working correctly by distinguishing the data by its original inserted data, no matter how it has been transformed on its way to the destination table under materialized view.

# Examples

## Indentical blocks after materialised view's transformation

Indentical blocks, which have been generated during transformation inside materialized view, are not deduplicated because they are based on the different inserted data.
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

Such settings allow to select from table with series of blocks with only 1 row inside. Also such small blocks are not squashed after that, they remains small until they are inserted to table.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

We need to enable deduplication in materialized view.

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

Here we see that 2 parts have been inserted into the dst table. 2 blocks from select -- 2 parts on insert. That parts contains different data inside.

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER by all;
```

Here we see that 2 parts have been inserted into the mv_dst table. That parts contain the same data, however they are not deduplicated.

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

Here we see that when we retry that insertion, all data is deduplicated. It works for dst table and it works for mv_dst as well.

```sql
DROP TABLE dst;
DROP TABLE mv_dst;
```

## Indentical blocks in insertion

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

With that settings we have two block from select as a resuld there is two blocks for insertion into table `dst`. We see that only one block has bee inserted into table `dst`. That has happened because the second block has been deduplicated. Tt has the same data and the key for deduplication `block_id` which is calulated as a hash from the inserted data. This behaviour is not what was expected. Such case is very rare in real useceses, but theoretically is possible. In order to handle such cases correctly user has to provide `insert_deduplication_token`. Lest fix this example at the following example.

## Indentical blocks in insertion with `insert_deduplication_token`

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
select 'first attempt';

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

Two indentical blocks has been inserted as expected.

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

That insertion is aslo deduplicated in spite of differ inserted data. Be aware that `insert_deduplication_token` has higher proiritet here, Clickhouse do not use hash summ from data when `insert_deduplication_token` is provided.

## Different insert operations generate the same data after transformation in underlied table of materialized view.

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

We insert different data each time. However the same data is inserted to the `mv_dst` table. That data is not deduplicated because source data was different.

## Different materialized view insert into one underlayed table equal data.

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

Two equal blocks inserted to the table `mv_dst`. That is what was expected.

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
