---
slug: /optimize/skipping-indexes/examples
sidebar_label: '数据跳过索引 - 示例'
sidebar_position: 2
description: '跳过索引示例汇总'
title: '数据跳过索引示例'
doc_type: 'guide'
keywords: ['跳过索引', '数据跳过', '性能', '索引', '最佳实践']
---



# 数据跳过索引示例

本文汇总了 ClickHouse 中数据跳过索引的示例，展示如何定义每种类型、在什么场景下使用它们，以及如何验证它们是否已生效。所有功能都适用于 [MergeTree-family 表](/engines/table-engines/mergetree-family/mergetree)。

**索引语法：**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse 支持五种跳过索引类型：

| Index Type                                          | Description                 |
| --------------------------------------------------- | --------------------------- |
| **minmax**                                          | 跟踪每个 granule 中的最小值和最大值      |
| **set(N)**                                          | 在每个 granule 中最多存储 N 个不同的值   |
| **bloom&#95;filter([false&#95;positive&#95;rate])** | 用于存在检查的概率型过滤器               |
| **ngrambf&#95;v1**                                  | 用于子串搜索的 N-gram Bloom 过滤器    |
| **tokenbf&#95;v1**                                  | 用于全文搜索的基于 token 的 Bloom 过滤器 |

每一节都会通过示例数据展示用法，并演示如何在查询执行中验证索引是否被使用。


## MinMax 索引

`minmax` 索引最适合在松散排序的数据上执行范围条件，或用于与 `ORDER BY` 相关联的列。

```sql
-- 在 CREATE TABLE 中定义
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- 或后续添加并物化
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- 利用该索引的查询
SELECT count() FROM events WHERE ts >= now() - 3600;

-- 验证索引使用情况
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

请参阅一个包含 `EXPLAIN` 和剪枝的[示例](/best-practices/use-data-skipping-indices-where-appropriate#example)。


## Set 索引

当本地（按块）基数较低时使用 `set` 索引；如果每个数据块中包含许多不同的值，则效果不明显。

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

在[基本操作指南](/optimize/skipping-indexes#basic-operation)中展示了创建/物化流程以及应用前后的效果。


## 通用 Bloom 过滤器（标量）

`bloom_filter` 索引非常适合用于“在干草堆里找针”式的等值/`IN` 成员匹配查询。它接受一个可选参数，用于指定假阳性（误报）率（默认值为 0.025）。

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## 用于子串搜索的 N-gram Bloom 过滤器（ngrambf&#95;v1）

`ngrambf_v1` 索引将字符串划分为 n-gram。它非常适用于 `LIKE '%...%'` 查询。它支持 String/FixedString/Map（通过 mapKeys/mapValues），并且可以调节大小、哈希次数和种子。有关更多详细信息，请参阅 [N-gram Bloom 过滤器](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) 的文档。

```sql
-- 为子串搜索创建索引
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- 子串搜索
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[本指南](/use-cases/observability/schema-design#bloom-filters-for-text-search) 展示了实际用例，并说明在何种情况下应使用 token 还是 ngram。

**参数优化辅助工具：**

ngrambf&#95;v1 的四个参数（n-gram 大小、位图大小、哈希函数数量、种子值）会对性能和内存使用产生显著影响。根据预期的 n-gram 数量和目标误报率，使用这些函数计算出最优的位图大小和哈希函数数量：

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- 示例：计算 4300 个 n-gram、误报率 p_false = 0.0001 时的大小
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- 约 10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- 约 13
```

有关完整的调优指导，请参阅[参数文档](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)。


## 用于基于单词搜索的 Token Bloom 过滤器（tokenbf&#95;v1）

`tokenbf_v1` 会为由非字母数字字符分隔的 token 建立索引。你应将其与 [`hasToken`](/sql-reference/functions/string-search-functions#hasToken)、`LIKE` 单词模式或 `=` / `IN` 一起使用。它支持 `String` / `FixedString` / `Map` 类型。

有关更多详情，请参阅 [Token Bloom 过滤器](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) 和 [Bloom 过滤器类型](/optimize/skipping-indexes#skip-index-types) 页面。

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- 单词搜索(通过 lower 函数实现不区分大小写)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

可在[此处](/use-cases/observability/schema-design#bloom-filters-for-text-search)查看可观测性示例，以及关于 token 与 ngram 的使用指导。


## 在 CREATE TABLE 时添加索引（多个示例）

跳过索引也支持组合表达式以及 `Map`/`Tuple`/`Nested` 类型。下面的示例对此进行了演示：

```sql
CREATE TABLE t
(
  u64 UInt64,
  s String,
  m Map(String, String),

  INDEX idx_bf u64 TYPE bloom_filter(0.01) GRANULARITY 3,
  INDEX idx_minmax u64 TYPE minmax GRANULARITY 1,
  INDEX idx_set u64 * length(s) TYPE set(1000) GRANULARITY 4,
  INDEX idx_ngram s TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1,
  INDEX idx_token mapKeys(m) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY u64;
```


## 在现有数据上物化并验证

你可以使用 `MATERIALIZE` 为现有的数据部分添加索引，并通过 `EXPLAIN` 或跟踪日志来检查裁剪效果，如下所示：

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- 可选：详细的修剪信息
SET send_logs_level = 'trace';
```

此[可运行的 minmax 示例](/best-practices/use-data-skipping-indices-where-appropriate#example)展示了 EXPLAIN 输出的结构及剪枝数量。


## 何时使用跳过索引，何时应避免使用 {#when-use-and-when-to-avoid}

**在以下情况使用跳过索引：**

* 在数据块内，过滤条件的取值分布较为稀疏  
* 与 `ORDER BY` 列存在强相关性，或数据摄取模式会将相似的值分组在一起  
* 在大型日志数据集上执行文本搜索（`ngrambf_v1`/`tokenbf_v1` 类型）

**在以下情况应避免使用跳过索引：**

* 大多数数据块很可能至少包含一个匹配值（此时数据块无论如何都会被读取）  
* 在与数据排序无相关性的高基数字段上进行过滤

:::note 重要注意事项
如果某个值在一个数据块中哪怕只出现一次，ClickHouse 也必须读取整个数据块。请使用具有代表性的数据集对索引进行测试，并根据实际性能测试结果调整粒度和特定于类型的参数。
:::



## 临时忽略或强制使用索引

在测试和故障排查期间，可以针对单个查询按名称禁用特定索引。也可以通过相关设置在需要时强制使用索引。参见 [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices)。

```sql
-- 按名称忽略索引
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## 注意事项与限制 {#notes-and-caveats}

* 跳过索引仅支持在 [MergeTree 系列表](/engines/table-engines/mergetree-family/mergetree) 上使用；数据裁剪发生在 granule/block 级别。  
* 基于 Bloom 过滤器的索引是概率性的（假阳性会导致额外的读取操作，但不会遗漏有效数据）。  
* 应使用 `EXPLAIN` 和 tracing 验证 Bloom 过滤器及其他跳过索引；通过调整粒度在裁剪效果与索引大小之间取得平衡。



## 相关文档 {#related-docs}
- [数据跳过索引指南](/optimize/skipping-indexes)
- [最佳实践指南](/best-practices/use-data-skipping-indices-where-appropriate)
- [数据跳过索引管理](/sql-reference/statements/alter/skipping-index)
- [系统表示例信息](/operations/system-tables/data_skipping_indices)
