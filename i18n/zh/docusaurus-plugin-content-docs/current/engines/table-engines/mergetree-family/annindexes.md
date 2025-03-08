---
slug: /engines/table-engines/mergetree-family/annindexes
sidebar_label: 向量相似度索引
description: 使用向量相似度索引进行近似最近邻搜索
keywords: ['vector-similarity search', 'text search', 'ann', 'indices', 'index', 'nearest neighbour']
title: '使用向量相似度索引进行近似最近邻搜索'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 使用向量相似度索引进行近似最近邻搜索

<ExperimentalBadge/>
<PrivatePreviewBadge/>

最近邻查找问题是寻找在 N 维向量空间中与给定向量最接近的 M 个向量。解决这个问题最简单的方法是进行
穷举（蛮力）搜索，该方法计算参考向量与向量空间中所有其他点之间的距离。虽然该方法保证了完全准确的结果，但对于实际应用通常
太慢。作为替代，[近似算法](https://github.com/erikbern/ann-benchmarks)使用贪心启发式方法来更快地找到 M 个最接近的向量。
这使得图像、歌曲、文本的语义搜索可以在毫秒级完成
[嵌入](https://cloud.google.com/architecture/overview-extracting-and-serving-feature-embeddings-for-machine-learning)。

博客:
- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2)

在 SQL 中，最近邻查找可以表示为：

``` sql
SELECT [...]
FROM table, [...]
ORDER BY DistanceFunction(vectors, reference_vector)
LIMIT N
```

其中
- `DistanceFunction` 计算两个向量之间的距离（例如， 
  [L2Distance](/sql-reference/functions/distance-functions#l2distance) 或 
  [cosineDistance](/sql-reference/functions/distance-functions#cosinedistance)，
- `vectors` 是类型为 [Array(Float64)](../../../sql-reference/data-types/array.md) 或 
  [Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的列，通常存储
  嵌入，
- `reference_vector` 是类型为 [Array(Float64)](../../../sql-reference/data-types/array.md) 或
  [Array(Float32)](../../../sql-reference/data-types/array.md) 或 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 的常量，
- `N` 是限制返回结果数量的常量整数。

该查询返回在 `vectors` 中与 `reference_vector` 最接近的 `N` 个点。

穷举搜索计算 `reference_vector` 与 `vectors` 中所有向量之间的距离。因此，其运行时间与存储向量的数量成正比。
近似搜索依赖于特殊数据结构（例如图、随机森林等），这些数据结构可以快速找到与给定参考向量最接近的向量（即在亚线性时间内）。
ClickHouse 提供了这样一种数据结构，称为“向量相似度索引”，是一种 [跳过索引](mergetree.md#table_engine-mergetree-data_skipping-indexes)。


# 创建和使用向量相似度索引

创建向量相似度索引的语法

```sql
CREATE TABLE table
(
  id Int64,
  vectors Array(Float32),
  INDEX index_name vectors TYPE vector_similarity(method, distance_function[, quantization, hnsw_max_connections_per_layer, hnsw_candidate_list_size_for_construction]) [GRANULARITY N]
)
ENGINE = MergeTree
ORDER BY id;
```

:::note
USearch 索引目前处于实验阶段，使用它们之前需要先 `SET allow_experimental_vector_similarity_index = 1`。
:::

该索引可以构建在类型为 [Array(Float64)](../../../sql-reference/data-types/array.md) 或
[Array(Float32)](../../../sql-reference/data-types/array.md) 的列上。

索引参数：
- `method`：当前仅支持 `hnsw`。
- `distance_function`：可以是 `L2Distance`（[欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)：两个点在欧几里得空间中之间的线段长度）或 `cosineDistance`（[余弦
  距离](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)：两个非零向量之间的夹角）。
- `quantization`：可以是 `f64`、`f32`、`f16`、`bf16` 或 `i8`，用于以较低精度存储向量（可选，默认：`bf16`）
- `hnsw_max_connections_per_layer`：每个 HNSW 图节点的邻居数量，在 [HNSW
  论文](https://doi.org/10.1109/TPAMI.2018.2889473) 中也称为 `M`。可选，默认：`32`。值为 `0` 表示使用默认值。
- `hnsw_candidate_list_size_for_construction`：构建 HNSW 图时动态候选列表的大小，在原始的 [HNSW 论文](https://doi.org/10.1109/TPAMI.2018.2889473) 中也称为
  `ef_construction`。可选，默认：`128`。值为 0 表示使用默认值。

对于归一化数据，通常 `L2Distance` 是最佳选择，否则建议使用 `cosineDistance` 以补偿规模差异。

示例：

```sql
CREATE TABLE table
(
  id Int64,
  vectors Array(Float32),
  INDEX idx vectors TYPE vector_similarity('hnsw', 'L2Distance') -- 替代语法：TYPE vector_similarity(hnsw, L2Distance)
)
ENGINE = MergeTree
ORDER BY id;
```

所有数组必须具有相同的长度。为避免错误，可以使用 [CONSTRAINT](/sql-reference/statements/create/table.md#constraints)，例如，`CONSTRAINT constraint_name_1 CHECK
length(vectors) = 256`。空的 `Arrays` 和未在 INSERT 语句中指定的 `Array` 值（即默认值）也不受支持。

向量相似度索引基于 [USearch 库](https://github.com/unum-cloud/usearch)，该库实现了 [HNSW
算法](https://arxiv.org/abs/1603.09320)，即一个分层图，其中每个节点代表一个向量，节点之间的边表示相似性。这种分层结构在处理大集合时非常高效。它们往往从整体数据集中仅提取 0.05% 或更少的数据，同时仍然提供 99% 的召回率。
这在处理高维向量时尤其有用，高维向量加载和比较是昂贵的。USearch 还利用 SIMD 加速现代 x86（AVX2 和 AVX-512）和 ARM（NEON 和 SVE） CPU 上的距离计算。

向量相似度索引在插入和合并列时构建。已知 HNSW 算法提供较慢的插入。因此，带有向量相似度索引的表的 `INSERT` 和 `OPTIMIZE` 语句的执行速度将比普通表慢。向量相似度索引理想的使用场景是仅对不变或很少变化的数据，特别是在读请求远多于写请求的情况下。推荐三种额外技术来加速索引创建：
- 索引创建可以并行化。最大线程数可以使用服务器设置 
  [max_build_vector_similarity_index_thread_pool_size](../../../operations/server-configuration-parameters/settings.md#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size) 进行配置。
- 对新插入的分片，可以使用设置 `materialize_skip_indexes_on_insert` 禁用索引创建。在这些分片上的搜索将回退到精确搜索，但由于插入的分片通常相对于表的总大小较小，因此性能影响微乎其微。
- ClickHouse 在后台将多个分片逐步合并为更大的分片。这些新分片可能稍后会合并成更大的分片。每次合并时，都会重新从头构建输出部分的向量相似度索引（以及其他跳过索引）。这可能导致创建向量相似度索引的工作被浪费。为避免这种情况，可以在合并时通过合并树设置
  [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)来抑制向量相似度索引的创建。这与语句 [ALTER TABLE \[...\] MATERIALIZE INDEX
  \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) 结合使用，可以显式控制向量相似度索引的生命周期。例如，索引构建可以推迟到低负载下（例如周末）或在大量数据摄入后进行。

向量相似度索引支持以下类型的查询：

``` sql
WITH [...] AS reference_vector
SELECT *
FROM table
WHERE ...                       -- WHERE 子句是可选的
ORDER BY Distance(vectors, reference_vector)
LIMIT N
```

要使用 HNSW 参数 `hnsw_candidate_list_size_for_search`（默认：256）搜索不同的值，也称为原始 [HNSW 论文](https://doi.org/10.1109/TPAMI.2018.2889473) 中的 `ef_search`，请运行 `SELECT` 查询并添加 `SETTINGS hnsw_candidate_list_size_for_search = <value>`。

从向量相似度索引中重复读取受益于大型跳过索引缓存。如果需要，可以使用服务器设置 
[skipping_index_cache_size](../../../operations/server-configuration-parameters/settings.md#skipping_index_cache_size) 来增加默认缓存大小。

**限制**：近似向量搜索算法需要限制，因此没有 `LIMIT` 子句的查询无法利用向量相似度索引。限制必须小于设置 `max_limit_for_ann_queries`（默认：100）。

**与常规跳过索引的区别**：与常规 [跳过索引](/optimize/skipping-indexes) 类似，向量相似度索引是根据粒度构建的，每个索引块由 `GRANULARITY = [N]` 个粒度组成（对于普通跳过索引，`[N]` 默认为 1）。例如，如果表的主索引粒度为 8192（设置 `index_granularity = 8192`），且 `GRANULARITY = 2`，则每个索引块将包含 16384 行。但是，近似邻域搜索的数据结构和算法本质上是行导向的。它们存储一组行的紧凑表示，也返回行以供向量搜索查询使用。这导致向量相似度索引与普通跳过索引在行为上出现一些意想不到的差异。

当用户在某列上定义向量相似度索引时，ClickHouse 在内部为每个索引块创建一个向量相似度“子索引”。子索引是“局部”的，意味着它仅了解其包含索引块的行。在先前的示例中，假设一列有 65536 行，我们将获得四个索引块（跨越八个粒度）以及每个索引块的向量相似度子索引。一个子索引理论上能够直接返回其索引块内 N 个最接近点的行。但是，由于 ClickHouse 以粒度的粒度从磁盘加载数据到内存，子索引会推断与粒度相匹配的行。这与普通跳过索引在索引块的粒度上跳过数据不同。

`GRANULARITY` 参数决定了创建多少个向量相似度子索引。较大的 `GRANULARITY` 值意味着较少但更大的向量相似度子索引，直到一个列（或列的数据部分）仅有一个子索引。在这种情况下，子索引对所有列行具有“全局”视图，可以直接返回包含相关行的所有粒度（最多有 `LIMIT [N]` 个这样的粒度）。在第二步中，ClickHouse 将加载这些粒度，并通过对粒度中所有行进行穷举距离计算来识别实际最佳行。使用较小的 `GRANULARITY` 值时，每个子索引返回最多 `LIMIT N` 个粒度。因此，需要加载和后期过滤更多的粒度。请注意，两种情况下的搜索精度都是同样优秀的，唯一不同的是处理性能。一般建议为向量相似度索引使用较大的 `GRANULARITY`，只有在出现过多内存消耗等问题时，才退回到较小的 `GRANULARITY` 值。如果向量相似度索引未指定 `GRANULARITY`，默认值为 1 亿。

