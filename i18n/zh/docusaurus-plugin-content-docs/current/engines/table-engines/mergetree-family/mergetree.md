---
'description': '`MergeTree`系列表引擎旨在处理高数据摄取率和巨大的数据量。'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` 引擎和其他 `MergeTree` 系列引擎（例如 `ReplacingMergeTree`、`AggregatingMergeTree`）是 ClickHouse 中最常用和最强大的表引擎。

`MergeTree` 系列表引擎旨在支持高数据摄取速率和庞大数据量。
插入操作会创建表的部分，这些部分会被后台进程与其他表部分合并。

`MergeTree` 系列表引擎的主要功能：

- 表的主键决定每个表部分内的排序顺序（聚集索引）。主键并不引用单独的行，而是引用8192行的块称为颗粒。这使得庞大数据集的主键小到可以保持在主内存中，同时仍能快速访问磁盘中的数据。

- 表可以使用任意分区表达式进行分区。当查询允许时，分区修剪确保在读取时省略分区。

- 数据可以在多个集群节点之间复制，以实现高可用性、故障转移和零停机升级。请参见 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持各种统计信息类型和采样方法以帮助查询优化。

:::note
尽管名称相似，[Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎不同。
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

有关参数的详细描述，请参见 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句。
### 查询子句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。`ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。
#### ORDER_BY {#order_by}

`ORDER BY` — 排序键。

一个列名的元组或任意表达式。例如：`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键（即未指定 `PRIMARY KEY`），ClickHouse 将使用排序键作为主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。
另外，如果启用 `create_table_empty_primary_key_by_default` 设置，则 `CREATE TABLE` 语句将隐式添加 `ORDER BY tuple()`。请参见 [选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下，您无需分区键，如果确实需要分区，通常不需要比按月份更精细的分区键。分区并不会加速查询（与 `ORDER BY` 表达式相反）。您绝不能使用过于精细的分区。不要根据客户标识符或名称对数据进行分区（而应将客户标识符或名称设置为 `ORDER BY` 表达式中的第一列）。

要按月份分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一种 [Date](/sql-reference/data-types/date.md) 类型的日期列。此处的分区名称采用 `"YYYYMM"` 格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它 [与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)，则为主键。可选。

指定排序键（使用 `ORDER BY` 子句）隐式指定主键。
通常，无需在排序键之外另外指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定，则必须包含在主键内。
采样表达式必须产生一个无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 指定行的存储持续时间和自动部分移动 [在磁盘和卷之间](#table_engine-mergetree-multiple-volumes) 的逻辑的规则列表。可选。

表达式必须结果为 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则的类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定在满足表达式（到达当前时间）时将对部分执行的操作：移除过期行、将部分（如果表达式对部分中的所有行满足）移动到指定的磁盘（`TO DISK 'xxx'`）或卷（`TO VOLUME 'xxx'`），或者在过期行中聚合值。规则的默认类型是移除（`DELETE`）。可以指定多个规则列表，但不应超过一个 `DELETE` 规则。

有关更多详细信息，请参见 [列和表的 TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

请参见 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**部分设置的示例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在示例中，我们按月进行分区。

我们还设置一个用户 ID 哈希的采样表达式。这使您能够为每个 `CounterID` 和 `EventDate` 伪随机数据。如果在选择数据时定义了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 将返回用户子集的均匀伪随机数据样本。

`index_granularity` 设置可以省略，因为 8192 是默认值。

<details markdown="1">

<summary>创建表的过时方法</summary>

:::note
请勿在新项目中使用此方法。如果可能，请将旧项目切换到上述描述的方法。
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

- `date-column` — [Date](/sql-reference/data-types/date.md) 类型的列名。ClickHouse 根据此列自动按月创建分区。分区名称为 `"YYYYMM"` 格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。数据行之间的 "marks" 数量。对于大多数任务，值8192是合适的。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎的配置与上面主要引擎配置方法的示例相同。
</details>
## 数据存储 {#mergetree-data-storage}

表由按主键排序的数据部分组成。

当数据插入表中时，会创建单独的数据部分，每个部分均按主键进行字典序排序。例如，如果主键为 `(CounterID, Date)`，则部分中的数据按 `CounterID` 排序，而在每个 `CounterID` 内按 `Date` 排序。

属于不同分区的数据被分割到不同的部分。后台中，ClickHouse 会合并数据部分以提高存储效率。属于不同分区的部分不会合并。合并机制无法保证具有相同主键的所有行都在同一数据部分中。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中，每列存储在文件系统中的单独文件中，在 `Compact` 格式中，所有列存储在一个文件中。可以使用 `Compact` 格式来提高小而频繁插入的性能。

数据存储格式由表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果数据部分中的字节数或行数少于相应设置的值，则该部分以 `Compact` 格式存储。否则以 `Wide` 格式存储。如果未设置其中任何设置，则数据部分以 `Wide` 格式存储。

每个数据部分在逻辑上被划分为颗粒。颗粒是 ClickHouse 在选择数据时读取的最小不可分割数据集。ClickHouse 不会拆分行或值，因此每个颗粒始终包含整数行数。颗粒的第一行标记为该行的主键值。对于每个数据部分，ClickHouse 创建一个索引文件以存储标记。对于每列，无论它是否在主键中，ClickHouse 还会存储相同的标记。这些标记允许您直接在列文件中查找数据。

颗粒大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置限制。颗粒中的行数介于 `[1, index_granularity]` 范围内，具体取决于行的大小。如果单行的大小大于设置值，则颗粒的大小可以超过 `index_granularity_bytes`。在这种情况下，颗粒的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在这种情况下，排序和索引可以如下所示：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，服务器读取标记范围 `[0, 3)` 和 `[6, 8)` 的数据。
- `CounterID IN ('a', 'h') AND Date = 3`，服务器读取标记范围 `[1, 3)` 和 `[7, 8)` 的数据。
- `Date = 3`，服务器读取标记范围 `[1, 10]` 的数据。

上述示例表明，使用索引总是比完全扫描更有效。

稀疏索引允许读取额外的数据。当从主键的单个范围读取时，每个数据块中可以读取多达 `index_granularity * 2` 的额外行。

稀疏索引允许您处理非常大量的表行，因为在大多数情况下，这种索引可以放入计算机的内存中。

ClickHouse 不要求唯一的主键。您可以插入多个具有相同主键的行。

您可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不建议。要允许此功能，请启用 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。 [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则适用于 `ORDER BY` 子句中的 `NULL` 值。
### 选择主键 {#selecting-a-primary-key}

主键中的列数没有明确限制。根据数据结构，您可以在主键中包含更多或更少的列。这可能会：

- 改善索引性能。

    如果主键为 `(a, b)`，则添加另一个列 `c` 将提高性能，如果满足以下条件：

    - 存在对列 `c` 的条件的查询。
    - 长数据范围（比 `index_granularity` 长几倍）具有相同的 `(a, b)` 值是常见的。换句话说，当添加另一个列可以跳过相当长的数据范围时。

- 改善数据压缩。

    ClickHouse 按主键对数据进行排序，因此一致性越高，压缩效果越好。

- 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中提供额外的逻辑来合并数据部分。

    在这种情况下，指定一个与主键不同的 *排序键* 是有意义的。

较长的主键会对插入性能和内存消耗产生负面影响，但主键中的额外列在 `SELECT` 查询期间不会影响 ClickHouse 的性能。

您可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下，ClickHouse 按插入顺序存储数据。如果您希望在通过 `INSERT ... SELECT` 查询插入数据时保留数据顺序，请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要按初始顺序选择数据，请使用 [单线程](/operations/settings/settings.md/#max_threads) 的 `SELECT` 查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个主键（一个在为每个标记写入索引文件的值的表达式），与排序键（用于对数据部分中的行进行排序的表达式）不同。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

此功能在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时非常有用。在使用这些引擎的常见情况下，表具有两种类型的列：*维度* 和 *度量*。典型查询使用任意 `GROUP BY` 和按维度过滤来聚合度量列的值。由于 SummingMergeTree 和 AggregatingMergeTree 会对具有相同排序键值的行进行聚合，因此将所有维度添加到其中是合理的。结果，键表达式由较长的列列表组成，并且此列表必须经常更新以添加新的维度。

在这种情况下，保留仅提供有效范围扫描的少数列作为主键，并将其余维度列添加到排序键元组中是有意义的。

[ALTER](/sql-reference/statements/alter/index.md) 排序键是轻量级操作，因为在向表和排序键同时添加新列时，现有数据部分无需更改。由于旧排序键是新排序键的前缀，并且新添加的列中没有数据，因此在表修改时，数据根据旧排序键和新排序键进行排序。
### 查询中的索引和分区的使用 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 会分析是否可以使用索引。如果 `WHERE/PREWHERE` 子句具有表示等式或不等式比较操作的表达式（作为连接元素之一，或完全包含该表达式），或者如果在主键或分区键列或表达式上具有固定前缀的 `IN` 或 `LIKE`，或这些列的某些部分重复函数，或这些表达式的逻辑关系，则可以使用索引。

因此，可以快速针对主键的一个或多个范围运行查询。在此示例中，针对特定跟踪标签、特定标签和日期范围、特定标签和日期、多标签与日期范围等运行的查询将很快。

让我们看一下引擎配置如下：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下，在查询中：

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

ClickHouse 将使用主键索引来修剪不合适的数据，使用按月的分区键来修剪不合适日期范围中的分区。

以上查询显示，索引即使在复杂表达式中也会被使用。从表中读取的方式确保使用索引的速度不会慢于完全扫描。

在以下示例中，索引无法使用。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 在运行查询时是否可以使用索引，请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings#force_primary_key)。

按月分区的键允许只读取包含来自适当范围的日期的数据块。在此情况下，数据块可能包含多个日期的数据（最多一个完整的月份）。在一个块内，数据按主键排序，而主键可能没有以日期作为第一列。因此，使用仅包含未指定主键前缀的日期条件的查询将导致读取的数据量比单一日期更多。
### 部分单调主键的索引使用 {#use-of-index-for-partially-monotonic-primary-keys}

例如，考虑一个月份的天数。它们形成了一个 [单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在更长的时间内不是单调的。这是一个部分单调的序列。如果用户使用部分单调主键创建表，ClickHouse 会像往常一样创建稀疏索引。当用户从这种表中选择数据时，ClickHouse 会分析查询条件。如果用户想要在索引的两个标记之间获取数据，并且这两个标记都在一个月内，ClickHouse 可以在这种特定情况下使用索引，因为它可以计算查询参数和索引标记之间的距离。

如果查询参数范围中的主键值未表示单调序列，ClickHouse 则无法使用索引。在这种情况下，ClickHouse 使用完全扫描方法。

ClickHouse 不仅对月份的日期序列使用此逻辑，还适用于表示部分单调序列的任何主键。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明位于 `CREATE` 查询的列部分。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 系列的表，可以指定数据跳过索引。

这些索引汇总有关指定表达式在块中的一些信息，这些块由 `granularity_value` 颗粒（颗粒的大小由表引擎中的 `index_granularity` 设置指定）组成。然后，这些汇总在 `SELECT` 查询中用于减少从磁盘读取的数据量，通过跳过无法满足 `where` 查询的大块数据。

`GRANULARITY` 子句可以省略，`granularity_value` 的默认值为 1。

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

示例中的索引可以被 ClickHouse 用于减少从磁盘读取数据的量，查询如下：

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

数据跳过索引也可以在复合列上创建：

```sql
-- on columns of type Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- on columns of type Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- on columns of type Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### 可用的索引类型 {#available-types-of-indices}
#### MinMax {#minmax}

存储指定表达式的极值（如果表达式是 `tuple`，则存储每个元素的极值），使用存储的信息跳过数据块，如同主键。

语法：`minmax`
#### Set {#set}

存储指定表达式的唯一值（不超过 `max_rows` 行，`max_rows=0` 意味着“没有限制”）。使用这些值来检查 `WHERE` 表达式是否在数据块上不可满足。

语法：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

为指定列存储 [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)。可选 `false_positive` 参数可能取值在 0 和 1 之间，指定从过滤器获得误报响应的概率。默认值：0.025。支持的数据类型有：`Int*`、`UInt*`、`Float*`、`Enum`、`Date`、`DateTime`、`String`、`FixedString`、`Array`、`LowCardinality`、`Nullable`、`UUID` 和 `Map`。对于 `Map` 数据类型，客户端可以使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定索引应为键或值创建。

语法：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

存储一个包含数据块中所有 n-gram 的 [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)。仅适用于以下数据类型：[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md) 和 [Map](/sql-reference/data-types/map.md)。可用于优化 `EQUALS`、`LIKE` 和 `IN` 表达式。

语法：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngram 大小，
- `size_of_bloom_filter_in_bytes` — Bloom filter 大小（可以使用较大值，例如 256 或 512，因为它可以很好地压缩）。
- `number_of_hash_functions` — Bloom filter 中所用的哈希函数数量。
- `random_seed` — Bloom filter 哈希函数的种子。

用户可以创建 [UDF](/sql-reference/statements/create/function.md) 来估算 `ngrambf_v1` 的参数。查询语句如下：

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
例如，如果颗粒中有 4300 个 ngram，而我们期望误报小于 0.0001。其他参数可以通过执行以下查询来估算：


```sql
--- estimate number of bits in the filter
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- estimate number of hash functions
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘

```
当然，您也可以使用这些函数通过其他条件估算参数。
这些函数参考 [这里](https://hur.st/bloomfilter)。
#### Token Bloom Filter {#token-bloom-filter}

与 `ngrambf_v1` 相同，但存储代替 ngram 的 tokens。Tokens 是由非字母数字字符分隔的序列。

语法：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 专用 {#special-purpose}

- 实验性索引以支持近似最近邻搜索。有关详细信息，请参见 [此处](annindexes.md)。
- 实验性全文索引以支持全文搜索。有关详细信息，请参见 [此处](invertedindexes.md)。
### 函数支持 {#functions-support}

`WHERE` 子句中的条件包含对操作列的函数调用。如果列是索引的一部分，则 ClickHouse 在执行这些函数时尝试使用该索引。ClickHouse 支持不同子集的函数以支持索引。

所有函数均可利用 `set` 类型索引。其他索引类型的支持如下：

| 函数（操作符）/ 索引                                                                                      | 主键 | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                               | ✔    | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)                  | ✔    | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                        | ✔    | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                  | ✔    | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                      | ✗    | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                   | ✔    | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                       | ✗    | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                    | ✗    | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                              | ✔    | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                           | ✔    | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                     | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                               | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                    | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)              | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                                | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                          | ✔    | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                              | ✗    | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                               | ✗    | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                               | ✗    | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                                   | ✗    | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗    | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗    | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗    | ✗      | ✗          | ✔          | ✗            | ✗         |

对于小于 ngram 大小的常量参数，不能使用 `ngrambf_v1` 进行查询优化。

(*) 对于 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 生效，必须在小写数据上创建 `tokenbf_v1` 索引，例如 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
Bloom filters 可能会存在误报匹配，因此 `ngrambf_v1`、`tokenbf_v1` 和 `bloom_filter` 索引不能用于优化预期函数结果为 false 的查询。

例如：

- 可以优化：
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 不能优化：
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::
## 投影 {#projections}
投影像 [物化视图](/sql-reference/statements/create/view)，但在部分级别定义。它提供一致性保证，并在查询中自动使用。

:::note
在实现投影时，您还应考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

具有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句不支持投影。
### 投影查询 {#projection-query}
投影查询定义一个投影。它隐式地从父表选择数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

投影可以通过 [ALTER](/sql-reference/statements/alter/projection.md) 语句进行修改或删除。
### 投影存储 {#projection-storage}
投影存储在部分目录中。它类似于索引，但包含一个子目录，该目录存储匿名的 `MergeTree` 表的部分。该表由投影的定义查询引入。如果有 `GROUP BY` 子句，则底层存储引擎变为 [AggregatingMergeTree](aggregatingmergetree.md)，所有聚合函数转换为 `AggregateFunction`。如果有 `ORDER BY` 子句，则 `MergeTree` 表将其用作主键表达式。在合并过程中，投影部分通过其存储的合并例程进行合并。父表部分的校验和与投影的部分结合。其他维护任务类似于跳过索引的任务。
### 查询分析 {#projection-query-analysis}
1. 检查投影是否可以用于回答给定的查询，即它生成的答案是否与对基础表的查询相同。
2. 选择最佳的可行匹配，其中包含最少的颗粒以读取。
3. 使用投影的查询管道将与使用原始部分的查询管道不同。如果某些部分中不存在投影，我们可以新增管道以“即时”投影。
## 并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当一个表被同时读取和更新时，数据从查询时的当前部分集读取。没有长时间的锁定。插入不会妨碍读取操作。

从表中读取是自动并行化的。
## 列和表的 TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

`TTL` 子句可以为整个表和每个单独列设置。表级 `TTL` 还可以指定自动在磁盘和卷之间移动数据的逻辑，或重新压缩所有数据已过期的部分。

表达式必须评估为 [Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md) 或 [DateTime64](/sql-reference/data-types/datetime64.md) 数据类型。

**语法**

为列设置生存时间：

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，请使用 [时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 操作符，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### Column TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse将其替换为该列数据类型的默认值。如果数据部分中的所有列值过期，ClickHouse将从文件系统中的数据部分删除该列。

`TTL` 子句不能用于关键列。

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

表可以有一个用于删除过期行的表达式，以及多个用于自动移动部分的表达式，这些部分可以在 [磁盘或卷](#table_engine-mergetree-multiple-volumes) 之间移动。当表中的行过期时，ClickHouse将删除所有对应的行。对于移动或重新压缩的部分，部分的所有行必须满足 `TTL` 表达式标准。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可以跟随每个 TTL 表达式。它影响在表达式满足（达到当前时间）时要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 使用 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将部分移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将部分移动到磁盘 `bbb`；
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句一起使用，仅删除根据过滤条件的一些过期行：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果某列不是 `GROUP BY` 表达式的一部分，并且没有在 `SET` 子句中显式设置，结果行将包含来自分组行的偶然值（就像对其应用了聚合函数 `any` 一样）。

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

创建一个表，其中行在一个月后过期。过期的行（日期为星期一）被删除：

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
#### 创建一个过期行被重新压缩的表: {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个过期行被聚合的表。结果行 `x` 包含分组行中的最大值，`y` - 最小值，`d` - 来自分组行的任何偶然值。

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
### 移除过期数据 {#mergetree-removing-expired-data}

过期 `TTL` 的数据在 ClickHouse 合并数据部分时被移除。

当 ClickHouse 检测到数据过期时，它会执行非计划合并。要控制此类合并的频率，可以设置 `merge_with_ttl_timeout`。如果值设置得太低，可能会执行许多非计划合并，从而消耗大量资源。

如果在合并之间执行 `SELECT` 查询，可能会得到过期数据。为避免这种情况，请在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置
## 磁盘类型 {#disk-types}

除了本地块设备，ClickHouse 支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob 存储](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读访问网页](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于 S3 备份](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中不可变、非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)
## 使用多个块设备进行数据存储 {#table_engine-mergetree-multiple-volumes}
### 介绍 {#introduction}

`MergeTree` 家族表引擎可以在多个块设备上存储数据。例如，当某个表的数据隐式地分为“热”数据和“冷”数据时，这会很有用。最新的数据是经常请求的，但只需要很少的空间。相反，尾部肥大的历史数据很少被请求。如果有几个磁盘可用，“热”数据可能位于快速磁盘（例如，NVMe SSD 或内存）上，而“冷”数据则位于相对较慢的磁盘（例如，HDD）上。

数据部分是 `MergeTree` 引擎表的最小可移动单元。属于同一部分的数据存储在同一磁盘上。数据部分可以根据用户设置在后台在磁盘之间移动，也可以通过 [ALTER](/sql-reference/statements/alter/partition) 查询进行移动。
### 术语 {#terms}

- 磁盘 — 挂载到文件系统的块设备。
- 默认磁盘 — 存储在 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定路径的磁盘。
- 卷 — 有序的相等磁盘集合（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 — 卷的集合及其之间移动数据的规则。

给这些实体命名的信息可以在系统表 [system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要为表应用配置的存储策略，请使用 `MergeTree` 引擎家族表的 `storage_policy` 设置。
### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `<storage_configuration>` 标签内声明，或在 `config.d` 目录中的文件中声明。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分声明。这对于临时地附加磁盘（例如，托管在 URL 上）进行临时分析非常有用。
有关更多详细信息，请参见 [动态存储](/operations/storing-data#dynamic-configuration)。
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

- `<disk_name_N>` — 磁盘名称。所有磁盘的名称必须不同。
- `path` — 服务器将存储数据（`data` 和 `shadow` 文件夹）的路径，应以 '/' 结尾。
- `keep_free_space_bytes` — 保留的磁盘可用空间量。

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

- `policy_name_N` — 策略名称。策略名称必须唯一。
- `volume_name_N` — 卷名称。卷名称必须唯一。
- `disk` — 卷中的一个磁盘。
- `max_data_part_size_bytes` — 可以存储在任何卷磁盘上的部分的最大大小。如果合并后的部分估计比 `max_data_part_size_bytes` 大，则该部分将写入下一个卷。基本上，此功能允许在热（SSD）卷上保留新的/小的部分，并在它们达到大尺寸时将其移动到冷（HDD）卷。如果您的策略只有一个卷，请勿使用此设置。
- `move_factor` — 当可用空间的量低于此因子时，数据会自动开始移动到下一个卷（默认值为 0.1）。ClickHouse 按大小从大到小（降序）对现有部分进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则所有部分都将被移动。
- `perform_ttl_move_on_insert` — 禁用在数据部分 INSERT 时的 TTL 移动。默认情况下（如果启用），如果我们插入一个已经根据 TTL 移动规则过期的数据部分，它将立即移动到移动规则中声明的卷/磁盘。如果目标卷/磁盘很慢（例如，S3），那么这可能会显著减慢插入速度。如果禁用，则已过期的数据部分将写入默认卷，然后立即移动到 TTL 卷。
- `load_balancing` - 磁盘平衡的策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置更新所有磁盘可用空间的超时（以毫秒为单位）（`0` - 始终更新，`-1` - 永不更新，默认值为 `60000`）。请注意，如果磁盘只能被 ClickHouse 使用并且不受在线文件系统调整/缩小，则可以使用 `-1`，在其他情况下不推荐，因为最终会导致空间分配不正确。
- `prefer_not_to_merge` — 您不应该使用此设置。禁用此卷上的数据部分合并（这有害并导致性能下降）。当启用此设置时（请勿这样做），不允许合并此卷上的数据（这很糟糕）。这允许（但您不需要它）控制（如果您想控制一些东西，那就是错误）ClickHouse 如何与慢磁盘交互（但 ClickHouse 知道得更好，所以请不要使用此设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。较低的值意味着较高的优先级。参数值应为自然数，并且共同覆盖 1 到 N（最低优先级给定）范围内的所有数字，而不跳过任何数字。
  * 如果所有卷都被标记，则将按给定顺序进行优先排序。
  * 如果仅某些卷被标记，则未标记的卷的优先级最低，按它们在配置中定义的顺序优先排序。
  * 如果没有卷被标记，则它们的优先级根据其在配置中声明的顺序进行设置。
  * 两个卷不能具有相同的优先级值。

配置示例：

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- policy name -->
            <volumes>
                <single> <!-- volume name -->
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

在给定示例中，`hdd_in_order` 策略实现了 [轮询调度](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方法。因此，该策略仅定义一个卷（`single`），数据部分在其所有磁盘上按循环顺序存储。这种策略在系统上挂载了几个类似的磁盘但未配置 RAID 的情况下非常有用。请记住，每个单独的磁盘驱动器并不可靠，您可能希望通过复制因子为 3 或更多来进行补偿。

如果系统中可以使用不同类型的磁盘，则可以改用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 包含一个SSD磁盘（`fast_ssd`），可以存储在该卷上的部分的最大大小为 1GB。所有大于 1GB 的部分将直接存储在 `cold` 卷上，该卷包含一个HDD磁盘 `disk1`。
此外，一旦 `fast_ssd` 磁盘填满超过 80%，数据将通过后台进程转移到 `disk1`。

在存储策略中卷的枚举顺序很重要，特别是在列出的至少一个卷没有明确的 `volume_priority` 参数的情况下。
一旦一个卷填满，数据就会转移到下一个卷。磁盘的枚举顺序也很重要，因为数据按顺序存储在其上。

创建表时，可以将已配置的存储策略之一应用于该表：

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

`default` 存储策略意味着只使用一个卷，该卷仅包含在 `<path>`中给出的一个磁盘。
您可以通过 [ALTER TABLE ... MODIFY SETTING] 查询在表创建后更改存储策略，新策略应包括所有旧磁盘和相同名称的卷。

执行数据部分的后台移动的线程数可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。
### 详细信息 {#details}

在 `MergeTree` 表的情况下，数据以不同方式写入磁盘：

- 作为插入（`INSERT` 查询）的结果。
- 在后台合并和 [变更](https://clickhouse.com/docs/zh/sql-reference/statements/alter#mutations) 期间。
- 当从另一个副本下载时。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在这些情况下，除了变更和分区冻结外，部分是根据给定的存储策略存储在卷和磁盘中的：

1. 选择第一个（定义顺序中的）具有足够磁盘空间以存储部分的卷（`unreserved_space > current_part_size`）并允许存储给定大小的部分（`max_data_part_size_bytes > current_part_size`）。
2. 在该卷中，选择下一个可用的磁盘，该磁盘是用于存储先前数据块的那个磁盘，并且有超过部分大小的可用空间（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在后台，变更和分区冻结使用 [硬链接](https://en.wikipedia.org/wiki/Hard_link)。不支持不同磁盘之间的硬链接，因此在这种情况下，生成的部分存储在与初始部分相同的磁盘上。

在后台，部分会根据可用空间量（`move_factor` 参数）在卷之间移动，按照配置文件中声明的卷的顺序进行。
数据永远不会从最后一个卷传输到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）来监控后台移动。此外，可以在服务器日志中找到详细信息。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制从一个卷移动一个部分或一个分区到另一个卷，所有后台操作的限制都会被考虑。该查询会主动发起移动，而不会等待后台操作完成。如果可用空间不足或任何所需条件未得到满足，用户将收到错误消息。

移动数据不会干扰数据复制。因此，可以在不同副本中为同一表指定不同的存储策略。

在后台合并和变更完成后，仅在一定时间后（`old_parts_lifetime`）移除旧部分。
在此期间，它们不会移动到其他卷或磁盘。因此，在部分最终被删除之前，它们仍会计入占有的磁盘空间评估。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置将新的大部分分配到 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘上的均衡方式。
## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 家族表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs` 磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`。有关更多详细信息，请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

使用类型为 `s3` 的磁盘作为外部存储的 [S3](https://aws.amazon.com/s3/) 示例。

配置标记：
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

另见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

:::note 缓存配置
ClickHouse 版本 22.3 至 22.7 使用不同的缓存配置，如果您使用其中一个版本，请参见 [使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::
## 虚拟列 {#virtual-columns}

- `_part` — 部分名称。
- `_part_index` — 查询结果中部分的顺序索引。
- `_part_starting_offset` — 查询结果中部分的累积起始行。
- `_part_offset` — 部分中的行号。
- `_partition_id` — 分区名称。
- `_part_uuid` — 唯一部分标识符（如果启用 MergeTree 设置 `assign_part_uuids`）。
- `_part_data_version` — 部分的数据版本（最小块号或变更版本）。
- `_partition_value` — `partition by` 表达式的值（元组）。
- `_sample_factor` — 采样因子（来自查询）。
- `_block_number` — 行的块号，当 `allow_experimental_block_number_column` 设置为 true 时，在合并时保持不变。
- `_disk_name` — 用于存储的磁盘名称。
## 列统计信息 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

在启用 `set allow_experimental_statistics = 1` 时，统计信息声明在来自 `*MergeTree*` 家族的表的 `CREATE` 查询的列部分中。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们还可以使用 `ALTER` 语句来操作统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息聚合有关列中值分布的信息。统计信息存储在每个部分中，并在每次插入时更新。
仅在我们启用 `set allow_statistics_optimize = 1` 的情况下，它们可以用于 `prewhere` 优化。
### 可用的列统计信息类型 {#available-types-of-column-statistics}

- `MinMax`

    列的最小值和最大值，可用于估计数值列范围过滤器的选择性。

    语法: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 草图，可用于计算数值列的近似百分位数（例如，第 90 个百分位数）。

    语法: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图，提供了有关列包含多少个不同值的估计。

    语法: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 草图，提供了对每个值在列中的频率的近似计数。

    语法 `countmin`
### 支持的数据类型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### 支持的操作 {#supported-operations}

|           | 等式过滤器 (==) | 范围过滤器 (`>, >=, <, <=`) |
|-----------|-------------------|----------------------------|
| CountMin  | ✔                 | ✗                          |
| MinMax    | ✗                 | ✔                          |
| TDigest   | ✗                 | ✔                          |
| Uniq      | ✔                 | ✗                          |
## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别被覆盖：

- `max_compress_block_size` — 写入表之前进行压缩的最大未压缩数据块大小。
- `min_compress_block_size` — 写入下一个标记时需要压缩的最小未压缩数据块大小。

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

- 从列声明中移除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，还会从表的 CREATE 查询的列表达式中移除设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
