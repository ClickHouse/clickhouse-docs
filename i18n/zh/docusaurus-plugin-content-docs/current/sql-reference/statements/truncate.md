---
description: 'TRUNCATE 语句文档'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE 语句'
doc_type: 'reference'
---



# TRUNCATE 语句

ClickHouse 中的 `TRUNCATE` 语句用于在保留表或数据库结构的前提下，快速删除表或数据库中的所有数据。



## TRUNCATE TABLE {#truncate-table}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />| 参数 | 描述 |
|---------------------|---------------------------------------------------------------------------------------------------|
| `IF EXISTS` | 如果表不存在,防止返回错误。如果省略,查询将返回错误。 | | `db.name` | 可选的数据库名称。 | | `ON CLUSTER
cluster`| 在指定集群上运行该命令。 | | `SYNC` | 使用复制表时,使截断操作在副本间同步执行。如果省略,截断操作默认异步执行。 |

您可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来配置等待操作在副本上执行的行为。

您可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待非活动副本执行 `TRUNCATE` 查询的时长(以秒为单位)。

:::note  
如果 `alter_sync` 设置为 `2`,且某些副本的非活动时间超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时间,则会抛出 `UNFINISHED` 异常。
:::

以下表引擎**不支持** `TRUNCATE TABLE` 查询:

- [`View`](../../engines/table-engines/special/view.md)
- [`File`](../../engines/table-engines/special/file.md)
- [`URL`](../../engines/table-engines/special/url.md)
- [`Buffer`](../../engines/table-engines/special/buffer.md)
- [`Null`](../../engines/table-engines/special/null.md)


## TRUNCATE ALL TABLES {#truncate-all-tables}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br/>
| 参数                  | 描述                                       |
|----------------------------|---------------------------------------------------|
| `ALL`                      | 删除数据库中所有表的数据。     |
| `IF EXISTS`                | 当数据库不存在时防止报错。 |
| `db`                       | 数据库名称。                                |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 按模式筛选表。           |
| `ON CLUSTER cluster`       | 在集群上执行该命令。                |

删除数据库中所有表的全部数据。


## TRUNCATE DATABASE {#truncate-database}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />| 参数 | 描述 |
|----------------------|---------------------------------------------------| |
`IF EXISTS` | 当数据库不存在时防止报错。 | | `db` | 数据库名称。 | | `ON CLUSTER cluster` | 在指定集群上执行该命令。 |

从数据库中删除所有表,但保留数据库本身。如果省略 `IF EXISTS` 子句,当数据库不存在时查询将返回错误。

:::note
`Replicated` 数据库不支持 `TRUNCATE DATABASE`。请改用 `DROP` 和 `CREATE` 操作数据库。
:::
