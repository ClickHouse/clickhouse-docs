---
description: '包含 MergeTree 表变更及其执行进度信息的系统表。每条变更命令对应一行记录。'
keywords: ['系统表', '变更']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations

该表包含 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表的 [变更（mutation）](/sql-reference/statements/alter/index.md#mutations) 及其执行进度的相关信息。每条变更命令在表中对应一行记录。

## 列：\{#columns\}

- `database` ([String](/sql-reference/data-types/string.md)) — 应用变更操作的数据库名称。
- `table` ([String](/sql-reference/data-types/string.md)) — 应用变更操作的表名称。
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更操作的 ID。对于复制表，这些 ID 对应于 ClickHouse Keeper 中 `<table_path_in_clickhouse_keeper>/mutations/` 目录下的 znode 名称。对于非复制表，这些 ID 对应于该表数据目录中的文件名。
- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串（查询中 `ALTER TABLE [db.]table` 之后的部分）。
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交变更命令进行执行的日期和时间。
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表的变更，此数组包含各分区的 ID（每个分区一条记录）。对于非复制表的变更，此数组为空。
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表的变更，此数组对每个分区包含一条记录，其中为该变更获取到的块号。在该分区中，仅包含块号小于该值的块的数据部分会被变更。在非复制表中，所有分区的块号构成一个单一序列。这意味着对于非复制表的变更，该列只会包含一条记录，其中为该变更获取到的单个块号。
- `parts_in_progress_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 正在被变更的数据部分名称数组。
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 为完成该变更仍需变更的数据部分名称数组。
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 为完成该变更仍需变更的数据部分数量。
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更操作是否已被终止。**仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 并不一定意味着变更已完全结束。变更有可能在较长时间内保持 `is_killed=1` 且 `is_done=0` 的状态。如果有另一个长时间运行的变更阻塞了已终止的变更，就可能出现这种情况。这属于正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更操作是否已完成的标志。可能的取值：
  - `1` 表示变更已完成，
  - `0` 表示变更仍在进行中。

:::note
即使 `parts_to_do = 0`，对于复制表的变更，也有可能尚未完成，这是因为可能存在一个长时间运行的 `INSERT` 查询，它将创建一个新的、需要被变更的数据部分。
:::

如果在变更某些数据部分时出现问题，下列列会包含附加信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最近一次无法被变更的数据部分名称。
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次数据部分变更失败的日期和时间。
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一次数据部分变更失败的异常消息。

## 监控变更（Mutations）

要跟踪 `system.mutations` 表中的执行进度，请使用以下查询：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- 或

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

注意：这需要对 `system.*` 表具有读取权限。

:::tip 云环境使用说明
在 ClickHouse Cloud 中，每个节点上的 `system.mutations` 表都包含集群中的所有 mutation，因此不需要使用 `clusterAllReplicas`。
:::

**另请参阅**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
* [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 系列表引擎
