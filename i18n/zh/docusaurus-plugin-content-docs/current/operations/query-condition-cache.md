---
description: '使用和配置 ClickHouse 查询条件缓存功能的指南'
sidebar_label: '查询条件缓存'
sidebar_position: 64
slug: /operations/query-condition-cache
title: '查询条件缓存'
doc_type: 'guide'
---



# 查询条件缓存

:::note
查询条件缓存仅在 [enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer) 设置为 true 时生效，这是默认值。
:::

许多实际环境中的负载都会针对相同或几乎相同的数据反复执行查询（例如，既有数据加上新写入的数据）。
ClickHouse 提供了多种优化技术来针对这类查询模式进行优化。
一种做法是通过索引结构（例如主键索引、跳过索引、投影（projections））或预计算（物化视图）来调整物理数据布局。
另一种做法是使用 ClickHouse 的 [query cache](query-cache.md)（查询缓存）来避免重复执行查询。
第一种做法的缺点是需要数据库管理员进行人工调优和监控。
第二种做法可能会返回过期结果（因为 query cache 在事务层面并非一致），这在某些用例中可以接受，而在另一些用例中则不行。

查询条件缓存为这两个问题提供了一种优雅的解决方案。
它基于这样一个思想：在相同数据上评估某个过滤条件（例如 `WHERE col = 'xyz'`）将始终返回相同的结果。
更具体地说，查询条件缓存会记住对于每个已评估的过滤条件以及每个 granule（默认情况下为包含 8192 行的一个数据块），该 granule 中是否没有任何行满足该过滤条件。
该信息以单个位来记录：位 0 表示没有行匹配过滤条件，而位 1 表示至少存在一行匹配。
在前一种情况下，ClickHouse 在执行过滤时可以跳过相应的 granule；在后一种情况下，则必须加载并评估该 granule。

在满足以下三个前提条件时，查询条件缓存效果显著：
- 第一，负载必须反复评估相同的过滤条件。如果一个查询被多次重复执行，这会自然发生；或者当两个查询共享相同的过滤条件时也会发生，例如 `SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`。
- 第二，大部分数据是不可变的，即在查询之间不会变化。这在 ClickHouse 中通常成立，因为数据分片（part）是不可变的，只会通过 INSERT 创建。
- 第三，过滤条件需要具有较高选择性，即只有相对较少的行满足过滤条件。匹配过滤条件的行越少，被记录为位 0（无匹配行）的 granule 就越多，从而可以在后续的过滤评估中“裁剪”掉更多数据。



## 内存消耗 {#memory-consumption}

由于查询条件缓存针对每个过滤条件和粒度仅存储 1 位信息，因此只占用很少的内存。
查询条件缓存的最大容量可以通过服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 进行配置（默认值：100 MB）。
100 MB 的缓存容量对应 100 * 1024 * 1024 * 8 = 838,860,800 个条目。
由于每个条目表示一个标记（默认对应 8192 行），因此缓存最多可以覆盖单个列的 6,871,947,673,600（6.8 万亿）行。
在实际使用中，过滤通常会在多个列上进行评估，因此该数值需要除以参与过滤的列数。



## 配置项与用法

设置项 [use&#95;query&#95;condition&#95;cache](settings/settings#use_query_condition_cache) 用于控制特定查询或当前会话中的所有查询是否使用查询条件缓存。

例如，第一次执行查询时

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

会缓存不满足该谓词的表数据范围。
之后再次执行相同查询，并将参数 `use_query_condition_cache` 设为 `true` 时，会利用查询条件缓存，从而扫描更少的数据。


## 管理 {#administration}

查询条件缓存在 ClickHouse 重启后不会被保留。

要清除查询条件缓存，运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存的内容显示在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中。
要计算当前查询条件缓存的大小（以 MB 为单位），运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。
如需分析单个过滤条件，可以检查 `system.query_condition_cache` 中的 `condition` 字段。
请注意，只有在启用了设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 的情况下运行查询时，该字段才会被填充。

自数据库启动以来查询条件缓存的命中与未命中次数，分别作为事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses" 显示在系统表 [system.events](system-tables/events.md) 中。
这两个计数器仅在设置 `use_query_condition_cache = true` 的 `SELECT` 查询时才会更新，其他查询不会影响 "QueryCacheMisses"。



## 相关内容 {#related-content}

- 博客：[Introducing the Query Condition Cache](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
