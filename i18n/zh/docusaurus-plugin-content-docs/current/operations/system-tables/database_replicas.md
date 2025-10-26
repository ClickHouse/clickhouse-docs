---
'description': '系统表包含关于复制数据库的信息和状态。'
'keywords':
- 'system table'
- 'database_replicas'
'slug': '/operations/system-tables/database_replicas'
'title': 'system.database_replicas'
'doc_type': 'reference'
---

包含每个副本数据库副本的信息。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 所在的副本数据库名称。

- `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 数据库副本是否处于只读模式。
    如果配置中没有 Zookeeper/ClickHouse Keeper 的部分，则启用此模式。

- `is_session_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 与 ClickHouse Keeper 的会话已过期。基本上与 `is_readonly` 相同。

- `max_log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - 一般活动日志中的最大条目编号。

- `zookeeper_path` ([String](../../sql-reference/data-types/string.md)) - 在 ClickHouse Keeper 中数据库数据的路径。

- `replica_name` ([String](../../sql-reference/data-types/string.md)) - 在 ClickHouse Keeper 中的副本名称。

- `replica_path` ([String](../../sql-reference/data-types/string.md)) - 在 ClickHouse Keeper 中副本数据的路径。

- `zookeeper_exception` ([String](../../sql-reference/data-types/string.md)) - 从 ClickHouse Keeper 获取信息时发生错误时的最后异常消息。

- `total_replicas` ([UInt32](../../sql-reference/data-types/int-uint.md)) - 此数据库已知副本的总数。

- `log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - 副本复制到其执行队列的最大活动日志条目编号，加一。

**示例**

```sql
SELECT * FROM system.database_replicas FORMAT Vertical;
```

```text
Row 1:
──────
database:            db_2
is_readonly:         0
max_log_ptr:         2
replica_name:        replica1
replica_path:        /test/db_2/replicas/shard1|replica1
zookeeper_path:      /test/db_2
shard_name:          shard1
log_ptr:             2
total_replicas:      1
zookeeper_exception: 
is_session_expired:  0
```
