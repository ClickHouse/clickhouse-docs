import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

`MergeTree`引擎和其他`MergeTree`家族的引擎（例如`ReplacingMergeTree`、`AggregatingMergeTree`）是ClickHouse中最常用且最稳健的表引擎。

`MergeTree`家族的表引擎旨在处理高数据摄入速率和海量数据。插入操作会创建表部分，这些部分会与其他表部分由后台进程合并。

`MergeTree`家族表引擎的主要特性：

- 表的主键决定了每个表部分内的排序顺序（聚簇索引）。主键并不是指向单独的行，而是指向8192行的块，称为粒度。这使得海量数据集的主键足够小，可以保持在主内存中加载，同时仍然可以快速访问磁盘上的数据。

- 表可以使用任意分区表达式进行分区。分区裁剪确保在查询允许时省略读取分区。

- 数据可以在多个集群节点之间复制，以提高可用性、故障切换和零停机时间升级。请参见[数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree`表引擎支持各种统计类型和采样方法以协助查询优化。

:::note
尽管名字相似，[Merge](/engines/table-engines/special/merge)引擎与`*MergeTree`引擎不同。
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

有关参数的详细描述，请参见[CREATE TABLE](/sql-reference/statements/create/table.md)语句。
### 查询子句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。`ENGINE = MergeTree()`。`MergeTree`引擎没有参数。
#### ORDER_BY {#order_by}

`ORDER BY` — 排序键。

一组列名或任意表达式。示例：`ORDER BY (CounterID + 1, EventDate)`。

如果没有定义主键（即未指定`PRIMARY KEY`），ClickHouse将使用排序键作为主键。

如果不需要排序，可以使用语法`ORDER BY tuple()`。另外，如果启用`create_table_empty_primary_key_by_default`，则`ORDER BY tuple()`将隐式添加到`CREATE TABLE`语句中。请参见[选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。在大多数情况下，您不需要分区键，如果确实需要分区，通常不需要比按月更详细的分区。分区并不会加快查询速度（与ORDER BY表达式相反）。您不应使用过于细粒度的分区。不应根据客户标识符或名称划分数据（相反，将客户标识符或名称作为ORDER BY表达式的第一列）。

按月分区时，使用`toYYYYMM(date_column)`表达式，其中`date_column`是类型为[Date](/sql-reference/data-types/date.md)的日期列。此处的分区名称采用`"YYYYMM"`格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它[与排序键不同](#choosing-a-primary-key-that-differs-from-the-sorting-key)，则为主键。可选。

指定排序键（使用`ORDER BY`子句）隐式指定主键。通常不需要在排序键的基础上另外指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定，它必须包含在主键中。采样表达式必须产生一个无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 指定行的存储周期和自动部分移动[在磁盘和卷之间](#table_engine-mergetree-multiple-volumes)的逻辑规则列表。可选。

表达式必须产生`Date`或`DateTime`，例如`TTL date + INTERVAL 1 DAY`。

规则的类型`DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY`指定了在表达式满足时（到达当前时间）对部分执行的操作：删除过期行、将部分（如果表达式对部分中的所有行均满意）移动到指定的磁盘（`TO DISK 'xxx'`）或卷（`TO VOLUME 'xxx'`），或对过期行中的值进行聚合。规则的默认类型为移除（`DELETE`）。可以指定多个规则的列表，但最多只能有一个`DELETE`规则。

有关更多详细信息，请参见[列和表的TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

请参见[MergeTree设置](../../../operations/settings/merge-tree-settings.md)。

**缩部设置示例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在此示例中，我们设置按月分区。

我们还设置了用户ID的哈希采样表达式。这允许您为每个`CounterID`和`EventDate`伪随机化表中的数据。如果在选择数据时定义了[SAMPLE](/sql-reference/statements/select/sample)子句，ClickHouse将返回在用户子集中均匀伪随机的数据样本。

`index_granularity`设置可以被省略，因为8192是默认值。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法。如果可能，将旧项目切换到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree()参数**

- `date-column` — 类型为[Date](/sql-reference/data-types/date.md)的列的名称。ClickHouse会自动根据此列按月份创建分区。分区名称采用`"YYYYMM"`格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型：[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。每个索引"标记"之间的数据行数。值为8192适合大多数任务。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree`引擎的配置与上述主要引擎配置方法相同。
</details>
## 数据存储 {#mergetree-data-storage}

一个表由按主键排序的数据部分组成。

当数据插入表中时，会创建单独的数据部分，并且每个部分都按主键进行字典序排序。例如，如果主键为`(CounterID, Date)`，则部分中的数据按`CounterID`排序，在每个`CounterID`内，按`Date`排序。

属于不同分区的数据被分隔到不同的部分。在后台，ClickHouse合并数据部分以进行更高效的存储。属于不同分区的部分不会合并。合并机制不能保证具有相同主键的所有行将位于同一数据部分中。

数据部分可以存储在`Wide`或`Compact`格式中。在`Wide`格式中，每列存储在文件系统中的单独文件中，而在`Compact`格式中，所有列存储在一个文件中。可以使用`Compact`格式来提高小型和频繁插入的性能。

数据存储格式由表引擎的`min_bytes_for_wide_part`和`min_rows_for_wide_part`设置控制。如果数据部分中的字节数或行数少于相应设置值，则该部分以`Compact`格式存储。否则以`Wide`格式存储。如果没有设置这些选项，则数据部分会以`Wide`格式存储。

每个数据部分在逻辑上分为粒度。粒度是ClickHouse在选择数据时读取的最小不可分割数据集。ClickHouse不会拆分行或值，因此每个粒度始终包含整数行数。粒度的第一行用行的主键值标记。对于每个数据部分，ClickHouse 创建一个索引文件来存储标记。对于每一列，不论它是否在主键中，ClickHouse也存储同样的标记。这些标记使您能够直接在列文件中查找数据。

粒度大小受表引擎的`index_granularity`和`index_granularity_bytes`设置限制。粒度中的行数位于`[1, index_granularity]`范围内，具体取决于行的大小。如果单行的大小大于该设置的值，则粒度的大小可以超过`index_granularity_bytes`。在这种情况下，粒度的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以`(CounterID, Date)`主键为例。在这种情况下，排序和索引可以如下所示：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，服务器读取标记范围中的数据`[0, 3)`和`[6, 8)`。
- `CounterID IN ('a', 'h') AND Date = 3`，服务器读取标记范围中的数据`[1, 3)`和`[7, 8)`。
- `Date = 3`，服务器读取标记范围中的数据`[1, 10]`。

上述示例表明，使用索引通常比完全扫描更有效。

稀疏索引允许读取额外数据。在读取主键的单个范围时，每个数据块中可以读取多达`index_granularity * 2`的额外行。

稀疏索引允许您处理非常大量的表行，因为在大多数情况下，这样的索引可以适应计算机的RAM。

ClickHouse不要求唯一的主键。您可以插入多个具有相同主键的行。

您可以在`PRIMARY KEY`和`ORDER BY`子句中使用`Nullable`类型的表达式，但强烈不建议这样做。要允许此功能，请启用[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key)设置。原则上，`NULLS_LAST`(/sql-reference/statements/select/order-by.md/#sorting-of-special-values)适用于`ORDER BY`子句中的`NULL`值。
### 选择主键 {#selecting-a-primary-key}

主键中的列数没有明确限制。根据数据结构，您可以在主键中包含更多或更少的列。这可能会：

- 提高索引的性能。

    如果主键是`(a, b)`，那么添加另一个列`c`将提高性能，如果满足以下条件：

    - 有对列`c`的条件查询。
    - 长的数据范围（比`index_granularity`长几倍）具有相同的`(a, b)`值是普遍存在的。换句话说，添加另一列可以让您跳过相当长的数据范围。

- 改善数据压缩。

    ClickHouse按主键对数据进行排序，因此一致性越高，压缩效果越好。

- 提供在[CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)和[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)引擎中合并数据部分时的附加逻辑。

    在这种情况下，指定与主键不同的*排序键*是有意义的。

长主键将对插入性能和内存消耗产生负面影响，但主键中的额外列在`SELECT`查询期间不会影响ClickHouse的性能。

您可以使用`ORDER BY tuple()`语法创建没有主键的表。在这种情况下，ClickHouse将按照插入顺序存储数据。如果希望在通过`INSERT ... SELECT`查询插入数据时保持数据顺序，请设置[max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要以初始顺序选择数据，请使用[单线程](/operations/settings/settings.md/#max_threads) `SELECT`查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定一个主键（用于在索引中为每个标记写入的值的表达式），与排序键（用于按数据部分中的行排序的表达式）不同。在这种情况下，主键表达式元组必须是排序键表达式元组的前缀。

当使用[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)和[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md)表引擎时，此功能很有用。在使用这些引擎的常见情况下，表具有两种类型的列：*维度*和*度量*。典型的查询对维度进行过滤，并使用任意`GROUP BY`聚合度量列的值。由于SummingMergeTree和AggregatingMergeTree会以相同的排序键值聚合行，因此为了添加所有维度到排序键中显得很自然。结果，键表达式由较长的列列表组成，并且这个列表必须随着新维度的添加而频繁更新。

在这种情况下，保留主键中的少数列以提供高效的范围扫描并将剩余的维度列添加到排序键元组中是有意义的。

排序键的[ALTER](/sql-reference/statements/alter/index.md)是一个轻量级操作，因为当新列同时添加到表和排序键时，现有数据部分不需要改变。由于旧排序键是新排序键的前缀，并且在新添加的列中没有数据，因此数据在表修改时会依据旧的和新的排序键进行排序。
### 查询中索引和分区的使用 {#use-of-indexes-and-partitions-in-queries}

在`SELECT`查询期间，ClickHouse会分析索引是否可以使用。如果一个索引可以使用，`WHERE/PREWHERE`子句中有一个表达式（作为其中一个结合元素，或完全）表示一个相等或不等比较操作，或者它在列或表达式中具有固定前缀的`IN`或`LIKE`，这些列或表达式在主键或分区键中，或这些列的某些部分重复函数的逻辑关系。

因此，可以快速运行一或多个主键的查询。例如，当针对特定追踪标签、特定标签和日期范围、特定标签和日期、多标签带日期范围等运行查询时，这些查询将会很快。

我们来看一下如下配置的引擎：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下，对于查询：

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

ClickHouse将使用主键索引来修剪不合适的数据，并使用按月分区键修剪不合适日期范围的分区。

上述查询表明，即使对于复杂表达式，也会使用索引。从表中读取的数据组织方式保证了使用索引不会比完全扫描更慢。

在下面的示例中，索引无法使用。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查ClickHouse在运行查询时是否可以使用索引，请使用设置[force_index_by_date](/operations/settings/settings.md/#force_index_by_date)和[force_primary_key](/operations/settings/settings#force_primary_key)。

按月分区的键允许只读取包含正确范围内日期的数据块。在这种情况下，数据块可能包含多天的数据（最多一个月）。在一个块内，数据按主键排序，主键可能不包含第一列的日期。因此，使用只有日期条件的查询，而未指定主键前缀，将导致比单个日期读取更多的数据。
### 针对部分单调主键使用索引 {#use-of-index-for-partially-monotonic-primary-keys}

以月份的日期为例。它们在一个月内形成一个[单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在更长时期内不是单调的。这是一个部分单调序列。如果用户创建一个带有部分单调主键的表，ClickHouse会像往常一样创建一个稀疏索引。当用户从这种类型的表中选择数据时，ClickHouse会分析查询条件。如果用户想要获取两个索引标记之间的数据，并且这两个标记都位于同一月内，ClickHouse可以在这种情况下使用索引，因为它可以计算查询参数和索引标记之间的距离。

如果查询参数范围内的主键值不表示单调序列，ClickHouse则无法使用索引。在这种情况下，ClickHouse使用完全扫描的方法。

ClickHouse使用此逻辑不仅适用于月份的日期序列，也适用于任何表示部分单调序列的主键。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明在`CREATE`查询的列部分中。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于`*MergeTree`家族的表，可以指定数据跳过索引。

这些索引聚合有关指定表达式在由`granularity_value`粒度（在表引擎中通过`index_granularity`设置指定粒度大小）构成的块上的一些信息。然后，这些聚合在`SELECT`查询中用于减少从磁盘读取的数据量，通过跳过`where`查询无法满足的大块数据。

`GRANULARITY`子句可以省略，`granularity_value`的默认值为1。

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

示例中的索引可以被ClickHouse用来减少在以下查询中从磁盘读取的数据量：

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

数据跳过索引还可以在复合列上创建：

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

存储指定表达式的极值（如果表达式为`tuple`，则存储每个元素的极值），用于跳过部分数据块，如主键。

语法：`minmax`
#### Set {#set}

存储指定表达式的唯一值（不超过`max_rows`行，`max_rows=0`表示"无限制"）。使用这些值检查数据块的`WHERE`表达式是否不可满足。

语法：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

为指定列存储[布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。可选的`false_positive`参数可以在0到1之间指定从过滤器接收到虚假阳性的响应的概率。默认值：0.025。支持的数据类型：`Int*`、`UInt*`、`Float*`、`Enum`、`Date`、`DateTime`、`String`、`FixedString`、`Array`、`LowCardinality`、`Nullable`、`UUID`和`Map`。对于`Map`数据类型，客户端可以使用[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)或[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)函数指定索引应为键还是值创建。

语法：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

存储一个包含数据块中所有n-gram的[布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。仅适用于以下数据类型：[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)和[Map](/sql-reference/data-types/map.md)。可以用于优化`EQUALS`、`LIKE`和`IN`表达式。

语法：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — n-gram大小,
- `size_of_bloom_filter_in_bytes` — 布隆过滤器大小（以字节为单位）（您可以在这里使用较大的值，例如256或512，因为它可以很好压缩）。
- `number_of_hash_functions` — 用于布隆过滤器的哈希函数数量。
- `random_seed` — 布隆过滤器哈希函数的种子。

用户可以创建[UDF](/sql-reference/statements/create/function.md)来估算`ngrambf_v1`的参数设置。查询语句如下：

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
例如，如果粒度中有4300个n-grams，并且我们希望虚假阳性小于0.0001。可以通过执行以下查询来估算其他参数：


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
这些函数的内容请参见[此处](https://hur.st/bloomfilter)。
#### Token Bloom Filter {#token-bloom-filter}

与`ngrambf_v1`相同，但存储的是令牌而不是n-gram。令牌是由非字母数字字符分隔的序列。

语法：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 特殊用途 {#special-purpose}

- 支持近似最近邻搜索的实验性索引。有关详细信息，请参见[此处](annindexes.md)。
- 支持全文搜索的实验性全文索引。有关详细信息，请参见[此处](invertedindexes.md)。
### 函数支持 {#functions-support}

`WHERE`子句中的条件包含对操作列的函数调用。如果列是索引的一部分，ClickHouse在执行这些函数时会尝试使用该索引。ClickHouse支持不同子集的函数以供使用索引。

类型为`set`的索引可以被所有函数利用。其他索引类型的支持如下：

| 函数（操作符） / 索引                                                                                       | 主键 | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|-------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                             | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                 | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)              | ✗           | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                        | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                     | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                 | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                           | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                     | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗           | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                                   | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |

具有小于n-gram大小的常量参数的函数不能被`ngrambf_v1`用于查询优化。

(*) 对于`hasTokenCaseInsensitive`和`hasTokenCaseInsensitiveOrNull`的有效性，`tokenbf_v1`索引必须在小写数据上创建，例如`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
布隆过滤器可能会产生虚假匹配，因此`ngrambf_v1`、`tokenbf_v1`和`bloom_filter`索引不能用于优化预期返回为假值的查询。

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
投影就像[物化视图](/sql-reference/statements/create/view)，但在部分级别进行定义。它在查询中提供一致性保证和自动使用。

:::note
在实现投影时，您还应考虑[force_optimize_projection](/operations/settings/settings#force_optimize_projection)设置。
:::

在带有[FINAL](/sql-reference/statements/select/from#final-modifier)修饰符的`SELECT`语句中不支持投影。
### 投影查询 {#projection-query}
投影查询定义了一个投影。它隐式从父表选择数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

可以通过[ALTER](/sql-reference/statements/alter/projection.md)语句修改或删除投影。
### 投影存储 {#projection-storage}
投影存储在部分目录内。它类似于索引，但包含一个子目录，用于存储匿名`MergeTree`表的部分。该表由投影的定义查询引入。如果存在`GROUP BY`子句，则底层存储引擎变为[AggregatingMergeTree](aggregatingmergetree.md)，所有聚合函数转换为`AggregateFunction`。如果存在`ORDER BY`子句，则`MergeTree`表将其用作主键表达式。在合并过程中，投影部分通过其存储的合并例程进行合并。父表的部分的校验和与投影的部分组合在一起。其他维护作业与跳过索引相似。
### 查询分析 {#projection-query-analysis}
1. 检查投影是否可以用于回答给定的查询，即它生成与查询基表相同的答案。
2. 选择最佳可匹配项，选择最少的粒度进行读取。
3. 使用投影的查询管道将与使用原始部分的管道不同。如果某些部分中不存在投影，我们可以添加管道在运行时“投影”。
## 并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当表被同时读取和更新时，数据从查询时的当前部分集读取。没有长时间的锁定。插入不会干扰读取操作。

从表中读取的数据会自动并行化。
## 列和表的TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

可以为整个表和每个单独列设置`TTL`子句。表级`TTL`还可以指定在磁盘和卷之间自动移动数据的逻辑，或重新压缩所有数据已过期的部分。

表达式必须计算为[Date](/sql-reference/data-types/date.md)或[DateTime](/sql-reference/data-types/datetime.md)数据类型。

**语法**

为列设置存活时间：

```sql
TTL time_column
TTL time_column + interval
```

要定义`interval`，使用[时间间隔](/sql-reference/operators#operators-for-working-with-dates-and-times)操作符，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### Column TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse会用列数据类型的默认值替换它们。如果数据部分中的所有列值都已过期，ClickHouse会从文件系统中的数据部分删除该列。

`TTL` 子句不能用于主键列。

**示例**
#### 创建一个带有 `TTL` 的表： {#creating-a-table-with-ttl}

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

表可以有一个用于删除过期行的表达式，以及多个用于在[磁盘或卷之间](#table_engine-mergetree-multiple-volumes)自动移动分片的表达式。当表中的行过期时，ClickHouse会删除所有对应的行。在移动或重新压缩分片时，分片的所有行必须满足 `TTL` 表达式标准。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可以跟随每个 TTL 表达式。它影响在表达式满足时 (达到当前时间) 要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 用 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将分片移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将分片移动到磁盘 `bbb`；
- `GROUP BY` - 聚合过期行。

`DELETE` 操作可以与 `WHERE` 子句结合使用，以根据过滤条件仅删除部分过期行：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果某列不是 `GROUP BY` 表达式的一部分，并且在 `SET` 子句中没有显式设定，则结果行将包含来自分组行的随机值（就像对其应用了聚合函数 `any`）。

**示例**
#### 创建一个带有 `TTL` 的表： {#creating-a-table-with-ttl-1}

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

创建一个表，其中行在一个月后过期。过期的行的日期为星期一时将被删除：

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
#### 创建一个表，过期行被重新压缩： {#creating-a-table-where-expired-rows-are-recompressed}

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

创建一个表，其中过期行被聚合。结果行 `x` 包含分组行中的最大值，`y` 为最小值，`d` 为随机值。

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

过期的 `TTL` 数据将在 ClickHouse 合并数据部分时被删除。

当 ClickHouse 检测到数据已过期时，它会执行一次非计划的合并。要控制这种合并的频率，可以设定 `merge_with_ttl_timeout`。如果该值过低，将会执行许多非计划的合并，这可能会消耗大量资源。

如果你在合并之间执行 `SELECT` 查询，你可能会获取到过期的数据。为避免这种情况，请在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置
## 磁盘类型 {#disk-types}

除了本地块设备外，ClickHouse 还支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读存取网页](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中的不可变非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)
## 使用多个块设备进行数据存储 {#table_engine-mergetree-multiple-volumes}
### 引言 {#introduction}

`MergeTree` 系列表引擎可以在多个块设备上存储数据。例如，当特定表的数据隐式分为“热”和“冷”时，这非常有用。最近的数据经常被请求，但只需要少量空间。相反，长尾的历史数据很少被请求。如果有多个磁盘可用，“热”数据可以位于快速磁盘（例如，NVMe SSD 或内存）上，而“冷”数据则位于相对慢的磁盘（例如，HDD）上。

数据部分是 `MergeTree` 引擎表的最小可移动单位。属于一个部分的数据存储在一个磁盘上。数据部分可以在后台移动（根据用户设置）以及通过 [ALTER](/sql-reference/statements/alter/partition) 查询移动。
### 术语 {#terms}

- 磁盘 — 挂载到文件系统的块设备。
- 默认磁盘 — 存储在 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定的路径的磁盘。
- 卷 — 一组相等的磁盘的有序集合（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 — 卷集合和在它们之间移动数据的规则。

所描述的实体的名称可以在系统表 [system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks) 中找到。要对表应用配置的存储策略之一，请使用 `MergeTree` 系列表的 `storage_policy` 设置。
### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储政策应在 `<storage_configuration>` 标签内声明，或在 `config.d` 目录中的文件中。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分中声明。这对于临时分析非常有用，可以临时附加一个例如托管在 URL 下的磁盘。有关更多详细信息，请参见 [动态存储](/operations/storing-data#dynamic-configuration)。
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
- `keep_free_space_bytes` — 要保留的可用磁盘空间量。

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
- `disk` — 卷内的一个磁盘。
- `max_data_part_size_bytes` — 可以存储在任何一个卷的磁盘上的部分的最大大小。如果合并部分的大小估计大于 `max_data_part_size_bytes`，则该部分将写入下一个卷。基本上，此功能允许将新/小部分保留在一个热（SSD）卷上，并在它们达到大尺寸时将其移动到一个冷（HDD）卷。如果策略中只有一个卷，则不要使用此设置。
- `move_factor` — 当可用空间低于该因子时，数据会自动开始在下一个卷上移动（默认值为 0.1）。ClickHouse 会按从大到小（降序）对现有部分的大小进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则将移动所有部分。
- `perform_ttl_move_on_insert` — 禁用在数据部分 INSERT 时的 TTL 移动。默认情况下（如果启用），如果我们插入一个已经因 TTL 移动规则而过期的数据部分，它会立即转到移动规则声明的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这会显著降低插入速度。如果禁用，则过期的数据部分将写入默认卷，然后立即移动到 TTL 卷。
- `load_balancing` - 磁盘平衡的策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置更新所有磁盘上可用空间的超时（毫秒），(`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。请注意，如果磁盘只能被 ClickHouse 使用，且不受在线文件系统调整大小/收缩影响，则可以使用 `-1`，在所有其他情况下不建议使用，因为最终会导致空间分配不正确。
- `prefer_not_to_merge` — 不应该使用此设置。禁用此卷的数据部分合并（这会有害并导致性能下降）。启用此设置时（请不要这样做），该卷上的数据合并是不允许的（这不好）。这允许（但你不需要这样做）控制 ClickHouse 如何处理慢速磁盘（但 ClickHouse 知道得更好，所以请不要使用此设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。较低的值意味着较高的优先级。参数值应为自然数，并且总体上覆盖从 1 到 N 的范围（最低优先级分配）而不跳过任何数字。
  * 如果 _所有_ 卷都有标记，则按给定顺序优先。
  * 如果只有 _某些_ 卷被标记，则未标记的卷具有最低优先级，并按它们在配置中定义的顺序优先。
  * 如果 _没有_ 卷被标记，则其优先级根据它们在配置中声明的顺序设置。
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

在给定示例中，`hdd_in_order` 策略实现了 [轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方法。因此，此策略只定义一个卷 (`single`)，数据部分按循环顺序存储在其所有磁盘上。如果系统中安装了几个相似的磁盘但没有配置 RAID，则该策略将非常有用。请记住，每个单独的磁盘驱动器并不可靠，您可能希望用 3 及以上的复制因子来补偿。

如果系统中有不同类型的磁盘可用，则可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 包含一个 SSD 磁盘（`fast_ssd`），并且可以存储在该卷上的部分的最大大小为 1GB。所有大小大于 1GB 的部分将直接存储在 `cold` 卷上，该卷包含 HDD 磁盘 `disk1`。此外，一旦磁盘 `fast_ssd` 的使用率超过 80%，数据将通过后台进程传输到 `disk1`。

在存储策略中卷的枚举顺序在列出至少一个没有显式 `volume_priority` 参数的卷时非常重要。一旦一个卷满载，数据就会移动到下一个卷。磁盘的枚举顺序同样重要，因为数据会轮流存储在其上。

创建表时，可以将配置的存储策略之一应用于该表：

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

`default` 存储策略意味着只使用一个卷，该卷仅包含在 `<path>` 中给定的一个磁盘。
您可以通过 [ALTER TABLE ... MODIFY SETTING] 查询在创建表后更改存储策略，新策略应包括所有旧磁盘和具有相同名称的卷。

执行数据部分的后台移动的线程数量可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。
### 详细信息 {#details}

在 `MergeTree` 表的情况下，数据以不同的方式写入磁盘：

- 作为插入的结果（`INSERT` 查询）。
- 在后台合并和 [变更](https://clickhouse.com/docs/en/sql-reference/statements/alter#mutations) 期间。
- 从另一副本下载时。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在这些情况下（除变更和分区冻结外），部分是在卷和磁盘上根据给定的存储策略存储的：

1. 选择第一个具有足够磁盘空间来存储部分（`unreserved_space > current_part_size`）和允许存储给定大小部分的卷 (`max_data_part_size_bytes > current_part_size`)。
2. 在该卷内，选择下一个磁盘，该磁盘是在存储先前数据块时使用的磁盘，并且可用空间大于部分大小（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在内部，变更和分区冻结使用 [硬链接](https://en.wikipedia.org/wiki/Hard_link)。不支持在不同磁盘之间的硬链接，因此在这种情况下，结果部分存储在与初始部分相同的磁盘上。

在后台，部分根据可用空间 (`move_factor` 参数) 在卷之间移动，依据是在配置文件中声明的卷的顺序。
数据不会从最后一个卷转移到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log) （字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md) （字段 `path` 和 `disk`）来监控后台移动。此外，可以在服务器日志中找到详细信息。

用户可以使用查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将某个部分或分区从一个卷移动到另一个卷，所有后台操作的限制都将被考虑。查询会独立发起一个移动，而不会等待后台操作完成。如果可用的可用空间不足或不满足任何必要条件，用户将收到错误消息。

移动数据不会干扰数据复制。因此，对于同一张表的不同副本可以指定不同的存储策略。

在后台合并和变更完成后，旧部分只有在一定时间后 (`old_parts_lifetime`) 被删除。
在此期间，它们不会移动到其他卷或磁盘。因此，在这些部分最终被删除之前，它们仍会被考虑在占用的磁盘空间评估中。

用户可以使用 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置将新的大部分均匀分配到 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘上。
## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 系列表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs` 的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS` 中。有关更多详细信息，请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

使用类型为 `s3` 的磁盘将 S3 作为外部存储的示例。

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
ClickHouse 版本 22.3 至 22.7 使用不同的缓存配置，如果您使用其中一个版本，请参见 [使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::
## 虚拟列 {#virtual-columns}

- `_part` — 部分的名称。
- `_part_index` — 查询结果中部分的顺序索引。
- `_part_starting_offset` — 查询结果中部分的累计起始行。
- `_part_offset` — 部分中的行号。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 唯一分部分标识符（如果启用了 MergeTree 设置 `assign_part_uuids`）。
- `_part_data_version` — 部分的数据版本（最小区块号或变更版本）。
- `_partition_value` — `partition by` 表达式的值（元组）。
- `_sample_factor` — 采样因子（来自查询）。
- `_block_number` — 行的块号，当 `allow_experimental_block_number_column` 设置为 true 时，它在合并时被持久化。
## 列统计 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

统计声明位于 `*MergeTree*` 系列表的 `CREATE` 查询的列部分中，当我们启用 `set allow_experimental_statistics = 1` 时。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

我们还可以通过 `ALTER` 语句操作统计信息。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

这些轻量级统计信息聚合了有关列中值分布的信息。统计信息存储在每个部分中，并在每次插入时更新。
只有在我们启用 `set allow_statistics_optimize = 1` 时，它们才可以用于 prewhere 优化。
### 可用的列统计类型 {#available-types-of-column-statistics}

- `MinMax`

    列的最小值和最大值，使得能够估计数值列上范围过滤器的选择性。

    语法：`minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 概要，可以计算数值列的近似百分位数（例如第 90 个百分位数）。

    语法：`tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 概要，提供有关列中包含多少不同值的估计。

    语法：`uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 概要，提供对列中每个值频率的近似计数。

    语法：`countmin`
### 支持的数据类型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
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
## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别被覆盖：

- `max_compress_block_size` — 在写入表之前，未压缩数据块的最大大小。
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

列级设置可以通过 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 进行修改或移除，例如：

- 从列声明中移除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，同时在表的 CREATE 查询的列表达式中移除设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
