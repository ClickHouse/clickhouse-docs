---
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
sidebar_position: 30
sidebar_label: 自定义分区键
title: '自定义分区键'
description: '了解如何为 MergeTree 表添加自定义分区键。'
---


# 自定义分区键

:::note
在大多数情况下，您不需要分区键，并且在大多数其他情况下，您不需要比按月更细粒度的分区键。

您永远不应使用过于细粒度的分区。不要根据客户端标识符或名称对数据进行分区。相反，可以将客户端标识符或名称作为 ORDER BY 表达式中的第一列。
:::

分区适用于 [MergeTree 家族表](../../../engines/table-engines/mergetree-family/mergetree.md)，包括 [复制表](../../../engines/table-engines/mergetree-family/replication.md) 和 [物化视图](/sql-reference/statements/create/view#materialized-view)。

分区是将表中的记录按指定条件进行逻辑组合。您可以根据任意条件进行分区，例如按月、按日或按事件类型。每个分区被单独存储，以简化对这些数据的操作。当访问数据时，ClickHouse 使用尽可能小的分区子集。分区提高了包含分区键的查询的性能，因为 ClickHouse 会在选择分区内的部分和粒度之前过滤该分区。

在 [创建表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 时，可以在 `PARTITION BY expr` 子句中指定分区。分区键可以是来自表列的任何表达式。例如，要按月进行分区，可以使用表达式 `toYYYYMM(date_column)`：

``` sql
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

``` sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

在此示例中，我们按本周发生的事件类型进行分区。

默认情况下，不支持浮点分区键。要使用它，启用设置 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)。

向表中插入新数据时，这些数据作为按主键排序的单独部分（块）存储。在插入后 10-15 分钟内，相同分区的部分会合并为整个部分。

:::info
合并仅适用于在分区表达式上具有相同值的数据部分。这意味着 **您不应创建过于精细的分区**（超过大约一千个分区）。否则，`SELECT` 查询的性能会很差，因为文件系统中的文件数量和打开的文件描述符过多。
:::

使用 [system.parts](../../../operations/system-tables/parts.md) 表查看表的部分和分区。例如，假设我们有一个按月分区的 `visits` 表。让我们执行 `system.parts` 表的 `SELECT` 查询：

``` sql
SELECT
    partition,
    name,
    active
FROM system.parts
WHERE table = 'visits'
```

``` text
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

`partition` 列包含分区的名称。在此示例中有两个分区：`201901` 和 `201902`。您可以使用此列值在 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 查询中指定分区名称。

`name` 列包含分区数据部分的名称。您可以使用此列在 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 查询中指定部分的名称。

让我们分解部分名：`201901_1_9_2_11`：

- `201901` 是分区名称。
- `1` 是数据块的最小编号。
- `9` 是数据块的最大编号。
- `2` 是块级别（它所形成的合并树的深度）。
- `11` 是变更版本（如果一个部分发生了变更）。

:::info
旧类型表的部分名称为：`20190117_20190123_2_2_0`（最小日期 - 最大日期 - 最小块编号 - 最大块编号 - 级别）。
:::

`active` 列显示部分的状态。`1` 是活动的；`0` 是非活动的。例如，合并后留下的源部分就是非活动的。损坏的数据部分也被标记为非活动。

如示例所示，同一分区有几个分开的部分（例如，`201901_1_3_1` 和 `201901_1_9_2`）。这意味着这些部分尚未合并。ClickHouse 会定期合并插入的数据部分，大约在插入后 15 分钟。此外，您可以使用 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 查询执行非计划合并。例如：

``` sql
OPTIMIZE TABLE visits PARTITION 201902;
```

``` text
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

非活动部分将在合并后大约 10 分钟后被删除。

查看部分和分区的另一种方法是进入表的目录：`/var/lib/clickhouse/data/<database>/<table>/`。例如：

``` bash
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

`201901_1_1_0`、`201901_1_7_1` 等文件夹是部分的目录。每个部分与相应的分区相关，并且仅包含某个月的数据（本示例中的表按月分区）。

`detached` 目录包含使用 [DETACH](/sql-reference/statements/detach) 查询从表中分离的部分。损坏的部分也会移动到该目录，而不是被删除。服务器不会使用 `detached` 目录中的部分。您可以随时在该目录中添加、删除或修改数据 – 服务器不会知道，直到您运行 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 查询。

请注意，在运行的服务器上，您无法手动更改文件系统上的部分或其数据，因为服务器不会知道。对于非复制表，在服务器停止时可以这样做，但不推荐。对于复制表，部分集在任何情况下都不能更改。

ClickHouse 允许您对分区执行操作：删除它们、从一个表复制到另一个表，或创建备份。有关所有操作的列表，请参见 [Manipulations With Partitions and Parts](/sql-reference/statements/alter/partition) 部分。

## 使用分区键的 GROUP BY 优化 {#group-by-optimisation-using-partition-key}

对于某些表的分区键和查询的 group by 键的组合，可能可以独立对每个分区执行聚合。
这样，我们就不必在最后合并所有执行线程中的部分聚合数据，
因为我们保证每个 group by 键值不会出现在两个不同线程的工作集里。

典型示例是：

``` sql
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
此类查询的性能在很大程度上取决于表的布局。因此，该优化默认情况下未启用。
:::

良好性能的关键因素：

- 涉及的分区数量应该足够大（大于 `max_threads / 2`），否则查询将未充分利用机器
- 分区不应过小，以免批处理退化为逐行处理
- 分区应该相似大小，以便所有线程大致执行相同量的工作

:::info
建议对 `partition by` 子句中的列应用某些哈希函数，以便在分区之间均匀分配数据。
:::

相关设置为：

- `allow_aggregate_partitions_independently` - 控制是否启用优化的使用
- `force_aggregate_partitions_independently` - 在正确性角度适用时强制使用，但由于内部逻辑评估其合理性而被禁用
- `max_number_of_partitions_for_independent_aggregation` - 表可以拥有的最大分区数量的硬限制

