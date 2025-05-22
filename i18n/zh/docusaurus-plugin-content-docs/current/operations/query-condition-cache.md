---
'description': '使用和配置 ClickHouse 中查询条件缓存功能的指南'
'sidebar_label': '查询条件缓存'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': '查询条件缓存'
---


# 查询条件缓存

许多实际工作负载涉及对相同或几乎相同数据的重复查询（例如，先前存在的数据加上新数据）。 
ClickHouse 提供了多种优化技术来优化此类查询模式。 
一种可能性是使用索引结构（例如，主键索引、跳过索引、投影）或预计算（物化视图）来调整物理数据布局。 
另一种可能性是使用 ClickHouse 的 [查询缓存](query-cache.md) 以避免重复的查询评估。 
第一种方法的缺点是需要数据库管理员手动干预和监控。 
第二种方法可能返回过时的结果（因为查询缓存在事务上不一致），这可能是可接受的，也可能不可接受，具体取决于用例。

查询条件缓存为这两个问题提供了优雅的解决方案。 
它基于这样的想法：在相同数据上评估过滤条件（例如，`WHERE col = 'xyz'`）将始终返回相同的结果。 
更具体地说，查询条件缓存会记住每个评估的过滤器和每个颗粒（= 默认情况下为8192行的块），是否没有行在颗粒中满足过滤条件。 
该信息作为一个单独的位进行记录：0位表示没有行匹配过滤条件，而1位表示至少存在一行匹配的行。 
在前一种情况下，ClickHouse 可以在过滤评估期间跳过相应的颗粒，在后一种情况下，必须加载并评估该颗粒。

如果满足以下三个前提条件，查询条件缓存是有效的：
- 首先，工作负载必须重复评估相同的过滤条件。 如果查询多次重复，这种情况自然会发生，但如果两个查询共享相同的过滤器，例如 `SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`，也可能发生这种情况。
- 其次，大多数数据是不可变的，即在查询之间不会变化。 这在 ClickHouse 中通常是如此，因为部分是不可变的，仅通过 INSERT 创建。
- 第三，过滤器是选择性的，即只有相对较少的行满足过滤条件。 匹配过滤条件的行越少，记录为位0（没有匹配行）的颗粒就越多，可以从随后的过滤评估中“修剪”越多数据。

## 内存消耗 {#memory-consumption}

由于查询条件缓存仅存储每个过滤条件和颗粒的单个位，因此消耗的内存非常少。
查询条件缓存的最大大小可以使用服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 进行配置（默认值：100 MB）。
100 MB 的缓存大小对应于 100 * 1024 * 1024 * 8 = 838,860,800 个条目。
由于每个条目代表一个标记（默认情况下为8192行），缓存可以覆盖单列的最多 6,871,947,673,600（6.8万亿）行。
实际上，过滤是在多个列上评估的，因此这个数字需要除以被过滤列的数量。

## 配置设置和使用 {#configuration-settings-and-usage}

设置 [use_query_condition_cache](settings/settings#use_query_condition_cache) 控制特定查询或当前会话的所有查询是否应使用查询条件缓存。

例如，第一次执行查询

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

将存储不满足谓词的表范围。 
后续执行相同查询时，也设置参数 `use_query_condition_cache = true`，将利用查询条件缓存以扫描更少的数据。

## 管理 {#administration}

查询条件缓存在 ClickHouse 重启之间不会保留。

要清除查询条件缓存，请运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存的内容显示在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中。 
要计算查询条件缓存的当前大小（以 MB 为单位），请运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。 
如果您想检查单个过滤条件，可以查看 `system.query_condition_cache` 中的字段 `condition`。 
请注意，只有在查询以启用设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 运行时，该字段才会被填充。

查询条件缓存命中和未命中的数量自数据库启动以来作为事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses" 显示在系统表 [system.events](system-tables/events.md) 中。 
这两个计数器仅在运行设置 `use_query_condition_cache = true` 的 `SELECT` 查询时更新，其他查询不影响 "QueryCacheMisses"。

## 相关内容 {#related-content}

- 博客: [引入查询条件缓存](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [谓词缓存：面向查询的云数据仓库二级索引（Schmidt 等，2024）](https://doi.org/10.1145/3626246.3653395)
