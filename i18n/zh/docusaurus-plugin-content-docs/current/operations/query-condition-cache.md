---
'description': '在ClickHouse中使用和配置查询条件缓存功能的指南'
'sidebar_label': '查询条件缓存'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': '查询条件缓存'
---




# 查询条件缓存

许多现实世界的工作负载涉及对相同或几乎相同数据的重复查询（例如，先前存在的数据加上新数据）。
ClickHouse 提供了各种优化技术来优化这种查询模式。
一种可能性是通过使用索引结构（例如，主键索引、跳过索引、投影）或预计算（物化视图）来调整物理数据布局。
另一种可能性是使用 ClickHouse 的 [查询缓存](query-cache.md) 来避免重复的查询计算。
第一种方法的缺点在于它需要数据库管理员进行手动干预和监控。
第二种方法可能返回过时的结果（因为查询缓存在事务上不一致），这可能在某些使用案例中是可以接受的，也可能不是。

查询条件缓存为这两个问题提供了优雅的解决方案。
它基于这样的想法：在相同的数据上评估过滤条件（例如，`WHERE col = 'xyz'`）将始终返回相同的结果。
更具体地说，查询条件缓存会记忆每个评估的过滤器和每个粒度（= 默认情况下为 8192 行的块），如果粒度中没有行满足过滤条件，则记录信息。
该信息以单个位记录：0 位表示没有行匹配过滤条件，而 1 位表示至少存在一行匹配的行。
在前一种情况下，ClickHouse 可以在过滤评估过程中跳过相应的粒度，而在后一种情况下，粒度必须被加载并进行评估。

查询条件缓存在满足三个前提条件时是有效的：
- 首先，工作负载必须重复评估相同的过滤条件。这在查询多次重复时自然发生，但也可能发生在两个查询共享相同过滤器时，例如 `SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`。
- 其次，大多数数据是不可变的，即，在查询之间不会发生变化。这在 ClickHouse 中通常是正确的，因为分区是不可变的，仅通过 INSERT 创建。
- 第三，过滤器是选择性过滤的，即只有相对较少的行满足过滤条件。满足过滤条件的行越少，记录位 0（没有匹配行）的粒度就越多，从而可以从随后的过滤评估中"修剪"更多的数据。

## 内存消耗 {#memory-consumption}

由于查询条件缓存仅为每个过滤条件和粒度存储一个位，因此只消耗少量内存。
查询条件缓存的最大大小可以使用服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 进行配置（默认：100 MB）。
100 MB 的缓存大小对应于 100 * 1024 * 1024 * 8 = 838,860,800 条目。
由于每个条目代表一个标记（默认 8192 行），缓存可以覆盖高达 6,871,947,673,600（6.8 万亿）行的单列数据。
在实践中，过滤器是在多个列上进行评估，因此该数字需要根据过滤列的数量进行划分。

## 配置设置和使用 {#configuration-settings-and-usage}

设置 [use_query_condition_cache](settings/settings#use_query_condition_cache) 控制特定查询或当前会话的所有查询是否应使用查询条件缓存。

例如，查询的第一次执行

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

将存储不满足谓词的表范围。
后续执行相同查询时，参数 `use_query_condition_cache = true` 也将利用查询条件缓存以扫描更少的数据。

## 管理 {#administration}

查询条件缓存不会在 ClickHouse 重启之间保持。

要清除查询条件缓存，请运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存的内容显示在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中。
要计算查询条件缓存的当前大小（以 MB 为单位），请运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。
如果您想查看单个过滤条件，可以检查 `system.query_condition_cache` 中的字段 `condition`。
注意，只有在查询以启用设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 运行时，字段才会被填充。

自数据库启动以来的查询条件缓存命中数和未命中数显示为系统表 [system.events](system-tables/events.md) 中的事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses"。
这两个计数器仅在运行设置 `use_query_condition_cache = true` 的 `SELECT` 查询时更新，其他查询不会影响 "QueryCacheMisses"。

## 相关内容 {#related-content}

- 博客: [介绍查询条件缓存](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [谓词缓存：云数据仓库的查询驱动二级索引（Schmidt et. al., 2024）](https://doi.org/10.1145/3626246.3653395)
