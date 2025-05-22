---
'description': '了解如何将自定义分区键添加到 MergeTree 表。'
'sidebar_label': '自定义分区键'
'sidebar_position': 30
'slug': '/engines/table-engines/mergetree-family/custom-partitioning-key'
'title': '自定义分区键'
---


# 自定义分区键

:::note
在大多数情况下，您无需分区键，而在其他大多数情况下，您不需要比按月更细粒度的分区键。

您绝不应使用过于细粒度的分区。不要按客户标识符或名称对数据进行分区。相反，将客户标识符或名称放在 ORDER BY 表达式的第一列中。
:::

分区对于 [MergeTree 家族表](../../../engines/table-engines/mergetree-family/mergetree.md) 可用，包括 [复制表](../../../engines/table-engines/mergetree-family/replication.md) 和 [物化视图](/sql-reference/statements/create/view#materialized-view)。

分区是按指定标准对表中记录的逻辑组合。您可以通过任意标准设置分区，例如按月、按天或按事件类型。每个分区单独存储，以简化对该数据的操作。在访问数据时，ClickHouse 使用尽可能小的分区子集。分区提高了包含分区键的查询性能，因为 ClickHouse 会在选择分区内的 parts 和 granules 之前过滤出该分区。

在 [创建表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 时，使用 `PARTITION BY expr` 子句指定分区。分区键可以是表列中的任何表达式。例如，要按月指定分区，可以使用表达式 `toYYYYMM(date_column)`：

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

在此示例中，我们设置按当前周发生的事件类型进行分区。

默认情况下，不支持浮点分区键。要使用它，请启用设置 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)。

当向表中插入新数据时，这些数据作为按主键排序的单独部分（块）存储。在插入后的 10-15 分钟后，同一分区的部分会合并为整个部分。

:::info
合并仅适用于在分区表达式上具有相同值的数据部分。这意味着 **您不应创建过于细粒度的分区**（大约超过一千个分区）。否则，`SELECT` 查询的性能会很差，因为文件系统中存在不合理数量的文件和打开的文件描述符。
:::

使用 [system.parts](../../../operations/system-tables/parts.md) 表查看表的部分和分区。例如，假设我们有一个按月分区的 `visits` 表。让我们对 `system.parts` 表执行 `SELECT` 查询：

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

`partition` 列包含分区的名称。在此示例中有两个分区：`201901` 和 `201902`。您可以使用此列值在 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 查询中指定分区名称。

`name` 列包含分区数据部分的名称。您可以使用此列在 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 查询中指定部分的名称。

让我们分解部分名称：`201901_1_9_2_11`：

- `201901` 是分区名称。
- `1` 是数据块的最小编号。
- `9` 是数据块的最大编号。
- `2` 是块级别（它形成的合并树深度）。
- `11` 是变更版本（如果部分已变更）

:::info
旧类型表的部分名称为：`20190117_20190123_2_2_0`（最小日期 - 最大日期 - 最小块编号 - 最大块编号 - 级别）。
:::

`active` 列显示部分的状态。`1` 为活动；`0` 为非活动。例如，合并到较大部分后的源部分会变为非活动。损坏的数据部分也标识为非活动。

正如示例所示，同一分区存在几个独立的部分（例如，`201901_1_3_1` 和 `201901_1_9_2`）。这意味着这些部分尚未合并。ClickHouse 会定期合并已插入的数据部分，约 15 分钟后。在此基础上，您可以通过 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 查询执行非计划的合并。示例：

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

非活动部分将在合并后大约 10 分钟删除。

查看一组部分和分区的另一种方法是进入表的目录：`/var/lib/clickhouse/data/<database>/<table>/`。例如：

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

文件夹 '201901_1_1_0'、'201901_1_7_1' 等是部分的目录。每个部分属于相应的分区，并仅包含特定月份的数据（此示例中的表按月分区）。

`detached` 目录包含通过 [DETACH](/sql-reference/statements/detach) 查询从表中分离的部分。损坏的部分也移动到该目录，而不是被删除。服务器不使用 `detached` 目录中的部分。您可以在此目录中随时添加、删除或修改数据 – 直到您运行 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 查询，服务器才会知道。

请注意，在运行的服务器上，您不能手动更改文件系统中部分或其数据的集合，因为服务器不会了解此情况。对于非复制表，您可以在服务器停止时执行此操作，但不推荐这样做。在任何情况下，对于复制表，则无法更改部分的集合。

ClickHouse 允许您对分区执行操作：删除、从一个表复制到另一个表或创建备份。请参见 [对分区和部分的操作]( /sql-reference/statements/alter/partition) 部分中的所有操作列表。

## 使用分区键的 Group By 优化 {#group-by-optimisation-using-partition-key}

对于某些表的分区键和查询的分组键组合，可以独立地针对每个分区执行聚合。
然后，我们不必在最后合并所有执行线程的部分聚合数据，因为我们提供了保证，确保每个分组键值不会出现在两个不同线程的工作集中的情况。

一个典型的例子是：

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
此类查询的性能在很大程度上依赖于表的布局。因此，优化默认未启用。
:::

良好性能的关键因素：

- 查询中涉及的分区数量应足够大（大于 `max_threads / 2`），否则查询将无法充分利用该机器
- 分区不应太小，以免批处理降级为逐行处理
- 分区应在大小上可比，以便所有线程大致完成相同工作量

:::info
建议对 `partition by` 子句中的列应用某些哈希函数，以便在分区之间均匀分配数据。
:::

相关设置为：

- `allow_aggregate_partitions_independently` - 控制优化的使用是否启用
- `force_aggregate_partitions_independently` - 在从正确性的角度看适用时强制使用该优化，但出于评估其合理性的内部逻辑而被禁用
- `max_number_of_partitions_for_independent_aggregation` - 表可以拥有的最大分区数的硬限制
