
# system.mutations

该表包含关于 [mutations](/sql-reference/statements/alter/index.md#mutations) 以及 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表的进度的信息。每个变更命令用一行表示。

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 应用变更的数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 应用变更的表名称。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更的 ID。对于复制表，这些 ID 对应于 ClickHouse Keeper 中 `<table_path_in_clickhouse_keeper>/mutations/` 目录中的 znode 名称。对于非复制表，这些 ID 对应于表的数据目录中的文件名称。

- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串（查询中 `ALTER TABLE [db.]table` 之后的部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交变更命令执行的日期和时间。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表的变更，数组包含分区的 ID（每个分区一条记录）。对于非复制表，数组为空。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表的变更，数组为每个分区包含一条记录，记录变更所获得的区块编号。只有包含小于此编号的区块的部分将在分区中被变更。

    在非复制表中，所有分区的区块编号形成一个单一的序列。这意味着对于非复制表的变更，该列将包含一条记录，记录变更所获得的单个区块编号。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 一个需要被变更的部分名称数组，以完成变更。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 完成变更所需变更的部分数量。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更是否被终止。 **仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 并不意味着变更已经完全完成。变更可能会保持在 `is_killed=1` 且 `is_done=0` 的状态较长时间。这可能发生在另一个长时间运行的变更阻塞了已终止的变更。这是一种正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 变更是否完成的标志。可能的值：
    - `1` 如果变更已完成，
    - `0` 如果变更仍在进行中。

:::note
即使 `parts_to_do = 0`，复制表的变更仍可能未完成，原因可能是正在进行的长时间 `INSERT` 查询，这会创建需要被变更的新数据部分。
:::

如果在对某些数据部分进行变更时遇到问题，以下列将包含额外信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最近一个无法被变更的部分名称。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次部分变更失败的日期和时间。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一次部分变更失败的异常信息。

## Monitoring Mutations {#monitoring-mutations}

要跟踪 system.mutations 表的进度，可以使用以下查询 - 这需要对 system.* 表的读取权限：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
将 `table='tmp'` 中的 `tmp` 替换为您正在检查变更的表的名称。
:::

**另见**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 系列
