---
slug: /sql-reference/statements/truncate
sidebar_position: 52
sidebar_label: TRUNCATE
---


# TRUNCATE 语句

## TRUNCATE TABLE {#truncate-table}
``` sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

从表中删除所有数据。当省略 `IF EXISTS` 子句时，如果表不存在，则查询返回错误。

`TRUNCATE` 查询不支持 [View](../../engines/table-engines/special/view.md)、[File](../../engines/table-engines/special/file.md)、[URL](../../engines/table-engines/special/url.md)、[Buffer](../../engines/table-engines/special/buffer.md) 和 [Null](../../engines/table-engines/special/null.md) 表引擎。

您可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来设置等待在副本上执行的操作。

您可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待不活跃副本执行 `TRUNCATE` 查询的时间（以秒为单位）。

:::note    
如果 `alter_sync` 设置为 `2`，而某些副本在 `replication_wait_for_inactive_replica_timeout` 设置指定的时间内未活跃，则抛出异常 `UNFINISHED`。
:::

## TRUNCATE ALL TABLES {#truncate-all-tables}
``` sql
TRUNCATE ALL TABLES FROM [IF EXISTS] db [ON CLUSTER cluster]
```

从数据库中的所有表中删除所有数据。

## TRUNCATE DATABASE {#truncate-database}
``` sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

从数据库中删除所有表，但保留数据库本身。当省略 `IF EXISTS` 子句时，如果数据库不存在，则查询返回错误。

:::note
`TRUNCATE DATABASE` 不支持 `Replicated` 数据库。相反，只需 `DROP` 和 `CREATE` 数据库。
:::
