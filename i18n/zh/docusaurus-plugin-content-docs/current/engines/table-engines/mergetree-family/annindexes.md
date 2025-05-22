import BetaBadge from '@theme/badges/BetaBadge';

# 精确与近似最近邻搜索

在多维（向量）空间中查找给定点的 N 个最近点的问题称为 [最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)。用于解决最近邻搜索的两种一般方法如下：
- 精确最近邻搜索计算给定点与向量空间中所有点之间的距离。这确保了最佳的准确性，即返回的点保证是真正的最近邻。由于全面探查了向量空间，精确最近邻搜索在实际使用中可能会过于缓慢。
- 近似最近邻搜索指的是一组技术（例如，图和随机森林等特殊数据结构），其计算结果比精确最近邻搜索快得多。结果的准确性通常对于实际使用来说是“足够好的”。许多近似技术提供了参数来调整结果准确性与搜索时间之间的权衡。

最近邻搜索（精确或近似）可以用 SQL 表示如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在一个类型为数组的列 `vectors` 中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。参考向量是一个常量数组，并作为公用表表达式给出。`<DistanceFunction>` 计算参考点与所有存储点之间的距离。可以使用任何可用的 [距离函数](/sql-reference/functions/distance-functions)。`<N>` 指定应该返回多少个邻居。

## 精确最近邻搜索 {#exact-nearest-neighbor-search}

可以照原样使用上面的 SELECT 查询进行精确最近邻搜索。此类查询的运行时间通常与存储的向量数量及其维度成比例，即数组元素的个数。此外，由于 ClickHouse 对所有向量执行暴力扫描，运行时间还取决于查询的线程数量（请参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。

加速精确最近邻搜索的常见方法之一是使用较低精度的 [float 数据类型](../../../sql-reference/data-types/float.md)。例如，如果向量以 `Array(BFloat16)` 而不是 `Array(Float32)` 存储，则数据大小减半，查询运行时间也预期减半。这种方法称为量化，尽管对所有向量进行了全面扫描，它可能会降低结果的准确性。是否可以接受精度损失取决于使用案例，并通常需要实验。

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
向量相似性索引当前为实验性功能。
要启用它们，请首先运行 `SET allow_experimental_vector_similarity_index = 1`。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交问题。
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

或者，要将向量相似性索引添加到现有表中：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似性索引是特殊类型的跳过索引（请参见 [这里](mergetree.md#table_engine-mergetree-data_skipping-indexes) 和 [这里](../../../optimize/skipping-indexes)）。因此，上面的 `ALTER TABLE` 语句只会导致索引在以后插入到表中的新数据上构建。要为现有数据也构建索引，您需要使其物化：

```sql
ALTER TABLE table MATERIALIZE <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是
- `L2Distance`，即 [欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)，表示欧几里得空间中两点之间的线段长度，或
- `cosineDistance`，即 [余弦距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)，表示两个非零向量之间的夹角。

对于归一化数据，通常选择 `L2Distance` 最佳，否则建议使用 `cosineDistance` 来弥补范围的影响。

`<dimensions>` 指定底层列的数组基数（元素数量）。如果 ClickHouse 在索引创建过程中找到具有不同基数的数组，则该索引将被丢弃并返回错误。

可选的 GRANULARITY 参数 `<N>` 表示索引颗粒的大小（请参见 [这里](../../../optimize/skipping-indexes)）。默认值 1 亿对于大多数使用案例应该效果不错，但也可以进行调优。我们建议仅在了解所做之事的高级用户调整此值（见 [下文](#differences-to-regular-skipping-indexes)）。

向量相似性索引是通用的，因为它们可以适应不同的近似搜索方法。实际上使用的方法由参数 `<type>` 指定。截至目前，唯一可用的方法是 HNSW ([学术论文](https://arxiv.org/abs/1603.09320))，一种基于分层邻近图的流行且最先进的近似向量搜索技术。如果 HNSW 被用作类型，则用户可以选择性地指定进一步的 HNSW 特定参数：

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

这些 HNSW 特定参数可用：
- `<quantization>` 控制临近图中向量的量化。可选值为 `f64`、`f32`、`f16`、`bf16` 或 `i8`。默认值为 `bf16`。注意，此参数不影响底层列中向量的表示。
- `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值为 `0` 意思是使用默认值。
- `<hnsw_candidate_list_size_for_construction>` 控制 HNSW 图构建过程中动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值为 `0` 意思是使用默认值。

所有 HNSW 特定参数的默认值在大多数使用案例中运行良好。因此我们不建议自定义 HNSW 特定参数。

还适用进一步的限制：
- 向量相似性索引只能建立在 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 类型的列上。诸如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))` 的可空和值低基数的浮点数组是不允许的。
- 向量相似性索引必须建立在单列上。
- 向量相似性索引可以建立在计算表达式上（例如，`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但这样的索引不能用于后续的近似邻居搜索。
- 向量相似性索引要求底层列中的所有数组具有 `<dimension>` 个元素 - 这在索引创建过程中会被检查。为尽早检测出对这一要求的违反，用户可以为向量列添加一个 [约束](/sql-reference/statements/create/table.md#constraints)，例如，`CONSTRAINT same_length CHECK length(vectors) = 256`。
- 同样，底层列中的数组值不得为空 (`[]`) 或具有默认值（同样是 `[]`）。

### 使用向量相似性索引 {#using-a-vector-similarity-index}

:::note
要使用向量相似性索引，设置 [compatibility](../../../operations/settings/settings.md) 必须为 `''`（默认值），或 `'25.1'` 或更新版本。
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

ClickHouse 的查询优化器尝试匹配上述查询模板并利用可用的向量相似性索引。查询只能使用向量相似性索引，如果 SELECT 查询中的距离函数与索引定义中的距离函数相同。

高级用户可以提供自定义值，用于设置 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（也称为 HNSW 超参数“ef_search”），以调整搜索时候候选列表的大小（例如，`SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。默认设置值 256 在大多数使用案例中效果良好。更高的设置值意味着在牺牲性能的情况下获得更好的准确性。

如果查询可以使用向量相似性索引，ClickHouse 会检查 SELECT 查询中提供的 LIMIT `<N>` 是否在合理范围内。更具体地说，如果 `<N>` 大于设置 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的值（默认值为 100），则会返回错误。过大的 LIMIT 值可能会减慢搜索速度，并通常指示使用错误。

要检查 SELECT 查询是否使用了向量相似性索引，可以在查询前加上 `EXPLAIN indexes = 1`。

作为示例，查询

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

在这个例子中，来自 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 的 100 万个向量，每个向量的维度为 1536，存储在 575 个颗粒中，即每个颗粒 1.7k 行。查询要求返回 10 个邻居，而向量相似性索引在 10 个不同的颗粒中找到了这 10 个邻居。这 10 个颗粒将在查询执行中被读取。

如果输出中包含 `Skip` 及向量索引的名称和类型（在示例中为 `idx` 和 `vector_similarity`），则使用了向量相似性索引。在这种情况下，向量相似性索引丢弃了四个颗粒中的两个，即 50% 的数据。可以丢弃的颗粒越多，索引使用的效率越高。

:::tip
要强制使用索引，您可以运行带有设置 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) 的 SELECT 查询（将索引名称作为设置值提供）。
:::

**后过滤和前过滤**

用户可以选择性地在 SELECT 查询中指定 `WHERE` 子句以添加额外的过滤条件。ClickHouse 将使用后过滤或前过滤策略评估这些过滤条件。简而言之，这两种策略确定过滤器评估的顺序：
- 后过滤意味着首先评估向量相似性索引，随后 ClickHouse 评估 `WHERE` 子句中指定的额外过滤器。
- 前过滤意味着过滤器评估的顺序正好相反。

这两种策略具有不同的权衡：
- 后过滤的总体问题是，它可能返回的行数少于 `LIMIT <N>` 子句中请求的行数。当向量相似性索引返回的一个或多个结果行未能满足额外过滤条件时，会发生这种情况。
- 前过滤通常是一个未解决的问题。某些专用的向量数据库提供前过滤算法，但大多数关系数据库（包括 ClickHouse）将退回到精确邻居搜索，即不使用索引的暴力扫描。

使用何种策略取决于过滤条件。

*附加过滤器是分区键的一部分*

如果附加过滤条件是分区键的一部分，则 ClickHouse 将应用分区修剪。例如，一个表按列 `year` 进行范围分区，执行以下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将修剪掉除 2025 之外的所有分区。

*附加过滤器无法使用索引进行评估*

如果无法使用索引（主键索引、跳过索引）评估附加过滤条件，ClickHouse 将应用后过滤。

*附加过滤器可以使用主键索引进行评估*

如果附加过滤条件可以利用 [主键](mergetree.md#primary-key) 进行评估（即，它们形成主键的前缀）并且
- 过滤条件在某个部分内删除了至少一行，ClickHouse 将对部分内“存活”的范围回退到前过滤，
- 过滤条件在某个部分内未删除任何行，ClickHouse 将对该部分执行后过滤。

在实际用例中，后一种情况相对不太可能。

*附加过滤器可以使用跳过索引进行评估*

如果附加过滤条件可以利用 [跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes)（最小最大索引、集合索引等）进行评估，ClickHouse 将执行后过滤。在这种情况下，向量相似性索引将优先评估，因为预计其将相对于其他跳过索引去除最多的行。

为了更好地控制后过滤与前过滤，可以使用两个设置：

设置 [vector_search_filter_strategy](../../../operations/settings/settings.md#vector_search_filter_strategy)（默认值：`auto`，实现上述启发式）可设置为 `prefilter`。在附加过滤条件极具选择性的情况下，这非常有用。例如，以下查询可能受益于前过滤：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设只有非常少量的书籍价格低于 2 美元，则后过滤可能返回零行，因为向量索引返回的前 10 个匹配都可能价格高于 2 美元。通过强制前过滤（将 `SETTINGS vector_search_filter_strategy = 'prefilter'` 添加到查询中），ClickHouse 首先找到所有价格低于 2 美元的书籍，然后对找到的书籍执行暴力向量搜索。

作为解决上述问题的另一种方法，可以将设置 [vector_search_postfilter_multiplier](../../../operations/settings/settings.md#vector_search_postfilter_multiplier)（默认值：`1.0`）配置为大于 `1.0` 的值（例如，`2.0`）。从向量索引中获取的最近邻数乘以该设置值，然后在这些行上应用附加过滤以返回 LIMIT 行。例如，我们可以再次查询，但乘数为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_postfilter_multiplier = 3.0;
```

ClickHouse 将从每个部分的向量索引中获取 3.0 x 10 = 30 个最近邻，然后评估附加过滤。只有十个最接近的邻居将被返回。我们注意到设置 `vector_search_postfilter_multiplier` 可以缓解此问题，但在极端情况下（非常选择性的 WHERE 条件），仍然可能返回少于请求的 N 行。

### 性能调优 {#performance-tuning}

**调优压缩**

在几乎所有使用案例中，底层列中的向量都是稠密的，压缩效果不佳。因此，[压缩](/sql-reference/statements/create/table.md#column_compression_codec) 会减慢对向量列的插入和读取。我们因此建议禁用压缩。为此，请为向量列指定 `CODEC(NONE)`，如下所示：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似性索引的生命周期与分区的生命周期绑定。换句话说，每当创建一个具有定义的向量相似性索引的新分区时，索引也会创建。这通常发生在数据被 [插入](https://clickhouse.com/docs/guides/inserting-data) 或在 [合并](https://clickhouse.com/docs/merges) 时。不幸的是，HNSW 的索引创建时间很长，这可能会显著减慢插入和合并的速度。向量相似性索引理想情况下仅在数据不变或少量变化时使用。

为了加速索引创建，可以使用以下技术：

首先，可以并行化索引创建。
索引创建线程的最大数量可以使用服务器设置 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 进行配置。为了获得最佳性能，设置值应配置为 CPU 核心的数量。

其次，为了加速 INSERT 语句，用户可以使用会话设置 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用对新插入部分跳过索引的创建。对这些部分的 SELECT 查询将以精确搜索回退。由于插入的部分相对于整个表的大小往往较小，因此预计对此的性能影响是微不足道的。

第三，为了加速合并，用户可以使用会话设置 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用对合并部分跳过索引的创建。这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 一起应用，为向量相似性索引的生命周期提供了显式控制。例如，可以推迟索引创建，直到所有数据被摄入或直到系统负载降低的时间段，例如周末。

**调优索引使用**

SELECT 查询需要将向量相似性索引加载到主内存中方可使用。为了避免同一向量相似性索引反复加载到主内存，ClickHouse 为此类索引提供了专用的内存缓存。缓存越大，减少无谓的加载越多。最大缓存大小可以使用服务器设置 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 进行配置。默认情况下，缓存可以增大到 5 GB。

向量相似性索引缓存的当前大小显示在 [system.metrics](../../../operations/system-tables/metrics.md) 中：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheSize'
```

某个查询 ID 的缓存命中和未命中可以从 [system.query_log](../../../operations/system-tables/query_log.md) 获取：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产用例，我们建议缓存的大小足够大，以便所有向量索引始终保持在内存中。

### 管理与监控 {#administration}

向量相似性索引的磁盘大小可以从 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) 中获得：

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

与所有常规 [跳过索引](/optimize/skipping-indexes) 一样，向量相似性索引是在颗粒上构建的，每个索引块由 `GRANULARITY = [N]` 个颗粒组成（普通跳过索引的默认值为 `[N] = 1`）。例如，如果表的主键索引粒度为 8192（设置 `index_granularity = 8192`）且 `GRANULARITY = 2`，则每个索引块将包含 16384 行。然而，近似邻居搜索的数据结构和算法在本质上是针对行的。它们存储一组行的紧凑表示，并且还返回用于向量搜索查询的行。这导致了向量相似性索引与普通跳过索引之间在行为上的一些比较直观的差异。

当用户在某列上定义向量相似性索引时，ClickHouse 内部为每个索引块创建一个向量相似性“子索引”。子索引是“局部”的，因为它只知道其包含的索引块中的行。在前面的例子中，如果假设某列有 65536 行，则四个索引块（跨越八个颗粒）以及每个索引块的向量相似性子索引会被获得。子索引理论上能够直接返回其索引块内最近的 N 个点的行。然而，由于 ClickHouse 按照颗粒的粒度从磁盘加载数据，子索引会将匹配的行外推到颗粒粒度。这与普通跳过索引不同，后者是按索引块的粒度跳过数据的。

`GRANULARITY` 参数决定了创建多少个向量相似性子索引。较大的 `GRANULARITY` 值意味着更少但更大的向量相似性子索引，直到某列（或列的数据部分）只有一个子索引。在这种情况下，子索引具有对所有列行的“全局”视图，并可以直接返回具有相关行的列（部分）的所有颗粒（最多有 `LIMIT [N]` 个这样的颗粒）。第二步，ClickHouse 将加载这些颗粒，并通过对颗粒的所有行执行暴力距离计算来识别实际的最佳行。在较小的 `GRANULARITY` 值下，每个子索引返回多达 `LIMIT N` 个颗粒。因此，需要加载和后过滤的颗粒会更多。请注意，在这两种情况下，搜索的准确性是同样好的，只有处理性能不同。通常建议对向量相似性索引使用较大的 `GRANULARITY`，仅在遇到极端情况（如向量相似性结构的内存消耗过大）时才退回较小的 `GRANULARITY` 值。如果未为向量相似性索引指定 `GRANULARITY`，默认值为 1 亿。

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
