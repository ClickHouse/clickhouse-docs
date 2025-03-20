---
description: '包含有关在本地服务器上驻留的副本表的信息和状态的系统表。用于监控。'
slug: /operations/system-tables/replicas
title: 'system.replicas'
keywords: ['system table', 'replicas']
---

包含有关在本地服务器上驻留的副本表的信息和状态。此表可用于监控。该表为每个 Replicated\* 表包含一行。

示例：

``` sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

``` text
查询 ID: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

行 1:
───────
数据库:                    db
表:                       test_table
引擎:                      ReplicatedMergeTree
是主节点:                   1
可以成为主节点:           1
只读:                 0
会话已过期:          0
未来分区:                0
待检查的分区:              0
zookeeper路径:              /test/test_table
副本名称:                r1
副本路径:                /test/test_table/replicas/r1
列版本:             -1
队列大小:                  27
队列中的插入:            27
队列中的合并:             0
队列中的分区变更:     0
队列最早时间:           2021-10-12 14:48:48
插入最早时间:         2021-10-12 14:48:48
合并最早时间:          1970-01-01 03:00:00
分区变更最早时间:  1970-01-01 03:00:00
要获取的最旧分区:          1_17_17_0
要合并到的最旧分区:
要变更到的最旧分区:
日志最大索引:               206
日志指针:                 207
最后的队列更新时间:           2021-10-12 14:50:08
绝对延迟:              99
总副本数:              5
活跃副本数:             5
丢失分区计数:             0
最后的队列更新时间异常:
zookeeper异常:
副本是否活跃:           {'r1':1,'r2':1}
```

列：

- `database` (`String`) - 数据库名称
- `table` (`String`) - 表名称
- `engine` (`String`) - 表引擎名称
- `is_leader` (`UInt8`) - 副本是否为主节点。
    多个副本可以同时成为主节点。通过 `merge_tree` 设置 `replicated_can_become_leader` 可以防止副本成为主节点。主节点负责调度后台合并。
    请注意，任何可用且在 ZK 中有会话的副本都可以执行写入操作，而不论它是否为主节点。
- `can_become_leader` (`UInt8`) - 副本是否可以成为主节点。
- `is_readonly` (`UInt8`) - 副本是否处于只读模式。
    如果配置中没有 ClickHouse Keeper 的部分，在重新初始化 ClickHouse Keeper 中的会话时发生未知错误，以及在 ClickHouse Keeper 中进行会话重新初始化时，此模式会被打开。
- `is_session_expired` (`UInt8`) - 与 ClickHouse Keeper 的会话已过期。基本上与 `is_readonly` 相同。
- `future_parts` (`UInt32`) - 将作为尚未完成的 INSERTs 或合并的结果出现的数据部分数量。
- `parts_to_check` (`UInt32`) - 待验证的数据部分数量。如果怀疑某个部分可能损坏，则将其放入验证队列。
- `zookeeper_path` (`String`) - ClickHouse Keeper 中表数据的路径。
- `replica_name` (`String`) - ClickHouse Keeper 中的副本名称。同一表的不同副本有不同的名称。
- `replica_path` (`String`) - ClickHouse Keeper 中副本数据的路径。与 'zookeeper_path/replicas/replica_path' 连接相同。
- `columns_version` (`Int32`) - 表结构的版本号。指示 ALTER 操作执行了多少次。如果副本具有不同的版本，则意味着某些副本尚未完成所有的 ALTER。
- `queue_size` (`UInt32`) - 等待执行操作的队列大小。操作包括插入数据块、合并和某些其他操作。它通常与 `future_parts` 一致。
- `inserts_in_queue` (`UInt32`) - 需要进行的插入数据块数量。插入通常被快速复制。如果这个数字很大，意味着出了问题。
- `merges_in_queue` (`UInt32`) - 等待执行的合并数量。有时合并过程较长，因此此值可能会长时间大于零。
- `part_mutations_in_queue` (`UInt32`) - 等待执行的变更数量。
- `queue_oldest_time` (`DateTime`) - 如果 `queue_size` 大于 0，显示最早的操作添加到队列的时间。
- `inserts_oldest_time` (`DateTime`) - 查看 `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - 查看 `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - 查看 `queue_oldest_time`

接下来的 4 列仅在与 ZK 有活跃会话时具有非零值。

- `log_max_index` (`UInt64`) - 一般活动日志中的最大条目编号。
- `log_pointer` (`UInt64`) - 副本复制到其执行队列的最大条目编号，再加一。如果 `log_pointer` 远小于 `log_max_index`，说明出了问题。
- `last_queue_update` (`DateTime`) - 队列最后一次更新的时间。
- `absolute_delay` (`UInt64`) - 当前副本的延迟（以秒为单位）。
- `total_replicas` (`UInt8`) - 此表已知的副本总数。
- `active_replicas` (`UInt8`) - 在 ClickHouse Keeper 中有会话的此表的副本数量（即，正常工作的副本数量）。
- `lost_part_count` (`UInt64`) - 自表创建以来表中所有副本丢失的数据部分数量。该值在 ClickHouse Keeper 中持久化，并只能增加。
- `last_queue_update_exception` (`String`) - 当队列包含损坏条目时的时间。特别重要的是当 ClickHouse 在版本之间破坏向后兼容性时，较新版本写入的日志条目无法被旧版本解析。
- `zookeeper_exception` (`String`) - 当从 ClickHouse Keeper 获取信息时发生错误时的最后异常消息。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 副本名称与副本是否活跃之间的映射。

如果您请求所有列，表可能会运行得有点慢，因为每行会从 ClickHouse Keeper 进行多次读取。如果不请求最后 4 列（log_max_index、log_pointer、total_replicas、active_replicas），表运行得很快。

例如，您可以通过以下方式检查一切是否正常工作：

``` sql
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

如果这个查询没有返回任何内容，意味着一切正常。

