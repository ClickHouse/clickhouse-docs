---
date: 2023-03-24
---

# How to quickly recreate a small table across different terminals

**Question:**

How can I quickly recreate a table and its data using just copy/paste across different terminals?

**Answer:**

This is NOT a recommended practice to migrate data from one database to another and it should NOT be used for production data migration.

This is simply intended as a quick and dirty way to recreate small amount of data when developing across multiple environments.

1. Get the CREATE TABLE statement with `SHOW CREATE table`:

```sql
SHOW CREATE TABLE cookies;

SHOW CREATE TABLE cookies

Query id: 248ec8e2-5bce-45b3-97d9-ed68edf445a5

┌─statement────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.cookies
(
    `id` String,
    `timestamp` DateTime
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

2. Get the data export using `FORMAT SQLInsert`

```sql
SELECT * FROM cookies FORMAT SQLInsert;

SELECT *
FROM cookies
FORMAT SQLInsert

Query id: 383759b8-69c0-4561-ab95-f8224abc0071

INSERT INTO table (`id`, `timestamp`) VALUES ('4', '2023-03-15 16:28:46')
, ('2', '2023-03-15 16:28:41')
, ('1', '2023-03-15 16:11:02'), ('1', '2023-03-15 16:11:40'), ('1', '2023-03-15 16:11:48'), ('1', '2023-03-15 16:16:05'), ('2', '2023-03-15 16:11:06'), ('3', '2023-03-15 16:11:12'), ('3', '2023-03-15 16:11:45'), ('3', '2023-03-15 16:16:08'), ('4', '2023-03-15 16:11:14'), ('4', '2023-03-15 16:11:50'), ('4', '2023-03-15 16:16:01'), ('5', '2023-03-15 16:11:18'), ('5', '2023-03-15 16:16:11')
;

15 rows in set. Elapsed: 0.023 sec.
```

Note you will need to replace the name `table` at point 2 with the actual table name (`cookies` in this example)
