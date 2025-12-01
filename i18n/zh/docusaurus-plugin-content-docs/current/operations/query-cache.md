---
description: '使用和配置 ClickHouse 查询缓存功能的指南'
sidebar_label: '查询缓存'
sidebar_position: 65
slug: /operations/query-cache
title: '查询缓存'
doc_type: 'guide'
---

# 查询缓存 {#query-cache}

查询缓存允许某个 `SELECT` 查询只需计算一次，之后再次执行相同查询时可直接从缓存中返回结果。
根据查询类型的不同，这可以显著降低 ClickHouse 服务器的延迟和资源消耗。

## 背景、设计和限制 {#background-design-and-limitations}

查询缓存通常可以分为事务一致或事务不一致两种类型。

- 在事务一致的缓存中，如果 `SELECT` 查询的结果发生或可能发生变化，数据库会使缓存的查询结果失效（丢弃）。在 ClickHouse 中，更改数据的操作包括对表进行插入/更新/删除，或者折叠合并。事务一致的缓存尤其适用于 OLTP 数据库，例如
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（在 v8.0 之后移除了查询缓存）和
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务不一致的缓存中，在假设所有缓存条目都被分配了一个有效期（例如 1 分钟），并且底层数据在此期间变化不大的前提下，可以接受查询结果存在轻微不精确。总体而言，这种方式更适合 OLAP 数据库。以一个事务不一致缓存已足够的例子来说，可以考虑一个报表工具中的每小时销售报表，该报表同时被多个用户访问。销售数据通常变化较慢，因此数据库只需要计算一次报表（由第一次 `SELECT` 查询表示），后续的查询可以直接由查询缓存提供。在这个示例中，一个合理的有效期可以是 30 分钟。

事务不一致的缓存传统上由与数据库交互的客户端工具或代理程序（例如
[chproxy](https://www.chproxy.org/configuration/caching/)）提供。由此导致相同的缓存逻辑和配置往往会被重复实现。借助 ClickHouse 的查询缓存，缓存逻辑被移到了服务端，从而减少了维护工作量并避免了冗余。

## 配置设置和使用方法 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中，必须使用[查询级别设置](/operations/settings/query-level)来编辑查询缓存设置。目前不支持编辑[配置级别设置](/operations/configuration-files)。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) 一次只运行一个查询。由于查询结果缓存没有意义，因此在 clickhouse-local 中禁用了查询结果缓存。
:::

[use&#95;query&#95;cache](/operations/settings/settings#use_query_cache) 设置可用于控制是否对特定查询或当前会话中的所有查询启用查询缓存。例如，第一次执行查询时

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

会将查询结果存储到查询缓存中。之后对相同查询的执行（同样带有参数 `use_query_cache = true`）将
从缓存中读取已计算的结果并立即返回。

:::note
`use_query_cache` 以及所有其他与查询缓存相关的设置仅对独立的 `SELECT` 语句生效。特别地，
由 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建的 VIEW 上执行的 `SELECT` 结果不会被缓存，除非该 `SELECT`
语句在运行时使用 `SETTINGS use_query_cache = true` 执行。
:::

可以通过设置 [enable&#95;writes&#95;to&#95;query&#95;cache](/operations/settings/settings#enable_writes_to_query_cache)
和 [enable&#95;reads&#95;from&#95;query&#95;cache](/operations/settings/settings#enable_reads_from_query_cache)（两者默认均为 `true`）更细致地配置缓存的使用方式。前者控制
查询结果是否存入缓存，而后者决定数据库是否应尝试从缓存中读取查询结果。例如，下面的查询将仅被动地使用缓存，即尝试从中读取结果，但不会将自身的结果
存入缓存：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了获得最大程度的控制，一般建议仅在特定查询中设置 `use_query_cache`、`enable_writes_to_query_cache` 和
`enable_reads_from_query_cache`。也可以在用户或 profile 级别启用缓存（例如通过 `SET
use_query_cache = true`），但需要注意的是，此时所有 `SELECT` 查询都可能返回缓存结果。

可以使用语句 `SYSTEM DROP QUERY CACHE` 清空查询缓存。查询缓存的内容显示在系统表
[system.query&#95;cache](system-tables/query_cache.md) 中。自数据库启动以来查询缓存命中和未命中的次数，以事件
`QueryCacheHits` 和 `QueryCacheMisses` 的形式显示在系统表 [system.events](system-tables/events.md) 中。两个计数器仅在
`SELECT` 查询使用 `use_query_cache = true` 设置运行时才会更新，其他查询不会影响 `QueryCacheMisses`。系统表
[system.query&#95;log](system-tables/query_log.md) 中的字段 `query_cache_usage` 会针对每个已执行查询显示其查询结果是写入了查询缓存，
还是从查询缓存中读取。系统表
[system.metrics](system-tables/metrics.md) 中的指标 `QueryCacheEntries` 和 `QueryCacheBytes` 显示查询缓存当前包含多少条目/字节。

查询缓存在每个 ClickHouse 服务器进程中各存在一份。然而，默认情况下缓存结果不会在不同用户之间共享。可以更改这一行为（见下文），但出于安全原因不推荐这样做。

查询结果在查询缓存中的引用是根据查询的[抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 来确定的。
这意味着缓存对大小写不敏感，例如 `SELECT 1` 和 `select 1` 会被视为相同的查询。为了使匹配更加自然，所有与查询缓存和
[输出格式](settings/settings-formats.md)) 相关的查询级别设置都会从 AST 中移除。

如果查询因异常或用户取消而中止，则不会向查询缓存写入任何条目。

查询缓存的总大小（字节数）、最大缓存条目数以及单个缓存条目的最大大小（按字节数和记录数）可以通过不同的
[服务器配置选项](/operations/server-configuration-parameters/settings#query_cache) 进行配置。


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

还可以使用 [settings profiles](settings/settings-profiles.md) 和 [settings
constraints](settings/constraints-on-settings.md) 来限制单个用户的缓存使用量。更具体地说，可以限制用户在查询缓存中可分配的最大内存（以字节为单位）以及可存储的查询结果的最大数量。为此，首先在 `users.xml` 中的用户配置文件中设置
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 和
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) 这两个配置项，然后将这两个设置设为只读：

```xml
<profiles>
    <default>
        <!-- 用户/配置文件 'default' 的最大缓存大小(以字节为单位) -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- 用户/配置文件 'default' 缓存中存储的 SELECT 查询结果的最大条目数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 将这两项设置设为只读,使用户无法修改 -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            <query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

要设置查询结果可被缓存所需的最小运行时长，可以使用参数
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration)。例如，下面这个查询的结果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

仅当查询运行时间超过 5 秒时才会被缓存。也可以指定查询需要运行多少次其结果才会被缓存——为此请使用设置 [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在经过一段时间后会变为陈旧（time-to-live，TTL）。默认情况下，此时间为 60 秒，但可以在会话、配置文件或查询级别使用设置 [query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl) 指定不同的值。查询缓存会“惰性”地淘汰条目，即当一个条目变为陈旧时，并不会立刻从缓存中移除。相反，当要向查询缓存中插入一个新条目时，数据库会检查缓存中是否有足够的可用空间来存放新条目。如果没有，数据库会尝试移除所有陈旧条目。如果缓存仍然没有足够的可用空间，则不会插入新的条目。

如果通过 HTTP 运行查询，则 ClickHouse 会设置 `Age` 和 `Expires` 头部，其中包含缓存条目的存活时间（秒）和过期时间戳。

查询缓存中的条目默认会被压缩。这在一定程度上降低了总体内存占用，但会带来写入/读取查询缓存变慢的代价。要禁用压缩，请使用设置 [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries)。

有时，为同一个查询保留多个缓存结果是有用的。可以使用设置 [query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag) 来实现，它充当查询缓存条目的标签（或命名空间）。查询缓存会将同一查询在不同标签下的结果视为不同的结果。

为同一个查询创建三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag 隐式为 ''(空字符串)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

若只想从查询缓存中移除带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。


ClickHouse 读取表数据时，以 [max_block_size](/operations/settings/settings#max_block_size) 行为一个块。由于过滤、聚合等操作，结果块通常远小于 `max_block_size`，但也可能出现远大于该值的情况。[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用）用于控制在将结果块插入查询结果缓存之前，如果结果块很小则将其压缩合并，如果很大则将其拆分为大小为 `max_block_size` 的块。这样会降低写入查询缓存时的性能，但可以提高缓存条目的压缩率，并在稍后从查询缓存返回查询结果时提供更自然的块粒度。

因此，查询缓存会为每个查询存储多个（部分的）结果块。虽然这种行为是合理的默认设置，但可以通过设置
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 来禁用。

此外，包含非确定性函数的查询结果默认不会被缓存。这类函数包括：

- 访问字典的函数：[`dictGet()`](/sql-reference/functions/ext-dict-functions) 等，
- 在其 XML 定义中未包含标签 `<deterministic>true</deterministic>` 的 [用户自定义函数](../sql-reference/statements/create/function.md)，
- 返回当前日期或时间的函数：[`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等，
- 返回随机值的函数：[`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等，
- 其结果依赖于用于查询处理的内部分块的大小和顺序的函数：
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等、
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等，
- 依赖环境的函数：[`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](/sql-reference/functions/other-functions#queryID)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

如果仍然希望对包含非确定性函数的查询结果进行缓存，请使用设置
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及 system 表的查询结果（例如 [system.processes](system-tables/processes.md) 或
[information_schema.tables](system-tables/information_schema.md)）默认不会被缓存。如果仍然希望对包含 system 表的查询结果进行缓存，请使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，出于安全原因，查询缓存中的条目不会在用户之间共享。例如，用户 A 不应通过执行与用户 B 相同的查询而绕过表上的 ROW POLICY（而用户 B 上并不存在该策略）。但是，在必要时，可以通过设置
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 将缓存条目标记为可被其他用户访问（即共享）。

## 相关内容 {#related-content}

- 博客：[介绍 ClickHouse 查询缓存](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)