---
date: 2023-06-07
---

# How do I view the number of active or queued mutations?

## Question

How do I view the number of active or queued mutations?

## Answer

Monitoring the number of active or queued mutations is important if you are performing a lot of `ALTER` or `UPDATE` statements on your tables. These queries rewrite data parts and are not atomic - they are ordered by their creation part and applied to each part in that order. You can find more details on mutations in the [docs](https://clickhouse.com/docs/en/sql-reference/statements/alter#mutations).

Each mutation generates an entry in the `system.mutations` table. When performing a large number of mutations, you can monitor the count running and queued mutations with this:

```
SELECT
   hostname() AS host,
   count()
   FROM clusterAllReplicas('default', 'system.mutations') WHERE not is_done
   GROUP BY host;
```

:::note
This query assumes you are running a cluster named `default`, which is the name of your cluster in ClickHouse Cloud. Replace `default` with the name of your cluster.

If you do not have a cluster, use this command:

```sql
SELECT
   hostname() AS host,
   count()
   FROM system.mutations WHERE not is_done
   GROUP BY host;
```
:::

We also recommend reading this recent [blog on updates and deletes](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse).
