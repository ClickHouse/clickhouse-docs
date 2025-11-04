---
'description': '在ClickHouse中使用和配置查询条件缓存功能的指南'
'sidebar_label': '查询条件缓存'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': '查询条件缓存'
'doc_type': 'guide'
---


# 查询条件缓存

:::note
查询条件缓存仅在 [enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer) 设置为 true 时有效，该值为默认值。
:::

许多实际工作负载涉及对相同或几乎相同数据的重复查询（例如，先前存在的数据加上新数据）。
ClickHouse 提供了多种优化技术来优化这些查询模式。
一种可能性是使用索引结构（例如，主键索引、跳过索引、投影）或预计算（物化视图）来调整物理数据布局。
另一种可能性是使用 ClickHouse 的 [查询缓存](query-cache.md) 来避免重复查询评估。
第一种方法的缺点在于需要数据库管理员手动干预和监控。
第二种方法可能返回过时的结果（因为查询缓存在事务上并不一致），这可能根据具体用例是可以接受的，也可能不可接受。

查询条件缓存为这两个问题提供了优雅的解决方案。
它的基础理念是，在相同数据上评估一个过滤条件（例如，`WHERE col = 'xyz'`）将始终返回相同的结果。
更具体地说，查询条件缓存会记住每个评估的过滤器和每个颗粒（= 默认情况下为8192行的区块）是否在颗粒中没有行满足过滤条件。
该信息被记录为一个单一的位：0位表示没有行匹配过滤，而1位则表示至少存在一个匹配的行。
在前一种情况下，ClickHouse 可以在过滤评估期间跳过相应的颗粒；在后一种情况下，必须加载并评估该颗粒。

查询条件缓存在满足三个前提的情况下是有效的：
- 首先，工作负载必须反复评估相同的过滤条件。如果查询被多次重复，这将自然发生，但如果两个查询共享相同的过滤器，也可能发生，例如 `SELECT product FROM products WHERE quality > 3` 和 `SELECT vendor, count() FROM products WHERE quality > 3`。
- 第二，大部分数据是不可变的，即在查询之间不会改变。由于分片是不可变的，并且仅通过 INSERT 创建，这在 ClickHouse 中通常是正确的。
- 第三，过滤器是选择性的，即只有相对少数的行满足过滤条件。满足过滤条件的行越少，记录位0（没有匹配行）的颗粒就越多，从而可以在后续的过滤评估中“剪枝”更多数据。

## 内存消耗 {#memory-consumption}

由于查询条件缓存每个过滤条件和颗粒仅存储一个单一的位，因此它消耗的内存仅很少。
查询条件缓存的最大大小可以通过服务器设置 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) 进行配置（默认：100 MB）。
100 MB 的缓存大小对应于 100 * 1024 * 1024 * 8 = 838,860,800 条目。
由于每个条目代表一个标记（默认情况下为8192行），因此缓存可以覆盖多达 6,871,947,673,600（6.8万亿）行的单列。
在实践中，过滤在多个列上进行评估，因此该数字需要除以被过滤列的数量。

## 配置设置和使用 {#configuration-settings-and-usage}

设置 [use_query_condition_cache](settings/settings#use_query_condition_cache) 控制当前会话的特定查询或所有查询是否应利用查询条件缓存。

例如，查询的第一次执行

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

将存储不满足谓词的表的范围。
相同查询的后续执行（同样带有参数 `use_query_condition_cache = true`）将利用查询条件缓存以减少扫描的数据量。

## 管理 {#administration}

查询条件缓存在 ClickHouse 重启之间不会保留。

要清除查询条件缓存，请运行 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)。

缓存的内容在系统表 [system.query_condition_cache](system-tables/query_condition_cache.md) 中显示。
要计算查询条件缓存当前的大小（以 MB 为单位），请运行 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`。
如果您想调查单个过滤条件，可以检查 `system.query_condition_cache` 中的字段 `condition`。
请注意，仅当查询在启用设置 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) 下运行时，该字段才会被填充。

自数据库启动以来的查询条件缓存命中和未命中的数量显示为系统表 [system.events](system-tables/events.md) 中的事件 "QueryConditionCacheHits" 和 "QueryConditionCacheMisses"。
这两个计数器仅在带有设置 `use_query_condition_cache = true` 的 `SELECT` 查询中更新，其他查询不影响 "QueryCacheMisses"。

## 相关内容 {#related-content}

- 博客: [介绍查询条件缓存](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [谓词缓存：云数据仓库的查询驱动二级索引（Schmidt 等，2024）](https://doi.org/10.1145/3626246.3653395)
