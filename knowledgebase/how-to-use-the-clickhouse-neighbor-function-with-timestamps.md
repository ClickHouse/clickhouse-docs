---
title: "How to use the ClickHouse neighbor function with timestamps"
---

## Question

- How do I use the neighbor function with datetimes?\
- Why does the neighbor function sometimes returns `1970-01-01 00:00:00` for a neighbor in a query?

## Answer

The neighbor function will return a row from the defined offset from a dataset block. The offset can be positive or negative with a range of Int64 datatype. If there is no record found at the offset in the block, it will return `0` which will translate into `1970-01-01 00:00:00` unless there is another optional default value defined.
Each subquery is considered its own block so a `UNION ALL` will return 0 for each subquery block where no record is found.

Example:

1. Create a test database:

```sql
create database db1;
```

1. Create a test table:

```sql
create table db1.table1_neighbor_function
(
 id Int32,
 timestamp_column DateTime
)
engine = MergeTree()
order by id;
```

1. Insert sample records:

```sql
insert into db1.table1_neighbor_function
values
(1, '2024-01-20 10:01:01'),
(2, '2024-01-20 01:01:01'),
(3, '2024-01-21 05:01:01'),
(4, '2024-01-20 09:01:01'),
(5, '2024-01-21 11:01:01'),
(6, '2024-01-20 12:01:01');
```

1. Run sample query using the neighbor function to retrieve the next record (offset 1) from the ordered by timestamp dataset:

```sql
SELECT
    id,
    timestamp_column,
    neighbor(timestamp_column, 1)
FROM db1.table1_neighbor_function
WHERE timestamp_column > '2024-01-20 01:00:00'
ORDER BY timestamp_column ASC
```

Result:

```response
Query id: ebd1e35e-9b10-4601-9c29-6303691039d1

┌─id─┬────timestamp_column─┬─neighbor(timestamp_column, 1)─┐
│  2 │ 2024-01-20 01:01:01 │           2024-01-20 09:01:01 │
│  4 │ 2024-01-20 09:01:01 │           2024-01-20 10:01:01 │
│  1 │ 2024-01-20 10:01:01 │           2024-01-20 12:01:01 │
│  6 │ 2024-01-20 12:01:01 │           2024-01-21 05:01:01 │
│  3 │ 2024-01-21 05:01:01 │           2024-01-21 11:01:01 │
│  5 │ 2024-01-21 11:01:01 │           1970-01-01 00:00:00 │
└────┴─────────────────────┴───────────────────────────────┘

6 rows in set. Elapsed: 0.002 sec.
```

:::note
That the last record's neighbor returned `1970-01-01 00:00:00` since there was no next record.
:::

1. Run sample query using subqueries:

```sql
SELECT
    B.DDATE,
    neighbor(DDATE, 1)
FROM
(
    SELECT DDATE
    FROM
    (
        SELECT timestamp_column AS DDATE
        FROM db1.table1_neighbor_function
        WHERE (timestamp_column >= '2024-01-20 01:00:00') AND (timestamp_column <= '2024-01-20 11:00:00')
        UNION ALL
        SELECT timestamp_column
        FROM db1.table1_neighbor_function
        WHERE (timestamp_column >= '2024-01-20 11:00:00') AND (timestamp_column <= '2024-01-21 12:00:00')
    ) AS A
    ORDER BY A.DDATE ASC
) AS B

```

Result:

```response
Query id: 4b09bcf5-bc9c-49e0-ad2b-67c1f72ac6b8

┌───────────────DDATE─┬──neighbor(DDATE, 1)─┐
│ 2024-01-20 01:01:01 │ 2024-01-20 09:01:01 │
│ 2024-01-20 09:01:01 │ 2024-01-20 10:01:01 │
│ 2024-01-20 10:01:01 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
┌───────────────DDATE─┬──neighbor(DDATE, 1)─┐
│ 2024-01-20 12:01:01 │ 2024-01-21 05:01:01 │
│ 2024-01-21 05:01:01 │ 2024-01-21 11:01:01 │
│ 2024-01-21 11:01:01 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘

6 rows in set. Elapsed: 0.007 sec.
```

:::note
The last record in each subquery has a neighbor of `1970-01-01 00:00:00` since each is it's own data block.
:::

### Block boundries

To make this process work at block boundaries, use the `lagInFrame()` or `leadInFrame()` window functions instead:

```sql
:) select number, lagInFrame(number, 1) over (rows 1 preceding) from numbers(10) settings max_block_size=3
```

This should return something like:

```response
┌─number─┬─lagInFrame(number, 1) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)─┐
│      0 │                                                                     0 │
│      1 │                                                                     0 │
│      2 │                                                                     1 │
└────────┴───────────────────────────────────────────────────────────────────────┘
┌─number─┬─lagInFrame(number, 1) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)─┐
│      3 │                                                                     2 │
│      4 │                                                                     3 │
│      5 │                                                                     4 │
└────────┴───────────────────────────────────────────────────────────────────────┘
┌─number─┬─lagInFrame(number, 1) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)─┐
│      6 │                                                                     5 │
│      7 │                                                                     6 │
│      8 │                                                                     7 │
└────────┴───────────────────────────────────────────────────────────────────────┘
┌─number─┬─lagInFrame(number, 1) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)─┐
│      9 │                                                                     8 │
└────────┴───────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.001 sec. 
```

Here is a longer example:

```plaintext
SELECT
    blockNumber(),
    rowNumberInBlock(),
    number,
    neighbor(number, -1),
    lagInFrame(number, 1) OVER w,
    neighbor(number, 1),
    leadInFrame(number, 1) OVER w,
    count() OVER w
FROM numbers(10)
WINDOW w AS (ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)
SETTINGS max_block_size = 3

Query id: b1530611-3594-4316-b2c1-d7f64506af4d

┌─blockNumber()─┬─rowNumberInBlock()─┬─number─┬─neighbor(number, -1)─┬─lagInFrame(number, 1) OVER w─┬─neighbor(number, 1)─┬─leadInFrame(number, 1) OVER w─┬─count() OVER w─┐
│             4 │                  0 │      0 │                    0 │                            0 │                   1 │                             1 │              2 │
│             4 │                  1 │      1 │                    0 │                            0 │                   2 │                             2 │              3 │
│             4 │                  2 │      2 │                    1 │                            1 │                   0 │                             3 │              3 │
└───────────────┴────────────────────┴────────┴──────────────────────┴──────────────────────────────┴─────────────────────┴───────────────────────────────┴────────────────┘
┌─blockNumber()─┬─rowNumberInBlock()─┬─number─┬─neighbor(number, -1)─┬─lagInFrame(number, 1) OVER w─┬─neighbor(number, 1)─┬─leadInFrame(number, 1) OVER w─┬─count() OVER w─┐
│             5 │                  0 │      3 │                    0 │                            2 │                   4 │                             4 │              3 │
│             5 │                  1 │      4 │                    3 │                            3 │                   5 │                             5 │              3 │
│             5 │                  2 │      5 │                    4 │                            4 │                   0 │                             6 │              3 │
└───────────────┴────────────────────┴────────┴──────────────────────┴──────────────────────────────┴─────────────────────┴───────────────────────────────┴────────────────┘
┌─blockNumber()─┬─rowNumberInBlock()─┬─number─┬─neighbor(number, -1)─┬─lagInFrame(number, 1) OVER w─┬─neighbor(number, 1)─┬─leadInFrame(number, 1) OVER w─┬─count() OVER w─┐
│             6 │                  0 │      6 │                    0 │                            5 │                   7 │                             7 │              3 │
│             6 │                  1 │      7 │                    6 │                            6 │                   8 │                             8 │              3 │
│             6 │                  2 │      8 │                    7 │                            7 │                   0 │                             9 │              3 │
└───────────────┴────────────────────┴────────┴──────────────────────┴──────────────────────────────┴─────────────────────┴───────────────────────────────┴────────────────┘
┌─blockNumber()─┬─rowNumberInBlock()─┬─number─┬─neighbor(number, -1)─┬─lagInFrame(number, 1) OVER w─┬─neighbor(number, 1)─┬─leadInFrame(number, 1) OVER w─┬─count() OVER w─┐
│             7 │                  0 │      9 │                    0 │                            8 │                   0 │                             0 │              2 │
└───────────────┴────────────────────┴────────┴──────────────────────┴──────────────────────────────┴─────────────────────┴───────────────────────────────┴────────────────┘

10 rows in set. Elapsed: 0.002 sec. 
```

Make sure to make the window wide enough: `ROWS BETWEEN lag PRECEDING AND lead FOLLOWING`, otherwise `lagInFrame()` or `leadInFrame()` silently returns `0`.


## Reference links

- [`Neighbor()` function](https://clickhouse.com/docs/en/sql-reference/functions/other-functions#neighbor)
