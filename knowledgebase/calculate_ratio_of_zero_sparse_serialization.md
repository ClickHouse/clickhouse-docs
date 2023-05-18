---
date: 2023-05-18
---

# How to calculate the ratio of empty/zero values in every column in a table

If a column is sparse (contains mostly zeros), ClickHouse can encode it in a sparse format and automatically optimize calculations - the data does not require full decompression during queries. In fact, if you know how spare a column is, you can define its ratio using the [`ratio_of_defaults_for_sparse_serialization` setting](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#ratio_of_defaults_for_sparse_serialization) to optimize serialization.

This handy query can take a while, but it analyzes every row in your table and determines the ratio of values that are zero (or the default) in every column in the specified table:

```sql
SELECT *
    APPLY x -> (x = defaultValueOfArgumentType(x)) APPLY avg APPLY x -> round(x, 3)
FROM table_name
```

For example, we ran this query above on the [environmental sensors dataset](https://clickhouse.com/docs/en/getting-started/example-datasets/environmental-sensors) table named `sensors` which has over 20B rows and 19 columns:

```sql
SELECT *
    APPLY x -> (x = defaultValueOfArgumentType(x)) APPLY avg APPLY x -> round(x, 3)
FROM sensors
```

Here is response:

```response

```

It's a handy query for computing how sparse your columns are in a ClickHouse table!