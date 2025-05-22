---
'description': 'Documentation for 精确和近似最近邻搜索'
'keywords':
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
'sidebar_label': '精确和近似最近邻搜索'
'slug': '/engines/table-engines/mergetree-family/annindexes'
'title': '精确和近似最近邻搜索'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 精确与近似最近邻搜索

在多维（向量）空间中查找给定点的 N 个最近点的问题被称为 [最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)。
解决最近邻搜索有两种一般方法：
- 精确最近邻搜索计算给定点与向量空间中所有点之间的距离。这确保了最佳的准确性，即返回的点保证是真正的最近邻。由于向量空间被完全遍历，精确最近邻搜索在实际应用中可能过于缓慢。
- 近似最近邻搜索指的是一组技术（例如，图和随机森林等特殊数据结构），其计算结果的速度远快于精确最近邻搜索。结果的准确性通常对于实际使用来说是“足够好”的。许多近似技术提供参数以调整结果准确性与搜索时间之间的权衡。

最近邻搜索（精确或近似）可以用 SQL 表示如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在类型为数组的列 `vectors` 中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，并作为公共表表达式提供。
`<DistanceFunction>` 计算参考点与所有存储点之间的距离。
可以使用任何可用的 [距离函数](/sql-reference/functions/distance-functions)。
`<N>` 指定应该返回多少个邻居。

## 精确最近邻搜索 {#exact-nearest-neighbor-search}

可以直接使用上述 SELECT 查询执行精确最近邻搜索。
此类查询的运行时间通常与存储的向量数量及其维度成正比，即数组元素的数量。
另外，由于 ClickHouse 对所有向量进行暴力扫描，运行时间还取决于查询的线程数量（参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。

加速精确最近邻搜索的一种常见方法是使用较低精度的 [float 数据类型](../../../sql-reference/data-types/float.md)。
例如，如果向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`，则数据大小减半，查询运行时间预计也会减半。
这种方法称为量化，尽管对所有向量进行了全面扫描，但它可能降低结果的准确性。
如果精度损失是可以接受的，取决于使用案例，并且通常需要实验。

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

ClickHouse 提供了一种特殊的“向量相似性”索引来执行近似最近邻搜索。

:::note
向量相似性索引目前处于实验阶段。
要启用它们，请首先运行 `SET allow_experimental_vector_similarity_index = 1`。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中打开问题。
:::

### 创建向量相似性索引 {#creating-a-vector-similarity-index}

可以在新表上创建向量相似性索引，如下所示：

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

或者，要向现有表添加向量相似性索引：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似性索引是特殊类型的跳过索引（参见 [这里](mergetree.md#table_engine-mergetree-data_skipping-indexes) 和 [这里](../../../optimize/skipping-indexes)）。
因此，上述 `ALTER TABLE` 语句仅使索引构建为将来插入到表中的新数据。
要为现有数据也构建索引，需要将其物化：

```sql
ALTER TABLE table MATERIALIZE <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是
- `L2Distance`，[欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)，表示在欧几里得空间中两点之间的线段长度，或
- `cosineDistance`，[余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)，表示两条非零向量之间的角度。

对于规范化数据，通常最佳选择是 `L2Distance`，否则建议使用 `cosineDistance` 来补偿规模。

`<dimensions>` 指定底层列中的数组基数（元素数量）。
如果 ClickHouse 在索引创建过程中发现数组的基数不同，则索引会被丢弃并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引颗粒的大小（见 [这里](../../../optimize/skipping-indexes)）。
默认值为 1 亿，适用于大多数用例，但也可以调整。
我们建议仅对了解所做影响的高级用户进行调整（见 [下文](#differences-to-regular-skipping-indexes)）。

向量相似性索引是通用的，它们可以容纳不同的近似搜索方法。
实际上使用的方法由参数 `<type>` 指定。
到目前为止，唯一可用的方法是 HNSW （[学术论文](https://arxiv.org/abs/1603.09320)），这是一种基于层次接近图的流行且先进的近似向量搜索技术。
如果使用 HNSW 作为类型，用户可以选择性地指定进一步的 HNSW 特定参数：

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
- `<quantization>` 控制接近图中向量的量化。可能的值为 `f64`、`f32`、`f16`、`bf16` 或 `i8`。默认值为 `bf16`。请注意，此参数不影响底层列中向量的表示。
- `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值为 `0` 表示使用默认值。
- `<hnsw_candidate_list_size_for_construction>` 控制 HNSW 图构建过程中动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值为 `0` 表示使用默认值。

所有 HNSW 特定参数的默认值在大多数用例中有效。因此，我们不建议自定义 HNSW 特定参数。

适用其他限制：
- 向量相似性索引只能构建在类型为 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列上。不可接受可空和低卡路里浮点数组，例如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))`。
- 向量相似性索引必须构建在单列上。
- 向量相似性索引可以在计算表达式上构建（例如，`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但此类索引不能在以后用于近似邻居搜索。
- 向量相似性索引要求底层列中的所有数组都有 `<dimension>` 许多元素 - 这在索引创建期间进行检查。为了尽早检测此要求的违规，用户可以为向量列添加约束（/sql-reference/statements/create/table.md#constraints），例如，`CONSTRAINT same_length CHECK length(vectors) = 256`。
- 同样，底层列中的数组值不得为空（`[]`）或具有默认值（也为 `[]`）。

### 使用向量相似性索引 {#using-a-vector-similarity-index}

:::note
要使用向量相似性索引，设置 [compatibility](../../../operations/settings/settings.md) 必须为 `''`（默认值）或 `'25.1'` 或更新版本。
:::

向量相似性索引支持以下形式的 SELECT 查询：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse 的查询优化器尝试匹配上述查询模板并利用可用的向量相似性索引。
查询只能使用向量相似性索引，如果 SELECT 查询中的距离函数与索引定义中的距离函数相同。

高级用户可以为设置 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search) 提供自定义值（也称为 HNSW 超参数 “ef_search”），以调整搜索期间候选列表的大小（例如， `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
该设置的默认值 256 在大多数用例中效果良好。
更高的设置值意味着更好的准确性，但会造成更慢的性能。

如果查询可以使用向量相似性索引，ClickHouse 会检查 SELECT 查询中提供的 LIMIT `<N>` 是否在合理范围内。
更具体来说，如果 `<N>` 大于设置 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的默认值 100 的值，将返回错误。
过大的 LIMIT 值可能会降低搜索速度，通常表明使用错误。

要检查 SELECT 查询是否使用了向量相似性索引，可以在查询前加上 `EXPLAIN indexes = 1`。

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

在此示例中，1 百万个向量存储在 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 中，每个维度为 1536，存储在 575 个颗粒中，即每个颗粒 1.7k 行。
查询请求 10 个邻居，向量相似性索引在 10 个不同的颗粒中找到这 10 个邻居。
在查询执行期间将读取这 10 个颗粒。

当输出包含 `Skip` 以及向量索引的名称和类型（在示例中为 `idx` 和 `vector_similarity`）时，表示使用了向量相似性索引。
在这种情况下，向量相似性索引丢弃了四个颗粒中的两个，即 50% 的数据。
可以丢弃更多颗粒，则索引使用的效果越明显。

:::tip
要强制使用索引，可以在 SELECT 查询中使用设置 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices)（将索引名称作为设置值）。
:::

**后过滤与前过滤**

用户可以选择性地为 SELECT 查询指定附加过滤条件的 `WHERE` 子句。
ClickHouse 将使用后过滤或前过滤策略来评估这些过滤条件。
简而言之，这两种策略确定过滤器评估的顺序：
- 后过滤意味着首先评估向量相似性索引，随后 ClickHouse 评估在 `WHERE` 子句中指定的附加过滤器。
- 前过滤意味着过滤器评估顺序正好相反。

这两种策略具有不同的权衡：
- 后过滤存在一般性问题，可能返回少于 `LIMIT <N>` 子句请求的行数。当由向量相似性索引返回的一个或多个结果行未能满足附加过滤条件时，就会发生这种情况。
- 前过滤通常是一个未解决的问题。某些专业向量数据库提供前过滤算法，但大多数关系数据库（包括 ClickHouse）将回退到精确邻居搜索，即没有索引的暴力扫描。

使用哪种策略取决于过滤条件。

*附加过滤器是分区键的一部分*

如果附加过滤条件是分区键的一部分，则 ClickHouse 将应用分区裁剪。
例如，若一个表按列 `year` 范围分区，并运行以下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将修剪掉除 2025 年之外的所有分区。

*附加过滤器不能使用索引评估*

如果附加过滤条件不能使用索引（主键索引、跳过索引）进行评估，则 ClickHouse 将应用后过滤。

*附加过滤器可以使用主键索引评估*

如果附加过滤条件可以使用 [主键](mergetree.md#primary-key) 进行评估（即它们形成主键的前缀），且
- 过滤条件在某个部分中消除了至少一行，则 ClickHouse 将对于该部分中的“存活”范围回退到前过滤，
- 过滤条件在部分中未消除任何行，则 ClickHouse 将对该部分执行后过滤。

在实际用例中，后一种情况相对不太可能。

*附加过滤器可以使用跳过索引评估*

如果附加过滤条件可以使用 [跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes) 进行评估（minmax 索引、集合索引等），ClickHouse 会执行后过滤。
在此情况下，首先评估向量相似性索引，因为预计它将相对于其他跳过索引删除最多的行。

为了更精细地控制后过滤与前过滤，可以使用两个设置：

设置 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy)（默认值：`auto`，其实现以上启发式策略）可以设置为 `prefilter`。
这对在附加过滤条件非常选择性的情况下强制执行前过滤很有用。
例如，以下查询可能会从前过滤中受益：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设只有极少数书籍的价格低于 2 美元，后过滤可能返回零行，因为向量索引返回的前 10 名匹配项可能都定价在 2 美元以上。
通过强制前过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 首先找到所有价格低于 2 美元的书籍，然后对找到的书籍执行暴力向量搜索。

另一种解决上述问题的方法是将设置 [vector_search_postfilter_multiplier](../../../operations/settings/settings#vector_search_postfilter_multiplier)（默认值：`1.0`）配置为大于 `1.0` 的值（例如，`2.0`）。
从向量索引获取的最近邻的数量将乘以设置值，然后应用附加过滤以返回 LIMIT 数量的行。
例如，我们可以再次查询，但乘数为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_postfilter_multiplier = 3.0;
```

ClickHouse 将从每个部分的向量索引中获取 3.0 x 10 = 30 个最近邻，然后评估附加过滤。
只有十个最近邻将被返回。
我们注意到设置 `vector_search_postfilter_multiplier` 可以缓解问题，但在极端情况下（非常选择性的 WHERE 条件），仍然可能返回的行数少于请求的 N 行。

### 性能调优 {#performance-tuning}

**调优压缩**

在几乎所有的用例中，底层列中的向量都是密集的，压缩效果不好。
因此，[压缩](/sql-reference/statements/create/table.md#column_compression_codec) 会减慢对向量列的插入和读取。
因此，我们建议禁用压缩。
为此，为向量列指定 `CODEC(NONE)`，如下所示：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似性索引的生命周期与部分的生命周期紧密相关。
换句话说，每当创建带有定义的向量相似性索引的新部分时，索引也会创建。
通常发生在数据被 [插入](https://clickhouse.com/docs/guides/inserting-data) 或[合并](https://clickhouse.com/docs/merges) 时。
不幸的是，HNSW 以较长的索引创建时间而闻名，这可能会明显减慢插入和合并速度。
理想情况下，仅在数据是不可变或很少更改的情况下使用向量相似性索引。

为加速索引创建，可以使用以下技术：

首先，索引创建可以并行化。
可以通过服务器设置 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 配置最大索引创建线程数。
为了获得最佳性能，设置值应配置为 CPU 核心数。

其次，为加速 INSERT 语句，用户可以使用会话设置 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用在新插入部分上创建跳过索引。
在此类部分上的 SELECT 查询将回退到精确搜索。
由于插入的部分相较于总表大小通常较小，因此这的性能影响预计是微不足道的。

第三，为了加速合并，用户可以使用会话设置 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用在合并部分上创建跳过索引。
这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 一起，提供了对向量相似性索引生命周期的显式控制。
例如，索引创建可以推迟到所有数据已被摄取或在系统负载低的期间（如周末）。

**调优索引使用**

SELECT 查询需要将向量相似性索引加载到主内存中才能使用它们。
为了避免重复加载相同的向量相似性索引到主内存中，ClickHouse 提供了一个专用的内存缓存来存储此类索引。
缓存越大，发生不必要加载的次数就越少。
可以使用服务器设置 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 配置最大缓存大小。
默认情况下，缓存的大小可以增长到 5 GB。

向量相似性索引缓存的当前大小显示在 [system.metrics](../../../operations/system-tables/metrics.md) 中：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheSize'
```

可以从 [system.query_log](../../../operations/system-tables/query_log.md) 中获取某个查询 ID 的缓存命中和未命中信息：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产用例，我们建议将缓存设置得足够大，以便所有向量索引始终保持在内存中。

### 管理与监控 {#administration}

可以从 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) 获取向量相似性索引的磁盘大小：

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

与所有常规 [跳过索引](/optimize/skipping-indexes) 一样，向量相似性索引是在颗粒上构建的，每个索引块由 `GRANULARITY = [N]` 颗粒组成（对于正常的跳过索引，`[N]` 默认值为 1）。
例如，如果表的主索引粒度为 8192（设置 `index_granularity = 8192`）且 `GRANULARITY = 2`，则每个索引块将包含 16384 行。
然而，近似邻居搜索的数据结构和算法本质上是面向行的。
它们存储一组行的紧凑表示，并且也返回向量搜索查询的行。
这导致向量相似性索引的行为与正常跳过索引在某些方面具有一些相当不直观的差异。

当用户在某列上定义向量相似性索引时，ClickHouse 将在内部为每个索引块创建一个向量相似性“子索引”。
子索引是“局部”的，因为它仅了解其包含索引块的行。
在前面的示例中，假设某列有 65536 行，我们获得四个索引块（跨越八个颗粒），并且每个索引块都有一个向量相似性子索引。
理论上，子索引能够直接返回其索引块内 N 个最近点的行。
但是，由于 ClickHouse 按颗粒的粒度从磁盘加载数据到内存，子索引按颗粒粒度推断匹配行。
这与正常跳过索引不同，正常跳过索引是根据索引块的粒度跳过数据。

`GRANULARITY` 参数决定了创建多少个向量相似性子索引。
较大的 `GRANULARITY` 值意味着更少但更大的向量相似性子索引，直到某列（或某列的数据部分）只具有一个子索引。
在这种情况下，子索引对所有列行具有“全局”视野，并且可以直接返回该列（部分）中包含相关行的所有颗粒（至多有 `LIMIT [N]` 个这样的颗粒）。
在第二步中，ClickHouse 将加载这些颗粒，并通过对所有颗粒的所有行执行暴力距离计算来识别实际上最好的行。
若使用小的 `GRANULARITY` 值，每个子索引将返回多达 `LIMIT N` 个颗粒。
因此，需加载更多颗粒并进行后过滤。
请注意，在两种情况下搜索的准确性是一样好的，只是处理性能存在差异。
通常建议为向量相似性索引使用较大的 `GRANULARITY`，仅在出现内存消耗过大的问题时才回退到较小的 `GRANULARITY` 值。
如果没有为向量相似性索引指定 `GRANULARITY`，则默认值为 1 亿。

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
- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)
