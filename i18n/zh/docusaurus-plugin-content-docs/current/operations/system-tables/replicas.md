---
'description': '系统表，包含关于在本地服务器上驻留的副本表的信息和状态。对监控非常有用。'
'keywords':
- 'system table'
- 'replicas'
'slug': '/operations/system-tables/replicas'
'title': 'system.replicas'
---


# system.replicas

包含本地服务器上复制表的信息和状态。此表可用于监控。该表为每个 Replicated\* 表包含一行。

示例：

```sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

```text
Query id: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

Row 1:
───────
database:                    db
table:                       test_table
engine:                      ReplicatedMergeTree
is_leader:                   1
can_become_leader:           1
is_readonly:                 0
is_session_expired:          0
future_parts:                0
parts_to_check:              0
zookeeper_path:              /test/test_table
replica_name:                r1
replica_path:                /test/test_table/replicas/r1
columns_version:             -1
queue_size:                  27
inserts_in_queue:            27
merges_in_queue:             0
part_mutations_in_queue:     0
queue_oldest_time:           2021-10-12 14:48:48
inserts_oldest_time:         2021-10-12 14:48:48
merges_oldest_time:          1970-01-01 03:00:00
part_mutations_oldest_time:  1970-01-01 03:00:00
oldest_part_to_get:          1_17_17_0
oldest_part_to_merge_to:
oldest_part_to_mutate_to:
log_max_index:               206
log_pointer:                 207
last_queue_update:           2021-10-12 14:50:08
absolute_delay:              99
total_replicas:              5
active_replicas:             5
lost_part_count:             0
last_queue_update_exception:
zookeeper_exception:
replica_is_active:           {'r1':1,'r2':1}
```

列：

- `database` (`String`) - 数据库名称
- `table` (`String`) - 表名称
- `engine` (`String`) - 表引擎名称
- `is_leader` (`UInt8`) - 副本是否为领导者。
    多个副本可以同时为领导者。可以使用 `merge_tree` 设置 `replicated_can_become_leader` 防止副本成为领导者。领导者负责调度后台合并。
    请注意，写入可以在任何可用副本上执行，只要该副本在 ZK 中有会话，无论其是否为领导者。
- `can_become_leader` (`UInt8`) - 副本是否可以成为领导者。
- `is_readonly` (`UInt8`) - 副本是否处于只读模式。
    如果配置中没有包含 ClickHouse Keeper 的部分，如果在重新初始化 ClickHouse Keeper 中的会话时发生未知错误，或者在 ClickHouse Keeper 中重新初始化会话时，此模式将开启。
- `is_session_expired` (`UInt8`) - 与 ClickHouse Keeper 的会话已过期。基本上与 `is_readonly` 相同。
- `future_parts` (`UInt32`) - 尚未完成的 INSERT 或合并将产生的数据部分数量。
- `parts_to_check` (`UInt32`) - 等待验证的数据部分数量。如果怀疑某个分片可能损坏，则会将其放入验证队列。
- `zookeeper_path` (`String`) - ClickHouse Keeper 中表数据的路径。
- `replica_name` (`String`) - ClickHouse Keeper 中副本的名称。相同表的不同副本有不同的名称。
- `replica_path` (`String`) - ClickHouse Keeper 中副本数据的路径。同 zookeeper_path/replicas/replica_path 的拼接。
- `columns_version` (`Int32`) - 表结构的版本号。指示执行了多少次 ALTER。如果副本的版本不同，则表示某些副本尚未执行所有 ALTER。
- `queue_size` (`UInt32`) - 等待执行的操作队列的大小。操作包括插入数据块、合并和其他某些操作。通常与 `future_parts` 一致。
- `inserts_in_queue` (`UInt32`) - 需要进行的块数据插入数量。插入通常会相对快速地进行复制。如果此数字较大，则说明存在问题。
- `merges_in_queue` (`UInt32`) - 等待进行的合并数量。有时合并很耗时，因此此值可能在很长时间内大于零。
- `part_mutations_in_queue` (`UInt32`) - 等待进行的变更数量。
- `queue_oldest_time` (`DateTime`) - 如果 `queue_size` 大于 0，显示最旧的操作何时添加到队列。
- `inserts_oldest_time` (`DateTime`) - 见 `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - 见 `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - 见 `queue_oldest_time`

接下来的 4 列仅在与 ZK 有活动会话时才会有非零值。

- `log_max_index` (`UInt64`) - 通用活动日志中的最大条目号。
- `log_pointer` (`UInt64`) - 副本已复制到执行队列的通用活动日志的最大条目号加一。如果 `log_pointer` 远小于 `log_max_index`，则说明存在问题。
- `last_queue_update` (`DateTime`) - 队列最后一次更新的时间。
- `absolute_delay` (`UInt64`) - 当前副本的延迟（以秒为单位）。
- `total_replicas` (`UInt8`) - 此表的已知副本总数。
- `active_replicas` (`UInt8`) - 具有 ClickHouse Keeper 会话的此表副本数量（即，正常工作的副本数量）。
- `lost_part_count` (`UInt64`) - 自表创建以来，所有副本在表中丢失的数据部分数量。该值在 ClickHouse Keeper 中持久保存，并且只能增加。
- `last_queue_update_exception` (`String`) - 当队列包含损坏条目时的情况。这在 ClickHouse 在版本间打破向后兼容性时尤为重要，因为新版本写入的日志条目无法被旧版本解析。
- `zookeeper_exception` (`String`) - 从 ClickHouse Keeper 获取信息时发生错误的最后异常消息。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 副本名称与副本是否活动之间的映射。

如果请求所有列，表的性能可能会稍慢，因为每一行都需要从 ClickHouse Keeper 进行多次读取。
如果不请求最后 4 列（log_max_index, log_pointer, total_replicas, active_replicas），表的性能则会很快。

例如，您可以这样检查一切是否正常：

```sql
SELECT
    database,
    table,
    is_leader,
    is_readonly,
    is_session_expired,
    future_parts,
    parts_to_check,
    columns_version,
    queue_size,
    inserts_in_queue,
    merges_in_queue,
    log_max_index,
    log_pointer,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE
       is_readonly
    OR is_session_expired
    OR future_parts > 20
    OR parts_to_check > 10
    OR queue_size > 20
    OR inserts_in_queue > 10
    OR log_max_index - log_pointer > 10
    OR total_replicas < 2
    OR active_replicas < total_replicas
```

如果此查询未返回任何内容，则表示一切正常。
