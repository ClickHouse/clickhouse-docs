---
description: '了解如何为 MergeTree 表添加自定义分区键。'
sidebar_label: '自定义分区键'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: '自定义分区键'
doc_type: 'guide'
---



# 自定义分区键

:::note
在大多数情况下，无需使用分区键；在绝大多数其他情况下，除非是可观测性场景（通常按天分区），也不需要比“按月”更细粒度的分区键。

绝对不要使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区。相反，应将客户端标识符或名称作为 `ORDER BY` 表达式中的第一列。
:::

[MergeTree 系列表](../../../engines/table-engines/mergetree-family/mergetree.md)支持分区，包括[复制表](../../../engines/table-engines/mergetree-family/replication.md)和[物化视图](/sql-reference/statements/create/view#materialized-view)。

分区是根据指定条件对表中记录进行的逻辑分组。可以按任意条件设置分区，例如按月、按日或者按事件类型。每个分区都会单独存储，以简化对这部分数据的操作。在访问数据时，ClickHouse 会使用尽可能少的分区子集。对于包含分区键的查询，分区可以提升性能，因为 ClickHouse 会在选择分区内的各个 part 和 granule 之前，先过滤出对应的分区。

在[创建表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)时，通过 `PARTITION BY expr` 子句来指定分区。分区键可以是基于表列的任意表达式。比如，要指定按月分区，可以使用表达式 `toYYYYMM(date_column)`：

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

分区键也可以是由多个表达式组成的元组（类似于[主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)）。例如：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

在这个示例中，我们按本周内发生的事件类型进行分区。

默认情况下，不支持使用浮点数作为分区键。要使用它，请启用设置 [allow&#95;floating&#95;point&#95;partition&#95;key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)。

向表中插入新数据时，这些数据将作为一个单独的 part（块），按主键排序进行存储。在插入后的 10–15 分钟内，同一分区的多个 part 会合并为一个完整的 part。

:::info
合并只对分区表达式取值相同的数据 part 生效。这意味着**不应创建粒度过细的分区**（一般不宜超过一千个分区）。否则，由于文件系统中的文件数量和打开文件描述符数量过多，`SELECT` 查询的性能会明显下降。
:::

使用 [system.parts](../../../operations/system-tables/parts.md) 表可以查看表的 part 和分区。例如，假设我们有一个按月份分区的 `visits` 表。让我们对 `system.parts` 表执行一次 `SELECT` 查询：

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

`partition` 列包含分区名称。本示例中有两个分区：`201901` 和 `201902`。你可以利用此列的值在 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 查询中指定分区名称。


`name` 列包含分区数据片段的名称。你可以在 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 查询中使用这一列来指定片段名称。

让我们拆解一下这个片段名称：`201901_1_9_2_11`：

* `201901` 是分区名称。
* `1` 是数据块的最小编号。
* `9` 是数据块的最大编号。
* `2` 是片段层级（在生成它的 MergeTree 中的深度）。
* `11` 是变更版本（如果该片段发生过变更）。

:::info
旧类型表的数据片段名称为：`20190117_20190123_2_2_0`（最小日期 - 最大日期 - 最小块编号 - 最大块编号 - 层级）。
:::

`active` 列显示数据片段的状态。`1` 表示活跃；`0` 表示非活跃。非活跃片段例如是指在合并为更大片段后保留下来的源片段。损坏的数据片段也会被标记为非活跃。

如示例所示，同一个分区可能会有多个独立的数据片段（例如 `201901_1_3_1` 和 `201901_1_9_2`）。这意味着这些片段尚未被合并。ClickHouse 会周期性地合并已插入的数据片段，大约在插入后 15 分钟触发一次合并操作。此外，你还可以通过 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 查询执行一次非计划的合并。示例：

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

非活动部分将在合并后大约 10 分钟内被删除。

查看一组 part 和 partition 的另一种方式是进入该表的目录：`/var/lib/clickhouse/data/<database>/<table>/`。例如：

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

文件夹 &#39;201901&#95;1&#95;1&#95;0&#39;、&#39;201901&#95;1&#95;7&#95;1&#39; 等是各个数据分片的目录。每个分片对应一个分区，并且只包含某一特定月份的数据（本示例中的表是按月份进行分区的）。


`detached` 目录包含通过 [DETACH](/sql-reference/statements/detach) 查询从表中分离出来的数据部分（parts）。损坏的数据部分也会被移动到该目录，而不是被删除。服务器不会使用 `detached` 目录中的数据部分。可以在任何时候在此目录中添加、删除或修改数据——服务器在执行 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 查询之前都不会察觉到这些更改。

请注意，在运行中的服务器上，不能在文件系统上手动更改数据部分的集合或其数据，因为服务器不会感知到这些更改。对于非复制表，可以在服务器停止时执行这些操作，但不推荐这样做。对于复制表，在任何情况下都不能更改数据部分的集合。

ClickHouse 允许对分区执行操作：删除分区、在表之间复制分区，或者创建备份。所有操作的列表请参见[分区与数据部分操作](/sql-reference/statements/alter/partition)一节。



## 使用分区键优化 Group By {#group-by-optimisation-using-partition-key}

对于表的分区键和查询的 GROUP BY 键的某些组合,可以为每个分区独立执行聚合。
这样我们就不必在最后合并来自所有执行线程的部分聚合数据,
因为我们可以保证每个 GROUP BY 键值不会出现在两个不同线程的工作集中。

典型示例如下:

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
此类查询的性能在很大程度上取决于表的布局。因此,该优化默认不启用。
:::

良好性能的关键因素:

- 查询涉及的分区数量应足够大(大于 `max_threads / 2`),否则查询将无法充分利用机器资源
- 分区不应太小,以免批处理退化为逐行处理
- 分区大小应相当,以便所有线程执行大致相同的工作量

:::info
建议在 `PARTITION BY` 子句中对列应用哈希函数,以便在分区之间均匀分布数据。
:::

相关设置包括:

- `allow_aggregate_partitions_independently` - 控制是否启用该优化
- `force_aggregate_partitions_independently` - 当从正确性角度适用时强制使用该优化,即使内部逻辑评估其不适宜而将其禁用
- `max_number_of_partitions_for_independent_aggregation` - 表可拥有的最大分区数的硬性限制
