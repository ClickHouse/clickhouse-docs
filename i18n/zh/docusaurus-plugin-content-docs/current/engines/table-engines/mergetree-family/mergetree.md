---
description: '`MergeTree` 系列表引擎专为高数据摄取速率和海量数据规模而设计。'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree 表引擎'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree 表引擎 {#mergetree-table-engine}

`MergeTree` 引擎以及 `MergeTree` 家族中的其他引擎（例如 `ReplacingMergeTree`、`AggregatingMergeTree`）是 ClickHouse 中最常用、也最健壮的表引擎。

`MergeTree` 家族表引擎专为高数据摄取速率和海量数据规模而设计。
插入操作会创建表部件（part），这些部件会由后台进程与其他表部件进行合并。

`MergeTree` 家族表引擎的主要特性：

* 表的主键决定了每个表部件内部的排序顺序（聚簇索引）。主键并不引用单独的行，而是引用称为粒度（granule）的 8192 行数据块。这样可以使超大数据集的主键足够小，从而始终保留在主内存中，同时仍然能够快速访问磁盘上的数据。

* 表可以使用任意分区表达式进行分区。分区裁剪可以在查询条件允许的情况下跳过读取某些分区。

* 数据可以在多个集群节点之间进行复制，以实现高可用、故障切换以及零停机升级。参见 [Data replication](/engines/table-engines/mergetree-family/replication.md)。

* `MergeTree` 表引擎支持多种统计信息种类和采样方法，以帮助进行查询优化。

:::note
尽管名称相似，[Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎是不同的。
:::

## 创建表 {#table&#95;engine-mergetree-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr1] [COMMENT ...] [CODEC(codec1)] [STATISTICS(stat1)] [TTL expr1] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    name2 [type2] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr2] [COMMENT ...] [CODEC(codec2)] [STATISTICS(stat2)] [TTL expr2] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    ...
    INDEX index_name1 expr1 TYPE type1(...) [GRANULARITY value1],
    INDEX index_name2 expr2 TYPE type2(...) [GRANULARITY value2],
    ...
    PROJECTION projection_name_1 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY]),
    PROJECTION projection_name_2 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY])
) ENGINE = MergeTree()
ORDER BY expr
[PARTITION BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[TTL expr
    [DELETE|TO DISK 'xxx'|TO VOLUME 'xxx' [, ...] ]
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ] ]
[SETTINGS name = value, ...]
```

有关这些参数的详细说明，请参阅 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句。

### 查询子句 {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — 引擎名称和参数。`ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。

#### ORDER BY {#order&#95;by}

`ORDER BY` — 排序键。

由列名或任意表达式组成的元组（tuple）。示例：`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键（即未指定 `PRIMARY KEY`），ClickHouse 会将排序键用作主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。
或者，如果启用了 `create_table_empty_primary_key_by_default` 设置，则会在 `CREATE TABLE` 语句中隐式添加 `ORDER BY ()`。参见 [选择主键](#selecting-a-primary-key)。

#### PARTITION BY {#partition-by}

`PARTITION BY` — 即[分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下不需要分区键；即使需要分区，通常按月分区已经足够，无需使用比“按月”更细粒度的分区键。分区并不会加速查询（与 ORDER BY 表达式不同）。不要使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区（应将客户端标识符或名称作为 ORDER BY 表达式中的第一列）。

要按月进行分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一个类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此处的分区名称采用 `"YYYYMM"` 格式。

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 主键，如果它[与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)。可选。

指定排序键（使用 `ORDER BY` 子句）会隐式地指定主键。
通常无需在排序键之外再单独指定主键。

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定该表达式，则它必须包含在主键中。
采样表达式的结果必须为无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。

#### TTL {#ttl}

`TTL` — 一组规则，用于指定行的保留期限以及数据片在[磁盘与卷之间](#table_engine-mergetree-multiple-volumes)自动迁移的逻辑。可选。

表达式的结果必须是 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定在表达式满足条件（达到当前时间）时，对该数据片执行的操作：删除过期行，将数据片（当该片中所有行的表达式都满足条件时）移动到指定磁盘（`TO DISK 'xxx'`）或卷（`TO VOLUME 'xxx'`），或对过期行中的值进行聚合。规则的默认类型为删除（`DELETE`）。可以指定多条规则，但 `DELETE` 规则不得超过一条。

更多细节，参见 [列和表的 TTL](#table_engine-mergetree-ttl)。

#### 设置 {#settings}

参见 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**Sections 设置示例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在示例中，我们按月份设置了分区。

我们还将采样表达式设置为基于用户 ID 的哈希。这允许你针对每个 `CounterID` 和 `EventDate` 对表中的数据进行伪随机化。如果在查询数据时指定了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 会为一部分用户返回均匀的伪随机数据样本。

`index_granularity` 设置可以省略，因为 8192 是默认值。

<details markdown="1">
  <summary>已弃用的建表方法</summary>

  :::note
  不要在新项目中使用此方法。如有可能，请将旧项目切换到上面描述的方法。
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
  ```

  **MergeTree() 参数**

  * `date-column` — [Date](/sql-reference/data-types/date.md) 类型的列名。ClickHouse 会基于该列按月自动创建分区。分区名称采用 `"YYYYMM"` 格式。
  * `sampling_expression` — 用于采样的表达式。
  * `(primary, key)` — 主键。类型：[Tuple()](/sql-reference/data-types/tuple.md)
  * `index_granularity` — 索引粒度，即索引“marks”之间的数据行数。8192 这一数值适用于大多数任务。

  **示例**

  ```sql
  MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
  ```

  `MergeTree` 引擎的配置方式与上面主要引擎配置方法中的示例相同。
</details>

## 数据存储 {#mergetree-data-storage}

一张表由按主键排序的数据部分（data parts）组成。

当向表中插入数据时，会创建独立的数据部分，每个数据部分都会按主键进行字典序排序。比如，如果主键是 `(CounterID, Date)`，那么该数据部分中的数据首先按 `CounterID` 排序，并且在每个 `CounterID` 内部再按 `Date` 排序。

属于不同分区的数据会被存放到不同的数据部分中。在后台，ClickHouse 会合并数据部分以实现更高效的存储。属于不同分区的数据部分不会被合并。合并机制并不保证具有相同主键的所有行都会落在同一个数据部分中。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式下，每一列都作为单独的文件存储在文件系统中；在 `Compact` 格式下，所有列都存储在同一个文件中。`Compact` 格式可用于提升小批量且频繁插入场景下的性能。

数据存储格式由表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果某个数据部分中的字节数或行数小于对应设置的值，则该数据部分会以 `Compact` 格式存储；否则将以 `Wide` 格式存储。如果这两个设置都未配置，数据部分将以 `Wide` 格式存储。

每个数据部分在逻辑上被划分为多个粒度（granule）。粒度是 ClickHouse 在查询数据时读取的最小不可再分的数据集。ClickHouse 不会拆分行或单个值，因此每个粒度始终包含整数数量的行。粒度的第一行会用该行的主键值进行标记。对于每个数据部分，ClickHouse 会创建一个索引文件来存储这些标记（marks）。对于每一列（无论是否包含在主键中），ClickHouse 也会存储相同的标记。这些标记可以让系统直接在列文件中定位数据。

粒度大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置限制。每个粒度中的行数位于 `[1, index_granularity]` 范围内，具体取决于每行数据的大小。如果单行数据的大小超过 `index_granularity_bytes` 的值，则粒度的大小可以超过 `index_granularity_bytes`。在这种情况下，粒度大小等于该行数据的大小。

## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在这种情况下，排序和索引可以表示如下：

```text
全部数据:       [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
标记点:          |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
标记点编号:      0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询包含以下条件：

* `CounterID in ('a', 'h')`，服务器会读取标记区间 `[0, 3)` 和 `[6, 8)` 内的数据。
* `CounterID IN ('a', 'h') AND Date = 3`，服务器会读取标记区间 `[1, 3)` 和 `[7, 8)` 内的数据。
* `Date = 3`，服务器会读取标记区间 `[1, 10]` 内的数据。

上面的示例表明，使用索引总是比全表扫描更高效。

稀疏索引会多读一些额外数据。在读取一个主键范围时，每个数据块中最多会额外读取 `index_granularity * 2` 行。

稀疏索引允许你处理行数非常巨大的表，因为在大多数情况下，这类索引可以完全放入计算机内存中。

ClickHouse 不要求主键唯一。你可以插入多行具有相同主键的记录。

你可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不建议这样做。要启用此功能，请开启 [allow&#95;nullable&#95;key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。对于 `ORDER BY` 子句中的 `NULL` 值，适用 [NULLS&#95;LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则。

### 选择主键 {#selecting-a-primary-key}

主键中的列数没有显式限制。可以根据数据结构，在主键中包含更多或更少的列。这可能会：

* 提高索引性能。

  如果主键是 `(a, b)`，那么在满足以下条件时，添加另一列 `c` 会提高性能：

  * 存在带有列 `c` 条件的查询。
  * 通常会出现较长的数据范围（长度是 `index_granularity` 的数倍）在 `(a, b)` 上具有相同的值。换句话说，添加另一列可以使系统跳过相当长的数据范围。

* 改善数据压缩。

  ClickHouse 会按主键对数据进行排序，因此数据按主键越集中、有序，压缩效果越好。

* 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中，为合并数据部分提供额外的逻辑。

  在这种情况下，指定与主键不同的*排序键（sorting key）*是有意义的。

较长的主键会对插入性能和内存消耗产生负面影响，但在执行 `SELECT` 查询时，主键中的额外列不会影响 ClickHouse 的性能。

可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下，ClickHouse 按插入顺序存储数据。如果希望在使用 `INSERT ... SELECT` 查询插入数据时保持数据顺序，请将 [max&#95;insert&#95;threads = 1](/operations/settings/settings#max_insert_threads) 设置为 1。

要按初始顺序选择数据，请使用[单线程](/operations/settings/settings.md/#max_threads)的 `SELECT` 查询。

### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个与排序键不同的主键（一个表达式，其值会在每个标记的索引文件中写入）。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时，这一特性非常有用。在这些引擎的常见使用场景中，表通常有两类列：*维度（dimensions）* 和 *度量（measures）*。典型查询会对度量列的值在任意 `GROUP BY` 条件下进行聚合，并按维度进行过滤。由于 SummingMergeTree 和 AggregatingMergeTree 会对具有相同排序键值的行进行聚合，因此将所有维度都加入排序键是很自然的做法。结果是，键表达式会由一个很长的列列表组成，并且在新增维度时必须频繁更新该列表。

在这种情况下，更合理的做法是只在主键中保留少数几列，以保证高效的范围扫描，并将其余维度列加入排序键元组中。

对排序键执行 [ALTER](/sql-reference/statements/alter/index.md) 是一项轻量级操作，因为当新列同时被添加到表和排序键中时，现有数据部分不需要被修改。由于旧排序键是新排序键的前缀，并且在新添加的列中还没有数据，因此在进行表修改时，数据在逻辑上同时满足按旧排序键和新排序键排序。

### 在查询中使用索引和分区 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 会分析是否可以使用索引。若 `WHERE/PREWHERE` 子句中包含（作为某个合取项或整体）表示等值或不等比较运算的表达式，或者在主键或分区键中的列或表达式，或这些列上的某些特定函数，或这些表达式的逻辑组合上使用了带固定前缀的 `IN` 或 `LIKE`，则可以使用索引。

因此，可以对主键的一个或多个范围快速执行查询。在此示例中，当针对特定的跟踪标签、特定标签与日期范围、特定标签与日期、带日期范围的多个标签等进行查询时，查询都会很快。

来看一个如下配置的引擎：

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下，在查询时：

```sql
SELECT count() FROM table
WHERE EventDate = toDate(now())
AND CounterID = 34

SELECT count() FROM table
WHERE EventDate = toDate(now())
AND (CounterID = 34 OR CounterID = 42)

SELECT count() FROM table
WHERE ((EventDate >= toDate('2014-01-01')
AND EventDate <= toDate('2014-01-31')) OR EventDate = toDate('2014-05-01'))
AND CounterID IN (101500, 731962, 160656)
AND (CounterID = 101500 OR EventDate != toDate('2014-05-01'))
```

ClickHouse 将使用主键索引来跳过不符合条件的数据，并使用按月分区键来跳过处于不符合日期范围内的分区。

上面的查询展示了，即使是复杂表达式也会使用索引。表的数据读取经过组织，保证使用索引不会比全表扫描更慢。

在下面的示例中，将无法利用索引。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 在运行查询时是否可以使用索引，请使用设置项 [force&#95;index&#95;by&#95;date](/operations/settings/settings.md/#force_index_by_date) 和 [force&#95;primary&#95;key](/operations/settings/settings#force_primary_key)。

按月分区的分区键可以使查询仅读取包含目标日期范围的数据块。在这种情况下，一个数据块可能包含多个日期的数据（最多可覆盖整个月）。在一个数据块内，数据按主键排序，而主键的首列不一定是日期。正因为如此，如果查询中只包含日期条件而未指定主键前缀，就会为获取某个单一日期而读取比实际需要更多的数据。

### 对部分单调主键使用索引 {#use-of-index-for-partially-monotonic-primary-keys}

以月份中的日期为例。在一个月内，它们构成一个[单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在更长的时间范围内则不是单调的。这就是一个部分单调序列。如果用户使用部分单调的主键创建表，ClickHouse 会像往常一样创建稀疏索引。当用户从这种类型的表中查询数据时，ClickHouse 会分析查询条件。如果用户希望获取索引中两个标记点之间的数据，并且这两个标记点都落在同一个月内，ClickHouse 就可以在这种特定情况下使用索引，因为它可以计算查询参数与索引标记之间的距离。

如果查询参数范围内的主键值不构成单调序列，ClickHouse 无法使用索引。在这种情况下，ClickHouse 会使用全表扫描方法。

ClickHouse 不仅对月份日期序列使用这一逻辑，也会对任何表示部分单调序列的主键使用这一逻辑。

### 数据跳过索引 {#table&#95;engine-mergetree-data&#95;skipping-indexes}

索引声明在 `CREATE` 查询的 `columns` 部分中。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 家族的表，可以指定数据跳过索引。

这些索引会在由 `granularity_value` 个粒度组成的数据块上聚合指定表达式的一些信息（粒度的大小通过表引擎中的 `index_granularity` 设置指定）。随后，这些聚合结果会在 `SELECT` 查询中用于减少从磁盘读取的数据量，通过跳过那些不可能满足 `where` 查询条件的大数据块来实现。

可以省略 `GRANULARITY` 子句，此时 `granularity_value` 的默认值为 1。

**示例**

```sql
CREATE TABLE table_name
(
    u64 UInt64,
    i32 Int32,
    s String,
    ...
    INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3,
    INDEX idx2 u64 * i32 TYPE minmax GRANULARITY 3,
    INDEX idx3 u64 * length(s) TYPE set(1000) GRANULARITY 4
) ENGINE = MergeTree()
...
```

示例中的索引可供 ClickHouse 在以下查询中使用，以减少从磁盘读取的数据量：

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

数据跳过索引也可以建立在复合列上：

```sql
-- 在 Map 类型的列上：
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- 在 Tuple 类型的列上：
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- 在 Nested 类型的列上：
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### 跳过索引类型 {#skip-index-types}

`MergeTree` 表引擎支持以下几种跳过索引类型。\
有关如何使用跳过索引进行性能优化的更多信息，\
请参阅[《理解 ClickHouse 数据跳过索引》](/optimize/skipping-indexes)。

* [`MinMax`](#minmax) 索引
* [`Set`](#set) 索引
* [`bloom_filter`](#bloom-filter) 索引
* [`ngrambf_v1`](#n-gram-bloom-filter) 索引
* [`tokenbf_v1`](#token-bloom-filter) 索引

#### MinMax 跳过索引 {#minmax}

对于每个索引粒度，会存储某个表达式的最小值和最大值。
（如果表达式的类型是 `tuple`，则会为元组中的每个元素分别存储最小值和最大值。）

```text title="Syntax"
minmax
```

#### Set {#set}

对于每个索引粒度，最多会存储 `max_rows` 个指定表达式的唯一值。
`max_rows = 0` 表示“存储所有唯一值”。

```text title="Syntax"
set(max_rows)
```

#### 布隆过滤器 {#bloom-filter}

对于每个索引粒度，都会为指定列存储一个[布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` 参数可以取 0 到 1 之间的值（默认值：`0.025`），用于指定产生假阳性（false positive）结果的概率（该值越大，需要读取的数据量越多）。

支持以下数据类型：

* `(U)Int*`
* `Float*`
* `Enum`
* `Date`
* `DateTime`
* `String`
* `FixedString`
* `Array`
* `LowCardinality`
* `Nullable`
* `UUID`
* `Map`

:::note Map 数据类型：使用键或值创建索引
对于 `Map` 数据类型，客户端可以通过 [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定索引是针对键还是针对值创建。
:::

#### N-gram 布隆过滤器 {#n-gram-bloom-filter}

对于每个索引粒度，会为指定列的 [n-gram](https://en.wikipedia.org/wiki/N-gram) 存储一个 [布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| 参数                              | 描述                                                               |
| ------------------------------- | ---------------------------------------------------------------- |
| `n`                             | n-gram 大小                                                        |
| `size_of_bloom_filter_in_bytes` | 布隆过滤器（Bloom filter）的字节大小。此处可以使用较大的值，例如 `256` 或 `512`，因为它可以很好地压缩。 |
| `number_of_hash_functions`      | 布隆过滤器中使用的哈希函数数量。                                                 |
| `random_seed`                   | 布隆过滤器哈希函数使用的随机种子。                                                |

此索引仅适用于以下数据类型：

* [`String`](/sql-reference/data-types/string.md)
* [`FixedString`](/sql-reference/data-types/fixedstring.md)
* [`Map`](/sql-reference/data-types/map.md)

要估算 `ngrambf_v1` 的参数，可以使用以下[用户自定义函数（UDF）](/sql-reference/statements/create/function.md)。

```sql title="UDFs for ngrambf_v1"
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams,  probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))
```

要使用这些函数，您至少需要指定两个参数：

* `total_number_of_all_grams`
* `probability_of_false_positives`

例如，在一个 granule 中有 `4300` 个 ngram，并且您预期误报率小于 `0.0001`。
然后可以通过执行以下查询来估算其余参数：

```sql
--- 估算过滤器中的位数
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- 估算哈希函数的数量
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

当然，你也可以使用这些函数来估算其他条件下的参数。
上述函数参考了[此处](https://hur.st/bloomfilter)的布隆过滤器计算器。

#### Token bloom filter {#token-bloom-filter}

Token bloom filter 与 `ngrambf_v1` 相同，但存储的是 token（由非字母数字字符分隔的序列），而不是 ngram。

```text title="Syntax"
tokenbf_v1(布隆过滤器字节大小, 哈希函数数量, 随机种子)
```

#### 稀疏 grams 布隆过滤器 {#sparse-grams-bloom-filter}

稀疏 grams 布隆过滤器与 `ngrambf_v1` 类似，但使用的是[稀疏 grams 标记](/sql-reference/functions/string-functions.md/#sparseGrams)而不是 ngrams。

```text title="Syntax"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

### 文本索引 {#text}

支持全文搜索，详情见[这里](invertedindexes.md)。

#### 向量相似度 {#vector-similarity}

支持近似最近邻检索，详见[此处](annindexes.md)。

### 函数支持 {#functions-support}

`WHERE` 子句中的条件可能包含对作用于列的函数的调用。如果该列是索引的一部分，ClickHouse 会在执行这些函数时尝试使用该索引。ClickHouse 对可用于索引的函数提供了不同的支持子集。

类型为 `set` 的索引可被所有函数使用。其他类型的索引支持情况如下：

| 函数（运算符）/ 索引                                                                                                               | 主键 | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | sparse&#95;grams | text |
| ------------------------------------------------------------------------------------------------------------------------- | -- | ------ | -------------- | -------------- | ---------------- | ---------------- | ---- |
| [equals（=，==）](/sql-reference/functions/comparison-functions.md/#equals)                                                  | ✔  | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔  | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔  | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔  | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗  | ✗      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔  | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗  | ✗      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗  | ✗      | ✔              | ✗              | ✗                | ✗                | ✗    |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔  | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔  | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [小于（`<`）](/sql-reference/functions/comparison-functions.md/#less)                                                         | ✔  | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [大于 (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                     | ✔  | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                     | ✔  | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [大于等于 (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                                          | ✔  | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔  | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗  | ✔      | ✗              | ✗              | ✗                | ✔                | ✗    |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗  | ✗      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗  | ✗      | ✔              | ✔              | ✔                | ✔                | ✗    |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗  | ✗      | ✔              | ✔              | ✔                | ✔                | ✗    |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗  | ✗      | ✗              | ✔              | ✗                | ✗                | ✔    |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗  | ✗      | ✗              | ✔              | ✗                | ✗                | ✔    |
| [hasTokenCaseInsensitive（`*`）](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)              | ✗  | ✗      | ✗              | ✔              | ✗                | ✗                | ✗    |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗  | ✗      | ✗              | ✔              | ✗                | ✗                | ✗    |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗  | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗  | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                   | ✗  | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |

对于常量参数小于 ngram 大小的函数，`ngrambf_v1` 不能用于查询优化。

(*) 要让 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 生效，必须在转为小写的数据上创建 `tokenbf_v1` 索引，例如：`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
由于布隆过滤器可能产生假阳性匹配，因此在期望函数结果为 false 的查询中，`ngrambf_v1`、`tokenbf_v1`、`sparse_grams` 和 `bloom_filter` 索引不能用于查询优化。

例如：

* 可以被优化：
  * `s LIKE '%test%'`
  * `NOT s NOT LIKE '%test%'`
  * `s = 1`
  * `NOT s != 1`
  * `startsWith(s, 'test')`
* 不能被优化：
  * `NOT s LIKE '%test%'`
  * `s NOT LIKE '%test%'`
  * `NOT s = 1`
  * `s != 1`
  * `NOT startsWith(s, 'test')`
    :::

## 投影 {#projections}

投影类似于[物化视图](/sql-reference/statements/create/view)，但定义在数据片段（part）级别。它在提供一致性保证的同时，还能在查询中被自动使用。

:::note
在使用投影时，你还应考虑 [force&#95;optimize&#95;projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

在带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句中不支持投影。

### 投影查询 {#projection-query}

投影查询用于定义一个投影。它会隐式地从父表中选取数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

可以使用 [ALTER](/sql-reference/statements/alter/projection.md) 语句修改或删除投影。

### 投影存储 {#projection-storage}

投影存储在数据分片（part）目录中。它类似于索引，但包含一个子目录，用于存放一个匿名 `MergeTree` 表的分片。该表由投影的定义查询所派生。如果存在 `GROUP BY` 子句，则其底层存储引擎变为 [AggregatingMergeTree](aggregatingmergetree.md)，并且所有聚合函数都会被转换为 `AggregateFunction`。如果存在 `ORDER BY` 子句，则该 `MergeTree` 表会将其作为主键表达式使用。在合并过程中，投影分片通过其存储引擎的合并流程进行合并。父表分片的校验和会与投影分片的校验和组合在一起。其他维护任务与跳过索引（skip index）类似。

### 查询分析 {#projection-query-analysis}

1. 检查投影是否可以用于回答给定查询，即它是否能生成与查询基表相同的结果。
2. 选择最优的可行匹配方案，即需要读取的数据颗粒（granule）最少的那个。
3. 使用投影的查询管道将不同于使用原始数据分片的管道。如果某些数据分片中缺少该投影，可以在查询管道中动态增加步骤以“实时投影”出来。

## 并发数据访问 {#concurrent-data-access}

对于对表的并发访问，我们使用多版本机制。换句话说，当一个表被同时读取和更新时，查询会从在查询时刻“当前”的那一组数据分片中读取数据。不会出现长时间持有的锁。插入操作不会阻塞读取操作。

从表中读取会自动并行执行。

## 列和表的 TTL {#table&#95;engine-mergetree-ttl}

用于指定数据值的生命周期。

可以为整张表以及每个单独的列设置 `TTL` 子句。表级 `TTL` 还可以指定在不同磁盘和卷之间自动迁移数据的逻辑，或者对数据已全部过期的部件进行重新压缩。

表达式的计算结果必须是 [Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md) 或 [DateTime64](/sql-reference/data-types/datetime64.md) 数据类型。

**语法**

为列设置 TTL（生存时间）：

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，请使用 [时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 运算符，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### 列 TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse 会将其替换为该列数据类型的默认值。如果某个数据部分中该列的所有值都已过期，ClickHouse 会从文件系统中的该数据部分删除此列。

`TTL` 子句不能用于键列。

**示例**

#### 创建带 `TTL` 的表： {#creating-a-table-with-ttl}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int TTL d + INTERVAL 1 MONTH,
    b Int TTL d + INTERVAL 1 MONTH,
    c String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d;
```

#### 向现有表的列添加 TTL {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```

#### 更改列的 TTL {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### 表 TTL {#mergetree-table-ttl}

表可以定义一个用于删除过期行的表达式，以及多个用于在[磁盘或卷](#table_engine-mergetree-multiple-volumes)之间自动迁移分片的表达式。当表中的行过期时，ClickHouse 会删除所有对应的行。对于分片移动或重新压缩操作，某个分片中的所有行都必须满足 `TTL` 表达式所定义的条件。

```sql
TTL 表达式
    [DELETE|RECOMPRESS 编解码器名称1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS 编解码器名称2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE 条件]
    [GROUP BY 键表达式 [SET v1 = 聚合函数(v1) [, v2 = 聚合函数(v2) ...]] ]
```

TTL 规则的类型可以紧跟在每个 TTL 表达式之后。它会影响在表达式满足条件（到达当前时间）时要执行的操作：

* `DELETE` - 删除已过期的行（默认操作）；
* `RECOMPRESS codec_name` - 使用 `codec_name` 重新压缩数据分片；
* `TO DISK 'aaa'` - 将分片移动到名为 `aaa` 的磁盘；
* `TO VOLUME 'bbb'` - 将分片移动到名为 `bbb` 的卷；
* `GROUP BY` - 聚合已过期的行。

`DELETE` 操作可以与 `WHERE` 子句一起使用，根据筛选条件只删除部分已过期的行：

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果某列既不是 `GROUP BY` 表达式的一部分，又没有在 `SET` 子句中显式设置，那么在结果行中，该列会包含分组行中的任意一个值（就像对该列应用了聚合函数 `any` 一样）。

**示例**

#### 创建带有 `TTL` 的表： {#creating-a-table-with-ttl-1}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE,
    d + INTERVAL 1 WEEK TO VOLUME 'aaa',
    d + INTERVAL 2 WEEK TO DISK 'bbb';
```

#### 修改表的 `TTL`： {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

创建一个表，行在一个月后过期。对已过期的行，仅删除日期为星期一的记录：

```sql
CREATE TABLE table_with_where
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE WHERE toDayOfWeek(d) = 1;
```

#### 创建对过期行重新压缩的表： {#creating-a-table-where-expired-rows-are-recompressed}

```sql
CREATE TABLE table_for_recompression
(
    d DateTime,
    key UInt64,
    value String
) ENGINE MergeTree()
ORDER BY tuple()
PARTITION BY key
TTL d + INTERVAL 1 MONTH RECOMPRESS CODEC(ZSTD(17)), d + INTERVAL 1 YEAR RECOMPRESS CODEC(LZ4HC(10))
SETTINGS min_rows_for_wide_part = 0, min_bytes_for_wide_part = 0;
```

创建一个用于聚合已过期行的表。最终结果行中，`x` 包含该分组内的最大值，`y` 为最小值，`d` 为该分组中的任意一个值。

```sql
CREATE TABLE table_for_aggregation
(
    d DateTime,
    k1 Int,
    k2 Int,
    x Int,
    y Int
)
ENGINE = MergeTree
ORDER BY (k1, k2)
TTL d + INTERVAL 1 MONTH GROUP BY k1, k2 SET x = max(x), y = min(y);
```

### 删除过期数据 {#mergetree-removing-expired-data}

TTL 已过期的数据会在 ClickHouse 合并数据部分时被删除。

当 ClickHouse 检测到数据已过期时，会执行一次非计划合并。要控制此类合并的频率，可以设置 `merge_with_ttl_timeout`。如果该值过低，可能会触发大量非计划合并，消耗大量资源。

在两次合并之间执行 `SELECT` 查询时，可能会读到已过期的数据。为避免这种情况，请在执行 `SELECT` 之前先执行 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另请参阅**

* [ttl&#95;only&#95;drop&#95;parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置

## 磁盘类型 {#disk-types}

除了本地块设备之外，ClickHouse 还支持以下存储类型：

* [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
* [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
* [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
* [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
* [`web` 用于从 Web 进行只读访问](/operations/storing-data#web-storage)
* [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
* [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
* [`s3_plain_rewritable` 用于 S3 中的不可变且非复制的表](/operations/storing-data.md#s3-plain-rewritable-storage)

## 使用多个块设备用于数据存储 {#table&#95;engine-mergetree-multiple-volumes}

### 简介 {#introduction}

`MergeTree` 系列表引擎可以将数据存储在多个块设备上。举例来说，当某个表中的数据被隐式划分为「热数据」和「冷数据」时，这会非常有用。最新的数据会被频繁访问，但只占用很小的空间。相反，具有长尾特征的历史数据则很少被访问。如果有多块磁盘可用，可以将「热数据」放在高速磁盘上（例如 NVMe SSD 或内存中），而将「冷数据」放在相对较慢的磁盘上（例如 HDD）。

数据片段是 `MergeTree` 引擎表中可移动的最小单元。属于同一数据片段的数据存储在同一块磁盘上。数据片段既可以在后台根据用户设置在磁盘之间移动，也可以通过 [ALTER](/sql-reference/statements/alter/partition) 查询进行移动。

### 术语 {#terms}

* Disk — 挂载到文件系统的块设备。
* Default disk — 存储 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中所指定路径数据的磁盘。
* Volume — 由一组相同磁盘按顺序组织而成的集合（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
* Storage policy — 卷的集合以及在这些卷之间迁移数据的规则。

这些实体的名称可以在系统表 [system.storage&#95;policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要为某个表应用已配置的存储策略之一，请在 `MergeTree` 引擎族表中使用 `storage_policy` 设置。

### 配置 {#table&#95;engine-mergetree-multiple-volumes&#95;configure}

应在 `config.d` 目录下的配置文件中，通过 `<storage_configuration>` 标签声明磁盘、卷和存储策略。

:::tip
也可以在查询的 `SETTINGS` 部分声明磁盘。这对于临时分析时挂载磁盘（例如托管在某个 URL 上的磁盘）非常有用。
更多详情参见[动态存储](/operations/storing-data#dynamic-configuration)。
:::

配置结构：

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- 磁盘名称 -->
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>

        ...
    </disks>

    ...
</storage_configuration>
```

标签：

* `<disk_name_N>` — 磁盘名称。所有磁盘的名称必须互不相同。
* `path` — 服务器用于存储数据（`data` 和 `shadow` 目录）的路径，必须以 &#39;/&#39; 结尾。
* `keep_free_space_bytes` — 需要预留的空闲磁盘空间大小。

磁盘定义的顺序无关紧要。

存储策略配置标记：

```xml
<storage_configuration>
    ...
    <policies>
        <policy_name_1>
            <volumes>
                <volume_name_1>
                    <disk>disk_name_from_disks_configuration</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                    <load_balancing>round_robin</load_balancing>
                </volume_name_1>
                <volume_name_2>
                    <!-- 配置信息 -->
                </volume_name_2>
                <!-- 更多卷配置 -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 配置信息 -->
        </policy_name_2>

        <!-- 更多策略配置 -->
    </policies>
    ...
</storage_configuration>
```

标签：

* `policy_name_N` — 策略名称。策略名称必须唯一。
* `volume_name_N` — 卷名。卷名必须唯一。
* `disk` — 卷中的一个磁盘。
* `max_data_part_size_bytes` — 可以存储在任意卷磁盘上的数据分片的最大大小。如果预计合并后的分片大小会大于 `max_data_part_size_bytes`，那么该分片会被写入下一个卷。基本上，此功能允许将新的/较小的分片保存在“热”（SSD）卷上，并在它们变大时移动到“冷”（HDD）卷。如果你的策略只有一个卷，请不要使用此设置。
* `move_factor` — 当可用空间比例低于该系数时，如果存在下一个卷，数据会自动开始移动到下一个卷（默认值为 0.1）。ClickHouse 会按从大到小（降序）对现有分片按大小排序，并选择其总大小足以满足 `move_factor` 条件的分片。如果所有分片的总大小仍不足，则会移动所有分片。
* `perform_ttl_move_on_insert` — 禁用在插入数据分片（data part）时执行 TTL 移动。默认情况下（启用时），如果插入的分片根据 TTL 移动规则已经过期，它会立即被写入移动规则中指定的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著减慢插入速度。如果禁用，则已过期的数据分片会先写入默认卷，然后紧接着再移动到 TTL 卷。
* `load_balancing` - 磁盘负载均衡策略，`round_robin` 或 `least_used`。
* `least_used_ttl_ms` - 配置在所有磁盘上更新可用空间的超时时间（毫秒）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘只能被 ClickHouse 使用，并且不会进行在线文件系统扩容/缩容，则可以使用 `-1`；在其他所有情况下都不推荐使用，因为最终会导致空间分布不正确。
* `prefer_not_to_merge` — 你不应该使用此设置。禁用在该卷上合并数据分片（这有害并会导致性能下降）。当启用此设置时（不要这样做），不允许在该卷上进行数据合并（这很糟糕）。这允许你（但你并不需要）控制（如果你想控制什么，你就是在犯错）ClickHouse 如何与慢磁盘交互（但 ClickHouse 更了解情况，所以请不要使用此设置）。
* `volume_priority` — 定义填充卷的优先级（顺序）。数值越小优先级越高。该参数的取值应为自然数，并且整体上从 1 到 N（给出的最低优先级）连续覆盖，中间不能缺少任何数字。
  * 如果 *所有* 卷都打了标签，则按给定顺序确定它们的优先级。
  * 如果只有 *部分* 卷打了标签，则未打标签的卷具有最低优先级，并按它们在配置中的定义顺序确定优先级。
  * 如果 *没有* 卷打标签，则它们的优先级对应于它们在配置中声明的顺序。
  * 两个卷不能具有相同的优先级值。

配置示例：

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- 策略名称 -->
            <volumes>
                <single> <!-- 卷名称 -->
                    <disk>disk1</disk>
                    <disk>disk2</disk>
                </single>
            </volumes>
        </hdd_in_order>

        <moving_from_ssd_to_hdd>
            <volumes>
                <hot>
                    <disk>fast_ssd</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                </hot>
                <cold>
                    <disk>disk1</disk>
                </cold>
            </volumes>
            <move_factor>0.2</move_factor>
        </moving_from_ssd_to_hdd>

        <small_jbod_with_external_no_merges>
            <volumes>
                <main>
                    <disk>jbod1</disk>
                </main>
                <external>
                    <disk>external</disk>
                </external>
            </volumes>
        </small_jbod_with_external_no_merges>
    </policies>
    ...
</storage_configuration>
```

在给定的示例中，`hdd_in_order` 策略实现了 [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling)（轮询）方式。因此，该策略仅定义了一个卷（`single`），数据 part 会以循环顺序存储在该卷的所有磁盘上。如果系统中挂载了多个相似的磁盘但没有配置 RAID，此类策略会非常有用。请记住，每个单独的磁盘驱动器都不够可靠，您可能需要通过将复制因子设置为 3 或更多来进行补偿。

如果系统中存在不同类型的磁盘，可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 由一个 SSD 磁盘（`fast_ssd`）组成，可以存储在该卷上的单个 part 的最大大小为 1GB。所有大小超过 1GB 的 part 将直接存储在 `cold` 卷上，该卷包含一个 HDD 磁盘 `disk1`。
另外，一旦磁盘 `fast_ssd` 的使用率超过 80%，后台进程会将数据迁移到 `disk1` 上。

在存储策略中，卷的列举顺序非常重要，尤其是在列出的卷中至少有一个未显式设置 `volume_priority` 参数时。
一旦某个卷被写满，数据会被移动到下一个卷。磁盘的列举顺序同样重要，因为数据会依次存储到这些磁盘上。

在创建表时，可以为其应用一个已配置好的存储策略：

```sql
CREATE TABLE table_with_non_default_policy (
    EventDate Date,
    OrderID UInt64,
    BannerID UInt64,
    SearchPhrase String
) ENGINE = MergeTree
ORDER BY (OrderID, BannerID)
PARTITION BY toYYYYMM(EventDate)
SETTINGS storage_policy = 'moving_from_ssd_to_hdd'
```

`default` 存储策略意味着只使用一个卷，该卷仅由 `<path>` 中指定的一块磁盘组成。
你可以在建表之后通过 [ALTER TABLE ... MODIFY SETTING] 查询更改存储策略，新策略必须包含所有原有的磁盘和卷，并使用相同的名称。

用于在后台移动数据部分的线程数量可以通过 [background&#95;move&#95;pool&#95;size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行修改。

### 细节 {#details}

对于 `MergeTree` 表，数据以不同的方式写入磁盘：

* 作为插入操作（`INSERT` 查询）的结果。
* 在执行后台合并和[变更](/sql-reference/statements/alter#mutations)时。
* 从其他副本下载时。
* 作为分区冻结 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) 的结果。

在除变更和分区冻结之外的所有这些情况下，数据部件（part）会根据给定的存储策略被存储在某个卷和磁盘上：

1. 选择第一个（按定义顺序）同时满足以下条件的卷：该卷拥有足够的磁盘空间来存储该部件（`unreserved_space > current_part_size`），并且允许存储该大小的部件（`max_data_part_size_bytes > current_part_size`）。
2. 在该卷中，选择这样的磁盘：在上一次用于存储数据块的磁盘之后的那个磁盘，且其可用空间大于该部件的大小（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在底层实现中，变更和分区冻结会使用[硬链接](https://en.wikipedia.org/wiki/Hard_link)。不同磁盘之间不支持硬链接，因此在这些情况下，生成的部件会存储在与初始部件相同的磁盘上。

在后台，部件会基于空闲空间的大小（`move_factor` 参数），按照配置文件中声明卷的顺序在卷之间移动。
数据永远不会从最后一个卷迁出，也不会被迁移到第一个卷中。可以使用系统表 [system.part&#95;log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）来监控后台移动操作。更详细的信息可以在服务器日志中找到。

用户可以通过查询 [ALTER TABLE ... MOVE PART|PARTITION ... TO VOLUME|DISK ...](/sql-reference/statements/alter/partition) 强制将某个部件或分区从一个卷移动到另一个卷，所有对后台操作的限制同样会被考虑在内。该查询会自行发起移动操作，而不会等待后台操作完成。如果没有足够的可用空间，或任一必需条件未满足，用户将收到一条错误信息。

数据移动不会影响数据复制。因此，可以在不同副本上的同一张表上指定不同的存储策略。

在后台合并和变更完成后，旧部件只会在经过一定时间（`old_parts_lifetime`）后才会被删除。
在此期间，它们不会被移动到其他卷或磁盘。因此，在这些部件被最终删除之前，它们仍然会被计入磁盘空间占用情况的计算中。

用户可以使用 [min&#95;bytes&#95;to&#95;rebalance&#95;partition&#95;over&#95;jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置，将新的大型部件在 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘上以均衡的方式进行分配。

## 使用外部存储进行数据存储 {#table&#95;engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 系列表引擎可以通过类型分别为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘，将数据存储到 `S3`、`AzureBlobStorage`、`HDFS` 中。有关更多详细信息，请参见[配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

下面是使用类型为 `s3` 的磁盘，将 [S3](https://aws.amazon.com/s3/) 用作外部存储的示例。

配置示例：

```xml
<storage_configuration>
    ...
    <disks>
        <s3>
            <type>s3</type>
            <support_batch_delete>true</support_batch_delete>
            <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
            <access_key_id>your_access_key_id</access_key_id>
            <secret_access_key>your_secret_access_key</secret_access_key>
            <region></region>
            <header>Authorization: Bearer SOME-TOKEN</header>
            <server_side_encryption_customer_key_base64>your_base64_encoded_customer_key</server_side_encryption_customer_key_base64>
            <server_side_encryption_kms_key_id>your_kms_key_id</server_side_encryption_kms_key_id>
            <server_side_encryption_kms_encryption_context>your_kms_encryption_context</server_side_encryption_kms_encryption_context>
            <server_side_encryption_kms_bucket_key_enabled>true</server_side_encryption_kms_bucket_key_enabled>
            <proxy>
                <uri>http://proxy1</uri>
                <uri>http://proxy2</uri>
            </proxy>
            <connect_timeout_ms>10000</connect_timeout_ms>
            <request_timeout_ms>5000</request_timeout_ms>
            <retry_attempts>10</retry_attempts>
            <single_read_retries>4</single_read_retries>
            <min_bytes_for_seek>1000</min_bytes_for_seek>
            <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            <skip_access_check>false</skip_access_check>
        </s3>
        <s3_cache>
            <type>cache</type>
            <disk>s3</disk>
            <path>/var/lib/clickhouse/disks/s3_cache/</path>
            <max_size>10Gi</max_size>
        </s3_cache>
    </disks>
    ...
</storage_configuration>
```

另请参阅[配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

:::note 缓存配置
ClickHouse 版本 22.3 至 22.7 使用了不同的缓存配置，如果你正在使用这些版本之一，请参阅[使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::

## 虚拟列 {#virtual-columns}

* `_part` — 数据部分（part）的名称。
* `_part_index` — 该数据部分在查询结果中的顺序索引。
* `_part_starting_offset` — 该数据部分在查询结果中的累计起始行号。
* `_part_offset` — 该数据部分中的行号。
* `_part_granule_offset` — 该数据部分中的 granule 编号。
* `_partition_id` — 分区的名称。
* `_part_uuid` — 数据部分的唯一标识符（如果启用了 MergeTree 设置 `assign_part_uuids`）。
* `_part_data_version` — 数据部分的数据版本（最小块号或变更版本）。
* `_partition_value` — `partition by` 表达式的值（一个元组）。
* `_sample_factor` — 采样因子（来自查询）。
* `_block_number` — 插入时为该行分配的原始块号；在启用设置 `enable_block_number_column` 时，在合并过程中会被保留。
* `_block_offset` — 插入时为该行在块中的原始行号；在启用设置 `enable_block_offset_column` 时，在合并过程中会被保留。
* `_disk_name` — 用于存储的磁盘名称。

## 列统计信息 {#column-statistics}

<ExperimentalBadge />

<CloudNotSupportedBadge />

在启用 `set allow_experimental_statistics = 1` 时，对于 `*MergeTree*` 系列表，可以在 `CREATE` 查询的列（columns）部分中声明统计信息。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们也可以使用 `ALTER` 语句来调整统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息汇总了列中值的分布情况。统计信息存储在每个数据片段中，并在每次插入时都会更新。
只有在启用 `set allow_statistics_optimize = 1` 时，它们才会用于 `PREWHERE` 优化。

### 可用的列统计类型 {#available-types-of-column-statistics}

* `MinMax`

  列的最小值和最大值，用于估计数值列上范围过滤条件的选择性。

  语法：`minmax`

* `TDigest`

  [TDigest](https://github.com/tdunning/t-digest) Sketch 数据结构，用于计算数值列的近似分位数（例如第 90 个百分位数）。

  语法：`tdigest`

* `Uniq`

  [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) Sketch 数据结构，用于估算某列中包含的不同值的数量。

  语法：`uniq`

* `CountMin`

  [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) Sketch 数据结构，用于对某列中每个值的出现频率进行近似计数。

  语法：`countmin`

### 支持的数据类型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String 或 FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |

### 支持的操作 {#supported-operations}

|           | 等值过滤 (==) | 范围过滤 (`>, >=, <, <=`) |
|-----------|----------------|---------------------------|
| CountMin  | ✔              | ✗                         |
| MinMax    | ✗              | ✔                         |
| TDigest   | ✗              | ✔                         |
| Uniq      | ✔              | ✗                         |

## 列级别设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别进行覆盖：

* `max_compress_block_size` — 在写入表之前，对未压缩数据块进行压缩时所允许的最大未压缩数据块大小。
* `min_compress_block_size` — 在写入下一个标记时，为执行压缩所需的最小未压缩数据块大小。

示例：

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

可以使用 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 修改或删除列级设置，例如：

* 从列定义中删除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

* 修改某项设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

* 重置一个或多个设置，同时会从该表的 `CREATE` 查询语句中的列表达式里删除相应的设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
