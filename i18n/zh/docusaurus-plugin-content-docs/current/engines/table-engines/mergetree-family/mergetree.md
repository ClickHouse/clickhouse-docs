---
'description': '`MergeTree`家族的表引擎旨在处理高数据吸收速率和巨大的数据量。'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` 引擎及其他 `MergeTree` 系列引擎（例如 `ReplacingMergeTree`, `AggregatingMergeTree`）是 ClickHouse 中最常用和最强大的表引擎。

`MergeTree` 系列表引擎旨在支持高数据摄取率和巨大的数据量。插入操作创建表的部分，这些部分由后台进程与其他表部分合并。

`MergeTree` 系列表引擎的主要特点：

- 表的主键决定了每个表部分内的排序顺序（聚簇索引）。主键也不引用每个单独的行，而是8192行的数据块，称为粒度（granules）。这使得巨大的数据集的主键足够小，可以保持加载在主内存中，同时仍然提供对磁盘数据的快速访问。

- 表可以使用任意分区表达式进行分区。分区修剪确保在查询允许的情况下省略读取分区。

- 数据可以在多个集群节点之间进行复制，以实现高可用性、故障转移和零停机的升级。请参阅 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持各种统计类型和采样方法，以帮助查询优化。

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

有关参数的详细描述，请参阅 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句
### 查询子句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。`ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。
#### ORDER_BY {#order_by}

`ORDER BY` — 排序键。

一组列名元组或任意表达式。例如：`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键（即 `PRIMARY KEY` 未指定），ClickHouse 会使用排序键作为主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。另外，如果启用 `create_table_empty_primary_key_by_default`，`ORDER BY tuple()` 会隐式添加到 `CREATE TABLE` 语句中。请参见 [选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下，您不需要分区键，如果确实需要分区，通常不需要更细粒度的分区键。分区并不会加速查询（与 ORDER BY 表达式相对）。您绝对不应该使用过于精细的分区。不要以客户端标识符或名称进行分区（而是将客户端标识符或名称放在 ORDER BY 表达式的第一列）。

按月分区时，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是 [Date](/sql-reference/data-types/date.md) 类型的日期列。此处的分区名称采用 `"YYYYMM"` 格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它 [与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)，则为主键。可选。

指定排序键（使用 `ORDER BY` 子句）隐含地指定了主键。通常没有必要在排序键之外指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 一个采样表达式。可选。

如果指定，则必须包含在主键中。采样表达式必须产生一个无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
####  TTL {#ttl}

`TTL` — 一系列规则，指定行的存储持续时间和自动部分在 [磁盘和卷之间移动](#table_engine-mergetree-multiple-volumes) 的逻辑。可选。

表达式必须产生 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则的类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定当表达式满足时要对部分执行的操作（达到当前时间）：删除过期行、将部分移动到指定磁盘（`TO DISK 'xxx'`）或卷（`TO VOLUME 'xxx'`），或在过期行中聚合值。规则的默认类型为删除（`DELETE`）。可以指定多个规则的列表，但只能有一个 `DELETE` 规则。

有关详细信息，请参见 [列和表的 TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

请参阅 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**部分设置示例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在此示例中，我们按月设置分区。

我们还为用户 ID 设置了一个哈希采样表达式。这允许您为每个 `CounterID` 和 `EventDate` 对表中的数据进行伪随机化。如果您在选择数据时定义了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 将为一组用户返回均匀的伪随机数据样本。

`index_granularity` 设置可以省略，因为 8192 是默认值。

<details markdown="1">

<summary>创建表的已弃用方法</summary>

:::note
请勿在新项目中使用这种方法。如果可能，将旧项目切换到上述描述的方法。
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

- `date-column` — [Date](/sql-reference/data-types/date.md) 类型列的名称。ClickHouse 根据此列自动按月创建分区。分区名称采用 `"YYYYMM"` 格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型：[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。索引的“标记”之间的数据行数。值 8192 适用于大多数任务。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎的配置与上述主要引擎配置方法相同。
</details>
## 数据存储 {#mergetree-data-storage}

一个表由按主键排序的数据部分组成。

当数据插入表中时，会创建单独的数据部分，每一部分都按主键字典序排序。例如，如果主键是 `(CounterID, Date)`，则部分中的数据按 `CounterID` 排序，在每个 `CounterID` 内部按 `Date` 排序。

属于不同分区的数据被分开成不同的部分。在后台，ClickHouse 合并数据部分以实现更高效的存储。属于不同分区的部分不会合并。合并机制并不保证具有相同主键的所有行都位于同一数据部分。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中，每列都存储在文件系统中的单独文件中；而在 `Compact` 格式中，所有列都存储在一个文件中。`Compact` 格式可用于提高小而频繁插入的性能。

数据存储格式受表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置的控制。如果数据部分中的字节数或行数小于相应设置的值，则该部分以 `Compact` 格式存储。否则，它以 `Wide` 格式存储。如果未设置这两个参数，数据部分将以 `Wide` 格式存储。

每个数据部分在逻辑上分为粒度。粒度是 ClickHouse 在选择数据时读取的最小不可分割的数据集。ClickHouse 不会分割行或值，因此每个粒度始终包含整数数量的行。粒度的第一行带有该行的主键值。对于每个数据部分，ClickHouse 创建一个索引文件来存储标记。对于每列，无论它是否在主键中，ClickHouse 还存储相同的标记。这些标记让您可以直接在列文件中找到数据。

粒度大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置的限制。粒度中的行数在 `[1, index_granularity]` 范围内，具体取决于行的大小。如果单行大小超过设置值，粒度的大小可以超过 `index_granularity_bytes`。在这种情况下，粒度的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在这种情况下，排序和索引可以如下表示：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，则服务器读取标记范围 `[0, 3)` 和 `[6, 8)` 的数据。
- `CounterID IN ('a', 'h') AND Date = 3`，则服务器读取标记范围 `[1, 3)` 和 `[7, 8)` 的数据。
- `Date = 3`，则服务器读取标记范围 `[1, 10]` 的数据。

上述示例表明，使用索引总是比完全扫描更有效。

稀疏索引允许读取额外的数据。当读取主键的单个范围时，每个数据块最多可以读取 `index_granularity * 2` 行的额外数据。

稀疏索引使得处理非常大量的表行成为可能，因为在大多数情况下，这种索引可以适应计算机的 RAM。

ClickHouse 不要求唯一主键。您可以插入多行具有相同主键的数据。

您可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不推荐。在这种情况下，请启用 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则适用于 `ORDER BY` 子句中的 `NULL` 值。
### 选择主键 {#selecting-a-primary-key}

主键中的列数没有明确限制。根据数据结构，您可以在主键中包含更多或更少的列。这可能会：

- 改善索引的性能。

    如果主键是 `(a, b)`，那么在满足以下条件时，添加另一列 `c` 将改善性能：

    - 有针对列 `c` 的条件的查询。
    - 具有相同 `(a, b)` 值的长数据范围（比 `index_granularity` 长几倍）是常见的。换句话说，当添加另一列使您能够跳过相当长的数据范围时。

- 改善数据压缩。

    ClickHouse 按主键对数据进行排序，因此一致性越高，压缩效果越好。

- 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中提供附加逻辑。

    在这种情况下，指定一个与主键不同的 *排序键* 是有意义的。

长主键将对插入性能和内存消耗产生负面影响，但主键中的附加列不会影响 ClickHouse 在 `SELECT` 查询中的性能。

您可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下，ClickHouse 将按插入顺序存储数据。如果您希望在通过 `INSERT ... SELECT` 查询插入数据时保留数据顺序，请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要按初始顺序选择数据，请使用 [单线程](/operations/settings/settings.md/#max_threads) `SELECT` 查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个与排序键（用于对数据部分进行排序的表达式）不同的主键（一个表达式，其中的值在每个标记的索引文件中写入）。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

此功能在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时非常有用。在使用这些引擎的常见情况下，表具有两种类型的列：*维度* 和 *度量*。典型查询聚合度量列的值，使用任意的 `GROUP BY` 和通过维度的过滤。由于 SummingMergeTree 和 AggregatingMergeTree 根据排序键相同的值聚合行，因此将所有维度添加到其中是自然的。因此，键表达式由长列列表组成，该列表必须经常更新以新增维度。

在这种情况下，有意义的是只在主键中保留少数几列，以提供高效的范围扫描，并将剩余的维度列添加到 sorting key 元组中。

[ALTER](/sql-reference/statements/alter/index.md) 排序键是一项轻量级操作，因为当新列同时添加到表和排序键时，现有数据部分无需更改。由于旧的排序键是新排序键的前缀，并且新添加的列中没有数据，在表修改时，数据按旧的和新的排序键排序。
### 查询中索引和分区的使用 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 会分析是否可以使用索引。如果 `WHERE/PREWHERE` 子句具有表达式（作为其中一个结合元素，或整体），表示等式或不等式比较操作，或者如果在主键或分区键的列或表达式上具有带固定前缀的 `IN` 或 `LIKE`，或这些列的某些部分重复的函数，或这些表达式的逻辑关系，则可以使用索引。

因此，对于主键的一个或多个范围快速运行查询是可能的。在这个例子中，对于特定的追踪标签、特定的标签和日期范围、特定的标签和日期、带有日期范围的多个标签等，查询将快速执行。

让我们看一下配置如下的引擎：
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

ClickHouse 将使用主键索引来修剪不恰当的数据，并使用按月分区的键来修剪不在不当日期范围内的分区。

上述查询表明，即使对于复杂表达式，索引也会被使用。读取表的方式组织得当，以至于使用索引的速度不会比完全扫描慢。

在下面的示例中，索引无法使用。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 在运行查询时是否可以使用索引，请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings#force_primary_key)。

按月份的分区键仅允许读取那些包含正确范围内日期的数据块。在这种情况下，数据块可能包含多个日期的数据（最多一个完整月份）。在一个块内，数据按主键排序，这可能不包含日期作为第一列。因此，单凭日期条件的查询而不指定主键前缀，将导致读取的数据比单一日期更多。
### 对于部分单调主键的索引使用 {#use-of-index-for-partially-monotonic-primary-keys}

考虑例如，一个月份的天数。它们在一个月内形成一个 [单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在较长时间内不单调。这是一个部分单调序列。如果用户以部分单调主键创建表，ClickHouse 会像往常一样创建稀疏索引。当用户从这种表中选择数据时，ClickHouse 分析查询条件。如果用户希望在索引的两个标记之间获取数据，并且这两个标记都在同一个月内，则 ClickHouse 可以在这种情况下使用索引，因为它可以计算查询参数和索引标记之间的距离。

如果查询参数范围中的主键值不代表单调序列，则 ClickHouse 无法使用索引。在这种情况下，ClickHouse 使用完全扫描方法。

ClickHouse 不仅对月份的天数序列使用此逻辑，还对任何表示部分单调序列的主键使用此逻辑。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明在 `CREATE` 查询的列部分中。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 系列的表，可以指定数据跳过索引。

这些索引汇总了有关指定表达式的某些信息，这些信息在由 `granularity_value` 粒度（粒度的大小由表引擎中的 `index_granularity` 设置指定）组成的块上进行聚合。然后，在 `SELECT` 查询中使用这些聚合来通过跳过不满足 `where` 查询的大数据块来减少从磁盘读取的数据量。

`GRANULARITY` 子句可以省略，默认值 `granularity_value` 为 1。

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

示例中的索引可以被 ClickHouse 用于减少从磁盘读取的数据量，具体查询如下：

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
### 可用索引类型 {#available-types-of-indices}
#### MinMax {#minmax}

存储指定表达式的极端值（如果表达式是 `tuple`，则为 `tuple` 中每个元素存储极端值），利用存储的信息跳过像主键一样的数据块。

语法：`minmax`
#### Set {#set}

存储指定表达式的唯一值（不超过 `max_rows` 行，`max_rows=0` 表示“无限制”）。利用这些值检查数据块上的 `WHERE` 表达式是否不可满足。

语法：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

为指定列存储一个 [Bloom 过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。可选的 `false_positive` 参数的可能值在 0 到 1 之间，指定过滤器返回虚假阳性响应的概率。默认值：0.025。支持的数据类型：`Int*`、`UInt*`、`Float*`、`Enum`、`Date`、`DateTime`、`String`、`FixedString`、`Array`、`LowCardinality`、`Nullable`、`UUID` 和 `Map`。对于 `Map` 数据类型，客户端可以使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定索引应为键还是值创建。

语法：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

存储包含数据块中所有 n-grams 的 [Bloom 过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。仅适用于数据类型：[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md) 和 [Map](/sql-reference/data-types/map.md)。可用于优化 `EQUALS`、`LIKE` 和 `IN` 表达式。

语法：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngram大小，
- `size_of_bloom_filter_in_bytes` — Bloom 过滤器的大小（您可以在此处使用较大的值，例如256或512，因为它可以很好地压缩）。
- `number_of_hash_functions` — 在 Bloom 过滤器中使用的哈希函数的数量。
- `random_seed` — Bloom 过滤器哈希函数的种子。

用户可以创建 [UDF](/sql-reference/statements/create/function.md) 来估计 `ngrambf_v1` 的参数设置。查询语句如下：

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
要使用这些函数，我们需要指定至少两个参数。
例如，如果颗粒中有 4300 个 ngrams，并且我们希望虚假阳性的概率小于 0.0001。其他参数可以通过执行以下查询进行估计：

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
当然，您也可以使用这些函数通过其他条件来估计参数。
这些函数的内容参见 [here](https://hur.st/bloomfilter)。
#### Token Bloom Filter {#token-bloom-filter}

与 `ngrambf_v1` 相同，但存储标记而不是 ngrams。标记是由非字母数字字符分隔的序列。

语法：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 特殊目的 {#special-purpose}

- 一个实验性索引，用于支持近似最近邻搜索。详情见 [here](annindexes.md)。
- 一个实验性全文索引，用于支持全文搜索。详情见 [here](invertedindexes.md)。
### 函数支持 {#functions-support}

`WHERE` 子句中的条件包含对列进行操作的函数的调用。如果该列是索引的一部分，ClickHouse 会尝试在执行这些函数时使用该索引。ClickHouse 对使用索引支持不同子集的函数。

类型为 `set` 的索引可以被所有函数利用。其他索引类型的支持如下：

| 函数（运算符） / 索引                                                                                | 主键 | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|-------------------------------------------------------------------------------------------------------|-------|--------|------------|------------|--------------|-----------|
| [等于 (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                          | ✔     | ✔      | ✔          | ✔          | ✔            | ✔         |
| [不等于 (!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔     | ✔      | ✔          | ✔          | ✔            | ✔         |
| [LIKE](/sql-reference/functions/string-search-functions.md/#like)                                   | ✔     | ✔      | ✔          | ✔          | ✗            | ✔         |
| [NOT LIKE](/sql-reference/functions/string-search-functions.md/#notlike)                           | ✔     | ✔      | ✔          | ✔          | ✗            | ✔         |
| [匹配](/sql-reference/functions/string-search-functions.md/#match)                                   | ✗     | ✗      | ✔          | ✔          | ✗            | ✔         |
| [以...开头](/sql-reference/functions/string-functions.md/#startswith)                              | ✔     | ✔      | ✔          | ✔          | ✗            | ✔         |
| [以...结尾](/sql-reference/functions/string-functions.md/#endswith)                                | ✗     | ✗      | ✔          | ✔          | ✗            | ✔         |
| [多重搜索任何](/sql-reference/functions/string-search-functions.md/#multisearchany)               | ✗     | ✗      | ✔          | ✗          | ✗            | ✔         |
| [IN](/sql-reference/functions/in-functions)                                                       | ✔     | ✔      | ✔          | ✔          | ✔            | ✔         |
| [NOT IN](/sql-reference/functions/in-functions)                                                  | ✔     | ✔      | ✔          | ✔          | ✔            | ✔         |
| [小于 (`<`)](/sql-reference/functions/comparison-functions.md/#less)                               | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [大于 (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [小于或等于 (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [大于或等于 (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [空](/sql-reference/functions/array-functions/#empty)                                           | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [不为空](/sql-reference/functions/array-functions/#notempty)                                     | ✔     | ✔      | ✗          | ✗          | ✗            | ✗         |
| [存在](/sql-reference/functions/array-functions#hasarr-elem)                                       | ✗     | ✗      | ✔          | ✔          | ✔            | ✔         |
| [任何存在](/sql-reference/functions/array-functions#hasany)                                     | ✗     | ✗      | ✔          | ✔          | ✔            | ✗         |
| [全存在](/sql-reference/functions/array-functions#hasall)                                       | ✗     | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                               | ✗     | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                         | ✗     | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                            | ✗     | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                      | ✗     | ✗      | ✗          | ✔          | ✗            | ✗         |

具有常量参数且小于 ngram 大小的函数无法被 `ngrambf_v1` 用于查询优化。

(*) 对于 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 来说，索引必须在小写数据上创建，比如 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
Bloom 过滤器可能会产生虚假阳性匹配，因此 `ngrambf_v1`、`tokenbf_v1` 和 `bloom_filter` 索引不能用于优化预期结果为假值的查询。

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
投影类似于 [物化视图](/sql-reference/statements/create/view)，但在部分级别定义。它提供一致性保证，并自动用于查询。

:::note
在实现投影时，您还应考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

不支持带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句的投影。
### 投影查询 {#projection-query}
投影查询定义投影。它隐式从父表中选择数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

投影可以使用 [ALTER](/sql-reference/statements/alter/projection.md) 语句进行修改或删除。
### 投影存储 {#projection-storage}
投影存储在部分目录内。它类似于索引，但包含一个子目录，该子目录存储一个匿名 `MergeTree` 表的部分。表由投影的定义查询引导。如果有 `GROUP BY` 子句，则底层存储引擎变为 [AggregatingMergeTree](aggregatingmergetree.md)，所有聚合函数都转换为 `AggregateFunction`。如果有 `ORDER BY` 子句，则 `MergeTree` 表将其作为其主键表达式。在合并过程中，投影部分通过其存储的合并例程进行合并。父表部分的校验和与投影部分结合。其他维护工作与跳过索引类似。
### 查询分析 {#projection-query-analysis}
1. 检查投影是否可以用于回答给定查询，即它是否生成与查询基表相同的答案。
2. 选择最佳可行匹配，即包含最少粒度以读取的选项。
3. 使用投影的查询管道将不同于使用原始部分的管道。如果某些部分中缺少投影，则可以添加管道以“动态地”投影它。
## 并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当一个表被同时读取和更新时，数据是从查询时的当前部分集读取的。没有长时间的锁定。插入操作不会妨碍读取操作。

从表中读取会自动并行化。
## 列和表的 TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

可以为整个表和每个单独的列设置 `TTL` 子句。表级 `TTL` 还可以指定在磁盘和卷之间自动移动数据的逻辑，或重新压缩所有数据过期的部分。

表达式必须计算为 [Date](/sql-reference/data-types/date.md) 或 [DateTime](/sql-reference/data-types/datetime.md) 数据类型。

**语法**

为列设置存活时间：

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，使用 [时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 运算符，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### 列的生存时间 (TTL) {#mergetree-column-ttl}

当列中的值过期时，ClickHouse 会用该列数据类型的默认值替代这些值。如果数据部分中的所有列值都过期，ClickHouse 会从文件系统的数据部分中删除该列。

`TTL` 子句不能用于键列。

**示例**
#### 创建带有 `TTL` 的表： {#creating-a-table-with-ttl}

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
### 表的生存时间 (TTL) {#mergetree-table-ttl}

表可以有一个用于删除过期行的表达式，以及多个表达式用于在[磁盘或卷之间](#table_engine-mergetree-multiple-volumes)自动移动分片。当表中的行过期时，ClickHouse 删除所有相应的行。对于分片的移动或重新压缩，所有行必须满足 `TTL` 表达式的标准。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可以跟随每个 TTL 表达式。它影响一旦满足表达式（达到当前时间）时要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 使用 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将部分移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将部分移动到磁盘 `bbb`；
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句一起使用，仅删除基于过滤条件的一些过期行：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表的主键的前缀。

如果某列不是 `GROUP BY` 表达式的一部分，并且没有在 `SET` 子句中显式设置，则结果行中包含分组行中的任意值（就像对其应用了聚合函数 `any`）。

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
#### 更改表的 `TTL`： {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

创建一个表，行在一个月后过期。过期的行中日期为星期一的行被删除：

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
#### 创建过期行被重新压缩的表： {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个表，其中过期的行被聚合。在结果行中，`x` 包含分组行中的最大值，`y` — 最小值，`d` — 来自分组行的任意值。

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

具有过期 `TTL` 的数据在 ClickHouse 合并数据部分时被删除。

当 ClickHouse 检测到数据过期时，会执行计划外合并。要控制此类合并的频率，可以设置 `merge_with_ttl_timeout`。如果值太低，将会执行许多计划外的合并，可能会消耗大量资源。

如果在合并之间执行 `SELECT` 查询，可能会获取过期数据。为避免这种情况，请在 `SELECT` 之前使用[OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置
## 磁盘类型 {#disk-types}

除本地块设备外，ClickHouse 还支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读的网络存储](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于 S3 备份](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中不可变的非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)
## 多个块设备的数据存储 {#table_engine-mergetree-multiple-volumes}
### 介绍 {#introduction}

`MergeTree` 家族表引擎可以在多个块设备上存储数据。例如，当某个表的数据隐式分为“热”和“冷”时，这将非常有用。最近的数据经常被请求，但只需要少量空间。相反，长尾的历史数据请求频率较低。如果有多个磁盘可用，“热”数据可以放置在快速磁盘上（例如 NVMe SSD 或内存中），而“冷”数据则可以放在相对较慢的磁盘上（例如 HDD）。

数据部分是 `MergeTree` 引擎表的最小可移动单位。属于一部分的数据存储在一个磁盘上。数据部分可以在后台在磁盘之间移动（根据用户设置）并通过[ALTER](/sql-reference/statements/alter/partition) 查询进行更改。
### 术语 {#terms}

- 磁盘 - 挂载到文件系统的块设备。
- 默认磁盘 - 存储在[路径](/operations/server-configuration-parameters/settings.md/#path)服务器设置中指定路径的磁盘。
- 卷 - 一组相等的磁盘（类似于[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 - 卷的集合和在它们之间移动数据的规则。

所描述实体的名称可以在系统表中找到，[system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks)。要将配置的存储策略之一应用于表，请使用 `MergeTree` 引擎家族表的 `storage_policy` 设置。
### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `<storage_configuration>` 标签内声明，位于 `config.d` 目录中的文件中。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分中声明。这对于临时分析很有用，例如临时附加一个托管在 URL 上的磁盘。有关更多详细信息，请参见[动态存储](/operations/storing-data#dynamic-configuration)。
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
- `path` — 服务器将存储数据的路径（`data` 和 `shadow` 文件夹），应以 '/' 结尾。
- `keep_free_space_bytes` — 要保留的可用磁盘空间。

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
- `max_data_part_size_bytes` — 可以存储在任意卷磁盘上的部分的最大大小。如果合并部分的估计大小超过了 `max_data_part_size_bytes`，那么该部分将写入下一个卷。基本上，此功能允许在“热”（SSD）卷上保留新/小部分，并在它们达到大尺寸时将其移至“冷” （HDD） 卷。如果您的策略仅有一个卷，请不要使用此设置。
- `move_factor` — 当可用空间低于此因子时，数据自动开始在下一个卷上移动（默认值为 0.1）。ClickHouse 按照大小从大到小（降序）对现有部分进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则所有部分将被移动。
- `perform_ttl_move_on_insert` — 禁用在数据部分 INSERT 时的 TTL 移动。默认情况下（如果启用），如果我们插入的已过期的数据部分，它会立即移动到在移动规则中声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著减慢插入速度。如果禁用，则已过期的数据部分将写入默认卷，然后马上移动到 TTL 卷。
- `load_balancing` - 磁盘平衡策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置所有磁盘上可用空间更新的超时时间（以毫秒为单位）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘只能由 ClickHouse 使用且不受在线文件系统缩放/收缩的影响，则可以使用 `-1`，在其他情况下不建议使用，因为最终会导致空间分配不准确。
- `prefer_not_to_merge` — 不应使用此设置。禁用此卷上数据部分的合并（这会导致性能下降）。当启用此设置时（请不要这么做），将不允许在此卷上合并数据（这很糟糕）。这使得（但你并不需要这个）控制（如果你想控制某些事情，你其实是犯了错误）ClickHouse 如何处理慢磁盘（但 ClickHouse 更了解，所以请不要使用这个设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。较低的值意味着更高的优先级。参数值应该是自然数，并且在范围 1 到 N（最低优先级给定）内没有跳过任何号码。
  * 如果 _所有_ 卷都有标签，则按照给定顺序优先考虑它们。
  * 如果只有 _某些_ 卷有标签，则没有标签的卷优先级最低，并按照它们在配置中定义的顺序优先考虑。
  * 如果 _没有_ 卷有标签，则它们的优先级对应于它们在配置中声明的顺序。
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

在给定示例中，`hdd_in_order` 策略实施了[轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling)方法。因此，该策略仅定义一个卷（`single`），数据部分储存在其所有磁盘上以循环方式。此策略在系统中如果有多个相似磁盘挂载但没有配置 RAID 时非常有用。请记住，每个单独的磁盘驱动器并不可靠，您可能希望通过复制因子为 3 或更多来弥补这一点。

如果系统中有不同种类的磁盘，可使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 由一个 SSD 磁盘（`fast_ssd`）组成，并且可以存储在该卷上的部分的最大大小为 1GB。所有大于 1GB 的部分将直接存储在卷 `cold` 上，该卷包含一个 HDD 磁盘 `disk1`。此外，一旦磁盘 `fast_ssd` 的使用超过 80%，数据将通过后台进程传输到 `disk1`。

在存储策略中，卷的枚举顺序很重要，尤其是至少一个列出的卷没有显式的 `volume_priority` 参数。
一旦一个卷过满，数据将移动到下一个卷。磁盘的枚举顺序也很重要，因为数据轮流存储在它们上面。

创建表时，可以将配置的存储策略之一应用于其上：

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

`default` 存储策略意味着仅使用一个卷，它由 `<path>` 中给定的唯一磁盘组成。
可以使用 [ALTER TABLE ... MODIFY SETTING] 查询在创建表后更改存储策略，新策略应包含所有旧磁盘和相同名称的卷。

执行后台数据部分移动的线程数量可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。
### 详细信息 {#details}

在 `MergeTree` 表的情况下，数据以不同的方式写入磁盘：

- 作为插入（`INSERT` 查询）的结果。
- 在后台合并和[变更](/sql-reference/statements/alter#mutations)期间。
- 从另一个副本下载时。
- 结果为分区冻结 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在所有这些情况下，除了变更和分区冻结，部分将根据给定的存储策略存储在卷和磁盘上：

1.  选择第一个在定义顺序中具有足够的磁盘空间来存储部分的卷（`unreserved_space > current_part_size`）并允许存储给定大小的部分（`max_data_part_size_bytes > current_part_size`）。
2.  在这个卷内，选择紧接着用于存储数据前一块的磁盘，并且它应拥有比部分大小更多的可用空间（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在底层，变更和分区冻结使用了[硬链接](https://en.wikipedia.org/wiki/Hard_link)。因此，不支持不同磁盘之间的硬链接，因此在这种情况下，生成的部分存储在与初始部分相同的磁盘上。

在后台，部分根据自由空间的数量（`move_factor` 参数）在卷之间移动，按照配置文件中声明的卷的顺序。
数据从最后一卷传输到第一卷的情况永远不会发生。可以使用系统表 [system.part_log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）监控后台移动。详细信息也可以在服务器日志中找到。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将部分或分区从一个卷移动到另一个，所有后台操作的限制都将被考虑在内。该查询会自行发起移动，并且不会等待后台操作完成。如果可用空间不足或未满足任何必要的条件，用户将得到错误消息。

数据移动与数据复制并不冲突。因此，可以为不同副本的同一表指定不同的存储策略。

在后台合并和变更完成后，旧部分仅在一定时间后被删除（`old_parts_lifetime`）。在此时间内，它们不会移动到其他卷或磁盘。因此，在部分最终删除之前，它们仍被计算在占用的磁盘空间内。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置，将新的大部分分配到 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷中的不同磁盘，以保持平衡。
## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 家族表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘，将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`。有关更多详细信息，请参见[配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

将 `S3` 作为外部存储的配置示例，使用类型为 `s3` 的磁盘。

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
ClickHouse 版本 22.3 至 22.7 使用不同的缓存配置，如果您正在使用其中一个版本，请参见[使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::
## 虚拟列 {#virtual-columns}

- `_part` — 部分的名称。
- `_part_index` — 查询结果中部分的顺序索引。
- `_part_starting_offset` — 查询结果中部分的累计起始行。
- `_part_offset` — 部分中的行数。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 唯一的部分标识符（如果启用了 MergeTree 设置 `assign_part_uuids`）。
- `_part_data_version` — 部分的数据版本（最小块号或变更版本）。
- `_partition_value` — `partition by` 表达式的值（元组）。
- `_sample_factor` — 采样因子（来自查询）。
- `_block_number` — 行的块号，当设置为 true 时在合并时持久化。
## 列统计 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

统计声明在启用 `set allow_experimental_statistics = 1` 的 `*MergeTree*` 家族表的 `CREATE` 查询的列部分中。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们还可以使用 `ALTER` 语句操作统计数据。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计数据汇聚有关列中值分布的信息。统计数据存储在每个数据部分中，并在每次插入时更新。
只有在启用 `set allow_statistics_optimize = 1` 的情况下，才能将其用于预查询优化。
### 可用的列统计类型 {#available-types-of-column-statistics}

- `MinMax`

    最小和最大列值，可用于估算数值列上范围过滤器的选择性。

    语法：`minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 草图，可计算数值列的近似百分位数（例如，第 90 个百分位数）。

    语法：`tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图，提供列中不同值的估计数量。

    语法：`uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 草图，提供对每个值在列中频率的近似计数。

    语法：`countmin`
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

某些 MergeTree 设置可以在列级别上被覆盖：

- `max_compress_block_size` — 压缩前未压缩数据块的最大大小，以便写入表。
- `min_compress_block_size` — 写入下一个标记时，所需的未压缩数据块的最小大小。

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

列级设置可以使用 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 修改或删除，例如：

- 从列声明中删除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，同时删除表的 CREATE 查询中列表达式中的设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
