---
'description': '在ClickHouse中使用和配置查询缓存功能的指南'
'sidebar_label': '查询缓存'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': '查询缓存'
---




# 查询缓存

查询缓存允许一次计算 `SELECT` 查询，并直接从缓存中为后续执行相同的查询提供服务。根据查询的类型，这可以显著减少 ClickHouse 服务器的延迟和资源消耗。

## 背景、设计与限制 {#background-design-and-limitations}

查询缓存通常可以视为事务一致或不一致。

- 在事务一致的缓存中，如果 `SELECT` 查询的结果发生变化或可能发生变化，数据库将使缓存的查询结果失效（丢弃）。在 ClickHouse 中，改变数据的操作包括对表的插入/更新/删除或合并。事务一致缓存特别适合于 OLTP 数据库，例如 [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（在8.0之后移除了查询缓存）和 [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务不一致的缓存中，可以接受查询结果的轻微不准确性，假设所有缓存项都分配了有效期，超过该期限后将过期（例如 1分钟），并且在此期间底层数据变化不大。这种方法总体上更适合 OLAP 数据库。例如，考虑一个每小时生成一次的销售报告在一个报表工具中被多个用户同时访问。销售数据的变化通常很慢，因此数据库只需要计算一次报告（由第一个 `SELECT` 查询表示）。后续的查询可以直接从查询缓存中提供。在这个例子中，合理的有效期可能为 30 分钟。

事务不一致缓存通常由客户端工具或代理包（例如 [chproxy](https://www.chproxy.org/configuration/caching/)）与数据库交互来提供。因此，相同的缓存逻辑和配置往往被重复。通过 ClickHouse 的查询缓存，缓存逻辑转移到服务器端。这减少了维护工作量并避免了冗余。

## 配置设置与使用 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中，您必须使用 [查询级别设置](/operations/settings/query-level) 来编辑查询缓存设置。目前不支持编辑 [配置级别设置](/operations/configuration-files)。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) 一次只运行一个查询。由于查询结果缓存没有意义，clickhouse-local 中禁用了查询结果缓存。
:::

设置 [use_query_cache](/operations/settings/settings#use_query_cache) 可用于控制当前会话中的特定查询或所有查询是否应该使用查询缓存。例如，查询的第一次执行

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

将在查询缓存中存储查询结果。后续相同查询的执行（也带有参数 `use_query_cache = true`）将从缓存中读取计算结果并立即返回。

:::note
设置 `use_query_cache` 和所有其他与查询缓存相关的设置只会对独立的 `SELECT` 语句生效。特别是，对通过 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建的视图的 `SELECT` 查询结果不会被缓存，除非 `SELECT` 语句使用 `SETTINGS use_query_cache = true` 运行。
:::

缓存的使用方式可以通过设置 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 和 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache)（默认均为 `true`）进行更详细配置。前者控制查询结果是否存储在缓存中，而后者确定数据库是否应该尝试从缓存中检索查询结果。例如，以下查询只会被被动地使用缓存，即尝试从中读取，但不会将其结果存储在其中：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了获得最大的控制力，通常建议仅对特定查询提供设置 `use_query_cache`、`enable_writes_to_query_cache` 和 `enable_reads_from_query_cache`。也可以在用户或配置文件级别启用缓存（例如，通过 `SET use_query_cache = true`），但应注意，这样所有 `SELECT` 查询可能会返回缓存结果。

可以使用语句 `SYSTEM DROP QUERY CACHE` 清除查询缓存。查询缓存的内容显示在系统表 [system.query_cache](system-tables/query_cache.md) 中。自数据库启动以来的查询缓存命中和未命中次数作为事件 "QueryCacheHits" 和 "QueryCacheMisses" 在系统表 [system.events](system-tables/events.md) 中显示。这两个计数器仅在使用设置 `use_query_cache = true` 的 `SELECT` 查询中更新，其他查询不会影响 "QueryCacheMisses"。系统表 [system.query_log](system-tables/query_log.md) 中的字段 `query_cache_usage` 显示每个执行的查询是否已写入或从查询缓存中读取查询结果。系统表 [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) 中的异步指标 "QueryCacheEntries" 和 "QueryCacheBytes" 显示查询缓存当前包含的条目/字节数。

查询缓存在每个 ClickHouse 服务器进程中存在一次。但是，缓存结果默认不在用户之间共享。可以更改此设置（见下文），但出于安全原因不推荐这么做。

查询结果在查询缓存中是通过它们的查询 [抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 进行引用的。这意味着缓存对大小写不敏感，例如 `SELECT 1` 和 `select 1` 被视为同一个查询。为了使匹配更加自然，所有与查询缓存相关的查询级别设置都已从 AST 中移除。

如果查询因异常或用户取消而中止，则不会在查询缓存中写入条目。

可以使用不同的 [服务器配置选项](/operations/server-configuration-parameters/settings#query_cache) 配置查询缓存的字节大小、最大缓存条目数量和单个缓存条目的最大大小（以字节和记录为单位）。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

还可以使用 [设置配置文件](settings/settings-profiles.md) 和 [设置约束](settings/constraints-on-settings.md) 来限制单个用户的缓存使用。例如，您可以限制用户在查询缓存中可以分配的最大内存（以字节为单位）和最大存储查询结果的数量。为此，首先在 `users.xml` 的用户配置文件中提供配置 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 和 [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries)，然后使这两个设置为只读：

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

为了定义一个查询必须至少运行多久以使其结果可以被缓存，可以使用设置 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration)。例如，查询的结果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

仅在查询运行超过 5 秒时被缓存。也可以指定查询必须运行多少次才能缓存其结果 - 为此使用设置 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在超过一定时间后变得过时（生存时间）。默认情况下，此期限为 60 秒，但可以使用设置 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) 在会话、配置文件或查询级别指定不同的值。查询缓存“懒惰”地淘汰条目，即当条目变得过时时，它不会立即从缓存中删除。相反，当要将新条目插入查询缓存时，数据库会检查缓存是否有足够的空闲空间来存放新条目。如果没有，数据库会尝试移除所有过时的条目。如果缓存仍然没有足够的空闲空间，则不会插入新条目。

查询缓存中的条目默认会被压缩。这降低了整体内存消耗，但以写入到查询缓存和从查询缓存读取的速度较慢为代价。要禁用压缩，请使用设置 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries)。

有时缓存同一查询的多个结果是有用的。这可以通过设置 [query_cache_tag](/operations/settings/settings#query_cache_tag) 来实现，该设置充当查询缓存条目的标签（或命名空间）。查询缓存将同一查询与不同标签的结果视为不同的。

为同一查询创建三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

要仅从查询缓存中删除带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。

ClickHouse 按 [max_block_size](/operations/settings/settings#max_block_size) 行的块读取表数据。由于过滤、聚合等，结果块通常小于 'max_block_size'，但也有一些情况下结果块会大得多。设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用）控制在插入到查询结果缓存之前，结果块是被压缩（如果它们很小）还是拆分（如果它们很大）为 'max_block_size' 的块。这降低了写入查询缓存的性能，但提高了缓存条目的压缩率，并在后续从查询缓存提供查询结果时提供了更自然的块粒度。

因此，查询缓存为每个查询存储了多个（部分）结果块。虽然这种行为是一个良好的默认设置，但可以使用设置 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 进行抑制。

另外，默认情况下，使用非确定性函数的查询结果不会被缓存。这些函数包括：
- 访问字典的函数：[ `dictGet()` ](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等。
- [用户定义函数](../sql-reference/statements/create/function.md) 的 XML 定义中没有标签 `<deterministic>true</deterministic>`。
- 返回当前日期或时间的函数：[ `now()` ](../sql-reference/functions/date-time-functions.md#now)，
  [ `today()` ](../sql-reference/functions/date-time-functions.md#today)，
  [ `yesterday()` ](../sql-reference/functions/date-time-functions.md#yesterday) 等。
- 返回随机值的函数：[ `randomString()` ](../sql-reference/functions/random-functions.md#randomString)，
  [ `fuzzBits()` ](../sql-reference/functions/random-functions.md#fuzzBits) 等。
- 其结果依赖于内部块大小和顺序的函数： 
  [ `nowInBlock()` ](../sql-reference/functions/date-time-functions.md#nowInBlock) 等，
  [ `rowNumberInBlock()` ](../sql-reference/functions/other-functions.md#rowNumberInBlock)，
  [ `runningDifference()` ](../sql-reference/functions/other-functions.md#runningDifference)，
  [ `blockSize()` ](../sql-reference/functions/other-functions.md#blockSize) 等。
- 依赖环境的函数：[ `currentUser()` ](../sql-reference/functions/other-functions.md#currentUser)，
  [ `queryID()` ](/sql-reference/functions/other-functions#queryid)，
  [ `getMacro()` ](../sql-reference/functions/other-functions.md#getMacro) 等。

要强制缓存涉及非确定性函数的查询结果，请使用设置 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及系统表（例如 [system.processes](system-tables/processes.md) 或 [information_schema.tables](system-tables/information_schema.md)）的查询结果默认不会被缓存。要强制缓存涉及系统表的查询结果，请使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，出于安全原因，查询缓存中的条目不在用户之间共享。例如，用户 A 不应该能够通过执行与用户 B 相同的查询来绕过表上的行策略，而用户 B 没有这样的策略。然而，如果必要，可以通过提供设置 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 来标记缓存条目对其他用户可访问（即共享）。

## 相关内容 {#related-content}

- 博客：[介绍 ClickHouse 查询缓存](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
