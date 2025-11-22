---
description: '`MergeTree` 系列表引擎专为高写入速率和海量数据规模而设计。'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree 表引擎'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree 表引擎

`MergeTree` 引擎以及 `MergeTree` 系列表引擎（例如 `ReplacingMergeTree`、`AggregatingMergeTree`）是 ClickHouse 中最常用、最健壮的表引擎。

`MergeTree` 系列表引擎专为高数据写入速率和海量数据规模而设计。
插入操作会创建表数据部分（parts），这些数据部分会由后台进程与其他数据部分进行合并。

`MergeTree` 系列表引擎的主要特性如下：

- 表的主键决定每个数据部分内部的排序顺序（聚簇索引）。主键同样不是引用单独的行，而是引用由 8192 行组成的数据块，这些数据块称为粒度（granule）。这样可以使海量数据集的主键足够小，从而始终保留在内存中，同时仍然能够快速访问磁盘上的数据。

- 表可以使用任意分区表达式进行分区。当查询条件允许时，分区裁剪会确保在读取时跳过无关分区。

- 数据可以在多个集群节点之间进行复制，以实现高可用、故障切换和零停机升级。参见 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持多种统计信息和采样方法，以帮助进行查询优化。

:::note
尽管名称相似，[Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎是不同的。
:::



## 创建表 {#table_engine-mergetree-creating-a-table}

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

有关参数的详细说明,请参阅 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句。

### 查询子句 {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。`ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。

#### ORDER BY {#order_by}

`ORDER BY` — 排序键。

由列名或任意表达式组成的元组。示例:`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键(即未指定 `PRIMARY KEY`),ClickHouse 将使用排序键作为主键。

如果不需要排序,可以使用语法 `ORDER BY tuple()`。
或者,如果启用了设置 `create_table_empty_primary_key_by_default`,则会隐式地将 `ORDER BY ()` 添加到 `CREATE TABLE` 语句中。请参阅[选择主键](#selecting-a-primary-key)。

#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下,您不需要分区键,即使需要分区,通常也不需要比按月更细粒度的分区键。分区不会加速查询(与 ORDER BY 表达式相反)。您不应使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区(而应将客户端标识符或名称作为 ORDER BY 表达式中的第一列)。

对于按月分区,使用 `toYYYYMM(date_column)` 表达式,其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此处的分区名称采用 `"YYYYMM"` 格式。

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 主键,如果它[与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)。可选。

指定排序键(使用 `ORDER BY` 子句)会隐式指定主键。
通常不需要在排序键之外额外指定主键。

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定,它必须包含在主键中。
采样表达式必须返回无符号整数。

示例:`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。

#### TTL {#ttl}

`TTL` — 指定行的存储持续时间以及[磁盘和卷之间](#table_engine-mergetree-multiple-volumes)自动移动数据部分的逻辑的规则列表。可选。

表达式必须返回 `Date` 或 `DateTime` 类型,例如 `TTL date + INTERVAL 1 DAY`。


规则类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定当表达式满足条件(达到当前时间)时对数据分区执行的操作:删除过期行、将数据分区移动到指定磁盘(`TO DISK 'xxx'`)或卷(`TO VOLUME 'xxx'`)(如果数据分区中的所有行都满足表达式条件),或聚合过期行中的值。规则的默认类型是删除(`DELETE`)。可以指定多个规则列表,但不应超过一个 `DELETE` 规则。

有关更多详细信息,请参阅 [列和表的 TTL](#table_engine-mergetree-ttl)

#### SETTINGS {#settings}

请参阅 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**配置节示例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在此示例中,我们按月设置分区。

我们还设置了一个采样表达式,使用用户 ID 的哈希值。这允许您为每个 `CounterID` 和 `EventDate` 对表中的数据进行伪随机化。如果在查询数据时定义 [SAMPLE](/sql-reference/statements/select/sample) 子句,ClickHouse 将为用户子集返回均匀的伪随机数据样本。

`index_granularity` 设置可以省略,因为 8192 是默认值。

<details markdown="1">

<summary>已弃用的建表方法</summary>

:::note
请勿在新项目中使用此方法。如果可能,请将旧项目切换到上述方法。
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

- `date-column` — [Date](/sql-reference/data-types/date.md) 类型列的名称。ClickHouse 会根据此列自动按月创建分区。分区名称采用 `"YYYYMM"` 格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型:[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引粒度。索引"标记"之间的数据行数。值 8192 适用于大多数任务。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎的配置方式与上述主引擎配置方法示例中的方式相同。

</details>


## 数据存储 {#mergetree-data-storage}

表由按主键排序的数据部分(data part)组成。

当数据插入表中时,会创建独立的数据部分,每个部分都按主键进行字典序排序。例如,如果主键是 `(CounterID, Date)`,则部分中的数据按 `CounterID` 排序,在每个 `CounterID` 内,再按 `Date` 排序。

属于不同分区的数据被分离到不同的部分中。ClickHouse 会在后台合并数据部分以实现更高效的存储。属于不同分区的部分不会被合并。合并机制不保证具有相同主键的所有行都位于同一个数据部分中。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中,每列存储在文件系统中的单独文件中;在 `Compact` 格式中,所有列存储在一个文件中。`Compact` 格式可用于提高小规模频繁插入的性能。

数据存储格式由表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果数据部分中的字节数或行数小于相应设置的值,则该部分以 `Compact` 格式存储;否则以 `Wide` 格式存储。如果未设置这些参数,则数据部分以 `Wide` 格式存储。

每个数据部分在逻辑上被划分为多个颗粒(granule)。颗粒是 ClickHouse 在查询数据时读取的最小不可分割数据集。ClickHouse 不会拆分行或值,因此每个颗粒始终包含整数个行。颗粒的第一行用该行的主键值进行标记。对于每个数据部分,ClickHouse 会创建一个索引文件来存储这些标记(mark)。对于每一列,无论是否在主键中,ClickHouse 也会存储相同的标记。这些标记使您能够直接在列文件中定位数据。

颗粒大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置限制。颗粒中的行数位于 `[1, index_granularity]` 范围内,具体取决于行的大小。如果单行的大小大于该设置的值,则颗粒的大小可以超过 `index_granularity_bytes`。在这种情况下,颗粒的大小等于该行的大小。


## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在这种情况下,排序和索引可以如下图所示:

```text
完整数据:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
标记:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
标记编号:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定:

- `CounterID in ('a', 'h')`,服务器读取标记范围 `[0, 3)` 和 `[6, 8)` 中的数据。
- `CounterID IN ('a', 'h') AND Date = 3`,服务器读取标记范围 `[1, 3)` 和 `[7, 8)` 中的数据。
- `Date = 3`,服务器读取标记范围 `[1, 10]` 中的数据。

上述示例表明,使用索引总是比全表扫描更高效。

稀疏索引允许读取额外的数据。当读取主键的单个范围时,每个数据块中最多可以读取 `index_granularity * 2` 个额外的行。

稀疏索引允许您处理非常大量的表行,因为在大多数情况下,这些索引可以完全放入计算机的 RAM 中。

ClickHouse 不要求主键唯一。您可以插入具有相同主键的多行数据。

您可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式,但强烈不建议这样做。要启用此功能,请开启 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。在 `ORDER BY` 子句中,`NULL` 值遵循 [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则。

### 选择主键 {#selecting-a-primary-key}

主键中的列数没有明确限制。根据数据结构,您可以在主键中包含更多或更少的列。这可能会:

- 提高索引性能。

  如果主键是 `(a, b)`,那么在满足以下条件时,添加另一列 `c` 将提高性能:
  - 存在对列 `c` 有条件的查询。
  - 具有相同 `(a, b)` 值的长数据范围(比 `index_granularity` 长几倍)很常见。换句话说,当添加另一列可以让您跳过相当长的数据范围时。

- 提高数据压缩率。

  ClickHouse 按主键对数据进行排序,因此一致性越高,压缩效果越好。

- 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中合并数据部分时提供额外的逻辑。

  在这种情况下,指定与主键不同的_排序键_是有意义的。

过长的主键会对插入性能和内存消耗产生负面影响,但主键中的额外列不会影响 ClickHouse 在 `SELECT` 查询时的性能。

您可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下,ClickHouse 按插入顺序存储数据。如果您希望在通过 `INSERT ... SELECT` 查询插入数据时保持数据顺序,请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要按初始顺序选择数据,请使用[单线程](/operations/settings/settings.md/#max_threads) `SELECT` 查询。

### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}


可以指定与排序键(用于对数据部分中的行进行排序的表达式)不同的主键(其值会写入索引文件中每个标记的表达式)。在这种情况下,主键表达式元组必须是排序键表达式元组的前缀。

此功能在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时非常有用。在使用这些引擎的常见场景中,表包含两种类型的列:_维度列_ 和 _度量列_。典型的查询会使用任意 `GROUP BY` 对度量列的值进行聚合,并按维度进行过滤。由于 SummingMergeTree 和 AggregatingMergeTree 会聚合具有相同排序键值的行,因此自然会将所有维度添加到排序键中。这样一来,键表达式就由一长串列组成,并且必须频繁更新此列表以包含新添加的维度。

在这种情况下,合理的做法是在主键中仅保留少数几列以提供高效的范围扫描,并将其余维度列添加到排序键元组中。

排序键的 [ALTER](/sql-reference/statements/alter/index.md) 是一个轻量级操作,因为当新列同时添加到表和排序键时,现有数据部分无需更改。由于旧排序键是新排序键的前缀,并且新添加的列中没有数据,因此在表修改时,数据同时按旧排序键和新排序键排序。

### 在查询中使用索引和分区 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询,ClickHouse 会分析是否可以使用索引。如果 `WHERE/PREWHERE` 子句包含表示相等或不等比较操作的表达式(作为合取元素之一或整体),或者在主键或分区键中的列或表达式上包含带固定前缀的 `IN` 或 `LIKE`,或者在这些列的某些部分重复函数上,或者这些表达式的逻辑关系上,则可以使用索引。

因此,可以在主键的一个或多个范围上快速运行查询。在此示例中,针对特定跟踪标签、特定标签和日期范围、特定标签和日期、具有日期范围的多个标签等运行查询时,查询速度会很快。

让我们看一下如下配置的引擎:

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下,在以下查询中:

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

ClickHouse 将使用主键索引来修剪不相关的数据,并使用月度分区键来修剪不在适当日期范围内的分区。

上述查询表明,即使对于复杂表达式也会使用索引。从表中读取数据的组织方式确保使用索引不会比全表扫描慢。

在下面的示例中,无法使用索引。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 在运行查询时是否可以使用索引,请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings#force_primary_key)。

按月分区的键允许仅读取包含适当范围内日期的数据块。在这种情况下,数据块可能包含多个日期的数据(最多整个月)。在块内,数据按主键排序,而主键可能不包含日期作为第一列。因此,使用仅包含日期条件且未指定主键前缀的查询将导致读取的数据多于单个日期所需的数据。

### 对部分单调主键使用索引 {#use-of-index-for-partially-monotonic-primary-keys}


例如,考虑月份中的日期。它们在一个月内形成[单调序列](https://en.wikipedia.org/wiki/Monotonic_function),但在更长的时间段内则不是单调的。这是一个部分单调序列。如果用户使用部分单调主键创建表,ClickHouse 会像往常一样创建稀疏索引。当用户从这种表中查询数据时,ClickHouse 会分析查询条件。如果用户想要获取索引的两个标记之间的数据,并且这两个标记都在同一个月内,ClickHouse 可以在这种特定情况下使用索引,因为它可以计算查询参数与索引标记之间的距离。

如果查询参数范围内的主键值不构成单调序列,ClickHouse 无法使用索引。在这种情况下,ClickHouse 会使用全表扫描方法。

ClickHouse 不仅对月份日期序列使用此逻辑,对任何表示部分单调序列的主键都使用此逻辑。

### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明位于 `CREATE` 查询的列部分。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 系列的表,可以指定数据跳过索引。

这些索引在由 `granularity_value` 个颗粒组成的块上聚合指定表达式的某些信息(颗粒的大小使用表引擎中的 `index_granularity` 设置指定)。然后在 `SELECT` 查询中使用这些聚合信息,通过跳过 `where` 查询条件无法满足的大数据块来减少从磁盘读取的数据量。

`GRANULARITY` 子句可以省略,`granularity_value` 的默认值为 1。

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

ClickHouse 可以使用示例中的索引来减少以下查询中从磁盘读取的数据量:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

数据跳过索引也可以在复合列上创建:

```sql
-- 在 Map 类型的列上:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- 在 Tuple 类型的列上:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- 在 Nested 类型的列上:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### 跳过索引类型 {#skip-index-types}

`MergeTree` 表引擎支持以下类型的跳过索引。
有关如何使用跳过索引进行性能优化的更多信息,
请参阅["理解 ClickHouse 数据跳过索引"](/optimize/skipping-indexes)。

- [`MinMax`](#minmax) 索引
- [`Set`](#set) 索引
- [`bloom_filter`](#bloom-filter) 索引
- [`ngrambf_v1`](#n-gram-bloom-filter) 索引
- [`tokenbf_v1`](#token-bloom-filter) 索引

#### MinMax 跳过索引 {#minmax}

对于每个索引颗粒,存储表达式的最小值和最大值。
(如果表达式是 `tuple` 类型,则存储每个元组元素的最小值和最大值。)

```text title="语法"
minmax
```

#### Set 索引 {#set}

对于每个索引颗粒,最多存储指定表达式的 `max_rows` 个唯一值。
`max_rows = 0` 表示"存储所有唯一值"。

```text title="语法"
set(max_rows)
```

#### Bloom filter 索引 {#bloom-filter}

对于每个索引颗粒,为指定的列存储一个 [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)。

```text title="语法"
bloom_filter([false_positive_rate])
```

`false_positive_rate` 参数可以取 0 到 1 之间的值(默认值:`0.025`),用于指定产生假阳性的概率(这会增加需要读取的数据量)。


支持以下数据类型:

- `(U)Int*`
- `Float*`
- `Enum`
- `Date`
- `DateTime`
- `String`
- `FixedString`
- `Array`
- `LowCardinality`
- `Nullable`
- `UUID`
- `Map`

:::note Map 数据类型:使用键或值指定索引创建
对于 `Map` 数据类型,客户端可以使用 [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定为键或值创建索引。
:::

#### N-gram 布隆过滤器 {#n-gram-bloom-filter}

为每个索引粒度存储指定列的 [n-grams](https://en.wikipedia.org/wiki/N-gram) 的[布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。

```text title="语法"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| 参数                            | 描述                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `n`                             | ngram 大小                                                                                                                   |
| `size_of_bloom_filter_in_bytes` | 布隆过滤器大小(以字节为单位)。可以使用较大的值,例如 `256` 或 `512`,因为它可以很好地压缩)。 |
| `number_of_hash_functions`      | 布隆过滤器中使用的哈希函数数量。                                                                       |
| `random_seed`                   | 布隆过滤器哈希函数的随机种子。                                                                                    |

此索引仅适用于以下数据类型:

- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

要估算 `ngrambf_v1` 的参数,可以使用以下[用户定义函数 (UDF)](/sql-reference/statements/create/function.md)。

```sql title="ngrambf_v1 的 UDF"
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

要使用这些函数,需要至少指定两个参数:

- `total_number_of_all_grams`
- `probability_of_false_positives`

例如,粒度中有 `4300` 个 ngram,并且期望误报率低于 `0.0001`。
然后可以通过执行以下查询来估算其他参数:

```sql
--- 估算过滤器中的位数
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- 估算哈希函数数量
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

当然,也可以使用这些函数来估算其他条件下的参数。
上述函数参考了[此处](https://hur.st/bloomfilter)的布隆过滤器计算器。

#### Token 布隆过滤器 {#token-bloom-filter}

Token 布隆过滤器与 `ngrambf_v1` 相同,但存储的是 token(由非字母数字字符分隔的序列)而不是 ngram。

```text title="语法"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```


#### 稀疏 gram 布隆过滤器 {#sparse-grams-bloom-filter}

稀疏 gram 布隆过滤器与 `ngrambf_v1` 类似,但使用[稀疏 gram 标记](/sql-reference/functions/string-functions.md/#sparseGrams)代替 ngram。

```text title="语法"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

### 文本索引 {#text}

支持全文搜索,详情请参阅[此处](invertedindexes.md)。

#### 向量相似度 {#vector-similarity}

支持近似最近邻搜索,详情请参阅[此处](annindexes.md)。

### 函数支持 {#functions-support}

`WHERE` 子句中的条件包含对列进行操作的函数调用。如果列是索引的一部分,ClickHouse 在执行函数时会尝试使用该索引。ClickHouse 针对索引使用支持不同的函数子集。

`set` 类型的索引可被所有函数使用。其他索引类型的支持情况如下:


| 函数（运算符）/索引                                                                                                                | 主键 | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | text | sparse&#95;grams |
| ------------------------------------------------------------------------------------------------------------------------- | -- | ------ | -------------- | -------------- | ---------------- | ---- | ---------------- |
| [等于 (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                    | ✔  | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔  | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔  | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔  | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗  | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔  | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗  | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗  | ✗      | ✔              | ✗              | ✗                | ✗    | ✗                |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔  | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔  | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [小于 (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                        | ✔  | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [大于（`>`）](/sql-reference/functions/comparison-functions.md/#greater)                                                      | ✔  | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [lessOrEquals（`<=`）](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                      | ✔  | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [greaterOrEquals（`>=`，大于等于）](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                           | ✔  | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔  | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗  | ✔      | ✗              | ✗              | ✗                | ✗    | ✔                |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗  | ✗      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗  | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗  | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗  | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗  | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗  | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗  | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗  | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗  | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                   | ✗  | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |



当函数的常量参数小于 ngram 大小时，`ngrambf_v1` 无法用于查询优化。

(*) 要使 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 有效，必须在已转换为小写的数据上创建 `tokenbf_v1` 索引，例如：`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
Bloom filter 可能产生误报，因此 `ngrambf_v1`、`tokenbf_v1`、`sparse_grams` 和 `bloom_filter` 索引不能用于优化那些期望函数结果为 false 的查询。

例如：

- 可以被优化：
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 不可以被优化：
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::



## 投影 {#projections}

投影类似于[物化视图](/sql-reference/statements/create/view)，但在数据分区级别定义。它提供一致性保证，并在查询中自动使用。

:::note
在实现投影时，您还应考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句不支持投影。

### 投影查询 {#projection-query}

投影查询用于定义投影。它隐式地从父表中选择数据。

**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

可以使用 [ALTER](/sql-reference/statements/alter/projection.md) 语句修改或删除投影。

### 投影存储 {#projection-storage}

投影存储在数据分区目录内。它类似于索引，但包含一个子目录，用于存储匿名 `MergeTree` 表的数据分区。该表由投影的定义查询生成。如果存在 `GROUP BY` 子句,底层存储引擎将变为 [AggregatingMergeTree](aggregatingmergetree.md)，并且所有聚合函数都会转换为 `AggregateFunction`。如果存在 `ORDER BY` 子句，`MergeTree` 表将其用作主键表达式。在合并过程中，投影分区通过其存储的合并例程进行合并。父表分区的校验和与投影分区的校验和合并。其他维护任务与跳数索引类似。

### 查询分析 {#projection-query-analysis}

1. 检查投影是否可用于回答给定查询，即它是否生成与查询基表相同的结果。
2. 选择最佳可行匹配，即需要读取最少颗粒数的匹配。
3. 使用投影的查询管道将与使用原始分区的查询管道不同。如果某些分区中不存在投影，我们可以添加管道以即时"投影"它。


## 并发数据访问 {#concurrent-data-access}

对于并发表访问,ClickHouse 使用多版本控制机制。换句话说,当表被同时读取和更新时,数据从查询时刻的当前数据分片集合中读取。不存在长时间锁定。插入操作不会阻塞读取操作。

表的读取操作会自动并行化。


## 列和表的 TTL {#table_engine-mergetree-ttl}

确定数据值的生存时间。

`TTL` 子句可以为整个表和每个单独的列设置。表级 `TTL` 还可以指定在磁盘和卷之间自动移动数据的逻辑,或对所有数据已过期的部分进行重新压缩。

表达式的求值结果必须为 [Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md) 或 [DateTime64](/sql-reference/data-types/datetime64.md) 数据类型。

**语法**

为列设置生存时间:

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`,请使用[时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times)运算符,例如:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### 列 TTL {#mergetree-column-ttl}

当列中的值过期时,ClickHouse 会将它们替换为该列数据类型的默认值。如果数据部分中某列的所有值都过期,ClickHouse 会从文件系统的数据部分中删除该列。

`TTL` 子句不能用于键列。

**示例**

#### 创建带有 `TTL` 的表: {#creating-a-table-with-ttl}

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

#### 为现有表的列添加 TTL {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```

#### 修改列的 TTL {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### 表 TTL {#mergetree-table-ttl}

表可以有一个用于删除过期行的表达式,以及多个用于在[磁盘或卷](#table_engine-mergetree-multiple-volumes)之间自动移动部分的表达式。当表中的行过期时,ClickHouse 会删除所有相应的行。对于部分的移动或重新压缩,该部分的所有行都必须满足 `TTL` 表达式条件。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

每个 TTL 表达式后面可以跟 TTL 规则的类型。它决定了当表达式满足条件(达到当前时间)时要执行的操作:

- `DELETE` - 删除过期行(默认操作);
- `RECOMPRESS codec_name` - 使用 `codec_name` 重新压缩数据部分;
- `TO DISK 'aaa'` - 将部分移动到磁盘 `aaa`;
- `TO VOLUME 'bbb'` - 将部分移动到卷 `bbb`;
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句一起使用,根据过滤条件仅删除部分过期行:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果某列不是 `GROUP BY` 表达式的一部分,且未在 `SET` 子句中显式设置,则结果行中该列将包含分组行中的任意值(就像对其应用了聚合函数 `any`)。

**示例**

#### 创建带有 `TTL` 的表: {#creating-a-table-with-ttl-1}

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

#### 修改表的 `TTL`: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```


创建一个表,其中的行在一个月后过期。日期为星期一的过期行将被删除:

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

#### 创建一个表,其中过期的行会被重新压缩: {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个表,其中过期的行会被聚合。在结果行中,`x` 包含分组行中的最大值,`y` 包含最小值,`d` 包含分组行中的任意偶然值。

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

当 ClickHouse 合并数据部分时,具有过期 `TTL` 的数据会被删除。

当 ClickHouse 检测到数据已过期时,它会执行计划外合并。要控制此类合并的频率,可以设置 `merge_with_ttl_timeout`。如果该值设置得过低,将执行大量计划外合并,可能会消耗大量资源。

如果在合并之间执行 `SELECT` 查询,可能会获取到过期数据。为避免这种情况,请在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另请参阅**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置


## 磁盘类型 {#disk-types}

除本地块设备外,ClickHouse 还支持以下存储类型:

- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于 Web 只读访问](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中的不可变非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)


## 使用多个块设备存储数据 {#table_engine-mergetree-multiple-volumes}

### 简介 {#introduction}

`MergeTree` 系列表引擎可以在多个块设备上存储数据。比如，当某个表的数据被隐式划分为“热数据”和“冷数据”时，这一特性就非常有用。最新数据会被频繁访问，但只占用少量空间；相反，长尾的历史数据很少被请求。如果有多块磁盘可用，“热数据”可以放在快速磁盘上（例如 NVMe SSD 或内存中），而“冷数据”则可以放在相对较慢的磁盘上（例如 HDD）。

数据部分（data part）是 `MergeTree` 引擎表中最小的可移动单元。属于同一数据部分的数据存储在同一块磁盘上。数据部分既可以根据用户设置在后台在磁盘之间移动，也可以通过 [ALTER](/sql-reference/statements/alter/partition) 查询进行移动。

### 术语 {#terms}

- 磁盘（Disk）— 挂载到文件系统的块设备。
- 默认磁盘（Default disk）— 存储 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定路径的磁盘。
- 卷（Volume）— 一组同类磁盘的有序集合（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略（Storage policy）— 一组卷及其之间数据迁移规则的组合。

上述实体的名称可以在系统表 [system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要为某个表应用已配置的存储策略，请使用 `MergeTree` 系列表引擎的 `storage_policy` 设置。

### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `config.d` 目录中的文件里，在 `<storage_configuration>` 标签内进行声明。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分中声明。这对于临时分析（ad-hoc）场景非常有用，比如临时挂载某个通过 URL 提供的磁盘。
参见 [动态存储](/operations/storing-data#dynamic-configuration) 以了解更多细节。
:::

配置结构：

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- disk name -->
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

- `<disk_name_N>` — 磁盘名称。所有磁盘的名称必须各不相同。
- `path` — 服务器用于存储数据（`data` 和 `shadow` 目录）的路径，应以 “/” 结尾。
- `keep_free_space_bytes` — 需要预留的磁盘空闲空间大小。

磁盘定义的顺序并不重要。

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
                    <!-- configuration -->
                </volume_name_2>
                <!-- more volumes -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- configuration -->
        </policy_name_2>

        <!-- more policies -->
    </policies>
    ...
</storage_configuration>
```

标签：


* `policy_name_N` — 策略名称。策略名称必须唯一。
* `volume_name_N` — 卷名称。卷名称必须唯一。
* `disk` — 卷中的一个磁盘。
* `max_data_part_size_bytes` — 可以存储在该卷任意磁盘上的数据分片的最大大小。如果预估合并后的分片大小会大于 `max_data_part_size_bytes`，则该分片会被写入下一个卷。该功能基本上允许将新的/较小的分片保存在热点（SSD）卷上，并在它们变大时将其移动到冷存储（HDD）卷。对于仅包含一个卷的策略，不要使用此设置。
* `move_factor` — 当可用空间比例低于该因子时，数据会自动开始移动到下一个卷（如果存在）（默认值为 0.1）。ClickHouse 会按大小将已有分片从大到小（降序）排序，并选择总大小足以满足 `move_factor` 条件的分片。如果所有分片的总大小仍不足，则会移动所有分片。
* `perform_ttl_move_on_insert` — 是否在数据分片 INSERT 时执行 TTL 迁移。默认情况下（启用时），如果插入的数据分片已经满足 TTL 迁移规则而过期，则会立即被写入迁移规则中声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这会显著降低插入速度。如果禁用，则已过期的数据分片会先写入默认卷，然后再立即迁移到 TTL 卷。
* `load_balancing` - 磁盘负载均衡策略，可选值为 `round_robin` 或 `least_used`。
* `least_used_ttl_ms` - 配置所有磁盘可用空间信息的更新超时时间（毫秒）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘仅供 ClickHouse 使用，并且不会进行在线文件系统扩/缩容，则可以使用 `-1`；在其他所有情况下不推荐这样做，因为最终会导致空间分配不正确。
* `prefer_not_to_merge` — 不应使用此设置。禁用该卷上的数据分片合并（这会有害并导致性能下降）。当启用该设置时（不要这么做），不允许在此卷上合并数据（这很糟糕）。这虽然允许（但你并不需要）控制（如果你想控制什么，那就是在犯错）ClickHouse 如何与慢磁盘交互（但 ClickHouse 更清楚，所以请不要使用此设置）。
* `volume_priority` — 定义卷被填充的优先级（顺序）。数值越小优先级越高。参数值应为自然数，并整体覆盖从 1 到 N（最低优先级）之间的连续区间，中间不能跳过任何数字。
  * 如果 *所有* 卷都被打了标签，则按照给定顺序设定优先级。
  * 如果只有 *部分* 卷被打了标签，则未打标签的卷具有最低优先级，并按照它们在配置中定义的顺序确定优先级。
  * 如果 *没有* 卷被打标签，则其优先级按照它们在配置文件中的声明顺序确定。
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


在给定的示例中,`hdd_in_order` 策略实现了[轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling)方法。因此,该策略仅定义一个卷(`single`),数据部分按循环顺序存储在其所有磁盘上。如果系统挂载了多个相似的磁盘但未配置 RAID,这种策略会非常有用。请注意,每个单独的磁盘驱动器并不可靠,您可能需要使用 3 或更高的副本因子来补偿这一点。

如果系统中有不同类型的磁盘可用,则可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 由一个 SSD 磁盘(`fast_ssd`)组成,可以存储在该卷上的数据部分的最大大小为 1GB。所有大于 1GB 的数据部分将直接存储在 `cold` 卷上,该卷包含一个 HDD 磁盘 `disk1`。
此外,一旦磁盘 `fast_ssd` 的填充率超过 80%,数据将通过后台进程传输到 `disk1`。

如果列出的卷中至少有一个没有明确的 `volume_priority` 参数,则存储策略中卷的枚举顺序很重要。
一旦某个卷被填满,数据将移动到下一个卷。磁盘的枚举顺序同样重要,因为数据会轮流存储在这些磁盘上。

创建表时,可以对其应用已配置的存储策略之一:

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

`default` 存储策略意味着仅使用一个卷,该卷仅包含 `<path>` 中给定的一个磁盘。
您可以在创建表后使用 [ALTER TABLE ... MODIFY SETTING] 查询更改存储策略,新策略应包含所有具有相同名称的旧磁盘和卷。

执行数据部分后台移动的线程数可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。

### 详细信息 {#details}

对于 `MergeTree` 表,数据通过不同方式写入磁盘:

- 作为插入操作的结果(`INSERT` 查询)。
- 在后台合并和[变更](/sql-reference/statements/alter#mutations)期间。
- 从另一个副本下载时。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在除变更和分区冻结之外的所有这些情况下,数据部分根据给定的存储策略存储在卷和磁盘上:

1.  选择第一个(按定义顺序)具有足够磁盘空间来存储数据部分(`unreserved_space > current_part_size`)并允许存储给定大小的数据部分(`max_data_part_size_bytes > current_part_size`)的卷。
2.  在该卷内,选择紧随用于存储前一个数据块的磁盘之后的磁盘,并且该磁盘的可用空间大于数据部分大小(`unreserved_space - keep_free_space_bytes > current_part_size`)。

在底层,变更和分区冻结使用[硬链接](https://en.wikipedia.org/wiki/Hard_link)。不支持不同磁盘之间的硬链接,因此在这种情况下,生成的数据部分存储在与初始数据部分相同的磁盘上。

在后台,数据部分根据可用空间量(`move_factor` 参数)按照配置文件中声明卷的顺序在卷之间移动。
数据永远不会从最后一个卷传输到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log)(字段 `type = MOVE_PART`)和 [system.parts](/operations/system-tables/parts.md)(字段 `path` 和 `disk`)来监控后台移动。此外,详细信息可以在服务器日志中找到。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将数据部分或分区从一个卷移动到另一个卷,所有后台操作的限制都会被考虑在内。该查询会自行启动移动操作,不会等待后台操作完成。如果可用空间不足或不满足任何必需条件,用户将收到错误消息。

移动数据不会干扰数据复制。因此,可以为不同副本上的同一张表指定不同的存储策略。


在后台合并和变更操作完成后，旧的数据块只有在经过一定时间（`old_parts_lifetime`）后才会被删除。
在此期间，它们不会被移动到其他卷或磁盘。因此，在这些数据块被最终删除之前，评估已占用磁盘空间时仍会将其计算在内。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置，将新的大型数据块以均衡的方式分配到 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘上。



## 使用外部存储存储数据 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 系列表引擎可以通过类型为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘将数据分别存储到 `S3`、`AzureBlobStorage`、`HDFS`。更多详情请参阅[配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

以下示例展示了如何使用类型为 `s3` 的磁盘将 [S3](https://aws.amazon.com/s3/) 作为外部存储。

配置标记:

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
ClickHouse 版本 22.3 至 22.7 使用不同的缓存配置,如果您使用的是这些版本,请参阅[使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::


## 虚拟列 {#virtual-columns}

- `_part` — 数据分片的名称。
- `_part_index` — 数据分片在查询结果中的顺序索引。
- `_part_starting_offset` — 数据分片在查询结果中的累计起始行号。
- `_part_offset` — 数据分片中的行号。
- `_part_granule_offset` — 数据分片中的颗粒编号。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 数据分片的唯一标识符(如果启用了 MergeTree 设置 `assign_part_uuids`)。
- `_part_data_version` — 数据分片的数据版本(最小块编号或变更版本)。
- `_partition_value` — `partition by` 表达式的值(元组)。
- `_sample_factor` — 采样因子(来自查询)。
- `_block_number` — 插入时为行分配的原始块编号,当启用设置 `enable_block_number_column` 时在合并操作中保留。
- `_block_offset` — 插入时为行分配的块内原始行号,当启用设置 `enable_block_offset_column` 时在合并操作中保留。
- `_disk_name` — 用于存储的磁盘名称。


## 列统计信息 {#column-statistics}

<ExperimentalBadge />
<CloudNotSupportedBadge />

在启用 `set allow_experimental_statistics = 1` 后,可以在 `*MergeTree*` 系列表的 `CREATE` 查询的列定义部分声明统计信息。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

也可以使用 `ALTER` 语句来操作统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息汇总了列中值的分布信息。统计信息存储在每个数据部分中,并在每次插入数据时更新。
只有在启用 `set allow_statistics_optimize = 1` 时,才能将其用于 prewhere 优化。

### 可用的列统计信息类型 {#available-types-of-column-statistics}

- `MinMax`

  列的最小值和最大值,用于估算数值列上范围过滤器的选择性。

  语法:`minmax`

- `TDigest`

  [TDigest](https://github.com/tdunning/t-digest) 草图,用于计算数值列的近似百分位数(例如第 90 百分位数)。

  语法:`tdigest`

- `Uniq`

  [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图,用于估算列中不同值的数量。

  语法:`uniq`

- `CountMin`

  [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 草图,用于提供列中每个值出现频率的近似计数。

  语法:`countmin`

### 支持的数据类型 {#supported-data-types}

|          | (U)Int*, Float*, Decimal(_), Date_, Boolean, Enum\* | String 或 FixedString |
| -------- | --------------------------------------------------- | --------------------- |
| CountMin | ✔                                                  | ✔                    |
| MinMax   | ✔                                                  | ✗                     |
| TDigest  | ✔                                                  | ✗                     |
| Uniq     | ✔                                                  | ✔                    |

### 支持的操作 {#supported-operations}

|          | 等值过滤器 (==) | 范围过滤器 (`>, >=, <, <=`) |
| -------- | --------------------- | ------------------------------ |
| CountMin | ✔                    | ✗                              |
| MinMax   | ✗                     | ✔                             |
| TDigest  | ✗                     | ✔                             |
| Uniq     | ✔                    | ✗                              |


## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别覆盖:

- `max_compress_block_size` — 写入表时压缩前未压缩数据块的最大大小。
- `min_compress_block_size` — 写入下一个标记时压缩所需的未压缩数据块的最小大小。

示例:

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

列级设置可以使用 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 进行修改或删除,例如:

- 从列声明中删除 `SETTINGS`:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置,同时从表的 CREATE 查询的列表达式中删除设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
