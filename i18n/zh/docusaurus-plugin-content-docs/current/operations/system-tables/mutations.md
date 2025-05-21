---
'description': 'MergeTree表变动及其进度信息的系统表。每个变动命令由一行表示。'
'keywords':
- 'system table'
- 'mutations'
'slug': '/operations/system-tables/mutations'
'title': 'system.mutations'
---




# system.mutations

该表包含有关[变更]( /sql-reference/statements/alter/index.md#mutations)的[MergeTree]( /engines/table-engines/mergetree-family/mergetree.md)表及其进度的信息。每个变更命令由单行表示。

## 列: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 变更应用的数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 变更应用的表名称。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 变更的ID。对于复制表，这些ID对应于ClickHouse Keeper中`<table_path_in_clickhouse_keeper>/mutations/`目录中的znode名称。对于非复制表，IDs对应于表数据目录中的文件名。

- `command` ([String](/sql-reference/data-types/string.md)) — 变更命令字符串（查询中`ALTER TABLE [db.]table`之后的部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 提交变更命令执行的日期和时间。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 对于复制表，数组包含分区的ID（每个分区一个记录）。对于非复制表，数组为空。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 对于复制表，数组包含每个分区的一个记录，包括变更所获取的块编号。只有包含编号小于该编号的块的部分会在分区中被变更。

    在非复制表中，所有分区的块编号形成一个单一的序列。这意味着对于非复制表的变更，该列将包含一个记录，其包含变更所获取的块编号。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 需要被变更的数据部分的名称数组，以便变更完成。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 需要被变更的数据部分的数量，以便变更完成。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示变更是否被杀死。**仅在 ClickHouse Cloud 中可用。**

:::note 
`is_killed=1` 不一定意味着变更已完全终止。变更可能会保持在`is_killed=1`和`is_done=0`的状态很长时间。如果另一个长时间运行的变更阻止了被杀死的变更，这种情况是可能发生的。这是一种正常情况。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 表示变更是否完成的标志。可能的值：
    - `1` 如果变更已完成，
    - `0` 如果变更仍在进行中。

:::note
即使`parts_to_do = 0`，也可能因为一个长时间运行的`INSERT`查询创建了需要被变更的新数据部分，而导致复制表的变更尚未完成。
:::

如果在变更某些数据部分时遇到问题，以下列包含额外信息：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最近无法变更的部分名称。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最近一次部分变更失败的日期和时间。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 导致最近一次部分变更失败的异常消息。

## 监控变更 {#monitoring-mutations}

要跟踪 system.mutations 表的进度，请使用如下查询 - 这需要对 system.* 表的读取权限：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
在`table='tmp'`中将`tmp`替换为您正在检查变更的表的名称。
:::

**另请参阅**

- [变更]( /sql-reference/statements/alter/index.md#mutations)
- [MergeTree]( /engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [ReplicatedMergeTree]( /engines/table-engines/mergetree-family/replication.md) 家族
