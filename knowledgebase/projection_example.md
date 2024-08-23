---
title: How to confirm if a Projection is used by the query?
date: 2022-07-10
---

### Question

How can I tell if a projection is used?

### Answer

1. Create a sample database

```
CREATE database db1;
```

2.  Create a sample table that will use column1 as the primary key

```
CREATE table db1.table1_projections
(
 column1 Int32,
 column2 Int32
)
engine = MergeTree()
order by column1;
```

3. Add a projection `for_column2` to use column2 as the primary key

```
ALTER table db1.table1_projections add projection for_column2
(
  select * 
  order by column2
);
```
4.  Insert test data

*this inserts 100000 rows with random numbers in column1 and column2

```
INSERT INTO db1.table1_projections
select 
 floor(randNormal(50, 5)) as column1,
 floor(randUniform(1, 100)) as column2
from numbers(100000);
```
5. Check sample set of data

```
clickhouse-cloud :) SELECT * from db1.table1_projections limit 5;

SELECT *
FROM db1.table1_projections
LIMIT 5

Query id: d6940799-b507-4a5e-9843-df55ebe818ab

┌─column1─┬─column2─┐
│      28 │      41 │
│      29 │      12 │
│      30 │      73 │
│      30 │      75 │
│      30 │      70 │
└─────────┴─────────┘
```

6. Test that it is using the original table with column1:

```
clickhouse-cloud :) explain indexes = 1 
                    SELECT count() from db1.table1_projections where column1 > 50;

EXPLAIN indexes = 1
SELECT count()
FROM db1.table1_projections
WHERE column1 > 50

Query id: e04d5236-1a05-4f1f-9502-7e41986beb44

┌─explain────────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))        │
│   Aggregating                                      │
│     Expression (Before GROUP BY)                   │
│       Filter (WHERE)                               │
│         ReadFromMergeTree (db1.table1_projections) │
│         Indexes:                                   │
│           PrimaryKey                               │
│             Condition: true                        │
│             Parts: 1/1                             │
│             Granules: 12/12                        │
└────────────────────────────────────────────────────┘
```
*notice that it is reading from `db1.table1_projections`

7. Test reading from the projection by using column2 in the where clause

```
clickhouse-cloud :) explain indexes = 1 
                    SELECT * from db1.table1_projections where column2 > 50;

EXPLAIN indexes = 1
SELECT *
FROM db1.table1_projections
WHERE column2 > 50

Query id: d2b20e01-93bf-4b60-a370-4aac7b454267

┌─explain─────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY)) │
│   Filter                                    │
│     ReadFromMergeTree (for_column2)         │
│     Indexes:                                │
│       PrimaryKey                            │
│         Keys:                               │
│           column2                           │
│         Condition: (column2 in [51, +Inf))  │
│         Parts: 1/1                          │
│         Granules: 6/12                      │
└─────────────────────────────────────────────┘
```
*notice that now the `for_column2` projection is used.

**For more info**

Projections:
https://clickhouse.com/docs/en/sql-reference/statements/alter/projection

numbers table function: 
https://clickhouse.com/docs/en/sql-reference/table-functions/numbers

Blog for generating random data:
https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse

