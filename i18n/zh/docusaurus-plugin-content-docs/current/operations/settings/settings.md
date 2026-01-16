---
title: '会话设置'
sidebar_label: '会话设置'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: '可在 ``system.settings`` 表中查看的设置。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自动生成 */ }

下文所述的所有设置也可以在表 [system.settings](/docs/operations/system-tables/settings) 中找到。这些设置是从 [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) 自动生成的。


## add_http_cors_header \{#add_http_cors_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

写入 HTTP CORS 响应头部。

## additional_result_filter \{#additional_result_filter\}

应用于 `SELECT` 查询结果的附加过滤表达式。
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


## additional_table_filters \{#additional_table_filters\}

<SettingsInfoBlock type="Map" default_value="{}" />

在从指定表中读取数据后应用的附加过滤表达式。

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


## aggregate_function_input_format \{#aggregate_function_input_format\}

<SettingsInfoBlock type="AggregateFunctionInputFormat" default_value="state" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "用于在 INSERT 操作期间控制 AggregateFunction 输入格式的新设置。默认将该设置值设为 state"}]}]} />

在执行 INSERT 操作时 AggregateFunction 的输入格式。

可能的取值为：

* `state` — 包含已序列化状态的二进制字符串（默认值）。这是默认行为，此时 AggregateFunction 的值应作为二进制数据提供。
* `value` — 格式期望为聚合函数参数的单个值；如果有多个参数，则期望为这些参数的一个 tuple。它们将使用对应的 IDataType 或 DataTypeTuple 进行反序列化，然后聚合以形成状态。
* `array` — 格式期望为一个值的 Array，如上面 `value` 选项所述。数组中的所有元素将被聚合以形成状态。

**示例**

对于一个结构如下的表：

```sql
CREATE TABLE example (
    user_id UInt64,
    avg_session_length AggregateFunction(avg, UInt32)
);
```

当 `aggregate_function_input_format = 'value'` 时：

```sql
INSERT INTO example FORMAT CSV
123,456
```

将 `aggregate_function_input_format` 设置为 `'array'` 时：

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

注意：`value` 和 `array` 格式比默认的 `state` 格式更慢，因为它们在插入时需要创建并聚合这些值。


## aggregate_functions_null_for_empty \{#aggregate_functions_null_for_empty\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对查询中的所有聚合函数进行重写，在它们后面添加 [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) 后缀。可在需要符合 SQL 标准兼容性时启用此设置。
该功能通过查询重写实现（类似于 [count&#95;distinct&#95;implementation](#count_distinct_implementation) 设置），从而在分布式查询中获得一致的结果。

可能的取值：

* 0 — 禁用。
* 1 — 启用。

**示例**

考虑下面这个带有聚合函数的查询：

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

将 `aggregate_functions_null_for_empty` 设置为 0 时，将会得到：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

当将 `aggregate_functions_null_for_empty` 设置为 1 时，结果为：

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

按主键顺序聚合时累积的块的最大大小（字节）。较小的块大小可以在聚合的最终合并阶段实现更高的并行度。

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在内存高效模式下，用于合并中间聚合结果的线程数。值越大，内存消耗越多。0 表示与 `max_threads` 相同。

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\}

<SettingsInfoBlock type="Bool" default_value="0" />

当分区键与 GROUP BY 键一致时，在独立线程上启用对分区的独立聚合。当分区数量接近 CPU 核心数且各分区大小大致相同时，该设置效果最佳。

## allow_archive_path_syntax \{#allow_archive_path_syntax\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "添加了新的设置，可用于禁用归档路径语法。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "添加了新的设置，可用于禁用归档路径语法。"}]}]}/>

File/S3 引擎/表函数在归档文件具有正确扩展名时，会将包含 `::` 的路径解析为 `<archive>::<file>`。

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用后台 I/O 池从 MergeTree 表中读取数据。此设置可能会提升 I/O 受限查询的性能。

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用此设置，在对冲请求中，即使我们已经取得了一些进展（但在 `receive_data_timeout` 超时时间内进度没有更新），在收到第一个数据包之前仍然可以建立新的连接；否则，一旦我们首次取得进展，就会禁止切换副本。

## allow_create_index_without_type \{#allow_create_index_without_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在不指定 TYPE 的情况下执行 CREATE INDEX 查询。该查询将被忽略。用于 SQL 兼容性测试。

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\}

<SettingsInfoBlock type="Bool" default_value="0" />

在函数 throwIf() 中启用自定义错误码。若为 true，被抛出的异常可能会具有非预期的错误码。

## allow_ddl \{#allow_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

将其设置为 `true` 时，允许用户执行 DDL 查询。

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建基于已弃用 Ordinary 引擎的数据库

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "允许使用已弃用且易出错的窗口函数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）"}]}]}/>

允许使用已弃用且易出错的窗口函数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "禁用已弃用函数 snowflakeToDateTime[64] 和 dateTime[64]ToSnowflake。"}]}]}/>

函数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake` 和 `dateTime64ToSnowflake` 已被弃用，并且默认处于禁用状态。
请改用函数 `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID` 和 `dateTime64ToSnowflakeID`。

要重新启用这些已弃用的函数（例如在迁移过渡期间），请将此设置设为 `true`。

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用已弃用的引擎定义语法来创建 *MergeTree 表

## allow_distributed_ddl \{#allow_distributed_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

当设置为 `true` 时，允许用户执行分布式 DDL 查询。

## allow_drop_detached \{#allow_drop_detached\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许执行 ALTER TABLE ... DROP DETACHED PART[ITION] ... 语句

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "默认禁止在 JOIN 键中使用 Dynamic 类型"}]}]}/>

允许在 JOIN 键中使用 Dynamic 类型。为兼容性目的添加。不建议在 JOIN 键中使用 Dynamic 类型，因为与其他类型进行比较时可能会产生意外结果。

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许以列式方式执行 multiIf 函数

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

允许创建使用 Alias 引擎的表。

## allow_experimental_analyzer \{#allow_experimental_analyzer\}

**别名**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "默认启用分析器和计划器。"}]}]}/>

允许使用新的查询分析器。

## allow_experimental_codecs \{#allow_experimental_codecs\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

如果将其设置为 true，则允许指定实验性的压缩编解码器（但目前还没有任何此类编解码器，因此该选项实际上不起任何作用）。

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "将关联子查询的支持标记为 Beta 功能。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新增用于允许执行关联子查询的设置项。"}]}]}/>

允许执行关联子查询。

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\}

<BetaBadge/>

**别名**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "允许使用 catalog_type = 'glue' 的实验性 DataLakeCatalog 数据库引擎"}]}]}/>

允许使用 catalog_type = 'glue' 的实验性 DataLakeCatalog 数据库引擎

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "允许在 catalog_type = 'hive' 时使用实验性数据库引擎 DataLakeCatalog"}]}]}/>

允许在 catalog_type = 'hms' 时使用实验性数据库引擎 DataLakeCatalog

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\}

<BetaBadge/>

**别名**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

允许使用 catalog_type = 'iceberg' 的实验性数据库引擎 DataLakeCatalog。

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建使用 Engine=MaterializedPostgreSQL(...) 的数据库。

## allow_experimental_database_paimon_rest_catalog \{#allow_experimental_database_paimon_rest_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting"}]}]}/>

允许使用实验性数据库引擎 DataLakeCatalog（catalog_type = 'paimon_rest'）

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\}

<BetaBadge/>

**别名**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "允许使用 catalog_type = 'unity' 的实验性数据库引擎 DataLakeCatalog"}]}]}/>

允许使用 catalog_type = 'unity' 的实验性 DataLakeCatalog 数据库引擎

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

启用 delta-kernel-rs 的实验性实现。

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

启用 delta-kernel 写入特性。

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用实验性的漏斗分析函数。

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用实验性哈希函数

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置"}]}]}/>

允许显式对 Iceberg 表使用 `OPTIMIZE`。

## allow_experimental_insert_into_iceberg \{#allow_experimental_insert_into_iceberg\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

允许执行向 Iceberg 插入数据的 `insert` 查询。

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "如果将其设置为 true，并且满足 `join_to_sort_minimum_perkey_rows` 和 `join_to_sort_maximum_table_rows` 的条件，则会按键对右表重新排序，以提升左连接或内哈希连接的性能"}]}]}/>

如果将其设置为 true，并且满足 `join_to_sort_minimum_perkey_rows` 和 `join_to_sort_maximum_table_rows` 的条件，则会按键对右表重新排序，以提升左连接或内哈希连接的性能。

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "允许使用实验性的 Kafka 存储引擎，将已提交的偏移量存储在 ClickHouse Keeper 中"}]}]}/>

允许启用将 Kafka 相关偏移量存储在 ClickHouse Keeper 中的实验性功能。启用后，可以在 Kafka 表引擎中指定 ClickHouse Keeper 路径和副本名称。这样将使用一种新的存储引擎类型来替代常规的 Kafka 引擎，该引擎主要将已提交的偏移量存储在 ClickHouse Keeper 中。

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置"}]}]}/>

启用 Kusto Query Language (KQL) —— 一种替代 SQL 的查询语言。

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用 `MaterializedPostgreSQL` 表引擎。该功能为实验性质，默认关闭。

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用自然语言处理相关的实验性函数。

## allow_experimental_object_storage_queue_hive_partitioning \{#allow_experimental_object_storage_queue_hive_partitioning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "新配置。"}]}]}/>

允许在 S3Queue/AzureQueue 引擎中使用 Hive 分区

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\}

**别名**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 SELECT 查询时，每个分片最多使用 `max_parallel_replicas` 个副本。读取将被并行化并动态协调。0 - 禁用，1 - 启用，在发生故障时静默禁用，2 - 启用，在发生故障时抛出异常。

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

启用 PRQL —— 一种 SQL 的替代方案。

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

基于 part UUID 的 SELECT 查询实验性去重功能

## allow_experimental_statistics \{#allow_experimental_statistics\}

<ExperimentalBadge/>

**别名**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "该设置已被重命名。之前的名称为 `allow_experimental_statistic`。"}]}]}/>

允许定义带有[统计信息](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table)的列，并且[对统计信息进行操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)。

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\}

<ExperimentalBadge/>

**别名**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于启用实验性 timeSeries* 聚合函数的新设置。"}]}]}/>

实验性 timeSeries* 聚合函数，用于类 Prometheus 的时间序列重采样、速率和增量计算。

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Added new setting to allow the TimeSeries table engine"}]}]}/>

允许使用 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎创建表。取值：

- 0 — 禁用 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎。
- 1 — 启用 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 表引擎。

## allow_experimental_window_view \{#allow_experimental_window_view\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

启用 WINDOW VIEW。该功能尚不够成熟。

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

用于与 YTsaurus 集成的实验性字典数据源。

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新增设置。"}]}]}/>

用于与 YTsaurus 集成的实验性表引擎。

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

用于集成 YTsaurus 的实验性表引擎。

## allow_general_join_planning \{#allow_general_join_planning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "在启用哈希 JOIN 算法时，允许使用更通用的 JOIN 规划算法。"}]}]}/>

允许使用更通用的 JOIN 规划算法，以处理更复杂的条件，但它仅适用于哈希 JOIN。
如果未启用哈希 JOIN，则无论该设置的值为何，都会使用常规的 JOIN 规划算法。

## allow_get_client_http_header \{#allow_get_client_http_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "引入了一个新函数。"}]}]}/>

允许使用函数 `getClientHTTPHeader` 来获取当前 HTTP 请求中某个头部字段的值。出于安全原因，该设置默认未启用，因为某些请求头（例如 `Cookie`）可能包含敏感信息。请注意，`X-ClickHouse-*` 和 `Authentication` 请求头始终受限制，无法通过此函数获取。

## allow_hyperscan \{#allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许使用 Hyperscan 库的函数。禁用该设置可避免潜在的长时间编译以及过多的资源消耗。

## allow_introspection_functions \{#allow_introspection_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用用于查询性能分析的[自省函数](../../sql-reference/functions/introspection.md)。

可能的取值：

- 1 — 启用自省函数。
- 0 — 禁用自省函数。

**另请参阅**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- 系统表 [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "不允许创建引用不存在列或表的 MV"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "在 CREATE MATERIALIZED VIEW 中支持（但尚未启用）更严格的校验"}]}]}/>

即使 SELECT 查询引用了不存在的表或列，也允许执行 CREATE MATERIALIZED VIEW。该语句仍然必须在语法上有效。不适用于可刷新的 MV。不适用于需要从 SELECT 查询推断 MV schema 的情况（即 CREATE 语句没有列列表且没有 TO 表时）。可用于在其源表创建之前先创建 MV。

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

默认允许对 named collection 中的字段进行覆盖。

## allow_non_metadata_alters \{#allow_non_metadata_alters\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许执行不仅修改表元数据、还会修改磁盘上数据的 ALTER 操作

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "在某些与时间相关的函数中（如 toTimeZone()、fromUnixTimestamp*()、snowflakeToDateTime*()）允许使用非常量时区参数。"}]}]}/>

在某些与时间相关的函数中（如 `toTimeZone()`、`fromUnixTimestamp*()`、`snowflakeToDateTime*()`）允许使用非常量时区参数。
该设置仅出于兼容性考虑而存在。在 ClickHouse 中，时区是数据类型以及相应列的属性。
启用此设置会让人误以为同一列中的不同值可以具有不同的时区。
因此，请不要启用此设置。

## allow_nondeterministic_mutations \{#allow_nondeterministic_mutations\}

<SettingsInfoBlock type="Bool" default_value="0" />

用户级别设置，允许在副本表上执行变更时使用诸如 `dictGet` 之类的非确定性函数。

由于例如字典在不同节点之间可能存在不同步的情况，默认情况下，副本表上不允许执行从这些字典中获取值的变更操作。启用此设置后将允许这种行为，此时由用户自行确保所使用的数据在所有节点之间保持同步。

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

允许在分片键中使用非确定性函数（例如 `rand` 或 `dictGet`，后者在更新时存在一些注意事项）。

可能的值：

- 0 — 不允许。
- 1 — 允许。

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果所有分区片段都在本地文件系统上，则优先使用预取读取线程池

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果所有分区片段都位于远程文件系统上，则优先使用预取读取线程池

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

允许在启用 analyzer 时，在 AST 层面对分布式子查询执行谓词下推。

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在子查询包含 WITH 子句时进行谓词下推

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

在将条件从 WHERE 移动到 PREWHERE 时，允许对其重新排序以优化过滤

## allow_settings_after_format_in_insert \{#allow_settings_after_format_in_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "不允许在 INSERT 查询的 FORMAT 之后使用 SETTINGS，因为 ClickHouse 会将 SETTINGS 解析为某些值，具有误导性"}]}]} />

控制是否允许在 `INSERT` 查询的 `FORMAT` 之后使用 `SETTINGS`。不推荐启用此功能，因为这可能会将 `SETTINGS` 的部分内容解析为值。

示例：

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

但下列查询仅在启用 `allow_settings_after_format_in_insert` 时才有效：

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

可能的取值：

* 0 — 不允许。
* 1 — 允许。

:::note
仅当你的使用场景依赖旧语法且需要保持向后兼容时，才使用此设置。
:::


## allow_simdjson \{#allow_simdjson\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果可用 AVX2 指令，则允许在 `JSON*` 函数中使用 simdjson 库。若禁用，则改用 rapidjson 库。

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "在某些输出格式中启用对 Sparse/Replicated 等特殊列表示形式的直接输出"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "新增一个设置，允许输出 Sparse/Replicated 等特殊列表示形式，而无需将其转换为完整列"}]}]}/>

允许输出具有 Sparse 和 Replicated 等特殊序列化类型的列，而无需将其转换为完整列表示形式。
这有助于在格式化期间避免不必要的数据复制。

## allow_statistics_optimize \{#allow_statistics_optimize\}

<BetaBadge/>

**别名**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "默认启用此优化。"}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "该设置已被重命名。先前的名称为 `allow_statistic_optimize`。"}]}]}/>

允许使用统计信息来优化查询。

## allow_suspicious_codecs \{#allow_suspicious_codecs\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "禁止指定无意义的压缩编解码器"}]}]}/>

如果设置为 true，则允许指定无意义的压缩编解码器。

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 `CREATE TABLE` 语句中允许创建类型为 `FixedString(n)` 且 `n > 256` 的列。长度 `>= 256` 的 `FixedString` 被视为可疑，极有可能表示被误用。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "如果为 true，则允许使用相同表达式定义索引"}]}]}/>

拒绝具有相同表达式的主/次级索引和排序键

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许或限制在固定大小不超过 8 字节的数据类型上使用 [LowCardinality](../../sql-reference/data-types/lowcardinality.md)：数值数据类型和 `FixedString(8_bytes_or_less)`。

对于这类小固定大小的值，使用 `LowCardinality` 通常效率不高，因为 ClickHouse 会为每一行存储一个数值索引。其结果是：

- 磁盘空间占用可能增加。
- RAM 占用可能更高，具体取决于字典大小。
- 某些函数由于额外的编码/解码操作可能运行得更慢。

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表中，由于以上所有原因，合并时间可能会增加。

可能的取值：

- 1 — 不限制使用 `LowCardinality`。
- 0 — 限制使用 `LowCardinality`。

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "禁止在 MergeTree 中使用可疑的 PRIMARY KEY/ORDER BY（例如包含 SimpleAggregateFunction 的键）"}]}]}/>

允许在 MergeTree 中使用可疑的 `PRIMARY KEY`/`ORDER BY`（例如包含 SimpleAggregateFunction 的键）。

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "这是一个新的设置，在之前的版本中，其行为等同于允许。"}]}]}/>

拒绝任何不依赖于表中任意列的生存时间 (TTL) 表达式。这在大多数情况下表明是用户错误。

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "默认情况下不允许在 GROUP BY 中使用 Variant/Dynamic 类型"}]}]}/>

允许或禁止在 GROUP BY 键中使用 [Variant](../../sql-reference/data-types/variant.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 类型。

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "默认不允许在 ORDER BY 子句中使用 Variant/Dynamic 类型"}]}]}/>

控制是否允许在 ORDER BY 子句的键中使用 [Variant](../../sql-reference/data-types/variant.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 类型。

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "默认不允许创建包含可疑变体的 Variant 类型"}]}]}/>

在 CREATE TABLE 语句中允许指定包含类型相近变体的 Variant 类型（例如，不同的数值或日期类型）。启用此设置后，在处理这类相近类型的值时可能会引入一定的歧义。

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许对 `system.zookeeper` 表进行不受限制的读取（对路径不加任何条件），在某些情况下很方便，但对 ZooKeeper 来说并不安全

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\}

<SettingsInfoBlock type="Bool" default_value="0" />

以异步方式执行 ALTER TABLE MOVE ... TO [DISK|VOLUME]

## alter_partition_verbose_result \{#alter_partition_verbose_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用：对于已成功执行的分区和分区片段操作，是否显示相应的分区和分区片段信息。
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

**别名**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

允许配置在执行 [ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md) 或 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询时，是否以及如何等待在副本上执行的操作完成。

可选值：

- `0` — 不等待。
- `1` — 仅等待本副本执行完成。
- `2` — 等待所有副本执行完成。

Cloud 默认值：`1`。

:::note
`alter_sync` 仅适用于 `Replicated` 表，对非 `Replicated` 表的 ALTER 不产生任何效果。
:::

## alter_update_mode \{#alter_update_mode\}

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "新设置"}]}]}/>

用于带有 `UPDATE` 命令的 `ALTER` 查询的模式。

可能的取值：

- `heavy` - 执行常规 mutation 操作。
- `lightweight` - 如果可能，执行轻量级更新，否则执行常规 mutation 操作。
- `lightweight_force` - 如果可能，执行轻量级更新，否则抛出异常。

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果一个表的索引采用了空间填充曲线，例如 `ORDER BY mortonEncode(x, y)` 或 `ORDER BY hilbertEncode(x, y)`，并且查询对这些参数指定了条件，例如 `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`，则在索引分析时使用该空间填充曲线。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

允许向 Nested 中添加复合标识符。由于它会改变查询结果，因此这是一个兼容性设置。禁用时，`SELECT a.b.c FROM table ARRAY JOIN a` 将无法使用，并且 `SELECT a FROM table` 的 `Nested a` 结果中不会包含 `a.b.c` 列。

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "强制在 JOIN USING 中从 PROJECTION 解析标识符"}]}]}/>

强制在 JOIN USING 中从 PROJECTION 解析标识符（例如，在 `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` 中，连接将按 `t1.a + 1 = t2.b` 来执行，而不是按 `t1.b = t2.b`）。

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "默认禁用 ANY RIGHT 和 ANY FULL JOIN 以避免结果不一致"}]}]}/>

在 `ANY INNER|LEFT JOIN` 操作中启用 ClickHouse 旧版服务器行为。

:::note
仅当您的使用场景依赖旧版 `JOIN` 行为时，才为了向后兼容使用此设置。
:::

当启用旧版行为时：

- `t1 ANY LEFT JOIN t2` 和 `t2 ANY RIGHT JOIN t1` 操作的结果不相等，因为 ClickHouse 使用自左至右的多对一表键映射逻辑。
- `ANY INNER JOIN` 操作的结果包含左表中的所有行，其行为与 `SEMI LEFT JOIN` 操作相同。

当禁用旧版行为时：

- `t1 ANY LEFT JOIN t2` 和 `t2 ANY RIGHT JOIN t1` 操作的结果相等，因为 ClickHouse 在 `ANY RIGHT JOIN` 操作中使用提供一对多键映射的逻辑。
- `ANY INNER JOIN` 操作的结果对来自左右两表的每个键只包含一行。

可能的取值：

- 0 — 禁用旧版行为。
- 1 — 启用旧版行为。

另请参阅：

- [JOIN strictness](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用对通过轻量级删除标记为已删除的行进行过滤。如果禁用，查询仍然可以读取这些行。这对于调试和“撤销删除”等场景非常有用。

## apply_mutations_on_fly \{#apply_mutations_on_fly\}

<SettingsInfoBlock type="Bool" default_value="0" />

为 true 时，尚未在数据 part 中物化的变更（UPDATE 和 DELETE）会在执行 SELECT 查询时应用。

## apply_patch_parts \{#apply_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新的设置"}]}]}/>

如果为 true，则在执行 SELECT 时会应用表示轻量级更新的补丁分区片段。

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

在 Join 模式下应用分区片段补丁时使用的临时缓存桶数量。

## apply_prewhere_after_final \{#apply_prewhere_after_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新设置。启用后，PREWHERE 条件会在 FINAL 处理之后应用。"}]}]}/>

启用该设置后，对于 ReplacingMergeTree 及类似引擎，PREWHERE 条件会在 FINAL 处理之后应用。
当 PREWHERE 引用的列在重复行中可能具有不同的值，并且你希望由 FINAL 先选出“获胜”行再进行过滤时，这会很有用。禁用时，PREWHERE 会在读取阶段应用。
注意：如果 `apply_row_level_security_after_final` 已启用，并且 ROW POLICY 使用了非排序键列，为保持正确的执行顺序（ROW POLICY 必须在 PREWHERE 之前应用），PREWHERE 也会被延后执行。

## apply_row_policy_after_final \{#apply_row_policy_after_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "用于控制是否在对 *MergeTree 表执行 FINAL 处理之后再应用 ROW POLICY 和 PREWHERE 的新设置（尤其适用于 ReplacingMergeTree）"}]}]}/>

启用时，会在对 *MergeTree 表执行 FINAL 处理之后再应用 ROW POLICY 和 PREWHERE（尤其适用于 ReplacingMergeTree）。
禁用时，会在 FINAL 之前应用 ROW POLICY，这在策略过滤掉本应在 ReplacingMergeTree 或类似引擎中用于去重的行时，可能导致结果不同。

如果 ROW POLICY 表达式只依赖于 ORDER BY 中的列，则仍会在 FINAL 之前应用，作为一种优化措施，
因为这种过滤不会影响去重结果。

可能的取值：

- 0 — 在 FINAL 之前应用 ROW POLICY 和 PREWHERE（默认）。
- 1 — 在 FINAL 之后应用 ROW POLICY 和 PREWHERE。

## apply_settings_from_server \{#apply_settings_from_server\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "客户端代码（例如 INSERT 输入解析和查询结果输出格式化）将使用与服务器端相同的设置，包括来自服务器端配置的设置。"}]}]}/>

客户端是否应当接受来自服务器端的设置。

这只会影响在客户端执行的操作，尤其是解析 INSERT 输入数据以及格式化查询结果。大部分查询执行发生在服务器端，不受此 SETTING 影响。

通常应在用户配置文件中设置此选项（users.xml 或通过类似 `ALTER USER` 的查询），而不是通过客户端（客户端命令行参数、`SET` 查询，或 `SELECT` 查询的 `SETTINGS` 部分）。通过客户端可以将其改为 false，但不能将其改为 true（因为如果用户配置中 `apply_settings_from_server = false`，服务器端将不会向客户端发送设置）。

注意在最初（24.12）这是由服务器端的 SETTING（`send_settings_to_client`）控制的，但随后为了提升可用性，被此客户端 SETTING 所取代。

## archive_adaptive_buffer_max_size_bytes \{#archive_adaptive_buffer_max_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="8388608" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "8388608"},{"label": "New setting"}]}]}/>

限制用于写入归档文件（例如 tar 归档）时所使用的自适应缓冲区的最大大小。

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\}

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新增设置。用于 Arrow Flight 请求的 descriptor 类型：'path' 或 'command'。Dremio 需要使用 'command'。"}]}]}/>

用于 Arrow Flight 请求的 descriptor 类型。'path' 会将数据集名称作为路径描述符（path descriptor）发送，'command' 会将 SQL 查询作为命令描述符（command descriptor）发送（Dremio 需要此方式）。

可能的取值：

- 'path' — 使用 FlightDescriptor::Path（默认值，适用于大多数 Arrow Flight 服务器）
- 'command' — 使用带有 SELECT 查询的 FlightDescriptor::Command（Dremio 必需）

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

在通配符查询（`SELECT *`）中包含 [ALIAS](../../sql-reference/statements/create/table.md/#alias) 列。

可选值：

- 0 - 禁用
- 1 - 启用

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

是否在通配符查询（`SELECT *`）中包含 [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 列。

可能的取值：

- 0 - 禁用
- 1 - 启用

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，来自 INSERT 查询的数据会先存储在队列中，随后在后台写入表中。若 wait_for_async_insert 为 false，则 INSERT 查询几乎会立刻处理完成；否则客户端会一直等待，直到数据被写入表中。

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "自适应异步插入超时减少时的指数衰减速率"}]}]}/>

自适应异步插入超时减少时的指数衰减速率

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "自适应异步插入超时时间递增时的指数增长率"}]}]}/>

自适应异步插入超时时间递增时的指数增长率

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\}

**别名**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "异步插入超时时间的最小值（毫秒）；async_insert_busy_timeout_ms 是 async_insert_busy_timeout_max_ms 的别名"}]}]}/>

自第一条数据出现起，在将为每个查询收集的数据写出前所能等待的最长时间。

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "异步插入超时的最小毫秒数；同时作为初始值，之后可能会被自适应算法提高"}]}]}/>

如果通过 async_insert_use_adaptive_busy_timeout 启用了自动调整，则为自首次数据出现以来，在为每个查询写出已收集数据之前需要等待的最短时间。同时它也作为自适应算法的初始值。

## async_insert_deduplicate \{#async_insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="0" />

对于在副本表中执行的异步 INSERT 查询，指定是否对插入的数据块进行去重。

## async_insert_max_data_size \{#async_insert_max_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "之前的默认值过小。"}]}]}/>

在插入之前，为每个查询收集的未解析数据的最大字节数

## async_insert_max_query_number \{#async_insert_max_query_number\}

<SettingsInfoBlock type="UInt64" default_value="450" />

在实际执行插入前可累积的插入查询的最大数量。
仅当 [`async_insert_deduplicate`](#async_insert_deduplicate) 设置为 1 时生效。

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "从异步插入队列中轮询数据的超时时间（毫秒）"}]}]}/>

从异步插入队列中轮询数据的超时时间

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "使用自适应 busy 超时时间进行异步插入"}]}]}/>

如果设置为 true，则对异步插入使用自适应 busy 超时时间。

## async_query_sending_for_remote \{#async_query_sending_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "跨分片异步创建连接并发送查询"}]}]}/>

允许在执行远程查询时异步创建连接并发送查询。

默认启用。

## async_socket_for_remote \{#async_socket_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "修复所有相关问题，并再次默认开启针对远程查询的 socket 异步读取"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "由于存在一些问题，关闭针对远程查询的 socket 异步读取"}]}]}/>

在执行远程查询时，启用通过 socket 的异步读取。

默认启用。

## automatic_parallel_replicas_min_bytes_per_replica \{#automatic_parallel_replicas_min_bytes_per_replica\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新设置"}]}]}/>

用于自动启用并行副本时的每个副本最小读取字节数阈值（仅在 `automatic_parallel_replicas_mode`=1 时生效）。0 表示不设阈值。

## automatic_parallel_replicas_mode \{#automatic_parallel_replicas_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新设置"}]}]}/>

基于收集到的统计信息，自动切换为使用并行副本执行。需要启用 `parallel_replicas_local_plan` 并提供 `cluster_for_parallel_replicas`。
0 - 关闭，1 - 开启，2 - 仅收集统计信息（不切换为使用并行副本执行）。

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items":[{"label":"24.4"},{"label":"true"},{"label":"使用多线程进行 Azure 分块上传。"}]}]}/>

使用多线程进行 Azure 分块上传。

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "检查已上传到 Azure Blob Storage 的每个对象，以确保上传成功"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "检查已上传到 Azure Blob Storage 的每个对象，以确保上传成功"}]}]}/>

检查已上传到 Azure Blob Storage 的每个对象，以确保上传成功

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

与 Azure 磁盘主机建立连接的超时时间。

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 Azure 引擎表中每次插入数据时创建一个新文件

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "当请求的文件不存在时，允许返回 0 行，而不是由 AzureBlobStorage 表引擎抛出异常"}]}]}/>

在读取某些键时，如果文件不存在，则忽略文件不存在的情况。

可能的取值：

- 1 — `SELECT` 返回空结果。
- 0 — `SELECT` 抛出异常。

## azure_list_object_keys_size \{#azure_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

单次批量 ListObject 请求中可返回的最大文件数

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure 分段上传时的最大块数量。"}]}]}/>

Azure 分段上传时的最大块数量。

## azure_max_get_burst \{#azure_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在达到每秒请求数限制之前，可以同时发出的最大请求数。默认值（0）等于 `azure_max_get_rps`。

## azure_max_get_rps \{#azure_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在触发限流之前，对 Azure GET 请求每秒请求数的限制。零表示不受限制。

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "在分片上传请求中可同时上传的分区片段的最大数量。0 表示不限制。"}]}]}/>

在分片上传请求中可同时上传的分区片段的最大数量。0 表示不限制。

## azure_max_put_burst \{#azure_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在达到每秒请求数上限之前，可以同时发出的最大请求数。默认值为 0 时，其效果等同于 `azure_max_put_rps`。

## azure_max_put_rps \{#azure_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

在触发限流之前，Azure PUT 请求每秒次数的上限。0 表示不限制。

## azure_max_redirects \{#azure_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Azure 重定向允许的最大跳转次数。

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "通过单部分复制操作复制到 Azure Blob 存储时单个对象允许的最大大小。"}]}]}/>

通过单部分复制操作复制到 Azure Blob 存储时单个对象允许的最大大小。

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Align with S3"}]}]}/>

通过单次上传（singlepart upload）方式向 Azure Blob 存储上传对象时允许的最大对象大小。

## azure_max_single_read_retries \{#azure_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

从 Azure Blob Storage 进行单次读取时的最大重试次数。

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "在向 Azure Blob 存储写入数据时出现非预期错误时的最大重试次数"}]}]}/>

在向 Azure Blob 存储写入数据时出现非预期错误时的最大重试次数

## azure_max_upload_part_size \{#azure_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "在对 Azure Blob Storage 进行多部分（multipart）上传时，单个上传分片的最大大小。"}]}]}/>

在对 Azure Blob Storage 进行多部分（multipart）上传时，单个上传分片的最大大小。

## azure_min_upload_part_size \{#azure_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "在向 Azure Blob 存储执行多部分上传时的最小分片大小。"}]}]}/>

在向 Azure Blob 存储执行多部分上传时的最小分片大小。

## azure_request_timeout_ms \{#azure_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

与 Azure 之间发送和接收数据时的空闲超时时间。如果单次 TCP 读或写调用阻塞时间达到该时长，则视为失败。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK 重试之间的最大退避时间"}]}]}/>

Azure SDK 重试之间的最大退避时间

## azure_skip_empty_files \{#azure_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在 azure 表引擎中跳过空文件"}]}]}/>

启用或禁用在 S3 引擎中跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果。

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "在对 Azure Blob Storage 执行分片上传时，每个分片的精确大小。"}]}]}/>

在对 Azure Blob Storage 执行分片上传时，每个分片的精确大小。

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在 AzureBlobStorage 引擎中，当 ListObjects 请求无法匹配到任何文件时抛出错误，而不是返回空查询结果"}]}]}/>

如果根据 glob 通配符展开规则匹配到的文件数为 0，则抛出错误。

可能的取值：

- 1 — `SELECT` 抛出异常。
- 0 — `SELECT` 返回空结果。

## azure_truncate_on_insert \{#azure_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 Azure 引擎的表中启用或禁用在插入前截断表数据。

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "每当在一次写入 Azure Blob Storage 的过程中上传了 azure_multiply_parts_count_threshold 个分区片段时，将 azure_min_upload_part_size 乘以该系数。"}]}]}/>

每当在一次写入 Azure Blob Storage 的过程中上传了 azure_multiply_parts_count_threshold 个分区片段时，将 azure_min_upload_part_size 乘以该系数。

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "每当向 Azure Blob 存储上传的分区片段数量达到该值时，azure_min_upload_part_size 会乘以 azure_upload_part_size_multiply_factor。"}]}]}/>

每当向 Azure Blob 存储上传的分区片段数量达到该值时，azure_min_upload_part_size 会乘以 azure_upload_part_size_multiply_factor。

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

当设置为 `true` 时，所有 Azure 请求的前两次尝试将使用较短的发送和接收超时设置。
当设置为 `false` 时，所有尝试都将使用相同的超时设置。

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

备份或恢复期间向 [Zoo]Keeper 发送批量请求时的最大批量大小

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

在备份或恢复期间向 [Zoo]Keeper 发送 multiread 请求时的最大批量大小

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "新设置。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "新设置。"}]}]}/>

如果在执行 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作期间，某个主机在此时间内未能在 ZooKeeper 中重新创建其临时的 “alive” 节点，则整个备份或恢复操作会被视为失败。
该值应大于主机在发生故障后重新连接到 ZooKeeper 的任何合理时间。
零表示无限制。

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\}

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "New setting."}]}]}/>

在当前 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作中，发起端在出现 `error` 节点后，应等待其他主机做出反应并停止其当前工作的最长时间。

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

在备份或恢复期间 Keeper 请求失败的近似概率。有效取值范围为 [0.0f, 1.0f] 区间内。

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 表示使用随机种子，否则为该设置的取值

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "应设置得足够大，以避免整个 BACKUP 或 RESTORE 操作因中途出现临时的 [Zoo]Keeper 故障而失败。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "应设置得足够大，以避免整个 BACKUP 或 RESTORE 操作因中途出现临时的 [Zoo]Keeper 故障而失败。"}]}]}/>

在 BACKUP 或 RESTORE 操作过程中，[Zoo]Keeper 操作的最大重试次数。
应将其设置得足够大，以避免整个操作因中途出现临时的 [Zoo]Keeper 故障而失败。

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新增设置。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新增设置。"}]}]}/>

在处理 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作时发生错误的情况下，[Zoo]Keeper 操作的最大重试次数。

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新设置。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新设置。"}]}]}/>

在 BACKUP ON CLUSTER 或 RESTORE ON CLUSTER 操作初始化期间，[Zoo]Keeper 操作的最大重试次数。

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

备份或恢复期间 [Zoo]Keeper 操作的初始退避超时时间

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

在备份或恢复期间 [Zoo]Keeper 操作的最大退避时间

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

备份时 [Zoo]Keeper 节点数据的最大大小

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "用于 Aws::Client::RetryStrategy 的设置项，Aws::Client 会自行执行重试，0 表示不重试。仅在备份/恢复时生效。"}]}]}/>

用于 Aws::Client::RetryStrategy 的设置项，Aws::Client 会自行执行重试，0 表示不重试。仅在备份/恢复时生效。

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

在备份和恢复过程中，在第一次重试前的初始退避延迟（以毫秒为单位）。每次后续重试都会以指数方式增加延迟，直到达到 `backup_restore_s3_retry_max_backoff_ms` 指定的最大值。

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\}

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "新设置"}]}]}/>

在备份和恢复操作期间，应用于 `Aws::Client::RetryStrategy` 中重试退避延迟的抖动系数。计算出的退避延迟会乘以区间 [1.0, 1.0 + jitter] 内的随机因子，最大不超过 `backup_restore_s3_retry_max_backoff_ms`。必须位于区间 [0.0, 1.0] 内。

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

在备份和恢复操作期间，两次重试之间的最大延迟时间（以毫秒为单位）。

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "默认禁用该设置"}]}]}/>

当设置为 `true` 时，一旦任意单个 S3 请求遇到可重试的 S3 错误（例如 “Slow Down”），所有向同一备份端点执行 S3 请求的线程都会被减慢。
当设置为 `false` 时，每个线程会独立于其他线程处理各自的 S3 请求退避。

## cache_warmer_threads \{#cache_warmer_threads\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

仅在 ClickHouse Cloud 中生效。后台线程的数量，用于在启用 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) 时推测性地将新数据分区片段下载到文件系统缓存中。设为 0 表示禁用。

## calculate_text_stack_trace \{#calculate_text_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="1" />

在查询执行过程中出现异常时计算文本堆栈追踪。这是默认行为。该过程依赖符号查找，在模糊测试中执行大量错误查询时可能会降低性能。在正常情况下，不应禁用此选项。

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\}

<SettingsInfoBlock type="Bool" default_value="0" />

当客户端在未等待响应的情况下关闭连接时，取消正在执行的 HTTP 只读查询（例如 `SELECT`）。

Cloud 默认值：`0`。

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "使函数 cast(value, 'IPv4') 和 cast(value, 'IPv6') 的行为与 toIPv4 和 toIPv6 函数相同"}]}]}/>

当发生转换错误时，将值转换为 IPv4 的 CAST 运算符、将值转换为 IPv6 类型的 CAST 运算符，以及 toIPv4 和 toIPv6 函数会返回默认值，而不是抛出异常。

## cast_keep_nullable \{#cast_keep_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 [CAST](/sql-reference/functions/type-conversion-functions#CAST) 操作中启用或禁用保留 `Nullable` 数据类型。

当启用该设置且 `CAST` 函数的参数为 `Nullable` 时，结果也会被转换为 `Nullable` 类型。禁用该设置时，结果始终完全为目标类型。

可能的取值：

* 0 — `CAST` 的结果完全为指定的目标类型。
* 1 — 如果参数类型为 `Nullable`，则 `CAST` 结果会被转换为 `Nullable(DestinationDataType)`。

**示例**

下面的查询会得到目标数据类型完全一致的结果：

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

以下查询会使目标数据类型带有 `Nullable` 修饰：

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

* [CAST](/sql-reference/functions/type-conversion-functions#CAST) 函数


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

允许在从 String 转换为 DateTime 时，选择用于解析日期和时间字符串表示形式的解析器。

可能的取值：

- `'best_effort'` — 启用扩展解析。

    ClickHouse 可以解析基础格式 `YYYY-MM-DD HH:MM:SS` 以及所有 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日期和时间格式。例如：`'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — 与 `best_effort` 类似（差异见 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS)）

- `'basic'` — 使用基础解析器。

    ClickHouse 只能解析基础格式 `YYYY-MM-DD HH:MM:SS` 或 `YYYY-MM-DD`。例如：`2019-08-20 10:18:56` 或 `2019-08-20`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Add setting to allow converting String to Dynamic through parsing"}]}]}/>

在将 String 转换为 Dynamic 时启用类型推断

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "用于在从 String CAST 到 Variant 的过程中启用或禁用类型推断的新设置"}]}]}/>

在将 String 转换为 Variant 时使用类型推断。

## check_query_single_value_result \{#check_query_single_value_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "修改该设置以提升 CHECK TABLE 的实用性"}]}]}/>

定义 `MergeTree` 系列引擎中 [CHECK TABLE](/sql-reference/statements/check-table) 查询结果的详细程度。

可能的取值：

- 0 — 查询会显示该表中每个单独数据 part 的检查状态。
- 1 — 查询会显示该表的整体检查状态。

## check_referential_table_dependencies \{#check_referential_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="0" />

用于检查 DDL 查询（例如 DROP TABLE 或 RENAME）是否会破坏引用依赖关系

## check_table_dependencies \{#check_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="1" />

检查 DDL 查询（例如 DROP TABLE 或 RENAME）不会破坏其依赖关系

## checksum_on_read \{#checksum_on_read\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取时校验校验和。默认启用，并且在生产环境中应始终保持启用。请不要期望通过禁用该设置获得任何好处。它仅可用于实验和基准测试。该设置仅适用于 MergeTree 系列的表。对于其他表引擎以及通过网络接收数据的情况，始终会验证校验和。

## cloud_mode \{#cloud_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

Cloud 模式

## cloud_mode_database_engine \{#cloud_mode_database_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

在 Cloud 中允许使用的数据库引擎类型。1：将 DDL 重写为使用 Replicated 数据库；2：将 DDL 重写为使用 Shared 数据库。

## cloud_mode_engine \{#cloud_mode_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

在 Cloud 中允许使用的引擎家族。

- 0 - 允许所有引擎
- 1 - 将 DDL 重写为使用 *ReplicatedMergeTree
- 2 - 将 DDL 重写为使用 SharedMergeTree
- 3 - 将 DDL 重写为使用 SharedMergeTree，除非显式指定了 remote disk
- 4 - 与 3 相同，另外使用 Alias 替代 Distributed（Alias 表将指向 Distributed 表的目标表，因此会使用对应的本地表）

使用 UInt64 以最小化对外公开部分

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\}

当前服务器所在分片对应的集群

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "新设置"}]}]}/>

如果设置为 `true`，将提升在 cluster 函数中处理归档的性能。若在较早版本中使用带归档的 cluster 函数，为了兼容性并避免在升级到 25.7+ 时出现错误，应将其设置为 `false`。

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "新设置。"}]}]}/>

定义在具有按 `bucket` 粒度拆分的 cluster 表函数中，用于分布式处理任务的批次近似大小（以字节为单位）。系统会累积数据，直到至少达到该数值。实际大小可能会略大一些，以与数据边界对齐。

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\}

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

控制在执行 CLUSTER TABLE FUNCTION 时如何将数据拆分为任务。

该设置定义了在集群中分配工作的粒度：

- `file` — 每个任务处理整个文件。
- `bucket` — 针对文件内部的每个数据块创建任务（例如，Parquet 行组（row group））。

在处理少量大型文件时，选择更细的粒度（如 `bucket`）可以提高并行度。
例如，如果一个 Parquet 文件包含多个行组，启用 `bucket` 粒度可以让每个行组由不同的工作节点独立处理。

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用哈希表统计信息收集，以优化内存分配

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

启用哈希表统计信息收集，以优化内存分配。

## compatibility \{#compatibility\}

`compatibility` 设置会使 ClickHouse 使用某个旧版本 ClickHouse 的默认设置，该旧版本的版本号通过此设置来指定。

如果某些设置被显式修改为非默认值，则这些设置会被优先生效（只有尚未被修改的设置会受到 `compatibility` 设置的影响）。

该设置接受一个 ClickHouse 版本号字符串，例如 `22.3`、`22.8`。空值表示此设置被禁用。

默认禁用。

:::note
在 ClickHouse Cloud 中，服务级默认的 compatibility 设置必须由 ClickHouse Cloud 支持团队配置。请[提交工单](https://clickhouse.cloud/support)来进行设置。
但是，可以通过标准的 ClickHouse 设置机制，在用户、角色、profile、查询或会话级别覆盖 compatibility 设置，例如在会话中使用 `SET compatibility = '22.3'`，或在查询中使用 `SETTINGS compatibility = '22.3'`。
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

为 true 时，在列声明中忽略 AUTO_INCREMENT 关键字；否则会返回错误。这样可以简化从 MySQL 的迁移过程。

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 CREATE TABLE 中出于兼容性忽略排序规则

## compatibility_s3_presigned_url_query_in_path \{#compatibility_s3_presigned_url_query_in_path\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

兼容性：启用时，会将预签名 URL 的查询参数（例如 X-Amz-*）合并到 S3 key 中（旧版行为），
因此在路径中将 `?` 视为通配符。禁用时（默认），预签名 URL 的查询参数保留在 URL 查询字符串中，
以避免将 `?` 解释为通配符。

## compile_aggregate_expressions \{#compile_aggregate_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用将聚合函数 JIT 编译为原生代码。启用该设置可以提升性能。

可能的取值：

- 0 — 聚合在不使用 JIT 编译的情况下执行。
- 1 — 聚合使用 JIT 编译执行。

**另请参阅**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "我们认为，JIT 编译器背后的 LLVM 基础设施已经足够稳定，因此可以默认启用此设置。"}]}]}/>

将某些标量函数和运算符编译为本机代码。

## compile_sort_description \{#compile_sort_description\}

<SettingsInfoBlock type="Bool" default_value="1" />

将排序描述编译为原生代码。

## connect_timeout \{#connect_timeout\}

<SettingsInfoBlock type="Seconds" default_value="10" />

在没有副本时的连接超时时间。

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "由于异步连接而增加默认连接超时时间"}]}]}/>

当在集群定义中使用 `shard` 和 `replica` 部分时，用于 Distributed 表引擎连接到远程服务器的超时时间（毫秒）。
如果连接失败，将会尝试多次连接到不同的副本。

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "由于异步连接机制，增加默认安全连接超时时间"}]}]}/>

用于在安全连接中选择首个健康副本的连接超时时间。

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

当连接池已满时，获取连接的最长等待时间（毫秒）。

可能的取值：

- 正整数。
- 0 — 无限等待（无超时）。

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="3" />

在分布式表引擎中与每个副本进行连接尝试的最大次数。

## convert_query_to_cnf \{#convert_query_to_cnf\}

<SettingsInfoBlock type="Bool" default_value="0" />

当设置为 `true` 时，`SELECT` 查询会被转换为合取范式（CNF，conjuctive normal form）。在某些场景下，将查询重写为 CNF 形式可能执行得更快（说明可参考此 [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749)）。

例如，请注意下面的 `SELECT` 查询不会被修改（默认行为）：

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

让我们将 `convert_query_to_cnf` 设置为 `true`，看看会有哪些变化：

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

注意，`WHERE` 子句被重写为 CNF 形式，但结果集完全相同——布尔逻辑保持不变：

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

可能的取值：true、false


## correlated_subqueries_default_join_kind \{#correlated_subqueries_default_join_kind\}

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "新设置。去相关化查询计划的默认 JOIN 类型。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "新设置。去相关化查询计划的默认 JOIN 类型。"}]}]}/>

控制去相关化查询计划中使用的 JOIN 类型。默认值为 `right`，表示去相关化后的计划将包含 RIGHT JOIN，且子查询输入位于右侧。

可能的取值：

- `left` - 去相关化过程将生成 LEFT JOIN，并且输入表将出现在左侧。
- `right` - 去相关化过程将生成 RIGHT JOIN，并且输入表将出现在右侧。

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "用于关联子查询计划优化的新设置。"}]}]}/>

使用过滤表达式推断等价表达式，并用它们替代创建 CROSS JOIN 的方式。

## correlated_subqueries_use_in_memory_buffer \{#correlated_subqueries_use_in_memory_buffer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "默认对关联子查询的输入使用内存缓冲区。"}]}]}/>

对关联子查询的输入使用内存缓冲区，以避免对其进行重复求值。

## count_distinct_implementation \{#count_distinct_implementation\}

<SettingsInfoBlock type="String" default_value="uniqExact" />

指定在执行 [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 这种写法时应使用哪一个 `uniq*` 函数来实现。

可能的取值：

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 `count distinct` 重写为基于 `group by` 结果的子查询

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting."}]}]}/>

在 `countMatches` 函数中，一旦某个模式出现零长度匹配，就停止计数。

## create_if_not_exists \{#create_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "新设置。"}]}]}/>

默认对 `CREATE` 语句启用 `IF NOT EXISTS`。如果启用了该设置，或者在语句中显式指定了 `IF NOT EXISTS`，且已存在同名表，则不会抛出异常。

## create_index_ignore_unique \{#create_index_ignore_unique\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 `CREATE UNIQUE INDEX` 语句中忽略 `UNIQUE` 关键字。用于 SQL 兼容性测试。

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

在 ZooKeeper 中创建元数据之后，在创建表期间进行故障注入的概率

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

允许在未指定 ORDER BY 和 PRIMARY KEY 的情况下创建主键为空的 *MergeTree 表

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "在 CROSS JOIN 中要压缩的数据块的最小大小。值为零表示禁用此阈值。当达到两个阈值之一（按行数或按字节数）时，此数据块将被压缩。"}]}]}/>

在 CROSS JOIN 中要压缩的数据块的最小大小。值为零表示禁用此阈值。当达到两个阈值之一（按行数或按字节数）时，此数据块将被压缩。

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "在 CROSS JOIN 中对数据块进行压缩所需的最小行数。值为 0 表示禁用此阈值。当达到任一阈值（按行数或按字节数）时，该数据块会被压缩。"}]}]}/>

在 CROSS JOIN 中对数据块进行压缩所需的最小行数。值为 0 表示禁用此阈值。当达到任一阈值（按行数或按字节数）时，该数据块会被压缩。

## cross_to_inner_join_rewrite \{#cross_to_inner_join_rewrite\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "2"},{"label": "强制将逗号连接重写为 inner 连接"}]}]}/>

如果在 WHERE 子句中存在连接表达式，则使用 inner join 替代 comma/cross join。取值：0 - 不重写，1 - 在可能的情况下重写 comma/cross 连接，2 - 强制重写所有 comma 连接，cross - 在可能的情况下重写

## data_type_default_nullable \{#data_type_default_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在列定义中未显式指定修饰符 [NULL 或 NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) 的数据类型默认为 [Nullable](/sql-reference/data-types/nullable)。

可能的取值：

- 1 — 列定义中的数据类型默认设置为 `Nullable`。
- 0 — 列定义中的数据类型默认设置为非 `Nullable`。

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

为所有 `DROP` 和 `DETACH` 查询添加修饰符 `SYNC`。

可能的取值：

- 0 — 查询将以延迟方式执行。
- 1 — 查询将同步执行（无延迟）。

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "新增设置，用于禁止显式指定表 UUID"}]}]}/>

0 - 不允许在 Replicated 类型数据库中的表显式指定 UUID。1 - 允许。2 - 允许，但会忽略指定的 UUID，改为生成一个随机的 UUID。

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "此前在 Replicated 数据库引擎中禁止长时间运行的 DDL 查询（CREATE AS SELECT 和 POPULATE）"}]}]}/>

允许在 Replicated 数据库引擎中执行长时间运行的 DDL 查询（CREATE AS SELECT 和 POPULATE）。注意，这可能会长时间阻塞 DDL 队列。

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

仅允许在使用 Replicated 引擎的数据库中创建 Replicated 表

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "默认不允许显式指定参数"}]}]}/>

0 - 不允许为 Replicated 数据库中的 *MergeTree 表显式指定 ZooKeeper 路径和副本名称。1 - 允许。2 - 允许，但忽略指定的路径并改用默认路径。3 - 允许且不记录警告日志。

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="0" />

当 database 引擎为 Replicated 时，将 DETACH TABLE 按 DETACH TABLE PERMANENTLY 执行。

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

强制对某些查询进行同步等待（另请参见 database_atomic_wait_for_drop_and_detach_synchronously、mutations_sync、alter_sync）。不建议启用这些设置。

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

设置初始 DDL 查询在等待 Replicated 数据库处理先前 DDL 队列条目时的超时时间（单位：秒）。

可能的取值：

- 正整数。
- 0 — 不限。

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\}

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

被删除的表在实际从 Shared 数据库中移除之前的延迟时间（秒）。在此期间，可以使用 `UNDROP TABLE` 语句恢复该表。

## decimal_check_overflow \{#decimal_check_overflow\}

<SettingsInfoBlock type="Bool" default_value="1" />

检查 Decimal 算术/比较运算是否溢出

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对从 Replicated\* 表接收数据的 materialized view 进行去重检查。

可选值：

0 — 禁用。
      1 — 启用。

启用后，ClickHouse 会对依赖 Replicated\* 表的 materialized view 中的数据块执行去重。
该设置可用于在因故障重试插入操作时，确保 materialized view 中不包含重复数据。

**另请参阅**

- [IN 运算符中的 NULL 处理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## deduplicate_insert_select \{#deduplicate_insert_select\}

<SettingsInfoBlock type="DeduplicateInsertSelectMode" default_value="enable_when_possible" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "enable_when_possible"},{"label": "change the default behavior of deduplicate_insert_select to ENABLE_WHEN_PROSSIBLE"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "enable_even_for_bad_queries"},{"label": "New setting, replace insert_select_deduplicate"}]}]}/>

启用或禁用 `INSERT SELECT` 的块去重（适用于 Replicated\* 表）。
该设置会覆盖 `INSERT SELECT` 查询中 `insert_deduplicate` 的行为。
该设置有四种可能取值：

- disable — 对 `INSERT SELECT` 查询禁用去重。
- force_enable — 对 `INSERT SELECT` 查询启用去重。如果 SELECT 结果不稳定，则抛出异常。
- enable_when_possible — 如果 `insert_deduplicate` 启用且 SELECT 结果稳定，则启用去重，否则禁用。
- enable_even_for_bad_queries - 如果 `insert_deduplicate` 启用，则始终启用去重。如果 SELECT 结果不稳定，会记录警告日志，但查询仍然在启用去重的情况下执行。此选项用于向后兼容。建议优先使用其他选项，因为该选项可能导致不符合预期的结果。

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "允许在创建 materialized view 时为 SQL SECURITY 选项设置默认值"}]}]}/>

允许在创建 materialized view 时为 SQL SECURITY 选项设置默认值。[有关 SQL 安全性的更多信息](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `DEFINER`。

## default_max_bytes_in_join \{#default_max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

在需要限制但未设置 `max_bytes_in_join` 时，右侧表允许的最大字节数。

## default_normal_view_sql_security \{#default_normal_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "允许在创建普通视图时设置默认 `SQL SECURITY` 选项"}]}]}/>

允许在创建普通视图时设置默认的 `SQL SECURITY` 选项。[关于 SQL 安全性的更多信息](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `INVOKER`。

## default_table_engine \{#default_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "将默认表引擎设置为 MergeTree 以提高可用性"}]}]} />

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

在此示例中，任何未指定 `Engine` 的新建表都将使用 `Log` 表引擎：

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


## default_temporary_table_engine \{#default_temporary_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

与 [default&#95;table&#95;engine](#default_table_engine) 相同，只是用于临时表。

在本示例中，任何未显式指定 `Engine` 的新建临时表都将使用 `Log` 表引擎：

查询：

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

用于在创建视图时设置默认的 `DEFINER` 选项。[关于 SQL 安全性的更多信息](../../sql-reference/statements/create/view.md/#sql_security)。

默认值为 `CURRENT_USER`。

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置"}]}]}/>

启用 delta-kernel 的内部数据剪枝功能。

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

启用 DeltaLake 表达式访问器的测试级别日志记录。即使仅作为测试日志，这些日志也可能过于冗长。

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

定义 Delta Lake 中单个插入数据文件的最大字节数限制。

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "New setting."}]}]}/>

定义 Delta Lake 中单个插入数据文件的最大行数限制。

## delta_lake_log_metadata \{#delta_lake_log_metadata\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

启用在 system 系统表中记录 Delta Lake 元数据文件。

## delta_lake_snapshot_end_version \{#delta_lake_snapshot_end_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "新设置。"}]}]}/>

要读取的 Delta Lake 快照的结束版本号。值 -1 表示读取最新版本（值 0 也是一个有效的快照版本号）。

## delta_lake_snapshot_start_version \{#delta_lake_snapshot_start_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "新设置。"}]}]}/>

要读取的 Delta Lake 快照的起始版本。值为 -1 表示读取最新版本（值为 0 也是一个有效的快照版本）。

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "新设置"}]}]}/>

要读取的 Delta Lake 快照版本。值 -1 表示读取最新版本（值 0 也是一个有效的快照版本）。

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置"}]}]}/>

启用此设置后，如果在 delta-kernel 中分析扫描谓词时发生错误，则抛出异常。

## describe_compact_output \{#describe_compact_output\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则 DESCRIBE 查询的结果中仅包含列名和类型。

## describe_include_subcolumns \{#describe_include_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 [DESCRIBE](../../sql-reference/statements/describe-table.md) 查询中输出子列的描述。例如，[Tuple](../../sql-reference/data-types/tuple.md) 的成员，或者 [Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null) 或 [Array](../../sql-reference/data-types/array.md/#array-size) 数据类型的子列。

可能的取值：

- 0 — 在 `DESCRIBE` 查询中不包含子列。
- 1 — 在 `DESCRIBE` 查询中包含子列。

**示例**

参见 [DESCRIBE](../../sql-reference/statements/describe-table.md) 语句的示例。

## describe_include_virtual_columns \{#describe_include_virtual_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，表的虚拟列会被包含在 DESCRIBE 查询结果中

## dialect \{#dialect\}

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

用于解析查询的方言

## dictionary_use_async_executor \{#dictionary_use_async_executor\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用多线程执行用于读取字典数据源的 pipeline。仅支持使用本地 CLICKHOUSE 源的字典。

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "验证字典的主键类型。默认情况下，简单布局的 ID 类型将被隐式转换为 UInt64。"}]}]}/>

验证字典的主键类型。默认情况下，简单布局的 ID 类型将被隐式转换为 UInt64。

## distinct_overflow_mode \{#distinct_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过某个限制时的处理方式。

可选值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回已处理的部分结果，就像源数据已经耗尽一样。

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\}

<SettingsInfoBlock type="Bool" default_value="1" />

是否启用分布式聚合的内存节省模式。

## distributed_background_insert_batch \{#distributed_background_insert_batch\}

**别名**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用以批处理方式发送插入数据。

当启用批量发送时，[Distributed](../../engines/table-engines/special/distributed.md) 表引擎会尝试在一次操作中发送多个插入数据文件，而不是分别发送。批量发送通过更好地利用服务器和网络资源来提高集群性能。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\}

**别名**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎发送数据的最大时间间隔。用于限制在 [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) 设置项中配置的时间间隔的指数递增。

可能的取值：

- 一个正整数，单位为毫秒。

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\}

**别名**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

用于 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎发送数据的基本时间间隔。发生错误时，实际间隔会呈指数级增长。

可能的取值：

- 正整数的毫秒数。

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\}

**别名**：`distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

启用/禁用在失败时拆分批次。

有时将某个批次发送到远程分片可能会失败，可能是由于后续存在复杂的处理流程（例如带有 `GROUP BY` 的 `MATERIALIZED VIEW`），从而触发 `Memory limit exceeded` 或类似错误。在这种情况下，简单重试并不会有帮助（并且会导致该表的分布式发送阻塞），但将该批次中的文件逐个发送则可能可以成功完成 INSERT。

因此，将该设置配置为 `1` 会对这类批次禁用批处理（即对失败的批次临时禁用 `distributed_background_insert_batch`）。

可能的值：

- 1 — 启用。
- 0 — 禁用。

:::note
此设置同样会影响损坏的批次（这些批次可能由于服务器（机器）异常终止且未对 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎启用 `fsync_after_insert`/`fsync_directories` 而产生）。
:::

:::note
不应依赖自动批次拆分，因为这可能会影响性能。
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\}

**别名**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

向 Distributed 表执行插入查询时的超时时间。仅在启用了 insert_distributed_sync 时使用该设置。值为 0 表示不限制超时时间。

## distributed_cache_alignment \{#distributed_cache_alignment\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Rename of distributed_cache_read_alignment"}]}]}/>

仅在 ClickHouse Cloud 中生效。此设置仅用于测试，请勿更改。

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于绕过 distributed cache 连接池。

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于创建 distributed cache 连接的最大退避时长（毫秒）。

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。创建分布式缓存连接时的最小退避时长（毫秒）。

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "更改了设置值"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "仅限 Cloud"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "用于 ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。连接分布式缓存失败时的最大重试次数。

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于连接分布式缓存服务器的超时时间。

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。凭证刷新时间间隔。

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于在单个分布式缓存读取请求中，为 DataPacket 序列发送 ACK 的窗口大小。

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。如果存在未读取的数据，则关闭连接。

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 的一个设置"}]}]}/>

仅在 ClickHouse Cloud 中有效。仅从当前可用区获取 system.distributed_cache_metrics 和 system.distributed_cache_events 中的指标。

## distributed_cache_file_cache_name \{#distributed_cache_file_cache_name\}

<CloudOnlyBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting."}]}]}/>

仅在 ClickHouse Cloud 中有效。仅用于 CI 测试的设置——在分布式缓存中使用的文件系统缓存名称。

## distributed_cache_log_mode \{#distributed_cache_log_mode\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "ClickHouse Cloud 的设置项"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于控制写入 system.distributed_cache_log 的模式。

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "适用于 ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。单个分布式缓存读取请求中未确认在途数据包的最大数量。

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新的私有设置。"}]}]}/>

仅在 ClickHouse Cloud 中生效。在分布式缓存中执行 seek 操作所需的最小字节数。

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于标识在连接池达到上限时分布式缓存连接的行为方式。

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

仅在 ClickHouse Cloud 中有效。与 filesystem_cache_prefer_bigger_buffer_size 相同，但适用于分布式缓存。

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。只允许从当前可用区的缓存服务器读取。如果禁用，则会从所有可用区中的所有缓存服务器读取。

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "更改设置值"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "新增设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。分布式缓存请求失败后的重试次数。

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

仅在 ClickHouse Cloud 中生效。从分布式缓存接收请求数据的等待时间（毫秒）。

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 的一个设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。以毫秒为单位，用于等待从分布式缓存（distributed cache）接收任意类型响应的时间。

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。用于从分布式缓存服务器接收数据的超时时间，单位为毫秒。如果在此时间内未接收到任何字节，将抛出异常。

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。向分布式缓存服务器发送数据的超时时间（毫秒）。如果客户端需要发送数据，但在该时间间隔内未能发送出任何字节，将抛出异常。

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。以毫秒为单位，表示在 TCP 开始发送 keepalive 探测包之前，与分布式缓存服务器的连接可以保持空闲的时间。

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。会重新抛出在与分布式缓存通信期间发生的异常或从分布式缓存接收到的异常；否则，在出错时将改为跳过分布式缓存。

## distributed_cache_use_clients_cache_for_read \{#distributed_cache_use_clients_cache_for_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。对读取请求使用客户端缓存。

## distributed_cache_use_clients_cache_for_write \{#distributed_cache_use_clients_cache_for_write\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。对写入请求使用客户端缓存。

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。当 distributed_cache_pool_behaviour_on_limit 为 wait 时，从连接池获取连接的等待时间（毫秒）。

## distributed_connections_pool_size \{#distributed_connections_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

对单个分布式表的所有查询进行分布式处理时，与远程服务器之间允许建立的最大并发连接数。建议将该值设置为不小于集群中的服务器数量。

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\}

<SettingsInfoBlock type="UInt64" default_value="5" />

分布式 DDL（`ON CLUSTER`）查询使用的兼容性版本

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\}

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

设置分布式 DDL 查询结果的格式。

可选值：

- `throw` — 返回一个结果集，其中包含所有已完成查询的主机上的查询执行状态。如果查询在某些主机上失败，则会重新抛出第一个异常。如果查询在某些主机上尚未完成且超过了 [distributed_ddl_task_timeout](#distributed_ddl_task_timeout)，则抛出 `TIMEOUT_EXCEEDED` 异常。
- `none` — 与 `throw` 类似，但分布式 DDL 查询不返回结果集。
- `null_status_on_timeout` — 当查询在相应主机上尚未完成时，不抛出 `TIMEOUT_EXCEEDED`，而是在结果集的某些行中返回 `NULL` 作为执行状态。
- `never_throw` — 即使查询在某些主机上失败，也不会抛出 `TIMEOUT_EXCEEDED`，也不会重新抛出异常。
- `none_only_active` - 类似于 `none`，但不会等待 `Replicated` 数据库的非活动副本。注意：在此模式下，无法判断查询是否未在某些副本上执行，以及是否将会在后台执行。
- `null_status_on_timeout_only_active` — 类似于 `null_status_on_timeout`，但不会等待 `Replicated` 数据库的非活动副本。
- `throw_only_active` — 类似于 `throw`，但不会等待 `Replicated` 数据库的非活动副本。

Cloud 默认值：`throw`。

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\}

<SettingsInfoBlock type="Int64" default_value="180" />

为集群中所有主机的 DDL 查询响应设置超时时间。如果某个 DDL 请求未能在所有主机上执行完成，响应中将包含超时错误，并且该请求将以异步模式继续执行。负值表示无限超时。

可能的取值：

- 正整数。
- 0 — 异步模式。
- 负整数 — 无限超时。

## distributed_foreground_insert \{#distributed_foreground_insert\}

**别名**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用向 [Distributed](/engines/table-engines/special/distributed) 表同步插入数据。

默认情况下，当向 `Distributed` 表插入数据时，ClickHouse 服务器会在后台模式下将数据发送到集群节点。当 `distributed_foreground_insert=1` 时，数据将以同步方式处理，且仅在所有数据都已保存到所有分片之后（如果 `internal_replication` 为 true，则每个分片至少有一个副本），`INSERT` 操作才会成功。

可选值：

- `0` — 以后台模式插入数据。
- `1` — 以同步模式插入数据。

Cloud 默认值：`0`。

**另请参阅**

- [Distributed 表引擎](/engines/table-engines/special/distributed)
- [管理 Distributed 表](/sql-reference/statements/system#managing-distributed-tables)

## distributed_group_by_no_merge \{#distributed_group_by_no_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在分布式查询处理过程中，不合并来自不同服务器的聚合状态；当能够确定不同分片上的键彼此不同（不重叠）时，可以使用此设置。

可能的值：

* `0` — 禁用（最终查询处理在发起节点上完成）。
* `1` - 在分布式查询处理过程中不合并来自不同服务器的聚合状态（查询在各分片上完全处理，发起节点仅代理转发数据），可在能够确定不同分片上的键彼此不同时使用。
* `2` - 与 `1` 相同，但在发起节点上应用 `ORDER BY` 和 `LIMIT`（当查询完全在远程节点上处理时，如 `distributed_group_by_no_merge=1`，这是不可能的），可用于带有 `ORDER BY` 和/或 `LIMIT` 的查询。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "如果为 true，则对 Distributed 执行 INSERT 时会跳过只读副本"}]}]}/>

启用在对 Distributed 执行 INSERT 查询时跳过只读副本。

可能的取值：

- 0 — INSERT 行为与通常相同，如果请求被发送到只读副本则会失败
- 1 — 发起方在向分片发送数据前会跳过只读副本。

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新的实验性设置。"}]}]}/>

分布式查询中并行读取任务的默认数量。任务会在各个副本之间分配。

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新的实验性设置。"}]}]}/>

用于分布式 shuffle-hash-join 的默认分桶数。

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

在本地执行分布式查询计划的所有任务。用于测试和调试。

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "新的实验性设置。"}]}]}/>

在分布式查询各阶段之间强制使用指定类型的 Exchange 运算符。

可能的取值：

- '' - 不强制任何类型的 Exchange 运算符，由优化器自行选择。
 - 'Persisted' - 在对象存储中使用临时文件。
 - 'Streaming' - 通过网络以流式方式交换数据。

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新的实验性设置"}]}]}/>

在分布式查询计划中，将 PartialAggregation + Merge 替换为 Shuffle 聚合策略。

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新的实验性设置。"}]}]}/>

在分布式查询计划中，用于选择广播 join 而非 shuffle join 的最大行数阈值。

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "实验性新设置。"}]}]}/>

在分布式查询计划中移除不必要的 exchange 操作。若需调试，可将其禁用。

## distributed_product_mode \{#distributed_product_mode\}

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

更改[分布式子查询](../../sql-reference/operators/in.md)的行为。

当查询中包含分布式表的笛卡尔积时（即针对一个分布式表的查询中，又包含一个针对同一分布式表的非 GLOBAL 子查询）ClickHouse 会应用此设置。

限制条件：

- 仅适用于 IN 和 JOIN 子查询。
- 仅当 FROM 子句使用的分布式表包含多个分片时。
- 如果子查询所涉及的分布式表也包含多个分片时。
- 不用于表值 [remote](../../sql-reference/table-functions/remote.md) 函数。

可选值：

- `deny` — 默认值。禁止使用此类子查询（返回 "Double-distributed in/JOIN subqueries is denied" 异常）。
- `local` — 将子查询中的数据库和表替换为目标服务器（分片）上的本地数据库和表，同时保持普通的 `IN`/`JOIN`。
- `global` — 将 `IN`/`JOIN` 查询替换为 `GLOBAL IN`/`GLOBAL JOIN`。
- `allow` — 允许使用此类子查询。

## distributed_push_down_limit \{#distributed_push_down_limit\}

<SettingsInfoBlock type="UInt64" default_value="1" />

启用或禁用在每个分片上分别应用 [LIMIT](#limit)。

这可以避免：

- 通过网络发送多余的行；
- 在发起端处理超过 LIMIT 的行。

从 21.9 版本开始，将不会再得到不精确的结果，因为只有在至少满足以下任一条件时，`distributed_push_down_limit` 才会改变查询执行方式：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- 查询**没有** `GROUP BY`/`DISTINCT`/`LIMIT BY`，但包含 `ORDER BY`/`LIMIT`。
- 查询**有** `GROUP BY`/`DISTINCT`/`LIMIT BY` 且带有 `ORDER BY`/`LIMIT`，并且：
    - 已启用 [optimize_skip_unused_shards](#optimize_skip_unused_shards)。
    - 已启用 [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)。

可能的值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 类型: 无符号整数
- 默认值: 1000

每个副本的错误次数上限为该值，防止单个副本累积过多错误。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\}

<SettingsInfoBlock type="Seconds" default_value="60" />

- 类型：秒
- 默认值：60 秒

控制在分布式表中错误被归零的速率。如果某个副本在一段时间内不可用，并累计出现 5 个错误，且 distributed_replica_error_half_life 设置为 1 秒，则在最后一次错误发生后 3 秒，该副本会被视为正常。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\}

<SettingsInfoBlock type="UInt64" default_value="0" />

- 类型: unsigned int
- 默认值: 0

在根据 `load_balancing` 算法选择副本时允许忽略的错误次数。

另请参阅：

- [load_balancing](#load_balancing-round_robin)
- [表引擎 Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 `SELECT FINAL` 查询中仅合并同一分区内的分区片段

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\}

<SettingsInfoBlock type="Bool" default_value="1" />

当在空 Set 上按常量键进行聚合时，返回空结果。

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\}

<SettingsInfoBlock type="Bool" default_value="0" />

在空 Set 上执行无键聚合时返回空结果。

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新设置。自适应地将内存溢出数据写入外部存储。"}]}]}/>

触发处理器以自适应方式将数据溢写到外部存储。目前支持 grace join。

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "用于减少分布式 IN 子查询传输的临时表大小的新设置。"}]}]}/>

启用在 `IN` 子查询中使用 `DISTINCT`。这是一个权衡型设置：启用后可以大幅减少为分布式 IN 子查询传输的临时表大小，并通过确保只发送唯一值，显著加快分片之间的数据传输。
但是，启用此设置会在每个节点上增加额外的合并开销，因为必须执行去重（DISTINCT）。当网络传输是瓶颈且可以接受额外的合并开销时再使用此设置。

## enable_blob_storage_log \{#enable_blob_storage_log\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "将 blob 存储操作相关信息写入 system.blob_storage_log 表"}]}]}/>

将 blob 存储操作相关信息写入 system.blob_storage_log 表

## enable_early_constant_folding \{#enable_early_constant_folding\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用此查询优化：分析函数和子查询的结果，如果结果为常量，则对查询进行重写

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用返回取值范围更大（相对于类型 `Date`）的 `Date32` 类型结果，
或取值范围更大（相对于类型 `DateTime`）的 `DateTime64` 类型结果。

可选值：

- `0` — 对所有类型的参数，函数都返回 `Date` 或 `DateTime`。
- `1` — 对于 `Date32` 或 `DateTime64` 参数，函数返回 `Date32` 或 `DateTime64`，否则返回 `Date` 或 `DateTime`。

下表展示了在各种日期时间函数中启用该设置后的具体行为。

| 函数                        | `enable_extended_results_for_datetime_functions = 0`  | `enable_extended_results_for_datetime_functions = 1`                                                         |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `toStartOfYear`           | 返回 `Date` 或 `DateTime` 类型                             | 对于 `Date`/`DateTime` 类型的输入，返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入，返回 `Date32`/`DateTime64` |
| `toStartOfISOYear`        | 返回 `Date` 或 `DateTime`                                | 对 `Date`/`DateTime` 输入，返回 `Date`/`DateTime`<br />对 `Date32`/`DateTime64` 输入，返回 `Date32`/`DateTime64`         |
| `toStartOfQuarter`        | 返回 `Date` 或 `DateTime`                                | 当输入为 `Date`/`DateTime` 时，返回 `Date`/`DateTime`<br />当输入为 `Date32`/`DateTime64` 时，返回 `Date32`/`DateTime64`     |
| `toStartOfMonth`          | 返回 `Date` 或 `DateTime`                                | 对 `Date`/`DateTime` 类型输入返回 `Date`/`DateTime`<br />对 `Date32`/`DateTime64` 类型输入返回 `Date32`/`DateTime64`       |
| `toStartOfWeek`           | 返回 `Date` 或 `DateTime`                                | 对于 `Date`/`DateTime` 输入，返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 输入，返回 `Date32`/`DateTime64`       |
| `toLastDayOfWeek`         | 返回 `Date` 或 `DateTime` 类型                             | 如果输入为 `Date`/`DateTime`，则返回 `Date`/`DateTime`<br />如果输入为 `Date32`/`DateTime64`，则返回 `Date32`/`DateTime64`     |
| `toLastDayOfMonth`        | 返回 `Date` 或 `DateTime` 类型                             | 当输入为 `Date`/`DateTime` 时返回 `Date`/`DateTime`<br />当输入为 `Date32`/`DateTime64` 时返回 `Date32`/`DateTime64`       |
| `toMonday`                | 返回 `Date` 或 `DateTime` 类型                             | 对于 `Date`/`DateTime` 类型的输入，返回 `Date`/`DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入，返回 `Date32`/`DateTime64` |
| `toStartOfDay`            | 返回 `DateTime`<br />*注意：对于超出 1970–2149 年范围的值会返回错误结果*   | 对于 `Date`/`DateTime` 类型的输入返回 `DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入返回 `DateTime64`                   |
| `toStartOfHour`           | 返回 `DateTime`<br />*注意：对于 1970–2149 年范围之外的值会返回错误结果*   | 对于 `Date`/`DateTime` 输入返回 `DateTime`<br />对于 `Date32`/`DateTime64` 输入返回 `DateTime64`                         |
| `toStartOfFifteenMinutes` | 返回 `DateTime`<br />*注意：对于超出 1970–2149 年范围的值会返回错误结果*   | 对 `Date`/`DateTime` 类型的输入返回 `DateTime`<br />对 `Date32`/`DateTime64` 类型的输入返回 `DateTime64`                     |
| `toStartOfTenMinutes`     | 返回 `DateTime`<br />*注意：当值超出 1970–2149 年范围时，结果将不正确*    | 对 `Date`/`DateTime` 输入返回 `DateTime` 类型<br />对 `Date32`/`DateTime64` 输入返回 `DateTime64` 类型                     |
| `toStartOfFiveMinutes`    | 返回 `DateTime`<br />*注意：对于不在 1970-2149 年范围内的值，结果可能不正确* | 对 `Date`/`DateTime` 类型的输入返回 `DateTime`<br />对 `Date32`/`DateTime64` 类型的输入返回 `DateTime64`                     |
| `toStartOfMinute`         | 返回 `DateTime`<br />*注意：对超出 1970-2149 范围的值会产生错误结果*     | 对于 `Date`/`DateTime` 类型的输入返回 `DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入返回 `DateTime64`                   |
| `timeSlot`                | 返回 `DateTime`<br />*注意：对于超出 1970–2149 年范围的值会返回不正确的结果* | 对于 `Date`/`DateTime` 类型的输入返回 `DateTime`<br />对于 `Date32`/`DateTime64` 类型的输入返回 `DateTime64`                   |

## enable_filesystem_cache \{#enable_filesystem_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

对远程文件系统使用缓存。该设置不会为磁盘启用或禁用文件系统缓存（必须通过磁盘配置完成），但在需要时允许某些查询跳过缓存。

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许记录每个查询的文件系统缓存日志

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用 `write-through` 缓存。若设置为 `false`，则对写入操作禁用 `write-through` 缓存。若设置为 `true`，且在服务器配置中的缓存磁盘配置部分已开启 `cache_on_write_operations`，则启用 `write-through` 缓存。
有关更多详情，请参阅[“使用本地缓存”](/operations/storing-data#using-local-cache)。

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

在查询执行期间将日志写入 system.filesystem prefetch_log。仅应在测试或调试时使用，不建议默认启用。

## enable_full_text_index \{#enable_full_text_index\}

<BetaBadge/>

**别名**: `allow_experimental_full_text_index`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "文本索引已移至 Beta 阶段。"}]}]}/>

如果设置为 true，则允许使用文本索引。

## enable_global_with_statement \{#enable_global_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "默认将 WITH 语句传递到 UNION 查询和所有子查询"}]}]}/>

将 WITH 语句传递到 UNION 查询和所有子查询

## enable_hdfs_pread \{#enable_hdfs_pread\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

启用或禁用对 HDFS 文件的 `pread` 操作。默认情况下使用 `hdfsPread`。如果禁用，则会改用 `hdfsRead` 和 `hdfsSeek` 来读取 HDFS 文件。

## enable_http_compression \{#enable_http_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一般情况下应当是有益的"}]}]}/>

启用或禁用在 HTTP 请求响应中的数据压缩。

要了解更多信息，请参阅 [HTTP 接口文档](/interfaces/http)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## enable_job_stack_trace \{#enable_job_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "为避免性能开销，此设置默认禁用。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "启用从作业调度阶段收集堆栈跟踪。为避免性能开销，默认禁用。"}]}]}/>

当作业导致异常时，输出作业创建方的堆栈跟踪。为避免性能开销，默认禁用。

## enable_join_runtime_filters \{#enable_join_runtime_filters\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

在运行时根据从右侧收集到的一组 JOIN 键来过滤左侧。

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "在 JOIN 和 ARRAY JOIN 中默认启用惰性列复制"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "添加用于在 JOIN 和 ARRAY JOIN 中启用惰性列复制的设置"}]}]}/>

在 JOIN 和 ARRAY JOIN 中启用惰性列复制，从而避免在内存中对相同行进行不必要的多次复制。

## enable_lightweight_delete \{#enable_lightweight_delete\}

**Aliases**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

为 MergeTree 表启用轻量级 DELETE 变更操作。

## enable_lightweight_update \{#enable_lightweight_update\}

<BetaBadge/>

**别名**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "轻量级更新被移至 Beta 阶段。为设置 'allow_experimental_lightweight_update' 添加了一个别名。"}]}]}/>

允许使用轻量级更新。

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用受内存限制的聚合结果合并策略。

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\}

<SettingsInfoBlock type="Bool" default_value="1" />

在存在由 AND 组合的多个条件时，将更多条件从 WHERE 下推到 PREWHERE，并分多步执行磁盘读取和过滤

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "当所有名称都是唯一且可作为未加引号的标识符处理时，在 tuple() 函数中生成具名元组。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "在可用性改进完成之前禁用。"}]}]}/>

当所有名称都是唯一且可作为未加引号的标识符处理时，在 tuple() 函数中生成具名元组。

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

在 `SELECT` 查询中启用谓词下推。

对于分布式查询，谓词下推可以显著减少网络流量。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

用法

考虑以下查询：

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

如果 `enable_optimize_predicate_expression = 1`，则这两个查询的执行时间相同，因为 ClickHouse 在处理子查询时会将 `WHERE` 条件下推到子查询中执行。

如果 `enable_optimize_predicate_expression = 0`，则第二个查询的执行时间会长得多，因为 `WHERE` 子句是在子查询完成后才对所有数据进行过滤的。

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许将谓词下推至 FINAL 子查询。

## enable_order_by_all \{#enable_order_by_all\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用使用 `ORDER BY ALL` 语法进行排序，参见 [ORDER BY](../../sql-reference/statements/select/order-by.md)。

可选值：

* 0 — 禁用 ORDER BY ALL。
* 1 — 启用 ORDER BY ALL。

**示例**

查询：

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- returns an error that ALL is ambiguous

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "新增的 setting"}]}]}/>

仅影响分布式查询。启用后，将在 pipeline 线程上对数据块进行（反）序列化和（反）压缩，并在发送给查询发起端之前/之后执行这些操作（即并行度高于默认情况）。

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 `true`，则可以根据从表中获取的序列化提示信息，将数据直接解析到使用自定义序列化（例如稀疏）的列中。

## enable_positional_arguments \{#enable_positional_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Enable positional arguments feature by default"}]}]} />

启用或禁用在 [GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) 语句中对位置参数的支持。

可能的取值：

* 0 — 不支持位置参数。
* 1 — 支持位置参数：可以使用列编号代替列名。

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


## enable_positional_arguments_for_projections \{#enable_positional_arguments_for_projections\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "用于控制 PROJECTION 中位置参数的新设置。"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "用于控制 PROJECTION 中位置参数的新设置。"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "用于控制 PROJECTION 中位置参数的新设置。"}]}]}/>

启用或禁用在 PROJECTION 定义中对位置参数的支持。另请参见 [enable_positional_arguments](#enable_positional_arguments) 设置。

:::note
这是一个专家级设置，如果您刚开始使用 ClickHouse，建议不要更改它。
:::

可能的取值：

- 0 — 不支持位置参数。
- 1 — 支持位置参数：可以使用列号代替列名。

## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

允许节省内存的聚合（参见 `distributed_aggregation_memory_efficient`）在聚合过程中以非顺序方式生成 bucket。
当各聚合 bucket 的大小分布不均衡时，通过允许副本在自身仍在处理一些较大的低 ID bucket 的同时，将较高 ID 的 bucket 提前发送给发起方，可以提升性能。
其缺点是可能会占用更多内存。

## enable_qbit_type \{#enable_qbit_type\}

<BetaBadge/>

**别名**: `allow_experimental_qbit_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "QBit 已移至 Beta 阶段。为设置 `allow_experimental_qbit_type` 添加了别名。"}]}]}/>

允许创建 [QBit](../../sql-reference/data-types/qbit.md) 数据类型。

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，将从[查询缓存](../query-cache.md)中获取 `SELECT` 查询的结果。

可能的取值：

- 0 - 禁用
- 1 - 启用

## enable_s3_requests_logging \{#enable_s3_requests_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用对 S3 请求的极其详细的日志记录。仅建议在调试时使用。

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "防止标量子查询对大规模标量值进行（反）序列化，并在可能的情况下避免多次运行同一子查询"}]}]}/>

如果设置为 true，则会防止标量子查询对大规模标量值进行（反）序列化，并在可能的情况下避免多次运行同一子查询。

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容的新设置。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容的新设置。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容的新设置。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "用于与旧分析器保持向后兼容的新设置。"}]}]}/>

如果禁用该设置，上级 `WITH` 子句中的声明将被视为在当前作用域中声明，从而与当前作用域具有相同的作用域。

请注意，这是为新分析器提供的兼容性设置，用于允许运行一些在语义上无效但旧分析器仍能执行的查询。

## enable_shared_storage_snapshot_in_query \{#enable_shared_storage_snapshot_in_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于在查询中共享存储快照的新设置"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "默认启用在查询中共享存储快照"}]}]} />

如果启用，在单个查询中，针对同一张表的所有子查询都会共享同一个 StorageSnapshot。
这可以确保整个查询范围内的数据视图保持一致，即使同一个表被多次访问也是如此。

对于那些需要保证数据分区片段内部一致性的查询，这是必需的。示例：

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

如果不启用此设置，外层查询和内层查询可能会在不同的数据快照上运行，从而导致结果不正确。

:::note
启用此设置会禁用一种优化：在查询规划阶段完成后，将不必要的分区片段从快照中移除。
因此，长时间运行的查询可能会在整个执行期间一直保留已过时的分区片段，从而推迟分区片段清理并增加存储压力。

此设置目前仅适用于 MergeTree 系列表。
:::

可能的取值：

* 0 - 禁用
* 1 - 启用


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在同一条 mutation 的不同任务之间共享为 `IN` 子查询构建的 Set 对象。这可以减少内存使用和 CPU 消耗。

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用在聚合操作中使用软件预取

## enable_time_time64_type \{#enable_time_time64_type\}

**别名**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新增设置。允许使用新的实验性 Time 和 Time64 数据类型。"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "默认启用 Time 和 Time64 类型"}]}]}/>

允许创建 [Time](../../sql-reference/data-types/time.md) 和 [Time64](../../sql-reference/data-types/time64.md) 数据类型。

## enable_unaligned_array_join \{#enable_unaligned_array_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许对多个大小不同的数组执行 ARRAY JOIN。启用该设置后，这些数组会被调整为与最长数组的长度一致。

## enable_url_encoding \{#enable_url_encoding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "更改了现有设置的默认值"}]}]}/>

允许在 [URL](../../engines/table-engines/special/url.md) 引擎表中启用或禁用对 URI 路径的解码和编码。

默认禁用。

## enable_vertical_final \{#enable_vertical_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "修复 bug 后再次默认启用 vertical final"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "默认使用 vertical final"}]}]}/>

如果启用，该设置会在执行 FINAL 时通过将重复行标记为已删除，并在之后进行过滤来移除重复行，而不是直接合并这些行

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

开启后，`SELECT` 查询的结果会存储在[查询缓存](../query-cache.md)中。

可能的取值：

- 0 - 禁用
- 1 - 启用

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

如果启用，则仅允许使用由字母、数字和下划线组成的标识符。

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 `file` 引擎表中，每次执行 `INSERT` 时，在格式带有后缀（如 `JSON`、`ORC`、`Parquet` 等）的情况下创建一个新文件。若启用，每次插入都会创建一个新文件，文件名遵循以下模式：

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` 等。

可能的取值：

- 0 — `INSERT` 查询会将新数据追加到文件末尾。
- 1 — `INSERT` 查询会创建一个新文件。

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在没有底层文件的情况下从 File 引擎表中查询数据。

可能的取值：

- 0 — `SELECT` 抛出异常。
- 1 — `SELECT` 返回空结果。

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 [File](../../engines/table-engines/special/file.md) 引擎表中跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，则 `SELECT` 抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果。

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在 [File](../../engines/table-engines/special/file.md) 引擎表中是否在插入前截断文件。

可能的取值：

- 0 — `INSERT` 查询将新数据追加到文件末尾。
- 1 — `INSERT` 查询用新数据替换文件的现有内容。

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [URL](../../engines/table-engines/special/url.md) 引擎表中是否跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果。

## exact_rows_before_limit \{#exact_rows_before_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，ClickHouse 会为 `rows_before_limit_at_least` 统计指标提供精确数值，但代价是必须完整读取 LIMIT 之前的全部数据。

## except_default_mode \{#except_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

在 EXCEPT 查询中设置默认模式。可选值：空字符串、'ALL'、'DISTINCT'。如果留空，则不带模式的查询会抛出异常。

## exclude_materialize_skip_indexes_on_insert \{#exclude_materialize_skip_indexes_on_insert\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新设置。"}]}]} />

在执行 INSERT 时，不构建或存储指定的跳过索引。被排除的跳过索引仍会在[合并期间](merge-tree-settings.md/#materialize_skip_indexes_on_merge)或通过显式的
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询进行构建和存储。

如果 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) 为 false，则此设置不起作用。

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

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a will be not be updated upon insert
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- neither index would be updated on insert

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- only idx_b is updated

-- since it is a session setting it can be set on a per-query level
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- this query can be used to explicitly materialize the index

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- reset setting to default
```


## execute_exists_as_scalar_subquery \{#execute_exists_as_scalar_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

将非关联 EXISTS 子查询作为标量子查询来执行。与标量子查询一样，会使用缓存，并且对结果应用常量折叠。

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="10" />

连接超时时间（以秒为单位）。当前仅支持 MySQL

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在使用 external 引擎的表刷新历史数据时可读取的最大字节数。目前仅支持 MySQL 表引擎、数据库引擎和字典。若等于 0，则禁用该设置。

## external_storage_max_read_rows \{#external_storage_max_read_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制使用 external engine 的表在刷新历史数据时可读取的最大行数。目前仅支持 MySQL 表引擎、数据库引擎和字典。如果等于 0，则禁用此设置。

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

读写超时时间（以秒为单位）。当前仅支持 MySQL。

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

定义 [mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md) 和 [odbc](../../sql-reference/table-functions/odbc.md) 表函数如何使用 Nullable 列。

可能的取值：

- 0 — 表函数显式地使用 Nullable 列。
- 1 — 表函数隐式地使用 Nullable 列。

**使用说明**

如果将该设置设为 `0`，则表函数不会生成 Nullable 列，而是插入默认值来代替 NULL。这同样适用于数组中的 NULL 值。

## external_table_strict_query \{#external_table_strict_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果将其设置为 true，则禁止在针对外部表的查询中将表达式转换为本地过滤条件。

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\}

**别名**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "由 `extractKeyValuePairs` 函数能够生成的键值对的最大数量。用于防止过多内存占用的保护机制。"}]}]}/>

由 `extractKeyValuePairs` 函数能够生成的键值对的最大数量。用于防止过多内存占用的保护机制。

## extremes \{#extremes\}

<SettingsInfoBlock type="Bool" default_value="0" />

是否统计查询结果中各列的极值（最小值和最大值）。取值为 0 或 1。默认值为 0（禁用）。
有关更多信息，请参阅“Extreme values”部分。

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

在更新数据不可用时，强制将查询发送到滞后的副本。参见 [复制](../../engines/table-engines/mergetree-family/replication.md)。

ClickHouse 会从该表所有滞后的副本中选择一个最合适的副本。

当对指向复制表的分布式表执行 `SELECT` 查询时使用。

默认值为 1（启用）。

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新增设置，用于按查询控制文件系统缓存中的后台下载。"}]}]}/>

允许 filesystem cache 将从远程存储读取的数据加入后台下载队列。禁用后，将针对当前查询/会话在前台执行下载。

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

文件系统缓存边界对齐。此设置仅应用于非磁盘读操作（例如远程表引擎 / 表函数的缓存），不适用于 MergeTree 表的存储配置。值为 0 表示不对齐。

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。在 filesystem cache 中，为预留空间而锁定缓存时的等待时间。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。在文件系统缓存中，为预留空间而锁定缓存时的等待时间。

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\}

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

单个查询可从远程文件系统缓存下载的数据最大容量

## filesystem_cache_name \{#filesystem_cache_name\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "用于无状态表引擎或数据湖的文件系统缓存名称"}]}]}/>

用于无状态表引擎或数据湖的文件系统缓存名称

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新设置"}]}]}/>

如果启用了 filesystem cache，则优先采用更大的缓冲区大小，以避免写入过小的文件片段，从而降低缓存性能。另一方面，启用该设置可能会增加内存使用量。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "在文件系统缓存中为预留空间获取缓存锁的等待时间"}]}]}/>

在文件系统缓存中为预留空间获取缓存锁的等待时间

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="20" />

限制读缓冲区单次可从缓存请求的文件片段批次大小。值过小会导致对缓存的请求过于频繁，值过大可能会减慢缓存淘汰的速度。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\}

**别名**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Rename of setting skip_download_if_exceeds_query_cache_limit"}]}]}/>

如果超过查询缓存大小，则跳过从远程文件系统进行下载

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

用于预取的最大内存用量。

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

以字节为单位的预取步长。零表示 `auto` —— 预取步长将自动推断为一个大致最佳的值，但可能并非完全最优。实际取值可能会不同，因为还会受到设置项 filesystem_prefetch_min_bytes_for_single_read_task 的影响。

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\}

<SettingsInfoBlock type="UInt64" default_value="0" />

按 mark 数指定的预取步长。零表示 `auto` —— 将自动推导出一个大致最优的预取步长，但可能无法做到 100% 最优。实际取值可能会不同，因为还会受到设置项 filesystem_prefetch_min_bytes_for_single_read_task 的影响。

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\}

<SettingsInfoBlock type="UInt64" default_value="200" />

预取的最大次数。0 表示不限制。如果需要限制预取次数，更建议使用 `filesystem_prefetches_max_memory_usage` 设置。

## final \{#final\}

<SettingsInfoBlock type="Bool" default_value="0" />

自动对查询中所有适用 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 的表（包括被 JOIN 的表、子查询中的表以及分布式表）应用 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修饰符。

可选值：

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


## flatten_nested \{#flatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

设置[嵌套](../../sql-reference/data-types/nested-data-structures/index.md)列的数据格式。

可能的取值：

* 1 — 嵌套列会被“拉平”为多个独立的数组。
* 0 — 嵌套列保持为单个元组数组。

**用法**

如果该设置被配置为 `0`，则可以使用任意嵌套层级。

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

在该优化适用但启发式算法判定不使用时，强制启用该优化

## force_aggregation_in_order \{#force_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

该设置由服务器内部使用，用于支持分布式查询。不要手动更改它，否则会破坏正常运行。（在分布式聚合期间强制远程节点按顺序执行聚合）。

## force_data_skipping_indices \{#force_data_skipping_indices\}

如果传入的数据跳过索引未被使用，则会禁止执行查询。

请看下面的示例：

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
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- query will produce INDEX_NOT_USED error.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- Ok.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- Ok (example of full featured parser).
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- query will produce INDEX_NOT_USED error, since d1_null_idx is not used.
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- Ok.
```


## force_grouping_standard_compatibility \{#force_grouping_standard_compatibility\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "使 GROUPING 函数的输出与 SQL 标准和其他数据库管理系统相同"}]}]}/>

使 GROUPING 函数在参数未用作聚合键时返回 1

## force_index_by_date \{#force_index_by_date\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果无法按日期使用索引，则禁止执行查询。

适用于 MergeTree 系列中的表。

如果 `force_index_by_date=1`，ClickHouse 会检查查询是否具有可用于限制数据范围的日期键条件。如果没有合适的条件，它将抛出异常。但是，它不会检查该条件是否实际减少了需要读取的数据量。例如，即使条件 `Date != ' 2000-01-01 '` 匹配表中的所有数据（即运行查询需要全表扫描），该条件仍然是可接受的。有关 MergeTree 表中数据范围的更多信息，请参阅 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)。

## force_optimize_projection \{#force_optimize_projection\}

<SettingsInfoBlock type="Bool" default_value="0" />

在启用投影优化（参见 [optimize_use_projections](#optimize_use_projections) 设置）时，控制在 `SELECT` 查询中是否必须使用[投影](../../engines/table-engines/mergetree-family/mergetree.md/#projections)。

可能的取值：

- 0 — 投影优化不是必需的。
- 1 — 投影优化是必需的。

## force_optimize_projection_name \{#force_optimize_projection_name\}

如果将其设置为非空字符串，则会检查在查询中是否至少使用过一次该 PROJECTION。

可能的取值：

- string：在查询中使用的 PROJECTION 的名称

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\}

<SettingsInfoBlock type="UInt64" default_value="0" />

当已启用 [optimize_skip_unused_shards](#optimize_skip_unused_shards) 且无法跳过未使用分片时，用于控制是否允许继续执行查询。如果无法跳过且该设置已启用，则会抛出异常。

可能的取值：

- 0 — 禁用。ClickHouse 不会抛出异常。
- 1 — 启用。仅当表具有分片键时才会禁用查询执行。
- 2 — 启用。无论表是否定义了分片键，都会禁用查询执行。

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于控制 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) 是否根据分布式查询的嵌套层级生效（例如存在一个 `Distributed` 表查询另一个 `Distributed` 表的情况），因此仍然需要启用 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)。

可能的取值：

- 0 — 不启用基于嵌套层级的限制，`force_optimize_skip_unused_shards` 始终生效。
- 1 — 仅在第 1 级启用 `force_optimize_skip_unused_shards`。
- 2 — 在最多第 2 级启用 `force_optimize_skip_unused_shards`。

## force_primary_key \{#force_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果无法按主键进行索引，则会禁止执行该查询。

适用于 MergeTree 系列表引擎。

如果 `force_primary_key=1`，ClickHouse 会检查查询中是否包含可用于限制数据范围的主键条件。如果没有合适的条件，则会抛出异常。但不会检查该条件是否实际上减少了需要读取的数据量。有关 MergeTree 表中数据范围的更多信息，请参阅 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)。

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

在执行 DROP 查询时递归删除数据。可避免 ‘Directory not empty’ 错误，但可能静默删除已分离的数据

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "改善与 MySQL DATE_FORMAT/STR_TO_DATE 的兼容性"}]}]}/>

函数 `formatDateTime` 中的格式说明符 `%e` 会以前导空格输出一位数的日期，例如输出 `' 2'` 而不是 `'2'`。

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

函数 `formatDateTime` 中的格式说明符 `%f` 对于 `DateTime64` 只会按其 scale 的位数输出数字，而不是固定输出 6 位数字。

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "改进与 MySQL DATE_FORMAT()/STR_TO_DATE() 的兼容性"}]}]}/>

在函数 `formatDateTime` 中，当被格式化的值不包含小数秒时，格式说明符 `%f` 会输出单个零而不是六个零。

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

在函数 `formatDateTime` 中，格式说明符 `%c`、`%l` 和 `%k` 在输出月份和小时值时不会使用前导零。

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "与 MySQL DATE_FORMAT/STR_TO_DATE 的兼容性得到改进"}]}]}/>

在函数 `formatDateTime` 和 `parseDateTime` 中，格式符 `%M` 会输出/解析月份名称，而不是分钟。

## fsync_metadata \{#fsync_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

在写入 `.sql` 文件时启用或禁用 [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html)。默认启用。

如果服务器上有数以百万计、不断被创建和销毁的小表，那么禁用该设置是有意义的。

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "添加用于保留 dateTrunc 函数旧行为的新设置"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "将针对 DateTime64/Date32 参数的 dateTrunc 函数结果类型更改为 DateTime64/Date32，而不受时间单位影响，以便对负值获得正确结果"}]}]}/>

允许更改 `dateTrunc` 函数返回类型的行为。

可能的取值：

- 0 - 当第二个参数为 `DateTime64/Date32` 时，返回类型将为 `DateTime64/Date32`，而不受第一个参数中的时间单位影响。
- 1 - 对于 `Date32`，结果始终为 `Date`。对于 `DateTime64`，在时间单位为 `second` 或更粗粒度时，结果为 `DateTime`。

## function_implementation \{#function_implementation\}

为特定目标或变体选择函数实现（实验性功能）。留空则启用全部实现。

## function_json_value_return_type_allow_complex \{#function_json_value_return_type_allow_complex\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否允许 `json_value` 函数返回复杂类型（如 struct、array、map）。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Possible values:

* true — 允许。
* false — 不允许。


## function_json_value_return_type_allow_nullable \{#function_json_value_return_type_allow_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否允许 JSON&#95;VALUE 函数在值不存在时返回 `NULL`。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

可能的取值：

* true — 允许。
* false — 不允许。


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "提高与 MySQL locate 函数的兼容性。"}]}]}/>

控制函数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) 的参数顺序。

可能的取值：

- 0 — 函数 `locate` 接受参数 `(haystack, needle[, start_pos])`。
- 1 — 函数 `locate` 接受参数 `(needle, haystack[, start_pos])`（与 MySQL locate 函数的行为兼容）

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\}

<SettingsInfoBlock type="UInt64" default_value="500000000" />

设置由函数 [range](/sql-reference/functions/array-functions#range) 生成的数据量的安全阈值。用于限制函数在每个数据块中可生成的最大值数量（一个数据块中每行数组大小的总和）。

可能的取值：

- 正整数。

**另请参阅**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\}

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "在之前的版本中，3 秒的最长休眠时间只应用于 `sleep`，但不适用于 `sleepEachRow` 函数。在新版本中，我们引入了此设置。如果你将兼容性设置为之前的版本，我们会完全禁用该限制。"}]}]}/>

函数 `sleep` 在每个数据块中允许休眠的最大微秒数。如果用户传入了更大的值，将抛出异常。这是一个安全阈值。

## function_visible_width_behavior \{#function_visible_width_behavior\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "We changed the default behavior of `visibleWidth` to be more precise"}]}]}/>

`visibleWidth` 行为的版本号。0：仅统计 Unicode 码点的数量；1：正确处理零宽度和组合字符，将全角字符计为两个，估算制表符宽度，并统计删除字符。

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "提升默认精度。"}]}]}/>

如果对 `geoDistance`、`greatCircleDistance`、`greatCircleAngle` 这三个函数传入的四个参数全部为 Float64，则返回 Float64，并在内部计算中使用双精度。在之前的 ClickHouse 版本中，这些函数始终返回 Float32。

## geotoh3_argument_order \{#geotoh3_argument_order\}

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "用于保持旧版行为、设置经度和纬度参数顺序的新设置"}]}]}/>

当设置为 `lon_lat` 时，函数 `geoToH3` 接受参数顺序为 (lon, lat)；当设置为 `lat_lon` 时，则接受参数顺序为 (lat, lon)。

## glob_expansion_max_elements \{#glob_expansion_max_elements\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

允许的最大地址数量（用于外部存储、表函数等）。

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

grace hash join 的初始 bucket 数量

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

grace hash join 的 bucket 数量上限

## group_by_overflow_mode \{#group_by_overflow_mode\}

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

设置当用于聚合的唯一键数量超过限制时的行为：

- `throw`: 抛出异常
- `break`: 停止执行查询并返回部分结果
- `any`: 继续对已在集合中的键进行聚合，但不再向该集合中添加新的键。

使用 `any` 值可以运行一种近似的 GROUP BY。该近似的质量取决于数据的统计特性。

## group_by_two_level_threshold \{#group_by_two_level_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

当键的数量达到该值时开始执行两级聚合。0 表示不设置阈值。

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

从聚合状态的大小（字节数）达到多少开始使用两级聚合。0 表示不设置阈值。当任一阈值被触发时，将使用两级聚合。

## group_by_use_nulls \{#group_by_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

更改 [GROUP BY 子句](/sql-reference/statements/select/group-by) 处理聚合键类型的方式。
当使用 `ROLLUP`、`CUBE` 或 `GROUPING SETS` 修饰符时，某些聚合键可能不会被用于生成某些结果行。
对于这些键，对应行中的列将根据此设置填充为默认值或 `NULL`。

可能的取值：

- 0 — 使用聚合键类型的默认值来填充缺失值。
- 1 — ClickHouse 按照 SQL 标准规定的方式执行 `GROUP BY`。聚合键的类型会被转换为 [Nullable](/sql-reference/data-types/nullable)。对于未使用该聚合键的行，相应聚合键的列会填充为 [NULL](/sql-reference/syntax#null)。

另请参阅：

- [GROUP BY 子句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置"}]}]}/>

函数 'h3ToGeo' 在为 true 时返回 (lon, lat)，否则返回 (lat, lon)。

## handshake_timeout_ms \{#handshake_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

在握手期间从副本接收 Hello 数据包的超时时间（毫秒）。

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 HDFS 引擎表中每次插入时创建一个新文件。若启用，则每次插入都会创建一个新的 HDFS 文件，文件名类似如下模式：

初始文件：`data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` 等。

可选值：

- 0 — `INSERT` 查询将新数据追加到文件末尾。
- 1 — `INSERT` 查询会创建一个新文件。

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在请求的文件不存在时返回 0 行，而不是在 HDFS 表引擎中抛出异常"}]}]}/>

在按特定键读取时，如果文件不存在，则忽略文件缺失。

可能的取值：

- 1 — `SELECT` 返回空结果。
- 0 — `SELECT` 抛出异常。

## hdfs_replication \{#hdfs_replication\}

<SettingsInfoBlock type="UInt64" default_value="0" />

实际的副本数可以在创建 hdfs 文件时指定。

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 [HDFS](../../engines/table-engines/integrations/hdfs.md) 引擎表中跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "允许在 HDFS 引擎中，当 ListObjects 请求无法匹配到任何文件时抛出错误，而不是返回空查询结果"}]}]}/>

如果根据 glob 展开规则匹配到的文件数量为 0，则抛出错误。

可能的取值：

- 1 — `SELECT` 抛出异常。
- 0 — `SELECT` 返回空结果。

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在向 HDFS 引擎表执行插入前截断文件。若禁用，当尝试插入且 HDFS 中对应文件已存在时会抛出异常。

可能的取值：

- 0 — `INSERT` 查询将新数据追加到文件末尾。
- 1 — `INSERT` 查询以新数据替换文件中已有的内容。

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\}

<SettingsInfoBlock type="毫秒" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "在 Hedged 请求中在 50 ms 后启动新连接以替代 100 ms，从而与之前的连接超时设置保持一致"}]}]}/>

Hedged 请求与副本建立连接的超时时间

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\}

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新设置。之前，该值可以在 CREATE INDEX 中选择性指定，默认值为 64。"}]}]}/>

在搜索向量相似性索引时使用的动态候选列表的大小，也称为“ef_search”。

## hsts_max_age \{#hsts_max_age\}

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS 的生效时长。0 表示禁用 HSTS。

## http_connection_timeout \{#http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 连接超时时间（秒）。

可能的取值：

- 任意正整数。
- 0 - 表示禁用（无限超时）。

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

不要以小于指定时间间隔的频率发送名为 `X-ClickHouse-Progress` 的 HTTP 头。

## http_make_head_request \{#http_make_head_request\}

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 设置项允许在通过 HTTP 读取数据时先执行 `HEAD` 请求，以获取即将读取的文件的信息，例如其大小。由于该设置默认启用，当服务器不支持 `HEAD` 请求时，可能需要将其禁用。

## http_max_field_name_size \{#http_max_field_name_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 请求头中字段名的最大长度

## http_max_field_value_size \{#http_max_field_value_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 头部中字段值的最大长度

## http_max_fields \{#http_max_fields\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP 头部中的最大字段数

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`multipart/form-data` 内容大小的上限。该设置不能通过 URL 参数解析，必须在用户配置文件中设置。注意，在开始执行查询之前，内容会被解析，且外部表会在内存中创建。而且这是在该阶段唯一生效的限制（在读取 HTTP 表单数据时，对最大内存使用量和最大执行时间的限制均不起作用）。

## http_max_request_param_data_size \{#http_max_request_param_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

限制预定义 HTTP 请求中作为查询参数使用的请求数据大小。

## http_max_tries \{#http_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

通过 HTTP 读取的最大重试次数。

## http_max_uri_size \{#http_max_uri_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

设置 HTTP 请求的最大 URI 长度。

可能的取值：

- 正整数。

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在从客户端解压 HTTP POST 数据时对校验和的验证。仅用于 ClickHouse 原生压缩格式（不用于 `gzip` 或 `deflate`）。

更多信息请参阅[HTTP 接口说明](/interfaces/http)。

可能的值：

- 0 — 禁用。
- 1 — 启用。

## http_receive_timeout \{#http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "参见 http_send_timeout。"}]}]}/>

HTTP 接收超时时间（以秒为单位）。

可能的取值：

- 任意正整数。
- 0 - 禁用（无限超时）。

## http_response_buffer_size \{#http_response_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在向客户端发送 HTTP 响应之前，或在将数据写入磁盘之前（当启用 http_wait_end_of_query 时），在服务器内存中用于缓冲的字节数。

## http_response_headers \{#http_response_headers\}

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "New setting."}]}]}/>

用于添加或覆盖服务器在成功返回查询结果时响应中的 HTTP 头。
这仅影响 HTTP 接口。

如果该头已经有默认值，则提供的值将覆盖它。
如果该头没有默认值，则会被添加到头列表中。
由服务器默认设置且未被此设置覆盖的头将保持不变。

该设置允许你将某个头设置为常量值。目前还无法将头设置为动态计算的值。

名称和值都不能包含 ASCII 控制字符。

如果你实现了一个 UI 应用，既允许用户修改设置，又需要根据返回的头做出决策，建议将此设置限制为只读。

示例：`SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

通过 HTTP 重试读取时的最小退避时间（毫秒）

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

通过 HTTP 重试读取时的最大退避时长（毫秒）

## http_send_timeout \{#http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 分钟看起来非常长。请注意，这是单次网络写操作调用的超时时间，而不是整个上传操作的超时时间。"}]}]}/>

HTTP 发送超时时间（以秒为单位）。

可能的取值：

- 任意正整数。
- 0 - 禁用（无限超时）。

:::note
仅适用于默认 profile。需要重启服务器后更改才会生效。
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\}

<SettingsInfoBlock type="Bool" default_value="1" />

对 glob 通配模式，跳过返回 HTTP_NOT_FOUND 错误的 URL

## http_wait_end_of_query \{#http_wait_end_of_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

在服务端启用 HTTP 响应的缓冲处理。

## http_write_exception_in_output_format \{#http_write_exception_in_output_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "为在各种格式之间保持一致性而修改"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "在 HTTP 流式传输发生异常时输出有效的 JSON/XML。"}]}]}/>

在输出格式中写入异常信息，以生成格式正确的输出。适用于 JSON 和 XML 格式。

## http_zlib_compression_level \{#http_zlib_compression_level\}

<SettingsInfoBlock type="Int64" default_value="3" />

当 [enable_http_compression = 1](#enable_http_compression) 时，设置 HTTP 请求响应中的数据压缩级别。

可选值：1 到 9 的整数。

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置"}]}]}/>

是否在执行 DROP 时删除所有 Iceberg 文件。

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新设置。"}]}]}/>

在插入操作中，iceberg Parquet 数据文件的最大大小（字节）。

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg 表引擎中每次 INSERT 操作允许的最大分区数量。

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新设置。"}]}]}/>

在插入操作期间，Iceberg Parquet 数据文件中允许的最大行数。

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "New setting"}]}]}/>

用于压缩 `.metadata.json` 文件的方法。

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\}

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

控制将 Iceberg 表的元数据记录到 system.iceberg_metadata_log 的日志级别。
通常在调试时会修改此设置。

可能的取值：

- none - 不记录元数据日志。
- metadata - 根 metadata.json 文件。
- manifest_list_metadata - 上述所有内容 + 对应某个快照的 avro manifest list 中的元数据。
- manifest_list_entry - 上述所有内容 + avro manifest list 中的条目。
- manifest_file_metadata - 上述所有内容 + 遍历到的 avro manifest 文件中的元数据。
- manifest_file_entry - 上述所有内容 + 遍历到的 avro manifest 文件中的条目。

## iceberg_snapshot_id \{#iceberg_snapshot_id\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新设置。"}]}]}/>

使用特定的快照 ID 查询 Iceberg 表。

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新设置。"}]}]}/>

使用在特定时间戳时生效的快照来查询 Iceberg 表。

## idle_connection_timeout \{#idle_connection_timeout\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

在指定的秒数之后关闭空闲 TCP 连接的超时时间。

可能的取值：

- 非负整数（0 表示在 0 秒后立即关闭）。

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

仅在 ClickHouse Cloud 中生效。在新的数据分区片段被预热（参见 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)）或其存在时间达到指定秒数之前，将这些新分区片段从 SELECT 查询中排除。仅适用于 Replicated-/SharedMergeTree。

## ignore_data_skipping_indices \{#ignore_data_skipping_indices\}

如果查询本来会使用指定的跳过索引，则忽略这些跳过索引。

请参考以下示例：

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- Ok.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- Ok.

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- query will produce INDEX_NOT_USED error, since xy_idx is explicitly ignored.
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

在未忽略任何索引时的查询：

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
      Skip
        Name: xy_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

忽略 `xy_idx` 这个索引：

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

适用于 MergeTree 系列的表。


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "允许服务器以指定概率忽略 DROP 表查询，用于测试目的"}]}]}/>

如果启用，服务器会以指定的概率忽略所有 DROP TABLE 查询（对于 Memory 和 JOIN 引擎，会将 DROP 替换为 TRUNCATE），用于测试目的。

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "新增设置，用于在目标表已被删除时忽略 materialized view"}]}]}/>

在向视图推送数据时忽略目标表已被删除的 MV

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

在管理副本访问实体的查询中忽略 ON CLUSTER 子句。

## ignore_on_cluster_for_replicated_database \{#ignore_on_cluster_for_replicated_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "添加一个新的设置，用于在针对复制数据库的 DDL 查询中忽略 ON CLUSTER 子句。"}]}]}/>

对于复制数据库的 DDL 查询，始终忽略 ON CLUSTER 子句。

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "对副本 named collection 的管理查询忽略 ON CLUSTER 子句。"}]}]}/>

对副本 named collection 的管理查询忽略 ON CLUSTER 子句。

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

在用于管理副本 UDF 的查询中忽略 ON CLUSTER 子句。

## implicit_select \{#implicit_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

允许在不写前置 SELECT 关键字的情况下编写简单的 SELECT 查询，从而便于类似计算器的用法，例如 `1 + 2` 即为一个有效的查询。

在 `clickhouse-local` 中，该设置默认开启，并且可以显式关闭。

## implicit_table_at_top_level \{#implicit_table_at_top_level\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "一个在 clickhouse-local 中使用的新设置"}]}]}/>

如果不为空，则在最外层不带 FROM 的查询会从此表中读取数据，而不是从 system.one 中读取。

这在 clickhouse-local 中用于处理输入数据。
该设置可以由用户显式设置，但并非为这种用法而设计。

子查询不受此设置影响（无论是标量子查询、FROM 子查询还是 IN 子查询）。
在 UNION、INTERSECT、EXCEPT 链最外层的 SELECT 会被统一处理，并且都会受到此设置影响，而不考虑它们在括号中的分组方式。
该设置如何影响视图和分布式查询尚未作规定。

该设置接受一个表名（此时表会从当前数据库中解析），或者形式为 'database.table' 的限定名称。
database 和 table 名称必须为不带引号的简单标识符。

## implicit_transaction \{#implicit_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用且当前不在事务中，则会将该查询封装在一个完整的事务中（BEGIN + COMMIT 或 ROLLBACK）

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置"}]}]}/>

如果启用，则会在没有 ORDER BY 子句的 SELECT 查询中注入 `ORDER BY rand()`。
仅在子查询深度 = 0 时生效。子查询以及 INSERT INTO ... SELECT 不受影响。
如果顶层结构是 UNION，则会在其所有子查询中分别注入 `ORDER BY rand()`。
仅在测试和开发中有用（缺少 ORDER BY 会导致查询结果具有非确定性）。

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用该设置后，允许在 INSERT 语句中使用物化列。

## insert_deduplicate \{#insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用针对 `INSERT` 的数据块级去重（适用于 Replicated\* 表）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

默认情况下，由 `INSERT` 语句插入到复制表中的数据块会进行去重（参见 [Data Replication](../../engines/table-engines/mergetree-family/replication.md)）。
对于复制表，默认情况下仅对每个分区中最近的 100 个数据块进行去重（参见 [replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)）。
对于非复制表，参见 [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window)。

## insert_deduplication_token \{#insert_deduplication_token\}

该设置允许用户在 MergeTree/ReplicatedMergeTree 中提供自定义的去重语义。
例如，在每个 INSERT 语句中为该设置提供一个唯一值，
用户可以避免相同的插入数据被当作重复数据而去重。

可能的取值：

* 任意字符串

仅当 `insert_deduplication_token` 不为空时才会用于去重。

对于副本表，默认情况下每个分区仅对最近的 100 次插入进行去重（参见 [replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)）。
对于非副本表，参见 [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window)。

:::note
`insert_deduplication_token` 在分区级别生效（与 `insert_deduplication` 校验和一样）。多个分区可以具有相同的 `insert_deduplication_token`。
:::

示例：

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- the next insert won't be deduplicated because insert_deduplication_token is different
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- the next insert will be deduplicated because insert_deduplication_token
-- is the same as one of the previous
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

在执行插入操作期间，keeper 请求发生故障的大致概率。有效取值范围为区间 [0.0f, 1.0f]。

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 随机种子，否则为该设置值

## insert_keeper_max_retries \{#insert_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "Enable reconnections to Keeper on INSERT, improve reliability"}]}]} />

该设置用于在向 replicated MergeTree 表执行 INSERT 时，为 ClickHouse Keeper（或 ZooKeeper）请求设置最大重试次数。仅对因网络错误、Keeper 会话超时或请求超时而失败的 Keeper 请求才会进行重试。

可能的取值：

* 正整数。
* 0 — 禁用重试

Cloud 默认值：`20`。

Keeper 请求的重试会在经过一段超时时间后执行。该超时时间由以下设置控制：`insert_keeper_retry_initial_backoff_ms`、`insert_keeper_retry_max_backoff_ms`。
第一次重试会在经过 `insert_keeper_retry_initial_backoff_ms` 指定的超时时间后进行。后续的超时时间将按如下方式计算：

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例如，如果 `insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000` 且 `insert_keeper_max_retries=8`，则超时时间将为 `100, 200, 400, 800, 1600, 3200, 6400, 10000`。

除了容错性之外，重试机制还旨在提供更好的用户体验——例如，当 Keeper 因升级而重启时，它可以避免在执行 INSERT 期间返回错误。


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

在执行 INSERT 查询时重试失败的 Keeper 请求所使用的初始退避时间（毫秒）

可能的取值：

- 正整数。
- 0 — 无超时

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

在执行 INSERT 查询时，对失败的 Keeper 请求进行重试的最大等待时间（毫秒）

可能的取值：

- 正整数。
- 0 — 最大等待时间不受限制

## insert_null_as_default \{#insert_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在向非 [Nullable](/sql-reference/data-types/nullable) 数据类型的列中插入 [默认值](/sql-reference/statements/create/table#default_values) 来替代 [NULL](/sql-reference/syntax#null)。
如果列类型为非 Nullable 且该设置被禁用，则插入 `NULL` 会引发异常。若列类型为 Nullable，则无论此设置为何值，`NULL` 都会按原样插入。

此设置适用于 [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 查询。请注意，`SELECT` 子查询可以与 `UNION ALL` 子句组合使用。

可能的取值：

- 0 — 向非 Nullable 列插入 `NULL` 会引发异常。
- 1 — 插入列的默认值来替代 `NULL`。

## insert_quorum \{#insert_quorum\}

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
此设置不适用于 SharedMergeTree，更多信息请参阅 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)。
:::

启用仲裁写入（quorum writes）。

- 如果 `insert_quorum < 2`，则禁用仲裁写入。
- 如果 `insert_quorum >= 2`，则启用仲裁写入。
- 如果 `insert_quorum = 'auto'`，则使用多数副本数量（`number_of_replicas / 2 + 1`）作为仲裁数。

仲裁写入

仅当 ClickHouse 能够在 `insert_quorum_timeout` 超时时间内将数据正确写入 `insert_quorum` 个副本时，`INSERT` 才会成功。若由于任何原因，成功写入的副本数量未达到 `insert_quorum`，则该写入被视为失败，ClickHouse 会从所有已写入数据的副本中删除该已插入的数据块。

当 `insert_quorum_parallel` 被禁用时，仲裁中的所有副本是一致的，即它们包含所有先前 `INSERT` 查询的数据（`INSERT` 序列被线性化）。在使用 `insert_quorum` 写入数据且 `insert_quorum_parallel` 被禁用的情况下，您可以通过启用 [select_sequential_consistency](#select_sequential_consistency) 为 `SELECT` 查询开启顺序一致性。

ClickHouse 在以下情况下会抛出异常：

- 在执行查询时，可用副本数量少于 `insert_quorum`。
- 当 `insert_quorum_parallel` 被禁用，且在前一个数据块尚未写入副本的 `insert_quorum` 时尝试写入数据。若用户在带有 `insert_quorum` 的前一个 `INSERT` 查询尚未完成前，对同一张表执行另一个 `INSERT` 查询，就可能出现此情况。

另请参阅：

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "默认使用并行 quorum 插入。与顺序 quorum 插入相比，它的使用要方便得多"}]}]}/>

:::note
此设置不适用于 SharedMergeTree，更多信息参见 [SharedMergeTree 一致性](/cloud/reference/shared-merge-tree#consistency)。
:::

启用或禁用 quorum `INSERT` 查询的并行执行。如果启用，在先前查询尚未完成时可以发送额外的 `INSERT` 查询。如果禁用，对同一张表的后续写入将被拒绝。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\}

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

写入仲裁的超时时间，单位为毫秒。如果超时时间已过且尚未完成写入，ClickHouse 将抛出异常，客户端必须重新执行该查询，将同一数据块写入相同或任意其他副本。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_shard_id \{#insert_shard_id\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果不是 `0`，则指定要同步插入数据的 [Distributed](/engines/table-engines/special/distributed) 表所属的分片。

如果 `insert_shard_id` 的值不正确，服务器将抛出异常。

要获取 `requested_cluster` 上的分片数量，可以检查服务器配置或使用以下查询：

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

可能的取值：

* 0 — 禁用。
* 从 `1` 到对应 [Distributed](/engines/table-engines/special/distributed) 表的 `shards_num`（含）之间的任意整数。

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

以微秒为单位的时间间隔，用于检查请求执行是否已被取消以及发送进度信息。

## intersect_default_mode \{#intersect_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

设置 INTERSECT 查询的默认模式。可选值：空字符串、'ALL'、'DISTINCT'。如果为空，则未显式指定模式的查询会抛出异常。

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置"}]}]}/>

在 trace 日志中收集 jemalloc 分配和释放操作的样本。

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

为查询启用 jemalloc 分析器。Jemalloc 将对内存分配进行采样，并对这些被采样分配的所有释放操作进行采样。
可以使用 `SYSTEM JEMALLOC FLUSH PROFILE` 刷新分析数据，以便进行内存分配分析。
采样数据也可以通过配置 `jemalloc_collect_global_profile_samples_in_trace_log` 或通过查询设置 `jemalloc_collect_profile_samples_in_trace_log` 存储到 `system.trace_log` 中。
参见 [Allocation Profiling](/operations/allocation-profiling)。

## join_algorithm \{#join_algorithm\}

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "已弃用 \"default\"，改为显式指定 join 算法；同时 parallel_hash 现在优先于 hash"}]}]}/>

指定使用哪种 [JOIN](../../sql-reference/statements/select/join.md) 算法。

可以指定多个算法，系统会根据 JOIN 的种类/严格性以及表引擎，为特定查询选择其中一种可用算法。

可能的取值：

- grace_hash

使用 [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join)。Grace hash 是一种在限制内存使用的前提下，高效处理复杂 join 的算法选项。

Grace join 的第一阶段会读取右表，并根据键列的哈希值将其拆分为 N 个 bucket（初始时 N 为 `grace_hash_join_initial_buckets`）。这样拆分是为了确保每个 bucket 都可以独立处理。来自第一个 bucket 的行会被加入内存中的哈希表，而其他 bucket 则会被写入磁盘。如果哈希表增长超过内存限制（例如由 [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) 设置），就会增加 bucket 的数量，并重新为每一行分配 bucket。任何不属于当前 bucket 的行都会被写回并重新分配。

支持 `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`。

- hash

使用 [Hash join 算法](https://en.wikipedia.org/wiki/Hash_join)。这是最通用的实现，支持所有种类和严格性组合，并支持在 `JOIN ON` 部分使用通过 `OR` 连接的多个 join 键。

当使用 `hash` 算法时，`JOIN` 的右侧会被加载到 RAM 中。

- parallel_hash

`hash` join 的一种变体，会将数据拆分为多个 bucket，并并发地构建多个哈希表而不是一个，以加速此过程。

当使用 `parallel_hash` 算法时，`JOIN` 的右侧会被加载到 RAM 中。

- partial_merge

[sort-merge 算法](https://en.wikipedia.org/wiki/Sort-merge_join) 的一种变体，其中仅右表会被完全排序。

`RIGHT JOIN` 和 `FULL JOIN` 仅在 `ALL` 严格性下被支持（不支持 `SEMI`、`ANTI`、`ANY` 和 `ASOF`）。

当使用 `partial_merge` 算法时，ClickHouse 会对数据进行排序并写入磁盘。ClickHouse 中的 `partial_merge` 算法与经典实现略有不同。首先，ClickHouse 会按 join 键对右表按块排序，并为已排序的块创建一个最小-最大索引。然后，它按 `join key` 对左表的部分数据进行排序，并在右表上执行 join。最小-最大索引也会用于跳过不需要的右表数据块。

- direct

`direct`（也称为嵌套循环）算法会使用左表中的行作为键，在右表中执行查找。
它受 [Dictionary](/engines/table-engines/special/dictionary)、[EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) 和 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 等特殊存储的支持。

对于 MergeTree 表，该算法会将 join 键过滤条件直接下推到存储层。当键可以利用表的主键索引进行查找时，这可能更加高效；否则，它会对每个左表数据块在右表上执行全表扫描。

支持 `INNER` 和 `LEFT` join，并且只支持单列等值 join 键且不带其他条件。

- auto

当设置为 `auto` 时，会首先尝试使用 `hash` join，如果违反内存限制，则会在运行时切换到其他算法。

- full_sorting_merge

在 join 之前对参与 join 的表进行完全排序的 [sort-merge 算法](https://en.wikipedia.org/wiki/Sort-merge_join)。

- prefer_partial_merge

ClickHouse 会在可能的情况下始终尝试使用 `partial_merge` join，否则使用 `hash`。*已弃用*，等价于 `partial_merge,hash`。

- default (deprecated)

遗留取值，请不要再使用。
等价于 `direct,hash`，即按顺序尝试使用 direct join 和 hash join。

## join_any_take_last_row \{#join_any_take_last_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

更改在使用 `ANY` 严格性时 `JOIN` 操作的行为方式。

:::note
此设置仅适用于与 [Join](../../engines/table-engines/special/join.md) 引擎表进行的 `JOIN` 操作。
:::

可能的值：

- 0 — 如果右表存在多行匹配的行，则仅将找到的第一行参与连接。
- 1 — 如果右表存在多行匹配的行，则仅将找到的最后一行参与连接。

另请参阅：

- [JOIN 子句](/sql-reference/statements/select/join)
- [Join 表引擎](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\}

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

设置 [JOIN 子句](/sql-reference/statements/select/join) 的默认严格模式。

可能的取值：

- `ALL` — 如果右表存在多行匹配记录，ClickHouse 会基于这些匹配记录创建[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)。这是标准 SQL 中 `JOIN` 的常规行为。
- `ANY` — 如果右表存在多行匹配记录，只会连接找到的第一行。如果右表只有一行匹配记录，则 `ANY` 和 `ALL` 的结果相同。
- `ASOF` — 用于在匹配条件不确定的情况下连接序列。
- `Empty string` — 如果在查询中未显式指定 `ALL` 或 `ANY`，ClickHouse 会抛出异常。

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\}

<SettingsInfoBlock type="UInt64" default_value="64" />

限制在磁盘上执行的 MergeJoin 操作中用于并行排序的文件数量上限。

该 SETTING 的值越大，占用的 RAM 越多，所需的磁盘 I/O 就越少。

可能的取值：

- 任意从 2 开始的正整数。

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "用于确定在哈希连接中是否以行列表形式输出时，右表中每个键对应的平均行数下限。"}]}]}/>

用于确定在哈希连接中是否以行列表形式输出时，右表中每个键对应的平均行数下限。

## join_overflow_mode \{#join_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

定义当达到以下任一 join 限制时 ClickHouse 将执行的操作：

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

可用值：

- `THROW` — ClickHouse 抛出异常并终止操作。
- `BREAK` — ClickHouse 终止操作但不抛出异常。

默认值：`THROW`。

**另请参阅**

- [JOIN 子句](/sql-reference/statements/select/join)
- [Join 表引擎](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "新设置"}]}]}/>

作为 JOIN 运行时过滤器使用的 Bloom 过滤器大小（以字节为单位）（参见 enable_join_runtime_filters 设置）。

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

在作为 JOIN 运行时过滤器使用的 Bloom 过滤器中哈希函数的数量（参见 enable_join_runtime_filters 设置）。

## join_runtime_bloom_filter_max_ratio_of_set_bits \{#join_runtime_bloom_filter_max_ratio_of_set_bits\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

如果运行时 bloom filter 中被置位的比特数量超过该比率，则会将该过滤器完全禁用，以减少开销。

## join_runtime_filter_blocks_to_skip_before_reenabling \{#join_runtime_filter_blocks_to_skip_before_reenabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "30"},{"label": "New setting"}]}]}/>

在尝试动态重新启用先前因过滤效果较差而被禁用的 runtime filter 之前需要跳过的数据块数量。

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

在 runtime filter 中以原值形式存储在 Set 中的元素的最大数量。当超过此阈值时，将切换为使用 Bloom 过滤器。

## join_runtime_filter_pass_ratio_threshold_for_disabling \{#join_runtime_filter_pass_ratio_threshold_for_disabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

如果通过行数与检查行数的比值大于该阈值，则认为该 runtime filter 性能较差，并会在接下来的 `join_runtime_filter_blocks_to_skip_before_reenabling` 个数据块中被禁用，以减少开销。

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "在左连接或内连接中，用于判断是否需要按键列重新排序右表的右表最大行数阈值"}]}]}/>

在左连接或内连接中，用于判断是否需要按键列重新排序右表的右表最大行数阈值。

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "用于确定在 LEFT 或 INNER JOIN 中是否按键对右表重新排序时，右表中每个键对应的平均行数下限。该设置确保不会对键分布稀疏的表应用此优化"}]}]}/>

用于确定在 LEFT 或 INNER JOIN 中是否按键对右表重新排序时，右表中每个键对应的平均行数下限。该设置确保不会对键分布稀疏的表应用此优化

## join_use_nulls \{#join_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

设置 [JOIN](../../sql-reference/statements/select/join.md) 的行为方式。在合并表时，可能会出现空单元格。ClickHouse 会根据此设置以不同方式对这些单元格进行填充。

可能的取值：

- 0 — 空单元格将填充为对应字段类型的默认值。
- 1 — `JOIN` 的行为与标准 SQL 相同。对应字段的类型会被转换为 [Nullable](/sql-reference/data-types/nullable)，空单元格将填充为 [NULL](/sql-reference/syntax)。

## joined_block_split_single_row \{#joined_block_split_single_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

允许按与左表单行对应的行将哈希连接结果拆分为多个分块。
在右表中存在与某一行有大量匹配的情况下，这可以减少内存使用，但可能会增加 CPU 使用。
注意，`max_joined_block_size_rows != 0` 是此设置生效的前提条件。
将 `max_joined_block_size_bytes` 与此设置配合使用，有助于在数据倾斜、某些大行在右表中有大量匹配时避免过度的内存使用。

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\}

<SettingsInfoBlock type="Bool" default_value="1" />

强制要求在 JOIN 中使用的子查询和表函数指定别名，以确保名称限定正确。

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

禁用对 kafka_num_consumers 的限制，该限制取决于可用 CPU 核心数。

## kafka_max_wait_ms \{#kafka_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

在重试之前，从 [Kafka](/engines/table-engines/integrations/kafka) 读取消息的等待时间（毫秒）。

可能的值：

- 正整数。
- 0 — 无限超时。

另请参阅：

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 KeeperMap 执行操作时强制进行额外检查。例如，如果插入已存在的键，则抛出异常。

## keeper_max_retries \{#keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "常规 Keeper 操作的最大重试次数"}]}]}/>

常规 Keeper 操作的最大重试次数

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "一般 Keeper 操作的初始退避超时时间"}]}]}/>

一般 Keeper 操作的初始退避超时时间

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "常规 Keeper 操作的最大退避超时时间"}]}]}/>

常规 Keeper 操作的最大退避超时时间

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，如果任一参数为 `NULL`，函数 `least` 和 `greatest` 将返回 `NULL`。

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "仅出于兼容性原因添加此设置。在将集群从低于 21.7 的版本滚动升级到更高版本时，将其设置为 'true' 是有意义的"}]}]}/>

在列名中列出大型 tuple 字面量中各元素的所有名称，而不是使用哈希值。此设置仅为兼容性而存在。在将集群从低于 21.7 的版本滚动升级到更高版本时，将其设置为 'true' 是合理的。

## lightweight_delete_mode \{#lightweight_delete_mode\}

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

作为轻量级删除一部分执行的内部更新查询的模式。

可能的取值：

- `alter_update` - 运行会创建重量级变更的 `ALTER UPDATE` 查询。
- `lightweight_update` - 如果可能则运行轻量级更新，否则运行 `ALTER UPDATE`。
- `lightweight_update_force` - 如果可能则运行轻量级更新，否则抛出异常。

## lightweight_deletes_sync \{#lightweight_deletes_sync\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "与 'mutation_sync' 相同，但仅控制轻量级删除的执行"}]}]}/>

与 [`mutations_sync`](#mutations_sync) 相同，但仅控制轻量级删除的执行。

可能的取值：

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | 变更操作异步执行。                                                                                                                                    |
| `1`   | 查询会等待当前服务器上的轻量级删除完成。                                                                                                              |
| `2`   | 查询会等待所有副本（如果存在）上的轻量级删除完成。                                                                                                    |
| `3`   | 查询只会等待活动副本完成。仅对 `SharedMergeTree` 支持。对于 `ReplicatedMergeTree`，其行为与 `mutations_sync = 2` 相同。                                 |

**另请参阅**

- [ALTER 查询的同步性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [变更（Mutations）](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置从查询结果中返回的最大行数。它会对 [LIMIT](/sql-reference/statements/select/limit) 子句所设置的值进行约束，确保查询中指定的限制不会超过该设置中定义的上限。

可能的取值：

- 0 — 行数不受限制。
- 正整数。

## load_balancing \{#load_balancing\}

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

指定在分布式查询处理中用于选择副本的算法。

ClickHouse 支持以下副本选择算法：

- [随机](#load_balancing-random)（默认）
- [最近的主机名](#load_balancing-nearest_hostname)
- [主机名的 Levenshtein 距离](#load_balancing-hostname_levenshtein_distance)
- [按顺序](#load_balancing-in_order)
- [第一个或随机](#load_balancing-first_or_random)
- [轮询](#load_balancing-round_robin)

另请参阅：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### 随机（默认方式） \{#load_balancing-random\}

```sql
load_balancing = random
```

每个副本都会统计其错误次数。查询会被发送到错误次数最少的副本；如果有多个副本并列错误最少，则会发送到其中任意一个。

缺点：不考虑服务器的网络/地理距离；如果各个副本上的数据不同，你也会得到不同的数据。


### 最接近的主机名 \{#load_balancing-nearest_hostname\}

```sql
load_balancing = nearest_hostname
```

对于每个副本都会统计错误数量。每 5 分钟，会将错误数量整除 2。这样就可以通过指数平滑的方式，对最近一段时间的错误数量进行计算。如果存在一个副本的错误数量最少（即其他副本上最近发生过错误），则将查询发送到该副本。如果有多个副本具有相同的最小错误数量，则查询会被发送到与配置文件中服务器主机名最相似的那个副本（比较在相同位置上字符不同的数量，比较长度为两个主机名长度的最小值）。

例如，example01-01-1 和 example01-01-2 在一个位置上不同，而 example01-01-1 和 example01-02-2 在两个位置上不同。
这种方法看起来可能比较原始，但它不需要外部网络拓扑数据，也不需要比较 IP 地址，而对于我们的 IPv6 地址来说，比较 IP 会很复杂。

因此，如果存在等价的副本，则优先选择主机名距离最近的那个。
我们也可以假设，在没有故障的情况下，当向同一台服务器发送查询时，一个分布式查询也会发送到同一组服务器上。所以即使不同数据被放置在不同副本上，查询也会在大多数情况下返回相同的结果。


### 主机名的 Levenshtein 距离 \{#load_balancing-hostname_levenshtein_distance\}

```sql
load_balancing = hostname_levenshtein_distance
```

与 `nearest_hostname` 类似，但它是通过 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance) 来比较主机名的。例如：

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### 顺序 \{#load_balancing-in_order\}

```sql
load_balancing = in_order
```

具有相同错误次数的副本将按照它们在配置中指定的顺序被访问。
当您明确知道哪个副本更优先时，适合采用此方法。


### 优先或随机 \{#load_balancing-first_or_random\}

```sql
load_balancing = first_or_random
```

该算法会选择集合中的第一个副本，如果第一个副本不可用，则选择一个随机副本。它在跨复制拓扑部署中非常有效，但在其他配置中几乎没有用处。

`first_or_random` 算法解决了 `in_order` 算法存在的问题。使用 `in_order` 时，如果一个副本宕机，下一个副本会承受双倍负载，而其余副本仍然只处理正常流量。使用 `first_or_random` 算法时，负载会在仍然可用的副本之间均匀分布。

可以通过设置 `load_balancing_first_offset` 来显式定义哪个副本是“第一个”副本。这样可以对副本之间的查询工作负载再平衡进行更精细的控制。


### 轮询 \{#load_balancing-round_robin\}

```sql
load_balancing = round_robin
```

该算法采用轮询（round-robin）策略在错误次数相同的副本之间进行分配（仅考虑使用 `round_robin` 策略的查询）。


## load_balancing_first_offset \{#load_balancing_first_offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在使用 FIRST_OR_RANDOM 负载均衡策略时，应优先将查询发送到哪个副本。

## load_marks_asynchronously \{#load_marks_asynchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

以异步方式加载 MergeTree 标记

## local_filesystem_read_method \{#local_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

从本地文件系统读取数据的方法，可选值包括：read、pread、mmap、io_uring、pread_threadpool。

`io_uring` 方法是实验性的，并且在存在并发读写的情况下，不适用于 Log、TinyLog、StripeLog、File、Set 和 Join，以及其他具有可追加文件的表。
即使在互联网上看到各种关于 `io_uring` 的文章，也不要被这些内容误导。除非是在大量小 IO 请求的场景下，否则它并不是更优的文件读取方法，而这并不是 ClickHouse 的典型场景。没有任何理由启用 `io_uring`。

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

从本地文件系统读取数据时是否启用预取功能。

## lock_acquire_timeout \{#lock_acquire_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

定义锁请求在失败前可等待的秒数。

锁超时用于在对表执行读写操作时防止发生死锁。当超时时间到期且锁请求失败时，ClickHouse 服务器会抛出异常 "Locking attempt timed out! Possible deadlock avoided. Client should retry."，错误码为 `DEADLOCK_AVOIDED`。

可能的取值：

- 正整数（单位为秒）。
- 0 — 禁用锁超时。

## log_comment \{#log_comment\}

指定 [system.query&#95;log](../system-tables/query_log.md) 表中 `log_comment` 字段的值，以及服务器日志中的注释文本。

它可用于提高服务器日志的可读性。此外，在运行 [clickhouse-test](../../development/tests.md) 之后，它有助于从 `system.query_log` 中筛选与测试相关的查询。

可选值：

* 任意长度不超过 [max&#95;query&#95;size](#max_query_size) 的字符串。如果超过 max&#95;query&#95;size，服务器会抛出异常。

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

允许将格式化查询记录到 [system.query_log](../../operations/system-tables/query_log.md) 系统表中（为 [system.query_log](../../operations/system-tables/query_log.md) 中的 `formatted_query` 列填充数据）。

可选值：

- 0 — 不在系统表中记录格式化查询。
- 1 — 在系统表中记录格式化查询。

## log_processors_profiles \{#log_processors_profiles\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

将处理器在执行/等待数据期间所花费的时间写入 `system.processors_profile_log` 表。

另请参阅：

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

将查询性能统计信息写入 query_log、query_thread_log 和 query_views_log。

## log_queries \{#log_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

配置查询日志记录。

在此配置下，发送到 ClickHouse 的查询会根据 [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) 服务器配置参数中的规则进行记录。

示例：

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果查询长度超过指定阈值（以字节计），则在写入查询日志时截断该查询。同时限制在普通文本日志中打印的查询长度。

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

如果启用（非零），执行时间短于此设置值的查询将不会被记录到日志中（可将其理解为 [MySQL 慢查询日志](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) 中的 `long_query_time`），这基本上意味着你不会在以下表中看到这些查询：

- `system.query_log`
- `system.query_thread_log`

只有具有以下类型的查询才会被写入日志：

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 类型：毫秒
- 默认值：0（记录任意查询）

## log_queries_min_type \{#log_queries_min_type\}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

写入 `query_log` 的最小记录类型。

可能的取值：

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

可用于限制哪些记录会写入 `query_log`。例如，如果你只关心错误，可以使用 `EXCEPTION_WHILE_PROCESSING`：

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\}

<SettingsInfoBlock type="Float" default_value="1" />

允许用户仅将按指定概率随机选取的一部分查询写入 [query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md) 和 [query_views_log](../../operations/system-tables/query_views_log.md) 系统表。这样可以在每秒查询量很大时减轻负载。

可能的取值：

- 0 — 查询不会记录到系统表中。
- 区间 [0..1] 内的正浮点数。例如，如果该设置的值为 `0.5`，大约有一半的查询会记录到系统表中。
- 1 — 所有查询都会记录到系统表中。

## log_query_settings \{#log_query_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

将查询设置记录到 `query_log` 和 OpenTelemetry span 日志中。

## log_query_threads \{#log_query_threads\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或关闭查询线程日志记录。

查询线程会被记录到 [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) 表中。此设置仅当 [log&#95;queries](#log_queries) 为 true 时才生效。在该配置下，由 ClickHouse 执行的查询线程会按照 [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) 服务器配置参数中的规则进行日志记录。

可能的取值：

* 0 — 禁用。
* 1 — 启用。

**示例**

```text
log_query_threads=1
```


## log_query_views \{#log_query_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用查询视图日志记录的设置。

当在启用此设置的情况下，ClickHouse 所执行的查询存在关联视图（物化视图或实时视图）时，这些视图会按照服务器配置参数 [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) 被记录下来。

示例：

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许或限制在 [Native](/interfaces/formats/Native) 格式中使用 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 数据类型。

如果限制使用 `LowCardinality`，ClickHouse 服务器会在 `SELECT` 查询中将 `LowCardinality` 列转换为普通列，在 `INSERT` 查询中将普通列转换为 `LowCardinality` 列。

此设置主要用于兼容不支持 `LowCardinality` 数据类型的第三方客户端。

可能的取值：

- 1 — 不限制使用 `LowCardinality`。
- 0 — 限制使用 `LowCardinality`。

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

设置可写入存储文件系统的、用于 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 数据类型的共享全局字典的最大大小（按行数计）。此设置可防止在字典无限增长的情况下出现内存（RAM）相关问题。所有由于达到最大字典大小限制而无法编码的数据，ClickHouse 会以常规方式进行写入。

可能的取值：

- 任意正整数。

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

开启或关闭在一个数据部分中仅使用单个字典的行为。

默认情况下，ClickHouse 服务器会监控字典的大小，如果某个字典溢出，服务器就会开始写入下一个字典。要禁止创建多个字典，请设置 `low_cardinality_use_single_dictionary_for_part = 1`。

可能的取值：

- 1 — 禁止为该数据部分创建多个字典。
- 0 — 允许为该数据部分创建多个字典。

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

当启用查询优先级机制时（参见设置 `priority`），低优先级查询会等待高优先级查询完成。此设置用于指定等待时间。

## make_distributed_plan \{#make_distributed_plan\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

生成分布式查询计划。

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of skip indexes on insert"}]}]}/>

启用时，在执行 INSERT 时会构建并存储跳过索引（skip indexes）。如果禁用，跳过索引将只会在[合并期间](merge-tree-settings.md/#materialize_skip_indexes_on_merge)或通过显式执行 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 时才会被构建和存储。

另请参阅 [exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert)。

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of statistics on insert"}]}]}/>

控制是否在执行 INSERT 时构建并写入统计信息。若禁用，则统计信息会在合并期间或通过显式执行 MATERIALIZE STATISTICS 来构建并存储。

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\}

<SettingsInfoBlock type="Bool" default_value="1" />

在执行 ALTER MODIFY TTL 查询后，为已有数据应用生存时间 (TTL)

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许忽略 MATERIALIZED VIEW 的错误，并且无论 MVs 是否处理成功，都将原始数据块写入目标表

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Added setting to preserve old behavior if needed."}]}]}/>

将来自单个 INSERT 查询的并行插入合并写入 materialized view 的目标表，以减少生成的分区片段数量。
如果将此设置为 false 且启用了 `parallel_view_processing`，则 INSERT 查询会在目标表中为每个 `max_insert_thread` 生成一个分区片段。

## max_analyze_depth \{#max_analyze_depth\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

由解释器执行的最大分析次数。

## max_ast_depth \{#max_ast_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

查询语法树（AST）的最大嵌套深度。若超出该值，将抛出异常。

:::note
目前在解析期间不会检查该限制，只会在查询解析完成后进行检查。
这意味着在解析过程中可能会创建过深的语法树，但该查询将执行失败。
:::

## max_ast_elements \{#max_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

查询语法树中允许的最大元素数量。如果超出该值，将抛出异常。

:::note
该限制目前不会在解析阶段检查，而只会在查询解析完成后检查。
这意味着在解析过程中可能会构建层级过深的语法树，但该查询最终会执行失败。
:::

## max_autoincrement_series \{#max_autoincrement_series\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "新增设置"}]}]}/>

`generateSerialID` 函数可创建的序列数量上限。

由于每个序列都对应 Keeper 中的一个节点，建议其数量控制在数百万以内。

## max_backup_bandwidth \{#max_backup_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

服务器上特定备份的最大读取速率（以每秒字节数计）。0 表示不受限制。

## max_block_size \{#max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

在 ClickHouse 中，数据按块进行处理，每个块是若干列分区片段的集合。对单个块的内部处理循环是高效的，但在处理每个块时都会产生一定的开销。

`max_block_size` 表示从表中加载数据时，单个块中建议包含的最大行数。并非总是会从表中加载大小为 `max_block_size` 的块：如果 ClickHouse 判断只需要检索较少的数据，则会处理更小的块。

块的大小不应过小，以避免在处理每个块时产生显著开销；也不应过大，以确保带有 LIMIT 子句的查询在处理完第一个块后即可快速返回结果。设置 `max_block_size` 时，应以在多线程提取大量列时避免占用过多内存，并尽可能保留一定的缓存局部性为目标。

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：每个副本内存容量的一半。

启用或禁用在外部内存中执行 `GROUP BY` 子句。
（参见 [GROUP BY in external memory](/sql-reference/statements/select/group-by#group-by-in-external-memory)）

可能的取值：

- 单个 [GROUP BY](/sql-reference/statements/select/group-by) 操作可以使用的最大 RAM 容量（以字节为单位）。
- `0` — 禁用在外部内存中的 `GROUP BY`。

:::note
如果 GROUP BY 操作期间的内存使用量超过此阈值（字节），
则会激活 “external aggregation” 模式（将数据溢写到磁盘）。

推荐值为系统可用内存的一半。
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：每个副本可用内存的一半。

启用或禁用在外部存储中执行 `ORDER BY` 子句。参见 [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details)。
如果在执行 ORDER BY 操作期间的内存使用量（以字节为单位）超过该阈值，则会激活“外部排序”模式（将数据溢写到磁盘）。

可能的取值：

- 单个 [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作可使用的 RAM 最大容量（字节数）。
  推荐值为系统可用内存的一半。
- `0` — 禁用在外部存储中执行 `ORDER BY`。

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

在使用带有 LIMIT 的 ORDER BY 时，当内存使用量超过指定阈值后，会在最终合并之前执行额外的块合并操作，仅保留前 LIMIT 行。

## max_bytes_in_distinct \{#max_bytes_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

哈希表在内存中为 DISTINCT 运算的状态（以未压缩字节计）所能使用的最大字节数。

## max_bytes_in_join \{#max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于 JOIN 时所使用哈希表的最大大小（以字节为单位）。

此设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join)
操作以及 [Join 表引擎](/engines/table-engines/special/join)。

如果查询包含 JOIN，ClickHouse 会针对每个中间结果检查此设置。

当达到限制时，ClickHouse 可以执行不同的操作。使用
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 设置来选择相应操作。

可能的取值：

- 正整数。
- 0 — 禁用内存控制。

## max_bytes_in_set \{#max_bytes_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在 `IN` 子句中由子查询创建的 `Set` 所允许使用的最大未压缩数据字节数。

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "默认启用自动落盘。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新增设置。"}]}]}/>

允许 `GROUP BY` 使用的可用内存比例。一旦达到该比例，将改为使用外部存储进行聚合。

例如，如果设置为 `0.6`，`GROUP BY` 在执行开始时最多可以使用 60% 的可用内存
（分配给 server/user/merges 的内存），之后将开始使用外部聚合。

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "默认启用自动写入磁盘。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新增设置。"}]}]}/>

允许 `ORDER BY` 使用的可用内存占比。一旦达到该比例，就会使用外部排序。

例如，如果设置为 `0.6`，`ORDER BY` 在执行开始阶段将允许使用 `60%` 的可用内存（针对 server/user/merges），之后就会开始使用外部排序。

注意，`max_bytes_before_external_sort` 仍然会生效，只有当排序块大小大于 `max_bytes_before_external_sort` 时才会写入磁盘。

## max_bytes_to_read \{#max_bytes_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行查询时，从表中可读取的未压缩数据的最大字节数。
该限制会在每个处理的数据块上进行检查，仅适用于最深层的表表达式；在从远程服务器读取时，该限制仅在远程服务器上进行检查。

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行分布式查询时，从叶子节点上的本地表中可读取的最大字节数（未压缩数据）。虽然分布式查询可以对每个分片（叶子）发起多个子查询，但该限制只会在叶子节点的数据读取阶段进行检查，而在根节点的结果合并阶段会被忽略。

例如，一个集群由 2 个分片组成，每个分片包含一张具有 100 字节数据的表。一个打算通过设置 `max_bytes_to_read=150` 从两个表中读取全部数据的分布式查询会失败，因为总共会读取 200 字节的数据。而设置 `max_bytes_to_read_leaf=150` 的查询会成功，因为叶子节点最多各自只会读取 100 字节。

该限制会针对每一块被处理的数据进行检查。

:::note
在 `prefer_localhost_replica=1` 的情况下，此设置的行为是不稳定的。
:::

## max_bytes_to_sort \{#max_bytes_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

排序前允许处理的最大字节数。如果在 ORDER BY 操作中需要处理的未压缩字节数超过该值，其行为将由 `sort_overflow_mode` 决定，默认值为 `throw`。

## max_bytes_to_transfer \{#max_bytes_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 GLOBAL IN/JOIN 部分时，可传递到远程服务器或保存到临时表中的未压缩数据的最大字节数。

## max_columns_to_read \{#max_columns_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

单次查询中可以从表中读取的最大列数。
如果某个查询需要读取的列数超过指定的数量，将抛出异常。

:::tip
此设置有助于防止查询过于复杂。
:::

当值为 `0` 时表示不限制。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在写入表之前进行压缩时，未压缩数据块的最大大小。默认值为 1,048,576（1 MiB）。将块大小设置得更小通常会使压缩比略有降低，但由于缓存局部性，压缩和解压缩速度会略有提升，同时内存占用会减少。

:::note
这是一个专家级设置，如果你刚开始使用 ClickHouse，建议不要修改它。
:::

不要将用于压缩的块（由字节组成的一段内存）与用于查询处理的块（来自表的一组行）混淆。

## max_concurrent_queries_for_all_users \{#max_concurrent_queries_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果该设置的值小于或等于当前正在同时处理的查询数量，则抛出异常。

示例：可以将所有用户的 `max_concurrent_queries_for_all_users` 设置为 99，而数据库管理员可以将自己的值设置为 100，以便即使在服务器过载时也能运行查询进行排查。

为单个查询或用户修改该设置不会影响其他查询。

可能的取值：

* 正整数。
* 0 — 不限制。

**示例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**另请参阅**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max_concurrent_queries_for_user \{#max_concurrent_queries_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

每个用户允许同时处理的最大查询数。

可能的取值：

* 正整数。
* 0 — 不限制。

**示例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

对单个查询访问单个分布式表进行分布式处理时，与远程服务器的最大同时连接数。建议设置的值不小于集群中的服务器数量。

以下参数仅在创建分布式表（以及启动服务器）时使用，因此无需在运行时更改它们。

## max_distributed_depth \{#max_distributed_depth\}

<SettingsInfoBlock type="UInt64" default_value="5" />

限制针对 [Distributed](../../engines/table-engines/special/distributed.md) 表的递归查询的最大深度。

如果超过该值，服务器会抛出异常。

可能的取值：

- 正整数。
- 0 — 深度无上限。

## max_download_buffer_size \{#max_download_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

每个线程在并行下载时（例如 URL 引擎）使用的最大缓冲区大小。

## max_download_threads \{#max_download_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="4" />

用于下载数据的最大线程数（例如 URL 引擎）。

## max_estimated_execution_time \{#max_estimated_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "将 max_execution_time 和 max_estimated_execution_time 分离"}]}]}/>

以秒为单位的最大查询预估执行时间。当 [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
过期时，会对每个数据块进行检查。

## max_execution_speed \{#max_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒允许执行的最大行数。当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
超时时，会对每个数据块进行检查。如果执行速度过高，将降低执行速度。

## max_execution_speed_bytes \{#max_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒允许执行的最大字节数。在
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
到期时，对每个数据块进行检查。如果执行速度过高，将对其进行限制。

## max_execution_time \{#max_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

以秒为单位的最大查询执行时间。

`max_execution_time` 参数的含义可能有些难以理解。
它是基于当前查询执行速度进行插值推断来工作的
（此行为由 [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) 控制）。

如果预测的执行时间超过指定的 `max_execution_time`，
ClickHouse 会中断查询。默认情况下，`timeout_before_checking_execution_speed`
被设置为 10 秒。这意味着在查询执行 10 秒之后，ClickHouse
开始估算总执行时间。例如，如果 `max_execution_time`
设置为 3600 秒（1 小时），当估算的执行时间超过这 3600 秒的限制时，
ClickHouse 将终止查询。若将 `timeout_before_checking_execution_speed`
设置为 0，ClickHouse 将直接根据时钟时间来判断 `max_execution_time`。

如果查询运行时间超过指定的秒数，其行为将由 `timeout_overflow_mode` 决定，
默认值为 `throw`。

:::note
超时检查以及查询停止仅会在数据处理流程中的特定位置进行。
目前无法在聚合状态合并过程中或查询分析阶段停止查询，
因此实际运行时间会高于该设置指定的值。
:::

## max_execution_time_leaf \{#max_execution_time_leaf\}

<SettingsInfoBlock type="Seconds" default_value="0" />

在语义上与 [`max_execution_time`](#max_execution_time) 类似，但只在分布式或远程查询的叶子节点上生效。

例如，如果我们希望将叶子节点上的执行时间限制为 `10s`，但对初始节点不设置限制，那么可以不在嵌套子查询的 settings 中设置 `max_execution_time`，而是：

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

我们可以将 `max_execution_time_leaf` 作为查询的设置项：

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="500000" />

在展开别名和星号（*）之后，查询语法树的最大节点数。

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\}

<SettingsInfoBlock type="UInt64" default_value="5" />

从其他主机获取分区时的最大重试次数。

## max_final_threads \{#max_final_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

设置带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 `SELECT` 查询在数据读取阶段可使用的最大并行线程数。

可能的取值：

- 正整数。
- 0 或 1 — 禁用。`SELECT` 查询在单线程中执行。

## max_http_get_redirects \{#max_http_get_redirects\}

<SettingsInfoBlock type="UInt64" default_value="0" />

允许的 HTTP GET 重定向跳转的最大次数。通过限制该值，可增加额外的安全防护，防止恶意服务器将请求重定向到意料之外的服务。\n\n例如，外部服务器可能会重定向到另一个地址，而该地址看起来属于公司内部基础设施。此时，如果向该内部服务器发送 HTTP 请求，就可能从内部网络访问内部 API，从而绕过鉴权，甚至访问 Redis、Memcached 等其他内部服务。如果没有任何内部基础设施（包括运行在 localhost 上的进程），或者你信任该服务器，那么允许重定向是安全的。不过请注意，如果 URL 使用的是 HTTP 而非 HTTPS，你不仅需要信任远程服务器，还必须信任你的 ISP 以及中间路径上的所有网络。

## max_hyperscan_regexp_length \{#max_hyperscan_regexp_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

定义 [hyperscan multi-match functions](/sql-reference/functions/string-search-functions#multiMatchAny) 中每个正则表达式的最大长度。

可能的值：

* 正整数。
* 0 - 长度不受限制。

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
Exception: Regexp length too large.
```

**另请参阅**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max_hyperscan_regexp_total_length \{#max_hyperscan_regexp_total_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置每个 [hyperscan multi-match function](/sql-reference/functions/string-search-functions#multiMatchAny) 中所有正则表达式允许的最大总长度。

可能的取值：

* 正整数。
* 0 - 不限制长度。

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
Exception: Total regexp lengths too large.
```

**另请参阅**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\}

**别名**: `max_insert_block_size_rows`

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

插入到表中的数据块的最大大小（按行数计）。

该设置控制在解析输入格式时的数据块构建。当服务器解析基于行的输入格式（CSV、TSV、JSONEachRow 等）或从任意接口（HTTP、带内联数据的 clickhouse-client、gRPC、PostgreSQL wire protocol）接收的 Values 格式时，会使用此设置来决定何时发出一个数据块。  
注意：当使用 clickhouse-client 或 clickhouse-local 从文件读取时，由客户端自身解析数据，该设置应用在客户端侧。

在满足以下任一条件时会发出一个数据块：

- 最小阈值（与关系 AND）：同时达到 min_insert_block_size_rows 和 min_insert_block_size_bytes
- 最大阈值（或关系 OR）：达到 max_insert_block_size 或 max_insert_block_size_bytes 之一即可

默认值略大于 max_block_size。原因是某些表引擎（`*MergeTree`）会为每个插入的数据块在磁盘上形成一个 data part，这是一个相当大的实体。同样地，`*MergeTree` 表在插入期间会对数据进行排序，足够大的块大小可以在内存中对更多数据进行排序。

可能的取值：

- 正整数。

## max_insert_block_size_bytes \{#max_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "新的设置，用于在解析 Row Input Format 格式的数据时，以字节为单位控制块的大小。"}]}]}/>

插入到表中的数据在形成数据块时允许的最大块大小（以字节为单位）。

此设置与 max_insert_block_size_rows 配合使用，并在相同的上下文中控制块的生成。有关这些设置在何时以及如何应用的详细信息，请参见 max_insert_block_size_rows。

可能的取值：

- 正整数。
- 0 — 该设置不参与块的生成。

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于延迟最终数据分片刷写的最大流（列）数量。默认为自动（如果底层存储支持并行写入，则为 100，例如 S3；否则为禁用）

## max_insert_threads \{#max_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

执行 `INSERT SELECT` 查询时可使用的最大线程数。

可能的取值：

- 0（或 1）— `INSERT SELECT` 不进行并行执行。
- 正整数，大于 1。

Cloud 默认值：

- 具有 8 GiB 内存的节点为 `1`
- 具有 16 GiB 内存的节点为 `2`
- 更大内存的节点为 `4`

仅当 `SELECT` 部分是并行执行时，并行 `INSERT SELECT` 才会生效，参见 [`max_threads`](#max_threads) 设置。
较大的取值会导致更高的内存占用。

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "新设置"}]}]}/>

JOIN 结果的数据块最大大小（以字节为单位，前提是 JOIN 算法支持）。0 表示不限制。

## max_joined_block_size_rows \{#max_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN 结果的最大数据块大小（前提是 JOIN 算法支持该设置）。0 表示不限制。

## max_limit_for_vector_search_queries \{#max_limit_for_vector_search_queries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

LIMIT 超过该设置值的 SELECT 查询将无法使用向量相似性索引。此设置有助于防止向量相似性索引发生内存溢出。

## max_local_read_bandwidth \{#max_local_read_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

本地读取的最大带宽，单位为字节每秒。

## max_local_write_bandwidth \{#max_local_write_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

本地写入的最大速度，以每秒字节数为单位。

## max_memory_usage \{#max_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：取决于副本可用的 RAM 容量。

在单个服务器上执行单条查询时可使用的最大 RAM 容量。
值为 `0` 表示不限制。

该设置不会考虑可用内存的大小或整机内存总量。该限制仅应用于单个服务器上的单条查询。

可以使用 `SHOW PROCESSLIST` 查看每个查询当前的内存消耗。
每个查询的峰值内存消耗都会被跟踪并写入日志。

对于以下聚合函数在处理 `String` 和 `Array` 类型参数时的状态，内存使用不会被完全跟踪：

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

内存消耗还会受到参数 [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
和 [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) 的限制。

## max_memory_usage_for_user \{#max_memory_usage_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在单个服务器上执行某个用户的查询时可使用的最大 RAM 内存用量。0 表示不限制。

默认情况下，该数值不受限制（`max_memory_usage_for_user = 0`）。

另请参阅 [`max_memory_usage`](/operations/settings/settings#max_memory_usage) 的说明。

例如，如果希望将名为 `clickhouse_read` 的用户的 `max_memory_usage_for_user` 设置为 1000 字节，可以使用以下语句：

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

你可以先从客户端注销并重新登录，然后使用 `getSetting` 函数来验证其是否已生效：

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的速度，单位为字节/秒。此设置对每个查询生效。

可能的取值：

- 正整数。
- 0 — 禁用带宽控制。

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的速度（单位：字节/秒）。该设置适用于服务器上所有并发运行的查询。

可能的取值：

- 正整数。
- 0 — 关闭对数据传输速度的控制。

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的速率，以每秒字节数为单位。此设置适用于单个用户执行的所有并发查询。

可能的值：

- 正整数。
- 0 — 禁用对数据传输速率的控制。

## max_network_bytes \{#max_network_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在执行查询时，通过网络接收或发送的数据量（以字节为单位）。此设置对每个查询单独生效。

可能的取值：

- 正整数。
- 0 — 禁用数据量控制。

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="128" />

在表中应用该优化时允许的最大分区数

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Setting values were changed and backported to 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

用于决定是否拒绝查询的操作系统 CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间的最大比值。通过在最小和最大比值之间进行线性插值来计算概率，在该点概率为 1。

## max_parallel_replicas \{#max_parallel_replicas\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "默认最多使用 1000 个并行副本。"}]}]}/>

在执行查询时，每个分片可以使用的最大并行副本数。

可能的取值：

- 正整数。

**附加信息**

此选项在不同设置组合下会产生不同的结果。

:::note
当涉及 `JOIN` 或子查询，且所有表未满足特定要求时，此设置会产生不正确的结果。有关更多详细信息，请参阅 [Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas)。
:::

### 使用 `SAMPLE` 键进行并行处理 \{#parallel-processing-using-sample-key\}

如果在多个服务器上并行执行，一个查询可以更快完成。但在以下情况下，查询性能可能会下降：

- 采样键在分区键中的位置不利于高效地进行范围扫描。
- 向表中添加采样键会降低按其他列进行过滤的效率。
- 采样键是一个计算代价较高的表达式。
- 集群的延迟分布具有长尾特性，因此查询更多服务器会增加查询的整体延迟。

### 使用 [parallel_replicas_custom_key](#parallel_replicas_custom_key) 进行并行处理 \{#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key\}

此设置适用于任何复制表。

## max_parser_backtracks \{#max_parser_backtracks\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

解析器允许的最大回溯次数（在递归下降解析过程中尝试不同解析分支的最大次数）。

## max_parser_depth \{#max_parser_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

限制递归下降解析器的最大递归深度。可用于控制调用栈大小。

可能的取值：

- 正整数。
- 0 — 递归深度不受限制。

## max_parsing_threads \{#max_parsing_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "新增独立设置，用于控制从文件进行并行解析时的线程数"}]}]}/>

在支持并行解析的输入格式中，用于解析数据的最大线程数。默认情况下，该值会自动确定。

## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

在查询中删除分区时对可删除分区大小的限制。值 `0` 表示可以在没有任何限制的情况下删除分区。

Cloud 默认值：1 TB。

:::note
此查询设置会覆盖其对应的服务器设置，参见 [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "为单个块的分区数量添加限制"}]}]}/>

限制单个插入数据块中的最大分区数，如果该数据块包含过多分区，则会抛出异常。

- 正整数。
- `0` — 分区数量不受限制。

**详情**

在插入数据时，ClickHouse 会计算插入数据块中的分区数量。如果分区数量大于
`max_partitions_per_insert_block`，ClickHouse 会根据
`throw_on_max_partitions_per_insert_block` 的值记录警告或抛出异常。异常文本如下：

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
此设置是一个安全阈值，因为大量使用分区是一个常见的误区。
:::

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

限制在单个查询中可访问的最大分区数量。

在创建表时指定的设置值可以通过查询级别的 setting 进行覆盖。

可能的取值：

- 正整数
- `-1` - 不受限制（默认）

:::note
你也可以在表的 setting 中指定 MergeTree 的 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) 设置。
:::

## max_parts_to_move \{#max_parts_to_move\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "新设置"}]}]}/>

限制在单个查询中可以移动的分区片段数量。0 表示不限制数量。

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

如果需要从 projection 索引中读取的行数小于或等于该阈值，ClickHouse 会在执行查询时尝试使用该 projection 索引。

## max_query_size \{#max_query_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL 解析器可解析的查询字符串的最大字节数。
INSERT 查询中 VALUES 子句里的数据由单独的流式解析器处理（其内存消耗为 O(1)），不受此限制影响。

:::note
`max_query_size` 不能在 SQL 查询内部进行设置（例如，`SELECT now() SETTINGS max_query_size=10000`），因为 ClickHouse 在解析查询前需要先分配缓冲区，而该缓冲区大小由 `max_query_size` 设置决定，因此必须在查询执行之前进行配置。
:::

## max_read_buffer_size \{#max_read_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

从文件系统读取数据时使用的缓冲区的最大大小。

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

从本地文件系统读取数据时使用的缓冲区最大大小。如果设置为 0，则会使用 max_read_buffer_size 的值。

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

从远程文件系统读取时使用的最大缓冲区大小。若设置为 0，则会使用 `max_read_buffer_size`。

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "最大递归 CTE 求值深度"}]}]}/>

最大递归 CTE 求值深度

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

读取时网络数据交换的最大速率（以字节/秒计）。

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

写入时通过网络进行的数据交换速率上限（以字节/秒为单位）。

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\}

<SettingsInfoBlock type="UInt64" default_value="300" />

在执行分布式查询时禁用滞后的副本。参见 [Replication](../../engines/table-engines/mergetree-family/replication.md)。

以秒为单位设置时间。如果某个副本的滞后时间大于或等于该值，则不会使用该副本。

可能的取值：

- 正整数。
- 0 — 不检查副本滞后情况。

若要避免使用任何存在非零滞后的副本，请将此参数设置为 1。

在对指向复制表的分布式表执行 `SELECT` 时使用。

## max_result_bytes \{#max_result_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制结果的大小（以字节数计，未压缩）。如果达到该阈值，查询在处理完一个数据块后会停止，
但不会截断结果的最后一个数据块，因此最终结果的大小可能会大于该阈值。

**注意事项**

该阈值是根据结果在内存中的大小来计算的。
即使结果本身很小，它也可能引用内存中更大的数据结构，
例如 LowCardinality 列使用的字典以及 AggregateFunction 列使用的 Arenas，
因此即使结果集本身很小，也可能会超过该阈值。

:::warning
该设置属于比较底层的参数，应谨慎使用
:::

## max_result_rows \{#max_result_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 默认值：`0`。

限制结果中的行数。对子查询，以及在远程服务器上执行分布式查询的部分时也会进行检查。
当值为 `0` 时，不施加任何限制。

如果达到阈值，查询会在处理完一个数据块后停止，
但不会截断结果集中的最后一个数据块，因此结果大小可能会
大于该阈值。

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "新配置项。`dictGetKeys` 函数在每次查询中使用的反向字典查找缓存的最大字节数。该缓存按属性值存储序列化的键元组，以避免在同一查询中重新扫描字典。"}]}]}/>

`dictGetKeys` 函数在每次查询中使用的反向字典查找缓存的最大字节数。该缓存按属性值存储序列化的键元组，以避免在同一查询中重新扫描字典。达到该限制时，将使用 LRU（最近最少使用）策略淘汰条目。设置为 0 可禁用缓存。

## max_rows_in_distinct \{#max_rows_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

使用 DISTINCT 时允许的最大不同行数。

## max_rows_in_join \{#max_rows_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在进行表连接时用于哈希表中的行数。

此设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join)
操作以及 [Join](/engines/table-engines/special/join) 表引擎。

如果一个查询包含多个 join，ClickHouse 会针对每个中间结果检查此设置。

当达到限制时，ClickHouse 可以采取不同的处理方式。使用
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 设置来选择具体行为。

可能的取值：

- 正整数。
- `0` — 行数不受限制。

## max_rows_in_set \{#max_rows_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

由子查询生成的 IN 子句中，数据集允许包含的最大行数。

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Disable join optimization as it prevents from read in order optimization"}]}]}/>

在执行 JOIN 之前，使用彼此的行 Set 对参与 JOIN 的表进行过滤时，Set 的最大允许大小。

可能的取值：

- 0 — 禁用。
- 任意正整数。

## max_rows_to_group_by \{#max_rows_to_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

聚合过程中接收到的最大唯一键数量。通过该设置可以限制聚合时的内存消耗。

如果在 `GROUP BY` 期间的聚合生成的行数（唯一的 `GROUP BY` 键）超过指定数量，其行为将由 `group_by_overflow_mode` 决定。该设置默认值为 `throw`，也可以将其切换为近似 `GROUP BY` 模式。

## max_rows_to_read \{#max_rows_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在运行查询时，从表中可读取的最大行数。  
该限制会针对每个处理的数据块进行检查，只应用于最底层的表表达式；在从远程服务器读取时，仅在远程服务器上检查该限制。

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在运行分布式查询时，从叶节点上的本地表中可读取的最大行数。虽然分布式查询可以向每个分片（叶节点）发出多个子查询，但此限制只会在叶节点的读取阶段进行检查，在根节点合并结果阶段不会生效。

例如，一个集群由 2 个分片组成，每个分片包含一张有 100 行的数据表。一个分布式查询打算通过设置 `max_rows_to_read=150` 从这两张表中读取所有数据时将会失败，因为总共有 200 行。使用 `max_rows_to_read_leaf=150` 的查询将会成功，因为叶节点最多只会读取 100 行。

该限制会针对每个被处理的数据块进行检查。

:::note
当 `prefer_localhost_replica=1` 时，此设置是不稳定的。
:::

## max_rows_to_sort \{#max_rows_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

排序前允许参与排序的最大行数。这样可以在排序时限制内存消耗。
如果在执行 ORDER BY 操作时需要处理的记录数超过该数值，
具体行为将由 `sort_overflow_mode` 决定，其默认值为 `throw`。

## max_rows_to_transfer \{#max_rows_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行 GLOBAL IN/JOIN 子句时，可以传递到远程服务器或保存在临时表中的最大行数。

## max_sessions_for_user \{#max_sessions_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

每个已通过认证的用户在 ClickHouse 服务器上的最大并发会话数。

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
    <!-- User Alice can connect to a ClickHouse server no more than once at a time. -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- User Bob can use 2 simultaneous sessions. -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- User Charles can use arbitrarily many of simultaneous sessions. -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

可能的取值：

* 正整数
* `0` - 无限个并发会话（默认）


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "为更大的表启用优化。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "这会优化性能"}]}]}/>

在聚合之前，所有哈希表中允许预先分配的元素总数上限。

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新增设置。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "为更大的表启用优化。"}]}]}/>

在执行 join 之前，允许在所有哈希表中合计为多少个元素预先分配空间

## max_streams_for_files_processing_in_cluster_functions \{#max_streams_for_files_processing_in_cluster_functions\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新增一个设置项，用于限制在 *Cluster 表函数中处理文件的流数量"}]}]}/>

如果该设置值不为零，则限制在 *Cluster 表函数中从文件读取数据的线程数量。

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果该值不为 0，则限制读取 MergeTree 表时的流数量。

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\}

<SettingsInfoBlock type="Float" default_value="5" />

在从 Merge 表读取数据时会请求更多的流（streams）。这些流会分布到 Merge 表所使用的各个表上。这可以使工作在各线程之间分配得更加均衡，尤其是在被合并的表大小不同时特别有帮助。

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\}

<SettingsInfoBlock type="Float" default_value="1" />

允许你使用比线程数更多的源，以便在各线程之间更均匀地分配工作。假定这是一个临时方案，因为将来可以做到让源的数量等于线程数，同时让每个源为自身动态选择可用的工作。

## max_subquery_depth \{#max_subquery_depth\}

<SettingsInfoBlock type="UInt64" default_value="100" />

当一个查询中嵌套的子查询数量超过指定值时，系统会抛出异常。

:::tip
这使你可以设置合理性检查，用于防止集群用户编写过于复杂的查询。
:::

## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

限制在执行查询时允许删除的表的大小。值为 `0` 表示可以在没有任何限制的情况下删除任意大小的表。

Cloud 默认值：1 TB。

:::note
此查询设置会覆盖其对应的服务器设置，参见 [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)
:::

## max_temporary_columns \{#max_temporary_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在执行查询时（包括常量列），允许同时保留在 RAM 中的临时列的最大数量。如果某个查询在中间计算过程中在内存中生成的临时列数量超过该上限，则会抛出异常。

:::tip
此设置有助于防止查询过于复杂。
:::

`0` 表示不限制。

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\}

<SettingsInfoBlock type="UInt64" default_value="0" />

所有并发运行的查询在磁盘上生成的临时文件可消耗的最大数据量（以字节为单位）。

可能的取值：

- 正整数。
- `0` — 不限制（默认）

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

所有并发运行的用户查询在磁盘上由临时文件占用的数据总量上限（以字节为单位）。

可能的取值：

- 正整数。
- `0` — 不限制（默认）

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

与 `max_temporary_columns` 类似，此设置表示在执行查询时，必须同时保存在 RAM 中的临时列的最大数量，但不将常量列计入其中。

:::note
在执行查询时，常量列会相当频繁地被生成，但它们几乎不消耗计算资源。
:::

## max_threads \{#max_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

`max_threads` 表示处理查询时所使用的最大线程数，不包括从远程服务器获取数据的线程（参见 ['max_distributed_connections'](/operations/settings/settings#max_distributed_connections) 参数）。

该参数适用于在查询处理流水线中执行相同阶段、并行运行的线程。
例如，在从表中读取数据时，如果可以使用至少 `max_threads` 个线程并行完成函数表达式计算、`WHERE` 过滤以及 `GROUP BY` 的预聚合操作，则会使用 `max_threads` 个线程。

对于因为 LIMIT 而能很快完成的查询，可以将 `max_threads` 设置得更小。
例如，如果所需数量的条目在每个数据块中都存在，并且 `max_threads = 8`，那么会读取 8 个数据块，尽管实际上只读取一个就足够。
`max_threads` 值越小，内存消耗越少。

`max_threads` 的默认值与 ClickHouse 可用的硬件线程数相同。
在没有 SMT（例如 Intel HyperThreading）的情况下，该值等于 CPU 核心数。

对于 ClickHouse Cloud 用户，默认值会显示为 `auto(N)`，其中 N 对应于服务的 vCPU 规格，例如 2vCPU/8GiB、4vCPU/16GiB 等。
有关所有服务规格的完整列表，请参阅 Cloud 控制台中的 Settings 选项卡。

## max_threads_for_indexes \{#max_threads_for_indexes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于处理索引的最大线程数。

## max_untracked_memory \{#max_untracked_memory\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小规模的内存分配和释放会被归入线程局部变量中，只有当其大小（绝对值）超过指定值时，才会被跟踪或进行分析。如果该数值大于 `memory_profiler_step`，则会被实际降低并调整为 `memory_profiler_step`。

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

在全局层面达到硬内存限制时，该值表示软内存限制。
该值用于计算查询的内存 overcommit 比率。
值为 0 表示跳过该查询。
有关[内存 overcommit](memory-overcommit.md) 的更多信息，请参阅相关文档。

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "默认启用内存 overcommit 功能"}]}]}/>

表示当用户级别的硬内存上限被触及时使用的软内存限制。
该值用于计算查询的内存 overcommit 比例。
为零时表示跳过该查询。
详见 [memory overcommit](memory-overcommit.md)。

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

以 `memory_profiler_sample_probability` 的概率收集大小小于或等于指定值的随机内存分配。0 表示禁用。可能需要将 `max_untracked_memory` 设置为 0，以便该阈值按预期生效。

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

以 `memory_profiler_sample_probability` 指定的概率，随机采集大小大于或等于给定值的内存分配。0 表示禁用。可能需要将 `max_untracked_memory` 设置为 0，才能使该阈值按预期生效。

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

收集随机的内存分配和释放操作，并将它们以 `trace_type` 为 `MemorySample` 的记录写入 `system.trace_log`。该概率适用于每一次分配/释放操作，而不考虑分配大小（可通过 `memory_profiler_sample_min_allocation_size` 和 `memory_profiler_sample_max_allocation_size` 进行调整）。注意，只有在未被跟踪的内存量超过 `max_untracked_memory` 时才会进行采样。为了实现更细粒度的采样，可以将 `max_untracked_memory` 设置为 0。

## memory_profiler_step \{#memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

设置 memory profiler 的步长。当查询的内存使用量每次超过下一个以字节为单位的步长时，memory profiler 会收集当前的分配 stacktrace，并将其写入 [trace_log](/operations/system-tables/trace_log)。

可能的取值：

- 一个表示字节数的正整数。

- 0 表示关闭 memory profiler。

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

用于测试 `异常安全性` —— 在每次内存分配时按指定概率抛出异常。

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\}

<SettingsInfoBlock type="UInt64" default_value="5000000" />

在用户级别发生内存过度分配时，线程等待内存被释放的最长时间（以微秒为单位）。
如果在超时时间到达时仍未释放内存，则会抛出异常。
在 [memory overcommit](memory-overcommit.md) 中了解更多信息。

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "新的设置"}]}]}/>

在创建未显式指定 schema 的 `Merge` 表或使用 `merge` 表函数时，将 schema 推断为不超过指定数量的匹配表的并集。
如果匹配表的数量更多，则仅基于前面指定数量的表来推断 schema。

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8" />

在查找数据时，ClickHouse 会检查索引文件中的数据标记。如果 ClickHouse 发现所需的键位于某个范围内，它会将该范围划分为 `merge_tree_coarse_index_granularity` 个子范围，并在这些子范围中递归查找所需的键。

可能的取值：

- 任意正偶整数。

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

仅在 ClickHouse Cloud 中生效。用于在 MergeTree 表的紧凑分区片段中，决定当条带（stripe）中的 granule 数量达到多少时启用 multibuffer reader，从而支持并行读取和预取（prefetch）。当从远程文件系统读取数据时，使用 multibuffer reader 会增加读取请求的数量。

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

是否仅根据 `prewhere` 列的数据量来确定读取任务的大小。

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

如果 ClickHouse 在单个查询中需要读取的字节数超过 `merge_tree_max_bytes_to_use_cache`，则不会使用未压缩数据块缓存。

未压缩数据块缓存会存储为查询提取出的数据。ClickHouse 使用该缓存来加速对重复小查询的响应。此设置可防止读取大量数据的查询对该缓存造成冲击。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 服务器设置定义了未压缩数据块缓存的大小。

可选值：

- 任意正整数。

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

如果 ClickHouse 在单个查询中需要读取超过 `merge_tree_max_rows_to_use_cache` 行的数据，则不会使用未压缩数据块缓存。

未压缩数据块缓存会存储为查询而提取的数据。ClickHouse 使用该缓存来加速对重复小查询的响应。此设置可防止读取大量数据的查询对缓存造成冲击。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 服务器设置定义未压缩数据块缓存的大小。

可能的取值：

- 任意正整数。

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="251658240" />

如果从一个 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的单个文件中读取的字节数超过 `merge_tree_min_bytes_for_concurrent_read`，则 ClickHouse 会尝试使用多个线程并发读取该文件。

可能的取值：

- 正整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "设置已弃用"}]}]}/>

从远程文件系统读取数据时，[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎在能够并行读取之前，单个文件至少需要读取的最小字节数。我们不建议使用此设置。

可能的取值：

- 正整数。

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果在同一个文件中需要读取的两个数据块之间的距离小于 `merge_tree_min_bytes_for_seek` 字节，那么 ClickHouse 会顺序读取包含这两个数据块的文件范围，从而避免额外的寻道开销。

可能的取值：

- 任意正整数。

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\}

**别名**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "取值与 `filesystem_prefetch_min_bytes_for_single_read_task` 保持一致"}]}]}/>

每个任务最少需要读取的字节数。

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "新设置"}]}]}/>

读取任务大小的硬性下限（即便 granule 数量很少且可用线程数很多，我们也不会创建更小的任务）

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="163840" />

如果从 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的某个文件中需要读取的行数超过 `merge_tree_min_rows_for_concurrent_read`，则 ClickHouse 会尝试使用多个线程并发读取该文件。

可能的取值：

- 正整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

在从远程文件系统读取数据时，该设置用于指定在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎可以并行读取之前，需要从单个文件中读取的最小行数。我们不建议使用此设置。

可能的取值：

- 正整数。

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果在同一文件中需要读取的两个数据块之间的行数距离小于 `merge_tree_min_rows_for_seek` 行，则 ClickHouse 不会在文件中执行 seek 操作，而是顺序读取数据。

可能的取值：

- 任意正整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "用于测试 `PartsSplitter` —— 以指定的概率在每次从 MergeTree 读取时，将读取范围拆分为相交和不相交的读取范围。"}]}]}/>

用于测试 `PartsSplitter` —— 以指定的概率在每次从 MergeTree 读取时，将读取范围拆分为相交和不相交的读取范围。

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于在查询中调试存储快照一致性的新设置"}]}]}/>

在为 MergeTree 表创建存储快照时注入人工延迟（以毫秒为单位）。
仅用于测试和调试目的。

可能的取值范围：

- 0 - 无延迟（默认）
- N - 延迟的毫秒数

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\}

<SettingsInfoBlock type="Bool" default_value="1" />

是否在从远程表读取时使用固定大小的任务。

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于控制是否在 MergeTree 中使用反序列化前缀缓存的新设置"}]}]}/>

在从远程磁盘读取 MergeTree 数据时，启用对文件前缀中列元数据的缓存功能。

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "一个新的设置，用于控制在 MergeTree 中是否使用线程池并行反序列化前缀"}]}]}/>

启用在 MergeTree 的 Wide 分区片段中使用线程池并行反序列化前缀。该线程池的大小由服务器设置 `max_prefixes_deserialization_thread_pool_size` 控制。

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "为 JSON 和 Dynamic 类型添加新的 V2 序列化版本"}]}]}/>

启用后，将在 MergeTree 中对 JSON 和 Dynamic 类型使用 V1 序列化版本，而不使用 V2。更改此设置仅会在服务器重启后生效。

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，将在整个查询执行过程中对部分 perf 事件进行测量。

## metrics_perf_events_list \{#metrics_perf_events_list\}

以逗号分隔的 `perf` 指标列表，这些指标会在查询执行期间被测量。留空表示测量所有事件。可用事件列表请参见源代码中的 `PerfEventInfo`。

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

对存储磁盘使用 direct I/O 访问所需的最小数据量。

ClickHouse 在从表中读取数据时会使用此设置。如果要读取的所有数据的总数据量超过 `min_bytes_to_use_direct_io` 字节，则 ClickHouse 会使用 `O_DIRECT` 选项从存储磁盘读取数据。

可能的取值：

- 0 — 禁用 direct I/O。
- 正整数。

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个实验性设置项。指定在读取大文件时，为避免将数据从内核复制到用户态而使用 mmap 所需的最小内存量。推荐阈值约为 64 MB，因为 [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) 较慢。该设置仅对大文件有意义，并且只有在数据已驻留于页缓存时才有帮助。

可能的取值：

- 正整数。
- 0 — 读取大文件时，仅通过将数据从内核复制到用户态来完成读取。

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 类型：无符号整数（unsigned int）
- 默认值：1 MiB

每个线程在并行解析时所处理的数据块的最小字节数。

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。为了在处理查询时减少延迟，当写入下一条 mark 时，如果当前块的大小至少为 `min_compress_block_size`，则会对该块进行压缩。默认值为 65,536。

如果未压缩数据量小于 `max_compress_block_size`，则块的实际大小不会小于该值，也不会小于一条 mark 所对应的数据量。

来看一个示例。假设在创建表时，将 `index_granularity` 设置为 8192。

我们写入一个 UInt32 类型的列（每个值 4 字节）。在写入 8192 行时，总数据量将为 32 KB。由于 min_compress_block_size = 65,536，将为每两条 mark 形成一个压缩块。

我们写入一个 String 类型的 URL 列（每个值平均大小为 60 字节）。在写入 8192 行时，平均数据量会略小于 500 KB。由于这大于 65,536，将为每条 mark 形成一个压缩块。在这种情况下，从磁盘中读取单条 mark 范围内的数据时，不会解压额外的数据。

:::note
这是一个专家级设置，如果你刚开始使用 ClickHouse，则不应修改它。
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

开始对相同聚合表达式进行 JIT 编译所需的最小数量。仅在启用 [compile_aggregate_expressions](#compile_aggregate_expressions) 设置时生效。

可能的取值：

- 正整数。
- 0 — 相同的聚合表达式将始终进行 JIT 编译。

## min_count_to_compile_expression \{#min_count_to_compile_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

同一表达式在被编译之前所需的最小执行次数。

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\}

<SettingsInfoBlock type="UInt64" default_value="3" />

在对排序描述进行 JIT 编译之前，相同排序描述需要出现的最小次数

## min_execution_speed \{#min_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

以每秒处理的行数表示的最小执行速度。会在每个数据块上进行检查，当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
设定的超时时间到期时触发检查。如果执行速度低于该值，则会抛出异常。

## min_execution_speed_bytes \{#min_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

每秒最小执行字节数。当
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
到期后，会在每个数据块上进行检查。如果执行速度低于该值，则会抛出异常。

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "如果数据块不够大，则将传递到 external table 的数据块压缩合并为指定的字节大小。"}]}]}/>

如果数据块不够大，则将传递到 external table 的数据块压缩合并为指定的字节大小。

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "如果数据块不够大，则将传递给外部表的数据块合并为指定行数的块"}]}]}/>

如果数据块不够大，则将传递给外部表的数据块合并为指定行数的块。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在仍然允许临时写入的情况下，为插入操作预留一定数量的空闲磁盘空间（字节）。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

执行插入操作所需的最小空闲磁盘空间（字节）数量。

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在仍允许临时写入的情况下，为 INSERT 操作保留部分空闲磁盘空间（以占总磁盘空间的比例表示）。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

执行 INSERT 时所需的最小空闲磁盘空间比例。

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在写入用于外部排序和聚合的临时数据时需要保留的最小磁盘可用空间。

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\}

<SettingsInfoBlock type="Float" default_value="0.5" />

在聚合中启用连续键优化所需的缓存最小命中率

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

将要插入到表中的数据块的最小大小（以字节为单位）。

此设置与 `min_insert_block_size_rows` 配合使用，并在相同的上下文中控制数据块的形成（格式解析和 `INSERT` 操作）。有关何时以及如何应用这些设置的详细信息，请参阅 `min_insert_block_size_rows`。

可能的取值：

- 正整数。
- 0 — 此设置不参与数据块形成。

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置可通过 `INSERT` 查询插入到表中的数据块的最小字节数。更小的数据块会被合并成更大的块。此设置仅适用于插入到 [materialized view](../../sql-reference/statements/create/view.md) 的数据块。通过调整此设置，可以在向 materialized view 写入数据时控制数据块的合并行为，并避免过度的内存占用。

可能的取值：

- 任意正整数。
- 0 — 禁用合并。

**另请参阅**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

向表插入数据时要生成的数据块的最小大小（以行数计）。

该设置在两个场景下控制数据块的生成：

1. 格式解析：当服务器从任意接口（HTTP、带内联数据的 clickhouse-client、gRPC、PostgreSQL wire protocol 等）解析基于行的输入格式（CSV、TSV、JSONEachRow 等）时，会使用此设置来决定何时输出一个数据块。  
注意：当使用 clickhouse-client 或 clickhouse-local 从文件读取时，由客户端自身负责解析数据，该设置作用在客户端侧。
2. INSERT 操作：在执行 INSERT...SELECT 查询以及数据通过 materialized view 流转时，在写入存储之前，会根据此设置将较小的数据块合并成较大的数据块。

在格式解析过程中，当满足以下任一条件时会输出一个数据块：

- 最小阈值（AND）：同时达到 min_insert_block_size_rows AND min_insert_block_size_bytes
- 最大阈值（OR）：达到 max_insert_block_size OR max_insert_block_size_bytes 中的任意一个

对于插入操作，较小的数据块会被合并为更大的数据块，并在满足 min_insert_block_size_rows 或 min_insert_block_size_bytes 之一时输出。

可选值：

- 正整数。
- 0 — 此设置不参与数据块形成。

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置可通过 `INSERT` 查询插入到表中的数据块的最小行数。更小的数据块会被合并成更大的数据块。此设置仅适用于插入到 [materialized view](../../sql-reference/statements/create/view.md) 的数据块。通过调整此设置，可以在写入 materialized view 时控制数据块的合并行为，并避免过度的内存使用。

可能的取值：

- 任意正整数。
- 0 — 禁用合并。

**另请参阅**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "New setting."}]}]}/>

JOIN 输入和输出数据块的最小大小（以字节为单位，前提是 JOIN 算法支持）。更小的数据块会被合并为更大的数据块。0 表示不限制。

## min_joined_block_size_rows \{#min_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

JOIN 输入和输出块的最小块大小（以行数计）（如果 JOIN 算法支持）。较小的块会被合并。0 表示不限制大小。

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "设置值已更改并回溯至 25.4 版本"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置"}]}]}/>

在考虑是否拒绝查询时，OS CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间的最小比率。使用最小和最大比率之间的线性插值来计算概率，在该比率处概率为 0。

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\}

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "New setting."}]}]}/>

指定在管道生成阶段执行拆分后，`Resize` 或 `StrictResize` 处理器的输出流最小数量。如果生成的流数量小于该值，则不会执行拆分操作。

### 什么是 Resize 节点 \{#what-is-a-resize-node\}

`Resize` 节点是查询流水线中的一种处理器，用于调整在流水线中传递的数据流数量。它可以增加或减少数据流的数量，以在多个线程或处理器之间平衡工作负载。例如，如果某个查询需要更高的并行度，`Resize` 节点可以将单个数据流拆分成多个数据流。相反，它也可以将多个数据流合并为更少的数据流，以整合数据处理。

`Resize` 节点确保数据在各个数据流之间均匀分布，同时保持数据块的结构不变。这有助于优化资源利用率并提升查询性能。

### 为什么需要拆分 Resize 节点 \{#why-the-resize-node-needs-to-be-split\}

在管道执行过程中，作为集中枢纽的 `Resize` 节点的 ExecutingGraph::Node::status_mutex 存在严重争用，尤其是在高核心数环境下，这种争用会导致：

1. ExecutingGraph::updateNode 的延迟增加，直接影响查询性能。
2. 大量 CPU 周期浪费在自旋锁争用（native_queued_spin_lock_slowpath）上，降低效率。
3. CPU 利用率下降，限制了并行度和吞吐量。

### Resize 节点如何被拆分 \{#how-the-resize-node-gets-split\}

1. 首先检查输出流的数量，以确保可以执行拆分：使每个拆分后的 processor 的输出流数量都满足或超过 `min_outstreams_per_resize_after_split` 阈值。
2. 将 `Resize` 节点拆分为多个较小的 `Resize` 节点，这些节点具有相同数量的端口，每个节点各自处理一部分输入和输出流。
3. 各个分组会被独立处理，从而减少锁争用。

### 使用任意输入/输出拆分 Resize 节点 \{#splitting-resize-node-with-arbitrary-inputsoutputs\}

在某些情况下，如果输入/输出的数量不能被拆分得到的 `Resize` 节点数量整除，则会将部分输入连接到 `NullSource`，将部分输出连接到 `NullSink`。这样就可以在不影响整体数据流的前提下完成拆分。

### 此 Setting 的用途 \{#purpose-of-the-setting\}

`min_outstreams_per_resize_after_split` Setting 确保对 `Resize` 节点的拆分是有效的，并避免产生过少的流，否则可能导致并行处理效率低下。通过强制设置最小输出流数量，该 Setting 有助于在并行度与开销之间保持平衡，从而在涉及流拆分与合并的场景中优化查询执行。

### 禁用该设置 \{#disabling-the-setting\}

要禁用对 `Resize` 节点的拆分，请将该设置的值设为 0。这样将在管道生成过程中阻止对 `Resize` 节点的拆分，使其保留原始结构，而不会被划分为更小的节点。

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

如果预估将从表中读取的行数大于或等于该阈值，ClickHouse 会在查询执行期间尝试使用 projection 索引。

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "新设置。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新设置。"}]}]}/>

启用后，如果无法构建 MongoDB 查询，MongoDB 表将返回错误。否则，ClickHouse 会读取整个表并在本地处理数据。此选项在 `allow_experimental_analyzer=0` 时不适用。

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

将所有可以移动的条件从 WHERE 移动到 PREWHERE

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

将包含主键列的 PREWHERE 条件移动到 AND 条件链的末尾。此类条件很可能已经在主键分析阶段被考虑在内，因此对 PREWHERE 过滤效果本身的提升不会太大。

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\}

<SettingsInfoBlock type="Bool" default_value="0" />

在重写包含多个 JOIN 的查询时，不要为顶层表达式列表添加别名

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则常量非确定性函数（例如函数 `now()`）会在发起查询的节点上执行，并在 `UPDATE` 和 `DELETE` 查询中被替换为字面量值。这样有助于在使用常量非确定性函数执行 mutation 时保持各副本之间的数据同步。默认值：`false`。

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 `true`，则在发起方执行标量子查询，并在 `UPDATE` 和 `DELETE` 查询中将其替换为字面量。默认值：`false`。

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

在 `UPDATE` 和 `DELETE` 查询中要被替换的序列化字面量的最大大小（以字节为单位）。仅当上述两个设置中至少有一个被启用时才生效。默认值：16384（16 KiB）。

## mutations_sync \{#mutations_sync\}

<SettingsInfoBlock type="UInt64" default_value="0" />

允许以同步方式执行 `ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` 查询（[mutations](../../sql-reference/statements/alter/index.md/#mutations)）。

可能的取值：

| 值 | 描述                                                                                                                                                     |
|----|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | 变更异步执行。                                                                                                                                        |
| `1`   | 查询会等待当前服务器上的所有变更完成。                                                                                                                |
| `2`   | 查询会等待所有副本（如果存在）上的所有变更完成。                                                                                                      |
| `3`   | 查询仅等待活动副本。仅对 `SharedMergeTree` 支持。对于 `ReplicatedMergeTree`，其行为与 `mutations_sync = 2` 相同。                                       |

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\}

定义如何将 MySQL 类型转换为对应的 ClickHouse 类型。取值为逗号分隔的列表，可为 `decimal`、`datetime64`、`date2Date32` 或 `date2String` 的任意组合。

- `decimal`：在精度允许的情况下，将 `NUMERIC` 和 `DECIMAL` 类型转换为 `Decimal`。
- `datetime64`：当精度不为 `0` 时，将 `DATETIME` 和 `TIMESTAMP` 类型转换为 `DateTime64` 而不是 `DateTime`。
- `date2Date32`：将 `DATE` 转换为 `Date32` 而不是 `Date`。优先级高于 `date2String`。
- `date2String`：将 `DATE` 转换为 `String` 而不是 `Date`。会被 `datetime64` 覆盖。

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "减少将 ClickHouse 连接到 BI 工具所需的配置工作量。"}]}]}/>

启用后，ClickHouse 的 [FixedString](../../sql-reference/data-types/fixedstring.md) 数据类型将在 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) 中显示为 `TEXT`。

仅当通过 MySQL wire 协议建立连接时才会生效。

- 0 - 使用 `BLOB`。
- 1 - 使用 `TEXT`。

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "减少将 ClickHouse 连接到 BI 工具所需的配置工作量。"}]}]}/>

启用后，ClickHouse 中的 [String](../../sql-reference/data-types/string.md) 数据类型将在 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) 中显示为 `TEXT`。

仅在通过 MySQL 线协议（MySQL wire protocol）建立连接时生效。

- 0 - 使用 `BLOB`。
- 1 - 使用 `TEXT`。

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL 存储引擎在进行批量插入时允许的最大行数上限

## network_compression_method \{#network_compression_method\}

<SettingsInfoBlock type="String" default_value="LZ4" />

用于对 client/server 和 server/server 通信进行压缩的编解码器。

可能的取值：

- `NONE` — 不进行压缩。
- `LZ4` — 使用 LZ4 编解码器。
- `LZ4HC` — 使用 LZ4HC 编解码器。
- `ZSTD` — 使用 ZSTD 编解码器。

**另请参阅**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\}

<SettingsInfoBlock type="Int64" default_value="1" />

调整 ZSTD 压缩级别。仅当 [network_compression_method](#network_compression_method) 设置为 `ZSTD` 时生效。

可能的取值：

- 1 到 15 之间的正整数。

## normalize_function_names \{#normalize_function_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "将函数名规范化为其标准名称，这是进行 PROJECTION 查询路由所必需的"}]}]}/>

将函数名规范化为其标准名称

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果该表中未完成的变更数量至少达到该值，则人为放慢对该表的变更操作。0 表示禁用该限制。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果被变更的表中包含至少这么多未完成的 mutation，则抛出 “Too many mutations ...” 异常。0 表示禁用。

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC bridge 中每个连接配置字符串对应的连接池大小。

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 ODBC bridge 中使用连接池。如果将其设置为 false，则每次都会新建一个连接。

## offset \{#offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在开始返回查询结果行之前要跳过的行数。它会对 [OFFSET](/sql-reference/statements/select/offset) 子句所设定的偏移量进行调整，使这两个值相加后生效。

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

设置在未提供父级 [trace context](https://www.w3.org/TR/trace-context/) 时，ClickHouse 可以为执行查询启动 trace 的概率。

可能的取值：

- 0 — 禁用对所有执行查询的 trace（在未提供父级 trace context 时）。
- 区间 [0..1] 内的正浮点数。例如，如果该设置值为 `0,5`，ClickHouse 平均可以为一半的查询启动 trace。
- 1 — 为所有执行查询启用 trace。

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "用于追踪 `cpu_slot_preemption` 功能的新设置。"}]}]}/>

收集与工作负载抢占式 CPU 调度相关的 OpenTelemetry spans。

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\}

<SettingsInfoBlock type="Bool" default_value="0" />

收集处理器所用的 OpenTelemetry spans。

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表上执行 [SELECT](../../sql-reference/statements/select/index.md) 查询并按相应顺序聚合数据时，启用 [GROUP BY](/sql-reference/statements/select/group-by) 优化。

可能的取值：

- 0 — 禁用 `GROUP BY` 优化。
- 1 — 启用 `GROUP BY` 优化。

**另请参阅**

- [GROUP BY 优化](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \{#optimize_aggregators_of_group_by_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 SELECT 子句中消除对 GROUP BY 键使用的 min/max/any/anyLast 聚合函数

## optimize_and_compare_chain \{#optimize_and_compare_chain\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

在 AND 条件链中补充常量比较条件，以增强过滤效果。支持运算符 `<`、`<=`、`>`、`>=`、`=` 及其混合使用。例如，`(a < b) AND (b < c) AND (c < 5)` 将被扩展为 `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`。

## optimize_append_index \{#optimize_append_index\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用 [constraints](../../sql-reference/statements/create/table.md/#constraints) 为索引追加条件。默认值为 `false`。

可能的取值：

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

将算术运算从聚合函数中移出

## optimize_const_name_size \{#optimize_const_name_size\}

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "将大常量替换为标量，并使用其哈希值作为名称（大小根据名称长度进行估算）"}]}]}/>

将大常量替换为标量，并使用其哈希值作为名称（大小根据名称长度进行估算）。

可能的取值：

- 正整数 —— 名称的最大长度，
- 0 —— 始终进行替换，
- 负整数 —— 从不进行替换。

## optimize_count_from_files \{#optimize_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对不同输入格式文件的行数统计优化。该设置适用于表函数/引擎 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`。

可选值：

- 0 — 禁用优化。
- 1 — 启用优化。

## optimize_distinct_in_order \{#optimize_distinct_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

当 DISTINCT 子句中的某些列构成排序的前缀时，启用 DISTINCT 优化。例如，在 MergeTree 中构成排序键的前缀，或在 ORDER BY 子句中构成前缀。

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

通过避免在发起查询的服务器（initiator server）上进行代价高昂的聚合，来优化 `GROUP BY sharding_key` 查询（从而减少该服务器上此类查询的内存使用）。

支持以下类型的查询（以及它们的任意组合）：

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

以下类型的查询暂不支持（其中部分类型未来可能会支持）：

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
目前该设置依赖于 `optimize_skip_unused_shards`（原因在于：未来某个时候它可能会默认启用，而它只有在数据通过 Distributed 表插入、即数据按照 sharding_key 分布的情况下才能正确工作）。
:::

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一个新的 setting 项。"}]}]}/>

将诸如 col = '' 或 '' = col 的表达式转换为 empty(col)，并将 col != '' 或 '' != col 转换为 notEmpty(col)，
仅当 col 的类型为 String 或 FixedString 时才会进行此转换。

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "通过从合取项的析取中提取公共子表达式来优化 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "引入一个设置，用于通过从合取项的析取中提取公共子表达式来优化 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式。"}]}]}/>

允许从 WHERE、PREWHERE、ON、HAVING 和 QUALIFY 表达式中的析取式中提取公共子表达式。类似 `(A AND B) OR (A AND C)` 的逻辑表达式可以被重写为 `A AND (B OR C)`，这可能有助于利用：

- 在简单过滤表达式中使用索引
- 将 cross join 优化为 inner join

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled settings by default"}]}]}/>

启用或禁用一种优化：将某些函数改为读取子列，从而减少需要读取的数据量。

可以被转换的函数包括：

- [length](/sql-reference/functions/array-functions#length)：读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- [empty](/sql-reference/functions/array-functions#empty)：读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- [notEmpty](/sql-reference/functions/array-functions#notEmpty)：读取 [size0](../../sql-reference/data-types/array.md/#array-size) 子列。
- [isNull](/sql-reference/functions/functions-for-nulls#isNull)：读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull)：读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- [count](/sql-reference/aggregate-functions/reference/count)：读取 [null](../../sql-reference/data-types/nullable.md/#finding-null) 子列。
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapKeys)：读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列。
- [mapValues](/sql-reference/functions/tuple-map-functions#mapValues)：读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列。

可能的取值：

- 0 — 禁用优化。
- 1 — 启用优化。

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "默认优化按常量键的 GROUP BY"}]}]}/>

当数据块中的所有分组键都是常量时，对 GROUP BY 进行优化

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

消除 GROUP BY 子句中对其他键的函数调用

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 if(cond1, then1, if(cond2, ...)) 链替换为 multiIf。目前对数值类型没有明显收益。

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 `If` 和 `Transform` 中的字符串类型参数替换为 `enum`。默认关闭，因为在分布式查询中可能引入不一致的变更，从而导致查询失败。

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "在分析器的 GROUP BY 子句中，将单射函数替换为其参数"}]}]}/>

在 GROUP BY 子句中将单射函数替换为其参数

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\}

<SettingsInfoBlock type="Bool" default_value="1" />

删除 `uniq*()` 函数内部的单参数单射函数。

## optimize_inverse_dictionary_lookup \{#optimize_inverse_dictionary_lookup\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

通过在预先计算好的可能键值集合中进行更快速的查找，避免重复执行反向字典查找。

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

可进行优化的表达式 `expr = x1 OR ... expr = xN` 的最小长度

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

用于触发优化的表达式 `expr <> x1 AND ... expr <> xN` 的最小长度

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在 [SELECT](../../sql-reference/statements/select/index.md) 查询中对 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 的自动优化。

仅对 [*MergeTree](../../engines/table-engines/mergetree-family/index.md) 表生效。

可选值：

- 0 — 禁用自动 `PREWHERE` 优化。
- 1 — 启用自动 `PREWHERE` 优化。

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符的 [SELECT](../../sql-reference/statements/select/index.md) 查询中自动执行 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 优化。

仅适用于 [*MergeTree](../../engines/table-engines/mergetree-family/index.md) 表。

可能的值：

- 0 — 禁用在带有 `FINAL` 修饰符的 `SELECT` 查询中自动执行 `PREWHERE` 优化。
- 1 — 启用在带有 `FINAL` 修饰符的 `SELECT` 查询中自动执行 `PREWHERE` 优化。

**另请参阅**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 设置

## optimize_multiif_to_if \{#optimize_multiif_to_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

将只有一个条件的 `multiIf` 重写为 `if`。

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "默认将语义上等同于 count() 的聚合函数重写为 count()"}]}]}/>

默认会将语义上等同于 count() 的聚合函数重写为 count()。

## optimize_on_insert \{#optimize_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "默认在 INSERT 时启用数据优化，以改善用户体验"}]}]} />

启用或禁用在插入前的数据转换，其效果类似于对该数据块执行了一次 merge 操作（取决于表引擎）。

可能的取值：

* 0 — 禁用。
* 1 — 启用。

**示例**

启用与禁用之间的差异：

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

请注意，此设置会影响 [materialized view](/sql-reference/statements/create/view#materialized-view) 的行为方式。


## optimize_or_like_chain \{#optimize_or_like_chain\}

<SettingsInfoBlock type="Bool" default_value="0" />

将多个 OR LIKE 表达式优化为 multiMatchAny。此优化默认不应启用，因为在某些情况下会干扰索引分析。

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

将 `QBit` 数据类型上的距离函数替换为等价的距离函数，使其只从存储中读取计算所需的列。

## optimize_read_in_order \{#optimize_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

在从 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中读取数据的 [SELECT](../../sql-reference/statements/select/index.md) 查询中启用 [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) 优化。

可能的取值：

- 0 — 禁用 `ORDER BY` 优化。
- 1 — 启用 `ORDER BY` 优化。

**另请参阅**

- [ORDER BY 子句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \{#optimize_read_in_window_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用窗口子句中的 ORDER BY 优化，以便在 MergeTree 表中按对应顺序读取数据。

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果函数的参数也出现在 ORDER BY 中，则从 ORDER BY 中移除该函数

## optimize_respect_aliases \{#optimize_respect_aliases\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果设置为 true，则会在 WHERE/GROUP BY/ORDER BY 中遵循别名引用，这有助于进行分区剪枝、二级索引、optimize_aggregation_in_order、optimize_read_in_order 和 optimize_trivial_count。

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

在逻辑等价的情况下，将参数为 `if` 表达式的聚合函数重写。
例如，`avg(if(cond, col, null))` 可以被重写为 `avgOrNullIf(cond, col)`。这可能提升性能。

:::note
仅在启用 analyzer（`enable_analyzer = 1`）时支持。
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\}

<SettingsInfoBlock type="Bool" default_value="0" />

在逻辑上等价的情况下，将 arrayExists() 函数重写为 has()。例如，arrayExists(x -> x = 1, arr) 可以重写为 has(arr, 1)。

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新设置"}]}]}/>

将前缀或后缀为精确字面量的 LIKE 表达式（例如 `col LIKE 'ClickHouse%'`）重写为 startsWith 或 endsWith 函数（例如 `startsWith(col, 'ClickHouse')`）。

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

将与正则表达式相关的函数重写为更简单、更高效的形式。

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "仅在 analyzer 中可用，并且在该模式下能正确工作"}]}]}/>

在逻辑上等价时，将 sumIf() 和 sum(if()) 函数重写为 countIf() 函数

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\}

<SettingsInfoBlock type="Bool" default_value="0" />

在仅存在一个 level > 0 的 part，且该 part 没有过期的生存时间 (TTL) 时，启用或禁用对 [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) 查询的优化。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

默认情况下，即使只有单个 part，`OPTIMIZE TABLE ... FINAL` 查询也会重写该 part。

可能的取值：

- 1 - 启用优化。
- 0 - 禁用优化。

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在包含分片键条件的 `WHERE/PREWHERE` 子句的 [SELECT](../../sql-reference/statements/select/index.md) 查询中跳过未使用分片的行为，并为分布式查询启用相关优化（例如按分片键进行聚合）。

:::note
假设数据是按照分片键进行分布的，否则查询结果可能不正确。
:::

可能的值：

- 0 — 禁用。
- 1 — 启用。

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

分片键值数量的上限，当达到该上限时，将关闭 `optimize_skip_unused_shards`。

过多的值可能会导致处理开销显著增加，而收益并不明显，因为如果 `IN (...)` 中包含大量的值，那么查询很可能无论如何都会被发送到所有分片。

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

控制 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) 的行为（因此仍然需要启用 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)），其行为取决于分布式查询的嵌套层级（例如存在一个 `Distributed` 表再访问另一个 `Distributed` 表的情况）。

可能的取值：

- 0 — 关闭，`optimize_skip_unused_shards` 始终被应用。
- 1 — 仅对第一层启用 `optimize_skip_unused_shards`。
- 2 — 对最多第二层启用 `optimize_skip_unused_shards`。

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\}

<SettingsInfoBlock type="Bool" default_value="1" />

为远程分片改写查询中的 IN 条件，以排除不属于该分片的值（需要启用 optimize_skip_unused_shards）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\}

<SettingsInfoBlock type="Bool" default_value="1" />

根据输入流的排序属性优化排序

## optimize_substitute_columns \{#optimize_substitute_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用 [约束](../../sql-reference/statements/create/table.md/#constraints) 进行列替换。默认值为 `false`。

可能的取值：

- true, false

## optimize_syntax_fuse_functions \{#optimize_syntax_fuse_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用将具有相同参数的聚合函数进行合并。它会将包含至少两个参数相同的聚合函数（[sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count) 或 [avg](/sql-reference/aggregate-functions/reference/avg)）的查询重写为使用 [sumCount](/sql-reference/aggregate-functions/reference/sumcount)。

可能的取值：

* 0 — 具有相同参数的函数不会被合并。
* 1 — 具有相同参数的函数会被合并。

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

启用或禁用在 [OPTIMIZE](../../sql-reference/statements/optimize.md) 查询未执行合并时抛出异常。

默认情况下，即使 `OPTIMIZE` 没有执行任何操作，也会成功返回。通过此设置，您可以区分这些情况，并在异常消息中获取原因。

可能的取值：

- 1 — 启用抛出异常。
- 0 — 禁用抛出异常。

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "通过将函数转换为等价且无需类型转换的比较来优化 Date 和 DateTime 谓词（例如：toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'）"}]}]}/>

通过将函数转换为等价且无需类型转换的比较来优化 Date 和 DateTime 谓词（例如：`toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对支持此类估算的存储（例如 EmbeddedRocksDB）执行简单计数优化时，使用近似值。

可能的取值：

- 0 — 优化已禁用。
   - 1 — 优化已启用。

## optimize_trivial_count_query \{#optimize_trivial_count_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对简单查询 `SELECT count() FROM table` 的优化；该优化会利用 MergeTree 的元数据。如果需要使用行级安全性，应禁用此设置。

可能的取值：

- 0 — 禁用优化。
   - 1 — 启用优化。

另请参阅：

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "在许多情况下，这种优化没有意义。"}]}]}/>

优化简单的 'INSERT INTO table SELECT ... FROM TABLES' 查询

## optimize_uniq_to_count \{#optimize_uniq_to_count\}

<SettingsInfoBlock type="Bool" default_value="1" />

当子查询中包含 distinct 或 group by 子句时，将 uniq 及其变体（uniqUpTo 除外）重写为 count。

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

自动选择隐式 PROJECTION 用于执行 SELECT 查询

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新设置"}]}]}/>

即使未选择使用 PROJECTION 来执行 SELECT 查询，也启用使用 PROJECTION 来过滤数据分片范围。

## optimize_use_projections \{#optimize_use_projections\}

**别名**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

在处理 `SELECT` 查询时启用或禁用 [projection](../../engines/table-engines/mergetree-family/mergetree.md/#projections) 优化。

可能的取值：

- 0 — 禁用 projection 优化。
- 1 — 启用 projection 优化。

## optimize_using_constraints \{#optimize_using_constraints\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用[约束条件](../../sql-reference/statements/create/table.md/#constraints)用于查询优化。默认值为 `false`。

可能的取值：

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\}

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

用于 materialized view 线程的 Linux nice 值。值越低表示 CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不执行任何操作。

可选值范围：-20 到 19。

## os_threads_nice_value_query \{#os_threads_nice_value_query\}

**别名**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

用于查询处理线程的 Linux nice 值。值越低，CPU 优先级越高。

需要具备 CAP_SYS_NICE 权限，否则不生效。

取值范围：-20 到 19。

## page_cache_block_size \{#page_cache_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "Made this setting adjustable on a per-query level."}]}]}/>

以字节为单位的文件块大小，这些块会存储在用户空间页面缓存中。所有经过缓存的读操作都会向上取整到该大小的整数倍。

此设置可以按每个查询的粒度进行调整，但使用不同块大小的缓存条目无法复用。更改此设置会实际使缓存中现有条目失效。

较大的值（例如 1 MiB）适用于高吞吐量查询，而较小的值（例如 64 KiB）适用于低延迟的点查询。

## page_cache_inject_eviction \{#page_cache_inject_eviction\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Added userspace page cache"}]}]}/>

用户态页面缓存有时会随机使部分页面失效。主要用于测试。

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\}

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "使该设置可以在每个查询级别进行调整。"}]}]}/>

在 userspace 页缓存未命中时，如果底层存储中后续连续的块同样不在缓存中，则一次性从底层存储中读取最多这么多连续的块。每个块的大小为 page_cache_block_size 字节。

较高的取值有利于高吞吐量查询，而低延迟的点查询在不启用预读时效果会更好。

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "默认启用并行分布式 insert select"}]}]}/>

启用并行分布式 `INSERT ... SELECT` 查询。

如果执行 `INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` 查询，并且两个表都使用相同的集群，且两个表要么都是[复制](../../engines/table-engines/mergetree-family/replication.md)表，要么都不是复制表，则该查询会在每个分片上本地处理。

可能的取值：

- `0` — 禁用。
- `1` — `SELECT` 将在每个分片上针对分布式引擎的底层表执行。
- `2` — `SELECT` 和 `INSERT` 都将在每个分片上、从/到分布式引擎的底层表执行。

使用该设置时，需要将 `enable_parallel_replicas` 设置为 `1`。

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

当使用基于哈希的 join 算法时，此阈值用于在 `hash` 和 `parallel_hash` 之间进行选择（仅当可以估算右表大小时适用）。
当我们知道右表大小低于该阈值时，会使用前者。

## parallel_replica_offset \{#parallel_replica_offset\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个内部设置，不应被直接使用，用于表示“parallel replicas”模式的实现细节。对于分布式查询，发起查询的服务器会自动为参与并行副本中查询处理的各个副本索引设置该参数。

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "如果为 true，IN 的子查询将在每个跟随副本上执行"}]}]}/>

如果为 true，IN 的子查询将在每个跟随副本上执行。

## parallel_replicas_allow_materialized_views \{#parallel_replicas_allow_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "允许将 materialized view 与并行副本一起使用"}]}]}/>

允许将 materialized view 与并行副本一起使用

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Separate connection timeout for parallel replicas queries"}]}]}/>

在使用并行副本执行查询时，连接到远程副本的超时时间（毫秒）。如果超时到期，相应副本将不会参与该次查询执行。

## parallel_replicas_count \{#parallel_replicas_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

这是一个内部设置项，不应被直接使用，用于表示“parallel replicas”模式的实现细节。对于分布式查询，该设置会由发起查询的服务器自动配置为参与查询处理的并行副本数量。

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\}

<BetaBadge/>

一个任意的整数表达式，可用于在特定表的副本之间划分工作。
该值可以是任意整数表达式。

优先使用基于主键的简单表达式。

如果在由单个分片且具有多个副本组成的集群上使用该设置，这些副本将被转换为虚拟分片。
否则，其行为与 `SAMPLE` 键相同，会为每个分片使用多个副本。

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Add settings to control the range filter when using parallel replicas with dynamic shards"}]}]}/>

允许在使用带有动态分片的并行副本时，基于自定义范围 `[parallel_replicas_custom_key_range_lower, INT_MAX]`，使过滤类型为 `range` 的过滤条件在副本之间均匀分配工作量。

当与 [parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) 结合使用时，它可以使该过滤条件在副本之间针对范围 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` 均匀分配工作量。

注意：此设置不会在查询处理过程中导致额外数据被过滤，而是改变了范围过滤器为并行处理拆分范围 `[0, INT_MAX]` 时所使用的分割点。

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "添加用于控制在使用具有动态分片的 parallel replicas 时范围过滤器行为的设置。值为 0 时禁用上限"}]}]}/>

允许过滤器类型 `range` 基于自定义范围 `[0, parallel_replicas_custom_key_range_upper]` 在副本之间平均划分工作。值为 0 时将禁用上界，此时会将自定义键表达式的最大值视为上界。

当与 [parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) 结合使用时，它允许过滤器在范围 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` 内在副本之间平均划分工作。

注意：此设置不会在查询处理期间额外过滤任何数据，而是改变范围过滤器将范围 `[0, INT_MAX]` 拆分为并行处理子范围的切分点。

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

将表函数引擎替换为对应的 -Cluster 变体。

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，ClickHouse 也会对非复制的 MergeTree 表使用并行副本算法

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "仅在副本协调器上进行索引分析，其他副本跳过此步骤。仅在启用 parallel_replicas_local_plan 时有效"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "仅在副本协调器上进行索引分析，其他副本跳过此步骤。仅在启用 parallel_replicas_local_plan 时有效"}]}]}/>

仅在副本协调器上进行索引分析，其他副本跳过此步骤。仅在启用 parallel_replicas_local_pla 时有效

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "在并行副本场景下的分布式 INSERT SELECT 中使用本地 pipeline。当前因性能问题已禁用"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "在并行副本场景下的分布式 INSERT SELECT 中使用本地 pipeline。当前因性能问题已禁用"}]}]}/>

在并行副本场景下的分布式 INSERT SELECT 中使用本地 pipeline

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "在并行副本查询中为本地副本使用本地执行计划"}]}]}/>

为本地副本构建本地执行计划

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "此设置的取值现在由系统自动确定"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "在新的 parallel replicas 协调器实现中添加用于控制 segment 大小的新设置"}]}]}/>

分区片段在逻辑上被划分为若干段，并在副本之间分配以实现并行读取。此设置用于控制这些段的大小。不建议修改此值，除非您完全清楚自己的操作。取值范围应为 [128; 16384]。

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

将查询中使用的副本数量限制为（预估要读取的行数 / min_number_of_rows_per_replica），但最大值仍受 `max_parallel_replicas` 限制。

## parallel_replicas_mode \{#parallel_replicas_mode\}

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "This setting was introduced as a part of making parallel replicas feature Beta"}]}]}/>

用于并行副本的自定义键过滤器类型。`default` — 对自定义键使用取模运算；`range` — 基于自定义键值类型的所有可能取值，对自定义键应用范围过滤。

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "仅在启用 analyzer 时才支持并行副本"}]}]}/>

要使用并行副本，必须启用 analyzer。禁用 analyzer 时，即使启用了从副本并行读取，查询执行也会回退到本地执行。在未启用 analyzer 的情况下使用并行副本不受支持。

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "如果为 true，且 JOIN 可以使用 parallel replicas 算法执行，并且 JOIN 右侧部分的所有存储引擎都是 *MergeTree，将使用本地 JOIN 而不是 GLOBAL JOIN。"}]}]}/>

如果为 true，且 JOIN 可以使用 parallel replicas 算法执行，并且 JOIN 右侧部分的所有存储引擎都是 *MergeTree，将使用本地 JOIN 而不是 GLOBAL JOIN。

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置。可以在并行副本中使用 PROJECTION 优化。仅在启用了 parallel_replicas_local_plan 且 aggregation_in_order 处于禁用状态时生效。"}]}]}/>

可以在并行副本中使用 PROJECTION 优化。仅在启用了 parallel_replicas_local_plan 且 aggregation_in_order 处于禁用状态时生效。

## parallel_view_processing \{#parallel_view_processing\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用并行地向附加视图推送数据，而不是顺序推送。

## parallelize_output_from_storages \{#parallelize_output_from_storages\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "在执行从 file/url/S3 等读取数据的查询时允许并行处理。这可能会打乱行的顺序。"}]}]}/>

对从存储读取步骤的输出进行并行处理。如果可能，它允许在从存储读取之后立刻对查询进行并行处理。

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "改进了与 MySQL DATE_FORMAT/STR_TO_DATE 的兼容性"}]}]}/>

函数 `parseDateTime` 中的格式说明符 `%e` 要求一位数的日期使用前导空格填充，例如接受 `' 2'`，但 `'2'` 会报错。

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

在 `parseDateTime` 函数中，格式说明符 `%c`、`%l` 和 `%k` 用于解析不带前导零的月份和小时。

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果不为 0，则在 partial merge join 中，将左侧表的数据块合并成更大的块。每个 join 线程最多会使用不超过指定值两倍的内存。

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

在使用部分合并 JOIN 算法处理 [JOIN](../../sql-reference/statements/select/join.md) 查询时，用于限制右侧 JOIN 数据块的大小。

ClickHouse 服务器：

1.  将右侧 JOIN 数据拆分为包含不超过指定行数的块。
2.  使用每个块的最小值和最大值为其建立索引。
3.  在可能的情况下，将已准备好的数据块卸载到磁盘。

可选值：

- 任意正整数。推荐取值范围：\[1000, 100000\]。

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许查询在被取消时返回部分结果。

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果目标表在单个分区中包含至少这么多活跃分区片段，则会对向该表的插入操作进行人为限速。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果目标表某个分区中的活动分区片段数量超过此数值，将抛出 `Too many parts ...` 异常。

## per_part_index_stats \{#per_part_index_stats\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置。"}]}]}/>

记录每个 part 的索引统计信息

## poll_interval \{#poll_interval\}

<SettingsInfoBlock type="UInt64" default_value="10" />

在服务器的查询等待循环中阻塞指定的秒数。

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "允许控制 PostgreSQL 连接的 'connect_timeout' 参数。"}]}]}/>

单次尝试连接 PostgreSQL 端点时的超时时间（单位为秒）。
该值会作为连接 URL 中的 `connect_timeout` 参数传递。

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\}

<SettingsInfoBlock type="Bool" default_value="0" />

在将连接归还到连接池之前关闭该连接。

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "允许控制 PostgreSQL 连接池中的重试次数。"}]}]}/>

用于 PostgreSQL 表引擎和数据库引擎的连接池 push/pop 操作的重试次数。

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL 表引擎和数据库引擎所使用的连接池大小。

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL 表引擎和数据库引擎在连接池为空时进行 push/pop 操作的超时时间。默认情况下，在连接池为空时会阻塞等待。

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

内部（用于复制的）PostgreSQL 查询失败的近似概率。有效取值范围为 [0.0f, 1.0f]。

## prefer_column_name_to_alias \{#prefer_column_name_to_alias\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在查询表达式和子句中使用原始列名而不是别名。尤其是在别名与列名相同的情况下，这一点尤为重要，参见 [Expression Aliases](/sql-reference/syntax#notes-on-usage)。启用此设置可以使 ClickHouse 中别名的语法规则与大多数其他数据库引擎更加兼容。

可能的取值：

* 0 — 使用别名替换列名。
* 1 — 不使用别名替换列名。

**示例**

启用与禁用之间的差异：

查询：

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

结果：

```text
Received exception from server (version 21.5.1):
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function avg(number) is found inside another aggregate function in query: While processing avg(number) AS number.
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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "在外部排序时优先使用最大块大小，以减少合并阶段的内存使用。"}]}]}/>

在外部排序时优先使用最大块大小，以减少合并阶段的内存使用。

## prefer_global_in_and_join \{#prefer_global_in_and_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用将 `IN`/`JOIN` 运算符替换为 `GLOBAL IN`/`GLOBAL JOIN`。

可能的取值：

- 0 — 禁用。`IN`/`JOIN` 运算符不会被替换为 `GLOBAL IN`/`GLOBAL JOIN`。
- 1 — 启用。`IN`/`JOIN` 运算符会被替换为 `GLOBAL IN`/`GLOBAL JOIN`。

**用法**

尽管 `SET distributed_product_mode=global` 可以改变分布式表的查询行为，但它并不适用于本地表或来自外部资源的表。这时就需要使用 `prefer_global_in_and_join` 设置。

例如，我们有一些用于处理查询的节点，其中包含不适合分布式的本地表。我们需要在分布式处理期间，通过 `GLOBAL` 关键字（`GLOBAL IN`/`GLOBAL JOIN`）动态分发这些数据。

`prefer_global_in_and_join` 的另一个用例是访问由外部引擎创建的表。该设置有助于在与此类表进行 `JOIN` 时减少对外部源的调用次数：每个查询只调用一次。

**另请参阅：**

- [分布式子查询](/sql-reference/operators/in#distributed-subqueries)，了解如何使用 `GLOBAL IN`/`GLOBAL JOIN` 的更多信息

## prefer_localhost_replica \{#prefer_localhost_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在处理分布式查询时优先使用本地主机副本。

可能的取值：

- 1 — 如果本地主机副本存在，ClickHouse 始终将查询发送到本地主机副本。
- 0 — ClickHouse 使用由 [load_balancing](#load_balancing) 设置指定的负载均衡策略。

:::note
如果在未使用 [parallel_replicas_custom_key](#parallel_replicas_custom_key) 的情况下使用 [max_parallel_replicas](#max_parallel_replicas)，请禁用此设置。
如果已设置 [parallel_replicas_custom_key](#parallel_replicas_custom_key)，仅当其用于包含多个分片且每个分片包含多个副本的集群时才禁用此设置。
如果其用于只有单个分片但包含多个副本的集群，禁用此设置会产生负面影响。
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

仅在 ClickHouse Cloud 中生效。若某个合并分区片段距今的生成时间小于指定的秒数且尚未被预热（参见 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)），但其所有源分区片段都可用且已预热，则 SELECT 查询会改为从这些源分区片段读取数据。仅适用于 Replicated-/SharedMergeTree。注意，这个设置只检查 CacheWarmer 是否处理过该分区片段；如果该分区片段是被其他组件拉取到缓存中的，在 CacheWarmer 处理到它之前仍会被视为“冷”；如果它曾被预热但之后从缓存中被驱逐，仍然会被视为“热”。

## preferred_block_size_bytes \{#preferred_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

此设置用于调整用于查询处理的数据块大小，是对粒度更粗的 `max_block_size` 设置的进一步微调。如果列较宽，并且在 `max_block_size` 行数下块大小可能会超过指定的字节数，则会相应减小块大小，以更好地利用 CPU 缓存局部性。

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在读取时，限制每个数据块中单个列的最大大小。有助于减少缓存未命中次数。该值应尽量接近 L2 缓存的容量。

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\}

如果将其设置为非空字符串，ClickHouse 将尝试在查询中应用指定的投影。

可能的取值：

- 字符串：首选投影的名称

## prefetch_buffer_size \{#prefetch_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

用于从文件系统读取数据的预取缓冲区的最大大小。

## print_pretty_type_names \{#print_pretty_type_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "更好的用户体验。"}]}]} />

允许在 `DESCRIBE` 查询和 `toTypeName()` 函数中，以带缩进的美观格式打印深度嵌套的类型名称。

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

查询优先级。1 为最高，数值越大优先级越低；0 表示不使用优先级机制。

## promql_database \{#promql_database\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新增实验性设置"}]}]}/>

指定 `promql` 方言所使用的数据库名称。空字符串表示当前数据库。

## promql_evaluation_time \{#promql_evaluation_time\}

<ExperimentalBadge/>

**别名**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "该设置已被重命名。之前的名称为 `evaluation_time`。"}]}]}/>

设置用于 promql 方言的求值时间。`auto` 表示当前时间。

## promql_table \{#promql_table\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新的实验性设置"}]}]}/>

指定 `promql` 方言使用的 TimeSeries 表的名称。

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

在执行查询时，启用将用户角色从源节点推送到其他节点。

## query_cache_compress_entries \{#query_cache_compress_entries\}

<SettingsInfoBlock type="Bool" default_value="1" />

压缩[查询缓存](../query-cache.md)中的条目。在牺牲对其进行写入和读取性能的前提下，减少查询缓存的内存占用。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_cache_max_entries \{#query_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

当前用户可以在[查询缓存](../query-cache.md)中存储的查询结果的最大数量。0 表示无上限。

可能的取值：

- 大于等于 0 的整数。

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

当前用户可在[查询缓存](../query-cache.md)中分配的最大内存量（以字节为单位）。0 表示无限制。

可能的取值：

- 大于等于 0 的整数。

## query_cache_min_query_duration \{#query_cache_min_query_duration\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

查询结果被存储到[查询缓存](../query-cache.md)中所需的查询最短运行时间（毫秒）。

可能的取值：

- 大于等于 0 的正整数。

## query_cache_min_query_runs \{#query_cache_min_query_runs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在将 `SELECT` 查询的结果存入[查询缓存](../query-cache.md)之前，该查询必须运行的最小次数。

可能的值：

- 大于等于 0 的非负整数。

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\}

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

控制 [query cache](../query-cache.md) 在处理包含 `rand()` 或 `now()` 等非确定性函数的 `SELECT` 查询时的行为。

可能的取值为：

- `'throw'` - 抛出异常且不缓存查询结果。
- `'save'` - 缓存查询结果。
- `'ignore'` - 不缓存查询结果且不抛出异常。

## query_cache_share_between_users \{#query_cache_share_between_users\}

<SettingsInfoBlock type="Bool" default_value="0" />

开启后，[query cache](../query-cache.md) 中缓存的 `SELECT` 查询结果可以被其他用户读取。
出于安全原因，不建议启用此设置。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

将部分结果块压缩为大小为 [max_block_size](#max_block_size) 的数据块。会降低向 [query cache](../query-cache.md) 插入数据的性能，但可以提升缓存条目的可压缩性（参见 [query_cache_compress-entries](#query_cache_compress_entries)）。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_cache_system_table_handling \{#query_cache_system_table_handling\}

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "查询缓存将不再对 system 表上的查询结果进行缓存"}]}]}/>

控制 [query cache](../query-cache.md) 如何处理针对系统表的 `SELECT` 查询，即 `system.*` 和 `information_schema.*` 数据库中的表。

可能的取值：

- `'throw'` - 抛出异常且不缓存查询结果。
- `'save'` - 缓存查询结果。
- `'ignore'` - 不缓存查询结果且不抛出异常。

## query_cache_tag \{#query_cache_tag\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "用于为查询缓存设置添加标签的新设置。"}]}]}/>

作为[查询缓存](../query-cache.md)条目的标签字符串。
带有不同标签的相同查询在查询缓存中会被视为不同的条目。

可能的取值：

- 任意字符串

## query_cache_ttl \{#query_cache_ttl\}

<SettingsInfoBlock type="Seconds" default_value="60" />

在经过指定的秒数后，[query cache](../query-cache.md) 中的条目会变为过期状态。

可能的取值：

- 大于等于 0 的正整数。

## query_condition_cache_store_conditions_as_plaintext \{#query_condition_cache_store_conditions_as_plaintext\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新设置"}]}]}/>

以明文形式存储 [query condition cache](/operations/query-condition-cache) 的过滤条件。
如果启用，system.query_condition_cache 会显示原始的过滤条件，从而便于调试缓存相关的问题。
默认禁用，因为明文过滤条件可能暴露敏感信息。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_metric_log_interval \{#query_metric_log_interval\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "New setting."}]}]}/>

以毫秒为单位的时间间隔，用于收集单条查询的 [query_metric_log](../../operations/system-tables/query_metric_log.md)。

如果设置为任何负值，将使用 [query_metric_log setting](/operations/server-configuration-parameters/settings#query_metric_log) 中的 `collect_interval_milliseconds` 值；如果未配置该值，则默认为 1000。

要禁用对单条查询的收集，将 `query_metric_log_interval` 设为 0。

默认值：-1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "Enable some refactoring around query plan"}]}]}/>

控制是否启用针对按顺序聚合的查询计划级优化。
只有当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时才会生效。

:::note
这是一个面向开发者的高级设置，仅应在调试时使用。该设置在未来可能会以向后不兼容的方式发生变化，或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

当 JOIN 之后的过滤条件对未匹配或已匹配的行结果始终为 false 时，允许将 ANY JOIN 转换为 SEMI JOIN 或 ANTI JOIN。

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

允许在输出列仅与左表关联时，将 `JOIN` 转换为带有 `IN` 的子查询。对于非 ANY 的 JOIN（例如默认的 ALL JOIN）可能会导致结果不正确。

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "允许在 JOIN 之后的过滤条件始终过滤掉默认值时，将 OUTER JOIN 转换为 INNER JOIN"}]}]}/>

允许在 `JOIN` 之后的过滤条件始终过滤掉默认值时，将 `OUTER JOIN` 转换为 `INNER JOIN`

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新设置。"}]}]}/>

允许在查询计划中仅使用倒排文本索引来执行全文搜索过滤。

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

在 EXPLAIN PLAN 中显示内部别名（例如 __table1），而不是使用原始查询中指定的别名。

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

在计算完窗口函数后启用多线程，以便并行处理数据流

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制在查询计划层面是否启用查询优化。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置未来可能会发生向后不兼容的变更，或被移除。
:::

可选值：

- 0 - 在查询计划层面禁用所有优化
- 1 - 在查询计划层面启用优化（但单个优化仍可通过其各自的设置单独禁用）

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制一种查询计划层级的优化，该优化会将表达式移动到排序步骤之后再执行。
仅当设置 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 为 1 时才生效。

:::note
这是一个面向专家的设置，仅应由开发人员在调试时使用。该设置将来可能以向后不兼容的方式发生变化或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_filter_push_down \{#query_plan_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用查询计划级别的优化，将过滤条件下推到执行计划中更低的层级。
仅当设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 为 1 时才会生效。

:::note
这是一个面向开发人员的专家级设置，仅应在调试时使用。该设置未来可能以向后不兼容的方式发生变化或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新设置"}]}]}/>

如果两个表的 JOIN 键都包含各自 PRIMARY KEY 的前缀，则对 JOIN 进行分片处理。适用于 hash、parallel_hash 和 full_sorting_merge 算法。通常不会加速查询，但可能减少内存占用。

## query_plan_join_swap_table \{#query_plan_join_swap_table\}

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新设置。此前始终选择右表。"}]}]}/>

确定在查询计划中，连接的哪一侧应作为构建表（也称为 inner，即在哈希连接中插入到哈希表中的那一侧）。此设置仅在连接严格性为 `ALL` 且使用 `JOIN ON` 子句时受支持。可选值为：

- 'auto'：由查询计划器决定哪张表作为构建表。
    - 'false'：从不交换表（右表为构建表）。
    - 'true'：始终交换表（左表为构建表）。

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用一种查询计划级别的优化，该优化会在执行计划中上移 ARRAY JOIN。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置在未来可能会以向后不兼容的方式进行更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_lift_up_union \{#query_plan_lift_up_union\}

<SettingsInfoBlock type="Bool" default_value="1" />

开启或关闭一种查询计划层面的优化，该优化会将查询计划中较大的子树上移到 union 中，以便进行进一步优化。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置在未来可能会以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "添加新的设置，用于控制在允许使用查询计划进行惰性物化优化时的最大 LIMIT 值。若为零，则不设限制"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10000"},{"label": "在性能改进后提升该限制"}]}, {"id": "row-3","items": [{"label": "25.11"},{"label": "100"},{"label": "更为优化"}]}]}/>

控制在允许使用查询计划进行惰性物化优化时的最大 LIMIT 值。若为零，则不设限制。

## query_plan_max_limit_for_top_k_optimization \{#query_plan_max_limit_for_top_k_optimization\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting."}]}]}/>

控制在使用 minmax skip 索引和动态阈值过滤进行 TopK 优化时，可对查询计划进行评估的最大 limit 值。如果为 0，则不设上限。

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

限制在查询计划中可应用的优化总次数，参见设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations)。
用于避免对复杂查询进行耗时过长的优化。
在 EXPLAIN PLAN 查询中，当达到此上限时停止继续应用优化，并按当前状态原样返回计划。
对于常规查询执行，如果实际优化次数超过此设置，将抛出异常。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置将来可能以不向后兼容的方式更改或被移除。
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

`EXPLAIN PLAN` 输出中步骤描述的最大长度。

## query_plan_merge_expressions \{#query_plan_merge_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制一项在 query plan 级别的优化，用于合并连续的过滤条件。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅应由开发人员在调试时使用的专家级设置。该设置未来可能以向后不兼容的方式发生变化或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Added new setting to merge filter into join condition"}]}]}/>

允许将过滤条件合并到 `JOIN` 条件中，并将 `CROSS JOIN` 转换为 `INNER JOIN`。

## query_plan_merge_filters \{#query_plan_merge_filters\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "允许在查询计划中合并过滤条件"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "允许在查询计划中合并过滤条件。在使用新分析器时，为了正确支持过滤下推，这是必需的。"}]}]}/>

允许在查询计划中合并过滤条件。

## query_plan_optimize_join_order_algorithm \{#query_plan_optimize_join_order_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="JoinOrderAlgorithm" default_value="greedy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "greedy"},{"label": "New experimental setting."}]}]}/>

指定在查询计划优化期间要尝试的 JOIN 顺序算法。可用的算法如下：

- 'greedy' - 基本贪心算法——速度快，但可能无法产生最佳的 JOIN 顺序
 - 'dpsize' - 实现 DPsize 算法，目前仅适用于 INNER JOIN——考虑所有可能的 JOIN 顺序并找到最优的一个，但对于包含大量表和 JOIN 谓词的查询可能较慢。
可以指定多个算法，例如 'dpsize,greedy'。

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "Allow JOIN reordering with more tables by default"}]}]}/>

在同一子查询内优化 JOIN 的顺序。目前仅在极少数场景中受支持。
该值表示要优化的最大表数量。

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新增使用查询计划进行惰性物化优化的设置"}]}]}/>

使用查询计划进行惰性物化优化。

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Allow to push down filter to PREWHERE expression for supported storages"}]}]}/>

允许将过滤条件下推到受支持存储的 PREWHERE 表达式中

## query_plan_push_down_limit \{#query_plan_push_down_limit\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否启用一种查询计划级别的优化，该优化会将 LIMIT 下推到执行计划的更低层级。
仅当设置 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的专家级设置。该设置未来可能会以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_read_in_order \{#query_plan_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制在查询计划层面是否启用按顺序读取优化。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个专家级设置，仅应由开发人员在调试时使用。该设置未来可能会以向后不兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_read_in_order_through_join \{#query_plan_read_in_order_through_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

在 JOIN 操作中保持按左表顺序读取，以便后续步骤使用。

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

启用或禁用一种查询计划级别的优化，用于移除多余的 DISTINCT 步骤。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个高级设置，仅应由开发人员在调试时使用。该设置未来可能会以向后不兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "从查询计划中移除冗余排序。例如，移除与子查询中 ORDER BY 子句相关的排序步骤"}]}]}/>

启用或关闭一个查询计划级别的优化，用于移除冗余的排序步骤，例如子查询中的排序步骤。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个面向专家级用户的设置，仅应由开发人员在调试时使用。该设置将来可能以不向后兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "新设置。添加用于在查询计划中移除未使用列的优化。"}]}]}/>

控制是否启用一项查询计划级别的优化，该优化会尝试在查询计划步骤中移除未使用的列（包括输入列和输出列）。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个面向专家的设置，仅应由开发人员在调试时使用。该设置未来可能以向后不兼容的方式变更或被移除。
:::

可能的值：

- 0 - 禁用
- 1 - 启用

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

切换一种查询计划级别的优化，在为窗口函数排序时复用存储的排序结果。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是仅供开发人员在调试时使用的专家级设置。该设置在未来可能以向后不兼容的方式更改或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_split_filter \{#query_plan_split_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
这是一个仅应由开发人员用于调试的高级设置。该设置未来可能会以向后不兼容的方式更改或被移除。
:::

用于控制在 query-plan 层面的一项优化，将过滤条件拆分为多个表达式。
仅当 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 设置为 1 时生效。

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

允许在查询计划中为由倒排文本索引构建的过滤条件添加提示（附加谓词）。

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新设置。"}]}]}/>

开启或关闭查询计划级别的一项优化，该优化会尝试使用向量相似度索引。
仅当 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 设置为 1 时生效。

:::note
这是一个仅供开发人员在调试时使用的高级设置。该设置未来可能会以不兼容的方式变更或被移除。
:::

可能的取值：

- 0 - 禁用
- 1 - 启用

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\}

**别名**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "启用新的步骤"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新的 JOIN 步骤，内部变更"}]}]}/>

在查询计划中使用逻辑 JOIN 步骤。
注意：`query_plan_use_new_logical_join_step` 已被弃用，请改用 `query_plan_use_logical_join_step`。

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

设置 [query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 的 CPU 时钟计时器周期。该计时器只统计 CPU 时间。

可能的值：

- 正整数（单位：纳秒）。

    推荐值：

            - 10000000（每秒 100 次）及以上，用于单个查询。
            - 1000000000（每秒一次），用于集群范围的性能剖析。

- 0 表示关闭计时器。

另请参阅：

- 系统表 [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

设置 [query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 的实时时钟计时器周期。实时时钟计时器按挂钟时间（wall-clock time）计时。

可能的取值：

- 正整数，单位为纳秒。

    推荐取值：

            - 10000000（每秒 100 次）纳秒及以下，用于单个查询。
            - 1000000000（每秒 1 次），用于整个集群范围的分析。

- 0 表示关闭定时器。

另请参阅：

- 系统表 [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

当并发请求数超过配置的最大值时，请求在队列中的等待时间。

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

从 RabbitMQ 读取时在重试前的等待时间。

## read_backoff_max_throughput \{#read_backoff_max_throughput\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在读取速度较慢时用于减少线程数量的设置。当读取带宽低于该值指定的每秒字节数时开始统计事件。

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="1" />

在读取变慢时尝试维持的最小线程数设置。

## read_backoff_min_events \{#read_backoff_min_events\}

<SettingsInfoBlock type="UInt64" default_value="2" />

用于在读取速度较慢时减少线程数量的设置。该参数表示发生的事件次数达到多少后开始减少线程数量。

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

在读取变慢时用于减少线程数量的设置。如果距离上一次事件发生的时间小于指定的间隔，则忽略本次事件。

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

此设置用于在读取变慢时减少线程数量。仅对耗时至少达到该值的读取操作生效。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。与 read_from_filesystem_cache_if_exists_otherwise_bypass_cache 相同，但针对分布式缓存。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许以被动模式使用文件系统缓存——利用已有的缓存条目，但不再向缓存中写入新的条目。对于开销较大的临时（ad‑hoc）查询启用此设置，而对短实时查询保持禁用，可以避免重型查询引发缓存抖动，从而提升整体系统效率。

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Added userspace page cache"}]}]}/>

在被动模式下使用用户态页缓存，其行为类似于 read_from_filesystem_cache_if_exists_otherwise_bypass_cache。

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

在按主键顺序进行多线程读取时，为执行预合并步骤所需读取的最少分区片段数。

## read_in_order_use_buffering \{#read_in_order_use_buffering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "按主键顺序读取时，在合并前使用缓冲"}]}]}/>

按主键顺序读取时，在合并前使用缓冲。这可以提高查询执行的并行度。

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "在按主键或其单调函数的顺序读取时使用虚拟行。在跨多个分区片段进行搜索时很有用，因为只会访问相关的分区片段。"}]}]}/>

在按主键或其单调函数的顺序读取时使用虚拟行。在跨多个分区片段进行搜索时很有用，因为只会访问相关的分区片段。

## read_overflow_mode \{#read_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

超过限制时的处理方式。

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当读取的数据量超过任一叶子节点设置的限制时的处理方式。

可选值：

- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果。

## read_priority \{#read_priority\}

<SettingsInfoBlock type="Int64" default_value="0" />

从本地文件系统或远程文件系统读取数据时的优先级。仅在本地文件系统使用 `pread_threadpool` 方法以及在远程文件系统使用 `threadpool` 方法时受支持。

## read_through_distributed_cache \{#read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "用于 ClickHouse Cloud 的设置"}]}]}/>

仅在 ClickHouse Cloud 中有效。允许从分布式缓存中读取

## readonly \{#readonly\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 无只读限制。1 - 仅允许读取请求，并可修改被显式允许的设置。2 - 仅允许读取请求，并可修改除 `readonly` 设置之外的其他设置。

## receive_data_timeout_ms \{#receive_data_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

用于在从副本接收首个数据包或带有正向进度更新的数据包时的连接超时时间

## receive_timeout \{#receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

从网络接收数据的超时时间（以秒为单位）。如果在此时间间隔内未接收到任何字节，将抛出异常。如果在客户端设置该配置项，则会在服务器端对应连接的套接字上同时设置 `send_timeout`。

## regexp_dict_allow_hyperscan \{#regexp_dict_allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许 regexp_tree 字典使用 Hyperscan 库。

## regexp_dict_flag_case_insensitive \{#regexp_dict_flag_case_insensitive\}

<SettingsInfoBlock type="Bool" default_value="0" />

对 `regexp_tree` 字典使用不区分大小写的匹配。可以在单个表达式中通过 `(?i)` 和 `(?-i)` 覆盖该设置。

## regexp_dict_flag_dotall \{#regexp_dict_flag_dotall\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许 `regexp_tree` 字典中的 '.' 匹配换行字符。

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

设置单个正则表达式在每行允许的最大匹配次数。可用于在 [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 函数中使用贪婪型正则表达式时，防止内存过载。

可能的取值：

- 正整数。

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\}

<SettingsInfoBlock type="Bool" default_value="1" />

拒绝那些在使用 Hyperscan 进行评估时代价可能很高的模式（例如会导致 NFA 状态爆炸的情况）

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

如果重新合并后的内存使用量未按该比例减少，则会禁用重新合并。

## remote_filesystem_read_method \{#remote_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="threadpool" />

读取远程文件系统数据的方法，可选值：read 或 threadpool。

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

在从远程文件系统读取数据时是否启用预取。

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="5" />

带退避的最大读取重试次数

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

尝试从远程磁盘读取数据时的最大等待时间（毫秒）

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

在远程读取（URL、S3）时，为执行 seek 操作而不是以 ignore 模式读取所需的最小字节数。

## rename_files_after_processing \{#rename_files_after_processing\}

- **类型：** String

- **默认值：** 空字符串

此设置允许为由 `file` table function 处理的文件指定重命名模式。启用该选项后，所有由 `file` table function 读取的文件，只有在处理成功时，才会按照包含占位符的指定模式进行重命名。

### 占位符 \{#placeholders\}

- `%a` — 原始完整文件名（例如："sample.csv"）。
- `%f` — 原始文件名（不含扩展名，例如："sample"）。
- `%e` — 原始文件扩展名（包含点号，例如：".csv"）。
- `%t` — 时间戳（微秒级）。
- `%%` — 百分号（"%"）。

### 示例 \{#example\}

- 选项：`--rename_files_after_processing="processed_%f_%t%e"`

- 查询：`SELECT * FROM file('sample.csv')`

如果成功读取 `sample.csv`，则文件将被重命名为 `processed_sample_1683473210851438.csv`。

## replace_running_query \{#replace_running_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用 HTTP 接口时，可以传递 `query_id` 参数。它是任意字符串，用作查询标识符。
如果此时已经存在来自同一用户且具有相同 `query_id` 的查询，其具体行为取决于 `replace_running_query` 参数。

`0`（默认）– 抛出异常（如果具有相同 `query_id` 的查询已经在运行，则不允许该查询运行）。

`1` – 取消旧查询并开始运行新查询。

将此参数设置为 1 可用于实现分段条件提示功能。在输入下一个字符后，如果旧查询尚未完成，则应将其取消。

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

当 [replace_running_query](#replace_running_query) 设置生效时，等待具有相同 `query_id` 的正在运行的查询完成的时间。

可能的取值：

- 正整数。
- 0 — 如果服务器已经在执行具有相同 `query_id` 的查询，则抛出异常，不允许运行新的查询。

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\}

<SettingsInfoBlock type="Int64" default_value="120" />

指定在等待非活动副本执行 [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md) 或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询时的时间上限（以秒为单位）。

可能的取值：

- `0` — 不等待。
- 负整数 — 无限期等待。
- 正整数 — 要等待的秒数。

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新设置。"}]}]}/>

在恢复时将外部字典源替换为 Null，可用于测试场景。

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新设置。"}]}]}/>

用于测试。将所有外部引擎替换为 Null，以避免建立外部连接。

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新增设置。"}]}]}/>

用于测试。将所有外部表函数替换为 Null，使其不会发起外部连接。

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新设置。"}]}]}/>

在 RESTORE 过程中将表引擎从 Replicated*MergeTree 更换为 Shared*MergeTree。

## result_overflow_mode \{#result_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Cloud 默认值：`throw`

设置当结果的数据量超过某个限制时要执行的操作。

可选值：

* `throw`：抛出异常（默认）。
* `break`：停止执行查询并返回部分结果，就好像
  源数据已经耗尽。

使用 &#39;break&#39; 类似于使用 LIMIT。`break` 只会在块级别中断执行。
这意味着返回的行数大于
[`max_result_rows`](/operations/settings/settings#max_result_rows)、是 [`max_block_size`](/operations/settings/settings#max_block_size)
的倍数，并且取决于 [`max_threads`](/operations/settings/settings#max_threads)。

**示例**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
6666 rows in set. ...
```


## rewrite_count_distinct_if_with_count_distinct_implementation \{#rewrite_count_distinct_if_with_count_distinct_implementation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "使用 count_distinct_implementation 配置重写 countDistinctIf"}]}]}/>

允许通过 [count_distinct_implementation](#count_distinct_implementation) SETTING 重写 `countDistcintIf`。

可能的取值：

- true — 允许。
- false — 不允许。

## rewrite_in_to_join \{#rewrite_in_to_join\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

将类似 `x IN subquery` 的表达式重写成 JOIN。这可能有助于通过重新排序 JOIN 来优化整个查询。

## rows_before_aggregation \{#rows_before_aggregation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "为 rows_before_aggregation 统计量提供精确值，表示聚合前读取的行数"}]}]}/>

启用后，ClickHouse 将为 rows_before_aggregation 统计量提供精确值，表示在聚合前读取的行数。

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新增设置。"}]}]}/>

允许在 S3 中使用多部分复制。

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

为 S3 多部分上传使用多个线程。这可能会略微增加内存使用。

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用 HEAD 请求检查上传到 S3 的每个对象，以确保上传已成功完成。

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "为 S3 连接超时引入新的专用设置"}]}]}/>

用于 S3 磁盘主机连接的超时时间。

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 S3 引擎表中每次插入时创建一个新文件。若启用，则每次插入都会创建一个新的 S3 对象，其键名类似于以下模式：

初始：`data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz`，依此类推。

可能的取值：

- 0 — `INSERT` 查询会创建一个新文件；如果文件已存在且未设置 `s3_truncate_on_insert`，则会失败。
- 1 — 如果未设置 `s3_truncate_on_insert`，则 `INSERT` 查询在每次插入时创建一个新文件，从第二个文件开始使用后缀。

更多详情请参阅[此处](/integrations/s3#inserting-data)。

## s3_disable_checksum \{#s3_disable_checksum\}

<SettingsInfoBlock type="Bool" default_value="0" />

在将文件发送到 S3 时不计算校验和。这样可以通过避免对文件进行多次处理来加快写入。大多数情况下这是安全的，因为 MergeTree 表的数据无论如何都会由 ClickHouse 计算校验和，并且当通过 HTTPS 访问 S3 时，TLS 层已经在网络传输过程中提供了数据完整性保护。同时，在 S3 端保留额外的校验和可以作为纵深防御的一部分。

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "当请求的文件不存在时，允许返回 0 行，而不是由 S3 表引擎抛出异常"}]}]}/>

在读取特定键时，如果目标文件不存在，则忽略其不存在。

可能的取值：

- 1 — `SELECT` 返回空结果。
- 0 — `SELECT` 抛出异常。

## s3_list_object_keys_size \{#s3_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

`ListObject` 请求单次批量返回的最大文件数量

## s3_max_connections \{#s3_max_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

每台服务器的最大连接数。

## s3_max_get_burst \{#s3_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在达到每秒请求数限制之前可同时发出的最大请求数。默认情况下，取值为 0 时等同于 `s3_max_get_rps`。

## s3_max_get_rps \{#s3_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在触发限流之前，S3 GET 请求的每秒请求速率上限。0 表示无限制。

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

在一次分段上传请求中可并发上传的分区片段的最大数量。0 表示不限制。

## s3_max_part_number \{#s3_max_part_number\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "用于 S3 分段上传的部件序号上限"}]}]}/>

用于 S3 分段上传的部件序号上限。

## s3_max_put_burst \{#s3_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在达到每秒请求数限制之前，允许并发发出的最大请求数量。默认值（0）等同于 `s3_max_put_rps`。

## s3_max_put_rps \{#s3_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在触发限流前，每秒允许的 S3 PUT 请求数量上限。零表示不限制。

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "S3 中单次复制操作的最大大小"}]}]}/>

S3 中单次复制操作的最大大小。仅当 `s3_allow_multipart_copy` 为 true 时才会使用此设置。

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

使用单部分上传方式将对象上传到 S3 时，单个对象允许的最大大小。

## s3_max_single_read_retries \{#s3_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

单次 S3 读取的最大重试次数。

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

在向 S3 写入期间发生非预期错误时允许的最大重试次数。

## s3_max_upload_part_size \{#s3_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

执行向 S3 进行分段上传（multipart upload）时，每个分段可上传的最大大小。

## s3_min_upload_part_size \{#s3_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

向 S3 执行分段上传时，每个上传分片的最小大小。

## s3_path_filter_limit \{#s3_path_filter_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting"}]}]}/>

可以从查询过滤条件中提取并用于文件遍历（而非基于通配符的列举）的 `_path` 值的最大数量。0 表示禁用。

## s3_request_timeout_ms \{#s3_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

向 S3 发送数据及从 S3 接收数据的空闲超时时间。如果单次 TCP 读或写调用阻塞时间超过该值，则判定为失败。

## s3_skip_empty_files \{#s3_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "We hope it will provide better UX"}]}]}/>

启用或禁用在使用 [S3](../../engines/table-engines/integrations/s3.md) 引擎的表中跳过空文件。

可能的取值：

- 0 — 如果空文件与请求的格式不兼容，`SELECT` 会抛出异常。
- 1 — 对于空文件，`SELECT` 返回空结果集。

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新设置"}]}]}/>

当设置为 `true` 时，一旦任意一个 S3 请求遇到可重试的网络错误（例如 socket 超时），所有向同一备份端点发起 S3 请求的线程都会被放慢。
当设置为 `false` 时，每个线程会独立于其他线程处理自身 S3 请求的退避。

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在向 S3 执行 multipart 上传时，每个要上传的分区片段的精确大小（某些实现不支持可变大小的分区片段）。

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

当 ListObjects 请求未能匹配到任何文件时，是否抛出错误

## s3_truncate_on_insert \{#s3_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在 S3 引擎表中执行插入前的截断操作。若禁用，当尝试插入且对应的 S3 对象已存在时会抛出异常。

可能的取值：

- 0 — `INSERT` 查询创建一个新文件，如果文件已存在且未设置 s3_create_new_file_on_insert，则插入失败。
- 1 — `INSERT` 查询使用新数据替换该文件中已有的内容。

更多信息参见[此处](/integrations/s3#inserting-data)。

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

每当在一次写入 S3 的操作中上传的分区片段数量达到 s3_multiply_parts_count_threshold 时，将 s3_min_upload_part_size 乘以该系数。

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

每当上传到 S3 的分区片段数量达到该阈值时，`s3_min_upload_part_size` 就会乘以 `s3_upload_part_size_multiply_factor`。

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

当设置为 `true` 时，所有发往 S3 的请求在前两次尝试时将使用较短的发送和接收超时时间。
当设置为 `false` 时，所有尝试都将使用相同的发送和接收超时时间。

## s3_validate_request_settings \{#s3_validate_request_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Allow to disable S3 request settings validation"}]}]}/>

启用对 S3 请求设置的校验。
可能的取值：

- 1 — 校验请求设置。
- 0 — 不校验请求设置。

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue 引擎的默认 ZooKeeper 路径前缀

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用向 system.s3queue_log 的写入。该值可以在每个表中通过表设置单独覆盖

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

用于 S3Queue 的 Keeper 故障注入概率。

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置。"}]}]}/>

将 S3Queue 表的旧元数据结构迁移为新的结构

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

对具有最后修改时间验证的 URL 使用缓存中的 schema（适用于带有 Last-Modified 头的 URL）

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\}

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 Azure 表函数进行 schema 推断时使用缓存

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\}

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 file 表函数进行模式推断时使用缓存

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\}

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 HDFS 表函数进行 schema 推断时使用缓存

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\}

<SettingsInfoBlock type="Bool" default_value="1" />

在使用 S3 表函数进行模式推断时使用缓存

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

在通过 url 表函数进行 schema 推断时启用缓存

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "用于数据跳过索引过滤的新算法"}]}]}/>

启用针对索引的批量过滤算法。一般情况下它应当始终表现更好，但我们保留此设置以确保兼容性并提供更精细的控制。

## select_sequential_consistency \{#select_sequential_consistency\}

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
此设置在 SharedMergeTree 和 ReplicatedMergeTree 中的行为不同，关于 SharedMergeTree 中 `select_sequential_consistency` 的行为，参见 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)。
:::

启用或禁用 `SELECT` 查询的顺序一致性。要求关闭 `insert_quorum_parallel`（默认启用）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

用法

当启用了顺序一致性时，ClickHouse 仅允许客户端在那些包含所有先前使用 `insert_quorum` 执行的 `INSERT` 查询数据的副本上执行 `SELECT` 查询。若客户端访问的是不完整的副本，ClickHouse 会抛出异常。该 SELECT 查询不会包含尚未写入到仲裁副本（quorum）中的数据。

当 `insert_quorum_parallel` 启用时（默认情况），`select_sequential_consistency` 不生效。这是因为并行的 `INSERT` 查询可能被写入到不同集合的仲裁副本中，从而无法保证单个副本已经接收到所有写入。

另请参阅：

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\}

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

将达到指定最低级别的服务器文本日志发送到客户端。有效取值：'trace'、'debug'、'information'、'warning'、'error'、'fatal'、'none'

## send_logs_source_regexp \{#send_logs_source_regexp\}

发送服务器文本日志时，使用指定的正则表达式匹配日志源名称。留空表示匹配所有日志源。

## send_profile_events \{#send_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新设置。是否向客户端发送 ProfileEvents。"}]}]}/>

启用或禁用向客户端发送 [ProfileEvents](/native-protocol/server.md#profile-events) 数据包。

对于不需要 ProfileEvents 的客户端，可以禁用该功能以减少网络流量。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## send_progress_in_http_headers \{#send_progress_in_http_headers\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用 `clickhouse-server` 响应中的 `X-ClickHouse-Progress` HTTP 响应头。

要了解更多信息，请参阅 [HTTP 接口说明](/interfaces/http)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## send_timeout \{#send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

向网络发送数据的超时时间（以秒为单位）。如果客户端需要发送数据，但在该时间段内无法发送任何字节，就会抛出异常。如果在客户端上设置此参数，则在服务端对应连接端的套接字上也会设置 `receive_timeout`。

## serialize_query_plan \{#serialize_query_plan\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

序列化用于分布式处理的查询计划

## serialize_string_in_memory_with_zero_byte \{#serialize_string_in_memory_with_zero_byte\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

在聚合过程中将 String 值序列化为以零字节结尾的形式。启用该选项以在对存在版本不兼容的集群执行查询时保持兼容性。

## session_timezone \{#session_timezone\}

<BetaBadge />

设置当前会话或查询的隐式时区。
隐式时区是指应用于未显式指定时区的 DateTime/DateTime64 类型值的时区。
此设置优先于全局配置的（服务器级别的）隐式时区。
取值为 &#39;&#39;（空字符串）时，表示当前会话或查询的隐式时区等于[服务器时区](../server-configuration-parameters/settings.md/#timezone)。

可以使用函数 `timeZone()` 和 `serverTimeZone()` 分别获取会话时区和服务器时区。

可选值：

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
并非所有解析 DateTime/DateTime64 的函数都会遵循 `session_timezone`，这可能会导致一些难以察觉的错误。
请参阅下文的示例和说明。
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
0 rows in set.

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

这是由于使用了不同的解析流程：

* 在第一个 `SELECT` 查询中，未显式指定时区的 `toDateTime()` 会遵循 `session_timezone` 设置以及全局时区。
* 在第二个查询中，DateTime 是从 String 解析而来，并继承了已有列 `d` 的类型和时区。因此，此时 `session_timezone` 设置以及全局时区不会生效。

**另请参阅**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过任一限制时的行为。

可能的取值：

- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果，仿佛源数据已经耗尽。

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "新设置。默认情况下始终同步分区片段"}]}]}/>

在 SMT 表中，在执行 MOVE|REPLACE|ATTACH 分区操作后自动同步相关的数据分区片段。仅限 Cloud

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\}

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

允许按照[短路求值](https://en.wikipedia.org/wiki/Short-circuit_evaluation)的方式对 [if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and) 和 [or](/sql-reference/functions/logical-functions#or) 函数进行计算。这有助于优化这些函数中复杂表达式的执行，并防止可能出现的异常（例如在逻辑上不会被执行到的分支中发生除以零）。

可能的取值：

- `enable` — 为适用的函数（可能抛出异常或计算开销较大）启用短路求值。
- `force_enable` — 为所有函数启用短路求值。
- `disable` — 禁用短路求值。

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "仅在所有参数均为非 NULL 的行上才允许执行带有 Nullable 参数的函数"}]}]}/>

优化对在任一参数为 NULL 时返回 NULL 的函数的求值。当函数参数中 NULL 值的占比超过 `short_circuit_function_evaluation_for_nulls_threshold` 时，系统会跳过逐行计算该函数，而是直接为所有行返回 NULL，从而避免不必要的计算。

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\}

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "对具有 Nullable 参数的函数，仅在所有参数均为非 NULL 值的行上执行时所使用的 NULL 值占比阈值。当设置 short_circuit_function_evaluation_for_nulls 启用时生效。"}]}]}/>

对具有 Nullable 参数的函数，仅在所有参数均为非 NULL 值的行上执行时所使用的 NULL 值占比阈值。当设置 `short_circuit_function_evaluation_for_nulls` 启用时生效。
当包含 NULL 值的行数与总行数的比值超过该阈值时，将不会对这些包含 NULL 值的行执行函数计算。

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "默认在 system 表中禁用数据湖目录"}]}]}/>

启用在 system 表中显示数据湖目录。

## show_processlist_include_internal \{#show_processlist_include_internal\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

在 `SHOW PROCESSLIST` 查询的输出中显示内部辅助进程。

内部进程包括字典重载、可刷新 materialized view 的重载、在 `SHOW ...` 查询中执行的辅助 `SELECT` 语句、为处理损坏表而在内部执行的辅助 `CREATE DATABASE ...` 查询等。

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Stop showing  UID of the table in its CREATE query for Engine=Atomic"}]}]}/>

设置 `SHOW TABLE` 查询的显示方式。

可能的取值：

- 0 — 查询结果中不包含表 UUID。
- 1 — 查询结果中包含表 UUID。

## single_join_prefer_left_table \{#single_join_prefer_left_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

在单一 JOIN 中若存在标识符歧义，则优先使用左表

## skip_redundant_aliases_in_udf \{#skip_redundant_aliases_in_udf\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "启用后，允许在同一张表中的多个物化列上多次复用同一个用户自定义函数。"}]}]} />

为了简化用户自定义函数的使用，在用户自定义函数中不会使用（替换）多余的别名。

可能的取值：

* 1 — 在 UDF 中跳过（替换）这些别名。
* 0 — 在 UDF 中不跳过（替换）这些别名。

**Example**

启用和禁用时的差异：

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

启用或禁用对不可用分片的静默跳过。

如果某个分片的所有副本都不可用，则该分片被视为不可用。副本在以下情况下被视为不可用：

- ClickHouse 由于某种原因无法连接到副本。

    在连接副本时，ClickHouse 会进行多次尝试。如果所有尝试都失败，则该副本被视为不可用。

- 无法通过 DNS 解析副本。

    如果无法通过 DNS 解析副本的主机名，则可能表示以下情况：

    - 副本所在主机没有 DNS 记录。这可能发生在具有动态 DNS 的系统中，例如 [Kubernetes](https://kubernetes.io)，其中节点在停机期间可能无法被解析，这并不是错误。

    - 配置错误。ClickHouse 配置文件中包含错误的主机名。

可能的取值：

- 1 — 启用跳过。

    如果某个分片不可用，ClickHouse 会基于部分数据返回结果，并且不会报告节点不可用问题。

- 0 — 禁用跳过。

    如果某个分片不可用，ClickHouse 会抛出异常。

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在 TCPHandler 接收到查询后休眠的时间

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在 TCPHandler 发送数据时的休眠时长

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在 TCPHandler 中发送表状态响应时的休眠时间

## sort_overflow_mode \{#sort_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置在排序前接收到的行数超过设定的某个限制时应执行的操作。

可能的取值：

- `throw`: 抛出异常。
- `break`: 停止执行查询并返回部分结果。

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "在 FINAL 优化期间允许将相交的分区片段范围拆分为层"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "在 FINAL 优化期间允许将相交的分区片段范围拆分为层"}]}]}/>

在 FINAL 优化期间将相交的分区片段范围拆分为层

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "在 FINAL 优化期间将分区片段范围拆分为相交和非相交两类"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "在 FINAL 优化期间将分区片段范围拆分为相交和非相交两类"}]}]}/>

在 FINAL 优化期间将分区片段范围拆分为相交和非相交两类

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

用于控制当函数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) 的参数 `max_substrings` > 0 时，是否将剩余字符串包含在结果数组的最后一个元素中。

可能的值：

- `0` - 剩余字符串不会包含在结果数组的最后一个元素中。
- `1` - 剩余字符串会包含在结果数组的最后一个元素中。这与 Spark 的 [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 函数和 Python 的 ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) 方法的行为相同。

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在服务器启动时，禁止为可刷新materialized view进行调度，其效果等同于执行 SYSTEM STOP VIEWS。之后可以通过 `SYSTEM START VIEWS` 或 `SYSTEM START VIEW <name>` 手动启动它们。该设置同样适用于新创建的视图。对不可刷新materialized view无效。

## storage_file_read_method \{#storage_file_read_method\}

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

用于从存储文件读取数据的方法，可选值之一：`read`、`pread`、`mmap`。`mmap` 方法不适用于 clickhouse-server（仅用于 clickhouse-local）。

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

在查询 `system.stack_trace` 表时，从管道中读取线程信息的最长等待时间（毫秒）。该设置仅用于测试用途，不面向用户修改。

## stream_flush_interval_ms \{#stream_flush_interval_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

适用于在发生超时，或当某个线程生成了 [max_insert_block_size](#max_insert_block_size) 行时，对使用流式写入的表进行处理。

默认值为 7500。

该值越小，数据刷入表中的频率越高。但将该值设置得过低会导致性能下降。

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "默认不允许对 Kafka/RabbitMQ/FileLog 进行直接 SELECT"}]}]}/>

允许对 Kafka、RabbitMQ、FileLog、Redis Streams、S3Queue、AzureQueue 和 NATS 引擎直接执行 SELECT 查询。如果存在已附加的 materialized view，即使启用了此设置，也不允许执行 SELECT 查询。
如果没有附加 materialized view，启用此设置可以读取数据。请注意，通常读取的数据会从队列中被移除。为了避免已读取的数据被移除，应正确配置相关引擎的设置。

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\}

当类流式引擎从多个队列中读取数据时，用户在写入时需要选择一个队列进行插入。供 Redis Streams 和 NATS 使用。

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="500" />

从流式存储中轮询读写数据的超时时间。

## system_events_show_zero_values \{#system_events_show_zero_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许从 [`system.events`](../../operations/system-tables/events.md) 中选取值为零的事件。

某些监控系统要求在每个检查点向其传递所有指标的数值，即使该指标的值为零。

可能的值：

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
│ QueryMemoryLimitExceeded │     0 │ Number of times when memory limit exceeded for query. │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中有效。允许通过表引擎 / 表函数（如 S3、Azure 等）从分布式缓存读取数据。

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

设置 [remote](../../sql-reference/table-functions/remote.md) 函数根据模式生成的地址的最大数量。

可能的取值：

- 正整数。

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="290" />

在 TCP 开始发送 keepalive 探测之前，连接允许保持空闲的时间（以秒为单位）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "在文件系统缓存中为临时数据预留空间时获取缓存锁的等待时间（毫秒）"}]}]}/>

在文件系统缓存中为临时数据预留空间时获取缓存锁的等待时间（毫秒）

## temporary_files_buffer_size \{#temporary_files_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

用于临时文件写入的缓冲区大小。缓冲区越大，系统调用越少，但内存占用越高。

## temporary_files_codec \{#temporary_files_codec\}

<SettingsInfoBlock type="String" default_value="LZ4" />

设置在磁盘上执行排序和 JOIN 操作时所使用临时文件的压缩编码格式。

可能的取值：

- LZ4 — 应用 [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 压缩。
- NONE — 不应用任何压缩。

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\}

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "新设置"}]}]}/>

用于决定是否使用由倒排文本索引构建的提示时，过滤器的最大选择性。

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新增设置。"}]}]}/>

用于测试时，启用或禁用在文本索引中使用布隆过滤器。

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许或禁止执行空 INSERT，默认启用（在空 INSERT 时抛出错误）。仅适用于使用 [`clickhouse-client`](/interfaces/cli) 或 [gRPC 接口](/interfaces/grpc) 的 INSERT。

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

在写入操作（INSERT、合并）过程中进行缓存时，如果发生来自缓存的错误，则忽略该错误

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\}

<SettingsInfoBlock type="Bool" default_value="1" />

用于控制在达到 `max_partitions_per_insert_block` 时的行为。

可能的取值：

- `true`  - 当插入块达到 `max_partitions_per_insert_block` 时，引发异常。
- `false` - 当达到 `max_partitions_per_insert_block` 时，仅记录一条警告日志。

:::tip
当你在修改 [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) 时，这有助于评估对用户的影响。
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

在事务中执行不受支持的查询时抛出异常

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\}

<SettingsInfoBlock type="Seconds" default_value="10" />

在指定的秒数过去后，检查执行速度是否不低于 `min_execution_speed`（以确保执行速度不会过慢）。

## timeout_overflow_mode \{#timeout_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当查询实际运行时间超过 `max_execution_time`，或预估运行时间超过 `max_estimated_execution_time` 时应采取的行为。

可能的值：

- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，就像源数据已经耗尽一样。

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当叶子节点上的查询运行时间超过 `max_execution_time_leaf` 时应采取的行为。

可能的取值：

- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果，就好像源数据已经耗尽一样。

## totals_auto_threshold \{#totals_auto_threshold\}

<SettingsInfoBlock type="Float" default_value="0.5" />

用于 `totals_mode = 'auto'` 的阈值。
参见 “WITH TOTALS 修饰符” 一节。

## totals_mode \{#totals_mode\}

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

当存在 HAVING 子句时如何计算 TOTALS，以及在同时设置了 max_rows_to_group_by 和 group_by_overflow_mode = 'any' 时的计算方式。
参见“WITH TOTALS 修饰符”一节。

## trace_profile_events \{#trace_profile_events\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在每次更新 profile events 时收集堆栈跟踪信息，同时记录 profile event 的名称和自增值，并将这些信息发送到 [trace_log](/operations/system-tables/trace_log)。

可能的取值：

- 1 — 启用对 profile events 的跟踪。
- 0 — 禁用对 profile events 的跟踪。

## trace_profile_events_list \{#trace_profile_events_list\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting"}]}]}/>

当启用 `trace_profile_events` 设置时，仅跟踪名称在指定逗号分隔列表中的事件。
如果 `trace_profile_events_list` 为空字符串（默认值），则跟踪所有 profile 事件。

示例值：'DiskS3ReadMicroseconds,DiskS3ReadRequestsCount,SelectQueryTimeMicroseconds,ReadBufferFromS3Bytes'

使用此设置可以在存在大量查询时更精确地收集数据，否则，大量事件可能会导致内部系统日志队列溢出，从而使部分事件被丢弃。

## transfer_overflow_mode \{#transfer_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

设置当数据量超过某项限制时的行为。

可能的取值：

- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果，仿佛
源数据已经耗尽。

## transform_null_in \{#transform_null_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

使 [IN](../../sql-reference/operators/in.md) 运算符将 [NULL](/sql-reference/syntax#null) 值视为相等。

默认情况下，无法对 `NULL` 值进行比较，因为 `NULL` 表示未定义的值。因此，比较 `expr = NULL` 必须始终返回 `false`。启用此设置后，对于 `IN` 运算符，`NULL = NULL` 将返回 `true`。

可能的取值：

* 0 — 在 `IN` 运算符中比较 `NULL` 值时返回 `false`。
* 1 — 在 `IN` 运算符中比较 `NULL` 值时返回 `true`。

**示例**

考虑表 `null_in`：

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "在查询 system.remote_data_paths 时遍历冻结数据 shadow 目录。"}]}]}/>

在查询 system.remote_data_paths 时，除实际表数据外，还遍历冻结数据（shadow 目录）。

## union_default_mode \{#union_default_mode\}

设置用于合并 `SELECT` 查询结果的模式。该 SETTING 仅在与 [UNION](../../sql-reference/statements/select/union.md) 一起使用且未显式指定 `UNION ALL` 或 `UNION DISTINCT` 时生效。

可选值：

- `'DISTINCT'` — ClickHouse 在合并查询结果时去除重复行，只输出唯一的行。
- `'ALL'` — ClickHouse 在合并查询结果时输出所有行，包括重复行。
- `''` — 当与 `UNION` 一起使用时，ClickHouse 会抛出异常。

示例参见 [UNION](../../sql-reference/statements/select/union.md)。

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

将第 N 个数据包改为发送未知数据包

## update_parallel_mode \{#update_parallel_mode\}

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

确定并发更新查询的行为。

可能的取值：

- `sync` - 使所有 `UPDATE` 查询依次顺序执行。
- `auto` - 仅对存在依赖关系的 `UPDATE` 查询依次顺序执行：即一个查询中被更新的列，会在另一个查询的表达式中被使用。
- `async` - 不对更新查询进行同步。

## update_sequential_consistency \{#update_sequential_consistency\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

如果为 true，则会在执行更新之前将分区片段集合更新到最新版本。

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置。"}]}]}/>

对 materialized view 的查询使用异步（可能为多线程）执行方式，可以在 INSERT 期间加速 materialized view 的处理，但也会占用更多内存。

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

用于在使用表函数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` 从文件执行 COUNT 时缓存行数。

默认启用。

## use_client_time_zone \{#use_client_time_zone\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用客户端时区来解析 DateTime 字符串值，而不是使用服务器时区。

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "默认对 Distributed 表的异步 INSERT 使用紧凑格式"}]}]}/>

在对使用 `Distributed` 引擎的表执行后台（`distributed_foreground_insert`）INSERT 时，使用紧凑格式来存储数据块。

可选值：

- 0 — 使用 `user[:password]@host:port#default_database` 目录格式。
- 1 — 使用 `[shard{shard_index}[_replica{replica_index}]]` 目录格式。

:::note

- 当 `use_compact_format_in_distributed_parts_names=0` 时，集群定义中的更改不会应用于后台 INSERT。
- 当 `use_compact_format_in_distributed_parts_names=1` 时，更改集群定义中节点的顺序会改变 `shard_index` / `replica_index`，需谨慎。
:::

## use_concurrency_control \{#use_concurrency_control\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "默认启用并发控制"}]}]}/>

遵守服务器级并发控制（参见全局服务器设置 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores`）。如果禁用该设置，即使服务器已过载，也允许使用更多线程（不建议在常规场景中使用此配置，主要用于测试场景）。

## use_hash_table_stats_for_join_reordering \{#use_hash_table_stats_for_join_reordering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting. Previously mirrored 'collect_hash_table_stats_during_joins' setting."}]}]}/>

启用在连接重排期间使用已收集的哈希表统计信息进行基数估计

## use_hedged_requests \{#use_hedged_requests\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Enable Hedged Requests feature by default"}]}]}/>

为远程查询启用 hedged requests 机制。它允许为同一个查询与不同副本建立多个连接。
如果与副本的现有连接在 `hedged_connection_timeout` 内未成功建立，
或者在 `receive_data_timeout` 内未收到任何数据，则会建立一个新的连接。查询会使用第一个发送非空进度数据包（或数据包，如果启用了 `allow_changing_replica_until_first_data_packet`）的连接；
其他连接将被取消。支持 `max_parallel_replicas > 1` 的查询。

默认启用。

Cloud 默认值：`1`

## use_hive_partitioning \{#use_hive_partitioning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "默认启用该设置。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "允许在 File、URL、S3、AzureBlobStorage 和 HDFS 引擎中使用 Hive 分区方式。"}]}]}/>

启用后，ClickHouse 会在类文件表引擎 [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) 的路径（`/name=value/`）中检测 Hive 风格的分区，并允许在查询中将分区列作为虚拟列使用。这些虚拟列的名称与分区路径中的名称相同，但都以下划线 `_` 开头。

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

当启用该设置时，Iceberg 表函数和 Iceberg 存储可以使用 Iceberg 元数据文件缓存。

可能的取值：

- 0 - 禁用
- 1 - 启用

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "默认启用 Iceberg 分区裁剪。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "用于 Iceberg 分区裁剪的新设置。"}]}]}/>

对 Iceberg 表使用分区裁剪

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果在 IN 运算符右侧存在子查询或表表达式，应尝试使用索引。

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在使用 `IN` 运算符时，右侧参与过滤的集合可以使用表索引的最大大小。超过该大小时，将不再使用表索引进行过滤。这样可以避免在处理大查询时，为构建额外数据结构而导致的性能下降和更高的内存占用。0 表示不设上限。

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "启用该优化。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "新增设置。"}]}]}/>

启用将 JOIN 条件中由 OR 连接的部分下推到相应输入端（“部分下推”）。
这使得存储引擎可以更早进行过滤，从而减少数据读取量。
该优化在保持语义不变的前提下，仅在每个顶层 OR 分支都为目标端提供至少一个确定性谓词时才会应用。

## use_legacy_to_time \{#use_legacy_to_time\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新设置。允许用户对 toTime 使用旧的函数逻辑，其行为与 toTimeWithFixedDate 相同。"}]}]}/>

启用后，允许使用旧版 toTime 函数，该函数会在保留时间部分的同时，将带时间的日期转换为某个固定日期。
否则，将使用新版 toTime 函数，用于将不同类型的数据转换为 Time 类型。
旧版函数也始终可以通过 toTimeWithFixedDate 直接访问。

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新增用户态页缓存"}]}]}/>

对未启用文件系统缓存的远程磁盘使用用户态页缓存。

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

在使用分布式缓存时使用用户空间页缓存。

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新设置。"}]}]}/>

对 Paimon 表函数使用 Paimon 分区裁剪

## use_primary_key \{#use_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "控制 MergeTree 是否在粒度级别剪枝时使用主键的新设置。"}]}]}/>

在对 MergeTree 表执行查询时，使用主键对 granule（数据块）进行剪枝。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_query_cache \{#use_query_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

开启后，`SELECT` 查询可以利用[查询缓存](../query-cache.md)。参数 [enable_reads_from_query_cache](#enable_reads_from_query_cache)
和 [enable_writes_to_query_cache](#enable_writes_to_query_cache) 可以更细粒度地控制缓存的使用方式。

可能的取值：

- 0 - 禁用
- 1 - 启用

## use_query_condition_cache \{#use_query_condition_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "一种新的优化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新的设置。"}]}]}/>

启用 [query condition cache](/operations/query-condition-cache)。该缓存会存储数据分区片段中不满足 `WHERE` 子句条件的 granule（粒度块）范围，
并在后续查询中将这些信息作为临时索引加以复用。

可能的取值：

- 0 - 禁用
- 1 - 启用

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

将 roaring bitmap 用于 Iceberg 位置删除。

## use_skip_indexes \{#use_skip_indexes\}

<SettingsInfoBlock type="Bool" default_value="1" />

在执行查询时使用数据跳过索引。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_for_disjunctions \{#use_skip_indexes_for_disjunctions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

使用 skip 索引来评估包含 AND 和 OR 混合条件的 WHERE 过滤条件。例如：WHERE A = 5 AND (B = 5 OR C = 5)。
如果禁用，skip 索引仍会用于评估 WHERE 条件，但这些条件中必须只包含通过 AND 连接的子句。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_for_top_k \{#use_skip_indexes_for_top_k\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

启用在 TopK 过滤中使用数据跳过索引。

启用后，如果在 `ORDER BY <column> LIMIT n` 查询中使用的列上存在 minmax 跳过索引，优化器会尝试利用该 minmax 索引跳过与最终结果无关的粒度，从而降低查询延迟。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

控制在执行带有 FINAL 修饰符的查询时，是否使用 skipping 索引。

skipping 索引可能会排除包含最新数据的行（数据粒度，granules），从而导致带有 FINAL 修饰符的查询产生不正确的结果。启用此设置时，即使使用 FINAL 修饰符也会应用 skipping 索引，可能提升性能，但存在遗漏最近更新的风险。此设置应与 use_skip_indexes_if_final_exact_mode 设置保持同步启用（其默认值为启用）。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "设置的默认值变更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "引入该设置以帮助带有 FINAL 的查询在使用 skip indexes 时返回正确结果"}]}]}/>

控制是否在较新的分区片段中展开由跳过索引（skipping index）返回的粒度块（granule），以便在执行带有 FINAL 修饰符的查询时返回正确结果。

使用跳过索引可能会排除包含最新数据的行（粒度块），从而导致结果不正确。启用该设置可以通过扫描与跳过索引返回范围有重叠的较新的分区片段，确保返回正确结果。只有在应用可以接受基于查找跳过索引的近似结果时，才应关闭此设置。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

启用在读取数据时使用数据跳过索引。

启用后，会在读取每个数据粒度（granule）时动态评估数据跳过索引，而不是在查询执行开始前预先分析。这可以减少查询启动延迟。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_statistics_cache \{#use_statistics_cache\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

在查询中使用统计信息缓存，以避免为每个分区片段分别加载统计信息带来的开销

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Improve using structure from insertion table in table functions"}]}]}/>

使用插入表的结构，而不是从数据推断表结构。可选值：0 - 禁用，1 - 启用，2 - 自动

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否使用反序列化后的文本索引字典块缓存。
在处理大量文本索引查询时，使用文本索引字典块缓存可以显著降低延迟并提高吞吐量。

## use_text_index_header_cache \{#use_text_index_header_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否启用反序列化后的文本索引头部缓存。
在处理大量文本索引查询时，使用文本索引头部缓存可以显著降低延迟并提高吞吐量。

## use_text_index_postings_cache \{#use_text_index_postings_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

是否使用反序列化后的文本索引 posting 列表缓存。
在处理大量文本索引查询时，使用文本索引 postings 缓存可以显著降低延迟并提高吞吐量。

## use_top_k_dynamic_filtering \{#use_top_k_dynamic_filtering\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

在执行 `ORDER BY <column> LIMIT n` 查询时启用动态过滤优化。

启用后，查询执行器会尝试跳过那些不会出现在最终结果集中 `top N` 行中的 granule 和行。该优化具有动态特征，延迟改善效果取决于数据分布以及查询中是否存在其他谓词。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## use_uncompressed_cache \{#use_uncompressed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

是否使用未压缩数据块的缓存。可取值为 0 或 1。默认值为 0（禁用）。
使用未压缩缓存（仅适用于 MergeTree 系列的表）在处理大量短查询时可以显著降低延迟并提高吞吐量。对于频繁发送短请求的用户，建议启用该设置。同时请注意 [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 配置参数（只能在配置文件中设置）——未压缩缓存数据块的大小。默认值为 8 GiB。未压缩缓存会按需填充，最少使用的数据会被自动删除。

对于读取数据量至少达到 100 万行或更多的查询，未压缩缓存会自动禁用，以便为真正的小查询节省空间。这意味着可以始终将 `use_uncompressed_cache` 设置为 1。

## use_variant_as_common_type \{#use_variant_as_common_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "允许在 if/multiIf 中在没有公共类型时使用 Variant"}]}]} />

允许在参数类型之间不存在公共类型时，将 `Variant` 类型作为 [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 函数的结果类型。

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


## use_variant_default_implementation_for_comparisons \{#use_variant_default_implementation_for_comparisons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "在比较函数中为 Variant 类型启用默认实现"}]}]}/>

启用或禁用在比较函数中对 Variant 类型使用默认实现。

## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 子句中位于 WITH FILL 列之前的列构成排序前缀。具有不同排序前缀值的行会被独立填充"}]}]}/>

ORDER BY 子句中位于 WITH FILL 列之前的列构成排序前缀。具有不同排序前缀值的行会被独立填充

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置项"}]}]}/>

启用后，会根据枚举类型校验在 `IN`、`NOT IN`、`==`、`!=` 等运算符中的枚举字面量；如果该字面量不是有效的枚举值，则抛出异常。

## validate_mutation_query \{#validate_mutation_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新增设置，默认情况下会验证 mutation 查询。"}]}]}/>

在接受 mutation 查询之前对其进行验证。Mutation 在后台执行，如果运行无效的查询，可能导致 mutation 卡住，并需要人工干预。

仅当遇到不向后兼容的 bug 时才应修改此设置。

## validate_polygons \{#validate_polygons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "在函数 pointInPolygon 中，如果多边形无效，则默认抛出异常，而不是返回可能错误的结果"}]}]}/>

启用或禁用在 [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 函数中，当多边形自相交或自相切时抛出异常。

可能的取值：

- 0 — 禁用抛出异常。`pointInPolygon` 接受无效的多边形，并为其返回可能不正确的结果。
- 1 — 启用抛出异常。

## vector_search_filter_strategy \{#vector_search_filter_strategy\}

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

如果向量搜索查询包含 WHERE 子句，此设置决定是先执行该子句（预过滤），还是先检查向量相似度索引（后过滤）。可选值：

- 'auto' - 后过滤（其精确语义未来可能会发生变化）。
- 'postfilter' - 使用向量相似度索引来识别最近邻，然后再应用其他过滤条件。
- 'prefilter' - 先评估其他过滤条件，然后执行穷举搜索以识别最近邻。

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\}

**别名**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "作为设置 'vector_search_postfilter_multiplier' 的别名"}]}]}/>

将从向量相似度索引中获取的最近邻数量乘以此数值。仅在与其他谓词一起进行后置过滤时，或当设置 `vector_search_with_rescoring = 1` 时生效。

## vector_search_with_rescoring \{#vector_search_with_rescoring\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

是否让 ClickHouse 为使用向量相似性索引的查询执行重新打分。
在不进行重新打分的情况下，向量相似性索引会直接返回包含最佳匹配的行。
在进行重新打分时，这些行会被扩展到 granule 级别，并对该 granule 中的所有行重新进行检查。
在大多数情况下，重新打分对准确性的提升有限，但会显著降低向量搜索查询的性能。
注意：在未启用重新打分但启用了并行副本的情况下，查询可能会退回到执行重新打分。

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

等待已提交的更改在最新快照中实际可见

## wait_for_async_insert \{#wait_for_async_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则等待异步插入处理完成。

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

等待异步插入处理完成的超时时间

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

在事件时间处理过程中等待 Window View 触发信号的超时时间

## window_view_clean_interval \{#window_view_clean_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

window view 的清理间隔（以秒为单位），用于清理过期数据。

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

以秒为单位的心跳间隔，用于指示 watch 查询仍在运行。

## 工作负载 \{#workload\}

<SettingsInfoBlock type="String" default_value="default" />

用于访问资源的工作负载的名称

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

将完整路径（包括 S3://）写入到 Iceberg 元数据文件中。

## write_through_distributed_cache \{#write_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 的一个设置"}]}]}/>

仅在 ClickHouse Cloud 中生效。允许通过分布式缓存进行写入（对 S3 的写入也将通过分布式缓存完成）

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New cloud setting"}]}]}/>

仅在 ClickHouse Cloud 中生效。设置直写分布式缓存的缓冲区大小。若为 0，则使用在没有分布式缓存时本应使用的缓冲区大小。

## zstd_window_log_max \{#zstd_window_log_max\}

<SettingsInfoBlock type="Int64" default_value="0" />

允许你设置 ZSTD 的最大 window log（不适用于 MergeTree 系列引擎）