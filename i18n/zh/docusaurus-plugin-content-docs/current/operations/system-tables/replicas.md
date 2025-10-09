---
'description': '系统表包含关于和状态的 replicated tables 在本地服务器上。对于监控非常有用。'
'keywords':
- 'system table'
- 'replicas'
'slug': '/operations/system-tables/replicas'
'title': 'system.replicas'
'doc_type': 'reference'
---


# system.replicas

包含本地服务器上复制表的信息和状态。该表可用于监控。该表为每个 Replicated\* 表包含一行。

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
    多个副本可以同时是领导者。可以通过 `merge_tree` 设置 `replicated_can_become_leader` 来阻止副本成为领导者。领导者负责调度后台合并。
    注意，写入可以在任何可用且在 ZK 中有会话的副本上执行，而不管它是否为领导者。
- `can_become_leader` (`UInt8`) - 副本是否可以成为领导者。
- `is_readonly` (`UInt8`) - 副本是否处于只读模式。
    如果配置中没有包含 ClickHouse Keeper 的部分，如果在重新初始化 ClickHouse Keeper 中的会话时发生未知错误，以及在 ClickHouse Keeper 中重新初始化会话时，则会开启此模式。
- `is_session_expired` (`UInt8`) - 与 ClickHouse Keeper 的会话已过期。基本上与 `is_readonly` 相同。
- `future_parts` (`UInt32`) - 将作为尚未完成的 INSERT 或合并的结果出现的数据部分数量。
- `parts_to_check` (`UInt32`) - 等待验证的数据部分数量。如果怀疑某个部分可能损坏，则该部分放入验证队列中。
- `zookeeper_path` (`String`) - ClickHouse Keeper 中表数据的路径。
- `replica_name` (`String`) - ClickHouse Keeper 中的副本名称。相同表的不同副本具有不同的名称。
- `replica_path` (`String`) - ClickHouse Keeper 中副本数据的路径。与连接 'zookeeper_path/replicas/replica_path' 相同。
- `columns_version` (`Int32`) - 表结构的版本号。指示 ALTER 操作执行的次数。如果副本具有不同的版本，表示某些副本尚未进行所有 ALTER。
- `queue_size` (`UInt32`) - 等待执行操作的队列大小。操作包括插入数据块、合并和某些其他操作。通常与 `future_parts` 一致。
- `inserts_in_queue` (`UInt32`) - 需要进行的数据块插入数量。插入通常复制的相当迅速。如果这个数字很大，意味着出现了问题。
- `merges_in_queue` (`UInt32`) - 等待进行的合并数量。有时合并非常耗时，因此该值可能会长时间大于零。
- `part_mutations_in_queue` (`UInt32`) - 等待进行的突变数量。
- `queue_oldest_time` (`DateTime`) - 如果 `queue_size` 大于 0，显示最早操作被添加到队列的时间。
- `inserts_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`

接下来的 4 列仅在与 ZK 有活动会话的情况下具有非零值。

- `log_max_index` (`UInt64`) - 一般活动日志中最大条目编号。
- `log_pointer` (`UInt64`) - 副本复制到其执行队列的活动日志中最大条目编号，加一。如果 `log_pointer` 远小于 `log_max_index`，则有问题。
- `last_queue_update` (`DateTime`) - 上次更新队列的时间。
- `absolute_delay` (`UInt64`) - 当前副本的延迟，单位为秒。
- `total_replicas` (`UInt8`) - 此表的已知副本总数。
- `active_replicas` (`UInt8`) - 此表在 ClickHouse Keeper 中有会话的副本数量（即正常工作的副本数量）。
- `lost_part_count` (`UInt64`) - 自表创建以来，所有副本中丢失的数据部分数量。该值保存在 ClickHouse Keeper 中，只会增加。
- `last_queue_update_exception` (`String`) - 当队列包含损坏的条目时。尤其重要，当 ClickHouse 在版本之间打破向后兼容性，并且新版本写入的日志条目不能被旧版本解析时。
- `zookeeper_exception` (`String`) - 最后一次异常消息，如果在从 ClickHouse Keeper 获取信息时发生错误。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 副本名称与副本是否处于活动状态之间的映射。

如果您请求所有列，表的性能可能会稍慢，因为每一行都需要执行多次与 ClickHouse Keeper 的读取。
如果您不请求最后 4 列（log_max_index，log_pointer，total_replicas，active_replicas），表的性能会更快。

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

如果此查询不返回任何内容，则表示一切正常。
