---
description: '关于在 ClickHouse 中使用和配置查询缓存功能的指南'
sidebar_label: '查询缓存'
sidebar_position: 65
slug: /operations/query-cache
title: '查询缓存'
doc_type: 'guide'
---



# 查询缓存

查询缓存可以让 `SELECT` 查询只需计算一次，并在后续执行相同查询时直接从缓存中返回结果。
根据查询类型的不同，这可以显著降低 ClickHouse 服务器的延迟和资源消耗。



## 背景、设计和限制 {#background-design-and-limitations}

查询缓存通常可以分为事务一致性缓存和事务非一致性缓存两类。

- 在事务一致性缓存中,当 `SELECT` 查询的结果发生变化或可能发生变化时,数据库会使缓存的查询结果失效(丢弃)。在 ClickHouse 中,会改变数据的操作包括对表的插入/更新/删除操作或折叠合并。事务一致性缓存特别适用于 OLTP 数据库,例如 [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)(在 v8.0 之后移除了查询缓存功能)和 [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)。
- 在事务非一致性缓存中,查询结果中的轻微不准确性是可以接受的,其前提假设是所有缓存条目都被分配了一个有效期,过期后会失效(例如 1 分钟),并且在此期间底层数据变化很小。这种方法总体上更适合 OLAP 数据库。举一个事务非一致性缓存足以满足需求的例子:考虑报表工具中的每小时销售报告,该报告被多个用户同时访问。销售数据的变化通常足够缓慢,因此数据库只需要计算一次报告(由第一个 `SELECT` 查询表示)。后续查询可以直接从查询缓存中获取结果。在此示例中,合理的有效期可以设置为 30 分钟。

事务非一致性缓存传统上由与数据库交互的客户端工具或代理包(例如 [chproxy](https://www.chproxy.org/configuration/caching/))提供。因此,相同的缓存逻辑和配置经常被重复实现。通过 ClickHouse 的查询缓存,缓存逻辑转移到服务器端。这减少了维护工作量并避免了冗余。


## 配置设置和使用 {#configuration-settings-and-usage}

:::note
在 ClickHouse Cloud 中,必须使用[查询级别设置](/operations/settings/query-level)来编辑查询缓存设置。目前不支持编辑[配置级别设置](/operations/configuration-files)。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) 一次只运行一个查询。由于查询结果缓存在此场景下没有意义,因此在 clickhouse-local 中禁用了查询结果缓存。
:::

设置 [use_query_cache](/operations/settings/settings#use_query_cache) 可用于控制特定查询或当前会话的所有查询是否应使用查询缓存。例如,首次执行以下查询

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

将把查询结果存储在查询缓存中。后续执行相同的查询(同样使用参数 `use_query_cache = true`)将从缓存中读取计算结果并立即返回。

:::note
设置 `use_query_cache` 和所有其他与查询缓存相关的设置仅对独立的 `SELECT` 语句生效。特别是,通过 `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` 创建的视图的 `SELECT` 结果不会被缓存,除非 `SELECT` 语句使用 `SETTINGS use_query_cache = true` 运行。
:::

可以使用设置 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 和 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache)(两者默认均为 `true`)更详细地配置缓存的使用方式。前者控制查询结果是否存储到缓存中,而后者决定数据库是否应尝试从缓存中检索查询结果。例如,以下查询将仅被动使用缓存,即尝试从中读取但不将其结果存储到缓存中:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

为了实现最大控制,通常建议仅在特定查询中提供设置 `use_query_cache`、`enable_writes_to_query_cache` 和 `enable_reads_from_query_cache`。也可以在用户或配置文件级别启用缓存(例如通过 `SET use_query_cache = true`),但应注意,这样所有 `SELECT` 查询都可能返回缓存结果。

可以使用语句 `SYSTEM DROP QUERY CACHE` 清除查询缓存。查询缓存的内容显示在系统表 [system.query_cache](system-tables/query_cache.md) 中。自数据库启动以来的查询缓存命中和未命中次数在系统表 [system.events](system-tables/events.md) 中显示为事件 "QueryCacheHits" 和 "QueryCacheMisses"。这两个计数器仅针对使用设置 `use_query_cache = true` 运行的 `SELECT` 查询更新,其他查询不影响 "QueryCacheMisses"。系统表 [system.query_log](system-tables/query_log.md) 中的字段 `query_cache_usage` 显示每个已执行查询的查询结果是否被写入或从查询缓存中读取。系统表 [system.metrics](system-tables/metrics.md) 中的指标 `QueryCacheEntries` 和 `QueryCacheBytes` 显示查询缓存当前包含的条目数/字节数。

每个 ClickHouse 服务器进程存在一个查询缓存。但是,默认情况下缓存结果不在用户之间共享。这可以更改(见下文),但出于安全原因不建议这样做。

查询结果在查询缓存中通过其查询的[抽象语法树 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 进行引用。这意味着缓存不区分大小写,例如 `SELECT 1` 和 `select 1` 被视为相同的查询。为了使匹配更自然,所有与查询缓存和[输出格式化](settings/settings-formats.md)相关的查询级别设置都会从 AST 中移除。

如果查询因异常或用户取消而中止,则不会向查询缓存写入任何条目。

查询缓存的大小(以字节为单位)、缓存条目的最大数量以及单个缓存条目的最大大小(以字节和记录数为单位)可以使用不同的[服务器配置选项](/operations/server-configuration-parameters/settings#query_cache)进行配置。


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

还可以使用[settings profiles](settings/settings-profiles.md)和[settings
constraints](settings/constraints-on-settings.md)来限制单个用户的缓存使用。更具体地说，你可以限制用户在查询缓存中可分配的最大内存（以字节为单位）以及可存储的查询结果的最大数量。为此，首先在 `users.xml` 中的用户配置文件中设置[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes)和
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries)，然后将这两个设置设为只读：

```xml
<profiles>
    <default>
        <!-- 用户/配置文件 'default' 的最大缓存大小(以字节为单位) -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- 用户/配置文件 'default' 缓存中存储的 SELECT 查询结果的最大数量 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 将这两个设置设为只读,使用户无法更改 -->
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

要定义查询结果可以被缓存所需的最小运行时间，可以使用设置
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration)。例如，以下查询的结果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

只有当查询运行时间超过 5 秒时，其结果才会被缓存。也可以指定查询需要运行多少次之后其结果才会被缓存——为此请使用设置 [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs)。

查询缓存中的条目在经过一段时间后会变为过期状态（生存时间，time-to-live）。默认情况下，该时间为 60 秒，但可以在会话、配置文件或查询级别通过设置 [query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl) 来指定不同的值。查询缓存采用“惰性”淘汰策略，即当某个条目过期时，不会立即从缓存中移除它。相反，当需要向查询缓存中插入一个新条目时，数据库会检查缓存中是否有足够的空闲空间来容纳该新条目。如果没有，数据库会尝试移除所有过期条目。如果缓存仍然没有足够的空间，则不会插入该新条目。

查询缓存中的条目默认会被压缩。这可以减少整体内存占用，但会以写入/读取查询缓存时的速度变慢为代价。要禁用压缩，请使用设置 [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries)。

有时，将同一查询的多个结果同时保存在缓存中是有用的。可以使用设置
[query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag) 来实现，该设置充当查询缓存条目的标签（或命名空间）。查询缓存会将同一查询但具有不同标签的结果视为彼此不同。

为同一查询创建三个不同查询缓存条目的示例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag 隐式为 ''(空字符串)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

要仅移除查询缓存中带有标签 `tag` 的条目，可以使用语句 `SYSTEM DROP QUERY CACHE TAG 'tag'`。


ClickHouse 以块的形式读取表数据，每个块包含 [max_block_size](/operations/settings/settings#max_block_size) 行。由于过滤、聚合等原因，结果块通常远小于 `max_block_size`，但在某些情况下也可能远大于该值。通过设置
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（默认启用），可以控制在将结果块插入查询结果缓存之前，对于非常小的结果块是否进行合并、对于较大的结果块是否拆分为大小为 `max_block_size` 的块。这样会降低向查询缓存写入时的性能，但可以提高缓存条目的压缩率，并在之后从查询缓存返回查询结果时，提供更自然的块粒度。

因此，查询缓存会为每个查询存储多个（部分）结果块。虽然这种行为通常是一个合理的默认行为，但可以通过设置
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 来禁用。

另外，默认情况下，包含非确定性函数的查询结果不会被缓存。此类函数包括：
- 用于访问字典的函数：[`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等，
- 在其 XML 定义中没有 `<deterministic>true</deterministic>` 标签的 [用户自定义函数](../sql-reference/statements/create/function.md)，
- 返回当前日期或时间的函数：[`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等，
- 返回随机值的函数：[`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等，
- 其结果依赖于用于查询处理的内部数据块大小和顺序的函数：[`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等、[`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、[`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等，
- 依赖环境的函数：[`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](/sql-reference/functions/other-functions#queryID)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

若要强制缓存包含非确定性函数的查询结果，请使用设置
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)。

涉及 system 表（例如 [system.processes](system-tables/processes.md) 或
[information_schema.tables](system-tables/information_schema.md)）的查询结果默认不会被缓存。若要强制缓存包含 system 表的查询结果，请使用设置 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)。

最后，出于安全原因，查询缓存中的条目不会在用户之间共享。例如，用户 A 不应能够通过执行与另一位没有该行策略限制的用户 B 相同的查询来绕过对某个表的行策略。不过，如有需要，可以通过设置
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 将缓存条目标记为可被其他用户访问（即共享）。



## 相关内容 {#related-content}

- 博客：[ClickHouse 查询缓存简介](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
