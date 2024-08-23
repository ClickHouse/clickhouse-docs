---
date: 2023-06-07
---

# Expensive queries by memory usage

The following useful query shows which of your executed queries used the most memory. A couple of comments about this query:

- the results are computed from the past day (`now() - toIntervalDay(1))`) but you can easily modify the time interval
- it assumes you have a cluster named `default`, which is the name of your cluster in [ClickHouse Cloud](https://clickhouse.cloud). Change `default` to the name of your cluster
- if you do not have a cluster, see the query listed at the end of this article


```sql
SELECT
    count() as nb_query,
    user,
    query,
    sum(memory_usage) AS memory,
    normalized_query_hash
FROM
    clusterAllReplicas(default, system.query_log)
WHERE
    (event_time >= (now() - toIntervalDay(1)))
    AND query_kind = 'Select'
    AND type = 'QueryFinish'
    and user != 'monitoring-internal'
GROUP BY
    normalized_query_hash,
    query,
    user
ORDER BY
    memory DESC;
```

The response looks like:

```response
┌─nb_query─┬─user────┬─query─────────────────────────────────────────────────────────┬───memory─┬─normalized_query_hash─┐
│       11 │ default │ select version()                                              │ 46178924 │   7202516440347714159 │
│        2 │ default │ SELECT * FROM "system"."table_functions" LIMIT 31 OFFSET 0    │  8391544 │  12830067173062987695 │
└──────────┴─────────┴───────────────────────────────────────────────────────────────┴──────────┴───────────────────────┘
```

:::note
If you do not have a `system.query_log` table, then you likely do not have query logging enabled. View the details of the [`query_log` setting](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log) for details on how to enable it.
:::

If you do not have a cluster, use can just query your one `system.query_log` table directly:

```sql
SELECT
    count() as nb_query,
    user,
    query,
    sum(memory_usage) AS memory,
    normalized_query_hash
FROM
    system.query_log
WHERE
    (event_time >= (now() - toIntervalDay(1)))
    AND query_kind = 'Select'
    AND type = 'QueryFinish'
    and user != 'monitoring-internal'
GROUP BY
    normalized_query_hash,
    query,
    user
ORDER BY
    memory DESC;
```