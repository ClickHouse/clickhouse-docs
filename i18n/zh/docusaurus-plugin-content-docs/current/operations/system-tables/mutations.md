---
description: '包含 MergeTree 表变更（mutation）及其进度信息的系统表。每条变更命令对应一行。'
keywords: ['system table', 'mutations']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations {#systemmutations}

该表包含 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表的[变更](/sql-reference/statements/alter/index.md#mutations)及其执行进度的信息。每条变更命令在该表中对应一行记录。

## 列 {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 应用变更操作的数据库名称。
- `table` ([String](/sql-reference/data-types/string.md)) — 应用变更操作的表名称。
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更操作的 ID。对于复制表,这些 ID 对应于 ClickHouse Keeper 中 `<table_path_in_clickhouse_keeper>/mutations/` 目录下的 znode 名称。对于非复制表,这些 ID 对应于表数据目录中的文件名。
- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串(`ALTER TABLE [db.]table` 之后的查询部分)。
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交变更命令执行的日期和时间。
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表的变更操作,该数组包含分区的 ID(每个分区一条记录)。对于非复制表的变更操作,该数组为空。
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表的变更操作,该数组为每个分区包含一条记录,其中包含变更操作获取的块编号。分区中只有包含编号小于此编号的块的数据部分才会被变更。在非复制表中,所有分区的块编号形成单一序列。这意味着对于非复制表的变更操作,该列将包含一条记录,其中包含变更操作获取的单个块编号。
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 需要变更才能完成变更操作的数据部分名称数组。
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 需要变更才能完成变更操作的数据部分数量。
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更操作是否已被终止。**仅在 ClickHouse Cloud 中可用。**

:::note
`is_killed=1` 并不一定意味着变更操作已完全结束。变更操作可能会在较长时间内保持 `is_killed=1` 和 `is_done=0` 的状态。如果另一个长时间运行的变更操作阻塞了已终止的变更操作,就会发生这种情况。这是正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更操作是否完成的标志。可能的值:
  - `1` 表示变更操作已完成,
  - `0` 表示变更操作仍在进行中。

:::note
即使 `parts_to_do = 0`,复制表的变更操作也可能尚未完成,因为长时间运行的 `INSERT` 查询会创建需要变更的新数据部分。
:::

如果在变更某些数据部分时出现问题,以下列包含附加信息:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 无法变更的最新数据部分的名称。
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次数据部分变更失败的日期和时间。
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一次数据部分变更失败的异常消息。

## 监控 Mutation {#monitoring-mutations}

要跟踪 `system.mutations` 表中的进度,请使用以下查询:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- 或

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

注意:这需要对 `system.*` 表具有读取权限。

:::tip Cloud 使用说明
在 ClickHouse Cloud 中,每个节点上的 `system.mutations` 表都包含集群中的所有 mutation,因此无需使用 `clusterAllReplicas`。
:::

**另请参阅**

- [Mutation](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 系列
