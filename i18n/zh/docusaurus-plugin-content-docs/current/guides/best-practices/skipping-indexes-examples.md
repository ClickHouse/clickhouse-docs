---
slug: /optimize/skipping-indexes/examples
sidebar_label: '数据跳跃索引 - 示例'
sidebar_position: 2
description: '数据跳跃索引示例汇总'
title: '数据跳跃索引示例'
doc_type: 'guide'
keywords: ['skipping indexes', 'data skipping', 'performance', 'indexing', 'best practices']
---



# 数据跳过索引示例 {#data-skipping-index-examples}

本页汇总了 ClickHouse 数据跳过索引的示例，展示如何声明各种索引类型、使用场景以及如何验证索引是否生效。所有功能均适用于 [MergeTree 系列表](/engines/table-engines/mergetree-family/mergetree)。

**索引语法：**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse 支持五种跳过索引类型：

| 索引类型                              | 描述                                       |
| --------------------------------------- | ------------------------------------------------- |
| **minmax**                              | 跟踪每个颗粒中的最小值和最大值 |
| **set(N)**                              | 每个颗粒最多存储 N 个不同的值        |
| **bloom_filter([false_positive_rate])** | 用于存在性检查的概率过滤器         |
| **ngrambf_v1**                          | 用于子串搜索的 N-gram 布隆过滤器        |
| **tokenbf_v1**                          | 用于全文搜索的基于词元的布隆过滤器   |

每个部分都提供了示例数据和演示，说明如何在查询执行中验证索引的使用情况。


## MinMax 索引 {#minmax-index}

`minmax` 索引最适合用于松散排序数据或与 `ORDER BY` 相关的列上的范围谓词查询。

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

-- 或稍后添加并物化
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- 可以从该索引中受益的查询
SELECT count() FROM events WHERE ts >= now() - 3600;

-- 验证索引使用情况
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

查看使用 `EXPLAIN` 和剪枝的[实际示例](/best-practices/use-data-skipping-indices-where-appropriate#example)。


## Set 索引 {#set-index}

当局部(每个数据块)基数较低时使用 `set` 索引;如果每个数据块包含大量不同的值,则该索引不起作用。

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

创建/物化工作流程以及前后效果对比请参见[基本操作指南](/optimize/skipping-indexes#basic-operation)。


## 通用布隆过滤器(标量) {#generic-bloom-filter-scalar}

`bloom_filter` 索引适用于"大海捞针"式的等值查询和 IN 成员判断。它接受一个可选参数,用于指定误报率(默认为 0.025)。

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## 用于子串搜索的 N-gram 布隆过滤器 (ngrambf_v1) {#n-gram-bloom-filter-ngrambf-v1-for-substring-search}

`ngrambf_v1` 索引将字符串拆分为 n-gram。它非常适合 `LIKE '%...%'` 查询。支持 String/FixedString/Map 类型(通过 mapKeys/mapValues),以及可调整的大小、哈希函数数量和种子值。更多详细信息请参阅 [N-gram 布隆过滤器](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)文档。

```sql
-- 为子串搜索创建索引
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- 子串搜索
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[本指南](/use-cases/observability/schema-design#bloom-filters-for-text-search)展示了实际示例以及何时使用 token 与 ngram。

**参数优化辅助函数:**

ngrambf_v1 的四个参数(n-gram 大小、位图大小、哈希函数数量、种子值)会显著影响性能和内存使用。使用以下函数可以根据预期的 n-gram 数量和期望的误报率计算最优的位图大小和哈希函数数量:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- 针对 4300 个 ngram、误报率 p_false = 0.0001 的示例计算
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

完整的调优指南请参阅[参数文档](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)。


## 用于基于词的搜索的 Token 布隆过滤器 (tokenbf_v1) {#token-bloom-filter-tokenbf-v1-for-word-based-search}

`tokenbf_v1` 对由非字母数字字符分隔的词元进行索引。应配合 [`hasToken`](/sql-reference/functions/string-search-functions#hasToken)、`LIKE` 词模式或 equals/IN 使用。支持 `String`/`FixedString`/`Map` 类型。

更多详细信息请参阅 [Token 布隆过滤器](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) 和 [布隆过滤器类型](/optimize/skipping-indexes#skip-index-types) 页面。

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- 词搜索(通过 lower 实现不区分大小写)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

有关 token 与 ngram 的可观测性示例和指导,请参阅[此处](/use-cases/observability/schema-design#bloom-filters-for-text-search)。


## 在 CREATE TABLE 时添加索引(多个示例) {#add-indexes-during-create-table-multiple-examples}

跳数索引还支持复合表达式和 `Map`/`Tuple`/`Nested` 类型。下面的示例演示了这一点:

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


## 在现有数据上物化索引并验证 {#materializing-on-existing-data-and-verifying}

您可以使用 `MATERIALIZE` 为现有数据部分添加索引,并通过 `EXPLAIN` 或跟踪日志检查剪枝情况,如下所示:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- 可选:详细的剪枝信息
SET send_logs_level = 'trace';
```

这个 [minmax 示例](/best-practices/use-data-skipping-indices-where-appropriate#example) 演示了 EXPLAIN 输出结构和剪枝计数。


## 何时使用以及何时避免使用跳数索引 {#when-use-and-when-to-avoid}

**适合使用跳数索引的场景:**

- 过滤值在数据块内分布稀疏
- 与 `ORDER BY` 列存在强相关性,或数据摄取模式将相似值聚集在一起
- 在大型日志数据集上执行文本搜索(使用 `ngrambf_v1`/`tokenbf_v1` 类型)

**应避免使用跳数索引的场景:**

- 大多数数据块可能至少包含一个匹配值(无论如何都会读取这些数据块)
- 对与数据排序无关的高基数列进行过滤

:::note 重要注意事项
如果某个值在数据块中哪怕只出现一次,ClickHouse 也必须读取整个数据块。请使用真实数据集测试索引,并根据实际性能测量结果调整粒度和特定类型的参数。
:::


## 临时忽略或强制使用索引 {#temporarily-ignore-or-force-indexes}

在测试和故障排查过程中,可以按名称为单个查询禁用特定索引。同时也提供了在需要时强制使用索引的设置。详见 [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices)。

```sql
-- 按名称忽略索引
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## 注意事项和限制 {#notes-and-caveats}

- 跳数索引仅支持 [MergeTree 系列表](/engines/table-engines/mergetree-family/mergetree);数据裁剪发生在颗粒/数据块级别。
- 基于布隆过滤器的索引是概率性的(假阳性会导致额外读取,但不会跳过有效数据)。
- 布隆过滤器和其他跳数索引应使用 `EXPLAIN` 和追踪进行验证;调整颗粒度以平衡裁剪效果与索引大小。


## 相关文档 {#related-docs}

- [数据跳过索引指南](/optimize/skipping-indexes)
- [最佳实践指南](/best-practices/use-data-skipping-indices-where-appropriate)
- [操作数据跳过索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
