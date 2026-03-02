---
description: '精确和近似向量搜索的文档'
keywords: ['向量相似度搜索', 'ann', 'knn', 'hnsw', '索引结构', '索引', '最近邻', '向量搜索']
sidebar_label: '精确和近似向量搜索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '精确和近似向量搜索'
doc_type: 'guide'
---

# 精确向量搜索与近似向量搜索 \{#exact-and-approximate-vector-search\}

在多维（向量）空间中，为给定点查找最近的 N 个点的问题称为[最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)（nearest neighbor search），简称向量搜索。
解决向量搜索通常有两大类方法：

* 精确向量搜索会计算给定点与向量空间中所有点之间的距离。这可以确保尽可能高的准确性，即返回的点被保证为真正的最近邻。由于需要对向量空间进行完全遍历，精确向量搜索在实际场景中可能过于缓慢。
* 近似向量搜索是一组技术的统称（例如基于图和随机森林等特殊数据结构），可以比精确向量搜索更快地计算结果。结果的准确性通常对实际使用来说“足够好”。许多近似方法提供参数，用于在结果准确性与搜索时间之间进行权衡调优。

一个向量搜索（无论是精确还是近似）可以用 SQL 查询如下表示：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在数组类型的列 `vectors` 中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，通过公共表表达式（CTE）给出。
`<DistanceFunction>` 计算参考点与所有已存储点之间的距离。
可以使用任意可用的[距离函数](/sql-reference/functions/distance-functions)来完成此操作。
`<N>` 指定应返回多少个邻居。


## 精确向量搜索 \{#exact-nearest-neighbor-search\}

可以直接使用上面的 SELECT 查询来执行精确向量搜索。
此类查询的运行时间通常与已存储向量的数量及其维度成正比，即数组元素的数量。
另外，由于 ClickHouse 会对所有向量进行穷举扫描，运行时间也取决于该查询所使用的线程数（参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。

### 示例 \{#exact-nearest-neighbor-search-example\}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

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


## 近似最近邻搜索 \{#approximate-nearest-neighbor-search\}

### 向量相似度索引 \{#vector-similarity-index\}

ClickHouse 提供了用于执行近似向量搜索的专用“向量相似度”索引。

:::note
向量相似度索引在 ClickHouse 25.8 及更高版本中提供。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

#### 创建向量相似度索引 \{#creating-a-vector-similarity-index\}

可以按如下方式在一张新表上创建一个向量相似度索引：

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

或者，可以在现有表上添加一个向量相似度索引：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似度索引是一种特殊类型的跳过索引（参见[这里](mergetree.md#table_engine-mergetree-data_skipping-indexes)和[这里](../../../optimize/skipping-indexes)）。
因此，上面的 `ALTER TABLE` 语句只会为之后插入到该表中的新数据构建索引。
要同时为已有数据构建索引，你需要对其进行物化：

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是

* `L2Distance`，[欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)，表示欧几里得空间中两个点之间线段的长度，或
* `cosineDistance`，[余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)，表示两个非零向量之间的夹角。

对于已归一化的数据，`L2Distance` 通常是最佳选择；否则，建议使用 `cosineDistance` 来补偿尺度差异。

`<dimensions>` 指定底层列中数组的基数（元素数量）。
如果 ClickHouse 在创建索引时发现数组的基数不同，则会丢弃该索引并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引粒度的大小（参见[此处](../../../optimize/skipping-indexes)）。
与默认索引粒度为 1 的常规跳过索引不同，向量相似度索引将 1 亿用作默认索引粒度。
该值确保即使在大型分区片段上，内部构建的索引数量也较少。
我们建议仅由了解相关影响的高级用户修改索引粒度（参见[下文](#differences-to-regular-skipping-indexes)）。

向量相似度索引具有通用性，能够适配不同的近似搜索方法。
实际使用的方法由参数 `<type>` 指定。
目前唯一可用的方法是 HNSW（[论文](https://arxiv.org/abs/1603.09320)），这是一种基于分层邻近图的、在近似向量搜索中非常流行且代表当前最新进展的技术。
如果将 HNSW 用作类型值，用户可以选择性地指定更多 HNSW 特定的参数：

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

以下是可用的 HNSW 专用参数：

* `<quantization>` 控制邻近图中向量的量化方式。可选值为 `f64`、`f32`、`f16`、`bf16`、`i8` 或 `b1`。默认值为 `bf16`。注意，此参数不会影响底层列中向量的表示。
* `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值为 `0` 表示使用默认值。
* `<hnsw_candidate_list_size_for_construction>` 控制构建 HNSW 图时动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值为 `0` 表示使用默认值。

所有 HNSW 专用参数的默认值在大多数用例中都能取得较好的效果。
因此我们不建议自定义 HNSW 专用参数。

另外还有以下限制：


* 向量相似性索引只能构建在类型为 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列上。不允许在包含 Nullable 或低基数字段的浮点数组（例如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))`）上构建索引。
* 向量相似性索引必须构建在单个列上。
* 向量相似性索引可以构建在计算表达式上（例如 `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但此类索引之后无法用于近似邻居搜索。
* 向量相似性索引要求底层列中的所有数组都具有 `<dimension>` 个元素——这一点会在索引创建期间进行检查。为了尽早发现对该要求的违规，用户可以为向量列添加一个[约束](/sql-reference/statements/create/table.md#constraints)，例如 `CONSTRAINT same_length CHECK length(vectors) = 256`。
* 同样，底层列中的数组值不得为空（`[]`），也不得为默认值（同样为 `[]`）。

**估算存储和内存消耗**

为典型 AI 模型（例如大语言模型，[LLMs](https://en.wikipedia.org/wiki/Large_language_model)）生成的向量由数百或数千个浮点值组成。
因此，单个向量值的内存占用可能达到数千字节。
希望估算表中底层向量列所需存储空间，以及向量相似性索引所需内存的用户，可以使用下面两个公式：

表中向量列（未压缩）的存储占用：

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

以 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 为例：

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

向量相似性索引必须从磁盘完整加载到内存中才能执行搜索。
同样，向量索引也会在内存中完全构建，然后再保存到磁盘。

加载向量索引所需的内存占用：

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

以 [DBpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 为例：

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上述公式未将向量相似度索引在分配运行时数据结构（如预分配缓冲区和缓存）时所需的额外内存计入在内。


#### 使用向量相似度索引 \{#using-a-vector-similarity-index\}

:::note
要使用向量相似度索引，必须将 `compatibility` [setting](../../../operations/settings/settings.md) 设置为 `''`（默认值）或 `'25.1'` 及更高版本。
:::

向量相似度索引支持如下形式的 SELECT 查询：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse 的查询优化器会尝试匹配上述查询模板，并利用可用的向量相似度索引。
只有当 SELECT 查询中的距离函数与索引定义中的距离函数相同时，查询才能使用向量相似度索引。

高级用户可以为设置项 [hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（也称为 HNSW 超参数 “ef&#95;search”）提供自定义值，以在搜索过程中调整候选列表的大小（例如 `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
该设置项的默认值 256 在绝大多数使用场景下都表现良好。
更高的设置值意味着更高的精度，但会以性能变慢为代价。

如果查询可以使用向量相似度索引，ClickHouse 会检查在 SELECT 查询中提供的 LIMIT `<N>` 是否在合理范围内。
更具体地说，如果 `<N>` 大于设置项 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的值（默认值为 100），则会返回错误。
过大的 LIMIT 值会拖慢搜索速度，并且通常表明存在使用错误。

要检查某个 SELECT 查询是否使用了向量相似度索引，可以在查询前加上 `EXPLAIN indexes = 1`。

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
 1. │ Expression (Project names)                                                                      │
 2. │   Limit (preliminary LIMIT (without OFFSET))                                                    │
 3. │     Sorting (Sorting for ORDER BY)                                                              │
 4. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers))) │
 5. │         ReadFromMergeTree (default.tab)                                                         │
 6. │         Indexes:                                                                                │
 7. │           PrimaryKey                                                                            │
 8. │             Condition: true                                                                     │
 9. │             Parts: 1/1                                                                          │
10. │             Granules: 575/575                                                                   │
11. │           Skip                                                                                  │
12. │             Name: idx                                                                           │
13. │             Description: vector_similarity GRANULARITY 100000000                                │
14. │             Parts: 1/1                                                                          │
15. │             Granules: 10/575                                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

在本例中，[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)中的 100 万个向量（每个向量维度为 1536）被存储在 575 个颗粒（granule）中，即每个颗粒约 1.7k 行。
查询请求 10 个近邻，向量相似度索引在 10 个不同的颗粒中找到了这 10 个近邻。
在查询执行过程中，这 10 个颗粒都会被读取。

当输出中包含 `Skip` 以及向量索引的名称和类型时（在本例中为 `idx` 和 `vector_similarity`），就会使用向量相似度索引。
在这种情况下，向量相似度索引丢弃了 4 个颗粒中的 2 个，也就是丢弃了 50% 的数据。
能够被丢弃的颗粒越多，索引的使用效果就越好。

:::tip
要强制使用索引，可以在运行 SELECT 查询时使用 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) 设置（将索引名称作为设置值提供）。
:::

**后过滤和前过滤**

用户可以选择在 SELECT 查询中通过 `WHERE` 子句指定额外的过滤条件。
ClickHouse 将使用后过滤或前过滤策略来评估这些过滤条件。
简而言之，这两种策略决定了各个过滤条件的评估顺序：

* 后过滤表示先评估向量相似度索引，然后 ClickHouse 再评估 `WHERE` 子句中指定的额外过滤条件。
* 前过滤则表示过滤条件的评估顺序正好相反。

这两种策略在取舍上有所不同：


* 后过滤存在一个普遍问题：它可能返回少于 `LIMIT <N>` 子句中请求的行数。当向量相似度索引返回的一个或多个结果行不满足附加过滤条件时，就会发生这种情况。
* 预过滤总体上仍是一个尚未解决的问题。某些专用向量数据库提供预过滤算法，但大多数关系型数据库（包括 ClickHouse）会回退到精确近邻搜索，即在没有索引的情况下进行暴力扫描。

采用哪种策略取决于过滤条件。

*附加过滤条件是分区键的一部分*

如果附加过滤条件是分区键的一部分，那么 ClickHouse 将应用分区裁剪。
例如，一个表按列 `year` 进行范围分区，并执行以下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将会裁剪掉除 2025 之外的所有分区。

*无法使用索引评估的附加过滤条件*

如果附加过滤条件无法使用索引（主键索引、跳过索引）进行评估，ClickHouse 将会执行后过滤（post-filtering）。

*可以使用主键索引评估的附加过滤条件*

如果附加过滤条件可以使用[主键](mergetree.md#primary-key)进行评估（即它们构成主键的前缀），并且

* 过滤条件在某个 part 内至少过滤掉了一行数据，ClickHouse 将会对该 part 中“存活”的范围回退到预过滤（pre-filtering），
* 过滤条件在某个 part 内没有过滤掉任何行，ClickHouse 将会对该 part 执行后过滤。

在实际使用场景中，后一种情况相对不太可能发生。

*可以使用跳过索引评估的附加过滤条件*

如果附加过滤条件可以使用[跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax 索引、Set 索引等）进行评估，ClickHouse 将执行后过滤。
在这种情况下，会优先评估向量相似度索引，因为预期它相对于其他跳过索引可以过滤掉最多的行。

为了对后过滤与预过滤进行更精细的控制，可以使用两个设置项：

设置项 [vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy)（默认值：`auto`，即实现上述启发式策略）可以设置为 `prefilter`。
在附加过滤条件选择性极高的场景下，这对于强制使用预过滤非常有用。
例如，下面的查询可能会从预过滤中获益：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设只有极少数书的价格低于 2 美元，那么后置过滤可能会返回零行结果，因为向量索引返回的前 10 个匹配项的价格都可能高于 2 美元。
通过强制使用预过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 会先找到所有价格低于 2 美元的书籍，然后对这些书籍执行穷举式向量搜索。

作为解决上述问题的另一种方法，可以将 [vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（默认值：`1.0`，最大值：`1000.0`）配置为大于 `1.0` 的值（例如 `2.0`）。
从向量索引中获取的最近邻数量会乘以该设置的值，然后在这些行上再应用额外的过滤条件，以便最终仍能返回 LIMIT 指定数量的行。
例如，我们可以再次执行查询，但将 multiplier 设为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse 将在每个分片（part）中从向量索引中获取 3.0 x 10 = 30 个最近邻，然后再评估额外的过滤条件。
最终只会返回距离最近的十个邻居。
需要注意的是，通过设置 `vector_search_index_fetch_multiplier` 可以缓解这个问题，但在极端情况下（WHERE 条件选择性很高时），仍然可能返回少于请求的 N 行。

**重新排序（Rescoring）**


ClickHouse 中的 skip 索引通常在 granule 级别进行过滤，即在 skip 索引中的一次查找（内部）会返回一个可能匹配的 granule 列表，从而减少后续扫描中读取的数据量。
这一般对 skip 索引来说效果很好，但对于向量相似度索引而言，会产生一个“粒度不匹配（granularity mismatch）”的问题。
更具体地说，向量相似度索引会确定给定参考向量最相似的 N 个向量的行号，但随后需要将这些行号推算为 granule 编号。
ClickHouse 随后会从磁盘中加载这些 granule，并对这些 granule 中的所有向量重新计算距离。
这一步被称为 rescoring，尽管理论上它可以提高准确性——记住向量相似度索引只返回*近似的*结果——但在性能方面显然并不理想。

因此，ClickHouse 提供了一种优化，可以禁用 rescoring，并直接从索引返回最相似的向量及其距离。
该优化默认启用，详见设置 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)。
从整体上看，其工作方式是 ClickHouse 将最相似的向量及其距离作为一个虚拟列 `_distances` 提供。
要验证这一点，可以运行带有 `EXPLAIN header = 1` 的向量搜索查询：

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
Query id: a2a9d0c8-a525-45c1-96ca-c5a11fa66f47

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
在未启用重排序（`vector_search_with_rescoring = 0`）且启用了并行副本的情况下运行的查询，可能会回退到重排序。
:::


#### 性能调优 \{#performance-tuning\}

**压缩调优**

在几乎所有用例中，底层列中的向量都是稠密的，通常难以获得良好的压缩效果。
结果是，[compression](/sql-reference/statements/create/table.md#column_compression_codec) 会减慢向量列的写入和读取。
因此我们建议禁用压缩。
为此，请为向量列指定 `CODEC(NONE)`，如下所示：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似度索引的生命周期与分区片段的生命周期绑定。
换句话说，每当创建一个带有已定义向量相似度索引的新分区片段时，索引也会随之创建。
这通常发生在数据被[插入](https://clickhouse.com/docs/guides/inserting-data)或在[合并](https://clickhouse.com/docs/merges)过程中。
不幸的是，HNSW 的索引创建时间通常较长，可能会显著减慢插入和合并操作。
理想情况下，仅在数据不可变或很少变更时才使用向量相似度索引。

为了加速索引创建，可以使用以下技术：

首先，可以对索引创建进行并行化。
索引创建线程的最大数量可以通过服务器 SETTING [max&#95;build&#95;vector&#95;similarity&#95;index&#95;thread&#95;pool&#95;size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 进行配置。
为了获得最佳性能，应将该 SETTING 的值设置为 CPU 核心数。

其次，为了加速 INSERT 语句，用户可以通过会话级 SETTING [materialize&#95;skip&#95;indexes&#95;on&#95;insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用在新插入分区片段上创建跳过索引。
对此类分区片段的 SELECT 查询将回退到精确搜索。
由于与整个表大小相比，插入的分区片段往往较小，因此预期其性能影响可以忽略不计。

第三，为了加速合并，用户可以通过会话级 SETTING [materialize&#95;skip&#95;indexes&#95;on&#95;merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用在合并后的分区片段上创建跳过索引。
这与语句 [ALTER TABLE [...] MATERIALIZE INDEX [...]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 结合使用，可对向量相似度索引的生命周期进行显式控制。
例如，可以将索引创建推迟到所有数据都已摄取完成之后，或推迟到诸如周末等系统负载较低的时段。

**调优索引使用**

SELECT 查询在使用向量相似度索引时，需要将其加载到主内存中。
为了避免同一个向量相似度索引被反复加载到主内存中，ClickHouse 为此类索引提供了专用的内存缓存。
缓存越大，不必要的加载就越少。
缓存的最大大小可以通过服务器 SETTING [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 进行配置。
默认情况下，缓存最多可以增长到 5 GB。

下面的日志消息（`system.text_log`）表明正在加载向量相似度索引。
如果针对不同的向量搜索查询反复出现此类消息，则说明缓存大小过小。

```text
2026-02-03 07:39:10.351635 [1386] f0ac5c85-1b1c-4f35-8848-87a1d1aa00ba : VectorSimilarityIndex Start loading vector similarity index

<...>

2026-02-03 07:40:25.217603 [1386] f0ac5c85-1b1c-4f35-8848-87a1d1aa00ba : VectorSimilarityIndex Loaded vector similarity index: max_level = 2, connectivity = 64, size = 1808111, capacity = 1808111, memory_usage = 8.00 GiB, bytes_per_vector = 4096, scalar_words = 1024, nodes = 1808111, edges = 51356964, max_edges = 233395072
```

:::note
向量相似度索引缓存存储的是向量索引粒度。
如果单个向量索引粒度大于缓存大小，则不会被缓存。
因此，请务必根据“估算存储和内存消耗”中的公式或 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) 计算向量索引大小，并相应地设置缓存大小。
:::

*我们再次强调，在排查向量搜索查询变慢的问题时，核实并在必要时增大向量索引缓存，应该是首要步骤。*

向量相似度索引缓存的当前大小可在 [system.metrics](../../../operations/system-tables/metrics.md) 中查看：


```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

对于具有某个 query id 的查询，其缓存命中和未命中情况可以从 [system.query&#95;log](../../../operations/system-tables/query_log.md) 中获取：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产用例，我们建议将缓存配置得足够大，以便所有向量索引始终都能保留在内存中。

**调优量化**

[量化](https://huggingface.co/blog/embedding-quantization)是一种技术，用于减少向量的内存占用以及构建和遍历向量索引的计算成本。
ClickHouse 向量索引支持以下量化选项：

| Quantization   | Name                         | Storage per dimension |
| -------------- | ---------------------------- | --------------------- |
| f32            | Single precision             | 4 bytes               |
| f16            | Half precision               | 2 bytes               |
| bf16 (default) | Half precision (brain float) | 2 bytes               |
| i8             | Quarter precision            | 1 byte                |
| b1             | Binary                       | 1 bit                 |

量化会降低向量搜索的精度，与对原始全精度浮点值（`f32`）进行搜索相比尤其如此。
不过，在大多数数据集上，半精度 brain float 量化（`bf16`）带来的精度损失可以忽略不计，因此向量相似度索引默认使用这种量化技术。
四分之一精度（`i8`）和二进制（`b1`）量化会在向量搜索中造成显著的精度损失。
我们仅在向量相似度索引的大小明显大于可用 DRAM 容量时推荐使用这两种量化方式。
在这种情况下，我们也建议启用重打分（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）来提升准确性。
二进制量化仅在以下场景中推荐使用：1）归一化后的嵌入（即向量长度 = 1，OpenAI 模型通常是归一化的）；2）使用 cosine distance 作为距离函数时。
二进制量化在内部使用 Hamming distance 来构建和搜索近邻图。
重打分步骤会使用存储在表中的原始全精度向量，通过 cosine distance 来识别最近邻。

**调优数据传输**

向量搜索查询中的参考向量由用户提供，通常是通过调用大语言模型（LLM）获取的。
在 ClickHouse 中运行向量搜索的典型 Python 代码可能如下所示：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

嵌入向量（上面代码片段中的 `search_v`）可能具有非常大的维度。
例如，OpenAI 提供的模型可以生成维度为 1536 甚至 3072 的嵌入向量。
在上面的代码中，ClickHouse Python 驱动会将嵌入向量替换为一个人类可读的字符串，并随后以字符串形式发送整个 SELECT 查询。
假设嵌入向量由 1536 个单精度浮点值组成，那么发送的字符串长度将达到 20 kB。
这会在标记化、解析以及执行成千上万次字符串到浮点数转换时产生很高的 CPU 使用率。
此外，ClickHouse 服务器日志文件需要占用大量空间，同时也会导致 `system.query_log` 膨胀。

请注意，大多数 LLM 模型返回的嵌入向量是由原生浮点数组成的列表或 NumPy 数组。
因此，我们建议 Python 应用通过使用如下方式以二进制形式绑定参考向量参数：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, reinterpret($search_v_binary$, 'Array(Float32)'))
    LIMIT 10"
    parameters = params)
```

在该示例中，参考向量以二进制形式原样发送，并在服务器端被重新解释为浮点数数组。
这样可以节省服务器端的 CPU 开销，并避免服务器日志和 `system.query_log` 过于臃肿。


#### 管理和监控 \{#administration\}

向量相似度索引在磁盘上的大小可以通过 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) 查询：

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

示例输出：

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```


#### 与常规跳过索引的差异 \{#differences-to-regular-skipping-indexes\}

与所有常规[跳过索引](/optimize/skipping-indexes)一样，向量相似度索引是基于 granule 构建的，每个已建索引的数据块由 `GRANULARITY = [N]` 个 granule 组成（对于普通跳过索引，`[N]` 默认为 1）。
例如，如果表的主索引 granularity 为 8192（`index_granularity = 8192`），并且 `GRANULARITY = 2`，那么每个已建索引的数据块将包含 16384 行。
然而，用于近似邻居搜索的数据结构和算法本质上是面向行的。
它们存储一组行的紧凑表示，并在向量搜索查询中返回行。
这会导致向量相似度索引的行为与普通跳过索引相比存在一些相当不直观的差异。

当用户在某列上定义向量相似度索引时，ClickHouse 会在内部为每个索引块创建一个向量相似度“子索引”。
该子索引是“本地”的，也就是说它只了解其所属索引块中的行。
在前面的示例中，假设某列有 65536 行，我们会得到四个索引块（跨越八个 granule），并且每个索引块都有一个向量相似度子索引。
从理论上讲，子索引可以直接在其索引块内返回距离最近的 N 个点对应的行。
但是，由于 ClickHouse 从磁盘加载到内存的数据粒度是 granule 级别，子索引会将匹配的行扩展到 granule 粒度。
这与常规跳过索引不同，后者是在索引块粒度上跳过数据。

`GRANULARITY` 参数决定会创建多少个向量相似度子索引。
较大的 `GRANULARITY` 值意味着更少但更大的向量相似度子索引，直到某列（或某列的数据 part）只有一个子索引为止。
在那种情况下，子索引具有该列所有行的“全局”视图，并且可以直接返回该列（part）中包含相关行的所有 granule（此类 granule 最多为 `LIMIT [N]` 个）。
在第二步中，ClickHouse 会加载这些 granule，并通过对这些 granule 中所有行执行穷举式（brute-force）距离计算来识别真正最优的行。
当 `GRANULARITY` 较小时，每个子索引最多返回 `LIMIT N` 个 granule。
因此，需要加载并进行后续过滤的 granule 会更多。
请注意，两种情况下的搜索准确性同样良好，只是处理性能不同。
通常建议为向量相似度索引使用较大的 `GRANULARITY`，仅在出现向量相似度结构内存消耗过高等问题时再退回使用较小的 `GRANULARITY` 值。
如果未为向量相似度索引指定 `GRANULARITY`，默认值为 1 亿。

#### 示例 \{#approximate-nearest-neighbor-search-example\}

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

更多使用近似向量搜索的示例数据集包括：

* [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
* [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
* [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
* [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)


### 量化比特（QBit） \{#approximate-nearest-neighbor-search-qbit\}

加速精确向量搜索的一种常见方法是使用较低精度的 [浮点数据类型](../../../sql-reference/data-types/float.md)。
例如，如果将向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`，数据大小会减半，查询运行时间预计也会按比例减少。
这种方法称为量化。虽然它加快了计算速度，但即使对所有向量进行穷尽扫描，也可能降低结果的准确性。

在传统量化中，我们在搜索阶段和数据存储阶段都会丢失精度。在上面的示例中，我们会存储 `BFloat16` 而不是 `Float32`，这意味着即使之后有需要，也无法再执行更加精确的搜索。另一种替代方案是存储两份数据：一份量化数据，一份全精度数据。虽然可行，但需要冗余存储。设想这样一种场景：原始数据是 `Float64`，并且希望以不同精度（16 位、32 位或完整 64 位）进行搜索。我们就需要存储三份彼此独立的数据副本。

ClickHouse 提供了 Quantized Bit（`QBit`）数据类型，用来解决这些限制，其方式包括：

1. 存储原始的全精度数据。
2. 允许在查询时指定量化精度。

这是通过以按位分组的格式存储数据实现的（即所有向量的第 i 位比特集中存放在一起），从而只需按请求的精度级别进行读取。这样既可以通过量化减少 I/O 和计算量来获得速度优势，又可以在需要时保留所有原始数据。当选择最大精度时，搜索即为精确搜索。

要声明一个 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

其中：

* `element_type` – 每个向量元素的类型。支持的类型包括 `BFloat16`、`Float32` 和 `Float64`
* `dimension` – 每个向量中的元素个数


#### 创建 `QBit` 表并插入数据 \{#qbit-create\}

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


#### 使用 `QBit` 进行向量搜索 \{#qbit-search\}

让我们使用 L2 距离来查找表示单词 &#39;lemon&#39; 的向量的最近邻。距离函数中的第三个参数指定精度（以位为单位）——数值越大，精度越高，但计算开销也越大。

你可以在[这里](../../../sql-reference/data-types/qbit.md#vector-search-functions)找到 `QBit` 支持的所有距离函数。

**全精度搜索（64 位）：**

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

**低精度搜索：**

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

请注意，使用 12 位量化时，我们在获得较好距离近似的同时实现了更快的查询执行。相对排序基本保持一致，&#39;apple&#39; 仍然是最接近的匹配项。


#### 性能考虑 \{#qbit-performance\}

`QBit` 的性能优势来自减少 I/O 操作，因为在使用较低精度时，需要从存储中读取的数据量更少。此外，当 `QBit` 中包含 `Float32` 数据且精度参数为 16 或以下时，还可以通过减少计算量获得额外的性能收益。精度参数直接控制准确性与速度之间的权衡：

- **更高精度**（更接近原始数据宽度）：结果更准确，查询更慢
- **更低精度**：查询更快但结果为近似值，内存使用减少

### 参考资料 \{#references\}

博客：

- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)
- [我们构建了一款向量搜索引擎，支持在查询时选择精度](https://clickhouse.com/blog/qbit-vector-search)