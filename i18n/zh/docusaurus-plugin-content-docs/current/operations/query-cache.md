---
'description': '在 ClickHouse 中使用和配置查询缓存功能的指南'
'sidebar_label': '查询缓存'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': '查询缓存'
'doc_type': 'guide'
---


# 查询缓存

查询缓存允许只计算一次 `SELECT` 查询，并直接从缓存中服务后续相同查询的执行。根据查询类型，这可以显著减少 ClickHouse 服务器的延迟和资源消耗。

## 背景、设计和限制 {#background-design-and-limitations}

查询缓存通常可以分为事务一致和不一致的两种。

- 在事务一致的缓存中，如果 `SELECT` 查询的结果发生变化或可能发生变化，数据库会使缓存的查询结果失效（丢弃）。在 ClickHouse 中，更改数据的操作包括对表的插入/更新/删除或合并操作。事务一致的缓存特别适合 OLTP 数据库，例如
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（在 v8.0 后移除了查询缓存）和
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务不一致的缓存中，查询结果的轻微不准确是可以接受的，前提是所有缓存条目都有一个有效期，超过这一期后将过期（例如 1 分钟），而且在此期间底层数据变化很小。这种方法总体上更适合 OLAP 数据库。作为一个足够的事务不一致缓存的示例，考虑在报告工具中的每小时销售报告，该报告被多个用户同时访问。销售数据的变化通常很慢，以至于数据库只需要计算一次报告（由第一次 `SELECT` 查询表示）。后续的查询可以直接从查询缓存中获取。在这个例子中，一个合理的有效期可以是 30 分钟。

事务不一致缓存通常由客户端工具或代理包（例如 
[chproxy](https://www.chproxy.org/configuration/caching/)）与数据库进行交互提供。因此，相同的缓存逻辑和配置通常是重复的。随着 ClickHouse 查询缓存的出现，缓存逻辑转移到服务器端。这减少了维护工作并避免了冗余。

## 配置设置和使用 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中，您必须使用 [查询级设置](/operations/settings/query-level) 来编辑查询缓存设置。当前不支持编辑 [配置级设置](/operations/configuration-files)。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) 一次运行单个查询。由于查询结果缓存没有意义，因此在 clickhouse-local 中禁用查询结果缓存。
:::

设置 [use_query_cache](/operations/settings/settings#use_query_cache) 可用于控制当前会话中特定查询或所有查询是否应使用查询缓存。例如，查询的第一次执行

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

将结果存储在查询缓存中。后续相同查询的执行（参数 `use_query_cache = true`）将从缓存中读取已计算的结果并立即返回。

:::note
设置 `use_query_cache` 及所有其他与查询缓存相关的设置仅对独立的 `SELECT` 语句有效。特别是，使用 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建的视图的 `SELECT` 的结果不会被缓存，除非该 `SELECT` 语句使用 `SETTINGS use_query_cache = true` 运行。
:::

可以使用设置 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 和 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) （默认均为 `true`）更详细地配置缓存的使用。前者设置控制是否将查询结果存储在缓存中，而后者设置决定数据库是否应该尝试从缓存中检索查询结果。例如，以下查询将被动使用缓存，即尝试从中读取但不将其结果存储到其中：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了获得最大的控制，通常建议仅在特定查询中提供设置 `use_query_cache`、`enable_writes_to_query_cache` 和 `enable_reads_from_query_cache`。也可以通过 `SET use_query_cache = true` 在用户或配置文件级别启用缓存，但应记住，这样所有 `SELECT` 查询可能会返回缓存结果。

可以使用语句 `SYSTEM DROP QUERY CACHE` 清除查询缓存。查询缓存的内容在系统表 [system.query_cache](system-tables/query_cache.md) 中显示。查询缓存命中的次数和未命中的次数自数据库启动以来作为事件 "QueryCacheHits" 和 "QueryCacheMisses" 显示在系统表 [system.events](system-tables/events.md) 中。这两个计数器仅在设置为 `use_query_cache = true` 的 `SELECT` 查询中更新，其他查询不影响 "QueryCacheMisses"。系统表 [system.query_log](system-tables/query_log.md) 中的字段 `query_cache_usage` 显示每个执行的查询是否将查询结果写入或从查询缓存中读取。系统表 [system.metrics](system-tables/metrics.md) 中的指标 `QueryCacheEntries` 和 `QueryCacheBytes` 显示查询缓存当前包含多少条目/字节。

查询缓存在每个 ClickHouse 服务器进程中存在一次。然而，缓存结果默认不在用户之间共享。这可以更改（见下文），但出于安全原因，不建议这样做。

查询结果在查询缓存中的引用是通过其查询的 [抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 实现的。这意味着缓存对大小写不敏感，例如 `SELECT 1` 和 `select 1` 被视为相同的查询。为了使匹配更加自然，与查询缓存相关的所有查询级设置从 AST 中移除。

如果查询由于异常或用户取消而中止，则不会在查询缓存中写入条目。

查询缓存的大小（以字节为单位）、最大缓存条目数和单个缓存条目的最大大小（以字节和记录数表示）可以使用不同的 [服务器配置选项](/operations/server-configuration-parameters/settings#query_cache) 进行配置。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

也可以使用 [设置配置文件](settings/settings-profiles.md) 和 [设置约束](settings/constraints-on-settings.md) 来限制个别用户的缓存使用情况。更具体地说，可以限制用户在查询缓存中分配的最大内存量（以字节为单位）和存储的查询结果的最大数量。为此，首先在 `users.xml` 中的用户配置文件中提供配置 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 和 [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries)，然后将这两个设置设为只读：

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

要定义查询至少必须运行多长时间才能使其结果缓存，可以使用设置 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration)。例如，查询的结果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

仅在查询运行超过 5 秒时才会被缓存。也可以指定查询需要运行多少次以便缓存其结果 - 为此使用设置 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在一定时间后变得过期（生存时间）。默认情况下，这一时期为 60 秒，但可以通过设置 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) 在会话、配置文件或查询级别上指定不同的值。查询缓存懒惰地驱逐条目，即当条目变得过期时，它不会立即从缓存中删除。相反，当要将新条目插入查询缓存时，数据库会检查缓存中是否有足够的可用空间。如果没有，数据库将尝试删除所有过期条目。如果缓存仍然没有足够的可用空间，则不插入新条目。

查询缓存中的条目默认是压缩的。这降低了整体内存消耗，但以写入到查询缓存和从查询缓存读取会变慢为代价。要禁用压缩，请使用设置 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries)。

有时，保留相同查询的多个结果缓存是有用的。这可以通过使用设置 [query_cache_tag](/operations/settings/settings#query_cache_tag) 来实现，该设置充当查询缓存条目的标签（或命名空间）。查询缓存将具有不同标签的相同查询的结果视为不同的。

创建三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

要仅从查询缓存中删除带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。

ClickHouse 以 [max_block_size](/operations/settings/settings#max_block_size) 行的数据块读取表数据。由于过滤、聚合等，结果块通常比 "max_block_size" 小，但在某些情况下，它们可能会大得多。设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用）控制结果块在插入查询结果缓存之前是被压缩（如果它们很小）还是分割成 "max_block_size" 大小的块。虽然这会降低写入查询缓存的性能，但会提高缓存条目的压缩率，并在之后从查询缓存提供查询结果时提供更自然的块粒度。

因此，查询缓存为每个查询存储多个（部分）结果块。虽然这种行为是一个良好的默认设置，但可以使用设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 来抑制。

此外，使用非确定性函数的查询结果默认情况下不会被缓存。这些函数包括：
- 访问字典的函数： [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等。
- 在其 XML 定义中没有标签 `<deterministic>true</deterministic>` 的 [用户定义函数](../sql-reference/statements/create/function.md)。
- 返回当前日期或时间的函数： [`now()`](../sql-reference/functions/date-time-functions.md#now)，
  [`today()`](../sql-reference/functions/date-time-functions.md#today)，
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等。
- 返回随机值的函数： [`randomString()`](../sql-reference/functions/random-functions.md#randomString)，
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等。
- 结果依赖于查询处理所使用的内部块的大小和顺序的函数： [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等， 
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)，
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)，
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等。
- 依赖于环境的函数： [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)，
  [`queryID()`](/sql-reference/functions/other-functions#queryid)，
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

要强制缓存非确定性函数查询的结果，请使用设置 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及系统表的查询结果（例如 [system.processes](system-tables/processes.md) 或 
[information_schema.tables](system-tables/information_schema.md)）默认情况下不会被缓存。要强制缓存涉及系统表查询的结果，请使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，由于安全原因，查询缓存中的条目不在用户之间共享。例如，用户 A 不能通过执行与另一用户 B 相同的查询来绕过表上的行策略，而用户 B 不存在这样的策略。但是，如果需要，可以通过提供设置 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 来标记缓存条目可被其他用户访问（即共享）。

## 相关内容 {#related-content}

- 博客：[介绍 ClickHouse 查询缓存](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
