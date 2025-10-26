---
'description': '`MergeTree`家族的表引擎设计用于高数据摄取速率和海量数据量。'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` 引擎及其他 `MergeTree` 系列引擎（例如 `ReplacingMergeTree`, `AggregatingMergeTree`）是 ClickHouse 中使用最广泛且最稳健的表引擎。

`MergeTree` 系列表引擎旨在支持高数据摄取速率和巨大的数据量。插入操作创建表的部分数据，这些部分数据由后台进程与其他表部分进行合并。

`MergeTree` 系列表引擎的主要特性：

- 表的主键决定每个表部分的排序顺序（聚集索引）。主键也并不引用单独的行，而是称为颗粒的 8192 行的块。这使得巨大数据集的主键足够小，可以保持在主存储器中，同时仍能提供对磁盘数据的快速访问。

- 表可以使用任意分区表达式进行分区。当查询允许时，分区裁剪确保分区被省略。

- 数据可以跨多个集群节点进行复制，以实现高可用性、故障转移和零停机时间升级。请参阅 [数据复制](/engines/table-engines/mergetree-family/replication.md)。

- `MergeTree` 表引擎支持各种统计种类和采样方法，以帮助查询优化。

:::note
尽管名字相似， [Merge](/engines/table-engines/special/merge) 引擎与 `*MergeTree` 引擎是不同的。
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

有关参数的详细描述，请参阅 [CREATE TABLE](/sql-reference/statements/create/table.md) 语句。
### 查询子句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 引擎的名称和参数。`ENGINE = MergeTree()`。`MergeTree` 引擎没有参数。
#### ORDER BY {#order_by}

`ORDER BY` — 排序键。

一组列名或任意表达式。示例：`ORDER BY (CounterID + 1, EventDate)`。

如果未定义主键（即未指定 `PRIMARY KEY`），ClickHouse 将使用排序键作为主键。

如果不需要排序，可以使用语法 `ORDER BY tuple()`。另外，如果启用了 `create_table_empty_primary_key_by_default` 设置，则会隐式将 `ORDER BY tuple()` 添加到 `CREATE TABLE` 语句中。请参阅 [选择主键](#selecting-a-primary-key)。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。可选。大多数情况下，不需要分区键，如果需要分区，通常不需要更细的分区键。分区并不会加速查询（与 ORDER BY 表达式相反）。你绝对不应该使用过于细粒度的分区。请勿按客户标识符或名称对数据进行分区（而是，将客户标识符或名称作为 `ORDER BY` 表达式的第一列）。

按月份分区，请使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一个类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此处的分区名称采用 `"YYYYMM"` 格式。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 如果它与 [排序键](#choosing-a-primary-key-that-differs-from-the-sorting-key) 不同，则为主键。可选。

指定排序键（使用 `ORDER BY` 子句）隐式指定了一个主键。一般情况下，不需要在排序键之外额外指定主键。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 采样表达式。可选。

如果指定，它必须包含在主键中。采样表达式必须返回一个无符号整数。

示例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 一系列规则，指定行的存储时长以及自动部分移动的逻辑 [在磁盘和卷之间](#table_engine-mergetree-multiple-volumes)。可选。

表达式必须返回一个 `Date` 或 `DateTime`，例如 `TTL date + INTERVAL 1 DAY`。

规则的类型 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` 指定在表达式满足（达到当前时间）时应对部分采取的操作：移除过期行、将部分（如果表达式对部分中的所有行均满足）移动到指定磁盘（`TO DISK 'xxx'`）或卷（`TO VOLUME 'xxx'`），或对过期行的值进行聚合。默认规则类型是删除（`DELETE`）。可以指定多个规则的列表，但 `DELETE` 规则不得超过一个。

有关更多详细信息，请参阅 [列和表的 TTL](#table_engine-mergetree-ttl)。
#### SETTINGS {#settings}

请参阅 [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)。

**示例：部门设置**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

在该示例中，我们按月进行分区。

我们还设置了一条表达式，作为用户 ID 的哈希采样。这使你能够伪随机化表中的数据，对于每个 `CounterID` 和 `EventDate`。如果在选择数据时定义了 [SAMPLE](/sql-reference/statements/select/sample) 子句，ClickHouse 将返回一组均匀的伪随机数据样本。

`index_granularity` 设置可以省略，因为 8192 是默认值。

<details markdown="1">

<summary>创建表的已弃用方法</summary>

:::note
请勿在新项目中使用此方法。如果可能，将旧项目迁移至上述方法。
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

- `date-column` — 一个类型为 [Date](/sql-reference/data-types/date.md) 的列的名称。ClickHouse 会根据此列自动按月创建分区。分区名称采用 `"YYYYMM"` 格式。
- `sampling_expression` — 采样表达式。
- `(primary, key)` — 主键。类型：[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 索引的粒度。索引标记之间的数据行数。8192 的值适合大多数任务。

**示例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 引擎与上述示例中主要引擎配置方法相同配置。
</details>
## 数据存储 {#mergetree-data-storage}

一张表由按主键排序的数据部分组成。

当数据插入表中时，创建单独的数据部分，每个部分根据主键进行字典序排序。例如，如果主键为 `(CounterID, Date)`，则部分中的数据按 `CounterID` 排序，每个 `CounterID` 内部按 `Date` 排序。

属于不同分区的数据被分隔到不同的部分。ClickHouse 在后台合并数据部分以实现更高效的存储。属于不同分区的部分不会被合并。合并机制不保证所有具有相同主键的行都在相同数据部分中。

数据部分可以以 `Wide` 或 `Compact` 格式存储。在 `Wide` 格式中，每列分别存储在文件系统中的单独文件中，而在 `Compact` 格式中，所有列存储在一个文件中。`Compact` 格式可用于提高小而频繁的插入的性能。

数据存储格式由表引擎的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。如果数据部分中的字节数或行数小于相应设置的值，则部分以 `Compact` 格式存储。否则，它以 `Wide` 格式存储。如果没有设置这些选项，则数据部分以 `Wide` 格式存储。

每个数据部分在逻辑上被划分为颗粒。颗粒是 ClickHouse 在选择数据时读取的最小不可分割的数据集。ClickHouse 不会分割行或值，因此每个颗粒始终包含整数数量的行。颗粒的第一行以行的主键值标记。对于每个数据部分，ClickHouse 创建一个索引文件来存储标记。对于每列，无论它是否在主键中，ClickHouse 也存储相同的标记。这些标记让你能够直接在列文件中找到数据。

颗粒的大小受表引擎的 `index_granularity` 和 `index_granularity_bytes` 设置限制。颗粒中的行数在 `[1, index_granularity]` 范围内，具体取决于行的大小。如果单行的大小大于设置值，则颗粒的大小可以超过 `index_granularity_bytes`。在这种情况下，颗粒的大小等于行的大小。
## 查询中的主键和索引 {#primary-keys-and-indexes-in-queries}

以 `(CounterID, Date)` 主键为例。在此情况下，排序和索引可以如下所示：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

如果数据查询指定：

- `CounterID in ('a', 'h')`，服务器会读取标记范围 `[0, 3)` 和 `[6, 8)` 的数据。
- `CounterID IN ('a', 'h') AND Date = 3`，服务器会读取标记范围 `[1, 3)` 和 `[7, 8)` 的数据。
- `Date = 3`，服务器会读取标记范围 `[1, 10]` 的数据。

以上示例表明，使用索引始终比全表扫描更有效。

稀疏索引允许读取额外数据。在读取主键的单个范围时，每个数据块中最多可以读取 `index_granularity * 2` 个额外行。

稀疏索引允许你处理非常大量的表行，因为在大多数情况下，此类索引能适应计算机的 RAM。

ClickHouse 不要求主键是唯一的。你可以插入具有相同主键的多行。

你可以在 `PRIMARY KEY` 和 `ORDER BY` 子句中使用 `Nullable` 类型的表达式，但强烈不建议这样做。要启用此功能，请打开 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 设置。`ORDER BY` 子句中的 [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原则适用于 `NULL` 值。
### 选择主键 {#selecting-a-primary-key}

主键中列的数量没有明确限制。根据数据结构，你可以在主键中包含更多或更少的列。这可能：

- 提高索引的性能。

    如果主键是 `(a, b)`，则当满足以下条件时，添加另一列 `c` 将提高性能：

  - 有针对列 `c` 的查询条件。
  - 长数据范围（比 `index_granularity` 长几倍）具有相同的 `(a, b)` 值是常见的。换句话说，当添加另一列可以跳过相当长的数据范围时。

- 改善数据压缩。

    ClickHouse 根据主键对数据进行排序，因此一致性越高，压缩效果越好。

- 在使用 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 和 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 引擎时提供额外的逻辑。

    在这种情况下，指定与主键不同的 *排序键* 是有意义的。

主键过长会对插入性能和内存消耗产生负面影响，但主键中的额外列不会影响 ClickHouse 在 `SELECT` 查询中的性能。

你可以使用 `ORDER BY tuple()` 语法创建没有主键的表。在这种情况下，ClickHouse 按插入顺序存储数据。如果希望在通过 `INSERT ... SELECT` 查询插入数据时保持数据顺序，请设置 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)。

要以初始顺序选择数据，请使用 [单线程](/operations/settings/settings.md/#max_threads) 的 `SELECT` 查询。
### 选择与排序键不同的主键 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

可以指定与排序键（用于对数据部分中的行进行排序的表达式）不同的主键（为每个标记在索引文件中写入的值的表达式）。在这种情况下，主键表达式的元组必须是排序键表达式元组的前缀。

此功能在使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 和 
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎时非常有用。在使用这些引擎的常见情况下，表具有两种类型的列：*维度* 和 *度量*。典型查询聚合度量列的值，使用任意 `GROUP BY` 及按维度进行过滤。由于 SummingMergeTree 和 AggregatingMergeTree 聚合具有相同排序键值的行，因此将所有维度添加到其中是很自然的。结果，键表达式由长列列表组成，该列表必须频繁地使用新添加的维度进行更新。

在这种情况下，将主键中仅保留少量列以提供高效的范围扫描并将其余维度列添加到排序键元组是有意义的。

对排序键的 [ALTER](/sql-reference/statements/alter/index.md) 是轻量级的，因为当新列同时添加到表和排序键时，现有数据部分不需要改变。由于旧排序键是新排序键的前缀，并且新添加列中没有数据，因此在表修改时，数据根据旧的和新的排序键进行排序。
### 查询中索引和分区的使用 {#use-of-indexes-and-partitions-in-queries}

对于 `SELECT` 查询，ClickHouse 分析是否可以使用索引。如果 `WHERE/PREWHERE` 子句具有用于表示相等或不等比较操作的表达式（作为连接元素之一，或全部）或在主键或分区键中的列或表达式上与固定前缀的 `IN` 或 `LIKE` 关系，或者这些表达式的逻辑关系，索引可以被使用。

因此，可以在主键的一个或多个范围上快速运行查询。在这个例子中，对于特定的追踪标签、特定标签和日期范围、特定标签和日期、多个标签和日期范围等，运行查询将是快速的。

让我们看一下配置如下的引擎：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

在这种情况下，查询中：

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

ClickHouse 将使用主键索引来修剪不当数据，并使用按月的分区键来修剪不正确日期范围的分区。

上面的查询表明，索引甚至在复杂表达式中也在使用。从表中读取数据的组织方式确保使用索引的速度不会比全表扫描更慢。

在以下示例中，无法使用索引。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

要检查 ClickHouse 是否可以在查询执行时使用索引，请使用设置 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 和 [force_primary_key](/operations/settings/settings#force_primary_key)。

按月分区的关键允许仅读取包含来自正确范围的日期的数据块。在这种情况下，数据块可能包含多个日期的数据（最多一个完整的月份）。在块内，数据按主键排序，而主键可能并不是第一列。因此，使用仅具有不指定主键前缀的日期条件的查询将导致读取的数据量多于单个日期。
### 对于部分单调主键的索引使用 {#use-of-index-for-partially-monotonic-primary-keys}

以月份中的天数为例。它们形成了一个 [单调序列](https://en.wikipedia.org/wiki/Monotonic_function)，但在更长的 períodos 中则不是单调的。这是一个部分单调序列。如果用户使用部分单调主键创建表，ClickHouse 将照常创建稀疏索引。当用户从此类表中选择数据时，ClickHouse 分析查询条件。如果用户希望获取索引的两个标记之间的数据并且这两个标记都在一个月之内，则 ClickHouse 可以在这种情况下使用索引，因为它可以计算查询参数与索引标记之间的距离。

如果查询参数范围内的主键值并不构成单调序列， ClickHouse 将无法使用索引。在这种情况下，ClickHouse 使用完全扫描方法。

ClickHouse 不仅对月份序列使用该逻辑，还对任何表示部分单调序列的主键使用该逻辑。
### 数据跳过索引 {#table_engine-mergetree-data_skipping-indexes}

索引声明在 `CREATE` 查询的列部分中。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

对于 `*MergeTree` 系列的表，可以指定数据跳过索引。

这些索引在出现在由 `granularity_value` 颗粒（颗粒大小由表引擎中的 `index_granularity` 设置指定）组成的块上的指定表达式中聚合一些信息。然后，这些聚合会在 `SELECT` 查询中用于减少从磁盘读取的数据量，通过跳过无法满足 `where` 查询的大块数据。

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

示例中的索引可以被 ClickHouse 用于减少在以下查询中从磁盘读取的数据量：

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
### 跳过索引类型 {#skip-index-types}

`MergeTree` 表引擎支持以下类型的跳过索引。
有关如何使用跳过索引进行性能优化的更多信息，请参见 ["理解 ClickHouse 数据跳过索引"](/optimize/skipping-indexes)。

- [`MinMax`](#minmax) 索引
- [`Set`](#set) 索引
- [`bloom_filter`](#bloom-filter) 索引
- [`ngrambf_v1`](#n-gram-bloom-filter) 索引
- [`tokenbf_v1`](#token-bloom-filter) 索引
#### MinMax 跳过索引 {#minmax}

对于每个索引颗粒，存储表达式的最小值和最大值。
（如果表达式为 `tuple` 类型，则为每个元组元素存储最小值和最大值。）

```text title="Syntax"
minmax
```
#### Set {#set}

对于每个索引颗粒，最多存储 `max_rows` 个唯一值的指定表达式。
`max_rows = 0` 表示“存储所有唯一值”。

```text title="Syntax"
set(max_rows)
```
#### Bloom filter {#bloom-filter}

对于每个索引颗粒，为指定列存储一个 [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)。

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` 参数可以取 0 到 1 之间的值（默认值为 `0.025`），并指定生成正值的概率（这会增加读取的数据量）。

支持以下数据类型：
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

:::note Map 数据类型：指定使用键或值创建索引
对于 `Map` 数据类型，客户端可以使用 [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 或 [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 函数指定是否应为键或值创建索引。
:::
#### N-gram bloom filter {#n-gram-bloom-filter}

对于每个索引颗粒，存储指定列的 [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) 的 [n-grams](https://en.wikipedia.org/wiki/N-gram)。

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| 参数                            | 描述          |
|---------------------------------|---------------|
| `n`                             | ngram 大小    |
| `size_of_bloom_filter_in_bytes` | bloom filter 大小（字节）。这里可以使用大值，例如 `256` 或 `512`，因为它可以很好地压缩）。|
|`number_of_hash_functions`       | 在 bloom filter 中使用的哈希函数数量。|
|`random_seed` | bloom filter 哈希函数的种子。|

此索引仅适用于以下数据类型：
- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

要评估 `ngrambf_v1` 的参数，你可以使用以下 [用户定义函数 (UDFs)](/sql-reference/statements/create/function.md)。

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

为了使用这些函数，你需要指定至少两个参数：
- `total_number_of_all_grams`
- `probability_of_false_positives`

例如，颗粒中有 `4300` 个 ngrams，你希望误报少于 `0.0001`。
在执行以下查询时，可以估算其他参数：

```sql
--- estimate number of bits in the filter
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- estimate number of hash functions
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

当然，你也可以使用这些函数评估其他条件的参数。
上述函数参考了 [这里](https://hur.st/bloomfilter) 的 bloom filter 计算器。
#### Token bloom filter {#token-bloom-filter}

token bloom filter 与 `ngrambf_v1` 相同，但存储的是 tokens（由非字母数字字符分隔的序列），而不是 ngrams。

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```
#### 向量相似性 {#vector-similarity}

支持近似最近邻搜索，详细信息见 [这里](annindexes.md)。
### 文本（实验性） {#text}

支持全文搜索，详细信息见 [这里](invertedindexes.md)。
### 函数支持 {#functions-support}

在 `WHERE` 子句中的条件包含对列进行操作的函数调用。如果列是索引的一部分，ClickHouse 在执行函数时会尝试使用该索引。ClickHouse 支持不同子集的函数来使用索引。

`set` 类型的索引可以被所有函数利用。其他索引类型的支持如下：

| 函数（操作符） / 索引                                                                                                           | 主键         | minmax  | ngrambf_v1 | tokenbf_v1 | bloom_filter | 文本  |
|-------------------------------------------------------------------------------------------------------------------------------|-------------|---------|------------|------------|--------------|------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                     | ✔           | ✔       | ✔          | ✔          | ✔            | ✔    |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                         | ✔           | ✔       | ✔          | ✔          | ✔            | ✔    |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                              | ✔           | ✔       | ✔          | ✔          | ✗            | ✔    |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                                        | ✔           | ✔       | ✔          | ✔          | ✗            | ✔    |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                            | ✗           | ✗       | ✔          | ✔          | ✗            | ✔    |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                                         | ✔           | ✔       | ✔          | ✔          | ✗            | ✔    |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                                             | ✗           | ✗       | ✔          | ✔          | ✗            | ✔    |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                                          | ✗           | ✗       | ✔          | ✗          | ✗            | ✗    |
| [in](/sql-reference/functions/in-functions)                                                                                    | ✔           | ✔       | ✔          | ✔          | ✔            | ✔    |
| [notIn](/sql-reference/functions/in-functions)                                                                                 | ✔           | ✔       | ✔          | ✔          | ✔            | ✔    |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                           | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                     | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                          | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                                    | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                       | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                                 | ✔           | ✔       | ✗          | ✗          | ✗            | ✗    |
| [has](/sql-reference/functions/array-functions#has)                                                                            | ✗           | ✗       | ✔          | ✔          | ✔            | ✔    |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                      | ✗           | ✗       | ✔          | ✔          | ✔            | ✗    |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                      | ✗           | ✗       | ✔          | ✔          | ✔            | ✗    |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken)                                                      | ✗           | ✗       | ✗          | ✔          | ✗            | ✔    |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull)                                          | ✗           | ✗       | ✗          | ✔          | ✗            | ✔    |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitive)                  | ✗           | ✗       | ✗          | ✔          | ✗            | ✗    |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitiveornull)      | ✗           | ✗       | ✗          | ✔          | ✗            | ✗    |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens)                                              | ✗           | ✗       | ✗          | ✗          | ✗            | ✔    |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens)                                              | ✗           | ✗       | ✗          | ✗          | ✗            | ✔    |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                        | ✗           | ✗       | ✗          | ✗          | ✗            | ✔    |

参数少于 ngram 大小的常量参数的函数不能通过 `ngrambf_v1` 来优化查询。

(*) 为了使 `hasTokenCaseInsensitive` 和 `hasTokenCaseInsensitiveOrNull` 生效，必须在小写数据上创建 `tokenbf_v1` 索引，例如 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`。

:::note
布隆过滤器可能会有假阳性匹配，因此 `ngrambf_v1`、`tokenbf_v1` 和 `bloom_filter` 索引不能用于优化期望结果为假的查询。

例如：

- 可以被优化：
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 不能被优化：
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::
## 投影 {#projections}
投影类似于 [物化视图](/sql-reference/statements/create/view)，但在部分级别进行定义。它提供了一致性保证，并在查询中自动使用。

:::note
在实现投影时，你还应该考虑 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 设置。
:::

在具有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 语句中不支持投影。
### 投影查询 {#projection-query}
投影查询定义了一个投影。它隐式地从父表中选择数据。
**语法**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

投影可以与 [ALTER](/sql-reference/statements/alter/projection.md) 语句一起修改或删除。
### 投影存储 {#projection-storage}
投影存储在部分目录中。它类似于索引，但包含一个子目录来存储匿名 `MergeTree` 表的一部分。该表由投影的定义查询引发。如果有 `GROUP BY` 子句，则底层存储引擎成为 [AggregatingMergeTree](aggregatingmergetree.md)，所有聚合函数转换为 `AggregateFunction`。如果有 `ORDER BY` 子句，`MergeTree` 表使用其作为主键表达式。在合并过程中，投影部分通过其存储的合并例程进行合并。父表部分的校验和与投影的部分相结合。其他维护工作与跳过索引相似。
### 查询分析 {#projection-query-analysis}
1. 检查投影是否可以用来回答给定的查询，即它生成的答案是否与查询基础表相同。
2. 选择最佳的可行匹配，即读取的粒度最少。
3. 使用投影的查询管道将不同于使用原始部分的查询管道。如果某些部分缺少投影，我们可以动态添加管道以“投影”它。

## 并发数据访问 {#concurrent-data-access}

对于并发表访问，我们使用多版本控制。换句话说，当一个表被同时读取和更新时，数据是从查询时当前的一组部分中读取的。没有冗长的锁。插入不会干扰读取操作。

从一个表读取数据会自动并行化。

## 列和表的 TTL {#table_engine-mergetree-ttl}

确定值的生命周期。

`TTL` 子句可以为整个表和每个单独的列设置。表级 `TTL` 还可以指定在磁盘和卷之间自动移动数据的逻辑，或重新压缩所有数据已过期的部分。

表达式必须评估为 [Date](/sql-reference/data-types/date.md)， [Date32](/sql-reference/data-types/date32.md)， [DateTime](/sql-reference/data-types/datetime.md) 或 [DateTime64](/sql-reference/data-types/datetime64.md) 数据类型。

**语法**

为列设置生存时间：

```sql
TTL time_column
TTL time_column + interval
```

要定义 `interval`，使用 [time interval](/sql-reference/operators#operators-for-working-with-dates-and-times) 运算符，例如：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### 列 TTL {#mergetree-column-ttl}

当列中的值过期时，ClickHouse 会用列数据类型的默认值替换它们。如果数据部分中所有列值过期，ClickHouse 会从文件系统中删除此列。

`TTL` 子句不能用于主键列。

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
#### 修改列的 TTL {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### 表 TTL {#mergetree-table-ttl}

表可以有一个表达式用于删除过期的行，以及多个表达式用于在 [磁盘或卷](#table_engine-mergetree-multiple-volumes) 之间自动移动部分。当表中的行过期时，ClickHouse 会删除所有对应的行。对于移动或重新压缩部分，部分的所有行必须满足 `TTL` 表达式的标准。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 规则的类型可以跟随每个 TTL 表达式。它影响一旦表达式被满足（达到当前时间）后要执行的操作：

- `DELETE` - 删除过期行（默认操作）；
- `RECOMPRESS codec_name` - 以 `codec_name` 重新压缩数据部分；
- `TO DISK 'aaa'` - 将部分移动到磁盘 `aaa`；
- `TO VOLUME 'bbb'` - 将部分移动到磁盘 `bbb`；
- `GROUP BY` - 聚合过期行。

可以与 `WHERE` 子句同时使用 `DELETE` 操作以仅删除部分过期行，基于过滤条件：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 表达式必须是表主键的前缀。

如果列不是 `GROUP BY` 表达式的一部分并且没有在 `SET` 子句中显式设置，在结果行中，它将包含分组行中的随机值（如同应用了聚合函数 `any`）。

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

创建一个表，其中的行在一个月后过期。过期行中日期为周一的行被删除：

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

创建一个表，其中过期行被聚合。在结果行中 `x` 包含分组行中的最大值，`y` — 最小值，`d` — 分组行中的任何随机值。

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

当 ClickHouse 合并数据部分时，带有过期 `TTL` 的数据会被移除。

当 ClickHouse 检测到数据过期时，它会进行一次非计划合并。要控制此类合并的频率，可以设置 `merge_with_ttl_timeout`。如果值过低，会执行大量非计划合并，可能消耗大量资源。

如果在合并之间执行 `SELECT` 查询，可能会获取到过期数据。为了避免这种情况，请在 `SELECT` 之前使用 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。

**另请参见**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 设置

## 磁盘类型 {#disk-types}

除了本地块设备，ClickHouse 还支持以下存储类型：
- [`s3` 用于 S3 和 MinIO](#table_engine-mergetree-s3)
- [`gcs` 用于 GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` 用于 Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` 用于 HDFS](/engines/table-engines/integrations/hdfs)
- [`web` 用于只读 Web](/operations/storing-data#web-storage)
- [`cache` 用于本地缓存](/operations/storing-data#using-local-cache)
- [`s3_plain` 用于备份到 S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` 用于 S3 中的不可变、非复制表](/operations/storing-data.md#s3-plain-rewritable-storage)

## 使用多个块设备进行数据存储 {#table_engine-mergetree-multiple-volumes}
### 介绍 {#introduction}

`MergeTree` 系列表引擎可以在多个块设备上存储数据。例如，当某个表的数据隐式分为“热”与“冷”时，这可能很有用。最近的数据经常被请求，但只需要少量空间。相反，胖尾的历史数据很少被请求。如果有多个磁盘可用，“热”数据可以放在快速磁盘上（例如 NVMe SSD 或内存中），而“冷”数据则放在相对较慢的磁盘上（例如 HDD）。

数据部分是 `MergeTree` 引擎表的最小可移动单位。属于一个部分的数据存储在一个磁盘上。数据部分可以根据用户设置在后台在磁盘之间移动，也可以通过 [ALTER](/sql-reference/statements/alter/partition) 查询实现。

### 术语 {#terms}

- 磁盘 — 挂载到文件系统的块设备。
- 默认磁盘 — 存储在 [path](/operations/server-configuration-parameters/settings.md/#path) 服务器设置中指定路径的磁盘。
- 卷 — 一组相等的有序磁盘（类似于 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）。
- 存储策略 — 卷的集合以及在它们之间移动数据的规则。

给定的实体名称可以在系统表中找到，[system.storage_policies](/operations/system-tables/storage_policies) 和 [system.disks](/operations/system-tables/disks)。要对表应用配置的存储策略之一，请使用 `MergeTree` 引擎系列表的 `storage_policy` 设置。

### 配置 {#table_engine-mergetree-multiple-volumes_configure}

磁盘、卷和存储策略应在 `<storage_configuration>` 标签内声明，放在 `config.d` 目录中的文件中。

:::tip
磁盘也可以在查询的 `SETTINGS` 部分声明。这对于临时分析是有用的，可以临时附加一个磁盘，例如，托管在 URL 上。有关更多详细信息，请参见 [动态存储](/operations/storing-data#dynamic-configuration)。
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
- `path` — 服务器存储数据（`data` 和 `shadow` 文件夹）的路径，应以 `/` 结束。
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
- `max_data_part_size_bytes` — 可以存储在任何卷的磁盘上的部分的最大大小。如果已合并部分的大小预计大于 `max_data_part_size_bytes`，则该部分将写入下一个卷。基本上，这个特性允许在热（SSD）卷上保留新的/小的部分，并在它们达到大尺寸时将它们移动到冷（HDD）卷。如果你的策略只有一个卷，请勿使用此设置。
- `move_factor` — 当可用空间低于此因子时，如果有下一卷，数据会自动开始移动（默认值为 0.1）。ClickHouse 按大小从大到小（降序）对现有部分进行排序，并选择总大小足以满足 `move_factor` 条件的部分。如果所有部分的总大小不足，则所有部分将被移动。
- `perform_ttl_move_on_insert` — 禁用在数据部分插入时进行 TTL 移动。默认情况下（如果启用），如果我们插入一个根据 TTL 移动规则已经过期的数据部分，它会立即转移到移动规则中声明的卷/磁盘。如果目标卷/磁盘速度较慢（例如 S3），这可能会显著减慢插入。如果禁用，则已经过期的数据部分将写入默认卷，然后立即移至 TTL 卷。
- `load_balancing` - 磁盘负载均衡策略，`round_robin` 或 `least_used`。
- `least_used_ttl_ms` - 配置更新所有磁盘上可用空间的超时（以毫秒为单位）（`0` - 始终更新，`-1` - 永不更新，默认值为 `60000`）。请注意，如果磁盘仅能被 ClickHouse 使用，并且不受在线文件系统扩展/缩小的影响，则可以使用 `-1`，在所有其他情况下不建议使用，因为最终会导致空间分布不正确。
- `prefer_not_to_merge` — 您应避免使用此设置。禁止在此卷上合并数据部分（这有害且会导致性能下降）。当启用此设置时（不要这样做），不允许在此卷上合并数据（这不好）。允许（但您不需要这样做）控制（如果您希望控制某些东西，您在犯错误）ClickHouse 如何处理慢速磁盘（但 ClickHouse 知道得更好，请不要使用此设置）。
- `volume_priority` — 定义填充卷的优先级（顺序）。值越低优先级越高。参数值应为自然数，并共同涵盖从 1 到 N 的范围（给定最低优先级）且不跳过任何数字。
  * 如果 _所有_ 卷都被标记，则按给定顺序优先排序。
  * 如果仅 _一些_ 卷被标记，则未标记的卷具有最低优先级，并按配置中定义的顺序优先排序。
  * 如果 _没有_ 卷被标记，则其优先级对应于其在配置中声明的顺序。
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

在给定示例中，`hdd_in_order` 策略实现了 [轮询](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方法。因此该策略仅定义一个卷（`single`），数据部分以循环顺序存储在其所有磁盘上。如果系统中挂载有几块类似的磁盘，但没有配置 RAID，则此策略会非常有用。请记住，每个单独的磁盘驱动器并不可靠，您可能希望通过复制因子为 3 或更多进行补偿。

如果系统中有不同类型的磁盘可用，可以使用 `moving_from_ssd_to_hdd` 策略。卷 `hot` 包含一个 SSD 磁盘（`fast_ssd`），可以存储在此卷上的部分的最大大小为 1GB。所有大于 1GB 的部分将直接存储在包含 HDD 磁盘 `disk1` 的 `cold` 卷中。此外，一旦磁盘 `fast_ssd` 被填充超过 80%，数据将通过后台进程转移到 `disk1`。

在存储策略中枚举卷的顺序很重要，特别是当列出的至少一个卷没有显式的 `volume_priority` 参数时。一旦一个卷被填满，数据将转移到下一个卷。磁盘的枚举顺序也很重要，因为数据以轮流存储的方式存储在它们上面。

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

`default` 存储策略意味着仅使用一个卷，该卷仅由 `<path>` 中给定的一个磁盘组成。
您可以通过 [ALTER TABLE ... MODIFY SETTING] 查询在表创建后更改存储策略，新策略应包括所有旧磁盘和具有相同名称的卷。

执行后台数据部分移动的线程数可以通过 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 设置进行更改。

### 详细信息 {#details}

在 `MergeTree` 表的情况下，数据以不同的方式写入磁盘：

- 作为插入（`INSERT` 查询）的结果。
- 在后台合并和 [变更](/sql-reference/statements/alter#mutations) 期间。
- 通过另一个副本下载。
- 作为分区冻结的结果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

在所有这些情况下，除了变更和分区冻结，部分都根据给定的存储策略存储在一个卷和一个磁盘上：

1.  首先选择第一个具有足够磁盘空间可以存储部分（`unreserved_space > current_part_size`）并允许存储给定大小部分（`max_data_part_size_bytes > current_part_size`）的卷。
2.  在这个卷内，选择跟上一个存储的数据块所用磁盘相邻的磁盘，并且该磁盘的可用空间大于部分大小（`unreserved_space - keep_free_space_bytes > current_part_size`）。

在后台，变更和分区冻结利用 [硬链接](https://en.wikipedia.org/wiki/Hard_link)。不支持不同磁盘之间的硬链接，因此在这种情况下，结果部分存储在与初始部分相同的磁盘上。

在后台，部分根据可用空间（`move_factor` 参数）在卷之间移动，按照卷在配置文件中的声明顺序。一些数据永远不会从最后一个卷转移到第一个卷。可以使用系统表 [system.part_log](/operations/system-tables/part_log)（字段 `type = MOVE_PART`）和 [system.parts](/operations/system-tables/parts.md)（字段 `path` 和 `disk`）来监控后台移动。此外，可以在服务器日志中找到详细信息。

用户可以通过查询 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 强制将部分或分区从一个卷移动到另一个卷，同时考虑所有后台操作的限制。查询自行启动移动，不等待后台操作完成。如果可用空间不足或任何要求条件未满足，用户将收到错误消息。

移动数据不会干扰数据复制。因此，对于同一表在不同副本中可以指定不同的存储策略。

在后台合并和变更完成后，旧部分仅在一定时间后被删除（`old_parts_lifetime`）。在此期间，它们不会被移动到其他卷或磁盘。因此，在部分最终被移除之前，它们仍然被计算在占用的磁盘空间评估中。

用户可以通过 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 设置将新的大型部分均衡地分配到 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷的不同磁盘上。

## 使用外部存储进行数据存储 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)系列表引擎可以通过使用类型为 `s3`, `azure_blob_storage`, `hdfs` 的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`。有关更多详细信息，请参见 [配置外部存储选项](/operations/storing-data.md/#configuring-external-storage)。

作为使用类型为 `s3` 的外部存储的示例。

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
ClickHouse 版本 22.3 到 22.7 使用不同的缓存配置， 如果您使用的是这些版本之一，请参见 [使用本地缓存](/operations/storing-data.md/#using-local-cache)。
:::

## 虚拟列 {#virtual-columns}

- `_part` — 一部分的名称。
- `_part_index` — 查询结果中部分的顺序索引。
- `_part_starting_offset` — 查询结果中部分的累计起始行。
- `_part_offset` — 部分中的行号。
- `_part_granule_offset` — 部分中的粒度数量。
- `_partition_id` — 分区的名称。
- `_part_uuid` — 唯一部分标识符（如果启用 MergeTree 设置 `assign_part_uuids`）。
- `_part_data_version` — 部分的数据版本（最小区块号或变更版本）。
- `_partition_value` — `partition by` 表达式的值（元组）。
- `_sample_factor` — 抽样因子（来自查询）。
- `_block_number` — 在插入时分配给行的原始区块编号，在启用 `enable_block_number_column` 时在合并时持久化。
- `_block_offset` — 在插入时分配给行的原始行号，在启用 `enable_block_offset_column` 时在合并时持久化。
- `_disk_name` — 用于存储的磁盘名称。

## 列统计 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

统计声明在 `*MergeTree*` 系列的 `CREATE` 查询的列部分中，当启用 `set allow_experimental_statistics = 1` 时。

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

这些轻量级统计信息聚合了列中值的分布信息。统计信息存储在每个部分中，并在每次插入时更新。
仅当我们启用 `set allow_statistics_optimize = 1` 时，它们才能用于 prewhere 优化。

### 可用的列统计类型 {#available-types-of-column-statistics}

- `MinMax`

    列值的最小和最大，这允许评估数值列范围过滤器的选择性。

    语法：`minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 草图，它允许计算数值列的近似百分位数（例如第 90 个百分位数）。

    语法：`tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 草图，提供对列中不同值数量的估计。

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
|-----------|-----------------|------------------------------|
| CountMin  | ✔               | ✗                            |
| MinMax    | ✗               | ✔                            |
| TDigest   | ✗               | ✔                            |
| Uniq      | ✔               | ✗                            |

## 列级设置 {#column-level-settings}

某些 MergeTree 设置可以在列级别被覆盖：

- `max_compress_block_size` — 在写入表之前未压缩数据块的最大大小。
- `min_compress_block_size` — 写入下一个标记时进行压缩所需的未压缩数据块的最小大小。

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

列级设置可以使用 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) 进行修改或移除，例如：

- 从列声明中移除 `SETTINGS`：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 修改设置：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 重置一个或多个设置，同时移除创建表时列表达式中的设置声明。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
