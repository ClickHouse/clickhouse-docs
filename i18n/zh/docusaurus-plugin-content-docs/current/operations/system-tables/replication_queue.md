
# system.replication_queue

包含来自 ClickHouse Keeper 或 ZooKeeper 的复制队列中任务的信息，适用于 `ReplicatedMergeTree` 家族的表。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表的名称。

- `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 中的副本名称。相同表的不同副本具有不同的名称。

- `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 队列中任务的位置。

- `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 中的节点名称。

- `type` ([String](../../sql-reference/data-types/string.md)) — 队列中任务的类型，可能是：

    - `GET_PART` — 从另一个副本获取部分数据。
    - `ATTACH_PART` — 附加部分数据，可能来自我们自己的副本（如果在 `detached` 文件夹中找到）。您可以将其视为带有一些优化的 `GET_PART`，因为它们几乎是相同的。
    - `MERGE_PARTS` — 合并部分数据。
    - `DROP_RANGE` — 删除指定区间指定分区中的部分数据。
    - `CLEAR_COLUMN` — 注意：已弃用。从指定分区中删除特定列。
    - `CLEAR_INDEX` — 注意：已弃用。从指定分区中删除特定索引。
    - `REPLACE_RANGE` — 删除一定范围的部分数据并用新数据替换它们。
    - `MUTATE_PART` — 对部分数据应用一个或多个变更。
    - `ALTER_METADATA` — 根据全局的 /metadata 和 /columns 路径应用变更。

- `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 提交执行任务的日期和时间。

- `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 等待任务完成及确认的副本数量。此列仅与 `GET_PARTS` 任务相关。

- `source_replica` ([String](../../sql-reference/data-types/string.md)) — 源副本名称。

- `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新部分名称。

- `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — 要合并或更新的部分名称。

- `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 此标志指示 `DETACH_PARTS` 任务是否在队列中。

- `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 此标志指示特定任务当前是否正在执行。

- `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 完成任务的失败尝试次数。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 有关上一个发生的错误的文本消息（如果有的话）。

- `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 上一次尝试该任务的日期和时间。

- `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 动作被推迟的次数。

- `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — 任务推迟的原因。

- `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 任务上次被推迟的日期和时间。

- `merge_type` ([String](../../sql-reference/data-types/string.md)) — 当前合并的类型。如果是变更则为空。

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

**另请参见**

- [管理 ReplicatedMergeTree 表](/sql-reference/statements/system#managing-replicatedmergetree-tables)
