---
'description': '系统表包含有关 MergeTree 表的变更及其进度的信息。每个变更命令由单个行表示。'
'keywords':
- 'system table'
- 'mutations'
'slug': '/operations/system-tables/mutations'
'title': 'system.mutations'
---


# system.mutations

该表包含有关 [mutations](/sql-reference/statements/alter/index.md#mutations) 的信息，这些 mutations 适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表及其进展。每个 mutation 命令由单个行表示。

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 应用 mutation 的数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 应用 mutation 的表名称。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — mutation 的 ID。对于副本表，这些 ID 对应于 ClickHouse Keeper 中 `<table_path_in_clickhouse_keeper>/mutations/` 目录中的 znode 名称。对于非副本表，这些 ID 对应于表的数据目录中的文件名。

- `command` ([String](/sql-reference/data-types/string.md)) — mutation 命令字符串（查询中 `ALTER TABLE [db.]table` 之后的部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交执行 mutation 命令的日期和时间。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于副本表的 mutations，数组包含分区的 ID（每个分区一个记录）。对于非副本表的 mutations，数组为空。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于副本表的 mutations，数组包含每个分区的记录，带有 mutation 获取的块号。只有包含小于该块号的块的部分将在分区中被变更。

    在非副本表中，所有分区的块号形成一个单一的序列。这意味着对于非副本表的 mutations，此列将包含一个记录，带有通过 mutation 获取的一个单一块号。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 需要变更的数据部分名称的数组，以便 mutation 完成。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 需要变更的数据部分数量，以便 mutation 完成。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示 mutation 是否已被终止。 **仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 并不一定意味着 mutation 已完全完成。可能存在一个 mutation 的状态为 `is_killed=1` 和 `is_done=0`，持续一段时间。这可能发生在另一个长时间运行的 mutation 阻塞了被终止的 mutation。这是一种正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示 mutation 是否完成的标志。可能的值：
    - `1` 表示 mutation 已完成，
    - `0` 表示 mutation 仍在进行中。

:::note
即使 `parts_to_do = 0`，也可能由于长时间运行的 `INSERT` 查询而导致副本表的 mutation 尚未完成，该查询将创建一个新的数据部分需要被变更。
:::

如果在变更某些数据部分时出现问题，以下列提供额外信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最新未能变更的部分的名称。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次部分变更失败的日期和时间。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一次部分变更失败的异常消息。

## Monitoring Mutations {#monitoring-mutations}

要跟踪 system.mutations 表的进展，请使用如下查询 — 这需要对 system.* 表的读取权限：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
将 `table='tmp'` 中的 `tmp` 替换为您所检查变更的表的名称。
:::

**另请参阅**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 家族
