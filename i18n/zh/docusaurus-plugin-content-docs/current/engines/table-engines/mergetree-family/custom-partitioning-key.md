---
description: '了解如何为 MergeTree 表添加自定义分区键。'
sidebar_label: '自定义分区键'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: '自定义分区键'
doc_type: 'guide'
---

# 自定义分区键 \\{#custom-partitioning-key\\}

:::note
在大多数情况下，无需使用分区键；在其他大多数情况下，除非是针对按天分区较为常见的可观测性场景，否则也不需要比“按月”更细粒度的分区键。

切勿使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区，而应将客户端标识符或名称设置为 ORDER BY 表达式中的第一列。
:::

[MergeTree 系列表](../../../engines/table-engines/mergetree-family/mergetree.md)支持分区，包括[复制表](../../../engines/table-engines/mergetree-family/replication.md)和[物化视图](/sql-reference/statements/create/view#materialized-view)。

分区是按指定条件在表中对记录进行的逻辑归组。可以按任意条件设置分区，例如按月、按日或按事件类型。每个分区单独存储，以简化对这部分数据的操作。访问数据时，ClickHouse 会尽可能只访问最小数量的分区。对于包含分区键的查询，分区可以提升性能，因为 ClickHouse 会在选择分区内的 part 和 granule 之前，先根据分区进行过滤。

在[创建表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)时，通过 `PARTITION BY expr` 子句指定分区。分区键可以是基于表列的任意表达式。例如，要按月进行分区，可以使用表达式 `toYYYYMM(date_column)`：

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

分区键也可以是表达式元组（类似于[主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)）。例如：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

在本示例中，我们按当前周内发生的事件类型进行分区。

默认情况下，不支持使用浮点类型作为分区键。要使用它，请启用设置 [allow&#95;floating&#95;point&#95;partition&#95;key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)。

当向表中插入新数据时，这些数据会作为一个单独的数据部分（part），按主键排序后存储。在插入后的 10–15 分钟内，同一分区中的各个部分会被合并为一个完整的数据部分。

:::info
合并仅适用于分区表达式取值相同的数据部分。这意味着**不应创建过于细粒度的分区**（超过大约一千个分区）。否则，由于文件系统中文件数量和打开的文件描述符数量过多，`SELECT` 查询的性能会很差。
:::

使用 [system.parts](../../../operations/system-tables/parts.md) 表可以查看表的数据部分和分区。例如，假设我们有一个按月分区的 `visits` 表。让我们对 `system.parts` 表执行 `SELECT` 查询：

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

`partition` 列包含分区的名称。在此示例中有两个分区：`201901` 和 `201902`。可以使用该列的值在 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 查询中指定分区名称。

`name` 列包含分区数据 part 的名称。你可以在 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 查询中使用该列来指定 part 的名称。

下面我们来拆解这个 part 名称：`201901_1_9_2_11`：

* `201901` 是分区名。
* `1` 是数据块的最小编号。
* `9` 是数据块的最大编号。
* `2` 是 chunk 的层级（其在 MergeTree 中形成时所处的深度）。
* `11` 是 mutation 版本（如果该 part 发生过 mutation）。

:::info
旧类型的表的 part 名称格式为：`20190117_20190123_2_2_0`（最小日期 - 最大日期 - 最小块编号 - 最大块编号 - 层级）。
:::

`active` 列表示 part 的状态。`1` 表示活跃（active）；`0` 表示非活跃（inactive）。例如，合并为更大 part 后保留下来的源 part 是非活跃的 part。损坏的数据 part 也会被标记为非活跃。

如示例所示，同一分区可以包含多个相互独立的 part（例如 `201901_1_3_1` 和 `201901_1_9_2`）。这表示这些 part 尚未被合并。ClickHouse 会周期性地合并已插入的数据 part，大约会在插入后 15 分钟触发一次合并。此外，你可以使用 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 查询执行一次非计划的合并。示例：

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

非活跃的 parts 将在合并后大约 10 分钟内被删除。

查看一组 parts 和 partitions 的另一种方法，是进入该表所在的目录：`/var/lib/clickhouse/data/<database>/<table>/`。例如：

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

文件夹 &#39;201901&#95;1&#95;1&#95;0&#39;、&#39;201901&#95;1&#95;7&#95;1&#39; 等，是各个 part 的目录。每个 part 属于一个分区，并且只包含某一个月的数据（本示例中的表是按月分区的）。

`detached` 目录包含通过 [DETACH](/sql-reference/statements/detach) 查询从表中分离出去的 part。损坏的 part 也会被移动到该目录，而不是直接删除。服务器不会使用 `detached` 目录中的这些 part。你可以在任何时候在该目录中添加、删除或修改数据——在你执行 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 查询之前，服务器都不会察觉到这些更改。

请注意，在正在运行的服务器上，你不能在文件系统中手动更改 part 的集合或其数据，因为服务器不会感知到这些变更。对于非复制表，你可以在服务器停止时进行此操作，但不推荐这样做。对于复制表，在任何情况下都不能更改 part 的集合。

ClickHouse 允许你对分区执行操作：删除分区、在表之间复制分区，或者创建备份。所有操作的完整列表请参见 [Manipulations With Partitions and Parts](/sql-reference/statements/alter/partition) 一节。

## 使用分区键进行 GROUP BY 优化 \\{#group-by-optimisation-using-partition-key\\}

对于某些表的分区键与查询的 GROUP BY 键的特定组合，可以针对每个分区独立执行聚合。
这样在最后我们就不必合并所有执行线程产生的部分聚合结果，
因为可以保证相同的 GROUP BY 键值不会同时出现在两个不同线程的工作集里。

一个典型示例如下：

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
此类查询的性能在很大程度上取决于表结构。因此，该优化默认未启用。
:::

获得良好性能的关键因素：

* 查询涉及的分区数量应足够大（大于 `max_threads / 2`），否则查询将无法充分利用机器资源
* 分区不应过小，否则批处理会退化为逐行处理
* 分区大小应大致相当，这样所有线程执行的工作量大致相同

:::info
建议对 `partition by` 子句中的列应用某种哈希函数，以便在分区之间均匀分布数据。
:::

相关设置如下：

* `allow_aggregate_partitions_independently` - 控制是否启用该优化
* `force_aggregate_partitions_independently` - 当从正确性角度看可用，但因内部评估其性价比的逻辑而被禁用时，强制使用该优化
* `max_number_of_partitions_for_independent_aggregation` - 对表可包含的最大分区数量的硬性限制
