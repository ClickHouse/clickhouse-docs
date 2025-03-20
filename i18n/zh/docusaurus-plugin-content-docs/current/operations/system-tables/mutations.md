---
description: '包含有关 MergeTree 表的变更及其进度的信息的系统表。每个变更命令由一行表示。'
slug: /operations/system-tables/mutations
title: 'system.mutations'
keywords: ['system table', 'mutations']
---

该表包含有关 [mutations](/sql-reference/statements/alter/index.md#mutations) 的 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表及其进度的信息。每个变更命令由一行表示。

## 列: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 应用变更的数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 应用变更的表名称。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更的 ID。对于复制表，这些 ID 对应于 ClickHouse Keeper 中 `<table_path_in_clickhouse_keeper>/mutations/` 目录下的 znode 名称。对于非复制表，这些 ID 对应于表的数据目录中的文件名称。

- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串（查询中 `ALTER TABLE [db.]table` 之后的部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交变更命令执行的日期和时间。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表，该数组包含分区的 ID（每个分区一条记录）。对于非复制表，该数组为空。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表，该数组为每个分区包含一条记录，记录由变更获取的区块编号。只有包含编号小于此编号的区块的 parts 才会在分区中被变更。

    在非复制表中，所有分区中的块编号形成一个单一的序列。这意味着对于非复制表的变更，列将包含一条记录，记录由变更获取的单个块编号。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 需要变更以完成操作的数据信息部分的名称数组。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 需要变更以完成操作的数据部分数量。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 表示变更是否已被终止。**仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 不一定意味着变更已经完全完成。变更可能会保持在 `is_killed=1` 且 `is_done=0` 的状态一段时间。如果另一个长时间运行的变更阻碍了被终止的变更，这种情况是正常的。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 表示变更是否完成的标志。可能值：
    - `1` 如果变更已完成，
    - `0` 如果变更仍在进行中。

:::note
即使 `parts_to_do = 0`，也有可能由于长时间运行的 `INSERT` 查询导致复制表的变更尚未完成，该查询将创建一个新的数据部分需要变更。
:::

如果在变更某些数据部分时出现问题，以下列将包含额外信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最近一个无法变更的部分的名称。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次部分变更失败的日期和时间。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一部分变更失败的异常消息。

## 监控变更 {#monitoring-mutations}

要跟踪 system.mutations 表上的进度，请使用以下查询 — 这需要对 system.* 表的读取权限：

``` sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
在 `table='tmp'` 中将 `tmp` 替换为您要检查变更的表的名称。
:::

**另见**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 系列
