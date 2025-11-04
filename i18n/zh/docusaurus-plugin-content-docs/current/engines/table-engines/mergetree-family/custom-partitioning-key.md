---
'description': '学习如何为 MergeTree 表添加自定义分区键。'
'sidebar_label': '自定义分区键'
'sidebar_position': 30
'slug': '/engines/table-engines/mergetree-family/custom-partitioning-key'
'title': '自定义分区键'
'doc_type': 'guide'
---


# 自定义分区键

:::note
在大多数情况下，您不需要分区键，在大多数其他情况下，您不需要比按月份更细粒度的分区键。

您永远不应该使用过于细粒度的分区。不要根据客户标识符或名称对数据进行分区。相反，请将客户标识符或名称作为 ORDER BY 表达式中的第一列。
:::

分区可用于 [MergeTree 系列表](../../../engines/table-engines/mergetree-family/mergetree.md)，包括 [复制表](../../../engines/table-engines/mergetree-family/replication.md) 和 [物化视图](/sql-reference/statements/create/view#materialized-view)。

分区是将表中的记录按指定标准进行逻辑组合。您可以根据任意标准设置分区，例如按月份、按天或按事件类型。每个分区单独存储，以简化对这些数据的操作。在访问数据时，ClickHouse 会使用尽可能小的分区子集。对于包含分区键的查询，分区可以提高性能，因为 ClickHouse 会在选择分区内的部分和颗粒之前对该分区进行过滤。

在 [创建表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 时，可以在 `PARTITION BY expr` 子句中指定分区。分区键可以是表列中的任何表达式。例如，要按月份指定分区，可以使用表达式 `toYYYYMM(date_column)`：

```sql
CREATE TABLE visits
(
    VisitDate Date,
    Hour UInt8,
    ClientID UUID
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(VisitDate)
ORDER BY Hour;
```

分区键也可以是表达式的元组（类似于 [主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)）。例如：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

在这个例子中，我们根据当前周发生的事件类型设置分区。

默认情况下，不支持浮点数分区键。要使用它，请启用设置 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)。

插入新数据到表时，这些数据作为按主键排序的独立部分（块）存储。在插入后的 10-15 分钟内，相同分区的部分将被合并为完整部分。

:::info
仅对具有相同分区表达式值的数据部分进行合并。这意味着 **您不应该创建过于细粒度的分区**（超过大约一千个分区）。否则，`SELECT` 查询的性能会受到影响，因为文件系统中的文件数量和打开的文件描述符过大。
:::

使用 [system.parts](../../../operations/system-tables/parts.md) 表查看表的部分和分区。例如，假设我们有一个以月份分区的 `visits` 表。让我们对 `system.parts` 表执行 `SELECT` 查询：

```sql
SELECT
    partition,
    name,
    active
FROM system.parts
WHERE table = 'visits'
```

```text
┌─partition─┬─name──────────────┬─active─┐
│ 201901    │ 201901_1_3_1      │      0 │
│ 201901    │ 201901_1_9_2_11   │      1 │
│ 201901    │ 201901_8_8_0      │      0 │
│ 201901    │ 201901_9_9_0      │      0 │
│ 201902    │ 201902_4_6_1_11   │      1 │
│ 201902    │ 201902_10_10_0_11 │      1 │
│ 201902    │ 201902_11_11_0_11 │      1 │
└───────────┴───────────────────┴────────┘
```

`partition` 列包含分区的名称。在这个例子中有两个分区：`201901` 和 `201902`。您可以使用此列的值在 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 查询中指定分区名称。

`name` 列包含分区数据部分的名称。您可以使用此列在 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 查询中指定部分的名称。

我们来分解部分的名称：`201901_1_9_2_11`：

- `201901` 是分区名称。
- `1` 是数据块的最小编号。
- `9` 是数据块的最大编号。
- `2` 是块级别（它由合并树形成的深度）。
- `11` 是变更版本（如果部分发生变更）

:::info
旧类型表的部分名称为：`20190117_20190123_2_2_0`（最小日期 - 最大日期 - 最小块编号 - 最大块编号 - 级别）。
:::

`active` 列显示部分的状态。`1` 表示活动；`0` 表示非活动。例如，合并到较大部分后，剩下的源部分就是非活动部分。损坏的数据部分也会标记为非活动。

如您所见，在这个例子中，同一分区有几个独立的部分（例如，`201901_1_3_1` 和 `201901_1_9_2`）。这意味着这些部分尚未合并。ClickHouse 会定期合并插入的数据部分，约在插入后 15 分钟之后。此外，您可以使用 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 查询执行非计划合并。例如：

```sql
OPTIMIZE TABLE visits PARTITION 201902;
```

```text
┌─partition─┬─name─────────────┬─active─┐
│ 201901    │ 201901_1_3_1     │      0 │
│ 201901    │ 201901_1_9_2_11  │      1 │
│ 201901    │ 201901_8_8_0     │      0 │
│ 201901    │ 201901_9_9_0     │      0 │
│ 201902    │ 201902_4_6_1     │      0 │
│ 201902    │ 201902_4_11_2_11 │      1 │
│ 201902    │ 201902_10_10_0   │      0 │
│ 201902    │ 201902_11_11_0   │      0 │
└───────────┴──────────────────┴────────┘
```

非活动部分将在合并后约 10 分钟内被删除。

查看部分和分区的另一种方法是进入表的目录：`/var/lib/clickhouse/data/<database>/<table>/`。例如：

```bash
/var/lib/clickhouse/data/default/visits$ ls -l
total 40
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 201901_1_3_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201901_1_9_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_8_8_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_9_9_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_10_10_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_11_11_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:19 201902_4_11_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 12:09 201902_4_6_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 detached
```

目录中的 '201901_1_1_0'、'201901_1_7_1' 等是部分的目录。每个部分与对应的分区相关，只包含某个月的数据（这个例子的表是按月份分区的）。

`detached` 目录包含通过 [DETACH](/sql-reference/statements/detach) 查询从表中分离的部分。损坏的部分也会移到此目录，而不是被删除。服务器不会使用 `detached` 目录中的部分。您可以随时在此目录中添加、删除或修改数据 – 服务器在您运行 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 查询之前不会知道这些。

请注意，在运行服务器上，您不能手动更改文件系统上的部分集或其数据，因为服务器不会知道这一点。对于非复制表，您可以在服务器停止时执行此操作，但不建议这样做。对于复制表，部分集在任何情况下都不能更改。

ClickHouse 允许您对分区执行操作：删除它们、从一个表复制到另一个表或创建备份。有关所有操作的列表，请参见 [对分区和部分的操作](/sql-reference/statements/alter/partition) 部分。

## 使用分区键的 Group By 优化 {#group-by-optimisation-using-partition-key}

对于某些表的分区键与查询的 group by 键组合，可能可以独立地为每个分区执行聚合。
这样，我们在最后就不需要合并来自所有执行线程的部分聚合数据，
因为我们有保证每个 group by 键值不能出现在两个不同线程的工作集中。

典型例子是：

```sql
CREATE TABLE session_log
(
    UserID UInt64,
    SessionID UUID
)
ENGINE = MergeTree
PARTITION BY sipHash64(UserID) % 16
ORDER BY tuple();

SELECT
    UserID,
    COUNT()
FROM session_log
GROUP BY UserID;
```

:::note
此类查询的性能在很大程度上取决于表的布局。因此，优化默认情况下未启用。
:::

良好性能的关键因素：

- 查询中涉及的分区数量应足够大（超过 `max_threads / 2`），否则查询将未充分利用机器
- 分区不应过小，以免批处理变成逐行处理
- 分区应在大小上相当，因此所有线程大致执行相同数量的工作

:::info
建议对 `partition by` 子句中的列应用某种哈希函数，以便在分区之间均匀分布数据。
:::

相关设置包括：

- `allow_aggregate_partitions_independently` - 控制优化使用是否启用
- `force_aggregate_partitions_independently` - 在从正确性角度适用时强制使用，即使因内部逻辑评估其合理性而被禁用
- `max_number_of_partitions_for_independent_aggregation` - 表可以拥有的最大分区数量的硬限制
