---
'description': '在 ClickHouse 中使用和配置查询缓存功能的指南'
'sidebar_label': '查询缓存'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': '查询缓存'
---


# 查询缓存

查询缓存允许仅计算一次 `SELECT` 查询，并直接从缓存中服务后续相同查询的执行。
根据查询的类型，这可以显著减少 ClickHouse 服务器的延迟和资源消耗。

## 背景、设计和限制 {#background-design-and-limitations}

查询缓存通常可以视为具有事务一致性或不一致性。

- 在事务一致性缓存中，当 `SELECT` 查询的结果发生变化或可能发生变化时，数据库会使缓存的查询结果失效（丢弃）。
  在 ClickHouse 中，更改数据的操作包括对表的插入/更新/删除或合并。事务一致性缓存特别适合 OLTP 数据库，例如
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（在 v8.0 后移除了查询缓存）和
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务不一致性缓存中，可以接受查询结果的轻微不准确性，假设所有缓存条目在一定期限后会过期（例如 1 分钟），并且在此期间基础数据变化很小。
  这种方法总体上更适合 OLAP 数据库。一个使用事务不一致性缓存的示例是，同时由多个用户访问的报告工具中的每小时销售报告。销售数据通常变化缓慢，数据库只需要计算报告一次（由第一次 `SELECT` 查询表示）。后续查询可以直接从查询缓存中提供。在这个例子中，合理的有效期可以是 30 分钟。

传统上，不一致性缓存由与数据库互动的客户端工具或代理包（例如
[chproxy](https://www.chproxy.org/configuration/caching/)）提供。因此，相同的缓存逻辑和配置通常被重复实现。随着 ClickHouse 查询缓存的推出，缓存逻辑迁移到服务器端。这降低了维护工作量，并避免了冗余。

## 配置设置及使用 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中，您必须使用 [查询级别设置](/operations/settings/query-level) 来编辑查询缓存设置。当前不支持编辑 [配置级别设置](/operations/configuration-files)。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) 一次运行单个查询。由于查询结果缓存没有意义，因此在 clickhouse-local 中禁用了查询结果缓存。
:::

设置 [use_query_cache](/operations/settings/settings#use_query_cache) 可控制当前会话的特定查询或所有查询是否应使用查询缓存。例如，查询的第一次执行

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

将会将查询结果存储在查询缓存中。后续相同查询的执行（同样带有参数 `use_query_cache = true`）将从缓存中读取计算结果并立即返回。

:::note
设置 `use_query_cache` 及所有其他与查询缓存相关的设置仅对独立的 `SELECT` 语句生效。特别是，由 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建的视图的 `SELECT` 结果不会被缓存，除非此 `SELECT` 语句使用 `SETTINGS use_query_cache = true` 执行。
:::

可以使用设置 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 和 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache)（默认为 `true`）更详细地配置缓存的使用方式。前者设置控制查询结果是否存储在缓存中，而后者设置决定数据库是否应尝试从缓存中检索查询结果。例如，以下查询只会被被动地使用缓存，即尝试从中读取，但不将结果存储在其中：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了最大程度地控制，通常建议仅在特定查询中提供设置 `use_query_cache`、`enable_writes_to_query_cache` 和 `enable_reads_from_query_cache`。也可以在用户或配置文件级别启用缓存（例如，通过 `SET use_query_cache = true`），但应注意，此时所有 `SELECT` 查询可能返回缓存结果。

查询缓存可以使用语句 `SYSTEM DROP QUERY CACHE` 清除。查询缓存的内容显示在系统表 [system.query_cache](system-tables/query_cache.md) 中。自数据库启动以来的查询缓存命中和未命中次数作为事件 "QueryCacheHits" 和 "QueryCacheMisses" 显示在系统表 [system.events](system-tables/events.md) 中。这两个计数器仅在 `use_query_cache = true` 设置下运行的 `SELECT` 查询中更新，其他查询不会影响 "QueryCacheMisses"。系统表 [system.query_log](system-tables/query_log.md) 中的字段 `query_cache_usage` 显示每个执行的查询其结果是否被写入或从查询缓存中读取。系统表 [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) 中的异步指标 "QueryCacheEntries" 和 "QueryCacheBytes" 显示查询缓存当前包含多少条目/字节。

查询缓存每个 ClickHouse 服务器进程存在一次。然而，由于默认情况下，不同用户之间不共享缓存结果。这可以更改（见下文），但出于安全原因，不建议这样做。

查询结果在查询缓存中的引用是基于查询的 [抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)。这意味着缓存对大小写是无关的，例如 `SELECT 1` 和 `select 1` 被视为相同的查询。为了使匹配更自然，与查询缓存相关的所有查询级别设置都从 AST 中删除。

如果查询由于异常或用户取消而中止，则不会将条目写入查询缓存。

可以使用不同的 [服务器配置选项](/operations/server-configuration-parameters/settings#query_cache) 配置查询缓存的大小（以字节为单位）、最大缓存条目数量以及单个缓存条目的最大大小（以字节和记录为单位）。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

也可以使用 [设置配置文件](settings/settings-profiles.md) 和 [设置约束](settings/constraints-on-settings.md) 限制单个用户的缓存使用。例如，您可以限制用户在查询缓存中分配的最大内存量（以字节为单位）和最大的存储查询结果数量。为此，首先在 `users.xml` 的用户配置文件中提供配置
[query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 和
[query_cache_max_entries](/operations/settings/settings#query_cache_max_entries)，然后使这两个设置为只读：

```xml
<profiles>
    <default>
        <!-- The maximum cache size in bytes for user/profile 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- The maximum number of SELECT query results stored in the cache for user/profile 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Make both settings read-only so the user cannot change them -->
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

要定义查询必须至少运行多长时间才能使结果缓存，可以使用设置
[query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration)。例如，查询的结果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

仅在查询运行超过 5 秒时才会被缓存。还可以指定查询需要运行多少次，直到其结果被缓存 - 为此使用设置 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在一定时间后变得过时（生存时间）。默认情况下，此期限为 60 秒，但可以使用设置 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) 在会话、配置文件或查询级别指定其他值。查询缓存会“懒惰”地逐出条目，即，当条目变得过时时，不会立即从缓存中删除。相反，当新条目要插入查询缓存时，数据库会检查缓存是否有足够的可用空间。如果没有，数据库会尝试删除所有过期条目。如果缓存仍然没有足够的可用空间，则不插入新条目。

查询缓存中的条目默认是压缩的。这减少了总体内存消耗，但导致写入/读取查询缓存时速度较慢。要禁用压缩，请使用设置 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries)。

有时保留同一查询的多个结果缓存是有用的。可以通过使用设置 [query_cache_tag](/operations/settings/settings#query_cache_tag) 来实现，该设置充当查询缓存条目的标签（或命名空间）。查询缓存认为带有不同标签的相同查询的结果是不同的。

创建三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

要仅从查询缓存中删除带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。

ClickHouse 以 [max_block_size](/operations/settings/settings#max_block_size) 行的块读取表数据。由于过滤、聚合等，结果块通常比 'max_block_size' 小得多，但也有一些情况它们会大得多。设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用）控制在插入查询结果缓存之前，结果块是被压缩（如果它们很小）还是拆分（如果它们很大）为 'max_block_size' 大小的块。这会降低写入查询缓存的性能，但提高缓存条目的压缩率，并在稍后从查询缓存中提供查询结果时提供更自然的块粒度。

因此，查询缓存对每个查询存储多个（部分）结果块。尽管这种行为是一个合适的默认设置，但可以使用设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 抑制该行为。

此外，具有非确定性函数的查询结果默认是不被缓存的。这类函数包括
- 用于访问字典的函数：[`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等。
- [用户定义函数](../sql-reference/statements/create/function.md) 在其 XML 定义中没有标签 `<deterministic>true</deterministic>`，
- 返回当前日期或时间的函数：[`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等，
- 返回随机值的函数：[`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等，
- 结果依赖于用于查询处理的内部块的大小和顺序的函数：
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等，
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等，
- 依赖于环境的函数：[`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

要强制缓存具有非确定性函数结果的查询，请使用设置
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及系统表（例如 [system.processes](system-tables/processes.md)` 或
[information_schema.tables](system-tables/information_schema.md)）的查询结果默认不被缓存。要强制缓存包含系统表结果的查询，可以使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，由于安全原因，查询缓存中的条目不会在用户之间共享。例如，用户 A 不得能够通过以另一用户 B 的身份运行相同查询而绕过表上的行策略，而该用户 B 没有这样政策。然而，如果必要，可以通过提供设置
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 将缓存条目标记为其他用户可访问（即共享）。

## 相关内容 {#related-content}

- 博客: [介绍 ClickHouse 查询缓存](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
