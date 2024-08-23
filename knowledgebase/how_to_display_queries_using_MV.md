---
date: 2023-03-24
---

# What queries are using Materialized Views?

**Question:** How do I show all queries involving materialized views in the last 60m?

**Answer:**

This query will display all queries directed towards Materialized Views considering that:

- we can leverage the `create_table_query` field in `system.tables` table to identify what tables are explicit (`TO`) recipient of MVs;
- we can track back (using `uuid` and the name convention `.inner_id.<uuid>`) what tables are implicit recipient of MVs;

We can also configure how long back in time we want to look, by changing the value (`60` m by default) in the initial query CTE

```sql
WITH(60) -- default 60m
AS timeRange,
(
    --prepare names of possible implicit MV hidden target tables for *any* table with NON NULL uuid
    SELECT groupArray(
            concat('default.`.inner_id.', toString(uuid), '`')
        )
    FROM clusterAllReplicas(default, system.tables)
    WHERE notEmpty(uuid)
) AS MV_implicit_possible_hidden_target_tables_names_array,
(
    --captures MV name and target tables (if TO is specified)
    --TODO it seems that extract will return just the first capturing group :( replace with regexpExtract once available
    SELECT arrayFilter(
            x->x != '',
            --remove empty captures
            groupArray(
                extract(
                    create_table_query,
                    '^CREATE MATERIALIZED VIEW\s(\w+\.\w+)\s(?:TO\s(\S+))?'
                )
            )
        )
    FROM clusterAllReplicas(default, system.tables)
    WHERE engine = 'MaterializedView'
) AS MV_explicit_target_tables_names_array
SELECT event_time,
    query,
    tables as "MVs tables"
FROM clusterAllReplicas(default, system.query_log)
WHERE (
        -- only SELECT within 60m
        event_time > now() - toIntervalMinute(timeRange)
        AND startsWith(query, 'SELECT')
    ) -- check either that query involves implicit MV target table names
    AND (
        hasAny(
            tables,
            MV_implicit_possible_hidden_target_tables_names_array
        )
        OR -- check that query involves explicit MV target table
        hasAny(tables, MV_explicit_target_tables_names_array)
    )
ORDER BY event_time DESC;
```

expected output:

```sql
| event_time          | query                                                                                          | MVs tables                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2023-02-23 08:14:14 | SELECT     rand(),* FROM     default.sum_of_volumes,     default.big_changes,     system.users | ["default.big_changes_mv","default.sum_of_volumes_mv","system.users"] |
| 2023-02-23 08:04:47 | SELECT     price,* FROM     default.sum_of_volumes,     default.big_changes                    | ["default.big_changes_mv","default.sum_of_volumes_mv"]                |

```

In this example results above `default.big_changes_mv` and `default.sum_of_volumes_mv` are both materialized views.
