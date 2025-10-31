---
'description': 'TRUNCATE 语句的文档'
'sidebar_label': 'TRUNCATE'
'sidebar_position': 52
'slug': '/sql-reference/statements/truncate'
'title': 'TRUNCATE 语句'
'doc_type': 'reference'
---


# TRUNCATE 语句

ClickHouse 中的 `TRUNCATE` 语句用于快速删除表或数据库中的所有数据，同时保留其结构。

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```
<br/>
| 参数                   | 描述                                                                                          |
|------------------------|------------------------------------------------------------------------------------------------|
| `IF EXISTS`            | 如果表不存在，则防止出现错误。如果省略，则查询返回错误。                                          |
| `db.name`              | 可选的数据库名称。                                                                            |
| `ON CLUSTER cluster`   | 在指定的集群中运行该命令。                                                                      |
| `SYNC`                 | 在使用复制表时，使得在副本中的截断操作同步。如果省略，默认情况下截断是异步进行的。                     |

您可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来设置等待在副本上执行的操作。

您可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待非活动副本执行 `TRUNCATE` 查询的时间（以秒为单位）。

:::note    
如果 `alter_sync` 设置为 `2`，并且某些副本在超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时间后仍未激活，则抛出异常 `UNFINISHED`。
:::

`TRUNCATE TABLE` 查询对以下表引擎 **不支持**：

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
| 参数                         | 描述                                           |
|------------------------------|------------------------------------------------|
| `ALL`                        | 从数据库中的所有表中移除数据。                   |
| `IF EXISTS`                  | 如果数据库不存在，则防止出现错误。                 |
| `db`                         | 数据库名称。                                  |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 根据模式过滤表。                            |
| `ON CLUSTER cluster`         | 在集群中运行该命令。                            |

从数据库中的所有表中移除所有数据。

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```
<br/>
| 参数                     | 描述                                           |
|--------------------------|------------------------------------------------|
| `IF EXISTS`              | 如果数据库不存在，则防止出现错误。                 |
| `db`                     | 数据库名称。                                  |
| `ON CLUSTER cluster`     | 在指定的集群中运行该命令。                      |

从数据库中移除所有表但保留数据库本身。当省略 `IF EXISTS` 子句时，如果数据库不存在，则查询返回错误。

:::note
`TRUNCATE DATABASE` 不支持 `Replicated` 数据库。相反，可以直接 `DROP` 和 `CREATE` 数据库。
:::
