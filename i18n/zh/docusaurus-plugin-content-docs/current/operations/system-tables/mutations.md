---
'description': '系统表包含有关 MergeTree 表及其进度的变化的信息。每个变化命令由一行表示。'
'keywords':
- 'system table'
- 'mutations'
'slug': '/operations/system-tables/mutations'
'title': 'system.mutations'
'doc_type': 'reference'
---


# system.mutations

该表包含关于[变更]( /sql-reference/statements/alter/index.md#mutations)的[MergeTree]( /engines/table-engines/mergetree-family/mergetree.md)表及其进度的信息。每个变更命令由一行表示。

## 列: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 变更应用的数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 变更应用的表名称。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更的 ID。对于复制表，这些 ID 对应于 ClickHouse Keeper 中`<table_path_in_clickhouse_keeper>/mutations/`目录中的 znode 名称。对于非复制表，ID 对应于表的数据目录中的文件名。

- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串（`ALTER TABLE [db.]table`后查询的部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 变更命令提交执行的日期和时间。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表，数组包含分区的 ID（每个分区一个记录）。对于非复制表，数组为空。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表，数组为每个分区包含一个记录，记录显示变更获得的区块编号。只有包含小于该编号的区块的部分将会在该分区内被变更。

    在非复制表中，所有分区的区块编号形成一个单一序列。这意味着对于非复制表的变更，该列将包含一个记录，其中记录为变更获得的单个区块编号。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 需要被变更以完成变更的部分名称数组。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 需要被变更的部分数量以完成变更。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 表示变更是否已被终止。**仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 并不一定意味着变更已完全终止。变更可能保持在 `is_killed=1` 和 `is_done=0` 的状态较长时间。这可能发生在另一个运行时间较长的变更阻塞了被终止的变更。这是一种正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 表示变更是否完成的标志。可能的值：
  - `1` 表示变更已完成，
  - `0` 表示变更仍在进行中。

:::note
即使 `parts_to_do = 0`，复制表的变更可能仍未完成，因为有一个长时间运行的 `INSERT` 查询，这将创建一个需要被变更的新数据部分。
:::

如果在变更某些数据部分时出现问题，以下列将包含额外的信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最近无法变更的部分名称。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近的部分变更失败的日期和时间。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近部分变更失败的异常消息。

## 监控变更 {#monitoring-mutations}

要跟踪 system.mutations 表的进度，可以使用如下查询 - 这需要对 system.* 表的读取权限：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
将 `table='tmp'` 中的 `tmp` 替换为您正在检查变更的表的名称。
:::

**另见**

- [变更]( /sql-reference/statements/alter/index.md#mutations)
- [MergeTree]( /engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree]( /engines/table-engines/mergetree-family/replication.md) 系列
