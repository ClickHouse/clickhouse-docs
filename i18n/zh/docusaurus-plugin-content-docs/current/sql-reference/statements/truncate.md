---
description: 'TRUNCATE 语句文档'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE 语句'
doc_type: 'reference'
---

# TRUNCATE 语句 \{#truncate-statements\}

ClickHouse 中的 `TRUNCATE` 语句用于在保留表或数据库结构的前提下，快速删除其中的所有数据。

## TRUNCATE TABLE \{#truncate-table\}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| 参数                   | 描述                                           |
| -------------------- | -------------------------------------------- |
| `IF EXISTS`          | 如果表不存在，则避免报错。若省略此参数，则查询会返回错误。                |
| `db.name`            | 可选的数据库名称。                                    |
| `ON CLUSTER cluster` | 在指定的集群上执行该命令。                                |
| `SYNC`               | 在使用复制表时，使截断操作在各个副本之间同步进行。若省略，则截断操作默认以异步方式执行。 |

你可以使用 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置在副本上等待操作执行的行为。

你可以通过 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置指定在非活动副本上等待其执行 `TRUNCATE` 查询的时间（以秒为单位）。

:::note
如果 `alter_sync` 被设置为 `2`，并且某些副本处于非活动状态的持续时间超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时间，则会抛出 `UNFINISHED` 异常。
:::

对于以下表引擎，**不支持** `TRUNCATE TABLE` 查询：

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)

## 清空所有表 \{#truncate-all-tables\}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description     |
| --------------------------------------- | --------------- |
| `ALL`                                   | 从数据库中的所有表中删除数据。 |
| `IF EXISTS`                             | 如果数据库不存在，则避免报错。 |
| `db`                                    | 数据库名称。          |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 根据模式过滤表。        |
| `ON CLUSTER cluster`                    | 在整个集群上运行该命令。    |

从数据库中的所有表中删除所有数据。

## TRUNCATE DATABASE 语句 \{#truncate-database\}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| 参数                   | 描述              |
| -------------------- | --------------- |
| `IF EXISTS`          | 如果数据库不存在，则避免报错。 |
| `db`                 | 数据库名称。          |
| `ON CLUSTER cluster` | 在指定的集群上执行该命令。   |

从数据库中删除所有表，但保留数据库本身。省略 `IF EXISTS` 子句时，如果数据库不存在，该查询会返回错误。

:::note
`TRUNCATE DATABASE` 不支持 `Replicated` 类型的数据库。应改为先 `DROP` 再 `CREATE` 该数据库。
:::
