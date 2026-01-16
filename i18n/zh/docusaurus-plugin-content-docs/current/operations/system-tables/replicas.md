---
description: '包含本地服务器上各复制表信息和状态的系统表，适用于监控。'
keywords: ['system table', 'replicas']
slug: /operations/system-tables/replicas
title: 'system.replicas'
doc_type: 'reference'
---

# system.replicas \\{#systemreplicas\\}

包含本地服务器上所有复制表的相关信息和状态。
此表可用于监控。表中每个使用 Replicated* 引擎的表对应一行记录。

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

* `database` (`String`) - 数据库名称
* `table` (`String`) - 表名
* `engine` (`String`) - 表引擎名称
* `is_leader` (`UInt8`) - 该副本是否为 leader。
  多个副本可以同时为 leader。可以通过在 `merge_tree` 设置中使用 `replicated_can_become_leader` 来阻止某个副本成为 leader。leader 负责调度后台合并。
  请注意，只要副本可用并且在 ZK 中有会话，就可以对其执行写入操作，而不论其是否为 leader。
* `can_become_leader` (`UInt8`) - 该副本是否可以成为 leader。
* `is_readonly` (`UInt8`) - 该副本是否处于只读模式。
  如果配置中没有 ClickHouse Keeper 相关的配置段，或者在 ClickHouse Keeper 中重新初始化会话时发生未知错误，或者在 ClickHouse Keeper 中会话正在重新初始化时，该模式会被启用。
* `is_session_expired` (`UInt8`) - 与 ClickHouse Keeper 的会话是否已过期。基本上与 `is_readonly` 含义相同。
* `future_parts` (`UInt32`) - 作为尚未完成的 INSERT 或合并操作结果将出现的数据分片数量。
* `parts_to_check` (`UInt32`) - 等待验证队列中的数据分片数量。如果怀疑某个分片可能已损坏，则会将其放入验证队列。
* `zookeeper_path` (`String`) - 在 ClickHouse Keeper 中的表数据路径。
* `replica_name` (`String`) - 在 ClickHouse Keeper 中的副本名称。同一张表的不同副本具有不同的名称。
* `replica_path` (`String`) - 在 ClickHouse Keeper 中的副本数据路径。等同于拼接得到的路径 `'zookeeper_path/replicas/replica_path'`。
* `columns_version` (`Int32`) - 表结构的版本号。表示执行 ALTER 的次数。如果副本具有不同的版本，说明某些副本尚未完成所有 ALTER 操作。
* `queue_size` (`UInt32`) - 等待执行的操作队列大小。操作包括插入数据块、合并以及某些其他操作。通常该值与 `future_parts` 一致。
* `inserts_in_queue` (`UInt32`) - 需要执行的数据块插入数量。插入通常会被相当快速地复制。如果该值较大，则表示存在问题。
* `merges_in_queue` (`UInt32`) - 等待执行的合并数量。有时合并会很耗时，因此该值可能长时间大于零。
* `part_mutations_in_queue` (`UInt32`) - 等待执行的变更（mutation）数量。
* `queue_oldest_time` (`DateTime`) - 当 `queue_size` 大于 0 时，表示最早的操作被加入队列的时间。
* `inserts_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
* `merges_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`
* `part_mutations_oldest_time` (`DateTime`) - 参见 `queue_oldest_time`

接下来的 4 列只有在与 ZK 存在活动会话时才为非零值。

* `log_max_index` (`UInt64`) - 全局活动日志中的最大条目编号。
* `log_pointer` (`UInt64`) - 副本已复制到其执行队列中的全局活动日志最大条目编号再加一。如果 `log_pointer` 远小于 `log_max_index`，则说明存在问题。
* `last_queue_update` (`DateTime`) - 队列最后一次更新的时间。
* `absolute_delay` (`UInt64`) - 当前副本的滞后时长（秒）。
* `total_replicas` (`UInt8`) - 该表已知副本的总数量。
* `active_replicas` (`UInt8`) - 该表在 ClickHouse Keeper 中具有会话的副本数量（即正常工作的副本数量）。
* `lost_part_count` (`UInt64`) - 自建表以来所有副本在该表中丢失的数据分片总数。该值保存在 ClickHouse Keeper 中，只会增加。
* `last_queue_update_exception` (`String`) - 当队列中包含损坏条目时记录的最后异常消息。当 ClickHouse 在版本之间破坏向后兼容性，导致由新版本写入的日志条目无法被旧版本解析时，该字段尤其重要。
* `zookeeper_exception` (`String`) - 在从 ClickHouse Keeper 获取信息时发生错误时记录的最后异常消息。
* `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 一个从副本名称到该副本是否处于活动状态的映射。

如果你查询所有列，访问该表的速度可能会稍微慢一些，因为每一行都需要从 ClickHouse Keeper 进行多次读取。
如果你不查询最后 4 列（log&#95;max&#95;index、log&#95;pointer、total&#95;replicas、active&#95;replicas），访问该表会更快。

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

如果此查询未返回任何结果，就表示一切正常。
