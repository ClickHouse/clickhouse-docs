---
date: 2023-05-04
---

# How can I validate that two queries return the same resultsets? 

## Question

How can I validate that two queries return the same resultsets?

## Answer

You can use the below approach:

```sql
WITH
    (
        SELECT sum(cityHash64(*))
        FROM
        (
            -- your query 1 here
            -- SELECT ...
        )
    ) AS q1_resultset_hash,
    (
        SELECT sum(cityHash64(*))
        FROM
        (
            -- your query 2 here
            -- SELECT ...
        )
    ) AS q2_resultset_hash
SELECT equals(q1_resultset_hash,q2_resultset_hash) as Q1_equals_Q2
```
The example uses a [CTE](https://clickhouse.com/docs/en/sql-reference/statements/select/with) to calculate sums of the [cityHash](https://clickhouse.com/docs/en/sql-reference/functions/hash-functions#cityhash64) value of each row in these two queries and will return `1` if the two resultsets are identical.


Using some integers sequence data and some pretty formatting:

```sql
WITH
    (
        SELECT sum(cityHash64(*))
        FROM
        (
            SELECT *
            FROM numbers(10)
            ORDER BY number DESC
        )
    ) AS q1_resultset_hash,
    (
        SELECT sum(cityHash64(*))
        FROM
        (
            SELECT *
            FROM numbers(10)
            ORDER BY number ASC
        )
    ) AS q2_resultset_hash
SELECT q1_resultset_hash = q2_resultset_hash AS Q1_equals_Q2
FORMAT Pretty
```

will return:

```
┏━━━━━━━━━━━━━━┓
┃ Q1_equals_Q2 ┃
┡━━━━━━━━━━━━━━┩
│            1 │
└──────────────┘
```

While this can be handy in many scenarios, it can't be considered as a silver bullet to validate equality of resultsets for all types and there are caveats to using it, for example if any row contains `NULL` values the above approach will fail.


