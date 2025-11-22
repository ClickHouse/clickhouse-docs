---
description: '精确与近似向量搜索的文档'
keywords: ['vector similarity search', 'ann', 'knn', 'hnsw', 'indices', 'index', 'nearest neighbor', 'vector search']
sidebar_label: '精确与近似向量搜索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '精确与近似向量搜索'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 精确与近似向量搜索

在多维（向量）空间中，针对给定点寻找与其最近的 N 个点的问题，被称为[最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)，简称向量搜索。
求解向量搜索问题通常有两种通用方法：

* 精确向量搜索会计算给定点与向量空间中所有点之间的距离。这可以保证最高的准确性，即返回的点一定是实际的最近邻。由于需要对向量空间进行穷尽式遍历，精确向量搜索在现实场景中可能过于缓慢。
* 近似向量搜索指一组技术（例如，基于图或随机森林等特殊数据结构），其计算结果的速度远快于精确向量搜索。结果的准确性通常对实际使用来说“足够好”。许多近似技术提供参数，用于在结果准确性与搜索时间之间进行权衡和调优。

向量搜索（无论精确或近似）可以用 SQL 表达如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE 子句为可选项
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在 `vectors` 列中，该列为数组类型，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，通过公共表表达式（CTE）给出。
`&lt;DistanceFunction&gt;` 用于计算参考点与所有已存储点之间的距离。
可以使用任意可用的[距离函数](/sql-reference/functions/distance-functions)来完成此操作。
`&lt;N&gt;` 指定应返回多少个邻居。


## 精确向量搜索 {#exact-nearest-neighbor-search}

可以直接使用上述 SELECT 查询来执行精确向量搜索。
此类查询的运行时间通常与存储的向量数量及其维度(即数组元素数量)成正比。
此外,由于 ClickHouse 会对所有向量执行暴力扫描,运行时间还取决于查询所使用的线程数(参见设置 [max_threads](../../../operations/settings/settings.md#max_threads))。

### 示例 {#exact-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

返回结果

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```


## 近似向量搜索 {#approximate-nearest-neighbor-search}

### 向量相似度索引 {#vector-similarity-index}

ClickHouse 提供了一种特殊的"向量相似度"索引来执行近似向量搜索。

:::note
向量相似度索引在 ClickHouse 25.8 及更高版本中可用。
如果您遇到问题,请在 [ClickHouse 代码仓库](https://github.com/clickhouse/clickhouse/issues)中提交 issue。
:::

#### 创建向量相似度索引 {#creating-a-vector-similarity-index}

可以在新表上创建向量相似度索引,如下所示:

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>]
)
ENGINE = MergeTree
ORDER BY [...]
```

或者,向现有表添加向量相似度索引:

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似度索引是一种特殊的跳数索引(参见[此处](mergetree.md#table_engine-mergetree-data_skipping-indexes)和[此处](../../../optimize/skipping-indexes))。
因此,上述 `ALTER TABLE` 语句仅会为将来插入表中的新数据构建索引。
要为现有数据也构建索引,您需要将其物化:

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是

- `L2Distance`,即[欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance),表示欧几里得空间中两点之间的线段长度,或
- `cosineDistance`,即[余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance),表示两个非零向量之间的夹角。

对于归一化数据,`L2Distance` 通常是最佳选择,否则建议使用 `cosineDistance` 来补偿尺度差异。

`<dimensions>` 指定底层列中的数组基数(元素数量)。
如果 ClickHouse 在创建索引期间发现具有不同基数的数组,索引将被丢弃并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引粒度的大小(参见[此处](../../../optimize/skipping-indexes))。
默认值 1 亿在大多数使用场景中应该能够良好运行,但也可以进行调整。
我们建议仅由理解其操作影响的高级用户进行调整(参见[下文](#differences-to-regular-skipping-indexes))。

向量相似度索引是通用的,可以适配不同的近似搜索方法。
实际使用的方法由参数 `<type>` 指定。
目前,唯一可用的方法是 HNSW([学术论文](https://arxiv.org/abs/1603.09320)),这是一种基于层次邻近图的流行且先进的近似向量搜索技术。
如果使用 HNSW 作为类型,用户可以选择指定更多 HNSW 特定参数:

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX index_name vectors TYPE vector_similarity('hnsw', <distance_function>, <dimensions>[, <quantization>, <hnsw_max_connections_per_layer>, <hnsw_candidate_list_size_for_construction>]) [GRANULARITY N]
)
ENGINE = MergeTree
ORDER BY [...]
```

以下是可用的 HNSW 特定参数:

- `<quantization>` 控制邻近图中向量的量化。可能的值为 `f64`、`f32`、`f16`、`bf16`、`i8` 或 `b1`。默认值为 `bf16`。请注意,此参数不影响底层列中向量的表示形式。
- `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量,也称为 HNSW 超参数 `M`。默认值为 `32`。值 `0` 表示使用默认值。
- `<hnsw_candidate_list_size_for_construction>` 控制构建 HNSW 图期间动态候选列表的大小,也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值 `0` 表示使用默认值。

所有 HNSW 特定参数的默认值在大多数使用场景中都能良好运行。
因此,我们不建议自定义 HNSW 特定参数。


进一步的限制条件如下:

- 向量相似度索引只能在 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 类型的列上构建。不允许使用可空和低基数浮点数数组,如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))`。
- 向量相似度索引必须在单列上构建。
- 向量相似度索引可以在计算表达式上构建(例如 `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`),但此类索引之后无法用于近似邻近搜索。
- 向量相似度索引要求底层列中的所有数组都具有 `<dimension>` 个元素 - 这在索引创建期间会进行检查。为了尽早检测到违反此要求的情况,用户可以为向量列添加[约束](/sql-reference/statements/create/table.md#constraints),例如 `CONSTRAINT same_length CHECK length(vectors) = 256`。
- 同样,底层列中的数组值不能为空(`[]`)或具有默认值(也是 `[]`)。

**估算存储和内存消耗**

用于典型 AI 模型(例如大型语言模型,[LLMs](https://en.wikipedia.org/wiki/Large_language_model))的向量由数百或数千个浮点值组成。
因此,单个向量值可能会消耗数千字节的内存。
希望估算表中底层向量列所需存储空间以及向量相似度索引所需主内存的用户可以使用以下两个公式:

表中向量列的存储消耗(未压缩):

```text
存储消耗 = 向量数量 * 维度 * 列数据类型大小
```

[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)的示例:

```text
存储消耗 = 100 万 * 1536 * 4 (对于 Float32) = 6.1 GB
```

向量相似度索引必须从磁盘完全加载到主内存中才能执行搜索。
同样,向量索引也是完全在内存中构建,然后保存到磁盘。

加载向量索引所需的内存消耗:

```text
索引中向量的内存 (mv) = 向量数量 * 维度 * 量化数据类型大小
内存图的内存 (mg) = 向量数量 * hnsw_max_connections_per_layer * 每节点 ID 字节数 (= 4) * 层节点重复因子 (= 2)

内存消耗: mv + mg
```

[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)的示例:

```text
索引中向量的内存 (mv) = 100 万 * 1536 * 2 (对于 BFloat16) = 3072 MB
内存图的内存 (mg) = 100 万 * 64 * 2 * 4 = 512 MB

内存消耗 = 3072 + 512 = 3584 MB
```

上述公式未考虑向量相似度索引分配运行时数据结构(如预分配缓冲区和缓存)所需的额外内存。

#### 使用向量相似度索引 {#using-a-vector-similarity-index}

:::note
要使用向量相似度索引,设置 [compatibility](../../../operations/settings/settings.md) 必须为 `''`(默认值)、`'25.1'` 或更新版本。
:::

向量相似度索引支持以下形式的 SELECT 查询:

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE 子句是可选的
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse 的查询优化器会尝试匹配上述查询模板并利用可用的向量相似度索引。
只有当 SELECT 查询中的距离函数与索引定义中的距离函数相同时,查询才能使用向量相似度索引。

高级用户可以为设置 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)(也称为 HNSW 超参数 "ef_search")提供自定义值,以调整搜索期间候选列表的大小(例如 `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`)。
该设置的默认值 256 在大多数使用场景中都能很好地工作。
较高的设置值意味着更高的准确性,但代价是性能较慢。


如果查询可以使用向量相似度索引，ClickHouse 会检查在 SELECT 查询中提供的 LIMIT `<N>` 是否处于合理范围内。
更具体地说，如果 `<N>` 大于设置项 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的值（默认值为 100），则会返回错误。
过大的 LIMIT 值会减慢查询速度，通常也表示存在用法错误。

要检查某个 SELECT 查询是否使用了向量相似度索引，可以在查询前加上前缀 `EXPLAIN indexes = 1`。

例如，查询

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

可能会返回

```result
    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (投影列名)                                                                      │
 2. │   Limit (初步 LIMIT(不含 OFFSET))                                                    │
 3. │     Sorting (ORDER BY 排序)                                                              │
 4. │       Expression ((ORDER BY 之前 + (投影 + 将列名转换为列标识符))) │
 5. │         ReadFromMergeTree (default.tab)                                                         │
 6. │         索引:                                                                                │
 7. │           主键                                                                            │
 8. │             条件: true                                                                     │
 9. │             数据分片: 1/1                                                                          │
10. │             数据粒度: 575/575                                                                   │
11. │           跳数索引                                                                                  │
12. │             名称: idx                                                                           │
13. │             描述: vector_similarity GRANULARITY 100000000                                │
14. │             数据分片: 1/1                                                                          │
15. │             数据粒度: 10/575                                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

在本示例中，[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)中包含 100 万个向量，每个向量维度为 1536，被存储在 575 个 granule 中，即每个 granule 大约 1.7k 行。
查询请求 10 个邻居，向量相似度索引在 10 个不同的 granule 中找到了这 10 个邻居。
在查询执行过程中，将会读取这 10 个 granule。

当输出中包含 `Skip` 以及向量索引的名称和类型（本例中为 `idx` 和 `vector_similarity`）时，会使用向量相似度索引。
在此情况下，向量相似度索引丢弃了 4 个 granule 中的 2 个，即丢弃了 50% 的数据。
可被丢弃的 granule 越多，索引的使用就越高效。

:::tip
要强制使用索引，可以在运行 SELECT 查询时开启 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) 设置（将索引名称作为该设置的值提供）。
:::

**后过滤和前过滤**

用户可以在 SELECT 查询中选择性地在 `WHERE` 子句中指定附加过滤条件。
ClickHouse 将通过后过滤（post-filtering）或前过滤（pre-filtering）策略来评估这些过滤条件。
简而言之，这两种策略决定了过滤条件的评估顺序：

* 后过滤意味着首先评估向量相似度索引，之后 ClickHouse 再评估 `WHERE` 子句中指定的附加过滤条件。
* 前过滤意味着过滤条件的评估顺序相反。

这两种策略有不同的权衡：

* 后过滤的普遍问题在于，它可能返回少于 `LIMIT <N>` 子句中请求的行数。当一个或多个由向量相似度索引返回的结果行不满足附加过滤条件时，就会出现这种情况。
* 在一般情形下，前过滤仍是一个未解决的问题。某些专用的向量数据库提供前过滤算法，但大多数关系型数据库（包括 ClickHouse）都会退回到精确邻居搜索（exact neighbor search），即不使用索引的暴力扫描。

采用哪种策略取决于过滤条件。

*附加过滤条件是分区键的一部分*

如果附加的过滤条件是分区键的一部分，那么 ClickHouse 将应用分区裁剪（partition pruning）。
例如，一个表按列 `year` 进行范围分区，并运行如下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将裁剪掉除 2025 年分区之外的所有分区。

*无法使用索引计算的附加过滤条件*

如果附加过滤条件无法使用索引（主键索引、跳过索引）进行计算，ClickHouse 将应用后置过滤。


*可以使用主键索引来评估附加过滤条件*

如果可以使用[主键](mergetree.md#primary-key)评估附加过滤条件（即它们构成主键的前缀），并且

* 过滤条件在一个 part 内至少能排除一行，则 ClickHouse 会对该 part 内“存活”的范围回退为预过滤，
* 过滤条件在一个 part 内不能排除任何行，则 ClickHouse 会对该 part 执行后过滤。

在实际使用场景中，后一种情况相对不太可能发生。

*可以使用 skipping 索引来评估附加过滤条件*

如果可以使用[skipping 索引](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax 索引、set 索引等）来评估附加过滤条件，ClickHouse 会执行后过滤。
在这种情况下，会首先评估向量相似度索引，因为预期它相对于其他 skipping 索引能排除最多的行。

为了对后过滤与预过滤进行更细粒度的控制，可以使用两个设置：

设置 [vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy)（默认值：`auto`，实现上述启发式策略）可以被设置为 `prefilter`。
在附加过滤条件选择性极强的情况下，这对于强制使用预过滤非常有用。
例如，下面的查询可能会从预过滤中获益：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('古代亚洲帝国相关书籍'))
LIMIT 10
```

假设价格低于 2 美元的书籍数量非常少，那么由于向量索引返回的前 10 个匹配项可能全部高于 2 美元，后置过滤可能会返回零行。
通过强制使用预过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 会先查找所有价格低于 2 美元的书籍，然后对这些书籍执行穷举式（brute-force）向量搜索。

作为解决上述问题的另一种方法，可以将 [vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（默认值：`1.0`，最大值：`1000.0`）配置为大于 `1.0` 的值（例如 `2.0`）。
从向量索引中获取的最近邻数量会按该设置值进行放大，然后再对这些行应用附加过滤条件，以返回 LIMIT 指定数量的结果行。
例如，我们可以再次执行相同的查询，但将 multiplier 设置为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('古代亚洲帝国相关书籍'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse 将在每个 part 的向量索引中获取 3.0 x 10 = 30 个最近邻，然后再评估附加的过滤条件。
最终只会返回其中距离最近的 10 个邻居。
需要注意的是，设置 `vector_search_index_fetch_multiplier` 可以缓解这个问题，但在极端情况下（WHERE 条件选择性非常强），仍然有可能返回少于请求的 N 行。

**重新打分（Rescoring）**

ClickHouse 中的 skip 索引通常在 granule 级别进行过滤，即在 skip 索引中的一次查找（在内部）会返回一个潜在匹配 granule 的列表，从而减少后续扫描中需要读取的数据量。
这对于一般的 skip 索引工作良好，但在向量相似度索引的场景下，会产生“粒度不匹配（granularity mismatch）”的问题。
更具体地说，向量相似度索引会确定给定参考向量的 N 个最相似向量的行号，但随后需要将这些行号映射到 granule 编号。
ClickHouse 随后会从磁盘加载这些 granule，并对这些 granule 中的所有向量重新计算距离。
这一步称为重新打分（rescoring），虽然理论上可以提高准确度——记住向量相似度索引只返回*近似*结果——但在性能方面显然并不最优。

因此，ClickHouse 提供了一种优化，可以禁用重新打分，并直接从索引返回最相似的向量及其距离。
该优化默认启用，参见设置 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)。
从整体上看，其工作方式是 ClickHouse 将最相似的向量及其距离作为一个虚拟列 `_distances` 提供。
要看到这一点，可以运行带有 `EXPLAIN header = 1` 的向量搜索查询：


```sql
EXPLAIN header = 1
WITH [0., 2.] AS reference_vec
SELECT id
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3
SETTINGS vector_search_with_rescoring = 0
```

```result
查询 ID: a2a9d0c8-a525-45c1-96ca-c5a11fa66f47

    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (Project names)                                                                              │
 2. │ Header: id Int32                                                                                        │
 3. │   Limit (preliminary LIMIT (without OFFSET))                                                            │
 4. │   Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64     │
 5. │           __table1.id Int32                                                                             │
 6. │     Sorting (Sorting for ORDER BY)                                                                      │
 7. │     Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64   │
 8. │             __table1.id Int32                                                                           │
 9. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers)))         │
10. │       Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64 │
11. │               __table1.id Int32                                                                         │
12. │         ReadFromMergeTree (default.tab)                                                                 │
13. │         Header: id Int32                                                                                │
14. │                 _distance Float32                                                                       │
    └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
在禁用重新评分(`vector_search_with_rescoring = 0`)且启用并行副本的情况下运行查询时,可能会回退到重新评分。
:::

#### 性能调优 {#performance-tuning}

**调优压缩**

在几乎所有使用场景中,底层列中的向量都是密集的,压缩效果不佳。
因此,[压缩](/sql-reference/statements/create/table.md#column_compression_codec)会降低向量列的插入和读取性能。
我们建议禁用压缩。
为此,请为向量列指定 `CODEC(NONE)`,如下所示:

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似度索引的生命周期与数据分区的生命周期绑定。
换句话说,每当创建一个定义了向量相似度索引的新分区时,索引也会随之创建。
这通常发生在数据[插入](https://clickhouse.com/docs/guides/inserting-data)或[合并](https://clickhouse.com/docs/merges)期间。
不幸的是,HNSW 以索引创建时间长而闻名,这会显著降低插入和合并的速度。
向量相似度索引理想情况下仅在数据不可变或极少更改时使用。

为了加快索引创建速度,可以使用以下技术:

首先,索引创建可以并行化。
可以使用服务器设置 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 配置索引创建线程的最大数量。
为获得最佳性能,该设置值应配置为 CPU 核心数。

其次,为了加快 INSERT 语句的速度,用户可以使用会话设置 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用在新插入分区上创建跳数索引。
对这些分区的 SELECT 查询将回退到精确搜索。
由于插入的分区相对于总表大小往往较小,因此预计性能影响可以忽略不计。

第三,为了加快合并速度,用户可以使用会话设置 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用在合并分区上创建跳数索引。
这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 结合使用,可以显式控制向量相似度索引的生命周期。
例如,可以将索引创建推迟到所有数据摄入完成后,或推迟到系统负载较低的时段(如周末)。

**调优索引使用**


SELECT 查询需要将向量相似度索引加载到内存中才能使用。
为了避免同一个向量相似度索引被反复加载到内存中，ClickHouse 为此类索引提供了专用的内存缓存。
此缓存越大，不必要的加载就越少。
最大缓存大小可以通过服务器设置 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 进行配置。
默认情况下，缓存最大可以增长到 5 GB。

:::note
向量相似度索引缓存存储的是向量索引的粒度。
如果单个向量索引粒度大于缓存大小，则不会被缓存。
因此，请务必根据“估算存储与内存消耗”中的公式或 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) 计算向量索引大小，并相应地设置缓存大小。
:::

向量相似度索引缓存的当前大小可以在 [system.metrics](../../../operations/system-tables/metrics.md) 中查看：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

对于具有某个查询 ID 的查询，其缓存命中和未命中情况可以从 [system.query&#95;log](../../../operations/system-tables/query_log.md) 中获取：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产环境场景，我们建议将缓存配置得足够大，以确保所有向量索引始终驻留在内存中。

**量化调优**

[量化](https://huggingface.co/blog/embedding-quantization)是一种减少向量内存占用，以及降低构建和遍历向量索引计算成本的技术。
ClickHouse 向量索引支持以下量化选项：

| Quantization   | Name             | Storage per dimension |
| -------------- | ---------------- | --------------------- |
| f32            | 单精度              | 4 bytes               |
| f16            | 半精度              | 2 bytes               |
| bf16 (default) | 半精度（brain float） | 2 bytes               |
| i8             | 四分之一精度           | 1 byte                |
| b1             | 二进制              | 1 bit                 |

与基于原始全精度浮点值（`f32`）的搜索相比，量化会降低向量搜索的精度。
不过，在大多数数据集上，half-precision brain float 量化（`bf16`）带来的精度损失可以忽略不计，因此向量相似度索引默认使用这种量化技术。
四分之一精度（`i8`）和二进制（`b1`）量化会在向量搜索中带来明显的精度损失。
仅当向量相似度索引的大小远大于可用 DRAM 容量时，我们才建议使用这两种量化方式。
在这种情况下，我们还建议启用重打分（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）以提升精度。
二进制量化仅在以下情况下推荐使用：1）对归一化后的嵌入（即向量长度 = 1，OpenAI 模型通常是归一化的）；以及 2）使用余弦距离（cosine distance）作为距离函数时。
二进制量化在内部使用汉明距离（Hamming distance）来构建和搜索近邻图。
重打分步骤会使用存储在表中的原始全精度向量，通过余弦距离来识别最近邻。

**数据传输调优**

向量搜索查询中的参考向量由用户提供，通常通过调用大语言模型（LLM）获取。
在 ClickHouse 中运行向量搜索的典型 Python 代码可能如下所示。

```python
search_v = openai_client.embeddings.create(input = "[好书推荐]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```


嵌入向量(上述代码片段中的 `search_v`)可能具有非常大的维度。例如,OpenAI 提供的模型可以生成具有 1536 甚至 3072 个维度的嵌入向量。在上述代码中,ClickHouse Python 驱动程序将嵌入向量替换为人类可读的字符串,然后将整个 SELECT 查询作为字符串发送。假设嵌入向量由 1536 个单精度浮点值组成,发送的字符串长度将达到 20 kB。这会导致较高的 CPU 使用率,用于分词、解析和执行数千次字符串到浮点数的转换。此外,ClickHouse 服务器日志文件需要占用大量空间,也会导致 `system.query_log` 膨胀。

请注意,大多数 LLM 模型将嵌入向量作为原生浮点数的列表或 NumPy 数组返回。因此,我们建议 Python 应用程序使用以下方式以二进制形式绑定参考向量参数:

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, (SELECT reinterpret($search_v_binary$, 'Array(Float32)')))
    LIMIT 10"
    parameters = params)
```

在此示例中,参考向量以二进制形式原样发送,并在服务器上重新解释为浮点数数组。这节省了服务器端的 CPU 时间,并避免了服务器日志和 `system.query_log` 的膨胀。

#### 管理和监控 {#administration}

向量相似度索引的磁盘大小可以从 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) 获取:

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

示例输出:

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```

#### 与常规跳数索引的差异 {#differences-to-regular-skipping-indexes}

与所有常规[跳数索引](/optimize/skipping-indexes)一样,向量相似度索引是在颗粒(granule)上构建的,每个索引块由 `GRANULARITY = [N]` 个颗粒组成(对于普通跳数索引,`[N]` 默认为 1)。例如,如果表的主索引粒度为 8192(设置 `index_granularity = 8192`)且 `GRANULARITY = 2`,则每个索引块将包含 16384 行。然而,近似最近邻搜索的数据结构和算法本质上是面向行的。它们存储一组行的紧凑表示,并为向量搜索查询返回行。这导致向量相似度索引的行为方式与普通跳数索引相比存在一些不太直观的差异。

当用户在列上定义向量相似度索引时,ClickHouse 内部为每个索引块创建一个向量相似度"子索引"。子索引是"局部的",因为它只知道其所属索引块的行。在前面的示例中,假设一列有 65536 行,我们将获得四个索引块(跨越八个颗粒)以及每个索引块的一个向量相似度子索引。理论上,子索引能够直接返回其索引块内具有 N 个最近点的行。然而,由于 ClickHouse 以颗粒粒度从磁盘加载数据到内存,子索引会将匹配的行外推到颗粒粒度。这与常规跳数索引不同,后者以索引块粒度跳过数据。


`GRANULARITY` 参数决定创建多少个向量相似度子索引。
更大的 `GRANULARITY` 值意味着子索引数量更少但体积更大,直到一个列(或列的数据部分)只有一个子索引为止。
在这种情况下,子索引具有所有列行的"全局"视图,可以直接返回包含相关行的列(部分)的所有颗粒(最多有 `LIMIT [N]` 个这样的颗粒)。
第二步中,ClickHouse 将加载这些颗粒,并通过对颗粒的所有行执行暴力距离计算来识别实际的最佳行。
使用较小的 `GRANULARITY` 值时,每个子索引最多返回 `LIMIT N` 个颗粒。
因此,需要加载和后过滤更多的颗粒。
请注意,两种情况下的搜索准确性相同,只是处理性能不同。
通常建议对向量相似度索引使用较大的 `GRANULARITY` 值,仅在出现向量相似度结构内存消耗过大等问题时才回退到较小的 `GRANULARITY` 值。
如果未为向量相似度索引指定 `GRANULARITY`,则默认值为 1 亿。

#### 示例 {#approximate-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

返回

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

使用近似向量搜索的更多示例数据集:

- [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
- [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
- [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
- [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)

### 量化位 (QBit) {#approximate-nearest-neighbor-search-qbit}

<ExperimentalBadge />

加速精确向量搜索的一种常见方法是使用较低精度的[浮点数据类型](../../../sql-reference/data-types/float.md)。
例如,如果向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`,数据大小将减少一半,查询运行时间预计会成比例减少。
这种方法称为量化。虽然它加快了计算速度,但即使对所有向量执行了详尽扫描,仍可能降低结果准确性。

使用传统量化时,我们在搜索和存储数据时都会损失精度。在上面的示例中,我们将存储 `BFloat16` 而不是 `Float32`,这意味着即使需要,我们也无法在以后执行更高精度的搜索。一种替代方法是存储两份数据副本:量化的和全精度的。虽然这种方法有效,但需要冗余存储。考虑这样一个场景:我们有 `Float64` 作为原始数据,并希望以不同精度(16 位、32 位或完整 64 位)运行搜索。我们需要存储三份独立的数据副本。

ClickHouse 提供量化位 (`QBit`) 数据类型来解决这些限制,方法是:

1. 存储原始全精度数据。
2. 允许在查询时指定量化精度。


这是通过以位分组格式存储数据来实现的(即所有向量的第 i 位存储在一起),从而仅在请求的精度级别进行读取。您可以从量化中获得减少 I/O 和计算的速度优势,同时在需要时保留所有原始数据可用。当选择最大精度时,搜索将变为精确搜索。

:::note
`QBit` 数据类型及其相关的距离函数目前处于实验阶段。要启用它们,请运行 `SET allow_experimental_qbit_type = 1`。
如果您遇到问题,请在 [ClickHouse 代码仓库](https://github.com/clickhouse/clickhouse/issues)中提交问题。
:::

要声明 `QBit` 类型的列,请使用以下语法:

```sql
column_name QBit(element_type, dimension)
```

其中:

- `element_type` – 每个向量元素的类型。支持的类型有 `BFloat16`、`Float32` 和 `Float64`
- `dimension` – 每个向量中的元素数量

#### 创建 `QBit` 表并添加数据 {#qbit-create}

```sql
CREATE TABLE fruit_animal (
    word String,
    vec QBit(Float64, 5)
) ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
    ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
    ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
    ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
    ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
    ('cat', [-0.56611276, 0.52267331, 1.27839863, -0.59809804, -1.26721048]),
    ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```

#### 使用 `QBit` 进行向量搜索 {#qbit-search}

让我们使用 L2 距离查找表示单词 'lemon' 的向量的最近邻。距离函数中的第三个参数指定精度位数 - 值越高准确性越高,但需要更多计算。

您可以在[此处](../../../sql-reference/data-types/qbit.md#vector-search-functions)找到 `QBit` 的所有可用距离函数。

**全精度搜索(64 位):**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 64) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬────────────distance─┐
1. │ apple  │ 0.14639757188169716 │
2. │ banana │   1.998961369007679 │
3. │ orange │   2.039041552613732 │
4. │ cat    │   2.752802631487914 │
5. │ horse  │  2.7555776805484813 │
6. │ dog    │   3.382295083120104 │
   └────────┴─────────────────────┘
```

**降低精度搜索:**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 12) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬───────────distance─┐
1. │ apple  │  0.757668703053566 │
2. │ orange │ 1.5499475034938677 │
3. │ banana │ 1.6168396735102937 │
4. │ cat    │  2.429752230904804 │
5. │ horse  │  2.524650475528617 │
6. │ dog    │   3.17766975527459 │
   └────────┴────────────────────┘
```


请注意,使用 12 位量化时,我们可以在加快查询执行速度的同时获得距离的良好近似值。相对排序基本保持一致,'apple' 仍然是最接近的匹配项。

:::note
在当前状态下,速度提升源于减少了 I/O 操作,因为读取的数据量更少。如果原始数据宽度较大,例如 `Float64`,选择较低的精度仍然会在相同宽度的数据上进行距离计算——只是精度降低了。
:::

#### 性能考量 {#qbit-performance}

`QBit` 的性能优势来自于减少的 I/O 操作,因为使用较低精度时需要从存储中读取的数据量更少。此外,当 `QBit` 包含 `Float32` 数据时,如果精度参数为 16 或更低,还将从减少的计算量中获得额外收益。精度参数直接控制准确性和速度之间的权衡:

- **较高精度**(更接近原始数据宽度):结果更准确,查询速度较慢
- **较低精度**:查询速度更快,结果为近似值,内存使用量减少

### 参考资料 {#references}

博客:

- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)
