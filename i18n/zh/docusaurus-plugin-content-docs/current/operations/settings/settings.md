---
title: '会话设置'
sidebar_label: '会话设置'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: '在 ``system.settings`` 表中可以找到的设置。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自动生成 */ }

下文列出的所有设置也可以在表 [system.settings](/docs/operations/system-tables/settings) 中查看。这些设置是从 [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) 源码自动生成的。


## add_http_cors_header \{#add_http_cors_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

添加 HTTP CORS 头部。

## additional&#95;result&#95;filter

一个额外的过滤表达式，应用于 `SELECT` 查询的结果。
此设置不会应用于任何子查询。

**示例**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SElECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_result_filter = 'x != 2'
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## additional&#95;table&#95;filters

<SettingsInfoBlock type="Map" default_value="{}" />

在从指定表读取数据之后应用的额外过滤表达式。

**示例**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SELECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_table_filters = {'table_1': 'x != 2'}
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## aggregate&#95;functions&#95;null&#95;for&#95;empty

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对查询中的所有聚合函数进行重写，在它们后面追加 [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) 后缀。若要满足 SQL 标准兼容性要求，请启用该设置。
该功能通过查询重写（类似于 [count&#95;distinct&#95;implementation](#count_distinct_implementation) 设置）实现，以便在分布式查询中获得一致的结果。

可能的取值：

* 0 — 禁用。
* 1 — 启用。

**示例**

考虑以下包含聚合函数的查询：

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

将 `aggregate_functions_null_for_empty` 设为 0 时，会得到：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

当将 `aggregate_functions_null_for_empty` 设置为 `1` 时，结果将会是：

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

在按主键顺序执行聚合时，用于累积数据的单个数据块的最大大小（字节数）。较小的数据块大小可以让聚合的最终合并阶段实现更高的并行度。

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在内存高效模式下用于合并中间聚合结果的线程数。值越大，消耗的内存越多。0 表示与 `max_threads` 相同。

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当分区键适合作为 `GROUP BY` 键时，启用在独立线程上对各个分区进行独立聚合。适用于分区数量接近 CPU 核心数且各分区大小大致相同的场景。

## allow_archive_path_syntax \{#allow_archive_path_syntax\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "新增了用于禁用归档路径语法的设置。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "新增了用于禁用归档路径语法的设置。"}]}]}/>

File/S3 引擎/表函数在归档文件扩展名正确时，会将包含 `::` 的路径解析为 `<archive>::<file>`。

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

使用后台 I/O 池从 MergeTree 表中读取数据。此设置可能会提高 I/O 受限的查询性能。

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用此设置，在对冲请求中，即使已经取得了一定进度（但在 `receive_data_timeout` 指定的超时时间内进度未更新），在收到第一个数据包之前仍然可以发起新的连接；否则，在我们第一次取得进度之后，就会禁止更换副本。

## allow_create_index_without_type \{#allow_create_index_without_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许在不指定 TYPE 的情况下执行 CREATE INDEX 查询。该查询将被忽略。用于 SQL 兼容性测试。

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在函数 throwIf() 中启用自定义错误码功能。若为 true，抛出的异常可能会带有非预期的错误码。

## allow_ddl \{#allow_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果设置为 true，则允许用户执行 DDL 查询。

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建基于已弃用 Ordinary 引擎的数据库

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "允许使用已弃用且易出错的窗口函数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）"}]}]}/>

允许使用已弃用且易出错的窗口函数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "禁用已弃用的函数 snowflakeToDateTime[64] 和 dateTime[64]ToSnowflake。"}]}]}/>

函数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake` 和 `dateTime64ToSnowflake` 已被弃用，且默认被禁用。
请改用函数 `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID` 和 `dateTime64ToSnowflakeID`。

要重新启用这些已弃用的函数（例如在迁移过渡期间），请将此设置设置为 `true`。

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用已弃用的引擎定义语法来创建 *MergeTree 表

## allow_distributed_ddl \{#allow_distributed_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将其设置为 true 时，允许用户执行分布式 DDL 查询。

## allow_drop_detached \{#allow_drop_detached\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许执行 ALTER TABLE ... DROP DETACHED PART[ITION] ... 语句

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "默认禁止在 JOIN 键中使用 Dynamic 类型"}]}]}/>

允许在 JOIN 键中使用 Dynamic 类型。此设置为兼容性目的提供。不建议在 JOIN 键中使用 Dynamic 类型，因为与其他类型进行比较时可能会导致意外结果。

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许以列为单位执行 multiIf 函数

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

允许创建使用 Alias 引擎的表。

## allow_experimental_analyzer \{#allow_experimental_analyzer\} 

**别名**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "默认启用 analyzer 和 planner。"}]}]}/>

允许使用新的查询分析器。

## allow_experimental_codecs \{#allow_experimental_codecs\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则允许指定实验性的压缩编解码器（但目前我们还没有这些编解码器，因此该选项当前不起任何作用）。

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "将关联子查询的支持标记为 Beta。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新增用于允许执行关联子查询的设置。"}]}]}/>

允许执行关联子查询。

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\} 

<BetaBadge/>

**别名**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "允许使用实验性数据库引擎 DataLakeCatalog，且 catalog_type = 'glue'"}]}]}/>

允许使用实验性数据库引擎 DataLakeCatalog，且 catalog_type = 'glue'

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "允许在 catalog_type = 'hive' 时使用实验性 DataLakeCatalog 数据库引擎"}]}]}/>

允许在 catalog_type = 'hms' 时使用实验性 DataLakeCatalog 数据库引擎

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\} 

<BetaBadge/>

**别名**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置。"}]}]}/>

允许在 catalog_type = 'iceberg' 时使用实验性数据库引擎 DataLakeCatalog

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建使用 Engine=MaterializedPostgreSQL(...) 引擎的数据库。

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\} 

<BetaBadge/>

**别名**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "允许使用实验性数据库引擎 DataLakeCatalog，且当 catalog_type 设置为 'unity' 时生效"}]}]}/>

允许使用实验性数据库引擎 DataLakeCatalog，且当 catalog_type 设置为 'unity' 时生效

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

允许使用实验性 delta-kernel-rs 实现。

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

启用 delta-kernel 写入特性。

## allow_experimental_full_text_index \{#allow_experimental_full_text_index\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "启用实验性文本索引"}]}]}/>

如果设置为 true，则允许使用实验性文本索引。

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用用于漏斗分析的实验性函数。

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用实验性哈希函数

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting "}]}]}/>

允许在 Iceberg 表上显式使用 `OPTIMIZE` 命令。

## allow_experimental_insert_into_iceberg \{#allow_experimental_insert_into_iceberg\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

允许执行 `insert` 查询向 Iceberg 表写入数据。

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "如果将其设置为 true，并且满足 `join_to_sort_minimum_perkey_rows` 和 `join_to_sort_maximum_table_rows` 的条件，则按键对右表重新排序，以提升左或内哈希连接的性能"}]}]}/>

如果将其设置为 true，并且满足 `join_to_sort_minimum_perkey_rows` 和 `join_to_sort_maximum_table_rows` 的条件，则按键对右表重新排序，以提升左或内哈希连接的性能。

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "允许使用将已提交偏移量存储在 ClickHouse Keeper 中的实验性 Kafka 存储引擎"}]}]}/>

允许使用实验性功能，将 Kafka 相关的偏移量存储在 ClickHouse Keeper 中。启用后，可以在 Kafka 表引擎中指定 ClickHouse Keeper 的路径和副本名称。这样将不会使用常规的 Kafka 引擎，而是会使用一种新的存储引擎类型，该引擎优先将已提交的偏移量存储在 ClickHouse Keeper 中。

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

启用 Kusto Query Language（KQL）——一种 SQL 的替代方案。

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用 `MaterializedPostgreSQL` 表引擎。默认禁用，因为该功能仍处于实验阶段。

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用自然语言处理相关的实验性函数。

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\} 

<BetaBadge/>

**别名**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 SELECT 查询时，从每个分片中最多使用 `max_parallel_replicas` 个副本来执行查询。读取将并行化并进行动态协调。0 - 禁用；1 - 启用，在发生故障时静默禁用；2 - 启用，在发生故障时抛出异常。

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

启用 PRQL——一种用于替代 SQL 的查询语言。

## allow_experimental_qbit_type \{#allow_experimental_qbit_type\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新增实验性设置"}]}]}/>

允许创建 [QBit](../../sql-reference/data-types/qbit.md) 数据类型。

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

基于 part UUID 的 SELECT 查询实验性数据去重功能

## allow_experimental_statistics \{#allow_experimental_statistics\} 

<ExperimentalBadge/>

**别名**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "该设置已被重命名。之前的名称是 `allow_experimental_statistic`。"}]}]}/>

允许为列定义[统计信息](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table)，并[管理统计信息](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)。

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\} 

<ExperimentalBadge/>

**别名**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于启用试验性 timeSeries* 聚合函数的新设置。"}]}]}/>

用于 Prometheus 风格时间序列重采样、速率与增量计算的试验性 timeSeries* 聚合函数。

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "添加用于启用 TimeSeries 表引擎的新设置"}]}]}/>

允许创建基于 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎的表。可能的取值为：

- 0 — 禁用 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎。
- 1 — 启用 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎。

## allow_experimental_window_view \{#allow_experimental_window_view\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用 WINDOW VIEW。该功能尚未成熟。

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

用于与 YTsaurus 集成的实验性字典源。

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新配置项。"}]}]}/>

用于与 YTsaurus 集成的实验性表引擎。

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置。"}]}]}/>

用于与 YTsaurus 集成的实验性表引擎。

## allow_general_join_planning \{#allow_general_join_planning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "在启用哈希 JOIN 算法时，允许使用更通用的 JOIN 规划算法。"}]}]}/>

允许使用一种更通用的 JOIN 规划算法，可以处理更复杂的条件，但仅适用于哈希 JOIN。如果未启用哈希 JOIN，则无论此设置的值为何，都会使用常规的 JOIN 规划算法。

## allow_get_client_http_header \{#allow_get_client_http_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "引入了一个新函数。"}]}]}/>

允许使用函数 `getClientHTTPHeader` 来获取当前 HTTP 请求头字段的值。出于安全原因，该设置默认处于禁用状态，因为某些请求头（例如 `Cookie`）可能包含敏感信息。请注意，`X-ClickHouse-*` 和 `Authentication` 请求头始终受限制，无法通过此函数获取。

## allow_hyperscan \{#allow_hyperscan\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许使用 Hyperscan 库的函数。禁用该设置可以避免潜在的长时间编译过程以及过高的资源消耗。

## allow_introspection_functions \{#allow_introspection_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用用于查询分析的[自省函数](../../sql-reference/functions/introspection.md)。

可能的取值：

- 1 — 启用自省函数。
- 0 — 禁用自省函数。

**另请参阅**

- [采样查询分析器](../../operations/optimizing-performance/sampling-query-profiler.md)
- 系统表 [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "不允许创建引用不存在列或表的 MV"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "在 CREATE MATERIALIZED VIEW 中支持（但尚未启用）更严格的校验"}]}]}/>

允许在 `CREATE MATERIALIZED VIEW` 语句中使用引用不存在表或列的 `SELECT` 查询。但查询在语法上仍必须是合法的。不适用于可刷新的物化视图。不适用于需要从 `SELECT` 查询推断物化视图结构的情况（即 `CREATE` 中没有列列表且没有 `TO` 表时）。可用于在其源表创建之前先创建物化视图。

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

默认允许重写命名集合中的字段。

## allow_non_metadata_alters \{#allow_non_metadata_alters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许执行不仅影响表元数据、还会影响磁盘上数据的 `ALTER` 操作。

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "在某些与时间相关的函数中（如 toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()）允许使用非常量的时区参数。"}]}]}/>

在某些与时间相关的函数中（如 `toTimeZone()`, `fromUnixTimestamp*()`, `snowflakeToDateTime*()`）允许使用非常量的时区参数。
该设置仅出于兼容性考虑而存在。在 ClickHouse 中，时区是数据类型的属性，相应地也是列的属性。
启用该设置会给人一种错误印象，即同一列中的不同值可以具有不同的时区。
因此，请不要启用该设置。

## allow&#95;nondeterministic&#95;mutations

<SettingsInfoBlock type="Bool" default_value="0" />

用户级设置，允许在复制表上的变更操作中使用诸如 `dictGet` 等非确定性函数。

由于例如字典这类对象在各个节点之间可能不同步，默认情况下，不允许在复制表上的变更操作中从这些字典中读取值。启用此设置后将允许该行为，此时由用户负责确保所使用的数据在所有节点之间保持同步。

**示例**

```xml
<profiles>
    <default>
        <allow_nondeterministic_mutations>1</allow_nondeterministic_mutations>

        <!-- ... -->
    </default>

    <!-- ... -->

</profiles>
```


## allow_nondeterministic_optimize_skip_unused_shards \{#allow_nondeterministic_optimize_skip_unused_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许在分片键中使用非确定性函数（例如 `rand` 或 `dictGet`，尤其是后者在更新时存在一些限制）。

可能的取值：

- 0 — 不允许。
- 1 — 允许。

## allow_not_comparable_types_in_comparison_functions \{#allow_not_comparable_types_in_comparison_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "默认情况下不允许在比较函数中使用不可比较类型"}]}]}/>

控制是否允许在比较函数 `equal/less/greater/etc` 中使用不可比较类型（如 JSON/AggregateFunction）。

## allow_not_comparable_types_in_order_by \{#allow_not_comparable_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "默认不允许在 ORDER BY 中使用不可比较的类型"}]}]}/>

控制是否允许在 ORDER BY 键中使用不可比较的类型（例如 JSON/AggregateFunction）。

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当所有分片都在本地文件系统上时，优先使用预取读取线程池

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果所有数据部分都位于远程文件系统上，则优先使用预取读取线程池

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

允许在启用 analyzer 时，在 AST 层面对分布式子查询执行谓词下推

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当子查询包含 WITH 子句时允许进行谓词下推

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

在将条件从 WHERE 移动到 PREWHERE 时，允许对这些条件重新排序，以优化过滤效率。

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "不允许在 INSERT 查询中在 FORMAT 之后使用 SETTINGS，因为 ClickHouse 会将 SETTINGS 解释为某些数据值，这会产生误导"}]}]} />

控制是否允许在 `INSERT` 查询中在 `FORMAT` 之后使用 `SETTINGS`。不推荐启用此选项，因为这可能会将 `SETTINGS` 的一部分误解释为数据值。

示例：

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

但下列查询只有在启用了 `allow_settings_after_format_in_insert` 时才能运行：

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

可能的取值：

* 0 — 禁用。
* 1 — 允许。

:::note
仅在您的使用场景依赖旧语法、需要向后兼容时才使用此设置。
:::


## allow_simdjson \{#allow_simdjson\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果支持 AVX2 指令集，则允许在 `JSON*` 函数中使用 simdjson 库。若禁用，则会改用 rapidjson。

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "在某些输出格式中启用对 Sparse/Replicated 等特殊列表示形式的直接输出"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "添加一个设置，允许输出 Sparse/Replicated 等特殊列表示形式，而无需将其转换为完整列"}]}]}/>

允许以 Sparse、Replicated 等特殊序列化类型输出列，而无需将其转换为完整列表示形式。
这有助于在格式化过程中避免不必要的数据复制。

## allow_statistics_optimize \{#allow_statistics_optimize\} 

<ExperimentalBadge/>

**别名**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "该设置已重命名。此前的名称为 `allow_statistic_optimize`。"}]}]}/>

允许使用统计信息来优化查询

## allow_suspicious_codecs \{#allow_suspicious_codecs\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "不允许指定无意义的压缩编解码器"}]}]}/>

如果将其设置为 true，则允许指定无意义的压缩编解码器。

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在 CREATE TABLE 语句中，允许创建类型为 FixedString(n) 且 n > 256 的列。长度大于等于 256 的 FixedString 比较可疑，很可能表示该类型被误用。

## allow_suspicious_indices \{#allow_suspicious_indices\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "如果为 true，则允许使用相同的表达式来定义索引"}]}]}/>

拒绝具有相同表达式的主/二级索引和排序键

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许或限制在固定大小不超过 8 字节的数据类型中使用 [LowCardinality](../../sql-reference/data-types/lowcardinality.md)：数值数据类型和 `FixedString(8_bytes_or_less)`。

对于取值范围较小的固定值列，使用 `LowCardinality` 通常效率较低，因为 ClickHouse 为每一行存储一个数值索引。结果：

- 磁盘空间占用可能增加。
- RAM 消耗可能更高，取决于字典大小。
- 由于额外的编码/解码操作，某些函数可能运行得更慢。

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表中，合并时间可能会因为上述所有原因而增加。

可能的取值：

- 1 — 不限制使用 `LowCardinality`。
- 0 — 限制使用 `LowCardinality`。

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "禁止在 MergeTree 中使用可疑的 PRIMARY KEY/ORDER BY（例如 SimpleAggregateFunction）"}]}]}/>

允许在 MergeTree 中使用可疑的 `PRIMARY KEY`/`ORDER BY`（例如 SimpleAggregateFunction）。

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "这是一个新设置，在之前的版本中，其行为等同于允许。"}]}]}/>

拒绝不依赖于表中任意列的 TTL 表达式。这在大多数情况下表明是用户配置错误。

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "默认不允许在 GROUP BY 键中使用 Variant/Dynamic 类型"}]}]}/>

允许或限制将 [Variant](../../sql-reference/data-types/variant.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 类型用作 GROUP BY 键。

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "默认不允许在 ORDER BY 中使用 Variant/Dynamic 类型"}]}]}/>

控制是否允许在 ORDER BY 键中使用 [Variant](../../sql-reference/data-types/variant.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 类型。

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "默认不允许创建包含可疑变体的 Variant 类型"}]}]}/>

在 `CREATE TABLE` 语句中，此设置允许指定包含相似变体类型的 `Variant` 类型（例如，不同的数值类型或日期类型）。启用此设置后，在处理具有相似类型的值时可能会引入一定程度的歧义。

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许对 `system.zookeeper` 表进行不受限制的读取（不基于路径条件），在某些情况下可能很方便，但对 ZooKeeper 来说并不安全

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\} 

<SettingsInfoBlock type="Bool" default_value="0" />

以异步方式执行 ALTER TABLE MOVE ... TO [DISK|VOLUME]

## alter&#95;partition&#95;verbose&#95;result

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用显示已成功对哪些分区和数据片段执行操作的信息。
适用于 [ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 和 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

可能的取值：

* 0 — 禁用详细输出。
* 1 — 启用详细输出。

**示例**

```sql
CREATE TABLE test(a Int64, d Date, s String) ENGINE = MergeTree PARTITION BY toYYYYMDECLARE(d) ORDER BY a;
INSERT INTO test VALUES(1, '2021-01-01', '');
INSERT INTO test VALUES(1, '2021-01-01', '');
ALTER TABLE test DETACH PARTITION ID '202101';

ALTER TABLE test ATTACH PARTITION ID '202101' SETTINGS alter_partition_verbose_result = 1;

┌─command_type─────┬─partition_id─┬─part_name────┬─old_part_name─┐
│ ATTACH PARTITION │ 202101       │ 202101_7_7_0 │ 202101_5_5_0  │
│ ATTACH PARTITION │ 202101       │ 202101_8_8_0 │ 202101_6_6_0  │
└──────────────────┴──────────────┴──────────────┴───────────────┘

ALTER TABLE test FREEZE SETTINGS alter_partition_verbose_result = 1;

┌─command_type─┬─partition_id─┬─part_name────┬─backup_name─┬─backup_path───────────────────┬─part_backup_path────────────────────────────────────────────┐
│ FREEZE ALL   │ 202101       │ 202101_7_7_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_7_7_0 │
│ FREEZE ALL   │ 202101       │ 202101_8_8_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_8_8_0 │
└──────────────┴──────────────┴──────────────┴─────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────────┘
```


## alter_sync \{#alter_sync\} 

**别名**：`replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

用于控制在通过 [ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md) 或 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询在副本上执行操作时的等待行为。

可能的取值：

- `0` — 不等待。
- `1` — 等待本副本执行完成。
- `2` — 等待所有副本执行完成。

Cloud 默认值：`1`。

:::note
`alter_sync` 仅适用于 `Replicated` 表，对非 `Replicated` 表的 ALTER 操作不起任何作用。
:::

## alter_update_mode \{#alter_update_mode\} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "新增设置项"}]}]}/>

用于包含 `UPDATE` 命令的 `ALTER` 查询的执行模式。

可能的取值：

- `heavy` - 执行常规变更（mutation）。
- `lightweight` - 如果可能则执行轻量级更新，否则执行常规变更。
- `lightweight_force` - 如果可能则执行轻量级更新，否则抛出异常。

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果一张表在其索引中使用了空间填充曲线，例如 `ORDER BY mortonEncode(x, y)` 或 `ORDER BY hilbertEncode(x, y)`，并且查询包含针对这些参数的条件，例如 `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`，则会使用该空间填充曲线进行索引分析。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置。"}]}]}/>

允许在 Nested 列中添加复合标识符。由于它会更改查询结果，因此这是一个兼容性设置。禁用该设置时，`SELECT a.b.c FROM table ARRAY JOIN a` 将无法执行，并且 `SELECT a FROM table` 的 `Nested a` 结果中不会包含 `a.b.c` 列。

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "强制在 JOIN USING 中根据投影解析标识符"}]}]}/>

强制在 JOIN USING 中根据投影解析标识符（例如，在 `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` 中，连接条件将为 `t1.a + 1 = t2.b`，而非 `t1.b = t2.b`）。

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "默认禁用 ANY RIGHT 和 ANY FULL JOIN 以避免不一致"}]}]}/>

在 `ANY INNER|LEFT JOIN` 操作中启用 ClickHouse 的旧版服务器行为。

:::note
仅当用例依赖于旧版 `JOIN` 行为时，才为向后兼容而使用此设置。
:::

当启用旧版行为时：

- `t1 ANY LEFT JOIN t2` 和 `t2 ANY RIGHT JOIN t1` 操作的结果不相等，因为 ClickHouse 使用的是从左到右的多对一表键映射逻辑。
- `ANY INNER JOIN` 操作的结果包含左表中的所有行，与 `SEMI LEFT JOIN` 操作相同。

当禁用旧版行为时：

- `t1 ANY LEFT JOIN t2` 和 `t2 ANY RIGHT JOIN t1` 操作的结果相等，因为 ClickHouse 在 `ANY RIGHT JOIN` 操作中使用的是提供一对多键映射的逻辑。
- `ANY INNER JOIN` 操作的结果对来自左右两个表的每个键只包含一行。

可能的取值：

- 0 — 旧版行为被禁用。
- 1 — 旧版行为被启用。

另请参阅：

- [JOIN 严格性](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用对通过轻量级 DELETE 删除的行进行过滤。若禁用该设置，查询将能够读取这些行。此功能在调试和“反删除”场景中非常有用。

## apply_mutations_on_fly \{#apply_mutations_on_fly\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则尚未在数据部分中物化的变更（UPDATE 和 DELETE）将在执行 SELECT 查询时被应用。

## apply_patch_parts \{#apply_patch_parts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

如果为 true，则会在 SELECT 查询中应用补丁数据片段（表示轻量级更新）。

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

在 Join 模式下用于应用补丁分片的临时缓存桶的数量。

## apply_settings_from_server \{#apply_settings_from_server\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "客户端代码（例如 INSERT 输入解析和查询输出格式化）将使用与服务器相同的设置，包括来自服务器配置的设置。"}]}]}/>

客户端是否应从服务器接收设置。

此设置只影响在客户端执行的操作，特别是解析 INSERT 输入数据以及格式化查询结果。大部分查询的执行发生在服务器端，此设置不会影响服务器端的执行。

通常应在用户配置文件中设置此选项（`users.xml` 或 `ALTER USER` 之类的查询），而不是通过客户端（客户端命令行参数、`SET` 查询或 `SELECT` 查询的 `SETTINGS` 部分）进行设置。通过客户端可以将其改为 `false`，但不能改为 `true`（因为如果用户配置文件中设置了 `apply_settings_from_server = false`，服务器端就不会向客户端发送设置）。

请注意，在 24.12 中最初提供的是一个服务器端设置（`send_settings_to_client`），但之后为了提高易用性，被该客户端设置所取代。

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新设置。用于 Arrow Flight 请求的描述符类型：'path' 或 'command'。Dremio 需要使用 'command'。"}]}]}/>

用于 Arrow Flight 请求的描述符类型。'path' 将数据集名称作为路径描述符发送；'command' 将 SQL 查询作为命令描述符发送（Dremio 需要使用该类型）。

可能的取值：

- 'path' — 使用 FlightDescriptor::Path（默认，与大多数 Arrow Flight 服务器兼容）
- 'command' — 使用带有 SELECT 查询的 FlightDescriptor::Command（Dremio 必须使用）

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在使用通配符查询（`SELECT *`）时是否包含 [ALIAS](../../sql-reference/statements/create/table.md/#alias) 列。

可能的值：

- 0 - 禁用
- 1 - 启用

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在通配符查询（`SELECT *`）中包含 [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 列。

可选值：

- 0 - 禁用
- 1 - 启用

## async_insert \{#async_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，来自 INSERT 查询的数据会先存储到队列中，随后在后台刷新到表中。  
如果 wait_for_async_insert 为 false，INSERT 查询几乎会立即完成处理；否则，客户端会一直等待，直到数据刷新到表中。

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "控制自适应异步插入超时时间递减的指数速率"}]}]}/>

控制自适应异步插入超时时间递减的指数速率

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "自适应异步插入超时时间增加的指数增长率"}]}]}/>

自适应异步插入超时时间增加的指数增长率

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\} 

**别名**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "异步插入操作超时时间的最小值（毫秒）；async_insert_busy_timeout_ms 是 async_insert_busy_timeout_max_ms 的别名"}]}]}/>

自首次出现数据起，在为每个查询转储已收集数据之前所等待的最长时间。

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "异步插入超时时间的最小值（毫秒）；同时也是自适应算法的初始值，之后可能会被该算法增大"}]}]}/>

当通过 `async_insert_use_adaptive_busy_timeout` 启用自动调节时，从首条数据到达开始，按查询汇总数据并写入前所需等待的最短时间（毫秒）。该值同样用作自适应算法的初始值。

## async_insert_deduplicate \{#async_insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="0" />

对于复制表中的异步 INSERT 查询，指定对插入的数据块执行去重。

## async_insert_max_data_size \{#async_insert_max_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "此前的值似乎过小。"}]}]}/>

在插入之前，每个查询可收集的未解析数据的最大字节数

## async_insert_max_query_number \{#async_insert_max_query_number\} 

<SettingsInfoBlock type="UInt64" default_value="450" />

在实际执行插入前允许的最大 INSERT 查询次数。
仅当将设置 [`async_insert_deduplicate`](#async_insert_deduplicate) 设为 1 时生效。

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "从异步插入队列轮询数据的超时时间（毫秒）"}]}]}/>

从异步插入队列轮询数据的超时时间

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "使用自适应异步插入超时"}]}]}/>

如果设置为 true，则对异步插入使用自适应繁忙超时时间

## async_query_sending_for_remote \{#async_query_sending_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "在分片间异步建立连接并发送查询"}]}]}/>

在执行远程查询时启用异步建立连接并发送查询。

默认启用。

## async_socket_for_remote \{#async_socket_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "修复所有问题，并再次默认开启针对远程查询的从套接字异步读取"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "由于存在一些问题，关闭针对远程查询的从套接字异步读取"}]}]}/>

在执行远程查询时，启用从套接字异步读取数据。

默认启用。

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "为 Azure 多部分上传使用多线程。"}]}]}/>

为 Azure 多部分上传使用多线程。

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "检查上传到 Azure Blob Storage 的每个对象，以确保已成功上传"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "检查上传到 Azure Blob Storage 的每个对象，以确保已成功上传"}]}]}/>

检查上传到 Azure Blob Storage 的每个对象，以确保已成功上传

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

连接 Azure 磁盘主机的超时时间。

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 Azure 引擎表中每次插入时创建一个新文件。

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在请求的文件不存在时返回 0 行结果，而不是由 AzureBlobStorage 表引擎抛出异常"}]}]}/>

在读取某些键时，如果对应的文件不存在，则忽略其缺失。

可能的值：

- 1 — `SELECT` 返回空结果。
- 0 — `SELECT` 抛出异常。

## azure_list_object_keys_size \{#azure_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject 请求单次批量可返回的最大文件数

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure 分块上传时允许的最大块数。"}]}]}/>

Azure 分块上传时允许的最大块数。

## azure_max_get_burst \{#azure_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在触及每秒请求数限制之前，可以同时发送的最大请求数。默认值（0）等于 `azure_max_get_rps`

## azure_max_get_rps \{#azure_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在触发限流之前，Azure GET 请求每秒速率的上限。为 0 表示不限。

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "分片上传请求中可并发上传的最大分片数量。0 表示不限制。"}]}]}/>

分片上传请求中可并发上传的最大分片数量。0 表示不限制。

## azure_max_put_burst \{#azure_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在达到每秒请求数上限之前可以同时发出的最大请求数。默认值（0）与 `azure_max_put_rps` 相同。

## azure_max_put_rps \{#azure_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在触发限流之前的 Azure 每秒 PUT 请求速率上限。零表示不限制。

## azure_max_redirects \{#azure_max_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Azure 重定向允许的最大跳转次数。

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "使用单段复制到 Azure Blob 存储时可复制的最大对象大小。"}]}]}/>

使用单段复制到 Azure Blob 存储时可复制的最大对象大小。

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "与 S3 保持一致"}]}]}/>

使用单部分上传（single-part upload）到 Azure Blob Storage 时，可上传对象的最大大小。

## azure_max_single_read_retries \{#azure_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

从 Azure Blob 存储进行单次读取时的最大重试次数。

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "写入 Azure Blob 存储时遇到意外错误时的最大重试次数"}]}]}/>

写入 Azure Blob 存储时遇到意外错误时的最大重试次数

## azure_max_upload_part_size \{#azure_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "在对 Azure Blob Storage 进行分片上传（multipart upload）时，每个分片的最大上传大小。"}]}]}/>

在对 Azure Blob Storage 进行分片上传（multipart upload）时，每个分片的最大上传大小。

## azure_min_upload_part_size \{#azure_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "在 Azure Blob 存储中执行多部分上传时的最小分片大小。"}]}]}/>

在 Azure Blob 存储中执行多部分上传时的最小分片大小。

## azure_request_timeout_ms \{#azure_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

在与 Azure 之间发送和接收数据时使用的空闲超时时间。如果单次 TCP 读或写调用阻塞时间达到该时长，则会失败。

## azure_sdk_max_retries \{#azure_sdk_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK 的最大重试次数"}]}]}/>

Azure SDK 的最大重试次数

## azure_sdk_retry_initial_backoff_ms \{#azure_sdk_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK 重试操作之间的最小退避时间"}]}]}/>

Azure SDK 重试操作之间的最小退避时间

## azure_sdk_retry_max_backoff_ms \{#azure_sdk_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK 重试操作之间的最大退避时间"}]}]}/>

Azure SDK 重试操作之间的最大退避时间

## azure_skip_empty_files \{#azure_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在 Azure 表引擎中跳过空文件"}]}]}/>

启用或禁用在 S3 引擎中跳过空文件的行为。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果。

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "在对 Azure Blob 存储执行分片上传时，每个分片的精确大小。"}]}]}/>

在对 Azure Blob 存储执行分片上传时，每个分片的精确大小。

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "在 AzureBlobStorage 引擎中，当 ListObjects 请求未能匹配到任何文件时，允许抛出错误，而不是返回空的查询结果"}]}]}/>

如果根据 glob 通配符展开规则匹配到的文件数为零，则抛出错误。

可选值：

- 1 — `SELECT` 抛出异常。
- 0 — `SELECT` 返回空结果。

## azure_truncate_on_insert \{#azure_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在向 Azure 引擎表中插入数据之前执行截断操作。

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "每当在一次写入中向 Azure Blob Storage 上传了 azure_multiply_parts_count_threshold 个分块后，就将 azure_min_upload_part_size 乘以此系数。"}]}]}/>

每当在一次写入中向 Azure Blob Storage 上传了 `azure_multiply_parts_count_threshold` 个分块后，就将 `azure_min_upload_part_size` 乘以此系数。

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "每当有达到该数量的分片被上传到 Azure Blob 存储时，azure_min_upload_part_size 会乘以 azure_upload_part_size_multiply_factor。"}]}]}/>

每当有达到该数量的分片被上传到 Azure Blob 存储时，azure_min_upload_part_size 会乘以 azure_upload_part_size_multiply_factor。

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

当设置为 `true` 时，对于所有 Azure 请求，前两次尝试将使用较短的发送和接收超时时间。
当设置为 `false` 时，所有尝试都将使用相同的超时时间。

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

在备份或恢复期间向 [Zoo]Keeper 发送 multi 请求时的最大批量大小。

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

在备份或恢复期间向 [Zoo]Keeper 发送 multiread 请求时的单次批处理最大大小

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "New setting."}]}]}/>

如果在执行 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作期间，某个主机在该时间段内没有在 ZooKeeper 中重新创建其临时的 `alive` 节点，则整个备份或恢复操作会被视为失败。
该数值应大于主机在发生故障后重新连接到 ZooKeeper 所需的任何合理时间。
设为 0 表示无限制。

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "New setting."}]}]}/>

指定在当前 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作中，发起方为等待其他主机对 `error` 节点作出反应并停止其工作而等待的最长时间。

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

在备份或恢复期间，对 keeper 请求进行故障注入时的近似失败概率。有效取值范围为 [0.0f, 1.0f]。

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 表示使用随机种子，否则为该设置的值

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "应设置得足够大，以避免整个 BACKUP 或 RESTORE 操作因中途出现短暂的 [Zoo]Keeper 故障而失败。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "应设置得足够大，以避免整个 BACKUP 或 RESTORE 操作因中途出现短暂的 [Zoo]Keeper 故障而失败。"}]}]}/>

在 BACKUP 或 RESTORE 操作过程中，[Zoo]Keeper 操作的最大重试次数。
应设置得足够大，以避免整个操作因短暂的 [Zoo]Keeper 故障而失败。

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

在处理 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作出错时，[Zoo]Keeper 操作的最大重试次数。

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

在 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作的初始化期间，[Zoo]Keeper 操作的最大重试次数。

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

在备份或恢复期间用于 [Zoo]Keeper 操作的初始退避超时时长

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

备份或恢复期间 [Zoo]Keeper 操作的最大退避时长

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

备份过程中 [Zoo]Keeper 节点数据的最大大小

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "用于配置 Aws::Client::RetryStrategy 的设置；Aws::Client 会自行执行重试，0 表示不重试。仅在备份/恢复时生效。"}]}]}/>

用于配置 Aws::Client::RetryStrategy 的设置；Aws::Client 会自行执行重试，0 表示不重试。仅在备份/恢复时生效。

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

在备份和恢复期间，首次重试前的初始退避延迟（毫秒）。每次后续重试都会按指数方式增加延迟，直到达到由 `backup_restore_s3_retry_max_backoff_ms` 指定的最大值。

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

在备份和恢复操作期间，应用于 `Aws::Client::RetryStrategy` 中重试退避时间的抖动系数。计算得到的退避时间会乘以一个位于区间 [1.0, 1.0 + jitter] 的随机系数，且不超过 `backup_restore_s3_retry_max_backoff_ms`。必须在区间 [0.0, 1.0] 内。

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

在备份和恢复操作期间，重试之间的最大延迟时间（毫秒）。

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable the setting by default"}]}]}/>

当设置为 `true` 时，在任意单个 S3 请求遇到可重试的 S3 错误（例如 `Slow Down`）之后，所有向同一备份端点发送 S3 请求的线程都会被减慢。
当设置为 `false` 时，每个线程会独立于其他线程处理其各自的 S3 请求退避逻辑。

## cache_warmer_threads \{#cache_warmer_threads\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

仅在 ClickHouse Cloud 中生效。启用 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) 时，用于将新的数据分片预取到文件缓存中的后台线程数量。设为 0 表示禁用。

## calculate_text_stack_trace \{#calculate_text_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在查询执行期间发生异常时计算文本堆栈跟踪。这是默认行为。此功能需要进行符号解析，当执行大量错误查询时，可能会减慢模糊测试（fuzzing）的速度。在正常情况下，不应禁用此选项。

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当客户端在未等待响应的情况下关闭连接时，取消 HTTP 只读查询（例如 `SELECT`）。

云环境下的默认值：`0`。

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "使函数 cast(value, 'IPv4') 和 cast(value, 'IPv6') 的行为与 toIPv4 和 toIPv6 函数相同"}]}]}/>

对 IPv4 类型的 CAST 运算符、对 IPv6 类型的 CAST 运算符，以及 toIPv4 和 toIPv6 函数，在发生转换错误时将返回默认值，而不是抛出异常。

## cast&#95;keep&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [CAST](/sql-reference/functions/type-conversion-functions#cast) 操作中保留 `Nullable` 数据类型。

当启用该设置且 `CAST` 函数的参数为 `Nullable` 时，结果也会被转换为 `Nullable` 类型。禁用该设置时，结果的数据类型始终严格等于目标类型。

可能的取值：

* 0 — `CAST` 的结果严格等于指定的目标类型。
* 1 — 如果参数类型是 `Nullable`，则 `CAST` 的结果会被转换为 `Nullable(DestinationDataType)`。

**示例**

以下查询的结果数据类型与目标数据类型完全一致：

```sql
SET cast_keep_nullable = 0;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

结果：

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Int32                                             │
└───┴───────────────────────────────────────────────────┘
```

以下查询会使目标数据类型被修改为 `Nullable`：

```sql
SET cast_keep_nullable = 1;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

结果：

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Nullable(Int32)                                   │
└───┴───────────────────────────────────────────────────┘
```

**另请参阅**

* [CAST](/sql-reference/functions/type-conversion-functions#cast) 函数


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

允许在从 String 转换为 DateTime 时选择日期和时间文本表示形式的解析器。

可选值：

- `'best_effort'` — 启用扩展解析。

    ClickHouse 可以解析基础的 `YYYY-MM-DD HH:MM:SS` 格式以及所有 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日期和时间格式。例如，`'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — 类似于 `best_effort`（差异见 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)）

- `'basic'` — 使用基础解析器。

    ClickHouse 只能解析基础的 `YYYY-MM-DD HH:MM:SS` 或 `YYYY-MM-DD` 格式。例如，`2019-08-20 10:18:56` 或 `2019-08-20`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Add setting to allow converting String to Dynamic through parsing"}]}]}/>

在将 String 转换为 Dynamic 时使用类型推断

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "用于在将 String CAST 为 Variant 时启用或禁用类型推断的新设置"}]}]}/>

在将 String 转换为 Variant 时使用类型推断。

## check_query_single_value_result \{#check_query_single_value_result\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "更改设置以使 CHECK TABLE 更有用"}]}]}/>

定义 `MergeTree` 系列表引擎执行 [CHECK TABLE](/sql-reference/statements/check-table) 查询时结果的详细程度。

可能的取值：

- 0 — 查询会显示表中每个单独数据部分的检查状态。
- 1 — 查询会显示表的整体检查状态。

## check_referential_table_dependencies \{#check_referential_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="0" />

检查 DDL 查询（如 DROP TABLE 或 RENAME）不会破坏引用依赖关系。

## check_table_dependencies \{#check_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="1" />

检查 DDL 查询（例如 DROP TABLE 或 RENAME）是否会破坏依赖关系

## checksum_on_read \{#checksum_on_read\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在读取时验证校验和。此设置默认启用，并且在生产环境中应始终保持启用状态。请不要指望通过禁用此设置获得任何收益。它仅可用于实验和基准测试。该设置仅适用于 MergeTree 系列的表。对于其他表引擎以及通过网络接收数据时，校验和始终会被验证。

## cloud_mode \{#cloud_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

云端模式

## cloud_mode_database_engine \{#cloud_mode_database_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

在 ClickHouse Cloud 中允许使用的数据库引擎。1 - 将 DDL 重写为使用 Replicated 数据库，2 - 将 DDL 重写为使用 Shared 数据库

## cloud_mode_engine \{#cloud_mode_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

在 Cloud 中允许使用的引擎族。

- 0 - 允许任意引擎
- 1 - 将 DDL 语句重写为使用 *ReplicatedMergeTree
- 2 - 将 DDL 语句重写为使用 SharedMergeTree
- 3 - 将 DDL 语句重写为使用 SharedMergeTree，但在显式指定 remote disk 时除外

使用 UInt64 以尽量减小对外公开的部分

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\} 

<BetaBadge/>

当前服务器所在分片对应的集群

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

如果设置为 `true`，将提升在集群函数中处理归档的性能。若在早期版本中使用归档的集群函数，为了保持兼容性并避免在升级到 25.7+ 时出现错误，应将其设置为 `false`。

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting."}]}]}/>

定义在使用 `bucket` 拆分粒度的 cluster 表函数中进行分布式任务处理时的批次近似大小（以字节为单位）。系统会累积数据，直到至少达到该值为止。为与数据边界对齐，实际大小可能会略大一些。

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

控制在执行 CLUSTER TABLE FUNCTION 时，数据如何被拆分为任务。

该设置定义了在集群中分发工作负载的粒度：

- `file` — 每个任务处理一个完整文件。
- `bucket` — 按文件中的内部数据块创建任务（例如，Parquet 的行组）。

选择更细的粒度（如 `bucket`）在处理少量大文件时可以提升并行度。
例如，如果一个 Parquet 文件包含多个行组，启用 `bucket` 粒度可以让每个行组由不同的工作节点独立处理。

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用哈希表统计信息的收集，以优化内存分配

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

启用哈希表统计信息收集，以优化内存分配。

## compatibility \{#compatibility\} 

`compatibility` 设置会使 ClickHouse 使用某个早期 ClickHouse 版本的默认设置，该版本通过此设置进行指定。

如果某些设置已被显式设为非默认值，则这些设置会被保留（只有那些尚未被修改的设置才会受到 `compatibility` 的影响）。

该设置接受一个 ClickHouse 版本号字符串，例如 `22.3`、`22.8`。空值表示禁用此设置。

默认禁用。

:::note
在 ClickHouse Cloud 中，服务级默认的 compatibility 设置必须由 ClickHouse Cloud 支持团队进行配置。请[提交工单](https://clickhouse.cloud/support)以进行设置。
不过，可以在用户、角色、配置文件（profile）、查询或会话级别，通过标准 ClickHouse 设置机制覆盖 compatibility 设置，例如在会话中使用 `SET compatibility = '22.3'`，或者在查询中使用 `SETTINGS compatibility = '22.3'`。
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则在列声明中忽略 AUTO_INCREMENT 关键字，否则返回错误。这有助于简化从 MySQL 迁移的过程。

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在 CREATE TABLE 语句中忽略排序规则的兼容性设置

## compile_aggregate_expressions \{#compile_aggregate_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用将聚合函数 JIT 编译为本机代码。启用此设置可以提升性能。

可能的取值：

- 0 — 聚合在不使用 JIT 编译的情况下执行。
- 1 — 聚合通过 JIT 编译执行。

**另请参阅**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "我们认为 JIT 编译器所依托的 LLVM 基础设施已经足够稳定，因此可以默认启用此设置。"}]}]}/>

将部分标量函数和运算符编译为原生代码。

## compile_sort_description \{#compile_sort_description\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将排序描述编译成本机代码。

## connect_timeout \{#connect_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

在没有副本时使用的连接超时时间。

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

当在集群定义中使用 `shard` 和 `replica` 部分时，用于 Distributed 表引擎连接到远程服务器的超时时间（以毫秒为单位）。
如果连接失败，将会多次尝试连接到不同的副本。

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default secure connect timeout because of async connect"}]}]}/>

在安全连接场景下，用于选取首个健康副本的连接超时时间。

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

当连接池已满时，等待可用连接的时间（毫秒）。

可能的取值：

- 正整数。
- 0 — 无限等待时间。

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

在 Distributed 表引擎中，与每个副本建立连接的最大重试次数。

## convert&#95;query&#95;to&#95;cnf

<SettingsInfoBlock type="Bool" default_value="0" />

当设置为 `true` 时，`SELECT` 查询将被转换为合取范式（CNF，conjunctive normal form）。在某些场景下，以 CNF 形式改写查询可能执行得更快（有关说明，请参见此 [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749)）。

例如，请注意下面的 `SELECT` 查询不会被修改（这是默认行为）：

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = false;
```

结果如下：

```response
┌─explain────────────────────────────────────────────────────────┐
│ SELECT x                                                       │
│ FROM                                                           │
│ (                                                              │
│     SELECT number AS x                                         │
│     FROM numbers(20)                                           │
│     WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15)) │
│ ) AS a                                                         │
│ WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))     │
│ SETTINGS convert_query_to_cnf = 0                              │
└────────────────────────────────────────────────────────────────┘
```

让我们将 `convert_query_to_cnf` 设置为 `true`，看看有什么变化：

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = true;
```

注意，`WHERE` 子句被改写为 CNF 形式，但结果集保持不变——布尔逻辑没有发生变化：

```response
┌─explain───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT x                                                                                                              │
│ FROM                                                                                                                  │
│ (                                                                                                                     │
│     SELECT number AS x                                                                                                │
│     FROM numbers(20)                                                                                                  │
│     WHERE ((x <= 15) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x >= 10) OR (x >= 1)) │
│ ) AS a                                                                                                                │
│ WHERE ((x >= 10) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x <= 15) OR (x <= 5))     │
│ SETTINGS convert_query_to_cnf = 1                                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

可能的值：true、false


## correlated_subqueries_default_join_kind \{#correlated_subqueries_default_join_kind\} 

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "New setting. Default join kind for decorrelated query plan."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "New setting. Default join kind for decorrelated query plan."}]}]}/>

控制在去相关化查询计划中使用的 `JOIN` 类型。默认值为 `right`，这意味着去相关化后的查询计划将包含 `RIGHT JOIN`，并且子查询输入位于右侧。

可能的取值：

- `left` - 去相关化过程将生成 `LEFT JOIN`，输入表位于左侧。
- `right` - 去相关化过程将生成 `RIGHT JOIN`，输入表位于右侧。

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "用于关联子查询执行计划优化的新设置。"}]}]}/>

使用过滤表达式推断等价表达式，并用它们进行替换，从而避免创建 `CROSS JOIN`。

## count_distinct_implementation \{#count_distinct_implementation\} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

指定在执行 [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 表达式时应使用哪个 `uniq*` 函数。

可能的取值：

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

将 count distinct 重写为基于 group by 的子查询

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新设置。"}]}]}/>

在 `countMatches` 函数中，一旦某个模式产生空字符串匹配，就停止计数。

## create_if_not_exists \{#create_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "New setting."}]}]}/>

默认对 `CREATE` 语句启用 `IF NOT EXISTS`。如果启用了此设置或在语句中指定了 `IF NOT EXISTS`，且已存在同名表，则不会抛出异常。

## create_index_ignore_unique \{#create_index_ignore_unique\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在 `CREATE UNIQUE INDEX` 语句中忽略 `UNIQUE` 关键字。用于 SQL 兼容性测试。

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

在 ZooKeeper 中创建完元数据后，在创建表时进行故障注入的概率

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

允许在未指定 ORDER BY 和 PRIMARY KEY 的情况下创建主键为空的 *MergeTree 表

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "在 CROSS JOIN 中触发压缩的数据块最小大小。零值表示禁用该阈值。当任一阈值（按行数或按字节数）达到时，该数据块将被压缩。"}]}]}/>

在 CROSS JOIN 中触发压缩的数据块最小大小。零值表示禁用该阈值。当任一阈值（按行数或按字节数）达到时，该数据块将被压缩。

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "在 CROSS JOIN 中触发数据块压缩所需的最小行数。值为 0 表示禁用此阈值。当达到行数或字节数任一阈值时，该数据块会被压缩。"}]}]}/>

在 CROSS JOIN 中触发数据块压缩所需的最小行数。值为 0 表示禁用此阈值。当达到行数或字节数任一阈值时，该数据块会被压缩。

## data_type_default_nullable \{#data_type_default_nullable\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许在列定义中未显式指定修饰符 [NULL 或 NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) 的数据类型默认为 [Nullable](/sql-reference/data-types/nullable)。

可能的取值：

- 1 — 列定义中的数据类型默认设置为 `Nullable`。
- 0 — 列定义中的数据类型默认设置为非 `Nullable`。

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

为所有 `DROP` 和 `DETACH` 查询添加 `SYNC` 修饰符。

可能的值：

- 0 — 查询将延迟执行。
- 1 — 查询将立即执行（无延迟）。

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "添加了一个新的设置，用于禁止显式指定表的 UUID"}]}]}/>

0 - 不允许在 Replicated 数据库中显式为表指定 UUID。1 - 允许。2 - 允许，但会忽略指定的 UUID，而是生成一个随机的 UUID。

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "禁止在 Replicated 数据库引擎中执行长时间运行的 DDL 查询（CREATE AS SELECT 和 POPULATE）"}]}]}/>

允许在 Replicated 数据库引擎中执行长时间运行的 DDL 查询（CREATE AS SELECT 和 POPULATE）。请注意，这可能会长时间阻塞 DDL 队列。

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\} 

<SettingsInfoBlock type="Bool" default_value="0" />

仅允许在使用 Replicated 引擎的数据库中创建 Replicated 表

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "默认不允许显式指定参数"}]}]}/>

0 - 不允许为 *Replicated 数据库中的 MergeTree 表显式指定 ZooKeeper 路径和副本名称。1 - 允许。2 - 允许，但会忽略指定的路径并改用默认路径。3 - 允许且不记录警告日志。

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当数据库引擎为 Replicated 时，将 DETACH TABLE 作为 DETACH TABLE PERMANENTLY 执行

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\} 

<SettingsInfoBlock type="Bool" default_value="0" />

此设置会对某些查询强制采用同步等待（另请参阅 `database_atomic_wait_for_drop_and_detach_synchronously`、`mutations_sync`、`alter_sync`）。不建议启用此设置。

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

设置初始 DDL 查询在等待 Replicated 数据库处理先前 DDL 队列条目时的最长时间（以秒为单位）。

可能的取值：

- 正整数。
- 0 — 无限制。

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "新设置。"}]}]}/>

从共享数据库中实际移除被删除表之前的延迟时间（以秒为单位）。在此期间，可以使用 `UNDROP TABLE` 语句恢复该表。

## decimal_check_overflow \{#decimal_check_overflow\} 

<SettingsInfoBlock type="Bool" default_value="1" />

检查十进制算术/比较运算是否溢出

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对从 Replicated\* 表接收数据的物化视图执行去重检查。

可能的取值：

0 — 禁用。
      1 — 启用。

启用后，ClickHouse 会对依赖于 Replicated\* 表的物化视图中的数据块执行去重。
当由于故障需要重试插入操作时，此设置有助于确保物化视图中不包含重复数据。

**另请参阅**

- [IN 运算符中的 NULL 处理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "允许在创建物化视图时设置 SQL SECURITY 选项的默认值"}]}]}/>

允许在创建物化视图时设置 SQL SECURITY 选项的默认值。[关于 SQL 安全性的更多信息](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `DEFINER`。

## default_max_bytes_in_join \{#default_max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

当需要对右侧表大小进行限制但未设置 `max_bytes_in_join` 时，右侧表允许的最大大小（以字节计）。

## default_normal_view_sql_security \{#default_normal_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "允许在创建普通视图时设置默认的 `SQL SECURITY` 选项"}]}]}/>

用于在创建普通视图时设置默认的 `SQL SECURITY` 选项。[关于 SQL SECURITY 的更多信息](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `INVOKER`。

## default&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "将默认表引擎设置为 MergeTree 以提升易用性"}]}]} />

当在 `CREATE` 语句中未设置 `ENGINE` 时要使用的默认表引擎。

可能的取值：

* 表示任意有效表引擎名称的字符串

Cloud 默认值：`SharedMergeTree`。

**示例**

查询：

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

结果：

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

在此示例中，任何未指定 `Engine` 的新表都会使用 `Log` 表引擎：

查询：

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

结果：

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default&#95;temporary&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

与 [default&#95;table&#95;engine](#default_table_engine) 相同，只不过用于临时表。

在本示例中，任何未指定 `Engine` 的新临时表将使用 `Log` 表引擎：

Query:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

结果：

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TEMPORARY TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default_view_definer \{#default_view_definer\} 

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "用于在创建视图时设置默认的 `DEFINER` 选项"}]}]}/>

用于在创建视图时设置默认的 `DEFINER` 选项。[了解更多 SQL 安全性相关内容](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `CURRENT_USER`。

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

启用 Delta 内核的内部数据剪枝。

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

启用 DeltaLake 表达式访问器的测试级日志记录。这些日志甚至对于测试日志来说也可能过于冗长。

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

定义 Delta Lake 中单个插入数据文件的最大字节数。

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新设置。"}]}]}/>

定义 Delta Lake 中单个插入数据文件的最大行数限制。

## delta_lake_log_metadata \{#delta_lake_log_metadata\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

启用将 Delta Lake 元数据文件记录到 system 表中的功能。

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "新设置"}]}]}/>

要读取的 Delta Lake 快照版本号。值为 -1 表示读取最新版本（0 也是一个有效的快照版本号）。

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，如果在 delta-kernel 中分析扫描谓词时发生错误，将抛出异常。

## describe_compact_output \{#describe_compact_output\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则在 DESCRIBE 查询结果中仅包含列名和类型

## describe_include_subcolumns \{#describe_include_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 [DESCRIBE](../../sql-reference/statements/describe-table.md) 查询中显示子列。例如，[Tuple](../../sql-reference/data-types/tuple.md) 的成员，或 [Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null)、[Array](../../sql-reference/data-types/array.md/#array-size) 等数据类型的子列。

可能的取值：

- 0 — 在 `DESCRIBE` 查询中不包含子列。
- 1 — 在 `DESCRIBE` 查询中包含子列。

**示例**

示例请参见 [DESCRIBE](../../sql-reference/statements/describe-table.md) 语句。

## describe_include_virtual_columns \{#describe_include_virtual_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

若为 true，将在 DESCRIBE 查询结果中包含表的虚拟列。

## dialect \{#dialect\} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

用于解析查询的 SQL 方言

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "验证字典主键类型。默认情况下，简单布局的ID类型将被隐式转换为UInt64。"}]}]}/>

验证字典主键类型。默认情况下，简单布局的ID类型将被隐式转换为UInt64。

## distinct_overflow_mode \{#distinct_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过任一限制时的处理方式。

可能的取值：

- `throw`: 抛出异常（默认值）。
- `break`: 停止执行查询并返回部分结果，就好像
源数据已经耗尽一样。

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\} 

<SettingsInfoBlock type="Bool" default_value="1" />

是否启用分布式聚合的省内存模式。

## distributed_background_insert_batch \{#distributed_background_insert_batch\} 

**别名**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用按批次发送插入的数据。

启用批量发送时，[Distributed](../../engines/table-engines/special/distributed.md) 表引擎会尝试在一次操作中发送多个插入数据对应的文件，而不是分别发送。批量发送通过更充分地利用服务器和网络资源来提升集群性能。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\} 

**别名**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎发送数据的最大时间间隔。用于限制在 [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) 设置中配置的时间间隔的指数增长。

可能的取值：

- 一个表示毫秒数的正整数。

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\} 

**别名**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎发送数据时使用的基础间隔时间。在发生错误时，实际间隔会按指数方式增长。

可能的值：

- 以毫秒为单位的正整数。

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\} 

**别名**：`distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在发生失败时拆分批次。

有时将某个批次发送到远程分片可能会失败，这是由于之后存在复杂的处理流水线（例如包含 `GROUP BY` 的 `MATERIALIZED VIEW`），导致出现 `Memory limit exceeded` 或类似错误。在这种情况下，重试也无济于事（而且会导致该表的分布式发送一直卡住），但将该批次中的文件逐个发送则可能成功完成 INSERT 操作。

因此，将此设置为 `1` 时，对于这类批次将不再使用批处理方式发送（即会暂时对失败批次禁用 `distributed_background_insert_batch`）。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

:::note
此设置也会影响损坏的批次（这些批次可能由于服务器（机器）异常终止且未启用 `fsync_after_insert`/`fsync_directories` 而出现在 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎中）。
:::

:::note
不应依赖自动批次拆分，因为这可能会对性能产生负面影响。
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\} 

**别名**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

向分布式表执行 INSERT 查询的超时时间。该设置仅在启用 insert_distributed_sync 时生效。值为 0 表示不设置超时时间。

## distributed_cache_alignment \{#distributed_cache_alignment\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "distributed_cache_read_alignment 的重命名"}]}]}/>

仅在 ClickHouse Cloud 中生效。此设置仅用于测试，请勿修改。

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中有效。用于绕过分布式缓存连接池。

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "新设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。创建分布式缓存连接时的最大退避时间（毫秒）。

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。创建分布式缓存连接时的最小退避时间，单位为毫秒。

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "设置值已更改"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "仅限 Cloud 环境"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "ClickHouse Cloud 专用设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于在连接分布式缓存失败时进行重试的最大尝试次数。

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。连接分布式缓存服务器时的超时时间。

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。凭证刷新周期。

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于在单个分布式缓存读取请求中，对 DataPacket 序列发送 ACK 的窗口大小。

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中有效。如果存在未读数据，则断开连接。

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 专用设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。在 system.distributed_cache_metrics 和 system.distributed_cache_events 中仅从当前可用区获取指标。

## distributed_cache_log_mode \{#distributed_cache_log_mode\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "ClickHouse Cloud 的一项设置"}]}]}/>

仅在 ClickHouse Cloud 中有效。写入 system.distributed_cache_log 的模式。

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "用于 ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。单个分布式缓存读取请求中允许存在的未确认在途数据包的最大数量。

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新的私有设置。"}]}]}/>

仅在 ClickHouse Cloud 中生效。在分布式缓存中执行查找操作所需的最小字节数。

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "仅限 Cloud"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于指定在达到连接池上限时分布式缓存连接的行为。

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

仅在 ClickHouse Cloud 中有效。与 filesystem_cache_prefer_bigger_buffer_size 相同，但适用于分布式缓存。

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。仅允许从当前可用区的缓存服务器读取。如果禁用，则会从所有可用区的所有缓存服务器读取。

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "设置值已更改"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "新增设置项"}]}]}/>

仅在 ClickHouse Cloud 中生效。分布式缓存请求失败时的最大重试次数。

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "ClickHouse Cloud 的设置项"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于从分布式缓存接收某个请求数据的等待时间，单位为毫秒。

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 的一个设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。以毫秒为单位，表示等待从分布式缓存接收任意类型响应的时间。

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。从分布式缓存服务器接收数据的超时时间（毫秒）。如果在该时间间隔内未接收到任何字节，将抛出异常。

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。向分布式缓存服务器发送数据的超时时间（毫秒）。如果客户端需要发送数据，但在该时间内无法发送任何字节，则会抛出异常。

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中有效。以毫秒为单位，表示在 TCP 开始发送 keepalive 探测报文之前，与分布式缓存服务器的连接需要保持空闲的时间。

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。会重新抛出与分布式缓存通信期间发生的异常，或从分布式缓存接收到的异常。否则在出错时将回退为跳过使用分布式缓存。

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 的一项设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。当 `distributed_cache_pool_behaviour_on_limit` 为 `wait` 时，从连接池获取连接的等待时间（毫秒）。

## distributed_connections_pool_size \{#distributed_connections_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

对单个 Distributed 表的所有查询进行分布式处理时，可与远程服务器建立的最大并发连接数。建议将该值设置为不小于集群中的服务器数量。

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

分布式 DDL（ON CLUSTER）查询的兼容版本

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

设置分布式 DDL 查询结果的输出格式。

可选值：

- `throw` — 返回一个结果集，其中包含查询已完成的所有主机的执行状态。如果查询在某些主机上失败，则会重新抛出第一个异常。如果在某些主机上查询尚未完成且超过 [distributed_ddl_task_timeout](#distributed_ddl_task_timeout)，则抛出 `TIMEOUT_EXCEEDED` 异常。
- `none` — 与 `throw` 类似，但分布式 DDL 查询不返回结果集。
- `null_status_on_timeout` — 在结果集的部分行中，如果对应主机上的查询尚未完成，则返回 `NULL` 作为执行状态，而不是抛出 `TIMEOUT_EXCEEDED`。
- `never_throw` — 不抛出 `TIMEOUT_EXCEEDED`，并且在某些主机上查询失败时不重新抛出异常。
- `none_only_active` - 与 `none` 类似，但不会等待 `Replicated` 数据库中的非活动副本。注意：在此模式下，无法得知查询尚未在某些副本上执行，而这部分执行将会在后台进行。
- `null_status_on_timeout_only_active` — 与 `null_status_on_timeout` 类似，但不会等待 `Replicated` 数据库中的非活动副本。
- `throw_only_active` — 与 `throw` 类似，但不会等待 `Replicated` 数据库中的非活动副本。

Cloud 环境下的默认值：`throw`。

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\} 

<SettingsInfoBlock type="Int64" default_value="180" />

设置等待集群中所有主机返回 DDL 查询响应的超时时间。如果某个 DDL 请求尚未在所有主机上执行完毕，则响应中会包含超时错误，并且该请求将以异步模式执行。负值表示无限超时。

可能的取值：

- 正整数。
- 0 — 异步模式。
- 负整数 — 无限超时。

## distributed_foreground_insert \{#distributed_foreground_insert\} 

**别名**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对 [Distributed](/engines/table-engines/special/distributed) 表的同步数据插入。

默认情况下，当向 `Distributed` 表插入数据时，ClickHouse 服务器会在后台模式下将数据发送到集群节点。当 `distributed_foreground_insert=1` 时，数据会以同步方式处理，只有在所有分片上的数据都已保存之后（如果 `internal_replication` 为 true，则每个分片至少有一个副本完成写入），`INSERT` 操作才会成功。

可能的取值：

- `0` — 在后台模式下插入数据。
- `1` — 在同步模式下插入数据。

云端默认值：`0`。

**另请参阅**

- [Distributed 表引擎](/engines/table-engines/special/distributed)
- [管理 Distributed 表](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge

<SettingsInfoBlock type="UInt64" default_value="0" />

在分布式查询处理中不合并来自不同服务器的聚合状态。当可以确定不同分片上使用的是不同键时，可以使用此设置。

可能的取值：

* `0` — 禁用（最终查询处理在发起节点上完成）。
* `1` - 在分布式查询处理中不合并来自不同服务器的聚合状态（查询在各分片上完全处理，发起节点仅代理数据）。当可以确定不同分片上存在不同键时可以使用。
* `2` - 与 `1` 相同，但在发起节点上应用 `ORDER BY` 和 `LIMIT`（当查询完全在远程节点上处理时，例如 `distributed_group_by_no_merge=1` 的情况，无法在发起节点上再执行这些操作）。可用于带有 `ORDER BY` 和/或 `LIMIT` 的查询。

**示例**

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 1
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
│     0 │
└───────┘
```

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 2
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
└───────┘
```


## distributed_insert_skip_read_only_replicas \{#distributed_insert_skip_read_only_replicas\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "If true, INSERT into Distributed will skip read-only replicas"}]}]}/>

启用在对 Distributed 执行 INSERT 查询时跳过只读副本。

可能的取值：

- 0 — INSERT 行为与默认相同，如果数据被发送到只读副本，请求将失败
- 1 — 请求发起方在向分片发送数据前会跳过只读副本。

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新的实验性设置。"}]}]}/>

用于分布式查询并行读取的默认任务数量。任务会分散到各个副本上执行。

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

用于分布式 shuffle-hash-join 的默认桶数量。

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

在本地运行分布式查询计划中的所有任务。适用于测试和调试。

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "New experimental setting."}]}]}/>

在分布式查询各阶段之间强制使用指定类型的 Exchange 算子。

可选值：

- '' - 不强制任何类型的 Exchange 算子，由优化器自行选择，
 - 'Persisted' - 在对象存储中使用临时文件，
 - 'Streaming' - 通过网络以流式方式交换数据。

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新的实验性设置"}]}]}/>

在分布式查询计划中，使用 Shuffle 聚合策略替代 PartialAggregation + Merge。

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新的实验性设置。"}]}]}/>

在分布式查询计划中，决定使用广播连接（broadcast join）而不是重分布连接（shuffle join）时的最大行数阈值。

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新的实验性设置。"}]}]}/>

移除分布式查询计划中不必要的 Exchange 节点。调试时可将其禁用。

## distributed_product_mode \{#distributed_product_mode\} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

更改 [分布式子查询](../../sql-reference/operators/in.md) 的行为。

当查询中包含分布式表的笛卡尔积时，ClickHouse 会应用此设置，即当针对分布式表的查询中包含一个针对该分布式表的非 GLOBAL 的子查询时，会应用此设置。

限制：

- 仅适用于 IN 和 JOIN 子查询。
- 仅当 FROM 子句中使用的分布式表包含多个分片时适用。
- 仅当子查询涉及的分布式表包含多个分片时适用。
- 不适用于表值型 [remote](../../sql-reference/table-functions/remote.md) 函数。

可能的取值：

- `deny` — 默认值。禁止使用此类子查询（返回 “Double-distributed IN/JOIN subqueries is denied” 异常）。
- `local` — 将子查询中的数据库和表替换为目标服务器（分片）上的本地数据库和表，同时保留普通的 `IN`/`JOIN`。
- `global` — 将 `IN`/`JOIN` 查询替换为 `GLOBAL IN`/`GLOBAL JOIN`。
- `allow` — 允许使用此类子查询。

## distributed_push_down_limit \{#distributed_push_down_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

启用或禁用在每个分片上分别应用 [LIMIT](#limit)。

这可以避免：

- 通过网络发送多余的行；
- 在发起端处理超出限制的行。

从 21.9 版本开始，将不再出现结果不精确的情况，因为只有在至少满足以下条件之一时，`distributed_push_down_limit` 才会改变查询执行方式：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- 查询**没有** `GROUP BY`/`DISTINCT`/`LIMIT BY`，但有 `ORDER BY`/`LIMIT`。
- 查询**有** `GROUP BY`/`DISTINCT`/`LIMIT BY`，并带有 `ORDER BY`/`LIMIT`，并且：
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) 已启用；
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) 已启用。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 类型：无符号整数
- 默认值：1000

每个副本的错误计数都会被限制为不超过该值，从而防止单个副本累计过多错误。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- 类型：秒
- 默认值：60 秒

控制分布式表中错误计数被清零的速度。如果某个副本在一段时间内不可用，累计了 5 次错误，并且将 distributed_replica_error_half_life 设置为 1 秒，那么在最后一次错误发生后 3 秒，该副本就会被视为正常。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [表引擎 Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- 类型：无符号整数
- 默认值：0

在根据 `load_balancing` 算法选择副本时，允许被忽略的错误次数上限。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [表引擎 Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在 `SELECT FINAL` 中只合并同一分区内的数据部分

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当对空集合按常量键进行聚合时，返回空结果。

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在对空集合执行无键聚合时，返回空结果。

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新设置。自适应地将内存溢写数据写入外部存储。"}]}]}/>

触发处理器，自适应地将内存数据溢写到外部存储。目前支持 grace join。

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "用于减少分布式 IN 子查询传输的临时表大小的新设置。"}]}]}/>

在 `IN` 子查询中启用 `DISTINCT`。这是一个存在性能取舍的设置：启用后，可以显著减少为分布式 IN 子查询而传输的临时表大小，并通过仅发送唯一值，大幅加快分片之间的数据传输。
但是，启用该设置会在每个节点上增加额外的合并开销，因为必须执行去重（DISTINCT）。仅当网络传输成为瓶颈且可以接受额外的合并成本时，才建议使用此设置。

## enable_blob_storage_log \{#enable_blob_storage_log\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "将 blob 存储操作相关信息写入 system.blob_storage_log 表"}]}]}/>

将 blob 存储操作相关信息写入 system.blob_storage_log 表

## enable_deflate_qpl_codec \{#enable_deflate_qpl_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

开启后，可以使用 DEFLATE_QPL 编解码器来压缩列。

## enable_early_constant_folding \{#enable_early_constant_folding\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用查询优化：分析函数和子查询的结果，如果其中包含常量，则重写查询

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用返回范围更大（相对于 `Date` 类型）的 `Date32` 类型结果，
或范围更大（相对于 `DateTime` 类型）的 `DateTime64` 类型结果。

可能的取值：

- `0` — 对于所有类型的参数，函数返回 `Date` 或 `DateTime`。
- `1` — 对于 `Date32` 或 `DateTime64` 参数，函数返回 `Date32` 或 `DateTime64`，否则返回 `Date` 或 `DateTime`。

下表展示了此设置在各种日期时间函数中的具体行为。

| 功能                        | `enable_extended_results_for_datetime_functions = 0`     | `enable_extended_results_for_datetime_functions = 1`                                                               |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `toStartOfYear`           | 返回 `Date` 或 `DateTime` 类型                                | 对于 `Date`/`DateTime` 类型的输入返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入返回 `Date32`/`DateTime64`         |
| `toStartOfISOYear`        | 返回 `Date` 或 `DateTime` 类型                                | 若输入为 `Date`/`DateTime`，则返回 `Date`/`DateTime`<br />若输入为 `Date32`/`DateTime64`，则返回 `Date32`/`DateTime64`             |
| `toStartOfQuarter`        | 返回 `Date` 或 `DateTime` 类型                                | 对 `Date`/`DateTime` 输入返回 `Date`/`DateTime`<br />对 `Date32`/`DateTime64` 输入返回 `Date32`/`DateTime64`                 |
| `toStartOfMonth`          | 返回 `Date` 或 `DateTime` 类型                                | 对于 `Date`/`DateTime` 类型的输入，返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入，返回 `Date32`/`DateTime64`       |
| `toStartOfWeek`           | 返回 `Date` 或 `DateTime` 类型                                | 对于 `Date`/`DateTime` 类型的输入，返回 `Date`/`DateTime` 类型<br />对于 `Date32`/`DateTime64` 类型的输入，返回 `Date32`/`DateTime64` 类型 |
| `toLastDayOfWeek`         | 返回 `Date` 或 `DateTime`                                   | 对 `Date`/`DateTime` 类型的输入返回 `Date`/`DateTime` 类型<br />对 `Date32`/`DateTime64` 类型的输入返回 `Date32`/`DateTime64` 类型     |
| `toLastDayOfMonth`        | 返回 `Date` 或 `DateTime` 类型                                | 对 `Date`/`DateTime` 类型的输入返回 `Date`/`DateTime`<br />对 `Date32`/`DateTime64` 类型的输入返回 `Date32`/`DateTime64`           |
| `toMonday`                | 返回 `Date` 或 `DateTime`                                   | 对于 `Date`/`DateTime` 类型的输入返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入返回 `Date32`/`DateTime64`         |
| `toStartOfDay`            | 返回 `DateTime`<br />*注意：对于超出 1970-2149 年范围的值，结果可能不正确*     | 对 `Date`/`DateTime` 输入返回 `DateTime`<br />对 `Date32`/`DateTime64` 输入返回 `DateTime64`                                 |
| `toStartOfHour`           | 返回 `DateTime`<br />*注意：对于超出 1970–2149 年范围的值，结果可能不正确*     | 对 `Date`/`DateTime` 输入返回 `DateTime` 类型<br />对 `Date32`/`DateTime64` 输入返回 `DateTime64` 类型                           |
| `toStartOfFifteenMinutes` | 返回 `DateTime`<br />*注意：对于超出 1970-2149 年范围的值会产生错误结果*      | 对于 `Date`/`DateTime` 输入，返回 `DateTime` 类型<br />对于 `Date32`/`DateTime64` 输入，返回 `DateTime64` 类型                       |
| `toStartOfTenMinutes`     | 返回 `DateTime`<br />*注意：对于超出 1970-2149 范围的值会返回不正确的结果*     | 对于 `Date`/`DateTime` 输入返回 `DateTime` 类型<br />对于 `Date32`/`DateTime64` 输入返回 `DateTime64` 类型                         |
| `toStartOfFiveMinutes`    | Returns `DateTime`<br />*注意：对于超出 1970-2149 年范围的值会返回错误结果* | 对于 `Date`/`DateTime` 输入返回 `DateTime`<br />对于 `Date32`/`DateTime64` 输入返回 `DateTime64`                               |
| `toStartOfMinute`         | 返回 `DateTime`<br />*注意：对于超出 1970–2149 年范围的值，结果可能不正确*     | 对于 `Date`/`DateTime` 输入，返回 `DateTime`<br />对于 `Date32`/`DateTime64` 输入，返回 `DateTime64`                             |
| `timeSlot`                | 返回 `DateTime`<br />*注意：对于 1970-2149 年范围之外的值会产生错误结果*      | 输入为 `Date`/`DateTime` 时返回 `DateTime`<br />输入为 `Date32`/`DateTime64` 时返回 `DateTime64`                               |

## enable_filesystem_cache \{#enable_filesystem_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

为远程文件系统启用缓存。此设置不会启用或禁用磁盘级缓存（必须通过磁盘配置完成），但在需要时允许某些查询绕过缓存

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用针对每个查询的文件系统缓存日志记录

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用 `write-through` 缓存。若设置为 `false`，则对写入操作禁用 `write-through` 缓存。若设置为 `true`，则仅当在服务器配置的 cache 磁盘配置部分中开启了 `cache_on_write_operations` 时，才会启用 `write-through` 缓存。
更多详情参见[《使用本地缓存》](/operations/storing-data#using-local-cache)。

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在查询执行期间将日志写入 `system.filesystem` 数据库中的 `prefetch_log` 表。应仅用于测试或调试，不建议默认开启。

## enable_global_with_statement \{#enable_global_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "默认将 WITH 子句传递到 UNION 查询和所有子查询"}]}]}/>

将 WITH 子句传递到 UNION 查询和所有子查询

## enable_hdfs_pread \{#enable_hdfs_pread\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

启用或禁用对 HDFS 文件的 `pread` 读取方式。默认情况下使用 `hdfsPread`。如果禁用，将使用 `hdfsRead` 和 `hdfsSeek` 来读取 HDFS 文件。

## enable_http_compression \{#enable_http_compression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "通常情况下应当是有益的"}]}]}/>

启用或禁用 HTTP 请求响应数据的压缩。

有关更多信息，请参阅 [HTTP 接口说明](../../interfaces/http.md)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## enable_job_stack_trace \{#enable_job_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "该设置默认禁用，以避免性能开销。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "启用在作业调度阶段收集堆栈跟踪。默认禁用，以避免性能开销。"}]}]}/>

当作业导致异常时，输出作业创建者的堆栈跟踪。默认禁用，以避免性能开销。

## enable_join_runtime_filters \{#enable_join_runtime_filters\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

在运行时使用从右侧收集到的一组 JOIN 键来过滤左侧数据。

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "在 JOIN 和 ARRAY JOIN 中默认启用惰性列复制"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "新增在 JOIN 和 ARRAY JOIN 中启用惰性列复制的设置项"}]}]}/>

在 JOIN 和 ARRAY JOIN 中启用惰性列复制，从而避免在内存中对相同行进行不必要的重复拷贝。

## enable_lightweight_delete \{#enable_lightweight_delete\} 

**别名**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

为 MergeTree 表启用轻量级 DELETE 变更操作。

## enable_lightweight_update \{#enable_lightweight_update\} 

<BetaBadge/>

**Aliases**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "轻量级更新已移至 Beta。为设置 `allow_experimental_lightweight_update` 添加了别名。"}]}]}/>

允许使用轻量级更新功能。

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用聚合结果的内存受限合并策略。

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在存在由 AND 组合的多个条件时，将更多条件从 WHERE 下推到 PREWHERE，并分多步执行磁盘读取和过滤

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "当所有名称都是唯一且可以视为未加引号的标识符时，在函数 tuple() 中生成具名元组。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "在可用性改进完成之前保持禁用。"}]}]}/>

当所有名称都是唯一且可以视为未加引号的标识符时，在函数 tuple() 中生成具名元组。

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

在 `SELECT` 查询中启用谓词下推。

谓词下推可以显著减少分布式查询的网络流量。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

使用说明

考虑以下查询：

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

如果 `enable_optimize_predicate_expression = 1`，则这两个查询的执行时间相同，因为 ClickHouse 在处理子查询时会将 `WHERE` 子句下推到子查询中。

如果 `enable_optimize_predicate_expression = 0`，则第二个查询的执行时间要长得多，因为只有在子查询执行完成后才会对所有数据应用 `WHERE` 子句。

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许将谓词下推到 FINAL 子查询。

## enable&#95;order&#95;by&#95;all

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用 `ORDER BY ALL` 排序语法，参见 [ORDER BY](../../sql-reference/statements/select/order-by.md)。

可选值：

* 0 — 禁用 ORDER BY ALL。
* 1 — 启用 ORDER BY ALL。

**示例**

查询：

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- 返回错误，ALL 存在歧义

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

结果：

```text
┌─C1─┬─C2─┬─ALL─┐
│ 20 │ 20 │  10 │
│ 30 │ 10 │  20 │
│ 10 │ 20 │  30 │
└────┴────┴─────┘
```


## enable_parallel_blocks_marshalling \{#enable_parallel_blocks_marshalling\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "A new setting"}]}]}/>

仅影响分布式查询。启用后，在发送到发起节点之前或之后，数据块会在 pipeline 线程中进行（反）序列化和（解）压缩（即并行度高于默认值）。

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则可以根据从表中获取的序列化提示信息，将数据直接解析为具有自定义序列化（例如 Sparse）的列。

## enable&#95;positional&#95;arguments

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "默认启用位置参数功能"}]}]} />

启用或禁用在 [GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) 语句中使用位置参数的功能。

可选值：

* 0 — 不支持位置参数。
* 1 — 支持使用位置参数：可以使用列序号来代替列名。

**示例**

查询：

```sql
CREATE TABLE positional_arguments(one Int, two Int, three Int) ENGINE=Memory();

INSERT INTO positional_arguments VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM positional_arguments ORDER BY 2,3;
```

结果：

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```


## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

允许内存高效聚合（参见 `distributed_aggregation_memory_efficient`）以乱序方式生成分桶。
当聚合桶大小分布不均时，这可以通过允许副本在发起方仍在处理一些较重的低 ID 桶时，先将更高 ID 的桶发送给发起方，从而提升性能。
其缺点是可能会增加内存使用量。

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果开启，将会从[查询缓存](../query-cache.md)中获取 `SELECT` 查询的结果。

可选值：

- 0 - 禁用
- 1 - 启用

## enable_s3_requests_logging \{#enable_s3_requests_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用对 S3 请求的极其详细日志记录。仅建议在调试时使用。

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "防止标量子查询对大型标量值进行（反）序列化，并有可能避免同一子查询被多次执行"}]}]}/>

如果设置为 true，则会防止标量子查询对大型标量值进行（反）序列化，并有可能避免同一子查询被多次执行。

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容性的新增设置。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容性的新增设置。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容性的新增设置。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容性的新增设置。"}]}]}/>

如果禁用该设置，父级 WITH 子句中的声明将表现得与它们在当前作用域中声明时相同。

请注意，这是为新分析器提供的一项兼容性设置，用于允许运行某些在语义上无效、但旧分析器仍能执行的查询。

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "A new setting to share storage snapshot in query"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "1"},{"label": "Better consistency guarantees."}]}]} />

如果启用，单个查询中的所有子查询在访问每个表时都会共享同一个 `StorageSnapshot`。
这可以确保在整个查询范围内获得一致的数据视图，即使同一张表被多次访问。

对于那些要求数据分片内部一致性的查询，这是必需的。例如：

```sql
SELECT
    count()
FROM events
WHERE (_part, _part_offset) IN (
    SELECT _part, _part_offset
    FROM events
    WHERE user_id = 42
)
```

如果不启用此设置，外层和内层查询可能会基于不同的数据快照运行，从而导致结果不正确。

:::note
启用此设置会禁用一种优化：该优化会在计划阶段完成后，从快照中移除不必要的数据分片。
因此，长时间运行的查询可能会在整个执行期间一直持有过时的分片，从而延迟分片清理并增加存储压力。

此设置目前仅适用于 MergeTree 系列表。
:::

可能的取值：

* 0 - 禁用
* 1 - 启用


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许在同一个 mutation 的不同任务之间共享为 IN 子查询构建的 set 对象，从而减少内存占用和 CPU 开销。

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在聚合中启用软件预取

## enable_time_time64_type \{#enable_time_time64_type\} 

**别名**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新增设置。允许使用新的实验性 Time 和 Time64 数据类型。"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "默认启用 Time 和 Time64 数据类型"}]}]}/>

允许创建 [Time](../../sql-reference/data-types/time.md) 和 [Time64](../../sql-reference/data-types/time64.md) 数据类型。

## enable_unaligned_array_join \{#enable_unaligned_array_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许对多个长度不同的数组执行 ARRAY JOIN。启用此设置后，所有数组都会被调整为与最长数组的长度一致。

## enable_url_encoding \{#enable_url_encoding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "修改了现有设置的默认值"}]}]}/>

允许在 [URL](../../engines/table-engines/special/url.md) 引擎表中启用或禁用对 URI 路径的解码/编码。

默认禁用。

## enable_vertical_final \{#enable_vertical_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "在修复错误后再次默认启用 vertical final"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "默认使用 vertical final"}]}]}/>

如果启用该设置，在执行 FINAL 时会通过将重复行标记为已删除并在之后过滤掉它们来移除重复行，而不是通过合并行来去重。

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，`SELECT` 查询的结果将存储在[查询缓存](../query-cache.md)中。

可能的取值：

- 0 - 禁用
- 1 - 启用

## enable_zstd_qat_codec \{#enable_zstd_qat_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Add new ZSTD_QAT codec"}]}]}/>

开启后，可使用 ZSTD_QAT 编解码器压缩列数据。

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

启用后，仅允许标识符包含字母、数字和下划线。

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在使用带有后缀（`JSON`、`ORC`、`Parquet` 等）的格式时，在 File 引擎表中每次插入都创建一个新文件。若启用，每次插入都会创建一个新文件，文件名按如下模式依次递增：

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` 等。

可能的取值：

- 0 — `INSERT` 查询会将新数据追加到文件末尾。
- 1 — `INSERT` 查询会创建一个新文件。

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许在没有文件的情况下从 `File` 引擎的表中查询数据。

可能的取值：

- 0 — `SELECT` 抛出异常。
- 1 — `SELECT` 返回空结果。

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [File](../../engines/table-engines/special/file.md) 引擎表中跳过空文件。

可能值：

- 0 — 如果空文件与请求的格式不兼容，则 `SELECT` 抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在 [File](../../engines/table-engines/special/file.md) 引擎表中启用或禁用在插入前截断文件内容的行为。

可能的取值：

- 0 — `INSERT` 查询会将新数据追加到文件末尾。
- 1 — `INSERT` 查询会用新数据替换文件的现有内容。

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 [URL](../../engines/table-engines/special/url.md) 引擎表中跳过空文件。

可能的值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## except_default_mode \{#except_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

在 `EXCEPT` 查询中设置默认模式。可选值：空字符串、`ALL`、`DISTINCT`。如果设置为空，则未显式指定模式的查询将抛出异常。

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新增设置。"}]}]} />

在执行 INSERT 时，排除指定的 skip 索引，使其在该阶段不被构建和存储。被排除的 skip 索引仍会[在合并时](merge-tree-settings.md/#materialize_skip_indexes_on_merge)或通过显式的
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询进行构建和存储。

如果 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) 为 false，则该设置无效。

示例：

```sql
CREATE TABLE tab
(
    a UInt64,
    b UInt64,
    INDEX idx_a a TYPE minmax,
    INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple();

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a 在插入时不会更新
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- 插入时两个索引都不会更新

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- 仅更新 idx_b

-- 由于这是会话级设置,可以在单个查询级别设置
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- 可使用此查询显式物化索引

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- 重置设置为默认值
```


## execute_exists_as_scalar_subquery \{#execute_exists_as_scalar_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

将非关联的 `EXISTS` 子查询作为标量子查询执行。与标量子查询一样，会使用缓存，并且对结果应用常量折叠。

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

连接超时时间（单位：秒）。当前仅适用于 MySQL。

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在使用 external 引擎的表刷新历史数据时允许读取的最大字节数。当前仅支持 MySQL 表引擎、数据库引擎和字典。如果为 0，则禁用该设置。

## external_storage_max_read_rows \{#external_storage_max_read_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在使用外部引擎的表刷新历史数据时可读取的最大行数。当前仅支持 MySQL 表引擎、数据库引擎和字典。如果为 0，则禁用该设置。

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

读写超时时间（单位：秒）。目前仅支持 MySQL

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

定义 [mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md) 和 [odbc](../../sql-reference/table-functions/odbc.md) 表函数如何使用 Nullable 列。

可选值：

- 0 — 表函数显式使用 Nullable 列。
- 1 — 表函数隐式使用 Nullable 列。

**用法**

如果将该设置设为 `0`，则表函数不会将列声明为 Nullable，而是插入默认值来替代 NULL。此行为同样适用于数组中的 NULL 值。

## external_table_strict_query \{#external_table_strict_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 `true`，则对于外部表的查询，将禁止把表达式转换成本地过滤条件。

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\} 

**别名**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "`extractKeyValuePairs` 函数可生成的键值对最大数量。用于防止占用过多内存的保护机制。"}]}]}/>

`extractKeyValuePairs` 函数可生成的键值对最大数量。用于防止占用过多内存的保护机制。

## extremes \{#extremes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

是否统计极值（查询结果中各列的最小值和最大值）。可取 0 或 1。默认值为 0（禁用）。
更多信息，参见“极值”一节。

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在最新数据不可用时，强制将查询发送到滞后的副本。参见 [Replication](../../engines/table-engines/mergetree-family/replication.md)。

ClickHouse 会在表的滞后副本中选择最合适的一个。

用于在对指向 replicated 表的分布式表执行 `SELECT` 查询时。

默认值为 1（启用）。

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "用于按查询粒度控制文件系统缓存中后台下载的新设置。"}]}]}/>

允许文件系统缓存将从远程存储读取的数据在后台排队下载。禁用后，当前查询/会话的下载将以前台方式执行。

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "新增设置"}]}]}/>

文件系统缓存边界对齐。该设置仅适用于非磁盘读取场景（例如远程表引擎 / 表函数的缓存，而不适用于 MergeTree 表的存储配置）。值为 0 表示不进行对齐。

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于在文件系统缓存中预留空间时锁定缓存的等待时间。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于在 filesystem cache 中预留空间时锁定缓存的等待时间。

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

单个查询可下载的远程文件系统缓存的最大容量

## filesystem_cache_name \{#filesystem_cache_name\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "要用于无状态表引擎或数据湖的文件系统缓存名称"}]}]}/>

要用于无状态表引擎或数据湖的文件系统缓存名称

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

当启用文件系统缓存（filesystem cache）时，优先使用更大的缓冲区大小，以避免写入会降低缓存性能的小文件片段。另一方面，启用此设置可能会增加内存使用量。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "在文件系统缓存中，为预留空间获取缓存锁时的等待时间"}]}]}/>

在文件系统缓存中，为预留空间获取缓存锁时的等待时间

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

限制读取缓冲区单次从缓存批量请求的文件分段的总大小。值过小会导致对缓存的请求次数过多，值过大会减慢缓存淘汰过程。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\} 

**别名**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "将设置 skip_download_if_exceeds_query_cache_limit 重命名"}]}]}/>

如果会导致超过查询缓存大小，则跳过从远程文件系统下载

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

预取操作可使用的最大内存。

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

以字节为单位的预取步长。零表示 `auto` —— 系统会自动推导出一个近似最优的预取步长，但可能无法做到 100% 最优。实际值可能会因为设置 filesystem_prefetch_min_bytes_for_single_read_task 而有所不同。

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

标记中的预取步长。零表示 `auto` —— 将自动推导出一个大致最优的预取步长，但可能并非 100% 最优。实际取值可能会不同，因为还受设置 filesystem_prefetch_min_bytes_for_single_read_task 的影响。

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\} 

<SettingsInfoBlock type="UInt64" default_value="200" />

预取的最大数量。零表示不限制。若要限制预取数量，更推荐使用设置 `filesystem_prefetches_max_memory_usage`。

## final

<SettingsInfoBlock type="Bool" default_value="0" />

自动对查询中所有适用 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修饰符的表（包括关联表、子查询中的表以及分布式表）应用 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修饰符。

可能的取值：

* 0 - 禁用
* 1 - 启用

示例：

```sql
CREATE TABLE test
(
    key Int64,
    some String
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO test FORMAT Values (1, 'first');
INSERT INTO test FORMAT Values (1, 'second');

SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
┌─key─┬─some──┐
│   1 │ first │
└─────┴───────┘

SELECT * FROM test SETTINGS final = 1;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘

SET final = 1;
SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
```


## flatten&#95;nested

<SettingsInfoBlock type="Bool" default_value="1" />

设置 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 列的数据格式。

可能的取值：

* 1 — Nested 列被展开为多个独立的数组。
* 0 — Nested 列保留为一个由元组组成的单一数组。

**用法**

如果该设置为 `0`，则可以使用任意层级的嵌套。

**示例**

查询：

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

结果：

```text
┌─statement───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n.a` Array(UInt32),
    `n.b` Array(UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SET flatten_nested = 0;

CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

结果：

```text
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n` Nested(a UInt32, b UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## force_aggregate_partitions_independently \{#force_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在优化适用的情况下强制启用该优化，即使启发式规则判定不应使用它

## force_aggregation_in_order \{#force_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

该设置由服务器内部使用，用于支持分布式查询。不要手动修改，否则会破坏正常运行。（在进行分布式聚合时，强制远程节点按顺序执行聚合操作）。

## force&#95;data&#95;skipping&#95;indices

当传入的数据跳过索引未被使用时，将禁用查询执行。

请看以下示例：

```sql
CREATE TABLE data
(
    key Int,
    d1 Int,
    d1_null Nullable(Int),
    INDEX d1_idx d1 TYPE minmax GRANULARITY 1,
    INDEX d1_null_idx assumeNotNull(d1_null) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

SELECT * FROM data_01515;
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- 查询将产生 CANNOT_PARSE_TEXT 错误。
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- 查询将产生 INDEX_NOT_USED 错误。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- 正常。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- 正常(完整解析器示例)。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- 查询将产生 INDEX_NOT_USED 错误,因为 d1_null_idx 未被使用。
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- 正常。
```


## force_grouping_standard_compatibility \{#force_grouping_standard_compatibility\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "使 GROUPING 函数的输出与 SQL 标准和其他 DBMS 一致"}]}]}/>

使 GROUPING 函数在参数未作为聚合键使用时返回 1

## force_index_by_date \{#force_index_by_date\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果无法按日期键使用索引，则禁止执行查询。

适用于 MergeTree 系列表。

如果设置 `force_index_by_date=1`，ClickHouse 会检查查询中是否包含可用于限制数据范围的日期键条件。如果没有合适的条件，就会抛出异常。不过，它不会检查该条件是否真正减少了需要读取的数据量。例如，即使条件 `Date != ' 2000-01-01 '` 匹配表中的所有数据（即执行查询需要全表扫描），该条件也是可接受的。关于 MergeTree 表中数据范围的更多信息，参见 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)。

## force_optimize_projection \{#force_optimize_projection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当启用了投影优化（参见 [optimize_use_projections](#optimize_use_projections) 设置）时，用于开启或关闭在 `SELECT` 查询中强制使用[投影](../../engines/table-engines/mergetree-family/mergetree.md/#projections)的行为。

可能的取值：

- 0 — 投影优化不是强制的。
- 1 — 投影优化是强制的。

## force_optimize_projection_name \{#force_optimize_projection_name\} 

如果将其设置为非空字符串，则会检查在查询中是否至少使用过一次该投影。

可能的取值：

- string：在查询中使用的投影名称

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在启用 [optimize_skip_unused_shards](#optimize_skip_unused_shards) 且无法跳过未使用的分片时，控制是否允许执行查询。如果无法跳过未使用的分片且该设置已启用，则会抛出异常。

可能的取值：

- 0 — 禁用。ClickHouse 不会抛出异常。
- 1 — 启用。仅当表具有分片键时才会禁止执行查询。
- 2 — 启用。无论表是否定义了分片键，都会禁止执行查询。

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

根据分布式查询的嵌套层级控制 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) 的行为（因此仍需启用 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)），例如存在一个 `Distributed` 表再查询另一个 `Distributed` 表的场景。

Possible values:

- 0 - 关闭按嵌套层级控制，此时 `force_optimize_skip_unused_shards` 始终生效。
- 1 — 仅在第一层启用 `force_optimize_skip_unused_shards`。
- 2 — 在最多两层嵌套中启用 `force_optimize_skip_unused_shards`。

## force_primary_key \{#force_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果无法使用主键索引，则禁止执行查询。

适用于 MergeTree 系列的表。

当 `force_primary_key=1` 时，ClickHouse 会检查查询中是否包含可用于限制数据范围的主键条件。如果不存在合适的条件，则抛出异常。不过，它不会检查该条件是否实际减少了需要读取的数据量。关于 MergeTree 表中的数据范围的更多信息，请参阅 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)。

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在执行 DROP 查询时递归删除数据。可避免出现“Directory not empty”错误，但可能会静默删除已分离的数据

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "改进了与 MySQL DATE_FORMAT/STR_TO_DATE 的兼容性"}]}]}/>

函数 `formatDateTime` 中的格式说明符 `%e` 在输出一位数的日期时会添加前导空格，例如输出 `' 2'` 而不是 `'2'`。

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置。"}]}]}/>

函数 `formatDateTime` 中的格式化占位符 `%f` 对于 `DateTime64` 类型，仅按其小数精度打印相应位数的数字，而不是固定打印 6 位数字。

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Improved compatibility with MySQL DATE_FORMAT()/STR_TO_DATE()"}]}]}/>

当格式化后的值不包含小数秒时，函数 `formatDateTime` 中的格式说明符 `%f` 会输出单个零，而不是六个零。

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在函数 `formatDateTime` 中，格式说明符 `%c`、`%l` 和 `%k` 会以不带前导零的形式输出月份和小时。

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

在 `formatDateTime` 和 `parseDateTime` 函数中，格式化符 `%M` 用于输出和解析月份名称，而不是表示分钟。

## fsync_metadata \{#fsync_metadata\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在写入 `.sql` 文件时使用 [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html)。默认启用。

如果服务器上存在数以百万计的小表，并且这些表在不断地被创建和销毁，那么在这种情况下禁用该设置是合理的。

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "添加新设置以保留 `dateTrunc` 函数的旧行为"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "将 `dateTrunc` 函数在参数为 `DateTime64/Date32` 时的结果类型更改为 `DateTime64/Date32`，无论时间单位为何，以便对负值获得正确结果"}]}]}/>

用于控制 `dateTrunc` 函数结果类型的行为。

可选值：

- 0 - 当第二个参数为 `DateTime64/Date32` 时，返回类型为 `DateTime64/Date32`，与第一个参数中的时间单位无关。
- 1 - 对于 `Date32`，结果始终为 `Date`。对于 `DateTime64`，当时间单位为 `second` 及更大时间粒度时，结果为 `DateTime`。

## function_implementation \{#function_implementation\} 

为特定目标或变体选择函数实现（实验性）。如果留空，则启用所有实现。

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否允许 `json_value` 函数返回复杂类型（例如 struct、array、map）。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

查询返回 1 行。用时：0.001 秒。
```

可能的取值：

* true — 允许。
* false — 禁止。


## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

控制在 JSON&#95;VALUE 函数要访问的值不存在时，是否允许返回 `NULL`。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 行结果。用时：0.001 秒。
```

可能的取值：

* true — 允许。
* false — 不允许。


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "提升与 MySQL `locate` 函数的兼容性。"}]}]}/>

控制函数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) 的参数顺序。

可能的取值：

- 0 — 函数 `locate` 接受参数 `(haystack, needle[, start_pos])`。
- 1 — 函数 `locate` 接受参数 `(needle, haystack, [, start_pos])`（与 MySQL 行为兼容）。

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

为函数 [range](/sql-reference/functions/array-functions#range) 生成的数据量设置安全阈值。定义该函数在每个数据块中可生成的最大元素数量（即一个数据块中每一行数组大小的总和）。

可能的取值：

- 正整数。

**另请参阅**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "在之前的版本中，最长 3 秒的休眠时间仅应用于 `sleep`，而不适用于 `sleepEachRow` 函数。在新版本中，我们引入了该设置。如果设置为与之前版本兼容，则会完全取消该限制。"}]}]}/>

函数 `sleep` 针对每个数据块允许的最大休眠时间，单位为微秒。如果用户传入了更大的值，将会抛出异常。该设置用于控制安全阈值。

## function_visible_width_behavior \{#function_visible_width_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "我们将 `visibleWidth` 的默认行为调整得更加精确"}]}]}/>

`visibleWidth` 行为的版本。0 — 只统计码点数量；1 — 正确统计零宽字符和组合字符，将全角字符计为两个，估算制表符的宽度，并统计删除字符。

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "提高默认精度。"}]}]}/>

如果传递给 `geoDistance`、`greatCircleDistance`、`greatCircleAngle` 函数的四个参数均为 Float64，则返回 Float64，并在内部计算中使用双精度浮点。在此前的 ClickHouse 版本中，这些函数始终返回 Float32。

## geotoh3_argument_order \{#geotoh3_argument_order\} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "用于保持旧版行为的新设置，用于指定 lon 和 lat 参数的顺序"}]}]}/>

函数 `geoToH3` 在设置为 `lon_lat` 时接受参数顺序为 (lon, lat)，在设置为 `lat_lon` 时接受参数顺序为 (lat, lon)。

## glob_expansion_max_elements \{#glob_expansion_max_elements\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

最大允许的地址数量（适用于外部存储、表函数等）。

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

grace 哈希连接的初始桶数量

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Grace 哈希连接的桶数量上限

## group_by_overflow_mode \{#group_by_overflow_mode\} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

设置在用于聚合的唯一键的数量超过限制时会发生什么：

- `throw`: 抛出异常
- `break`: 停止执行查询并返回部分结果
- `any`: 继续对已进入集合的键进行聚合，但不再向集合中添加新的键。

使用 `any` 值可以近似地执行 GROUP BY 操作。该近似的质量取决于数据的统计特性。

## group_by_two_level_threshold \{#group_by_two_level_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

从达到多少个键开始使用两级聚合。0 表示不设置阈值。

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

当聚合状态的大小（以字节为单位）达到多少时，开始使用两级聚合。0 表示未设置阈值。当至少有一个阈值被触发时，将使用两级聚合。

## group_by_use_nulls \{#group_by_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

更改 [GROUP BY 子句](/sql-reference/statements/select/group-by) 处理聚合键类型的方式。
当使用 `ROLLUP`、`CUBE` 或 `GROUPING SETS` 修饰符时，某些聚合键在生成部分结果行时可能不会被使用。
对于这些键，对应行中的列会根据此设置填充为默认值或 `NULL`。

可能的取值：

- 0 — 使用聚合键类型的默认值来填充缺失的值。
- 1 — ClickHouse 按照 SQL 标准的方式执行 `GROUP BY`。聚合键的类型会被转换为 [Nullable](/sql-reference/data-types/nullable)。对于未使用该聚合键的行，对应聚合键的列会被填充为 [NULL](/sql-reference/syntax#null)。

另请参阅：

- [GROUP BY 子句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "一个新设置"}]}]}/>

函数 `h3ToGeo` 在为 true 时返回 (lon, lat)，否则返回 (lat, lon)。

## handshake_timeout_ms \{#handshake_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

用于在握手期间等待从副本接收 Hello 数据包的超时时间（毫秒）。

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在每次向 HDFS 引擎表执行插入操作时创建新文件。若启用，每次插入都会创建一个新的 HDFS 文件，其名称遵循类似以下模式：

初始：`data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` 等。

可能的取值：

- 0 — `INSERT` 查询会将新数据追加到文件末尾。
- 1 — `INSERT` 查询会创建一个新文件。

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在请求的文件不存在时返回 0 行，而不是由 HDFS 表引擎抛出异常"}]}]}/>

在按某些键读取时，如果文件不存在则忽略其缺失。

可能的取值：

- 1 — `SELECT` 返回空结果集。
- 0 — `SELECT` 抛出异常。

## hdfs_replication \{#hdfs_replication\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

创建 HDFS 文件时，可以指定实际的副本数。

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [HDFS](../../engines/table-engines/integrations/hdfs.md) 引擎表中跳过空文件的功能。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在 HDFS 引擎中，当 ListObjects 请求未匹配到任何文件时抛出错误，而不是返回空的查询结果"}]}]}/>

根据通配符展开规则，如果未匹配到任何文件，则抛出错误。

可能的取值：

- 1 — `SELECT` 抛出异常。
- 0 — `SELECT` 返回空结果。

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在向 hdfs 引擎表插入数据前对文件进行截断操作。若禁用，则在尝试插入且 HDFS 中文件已存在时会抛出异常。

可能的取值：

- 0 — `INSERT` 查询会将新数据追加到文件末尾。
- 1 — `INSERT` 查询会用新数据替换文件的现有内容。

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "在 Hedged 请求中在 50 ms 后而不是 100 ms 后启动新连接，以与之前的连接超时保持一致"}]}]}/>

Hedged 请求与副本建立连接的超时时间

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新增设置。此前该值可在 CREATE INDEX 中选择性指定，默认值为 64。"}]}]}/>

在搜索向量相似度索引时使用的动态候选列表大小，也称为 `ef_search`。

## hsts_max_age \{#hsts_max_age\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS 的有效期。0 表示禁用 HSTS。

## http_connection_timeout \{#http_connection_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 连接超时时间（单位：秒）。

可能的取值：

- 任意正整数。
- 0 - 表示禁用（无超时限制）。

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

不要以小于指定时间间隔的频率发送 HTTP 头 X-ClickHouse-Progress。

## http_make_head_request \{#http_make_head_request\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 设置允许在通过 HTTP 读取数据时执行一次 `HEAD` 请求，用于获取将要读取的文件信息，例如其大小。由于该设置默认启用，当服务器不支持 `HEAD` 请求时，可能需要禁用此设置。

## http_max_field_name_size \{#http_max_field_name_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 头字段名的最大长度

## http_max_field_value_size \{#http_max_field_value_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 头中字段值的最大长度

## http_max_fields \{#http_max_fields\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP 头部中允许的最大字段数量

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`multipart/form-data` 内容大小的上限。此设置无法从 URL 参数中解析，必须在用户配置文件中进行设置。请注意，在查询执行开始之前，请求内容会被解析，并在内存中创建外部表。而这是在该阶段唯一生效的限制（在读取 HTTP 表单数据时，`max_memory_usage` 和 `max_execution_time` 等限制不会生效）。

## http_max_request_param_data_size \{#http_max_request_param_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

预定义 HTTP 请求中用于查询参数的请求数据大小限制。

## http_max_tries \{#http_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

通过 HTTP 读取时的最大重试次数。

## http_max_uri_size \{#http_max_uri_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

设置 HTTP 请求 URI 的最大长度。

可能的取值：

- 正整数。

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在解压来自客户端的 HTTP POST 数据时进行校验和验证。仅用于 ClickHouse 原生压缩格式（不适用于 `gzip` 或 `deflate`）。

更多信息，请参阅 [HTTP 接口说明](../../interfaces/http.md)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## http_receive_timeout \{#http_receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "See http_send_timeout."}]}]}/>

HTTP 接收超时时间（秒）。

可能的取值：

- 任意正整数。
- 0 - 禁用（无超时限制）。

## http_response_buffer_size \{#http_response_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在向客户端发送 HTTP 响应或将数据刷新到磁盘之前（当启用了 `http_wait_end_of_query` 时），服务器在内存中缓冲的字节数。

## http_response_headers \{#http_response_headers\} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "新设置。"}]}]}/>

允许添加或覆盖服务器在成功返回查询结果时响应中包含的 HTTP 头部。
这仅影响 HTTP 接口。

如果该头部已经由默认值设置，则提供的值会覆盖它。
如果该头部没有由默认值设置，则会被添加到头部列表中。
由服务器默认设置且未被此设置覆盖的头部将保持不变。

该设置允许你将某个头部设置为常量值。目前无法将头部设置为动态计算的值。

头名称或头值均不得包含 ASCII 控制字符。

如果你实现了一个 UI 应用程序，既允许用户修改设置，又会基于返回的头部作出决策，建议将此设置限制为只读。

示例：`SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

通过 HTTP 重试读取时的退避的最小毫秒数

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

通过 HTTP 进行读取重试时的最大退避时间（毫秒）

## http_send_timeout \{#http_send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 分钟看起来长得离谱。请注意，这是单次网络写调用的超时时间，而不是整个上传操作的超时时间。"}]}]}/>

HTTP 发送超时时间（单位：秒）。

可选值：

- 任意正整数。
- 0 - 禁用（无限超时）。

:::note
仅适用于默认 profile。要使更改生效，需要重启服务器。
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

跳过对返回 HTTP_NOT_FOUND 错误的通配符（glob）URL 的处理

## http_wait_end_of_query \{#http_wait_end_of_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在服务器端启用 HTTP 响应缓冲。

## http_write_exception_in_output_format \{#http_write_exception_in_output_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "为在不同格式之间保持一致性而进行了修改"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "在 HTTP 流式传输中发生异常时输出有效的 JSON/XML。"}]}]}/>

将异常按输出格式写出以生成有效输出。适用于 JSON 和 XML 格式。

## http_zlib_compression_level \{#http_zlib_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="3" />

当 [enable_http_compression = 1](#enable_http_compression) 时，设置 HTTP 请求响应中的数据压缩级别。

可选值：1 到 9 的数字。

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

是否在执行 DROP 操作时删除所有 Iceberg 文件。

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

插入操作时生成的 Iceberg Parquet 数据文件的最大大小（字节）。

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg 表引擎中每次插入操作允许的最大分区数。

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新设置。"}]}]}/>

在插入操作期间，每个 Iceberg Parquet 数据文件允许的最大行数。

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "New setting"}]}]}/>

用于压缩 `.metadata.json` 文件的方式。

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

控制 Iceberg 表写入到 system.iceberg_metadata_log 的元数据日志级别。
通常仅在调试时才会修改该设置。

可能的取值：

- none - 不记录元数据日志。
- metadata - 根 metadata.json 文件。
- manifest_list_metadata - 上述所有内容 + 与某个快照对应的 avro manifest list 中的元数据。
- manifest_list_entry - 上述所有内容 + avro manifest list 条目。
- manifest_file_metadata - 上述所有内容 + 遍历到的 avro manifest 文件中的元数据。
- manifest_file_entry - 上述所有内容 + 遍历到的 avro manifest 文件条目。

## iceberg_snapshot_id \{#iceberg_snapshot_id\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting."}]}]}/>

使用指定的快照 ID 查询 Iceberg 表。

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置。"}]}]}/>

使用在指定时间戳时生效的快照来查询 Iceberg 表。

## idle_connection_timeout \{#idle_connection_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

在连接空闲达到指定秒数后关闭 TCP 连接的超时时间。

可能的值：

- 正整数（0 表示在 0 秒后立即关闭）。

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

仅在 ClickHouse Cloud 中生效。将新的数据 part 从 SELECT 查询中排除，直到它们被预热（参见 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)）或其存在时间达到指定的秒数。仅对 Replicated-/SharedMergeTree 有效。

## ignore&#95;data&#95;skipping&#95;indices

如果查询会使用这些索引，则忽略指定的数据跳过索引。

来看以下示例：

```sql
CREATE TABLE data
(
    key Int,
    x Int,
    y Int,
    INDEX x_idx x TYPE minmax GRANULARITY 1,
    INDEX y_idx y TYPE minmax GRANULARITY 1,
    INDEX xy_idx (x,y) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

INSERT INTO data VALUES (1, 2, 3);

SELECT * FROM data;
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- 查询将产生 CANNOT_PARSE_TEXT 错误。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- 正常。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- 正常。

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- 查询将产生 INDEX_NOT_USED 错误,因为 xy_idx 已被明确忽略。
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

未忽略任何索引的查询：

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

表达式 ((投影 + ORDER BY 之前))
  过滤 (WHERE)
    从 MergeTree 读取 (default.data)
    索引：
      主键
        条件：true
        数据部分：1/1
        颗粒：1/1
      跳数索引
        名称：x_idx
        描述：minmax GRANULARITY 1
        数据部分：0/1
        颗粒：0/1
      跳数索引
        名称：y_idx
        描述：minmax GRANULARITY 1
        数据部分：0/0
        颗粒：0/0
      跳数索引
        名称：xy_idx
        描述：minmax GRANULARITY 1
        数据部分：0/0
        颗粒：0/0
```

忽略 `xy_idx` 索引：

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';

表达式 ((投影 + ORDER BY 之前))
  过滤器 (WHERE)
    ReadFromMergeTree (default.data)
    索引:
      主键
        条件: true
        Parts: 1/1
        Granules: 1/1
      跳过
        名称: x_idx
        描述: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      跳过
        名称: y_idx
        描述: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

适用于 MergeTree 系列的表。


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "允许服务器按指定概率忽略 DROP 查询，用于测试"}]}]}/>

如果启用，服务器会按指定概率忽略所有 DROP 表语句（对于 Memory 和 JOIN 引擎，会将 DROP 替换为 TRUNCATE）。仅用于测试目的。

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "新增设置，用于在目标表被删除时忽略物化视图"}]}]}/>

在向视图推送数据时，忽略其目标表已被删除的物化视图

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在管理 replicated access entities 的查询中忽略 ON CLUSTER 子句。

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "在针对复制 named collections 的管理查询中忽略 ON CLUSTER 子句。"}]}]}/>

在针对复制 named collections 的管理查询中忽略 ON CLUSTER 子句。

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在针对复制 UDF 的管理查询中忽略 ON CLUSTER 子句。

## implicit_select \{#implicit_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

允许在不写开头 `SELECT` 关键字的情况下编写简单的 SELECT 查询，从而支持类似计算器的用法，例如 `1 + 2` 会成为一个合法的查询。

在 `clickhouse-local` 中，此设置默认启用，并且可以显式禁用。

## implicit_table_at_top_level \{#implicit_table_at_top_level\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "A new setting, used in clickhouse-local"}]}]}/>

如果该设置非空，则在顶层未指定 FROM 子句的查询将从此表读取数据，而不是从 system.one 读取。

该设置在 clickhouse-local 中用于输入数据处理。
该设置可以由用户显式配置，但并非面向这种使用场景。

子查询不受此设置影响（无论是标量子查询、FROM 子查询还是 IN 子查询）。
UNION、INTERSECT、EXCEPT 链中顶层的 SELECT 将被统一处理并受此设置影响，而不考虑它们在括号中的分组方式。
该设置如何影响视图和分布式查询尚无规定。

该设置接受一个表名（此时表将从当前数据库中解析），或者形如 'database.table' 的限定名称。
database 和 table 名称都必须是不带引号的——只允许简单标识符。

## implicit_transaction \{#implicit_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用且当前不在事务中，则会将查询包装在一个完整事务中（BEGIN + COMMIT 或 ROLLBACK）执行。

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用，该设置会向缺少 ORDER BY 子句的 SELECT 查询中注入 `ORDER BY rand()`。
仅对子查询深度为 0 的查询生效。嵌套子查询以及 `INSERT INTO ... SELECT` 语句不受影响。
如果顶层结构是 `UNION`，则会分别向所有子项注入 `ORDER BY rand()`。
仅适用于测试和开发（缺少 ORDER BY 会导致查询结果具有不确定性）。

## input_format_parallel_parsing \{#input_format_parallel_parsing\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对数据格式进行保序并行解析。仅支持 [TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV) 和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用了该设置，则允许在 INSERT 语句中使用物化列。

## insert_deduplicate \{#insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对 `INSERT` 的数据块去重（适用于 Replicated\* 表）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

默认情况下，通过 `INSERT` 语句插入到 Replicated 表中的数据块会进行去重（参见 [Data Replication](../../engines/table-engines/mergetree-family/replication.md)）。
对于 Replicated 表，默认仅对每个分区最近的 100 个数据块进行去重（参见 [replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)）。
对于非 Replicated 表，请参见 [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window)。

## insert&#95;deduplication&#95;token

该设置允许用户在 MergeTree/ReplicatedMergeTree 中提供自定义去重语义。
例如，通过在每条 INSERT 语句中为该设置提供唯一值，
用户可以避免内容相同的插入数据被视为重复并被去重。

可能的取值：

* 任意字符串

仅当 `insert_deduplication_token` 非空时，才会参与去重。

对于复制表，默认情况下，每个分区仅对最近的 100 次 INSERT 进行去重（参见 [replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)）。
对于非复制表，参见 [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window)。

:::note
`insert_deduplication_token` 在分区级别生效（与 `insert_deduplication` 的校验和机制相同）。多个分区可以拥有相同的 `insert_deduplication_token`。
:::

示例：

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- 下一次插入不会去重,因为 insert_deduplication_token 不同
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- 下一次插入会去重,因为 insert_deduplication_token
-- 与之前的某次相同
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (2);

SELECT * FROM test_table

┌─A─┐
│ 1 │
└───┘
┌─A─┐
│ 1 │
└───┘
```


## insert_keeper_fault_injection_probability \{#insert_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

在插入操作期间，keeper 请求发生故障的大致概率。有效取值范围为区间 [0.0f, 1.0f]

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 使用随机种子，否则使用该设置值

## insert&#95;keeper&#95;max&#95;retries

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "Enable reconnections to Keeper on INSERT, improve reliability"}]}]} />

该设置定义在向 replicated MergeTree 表执行 INSERT 时，针对 ClickHouse Keeper（或 ZooKeeper）请求的最大重试次数。仅因网络错误、Keeper 会话超时或请求超时而失败的 Keeper 请求才会进行重试。

可能的取值：

* 正整数。
* 0 — 禁用重试。

Cloud 中的默认值：`20`。

Keeper 请求的重试会在一定的延迟后进行。该延迟由以下设置控制：`insert_keeper_retry_initial_backoff_ms`、`insert_keeper_retry_max_backoff_ms`。
第一次重试会在 `insert_keeper_retry_initial_backoff_ms` 指定的延迟时间后进行。后续的延迟时间将按如下方式计算：

```
超时时间 = min(insert_keeper_retry_max_backoff_ms, 上次超时时间 * 2)
```

例如，如果 `insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000` 且 `insert_keeper_max_retries=8`，则超时时间将为 `100, 200, 400, 800, 1600, 3200, 6400, 10000`。

除了容错性之外，重试机制还旨在提供更好的用户体验——例如，当 Keeper 因升级而重启时，它可以避免在执行 INSERT 语句时返回错误。


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

在执行 INSERT 查询期间，重试失败的 Keeper 请求时使用的初始等待时间（毫秒）

可能的值：

- 正整数。
- 0 — 无超时

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

在执行 INSERT 查询时，重试失败 Keeper 请求的最大超时时间（毫秒）。

可能的取值：

- 正整数。
- 0 — 不限制最大超时时间

## insert_null_as_default \{#insert_null_as_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在向非 [Nullable](/sql-reference/data-types/nullable) 数据类型的列中插入数据时，用[默认值](/sql-reference/statements/create/table#default_values)替代 [NULL](/sql-reference/syntax#null)。
如果列类型为非 Nullable 且该设置被禁用，则插入 `NULL` 会导致异常。如果列类型为 Nullable，则无论该设置的取值如何，`NULL` 值都会按原样插入。

此设置适用于 [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 查询。请注意，`SELECT` 子查询可以通过 `UNION ALL` 子句进行拼接。

可能的取值：

- 0 — 向非 Nullable 列插入 `NULL` 会导致异常。
- 1 — 插入列的默认值而不是 `NULL`。

## insert_quorum \{#insert_quorum\} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
此设置不适用于 SharedMergeTree，更多信息请参阅 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)。
:::

启用仲裁写入（quorum writes）功能。

- 如果 `insert_quorum < 2`，则禁用仲裁写入。
- 如果 `insert_quorum >= 2`，则启用仲裁写入。
- 如果 `insert_quorum = 'auto'`，则使用多数副本数（`number_of_replicas / 2 + 1`）作为仲裁数。

仲裁写入

只有当 ClickHouse 在 `insert_quorum_timeout` 期间成功将数据正确写入达到 `insert_quorum` 个副本时，`INSERT` 才会被视为成功。如果由于任何原因，写入成功的副本数量未达到 `insert_quorum`，则写入将被视为失败，ClickHouse 会从所有已写入数据的副本中删除已插入的数据块。

当 `insert_quorum_parallel` 被禁用时，仲裁中的所有副本是一致的，即它们都包含之前所有 `INSERT` 查询写入的数据（`INSERT` 序列被线性化）。在读取通过 `insert_quorum` 写入的数据且 `insert_quorum_parallel` 被禁用时，可以通过 [select_sequential_consistency](#select_sequential_consistency) 为 `SELECT` 查询开启顺序一致性。

ClickHouse 在以下情况下抛出异常：

- 在执行查询时，可用副本数量小于 `insert_quorum`。
- 当 `insert_quorum_parallel` 被禁用且在前一个数据块尚未插入到副本的 `insert_quorum` 中之前就尝试写入数据时。如果用户在带有 `insert_quorum` 的前一个 `INSERT` 完成之前，对同一张表再次执行另一个 `INSERT` 查询，就可能出现这种情况。

另请参阅：

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "默认使用并行 quorum 插入。相比顺序 quorum 插入，它要方便得多"}]}]}/>

:::note
此设置不适用于 SharedMergeTree，更多信息请参阅 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)。
:::

启用或禁用 quorum `INSERT` 查询的并行执行模式。启用时，即使先前的查询尚未完成，仍可发送额外的 `INSERT` 查询。禁用时，对同一张表的额外写入请求将会被拒绝。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

以毫秒为单位设置写入仲裁的超时时间。如果超时时间已过且仍未发生写入，ClickHouse 会抛出异常，客户端必须重试相同的查询，以将同一数据块写入同一副本或任意其他副本。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert&#95;shard&#95;id

<SettingsInfoBlock type="UInt64" default_value="0" />

如果不为 `0`，则指定要将数据同步插入到的 [Distributed](/engines/table-engines/special/distributed) 表分片。

如果 `insert_shard_id` 的值不正确，服务器会抛出异常。

要获取 `requested_cluster` 上的分片数量，可以检查服务器配置或使用如下查询：

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

可能的取值：

* 0 — 禁用。
* 从 `1` 到对应 [Distributed](/engines/table-engines/special/distributed) 表的 `shards_num` 之间的任意整数。

**示例**

查询：

```sql
CREATE TABLE x AS system.numbers ENGINE = MergeTree ORDER BY number;
CREATE TABLE x_dist AS x ENGINE = Distributed('test_cluster_two_shards_localhost', currentDatabase(), x);
INSERT INTO x_dist SELECT * FROM numbers(5) SETTINGS insert_shard_id = 1;
SELECT * FROM x_dist ORDER BY number ASC;
```

结果：

```text
┌─number─┐
│      0 │
│      0 │
│      1 │
│      1 │
│      2 │
│      2 │
│      3 │
│      3 │
│      4 │
│      4 │
└────────┘
```


## interactive_delay \{#interactive_delay\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

以微秒为单位的时间间隔，用于检查请求执行是否已被取消并发送进度信息。

## intersect_default_mode \{#intersect_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

在 INTERSECT 查询中设置默认模式。可用取值：空字符串、'ALL'、'DISTINCT'。如果为空，则未显式指定模式的查询将抛出异常。

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

在 trace 日志中收集 jemalloc 内存分配和释放操作的样本。

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

为查询启用 jemalloc 分析器。jemalloc 将对内存分配进行采样，并对被采样分配的所有释放操作进行采样。
可以使用 SYSTEM JEMALLOC FLUSH PROFILE 刷新分析数据，用于内存分配分析。
采样数据也可以通过配置项 jemalloc_collect_global_profile_samples_in_trace_log 或查询设置 jemalloc_collect_profile_samples_in_trace_log 存储到 system.trace_log 中。
参见 [Allocation Profiling](/operations/allocation-profiling)

## join_algorithm \{#join_algorithm\} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' 被弃用，推荐显式指定 join 算法，同时 parallel_hash 现在优先于 hash"}]}]}/>

指定使用哪种 [JOIN](../../sql-reference/statements/select/join.md) 算法。

可以指定多种算法，针对具体查询，会根据 JOIN 的类型/严格性以及表引擎选择其中一种可用的算法。

可选值：

- grace_hash

使用 [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join)。Grace hash 提供了一种在限制内存使用的同时，支持高性能复杂 JOIN 的算法选项。

Grace join 的第一阶段会读取右表，并根据键列的哈希值将其划分为 N 个桶（初始 N 为 `grace_hash_join_initial_buckets`）。划分方式保证每个桶都可以独立处理。来自第一个桶的行被加入内存哈希表，而其他桶的数据会被写入磁盘。如果哈希表大小超过内存限制（例如由 [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) 设置），则会增加桶的数量并重新为每一行分配桶。任何不属于当前桶的行都会被写入磁盘并重新分配到对应的桶。

支持 `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`。

- hash

使用 [哈希 JOIN 算法](https://en.wikipedia.org/wiki/Hash_join)。这是最通用的实现，支持所有 JOIN 类型和严格性组合，以及在 `JOIN ON` 子句中用 `OR` 连接的多个 JOIN 键。

使用 `hash` 算法时，`JOIN` 的右表部分会被加载到内存（RAM）中。

- parallel_hash

`hash` JOIN 的一种变体，将数据拆分成多个桶并并行构建多个哈希表，而不是单个哈希表，以加速该过程。

使用 `parallel_hash` 算法时，`JOIN` 的右表部分会被加载到内存（RAM）中。

- partial_merge

[排序合并算法](https://en.wikipedia.org/wiki/Sort-merge_join) 的一种变体，其中仅右表会被完全排序。

`RIGHT JOIN` 和 `FULL JOIN` 只在 `ALL` 严格性下受支持（不支持 `SEMI`、`ANTI`、`ANY` 和 `ASOF`）。

使用 `partial_merge` 算法时，ClickHouse 会对数据进行排序并将其写入磁盘。ClickHouse 中的 `partial_merge` 算法与经典实现略有不同。首先，ClickHouse 按 JOIN 键分块对右表排序，并为已排序的块创建 min-max 索引。然后，它按 `join key` 对左表的部分进行排序，并将其与右表进行 JOIN。min-max 索引还会用于跳过不需要的右表块。

- direct

当右表的存储引擎支持键值查询时，可以使用此算法。

`direct` 算法会使用左表的行作为键，在右表中执行查找。它仅由诸如 [Dictionary](/engines/table-engines/special/dictionary) 或 [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) 之类的特殊存储支持，并且只支持 `LEFT` 和 `INNER` JOIN。

- auto

当设置为 `auto` 时，会优先尝试使用 `hash` JOIN，如果违反内存限制，则在运行时切换到其他算法。

- full_sorting_merge

在 JOIN 之前对参与 JOIN 的表进行完全排序的 [排序合并算法](https://en.wikipedia.org/wiki/Sort-merge_join)。

- prefer_partial_merge

ClickHouse 会在可能的情况下始终尝试使用 `partial_merge` JOIN，否则使用 `hash`。*已弃用*，等价于 `partial_merge,hash`。

- default (deprecated)

历史遗留值，请不要再使用。
等价于 `direct,hash`，即按顺序尝试使用 direct join 和 hash join。

## join_any_take_last_row \{#join_any_take_last_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

更改在使用 `ANY` 严格模式时 `JOIN` 操作的行为。

:::note
此设置仅适用于使用 [Join](../../engines/table-engines/special/join.md) 引擎的表上的 `JOIN` 操作。
:::

可能的取值：

- 0 — 如果右表存在多行匹配，仅关联找到的第一行。
- 1 — 如果右表存在多行匹配，仅关联找到的最后一行。

另请参阅：

- [JOIN 子句](/sql-reference/statements/select/join)
- [Join 表引擎](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

为 [JOIN 子句](/sql-reference/statements/select/join) 设置默认严格性。

可能的取值：

- `ALL` — 如果右表存在多行匹配记录，ClickHouse 会从这些匹配行创建一个[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)。这是标准 SQL 中 `JOIN` 的常规行为。
- `ANY` — 如果右表存在多行匹配记录，只连接找到的第一行。如果右表只有一行匹配记录，则 `ANY` 和 `ALL` 的结果相同。
- `ASOF` — 用于在匹配关系不确定的情况下连接序列。
- `Empty string` — 如果在查询中未指定 `ALL` 或 `ANY`，ClickHouse 会抛出异常。

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\} 

<SettingsInfoBlock type="UInt64" default_value="64" />

限制在磁盘上执行的 MergeJoin 操作中，并行排序时允许参与的文件数量上限。

该设置值越大，占用的 RAM 越多，所需的磁盘 I/O 越少。

可能的取值：

- 从 2 开始的任意正整数。

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "右表中每个键的平均行数下限，用于确定在哈希 JOIN 中是否按行列表输出。"}]}]}/>

右表中每个键的平均行数下限，用于确定在哈希 JOIN 中是否按行列表输出。

## join_overflow_mode \{#join_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

定义当达到以下任一 JOIN 限制时，ClickHouse 执行的操作：

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

可选值：

- `THROW` — ClickHouse 抛出异常并中断操作。
- `BREAK` — ClickHouse 中断操作但不抛出异常。

默认值：`THROW`。

**另请参阅**

- [JOIN 子句](/sql-reference/statements/select/join)
- [Join 表引擎](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

用于 JOIN 运行时过滤器的 Bloom 过滤器的字节大小（参见 `enable_join_runtime_filters` 设置）。

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

用作 JOIN 运行时过滤器的 Bloom 过滤器中使用的哈希函数个数（参见 `enable_join_runtime_filters` 设置）。

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

运行时过滤器中按原样存储在集合中的元素最大数量。当超过此阈值时，将改用 Bloom 过滤器。

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "用于决定在 left join 或 inner join 中是否需要按键对右表重新排序的右表最大行数"}]}]}/>

用于决定在 left join 或 inner join 中是否需要按键对右表重新排序的右表最大行数。

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "用于确定在 LEFT 或 INNER JOIN 中，是否需要按键对右表重新排序时，右表中每个键的平均行数下限值。该设置可确保不会对键分布稀疏的表应用此优化"}]}]}/>

用于确定在 LEFT 或 INNER JOIN 中，是否需要按键对右表重新排序时，右表中每个键的平均行数下限值。该设置可确保不会对键分布稀疏的表应用此优化

## join_use_nulls \{#join_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

设置 [JOIN](../../sql-reference/statements/select/join.md) 的行为方式。在对表进行合并操作时，可能会出现空单元格。ClickHouse 会根据此设置以不同方式填充这些单元格。

可能的取值：

- 0 — 使用对应字段类型的默认值填充空单元格。
- 1 — `JOIN` 的行为与标准 SQL 中相同。对应字段的类型被转换为 [Nullable](/sql-reference/data-types/nullable)，并使用 [NULL](/sql-reference/syntax) 填充空单元格。

## joined_block_split_single_row \{#joined_block_split_single_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

允许按左表的单行粒度对哈希连接结果进行分块。
在左表存在某一行在右表有大量匹配的情况下，这可以减少内存使用，但可能会增加 CPU 使用。
注意，`max_joined_block_size_rows != 0` 是使此设置生效的前提条件。
将 `max_joined_block_size_bytes` 与此设置组合使用，有助于在数据倾斜、某些大行在右表中有许多匹配的情况下避免过度的内存占用。

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\} 

<SettingsInfoBlock type="Bool" default_value="1" />

强制为参与 JOIN 的子查询和表函数指定别名，以确保名称限定的正确性。

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\} 

<SettingsInfoBlock type="Bool" default_value="0" />

禁用依赖可用 CPU 核心数的 `kafka_num_consumers` 限制。

## kafka_max_wait_ms \{#kafka_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

在重试之前，从 [Kafka](/engines/table-engines/integrations/kafka) 读取消息的等待时间（以毫秒为单位）。

可能的取值：

- 正整数。
- 0 — 无限等待（无超时）。

另请参阅：

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在 KeeperMap 上执行操作时强制进行额外检查。例如，当插入已存在的键时抛出异常。

## keeper_max_retries \{#keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "常规 Keeper 操作的最大重试次数"}]}]}/>

常规 Keeper 操作的最大重试次数

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "通用 keeper 操作的初始退避等待时间"}]}]}/>

通用 keeper 操作的初始退避等待时间

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "常规 Keeper 操作的最大退避超时时间"}]}]}/>

常规 Keeper 操作的最大退避超时时间

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，如果参数中存在 NULL，函数 `least` 和 `greatest` 将返回 NULL。

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "仅出于兼容性原因添加此设置。在将集群从低于 21.7 的版本滚动升级到更高版本时，将其设置为 'true' 是有意义的。"}]}]}/>

在列名中列出大型元组字面量中各元素的名称，而不是使用哈希。此设置仅为兼容性目的而存在。在将集群从低于 21.7 的版本滚动升级到更高版本时，将其设置为 'true' 是有意义的。

## lightweight_delete_mode \{#lightweight_delete_mode\} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

作为轻量级删除的一部分所执行的内部更新查询模式。

可能的取值：

- `alter_update` - 运行 `ALTER UPDATE` 查询，会创建重量级 mutation。
- `lightweight_update` - 尽可能运行轻量级更新，否则运行 `ALTER UPDATE`。
- `lightweight_update_force` - 尽可能运行轻量级更新，否则抛出异常。

## lightweight_deletes_sync \{#lightweight_deletes_sync\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "与 'mutation_sync' 相同，但仅控制轻量级删除的执行"}]}]}/>

与 [`mutations_sync`](#mutations_sync) 相同，但仅控制轻量级删除的执行。

可能的取值：

| 值 | 描述                                                                                                                                                     |
|----|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | 变更异步执行。                                                                                                                                         |
| `1`   | 查询会等待当前服务器上的轻量级删除完成。                                                                                                               |
| `2`   | 查询会等待所有副本（如果存在）上的轻量级删除完成。                                                                                                     |
| `3`   | 查询只会等待活跃副本。仅对 `SharedMergeTree` 支持。对于 `ReplicatedMergeTree`，其行为与 `mutations_sync = 2` 相同。                                     |

**另请参阅**

- [ALTER 查询的同步性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Mutations](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置从查询结果中返回的最大行数。它会对 [LIMIT](/sql-reference/statements/select/limit) 子句中指定的值施加上限，使查询中指定的行数限制不会超过该设置定义的最大值。

可能的取值：

- 0 — 行数不受限制。
- 正整数。

## load_balancing \{#load_balancing\} 

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

指定用于分布式查询处理的副本选择算法。

ClickHouse 支持以下副本选择算法：

- [Random](#load_balancing-random)（默认值）
- [Nearest hostname](#load_balancing-nearest_hostname)（最近主机名）
- [Hostname levenshtein distance](#load_balancing-hostname_levenshtein_distance)（根据主机名的 Levenshtein 距离）
- [In order](#load_balancing-in_order)（按顺序）
- [First or random](#load_balancing-first_or_random)（优先选择第一个，否则随机选择）
- [Round robin](#load_balancing-round_robin)（轮询）

另请参阅：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### 随机（默认）

```sql
load_balancing = random
```

每个副本都会统计自身的错误数量。查询会被发送到错误数量最少的副本；如果有多个副本的错误数量同为最少，则会发送到其中任意一个。

缺点：不会考虑服务器之间的网络距离/延迟；如果各个副本上的数据不一致，你也会得到不一致的数据。


### 最近主机名

```sql
load_balancing = nearest_hostname
```

每个副本都会单独统计错误次数。每 5 分钟，错误次数都会整体除以 2 并取整。由此可以通过指数平滑的方式，根据最近一段时间来计算错误次数。如果存在某个副本的错误次数最少（即其他副本上最近发生过错误），查询就会被发送到该副本。如果有多个副本拥有相同的最小错误次数，则查询会被发送到配置文件中主机名与当前服务器主机名最相似的那个副本（按两个主机名在相同位置上不同字符的数量来衡量，直到两者主机名长度中的较小值为止）。

例如，example01-01-1 和 example01-01-2 在一个位置上不同，而 example01-01-1 和 example01-02-2 在两个位置上不同。
这种方法看起来可能比较原始，但它不需要外部的网络拓扑数据，也不需要比较 IP 地址，而对我们的 IPv6 地址来说，IP 比较会非常复杂。

因此，如果存在同等的副本，则优先选择名称上最接近的那个。
我们还可以认为，在没有故障的情况下，将查询发送到同一台服务器时，一个分布式查询也会被发送到同一组服务器上。所以即使不同副本上存放的是不同的数据，查询结果在大多数情况下也会保持一致。


### 主机名 Levenshtein 距离

```sql
load_balancing = hostname_levenshtein_distance
```

与 `nearest_hostname` 类似，但它是通过 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance) 的方式来比较主机名。例如：

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### 顺序方式

```sql
load_balancing = in_order
```

具有相同错误次数的副本，将按照它们在配置中出现的顺序进行访问。
当你明确知道哪个副本更优先时，适合使用此方法。


### 第一个或随机

```sql
load_balancing = first_or_random
```

该算法会选择集合中的第一个副本；如果第一个副本不可用，则随机选择一个副本。在跨复制拓扑结构中效果良好，但在其他配置中作用不大。

`first_or_random` 算法解决了 `in_order` 算法存在的问题。使用 `in_order` 时，如果有一个副本宕机，紧接着的下一个副本会承担双倍负载，而其余副本仍然只处理各自正常水平的流量。使用 `first_or_random` 算法时，负载会在仍然可用的副本之间均匀分布。

可以通过设置 `load_balancing_first_offset` 显式指定哪个副本作为第一个副本。这样可以更好地控制在副本之间重新平衡查询工作负载。


### 轮循

```sql
load_balancing = round_robin
```

该算法在具有相同错误次数的副本之间使用轮转策略（仅统计使用 `round_robin` 策略的查询的错误）。


## load_balancing_first_offset \{#load_balancing_first_offset\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在使用 FIRST_OR_RANDOM 负载均衡策略时，应优先将查询发送到哪个副本。

## load_marks_asynchronously \{#load_marks_asynchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

异步加载 MergeTree 标记

## local_filesystem_read_method \{#local_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

从本地文件系统读取数据的方法，可选值之一：read、pread、mmap、io_uring、pread_threadpool。

'io_uring' 方法是实验性的，并且在存在并发读写时，不适用于 Log、TinyLog、StripeLog、File、Set 和 Join 以及其他使用可追加写入文件的表。
如果你在互联网上看到各种关于 'io_uring' 的文章，不要被它们迷惑。除非是在存在大量小 IO 请求的场景下，否则它并不是更好的文件读取方式，而这并不是 ClickHouse 的典型场景。没有任何理由启用 'io_uring'。

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="0" />

是否在从本地文件系统读取数据时启用预取。

## lock_acquire_timeout \{#lock_acquire_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

定义锁定请求在失败前的最大等待时间（秒）。

锁定超时用于在对表执行读/写操作时防止死锁。当超时时间到且锁定请求失败时，ClickHouse 服务器会抛出异常 "锁定尝试超时！已避免可能的死锁。客户端应重试。"，错误码为 `DEADLOCK_AVOIDED`。

可能的取值：

- 正整数（单位：秒）。
- 0 — 无锁定超时限制。

## log&#95;comment

为 [system.query&#95;log](../system-tables/query_log.md) 表的 `log_comment` 字段以及服务器日志中的注释内容指定值。

可用于提高服务器日志的可读性。此外，在运行 [clickhouse-test](../../development/tests.md) 之后，还可以帮助从 `system.query_log` 中筛选出与该测试相关的查询。

可能的值：

* 任意长度不超过 [max&#95;query&#95;size](#max_query_size) 的字符串。如果超出 max&#95;query&#95;size，服务器会抛出异常。

**示例**

查询：

```sql
SET log_comment = 'log_comment test', log_queries = 1;
SELECT 1;
SYSTEM FLUSH LOGS;
SELECT type, query FROM system.query_log WHERE log_comment = 'log_comment test' AND event_date >= yesterday() ORDER BY event_time DESC LIMIT 2;
```

结果：

```text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```


## log_formatted_queries \{#log_formatted_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许将格式化查询写入 [system.query_log](../../operations/system-tables/query_log.md) 系统表（为 [system.query_log](../../operations/system-tables/query_log.md) 中的 `formatted_query` 列填充值）。

可能的取值：

- 0 — 不在系统表中记录格式化查询。
- 1 — 在系统表中记录格式化查询。

## log_processors_profiles \{#log_processors_profiles\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "默认启用"}]}]}/>

将处理器在执行/等待数据期间消耗的时间写入 `system.processors_profile_log` 表。

另请参阅：

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将查询性能统计信息写入 `query_log`、`query_thread_log` 和 `query_views_log` 日志中。

## log&#95;queries

<SettingsInfoBlock type="Bool" default_value="1" />

配置查询日志。

通过此设置发送到 ClickHouse 的查询，会根据 [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) 服务器配置参数中的规则进行记录。

示例：

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果查询长度（以字节为单位）大于指定阈值，则在写入查询日志时对查询进行截断。同时限制在普通文本日志中打印的查询长度。

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

如果启用（非零），执行时间短于该设置值的查询将不会被记录（可以将其理解为 [MySQL 慢查询日志](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) 中的 `long_query_time`），这基本上意味着在以下表中将找不到这些查询：

- `system.query_log`
- `system.query_thread_log`

只有具有以下类型的查询才会被写入日志：

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 类型：毫秒
- 默认值：0（记录任意查询）

## log&#95;queries&#95;min&#95;type

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

记录到 `query_log` 的最小类型。

可能的取值：

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

可用于限制哪些事件会被记录到 `query_log`。例如，如果只关心错误，则可以使用 `EXCEPTION_WHILE_PROCESSING`：

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="1" />

允许仅按指定概率随机选择一部分查询，将其写入 [query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md) 和 [query_views_log](../../operations/system-tables/query_views_log.md) 系统表。这有助于在每秒查询量很大时降低系统负载。

可能的取值：

- 0 — 查询不会写入系统表。
- 区间 [0..1] 内的正浮点数。例如，如果配置值为 `0.5`，则大约一半的查询会写入系统表。
- 1 — 所有查询都会写入系统表。

## log_query_settings \{#log_query_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将查询设置写入 query_log 和 OpenTelemetry span 日志中。

## log&#95;query&#95;threads

<SettingsInfoBlock type="Bool" default_value="0" />

配置查询线程日志记录。

查询线程会被记录到 [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) 表中。此设置仅在 [log&#95;queries](#log_queries) 为 true 时生效。使用此配置由 ClickHouse 运行的查询线程，会根据 [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) 服务器配置参数中的规则进行记录。

可选值：

* 0 — 禁用。
* 1 — 启用。

**示例**

```text
log_query_threads=1
```


## log&#95;query&#95;views

<SettingsInfoBlock type="Bool" default_value="1" />

配置查询视图日志记录功能。

当在 ClickHouse 中运行的查询启用了此设置且具有相关视图（物化视图或实时视图）时，这些视图会记录到服务器配置参数 [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) 中。

示例：

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许或限制在 [Native](/interfaces/formats/Native) 格式中使用 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 数据类型。

如果限制使用 `LowCardinality`，ClickHouse 服务器会在 `SELECT` 查询中将 `LowCardinality` 列转换为普通列，并在 `INSERT` 查询中将普通列转换为 `LowCardinality` 列。

此设置主要用于兼容不支持 `LowCardinality` 数据类型的第三方客户端。

可能的取值：

- 1 — 不限制使用 `LowCardinality`。
- 0 — 限制使用 `LowCardinality`。

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

设置可写入存储文件系统、供 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 数据类型使用的共享全局字典的最大行数。该设置可在字典不受限制地增长时避免出现 RAM 问题。所有由于达到最大字典大小限制而无法编码的数据，ClickHouse 都会以常规方式写入。

可能的值：

- 任意正整数。

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制在数据 part 中是否只使用单个字典。

默认情况下，ClickHouse 服务器会监控字典的大小，如果某个字典达到大小上限，服务器就会开始写入下一个字典。若要禁止创建多个字典，请设置 `low_cardinality_use_single_dictionary_for_part = 1`。

可能的取值：

- 1 — 禁止为数据 part 创建多个字典。
- 0 — 允许为数据 part 创建多个字典。

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

当启用了查询优先级机制（参见设置 `priority`）时，低优先级查询会等待高优先级查询完成。此设置用于指定等待时长。

## make_distributed_plan \{#make_distributed_plan\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新的实验性设置。"}]}]}/>

创建分布式查询计划。

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "新增设置，用于允许在插入时禁用跳过索引的物化"}]}]}/>

控制是否在执行 INSERT 时构建并存储跳过索引。若禁用，跳过索引只会在[合并期间](merge-tree-settings.md/#materialize_skip_indexes_on_merge)或通过显式执行 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 时构建并存储。

另请参阅 [exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert)。

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of statistics on insert"}]}]}/>

启用该设置时，INSERT 语句会构建并插入统计信息。禁用该设置时，统计信息会在合并过程中或通过显式执行 MATERIALIZE STATISTICS 来构建并存储。

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在执行 ALTER MODIFY TTL 查询后，对旧数据应用 TTL

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许在处理物化视图时忽略错误，并且无论物化视图是否出错，都会将原始数据块写入目标表。

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Added setting to preserve old behavior if needed."}]}]}/>

将单个 INSERT 查询写入物化视图目标表的并行插入合并为一个，以减少生成的数据片段数量。
如果设置为 false 且启用了 `parallel_view_processing`，则该 INSERT 查询会在目标表中为每个 `max_insert_thread` 生成一个数据片段。

## max_analyze_depth \{#max_analyze_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

解释器可执行的最大分析次数。

## max_ast_depth \{#max_ast_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

查询语法树允许的最大嵌套深度。如果超出该值，将抛出异常。

:::note
目前此限制不会在解析过程中检查，而只会在查询解析完成后检查。
这意味着在解析期间仍然可能构建出过深的语法树，但该查询最终会失败。
:::

## max_ast_elements \{#max_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

查询语法树中元素的最大数量。若超过该值，将引发异常。

:::note
目前，该限制不会在解析阶段进行检查，而只会在查询解析完成后检查。
这意味着在解析过程中仍然可能构建过深的语法树，但查询最终会失败。
:::

## max_autoincrement_series \{#max_autoincrement_series\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

限制 `generateSerialID` 函数可创建的序列数量上限。

由于每个序列在 Keeper 中都对应一个节点，建议其总数不要超过几百万。

## max_backup_bandwidth \{#max_backup_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

服务器上某个备份的最大读取速度（以字节/秒计）。零表示不限。

## max_block_size \{#max_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

在 ClickHouse 中，数据按块（block）进行处理，块是由多列片段组成的集合。对单个块的内部处理循环效率很高，但在处理每个块时仍然会产生可观的开销。

`max_block_size` 设置表示从表中加载数据时，单个块中建议包含的最大行数。并非总是会从表中加载大小为 `max_block_size` 的块：如果 ClickHouse 判断需要读取的数据量更少，则会处理更小的块。

块大小不应过小，以避免在处理每个块时产生明显的开销；同时也不应过大，以确保带有 LIMIT 子句的查询在处理完第一个块后就能快速返回结果。在设置 `max_block_size` 时，目标应当是在多线程读取大量列时避免占用过多内存，并尽可能保留一定程度的缓存局部性。

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：每个副本可用内存的一半。

启用或禁用在外部内存中执行 `GROUP BY` 子句。
（参见 [在外部内存中进行 GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory)）

可能的取值：

- 单个 [GROUP BY](/sql-reference/statements/select/group-by) 操作可使用的最大 RAM 容量（字节数）。
- `0` — 禁用在外部内存中进行 `GROUP BY`。

:::note
如果 GROUP BY 操作期间的内存使用量（字节数）超过此阈值，
则会激活“外部聚合”模式（将数据写入磁盘）。

推荐值为可用系统内存的一半。
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：每个副本可用内存的一半。

启用或禁用在外部存储中执行 `ORDER BY` 子句。参见 [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details)。
如果在执行 ORDER BY 操作时的内存使用量（以字节为单位）超过此阈值，则会激活“外部排序”模式（将数据写出到磁盘）。

可能的取值：

- 单个 [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作可以使用的最大 RAM 容量（以字节为单位）。
  推荐值为系统可用内存的一半。
- `0` — 禁用在外部存储中的 `ORDER BY`。

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

在包含 ORDER BY 和 LIMIT 的查询中，当内存使用量超过指定阈值时，会在最终合并前执行额外的块合并步骤，仅保留前 LIMIT 行。

## max_bytes_in_distinct \{#max_bytes_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在使用 DISTINCT 时，哈希表在内存中用于存储状态数据的最大字节数（未压缩）。

## max_bytes_in_join \{#max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

用于表连接的哈希表的最大大小（以字节为单位）。

此设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join)
操作以及 [Join table engine](/engines/table-engines/special/join)。

如果查询包含 JOIN，ClickHouse 会针对每个中间结果检查此设置。

当达到该限制时，ClickHouse 可以采取不同的处理方式。使用
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 设置来选择要执行的操作。

可能的值：

- 正整数。
- 0 — 禁用内存控制。

## max_bytes_in_set \{#max_bytes_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

由子查询生成的 `IN` 子句中，集合可使用的最大字节数（未压缩数据）。

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "默认启用自动溢写到磁盘。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新增设置。"}]}]}/>

允许 `GROUP BY` 使用的可用内存比例。当达到该比例后，将使用外部内存进行聚合。

例如，如果设置为 `0.6`，`GROUP BY` 在执行开始时最多允许使用 60% 的可用内存（相对于服务器 / 用户 / 合并而言），之后将开始使用外部聚合（溢写到磁盘）。

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "默认启用自动写出到磁盘。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置。"}]}]}/>

允许 `ORDER BY` 使用的可用内存比例。达到该比例后，将改用外部排序。

例如，如果设置为 `0.6`，则 `ORDER BY` 在执行开始时允许使用 `60%` 的可用内存（针对服务器 / 用户 / 合并操作），之后将开始使用外部排序。

注意，`max_bytes_before_external_sort` 仍然生效，只有当参与排序的数据块大于 `max_bytes_before_external_sort` 时，才会写出到磁盘。

## max_bytes_to_read \{#max_bytes_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行查询时，从表中可读取的最大未压缩数据字节数。
该限制会针对每个处理的数据块进行检查，仅作用于最深层的表表达式；从远程服务器读取时，仅在远程服务器上进行检查。

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行分布式查询时，从叶子节点上的本地表中允许读取的最大字节数（未压缩数据）。虽然分布式查询可以对每个分片（叶子）发起多个子查询，但此限制仅在叶子节点的读取阶段进行检查，在根节点的结果合并阶段会被忽略。

例如，一个集群由 2 个分片组成，每个分片包含一张具有 100 字节数据的表。一个期望从两张表中读取全部数据且设置了 `max_bytes_to_read=150` 的分布式查询将会失败，因为总共会读取到 200 字节。一个设置了 `max_bytes_to_read_leaf=150` 的查询则会成功，因为叶子节点每个最多只会读取 100 字节。

该限制会针对每个已处理的数据块进行检查。

:::note
当 `prefer_localhost_replica=1` 时，此设置的行为不稳定。
:::

## max_bytes_to_sort \{#max_bytes_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在排序前允许处理的最大字节数。若在执行 ORDER BY 操作时需要处理的未压缩数据字节数超过该值，则行为由 `sort_overflow_mode` 决定，其默认值为 `throw`。

## max_bytes_to_transfer \{#max_bytes_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 GLOBAL IN/JOIN 子句时，可以传递到远程服务器或保存在临时表中的未压缩数据的最大字节数。

## max_columns_to_read \{#max_columns_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在单个查询中从一张表中可读取的最大列数。
如果查询需要读取的列数超过指定的数量，则会抛出异常。

:::tip
此设置可用于防止查询过于复杂。
:::

`0` 表示不做限制。

## max_compress_block_size \{#max_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在写入表时进行压缩前，未压缩数据块的最大大小。默认值为 1,048,576（1 MiB）。将块大小设置得更小通常会略微降低压缩比，但由于缓存局部性，压缩和解压缩速度会略有提升，同时内存消耗会减少。

:::note
这是一个专家级设置，如果你刚开始使用 ClickHouse，建议不要更改它。
:::

不要将用于压缩的块（由字节组成的一段内存）与用于查询处理的块（来自表的一组行）混淆。

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users

<SettingsInfoBlock type="UInt64" default_value="0" />

如果此设置的值小于或等于当前正在同时处理的查询数量，则会抛出异常。

示例：可以为所有用户将 `max_concurrent_queries_for_all_users` 设置为 99，而数据库管理员可以为自己设置为 100，以便在服务器过载时仍然可以运行用于排查问题的查询。

为某个查询或用户修改该设置不会影响其他查询。

可能的取值：

* 正整数。
* 0 — 不限制。

**示例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**另请参阅**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max&#95;concurrent&#95;queries&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

每个用户可同时并发处理的最大查询数。

可能的取值：

* 正整数。
* 0 — 不限制。

**示例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

对单个 `Distributed` 表的一条查询进行分布式处理时，与远程服务器之间允许的最大并发连接数。建议将该值设置为不小于集群中服务器的数量。

下列参数仅在创建 `Distributed` 表（以及启动服务器）时使用，因此无需在运行时对其进行更改。

## max_distributed_depth \{#max_distributed_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

限制对 [Distributed](../../engines/table-engines/special/distributed.md) 表执行递归查询时的最大深度。

当超过该值时，服务器会抛出异常。

可选值：

- 正整数。
- 0 — 深度不受限制。

## max_download_buffer_size \{#max_download_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

每个线程用于并行下载（例如 URL 引擎）的缓冲区的最大大小。

## max_download_threads \{#max_download_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

下载数据所使用的最大线程数（例如 URL 引擎）。

## max_estimated_execution_time \{#max_estimated_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Separate max_execution_time and max_estimated_execution_time"}]}]}/>

查询的最⼤预估执⾏时间（秒）。在
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
超时时，对每个数据块进行检查。

## max_execution_speed \{#max_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒最多可执行的行数。会在处理每个数据块时检查，当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
设置到期时触发检查。如果当前执行速度过高，将降低执行速度。

## max_execution_speed_bytes \{#max_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒允许执行的最大字节数。在
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
到期后，会对每个数据块进行检查。如果执行速度过高，将降低执行速度。

## max_execution_time \{#max_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

以秒为单位的查询最⼤执⾏时间。

`max_execution_time` 参数的含义可能有些难以理解。
它是基于当前查询执⾏速度的插值计算结果来起作用的
（此行为由 [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) 控制）。

如果预计的执⾏时间超过指定的 `max_execution_time`，ClickHouse 将中断该查询。
默认情况下，`timeout_before_checking_execution_speed` 设置为 10 秒。
这意味着在查询执⾏ 10 秒之后，ClickHouse 会开始估算总执⾏时间。
例如，如果 `max_execution_time` 设置为 3600 秒（1 ⼩时），当预估时间超过这 3600 秒的上限时，
ClickHouse 将终止该查询。若将 `timeout_before_checking_execution_speed` 设置为 0，
ClickHouse 将直接以实际时钟时间作为 `max_execution_time` 的依据。

如果查询运⾏时间超过指定的秒数，其行为将由 `timeout_overflow_mode` 决定，
默认值为 `throw`。

:::note
超时检查以及查询的中断只会发⽣在数据处理流程中预先定义好的位置。
当前它⽆法在聚合状态合并或查询分析阶段中途停⽌，
因此实际运⾏时间会⾼于该设置指定的数值。
:::

## max&#95;execution&#95;time&#95;leaf

<SettingsInfoBlock type="Seconds" default_value="0" />

在语义上与 [`max_execution_time`](#max_execution_time) 类似，但仅应用于分布式或远程查询的叶节点。

例如，如果我们希望将叶节点上的执行时间限制为 `10s`，但对初始节点不设限制，那么可以在嵌套子查询的设置中不使用 `max_execution_time`，而是：

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

我们可以将 `max_execution_time_leaf` 用作查询参数：

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

在展开别名和星号后，查询语法树允许的最大节点数。

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

从其他主机获取分区时允许的最大重试次数。

## max_final_threads \{#max_final_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

设置带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 查询在数据读取阶段所使用的最大并行线程数。

可能的取值：

- 正整数。
- 0 或 1 — 禁用。`SELECT` 查询在单线程中执行。

## max_http_get_redirects \{#max_http_get_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

允许的 HTTP GET 重定向最大次数。通过限制重定向次数，确保额外的安全防护措施到位，防止恶意服务器将您的请求重定向到意料之外的服务。\n\n典型情况是外部服务器重定向到另一个地址，但该地址看起来属于公司内部基础设施，此时通过向内部服务器发送 HTTP 请求，您可能会从内部网络请求内部 API，从而绕过认证，甚至查询其他服务，例如 Redis 或 Memcached。当您没有内部基础设施（包括在 localhost 上运行的任何服务），或者您信任该服务器时，允许重定向是安全的。但请注意，如果 URL 使用的是 HTTP 而非 HTTPS，您不仅需要信任远程服务器，还需要信任您的 ISP 以及传输路径中经过的所有网络。

## max&#95;hyperscan&#95;regexp&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

定义 [hyperscan multi-match functions](/sql-reference/functions/string-search-functions#multiMatchAny) 中每个正则表达式的最大长度。

可能的取值：

* 正整数。
* 0 — 长度不受限制。

**示例**

查询：

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 3;
```

结果：

```text
┌─multiMatchAny('abcd', ['ab', 'bcd', 'c', 'd'])─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

查询：

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 2;
```

结果：

```text
异常：正则表达式长度过大。
```

**另请参阅**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max&#95;hyperscan&#95;regexp&#95;total&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

设置每个 [Hyperscan 多模式匹配函数](/sql-reference/functions/string-search-functions#multiMatchAny) 中所有正则表达式总长度的最大值。

可能的取值：

* 正整数。
* 0 — 长度不受限制。

**示例**

查询：

```sql
SELECT multiMatchAny('abcd', ['a','b','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

结果：

```text
┌─multiMatchAny('abcd', ['a', 'b', 'c', 'd'])─┐
│                                           1 │
└─────────────────────────────────────────────┘
```

查询：

```sql
SELECT multiMatchAny('abcd', ['ab','bc','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

结果：

```text
异常：正则表达式总长度过大。
```

**另请参阅**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

以行数计的块大小，用于在向表中插入数据时生成数据块。

此设置仅在由服务器负责将数据切分为插入块时生效。
例如，对于通过 HTTP 接口执行的 INSERT，服务器会解析数据格式，并按照指定的块大小组装数据块。
但在使用 clickhouse-client 时，客户端会自行解析数据，服务器端的 `max_insert_block_size` 设置不会影响插入块的大小。
在使用 INSERT SELECT 时，此设置也没有作用，因为数据是以执行 SELECT 后生成的相同数据块形式插入的。

默认值略大于 `max_block_size`。原因在于，某些表引擎（`*MergeTree`）会在磁盘上为每个插入块创建一个数据 part，这是一个相当庞大的实体。同时，`*MergeTree` 表在插入时会对数据进行排序，足够大的块大小有助于在内存中对更多数据进行排序。

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

用于延迟最终数据分片刷盘的最大流（列）数量。默认值为自动（如果底层存储支持并行写入，则为 100，例如 S3；否则为禁用）

## max_insert_threads \{#max_insert_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

执行 `INSERT SELECT` 查询时使用的最大线程数。

可能的取值：

- 0（或 1）— `INSERT SELECT` 不进行并行执行。
- 大于 1 的正整数。

云端默认值：

- 具有 8 GiB 内存的节点为 `1`
- 具有 16 GiB 内存的节点为 `2`
- 更大内存的节点为 `4`

并行 `INSERT SELECT` 只有在 `SELECT` 部分并行执行时才会生效，参见 [`max_threads`](#max_threads) 设置。
更高的取值会增加内存占用。

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "新设置"}]}]}/>

JOIN 结果的最大数据块大小（以字节为单位）（如果所用 JOIN 算法支持该设置）。0 表示不限制。

## max_joined_block_size_rows \{#max_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN 结果的最大数据块大小（如果相应的 JOIN 算法支持该限制）。0 表示不限制。

## max_limit_for_vector_search_queries \{#max_limit_for_vector_search_queries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

LIMIT 超过此设置值的 SELECT 查询无法使用向量相似度索引。此设置有助于防止向量相似度索引发生内存溢出。

## max_local_read_bandwidth \{#max_local_read_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

本地读取的最大带宽，单位为字节/秒。

## max_local_write_bandwidth \{#max_local_write_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

本地写入的最大速率，单位为字节/秒。

## max_memory_usage \{#max_memory_usage\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：取决于副本上的 RAM 容量。

在单个服务器上运行单条查询时允许使用的最大 RAM 容量。
值为 `0` 表示不限制。

此设置不会考虑当前可用内存或机器的总内存容量。该限制仅应用于单个服务器上的单条查询。

可以使用 `SHOW PROCESSLIST` 查看每条查询当前的内存使用情况。
每条查询的峰值内存使用都会被跟踪并写入日志。

对于以下聚合函数在处理 `String` 和 `Array` 类型参数时，其状态的内存使用不会被完整跟踪：

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

内存使用还受到参数 [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
和 [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) 的限制。

## max&#95;memory&#95;usage&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

在单个服务器上执行某个用户的查询时允许使用的 RAM 最大值。值为 0 表示不限制。

默认情况下，该值不受限制（`max_memory_usage_for_user = 0`）。

另请参阅 [`max_memory_usage`](/operations/settings/settings#max_memory_usage) 的说明。

例如，如果希望为名为 `clickhouse_read` 的用户将 `max_memory_usage_for_user` 设置为 1000 字节，可以使用如下语句：

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

您可以先从客户端注销并重新登录，然后使用 `getSetting` 函数来确认它是否已生效：

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的速度（以字节/秒计）。该设置适用于每个查询。

可能的取值：

- 正整数。
- 0 — 禁用带宽控制。

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据传输的速率，单位为字节/秒。此设置对服务器上所有并发运行的查询生效。

可能的取值：

- 正整数。
- 0 — 不限制数据传输速率。

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的速率（以字节每秒为单位）。此设置适用于同一用户执行的所有并发查询。

可能的取值：

- 正整数。
- 0 — 关闭数据速率控制。

## max_network_bytes \{#max_network_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在执行查询时，通过网络接收或发送的数据量（以字节为单位）。该设置作用于每个独立查询。

可能的取值：

- 正整数。
- 0 — 禁用对数据量的控制。

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="128" />

在表中可应用该优化的最大分区数

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "设置值已更改并回溯到 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置"}]}]}/>

用于判断是否拒绝查询时，操作系统 CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间允许的最大比值。使用最小和最大比值之间的线性插值来计算概率，在该比值处概率为 1。

## max_parallel_replicas \{#max_parallel_replicas\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "默认最多使用 1000 个并行副本。"}]}]}/>

在执行查询时，每个分片可以使用的最大副本数量。

可能的取值：

- 正整数。

**附加信息**

此设置与其他设置组合使用时，可能会产生不同的结果。

:::note
当查询中涉及 `JOIN` 或子查询，且所有表不满足特定要求时，此设置可能会导致结果不正确。更多细节请参阅 [分布式子查询与 max_parallel_replicas](/operations/settings/settings#max_parallel_replicas)。
:::

### 使用 `SAMPLE` 键进行并行处理

如果在多个服务器上并行执行，查询可能处理得更快。但在以下情况下，查询性能可能会下降：

- 采样键在分区键中的位置无法支持高效的范围扫描。
- 向表中添加采样键会降低按其他列进行过滤的效率。
- 采样键是一个计算开销较高的表达式。
- 集群的延迟分布存在长尾，因此向更多服务器发起查询会增加查询的整体延迟。

### 使用 [parallel_replicas_custom_key](#parallel_replicas_custom_key) 进行并行处理

此设置适用于所有复制表。

## max_parser_backtracks \{#max_parser_backtracks\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "限制解析的复杂度"}]}]}/>

解析器最大回溯次数（在递归下降解析过程中尝试不同解析分支的次数上限）。

## max_parser_depth \{#max_parser_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

限制递归下降解析器中的最大递归深度，以控制栈大小。

可能的取值：

- 正整数。
- 0 — 递归深度不受限制。

## max_parsing_threads \{#max_parsing_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "新增单独的设置，用于控制从文件并行解析时使用的线程数量"}]}]}/>

在支持并行解析的输入格式中用于解析数据的最大线程数。默认情况下，该值会自动确定。

## max_partition_size_to_drop \{#max_partition_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

在执行查询时删除分区的限制。值 `0` 表示可以在没有任何限制的情况下删除分区。

Cloud 默认值：1 TB。

:::note
此查询设置会覆盖对应的服务器设置，参见 [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "Add a limit for the number of partitions in one block"}]}]}/>

限制单个插入块中的最大分区数量，如果插入块包含的分区过多，则会抛出异常。

- 正整数。
- `0` — 分区数量不受限制。

**详细说明**

在插入数据时，ClickHouse 会计算插入块中的分区数量。如果分区数量大于
`max_partitions_per_insert_block`，ClickHouse 会根据
`throw_on_max_partitions_per_insert_block` 的值记录一条警告或抛出异常。异常消息的内容如下：

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
此设置是一个安全阈值，因为认为使用大量分区有利是一种常见的误区。
:::

## max_partitions_to_read \{#max_partitions_to_read\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询可访问的分区数量上限。

在创建表时指定的设置值可以通过查询级别设置进行覆盖。

可能的取值：

- 正整数
- `-1` - 不限制（默认）

:::note
还可以在表的设置中指定 MergeTree 设置 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)。
:::

## max_parts_to_move \{#max_parts_to_move\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

限制单个查询中可移动的 part 数量。0 表示无限制。

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

如果从 projection 索引中读取的行数小于或等于此阈值，ClickHouse 将在查询执行期间尝试使用该 projection 索引。

## max_query_size \{#max_query_size\} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL 解析器可解析的查询字符串的最大字节数。
INSERT 查询中 VALUES 子句中的数据由单独的流式解析器处理（其仅消耗 O(1) 的 RAM），因此不受该限制影响。

:::note
不能在 SQL 查询内部设置 `max_query_size`（例如，`SELECT now() SETTINGS max_query_size=10000`），因为 ClickHouse 需要先分配一个缓冲区来解析该查询，而该缓冲区的大小由 `max_query_size` 设置决定，必须在执行查询之前进行配置。
:::

## max_read_buffer_size \{#max_read_buffer_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

用于从文件系统读取数据的缓冲区的最大容量。

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

用于从本地文件系统读取数据的缓冲区的最大大小。若设置为 0，则使用 max_read_buffer_size 的值。

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

从远程文件系统读取时使用的缓冲区大小上限。如果设置为 0，则会使用 `max_read_buffer_size`。

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "递归 CTE 评估深度的最大限制"}]}]}/>

递归 CTE 评估深度的最大限制

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

读取时网络数据交换的最大速度（以字节每秒为单位）。

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

写入操作时通过网络进行数据交换的最大速度，单位为字节每秒。

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

在执行分布式查询时禁用存在延迟的副本。参见 [Replication](../../engines/table-engines/mergetree-family/replication.md)。

以秒为单位设置时间。如果某个副本的延迟时间大于或等于该值，则不会使用该副本。

可能的取值：

- 正整数。
- 0 — 不检查副本延迟。

若要禁止使用任何存在非零延迟的副本，将此参数设置为 1。

在对指向复制表的分布式表执行 `SELECT` 时生效。

## max_result_bytes \{#max_result_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制结果的大小（以未压缩字节数计）。如果达到该阈值，查询会在处理完一个数据块后停止执行，
但不会截断结果集中的最后一个数据块，因此最终结果的大小可能会大于该阈值。

**注意事项**

此阈值考虑的是结果在内存中的大小。
即使结果本身很小，它也可能引用内存中更大的数据结构，
比如 LowCardinality 列的字典以及 AggregateFunction 列使用的 Arenas，
因此即使结果较小，也仍有可能超过该阈值。

:::warning
该设置属于较为底层的配置，使用时应谨慎。
:::

## max_result_rows \{#max_result_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：`0`。

限制结果中的行数。对子查询以及在远程服务器上执行的分布式查询各部分同样进行检查。
当该值为 `0` 时，不施加任何限制。

如果达到阈值，查询会在处理完一个数据块后停止，但不会截断结果的最后一个数据块，因此结果行数可以大于阈值。

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "新设置。函数 `dictGetKeys` 使用的、按查询粒度的反向字典查找缓存的最大大小（字节）。该缓存按属性值存储序列化的键元组，从而避免在同一查询中重复扫描字典。"}]}]}/>

函数 `dictGetKeys` 使用的、按查询粒度的反向字典查找缓存的最大大小（字节）。该缓存按属性值存储序列化的键元组，从而避免在同一查询中重复扫描字典。当达到限制时，将使用 LRU（最近最少使用）策略淘汰条目。将其设置为 0 可禁用缓存。

## max_rows_in_distinct \{#max_rows_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

使用 DISTINCT 时允许的不同行的最大数量。

## max_rows_in_join \{#max_rows_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在进行表连接时所使用哈希表中的最大行数。

该设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join)
操作以及 [Join](/engines/table-engines/special/join) 表引擎。

如果查询包含多个 join，ClickHouse 会对每个中间结果检查此设置。

当达到限制时，ClickHouse 可以执行不同的操作。使用
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 设置来选择对应的操作。

可能的取值：

- 正整数。
- `0` — 不限制行数。

## max_rows_in_set \{#max_rows_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

由子查询在 `IN` 子句中生成的数据集的最大行数限制。

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "禁用 join 优化，因为它会影响按顺序读取的优化"}]}]}/>

在执行 join 之前，基于彼此的行集对连接表进行过滤时，用于过滤的集合的最大大小。

可能的值：

- 0 — 禁用。
- 任意正整数。

## max_rows_to_group_by \{#max_rows_to_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

聚合过程中接收到的最大唯一键数量。通过该设置可以在进行聚合时限制内存消耗。

如果在 `GROUP BY` 期间生成的行数（唯一的 `GROUP BY` 键）超过指定数量，则行为将由 `group_by_overflow_mode` 决定，其默认值为 `throw`，但也可以切换为近似 `GROUP BY` 模式。

## max_rows_to_read \{#max_rows_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

执行查询时，从表中可读取的最大行数。
该限制会对每个已处理的数据块进行检查，只应用于最深层的表表达式；从远程服务器读取时，仅在远程服务器上进行检查。

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行分布式查询时，从叶子节点上的本地表中可读取的最大行数。虽然分布式查询可以对每个分片（叶子）发起多个子查询，但该限制只会在叶子节点的读取阶段进行检查，在根节点的结果合并阶段会被忽略。

例如，一个集群由 2 个分片组成，每个分片上有一张包含 100 行的数据表。一个打算从两个表中读取全部数据、且设置了 `max_rows_to_read=150` 的分布式查询会失败，因为总共有 200 行数据。设置 `max_rows_to_read_leaf=150` 的查询则会成功，因为叶子节点最多只会读取 100 行。

该限制会在处理的每个数据块上进行检查。

:::note
在 `prefer_localhost_replica=1` 时，此设置是不稳定的。
:::

## max_rows_to_sort \{#max_rows_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

排序时允许处理的最大行数。此设置可用于在排序过程中限制内存消耗。
如果在执行 ORDER BY 操作时需要处理的记录数超过该值，
具体行为将由 `sort_overflow_mode` 决定，其默认值为 `throw`。

## max_rows_to_transfer \{#max_rows_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 GLOBAL IN/JOIN 子句时，允许传递到远程服务器或保存到临时表中的最大行数。

## max&#95;sessions&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

每个已通过身份验证的用户在连接 ClickHouse 服务器时允许的最大并发会话数。

示例：

```xml
<profiles>
    <single_session_profile>
        <max_sessions_for_user>1</max_sessions_for_user>
    </single_session_profile>
    <two_sessions_profile>
        <max_sessions_for_user>2</max_sessions_for_user>
    </two_sessions_profile>
    <unlimited_sessions_profile>
        <max_sessions_for_user>0</max_sessions_for_user>
    </unlimited_sessions_profile>
</profiles>
<users>
    <!-- 用户 Alice 同一时间最多只能连接到 ClickHouse 服务器一次。 -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- 用户 Bob 可以同时使用 2 个会话。 -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- 用户 Charles 可以同时使用任意数量的会话。 -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

可能的取值：

* 正整数
* `0` - 并发会话数量无限（默认）


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "为更大的表启用优化。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "优化性能。"}]}]}/>

在聚合开始前，允许在所有哈希表中预分配空间的元素总数上限。

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新设置。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "为更大的表启用优化。"}]}]}/>

在执行 JOIN 之前，允许在所有哈希表中总共预先分配空间的元素数量上限。

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果不为零，则限制读取 MergeTree 表时使用的流的数量。

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\} 

<SettingsInfoBlock type="Float" default_value="5" />

从 Merge 表读取数据时会请求更多的流（streams）。这些流会分布到 Merge 表所使用的各个表中。这可以让工作更均匀地分配到各个线程上，在被合并的表大小不同时尤其有用。

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\} 

<SettingsInfoBlock type="Float" default_value="1" />

允许使用比线程数量更多的数据源，以在各个线程之间更均匀地分配工作负载。假定这是一个临时方案，因为未来可以让数据源的数量等于线程的数量，并让每个数据源为自身动态选择可用的工作任务。

## max_subquery_depth \{#max_subquery_depth\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

如果一个查询包含的嵌套子查询数量超过指定值，则会抛出异常。

:::tip
这可以作为合理性检查，用于防止集群用户编写过于复杂的查询。
:::

## max_table_size_to_drop \{#max_table_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

在执行查询时对删除表操作的限制。值 `0` 表示可以在没有任何限制的情况下删除所有表。

Cloud 环境中的默认值：1 TB。

:::note
此查询设置会覆盖其对应的服务器端设置，参见 [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)
:::

## max_temporary_columns \{#max_temporary_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行查询时（包括常量列），允许同时保存在 RAM 中的临时列的最大数量。如果查询在中间计算过程中在内存中生成的临时列数量超过该上限，则会抛出异常。

:::tip
此设置有助于防止查询过于复杂。
:::

将该值设为 `0` 表示不限制。

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

所有并发运行的查询在磁盘上用于临时文件的数据总量上限（字节）。

可能的值：

- 正整数。
- `0` — 无限制（默认）

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

所有并发运行的用户查询在磁盘上的临时文件所占用的数据总量上限（以字节为单位）。

可能的取值：

- 正整数。
- `0` — 不限制（默认）

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

与 `max_temporary_columns` 类似，此设置限定在执行查询时必须同时保存在 RAM 中的临时列的最大数量，但不将常量列计算在内。

:::note
在执行查询时，经常会产生常量列，但它们几乎不占用计算资源。
:::

## max_threads \{#max_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

用于查询处理的最大线程数，不包括从远程服务器检索数据的线程（参见参数 `max_distributed_connections`）。

该参数适用于在查询处理流水线中，以并行方式执行相同阶段的线程。
例如，在读取表时，如果可以使用至少 `max_threads` 个线程并行完成表达式函数计算、WHERE 过滤以及 GROUP BY 预聚合，那么就会使用 `max_threads` 个线程。

对于因为 LIMIT 而能快速完成的查询，可以将 `max_threads` 设置得更小。例如，如果在每个数据块中都已经包含足够数量的所需记录，并且 `max_threads = 8`，则会读取 8 个数据块，尽管只读取一个就已经足够。

`max_threads` 值越小，内存消耗越少。

云端默认值：`auto(3)`

## max_threads_for_indexes \{#max_threads_for_indexes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

用于处理索引的最大线程数量。

## max_untracked_memory \{#max_untracked_memory\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小额的内存分配和释放会累积在线程局部变量中，只有当其绝对值超过指定阈值时才会被跟踪或进行性能分析。如果该值大于 `memory_profiler_step`，则会被自动下调为 `memory_profiler_step` 的值。

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

它表示当全局内存达到硬限制时所采用的软内存上限。
该值用于计算查询的内存超额分配比率（overcommit ratio）。
值为零表示跳过该查询。
详情请参见[内存超额分配](memory-overcommit.md)。

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

当在用户级别触及硬内存限制时，它表示对应的软内存限制。
该值用于计算查询的内存 overcommit 比例。
值为零表示跳过该查询。
有关更多信息，请参阅 [memory overcommit](memory-overcommit.md)。

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

以 `memory_profiler_sample_probability` 的概率，随机采样大小小于或等于指定值的内存分配。0 表示禁用。可能需要将 `max_untracked_memory` 设置为 0，才能使该阈值按预期生效。

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

以 `memory_profiler_sample_probability` 指定的概率，随机收集大小大于或等于指定值的内存分配。0 表示禁用。为使该阈值按预期生效，可以将 `max_untracked_memory` 设置为 0。

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

收集随机的内存分配和释放操作，并将其以 `trace_type` 为 `MemorySample` 的记录写入 `system.trace_log`。该概率会应用于每一次分配/释放操作，而不考虑分配大小（可通过 `memory_profiler_sample_min_allocation_size` 和 `memory_profiler_sample_max_allocation_size` 进行调整）。请注意，只有当未跟踪内存量超过 `max_untracked_memory` 时才会进行采样。为了获得更细粒度的采样，可以将 `max_untracked_memory` 设置为 0。

## memory_profiler_step \{#memory_profiler_step\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

设置内存分析器的步长。当查询的内存使用量（以字节为单位）每次超过下一个步长阈值时，内存分析器会收集当前的内存分配栈追踪信息，并将其写入 [trace_log](/operations/system-tables/trace_log)。

可能的取值：

- 正整数（字节数）。

- 0 表示关闭内存分析器。

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

用于测试 `exception safety` —— 在进行内存分配时按指定概率抛出异常。

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

在用户级别发生内存过度分配（memory overcommit）时，线程等待内存被释放的最长时间。
如果在超时时间到达时内存仍未被释放，将抛出异常。
更多内容请参阅[内存过度分配](memory-overcommit.md)。

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

在创建未显式指定 schema 的 `Merge` 表或使用 `merge` 表函数时，会根据不超过指定数量的匹配表的 schema 的并集来推断 schema。
如果匹配的表数量大于该值，则只会基于最先指定的这一定数量的表来推断 schema。

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\} 

<SettingsInfoBlock type="UInt64" default_value="8" />

在搜索数据时，ClickHouse 会检查索引文件中的数据标记。如果 ClickHouse 发现所需的键位于某个范围内，它会将此范围划分为 `merge_tree_coarse_index_granularity` 个子范围，并在这些子范围中递归搜索所需的键。

可能的取值：

- 任意正的偶整数。

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

仅在 ClickHouse Cloud 中生效。用于在 MergeTree 表紧凑部分（compact part）的条带（stripe）中启用 multibuffer reader 的 granule 数量。multibuffer reader 支持并行读取和预取。当从远程文件系统（remote fs）读取时，使用 multibuffer reader 会增加读取请求的次数。

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

是否仅根据 prewhere 列的大小来确定读取任务的大小。

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

如果 ClickHouse 在单个查询中需要读取超过 `merge_tree_max_bytes_to_use_cache` 字节的数据，则不会使用未压缩数据块缓存。

未压缩数据块缓存存储为查询提取出的数据。ClickHouse 使用此缓存来加速对重复的小查询的响应。此设置用于防止读取大量数据的查询冲击缓存。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 服务器设置定义了未压缩数据块缓存的大小。

可能的取值：

- 任意正整数。

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

如果 ClickHouse 在单个查询中需要读取的行数超过 `merge_tree_max_rows_to_use_cache`，则不会使用未压缩数据块缓存。

未压缩数据块缓存用于存储为查询提取的数据。ClickHouse 使用该缓存来加速对重复的小型查询的响应。此设置可以保护缓存，避免被读取大量数据的大查询所干扰。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 服务器设置定义了未压缩数据块缓存的大小。

可能的取值：

- 任意正整数。

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

如果从 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的某个文件中需要读取的字节数超过 `merge_tree_min_bytes_for_concurrent_read`，则 ClickHouse 会尝试使用多个线程并发读取该文件。

可选值：

- 正整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

从远程文件系统读取数据时，在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎可以并行读取之前，单个文件需要读取的最小字节数。不建议使用此设置。

可能的取值：

- 正整数。

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果在同一个文件中需要读取的两个数据块之间的距离小于 `merge_tree_min_bytes_for_seek` 字节，那么 ClickHouse 会顺序读取包含这两个数据块的文件区间，从而避免额外的寻道操作。

可能的取值：

- 任意正整数。

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\} 

**别名**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "该值与 `filesystem_prefetch_min_bytes_for_single_read_task` 保持一致"}]}]}/>

每个任务读取的最小字节数。

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "New setting"}]}]}/>

任务大小的硬性下限（即使粒度数量较少且可用线程数量较多，也不会分配更小的任务）

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

如果从某个 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表文件中要读取的行数超过 `merge_tree_min_rows_for_concurrent_read`，则 ClickHouse 会尝试使用多个线程并发读取该文件。

可能的取值：

- 正整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "设置已弃用"}]}]}/>

在从远程文件系统读取数据时，[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎在并行读取之前需要从单个文件中读取的最小行数。不建议使用此设置。

可能的取值：

- 正整数。

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果在同一文件中待读取的两个数据块之间的距离小于 `merge_tree_min_rows_for_seek` 行，则 ClickHouse 不会在文件中进行定位（seek）操作，而是顺序读取数据。

可能的取值：

- 任意正整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "用于测试 `PartsSplitter` —— 每次从 MergeTree 读取时，以指定概率将读取范围拆分为相交和不相交的区间。"}]}]}/>

用于测试 `PartsSplitter` —— 每次从 MergeTree 读取时，以指定概率将读取范围拆分为相交和不相交的区间。

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于调试查询中存储快照一致性的新增设置"}]}]}/>

在为 MergeTree 表创建存储快照时注入人为延迟（单位：毫秒）。
仅供测试和调试使用。

可能的取值：

- 0 - 无延迟（默认）
- N - 延迟的毫秒数

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\} 

<SettingsInfoBlock type="Bool" default_value="1" />

是否在从远程表读取数据时使用固定大小的任务。

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于控制是否在 MergeTree 中使用反序列化前缀缓存的新设置"}]}]}/>

在 MergeTree 中从远程磁盘读取时，启用对文件前缀中的列元数据进行缓存。

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "一个新的设置，用于控制在 MergeTree 中对前缀进行并行反序列化时是否使用线程池"}]}]}/>

启用在 MergeTree 的 Wide 部分中使用线程池并行读取前缀。该线程池的大小由服务器设置 `max_prefixes_deserialization_thread_pool_size` 控制。

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "为 JSON 和 Dynamic 类型新增 V2 序列化版本"}]}]}/>

启用该设置后，MergeTree 中的 JSON 和 Dynamic 数据类型将使用 V1 序列化版本而非 V2。更改此设置仅会在服务器重启后生效。

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，将在查询执行期间对部分 perf 事件进行度量。

## metrics_perf_events_list \{#metrics_perf_events_list\} 

以逗号分隔的 perf 指标列表，将在查询执行过程中进行测量。留空表示测量所有事件。可用事件请参见源码中的 PerfEventInfo。

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

使用 direct I/O 方式访问存储磁盘所需的最小数据量。

ClickHouse 在从表中读取数据时使用此设置。若需要读取的数据总量超过 `min_bytes_to_use_direct_io` 字节，ClickHouse 会使用 `O_DIRECT` 选项从存储磁盘读取数据。

可能的取值：

- 0 — 禁用 direct I/O。
- 正整数。

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个实验性设置。用于指定在读取大文件时、在不将数据从内核复制到用户空间的情况下所需的最小内存量。推荐的阈值大约为 64 MB，因为 [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) 调用较慢。该设置仅对大文件有意义，并且只有当数据驻留在页缓存中时才有帮助。

可能的取值：

- 正整数。
- 0 — 读取大文件时始终通过将数据从内核复制到用户空间来完成。

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 类型：无符号整数（unsigned int）
- 默认值：1 MiB

以字节为单位的最小数据块大小，每个线程在并行解析时至少会处理这么多字节的数据。

## min_compress_block_size \{#min_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。为了在处理查询时减少延迟，当写入下一个标记（mark）时，如果数据块的大小至少为 `min_compress_block_size`，则会对该数据块进行压缩。默认值为 65,536。

如果未压缩数据小于 `max_compress_block_size`，则数据块的实际大小不会小于该值，也不会小于一个标记对应的数据量。

我们来看一个示例。假设在建表时将 `index_granularity` 设置为 8192。

我们写入一个 UInt32 类型的列（每个值 4 字节）。当写入 8192 行时，总数据量为 32 KB。由于 `min_compress_block_size = 65,536`，因此每两个标记会形成一个压缩块。

我们写入一个 String 类型的 URL 列（每个值平均大小为 60 字节）。当写入 8192 行时，平均数据量会略小于 500 KB。由于这大于 65,536，因此每个标记都会形成一个压缩块。在这种情况下，从磁盘读取单个标记范围内的数据时，不会对多余的数据进行解压缩。

:::note
这是一个专家级设置，如果您刚开始使用 ClickHouse，则不应修改它。
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

开始对相同聚合表达式进行 JIT 编译所需的最小数量。仅在启用了 [compile_aggregate_expressions](#compile_aggregate_expressions) 设置时生效。

可能的取值：

- 正整数。
- 0 — 始终对相同的聚合表达式进行 JIT 编译。

## min_count_to_compile_expression \{#min_count_to_compile_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

当同一表达式的执行次数达到该最小值时，才会对其进行编译。

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

在对排序描述进行 JIT 编译之前，所需累积的相同排序描述次数

## min_execution_speed \{#min_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

以每秒处理行数表示的最小执行速度。会在每个数据块上进行检查，当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
到期时触发检查。如果执行速度低于该值，则会抛出异常。

## min_execution_speed_bytes \{#min_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒最小执行字节数。当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
过期时，会对每个数据块进行检查。如果执行速度低于该值，则抛出异常。

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "如果数据块不够大，则将传递给外部表的数据块压缩合并到指定的字节大小。"}]}]}/>

如果数据块不够大，则将传递给外部表的数据块压缩合并到指定的字节大小。

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "如果数据块不够大，则将传递给外部表的数据块合并为按指定行数大小的块"}]}]}/>

如果数据块不够大，则将传递给外部表的数据块合并为按指定行数大小的块。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在仍允许临时写入的情况下，从插入写入中预留一定数量的空闲磁盘空间（字节）。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新增设置。"}]}]}/>

执行插入操作所需的最小剩余磁盘空间（字节）。

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在仍然允许进行临时写入的情况下，保持一定比例的空闲磁盘空间（以总磁盘空间的比例表示），避免插入操作占满磁盘。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新增设置。"}]}]}/>

执行插入操作所需的最小空闲磁盘空间比例。

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在写入用于外部排序和聚合的临时数据时需要保留的最小磁盘空间。

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

在聚合中使用连续键优化时，为保持该优化处于启用状态所需的缓存最小命中率

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

设置通过 `INSERT` 查询可插入到表中的数据块的最小字节数。更小的数据块会被合并为更大的数据块。

可能的取值：

- 正整数。
- 0 — 不进行合并。

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置可通过 `INSERT` 查询插入到表中的数据块的最小字节数。更小的数据块会被压缩合并为更大的数据块。此设置仅对插入到[物化视图](../../sql-reference/statements/create/view.md)中的数据块生效。通过调整此设置，可以在向物化视图写入时控制数据块的合并行为，并避免过多的内存占用。

可能的取值：

- 任意正整数。
- 0 — 禁用合并。

**另请参阅**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

设置通过 `INSERT` 查询插入到表中的数据块所允许的最小行数。更小的数据块会被合并到更大的数据块中。

可能的值：

- 正整数。
- 0 — 禁用合并。

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置可以通过 `INSERT` 查询插入到表中的数据块的最小行数。更小的数据块会被合并为更大的块。此设置仅适用于插入到[物化视图](../../sql-reference/statements/create/view.md)中的数据块。通过调整此设置，可以在向物化视图写入数据时控制数据块的合并行为，并避免过度的内存使用。

可能的取值：

- 任意正整数。
- 0 — 禁用块合并。

**另请参阅**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "New setting."}]}]}/>

用于 JOIN 输入和输出数据块的最小字节大小（如果所用 JOIN 算法支持）。较小的数据块会被合并。0 表示不受限制。

## min_joined_block_size_rows \{#min_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

JOIN 输入和输出块的最小行数（如果 JOIN 算法支持）。较小的块会被合并。0 表示不限制。

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Setting values were changed and backported to 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

在考虑是否拒绝查询时，OS CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间比值的最小阈值。使用该最小值与最大比值之间的线性插值来计算概率，在该点概率为 0。

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "新设置。"}]}]}/>

指定在管道生成过程中执行拆分后，`Resize` 或 `StrictResize` 处理器的最小输出流数量。若生成的输出流数量小于该值，则不会进行拆分操作。

### 什么是 Resize 节点

`Resize` 节点是查询流水线中的一个处理器，用于调整在流水线中流动的数据流数量。它可以增加或减少数据流的数量，以在多个线程或处理器之间平衡工作负载。例如，当查询需要更高的并行度时，`Resize` 节点可以将单个数据流拆分为多个数据流。相反，它也可以将多个数据流合并为较少的数据流，以集中进行数据处理。

`Resize` 节点确保数据在各个数据流之间均匀分布，同时保持数据块的结构不变。这有助于优化资源利用率并提升查询性能。

### 为什么需要拆分 Resize 节点

在流水线执行过程中，作为集中枢纽的 `Resize` 节点中的 ExecutingGraph::Node::status_mutex 在高核数环境下会出现严重竞争，这种竞争会导致：

1. ExecutingGraph::updateNode 的延迟增加，直接影响查询性能。
2. 大量 CPU 周期浪费在自旋锁竞争（native_queued_spin_lock_slowpath）上，导致效率下降。
3. CPU 利用率下降，限制并行度和整体吞吐量。

### 如何拆分 Resize 节点

1. 检查输出流的数量以确保可以执行拆分：每个拆分处理器的输出流数量需要达到或超过 `min_outstreams_per_resize_after_split` 阈值。
2. 将 `Resize` 节点划分为多个较小的 `Resize` 节点，这些节点具有相同数量的端口，每个节点处理一部分输入和输出流。
3. 各分组独立处理，从而减少锁争用。

### 使用任意输入/输出拆分 Resize 节点

在某些情况下，当输入/输出的数量不能被拆分得到的 `Resize` 节点数量整除时，某些输入会连接到 `NullSource`，某些输出会连接到 `NullSink`。这使得可以在不影响整体数据流的情况下完成拆分。

### 设置的目的

`min_outstreams_per_resize_after_split` 设置用于确保对 `Resize` 节点的拆分具有实际意义，并避免生成过少的数据流，从而防止并行处理效率低下。通过对输出流数量设定最小下限，该设置有助于在并行度与开销之间保持平衡，从而在涉及数据流拆分与合并的场景下优化查询执行。

### 禁用该设置

要禁用对 `Resize` 节点的拆分，请将该设置的值设为 0。这样将在生成管道时阻止拆分 `Resize` 节点，使其保留原始结构，而不会被划分为更小的节点。

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

如果从表中读取的预估行数大于或等于此阈值，ClickHouse 将在查询执行过程中尝试使用投影索引。

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "新增设置。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新增设置。"}]}]}/>

如果启用该设置，则当无法构建 MongoDB 查询时，MongoDB 表将返回错误。否则，ClickHouse 会读取整个表并在本地进行处理。当 `allow_experimental_analyzer=0` 时，此选项不生效。

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将所有可迁移的条件从 WHERE 移动到 PREWHERE

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将包含主键列的 PREWHERE 条件移动到 AND 条件链的末尾。此类条件很可能已经在主键分析阶段被考虑在内，因此对 PREWHERE 过滤不会有太大贡献。

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在重写包含多个 JOIN 的查询时，不要在顶层表达式列表中添加别名

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 `true`，则在 `UPDATE` 和 `DELETE` 查询中，常量非确定性函数（例如函数 `now()`）会在发起查询的节点上执行，并被替换为字面量。这有助于在使用常量非确定性函数执行变更操作时，使各副本上的数据保持一致。默认值：`false`。

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则标量子查询会在发起端执行，并在 `UPDATE` 和 `DELETE` 查询中被替换为常量。默认值：`false`。

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

在 `UPDATE` 和 `DELETE` 查询中可被替换的序列化字面量的最大字节数。仅当上述两个设置中至少有一个被启用时才生效。默认值：16384（16 KiB）。

## mutations_sync \{#mutations_sync\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

允许以同步方式执行 `ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` 查询（[mutations](../../sql-reference/statements/alter/index.md/#mutations)）。

可能的取值：

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | mutation 异步执行。                                                                                                                                   |
| `1`   | 查询会等待当前服务器上所有 mutation 完成。                                                                                                            |
| `2`   | 查询会等待所有副本（如果存在）上的所有 mutation 完成。                                                                                                |
| `3`   | 查询只会等待活跃副本上的 mutation 完成。仅在 `SharedMergeTree` 中受支持。对于 `ReplicatedMergeTree`，其行为与 `mutations_sync = 2` 相同。             |

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\} 

定义 MySQL 类型如何被转换为对应的 ClickHouse 类型。该设置是一个逗号分隔的列表，取值可以是 `decimal`、`datetime64`、`date2Date32` 或 `date2String` 的任意组合。

- `decimal`：在精度允许的情况下，将 `NUMERIC` 和 `DECIMAL` 类型转换为 `Decimal`。
- `datetime64`：当精度不为 `0` 时，将 `DATETIME` 和 `TIMESTAMP` 类型转换为 `DateTime64` 而不是 `DateTime`。
- `date2Date32`：将 `DATE` 转换为 `Date32` 而不是 `Date`。优先级高于 `date2String`。
- `date2String`：将 `DATE` 转换为 `String` 而不是 `Date`，但会被 `datetime64` 覆盖。

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "降低将 ClickHouse 与 BI 工具连接时的配置工作量。"}]}]}/>

启用后，ClickHouse 的 [FixedString](../../sql-reference/data-types/fixedstring.md) 数据类型将在 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) 中显示为 `TEXT`。

仅当通过 MySQL 线协议建立连接时才会生效。

- 0 - 使用 `BLOB`。
- 1 - 使用 `TEXT`。

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Reduce the configuration effort to connect ClickHouse with BI tools."}]}]}/>

启用后，ClickHouse 的 [String](../../sql-reference/data-types/string.md) 数据类型在 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) 中会显示为 `TEXT`。

仅在通过 MySQL 线协议建立连接时生效。

- 0 - 使用 `BLOB`。
- 1 - 使用 `TEXT`。

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL 存储引擎进行批量插入时允许的最大行数。

## network_compression_method \{#network_compression_method\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

用于压缩客户端/服务器以及服务器/服务器之间通信数据的编解码器。

可能的取值：

- `NONE` — 不进行压缩。
- `LZ4` — 使用 LZ4 编解码器。
- `LZ4HC` — 使用 LZ4HC 编解码器。
- `ZSTD` — 使用 ZSTD 编解码器。

**另请参阅**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="1" />

调整 ZSTD 压缩级别。仅在 [network_compression_method](#network_compression_method) 设置为 `ZSTD` 时生效。

可能的取值：

- 1 到 15 的正整数。

## normalize_function_names \{#normalize_function_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "将函数名规范化为其标准名称，这是投影查询路由所必需的"}]}]}/>

将函数名规范化为其标准名称

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果被变更的表中至少包含这么多未完成的 mutation，则人为减慢该表的 mutation。0 - 关闭

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果被变更的表存在至少这么多条未完成的变更操作，则抛出 `Too many mutations ...` 异常。0 表示禁用。

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC bridge 中针对每个连接配置字符串的连接池大小。

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在 ODBC bridge 中使用连接池。若设置为 false，则每次都会新建一个连接。

## offset

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在开始返回查询结果行之前要跳过的行数。它会在 [OFFSET](/sql-reference/statements/select/offset) 子句所设置的偏移量基础上进行调整，两者的值会相加。

可能的取值：

* 0 — 不跳过任何行。
* 正整数。

**示例**

输入表：

```sql
CREATE TABLE test (i UInt64) ENGINE = MergeTree() ORDER BY i;
INSERT INTO test SELECT number FROM numbers(500);
```

查询：

```sql
SET limit = 5;
SET offset = 7;
SELECT * FROM test LIMIT 10 OFFSET 100;
```

结果：

```text
┌───i─┐
│ 107 │
│ 108 │
│ 109 │
└─────┘
```


## opentelemetry_start_trace_probability \{#opentelemetry_start_trace_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

设置 ClickHouse 在执行查询时开始 trace 的概率（在未提供父级 [trace context](https://www.w3.org/TR/trace-context/) 时）。

可能的取值：

- 0 — 在未提供父级 trace context 时，对所有执行的查询禁用 trace。
- 范围为 [0..1] 的正浮点数。例如，如果该设置的值为 `0.5`，则 ClickHouse 平均会对一半的查询启动 trace。
- 1 — 对所有执行的查询启用 trace。

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "用于跟踪 `cpu_slot_preemption` 功能的新设置。"}]}]}/>

为工作负载的抢占式 CPU 调度收集 OpenTelemetry span 数据。

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

收集供处理器使用的 OpenTelemetry span。

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中按对应顺序聚合数据的 [SELECT](../../sql-reference/statements/select/index.md) 查询的 [GROUP BY](/sql-reference/statements/select/group-by) 优化。

可能的值：

- 0 — 禁用 `GROUP BY` 优化。
- 1 — 启用 `GROUP BY` 优化。

**另请参阅**

- [GROUP BY 优化](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \{#optimize_aggregators_of_group_by_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在 SELECT 子句中移除对 GROUP BY 键使用的 min/max/any/anyLast 聚合函数

## optimize_and_compare_chain \{#optimize_and_compare_chain\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

在 AND 条件链中补全可推导出的常量比较，以增强过滤效果。支持运算符 `<`、`<=`、`>`、`>=`、`=` 及其混合使用。例如，`(a < b) AND (b < c) AND (c < 5)` 会被扩展为 `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`。

## optimize_append_index \{#optimize_append_index\} 

<SettingsInfoBlock type="Bool" default_value="0" />

使用[约束](../../sql-reference/statements/create/table.md/#constraints)用于追加索引条件。默认值为 `false`。

可能的取值：

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将算术运算从聚合函数中移出

## optimize_const_name_size \{#optimize_const_name_size\} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "将较大的常量替换为标量，并使用其哈希值作为名称（大小根据名称长度估算）"}]}]}/>

将较大的常量替换为标量，并使用其哈希值作为名称（大小根据名称长度估算）。

可能的取值：

- 正整数 —— 名称的最大长度，
- 0 —— 始终进行替换，
- 负整数 —— 从不进行替换。

## optimize_count_from_files \{#optimize_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对不同输入格式文件进行行数统计的优化。适用于表函数/引擎 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`。

可能的取值：

- 0 — 关闭优化。
- 1 — 启用优化。

## optimize_distinct_in_order \{#optimize_distinct_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果 `DISTINCT` 子句中的某些列构成了排序键的前缀，则启用 `DISTINCT` 优化。例如，在 MergeTree 中作为排序键前缀的列，或在 `ORDER BY` 子句中作为排序键前缀的列。

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\} 

<SettingsInfoBlock type="Bool" default_value="1" />

通过避免在发起端服务器上执行代价高昂的聚合来优化 `GROUP BY sharding_key` 查询（从而减少发起端服务器在该查询上的内存占用）。

支持以下类型的查询（以及它们的任意组合）：

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

不支持以下类型的查询（其中部分类型后续可能会被支持）：

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

可能的取值：

- 0 — 禁用。
- 1 — 启用。

另见：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
当前该设置依赖于 `optimize_skip_unused_shards`（原因在于未来某个时间点它可能会被默认启用，而只有当数据是通过 Distributed 表插入、即根据 sharding_key 进行分布时，它才能正常工作）。
:::

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "A new setting."}]}]}/>

仅当 `col` 的类型为 `String` 或 `FixedString` 时，将类似 `col = ''` 或 `'' = col` 的表达式转换为 `empty(col)`，以及将 `col != ''` 或 `'' != col` 转换为 `notEmpty(col)`。

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "通过从由合取构成的析取表达式中抽取公用子表达式，来优化 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新增此设置，用于通过从由合取构成的析取表达式中抽取公用子表达式，来优化 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式。"}]}]}/>

允许在 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式中，从析取（OR 连接的条件）中提取公用子表达式。类似 `(A AND B) OR (A AND C)` 的逻辑表达式可以重写为 `A AND (B OR C)`，这有助于利用：

- 简单过滤表达式中的索引
- 将 cross join 优化为 inner join

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled settings by default"}]}]}/>

启用或禁用通过将某些函数替换为读取子列的方式进行的优化。这样可以减少需要读取的数据量。

可以被转换的函数包括：

- 将 [length](/sql-reference/functions/array-functions#length) 转换为读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- 将 [empty](/sql-reference/functions/array-functions#empty) 转换为读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- 将 [notEmpty](/sql-reference/functions/array-functions#notEmpty) 转换为读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- 将 [isNull](/sql-reference/functions/functions-for-nulls#isNull) 转换为读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- 将 [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) 转换为读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- 将 [count](/sql-reference/aggregate-functions/reference/count) 转换为读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- 将 [mapKeys](/sql-reference/functions/tuple-map-functions#mapkeys) 转换为读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列。
- 将 [mapValues](/sql-reference/functions/tuple-map-functions#mapvalues) 转换为读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列。

可能的取值：

- 0 — 禁用优化。
- 1 — 启用优化。

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "默认启用对常量键的 GROUP BY 优化"}]}]}/>

当数据块中的所有键都是常量时，对 GROUP BY 进行优化

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

消除 `GROUP BY` 子句中对其他键的函数调用

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

将 if(cond1, then1, if(cond2, ...)) 的链式调用替换为 multiIf。目前对数值类型没有性能收益。

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

将 If 和 Transform 中的字符串类型参数替换为枚举类型。默认禁用，因为这可能在分布式查询中引入不一致的更改，从而导致查询失败。

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "在分析阶段的 GROUP BY 部分，将单射函数替换为其参数"}]}]}/>

在 GROUP BY 部分，将单射函数替换为其参数

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\} 

<SettingsInfoBlock type="Bool" default_value="1" />

删除 `uniq*()` 函数中作用于单个参数的单射函数。

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

触发优化时，表达式 `expr = x1 OR ... expr = xN` 的最小长度

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

对表达式 `expr <> x1 AND ... expr <> xN` 进行优化时所需的最小长度。

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在 [SELECT](../../sql-reference/statements/select/index.md) 查询中自动进行 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 优化。

仅对 [*MergeTree](../../engines/table-engines/mergetree-family/index.md) 表生效。

可选值：

- 0 — 禁用自动 `PREWHERE` 优化。
- 1 — 启用自动 `PREWHERE` 优化。

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 [SELECT](../../sql-reference/statements/select/index.md) 查询中启用或禁用自动 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 优化。

仅适用于 [*MergeTree](../../engines/table-engines/mergetree-family/index.md) 表。

可选值：

- 0 — 禁用在带有 `FINAL` 修饰符的 `SELECT` 查询中的自动 `PREWHERE` 优化。
- 1 — 启用在带有 `FINAL` 修饰符的 `SELECT` 查询中的自动 `PREWHERE` 优化。

**另请参阅**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 设置

## optimize_multiif_to_if \{#optimize_multiif_to_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将仅包含一个条件的 `multiIf` 函数替换为 `if` 函数。

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "默认会将语义等同于 count() 的聚合函数重写为 count()"}]}]}/>

默认会将语义等同于 count() 的聚合函数重写为 count()。

## optimize&#95;on&#95;insert

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "默认在 INSERT 时启用数据优化，以提升用户体验"}]}]} />

启用或禁用在插入前的数据转换，就像对该数据块执行了一次合并操作（根据表引擎的实现）。

可能的值：

* 0 — 禁用。
* 1 — 启用。

**示例**

启用与禁用时的区别：

查询：

```sql
SET optimize_on_insert = 1;

CREATE TABLE test1 (`FirstTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY FirstTable;

INSERT INTO test1 SELECT number % 2 FROM numbers(5);

SELECT * FROM test1;

SET optimize_on_insert = 0;

CREATE TABLE test2 (`SecondTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY SecondTable;

INSERT INTO test2 SELECT number % 2 FROM numbers(5);

SELECT * FROM test2;
```

结果：

```text
┌─FirstTable─┐
│          0 │
│          1 │
└────────────┘

┌─SecondTable─┐
│           0 │
│           0 │
│           0 │
│           1 │
│           1 │
└─────────────┘
```

请注意，此设置会影响[物化视图](/sql-reference/statements/create/view#materialized-view)的行为。


## optimize_or_like_chain \{#optimize_or_like_chain\} 

<SettingsInfoBlock type="Bool" default_value="0" />

将多个 OR LIKE 优化为 multiMatchAny。此优化不应默认启用，因为在某些情况下会妨碍索引分析。

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

将针对 `QBit` 数据类型的距离函数替换为等效函数，使其仅从存储中读取参与计算所需的列。

## optimize_read_in_order \{#optimize_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在针对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表读取数据的 [SELECT](../../sql-reference/statements/select/index.md) 查询中启用 [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) 优化。

可选值：

- 0 — 禁用 `ORDER BY` 优化。
- 1 — 启用 `ORDER BY` 优化。

**另请参阅**

- [ORDER BY 子句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \{#optimize_read_in_window_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在窗口子句中启用 ORDER BY 优化，以便在 MergeTree 表中按对应顺序读取数据。

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当函数的参数本身也出现在 ORDER BY 中时，将该函数从 ORDER BY 中移除

## optimize_respect_aliases \{#optimize_respect_aliases\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果设置为 true，则在 WHERE/GROUP BY/ORDER BY 中会使用列别名，有助于分区剪枝、二级索引、optimize_aggregation_in_order、optimize_read_in_order 和 optimize_trivial_count 的优化。

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当在逻辑上等价时，将以 `if` 表达式作为参数的聚合函数重写为等价形式。
例如，`avg(if(cond, col, null))` 可以重写为 `avgOrNullIf(cond, col)`。这可能提升性能。

:::note
仅在启用 analyzer（`enable_analyzer = 1`）时受支持。
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在逻辑等价的情况下，将 arrayExists() 函数重写为 has()。例如，arrayExists(x -> x = 1, arr) 可以重写为 has(arr, 1)。

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

将具有精确前缀或后缀模式的 LIKE 表达式（例如 `col LIKE 'ClickHouse%'`）重写为 `startsWith` 或 `endsWith` 函数（例如 `startsWith(col, 'ClickHouse')`）。

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

将与正则表达式相关的函数改写为更简单、更高效的形式

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "仅在 analyzer 中可用，且行为正确"}]}]}/>

当逻辑等价时，将 sumIf() 和 sum(if()) 函数重写为 countIf() 函数

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在仅存在一个 `level > 0` 且未过期 TTL 的分区片段时，用于启用或禁用对 [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) 查询的优化。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

默认情况下，即使只有一个分区片段，`OPTIMIZE TABLE ... FINAL` 查询也会重写该分区片段。

可能的取值：

- 1 - 启用优化。
- 0 - 禁用优化。

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在包含分片键条件的 [SELECT](../../sql-reference/statements/select/index.md) 查询的 `WHERE/PREWHERE` 子句中跳过无关分片的功能（假设数据是按分片键分布的，否则查询结果将不正确）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

用于限制分片键取值的数量，当达到该限制时，将禁用 `optimize_skip_unused_shards`。

取值过多可能会带来较大的处理开销，而收益却存疑，因为如果 `IN (...)` 中包含大量取值，那么查询很可能无论如何都会被发送到所有分片。

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

控制 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) 在分布式查询中的生效嵌套层级（仍然要求先启用 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)）。适用于存在一个 `Distributed` 表再查询另一个 `Distributed` 表的场景。

可能的取值：

- 0 — 禁用（不限制嵌套层级），`optimize_skip_unused_shards` 在所有层级生效。
- 1 — 仅对第 1 级启用 `optimize_skip_unused_shards`。
- 2 — 对最多第 2 级启用 `optimize_skip_unused_shards`。

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在针对远程分片的查询中重写 IN 子句，以排除不属于该分片的值（需要启用 optimize_skip_unused_shards）。

可能的值：

- 0 — 禁用。
- 1 — 启用。

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\} 

<SettingsInfoBlock type="Bool" default_value="1" />

根据输入流的排序属性来优化排序

## optimize_substitute_columns \{#optimize_substitute_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

使用[约束](../../sql-reference/statements/create/table.md/#constraints)来进行列替换。默认值为 `false`。

可能的取值：

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions

<SettingsInfoBlock type="Bool" default_value="0" />

用于合并具有相同参数的聚合函数。它会将包含至少两个来自 [sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count) 或 [avg](/sql-reference/aggregate-functions/reference/avg)，且参数相同的聚合函数的查询，重写为使用 [sumCount](/sql-reference/aggregate-functions/reference/sumcount)。

可能的值：

* 0 — 不合并具有相同参数的函数。
* 1 — 合并具有相同参数的函数。

**示例**

查询：

```sql
CREATE TABLE fuse_tbl(a Int8, b Int8) Engine = Log;
SET optimize_syntax_fuse_functions = 1;
EXPLAIN SYNTAX SELECT sum(a), sum(b), count(b), avg(b) from fuse_tbl FORMAT TSV;
```

结果：

```text
SELECT
    sum(a),
    sumCount(b).1,
    sumCount(b).2,
    (sumCount(b).1) / (sumCount(b).2)
FROM fuse_tbl
```


## optimize_throw_if_noop \{#optimize_throw_if_noop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [OPTIMIZE](../../sql-reference/statements/optimize.md) 查询未执行合并时是否抛出异常。

默认情况下，即使 `OPTIMIZE` 未执行任何操作也会成功返回。通过此设置，可以区分这些情况，并从异常信息中获知原因。

可能的取值：

- 1 — 启用抛出异常。
- 0 — 禁用抛出异常。

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "通过将基于函数的条件重写为无需类型转换的等价比较来优化 Date 和 DateTime 谓词（例如：toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'）"}]}]}/>

通过将基于函数的条件重写为无需类型转换的等价比较来优化 Date 和 DateTime 谓词（例如：`toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

对支持此类估算的存储（例如 EmbeddedRocksDB）在简单计数优化时使用近似值。

可能的取值：

- 0 — 禁用优化。
   - 1 — 启用优化。

## optimize_trivial_count_query \{#optimize_trivial_count_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对简单查询 `SELECT count() FROM table` 的优化，该优化会利用 MergeTree 的元数据。如果你需要使用行级安全，请禁用此设置。

可能的值：

- 0 — 优化被禁用。
   - 1 — 优化被启用。

See also:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "在许多情况下，这种优化并无意义。"}]}]}/>

优化简单形式的 `INSERT INTO table SELECT ... FROM TABLES` 查询

## optimize_uniq_to_count \{#optimize_uniq_to_count\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果子查询包含 `DISTINCT` 或 `GROUP BY` 子句，则将 `uniq` 及其变体（`uniqUpTo` 除外）重写为 `count`。

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\} 

<SettingsInfoBlock type="Bool" default_value="1" />

自动选择隐式投影以执行 SELECT 查询

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

即使未选择使用投影来执行 SELECT 查询，也允许使用投影来过滤数据分片范围。

## optimize_use_projections \{#optimize_use_projections\} 

**别名**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

在处理 `SELECT` 查询时启用或禁用 [projection](../../engines/table-engines/mergetree-family/mergetree.md/#projections) 优化。

可选值：

- 0 — 禁用 projection 优化。
- 1 — 启用 projection 优化。

## optimize_using_constraints \{#optimize_using_constraints\} 

<SettingsInfoBlock type="Bool" default_value="0" />

使用[约束](../../sql-reference/statements/create/table.md/#constraints)来优化查询。默认值为 `false`。

可选值：

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置。"}]}]}/>

用于物化视图线程的 Linux nice 值。值越低表示 CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不生效。

取值范围：-20 至 19。

## os_threads_nice_value_query \{#os_threads_nice_value_query\} 

**别名**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置。"}]}]}/>

用于查询处理线程的 Linux nice 值。值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不执行任何操作。

可取值范围：-20 到 19。

## output_format_compression_level \{#output_format_compression_level\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "Allow to change compression level in the query output"}]}]}/>

如果查询输出启用了压缩，则该参数为默认压缩级别。此设置在 `SELECT` 查询使用 `INTO OUTFILE` 时，或写入表函数 `file`、`url`、`hdfs`、`s3` 或 `azureBlobStorage` 时生效。

可能的取值范围：从 `1` 到 `22`

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "允许在使用 zstd 压缩时修改查询输出中的 zstd window log"}]}]}/>

当输出压缩方法为 `zstd` 时可用。若该值大于 `0`，此设置会显式指定压缩窗口大小（`2` 的幂），并为 zstd 压缩启用长距离压缩模式。这有助于获得更好的压缩比。

可选值：非负整数。注意，如果该值过小或过大，`zstdlib` 会抛出异常。典型取值范围为 `20`（窗口大小 = `1MB`）到 `30`（窗口大小 = `1GB`）。

## output_format_parallel_formatting \{#output_format_parallel_formatting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对数据格式的并行格式化。仅支持 [TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV) 和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。

可能的值：

- 1 — 启用。
- 0 — 禁用。

## page_cache_block_size \{#page_cache_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "Made this setting adjustable on a per-query level."}]}]}/>

在用户空间页缓存中存储文件块的大小，以字节为单位。所有通过该缓存的读取都会向上取整为此大小的倍数。

该设置可以按查询级别进行调整，但使用不同块大小的缓存条目不能复用。更改此设置实际上会使缓存中已有的条目失效。

较大的值（例如 1 MiB）适用于高吞吐量查询，而较小的值（例如 64 KiB）适用于低延迟的点查询。

## page_cache_inject_eviction \{#page_cache_inject_eviction\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新增用户态页面缓存"}]}]}/>

用户态页面缓存会在某些情况下随机驱逐部分页面。仅用于测试。

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "Made this setting adjustable on a per-query level."}]}]}/>

当用户态页面缓存发生未命中时，如果这些块同样不在缓存中，则会一次性从底层存储中读取最多指定数量的连续块。每个块的大小为 page_cache_block_size 字节。

较大的取值有利于高吞吐量查询，而低延迟的点查询在不进行预读（readahead）时效果更好。

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

启用并行分布式执行 `INSERT ... SELECT` 查询。

如果执行 `INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` 查询，且两个表使用同一个集群，并且两个表要么都是[复制表](../../engines/table-engines/mergetree-family/replication.md)，要么都为非复制表，则该查询会在每个分片上本地执行。

可能的取值：

- `0` — 禁用。
- `1` — `SELECT` 将在分布式引擎的底层表上，于每个分片执行。
- `2` — `SELECT` 和 `INSERT` 将在分布式引擎的底层表上，于每个分片执行（从/向底层表读写）。

使用此设置时，还需要将 `enable_parallel_replicas` 设为 `1`。

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "新设置"}]}]}/>

当使用基于哈希的 join 算法时，此阈值用于决定是使用 `hash` 还是 `parallel_hash`（仅当可以估算右表大小时适用）。
当已知右表大小低于该阈值时，将使用前者（`hash`）。

## parallel_replica_offset \{#parallel_replica_offset\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个内部配置项，不应被直接使用，用于体现 “parallel replicas” 模式的实现细节。对于并行副本中参与查询处理的那个副本的索引，该配置项会在分布式查询时由发起方服务器自动设置。

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "如果为 true，则用于 IN 子句的子查询会在每个 follower 副本上执行"}]}]}/>

如果为 true，则用于 IN 子句的子查询会在每个 follower 副本上执行。

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Separate connection timeout for parallel replicas queries"}]}]}/>

在使用并行副本执行查询时，连接到远程副本的超时时间（以毫秒为单位）。如果发生超时，则对应的副本不会用于查询执行。

## parallel_replicas_count \{#parallel_replicas_count\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个内部设置，不应被直接使用，用于表示“parallel replicas”（并行副本）模式的实现细节。在分布式查询中，该设置会由发起查询的服务器自动配置为参与查询处理的并行副本数量。

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\} 

<BetaBadge/>

一个任意的整数表达式，可用于在特定表的副本之间分配处理任务。
该值可以是任意整数表达式。

优先使用基于主键的简单表达式。

如果在仅包含一个分片但具有多个副本的集群上使用该设置，这些副本将被转换为虚拟分片。
否则，其行为与 `SAMPLE` 键相同，会使用每个分片的多个副本。

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Add settings to control the range filter when using parallel replicas with dynamic shards"}]}]}/>

允许过滤器类型为 `range` 时，基于自定义范围 `[parallel_replicas_custom_key_range_lower, INT_MAX]` 在各个副本之间平均分配工作量。

与 [parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) 结合使用时，它使过滤器能够在副本之间，就范围 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` 平均分配工作量。

注意：此设置不会在查询处理期间导致额外数据被过滤，而是改变了范围过滤器为并行处理拆分范围 `[0, INT_MAX]` 时使用的分割点。

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Add settings to control the range filter when using parallel replicas with dynamic shards. A value of 0 disables the upper limit"}]}]}/>

允许过滤器类型 `range` 基于自定义范围 `[0, parallel_replicas_custom_key_range_upper]` 在副本之间平均分配工作。值为 0 时禁用上界，将其视为自定义键表达式的最大值。

与 [parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) 一起使用时，过滤器可以在副本之间对范围 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` 的工作进行平均划分。

注意：此设置不会在查询处理期间导致额外数据被过滤，而是改变了范围过滤器在将区间 `[0, INT_MAX]` 拆分为可并行处理的子区间时使用的分界点。

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

将表函数引擎替换为其 -Cluster 版本

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，ClickHouse 也会对非复制的 MergeTree 表使用并行副本算法。

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "仅在副本协调器上执行索引分析，并跳过其他副本上的索引分析。仅在启用 parallel_replicas_local_plan 时有效"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "仅在副本协调器上执行索引分析，并跳过其他副本上的索引分析。仅在启用 parallel_replicas_local_plan 时有效"}]}]}/>

仅在副本协调器上执行索引分析，并跳过其他副本上的索引分析。仅在启用 parallel_replicas_local_pla 时有效

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "在启用并行副本的分布式 INSERT SELECT 操作期间使用本地 pipeline。当前因性能问题而被禁用"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "在启用并行副本的分布式 INSERT SELECT 操作期间使用本地 pipeline。当前因性能问题而被禁用"}]}]}/>

在启用并行副本的分布式 INSERT SELECT 操作期间使用本地 pipeline

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}]}/>

为本地副本生成本地执行计划

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "该设置的值现在会自动确定"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "新增设置，用于控制并行副本协调器新实现中的段大小"}]}]}/>

数据分片在逻辑上被划分为若干段，以便在并行读取时在副本之间进行分配。此设置用于控制这些段的大小。不建议修改，除非你完全清楚自己在做什么。取值范围应为 [128, 16384]。

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

将查询中可使用的副本数量限制为（预估读取行数 / min_number_of_rows_per_replica）。最大副本数仍然受 `max_parallel_replicas` 限制。

## parallel_replicas_mode \{#parallel_replicas_mode\} 

<BetaBadge/>

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "This setting was introduced as a part of making parallel replicas feature Beta"}]}]}/>

用于并行副本的自定义键过滤类型。`default` —— 对自定义键使用取模运算；`range` —— 基于自定义键使用范围过滤器，覆盖该自定义键值类型的所有可能取值。

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "仅在启用 analyzer 时才支持并行副本"}]}]}/>

要使用并行副本，必须启用 analyzer。禁用 analyzer 时，即使启用了从副本并行读取，查询执行也会回退到本地执行。未启用 analyzer 时，不支持使用并行副本。

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "如果为 true，且 JOIN 可以使用并行副本算法执行，并且 JOIN 右侧部分的所有存储都是 *MergeTree，将使用本地 JOIN 而不是 GLOBAL JOIN。"}]}]}/>

如果为 true，且 JOIN 可以使用并行副本算法执行，并且 JOIN 右侧部分的所有存储都是 *MergeTree，将使用本地 JOIN 而不是 GLOBAL JOIN。

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置。可以在并行副本中应用对投影的优化。仅在启用 parallel_replicas_local_plan 且 aggregation_in_order 未启用时生效。"}]}]}/>

可以在并行副本中应用对投影的优化。仅在启用 parallel_replicas_local_plan 且 aggregation_in_order 未启用时生效。

## parallel_view_processing \{#parallel_view_processing\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用对已附加视图的并发写入，而非顺序写入。

## parallelize_output_from_storages \{#parallelize_output_from_storages\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "在执行从 file/url/s3 等读取的查询时允许并行化。这可能会改变行的顺序。"}]}]}/>

对从存储读取步骤的输出进行并行化。若条件允许，可在从存储读取之后立即对查询处理进行并行化。

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "改进与 MySQL DATE_FORMAT/STR_TO_DATE 的兼容性"}]}]}/>

在 `parseDateTime` 函数中，格式说明符 `%e` 要求将个位数日期用前导空格补齐，例如，`' 2'` 会被接受，而 `'2'` 会触发错误。

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

函数 `parseDateTime` 中的格式说明符 `%c`、`%l` 和 `%k` 可以在没有前导零的情况下解析月份和小时。

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果不为 0，则会将左表的数据块合并为更大的块，用于部分合并连接的左侧表。每个执行连接的线程最多会使用指定内存的 2 倍。

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

在使用部分归并连接算法执行 [JOIN](../../sql-reference/statements/select/join.md) 查询时，限制右侧参与连接数据块的行数上限。

ClickHouse 服务器会：

1.  将右侧参与连接的数据拆分为若干数据块，每个数据块的行数不超过指定值。
2.  使用每个数据块中的最小值和最大值为其建立索引。
3.  在可能的情况下，将已准备好的数据块写入磁盘。

可能的取值：

- 任意正整数。推荐范围：\[1000, 100000\]。

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许查询在被取消后返回部分结果。

## parts_to_delay_insert \{#parts_to_delay_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果目标表在单个分区中包含的活动分片数量至少达到该值，则会人为减慢对该表的插入操作。

## parts_to_throw_insert \{#parts_to_throw_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果目标表的单个分区中活动数据片段数量超过该值，则会抛出名为 “Too many parts ...” 的异常。

## per_part_index_stats \{#per_part_index_stats\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置。"}]}]}/>

记录每个数据片段（part）的索引统计信息

## poll_interval \{#poll_interval\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

让服务器在查询等待循环中阻塞指定的秒数。

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "允许控制 PostgreSQL 连接的 `connect_timeout` 参数。"}]}]}/>

单次尝试连接 PostgreSQL 端点时的超时时间（秒）。
该值会作为连接 URL 的 `connect_timeout` 参数传递。

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在将连接放回连接池之前关闭该连接。

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "允许控制 PostgreSQL 连接池中 push/pop 操作的重试次数。"}]}]}/>

用于 PostgreSQL 表引擎和数据库引擎的连接池中 push/pop 操作的重试次数。

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

用于 PostgreSQL 表引擎和数据库引擎的连接池大小。

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL 表引擎和数据库引擎在连接池为空时执行 push/pop 操作的超时时间。默认情况下，当连接池为空时将会阻塞等待。

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

用于复制的内部 PostgreSQL 查询发生故障的近似概率。有效取值区间为 [0.0f, 1.0f]。

## prefer&#95;column&#95;name&#95;to&#95;alias

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在查询表达式和子句中使用原始列名而非别名。该设置在别名与列名相同时尤为重要，参见 [Expression Aliases](/sql-reference/syntax#notes-on-usage)。启用此设置可以使 ClickHouse 中别名的语法规则与大多数其他数据库引擎更加兼容。

可能的取值：

* 0 — 列名会被别名替换。
* 1 — 列名不会被别名替换。

**示例**

启用与禁用之间的区别：

查询：

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

结果：

```text
服务器返回异常（版本 21.5.1）：
代码：184. DB::Exception: 来自 localhost:9000。DB::Exception: 查询中发现聚合函数 avg(number) 嵌套在另一个聚合函数内部：处理 avg(number) AS number 时发生错误。
```

查询：

```sql
SET prefer_column_name_to_alias = 1;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

结果：

```text
┌─number─┬─max(number)─┐
│    4.5 │           9 │
└────────┴─────────────┘
```


## prefer_external_sort_block_bytes \{#prefer_external_sort_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "外部排序时优先使用最大块大小（字节），以在合并阶段降低内存占用。"}]}]}/>

外部排序时优先使用最大块大小（字节），以在合并阶段降低内存占用。

## prefer_global_in_and_join \{#prefer_global_in_and_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用将 `IN`/`JOIN` 运算符替换为 `GLOBAL IN`/`GLOBAL JOIN`。

可能的取值：

- 0 — 禁用。`IN`/`JOIN` 运算符不会被替换为 `GLOBAL IN`/`GLOBAL JOIN`。
- 1 — 启用。`IN`/`JOIN` 运算符会被替换为 `GLOBAL IN`/`GLOBAL JOIN`。

**用法**

尽管 `SET distributed_product_mode=global` 可以改变分布式表上的查询行为，但它不适用于本地表或来自外部资源的表。这时就可以使用 `prefer_global_in_and_join` 设置。

例如，我们有提供查询服务的节点，其中包含不适合做成分布式表的本地表。我们需要在分布式处理过程中，借助 `GLOBAL` 关键字（`GLOBAL IN`/`GLOBAL JOIN`），按需即时分发这些表的数据。

`prefer_global_in_and_join` 的另一个使用场景是访问由外部引擎创建的表。该设置有助于在与此类表进行关联时减少对外部源的调用次数：每个查询只需要调用一次。

**另请参阅：**

- [Distributed subqueries](/sql-reference/operators/in#distributed-subqueries) 以了解更多关于如何使用 `GLOBAL IN`/`GLOBAL JOIN` 的信息

## prefer_localhost_replica \{#prefer_localhost_replica\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在处理分布式查询时优先使用本地副本（localhost replica）。

可能的取值：

- 1 — 如果本地副本存在，ClickHouse 始终将查询发送到本地副本。
- 0 — ClickHouse 使用由 [load_balancing](#load_balancing) 设置指定的负载均衡策略。

:::note
如果你在未使用 [parallel_replicas_custom_key](#parallel_replicas_custom_key) 的情况下使用 [max_parallel_replicas](#max_parallel_replicas)，请禁用此设置。
如果设置了 [parallel_replicas_custom_key](#parallel_replicas_custom_key)，仅当其用于包含多个分片且每个分片有多个副本的集群时才应禁用此设置。
如果其用于仅包含单个分片但有多个副本的集群，禁用此设置会产生负面影响。
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

仅在 ClickHouse Cloud 中生效。如果一个已合并的 part 距离当前时间少于指定的秒数且尚未预热（参见 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)），但其所有源 part 都可用且已预热，则 SELECT 查询会改为优先从这些源 part 中读取数据。仅适用于 Replicated-/SharedMergeTree。注意，这里只检查 CacheWarmer 是否处理过该 part；如果该 part 是被其他组件拉入缓存的，在 CacheWarmer 处理到它之前仍会被视为冷数据；如果该 part 曾被预热过，即使之后又从缓存中被逐出，仍然会被视为已预热。

## preferred_block_size_bytes \{#preferred_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

此设置用于调整查询处理时的数据块大小，用于在较为粗粒度的 `max_block_size` 基础上进行更精细的调优。如果列较宽，以至于在包含 `max_block_size` 行时数据块大小可能会超过指定的字节数，则会减小块大小，以改善 CPU 缓存局部性。

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在读取数据时用于限制数据块中单列的最大大小。可帮助减少缓存未命中次数。应设置为接近 L2 缓存大小。

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\} 

如果将其设置为非空字符串，ClickHouse 将会尝试在查询中优先使用指定的 projection。

可能的取值：

- string：首选 projection 的名称

## prefetch_buffer_size \{#prefetch_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

从文件系统读取数据时用于预取的缓冲区的最大大小。

## print&#95;pretty&#95;type&#95;names

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "更好的用户体验。"}]}]} />

允许在 `DESCRIBE` 查询和 `toTypeName()` 函数中，以带缩进的美观格式输出深度嵌套的类型名称。

示例：

```sql
CREATE TABLE test (a Tuple(b String, c Tuple(d Nullable(UInt64), e Array(UInt32), f Array(Tuple(g String, h Map(String, Array(Tuple(i String, j UInt64))))), k Date), l Nullable(String))) ENGINE=Memory;
DESCRIBE TABLE test FORMAT TSVRaw SETTINGS print_pretty_type_names=1;
```

```
a   Tuple(
    b String,
    c Tuple(
        d Nullable(UInt64),
        e Array(UInt32),
        f Array(Tuple(
            g String,
            h Map(
                String,
                Array(Tuple(
                    i String,
                    j UInt64
                ))
            )
        )),
        k Date
    ),
    l Nullable(String)
)
```


## priority \{#priority\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

查询优先级。1 表示最高优先级，数值越大优先级越低；0 表示不使用优先级。

## promql_database \{#promql_database\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新的实验性设置"}]}]}/>

指定 `promql` 方言所使用的数据库名称。空字符串表示当前数据库。

## promql_evaluation_time \{#promql_evaluation_time\} 

<ExperimentalBadge/>

**别名**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "该设置被重命名。之前的名称为 `evaluation_time`。"}]}]}/>

设置在 PromQL 方言中使用的评估时间。`auto` 表示当前时间。

## promql_table \{#promql_table\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新的实验性设置"}]}]}/>

指定由 `promql` 方言使用的 TimeSeries（时序）表的名称。

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

启用在执行查询时，将用户角色从发起查询的节点推送到其他节点。

## query_cache_compress_entries \{#query_cache_compress_entries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

压缩[查询缓存](../query-cache.md)中的条目。可以降低查询缓存的内存占用，但代价是向缓存写入和从缓存读取的速度会变慢。

可选值：

- 0 - 禁用
- 1 - 启用

## query_cache_max_entries \{#query_cache_max_entries\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

当前用户可在[查询缓存](../query-cache.md)中存储的查询结果的最大数量。0 表示不限制。

可能的取值：

- 大于等于 0 的整数。

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

当前用户在[查询缓存](../query-cache.md)中可使用的最大内存（字节）。0 表示无限制。

可能的取值：

- 大于等于 0 的非负整数。

## query_cache_min_query_duration \{#query_cache_min_query_duration\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

查询结果要被存储到[查询缓存](../query-cache.md)中时，查询必须执行的最短时间（以毫秒为单位）。

可能的取值：

- 大于等于 0 的整数。

## query_cache_min_query_runs \{#query_cache_min_query_runs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` 查询在其结果被存入[查询缓存](../query-cache.md)之前必须执行的最小次数。

可能的值：

- 大于等于 0 的整数。

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

控制 [查询缓存](../query-cache.md) 在处理包含 `rand()` 或 `now()` 等非确定性函数的 `SELECT` 查询时的行为。

可能的取值：

- `'throw'` - 抛出异常且不缓存查询结果。
- `'save'` - 缓存查询结果。
- `'ignore'` - 不缓存查询结果且不抛出异常。

## query_cache_share_between_users \{#query_cache_share_between_users\} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果开启该设置，缓存到[查询缓存](../query-cache.md)中的 `SELECT` 查询结果可以被其他用户读取。
出于安全原因，不建议启用此设置。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

将部分结果数据块合并为大小为 [max_block_size](#max_block_size) 的数据块。会降低向 [query cache](../query-cache.md) 插入数据的性能，但可以提高缓存条目的可压缩性（参见 [query_cache_compress-entries](#query_cache_compress_entries)）。

可能的值：

- 0 - 禁用
- 1 - 启用

## query_cache_system_table_handling \{#query_cache_system_table_handling\} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "查询缓存不再缓存针对系统表的查询结果"}]}]}/>

用于控制 [查询缓存](../query-cache.md) 在处理针对系统表的 `SELECT` 查询时的行为，即数据库 `system.*` 和 `information_schema.*` 中的表。

可选值：

- `'throw'` - 抛出异常且不缓存查询结果。
- `'save'` - 缓存查询结果。
- `'ignore'` - 不缓存查询结果且不抛出异常。

## query_cache_tag \{#query_cache_tag\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "用于为查询缓存条目标注标签的新设置项。"}]}]}/>

一个字符串，用作[查询缓存](../query-cache.md)条目的标签。
相同查询如果使用了不同的标签，在查询缓存中会被视为不同的条目。

可能的取值：

- 任意字符串

## query_cache_ttl \{#query_cache_ttl\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

在经过该时间（以秒为单位）后，[query cache](../query-cache.md) 中的条目将被视为过期。

可能的取值：

- 大于等于 0 的正整数。

## query_condition_cache_store_conditions_as_plaintext \{#query_condition_cache_store_conditions_as_plaintext\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

以明文形式存储 [query condition cache](/operations/query-condition-cache) 的过滤条件。
如果启用，system.query_condition_cache 会显示原始过滤条件，从而更容易调试与缓存相关的问题。
默认禁用，因为明文过滤条件可能会暴露敏感信息。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_metric_log_interval \{#query_metric_log_interval\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "新设置。"}]}]}/>

以毫秒为单位的时间间隔，用于收集单个查询的 [query_metric_log](../../operations/system-tables/query_metric_log.md) 数据。

如果设置为任意负值，则从 [query_metric_log 设置](/operations/server-configuration-parameters/settings#query_metric_log) 中读取 `collect_interval_milliseconds` 的值；如果不存在，则默认为 1000。

要禁用对单个查询的采集，将 `query_metric_log_interval` 设置为 0。

默认值：-1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "启用与查询计划相关的一些重构"}]}]}/>

切换“按顺序聚合”的查询计划级优化。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 为 1 时才会生效。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置将来可能以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新设置。"}]}]}/>

当 JOIN 之后的过滤条件对未匹配或已匹配的行始终计算为 false 时，允许将 ANY JOIN 转换为 SEMI JOIN 或 ANTI JOIN。

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

允许在输出列只来自左表时，将 `JOIN` 转换为带 `IN` 的子查询。对于非 ANY 的 JOIN（例如默认的 ALL JOIN），可能会产生错误结果。

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "当 JOIN 之后的过滤条件始终会过滤掉默认值时，允许将 OUTER JOIN 转换为 INNER JOIN"}]}]}/>

当 `JOIN` 之后的过滤条件始终会过滤掉默认值时，允许将 `OUTER JOIN` 转换为 `INNER JOIN`

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

允许在查询计划中仅依赖倒排文本索引执行全文检索过滤。

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

在 EXPLAIN PLAN 中显示内部别名（例如 __table1），而不是使用原始查询中指定的别名。

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在计算完窗口函数后启用多线程，以便进行并行流处理

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否在查询计划层面启用查询优化。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置将来可能会以不向后兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 在查询计划层面禁用所有优化
- 1 - 在查询计划层面启用优化（但仍可通过各自的设置禁用单个优化）

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或关闭一种查询计划级别的优化，该优化会将表达式的执行移动到排序步骤之后。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设为 1 时才生效。

:::note
这是一个专家级设置，只应由开发人员在调试时使用。该设置将来可能以向后不兼容的方式更改或被移除。
:::

可能的值：

- 0 - 禁用
- 1 - 启用

## query_plan_filter_push_down \{#query_plan_filter_push_down\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用在查询计划层面的一项优化，它会将过滤条件下推到执行计划的更底层阶段。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时才会生效。

:::note
这是仅供开发人员在调试时使用的专家级设置。该设置未来可能会发生不向后兼容的更改，或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

如果两个表的 JOIN 键都包含各自 `PRIMARY KEY` 的前缀，则对 JOIN 操作启用分片。支持 `hash`、`parallel_hash` 和 `full_sorting_merge` 算法。通常不会加速查询，但可能减少内存占用。

## query_plan_join_swap_table \{#query_plan_join_swap_table\} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新设置。之前始终选择右表。"}]}]}/>

确定在查询计划中，JOIN 的哪一侧应作为构建表（也称为内表，即在哈希 JOIN 中插入到哈希表中的那一侧）。此设置仅适用于带有 `JOIN ON` 子句的 `ALL` 严格模式的 JOIN。可能的取值为：

- 'auto'：由查询计划器决定使用哪张表作为构建表。
    - 'false'：从不交换表（右表为构建表）。
    - 'true'：始终交换表（左表为构建表）。

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用一种在查询计划层面的优化，该优化会将 ARRAY JOIN 提升到执行计划中更高的位置。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时才会生效。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置未来可能会以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_lift_up_union \{#query_plan_lift_up_union\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制一项查询计划级别的优化：将查询计划中较大的子树提升到 `union` 运算中，从而启用进一步的优化。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置将来可能会以与旧版本不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "添加了用于控制允许使用查询计划进行惰性物化优化的最大阈值的新设置。若为 0，则表示不设限制"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "100"},{"label": "进一步优化"}]}]}/>

控制允许使用查询计划进行惰性物化优化的最大阈值。若为 0，则表示不设限制。

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

限制应用到查询计划的优化步骤总数，参见设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations)。
用于避免在复杂查询上花费过长的优化时间。
在 EXPLAIN PLAN 查询中，当达到此上限后停止继续应用优化，并按当时的状态返回查询计划。
对于常规查询执行，如果实际应用的优化次数超过该设置值，将抛出异常。

:::note
这是一个仅供开发者在调试时使用的高级设置。该设置在未来可能会以向后不兼容的方式更改或被移除。
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

在 `EXPLAIN PLAN` 中的步骤描述的最大长度。

## query_plan_merge_expressions \{#query_plan_merge_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否在查询计划层面启用将连续过滤条件合并的优化。
仅当设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是一个面向专家级用户的设置，仅应由开发人员在调试时使用。该设置将来可能会以向后不兼容的方式更改或被移除。
:::

可能的值：

- 0 - 禁用
- 1 - 启用

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Added new setting to merge filter into join condition"}]}]}/>

允许将筛选条件下推并合并到 `JOIN` 条件中，并将 `CROSS JOIN` 转换为 `INNER JOIN`。

## query_plan_merge_filters \{#query_plan_merge_filters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "允许在查询计划中合并过滤条件"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "允许在查询计划中合并过滤条件。使用新的分析器时，要正确支持过滤下推需要启用该功能。"}]}]}/>

允许在查询计划中合并过滤条件。

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "默认允许对更多表进行 JOIN 重排序"}]}]}/>

优化同一子查询中各个 JOIN 的顺序。目前仅支持极少数场景。
    该值指定可进行优化的最大表数量。

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新增用于惰性物化优化的查询计划相关设置"}]}]}/>

使用查询计划对惰性物化进行优化。

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "允许在支持的存储引擎中，将过滤条件下推到 PREWHERE 表达式"}]}]}/>

允许在支持的存储引擎中，将过滤条件下推到 PREWHERE 表达式

## query_plan_push_down_limit \{#query_plan_push_down_limit\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用一种查询计划级别的优化，该优化会将 LIMIT 下推到执行计划中更底层的阶段。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时才生效。

:::note
这是一个仅供开发人员调试使用的高级设置。此设置未来可能会以向后不兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_read_in_order \{#query_plan_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否在查询计划层面启用“按读取顺序”优化。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置将来可能会以向后不兼容的方式发生变化或被移除。
:::

可能的值：

- 0 - 禁用
- 1 - 启用

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

控制是否启用一种在查询计划层面进行的优化，用于移除冗余的 DISTINCT 步骤。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是一个面向专家的设置，应仅由开发人员在调试时使用。该设置未来可能会以向后不兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "在查询计划中移除冗余排序。例如，删除子查询中与 ORDER BY 子句相关的排序步骤"}]}]}/>

控制是否在查询计划层面启用移除冗余排序步骤的优化，例如删除子查询中与 `ORDER BY` 子句相关的排序步骤。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个面向专家的设置，仅应由开发人员在调试时使用。该设置将来可能以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "新增设置：在查询计划中移除未使用列的优化。"}]}]}/>

控制一项查询计划级别的优化，该优化尝试从查询计划步骤中移除未使用的列（包括输入列和输出列）。
仅当设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是一个面向专家的设置，只应由开发人员在调试时使用。该设置未来可能会以与旧版本不兼容的方式发生变更，或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

用于启用或禁用一种查询计划级别的优化，在对窗口函数进行排序时复用存储的排序顺序。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是仅供开发人员用于调试的专家级设置。该设置在未来可能会以不向后兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_split_filter \{#query_plan_split_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
这是仅供开发人员在调试时使用的高级设置。该设置将来可能会以向后不兼容的方式更改或被移除。
:::

控制在查询计划层面将过滤条件拆分为表达式的优化。
仅当设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 为 1 时生效。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

允许在查询计划中，为基于倒排文本索引构造的过滤条件添加提示（额外谓词）。

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting."}]}]}/>

控制是否在查询计划级别启用一种尝试使用向量相似度索引的优化。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置未来可能以不向后兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\} 

**别名**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "启用新的步骤"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新的 join 步骤，内部变更"}]}]}/>

在查询计划中使用逻辑 join 步骤。  
注意：设置 `query_plan_use_new_logical_join_step` 已被弃用，请改用 `query_plan_use_logical_join_step`。

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

设置 [query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 的 CPU 计时器周期。该计时器仅统计 CPU 时间。

可选值：

- 正整数，单位为纳秒。

    推荐值：

            - 10000000（每秒 100 次）纳秒及以上，用于单个查询。
            - 1000000000（每秒 1 次），用于集群范围的分析。

- 0 表示关闭计时器。

**在 ClickHouse Cloud 中暂时不可用。**

另请参阅：

- 系统表 [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

设置 [query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 的实时时间计时器周期。该计时器按墙钟时间（wall-clock time）计时。

可能的取值：

- 正整数，单位为纳秒。

    推荐取值：

            - 10000000（每秒 100 次）纳秒及以下，适用于单条查询。
            - 1000000000（每秒 1 次），适用于集群范围的分析。

- 0 表示关闭计时器。

**在 ClickHouse Cloud 中暂时不可用。**

另请参阅：

- 系统表 [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

当并发请求数超过允许的最大值时，请求在队列中的等待时间。

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

从 RabbitMQ 读取数据在重试前的等待时间。

## read_backoff_max_throughput \{#read_backoff_max_throughput\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在读取速度较慢时用于减少线程数量的设置。当读取带宽低于该字节/秒阈值时开始统计事件次数。

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

在读取变慢的情况下，尝试保持的最小线程数。

## read_backoff_min_events \{#read_backoff_min_events\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

在读取变慢时用于减少线程数量的设置。达到指定的事件次数后将开始减少线程数量。

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

在读取速度较慢时用于减少线程数量的设置。如果距离上一次事件发生的时间少于指定阈值，则忽略当前事件。

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

用于在读取变慢时减少线程数的设置。仅对耗时至少达到该值的读取操作生效。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。与 read_from_filesystem_cache_if_exists_otherwise_bypass_cache 相同，但针对分布式缓存。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许以被动模式使用文件系统缓存——可以利用已有的缓存项，但不会向缓存中写入新的项。若你为重量级的临时查询启用此设置，而对短时的实时查询保持禁用状态，则有助于避免由于过重查询导致的缓存抖动，并提升系统整体效率。

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新增用户空间页面缓存"}]}]}/>

在被动模式下使用用户空间页面缓存，类似于 read_from_filesystem_cache_if_exists_otherwise_bypass_cache。

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

按主键顺序进行多线程读取时，触发预合并步骤所需读取的数据片段的最小数量。

## read_in_order_use_buffering \{#read_in_order_use_buffering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "按主键顺序读取时在合并前使用缓冲"}]}]}/>

在按主键顺序读取时，在合并前使用缓冲。可以提高查询执行的并行度。

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "在按主键或其单调函数的顺序读取时使用虚拟行。在跨多个数据部分进行查找时非常有用，因为只会访问相关的数据部分。"}]}]}/>

在按主键或其单调函数的顺序读取时使用虚拟行。在跨多个数据部分进行查找时非常有用，因为只会访问相关的数据部分。

## read_overflow_mode \{#read_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

当超出限制时的处理方式。

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当读取的数据量超过某个叶子级限制时应采取的行为。

可选值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果。

## read_priority \{#read_priority\} 

<SettingsInfoBlock type="Int64" default_value="0" />

从本地文件系统或远程文件系统读取数据时的优先级。仅在本地文件系统使用 `pread_threadpool` 方法以及远程文件系统使用 `threadpool` 方法时生效。

## read_through_distributed_cache \{#read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的一个设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。允许从分布式缓存读取数据

## readonly \{#readonly\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 没有只读限制。1 - 仅允许读取请求，以及修改被显式允许的设置。2 - 仅允许读取请求，以及修改除 `readonly` 设置以外的其他设置。

## receive_data_timeout_ms \{#receive_data_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

在从副本接收首个数据包或带有正向进度的数据包前的连接超时时间

## receive_timeout \{#receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

从网络接收数据的超时时间（单位：秒）。如果在该时间间隔内未接收到任何字节，将抛出异常。如果在客户端设置此配置项，套接字的 `send_timeout` 也会在服务器端对应的连接上被设置。

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

设置每行中单个正则表达式的最大匹配次数。可用于在将贪婪正则表达式与 [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 函数一起使用时，防止内存占用过高。

可能的值：

- 正整数。

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

拒绝那些在 Hyperscan 中评估开销可能很大的模式（由于 NFA 状态爆炸）

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\} 

<SettingsInfoBlock type="Float" default_value="2" />

如果重新合并后内存使用量未按该倍数减少，则会禁用重新合并。

## remote_filesystem_read_method \{#remote_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="threadpool" />

从远程文件系统读取数据的方法，可选值：read 或 threadpool。

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="1" />

从远程文件系统读取数据时是否启用预取功能。

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

带退避的读取操作的最大重试次数

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

在尝试从远程磁盘读取数据时的最大等待时间（毫秒）

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

在进行远程读取（URL、S3）时，为了通过 seek 操作跳过数据，而不是通过读取并丢弃（ignore）来跳过数据所需的最小字节数。

## rename_files_after_processing \{#rename_files_after_processing\} 

- **类型：** String

- **默认值：** 空字符串

此设置用于为由 `file` 表函数处理的文件指定重命名模式。设置该选项后，所有由 `file` 表函数读取的文件仅在处理成功时，才会根据包含占位符的指定模式进行重命名。

### 占位符

- `%a` — 原始文件的完整文件名（例如："sample.csv"）。
- `%f` — 原始文件名（不含扩展名）（例如："sample"）。
- `%e` — 原始文件扩展名（包含点号）（例如：".csv"）。
- `%t` — 时间戳（单位：微秒）。
- `%%` — 百分号（"%"）。

### 示例

- 选项：`--rename_files_after_processing="processed_%f_%t%e"`

- 查询：`SELECT * FROM file('sample.csv')`

如果成功读取 `sample.csv` 文件，该文件将被重命名为 `processed_sample_1683473210851438.csv`

## replace_running_query \{#replace_running_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在使用 HTTP 接口时，可以传递 `query_id` 参数。该参数是一个用作查询标识符的任意字符串。
如果此时已经存在来自同一用户且具有相同 `query_id` 的查询，则行为取决于 `replace_running_query` 参数。

`0`（默认）– 抛出异常（如果具有相同 `query_id` 的查询已经在运行，则不允许新查询运行）。

`1` – 取消旧查询并开始运行新查询。

将此参数设置为 1 可用于实现分段条件的提示/联想功能。在输入下一个字符时，如果旧查询尚未完成，则应将其取消。

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

在启用 [replace_running_query](#replace_running_query) 设置时，等待具有相同 `query_id` 的正在运行查询结束的时间。

可能的取值：

- 正整数。
- 0 — 如果服务器已经在执行具有相同 `query_id` 的查询，则抛出异常，并且不允许运行新查询。

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\} 

<SettingsInfoBlock type="Int64" default_value="120" />

指定等待非活动副本执行 [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md) 或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询的时间（以秒为单位）。

可能的取值：

- `0` — 不等待。
- 负整数 — 无限期等待。
- 正整数 — 等待的秒数。

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

在恢复时将外部字典源替换为 Null。适用于测试用途。

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

仅用于测试。将所有外部引擎替换为 Null，以避免发起外部连接。

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

用于测试。将所有外部表函数替换为 Null，以避免发起外部连接。

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新设置。"}]}]}/>

在执行 RESTORE 时，将表引擎从 Replicated*MergeTree 切换为 Shared*MergeTree。

## result&#95;overflow&#95;mode

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

云端默认值：`throw`

设置当结果数据量超出任一限制时要执行的操作。

可选值：

* `throw`：抛出异常（默认）。
* `break`：停止执行查询并返回部分结果，就像源数据已耗尽一样。

使用 `break` 类似于使用 LIMIT。`break` 只会在块级别中断执行。这意味着返回的行数将大于
[`max_result_rows`](/operations/settings/settings#max_result_rows)，是 [`max_block_size`](/operations/settings/settings#max_block_size) 的倍数，
并且取决于 [`max_threads`](/operations/settings/settings#max_threads)。

**示例**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
返回 6666 行数据。...
```


## rewrite_count_distinct_if_with_count_distinct_implementation \{#rewrite_count_distinct_if_with_count_distinct_implementation\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "通过 count_distinct_implementation 配置改写 countDistinctIf"}]}]}/>

允许使用 [count_distinct_implementation](#count_distinct_implementation) 设置来改写 `countDistcintIf`。

可选值：

- true — 允许。
- false — 禁止。

## rewrite_in_to_join \{#rewrite_in_to_join\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

将类似 `x IN 子查询` 的表达式重写为 JOIN。这可能有助于通过 JOIN 重排序来优化整个查询。

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting."}]}]}/>

允许在 S3 中使用分段复制。

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

为 S3 分段上传使用多个线程。这可能会略微增加内存占用。

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

通过向 S3 发送 HEAD 请求检查上传到 S3 的每个对象，以确保上传成功。

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "为 S3 连接超时引入新的专用设置"}]}]}/>

S3 磁盘所使用主机的连接超时时间。

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 s3 引擎表中每次插入时创建一个新文件。若启用，则每次插入都会创建一个新的 S3 对象，其键名模式类似如下：

初始：`data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz`，等等。

可能的取值：

- 0 — 如果未设置 `s3_truncate_on_insert`，`INSERT` 查询会创建一个新文件；如果文件已存在则会失败。
- 1 — 如果未设置 `s3_truncate_on_insert`，`INSERT` 查询在每次插入时都会创建一个新文件，从第二个文件开始使用后缀。

更多详情参见[此处](/integrations/s3#inserting-data)。

## s3_disable_checksum \{#s3_disable_checksum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在向 S3 发送文件时不计算校验和。这样可以避免对文件进行多次额外处理，从而加快写入速度。这样做在大多数情况下是安全的，因为 MergeTree 表的数据无论如何都会由 ClickHouse 计算校验和，并且在通过 HTTPS 访问 S3 时，TLS 层在网络传输过程中已经提供了完整性保护。同时，S3 端的额外校验和仍然可以作为纵深防御的一环。

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "当请求的文件不存在时，允许返回 0 行，而不是在 S3 表引擎中抛出异常"}]}]}/>

在读取指定键时，如果对应文件不存在，则忽略该文件的缺失。

可能的取值：

- 1 — `SELECT` 返回空结果。
- 0 — `SELECT` 抛出异常。

## s3_list_object_keys_size \{#s3_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject 请求在单次批量响应中可以返回的最大文件数

## s3_max_connections \{#s3_max_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

每个服务器的最大连接数。

## s3_max_get_burst \{#s3_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在达到每秒请求数限制之前，可以同时发起的最大请求数量。默认值（0）等于 `s3_max_get_rps`。

## s3_max_get_rps \{#s3_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在触发限流前的 S3 GET 请求每秒最大速率限制。0 表示不限制。

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

在一次分片上传（multipart upload）请求中可并发上传的分片最大数量。0 表示不限制。

## s3_max_part_number \{#s3_max_part_number\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "用于 S3 分片上传的最大分片序号"}]}]}/>

用于 S3 分片上传的最大分片序号。

## s3_max_put_burst \{#s3_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在达到每秒请求数上限之前，可以同时发起的最大请求数量。默认值（0）与 `s3_max_put_rps` 相同。

## s3_max_put_rps \{#s3_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在触发限流之前，每秒允许的 S3 PUT 请求数上限。0 表示不限制。

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "在 S3 中单次复制操作允许的最大数据量"}]}]}/>

在 S3 中单次复制操作允许的最大数据量。仅当将 `s3_allow_multipart_copy` 设为 `true` 时，此设置才会生效。

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

使用单次上传（single-part upload）方式上传到 S3 时，对象的最大大小。

## s3_max_single_read_retries \{#s3_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

单次 S3 读取操作的最大重试次数。

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

在向 S3 写入数据时遇到意外错误时的最大重试次数。

## s3_max_upload_part_size \{#s3_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

在对 S3 执行分片上传时，单个分片的最大上传大小。

## s3_min_upload_part_size \{#s3_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

在向 S3 执行分片上传（multipart upload）时的最小分片大小。

## s3_request_timeout_ms \{#s3_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

在向 S3 发送或从 S3 接收数据时的空闲超时时间。如果单次 TCP 读或写调用阻塞时间超过该值，则认为失败。

## s3_skip_empty_files \{#s3_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "我们希望这能提供更好的用户体验"}]}]}/>

启用或禁用在 [S3](../../engines/table-engines/integrations/s3.md) 引擎的表中跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

当设置为 `true` 时，一旦任意单个 S3 请求遇到可重试的网络错误（例如套接字超时），所有向同一备份端点发送 S3 请求的线程都会被放慢。
当设置为 `false` 时，每个线程会独立于其他线程处理 S3 请求的退避。

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在对 S3 进行分片上传时，每个要上传分片的精确大小（某些实现不支持可变大小的分片）。

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

当 ListObjects 请求未能匹配到任何文件时，抛出错误

## s3_truncate_on_insert \{#s3_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在向 S3 引擎表插入数据前执行截断操作。如果禁用，则当目标 S3 对象已存在时尝试执行插入会抛出异常。

可能的取值：

- 0 — 如果未设置 s3_create_new_file_on_insert，`INSERT` 查询会创建一个新文件；如果文件已存在则插入失败。
- 1 — `INSERT` 查询会使用新数据替换该文件已有的内容。

更多详细信息参见[此处](/integrations/s3#inserting-data)。

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

每当在一次写入中向 S3 上传了 s3_multiply_parts_count_threshold 个分块后，就将 s3_min_upload_part_size 乘以该系数。

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

每当上传到 S3 的分片数量达到该值时，`s3_min_upload_part_size` 会乘以 `s3_upload_part_size_multiply_factor`。

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当设置为 `true` 时，对所有 S3 请求的前两次重试会使用较短的发送和接收超时时间。
当设置为 `false` 时，所有重试都会使用相同的发送和接收超时时间。

## s3_validate_request_settings \{#s3_validate_request_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "允许禁用 S3 请求设置验证"}]}]}/>

启用 S3 请求设置验证。
可能的取值：

- 1 — 验证设置。
- 0 — 不验证设置。

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue 引擎使用的默认 ZooKeeper 路径前缀

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用向 system.s3queue_log 的写入。该值可以通过表设置在每个表上进行覆盖

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

S3Queue 中 Keeper 故障注入的概率。

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置。"}]}]}/>

将 S3Queue 表的旧元数据结构迁移到新的元数据结构

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在经过最后修改时间校验后，对 URL 使用缓存中的 schema（适用于带有 Last-Modified 头的 URL）

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 Azure 表函数进行 schema 推断时使用缓存

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 file 表函数进行模式推断时使用缓存

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 HDFS 表函数推断表结构时使用缓存。

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 S3 表函数进行模式推断时是否使用缓存

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 url 表函数进行模式推断时使用缓存

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "用于通过 data skipping 索引进行过滤的新算法"}]}]}/>

启用索引的批量过滤算法。该算法在所有情况下都应具有更好的表现，但我们保留此设置用于兼容性和精细控制。

## select_sequential_consistency \{#select_sequential_consistency\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
此设置在 SharedMergeTree 和 ReplicatedMergeTree 中的行为不同。有关 `select_sequential_consistency` 在 SharedMergeTree 中行为的更多信息，请参阅 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)。
:::

启用或禁用 `SELECT` 查询的顺序一致性。要求必须禁用 `insert_quorum_parallel`（该设置默认启用）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

用法

当启用顺序一致性时，ClickHouse 只允许客户端在那些包含之前所有使用 `insert_quorum` 执行的 `INSERT` 查询数据的副本上执行 `SELECT` 查询。如果客户端访问的是仅包含部分数据的副本，ClickHouse 将抛出异常。该 SELECT 查询将不会包含尚未写入到仲裁副本（quorum）的数据。

当 `insert_quorum_parallel` 启用（默认）时，`select_sequential_consistency` 不再起作用。因为并行的 `INSERT` 查询可能会写入不同的一组仲裁副本，因此不能保证单个副本已经接收到所有写入。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

将服务器文本日志中不低于指定级别的记录发送到客户端。有效取值：'trace'、'debug'、'information'、'warning'、'error'、'fatal'、'none'

## send_logs_source_regexp \{#send_logs_source_regexp\} 

发送服务器文本日志时，使用指定的正则表达式匹配日志源名称。留空表示匹配所有日志源。

## send_profile_events \{#send_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新设置。是否向客户端发送 ProfileEvents。"}]}]}/>

启用或禁用向客户端发送 [ProfileEvents](/native-protocol/server.md#profile-events) 数据包。

对于不需要 ProfileEvents 的客户端，可以将其禁用以减少网络流量。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## send_progress_in_http_headers \{#send_progress_in_http_headers\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用 `clickhouse-server` 响应中的 `X-ClickHouse-Progress` HTTP 响应头。

要了解更多信息，请参阅 [HTTP 接口说明](../../interfaces/http.md)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## send_timeout \{#send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

向网络发送数据的超时时间（秒）。如果客户端需要发送数据，但在该时间间隔内未能发送任何字节，将会抛出异常。如果在客户端上设置此配置项，那么服务器端对应连接上的套接字也会同时设置 `receive_timeout`。

## serialize_query_plan \{#serialize_query_plan\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

对查询计划进行序列化以用于分布式处理

## session&#95;timezone

<BetaBadge />

设置当前会话或查询的隐式时区。
隐式时区是应用于未显式指定时区的 DateTime/DateTime64 类型值的时区。
该设置优先于全局配置的（服务器级）隐式时区。
当取值为 &#39;&#39;（空字符串）时，表示当前会话或查询的隐式时区等于[服务器时区](../server-configuration-parameters/settings.md/#timezone)。

可以使用函数 `timeZone()` 和 `serverTimeZone()` 来获取会话时区和服务器时区。

可能的取值：

* 来自 `system.time_zones` 的任意时区名称，例如 `Europe/Berlin`、`UTC` 或 `Zulu`

示例：

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

将会话时区 &#39;America/Denver&#39; 应用于未显式指定时区的内部 DateTime：

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
并非所有解析 DateTime/DateTime64 的函数都会遵循 `session_timezone`。这可能导致一些隐蔽的错误。
请参阅下方的示例和解释。
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
结果集为空（0 行）。

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

这是由于使用了不同的解析流程所致：

* 在第一个 `SELECT` 查询中，未显式指定时区的 `toDateTime()` 会采用 `session_timezone` 设置以及全局时区。
* 在第二个查询中，DateTime 是从 String 解析得到的，并继承已有列 `d` 的类型和时区。因此，`session_timezone` 设置和全局时区不会生效。

**另请参阅**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过任一限制时的处理方式。

可选值：

- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果，行为类似于源数据已耗尽。

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "新增设置。默认情况下始终同步数据分片"}]}]}/>

在对 SMT 表执行 MOVE|REPLACE|ATTACH 分区操作后，自动同步对应的数据分片集合。仅适用于 Cloud

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

允许按[短路求值方案](https://en.wikipedia.org/wiki/Short-circuit_evaluation)计算 [if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and) 和 [or](/sql-reference/functions/logical-functions#or) 函数。这样可以优化这些函数中复杂表达式的执行，并防止可能出现的异常（例如在不应发生时出现的除零错误）。

Possible values:

- `enable` — 为适用的函数启用短路函数求值（这些函数可能抛出异常或计算开销较大）。
- `force_enable` — 为所有函数启用短路函数求值。
- `disable` — 禁用短路函数求值。

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "允许仅在所有参数值均为非 NULL 的行上执行带 Nullable 参数的函数"}]}]}/>

用于优化这样一类函数的计算：当任一参数为 NULL 时函数返回 NULL。当函数参数中的 NULL 值比例超过 `short_circuit_function_evaluation_for_nulls_threshold` 时，系统将不再逐行计算该函数，而是直接为所有行返回 NULL，从而避免不必要的计算开销。

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "在启用 short_circuit_function_evaluation_for_nulls 设置时，用于仅在所有参数均为非 NULL 的行上执行带 Nullable 参数函数的 NULL 值比例阈值。"}]}]}/>

在启用 `short_circuit_function_evaluation_for_nulls` 设置时，该阈值用于控制仅在所有参数均为非 `NULL` 的行上执行带 `Nullable` 参数的函数的 `NULL` 值比例。
当包含 `NULL` 值的行数与总行数的比例超过该阈值时，这些包含 `NULL` 值的行将不会被求值。

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "在 system 表中默认禁用目录"}]}]}/>

允许在 system 表中显示数据湖目录。

## show_processlist_include_internal \{#show_processlist_include_internal\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

在 `SHOW PROCESSLIST` 查询结果中显示内部辅助进程。

内部进程包括字典重新加载、可刷新物化视图重新加载、在 `SHOW ...` 查询中执行的辅助 `SELECT`、以及为处理损坏的表而在内部执行的辅助 `CREATE DATABASE ...` 查询等。

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "停止在 Engine=Atomic 的 CREATE 查询中显示表的 UUID"}]}]}/>

设置 `SHOW TABLE` 查询的显示方式。

可能的值：

- 0 — 查询结果中不显示表的 UUID。
- 1 — 查询结果中显示表的 UUID。

## single_join_prefer_left_table \{#single_join_prefer_left_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

对于仅包含一个 JOIN 的查询，在标识符存在歧义时优先使用左表。

## skip&#95;redundant&#95;aliases&#95;in&#95;udf

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "启用后，你可以在同一张表中的多个物化列上多次复用同一个用户定义函数。"}]}]} />

为了简化用户定义函数的使用，冗余别名不会在用户定义函数中保留（会被替换）。

可能的取值：

* 1 — 在 UDF 中跳过（替换）别名。
* 0 — 在 UDF 中不跳过（替换）别名。

**示例**

启用与禁用时的差异：

查询：

```sql
SET skip_redundant_aliases_in_udf = 0;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

结果：

```text
SELECT ((4 + 2) + 1 AS y, y + 2)
```

查询：

```sql
SET skip_redundant_aliases_in_udf = 1;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

结果：

```text
SELECT ((4 + 2) + 1, ((4 + 2) + 1) + 2)
```


## skip_unavailable_shards \{#skip_unavailable_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用静默跳过不可用分片的行为。

如果某个分片的所有副本都不可用，则该分片被视为不可用。副本在以下情况下视为不可用：

- ClickHouse 因任意原因无法连接到该副本。

    在连接副本时，ClickHouse 会进行多次尝试。如果所有尝试都失败，则该副本被视为不可用。

- 无法通过 DNS 解析该副本。

    如果无法通过 DNS 解析副本的主机名，可能表示以下情况：

    - 副本所在主机没有 DNS 记录。这种情况可能出现在使用动态 DNS 的系统中，例如 [Kubernetes](https://kubernetes.io)，其中节点在停机期间可能无法被解析，这并不是错误。

    - 配置错误。ClickHouse 配置文件中包含错误的主机名。

可能的取值：

- 1 — 启用跳过。

    如果某个分片不可用，ClickHouse 将基于部分数据返回结果，并且不会报告节点可用性问题。

- 0 — 禁用跳过。

    如果某个分片不可用，ClickHouse 将抛出异常。

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler 在接收到查询后休眠的时间长度

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\} 

<SettingsInfoBlock type="毫秒" default_value="0" />

在 TCPHandler 中发送数据时的休眠时长

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

通过 `TCPHandler` 发送表状态响应时的休眠时间

## sort_overflow_mode \{#sort_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置在排序前接收的行数超过设定的限制时的处理方式。

可能的取值：

- `throw`: 抛出异常。
- `break`: 停止执行查询并返回当前的部分结果。

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "在 FINAL 优化期间允许将相交的 parts 区间拆分为多层"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "在 FINAL 优化期间允许将相交的 parts 区间拆分为多层"}]}]}/>

在 FINAL 优化期间将相交的 parts 区间拆分为多层

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "在 FINAL 优化期间允许将分片范围拆分为相交和不相交的范围"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "在 FINAL 优化期间允许将分片范围拆分为相交和不相交的范围"}]}]}/>

在 FINAL 优化期间将分片范围拆分为相交和不相交的范围

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制当使用参数 `max_substrings` > 0 调用函数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) 时，是否在结果数组的最后一个元素中包含剩余字符串。

可能的值：

- `0` - 剩余字符串不会包含在结果数组的最后一个元素中。
- `1` - 剩余字符串会包含在结果数组的最后一个元素中。这与 Spark 的 [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 函数和 Python 的 [`string.split()`](https://docs.python.org/3/library/stdtypes.html#str.split) 方法的行为一致。

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在服务器启动时，禁止对可刷新物化视图进行调度，效果等同于执行 `SYSTEM STOP VIEWS`。之后可以通过 `SYSTEM START VIEWS` 或 `SYSTEM START VIEW <name>` 手动启动这些视图。该设置同样适用于新创建的视图。对不可刷新的物化视图无影响。

## storage_file_read_method \{#storage_file_read_method\} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

从存储文件读取数据的方法，可选值：`read`、`pread`、`mmap`。`mmap` 方法不适用于 clickhouse-server（主要用于 clickhouse-local）。

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

在查询 `system.stack_trace` 表时，从管道读取线程信息的最大等待时间。此设置仅用于测试，不应由用户修改。

## stream_flush_interval_ms \{#stream_flush_interval_ms\} 

<SettingsInfoBlock type="毫秒" default_value="7500" />

适用于启用了流式写入的表，在发生超时或某个线程生成了 [max_insert_block_size](#max_insert_block_size) 行时生效。

默认值为 7500。

值越小，数据刷新到表中的频率越高；如果设置得过小，会导致性能下降。

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "默认不允许对 Kafka/RabbitMQ/FileLog 进行直接查询"}]}]}/>

允许对 Kafka、RabbitMQ、FileLog、Redis Streams 和 NATS 引擎直接执行 SELECT 查询。如果存在关联的物化视图，则即使启用了该设置，也不允许执行 SELECT 查询。

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\} 

当类流式引擎从多个队列中读取数据时，用户在写入时需要选择一个要插入的队列。用于 Redis Streams 和 NATS。

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

用于从/向流式存储轮询数据的超时时间。

## system&#95;events&#95;show&#95;zero&#95;values

<SettingsInfoBlock type="Bool" default_value="0" />

允许从 [`system.events`](../../operations/system-tables/events.md) 中选取数值为零的事件。

某些监控系统要求在每个检查点上报所有指标的数值，即使该指标的值为零。

可选值：

* 0 — 禁用。
* 1 — 启用。

**示例**

查询

```sql
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

结果

```text
Ok.
```

查询

```sql
SET system_events_show_zero_values = 1;
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

结果

```text
┌─event────────────────────┬─value─┬─description───────────────────────────────────────────┐
│ QueryMemoryLimitExceeded │     0 │ 查询超出内存限制的次数。 │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。允许通过表引擎 / 表函数（S3、Azure 等）从分布式缓存读取数据。

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

为 [remote](../../sql-reference/table-functions/remote.md) 函数设置根据模式生成的地址的最大数量。

可能的取值：

- 正整数。

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="290" />

在 TCP 开始发送 keepalive 保活探测包之前，连接可以保持空闲的时间（秒）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "在文件系统缓存中为临时数据预留空间时，为获取缓存锁所需的等待时间"}]}]}/>

在文件系统缓存中为临时数据预留空间时，为获取缓存锁所需的等待时间

## temporary_files_buffer_size \{#temporary_files_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

用于写入临时文件的缓冲区大小。缓冲区越大，系统调用次数越少，但内存占用越高。

## temporary_files_codec \{#temporary_files_codec\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

设置在磁盘上执行排序和连接操作时所使用的临时文件压缩编解码器。

可能的取值：

- LZ4 — 应用 [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 压缩。
- NONE — 不进行压缩。

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\} 

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "New setting"}]}]}/>

用于决定是否使用由倒排文本索引构建的提示时，过滤条件所允许的最大选择性。

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

用于测试时，控制是否在文本索引中使用布隆过滤器。

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert \{#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "依赖的物化视图中的去重无法与异步插入同时使用。"}]}]}/>

当 `deduplicate_blocks_in_dependent_materialized_views` 与 `async_insert` 两个设置同时启用时，在执行 INSERT 查询时抛出异常。这样可以保证结果正确性，因为这两个功能无法配合使用。

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许或禁止空的 INSERT 语句，默认启用（在执行空插入时抛出错误）。仅适用于通过 [`clickhouse-client`](/interfaces/cli) 或 [gRPC 接口](/interfaces/grpc) 执行的 INSERT 操作。

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

在对写入操作（INSERT、合并）进行缓存时，忽略来自缓存的错误。

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许你控制在达到 `max_partitions_per_insert_block` 时的行为。

可能的取值：

- `true`  - 当插入块达到 `max_partitions_per_insert_block` 时，会抛出异常。
- `false` - 当达到 `max_partitions_per_insert_block` 时，仅记录警告日志。

:::tip
如果你在修改 [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) 时想要了解对用户的影响，此设置会很有用。
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

在事务中使用不支持的查询时抛出异常

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

在指定的秒数过去后，检查执行速度是否不低于 `min_execution_speed`。

## timeout_overflow_mode \{#timeout_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当查询实际运行时间超过 `max_execution_time`，或预估运行时间超过 `max_estimated_execution_time` 时的处理方式。

可能的取值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，就像源数据已耗尽一样。

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当叶子节点上的查询运行时间超过 `max_execution_time_leaf` 时的处理方式。

可能的取值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，就好像源数据已经耗尽一样。

## totals_auto_threshold \{#totals_auto_threshold\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'` 的阈值。
参见“WITH TOTALS modifier”一节。

## totals_mode \{#totals_mode\} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

当存在 `HAVING` 子句时如何计算 `TOTALS`，以及在同时设置了 `max_rows_to_group_by` 并将 `group_by_overflow_mode` 设为 `'any'` 时如何计算。
参见“WITH TOTALS 修饰符”一节。

## trace_profile_events \{#trace_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用以下功能：在每次更新 profile event 时，收集堆栈跟踪信息，以及 profile event 名称和递增值，并将它们发送到 [trace_log](/operations/system-tables/trace_log)。

可能的取值：

- 1 — 启用 profile events 的跟踪。
- 0 — 禁用 profile events 的跟踪。

## transfer_overflow_mode \{#transfer_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过任一限制时的处理行为。

可能的取值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，就像
源数据已经耗尽一样。

## transform&#95;null&#95;in

<SettingsInfoBlock type="Bool" default_value="0" />

为 [IN](../../sql-reference/operators/in.md) 运算符启用对 [NULL](/sql-reference/syntax#null) 值的相等比较。

默认情况下，`NULL` 值无法比较，因为 `NULL` 表示未定义的值。因此，比较 `expr = NULL` 始终应返回 `false`。启用此设置后，在使用 `IN` 运算符时，`NULL = NULL` 将返回 `true`。

可能的取值：

* 0 — 在 `IN` 运算符中比较 `NULL` 值时返回 `false`。
* 1 — 在 `IN` 运算符中比较 `NULL` 值时返回 `true`。

**示例**

假设有表 `null_in`：

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

查询：

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

结果：

```text
┌──idx─┬────i─┐
│    1 │    1 │
└──────┴──────┘
```

查询：

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 1;
```

结果：

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
└──────┴───────┘
```

**另请参阅**

* [IN 运算符中的 NULL 处理](/sql-reference/operators/in#null-processing)


## traverse_shadow_remote_data_paths \{#traverse_shadow_remote_data_paths\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "在查询 system.remote_data_paths 时，除实际表数据外，还遍历 shadow 目录中的冻结数据。"}]}]}/>

在查询 system.remote_data_paths 时，除实际表数据外，还遍历 shadow 目录中的冻结数据

## union_default_mode \{#union_default_mode\} 

设置用于合并 `SELECT` 查询结果的模式。该设置仅在与 [UNION](../../sql-reference/statements/select/union.md) 一起使用且未显式指定 `UNION ALL` 或 `UNION DISTINCT` 时生效。

可能的取值为：

- `'DISTINCT'` — ClickHouse 在合并查询结果时输出去重后的行。
- `'ALL'` — ClickHouse 在合并查询结果时输出所有行，包括重复的行。
- `''` — 与 `UNION` 一起使用时，ClickHouse 会抛出异常。

示例参见 [UNION](../../sql-reference/statements/select/union.md)。

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在第 N 个数据包位置发送未知数据包，而不是正常的数据包

## update_parallel_mode \{#update_parallel_mode\} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

确定并发 `UPDATE` 查询的执行行为。

可能的取值：

- `sync` - 顺序执行所有 `UPDATE` 查询。
- `auto` - 仅对以下情况顺序执行 `UPDATE` 查询：在一个查询中更新的列与另一个查询表达式中使用的列之间存在依赖关系。
- `async` - 不对 `UPDATE` 查询进行同步。

## update_sequential_consistency \{#update_sequential_consistency\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

如果为 true，则会在执行更新之前先将部件集更新到最新版本。

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

对物化视图查询使用异步执行方式，并可能采用多线程，可以在 INSERT 期间加快视图处理速度，但也会占用更多内存。

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在使用表函数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` 从文件执行 count 操作时，启用对行数的缓存。

该设置默认启用。

## use_client_time_zone \{#use_client_time_zone\} 

<SettingsInfoBlock type="Bool" default_value="0" />

使用客户端时区来解析 DateTime 字符串值，而不是使用服务器时区。

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Use compact format for async INSERT into Distributed tables by default"}]}]}/>

对使用 `Distributed` 引擎的表，在后台（`distributed_foreground_insert`）执行异步 INSERT 时，以紧凑格式存储数据块。

可能的取值：

- 0 — 使用 `user[:password]@host:port#default_database` 目录格式。
- 1 — 使用 `[shard{shard_index}[_replica{replica_index}]]` 目录格式。

:::note

- 当 `use_compact_format_in_distributed_parts_names=0` 时，对集群定义的更改不会应用到后台 INSERT 操作。
- 当 `use_compact_format_in_distributed_parts_names=1` 时，更改集群定义中节点的顺序会改变 `shard_index`/`replica_index`，请注意这一点。
:::

## use_concurrency_control \{#use_concurrency_control\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "默认启用并发控制"}]}]}/>

遵从服务器的并发控制（参见全局服务器设置 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores`）。如果禁用，即使服务器已过载，也允许使用更多线程（在正常使用场景下不建议关闭，主要用于测试）。

## use_hedged_requests \{#use_hedged_requests\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "默认启用 Hedged Requests 功能"}]}]}/>

为远程查询启用 Hedged Requests 机制。它允许针对同一查询与不同副本建立多个连接。
在以下情况下会建立新连接：在 `hedged_connection_timeout` 内尚未成功与副本建立已有连接，
或者在 `receive_data_timeout` 内未收到任何数据。查询将使用第一个发送非空进度数据包的连接（或在开启 `allow_changing_replica_until_first_data_packet` 时，第一个发送数据包的连接）；
其余连接会被取消。支持 `max_parallel_replicas > 1` 的查询。

默认启用。

Cloud 默认值：`1`

## use_hive_partitioning \{#use_hive_partitioning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "默认启用该设置。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "允许在 File、URL、S3、AzureBlobStorage 和 HDFS 引擎中使用 Hive 分区。"}]}]}/>

启用该设置后，ClickHouse 会在类文件表引擎 [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) 的路径（`/name=value/`）中检测 Hive 风格的分区，并允许在查询中将分区列作为虚拟列使用。这些虚拟列的名称与分区路径中的名称相同，只是前面会加上 `_`。

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

开启后，Iceberg 表函数和 Iceberg 存储可以使用 Iceberg 元数据文件缓存。

可能的取值：

- 0 - 禁用
- 1 - 启用

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "默认启用 Iceberg 分区裁剪。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "用于 Iceberg 分区裁剪的新设置。"}]}]}/>

对 Iceberg 表使用分区裁剪

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

当 `IN` 运算符右侧包含子查询或表表达式时，尽量使用索引。

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在使用表索引进行过滤时，`IN` 运算符右侧集合的最大大小。此设置可避免在处理大型查询时，为准备额外数据结构而导致的性能下降和更高的内存占用。零表示不设上限。

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

启用将 JOIN 条件中由 OR 连接的部分下推到对应的输入侧（“部分下推”）。
这样存储引擎可以更早进行过滤，从而减少数据读取量。
该优化保持语义不变，仅在每个顶层 OR 分支都为目标侧提供至少一个确定性的谓词时才会应用。

## use_legacy_to_time \{#use_legacy_to_time\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新增设置。允许用户使用旧版的 toTime 函数逻辑，其行为与 toTimeWithFixedDate 相同。"}]}]}/>

启用后，将使用旧版的 `toTime` 函数，该函数会将带时间的日期转换为某个固定日期，同时保留时间部分。
否则，将使用新版的 `toTime` 函数，该函数会将不同类型的数据转换为 `Time` 类型。
旧版函数始终可以通过 `toTimeWithFixedDate` 访问。

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Added userspace page cache"}]}]}/>

对未启用文件系统缓存的远程磁盘使用用户空间页面缓存。

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

在使用分布式缓存时使用用户空间页缓存。

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新增设置。"}]}]}/>

为 Paimon 表函数启用 Paimon 分区剪枝

## use_query_cache \{#use_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，`SELECT` 查询可以利用[查询缓存](../query-cache.md)。参数 [enable_reads_from_query_cache](#enable_reads_from_query_cache)
和 [enable_writes_to_query_cache](#enable_writes_to_query_cache) 可更细粒度地控制缓存的使用方式。

可能的值：

- 0 - 禁用
- 1 - 启用

## use_query_condition_cache \{#use_query_condition_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新增优化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新增设置。"}]}]}/>

启用[查询条件缓存](/operations/query-condition-cache)。该缓存会存储数据分片中不满足 `WHERE` 子句条件的 granule 范围，
并在后续查询中将这些信息作为临时索引加以复用。

可能的取值：

- 0 - 禁用
- 1 - 启用

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置"}]}]}/>

将 Roaring Bitmap 用于 Iceberg 的位置删除。

## use_skip_indexes \{#use_skip_indexes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

在查询执行时使用数据跳过索引。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

控制在执行带有 FINAL 修饰符的查询时，是否使用跳过索引。

跳过索引可能会排除包含最新数据的行（数据粒度），这可能导致带有 FINAL 修饰符的查询返回不正确的结果。启用此设置时，即使使用 FINAL 修饰符也会应用跳过索引，可以提升性能，但存在遗漏最近更新的风险。此设置应与 use_skip_indexes_if_final_exact_mode 设置保持同步（默认启用）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "设置的默认值发生变更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "引入此设置是为了帮助带有 FINAL 的查询在使用 skip indexes 时返回正确结果"}]}]}/>

控制在执行带有 FINAL 修饰符的查询时，是否在较新的 part 中展开由 skip index 返回的 granule，以确保结果正确。

使用 skip index 可能会排除包含最新数据的行（granule），从而导致结果不正确。启用此设置后，会扫描与 skip index 返回的范围有重叠的较新 part，以确保返回正确结果。仅当应用可以接受基于 skip index 查找的近似结果时，才应禁用此设置。

可能的值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

在读取数据时启用数据跳过索引。

启用后，会在读取每个数据粒度（granule）时动态评估数据跳过索引，而不是在查询执行开始前进行预先分析。这可以降低查询启动延迟。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_statistics_cache \{#use_statistics_cache\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

在查询中使用统计信息缓存，从而避免为每个数据分片加载统计信息所带来的开销

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "改进在表函数中使用插入表结构的行为"}]}]}/>

使用插入表的结构，而不是根据数据推断表结构。可选值：0 - 禁用，1 - 启用，2 - 自动

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否使用反序列化的文本索引字典块缓存。
在处理大量文本索引查询时，使用文本索引字典块缓存可以显著降低延迟并提高吞吐量。

## use_text_index_header_cache \{#use_text_index_header_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否使用文本索引头部反序列化结果的缓存。
在处理大量文本索引查询时，使用文本索引头部缓存可以显著降低延迟并提高吞吐量。

## use_text_index_postings_cache \{#use_text_index_postings_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否使用反序列化后的文本索引倒排列表缓存。
在处理大量文本索引查询时，使用文本索引倒排列表缓存可以显著降低延迟并提高吞吐量。

## use_uncompressed_cache \{#use_uncompressed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

是否使用未压缩数据块缓存。可取值为 0 或 1。默认值为 0（禁用）。
在处理大量短查询时，使用未压缩缓存（仅适用于 MergeTree 系列表）可以显著降低延迟并提高吞吐量。建议为那些频繁发送短请求的用户启用此设置。同时还要注意 [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 配置参数（只能在配置文件中设置）——未压缩缓存数据块的大小。默认值为 8 GiB。未压缩缓存会按需填充，最少使用的数据会被自动删除。

对于读取数据量较大（例如一百万行或以上）的查询，会自动禁用未压缩缓存，以便为真正的小查询节省空间。这意味着可以始终将 `use_uncompressed_cache` 设置为 1。

## use&#95;variant&#95;as&#95;common&#95;type

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "允许在 if/multiIf 的参数类型不存在公共类型时使用 Variant"}]}]} />

允许在各参数类型不存在公共类型时，将 `Variant` 类型用作 [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 函数的结果类型。

示例：

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(if(number % 2, number, range(number))) as variant_type FROM numbers(1);
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant_type───────────────────┐
│ Variant(Array(UInt64), UInt64) │
└────────────────────────────────┘
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL)) AS variant_type FROM numbers(1);
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
─variant_type─────────────────────────┐
│ Variant(Array(UInt8), String, UInt8) │
└──────────────────────────────────────┘

┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(array(range(number), number, 'str_' || toString(number))) as array_of_variants_type from numbers(1);
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants_type────────────────────────┐
│ Array(Variant(Array(UInt64), String, UInt64)) │
└───────────────────────────────────────────────┘

┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(map('a', range(number), 'b', number, 'c', 'str_' || toString(number))) as map_of_variants_type from numbers(1);
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants_type────────────────────────────────┐
│ Map(String, Variant(Array(UInt64), String, UInt64)) │
└─────────────────────────────────────────────────────┘

┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```


## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "在 ORDER BY 子句中，位于 WITH FILL 列之前的列构成排序前缀。排序前缀取值不同的行会被分别填充"}]}]}/>

在 ORDER BY 子句中，位于 WITH FILL 列之前的列构成排序前缀。排序前缀取值不同的行会被分别填充

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置"}]}]}/>

如果启用，则会在 `IN`、`NOT IN`、`==`、`!=` 等运算符中，依据枚举类型校验枚举字面量；如果某个字面量不是有效的枚举值，则抛出异常。

## validate_mutation_query \{#validate_mutation_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "用于默认验证 mutation 查询的新设置。"}]}]}/>

在接受 mutation 查询之前对其进行验证。Mutation 在后台执行，运行无效查询会导致 mutation 阻塞，需要人工干预。

仅在遇到向后不兼容的缺陷时才修改此设置。

## validate_polygons \{#validate_polygons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "在 pointInPolygon 函数中，如果多边形无效，默认抛出异常，而不是返回可能错误的结果"}]}]}/>

用于控制在 [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 函数中，当多边形自相交或自相切时是否抛出异常。

可能的取值：

- 0 — 不抛出异常。`pointInPolygon` 接受无效多边形，并可能为其返回不正确的结果。
- 1 — 抛出异常。

## vector_search_filter_strategy \{#vector_search_filter_strategy\} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

如果一个向量搜索查询包含 WHERE 子句，此设置决定是先对 WHERE 条件求值（预过滤），还是先使用向量相似度索引（后过滤）。可选值如下：

- 'auto' - 后过滤（其具体语义未来可能会发生变化）。
- 'postfilter' - 使用向量相似度索引确定最近邻，然后再应用其他过滤条件。
- 'prefilter' - 先评估其他过滤条件，然后执行暴力搜索以确定邻居。

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\} 

**别名**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "作为设置 'vector_search_postfilter_multiplier' 的别名"}]}]}/>

将从向量相似度索引中获取的最近邻数量乘以该数值。仅在与其他谓词组合执行后过滤时，或在将 `vector_search_with_rescoring` 设置为 `1` 时生效。

## vector_search_with_rescoring \{#vector_search_with_rescoring\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

是否让 ClickHouse 对使用向量相似度索引的查询执行重新打分（rescoring）。
如果不进行重新打分，向量相似度索引会直接返回包含最佳匹配的行。
开启重新打分时，这些行会被扩展到 granule 级别，并对该 granule 中的所有行再次进行检查。
在大多数情况下，重新打分对准确性的提升非常有限，但会显著降低向量搜索查询的性能。
注意：在未开启重新打分但启用了并行副本的情况下，查询可能会退回到带有重新打分的执行方式。

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

等待已提交的变更在最新快照中实际可见

## wait_for_async_insert \{#wait_for_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则会等待异步插入的处理完成。

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

等待异步插入处理完成的超时时间

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

在事件时间处理过程中等待 window view 触发信号的超时时间。

## window_view_clean_interval \{#window_view_clean_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

以秒为单位设置 window view 的清理间隔，用于清除过期数据。

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

以秒为单位的心跳间隔，用于指示 watch 查询仍在运行。

## workload \{#workload\} 

<SettingsInfoBlock type="String" default_value="default" />

用于访问资源的工作负载名称

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

将完整路径（包括 s3://）写入 Iceberg 元数据文件。

## write_through_distributed_cache \{#write_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的设置项"}]}]}/>

仅在 ClickHouse Cloud 中生效。允许写入分布式缓存（对 S3 的写入也将通过分布式缓存完成）。

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New cloud setting"}]}]}/>

仅在 ClickHouse Cloud 中有效。设置直写（write-through）分布式缓存的缓冲区大小。如果设置为 0，则使用在没有分布式缓存时本应使用的缓冲区大小。

## zstd_window_log_max \{#zstd_window_log_max\} 

<SettingsInfoBlock type="Int64" default_value="0" />

用于选择 ZSTD 的最大 windowLog（不适用于 MergeTree 系列）