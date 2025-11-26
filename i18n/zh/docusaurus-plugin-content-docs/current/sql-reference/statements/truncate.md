---
description: 'TRUNCATE 语句参考文档'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE 语句'
doc_type: 'reference'
---



# TRUNCATE 语句

ClickHouse 中的 `TRUNCATE` 语句用于在保留表或数据库结构的前提下，快速清空其中的所有数据。



## TRUNCATE TABLE 语句

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Parameter            | Description                                   |
| -------------------- | --------------------------------------------- |
| `IF EXISTS`          | 如果表不存在，则避免报错。若省略该参数，查询会返回错误。                  |
| `db.name`            | 可选的数据库名称。                                     |
| `ON CLUSTER cluster` | 在指定集群上的所有节点执行该命令。                             |
| `SYNC`               | 在使用复制表时，使截断操作在各副本间同步进行。若省略该参数，则截断操作默认以异步方式执行。 |

你可以使用 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置来配置在副本上等待操作执行完成的方式。

你可以使用 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定在非活动副本上等待执行 `TRUNCATE` 查询的时间（以秒为单位）。

:::note\
如果将 `alter_sync` 设置为 `2`，且某些副本非活动的时间超过 `replication_wait_for_inactive_replica_timeout` 设置所指定的时间，则会抛出 `UNFINISHED` 异常。
:::

对于下列表引擎，`TRUNCATE TABLE` 查询**不受支持**：

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)


## 清空所有表

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description     |
| --------------------------------------- | --------------- |
| `ALL`                                   | 从数据库中的所有表中删除数据。 |
| `IF EXISTS`                             | 如果数据库不存在，则避免报错。 |
| `db`                                    | 数据库名称。          |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 按模式筛选表。         |
| `ON CLUSTER cluster`                    | 在整个集群中运行该命令。    |

从数据库中的所有表中删除所有数据。


## TRUNCATE DATABASE（清空数据库）

```sql
截断数据库 [如果存在] db [在 集群 cluster 上]
```

<br />

| 参数                   | 描述              |
| -------------------- | --------------- |
| `IF EXISTS`          | 如果数据库不存在，则不会报错。 |
| `db`                 | 数据库名称。          |
| `ON CLUSTER cluster` | 在指定的集群上运行该命令。   |

从数据库中移除所有表，但保留数据库本身。省略 `IF EXISTS` 子句时，如果数据库不存在，查询将返回错误。

:::note
`TRUNCATE DATABASE` 不支持用于 `Replicated` 数据库。对于这类数据库，请改用先 `DROP` 再 `CREATE` 的方式。
:::
