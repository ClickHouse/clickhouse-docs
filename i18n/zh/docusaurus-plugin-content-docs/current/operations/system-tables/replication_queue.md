---
description: '系统表，记录了为 `ReplicatedMergeTree` 系列表在 ClickHouse Keeper 或 ZooKeeper 中存储的复制队列任务信息。'
keywords: ['系统表', 'replication_queue']
slug: /operations/system-tables/replication_queue
title: 'system.replication_queue'
doc_type: 'reference'
---

# system.replication&#95;queue

包含关于存储在 ClickHouse Keeper 或 ZooKeeper 中、属于 `ReplicatedMergeTree` 系列表的复制队列任务的信息。

Columns:

* `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

* `table` ([String](../../sql-reference/data-types/string.md)) — 表名。

* `replica_name` ([String](../../sql-reference/data-types/string.md)) — 在 ClickHouse Keeper 中的副本名称。同一张表的不同副本具有不同的名称。

* `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 任务在队列中的位置。

* `node_name` ([String](../../sql-reference/data-types/string.md)) — 在 ClickHouse Keeper 中的节点名称。

* `type` ([String](../../sql-reference/data-types/string.md)) — 队列中任务的类型，可能为：

  * `GET_PART` — 从其他副本获取数据分片。
  * `ATTACH_PART` — 附加数据分片，可能来自当前副本（如果在 `detached` 目录中找到）。可以将其视为带有一些优化的 `GET_PART`，因为两者几乎相同。
  * `MERGE_PARTS` — 合并数据分片。
  * `DROP_RANGE` — 删除指定分区中指定编号范围内的分片。
  * `CLEAR_COLUMN` — 注意：已弃用。从指定分区中删除特定列。
  * `CLEAR_INDEX` — 注意：已弃用。从指定分区中删除特定索引。
  * `REPLACE_RANGE` — 删除指定范围的分片并用新的分片替换。
  * `MUTATE_PART` — 对分片应用一个或多个变更。
  * `ALTER_METADATA` — 根据全局的 /metadata 和 /columns 路径应用 ALTER 修改。

* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 任务被提交执行的日期和时间。

* `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 等待任务完成并确认完成的副本数量。此列仅对 `GET_PARTS` 任务有效。

* `source_replica` ([String](../../sql-reference/data-types/string.md)) — 源副本名称。

* `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新分片名称。

* `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — 要进行合并或更新的分片名称。

* `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志，指示队列中是否存在 `DETACH_PARTS` 任务。

* `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志，指示某个特定任务当前是否正在执行。

* `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 尝试完成任务失败的次数。

* `last_exception` ([String](../../sql-reference/data-types/string.md)) — 上次发生错误的文本消息（如果有）。

* `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 上一次尝试执行该任务的日期和时间。

* `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 操作被推迟的次数。

* `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — 任务被推迟的原因。

* `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 任务上一次被推迟的日期和时间。

* `merge_type` ([String](../../sql-reference/data-types/string.md)) — 当前合并的类型。如果是变更操作则为空。

**示例**

```sql
SELECT * FROM system.replication_queue LIMIT 1 FORMAT Vertical;
```


```text
Row 1:
──────
database:               merge
table:                  visits_v2
replica_name:           mtgiga001-1t
position:               15
node_name:              queue-0009325559
type:                   MERGE_PARTS
create_time:            2020-12-07 14:04:21
required_quorum:        0
source_replica:         mtgiga001-1t
new_part_name:          20201130_121373_121384_2
parts_to_merge:         ['20201130_121373_121378_1','20201130_121379_121379_0','20201130_121380_121380_0','20201130_121381_121381_0','20201130_121382_121382_0','20201130_121383_121383_0','20201130_121384_121384_0']
is_detach:              0
is_currently_executing: 0
num_tries:              36
last_exception:         Code: 226, e.displayText() = DB::Exception: Marks file '/opt/clickhouse/data/merge/visits_v2/tmp_fetch_20201130_121373_121384_2/CounterID.mrk' does not exist (version 20.8.7.15 (official build))
last_attempt_time:      2020-12-08 17:35:54
num_postponed:          0
postpone_reason:
last_postpone_time:     1970-01-01 03:00:00
```

**另请参阅**

* [管理 ReplicatedMergeTree 表](/sql-reference/statements/system#managing-replicatedmergetree-tables)
