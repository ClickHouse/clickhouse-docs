---
'description': 'Documentation for Exact and Approximate Nearest Neighbor Search'
'keywords':
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
'sidebar_label': 'Exact and Approximate Nearest Neighbor Search'
'slug': '/engines/table-engines/mergetree-family/annindexes'
'title': 'Exact and Approximate Nearest Neighbor Search'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 精确和近似最近邻搜索

在多维（向量）空间中找到 N 个最接近给定点的点的问题被称为 [最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)。
解决最近邻搜索有两种一般方法：
- 精确最近邻搜索计算给定点与向量空间中所有点之间的距离。这确保最好的准确性，即返回的点被保证是实际的最近邻。由于对向量空间进行了全面探索，精确最近邻搜索在实际使用中可能太慢。
- 近似最近邻搜索指的是一组技术（例如，图形和随机森林等特殊数据结构），它们的计算速度比精确最近邻搜索快得多。结果的准确性通常对实际使用来说是“足够好的”。许多近似技术提供参数，以调整结果准确性和搜索时间之间的权衡。

最近邻搜索（无论是精确的还是近似的）可以用 SQL 编写如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在数组类型的列 `vectors` 中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，作为公共表表达式给出。
`<DistanceFunction>` 计算参考点与所有存储点之间的距离。
可以使用任何可用的 [距离函数](/sql-reference/functions/distance-functions)。
`<N>` 指定应返回多少个邻居。

## 精确最近邻搜索 {#exact-nearest-neighbor-search}

可以按原样使用上述 SELECT 查询执行精确最近邻搜索。
此类查询的运行时间一般与存储的向量数量及其维度（即数组元素的数量）成正比。
此外，由于 ClickHouse 对所有向量执行了暴力扫描，因此运行时间也取决于查询的线程数量（请参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。

加速精确最近邻搜索的常见方法是使用低精度 [float 数据类型](../../../sql-reference/data-types/float.md)。
例如，如果向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`，则数据大小减半，查询运行时间也预计会减半。
这种方法被称为量化，尽管对所有向量进行了全面扫描，但它可能会降低结果的准确性。
是否接受精度损失取决于用例，通常需要实验。

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

## 近似最近邻搜索 {#approximate-nearest-neighbor-search}

<BetaBadge/>

ClickHouse 提供了一种特殊的“向量相似度”索引来执行近似最近邻搜索。

:::note
向量相似度索引目前处于实验阶段。
要启用它们，请首先运行 `SET allow_experimental_vector_similarity_index = 1`。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提起问题。
:::

### 创建向量相似度索引 {#creating-a-vector-similarity-index}

可以像这样在新表上创建向量相似度索引：

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

或者，要向现有表中添加向量相似度索引：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似度索引是特殊类型的跳过索引（见 [这里](mergetree.md#table_engine-mergetree-data_skipping-indexes) 和 [这里](../../../optimize/skipping-indexes)）。
相应地，上述 `ALTER TABLE` 语句仅导致索引为将来插入到表中的新数据构建。
要为现有数据构建索引，您需要使其物化：

```sql
ALTER TABLE table MATERIALIZE <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须为
- `L2Distance`， [欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)，表示欧几里得空间中两点之间的线段的长度，或者
- `cosineDistance`， [余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)，表示两个非零向量之间的角度。

对于归一化数据，通常推荐使用 `L2Distance`，否则建议使用 `cosineDistance` 以弥补尺度差异。

`<dimensions>` 指定基础列中的数组基数（元素数量）。
如果 ClickHouse 在创建索引时发现数组具有不同的基数，则索引将被丢弃并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引粒度的大小（见 [这里](../../../optimize/skipping-indexes)）。
默认值为 1 亿，对于大多数使用案例应有效，但也可以进行调优。
我们建议仅对了解其影响的高级用户进行调优（见 [下面](#differences-to-regular-skipping-indexes)）。

向量相似度索引是通用的，因为它们可以适应不同的近似搜索方法。
实际使用的方法由参数 `<type>` 指定。
到目前为止，唯一可用的方法是 HNSW（[学术论文](https://arxiv.org/abs/1603.09320)），这是一种基于分层邻近图的流行、最先进的近似向量搜索技术。
如果将 HNSW 用作类型，用户可以选择指定更多 HNSW 特定参数：

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
- `<quantization>` 控制邻近图中向量的量化。可能的值为 `f64`、`f32`、`f16`、`bf16` 或 `i8`。默认值为 `bf16`。请注意，此参数不影响基础列中向量的表示。
- `<hnsw_max_connections_per_layer>` 控制每个图形节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值 `0` 表示使用默认值。
- `<hnsw_candidate_list_size_for_construction>` 控制构建 HNSW 图形时动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值 `0` 表示使用默认值。

所有 HNSW 特定参数的默认值在大多数使用案例中运行良好。
因此，我们通常不建议自定义 HNSW 特定参数。

有进一步的限制：
- 向量相似度索引只能构建在类型为 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列上。像 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))` 这样的 Nullable 和低基数浮点数组是不允许的。
- 向量相似度索引必须构建在单列上。
- 向量相似度索引可以在计算表达式上构建（例如， `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但是这样的索引无法在以后的近似邻居搜索中使用。
- 向量相似度索引要求基础列中的所有数组具有 `<dimension>` 个元素 - 这在索引创建期间会进行检查。为了尽早检测到该要求的违规，用户可以为向量列添加 [约束](/sql-reference/statements/create/table.md#constraints)，例如， `CONSTRAINT same_length CHECK length(vectors) = 256`。
- 同样，基础列中的数组值不得为空 (`[]`) 或具有默认值（也为 `[]`）。

### 使用向量相似度索引 {#using-a-vector-similarity-index}

:::note
要使用向量相似度索引，设置 [compatibility](../../../operations/settings/settings.md) 必须为 `''` （默认值）或 `'25.1'` 或更新版本。
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

ClickHouse 的查询优化器会尝试匹配上述查询模板并利用可用的向量相似度索引。
查询只能使用向量相似度索引，如果 SELECT 查询中的距离函数与索引定义中的距离函数相同。

高级用户可以为设置 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（也称为 HNSW 超参数 “ef_search” ）提供自定义值，以调整搜索期间候选列表的大小（例如， `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
该设置的默认值 256 在大多数使用案例中表现良好。
更高的设置值意味着更好的精度，但代价是性能变慢。

如果查询可以使用向量相似度索引，ClickHouse 检查在 SELECT 查询中提供的 LIMIT `<N>` 是否在合理范围内。
更具体地说，如果 `<N>` 大于设置 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的默认值 100，便会返回错误。
过大的 LIMIT 值会减慢搜索速度，通常表示使用错误。

要检查 SELECT 查询是否使用向量相似度索引，可以用 `EXPLAIN indexes = 1` 前缀查询。

作为一个示例，查询 

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

在此示例中，1百万个向量存储在 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 中，每个向量的维度为 1536，分布在 575 个粒度中，即每个粒度 1.7k 行。
该查询请求 10 个邻居，向量相似度索引在 10 个单独的粒度中找到这 10 个邻居。
在查询执行过程中，将读取这 10 个粒度。

如果输出包含 `Skip` 和向量索引的名称和类型（在示例中是 `idx` 和 `vector_similarity`），则使用了向量相似度索引。
在这种情况下，向量相似度索引丢弃了四个粒度中的两个，即 50% 的数据。
能够丢弃更多的粒度，索引的使用效率就会变得更高。

:::tip
要强制使用索引，可以使用设置 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) 运行 SELECT 查询（将索引名称作为设置值提供）。
:::

**后过滤和前过滤**

用户可以选择在 SELECT 查询中指定带有附加过滤条件的 `WHERE` 子句。
ClickHouse 将使用后过滤或前过滤策略评估这些过滤条件。
简而言之，两种策略都确定了过滤器评估的顺序：
- 后过滤意味着首先评估向量相似度索引，之后 ClickHouse 评估在 `WHERE` 子句中指定的附加过滤条件。
- 前过滤意味着过滤器评估顺序是相反的。

这两种策略有不同的权衡：
- 后过滤的一般问题是，它可能返回的行数少于 `LIMIT <N>` 子句中请求的行数。这种情况发生在向量相似度索引返回的一项或多项结果行未能满足附加过滤条件时。
- 前过滤通常是个未解决的问题。某些专用的向量数据库提供前过滤算法，但大多数关系数据库（包括 ClickHouse）会回退到精确邻居搜索，即没有索引的暴力扫描。

使用何种策略取决于过滤条件。

*附加过滤是分区键的一部分*

如果附加过滤条件是分区键的一部分，则 ClickHouse 将应用分区裁剪。
例如，一个表按 column `year` 进行范围分区，并运行以下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将修剪所有分区，除了 2025 年的一个。

*附加过滤不能使用索引评估*

如果附加过滤条件无法使用索引（主键索引、跳过索引）进行评估，ClickHouse 将应用后过滤。

*附加过滤可以使用主键索引评估*

如果附加过滤条件可以使用 [主键](mergetree.md#primary-key) （即，它们构成主键的前缀），并且
- 过滤条件在一个分区内消除至少一行，ClickHouse 将回退到对于该部分内“存活”范围的前过滤，
- 过滤条件在一个分区内未消除任何行，ClickHouse 将对该分区执行后过滤。

在实际使用案例中，后一种情况相对不太可能。

*附加过滤可以使用跳过索引评估*

如果附加过滤条件可以使用 [跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax 索引、集合索引等）进行评估，Clickhouse 将执行后过滤。
在这种情况下，首先评估向量相似度索引，因为预计相对于其他跳过索引将删除最多的行。

为了更精细地控制后过滤与前过滤，可以使用两个设置：

设置 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy)（默认值： `auto` 实现上述启发式方法）可以设置为 `prefilter`。
这在附加过滤条件极具选择性时强制前过滤是有用的。
例如，以下查询可能受益于前过滤：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设仅有非常少量的书籍价格低于 2 美元，后过滤可能返回零行，因为向量索引返回的前 10 个匹配项可能都价格高于 2 美元。
通过强制前过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 首先找到所有价格低于 2 美元的书籍，然后对找到的书籍执行暴力向量搜索。

作为解决上述问题的一种替代方法，设置 [vector_search_postfilter_multiplier](../../../operations/settings/settings#vector_search_postfilter_multiplier)（默认值： `1.0`）可能配置为大于 `1.0` 的值（例如， `2.0`）。
从向量索引中获取的最近邻数量乘以设置值，然后对这些行应用附加过滤条件以返回 LIMIT 多行。
例如，我们可以再次进行查询，但使用乘数 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_postfilter_multiplier = 3.0;
```

ClickHouse 将从每个部分的向量索引中提取 3.0 x 10 = 30 个最近邻，然后评估附加过滤条件。
仅会返回十个最近的邻居。
我们注意到，设置 `vector_search_postfilter_multiplier` 可以缓解问题，但在极端情况下（非常选择性的 WHERE 条件）仍然可能返回少于 N 请求的行。

### 性能调优 {#performance-tuning}

**调优压缩**

在几乎所有的使用案例中，基础列中的向量是稠密的，压缩效果不佳。
因此，[压缩](/sql-reference/statements/create/table.md#column_compression_codec) 会减慢对向量列的插入和读取。
因此，我们建议禁用压缩。
为此，请对向量列指定 `CODEC(NONE)`，如下所示：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似度索引的生命周期与部分的生命周期相绑定。
换句话说，每当创建具有定义的向量相似度索引的新部分时，索引也会创建。
这通常在 [插入](https://clickhouse.com/docs/guides/inserting-data) 数据或在 [合并](https://clickhouse.com/docs/merges) 期间发生。
不幸的是，HNSW 以长时间索引创建而著称，这可能显著减慢插入和合并速度。
向量相似度索引理想情况下仅在数据不变或很少更改时使用。

要加速索引创建，可以使用以下技术：

首先，可以并行化索引创建。
最大索引创建线程数可以使用服务器设置 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 来配置。
为了实现最佳性能，设置值应配置为 CPU 核心的数量。

第二，为了加速 INSERT 语句，用户可以通过会话设置 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用对新插入部分创建跳过索引。
在这种部分上执行的 SELECT 查询将回退到精确搜索。
由于插入部分的大小通常与总表大小相比是小的，因此对此的性能影响预计是微不足道的。

第三，为了加速合并，用户可以通过会话设置 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用对已合并部分创建跳过索引。
这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 一起使用，可对向量相似度索引的生命周期提供显式控制。
例如，索引创建可以推迟，直到所有数据被摄取，或直到低系统负载（如周末）期间。

**调优索引使用**

SELECT 查询需要将向量相似度索引加载到主内存中才能使用它们。
为了避免相同的向量相似度索引重复加载到主内存中，ClickHouse 提供了专用的内存缓存来存储这种索引。
这个缓存越大，发生不必要加载的次数就越少。
最大缓存大小可以通过服务器设置 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 来配置。
默认情况下，缓存大小可以增长到 5 GB。

向量相似度索引缓存的当前大小显示在 [system.metrics](../../../operations/system-tables/metrics.md):

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheSize'
```

带有某个查询 ID 的查询的缓存命中和未命中可从 [system.query_log](../../../operations/system-tables/query_log.md) 中获取：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产使用案例，我们建议将缓存大小设置得足够大，以确保所有向量索引始终保留在内存中。

### 管理和监控 {#administration}

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

### 与常规跳过索引的区别 {#differences-to-regular-skipping-indexes}

与所有常规 [跳过索引](/optimize/skipping-indexes) 一样，向量相似度索引也是构建在粒度上的，每个索引块由 `GRANULARITY = [N]` 个粒度构成（默认情况下，[N] = 1，适用于普通跳过索引）。
例如，如果表的主索引粒度为 8192（设置 `index_granularity = 8192`），且 `GRANULARITY = 2`，则每个索引块将包含 16384 行。
然而，近似邻居搜索的数据结构和算法本质上是面向行的。
它们存储一组行的紧凑表示，并且也为向量搜索查询返回行。
这导致向量相似度索引的行为与普通跳过索引存在一些相当不直观的区别。

当用户在一列上定义向量相似度索引时，ClickHouse 在内部为每个索引块创建一个向量相似度 “子索引”。
子索引是“局部”的，因为它只知道其所包含索引块的行。
在之前的例子中，假设一列有 65536 行，我们得到四个索引块（跨越八个粒度）以及每个索引块的向量相似度子索引。
理论上，子索引能够直接返回其索引块内 N 个最近点的行。
然而，由于 ClickHouse 以粒度为粒度的方式将数据从磁盘加载到内存，子索引将匹配行推断为粒度粒度。
这与普通跳过索引在索引块粒度上跳过数据的方式不同。

`GRANULARITY` 参数决定了创建多少个向量相似度子索引。
较大的 `GRANULARITY` 值意味着更少但更大的向量相似度子索引，直到达到列（或列的数据部分）只有单个子索引的程度。
在这种情况下，子索引对列的所有行具有“全局”视图，可以直接返回与相关行的所有粒度（最多有 `LIMIT [N]` 个这样的粒度）。
在第二步中，ClickHouse 将加载这些粒度，并通过对粒度中的所有行进行暴力距离计算来识别实际最佳行。
当 `GRANULARITY` 值较小时，每个子索引返回最多 `LIMIT N` 个粒度。
因此，需要加载和后过滤的粒度更多。
请注意，两个情况下的搜索准确度均相同，只有处理性能有所不同。
通常建议对向量相似度索引使用较大的 `GRANULARITY`，并仅在出现向量相似度结构过度内存消耗等问题时降级到较小的 `GRANULARITY` 值。
如果没有为向量相似度索引指定 `GRANULARITY`，默认值为 1 亿。

### 示例 {#approximate-nearest-neighbor-search-example}

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

## 参考文献 {#references}

博客：
- [使用 ClickHouse 的向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 的向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)
