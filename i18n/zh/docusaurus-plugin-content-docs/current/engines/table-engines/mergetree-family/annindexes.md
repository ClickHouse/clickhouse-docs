---
'description': '精确与近似向量搜索的文档'
'keywords':
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
- 'vector search'
'sidebar_label': '精确与近似向量搜索'
'slug': '/engines/table-engines/mergetree-family/annindexes'
'title': '精确与近似向量搜索'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 精确和近似向量搜索

在多维（向量）空间中，查找给定点最近的 N 个点的问题被称为 [最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)，或简称为：向量搜索。
解决向量搜索有两种一般方法：
- 精确向量搜索计算给定点与向量空间中所有点之间的距离。这确保了最佳的准确性，即返回的点保证是实际的最近邻。由于向量空间被全面探索，精确向量搜索在实际使用中可能过于缓慢。
- 近似向量搜索是指一组技术（例如，特殊数据结构如图和随机森林），其计算结果比精确向量搜索快得多。结果的准确性通常“足够好”，适用于实际使用。许多近似技术提供参数来调整结果的准确性与搜索时间之间的权衡。

向量搜索（精确或近似）可以用 SQL 书写如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在数组类型的列 `vectors` 中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)，[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，并作为公共表表达式给出。
`<DistanceFunction>` 用于计算参考点与所有存储点之间的距离。
可以使用任何可用的 [距离函数](/sql-reference/functions/distance-functions)。
`<N>` 指定应返回多少个邻居。
## 精确向量搜索 {#exact-nearest-neighbor-search}

可以使用上述 SELECT 查询执行精确向量搜索。
此类查询的运行时间通常与存储的向量数量及其维度成正比，即数组元素的数量。
此外，由于 ClickHouse 对所有向量执行暴力扫描，因此运行时间还取决于查询的线程数量（请参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。
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

返回

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```
## 近似向量搜索 {#approximate-nearest-neighbor-search}
### 向量相似度索引 {#vector-similarity-index}

ClickHouse 提供了一种特别的“向量相似度”索引以执行近似向量搜索。

:::note
向量相似度索引在 ClickHouse 版本 25.8 及更高版本中可用。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中打开一个问题。
:::
#### 创建向量相似度索引 {#creating-a-vector-similarity-index}

可以在新表上创建向量相似度索引，如下所示：

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

或者，要将向量相似度索引添加到现有表中：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似度索引是特殊类型的跳过索引（见 [这里](mergetree.md#table_engine-mergetree-data_skipping-indexes) 和 [这里](../../../optimize/skipping-indexes)）。
因此，上述 `ALTER TABLE` 语句仅导致索引为将来插入到表中的新数据构建。
要为现有数据构建索引，还需要将其物化：

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是
- `L2Distance`， [欧氏距离](https://en.wikipedia.org/wiki/Euclidean_distance)，表示在欧几里德空间中两点之间的线段长度，或
- `cosineDistance`， [余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)，表示两非零向量之间的角度。

对于标准化的数据，`L2Distance` 通常是最佳选择，否则建议使用 `cosineDistance` 来补偿尺度。

`<dimensions>` 指定底层列中的数组基数（元素数量）。
如果 ClickHouse 在索引创建过程中发现维度不同的数组，则该索引将被丢弃并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引粒度的大小（见 [这里](../../../optimize/skipping-indexes)）。
默认值为 1 亿，应该对大多数用例工作得相当好，但也可以进行调整。
我们建议仅对了解其含义的高级用户进行调整（见 [下文](#differences-to-regular-skipping-indexes)）。

向量相似度索引是通用的，可以容纳不同的近似搜索方法。
实际使用的方法由参数 `<type>` 指定。
到目前为止，唯一可用的方法是 HNSW（[学术论文](https://arxiv.org/abs/1603.09320)），这是一种基于分层邻近图的流行的和最先进的近似向量搜索技术。
如果将 HNSW 作为类型，用户可以选择性地指定进一步的 HNSW 特定参数：

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

这些 HNSW 特定参数包括：
- `<quantization>` 控制邻接图中色彩向量的量化。可能的值有 `f64`、`f32`、`f16`、`bf16`、`i8` 或 `b1`。默认值是 `bf16`。请注意，此参数不影响底层列中向量的表示。
- `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值 `0` 表示使用默认值。
- `<hnsw_candidate_list_size_for_construction>` 控制 HNSW 图的动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值 `0` 表示使用默认值。

所有 HNSW 特定参数的默认值在大多数用例中工作得相当好。
因此，我们并不建议自定义 HNSW 特定参数。

进一步的限制包括：
- 向量相似度索引只能在类型为 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列上构建。不可允许包含空值和低基数浮点数的数组，如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))`。
- 向量相似度索引必须在单列上构建。
- 向量相似度索引可以建立在计算表达式上（例如，`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但这种索引不能稍后用于近似邻居搜索。
- 向量相似度索引要求底层列中的所有数组必须具有 `<dimension>`-数量的元素——在索引创建期间检查此条件。为了尽早检测到此要求的违规，用户可以为向量列添加 [约束](/sql-reference/statements/create/table.md#constraints)，例如，`CONSTRAINT same_length CHECK length(vectors) = 256`。
- 同样，底层列中的数组值不得为空 (`[]`) 或具有默认值（也为 `[]`）。

**估算存储和内存消耗**

用于典型 AI 模型（例如大型语言模型，[LLMs](https://en.wikipedia.org/wiki/Large_language_model)）的向量由数百或数千个浮点值生成。
因此，单个向量值可能具有多个千字节的内存消耗。
希望估算表中底层向量列所需存储的用户以及为向量相似度索引所需的主存，可以使用以下两个公式：

表中向量列（未经压缩）的存储消耗：

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 的示例：

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

必须将向量相似度索引从磁盘完全加载到主内存中以执行搜索。
同样，向量索引也在内存中完全构建，然后保存到磁盘。

加载向量索引所需的内存消耗：

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 的示例：

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上述公式不考虑向量相似度索引分配运行时数据结构（如预分配缓冲区和缓存）所需的额外内存。
#### 使用向量相似度索引 {#using-a-vector-similarity-index}

:::note
要使用向量相似度索引，设置 [compatibility](../../../operations/settings/settings.md) 必须为 `''`（默认值）、`'25.1'` 或更高。
:::

向量相似度索引支持以下形式的 SELECT 查询：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse 的查询优化器会尝试匹配上述查询模板，并利用可用的向量相似度索引。
查询仅能使用向量相似度索引，如果 SELECT 查询中的距离函数与索引定义中的距离函数相同。

高级用户可以为设置 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search) （也称为 HNSW 超参数“ef_search”）提供自定义值，以调整搜索时候的候选列表大小（例如，`SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
默认值 256 在大多数用例中表现良好。
较高的设置值意味着更好的准确性，但会降低性能。

如果查询能够使用向量相似度索引，ClickHouse 会检查 SELECT 查询中提供的 LIMIT `<N>` 是否在合理范围内。
更具体地说，如果 `<N>` 大于设置 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的默认值 100，则返回错误。
过大的 LIMIT 值可能会降低搜索速度，通常指示使用错误。

要检查 SELECT 查询是否使用向量相似度索引，可以在查询前加上 `EXPLAIN indexes = 1`。

例如，查询

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

可能返回

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

在此示例中，1 百万向量在 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 中，每个维度 1536，存储在 575 个粒度中，即每个粒度 1.7k 行。
查询请求 10 个邻居，向量相似度索引在 10 个单独的粒度中找到这 10 个邻居。
在查询执行期间将读取这 10 个粒度。

如果输出包含 `Skip` 和向量索引的名称和类型（在示例中为 `idx` 和 `vector_similarity`），则正在使用向量相似度索引。
在这种情况下，向量相似度索引丢弃了四个粒度中的两个，即 50% 的数据。
越多的粒度被丢弃，索引使用的效果就越好。

:::tip
要强制使用索引，可以使用设置 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) 运行 SELECT 查询（提供索引名称作为设置值）。
:::

**后过滤和预过滤**

用户可以选择性地为 SELECT 查询指定带有附加过滤条件的 `WHERE` 子句。
ClickHouse 将使用后过滤或预过滤策略来评估这些过滤条件。
简而言之，这两种策略确定过滤器评估的顺序：
- 后过滤意味着首先评估向量相似度索引，然后 ClickHouse 评估在 `WHERE` 子句中指定的附加过滤器。
- 预过滤意味着过滤器评估的顺序正好相反。

这两种策略的权衡不同：
- 后过滤的一般问题是它可能返回少于 `LIMIT <N>` 子句请求的行数。当向量相似度索引返回的结果行之一或多个未满足附加过滤条件时，会发生这种情况。
- 预过滤通常是一个未解决的问题。某些专业化的向量数据库提供预过滤算法，但大多数关系数据库（包括 ClickHouse）将退回到精确邻居搜索，即不使用索引的暴力扫描。

使用哪种策略取决于过滤条件。

*附加过滤器是分区键的一部分*

如果附加过滤条件是分区键的一部分，则 ClickHouse 将应用分区修剪。
例如，一张表按 `year` 列范围分区，并运行以下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将修剪除 2025 以外的所有分区。

*附加过滤器不能使用索引进行评估*

如果附加过滤条件无法使用索引（主键索引、跳过索引）进行评估，则 ClickHouse 将应用后过滤。

*附加过滤器可以使用主键索引进行评估*

如果附加过滤条件可以使用 [主键](mergetree.md#primary-key) 进行评估（即，它们形成主键的前缀），并且
- 过滤条件在某个部分内消除了至少一行，则 ClickHouse 将对该部分内“幸存”的范围进行预过滤，
- 过滤条件在某个部分内未消除任何行，则 ClickHouse 将对该部分执行后过滤。

在实际使用中，后一种情况相对不太可能。

*附加过滤器可以使用跳过索引进行评估*

如果附加过滤条件可以使用 [跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes) （最小最大索引、集合索引等）进行评估，ClickHouse 将执行后过滤。
在这种情况下，期望首先评估向量相似度索引，因为它可能相对于其他跳过索引移除更多的行。

对于后过滤与预过滤的更细控制，可以使用两个设置：

设置 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy) （默认值：`auto`，实现上述启发式方法）可以设置为 `prefilter`。
这在附加过滤条件极为选择性时非常有用。
例如，以下查询可能受益于预过滤：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设只有少量图书售价低于 2 美元，后过滤可能返回零行，因为向量索引返回的前 10 个匹配项可能全部定价在 2 美元以上。
通过强制预过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 首先找到所有低于 2 美元的书籍，然后针对找到的书籍执行暴力向量搜索。

作为解决上述问题的另一种方法，可以将设置 [vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier) （默认：`1.0`，最大：`1000.0`）配置为大于 `1.0` 的值（例如，`2.0`）。
从向量索引中提取到的最近邻的数量将乘以设置值，然后对此些行应用附加过滤以返回 LIMIT 行。
例如，我们可以再次查询，但乘倍数为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse 将从每个部分的向量索引中提取 3.0 x 10 = 30 个最近邻，然后评估附加过滤。
只有十个最接近的邻居将被返回。
我们注意到，设置 `vector_search_index_fetch_multiplier` 可以减轻问题，但在极端情况下（非常选择性的 WHERE 条件），仍然可能返回的行数少于请求的 N 行。

**重新评估**

ClickHouse 中的跳过索引通常在粒度级别过滤，即跳过索引中的查找（内部）返回一个潜在匹配的粒度列表，从而减少随后的扫描中读取的数据量。
这对跳过索引很好用，但在向量相似度索引的情况下，会产生“粒度不匹配”。
更具体地说，向量相似度索引确定给定参考向量的 N 个最相似向量的行号，但随后需要将这些行号推断为粒度号。
ClickHouse 然后将从磁盘加载这些粒度，并对这些粒度中的所有向量执行距离计算。
此步骤称为重新评估，尽管理论上可以提高准确性——请记住，向量相似度索引返回的是_近似_结果，但在性能方面显然不是最佳的。

因此，ClickHouse 提供了一种优化，可以禁用重新评估，并直接从索引返回最相似的向量及其距离。
默认情况下启用此优化，请参见设置 [vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring)。
其工作原理在高层上是 ClickHouse 提供最相似的向量及其距离，作为虚拟列 `_distances`。
要查看这一点，运行带有 `EXPLAIN header = 1` 的向量搜索查询：

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
未进行重新评估（`vector_search_with_rescoring = 0`）并启用并行副本的查询可能会回退到重新评估。
:::
#### 性能调优 {#performance-tuning}

**调整压缩**

在几乎所有使用案例中，底层列中的向量都是稠密的，压缩效果不佳。
因此，[压缩](/sql-reference/statements/create/table.md#column_compression_codec) 会减慢向量列的插入和读取。
因此，我们建议禁用压缩。
为此，请为向量列指定 `CODEC(NONE)`，如下所示：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调整索引创建**

向量相似度索引的生命周期与分区的生命周期相关联。
换句话说，每当创建带有定义的向量相似度索引的新部分时，索引也会创建。
这通常发生在数据被 [插入](https://clickhouse.com/docs/guides/inserting-data) 或在 [合并](https://clickhouse.com/docs/merges) 过程中。
不幸的是，HNSW 以长索引创建时间而闻名，这可能显著减慢插入和合并。
理想情况下，只有在数据是不可变或很少变化的情况下才使用向量相似度索引。

要加速索引创建，可以使用以下技术：

首先，可以并行化索引创建。
最大索引创建线程数可以通过服务器设置 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 进行配置。
为了实现最佳性能，设置值应配置为 CPU 核心的数量。

其次，为了加速 INSERT 语句，用户可以使用会话设置 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用对新插入部分的跳过索引创建。
对此类部分的 SELECT 查询将退回到精确搜索。
由于插入的部分通常比整个表的大小小，因此其性能影响预计微不足道。

第三，为了加速合并，用户可以使用会话设置 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用合并部分的跳过索引创建。
这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 一起，提供对向量相似度索引生命周期的显式控制。
例如，可以将索引创建推迟到所有数据被摄取后或者系统负载较低的时间段（例如，周末）。

**调整索引使用**

SELECT 查询需要将向量相似度索引加载到主内存中才能使用。
为避免相同的向量相似度索引多次加载到主内存中，ClickHouse 提供了一个专用于此类索引的内存缓存。
缓存越大，发生不必要加载的次数就越少。
最大缓存大小可以通过服务器设置 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 进行配置。
默认情况下，缓存大小最大可达 5 GB。

向量相似度索引缓存的当前大小显示在 [system.metrics](../../../operations/system-tables/metrics.md) 中：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

可以从 [system.query_log](../../../operations/system-tables/query_log.md) 中获得某个查询 ID 的缓存命中率和未命中率：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产用例，我们建议缓存的大小足够大，以便始终将所有向量索引保留在内存中。

**调整量化**

[量化](https://huggingface.co/blog/embedding-quantization) 是减少向量内存占用和构建和遍历向量索引的计算成本的一种技术。
ClickHouse 向量索引支持以下量化选项：

| 量化         | 名称                           | 每维存储       |
|--------------|--------------------------------|----------------|
| f32          | 单精度                         | 4 字节         |
| f16          | 半精度                         | 2 字节         |
| bf16 (默认)  | 半精度（脑浮点数）             | 2 字节         |
| i8           | 四分之一精度                    | 1 字节         |
| b1           | 二进制                         | 1 位           |

与对原始全精度浮点值（`f32`）的搜索相比，量化降低了向量搜索的精度。
但是，在大多数数据集中，半精度脑浮点量化（`bf16`）的精度损失微不足道，因此向量相似度索引默认使用该量化技术。
四分之一精度（`i8`）和二进制（`b1`）量化在向量搜索中会造成显著的精度损失。
我们仅在向量相似度索引的大小显著大于可用 DRAM 大小时推荐这两种量化。
在这种情况下，我们还建议启用重新评估（[vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)，[vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）以提高准确性。
二进制量化仅建议在 1）标准化嵌入（即向量长度 = 1，OpenAI 模型通常是标准化的），以及 2）如果使用余弦距离作为距离函数。
二进制量化在内部使用汉明距离来构造和搜索邻接图。
重新评估步骤使用存储在表中的原始全精度向量通过余弦距离识别最近邻。

**调整数据传输**

向量搜索查询中的参考向量是用户提供的，通常通过调用大型语言模型（LLM）进行检索。
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

嵌入向量（上述片段中的 `search_v`）可能具有非常大的维度。
例如，OpenAI 提供生成 1536 或甚至 3072 维嵌入向量的模型。
在上述代码中，ClickHouse Python 驱动将嵌入向量替换为可读字符串，然后将整个 SELECT 查询作为字符串发送。
假设嵌入向量由 1536 个单精度浮点值组成，则发送的字符串长度达到 20 kB。
这在标记、解析和执行数千次字符串到浮点转换时会造成高 CPU 使用率。
此外，ClickHouse 服务器日志文件需要大量空间，导致 `system.query_log` 的膨胀。

请注意，大多数 LLM 模型返回的嵌入向量为本机浮点的列表或 NumPy 数组。
因此，我们建议 Python 应用程序以二进制形式绑定参考向量参数，使用以下样式：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, (SELECT reinterpret($search_v_binary$, 'Array(Float32)')))
    LIMIT 10"
    parameters = params)
```

在该示例中，参考向量以二进制形式原样发送，并在服务器上重新解释为浮点数组。
这样可以节省服务器端的 CPU 时间，并避免服务器日志和 `system.query_log` 的膨胀。
#### 管理和监控 {#administration}

向量相似度索引的磁盘大小可以从 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) 获取：

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
#### 与常规跳过索引的区别 {#differences-to-regular-skipping-indexes}

与所有常规 [跳过索引](/optimize/skipping-indexes) 一样，向量相似度索引是在粒度上构建的，每个索引块由 `GRANULARITY = [N]`-多个粒度组成（`[N]` = 默认情况下为 1 的正常跳过索引）。
例如，如果表的主索引粒度为 8192（设置 `index_granularity = 8192`），而 `GRANULARITY = 2`，则每个已索引块将包含 16384 行。
但是，近似邻居搜索的数据结构和算法本质上是面向行的。
它们存储一组行的紧凑表示，并为向量搜索查询返回行。
这造成了一些相当不直观的差异，使得向量相似度索引的行为与正常跳过索引不同。

当用户在某列上定义向量相似度索引时，ClickHouse 在内部为每个索引块创建一个向量相似度“子索引”。
子索引是“局部”的，意味着它只知道其所含索引块的行。
在前面的示例中，假设某列有 65536 行，则可以获得四个索引块（跨八个粒度）并为每个索引块创建一个向量相似度子索引。
理论上，子索引能够直接返回其索引块内与最近点的 N 个行。
但是，由于 ClickHouse 是以粒度的方式从磁盘加载数据到内存，因此子索引在粒度级别推断匹配行。
这与常规跳过索引不同，常规跳过索引在索引块的粒度上跳过数据。

`GRANULARITY` 参数决定创建多少个向量相似度子索引。
较大的 `GRANULARITY` 值意味着更少但更大的向量相似度子索引，直到某列（或某列的数据部分）只有一个子索引。
在这种情况下，子索引对所有列行具有“全局”视图，能够直接返回与相关行的列（部分）中所有粒度（最多 `LIMIT [N]`）相关行。
接下来，ClickHouse 将加载这些粒度并通过对粒度中所有行执行暴力距离计算来识别实际上最好的行。
使用小的 `GRANULARITY` 值时，每个子索引最多返回 `LIMIT N` 个粒度。
因此，需加载和后过滤的粒度会更多。
请注意，在两种情况下搜索的准确性同样良好，只有处理性能不同。
通常建议对向量相似度索引使用大的 `GRANULARITY`，仅在如向量相似度结构的内存消耗过高等问题的情况下，请回退到较小的 `GRANULARITY` 值。
如果未为向量相似度索引指定 `GRANULARITY`，则默认值为 1 亿。
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

使用近似向量搜索的其他示例数据集：
- [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
- [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
- [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
- [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)
### 量化位 (QBit) {#approximate-nearest-neighbor-search-qbit}

<ExperimentalBadge/>

加速精确向量搜索的一种常见方法是使用低精度的 [float 数据类型](../../../sql-reference/data-types/float.md)。
例如，如果将向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`，则数据大小减半，并且查询运行时间预计会成比例减少。
这种方法被称为量化。虽然它加速了计算，但它可能会降低结果的准确性，尽管它对所有向量进行了全面扫描。

使用传统量化时，在搜索和存储数据时都会失去精度。在上述示例中，我们将存储 `BFloat16` 而不是 `Float32`，这意味着即使需要，我们也无法进行更精确的搜索。另一种替代方法是存储两份数据：量化版本和全精度版本。虽然这样可行，但它需要冗余存储。考虑一种场景，其中我们原始数据为 `Float64`，想要使用不同精度（16 位、32 位或完整 64 位）进行搜索。我们需要存储三份独立的数据。

ClickHouse 提供了量化位 (`QBit`) 数据类型，通过以下方式解决这些限制：
1. 存储原始全精度数据。
2. 允许在查询时指定量化精度。

这通过以位分组格式存储数据来实现（这意味着所有向量的所有 i-th 位一起存储），使得只在所请求的精度级别读取数据。您可以获得量化所带来的减少 I/O 的速度优势，同时在需要时保留所有原始数据。当选择最大精度时，搜索变为精确的。

:::note
`QBit` 数据类型及其相关的距离函数目前仍处于实验阶段。要启用它们，请运行 `SET allow_experimental_qbit_type = 1`。
如果遇到问题，请在 [ClickHouse repository](https://github.com/clickhouse/clickhouse/issues) 中提出问题。
:::

要声明 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

其中：
* `element_type` - 每个向量元素的类型。支持的类型有 `BFloat16`、`Float32` 和 `Float64`
* `dimension` - 每个向量中的元素数量
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

让我们使用 L2 距离找到与表示单词 'lemon' 的向量最近的邻居。距离函数中的第三个参数指定了位精度 - 较高的值提供更高的准确性但需要更多计算。

您可以在 [这里](../../../sql-reference/data-types/qbit.md#vector-search-functions) 找到所有可用的 `QBit` 距离函数。

**全精度搜索 (64 位)：**

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

**降低精度搜索：**

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

请注意，使用 12 位量化时，我们获得了距离的良好近似，并且查询执行更快。相对排序大致保持一致，“apple” 仍然是最接近的匹配。

:::note
在当前状态下，加速是由于减少了 I/O，因为我们读取的数据更少。如果原始数据比较宽，例如 `Float64`，选择较低的精度仍会导致在相同宽度的数据上进行距离计算，只是精度较低。
:::
#### 性能考虑 {#qbit-performance}

`QBit` 的性能优势来自于减少的 I/O 操作，因为在使用较低精度时需要从存储中读取的数据更少。精度参数直接控制准确性与速度之间的权衡：

- **更高精度**（接近原始数据宽度）：更准确的结果，查询较慢
- **较低精度**：查询更快，结果近似，减少内存使用

:::note
目前，速度的提升来自于减少 I/O，而不是计算优化。当使用较低精度值时，距离计算仍在原始数据宽度上进行。
:::
### 参考文献 {#references}

博客：
- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)
