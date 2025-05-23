---
'description': '在 ClickHouse 中使用和配置查询条件缓存功能的指南'
'sidebar_label': 'Query Condition Cache'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': '查询条件缓存'
---


# 查询条件缓存

许多现实世界的工作负载涉及对相同或几乎相同数据的重复查询（例如，之前存在的数据加上新数据）。
ClickHouse提供了多种优化技术以优化此类查询模式。
一种可能性是通过使用索引结构（例如主键索引、跳过索引、投影）或预计算（物化视图）来调整物理数据布局。
另一种可能性是使用ClickHouse的 [查询缓存](query-cache.md) 来避免重复的查询评估。
第一种方法的缺点是需要数据库管理员的手动干预和监控。
第二种方法可能返回陈旧的结果（因为查询缓存在事务上不一致），根据用例的不同，这可能是可接受的，也可能不可接受。

查询条件缓存为这两个问题提供了优雅的解决方案。
它基于这样的思想：在相同数据上评估过滤条件（例如，`WHERE col = 'xyz'`）将始终返回相同的结果。
更具体地说，查询条件缓存会记住每个评估过的过滤器和每个粒度（= 默认情况下为8192行的块）中是否没有行满足过滤条件。
该信息以单个比特记录：0比特表示没有行匹配过滤条件，而1比特表示至少存在一行匹配。
在前一种情况下，ClickHouse可以在过滤评估期间跳过相应的粒度；在后一种情况下，必须加载和评估该粒度。

当满足以下三个先决条件时，查询条件缓存是有效的：
- 首先，工作负载必须重复评估相同的过滤条件。这在查询多次重复时自然发生，但也可能发生在两个查询共享相同过滤器的情况下，例如 `SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`。
- 第二，大多数数据是不可变的，即在查询之间不发生变化。这在ClickHouse中通常是这样，因为部分数据是不可变的，并且仅通过INSERT创建。
- 第三，过滤器是选择性，即只有相对较少的行满足过滤条件。满足过滤条件的行越少，将记录的比特0的粒度越多（没有匹配的行），后续过滤评估中可以“修剪”的数据就越多。

## 内存消耗 {#memory-consumption}

由于查询条件缓存每个过滤条件和粒度仅存储一个比特，因此它仅消耗很少的内存。
查询条件缓存的最大大小可以通过服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 配置（默认：100 MB）。
100 MB的缓存大小对应于100 * 1024 * 1024 * 8 = 838,860,800条目。
由于每个条目代表一个标记（默认8192行），因此缓存可以覆盖单个列最多6,871,947,673,600（6.8万亿）行。
在实践中，过滤器是在多个列上评估的，因此这个数字需要除以过滤的列数。

## 配置设置和用途 {#configuration-settings-and-usage}

设置 [use_query_condition_cache](settings/settings#use_query_condition_cache) 控制特定查询或当前会话的所有查询是否应利用查询条件缓存。

例如，查询的第一次执行

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

将存储不满足谓词的表范围。
同样带有参数 `use_query_condition_cache = true` 的后续执行将利用查询条件缓存来扫描更少的数据。

## 管理 {#administration}

查询条件缓存在ClickHouse重启之间不会保留。

要清除查询条件缓存，请运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存的内容显示在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中。
要计算当前查询条件缓存的大小（以MB为单位），请运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。
如果您想检查单个过滤条件，可以查看 `system.query_condition_cache` 中的字段 `condition`。
请注意，只有在查询以启用设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 的情况下，字段才会被填充。

自数据库启动以来查询条件缓存的命中数和未命中数显示为系统表 [system.events](system-tables/events.md) 中的事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses"。
这两个计数器仅在使用设置 `use_query_condition_cache = true` 的 `SELECT` 查询中更新，其它查询不会影响 "QueryCacheMisses"。

## 相关内容 {#related-content}

- 博客：[介绍查询条件缓存](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [谓词缓存：面向云数据仓库的查询驱动二级索引（Schmidt等，2024）](https://doi.org/10.1145/3626246.3653395)
