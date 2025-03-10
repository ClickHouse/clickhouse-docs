---
slug: '/operations/query-cache'
sidebar_position: 65
sidebar_label: '查询缓存'
---


# 查询缓存

查询缓存允许仅计算一次 `SELECT` 查询，并直接从缓存中提供该查询的后续执行。根据查询的类型，这可以显著减少 ClickHouse 服务器的延迟和资源消耗。

## 背景、设计和限制 {#background-design-and-limitations}

查询缓存一般可以视为事务一致或不一致。

- 在事务一致的缓存中，如果 `SELECT` 查询的结果发生变化或可能发生变化，数据库会使缓存的查询结果失效（丢弃）。在 ClickHouse 中，改变数据的操作包括对表的插入/更新/删除或崩溃合并。事务一致的缓存特别适合 OLTP 数据库，例如 [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（在 v8.0 后移除了查询缓存）和 [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务不一致的缓存中，查询结果中的轻微不准确性被接受，假设所有缓存条目在有效期之后会过期（例如 1 分钟），并且在此期间底层数据变化很少。这种方法总体上更适合 OLAP 数据库。例如，在一个同时被多个用户访问的报告工具中，考虑每小时销售报告。销售数据通常变化缓慢，因此数据库只需要计算一次报告（通过第一个 `SELECT` 查询表示）。后续查询可以直接从查询缓存中提供。在这个例子中，一个合理的有效期可以是 30 分钟。

事务不一致的缓存传统上由与数据库交互的客户端工具或代理包（例如 [chproxy](https://www.chproxy.org/configuration/caching/)）提供。因此，相同的缓存逻辑和配置通常会被复制。通过 ClickHouse 的查询缓存，缓存逻辑转移到服务器端。这减少了维护工作量并避免了冗余。

## 配置设置和使用 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中，您必须使用 [查询级别设置](/operations/settings/query-level) 来编辑查询缓存设置。目前不支持编辑 [配置级别设置](/operations/configuration-files)。
:::

设置 [use_query_cache](/operations/settings/settings#use_query_cache) 可用于控制特定查询或当前会话的所有查询是否应使用查询缓存。例如，第一个执行查询

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

将查询结果存储在查询缓存中。后续的相同查询执行（参数 `use_query_cache = true`）将直接从缓存中读取计算结果并立即返回。

:::note
设置 `use_query_cache` 和所有其他与查询缓存相关的设置仅对独立的 `SELECT` 语句生效。特别地，结果 `SELECT` 的物化视图由 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建，除非 `SELECT` 语句与 `SETTINGS use_query_cache = true` 一起运行，否则结果不会被缓存。
:::

可以使用设置 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 和 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) 更详细地配置缓存的使用方式（默认均为 `true`）。前者设置控制查询结果是否存储在缓存中，而后者设置确定数据库是否应该尝试从缓存中检索查询结果。例如，以下查询将仅被动使用缓存，即尝试从中读取但不将其结果存储到缓存中：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了获得最大的控制，通常建议仅为特定查询提供设置 `use_query_cache`、`enable_writes_to_query_cache` 和 `enable_reads_from_query_cache`。也可以在用户或配置文件级别启用缓存（例如，通过 `SET use_query_cache = true`），但应考虑到所有 `SELECT` 查询可能会返回缓存结果。

可以使用语句 `SYSTEM DROP QUERY CACHE` 清除查询缓存。查询缓存的内容在系统表 [system.query_cache](system-tables/query_cache.md) 中显示。自数据库启动以来的查询缓存命中和未命中次数作为事件 "QueryCacheHits" 和 "QueryCacheMisses" 显示在系统表 [system.events](system-tables/events.md) 中。这两个计数器仅对设置 `use_query_cache = true` 的 `SELECT` 查询进行更新，其他查询不会影响 "QueryCacheMisses"。系统表 [system.query_log](system-tables/query_log.md) 中的字段 `query_cache_usage` 显示每个执行的查询是否将查询结果写入或从查询缓存中读取。系统表 [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) 中的异步指标 "QueryCacheEntries" 和 "QueryCacheBytes" 显示当前查询缓存包含多少个条目/字节。

查询缓存每个 ClickHouse 服务器进程存在一次。默认情况下，缓存结果不在用户之间共享。这可以更改（见下文）但出于安全原因不推荐这样做。

查询结果在查询缓存中通过其查询的 [抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 引用。这意味着缓存对大小写不敏感，例如 `SELECT 1` 和 `select 1` 被视为相同的查询。为了使匹配更加自然，所有与查询缓存相关的查询级别设置都从 AST 中删除。

如果查询因异常或用户取消而被中止，则不会在查询缓存中写入任何条目。

可以使用不同的 [服务器配置选项](/operations/server-configuration-parameters/settings#query_cache) 配置查询缓存的字节大小、最大缓存条目数和单个缓存条目的最大大小（以字节和记录数为单位）。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

还可以使用 [设置配置文件](settings/settings-profiles.md) 和 [设置约束](settings/constraints-on-settings.md) 来限制单个用户的缓存使用情况。更具体地说，您可以限制用户在查询缓存中可能分配的最大内存量（以字节为单位）和最大存储的查询结果数量。为此，首先在 `users.xml` 中为用户配置文件提供配置 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 和 [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries)，然后将两个设置设为只读：

``` xml
<profiles>
    <default>
        <!-- 用户/配置文件 'default' 的最大缓存大小（以字节为单位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- 用户/配置文件 'default' 的缓存中存储的 SELECT 查询结果的最大数量 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 使这两个设置为只读，以便用户无法更改它们 -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            </query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

要定义查询必须至少运行多长时间，以便其结果可以被缓存，可以使用设置 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration)。例如，如果查询的结果

``` sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

只有在查询运行超过 5 秒时才会被缓存。也可以指定查询运行多少次才会被缓存——为此使用设置 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在某个时间段后会变得过时（生存时间）。默认情况下，这个时间段为 60 秒，但可以在会话、配置文件或查询级别使用设置 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) 指定不同的值。查询缓存“懒惰”地驱逐条目，即当某个条目变得过时时，它不会立即从缓存中删除。相反，当要插入新条目到查询缓存时，数据库会检查缓存中是否有足够的空闲空间用于新条目。如果没有，数据库会尝试删除所有过时的条目。如果缓存仍没有足够的空闲空间，则不会插入新条目。

查询缓存中的条目默认是压缩的。这在降低查询缓存的整体内存消耗的同时，牺牲了写入/读取的速度。要禁用压缩，请使用设置 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries)。

有时保留同一查询的多个结果是有用的。这可以通过使用设置 [query_cache_tag](/operations/settings/settings#query_cache_tag) 实现，该设置充当查询缓存条目的标签（或命名空间）。查询缓存将认为，具有不同标签的同一查询的结果是不同的。

对于创建同一查询的三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag 默认为 ''（空字符串）
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

要只从查询缓存中删除带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。

ClickHouse 按块读取表数据，每块的行数由 [max_block_size](/operations/settings/settings#max_block_size) 定义。由于过滤、聚合等原因，结果块通常要比 'max_block_size' 小得多，但也有一些情况它们会大得多。设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用）控制结果块在插入查询结果缓存之前是否被压缩（如果它们很小）或分割（如果它们很大）成 'max_block_size' 大小的块。这减少了写入查询缓存的性能，但提高了缓存条目的压缩率，并在查询结果从查询缓存中提供时提供了更自然的块粒度。

因此，查询缓存为每个查询存储多个（部分）结果块。虽然这种行为是一个好的默认行为，但可以使用设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 将其抑制。

此外，默认情况下，使用非确定性函数的查询结果不会被缓存。这些函数包括：
- 访问字典的函数：[`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等。
- [用户定义函数](../sql-reference/statements/create/function.md)。
- 返回当前日期或时间的函数：[`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等。
- 返回随机值的函数：[`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等。
- 函数的结果依赖于用于查询处理的内部块的大小和顺序：[`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等、[`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、[`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等。
- 依赖环境的函数：[`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](/sql-reference/functions/other-functions#queryid)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

要强制缓存使用非确定性函数的查询结果，可以使用设置 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及系统表（例如 [system.processes](system-tables/processes.md) 或 [information_schema.tables](system-tables/information_schema.md)）的查询的结果默认也不会被缓存。要强制缓存涉及系统表的查询结果，可以使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，由于安全原因，查询缓存中的条目不会在用户之间共享。例如，用户 A 不应能够通过运行与没有此类策略的另一个用户 B 相同的查询来绕过表的行政策。不过，如果有必要，可以通过提供设置 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 将缓存条目标记为其他用户可访问（即共享）。

## 相关内容 {#related-content}

- 博客: [介绍 ClickHouse 查询缓存](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
