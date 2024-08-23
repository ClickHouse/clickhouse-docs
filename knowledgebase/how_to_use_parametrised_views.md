---
date: 2023-08-01
---

# How can I use parameterized views?

Parameterized views can be handy to slice and dice data on the fly based on some parameters that can be fed at query execution time.

See this basic example:

1) create a table

```sql
clickhouse-cloud :) CREATE TABLE raw_data (id UInt32, data String) ENGINE = MergeTree ORDER BY id

CREATE TABLE raw_data
(
`id` UInt32,
`data` String
)
ENGINE = MergeTree
ORDER BY id

Query id: aa21e614-1e10-4bba-88ce-4c7183a9148e

Ok.

0 rows in set. Elapsed: 0.332 sec.
```

2) insert some sample random data

```sql
clickhouse-cloud :) INSERT INTO raw_data SELECT * FROM generateRandom('`id` UInt32,
`data` String',1,1) LIMIT 1000000;

INSERT INTO raw_data SELECT *
FROM generateRandom('`id` UInt32,
`data` String', 1, 1)
LIMIT 1000000

Query id: c552a34a-b72f-45e1-bed0-778923e1b5c9

Ok.

0 rows in set. Elapsed: 0.438 sec. Processed 1.05 million rows, 10.99 MB (2.39 million rows/s., 25.11 MB/s.)
````

3) create the parameterized view:

```sql
clickhouse-cloud :) CREATE VIEW raw_data_parametrized AS SELECT * FROM raw_data WHERE id BETWEEN {id_from:UInt32} AND {id_to:UInt32}

CREATE VIEW raw_data_parametrized AS
SELECT *
FROM raw_data
WHERE (id >= {id_from:UInt32}) AND (id <= {id_to:UInt32})

Query id: 45fb83a6-aa55-4197-a7cd-9e1ad2c76d48

Ok.

0 rows in set. Elapsed: 0.102 sec.
```

4) query the parameterized view by feeding the expected parameters in your `FROM` clause:

```sql
clickhouse-cloud :) SELECT count() FROM raw_data_parametrized(id_from=0, id_to=50000);

SELECT count()
FROM raw_data_parametrized(id_from = 0, id_to = 50000)

Query id: 5731aae1-3e68-4e63-b57f-d50f29055744

┌─count()─┐
│ 317019 │
└─────────┘

1 row in set. Elapsed: 0.004 sec. Processed 319.49 thousand rows, 319.49 KB (76.29 million rows/s., 76.29 MB/s.)
```

For more info, please refer to https://clickhouse.com/docs/en/sql-reference/statements/create/view#parameterized-view
