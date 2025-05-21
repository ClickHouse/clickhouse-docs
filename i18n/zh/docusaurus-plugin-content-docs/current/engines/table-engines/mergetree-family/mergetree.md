---
'description': 'MergeTree家族表引擎旨在实现高数据输入速率和大数据量。'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` 引擎以及 `MergeTree` 家族的其他引擎（例如 `ReplacingMergeTree`，`AggregatingMergeTree`）是 ClickHouse 中最常用和最强大的表引擎。

`MergeTree` 家族的表引擎旨在处理高数据摄入率和巨大的数据量。插入操作会创建表片段，这些片段会被后台进程与其他表片段合并。

`MergeTree` 家族表引擎的主要特性：

- 表的主键决定了每个表片段内部的排序顺序（聚集索引）。主键不引用单个行，而是引用8192行的块称为 granules。这使得巨大的数据集的主键足够小，可以保持在主内存中，同时仍提供对磁盘数据的快速访问。

- 表可以使用任意分区表达式进行分区。分区剪枝确保在查询允许时省略不会从读取中读取的分区。

- 数据可以在多个集群节点之间复制，以实现高可用性、故障切换和零停机升级。参见 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持各种统计类型和采样方法，以帮助查询优化。

:::note
尽管名字相似，但 [Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎不同。
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

一组列名或任意表达式。例如：`ORDER BY (CounterID + 1, EventDate)`。

如果没有定义主键（即未指定 `PRIMARY KEY`），ClickHouse 使用排序键作为主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。另外，如果启用 `create_table_empty_primary_key_by_default`，`ORDER BY tuple()` 会隐式添加到 `CREATE TABLE` 语句中。详见 [选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下，你不需要分区键，如果确实需要分区，一般来说不需要比按月更细的分区键。分区不会加速查询（与 ORDER BY 表达式相反）。切勿使用过于细致的分区。不要根据客户端标识符或名称进行分区（而是，将客户端标识符或名称作为 ORDER BY 表达式中的第一列）。

按月进行分区时，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。这儿的分区名称采用 `"YYYYMM"` 格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它 [与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)，则为主键。可选。

指定排序键（使用 `ORDER BY` 子句）会隐式指定一个主键。通常不需要在排序键之外再指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定，它必须包含在主键中。采样表达式必须生成一个无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 指定行存储期限和自动部分移动 [在磁盘和卷之间](#table_engine-mergetree-multiple-volumes) 的规则列表。可选。

表达式必须导致 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定在满足表达式（达到当前时间）时应对部分进行的操作：删除过期行（`DELETE`）、将部分移动到指定磁盘 (`TO DISK 'xxx'`) 或卷 (`TO VOLUME 'xxx'`)，或者在过期行中聚合值。规则的默认类型是删除（`DELETE`）。可以指定多条规则，但仅能有一条 `DELETE` 规则。

有关更多细节，请参见 [列和表的 TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

参见 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**示例的部分设置**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在这个示例中，我们按月进行分区。

我们还为用户 ID 设置了一个哈希采样表达式。这允许你对每个 `CounterID` 和 `EventDate` 伪随机化表中的数据。如果你在选择数据时定义了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 将返回一个均匀的伪随机数据样本，适用于子集用户。

`index_granularity` 设置可以省略，因为8192是默认值。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中请勿使用此方法。如果可能，请将旧项目切换到上述描述的方法。
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

- `date-column` — 类型为 [Date](/sql-reference/data-types/date.md) 的列名。ClickHouse 会根据此列自动按月创建分区。分区名称采用 `"YYYYMM"` 格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型：[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。索引 "marks" 之间的数据行数。值 8192 适用于大多数任务。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎的配置与上面示例中的主要引擎配置方法相同。
</details>
## 数据存储 {#mergetree-data-storage}

一个表由按主键排序的数据部分组成。

当数据被插入到表中时，会创建单独的数据部分，每个部分都按主键进行字典序排序。例如，如果主键是 `(CounterID, Date)`，那么部分内的数据会按 `CounterID` 排序，在每个 `CounterID` 内按 `Date` 排序。

属于不同分区的数据被分隔到不同的部分。在后台，ClickHouse 会将数据部分合并以实现更高效的存储。属于不同分区的部分不会被合并。合并机制并不能保证具有相同主键的所有行都位于同一个数据部分中。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中，每列存储在文件系统中的单独文件中；而在 `Compact` 格式下，所有列存储在一个文件中。`Compact` 格式可以提高小规模频繁插入的性能。

数据存储格式由表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果数据部分中的字节或行数少于相应设置的值，则该部分将以 `Compact` 格式存储。否则，它将以 `Wide` 格式存储。如果没有设置这些选项，数据部分将以 `Wide` 格式存储。

每个数据部分在逻辑上分为 granules。granule 是 ClickHouse 在选择数据时读取的最小不可分割的数据集。ClickHouse 不会拆分行或值，因此每个 granule 永远包含整数数量的行。granule 的第一行标记为行的主键值。对于每个数据部分，ClickHouse 创建一个索引文件，用于存储标记。对于每列，无论它是否为主键，ClickHouse 也会存储相同的标记。这些标记允许你直接在列文件中查找数据。

granule 的大小受到表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置的限制。granule 中的行数位于 `[1, index_granularity]` 范围内，具体取决于行的大小。如果单行的大小超过设置值，则 granule 的大小可以超过 `index_granularity_bytes`。在这种情况下，granule 的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以主键 `(CounterID, Date)` 为例。在这种情况下，排序和索引可以如下所示：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，则服务器在标记范围 `[0, 3)` 和 `[6, 8)` 中读取数据。
- `CounterID IN ('a', 'h') AND Date = 3`，服务器在标记范围 `[1, 3)` 和 `[7, 8)` 中读取数据。
- `Date = 3`，服务器在标记范围 `[1, 10]` 中读取数据。

上述示例显示，使用索引总是比进行全表扫描更为高效。

稀疏索引允许读取额外数据。当按主键读取单一范围时，每个数据块最多可以读取 `index_granularity * 2` 行。

稀疏索引使你能够处理非常大量的表行，因为在大多数情况下，这种索引能适应计算机的内存。

ClickHouse 不要求唯一主键。你可以插入多个具有相同主键的行。

你可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不推荐。要允许此特性，请启用 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则适用于 `ORDER BY` 子句中的 `NULL` 值。
### 选择主键 {#selecting-a-primary-key}

主键中列的数量没有明确限制。根据数据结构，你可以在主键中包含更多或更少的列。这可能会：

- 改善索引的性能。

    如果主键是 `(a, b)`，则在满足以下条件时，添加另一个列 `c` 将改善性能：

    - 存在针对列 `c` 的条件查询。
    - 具有相同 `(a, b)` 值的长数据范围（几倍长于 `index_granularity`）是常见的。换句话说，当添加另一个列允许你跳过相当长的数据范围时。

- 改善数据压缩。

    ClickHouse 按主键对数据进行排序，因此一致性越高，压缩效果越好。

- 在 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎中合并数据部分时提供额外逻辑。

    在这种情况下，可以指定与主键不同的 *排序键*。

较长的主键会负面影响插入性能和内存消耗，但在 `SELECT` 查询中，主键中的额外列并不会影响 ClickHouse 的性能。

你可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下，ClickHouse 按插入顺序存储数据。如果希望在通过 `INSERT ... SELECT` 查询插入数据时保存数据顺序，请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要以初始顺序选择数据，请使用 [单线程](/operations/settings/settings.md/#max_threads) `SELECT` 查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个与排序键不同的主键（用于编写到每个标记的索引文件的值的表达式）。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

当使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时，此功能非常有用。在常见案例中，使用这些引擎的表有两种类型的列：*维度* 和 *度量*。典型的查询通过维度的任意 `GROUP BY` 和筛选来聚合度量列的值。由于 SummingMergeTree 和 AggregatingMergeTree 会对具有相同排序键值的行进行聚合，因此将所有维度添加到其中是合乎自然的。结果，键表达式由一长串列组成，此列表必须经常更新以添加新的维度。

在这种情况下，留下一些列在主键中，它们将提供有效的范围扫描，并将剩余的维度列添加到排序键元组中是合理的。

对排序键的 [ALTER](/sql-reference/statements/alter/index.md) 是一个轻量级操作，因为当新的列同时添加到表和排序键时，现有数据部分不需要更改。由于旧的排序键是新的排序键的前缀，并且新添加的列中没有数据，因此在表修改时，数据会按照旧排序键和新排序键排序。
### 在查询中使用索引和分区 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 分析是否可以使用索引。只有在 `WHERE/PREWHERE` 子句中存在表达式（作为诸元素之一，或者完全表示）代表相等或不相等比较操作，或者如果在主键或分区键上有 `IN` 或 `LIKE` 并指定了固定前缀，或者在这些列的某些部分重复函数或这些表达式的逻辑关系时，索引才能使用。

因此，可以快速对主键的一个或多个范围运行查询。在这个例子中，当针对特定跟踪标签、特定标签和日期范围、特定标签和日期、多个标签与日期范围等运行查询时，查询将快速。

让我们看看配置如下的引擎：
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

ClickHouse 将使用主键索引来修剪不合适的数据，并使用按月分区键来修剪不合适日期范围的分区。

上述查询显示，即使是对于复杂表达式，索引也被使用。表的读取方式被组织为使用索引不可能比全表扫描更慢。

在下面的示例中，无法使用索引。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 在运行查询时能否使用索引，请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings#force_primary_key)。

按月分区的关键仅允许读取包含在合适范围内的日期的数据块。在这种情况下，数据块可以包含许多日期的数据（最多一个完整的月份）。在块内，数据按主键排序，主键中可能没有日期作为第一列。因此，仅使用不指定主键前缀的日期条件的查询可能会导致读取的数据比单一日期的更多。
### 对于部分单调主键的索引使用 {#use-of-index-for-partially-monotonic-primary-keys}

考虑一个例子，月份的天数。它们在一个月内形成 [单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在更长的时间段内则不是单调的。这是一个部分单调序列。如果用户创建了一个带有部分单调主键的表，ClickHouse 会像往常一样创建稀疏索引。当用户从这种类型的表中选择数据时，ClickHouse 分析查询条件。如果用户想要获取位于两个索引标记之间的数据，并且这两个标记都落在同一个月内，ClickHouse 在特定情况下可以使用索引，因为它可以计算查询参数和索引标记之间的距离。

如果查询参数范围内的主键值不表示单调序列，ClickHouse 将无法使用索引。在这种情况下，ClickHouse 使用全表扫描方法。

ClickHouse 使用此逻辑不仅适用于月份的天数序列，而是适用于任何表示部分单调序列的主键。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明位于 `CREATE` 查询的列部分。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于来自 `*MergeTree` 家族的表，可以指定数据跳过索引。

这些索引汇总有关指定表达式在由 `granularity_value` granules 组成的区块中的一些信息（granule 的大小由表引擎中的 `index_granularity` 设置指定）。然后在 `SELECT` 查询中使用这些汇总信息来减少从磁盘读取的数据量，方法是跳过无法满足 `where` 查询的较大数据区块。

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

示例中的索引可以被 ClickHouse 用于减少以下查询中从磁盘读取的数据量：

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

存储指定表达式的极值（如果表达式为 `tuple`，则为每个 `tuple` 的元素存储极值），使用存储的信息跳过数据块，类似于主键。

语法：`minmax`
#### Set {#set}

存储指定表达式的唯一值（不超过 `max_rows` 行，`max_rows=0` 意味着“无限制”）。使用这些值来检查块数据上的 `WHERE` 表达式是否不可满足。

语法：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

为指定列存储 [布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。可选的 `false_positive` 参数的可能取值在 0 和 1 之间，指定从过滤器接收虚假正响应的概率。默认值：0.025。支持的数据类型包括：`Int*`，`UInt*`，`Float*`，`Enum`，`Date`，`DateTime`，`String`，`FixedString`，`Array`，`LowCardinality`，`Nullable`，`UUID` 和 `Map`。对于 `Map` 数据类型，客户端可以通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定索引是针对键还是值创建的。

语法：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

存储一个包含所有 n-grams 的 [布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)，来自一个数据块。仅适用于数据类型：[String](/sql-reference/data-types/string.md)， [FixedString](/sql-reference/data-types/fixedstring.md) 和 [Map](/sql-reference/data-types/map.md)。可用于优化 `EQUALS`、`LIKE` 和 `IN` 表达式。

语法：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngram 大小，
- `size_of_bloom_filter_in_bytes` — 布隆过滤器的字节大小（在这里可以使用大的值，例如 256 或 512，因为它可以很好地压缩）。
- `number_of_hash_functions` — 布隆过滤器中使用的哈希函数数量。
- `random_seed` — 布隆过滤器哈希函数的种子。

用户可以创建 [用户自定义函数 (UDF)](/sql-reference/statements/create/function.md) 来估算 `ngrambf_v1` 的参数集。查询语句如下：

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

为了使用这些函数，我们至少需要指定两个参数。
例如，如果在 granule 中有 4300 个 ngrams，且预计虚假正响应少于 0.0001。可以通过执行以下查询来估算其他参数：

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

当然，你也可以使用这些函数根据其他条件来估算参数。
这些函数参考的内容 [这里](https://hur.st/bloomfilter)。
#### Token Bloom Filter {#token-bloom-filter}

与 `ngrambf_v1` 相同，但存储的是标记而不是 ngrams。标记是由非字母数字字符分隔的序列。

语法：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 专用 {#special-purpose}

- 支持近邻搜索的实验性索引。有关详细信息，请参见 [此处](annindexes.md)。
- 支持全文搜索的实验性全文索引。有关详细信息，请参见 [此处](invertedindexes.md)。
### 函数支持 {#functions-support}

`WHERE` 子句中的条件包含对操作列的函数的调用。如果列是索引的一部分，ClickHouse 会尝试在执行这些函数时使用该索引。ClickHouse 支持使用索引的不同函数子集。

类型为 `set` 的索引可以被所有函数利用。其他索引类型的支持情况如下：

| 函数（操作符）/ 索引                                                                              | 主键       | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|--------------------------------------------------------------------------------------------------|------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔          | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔          | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔          | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔          | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                | ✗          | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                             | ✔          | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                 | ✗          | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)              | ✗          | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                        | ✔          | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                     | ✔          | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                 | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                           | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                     | ✔          | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗          | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                         | ✗          | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                         | ✗          | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                                   | ✗          | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗          | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗          | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗          | ✗      | ✗          | ✔          | ✗            | ✗         |

具有小于 ngram 大小的常量参数的函数不能被 `ngrambf_v1` 用于查询优化。

(*) 对于 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 来说，必须使用小写数据创建 `tokenbf_v1` 索引，例如 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
布隆过滤器可能有误报匹配，因此 `ngrambf_v1`、`tokenbf_v1` 和 `bloom_filter` 索引不能用于优化期望函数输出为假（false）的查询。

例如：

- 可以优化的：
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 不能优化的：
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::
## 投影 {#projections}

投影就像 [物化视图](/sql-reference/statements/create/view)，但在部分级别定义。它提供了一致性保证，并在查询中自动使用。

:::note
实现投影时，您还应该考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
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

投影存储在部分目录中。它类似于索引，但包含一个子目录，用于存储匿名 `MergeTree` 表的部分。此表由投影的定义查询引导。如果有 `GROUP BY` 子句，则底层存储引擎变为 [AggregatingMergeTree](aggregatingmergetree.md)，并且所有聚合函数都会转换为 `AggregateFunction`。如果有 `ORDER BY` 子句，则 `MergeTree` 表将其用作主键表达式。在合并过程中，投影部分通过其存储的合并例程进行合并。父表部分的校验和与投影部分结合。其他维护工作与跳过索引类似。
### 查询分析 {#projection-query-analysis}

1. 检查投影是否可以用于回答给定查询，即它生成的答案是否与查询基本表的结果相同。
2. 选择最合适的匹配，该匹配包含要读取的最少颗粒。
3. 使用投影的查询管道将与使用原始部分的查询管道不同。如果某些部分中缺少投影，可以添加管道以“动态投影”。
##  并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当表同时被读取和更新时，数据是从查询时当前的一组部分中读取的。没有漫长的锁定。插入不会干扰读取操作。

从表中读取数据被自动并行化。
## 列和表的 TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

`TTL` 子句可以为整张表和每个单独列设置。表级 `TTL` 还可以指定在磁盘和卷之间自动移动数据的逻辑，或重新压缩所有数据均已过期的部分。

表达式必须评估为 [Date](/sql-reference/data-types/date.md) 或 [DateTime](/sql-reference/data-types/datetime.md) 数据类型。

**语法**

为列设置生存时间：

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，请使用 [时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 操作，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### 列 TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse 将其替换为列数据类型的默认值。如果数据部分中的所有列值都过期，ClickHouse 将从文件系统中的数据部分中删除该列。

`TTL` 子句不能用于关键列。

**示例**
#### 创建具有 `TTL` 的表: {#creating-a-table-with-ttl}

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
#### 修改列的 TTL {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### 表 TTL {#mergetree-table-ttl}

表可以有一个用于删除过期行的表达式，以及多个用于自动移动分区在 [磁盘或卷](#table_engine-mergetree-multiple-volumes) 之间的表达式。当表中的行过期时，ClickHouse 删除所有对应的行。对于部分移动或重新压缩，部分的所有行必须满足 `TTL` 表达式的条件。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可以跟随每个 TTL 表达式。它影响一旦满足该表达式（达到当前时间）后将要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 使用 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将部分移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将部分移动到磁盘 `bbb`；
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句一起使用，以根据过滤条件仅删除部分过期行：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果列不是 `GROUP BY` 表达式的一部分，并且未在 `SET` 子句中显式设置，则结果行包含从分组行中任意获得的值（好像对其应用了聚合函数 `any`）。

**示例**
#### 创建具有 `TTL` 的表: {#creating-a-table-with-ttl-1}

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

创建一个表，其中行在一个月后过期。过期的行中日期为星期一的行被删除：

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
#### 创建一个表，其中过期行被重新压缩: {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个表，其中过期行被聚合。结果行中 `x` 包含分组行的最大值，`y` - 最小值，`d` - 从分组行中任意获得的值。

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

具有过期 `TTL` 的数据在 ClickHouse 合并数据部分时被移除。

当 ClickHouse 检测到数据过期时，会进行一次非计划合并。要控制这种合并的频率，您可以设置 `merge_with_ttl_timeout`。如果值设置得过低，将执行许多非计划合并，这可能会消耗大量资源。

如果您在合并之间执行 `SELECT` 查询，可能会获得过期数据。为避免这种情况，在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置
## 磁盘类型 {#disk-types}

除了本地块设备外，ClickHouse 还支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读自 web](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于不可变、非复制的 S3 表](/operations/storing-data.md#s3-plain-rewritable-storage)
## 使用多个块设备进行数据存储 {#table_engine-mergetree-multiple-volumes}
### 介绍 {#introduction}

`MergeTree` 系列表引擎可以将数据存储在多个块设备上。例如，当某个表的数据隐式分为“热”和“冷”时，这可能会很有用。最近的数据经常被请求但只需要少量空间。相反，长尾的历史数据请求很少。如果有多个磁盘可用，“热”数据可以放在快速磁盘上（例如 NVMe SSD 或内存中），而“冷”数据可以放在相对较慢的磁盘上（例如 HDD）。

数据部分是 `MergeTree` 引擎表的最小可移动单元。属于一个部分的数据存储在一个磁盘上。数据部分可以在后台在磁盘之间移动（根据用户设置），也可以通过 [ALTER](/sql-reference/statements/alter/partition) 查询进行移动。
### 术语 {#terms}

- 磁盘 — 挂载到文件系统的块设备。
- 默认磁盘 — 存储在 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定的路径的磁盘。
- 卷 — 一组相等磁盘的有序集合（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 — 卷的集合及其之间移动数据的规则。

描述的实体的名称可以在系统表 [system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要将配置的存储策略应用于表，请使用 `MergeTree` 引擎系列表的 `storage_policy` 设置。
### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `<storage_configuration>` 标签内部声明，或者在 `config.d` 目录中的文件中。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分中声明。这对于临时附加，例如来自 URL 的磁盘的临时分析是有用的。
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
- `path` — 服务器将存储数据的路径（`data` 和 `shadow` 文件夹），应以 '/' 结束。
- `keep_free_space_bytes` — 要保留的自由磁盘空间的数量。

磁盘定义的顺序不重要。

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

- `policy_name_N` — 策略名称。策略名称必须是唯一的。
- `volume_name_N` — 卷名称。卷名称必须是唯一的。
- `disk` — 卷中的一个磁盘。
- `max_data_part_size_bytes` — 可以存储在任何卷磁盘上的部分的最大大小。如果合并部分的估计大小大于 `max_data_part_size_bytes`，则该部分将写入下一个卷。基本上，该功能允许将新/小部分保留在热（SSD）卷上，并在达到大尺寸时将其移动到冷（HDD）卷。如果您的策略只有一个卷，请不要使用此设置。
- `move_factor` — 当可用空间的数量低于此因子时，数据自动开始在下一个卷上移动（默认值为 0.1）。ClickHouse 按照从大到小（降序）的顺序对现有部分进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则所有部分将被移动。
- `perform_ttl_move_on_insert` — 禁用数据部分插入时的 TTL 移动。默认情况下（如果启用），如果我们插入一个根据 TTL 移动规则已过期的数据部分，它会立即移动到声明在移动规则中的卷/磁盘。如果目标卷/磁盘很慢（例如 S3），这可能会显著减慢插入速度。如果禁用，则已经过期的数据部分会写入到默认卷中，然后立即移动到 TTL 卷。
- `load_balancing` - 磁盘平衡的策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置更新所有磁盘的可用空间的超时（以毫秒为单位）(`0` - 始终更新，`-1` - 永不更新，默认值为 `60000`）。注意，如果磁盘只能被 ClickHouse 使用，并且不受在线文件系统调整大小的影响，可以使用 `-1`，在所有其他情况下不建议使用，因为最终会导致不正确的空间分配。
- `prefer_not_to_merge` — 您不应该使用此设置。禁用在此卷上合并数据部分（这有害并导致性能下降）。当启用此设置时（不要这样做），不允许在此卷上合并数据（这很糟糕）。这允许（但您不需要这样做）控制（如果您想控制某些事情，您就是在犯错误）ClickHouse 如何处理慢速磁盘（但 ClickHouse 更了解情况，请不要使用此设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。较低的值表示较高的优先级。参数值应为自然数，并共同覆盖范围从 1 到 N（给定最低优先级），且不跳过任何数字。
  * 如果 _所有_ 卷都被标记，则按给定顺序进行优先级排序。
  * 如果 _某些_ 卷被标记，则未标记的卷具有最低优先级，并按配置中的定义顺序进行优先级排序。
  * 如果 _没有_ 卷被标记，则它们的优先级相应于它们在配置中声明的顺序。
  * 两个卷不能有相同的优先级值。

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

在给定的示例中，`hdd_in_order` 策略实现了 [轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方法。因此，此策略仅定义了一个卷（`single`），数据部分在其所有磁盘上循环存储。此策略在系统中有多个相似磁盘但未配置 RAID 时可能非常有用。请记住，每个磁盘驱动器都是不可靠的，您可能希望通过 3 个或更多的复制因子来进行补偿。

如果系统中可用不同种类的磁盘，则可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 包含一个 SSD 磁盘（`fast_ssd`），并且可以存储在此卷上的部分的最大大小为 1GB。所有大于 1GB 的部分将直接存储在 `cold` 卷上，该卷包含一个 HDD 磁盘 `disk1`。
此外，一旦磁盘 `fast_ssd` 的填充超过 80%，数据将通过后台进程传输到 `disk1`。

在存储策略内，卷的枚举顺序在至少一个列出的卷没有显式的 `volume_priority` 参数时非常重要。
一旦一个卷过满，数据将转移到下一个卷。磁盘的枚举顺序也很重要，因为数据将按顺序存储在它们上面。

在创建表时，可以将配置的存储策略应用于其中：

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

`default` 存储策略意味着仅使用一个卷，该卷仅由 `<path>` 中给出的一个磁盘组成。
您可以通过 [ALTER TABLE ... MODIFY SETTING] 查询在表创建后更改存储策略，新策略应包括所有旧磁盘和相同名称的卷。

执行后台移动数据部分的线程数可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。
### 细节 {#details}

在 `MergeTree` 表的情况下，数据通过不同的方式写入磁盘：

- 作为插入（`INSERT` 查询）的结果。
- 在后台合并和 [变异](/sql-reference/statements/alter#mutations) 中。
- 从另一个副本下载时。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在这些情况下，除了变异和分区冻结外，部分是根据给定的存储策略在卷和磁盘上存储的：

1.  首先选择具有足够磁盘空间存储部分的第一个卷（`unreserved_space > current_part_size`）并允许存储给定大小部分的卷（`max_data_part_size_bytes > current_part_size`）。
2.  在此卷内，选择一个磁盘，该磁盘紧随第一个用于存储前一数据块的磁盘，并且其空闲空间大于部分大小（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在内部，变异和分区冻结使用 [硬链接](https://en.wikipedia.org/wiki/Hard_link)。不支持不同磁盘之间的硬链接，因此在这种情况下，生成的部分存储在与初始部分相同的磁盘上。

在后台，部分根据空闲空间（`move_factor` 参数）在卷之间移动，顺序为配置文件中声明的卷的顺序。
数据永远不会从最后一个卷转移到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）来监控后台移动。同时，详细信息可以在服务器日志中找到。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将部分或分区从一个卷移动到另一个卷，所有后台操作的限制都得到考虑。该查询会自行启动移动，并且不会等待后台操作完成。如果没有足够的空闲空间可用，或未满足任何必要条件，用户将收到错误消息。

移动数据不会干扰数据复制。因此，可以为同一表的不同副本指定不同的存储策略。

在后台合并和变异完成后，仅在一定时间后才会删除旧部分（`old_parts_lifetime`）。
在此期间，它们不会移动到其他卷或磁盘。因此，在部分最终被删除之前，它们仍在用于评估占用的磁盘空间。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置以平衡的方式将新大部分分配给 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘。
## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 系列表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS` 中。有关更多详细信息，请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

以下是使用类型为 `s3` 的磁盘将数据存储到 [S3](https://aws.amazon.com/s3/) 作为外部存储的示例。

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

另请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

:::note 缓存配置
ClickHouse 版本 22.3 到 22.7 使用不同的缓存配置，如果您使用的是这些版本之一，请参见 [使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::
## 虚拟列 {#virtual-columns}

- `_part` — 一部分的名称。
- `_part_index` — 查询结果中部分的顺序索引。
- `_part_starting_offset` — 查询结果中部分的累积起始行。
- `_part_offset` — 部分中的行号。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 唯一部分标识符（如果启用 MergeTree 设置 `assign_part_uuids`）。
- `_part_data_version` — 部分的数据版本（最小块编号或变异版本）。
- `_partition_value` — `partition by` 表达式的值（元组）。
- `_sample_factor` — 采样因子（来自查询）。
- `_block_number` — 行的块编号，在设置 `allow_experimental_block_number_column` 为 true 时在合并后持久化。
## 列统计信息 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

统计信息声明是在 `*MergeTree*` 系列表的 `CREATE` 查询的列部分中，当我们启用 `set allow_experimental_statistics = 1` 时。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们还可以使用 `ALTER` 语句操作统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息聚合列中值的分布信息。统计信息存储在每个部分，并在每次插入时更新。
它们仅在启用 `set allow_statistics_optimize = 1` 时可以用于预查询优化。
### 可用的列统计信息类型 {#available-types-of-column-statistics}

- `MinMax`

    列最小值和最大值，使我们能够估计数值列上范围过滤器的选择性。

    语法：`minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 草图，使我们能够计算数值列的近似百分位数（例如，第90百分位数）。

    语法：`tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图，提供有关列包含多少个不同值的估计。

    语法：`uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 草图，提供对列中每个值频率的近似计数。

    语法：`countmin`
### 支持的数据类型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String 或 FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### 支持的操作 {#supported-operations}

|           | 等于过滤器 (==) | 范围过滤器 (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |
## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别被覆盖：

- `max_compress_block_size` — 压缩前的未压缩数据块的最大大小，以便将其写入表中。
- `min_compress_block_size` — 写入下一个标记时，压缩所需的未压缩数据块的最小大小。

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

- 从列声明中删除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，还会删除表的 CREATE 查询中的列表达式中的设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
