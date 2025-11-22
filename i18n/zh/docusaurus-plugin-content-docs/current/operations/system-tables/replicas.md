---
description: '包含本地服务器上复制表的信息和状态的系统表，可用于监控。'
keywords: ['system table', 'replicas']
slug: /operations/system-tables/replicas
title: 'system.replicas'
doc_type: 'reference'
---

# system.replicas

包含有关本地服务器上复制表的信息和状态。
此表可用于监控。该表中每个 Replicated* 表对应一行记录。

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
- `table` (`String`) - 表名
- `engine` (`String`) - 表引擎名称
- `is_leader` (`UInt8`) - 副本是否为 leader。
    多个副本可以同时为 leader。可以通过 `merge_tree` 设置 `replicated_can_become_leader` 阻止某个副本成为 leader。leader 负责调度后台合并。
    请注意，只要副本可用并且在 ZK 中有会话，就可以向其写入数据，而不管它是否为 leader。
- `can_become_leader` (`UInt8`) - 副本是否可以成为 leader。
- `is_readonly` (`UInt8`) - 副本是否处于只读模式。
    如果配置中没有 ClickHouse Keeper 相关的部分、在 ClickHouse Keeper 中重新初始化会话时发生未知错误、或者在 ClickHouse Keeper 中进行会话重新初始化期间，该模式会被启用。
- `is_session_expired` (`UInt8`) - 与 ClickHouse Keeper 的会话已过期。基本上与 `is_readonly` 相同。
- `future_parts` (`UInt32`) - 作为尚未完成的 INSERT 或合并操作的结果将要出现的数据分片数量。
- `parts_to_check` (`UInt32`) - 等待在验证队列中的数据分片数量。如果怀疑某个分片可能已损坏，则会将其放入验证队列。
- `zookeeper_path` (`String`) - ClickHouse Keeper 中表数据的路径。
- `replica_name` (`String`) - ClickHouse Keeper 中副本的名称。同一张表的不同副本具有不同的名称。
- `replica_path` (`String`) - ClickHouse Keeper 中副本数据的路径。等同于连接 'zookeeper_path/replicas/replica_path'。
- `columns_version` (`Int32`) - 表结构的版本号。表示执行 ALTER 的次数。如果副本的版本号不同，说明某些副本尚未完成全部 ALTER 操作。
- `queue_size` (`UInt32`) - 等待执行的操作队列的大小。操作包括插入数据块、合并以及其他某些操作。通常与 `future_parts` 一致。
- `inserts_in_queue` (`UInt32`) - 需要执行的数据块插入数量。插入通常会被相当快速地复制。如果该数值很大，则说明存在问题。
- `merges_in_queue` (`UInt32`) - 等待执行的合并数量。有时合并耗时较长，因此该值可能长时间大于零。
- `part_mutations_in_queue` (`UInt32`) - 等待执行的变更（mutation）数量。
- `queue_oldest_time` (`DateTime`) - 如果 `queue_size` 大于 0，表示最早的操作被加入队列的时间。
- `inserts_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`

接下来的 4 列只有在存在与 ZK 的活动会话时才为非零值。

- `log_max_index` (`UInt64`) - 总活动日志中的最大条目编号。
- `log_pointer` (`UInt64`) - 副本已复制到其执行队列中的总活动日志的最大条目编号再加一。如果 `log_pointer` 远远小于 `log_max_index`，则说明出现了问题。
- `last_queue_update` (`DateTime`) - 队列上次更新时间。
- `absolute_delay` (`UInt64`) - 当前副本的延迟（以秒为单位）。
- `total_replicas` (`UInt8`) - 已知的该表副本总数。
- `active_replicas` (`UInt8`) - 该表中在 ClickHouse Keeper 中具有会话（即正在正常运行）的副本数量。
- `lost_part_count` (`UInt64`) - 自表创建以来，所有副本在该表中总共丢失的数据分片数量。该值持久化在 ClickHouse Keeper 中，并且只能增加。
- `last_queue_update_exception` (`String`) - 队列中包含损坏条目时的异常信息。当 ClickHouse 在版本之间破坏向后兼容性，并且由较新版本写入的日志条目无法被旧版本解析时，这一点尤为重要。
- `zookeeper_exception` (`String`) - 如果在从 ClickHouse Keeper 获取信息时发生错误，则为最近一次的异常消息。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 副本名称到副本是否活跃的映射。

如果你查询所有列，表的性能可能会有些下降，因为每一行都需要多次从 ClickHouse Keeper 读取数据。
如果你不查询最后 4 列（log&#95;max&#95;index、log&#95;pointer、total&#95;replicas、active&#95;replicas），该表的查询会更快。

例如，你可以像下面这样检查一切是否正常工作：

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

如果这个查询没有返回任何结果，说明一切正常。
