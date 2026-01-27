---
description: '精确和近似向量搜索文档'
keywords: ['向量相似搜索', 'ann', 'knn', 'hnsw', '索引（indices）', '索引', '最近邻', '向量搜索']
sidebar_label: '精确和近似向量搜索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '精确和近似向量搜索'
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# 精确与近似向量搜索 \{#exact-and-approximate-vector-search\}

在给定多维（向量）空间中的一个点时，寻找与其距离最近的 N 个点的问题，被称为[最近邻搜索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)，简称向量搜索。
解决向量搜索通常有两种通用方法：

* 精确向量搜索会计算查询点与向量空间中所有点之间的距离。这可以保证尽可能高的准确性，即返回的点一定是实际的最近邻。由于需要对整个向量空间进行穷举搜索，精确向量搜索在真实场景中往往会过于缓慢。
* 近似向量搜索指一类技术（例如使用图或随机森林等特殊数据结构），它们比精确向量搜索能更快地计算结果。结果的准确性通常对实际使用来说“足够好”。许多近似技术都提供参数，用于在结果准确性和搜索时间之间进行权衡调优。

一次向量搜索（无论精确还是近似）可以用 SQL 表达如下：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

向量空间中的点存储在名为 `vectors` 的数组类型列中，例如 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md)。
参考向量是一个常量数组，并通过公用表表达式（CTE）提供。
`&lt;DistanceFunction&gt;` 计算参考点与所有已存储点之间的距离。
可以使用任意可用的[距离函数](/sql-reference/functions/distance-functions)来实现。
`&lt;N&gt;` 指定应返回多少个近邻。


## 精确向量搜索 \{#exact-nearest-neighbor-search\}

可以直接使用上面的 SELECT 查询执行精确向量搜索。
此类查询的运行时间通常与已存储向量的数量及其维度成正比，即数组元素的数量。
此外，由于 ClickHouse 会对所有向量进行暴力扫描（brute-force scan），运行时间还取决于查询使用的线程数（参见设置 [max_threads](../../../operations/settings/settings.md#max_threads)）。

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


## 近似向量搜索 \{#approximate-nearest-neighbor-search\}

### 向量相似度索引 \{#vector-similarity-index\}

ClickHouse 提供了一种专用的“向量相似度”索引，用于执行近似向量搜索。

:::note
向量相似度索引在 ClickHouse 版本 25.8 及更高版本中可用。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

#### 创建向量相似度索引 \{#creating-a-vector-similarity-index\}

可以在新表上按如下方式创建向量相似度索引：

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

或者，可以在现有表上添加向量相似度索引：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

向量相似度索引是一种特殊的跳过索引（参见[这里](mergetree.md#table_engine-mergetree-data_skipping-indexes)和[这里](../../../optimize/skipping-indexes)）。
因此，上面的 `ALTER TABLE` 语句只会为之后插入到该表中的新数据构建索引。
要同时为已有数据构建索引，你需要对索引进行物化：

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

函数 `<distance_function>` 必须是

* `L2Distance`，[Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)（欧几里得距离），表示欧几里得空间中两点之间线段的长度，或
* `cosineDistance`，[cosine distance](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)（余弦距离），表示两个非零向量之间的夹角。

对于已归一化的数据，通常 `L2Distance` 是最佳选择；否则，推荐使用 `cosineDistance` 来补偿尺度差异。

`<dimensions>` 指定底层列中数组的基数（元素数量）。
如果 ClickHouse 在创建索引时发现数组的基数不一致，则会丢弃该索引并返回错误。

可选的 GRANULARITY 参数 `<N>` 指的是索引粒度的大小（参见[此处](../../../optimize/skipping-indexes)）。
默认值 1 亿在大多数用例中应该都能有不错的表现，但也可以进行调优。
我们建议仅由了解其影响的高级用户进行调优（参见[下文](#differences-to-regular-skipping-indexes)）。

向量相似性索引在通用意义上来说是通用的，即可以适配不同的近似搜索方法。
实际使用的方法由参数 `<type>` 指定。
当前唯一可用的近似搜索方法是 HNSW（[academic paper](https://arxiv.org/abs/1603.09320)），这是一种基于分层近邻图的流行且最先进的近似向量搜索技术。
如果将 HNSW 指定为 type，用户还可以选择性地指定更多 HNSW 专用参数：

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

* `<quantization>` 控制邻近图中向量的量化方式。可选值为 `f64`、`f32`、`f16`、`bf16`、`i8` 或 `b1`。默认值为 `bf16`。请注意，此参数不会影响底层列中向量的表示形式。
* `<hnsw_max_connections_per_layer>` 控制每个图节点的邻居数量，也称为 HNSW 超参数 `M`。默认值为 `32`。值为 `0` 表示使用默认值。
* `<hnsw_candidate_list_size_for_construction>` 控制构建 HNSW 图时动态候选列表的大小，也称为 HNSW 超参数 `ef_construction`。默认值为 `128`。值为 `0` 表示使用默认值。

所有 HNSW 专用参数的默认值在大多数用例中都有良好表现。
因此，我们不建议自定义这些 HNSW 专用参数。

此外，还适用以下限制条件：


* 向量相似度索引只能建立在类型为 [Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列上。诸如 `Array(Nullable(Float32))` 和 `Array(LowCardinality(Float32))` 这类可为空或低基数浮点数组不被允许。
* 向量相似度索引必须建立在单个列上。
* 向量相似度索引可以建立在计算表达式上（例如 `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`），但此类索引之后不能用于近似近邻搜索。
* 向量相似度索引要求底层列中的所有数组都具有 `<dimension>` 个元素——这一点会在创建索引时进行检查。为了尽早发现对此要求的违规情况，用户可以为向量列添加一个[约束](/sql-reference/statements/create/table.md#constraints)，例如：`CONSTRAINT same_length CHECK length(vectors) = 256`。
* 同样，底层列中的数组值不能为空（`[]`），也不能为默认值（同样是 `[]`）。

**估算存储和内存占用**

为典型 AI 模型（例如大语言模型，[LLMs](https://en.wikipedia.org/wiki/Large_language_model)）生成的向量由数百或数千个浮点值组成。
因此，单个向量值就可能消耗数千字节的内存。
希望估算表中底层向量列所需存储空间，以及向量相似度索引所需内存的用户，可以使用下面两个公式：

表中向量列的存储占用（未压缩）：

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

以 [DBpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 为例：

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

在执行搜索时，必须将向量相似度索引从磁盘完整加载到内存中。
同样，向量索引也是先在内存中完全构建，然后再保存到磁盘。

加载一个向量索引所需的内存占用：

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

以 [dbpedia 数据集](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 为例：

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上述公式没有将向量相似度索引在分配运行时数据结构（例如预分配的缓冲区和缓存）时所需的额外内存计算在内。


#### 使用向量相似度索引 \{#using-a-vector-similarity-index\}

:::note
要使用向量相似度索引，设置项 [compatibility](../../../operations/settings/settings.md) 必须为 `''`（默认值），或者 `'25.1'` 及更新版本。
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

高级用户可以为设置项 [hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（也称为 HNSW 超参数 &quot;ef&#95;search&quot;）提供自定义值，以在搜索过程中调优候选列表的大小（例如 `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
该设置项的默认值 256 在绝大多数用例中表现良好。
更高的设置值意味着更高的准确性，但会以更慢的性能为代价。

如果查询可以使用向量相似度索引，ClickHouse 会检查在 SELECT 查询中提供的 LIMIT `<N>` 是否处于合理范围内。
更具体地说，如果 `<N>` 大于设置项 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) 的值（默认值为 100），则会返回错误。
过大的 LIMIT 值会减慢搜索速度，并且通常表示用法错误。

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

在这个示例中，[dbpedia dataset](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 中的 100 万个向量（每个向量维度为 1536）被存储在 575 个 granule 中，即每个 granule 约 1.7k 行。
查询请求 10 个近邻，向量相似性索引在 10 个不同的 granule 中找到了这 10 个近邻。
在查询执行过程中会读取这 10 个 granule。

如果输出中包含 `Skip` 以及向量索引的名称和类型（在示例中为 `idx` 和 `vector_similarity`），则表示使用了向量相似性索引。
在这种情况下，向量相似性索引丢弃了 4 个 granule 中的 2 个，即丢弃了 50% 的数据。
能够丢弃的 granule 越多，索引的使用就越高效。

:::tip
若要强制使用索引，可以在运行 SELECT 查询时设置 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices)（将索引名称作为该设置的值提供）。
:::

**后过滤与预过滤**

用户可以选择在 SELECT 查询中通过 `WHERE` 子句指定额外的过滤条件。
ClickHouse 将使用后过滤或预过滤策略来评估这些过滤条件。
简而言之，这两种策略决定了过滤条件的执行顺序：

* 后过滤表示首先评估向量相似性索引，然后 ClickHouse 再评估 `WHERE` 子句中指定的额外过滤条件。
* 预过滤表示过滤条件的评估顺序相反。

这两种策略有不同的权衡：


* 后过滤有一个普遍问题：当向量相似度索引返回的一条或多条结果行未能满足附加过滤条件时，最终返回的行数可能少于 `LIMIT &lt;N&gt;` 子句中请求的行数。
* 预过滤在总体上仍然是一个尚未解决的问题。某些专用向量数据库提供了预过滤算法，但大多数关系型数据库（包括 ClickHouse）会退回到精确邻居搜索，即不使用索引的穷举扫描。

使用哪种策略取决于过滤条件。

*附加过滤条件是分区键的一部分*

如果附加过滤条件是分区键的一部分，则 ClickHouse 会执行分区裁剪（partition pruning）。
例如，某个表按 `year` 列进行范围分区，并运行如下查询：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse 将裁剪掉除 2025 分区之外的所有分区。

*无法使用索引评估的附加过滤条件*

如果附加过滤条件无法使用索引（主键索引、skipping index）进行评估，ClickHouse 将执行后过滤。

*可以使用主键索引评估的附加过滤条件*

如果附加过滤条件可以使用[主键](mergetree.md#primary-key)进行评估（即它们构成主键的前缀），并且

* 如果过滤条件在一个 part 内剔除了至少一行，则 ClickHouse 将改为对该 part 内“存活”的范围执行预过滤，
* 如果过滤条件在一个 part 内没有剔除任何行，则 ClickHouse 将对该 part 执行后过滤。

在实际使用场景中，后一种情况相对不太常见。

*可以使用 skipping index 评估的附加过滤条件*

如果附加过滤条件可以使用[数据跳过索引（skipping indexes）](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax 索引、set 索引等）进行评估，ClickHouse 会执行后过滤。
在这种情况下，会首先评估向量相似度索引，因为预期它相对于其他 skipping indexes 能剔除最多的行。

为了对后过滤与预过滤进行更精细的控制，可以使用两个设置项：

[vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy) 设置（默认值：`auto`，实现了上述启发式策略）可以设为 `prefilter`。
在附加过滤条件极具选择性时，这对于强制启用预过滤非常有用。
例如，下面的查询可能会从预过滤中获益：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

假设只有极少数书籍的价格低于 2 美元，后过滤（post-filtering）可能会返回零行，因为向量索引返回的前 10 个匹配结果的价格可能全部高于 2 美元。
通过强制使用预过滤（在查询中添加 `SETTINGS vector_search_filter_strategy = 'prefilter'`），ClickHouse 会先找到所有价格低于 2 美元的书籍，然后对这些书籍执行一次穷举式（brute-force）向量搜索。

作为解决上述问题的另一种方法，可以将 [vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（默认值：`1.0`，最大值：`1000.0`）配置为大于 `1.0` 的值（例如 `2.0`）。
从向量索引中获取的最近邻数量会乘以该设置的值，然后在这些行上应用额外过滤条件，以返回满足 LIMIT 的行数。
例如，我们可以再次进行查询，但将 multiplier 设置为 `3.0`：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse 将在每个 part 中的向量索引中获取 3.0 x 10 = 30 个最近邻，然后再评估额外的过滤条件。
最终只会返回距离最近的 10 个邻居。
需要注意的是，通过设置 `vector_search_index_fetch_multiplier` 可以缓解这个问题，但在极端情况下（例如 WHERE 条件选择性很强时），仍然可能出现返回的行数少于请求的 N 行的情况。

**重新打分（Rescoring）**


ClickHouse 中的 skip index 通常在 granule 级别进行过滤，即对 skip index 的一次查找（在内部）会返回一个潜在匹配 granule 的列表，从而减少后续扫描中需要读取的数据量。
这对一般的 skip index 效果很好，但在向量相似度索引的场景中，会造成一个“粒度不匹配（granularity mismatch）”的问题。
更具体地说，向量相似度索引会为给定的参考向量确定 N 个最相似向量的行号，但接下来需要将这些行号外推为 granule 编号。
ClickHouse 随后会从磁盘加载这些 granule，并对这些 granule 中的所有向量重新计算距离。
这一步称为重新打分（rescoring），虽然从理论上讲它可以提升准确性——请记住，向量相似度索引只返回*近似*结果——但从性能角度看显然并不理想。

因此，ClickHouse 提供了一项优化：禁用重新打分，直接从索引中返回最相似的向量及其距离。
该优化默认启用，参见设置 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)。
在高层级上的工作方式是：ClickHouse 将最相似的向量及其距离作为一个虚拟列 `_distances` 暴露出来。
要查看这一点，可运行带有 `EXPLAIN header = 1` 的向量搜索查询：

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
在禁用重新打分（`vector_search_with_rescoring = 0`）且启用并行副本的情况下运行的查询，仍可能回退为执行重新打分。
:::


#### 性能调优 \{#performance-tuning\}

**压缩调优**

在几乎所有使用场景中，底层列中的向量都是稠密的，且压缩效果不佳。
因此，[压缩](/sql-reference/statements/create/table.md#column_compression_codec) 会降低向量列的写入和读取性能。
我们因此建议禁用压缩。
为此，请像下面这样为向量列指定 `CODEC(NONE)`：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**调优索引创建**

向量相似度索引的生命周期与分区片段（part）的生命周期绑定。
换句话说，每当创建一个定义了向量相似度索引的新分区片段时，索引也会随之创建。
这通常发生在数据被[插入](https://clickhouse.com/docs/guides/inserting-data)时或在[合并](https://clickhouse.com/docs/merges)过程中。
众所周知，HNSW 的索引创建耗时较长，会显著拖慢插入和合并操作。
向量相似度索引在理想情况下只应用于不可变或很少变更的数据。

为了加速索引创建，可以采用以下技术：

首先，可以并行化索引创建过程。
索引创建线程的最大数量可以通过服务器设置 [max&#95;build&#95;vector&#95;similarity&#95;index&#95;thread&#95;pool&#95;size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) 进行配置。
为获得最佳性能，该设置值应配置为 CPU 核心数。

其次，为了加速 INSERT 语句，用户可以通过会话设置 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) 禁用在新插入分区片段上创建跳过索引（skipping index）。
对此类分区片段执行的 SELECT 查询将回退为精确搜索。
由于插入分区片段相对于整个表的大小通常较小，因此这种回退带来的性能影响预计可以忽略不计。

第三，为了加速合并，用户可以通过会话设置 [materialize&#95;skip&#95;indexes&#95;on&#95;merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) 禁用在合并后的分区片段上创建跳过索引。
这与语句 [ALTER TABLE [...] MATERIALIZE INDEX [...]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 结合使用，可以对向量相似度索引的生命周期进行显式控制。
例如，可以将索引创建延后到所有数据都已摄取完成之后，或延后到系统负载较低的时间段（例如周末）。

**调优索引用法**

SELECT 查询在使用向量相似度索引时，需要将这些索引加载到主内存中。
为了避免同一个向量相似度索引被反复加载到主内存中，ClickHouse 为此类索引提供了专用的内存缓存。
缓存越大，不必要的加载就越少。
最大缓存大小可以通过服务器设置 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) 进行配置。
默认情况下，缓存最大可以增长到 5 GB。

:::note
向量相似度索引缓存存储的是向量索引粒度（granule）。
如果单个向量索引粒度的大小超过缓存大小，则不会被缓存。
因此，请务必根据“估算存储与内存消耗”中的公式或 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) 计算向量索引大小，并相应地设置缓存大小。
:::

*我们再次强调，在排查向量搜索查询变慢的问题时，首先应当检查并在必要时增大向量索引缓存。*

向量相似度索引缓存的当前大小可以在 [system.metrics](../../../operations/system-tables/metrics.md) 中查看：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

具有某个 query id 的查询的缓存命中和未命中情况可以在 [system.query&#95;log](../../../operations/system-tables/query_log.md) 中查看：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

对于生产环境的使用场景，我们建议将缓存设置得足够大，以便所有向量索引始终保留在内存中。

**量化调优**

[量化](https://huggingface.co/blog/embedding-quantization)是一种技术，用于减少向量的内存占用以及构建和遍历向量索引的计算成本。
ClickHouse 向量索引支持以下量化选项：


| Quantization   | Name                         | Storage per dimension |
| -------------- | ---------------------------- | --------------------- |
| f32            | Single precision             | 4 bytes               |
| f16            | Half precision               | 2 bytes               |
| bf16 (default) | Half precision (brain float) | 2 bytes               |
| i8             | Quarter precision            | 1 byte                |
| b1             | Binary                       | 1 bit                 |

与直接搜索原始全精度浮点值（`f32`）相比，引入量化会降低向量搜索的精度。
不过，在大多数数据集上，半精度 brain float 量化（`bf16`）带来的精度损失可以忽略不计，因此向量相似度索引默认采用这种量化技术。
四分之一精度（`i8`）和二进制（`b1`）量化会在向量搜索中引入较为明显的精度损失。
我们仅在向量相似度索引的大小显著大于可用 DRAM 容量时，才推荐使用这两种量化方式。
在这种情况下，我们也建议启用重评分（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）以提升准确性。
二进制量化仅在以下两种情况下推荐使用：1）对归一化后的嵌入向量（即向量长度 = 1，OpenAI 模型通常是归一化的），以及 2）使用余弦距离作为距离函数时。
二进制量化在内部使用 Hamming 距离来构建和搜索近邻图。
重评分步骤会使用表中存储的原始全精度向量，通过余弦距离来识别最近邻。

**数据传输调优**

向量搜索查询中的参考向量由用户提供，通常是通过调用大型语言模型（LLM）获取。
在 ClickHouse 中运行向量搜索的典型 Python 代码如下所示：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

嵌入向量（上面代码片段中的 `search_v`）可能具有非常高的维度。
例如，OpenAI 提供的模型可以生成 1536 维甚至 3072 维的嵌入向量。
在上述代码中，ClickHouse 的 Python 驱动会将嵌入向量替换成人类可读的字符串，并随后将整个 SELECT 查询作为字符串发送。
假设嵌入向量由 1536 个单精度浮点值组成，发送的字符串长度可达到 20 kB。
这会在分词、解析以及执行成千上万次字符串到浮点数转换时带来很高的 CPU 开销。
同时，ClickHouse 服务器日志文件也需要占用大量空间，并导致 `system.query_log` 膨胀。

请注意，大多数 LLM 模型返回的嵌入向量是一个由原生浮点数构成的列表或 NumPy 数组。
因此，我们建议 Python 应用程序使用如下方式，以二进制形式绑定参考向量参数：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, reinterpret($search_v_binary$, 'Array(Float32)'))
    LIMIT 10"
    parameters = params)
```

在该示例中，参考向量按原样以二进制形式发送，并在服务器端被重新解释为浮点数数组。
这可以节省服务器端的 CPU 时间，并避免导致服务器日志和 `system.query_log` 膨胀。


#### 管理和监控 \{#administration\}

向量相似度索引在磁盘上的大小可以通过 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) 获取：

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


#### 与常规跳过索引的区别 \{#differences-to-regular-skipping-indexes\}

与所有常规[跳过索引](/optimize/skipping-indexes)类似，向量相似度索引也是在 granule 之上构建的，每个已建立索引的块由 `GRANULARITY = [N]` 个 granule 组成（对普通跳过索引而言，`[N]` 默认为 1）。
例如，如果表的主索引粒度为 8192（设置 `index_granularity = 8192`）且 `GRANULARITY = 2`，则每个已建立索引的块将包含 16384 行。
然而，用于近似最近邻搜索的数据结构和算法在本质上是面向行的。
它们存储一组行的紧凑表示，并且在向量搜索查询中也会返回行。
这导致向量相似度索引在行为方式上与普通跳过索引相比存在一些相当不直观的差异。

当用户在某列上定义向量相似度索引时，ClickHouse 会在内部为每个索引块创建一个向量相似度“子索引”。
子索引是“本地”的，这意味着它只涉及其所属索引块中的行。
延续前面的例子，并假设某列有 65536 行，我们会得到四个索引块（跨越八个 granule），以及每个索引块对应的一个向量相似度子索引。
理论上，子索引能够直接返回其索引块内距离给定点最近的 N 个点所对应的行。
然而，由于 ClickHouse 从磁盘加载数据到内存时的粒度是 granule，子索引会将匹配行扩展到 granule 粒度。
这与常规跳过索引不同，后者是以索引块粒度来跳过数据的。

`GRANULARITY` 参数决定会创建多少个向量相似度子索引。
较大的 `GRANULARITY` 值意味着数量更少但规模更大的向量相似度子索引，直到某一列（或某列的数据 part）只剩下一个子索引为止。
在这种情况下，该子索引对该列的所有行具有“全局”视图，并且可以直接返回该列（part）中包含相关行的所有 granule（此类 granule 的数量最多为 `LIMIT [N]` 个）。
在第二步中，ClickHouse 会加载这些 granule，并通过对这些 granule 中所有行执行暴力距离计算来确定真正最优的行。
当 `GRANULARITY` 值较小时，每个子索引最多返回 `LIMIT N` 个 granule。
因此，需要加载和后过滤的 granule 会更多。
请注意，两种情况下的搜索精度是相同的，只是处理性能不同。
通常建议为向量相似度索引使用较大的 `GRANULARITY`，仅在出现诸如向量相似度结构占用内存过多等问题时，才退回使用较小的 `GRANULARITY` 值。
如果没有为向量相似度索引显式指定 `GRANULARITY`，其默认值为 1 亿。

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

返回：

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

使用近似向量搜索的更多示例数据集：

* [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
* [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
* [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
* [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)


### 量化比特（QBit） \{#approximate-nearest-neighbor-search-qbit\}

<BetaBadge/>

加速精确向量搜索的一种常见方法是使用更低精度的 [浮点数数据类型](../../../sql-reference/data-types/float.md)。
例如，如果向量存储为 `Array(BFloat16)` 而不是 `Array(Float32)`，数据大小会减半，并且查询运行时间预计会按比例缩短。
这种方法称为量化。尽管它加快了计算速度，但即便对所有向量进行穷举扫描，结果的准确性也可能会降低。

在传统量化中，我们在搜索和存储数据时都会丢失精度。在上述示例中，我们会存储 `BFloat16` 而不是 `Float32`，这意味着即使之后有需求，我们也永远无法执行更高精度的搜索。另一种方法是存储两份数据：量化版本和全精度版本。尽管这种方式可行，但需要冗余存储。设想一种场景，我们的原始数据是 `Float64`，并希望以不同精度（16 位、32 位或完整的 64 位）运行搜索，那么就需要存储三份独立的数据副本。

ClickHouse 提供了 Quantized Bit（`QBit`）数据类型，通过以下方式克服这些限制：

1. 存储原始的全精度数据。
2. 允许在查询时指定量化精度。

这是通过以按位分组（bit-grouped）的格式存储数据（即所有向量的第 i 个比特位被存储在一起）来实现的，从而仅按请求的精度级别进行读取。这样既可以通过量化减少 I/O 和计算量以获得速度优势，又能在需要时保留所有原始数据可用。当选择最大精度时，搜索将变为精确搜索。

:::note
`QBit` 数据类型及其相关距离函数目前为 Beta 特性。要启用它们，请运行 `SET enable_qbit_type = 1`。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

要声明一个 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

其中：

* `element_type` – 每个向量元素的类型。支持的类型有 `BFloat16`、`Float32` 和 `Float64`
* `dimension` – 每个向量中的元素数量


#### 创建 `QBit` 表并添加数据 \{#qbit-create\}

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

我们使用 L2 距离查找与表示单词 “lemon” 的向量最接近的邻居向量。距离函数的第三个参数指定精度的位数——值越高，精度越高，但计算量也越大。

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

请注意，在使用 12 位量化时，我们能够以更快的查询执行速度获得较为准确的距离近似结果。相对排序基本保持一致，`apple` 仍然是最接近的匹配项。


#### 性能考量 \{#qbit-performance\}

`QBit` 的性能收益主要来源于 I/O 操作的减少：在使用较低精度时，需要从存储中读取的数据量更少。此外，当 `QBit` 中包含 `Float32` 数据且精度参数为 16 或更低时，还可以通过减少计算获得额外收益。精度参数直接控制准确性与速度之间的权衡：

- **更高的精度**（更接近原始数据宽度）：结果更准确，查询更慢
- **更低的精度**：查询更快但结果为近似值，内存占用更低

### 参考资料 \{#references\}

博客：

- [Vector Search with ClickHouse - Part 1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [Vector Search with ClickHouse - Part 2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
- [We built a vector search engine that lets you choose precision at query time](https://clickhouse.com/blog/qbit-vector-search)