---
slug: /engines/table-engines/mergetree-family/mergetree
sidebar_position: 11
sidebar_label:  MergeTree
title: "MergeTree"
description: "`MergeTree`家族的表引擎旨在满足高数据摄取速率和大量数据的需求。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

`MergeTree` 引擎和 `MergeTree` 家族的其他引擎（例如 `ReplacingMergeTree`、`AggregatingMergeTree`）是 ClickHouse 中最常用和最强大的表引擎。

`MergeTree` 家族的表引擎旨在满足高数据摄取速率和大量数据的需求。
插入操作会创建表的分片，这些分片会与其他分片通过后台进程进行合并。

`MergeTree` 家族表引擎的主要特性包括：

- 表的主键决定了每个表分片内的排序顺序（聚集索引）。主键还不引用单独的行，而是引用8192行的块，称为粒度。这使得大量数据集的主键足够小，可以保持在主内存中，同时仍提供对磁盘数据的快速访问。

- 表可以使用任意分区表达式进行分区。当查询允许时，分区修剪确保省略对读取的分区。

- 数据可以在多个集群节点之间复制，以实现高可用性、故障转移和零停机升级。请参见 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持各种统计类型和抽样方法，以帮助查询优化。

:::note
尽管名称相似，[Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎不同。
:::
## 创建表 {#table_engine-mergetree-creating-a-table}

``` sql
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

有关参数的详细描述，请参见 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句。
### 查询子句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。 `ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。
#### ORDER_BY {#order_by}

`ORDER BY` — 排序键。

由列名称或任意表达式组成的元组。例如：`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键（即未指定 `PRIMARY KEY`），ClickHouse 将使用排序键作为主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。
另外，如果启用 `create_table_empty_primary_key_by_default` 设置，则 `ORDER BY tuple()` 会隐式添加到 `CREATE TABLE` 语句中。请参见 [选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下，您不需要分区键，如果确实需要分区，通常不需要比按月更细致的分区。分区并不会加速查询（与 `ORDER BY` 表达式相对）。您永远不应使用太细致的分区。不要按客户端标识符或名称进行分区（相反，应将客户端标识符或名称设置为 `ORDER BY` 表达式中的第一列）。

按月分区，请使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一个 [Date](/sql-reference/data-types/date.md) 类型的日期列。此处分区名称采用 `"YYYYMM"` 格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它与 [排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)，则作为主键。可选。

指定排序键（使用 `ORDER BY` 子句）隐式指定主键。
通常不需要在排序键之外另外指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 抽样表达式。可选。

如果指定，则必须包含在主键中。
抽样表达式必须结果为无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
####  TTL {#ttl}

`TTL` — 一系列规则，指定行的存储持续时间以及自动分片移动的逻辑 [在磁盘和卷之间](#table_engine-mergetree-multiple-volumes)。可选。

表达式必须结果为 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则的类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定在表达式满足时对分片执行的操作（达到当前时间）：删除过期行，移动分片（如果表达式对于分片中的所有行都满足）到指定磁盘（`TO DISK 'xxx'`）或到卷（`TO VOLUME 'xxx'`），或针对过期行的值进行聚合。规则的默认类型为删除（`DELETE`）。可以指定多个规则的列表，但不应超过一个 `DELETE` 规则。

有关更多细节，请参见 [列和表的 TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

请参见 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**设置节的示例**

``` sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在示例中，我们按月设置分区。

我们还将用户 ID 的哈希设置为抽样表达式。这使您能够对每个 `CounterID` 和 `EventDate` 伪随机化表中的数据。如果在选择数据时定义了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 将为一部分用户返回均匀伪随机的数据样本。

`index_granularity` 设置可以省略，因为 8192 是默认值。

<details markdown="1">

<summary>创建表的已弃用方法</summary>

:::note
在新项目中请勿使用此方法。如果可能，请将旧项目切换到上面描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree() 参数**

- `date-column` — [Date](/sql-reference/data-types/date.md) 类型的列的名称。ClickHouse 会根据该列自动按月创建分区。分区名称采用 `"YYYYMM"` 格式。
- `sampling_expression` — 抽样表达式。
- `(primary, key)` — 主键。类型： [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。索引的 "marks" 之间的数据行的数量。8192 的值适合于大多数任务。

**示例**

``` sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎的配置与上述例子中的主引擎配置方法相同。
</details>
## 数据存储 {#mergetree-data-storage}

一个表由按主键排序的数据分片组成。

当数据插入表中时，创建单独的数据分片，每个分片按主键进行字典顺序排序。例如，如果主键是 `(CounterID, Date)`，则分片中的数据按 `CounterID` 排序，在每个 `CounterID` 内又按 `Date` 排序。

属于不同分区的数据分开存储在不同的分片中。在后台，ClickHouse 为了更高效的存储合并数据分片。属于不同分区的分片不会合并。合并机制无法保证相同主键的所有行会在同一个数据分片中。

数据分片可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中，每一列存储在文件系统中的单独文件中，而在 `Compact` 格式中，所有列存储在一个文件中。使用 `Compact` 格式可以提高小量频繁插入的性能。

数据存储格式受表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果数据分片的字节数或行数少于相应设置的值，则该分片以 `Compact` 格式存储。否则，以 `Wide` 格式存储。如果未设置这些设置，则数据分片以 `Wide` 格式存储。

每个数据分片在逻辑上分为粒度。粒度是 ClickHouse 在选择数据时读取的最小不可分割数据集。ClickHouse 不会拆分行或值，因此每个粒度始终包含整数数量的行。粒度的第一行用该行的主键值标记。对于每个数据分片，ClickHouse 创建一个存储标记的索引文件。对于每一列，无论它是否在主键中，ClickHouse 还存储相同的标记。这些标记可以直接在列文件中找到数据。

粒度大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置限制。粒度中的行数在 `[1, index_granularity]` 范围内，具体取决于行的大小。如果单行大小大于该设置的值，则粒度大小可以超过 `index_granularity_bytes`。在这种情况下，粒度的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在此情况下，排序和索引可以如下所示：

```text
整体数据:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
标记:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
标记编号:       0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，服务器读取标记范围 `[0, 3)` 和 `[6, 8)` 的数据。
- `CounterID IN ('a', 'h') AND Date = 3`，服务器读取标记范围 `[1, 3)` 和 `[7, 8)` 的数据。
- `Date = 3`，服务器读取标记范围 `[1, 10]` 的数据。

以上示例表明，使用索引总是比完全扫描更有效。

稀疏索引允许读取额外数据。当从主键的单个范围读取时，每个数据块中最多可以读取 `index_granularity * 2` 行额外的行。

稀疏索引允许您处理非常大量的表行，因为在大多数情况下，这些索引装入计算机的内存。

ClickHouse 不要求唯一主键。您可以插入多行相同的主键。

您可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不推荐。要允许此功能，请启用 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。 `[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values)` 原则适用于 `ORDER BY` 子句中的 `NULL` 值。
### 选择主键 {#selecting-a-primary-key}

主键中的列数没有明确限制。根据数据结构，您可以在主键中包含更多或更少的列。这可能会：

- 提升索引的性能。

    如果主键是 `(a, b)`，那么添加另一列 `c` 只有在满足以下条件时，才会提高性能：

    - 存在包含列 `c` 条件的查询。
    - 与 `(a, b)` 具有相同值的较长数据范围（比 `index_granularity` 长几倍）很常见。换句话说，当添加另一列可以跳过相当长的数据范围时。

- 改善数据压缩。

    ClickHouse 按主键对数据进行排序，因此一致性越高，压缩效果越好。

- 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中提供额外逻辑，在合并数据分片时。

    在这种情况下，指定与主键不同的 *排序键* 是有意义的。

长主键会对插入性能和内存消耗产生负面影响，但主键中的额外列不会影响 ClickHouse 在 `SELECT` 查询中的性能。

您可以使用 `ORDER BY tuple()` 语法创建一个没有主键的表。在这种情况下，ClickHouse 会按插入的顺序存储数据。如果您希望在通过 `INSERT ... SELECT` 查询插入数据时保存数据顺序，请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要按照初始顺序选择数据，请使用 [单线程](/operations/settings/settings.md/#max_threads) `SELECT` 查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个与排序键不同的主键（包含为每个标记在索引文件中写入的值的表达式）。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

此功能在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时非常有用。在常见情况下，使用这些引擎的表有两种类型的列： *维度* 和 *度量*。典型的查询使用任意 `GROUP BY` 和按维度过滤聚合度量列的值。由于 SummingMergeTree 和 AggregatingMergeTree 聚合具有相同排序键值的行，因此将所有维度添加到排序键中是合乎逻辑的。结果，键表达式包括一长串列，且此列表必须与新增的维度频繁更新。

在这种情况下，可以仅在主键中保留少数几列，以提供高效的范围扫描，并将剩余的维度列添加到排序键元组中。

[ALTER](/sql-reference/statements/alter/index.md) 排序键是一个轻量级操作，因为当一个新列同时添加到表和排序键时，不需要更改现有的数据分片。由于旧的排序键是新的排序键的前缀，且新添加的列中没有数据，因此在表修改时，数据会根据旧的和新的排序键进行排序。
### 查询中的索引和分区的使用 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 分析是否可以使用索引。如果 `WHERE/PREWHERE` 子句包含表示相等或不等比较操作的表达式，或者包含 `IN` 或 `LIKE` 的固定前缀列或在主键或分区键上的表达式，或者这些表达式的某些部分重复的逻辑关系，那么就可以使用索引。

因此，可以快速针对主键的一个或多个范围运行查询。在此示例中，对于特定跟踪标签、特定标签和日期范围、特定标签和日期、以及多个标签带有日期范围的查询，查询将会很快。

让我们看看按以下方式配置的引擎：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下，在查询中：

``` sql
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

ClickHouse 将使用主键索引来修剪不适当的数据，并使用按月的分区键来修剪不适当日期范围的分区。

以上查询表明，即使是复杂表达式，索引也会被使用。表的读取组织方式使得使用索引的效率不低于完全扫描。

在下面的示例中，不能使用索引。

``` sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 是否可以在运行查询时使用索引，请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings.md/#force_primary_key)。

按月分区的键允许读取仅包含来自合适范围的日期的数据块。在这种情况下，数据块可能包含多个日期的数据（最多一个完整的一个月）。在块内，数据按主键排序，而主键可能不包含作为首列的日期。因此，仅使用日期条件且不指定主键前缀的查询将导致读取比单个日期更多的数据。
### 部分单调主键的索引使用 {#use-of-index-for-partially-monotonic-primary-keys}

例如，考虑一个月份的天数。它们形成一个 [单调序列](https://en.wikipedia.org/wiki/Monotonic_function) 对于一个月来说是单调的，但对于更长的时间段则不是单调的。这是一个部分单调序列。如果用户创建表时使用部分单调主键，ClickHouse 会正常创建稀疏索引。当用户从这种表中选择数据时，ClickHouse 会分析查询条件。如果用户想从索引的两个标记之间获取数据，并且这两个标记都在同一个月内，则 ClickHouse 可以在这种情况下使用索引，因为它可以计算查询参数和索引标记之间的距离。

如果查询参数范围中的主键值不代表单调序列，则 ClickHouse 无法使用索引。在这种情况下，ClickHouse 使用完全扫描方法。

ClickHouse 不仅对月份天数序列使用此逻辑，而且对任何表示部分单调序列的主键使用该逻辑。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明在 `CREATE` 查询的列部分中。

``` sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 家族的表，可以指定数据跳过索引。

这些索引在由 `granularity_value` 粒度组成的块上聚合有关指定表达式的一些信息（粒度的大小由表引擎中的 `index_granularity` 设置指定）。然后，这些聚合在 `SELECT` 查询中用于减少从磁盘读取的数据量，通过跳过在 `where` 查询无法满足的数据的大块。

可以省略 `GRANULARITY` 子句，`granularity_value` 的默认值为 1。

**示例**

``` sql
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

上述示例中的索引可被 ClickHouse 用于减少在以下查询中从磁盘读取的数据量：

``` sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

数据跳过索引也可以在复合列上创建：

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
### 可用的索引类型 {#available-types-of-indices}
#### MinMax {#minmax}

存储指定表达式的极值（如果表达式是元组，则为每个元组元素存储极值），使用存储的信息来跳过数据块，就像主键一样。

语法：`minmax`
#### Set {#set}

存储指定表达式的唯一值（不超过 `max_rows` 行，`max_rows=0` 表示“无限制”）。使用这些值检查数据块上是否不存在满足 `WHERE` 表达式的数据。

语法：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

存储指定列的 [Bloom 过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。可选参数 `false_positive`，值在 0 和 1 之间，指定从过滤器中接收假阳性响应的概率。默认值：0.025。支持的数据类型包括：`Int*`、`UInt*`、`Float*`、`Enum`、`Date`、`DateTime`、`String`、`FixedString`、`Array`、`LowCardinality`、`Nullable`、`UUID` 和 `Map`。对于 `Map` 数据类型，客户端可以使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定是否应为键或值创建索引。

语法：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

存储一个块数据中的所有 n-grams 的 [Bloom 过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。仅适用于数据类型：[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md) 和 [Map](/sql-reference/data-types/map.md)。可用于优化 `EQUALS`、`LIKE` 和 `IN` 表达式。

语法：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngram 大小，
- `size_of_bloom_filter_in_bytes` — Bloom 过滤器大小（字节），（可以在这里使用大值，例如，256 或 512，因为可以很好地压缩）。
- `number_of_hash_functions` — Bloom 过滤器中使用的哈希函数的数量。
- `random_seed` — Bloom 过滤器哈希函数的种子。

用户可以创建 [UDF](/sql-reference/statements/create/function.md) 来估算 `ngrambf_v1` 的参数设置。查询语句如下：

```sql
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
要使用这些函数，我们需要至少指定两个参数。
例如，如果粒度中有 4300 个 ngrams，并且我们期望假阳性小于 0.0001。可以通过执行以下查询来估算其他参数：


```sql
--- 估算过滤器中的位数
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- 估算哈希函数的数量
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```
当然，您也可以使用这些函数根据其他条件来估算参数。
这些函数的内容请参阅 [这里](https://hur.st/bloomfilter).
#### Token Bloom Filter {#token-bloom-filter}

与 `ngrambf_v1` 相同，但存储的是标记而不是 ngrams。标记是由非字母数字字符分隔的序列。

语法：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Special-purpose {#special-purpose}

- 一个实验性索引，支持近似最近邻搜索。更多详细信息请参见 [这里](annindexes.md)。
- 一个实验性全文索引，支持全文搜索。更多详细信息请参见 [这里](invertedindexes.md)。

### 函数支持 {#functions-support}

`WHERE` 子句中的条件包含对操作列的函数的调用。如果列是索引的一部分，ClickHouse 会在执行函数时尝试使用这个索引。ClickHouse 支持不同子集的函数以使用索引。

所有类型为 `set` 的索引都可以由所有函数利用。其他索引类型的支持情况如下：

| 函数 (操作符) / 索引                                                                                                 | 主键           | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|--------------------------------------------------------------------------------------------------------------------|-------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                       | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)                        | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                               | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                         | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                            | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                          | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                              | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                         | ✗           | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                                     | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                                  | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                             | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                             | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                                 | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                                       | ✗           | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                                      | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                                      | ✗           | ✗      | ✗          | ✗          | ✔            | ✗         |
| hasToken                                                                                                          | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                                    | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                        | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                                  | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |

具有小于 ngram 大小的常量参数的函数不能被 `ngrambf_v1` 用于查询优化。

(*) 对于 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 有效，`tokenbf_v1` 索引必须在小写数据上创建，例如 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
布隆过滤器可能会有误报，因此 `ngrambf_v1`、`tokenbf_v1` 和 `bloom_filter` 索引不能用于优化结果预期为 false 的查询。

例如：

- 可以优化:
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 不能优化:
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::
## 投影 {#projections}
投影类似于 [物化视图](/sql-reference/statements/create/view)，但在分区级别定义。它提供了一致性保障，并能自动在查询中使用。

:::note
在实现投影时，您还应该考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

在带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句中不支持投影。
### 投影查询 {#projection-query}
投影查询定义了一个投影。它隐式地从父表中选择数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

可以使用 [ALTER](/sql-reference/statements/alter/projection.md) 语句修改或删除投影。
### 投影存储 {#projection-storage}
投影存储在分区目录内。它类似于索引，但包含一个子目录，该子目录存储一个匿名 `MergeTree` 表的分区。该表由投影的定义查询引发。如果有 `GROUP BY` 子句，则基础存储引擎变为 [AggregatingMergeTree](aggregatingmergetree.md)，所有聚合函数都转换为 `AggregateFunction`。如果有 `ORDER BY` 子句，则 `MergeTree` 表将其作为主键表达式。在合并过程中，投影分区通过其存储的合并例程合并。父表分区的校验和与投影的分区合并。其他维护工作类似于跳过索引。
### 查询分析 {#projection-query-analysis}
1. 检查投影是否可以用于回答给定查询，即它生成的答案是否与查询基表相同。
2. 选择最佳可行匹配，该匹配包含最少的颗粒以读取。
3. 使用投影的查询管道将不同于使用原始部分的管道。如果某些部分中缺少投影，我们可以添加该管道来动态“投影”它。
## 并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当一个表同时被读取和更新时，数据是从查询时的当前一组部分中读取的。没有漫长的锁定。插入不会妨碍读取操作。

从表中读取自动并行化。
## 列和表的 TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

`TTL` 子句可以为整个表和每个单独列设置。表级 `TTL` 还可以指定在磁盘和卷之间自动移动数据的逻辑，或重新压缩所有数据已过期的部分。

表达式必须评估为 [Date](/sql-reference/data-types/date.md) 或 [DateTime](/sql-reference/data-types/datetime.md) 数据类型。

**语法**

为列设置生存时间：

``` sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，使用 [时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 操作符，例如：

``` sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### 列 TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse 会用列数据类型的默认值替换它们。如果数据部分中的所有列值过期，则 ClickHouse 会从文件系统的数据部分中删除该列。

`TTL` 子句不能用于键列。

**示例**
#### 创建带有 `TTL` 的表： {#creating-a-table-with-ttl}

``` sql
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

``` sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```
#### 修改列的 TTL {#altering-ttl-of-the-column}

``` sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### 表 TTL {#mergetree-table-ttl}

表可以有过期行的删除表达式，并且可以在 [磁盘或卷](#table_engine-mergetree-multiple-volumes) 之间自动移动部分的多个表达式。当表中的行过期时，ClickHouse 会删除所有相应的行。对于部分移动或重新压缩，部分的所有行必须满足 `TTL` 表达式标准。

``` sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可能跟随每个 TTL 表达式。它影响达到条件后（达到当前时间）所要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 用 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将分区移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将分区移动到卷 `bbb`；
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句结合使用，仅根据筛选条件删除某些过期行：
``` sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果某列不是 `GROUP BY` 表达式的一部分且在 `SET` 子句中未显式设置，则结果行将包含来自分组行的偶然值（就好像对其应用了聚合函数 `any`）。

**示例**
#### 创建带有 `TTL` 的表： {#creating-a-table-with-ttl-1}

``` sql
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

``` sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

创建一个表，其中行在一个月后过期。过期行的日期是周一被删除：

``` sql
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
#### 创建一个表，其中过期行被重新压缩： {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个表，其中过期行被聚合。结果行中的 `x` 包含分组行中的最大值，`y` — 最小值，以及 `d` — 来自分组行的任何偶然值。

``` sql
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
### 移除过期数据 {#mergetree-removing-expired-data}

具有过期 `TTL` 的数据在 ClickHouse 合并数据部分时被移除。

当 ClickHouse 检测到数据已过期时，会执行异步合并。要控制此类合并的频率，可以设置 `merge_with_ttl_timeout`。如果值设置得过低，则会进行许多异步合并，这可能消耗大量资源。

如果您在合并之间执行 `SELECT` 查询，可能会获得过期数据。要避免这种情况，请在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置
## 磁盘类型 {#disk-types}

除了本地块设备，ClickHouse 还支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读访问的网络](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中不可变的非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)
## 使用多个块设备进行数据存储 {#table_engine-mergetree-multiple-volumes}
### 介绍 {#introduction}

`MergeTree` 家族表引擎可以在多个块设备上存储数据。例如，当某个表的数据隐式地分为“热”数据和“冷”数据时，这可能会很有用。最近的数据经常被请求，但只需要少量空间。相反，胖尾的历史数据很少被请求。如果有多个磁盘可用，“热”数据可以放在快速磁盘上（例如，NVMe SSD 或内存中），而“冷”数据可以放在相对较慢的磁盘上（例如，HDD）。

数据部分是 `MergeTree` 引擎表的最小可移动单元。属于一个部分的数据存储在一块磁盘上。数据部分可以在后台（根据用户设置）及通过 [ALTER](/sql-reference/statements/alter/partition) 查询在磁盘之间移动。
### 名词术语 {#terms}

- 磁盘 — 已挂载到文件系统的块设备。
- 默认磁盘 — 存储在 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定的路径的磁盘。
- 卷 — 有序的一组相同磁盘（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 — 一组卷及其间移动数据的规则。

所描述的实体的名称可以在系统表 [system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要将配置的存储策略之一应用于表，请使用 `MergeTree` 引擎家族表的 `storage_policy` 设置。
### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `<storage_configuration>` 标签内进行声明，或者在 `config.d` 目录中的文件中。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分中声明。这对临时附加磁盘（例如，托管在 URL 上）进行临时分析非常有用。
有关更多详细信息，请参阅 [动态存储](/operations/storing-data#dynamic-configuration)。
:::

配置结构：

``` xml
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

- `<disk_name_N>` — 磁盘名称。所有磁盘的名称必须不同。
- `path` — 服务器将存储数据（`data` 和 `shadow` 文件夹）的路径，应以 `/` 结束。
- `keep_free_space_bytes` — 要保留的空闲磁盘空间量。

磁盘定义的顺序并不重要。

存储策略配置标记：

``` xml
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
                    <!-- 配置 -->
                </volume_name_2>
                <!-- 更多卷 -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 配置 -->
        </policy_name_2>

        <!-- 更多策略 -->
    </policies>
    ...
</storage_configuration>
```

标签：

- `policy_name_N` — 策略名称。策略名称必须是唯一的。
- `volume_name_N` — 卷名称。卷名称必须是唯一的。
- `disk` — 卷内的一块磁盘。
- `max_data_part_size_bytes` — 可以存储在任何卷磁盘上的部分最大大小。如果合并后的部分大小估计超过 `max_data_part_size_bytes`，则该部分将写入下一个卷。基本上，该功能允许在热（SSD）卷上保留新/小部分，并在达到较大尺寸时将其移动到冷（HDD）卷。如果策略仅有一个卷，则不要使用此设置。
- `move_factor` — 当可用空间低于此因子时，数据会自动开始移动到下一个卷（默认为 0.1）。ClickHouse 会根据大小从大到小（降序）对现有部分进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则所有部分都将被移动。
- `perform_ttl_move_on_insert` — 禁用数据部分插入时的 TTL 移动。默认情况下（如果启用），如果我们插入的部分已经过了 TTL 移动规则，则它立即转到规定的移动规则中的卷/磁盘。如果禁用，则已经过期的部分将写入默认卷，然后立即移动到 TTL 卷。
- `load_balancing` - 磁盘平衡策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置更新时间（以毫秒为单位），以更新所有磁盘上的可用空间（`0` - 始终更新，`-1` - 从不更新，默认值是 `60000`）。注意，如果磁盘仅被 ClickHouse 使用且不受在线文件系统调整/收缩影响，则可以使用 `-1`，在所有其他情况下不建议使用，因为最终会导致空间分配不正确。
- `prefer_not_to_merge` — 您不应使用此设置。禁用此卷上数据部分的合并（这有害并导致性能下降）。启用此设置后（不要这样做），不允许在此卷上合并数据（这很糟糕）。这会让您（但您不需要这样）控制 ClickHouse 如何与慢速磁盘交互（但 ClickHouse 更清楚，所以请不要使用此设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。较小的值意味着更高的优先级。参数值应为自然数，并且集体覆盖从 1 到 N 的范围（最低优先级）。 
  * 如果 _所有_ 卷都有标签，则按给定顺序优先考虑它们。
  * 如果只有 _某些_ 卷有标签，则没有标签的卷具有最低优先级，优先按照其在配置中定义的顺序进行排序。
  * 如果 _没有_ 卷有标签，则其优先级根据在配置中的声明顺序设置。
  * 两个卷不能具有相同的优先级值。

配置示例：

``` xml
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

在给定示例中，`hdd_in_order` 策略实现了 [轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方法。因此，该策略仅定义一个卷（`single`），数据部分在所有磁盘间轮流存储。如果系统中有几个相似的磁盘挂载，而 RAID 未配置，这种策略可能相当有用。请记住，每个单独的磁盘驱动器都不可靠，您可能想用 3 或更多的复制因子来补偿它。

如果系统中有可用的不同类型的磁盘，则可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 包含一个 SSD 磁盘（`fast_ssd`），可以在此卷上存储的部分最大大小为 1GB。所有大小大于 1GB 的部分将直接存储在 `cold` 卷中，该卷包含一个 HDD 磁盘 `disk1`。
一旦磁盘 `fast_ssd` 的使用率超过 80%，数据将通过后台过程转移到 `disk1`。

卷在存储策略内的顺序在至少一个列出了的卷没有明确的 `volume_priority` 参数时很重要。
一旦一个卷超填，数据就会移动到下一个卷。磁盘的枚举顺序也很重要，因为数据在这些磁盘上是轮流存储的。

在创建表时，可以将配置的存储策略之一应用于它：

``` sql
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

默认存储策略意味着只使用一个卷，该卷仅由 `<path>` 中给定的一个磁盘组成。
您可以使用 [ALTER TABLE ... MODIFY SETTING] 查询更改表创建后的存储策略，新策略应包含所有旧磁盘和同名卷。

执行数据部分背景迁移的线程数量可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置更改。
### 细节 {#details}

在 `MergeTree` 表的情况下，数据以不同的方式写入磁盘：

- 作为插入的结果（`INSERT` 查询）。
- 在后台合并和 [变更](/sql-reference/statements/alter#mutations) 期间。
- 从另一个副本下载时。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在所有这些情况下，除了变更和分区冻结，部分根据给定的存储策略存储在一个卷和一个磁盘上：

1. 选择第一个卷（定义顺序中）具有足够存储部分的磁盘（`unreserved_space > current_part_size`）并允许存储给定大小的部分的卷（`max_data_part_size_bytes > current_part_size`）。
2. 选择在该卷内，跟随用于存储先前数据块的磁盘，并且具有不少于当前部分大小的可用空间（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在后台，基于可用空间量（`move_factor` 参数），部分在卷之间移动，按配置文件中声明的卷的顺序进行移动。
数据永远不会从最后一个卷转移到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）监控后台迁移。此外，详细信息可以在服务器日志中找到。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将部分或分区从一个卷移动到另一卷，所有背景操作的限制都会得到考虑。该查询会单独发起移动，并且不会等待背景操作完成。如果没有足够的可用空间或任何所需条件未满足，用户将收到错误消息。

移动数据不会干扰数据复制。因此，对于同一表的不同副本，可以指定不同的存储策略。

在后台合并和变更完成后，旧部分仅在经过某段时间后被移除（`old_parts_lifetime`）。
在此期间，它们不会被移动到其他卷或磁盘。因此，直到部分被最终移除为止，它们仍会被考虑在占用的磁盘空间评估中。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod) 设置，以平衡地为不同 JBOD（https://en.wikipedia.org/wiki/Non-RAID_drive_architectures）卷分配新的大部分。
```
## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 家族的表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`。有关更详细的信息，请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

使用类型为 `s3` 的磁盘作为外部存储的 [S3](https://aws.amazon.com/s3/) 示例。

配置标记：
``` xml
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

另请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

:::note 缓存配置
ClickHouse 22.3 到 22.7 版本使用不同的缓存配置，如果您使用的是这些版本之一，请参见 [使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::
## 虚拟列 {#virtual-columns}

- `_part` — 部件的名称。
- `_part_index` — 查询结果中部件的顺序索引。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 唯一的部件标识符（如果启用了 MergeTree 设置 `assign_part_uuids`）。
- `_partition_value` — `partition by` 表达式的值（一个元组）。
- `_sample_factor` — 采样因子（来自查询）。
- `_block_number` — 行的块编号，当 `allow_experimental_block_number_column` 设置为 true 时，它会在合并时被持久化。

## 列统计信息 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

统计信息声明位于 `CREATE` 查询的列部分，适用于启用 `set allow_experimental_statistics = 1` 的 `*MergeTree*` 家族表。

``` sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们也可以使用 `ALTER` 语句操作统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息聚合有关列中值分布的信息。统计信息存储在每个部件中，并在每次插入时进行更新。
仅当我们启用 `set allow_statistics_optimize = 1` 时，它们才能用于 prewhere 优化。

### 可用的列统计信息类型 {#available-types-of-column-statistics}

- `MinMax`

    最小和最大列值，允许估算数字列的范围过滤器的选择性。

    语法： `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 草图，允许计算数字列的近似百分位数（例如，第90百分位数）。

    语法： `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图，提供有关列中包含多少个不同值的估算。

    语法： `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 草图，提供每个值在列中频率的近似计数。

    语法： `countmin`

### 支持的数据类型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String 或 FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |

### 支持的操作 {#supported-operations}

|           | 相等过滤器 (==) | 范围过滤器 (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |

## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别被覆盖：

- `max_compress_block_size` — 在写入表之前压缩未压缩数据块的最大大小。
- `min_compress_block_size` — 在写入下一个标记时所需的未压缩数据块的最小大小。

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

列级设置可以使用 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 进行修改或删除，例如：

- 从列声明中移除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，也会移除表的 CREATE 查询中列表达式中的设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
