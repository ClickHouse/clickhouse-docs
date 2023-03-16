---
sidebar_position: 1
sidebar_label: Joining Tables
---

# Joining Tables in ClickHouse

Joins are fully supported in ClickHouse with support for all standard SQL JOIN types. The syntax should look familiar, and you can view the [docs page on `JOIN`](../sql-reference/statements/select/join.md) for all the details:

```sql
SELECT
   *
FROM imdb.roles
  JOIN imdb.actors_dictionary
  ON imdb.roles.actor_id = imdb.actors_dictionary.id
```

ClickHouse also provides additional non-standard SQL JOIN types useful for analytical workloads and for time-series analysis, including the [`ASOF` join](../sql-reference/statements/select/join.md#asof-join-usage).

ClickHouse has [6 different algorithms](../operations/settings/settings.md#settings-join_algorithm) for the join execution, or allow the query planner to adaptively choose and dynamically change the algorithm at runtime, depending on resource availability and usage.

:::note
For details on joins in ClickHouse, be sure to check our our [series of blogs on joins](http://www.clickhouse.com/blog/clickhouse-fully-supports-joins).
:::
