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
查询条件缓存仅在 [enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer) 设置为 true 时生效，该设置默认开启。
:::

许多真实场景中的工作负载会针对相同或几乎相同的数据重复执行查询（例如，已有历史数据加上新增数据）。
ClickHouse 提供了多种优化技术来针对这类查询模式进行优化。
一种做法是通过索引结构（如主键索引、跳过索引、投影（projection））或预计算（物化视图）来调优物理数据布局。
另一种做法是使用 ClickHouse 的 [查询缓存](query-cache.md) 来避免重复计算查询结果。
第一种方法的缺点是需要数据库管理员进行人工干预和监控。
第二种方法可能会返回过期结果（因为查询缓存从事务角度看不保证一致性），具体是否可接受取决于使用场景。

查询条件缓存为这两个问题提供了一种优雅的解决方案。
它基于这样的思想：在相同数据上计算某个过滤条件（例如 `WHERE col = 'xyz'`）时，总会返回相同的结果。
更具体地说，查询条件缓存会针对每个已计算过的过滤条件，以及每个 granule（即一个块，默认包含 8192 行），记录该 granule 中是否不存在满足过滤条件的行。
该信息用单个比特位记录：比特 0 表示没有行匹配过滤条件，而比特 1 表示至少存在一行匹配。
在前一种情况下，ClickHouse 在进行过滤评估时可以跳过对应的 granule；在后一种情况下，则必须加载并评估该 granule。

当满足以下三个前提条件时，查询条件缓存会非常有效：
- 第一，工作负载必须反复计算相同的过滤条件。如果多次重复执行同一条查询，这会自然发生；如果两条查询共享相同的过滤条件，也会发生，例如：`SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`。
- 第二，大部分数据是不可变的，即在查询之间不会发生变化。这在 ClickHouse 中通常成立，因为数据分片（parts）是不可变的，只会通过 INSERT 创建。
- 第三，过滤条件具有较高的选择性，即只有相对较少的行满足过滤条件。匹配过滤条件的行越少，被记录为比特 0（无匹配行）的 granule 就越多，在后续过滤评估中就能“裁剪”掉越多数据。



## 内存消耗 {#memory-consumption}

由于查询条件缓存仅为每个过滤条件和颗粒度存储单个比特位,因此它只消耗少量内存。
查询条件缓存的最大大小可以通过服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 进行配置(默认值:100 MB)。
100 MB 的缓存大小对应 100 _ 1024 _ 1024 \* 8 = 838,860,800 个条目。
由于每个条目代表一个标记(默认为 8192 行),因此缓存最多可以覆盖单列的 6,871,947,673,600(6.8 万亿)行。
在实际应用中,过滤器会在多个列上进行评估,因此该数字需要除以过滤列的数量。


## 配置设置和使用 {#configuration-settings-and-usage}

设置 [use_query_condition_cache](settings/settings#use_query_condition_cache) 用于控制特定查询或当前会话的所有查询是否应使用查询条件缓存。

例如,首次执行以下查询

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

将存储表中不满足谓词的范围。
后续执行相同查询时,同样设置参数 `use_query_condition_cache = true`,将利用查询条件缓存来减少数据扫描量。


## 管理 {#administration}

查询条件缓存在 ClickHouse 重启后不会保留。

要清除查询条件缓存,请运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存内容显示在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中。
要计算查询条件缓存的当前大小(以 MB 为单位),请运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。
如果需要检查单个过滤条件,可以查看 `system.query_condition_cache` 中的 `condition` 字段。
请注意,该字段仅在查询运行时启用了设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 时才会被填充。

自数据库启动以来的查询条件缓存命中和未命中次数在系统表 [system.events](system-tables/events.md) 中以事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses" 的形式显示。
这两个计数器仅针对设置了 `use_query_condition_cache = true` 的 `SELECT` 查询进行更新,其他查询不会影响 "QueryCacheMisses"。


## 相关内容 {#related-content}

- 博客：[查询条件缓存介绍](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [谓词缓存：云数据仓库的查询驱动二级索引 (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
