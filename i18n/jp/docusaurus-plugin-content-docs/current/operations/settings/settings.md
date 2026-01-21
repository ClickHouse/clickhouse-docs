---
title: 'セッション設定'
sidebar_label: 'セッション設定'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: '``system.settings`` テーブルに含まれる設定。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自動生成 */ }

以下の設定はすべて、テーブル [system.settings](/docs/operations/system-tables/settings) でも利用できます。これらの設定は、[ソースコード](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) から自動生成されています。


## add_http_cors_header \{#add_http_cors_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP の CORS ヘッダーを追加します。

## additional_result_filter \{#additional_result_filter\}

`SELECT` クエリの結果に適用するための追加のフィルター式。
この設定はサブクエリには適用されません。

**例**

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

指定されたテーブルから読み出した後に適用される追加のフィルタ式です。

**例**

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "INSERT 操作中の AggregateFunction 入力フォーマットを制御するための新しい設定。デフォルト値は state です"}]}]} />

INSERT 操作中の AggregateFunction 入力フォーマットを指定します。

設定可能な値:

* `state` — シリアル化された状態を含むバイナリ文字列（デフォルト）。AggregateFunction の値がバイナリデータとして与えられる従来どおりの動作です。
* `value` — 集約関数の引数が 1 つの場合はその単一値、複数の引数がある場合はそれらのタプルを受け取るフォーマットです。対応する IDataType または DataTypeTuple を用いてデシリアライズされ、その後、状態を形成するように集約されます。
* `array` — 上記の `value` オプションで説明した値の Array を受け取るフォーマットです。配列のすべての要素が集約されて状態を形成します。

**例**

次の構造を持つテーブルを想定します:

```sql
CREATE TABLE example (
    user_id UInt64,
    avg_session_length AggregateFunction(avg, UInt32)
);
```

`aggregate_function_input_format = 'value'` を設定した場合:

```sql
INSERT INTO example FORMAT CSV
123,456
```

`aggregate_function_input_format = 'array'` を指定した場合:

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

注意: `value` および `array` フォーマットは、挿入時に値を生成して集約処理を行う必要があるため、デフォルトの `state` フォーマットよりも遅くなります。


## aggregate_functions_null_for_empty \{#aggregate_functions_null_for_empty\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のすべての集約関数を書き換え、末尾に [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) サフィックスを付与するかどうかを制御します。SQL 標準との互換性のために有効化します。
分散クエリで一貫した結果を得るために、[count&#95;distinct&#95;implementation](#count_distinct_implementation) 設定と同様に、クエリの書き換えによって実装されています。

指定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

次のような集約関数を含むクエリを考えてみます:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0` とした場合、次のような結果になります：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1` の場合、結果は次のとおりです。

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

主キー順での集約処理中に蓄積されるブロックの最大サイズ（バイト単位）です。ブロックサイズを小さくすると、集約処理の最終マージ段階をより高い並列度で実行できます。

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリ効率の高いモードで中間の集約結果をマージする際に使用するスレッド数。値が大きいほど多くのメモリを消費します。0 は「max_threads」と同じ値を意味します。

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\}

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーが GROUP BY キーと一致している場合に、パーティションごとに独立したスレッドで集約を行えるようにします。パーティション数がコア数に近く、各パーティションのサイズがおおよそ同程度である場合に有効です。

## allow_archive_path_syntax \{#allow_archive_path_syntax\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加。"}]}]}/>

File/S3 エンジンおよびテーブル関数では、アーカイブに正しい拡張子が付いている場合、`'::'` を含むパスを `<archive> :: <file>` として解析します。

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree テーブルからの読み取りにバックグラウンド I/O プールを使用します。この設定により、I/O がボトルネックとなっているクエリのパフォーマンスが向上する場合があります。

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ヘッジ付きリクエストにおいて、すでにある程度の進捗があった場合でも（ただし、その進捗が `receive_data_timeout` のタイムアウト期間中に更新されていない場合）、最初のデータパケットを受信するまで新しい接続を開始できます。無効の場合は、最初に進捗が発生した時点以降はレプリカの変更を行いません。

## allow_create_index_without_type \{#allow_create_index_without_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

TYPE を指定せずに CREATE INDEX クエリを実行することを許可します。クエリは発行されても無視されます。SQL 互換性テスト用の設定です。

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\}

<SettingsInfoBlock type="Bool" default_value="0" />

throwIf() 関数でカスタムエラーコードを有効にします。true の場合、スローされる例外に予期しないエラーコードが設定される可能性があります。

## allow_ddl \{#allow_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、ユーザーは DDL クエリを実行できます。

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\}

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨の Ordinary データベースエンジンを使用したデータベースの作成を許可します

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "非推奨でエラーを招きやすいウィンドウ関数 (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference) の使用を許可する"}]}]}/>

非推奨でエラーを招きやすいウィンドウ関数 (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference) の使用を許可する

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "非推奨関数 snowflakeToDateTime[64] および dateTime[64]ToSnowflake を無効化。"}]}]}/>

関数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake`、`dateTime64ToSnowflake` は非推奨であり、デフォルトでは無効になっています。
代わりに関数 `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID`、`dateTime64ToSnowflakeID` を使用してください。

非推奨関数を再度有効化する場合（例: 移行期間中など）は、この設定を `true` にします。

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨のエンジン定義構文を使用して *MergeTree テーブルを作成することを許可します

## allow_distributed_ddl \{#allow_distributed_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、ユーザーは分散 DDL クエリの実行が許可されます。

## allow_drop_detached \{#allow_drop_detached\}

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE ... DROP DETACHED PART[ITION] ... クエリを許可します

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで JOIN キーでの Dynamic 型の使用を禁止"}]}]}/>

JOIN キーで Dynamic 型を使用できるようにします。互換性のために追加された設定です。JOIN キーで Dynamic 型を使用することは推奨されません。他の型との比較を行うと予期しない結果を招く可能性があるためです。

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\}

<SettingsInfoBlock type="Bool" default_value="1" />

multiIf 関数を列指向で実行することを許可します。

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Alias エンジンを使用したテーブルの作成を許可します。

## allow_experimental_analyzer \{#allow_experimental_analyzer\}

**エイリアス**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトで analyzer と planner を有効にします。"}]}]}/>

新しいクエリアナライザを有効にします。

## allow_experimental_codecs \{#allow_experimental_codecs\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、実験的な圧縮コーデックを指定できるようになりますが、現時点ではそのようなコーデックは存在しないため、このオプションを有効にしても効果はありません。

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "相関サブクエリのサポートをBetaとしてマークします。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "相関サブクエリを実行できるようにする新しい設定を追加しました。"}]}]}/>

相関サブクエリの実行を許可します。

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\}

<BetaBadge/>

**エイリアス**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'glue' を使用する実験的な DataLakeCatalog データベースエンジンを許可"}]}]}/>

catalog_type = 'glue' を使用する実験的な DataLakeCatalog データベースエンジンを許可

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "catalog_type = 'hive' の実験的な DataLakeCatalog データベースエンジンを許可"}]}]}/>

catalog_type = 'hms' の実験的な DataLakeCatalog データベースエンジンを許可

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\}

<BetaBadge/>

**別名**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

catalog_type = 'iceberg' の実験的なデータベースエンジン DataLakeCatalog を許可します。

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Engine = MaterializedPostgreSQL(...) を使用するデータベースを作成できるようにします。

## allow_experimental_database_paimon_rest_catalog \{#allow_experimental_database_paimon_rest_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting"}]}]}/>

catalog_type = 'paimon_rest' を使用する実験的なデータベースエンジン DataLakeCatalog を有効にします

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\}

<BetaBadge/>

**別名**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可する"}]}]}/>

catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可する

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

実験的なdelta-kernel-rs実装を有効にします。

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

delta-kernel の書き込み機能を有効にします。

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

ファネル分析向けの実験的関数を有効にします。

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

実験的なハッシュ関数を有効化します

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Iceberg テーブルに対して 'OPTIMIZE' を明示的に使用できるようにします。

## allow_experimental_insert_into_iceberg \{#allow_experimental_insert_into_iceberg\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

Iceberg テーブルに対する `insert` クエリの実行を許可します。

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "true に設定され、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件が満たされている場合、LEFT または INNER ハッシュ JOIN のパフォーマンスを向上させるために、右テーブルをキーで再ソートします"}]}]}/>

true に設定され、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件が満たされている場合、LEFT または INNER ハッシュ JOIN のパフォーマンスを向上させるために、右テーブルをキーで再ソートします。

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "ClickHouse Keeper にコミット済みオフセットを保存する実験的な Kafka ストレージエンジンの利用を許可"}]}]}/>

Kafka 関連オフセットを ClickHouse Keeper に保存する実験的機能を有効にします。有効化すると、Kafka テーブルエンジンに対して ClickHouse Keeper のパスとレプリカ名を指定できます。その結果、通常の Kafka エンジンではなく、コミット済みオフセットを主として ClickHouse Keeper に保存する新しいタイプのストレージエンジンが使用されます。

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Kusto Query Language (KQL) を有効にします。SQL の代替となるクエリ言語です。

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

MaterializedPostgreSQL テーブルエンジンの使用を許可します。この機能は実験的機能のため、デフォルトでは無効になっています。

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

自然言語処理向けの実験的関数を有効にします。

## allow_experimental_object_storage_queue_hive_partitioning \{#allow_experimental_object_storage_queue_hive_partitioning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting."}]}]}/>

S3Queue/AzureQueue エンジンで Hive パーティショニングを使用できるようにします

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\}

**別名**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

SELECT クエリ実行時に、各分片から読み取りに使用するレプリカの数として最大 `max_parallel_replicas` まで使用します。読み取りは並列化され、動的に調整されます。0 - 無効、1 - 有効（失敗時には例外を投げずに暗黙的に無効化）、2 - 有効（失敗時には例外をスロー）

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

SQL の代替言語である PRQL を有効にします。

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

パートのUUIDに基づいてSELECTクエリのデータを重複排除するための実験的機能

## allow_experimental_statistics \{#allow_experimental_statistics\}

<ExperimentalBadge/>

**エイリアス**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "設定名が変更されました。以前の名前は `allow_experimental_statistic` です。"}]}]}/>

[statistics](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) を定義したカラムを作成し、[statistics を操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)できるようにします。

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\}

<ExperimentalBadge/>

**別名**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "実験的な timeSeries* 集約関数を有効にする新しい設定。"}]}]}/>

Prometheus ライクな時系列データの再サンプリングや rate・delta 計算のための、実験的な timeSeries* 集約関数。

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "TimeSeries テーブルエンジンを許可する新しい設定を追加"}]}]}/>

[TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを使用するテーブルの作成を許可します。取りうる値は次のとおりです:

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは無効です。
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは有効です。

## allow_experimental_window_view \{#allow_experimental_window_view\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

WINDOW VIEW を有効にします。まだ十分に安定していません。

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

YTsaurus と統合するための実験的な Dictionary ソースです。

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

YTsaurus との統合用の実験的なテーブルエンジンです。

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

YTsaurus との統合向けの実験的なテーブルエンジンです。

## allow_general_join_planning \{#allow_general_join_planning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを使用できるようにします。"}]}]}/>

より複雑な結合条件にも対応可能な、より汎用的な結合計画アルゴリズムを有効にしますが、ハッシュ結合でのみ動作します。ハッシュ結合が有効になっていない場合は、この設定値に関係なく、通常の結合計画アルゴリズムが使用されます。

## allow_get_client_http_header \{#allow_get_client_http_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新しい関数を導入しました。"}]}]}/>

現在の HTTP リクエストのヘッダー値を取得できる関数 `getClientHTTPHeader` の使用を許可するかどうかを制御します。`Cookie` のように機微な情報を含む可能性のあるヘッダーが存在するため、セキュリティ上の理由からデフォルトでは有効化されていません。`X-ClickHouse-*` および `Authentication` ヘッダーは常に制限されており、この関数を使って取得することはできない点に注意してください。

## allow_hyperscan \{#allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを使用する関数の利用を許可します。コンパイル時間が長くなったり、リソース使用量が過剰になったりする可能性を避ける場合は無効にします。

## allow_introspection_functions \{#allow_introspection_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリプロファイリング用に、[introspection functions](../../sql-reference/functions/introspection.md) を有効または無効にします。

取りうる値:

- 1 — introspection functions を有効にする。
- 0 — introspection functions を無効にする。

**関連項目**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- システムテーブル [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "存在しないカラムまたはテーブルを参照する MV の作成を許可しない"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "CREATE MATERIALIZED VIEW に対する、より厳密な検証をサポート（ただしまだ有効化はしない）"}]}]}/>

存在しないテーブルまたはカラムを参照する SELECT クエリを伴う CREATE MATERIALIZED VIEW を許可します。クエリは構文上は有効である必要があります。リフレッシュ可能な MV には適用されません。MV のスキーマを SELECT クエリから推論する必要がある場合（すなわち CREATE にカラムリストも TO テーブルもない場合）には適用されません。元となるテーブルより先に MV を作成するために使用できます。

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きコレクションのフィールドを、デフォルトで上書きできるようにします。

## allow_non_metadata_alters \{#allow_non_metadata_alters\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルのメタデータだけでなく、ディスク上のデータにも影響する ALTER クエリの実行を許可します

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() のような一部の時間関連関数で、非定数タイムゾーン引数を許可します。"}]}]}/>

toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() のような一部の時間関連関数で、非定数タイムゾーン引数を許可します。
この設定は後方互換性の維持のみを目的として存在します。ClickHouse では、タイムゾーンはデータ型、ひいてはカラムのプロパティです。
この設定を有効化すると、1 つのカラム内の値ごとに異なるタイムゾーンを持てるという誤った印象を与えます。
したがって、この設定は有効にしないでください。

## allow_nondeterministic_mutations \{#allow_nondeterministic_mutations\}

<SettingsInfoBlock type="Bool" default_value="0" />

`dictGet` のような非決定的関数を、レプリケーテッドテーブル上のミューテーションで使用できるようにするユーザーレベルの設定です。

たとえばディクショナリはノード間で同期されていない可能性があるため、そこから値を取得するミューテーションは、デフォルトではレプリケーテッドテーブル上で許可されていません。この設定を有効にするとそのような動作が許可され、使用するデータがすべてのノード間で同期していることを保証する責任はユーザーに委ねられます。

**例**

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

シャーディングキーで、非決定的な関数（`rand` や `dictGet`。後者には更新時にいくつか注意点があります）の使用を許可します。

設定可能な値:

- 0 — 許可しない。
- 1 — 許可する。

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\}

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツがローカルファイルシステム上にある場合、prefetched threadpool の利用を優先する

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\}

<SettingsInfoBlock type="Bool" default_value="1" />

すべてのパーツがリモートファイルシステム上に存在する場合、prefetched threadpool を優先的に使用します

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定"}]}]}/>

analyzer が有効な分散サブクエリに対して、AST レベルでの述語プッシュダウンを許可します

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\}

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに WITH 句が含まれている場合に述語のプッシュダウンを許可します

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

WHERE から PREWHERE へ条件を移動する際、フィルタリングを最適化するために条件の順序を並べ替えることを許可します

## allow_settings_after_format_in_insert \{#allow_settings_after_format_in_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "INSERT クエリにおいて FORMAT の後に SETTINGS を許可しません。これは、ClickHouse が SETTINGS の一部を値として解釈してしまい、紛らわしいためです。"}]}]} />

`INSERT` クエリで `FORMAT` の後に `SETTINGS` を許可するかどうかを制御します。この設定の使用は推奨されません。`SETTINGS` の一部が値として解釈されてしまう可能性があるためです。

例:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

しかし、次のクエリは `allow_settings_after_format_in_insert` 設定が有効になっている場合にのみ実行できます。

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

取りうる値:

* 0 — 無効。
* 1 — 有効。

:::note
古い構文に依存するユースケースがある場合に限り、後方互換性のためにこの設定を使用してください。
:::


## allow_simdjson \{#allow_simdjson\}

<SettingsInfoBlock type="Bool" default_value="1" />

AVX2 命令が利用可能な場合に、「JSON*」関数で simdjson ライブラリの使用を許可します。無効な場合は rapidjson が使用されます。

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "一部の出力フォーマットで、スパースや Replicated のような特殊なカラム表現を直接出力できるようにする"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "スパースや Replicated のような特殊なカラム表現を、完全なカラムに変換せずに出力することを許可するための設定を追加"}]}]}/>

スパースや Replicated などの特殊なシリアライゼーション種別を持つカラムを、完全なカラム表現に変換することなく出力できるようにします。
これにより、フォーマット処理時の不要なデータコピーを回避するのに役立ちます。

## allow_statistics_optimize \{#allow_statistics_optimize\}

<BetaBadge/>

**別名**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "この最適化をデフォルトで有効にします。"}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "この設定の名前が変更されました。以前の名前は `allow_statistic_optimize` です。"}]}]}/>

クエリの最適化に統計情報を使用できるようにします。

## allow_suspicious_codecs \{#allow_suspicious_codecs\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "無意味な圧縮コーデックの指定を許可しない"}]}]}/>

`true` に設定すると、無意味な圧縮コーデックを指定できるようになります。

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE TABLE ステートメントでは、FixedString(n) 型で n > 256 のカラムを作成することを許可します。長さ >= 256 の FixedString は疑わしい値と見なされるため、多くの場合は誤った使い方を示しています。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "true の場合、同一の式を持つ索引を定義できます"}]}]}/>

同一の式を持つ primary/secondary 索引およびソートキーを拒否します

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

サイズが 8 バイト以下に固定されているデータ型（数値型および `FixedString(8_bytes_or_less)`）で [LowCardinality](../../sql-reference/data-types/lowcardinality.md) を使用することを許可または禁止します。

小さい固定長の値に対して `LowCardinality` を使用すると、通常は非効率的です。これは、ClickHouse が各行に対して数値の索引を保存するためです。その結果として:

- ディスク使用量が増加する可能性があります。
- Dictionary のサイズによっては、RAM 消費量が多くなる可能性があります。
- 追加の符号化/復号処理が必要になるため、一部の関数が遅くなる可能性があります。

上記のすべての理由により、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルにおけるマージ時間が長くなる場合があります。

設定可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用が制限されます。

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "MergeTree に対する疑わしい PRIMARY KEY/ORDER BY（例: SimpleAggregateFunction）を禁止"}]}]}/>

MergeTree に対する疑わしい `PRIMARY KEY`/`ORDER BY`（例: SimpleAggregateFunction）を許可します。

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "これは新しい設定であり、以前のバージョンではこの設定を有効にした場合と同等の動作でした。"}]}]}/>

テーブルのどのカラムにも依存しない有効期限 (TTL) 式を拒否します。これは多くの場合、ユーザーの誤りを示します。

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトで GROUP BY での Variant/Dynamic 型の使用を許可しない"}]}]}/>

[Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を GROUP BY のキーとして使用することを許可または制限します。

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトで Variant/Dynamic 型の ORDER BY での利用を禁止"}]}]}/>

[Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を ORDER BY キーとして使用することを許可または禁止します。

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "デフォルトでは疑わしいバリアント型を含む Variant 型の作成を許可しない"}]}]}/>

CREATE TABLE 文で、類似したバリアント型（たとえば、異なる数値型や日付型）を含む Variant 型を指定できるようにします。この設定を有効にすると、類似した型同士の値を扱う際にあいまいさが生じる可能性があります。

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\}

<SettingsInfoBlock type="Bool" default_value="0" />

system.zookeeper テーブルからのパス条件なしの無制限な読み取りを許可します。便利な場合もありますが、ZooKeeper にとって安全ではありません。

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\}

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE MOVE ... TO [DISK|VOLUME] を非同期で実行します

## alter_partition_verbose_result \{#alter_partition_verbose_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションおよびパーツに対して行われる操作のうち、正常に適用されたものに関するパーツ情報の表示を有効または無効にします。
[ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) および [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) に適用されます。

取り得る値:

* 0 — 冗長出力を無効にする。
* 1 — 冗長出力を有効にする。

**例**

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

**別名**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

[ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md)、[TRUNCATE](../../sql-reference/statements/truncate.md) クエリによりレプリカ上での操作が実行されるまで待機するかどうかを設定します。

設定可能な値:

- `0` — 待機しない。
- `1` — 自身での実行が完了するまで待機する。
- `2` — すべてのレプリカでの実行が完了するまで待機する。

Cloud でのデフォルト値: `1`。

:::note
`alter_sync` は `Replicated` テーブルにのみ適用され、`Replicated` ではないテーブルに対する ALTER には何も影響しません。
:::

## alter_update_mode \{#alter_update_mode\}

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "新しい設定"}]}]}/>

`UPDATE` コマンドを含む `ALTER` クエリのモード。

指定可能な値:

- `heavy` - 通常の mutation を実行します。
- `lightweight` - 可能であれば論理更新を実行し、不可能な場合は通常の mutation を実行します。
- `lightweight_force` - 可能であれば論理更新を実行し、不可能な場合は例外をスローします。

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルの索引に空間充填曲線がある場合（例: `ORDER BY mortonEncode(x, y)` や `ORDER BY hilbertEncode(x, y)`）で、クエリにその引数に対する条件（例: `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`）が含まれているときは、索引の解析に空間充填曲線を使用します。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

Nested 型に複合識別子を追加できるようにします。クエリ結果が変わる可能性があるため、互換性のための設定です。無効にすると、`SELECT a.b.c FROM table ARRAY JOIN a` は動作せず、`SELECT a FROM table` の結果にある `Nested a` に `a.b.c` カラムは含まれません。

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "JOIN USING で使用される識別子の解決を projection から行うよう強制"}]}]}/>

JOIN USING で使用される識別子の解決を projection から行うよう強制します（例えば `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` の場合、結合は `t1.b = t2.b` ではなく `t1.a + 1 = t2.b` によって実行されます）。

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "不整合を避けるため、デフォルトで ANY RIGHT および ANY FULL JOIN を無効化"}]}]}/>

`ANY INNER|LEFT JOIN` 演算において、レガシーな ClickHouse サーバーの動作を有効にします。

:::note
レガシーな `JOIN` の動作に依存するユースケースがある場合にのみ、後方互換性のためにこの設定を使用してください。
:::

レガシー動作が有効な場合:

- ClickHouse が左テーブルから右テーブルへの多対一のキーのマッピングロジックを使用するため、`t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくありません。
- `ANY INNER JOIN` の結果には、`SEMI LEFT JOIN` と同様に、左テーブルからのすべての行が含まれます。

レガシー動作が無効な場合:

- ClickHouse が `ANY RIGHT JOIN` 演算で一対多のキーのマッピングを行うロジックを使用するため、`t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくなります。
- `ANY INNER JOIN` の結果には、左テーブルおよび右テーブル双方から、各キーにつき 1 行のみが含まれます。

設定可能な値:

- 0 — レガシー動作を無効にします。
- 1 — レガシー動作を有効にします。

関連項目:

- [JOIN の厳密性](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\}

<SettingsInfoBlock type="Bool" default_value="1" />

論理削除された行を結果から除外するかどうかを制御します。無効にすると、クエリでそれらの行も読み取ることができます。デバッグや「削除取り消し」のシナリオで有用です。

## apply_mutations_on_fly \{#apply_mutations_on_fly\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、データパーツにまだマテリアライズされていない mutations（UPDATE と DELETE）は、SELECT 実行時に適用されます。

## apply_patch_parts \{#apply_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、論理更新を表すパッチパーツが SELECT の際に適用されます。

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Join モードでパッチパーツを適用する際に使用する一時キャッシュのバケット数。

## apply_prewhere_after_final \{#apply_prewhere_after_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定。有効にすると、PREWHERE 条件は FINAL 処理の後に適用されます。"}]}]}/>

この設定を有効にすると、ReplacingMergeTree および類似のエンジンに対して、PREWHERE 条件は FINAL 処理の後に適用されます。
これは、PREWHERE が重複した行にまたがって値が異なり得るカラムを参照しており、
フィルタリングの前に FINAL によって「勝ち」行を選択したい場合に有用です。無効の場合、PREWHERE は読み取り中に適用されます。
注意: apply_row_level_security_after_final が有効で、ROW POLICY がソートキー以外のカラムを使用している場合、
正しい実行順序を維持するために PREWHERE も遅延されます（ROW POLICY は PREWHERE より先に適用される必要があります）。

## apply_row_policy_after_final \{#apply_row_policy_after_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定で、*MergeTree テーブルに対して ROW POLICY と PREWHERE を FINAL 処理の後に適用するかどうかを制御します。"}]}]}/>

有効にすると、*MergeTree テーブルに対して ROW POLICY と PREWHERE が FINAL 処理の後に適用されます（特に ReplacingMergeTree の場合に有用です）。
無効にすると、ROW POLICY は FINAL の前に適用されます。この場合、ReplacingMergeTree などのエンジンで重複排除に使われるべき行を
ROW POLICY がフィルタリングしてしまうと、結果が異なる可能性があります。

ROW POLICY の式が ORDER BY 内のカラムのみに依存している場合、最適化のため、それでも FINAL より前に適用されます。
このようなフィルタリングは重複排除の結果に影響を与えないためです。

設定可能な値:

- 0 — ROW POLICY と PREWHERE が FINAL の前に適用されます（デフォルト）。
- 1 — ROW POLICY と PREWHERE が FINAL の後に適用されます。

## apply_settings_from_server \{#apply_settings_from_server\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Client-side code (e.g. INSERT input parsing and query output formatting) will use the same settings as the server, including settings from server config."}]}]}/>

クライアントがサーバーから送られてくる設定を受け入れるかどうか。

これはクライアント側で実行される処理のみに影響します。具体的には、`INSERT` の入力データのパースと、クエリ結果の整形に影響します。クエリ実行の大部分はサーバー上で行われ、この設定の影響は受けません。

通常、この設定はユーザープロファイル（`users.xml` や `ALTER USER` のようなクエリ）で行うべきであり、クライアント（クライアントのコマンドライン引数、`SET` クエリ、`SELECT` クエリの `SETTINGS` セクション）経由で行うべきではありません。クライアント経由では false へ変更することはできますが、true へ変更することはできません（ユーザープロファイルで `apply_settings_from_server = false` の場合、サーバーは設定を送信しないためです）。

当初（24.12）にはサーバー側の設定（`send_settings_to_client`）が存在していましたが、その後、利便性向上のために、このクライアント側の設定に置き換えられました。

## archive_adaptive_buffer_max_size_bytes \{#archive_adaptive_buffer_max_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="8388608" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "8388608"},{"label": "New setting"}]}]}/>

アーカイブファイル（例えば tar アーカイブ）への書き込み時に使用されるアダプティブバッファの最大サイズを制限します。

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\}

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新しい設定です。Arrow Flight リクエストで使用するディスクリプタの種類: 'path' または 'command'。Dremio では 'command' が必要です。"}]}]}/>

Arrow Flight リクエストで使用するディスクリプタの種類。'path' はデータセット名を path ディスクリプタとして送信します。'command' は SQL クエリを command ディスクリプタとして送信します（Dremio では必須）。

指定可能な値:

- 'path' — FlightDescriptor::Path を使用（デフォルト。ほとんどの Arrow Flight サーバーで動作）
- 'command' — SELECT クエリとともに FlightDescriptor::Command を使用（Dremio では必須）

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）に [ALIAS](../../sql-reference/statements/create/table.md/#alias) カラムを含めます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）で [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) カラムを含めるかどうかを制御します。

指定可能な値:

- 0 - 無効
- 1 - 有効

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリのデータはキューに格納され、後でバックグラウンドでテーブルにフラッシュされます。wait_for_async_insert が false の場合、INSERT クエリはほぼ即座に処理されます。true の場合、クライアントはデータがテーブルにフラッシュされるまで待機します。

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期挿入タイムアウトを減少させる際の指数的な減少率"}]}]}/>

適応型非同期挿入タイムアウトを減少させる際の指数的な減少率

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "アダプティブな非同期 INSERT のタイムアウト値が増加する際の指数的な増加率"}]}]}/>

アダプティブな非同期 INSERT のタイムアウト値が増加する際の指数的な増加率

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\}

**別名**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "非同期挿入タイムアウトの最小値（ミリ秒単位）。async_insert_busy_timeout_ms は async_insert_busy_timeout_max_ms の別名です。"}]}]}/>

最初のデータが現れてから、クエリごとに収集されたデータをフラッシュするまでに待機する最大時間。

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "非同期挿入のタイムアウトの最小値（ミリ秒単位）。アダプティブアルゴリズムによって後から増加する可能性のある初期値としても機能します。"}]}]}/>

async_insert_use_adaptive_busy_timeout によって自動調整が有効化されている場合、最初のデータが現れてから、そのクエリで収集されたデータを書き出すまでに待機する最小時間を表します。また、アダプティブアルゴリズムの初期値としても機能します。

## async_insert_deduplicate \{#async_insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッドテーブルに対する非同期 INSERT クエリにおいて、挿入ブロックの重複排除を行うかどうかを指定します。

## async_insert_max_data_size \{#async_insert_max_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "以前の値は小さすぎると判断されました。"}]}]}/>

クエリごとに、挿入前に収集される未解析データの最大サイズ（バイト単位）

## async_insert_max_query_number \{#async_insert_max_query_number\}

<SettingsInfoBlock type="UInt64" default_value="450" />

実際に挿入処理が行われるまでに許可される INSERT クエリの最大数。
設定 [`async_insert_deduplicate`](#async_insert_deduplicate) が 1 の場合にのみ有効です。

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "非同期挿入キューからデータをポーリングする際のタイムアウト（ミリ秒）"}]}]}/>

非同期挿入キューからデータをポーリングする際のタイムアウト

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "適応型非同期挿入タイムアウトを使用"}]}]}/>

true に設定すると、非同期挿入に対して適応型ビジータイムアウトを使用します

## async_query_sending_for_remote \{#async_query_sending_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "分片間で非同期に接続を確立してクエリを送信"}]}]}/>

リモートクエリの実行時に、接続の確立とクエリ送信を非同期で行えるようにします。

この設定はデフォルトで有効です。

## async_socket_for_remote \{#async_socket_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "すべての問題を修正し、リモートクエリに対するソケットからの非同期読み取りを再びデフォルトで有効にしました"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "いくつかの問題により、リモートクエリに対するソケットからの非同期読み取りを無効にしました"}]}]}/>

リモートクエリを実行する際に、ソケットからの非同期読み取りを有効にします。

デフォルトで有効になっています。

## automatic_parallel_replicas_min_bytes_per_replica \{#automatic_parallel_replicas_min_bytes_per_replica\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

`automatic_parallel_replicas_mode`=1 の場合に、parallel replicas を自動的に有効化するための、レプリカごとの読み取りバイト数のしきい値です。0 を指定すると、しきい値はありません。

## automatic_parallel_replicas_mode \{#automatic_parallel_replicas_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

収集された統計に基づいて、並列レプリカでの実行への自動切り替えを有効にします。`parallel_replicas_local_plan` を有効化し、`cluster_for_parallel_replicas` を指定する必要があります。
0 - 無効、1 - 有効、2 - 統計の収集のみを有効化（並列レプリカでの実行への切り替えは行わない）。

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Azure のマルチパートアップロードで複数スレッドを使用します。"}]}]}/>

Azure のマルチパートアップロードで複数スレッドを使用します。

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "アップロードが成功したことを確認するため、Azure Blob Storage にアップロードされた各オブジェクトをチェックします"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "アップロードが成功したことを確認するため、Azure Blob Storage にアップロードされた各オブジェクトをチェックします"}]}]}/>

アップロードが成功したことを確認するため、Azure Blob Storage にアップロードされた各オブジェクトをチェックします

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

Azure ディスクのホストへの接続タイムアウト時間。

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

Azure エンジンのテーブルへの各 INSERT ごとに新しいファイルを作成するかどうかを制御します

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、AzureBlobStorage テーブルエンジンが例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際に、ファイルが存在しない場合はそのファイルを無視します。

可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## azure_list_object_keys_size \{#azure_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストでバッチとして一度に返される可能性があるファイル数の最大値

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure におけるマルチパートアップロード時の最大ブロック数。"}]}]}/>

Azure におけるマルチパートアップロード時の最大ブロック数。

## azure_max_get_burst \{#azure_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト数の制限に達する前に、同時に発行できるリクエストの最大数です。デフォルト値が 0 の場合は、`azure_max_get_rps` と同じになります。

## azure_max_get_rps \{#azure_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新規設定"}]}]}/>

スロットリングが行われる前の、Azure の GET リクエスト毎秒あたりの上限。0 の場合は無制限。

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "マルチパートアップロードリクエスト内で同時にアップロードされるパーツの最大数。0 を指定すると無制限。"}]}]}/>

マルチパートアップロードリクエスト内で同時にアップロードされるパーツの最大数。0 を指定すると無制限。

## azure_max_put_burst \{#azure_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト数の上限に達する前に、同時に送信できる最大リクエスト数です。デフォルト値 0 の場合は `azure_max_put_rps` と同じ値になります。

## azure_max_put_rps \{#azure_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが発生する前の 1 秒あたりの Azure PUT リクエスト数の上限。0 の場合は無制限です。

## azure_max_redirects \{#azure_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Azure リダイレクトで許可されるホップ数の上限。

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Azure Blob Storage への single part copy でコピーできるオブジェクトの最大サイズ。"}]}]}/>

Azure Blob Storage への single part copy でコピーできるオブジェクトの最大サイズ。

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Align with S3"}]}]}/>

単一パートアップロードで Azure Blob Storage にアップロードするオブジェクトの最大サイズです。

## azure_max_single_read_retries \{#azure_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の Azure Blob Storage 読み取り処理に対して行う最大リトライ回数。

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Azure Blob Storage への書き込み時に予期しないエラーが発生した場合の最大リトライ回数"}]}]}/>

Azure Blob Storage への書き込み時に予期しないエラーが発生した場合の最大リトライ回数

## azure_max_upload_part_size \{#azure_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Azure Blob Storage へのマルチパートアップロード時に使用される各パートの最大サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時に使用される各パートの最大サイズ。

## azure_min_upload_part_size \{#azure_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Azure Blob Storage へのマルチパートアップロードで使用されるパートの最小サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロードで使用されるパートの最小サイズ。

## azure_request_timeout_ms \{#azure_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Azure とのデータ送受信におけるアイドル状態のタイムアウト。単一の TCP 読み取りまたは書き込み呼び出しがこの時間だけブロックされた場合、失敗と見なされる。

## azure_sdk_max_retries \{#azure_sdk_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK における最大再試行回数"}]}]}/>

Azure SDK における最大再試行回数

## azure_sdk_retry_initial_backoff_ms \{#azure_sdk_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK の再試行間の最小バックオフ時間"}]}]}/>

Azure SDK の再試行間の最小バックオフ時間

## azure_sdk_retry_max_backoff_ms \{#azure_sdk_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK の再試行間の最大バックオフ時間"}]}]}/>

Azure SDK の再試行間の最大バックオフ時間

## azure_skip_empty_files \{#azure_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Azure テーブルエンジンで空ファイルをスキップできるようにする"}]}]}/>

S3 エンジンで空ファイルをスキップするかどうかを制御します。

Possible values:

- 0 — 空ファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "ListObjects リクエストが AzureBlobStorage エンジンでいずれのファイルにも一致しない場合に、空のクエリ結果を返すのではなくエラーをスローできるようにする"}]}]}/>

glob 展開ルールに従って一致したファイルが 0 件の場合にエラーをスローします。

設定可能な値:

- 1 — `SELECT` は例外をスローします。
- 0 — `SELECT` は空の結果を返します。

## azure_truncate_on_insert \{#azure_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

azure エンジンテーブルへの insert 前にテーブルを truncate するかどうかを制御します。

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "1回の書き込みで Azure Blob Storage に azure_multiply_parts_count_threshold 個のパーツがアップロードされるごとに、azure_min_upload_part_size にこの係数を掛けます。"}]}]}/>

1回の書き込みで Azure Blob Storage に azure_multiply_parts_count_threshold 個のパーツがアップロードされるごとに、azure_min_upload_part_size にこの係数を掛けます。

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size の値は azure_upload_part_size_multiply_factor 倍になります。"}]}]}/>

この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size の値は azure_upload_part_size_multiply_factor 倍になります。

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、すべての Azure リクエストについて、最初の 2 回の試行は送信および受信タイムアウトを短くして実行されます。
`false` に設定すると、すべての試行で同一のタイムアウトが使用されます。

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

バックアップまたはリストア時に [Zoo]Keeper へ送信されるマルチリクエストのバッチサイズの上限

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

バックアップまたはリストア処理中に [Zoo]Keeper に対して送信される multiread リクエストのバッチの最大サイズ

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の実行中に、あるホストがこの時間のあいだ ZooKeeper 内の一時的な 'alive' ノードを再作成できない場合、そのバックアップまたはリストア全体は失敗と見なされます。
この値は、障害発生後にホストが ZooKeeper に再接続するまでにかかる、あらゆる妥当な時間よりも長く設定する必要があります。
ゼロを指定すると無制限になります。

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\}

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "新しい設定。"}]}]}/>

イニシエーターが、他のホストが `error` ノードに反応して、現在の BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作での処理を停止するまで待機する必要がある時間。

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

バックアップまたはリストアの実行中における Keeper リクエストが失敗するおおよその確率です。指定可能な値は [0.0f, 1.0f] の範囲です。

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - ランダムなシード値。それ以外の場合はこの設定値がシードとして使用されます

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "BACKUP または RESTORE 操作の途中で一時的な [Zoo]Keeper 障害が発生しても、全体の操作が失敗しないように十分大きな値にする必要があります。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "BACKUP または RESTORE 操作の途中で一時的な [Zoo]Keeper 障害が発生しても、全体の操作が失敗しないように十分大きな値にする必要があります。"}]}]}/>

BACKUP または RESTORE 操作の途中で実行される [Zoo]Keeper 操作の最大再試行回数。
一時的な [Zoo]Keeper 障害によって全体の操作が失敗しないよう、十分大きな値にする必要があります。

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新しい設定。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作のエラー処理中に実行される [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新しい設定です。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新しい設定です。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 処理の初期化中に実行される [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対する初回バックオフのタイムアウト時間

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対するバックオフの最大待機時間

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックアップ時における [Zoo]Keeper ノード1つあたりのデータの最大サイズ

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Aws::Client::RetryStrategy の設定です。Aws::Client は自動的にリトライを行い、0 はリトライしないことを意味します。バックアップ/リストア時にのみ有効です。"}]}]}/>

Aws::Client::RetryStrategy の設定です。Aws::Client は自動的にリトライを行い、0 はリトライしないことを意味します。バックアップ/リストア時にのみ有効です。

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

バックアップおよびリストア時に、最初の再試行を行う前に待機する初期バックオフ時間（ミリ秒単位）。その後の各再試行では、`backup_restore_s3_retry_max_backoff_ms` で指定された最大値に達するまで、待機時間が指数関数的に増加します。

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\}

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "新しい設定"}]}]}/>

バックアップおよびリストア処理中に、Aws::Client::RetryStrategy におけるリトライ時のバックオフ遅延に適用されるジッタ係数です。計算されたバックオフ遅延は、[1.0, 1.0 + jitter] の範囲のランダムな係数を乗じた値となり、最大で `backup_restore_s3_retry_max_backoff_ms` までとなります。[0.0, 1.0] の範囲で指定する必要があります。

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理のリトライ間隔における最大遅延時間（ミリ秒単位）。

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで設定を無効化"}]}]}/>

`true` に設定すると、同一のバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドは、いずれか 1 つの S3 リクエストが `Slow Down` などの再試行可能な S3 エラーに遭遇した後にスローダウンされます。  
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフを処理します。

## cache_warmer_threads \{#cache_warmer_threads\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

ClickHouse Cloud でのみ有効です。[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) が有効な場合に、新しいデータパーツをファイルシステムキャッシュに先読みでダウンロードするバックグラウンドスレッドの数を指定します。0 を指定すると無効になります。

## calculate_text_stack_trace \{#calculate_text_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行中に例外が発生した場合に、テキスト形式のスタックトレースを生成します。これはデフォルトの動作です。シンボルルックアップを必要とするため、大量の誤ったクエリを実行するファジングテストでは処理が遅くなる可能性があります。通常のケースでは、このオプションを無効にしないでください。

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\}

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントがレスポンスを待たずに接続を閉じたとき、HTTP 読み取り専用クエリ（例: SELECT）をキャンセルします。

Cloud でのデフォルト値: `0`。

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "cast(value, 'IPv4') および cast(value, 'IPv6') 関数を toIPv4 および toIPv6 関数と同じ動作にする"}]}]}/>

IPv4 型への CAST 演算子、IPv6 型への CAST 演算子、toIPv4、toIPv6 関数は、変換エラー発生時に例外をスローする代わりにデフォルト値を返すようになります。

## cast_keep_nullable \{#cast_keep_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

[CAST](/sql-reference/functions/type-conversion-functions#CAST) 処理において `Nullable` データ型を保持するかどうかを制御します。

この設定が有効な場合、`CAST` 関数の引数が `Nullable` のとき、結果も `Nullable` 型に変換されます。設定が無効な場合、結果の型は常に指定された変換先の型と完全に一致します。

可能な値:

* 0 — `CAST` の結果は、指定された変換先の型と完全に一致します。
* 1 — 引数の型が `Nullable` の場合、`CAST` の結果は `Nullable(DestinationDataType)` に変換されます。

**例**

次のクエリでは、結果のデータ型が変換先のデータ型と完全に一致します。

```sql
SET cast_keep_nullable = 0;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

結果：

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Int32                                             │
└───┴───────────────────────────────────────────────────┘
```

次のクエリを実行すると、変換先のデータ型に `Nullable` 修飾が適用されます。

```sql
SET cast_keep_nullable = 1;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

結果:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Nullable(Int32)                                   │
└───┴───────────────────────────────────────────────────┘
```

**関連項目**

* [CAST](/sql-reference/functions/type-conversion-functions#CAST) 関数


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

String から DateTime へのキャスト時に、日付と時刻のテキスト表現を解析するパーサーを選択できます。

可能な値:

- `'best_effort'` — 拡張的な解析を有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` に加え、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日付および時刻形式を解析できます。例: `'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — `best_effort` とほぼ同様です（違いは [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS) を参照）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみを解析できます。例: `2019-08-20 10:18:56` または `2019-08-20`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "String をパースして Dynamic に変換できるようにする設定を追加"}]}]}/>

String から Dynamic への変換時に型推論を使用します。

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "String から Variant への CAST 時に型推論を有効・無効に切り替える新しい設定"}]}]}/>

String から Variant への変換時に型推論を行います。

## check_query_single_value_result \{#check_query_single_value_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "CHECK TABLE をより有用にするための設定変更"}]}]}/>

`MergeTree` ファミリーのエンジンに対する [CHECK TABLE](/sql-reference/statements/check-table) クエリ結果の詳細レベルを定義します。

設定可能な値:

- 0 — クエリはテーブルの各データパーツごとのチェック結果を表示します。
- 1 — クエリはテーブル全体の総合的なチェック結果を表示します。

## check_referential_table_dependencies \{#check_referential_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="0" />

DDL クエリ（DROP TABLE や RENAME など）が参照整合性の依存関係を損なわないことを検証します

## check_table_dependencies \{#check_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="1" />

DDL クエリ（DROP TABLE や RENAME など）の実行によって依存関係が破壊されないことを確認します

## checksum_on_read \{#checksum_on_read\}

<SettingsInfoBlock type="Bool" default_value="1" />

読み取り時にチェックサムを検証します。デフォルトで有効であり、本番環境では常に有効のままにしておくべきです。この設定を無効化してもメリットは期待できません。実験やベンチマークの目的でのみ使用してください。この設定は MergeTree ファミリーのテーブルにのみ適用されます。その他のテーブルエンジンや、ネットワーク経由でデータを受信する場合には、チェックサムは常に検証されます。

## cloud_mode \{#cloud_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

Cloud モード

## cloud_mode_database_engine \{#cloud_mode_database_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud で許可されるデータベースエンジン。1 - DDL を Replicated データベースを使用するように書き換える、2 - DDL を Shared データベースを使用するように書き換える。

## cloud_mode_engine \{#cloud_mode_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Cloud で許可されるエンジンファミリー。

- 0 - すべてを許可
- 1 - DDL を *ReplicatedMergeTree を使用するように書き換える
- 2 - DDL を SharedMergeTree を使用するように書き換える
- 3 - 明示的に指定されたリモートディスクがある場合を除き、DDL を SharedMergeTree を使用するように書き換える
- 4 - 3 と同じだが、さらに Distributed の代わりに Alias を使用する（Alias テーブルは Distributed テーブルの宛先テーブルを指すため、対応するローカルテーブルが使用される）

公開部分を最小限に抑えるための UInt64

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\}

現在のサーバーが属している分片のクラスタ

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、cluster functions でアーカイブを処理する際のパフォーマンスが向上します。以前のバージョンでアーカイブ付きの cluster functions を使用している場合は、25.7 以降へアップグレードする際の互換性維持およびエラー回避のため、`false` に設定してください。

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting."}]}]}/>

`bucket` 分割粒度を持つ cluster テーブル関数において、タスクの分散処理で使用されるバッチのおおよそのサイズ（バイト単位）を定義します。システムは少なくともこの値に達するまでデータを蓄積します。実際のサイズは、データの境界に合わせるためにわずかに大きくなる場合があります。

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\}

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

CLUSTER TABLE FUNCTION を実行する際に、データをタスクへどのように分割するかを制御します。

この設定は、クラスタ全体での処理の分散粒度を定義します:

- `file` — 各タスクが 1 つのファイル全体を処理します。
- `bucket` — ファイル内の内部データブロック単位でタスクが作成されます（例: Parquet の row group）。

`bucket` のようなより細かい粒度を選択すると、少数の大きなファイルを扱う場合の並列実行性を向上できます。
たとえば、1 つの Parquet ファイルに複数の row group が含まれている場合、`bucket` 粒度を有効にすると、各グループを異なるワーカーが独立して処理できるようになります。

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

ハッシュテーブルの統計情報を収集して、メモリ割り当てを最適化できるようにします

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

メモリ割り当てを最適化するために、ハッシュテーブルの統計情報の収集を有効にします。

## compatibility \{#compatibility\}

`compatibility` 設定は、設定値として指定された以前の ClickHouse バージョンのデフォルト設定を ClickHouse に適用します。

ある設定がデフォルト以外の値に変更されている場合、その設定はそのまま維持されます（`compatibility` 設定の影響を受けるのは、変更されていない設定のみです）。

この設定は、`22.3` や `22.8` のような文字列として ClickHouse のバージョン番号を受け取ります。空の値は、この設定が無効になっていることを意味します。

デフォルトでは無効です。

:::note
ClickHouse Cloud では、サービスレベルのデフォルト `compatibility` 設定は ClickHouse Cloud サポートによって設定される必要があります。設定を変更したい場合は、[ケースをオープン](https://clickhouse.cloud/support) してください。
ただし、`compatibility` 設定は、`SET compatibility = '22.3'` をセッションで実行したり、クエリで `SETTINGS compatibility = '22.3'` を使用するなど、標準的な ClickHouse の設定メカニズムを用いて、ユーザー、ロール、プロファイル、クエリ、またはセッション単位で上書きできます。
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、カラム定義内の AUTO_INCREMENT キーワードを無視し、それ以外の場合はエラーを返します。MySQL からの移行を容易にします。

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

CREATE TABLE で照合順序を無視するための互換性設定

## compatibility_s3_presigned_url_query_in_path \{#compatibility_s3_presigned_url_query_in_path\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

互換性のための設定です。有効にすると、事前署名付き URL のクエリパラメータ（例: X-Amz-*）を S3 キーに取り込み（従来の挙動）、
'?' がパス内でワイルドカードとして扱われるようになります。無効（デフォルト）の場合、事前署名付き URL のクエリパラメータは URL のクエリ部に保持され、
'?' がワイルドカードとして解釈されないようにします。

## compile_aggregate_expressions \{#compile_aggregate_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数をネイティブコードへ JIT コンパイルするかどうかを切り替えます。有効にするとパフォーマンスが向上する場合があります。

指定可能な値:

- 0 — 集約は JIT コンパイルを行わずに実行されます。
- 1 — 集約は JIT コンパイルを用いて実行されます。

**関連項目**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "JIT コンパイラを支える LLVM インフラストラクチャは十分に安定していると判断しているため、この設定をデフォルトで有効にしています。"}]}]}/>

一部のスカラー関数と演算子をネイティブコードにコンパイルします。

## compile_sort_description \{#compile_sort_description\}

<SettingsInfoBlock type="Bool" default_value="1" />

ソート条件記述をネイティブコードにコンパイルします。

## connect_timeout \{#connect_timeout\}

<SettingsInfoBlock type="Seconds" default_value="10" />

レプリカがない場合に適用される接続タイムアウト。

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

クラスタ定義で `shard` および `replica` セクションが使用されている場合に、Distributed テーブルエンジンでリモートサーバーへ接続する際のタイムアウト時間をミリ秒で指定します。
接続に失敗した場合、複数回にわたり別のレプリカへの接続が試行されます。

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "非同期接続に伴い、デフォルトのセキュア接続タイムアウトを延長"}]}]}/>

最初の正常なレプリカを選択する際の接続タイムアウト（セキュア接続用）。

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

コネクションプールが満杯のときに、コネクションを待つ時間（ミリ秒）。

設定可能な値:

- 正の整数。
- 0 — タイムアウトなし（無期限）。

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Distributed テーブルエンジンで、各レプリカごとの接続試行回数の最大値。

## convert_query_to_cnf \{#convert_query_to_cnf\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true` に設定すると、`SELECT` クエリは連言標準形 (CNF; conjunctive normal form) に変換されます。クエリを CNF 形式に書き換えることで、より高速に実行される場合があります（詳しくは、この [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749) を参照してください）。

例えば、次の `SELECT` クエリは変更されないことに注意してください（これがデフォルトの動作です）。

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

結果は次のようになります：

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

`convert_query_to_cnf` を `true` に設定して、どのように変化するか確認してみましょう：

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

`WHERE` 句は CNF に書き換えられていますが、結果セットは同一であり、ブール論理式の意味は変わっていません。

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

指定可能な値: true, false


## correlated_subqueries_default_join_kind \{#correlated_subqueries_default_join_kind\}

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "新しい設定。非相関化クエリプランにおけるデフォルトの結合種別。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "新しい設定。非相関化クエリプランにおけるデフォルトの結合種別。"}]}]}/>

非相関化クエリプランにおける結合種別を制御します。デフォルト値は `right` であり、これは非相関化プランにおいて、サブクエリの入力を右側に持つ RIGHT JOIN が含まれることを意味します。

設定可能な値:

- `left` - 非相関化処理では LEFT JOIN が生成され、入力テーブルは左側に配置されます。
- `right` - 非相関化処理では RIGHT JOIN が生成され、入力テーブルは右側に配置されます。

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "相関サブクエリのプラン最適化用の新しい設定。"}]}]}/>

CROSS JOIN を作成する代わりに、フィルター式から等価な式を推論し、それらに置き換えます。

## correlated_subqueries_use_in_memory_buffer \{#correlated_subqueries_use_in_memory_buffer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "相関サブクエリの入力に対して、デフォルトでインメモリバッファを使用します。"}]}]}/>

相関サブクエリの入力にインメモリバッファを使用して、繰り返し評価を回避します。

## count_distinct_implementation \{#count_distinct_implementation\}

<SettingsInfoBlock type="String" default_value="uniqExact" />

[COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 構文を評価する際に、どの `uniq*` 関数を使用するかを指定します。

指定可能な値:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\}

<SettingsInfoBlock type="Bool" default_value="0" />

COUNT DISTINCT を GROUP BY のサブクエリに書き換える

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting."}]}]}/>

`countMatches` 関数でパターンが長さ 0（空文字列）にマッチした時点で、カウントを停止します。

## create_if_not_exists \{#create_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "New setting."}]}]}/>

`CREATE` 文で `IF NOT EXISTS` をデフォルトで有効にします。この設定または `IF NOT EXISTS` が指定されていて、指定された名前のテーブルがすでに存在する場合、例外はスローされません。

## create_index_ignore_unique \{#create_index_ignore_unique\}

<SettingsInfoBlock type="Bool" default_value="0" />

`CREATE UNIQUE INDEX` における `UNIQUE` キーワードを無視します。SQL 互換性テストのために用意された設定です。

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

ZooKeeper にメタデータを作成した後にテーブルを作成する際に発生するフォルトインジェクションの確率

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

ORDER BY および PRIMARY KEY が指定されていない場合に、PRIMARY KEY が空の *MergeTree テーブルを作成できるようにします

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "CROSS JOIN で圧縮を行うブロックの最小サイズ。値が 0 の場合は、このしきい値を無効化することを意味します。2 つのしきい値 (行数またはバイト数) のどちらか一方に達したとき、このブロックは圧縮されます。"}]}]}/>

CROSS JOIN で圧縮を行うブロックの最小サイズ。値が 0 の場合は、このしきい値を無効化することを意味します。2 つのしきい値 (行数またはバイト数) のどちらか一方に達したとき、このブロックは圧縮されます。

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "CROSS JOIN においてブロックを圧縮するための最小行数。値が 0 の場合、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した時点で、このブロックは圧縮されます。"}]}]}/>

CROSS JOIN においてブロックを圧縮するための最小行数。値が 0 の場合、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した時点で、このブロックは圧縮されます。

## cross_to_inner_join_rewrite \{#cross_to_inner_join_rewrite\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "2"},{"label": "カンマ join を inner join に強制的に書き換え"}]}]}/>

WHERE 句に結合条件がある場合、カンマ結合 / CROSS JOIN の代わりに INNER JOIN を使用します。値: 0 - 書き換えなし、1 - 可能な場合にカンマ結合 / CROSS JOIN に適用、2 - すべてのカンマ結合を強制的に書き換え、cross - 可能な場合に CROSS JOIN を書き換え

## data_type_default_nullable \{#data_type_default_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

カラム定義で明示的な修飾子 [NULL または NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) が指定されていないデータ型を、[Nullable](/sql-reference/data-types/nullable) として扱うかどうかを制御します。

設定可能な値:

- 1 — カラム定義内のデータ型はデフォルトで `Nullable` に設定されます。
- 0 — カラム定義内のデータ型はデフォルトで `Nullable` ではない型として設定されます。

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

すべての `DROP` および `DETACH` クエリに修飾子 `SYNC` を追加します。

設定可能な値:

- 0 — クエリは遅延を伴って実行されます。
- 1 — クエリは遅延なく実行されます。

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "テーブルの UUID を明示的に指定できないようにする新しい設定を追加"}]}]}/>

0 - Replicated データベースのテーブルに対して UUID を明示的に指定することを許可しません。1 - 許可します。2 - 許可しますが、指定された UUID を無視して代わりにランダムな UUID を生成します。

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Replicated database engine に対する長時間実行される DDL クエリ（CREATE AS SELECT および POPULATE）は禁止されていました"}]}]}/>

Replicated database engine で長時間実行されるような DDL クエリ（CREATE AS SELECT および POPULATE）を許可します。DDL キュー全体が長時間ブロックされる可能性がある点に注意してください。

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated エンジンを使用するデータベースでは、Replicated テーブルのみの CREATE を許可します

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "デフォルトでは明示的な引数を許可しない"}]}]}/>

0 - Replicated データベース内の *MergeTree テーブルに対して ZooKeeper のパスおよびレプリカ名を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定されたパスは無視して代わりにデフォルトのパスを使用する。3 - 許可し、警告をログ出力しない。

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="0" />

データベースエンジンが Replicated の場合、`DETACH TABLE` を `DETACH TABLE PERMANENTLY` として実行します。

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

一部のクエリに対して同期的に待機するよう強制します（database_atomic_wait_for_drop_and_detach_synchronously、mutations_sync、alter_sync も参照）。これらの設定を有効化することは推奨されません。

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

初期 DDL クエリが、Replicated データベースがそれ以前の DDL キューのエントリを処理するのを待つ時間（秒）を設定します。

設定可能な値:

- 正の整数。
- 0 — 無制限。

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\}

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

Shared データベース内で、ドロップされたテーブルが実際に削除されるまでの遅延時間（秒）。この時間内であれば、`UNDROP TABLE` ステートメントを使用してテーブルを復元できます。

## decimal_check_overflow \{#decimal_check_overflow\}

<SettingsInfoBlock type="Bool" default_value="1" />

Decimal 型の算術演算および比較演算におけるオーバーフローを検出する

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated\* テーブルからデータを受け取る materialized view に対する重複排除チェックを有効または無効にします。

設定可能な値:

0 — 無効。
      1 — 有効。

有効にした場合、ClickHouse は Replicated\* テーブルに依存する materialized view 内のブロックの重複排除を実行します。
この設定は、障害によって挿入操作がリトライされているときに、materialized view に重複データが含まれないようにするのに役立ちます。

**関連項目**

- [IN 演算子における NULL の処理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## deduplicate_insert_select \{#deduplicate_insert_select\}

<SettingsInfoBlock type="DeduplicateInsertSelectMode" default_value="enable_when_possible" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "enable_when_possible"},{"label": "deduplicate_insert_select のデフォルト動作を ENABLE_WHEN_PROSSIBLE に変更"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "enable_even_for_bad_queries"},{"label": "新しい設定。insert_select_deduplicate を置き換えます。"}]}]}/>

`INSERT SELECT`（Replicated\* テーブル向け）のブロック単位の重複排除を有効または無効にします。
この設定は、`INSERT SELECT` クエリに対して `insert_deduplicate` を上書きします。
この設定には次の 3 つの値を指定できます:

- disable — `INSERT SELECT` クエリに対して重複排除を無効にします。
- force_enable — `INSERT SELECT` クエリに対して重複排除を有効にします。SELECT の結果が安定していない場合は例外がスローされます。
- enable_when_possible — `insert_deduplicate` が有効で、かつ SELECT の結果が安定している場合に重複排除を有効にし、それ以外の場合は無効にします。
- enable_even_for_bad_queries - `insert_deduplicate` が有効な場合に重複排除を有効にします。SELECT の結果が安定していない場合は警告がログに記録されますが、クエリは重複排除ありで実行されます。このオプションは後方互換性のためのものです。予期しない結果を招く可能性があるため、代わりに他のオプションの利用を検討してください。

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "materialized view を作成する際の SQL SECURITY オプションのデフォルト値を設定します"}]}]}/>

materialized view を作成する際の SQL SECURITY オプションのデフォルト値を設定します。 [SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `DEFINER` です。

## default_max_bytes_in_join \{#default_max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

`max_bytes_in_join` が設定されておらず、制限が必要な場合の右側テーブルの最大サイズ。

## default_normal_view_sql_security \{#default_normal_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "Allows to set default `SQL SECURITY` option while creating a normal view"}]}]}/>

通常ビューを作成する際の `SQL SECURITY` オプションのデフォルト値を設定します。[`SQL SECURITY` の詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `INVOKER` です。

## default_table_engine \{#default_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "Set default table engine to MergeTree for better usability"}]}]} />

`CREATE` ステートメントで `ENGINE` が設定されていない場合に使用されるデフォルトのテーブルエンジンです。

指定可能な値:

* 任意の有効なテーブルエンジン名を表す文字列

Cloud におけるデフォルト値: `SharedMergeTree`。

**例**

クエリ:

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

結果：

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

この例では、`Engine` を指定しない新しいテーブルは自動的に `Log` テーブルエンジンを使用します。

クエリ:

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

結果:

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

一時テーブルに対してのみ適用される点を除き、[default&#95;table&#95;engine](#default_table_engine) と同じです。

この例では、`Engine` を指定しない新しい一時テーブルはすべて `Log` テーブルエンジンを使用します。

クエリ:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

結果：

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "`VIEW` 作成時に `DEFINER` オプションのデフォルト値を設定できる"}]}]}/>

`VIEW` 作成時に、`DEFINER` オプションのデフォルト値を設定できるようにします。 [SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `CURRENT_USER` です。

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

delta-kernel における内部データのプルーニングを有効にします。

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

DeltaLake の expression visitor のテストレベルのログを有効にします。これらのログは、テスト用のログとしても冗長になりすぎる場合があります。

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定です。"}]}]}/>

Delta Lake で挿入される 1 つのデータファイルのバイト数の上限を指定します。

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新しい設定。"}]}]}/>

Delta Lake で 1 つのデータファイルを挿入する際の行数上限を定義します。

## delta_lake_log_metadata \{#delta_lake_log_metadata\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Delta Lake のメタデータファイルを system テーブルにログとして記録できるようにします。

## delta_lake_snapshot_end_version \{#delta_lake_snapshot_end_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "New setting."}]}]}/>

読み取る delta lake スナップショットの終了バージョン。値 -1 を指定すると最新バージョンを読み取ります（値 0 も有効なスナップショットバージョンです）。

## delta_lake_snapshot_start_version \{#delta_lake_snapshot_start_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "New setting."}]}]}/>

読み取る Delta Lake スナップショットの開始バージョンです。値が -1 の場合は最新バージョンを読み取ります（値 0 も有効なスナップショットバージョンです）。

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "New setting"}]}]}/>

読み込む Delta Lake スナップショットのバージョン。値 -1 の場合は最新バージョンを読み込みます（値 0 も有効なスナップショットバージョンです）。

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

delta-kernel でスキャン述語を解析する際にエラーが発生した場合に、例外をスローするかどうかを制御します。

## describe_compact_output \{#describe_compact_output\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、DESCRIBE クエリの結果にはカラム名と型だけが含まれます

## describe_include_subcolumns \{#describe_include_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="0" />

[DESCRIBE](../../sql-reference/statements/describe-table.md) クエリでサブカラムを出力に含めるかどうかを制御します。たとえば、[Tuple](../../sql-reference/data-types/tuple.md) のメンバー、または [Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null)、[Array](../../sql-reference/data-types/array.md/#array-size) データ型のサブカラムです。

設定可能な値:

- 0 — サブカラムは `DESCRIBE` クエリに含められません。
- 1 — サブカラムは `DESCRIBE` クエリに含められます。

**例**

[DESCRIBE](../../sql-reference/statements/describe-table.md) 文の例を参照してください。

## describe_include_virtual_columns \{#describe_include_virtual_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、テーブルの仮想カラムが DESCRIBE クエリの結果に含まれます。

## dialect \{#dialect\}

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

クエリのパースに使用する dialect を指定します

## dictionary_use_async_executor \{#dictionary_use_async_executor\}

<SettingsInfoBlock type="Bool" default_value="0" />

Dictionary ソースを複数スレッドで読み取るパイプラインを実行します。ローカルの CLICKHOUSE ソースを持つ Dictionary でのみサポートされます。

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Dictionary の主キーの型を検証します。デフォルトでは simple レイアウトの id 型は暗黙的に UInt64 に変換されます。"}]}]}/>

Dictionary の主キーの型を検証します。デフォルトでは simple レイアウトの id 型は暗黙的に UInt64 に変換されます。

## distinct_overflow_mode \{#distinct_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えたときにどう動作するかを設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\}

<SettingsInfoBlock type="Bool" default_value="1" />

分散集約のメモリ節約モードを有効にするかどうかを指定します。

## distributed_background_insert_batch \{#distributed_background_insert_batch\}

**エイリアス**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

挿入データのバッチ送信を有効または無効にします。

バッチ送信が有効な場合、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンは、挿入データの複数のファイルを個別に送信するのではなく、1 回の操作でまとめて送信しようとします。バッチ送信により、サーバーおよびネットワークリソースをより有効に活用できるため、クラスター全体のパフォーマンスが向上します。

取り得る値:

- 1 — 有効。
- 0 — 無効。

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\}

**別名**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する際の最大間隔です。[distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) 設定で指定される間隔が指数関数的に増加するのを制限します。

設定可能な値:

- ミリ秒単位の正の整数値。

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\}

**別名**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する際の基準となる間隔です。エラーが発生した場合、実際の間隔は指数関数的に増加します。

設定可能な値:

- ミリ秒単位の正の整数値。

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\}

**別名**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

失敗時にバッチを分割するかどうかを有効／無効にします。

特定のバッチをリモート分片に送信する際、`Memory limit exceeded` などのエラーにより、後続の複雑なパイプライン（例: `GROUP BY` を含む `MATERIALIZED VIEW`）のために失敗する場合があります。この場合、リトライしても状況は改善せず（そのテーブル向けの distributed 送信が停滞したままになります）が、そのバッチ内のファイルを 1 件ずつ送信すれば INSERT に成功する可能性があります。

そのため、この設定を `1` にすると、そのような失敗したバッチについてはバッチ単位での送信が無効化されます（つまり、失敗したバッチに対して一時的に `distributed_background_insert_batch` が無効になります）。

可能な値:

- 1 — 有効。
- 0 — 無効。

:::note
この設定は、異常なサーバー（マシン）終了および [Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンに対して `fsync_after_insert` / `fsync_directories` が行われなかったことに起因して発生する破損したバッチにも影響します。
:::

:::note
自動バッチ分割に依存すべきではありません。パフォーマンスに悪影響を与える可能性があります。
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\}

**別名**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Distributed テーブルへの挿入クエリのタイムアウト。`insert_distributed_sync` が有効な場合にのみ使用されます。値が 0 の場合はタイムアウトは発生しません。

## distributed_cache_alignment \{#distributed_cache_alignment\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Rename of distributed_cache_read_alignment"}]}]}/>

ClickHouse Cloud でのみ有効です。テスト用途向けの設定のため、変更しないでください。

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache の connection pool をバイパスできるようにします。

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続を作成する際の最大バックオフ時間（ミリ秒）を指定します。

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続の確立時におけるバックオフの最小時間（ミリ秒）です。

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "設定値を変更"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Cloud 専用"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへの接続が失敗した場合に再接続を試行する回数。

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続時の接続タイムアウト（ミリ秒）を指定します。

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "新しいプライベート設定"}]}]}/>

ClickHouse Cloud でのみ有効です。資格情報を更新する間隔です。

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の distributed cache 読み取りリクエスト内の DataPacket シーケンスに対して ACK を送信するためのウィンドウを指定します。

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。未読のデータが残っている場合は、接続を破棄します。

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。`system.distributed_cache_metrics` および `system.distributed_cache_events` テーブルにおいて、現在のアベイラビリティゾーンからのメトリクスのみを取得します。

## distributed_cache_file_cache_name \{#distributed_cache_file_cache_name\}

<CloudOnlyBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting."}]}]}/>

ClickHouse Cloud でのみ有効です。CI テスト専用で使用される設定で、分散キャッシュで使用するファイルシステムキャッシュ名を指定します。

## distributed_cache_log_mode \{#distributed_cache_log_mode\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_log への書き込みモードを指定します。

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の distributed cache 読み取りリクエスト内で許可される、未確認応答のインフライトパケットの最大数を指定します。

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しいプライベート設定。"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュでシークを行う際に必要となる最小バイト数を指定します。

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。プールの上限に達したときの分散キャッシュ接続の動作を指定します

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem_cache_prefer_bigger_buffer_size と同様ですが、distributed cache 用の設定です。

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。現在のアベイラビリティゾーンにあるキャッシュサーバーからのみ読み取ることを許可します。無効にすると、すべてのアベイラビリティゾーンにあるすべてのキャッシュサーバーから読み取ります。

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "設定値の変更"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "新規設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへのリクエストが失敗した場合に再試行する回数です。

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからリクエストに対するデータ応答を受信するまでの待機時間（ミリ秒）を指定します。

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache からあらゆる種類の応答を受信するまでの待機時間をミリ秒で指定します。

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーからデータを受信する際のタイムアウト時間（ミリ秒単位）を指定します。この間に 1 バイトも受信しなかった場合、例外がスローされます。

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへのデータ送信のタイムアウトをミリ秒単位で指定します。クライアントがデータを送信する必要があるにもかかわらず、この間隔内に 1 バイトも送信できない場合は、例外がスローされます。

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続がアイドル状態のままになってから、TCP が keepalive プローブの送信を開始するまでの時間（ミリ秒単位）を指定します。

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache との通信中に発生した例外、または distributed cache から受信した例外を再スローします。それ以外の場合は、エラー時に distributed cache をスキップするフォールバック動作となります。

## distributed_cache_use_clients_cache_for_read \{#distributed_cache_use_clients_cache_for_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。読み取りリクエストにクライアントキャッシュを使用します。

## distributed_cache_use_clients_cache_for_write \{#distributed_cache_use_clients_cache_for_write\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。書き込みリクエストにクライアントキャッシュを使用します。

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed_cache_pool_behaviour_on_limit が `wait` の場合に、接続プールから接続を取得するまでの待機時間（ミリ秒単位）を指定します。

## distributed_connections_pool_size \{#distributed_connections_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

単一の分散テーブルに対するすべてのクエリを分散処理する際に、リモートサーバーへの同時接続の最大数です。クラスタ内のサーバー数以上の値を設定することを推奨します。

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\}

<SettingsInfoBlock type="UInt64" default_value="5" />

分散 DDL（`ON CLUSTER`）クエリの互換性バージョン

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\}

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

分散DDLクエリ結果のフォーマットを設定します。

設定可能な値:

- `throw` — クエリが完了したすべてのホストについて、クエリ実行ステータスを含む結果セットを返します。クエリが一部のホストで失敗した場合は、最初の例外を再スローします。クエリが一部のホストでまだ完了しておらず、[distributed_ddl_task_timeout](#distributed_ddl_task_timeout) を超過した場合は、`TIMEOUT_EXCEEDED` 例外をスローします。
- `none` — `throw` と同様ですが、分散DDLクエリは結果セットを返しません。
- `null_status_on_timeout` — 対応するホストでクエリが完了していない場合に `TIMEOUT_EXCEEDED` をスローする代わりに、結果セットの一部の行の実行ステータスとして `NULL` を返します。
- `never_throw` — 一部のホストでクエリが失敗しても `TIMEOUT_EXCEEDED` をスローせず、例外を再スローしません。
- `none_only_active` - `none` と類似していますが、`Replicated` データベースの非アクティブなレプリカを待ちません。注意: このモードでは、クエリが一部のレプリカで実行されておらず、バックグラウンドで実行されることを判別することはできません。
- `null_status_on_timeout_only_active` — `null_status_on_timeout` と類似していますが、`Replicated` データベースの非アクティブなレプリカを待ちません。
- `throw_only_active` — `throw` と類似していますが、`Replicated` データベースの非アクティブなレプリカを待ちません。

Cloud におけるデフォルト値: `throw`。

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\}

<SettingsInfoBlock type="Int64" default_value="180" />

クラスタ内のすべてのホストから返される DDL クエリ応答のタイムアウトを設定します。DDL リクエストがすべてのホストで実行されていない場合、応答にはタイムアウトエラーが含まれ、リクエストは非同期モードで実行されます。負の値は無期限を意味します。

取り得る値:

- 正の整数。
- 0 — 非同期モード。
- 負の整数 — 無期限のタイムアウト。

## distributed_foreground_insert \{#distributed_foreground_insert\}

**別名**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

[Distributed](/engines/table-engines/special/distributed) テーブルへのデータの同期挿入を有効または無効にします。

デフォルトでは、`Distributed` テーブルにデータを挿入する際、ClickHouse サーバーはクラスター内の各ノードへデータをバックグラウンドモードで送信します。`distributed_foreground_insert=1` の場合、データは同期的に処理され、すべての分片上にデータが保存された後（`internal_replication` が true の場合は、各分片につき少なくとも 1 つのレプリカに保存された後）にのみ `INSERT` 操作が成功します。

取りうる値:

- `0` — データはバックグラウンドモードで挿入されます。
- `1` — データは同期モードで挿入されます。

Cloud におけるデフォルト値: `0`。

**関連項目**

- [Distributed Table Engine](/engines/table-engines/special/distributed)
- [Managing Distributed Tables](/sql-reference/statements/system#managing-distributed-tables)

## distributed_group_by_no_merge \{#distributed_group_by_no_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリ処理において、異なるサーバーからの集約状態をマージしません。異なる分片上で異なるキーが存在することが確実な場合に使用できます。

可能な値:

* `0` — 無効（最終的なクエリ処理はイニシエーターノードで実行されます）。
* `1` - 分散クエリ処理において、異なるサーバーからの集約状態をマージしません（クエリは分片上で完全に処理され、イニシエーターはデータを中継するだけです）。異なる分片上で異なるキーが存在することが確実な場合に使用できます。
* `2` - `1` と同様ですが、イニシエーター側で `ORDER BY` と `LIMIT` を適用します（`distributed_group_by_no_merge=1` のように、クエリがリモートノード上で完全に処理される場合には、イニシエーター側でこれらを適用することはできません）。`ORDER BY` および/または `LIMIT` を含むクエリに使用できます。

**例**

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


## distributed_index_analysis \{#distributed_index_analysis\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

索引の解析処理がレプリカ間で分散実行されます。共有ストレージを使用している場合や、クラスター内のデータ量が非常に多い場合に有益です。`cluster_for_parallel_replicas` のレプリカを使用します。

## distributed_index_analysis_for_non_shared_merge_tree \{#distributed_index_analysis_for_non_shared_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

SharedMergeTree（Cloud 専用エンジン）以外の場合にも索引の分散解析を有効にします。

## distributed_insert_skip_read_only_replicas \{#distributed_insert_skip_read_only_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "true の場合、Distributed への INSERT で read-only レプリカをスキップする"}]}]}/>

Distributed への INSERT クエリにおいて、read-only レプリカをスキップできるようにします。

取りうる値:

- 0 — 通常どおりに INSERT を行い、read-only レプリカに送信された場合はクエリは失敗します。
- 1 — イニシエーターはデータを分片に送信する前に read-only レプリカをスキップします。

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定。"}]}]}/>

分散クエリにおける並列読み取り用タスク数のデフォルト値です。タスクはレプリカ間に分散されます。

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定。"}]}]}/>

distributed shuffle-hash-join におけるデフォルトのバケット数。

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランのすべてのタスクをローカルで実行します。テストやデバッグに役立ちます。

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "New experimental setting."}]}]}/>

分散クエリのステージ間で、指定した種類の Exchange オペレーターの使用を強制します。

指定可能な値:

- '' - いかなる種類の Exchange オペレーターも強制せず、オプティマイザーに選択を任せる
 - 'Persisted' - オブジェクトストレージ上の一時ファイルを使用する
 - 'Streaming' - ネットワーク経由で Exchange データをストリーミングする

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

分散クエリプランでは、PartialAggregation + Merge の代わりに Shuffle 集約戦略を使用します。

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランにおいて、シャッフル結合ではなくブロードキャスト結合を使用する際の行数の上限。

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New experimental setting."}]}]}/>

分散クエリプランから不要な exchange を削除します。デバッグ目的で無効化します。

## distributed_product_mode \{#distributed_product_mode\}

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

[分散サブクエリ](../../sql-reference/operators/in.md) の動作を変更します。

ClickHouse は、クエリに分散テーブルの積（product）が含まれている場合、すなわち分散テーブルに対するクエリが分散テーブルへの非 GLOBAL サブクエリを含む場合に、この設定を適用します。

制限:

- IN および JOIN サブクエリに対してのみ適用されます。
- FROM 句が 2 つ以上の分片を含む分散テーブルを使用している場合にのみ適用されます。
- サブクエリの対象が 2 つ以上の分片を含む分散テーブルである場合にのみ適用されます。
- テーブル値 [remote](../../sql-reference/table-functions/remote.md) 関数には使用されません。

設定可能な値:

- `deny` — デフォルト値です。これらの種類のサブクエリの使用を禁止します（「Double-distributed IN/JOIN subqueries is denied」という例外を返します）。
- `local` — 宛先サーバー（分片）上のローカルなデータベースおよびテーブルに置き換えたうえで、`IN`/`JOIN` のままにします。
- `global` — `IN`/`JOIN` クエリを `GLOBAL IN`/`GLOBAL JOIN` に置き換えます。
- `allow` — これらの種類のサブクエリの使用を許可します。

## distributed_push_down_limit \{#distributed_push_down_limit\}

<SettingsInfoBlock type="UInt64" default_value="1" />

各分片ごとに個別に [LIMIT](#limit) を適用するかどうかを有効または無効にします。

これにより、次のことを回避できます：

- 余分な行をネットワーク越しに送信すること。
- イニシエーター側で、LIMIT を超えた行を処理すること。

バージョン 21.9 以降では、少なくともいずれかの条件を満たす場合にのみ `distributed_push_down_limit` がクエリ実行方法を変更するようになったため、結果が不正確になることはもうありません：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` **がなく**、`ORDER BY`/`LIMIT` がある場合。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` と `ORDER BY`/`LIMIT` **があり**、かつ次の条件を満たす場合:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効。
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) が有効。

可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 型: unsigned int
- デフォルト値: 1000

各レプリカのエラー数はこの値を上限とし、単一のレプリカにエラーが過度に蓄積されることを防ぎます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\}

<SettingsInfoBlock type="Seconds" default_value="60" />

- 型: 秒
- デフォルト値: 60 秒

分散テーブルにおけるエラーがどの程度の速さでゼロにクリアされるかを制御します。あるレプリカがしばらくの間利用できず、エラーが 5 回蓄積され、distributed_replica_error_half_life が 1 秒に設定されている場合、そのレプリカは最後のエラーから 3 秒後に正常と見なされます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\}

<SettingsInfoBlock type="UInt64" default_value="0" />

- 型: unsigned int
- デフォルト値: 0

`load_balancing` アルゴリズムに従ってレプリカを選択する際に、無視されるエラーの最大数。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

SELECT FINAL で、単一のパーティション内にあるパーツのみをマージします

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\}

<SettingsInfoBlock type="Bool" default_value="1" />

空の Set に対して定数キーで集約を実行した場合、空の結果を返します。

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\}

<SettingsInfoBlock type="Bool" default_value="0" />

空の Set に対してキーを指定せずに集計を行う場合、空の結果を返します。

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定。メモリ内データを外部ストレージに動的にスピルします。"}]}]}/>

プロセッサを起動して、データを外部ストレージに動的にスピルします。現在は GRACE JOIN がサポートされています。

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "分散 IN サブクエリで転送される一時テーブルのサイズを削減するための新しい設定。"}]}]}/>

`IN` サブクエリで `DISTINCT` を有効にします。これはトレードオフとなる設定です。有効化すると、分散 IN サブクエリで転送される一時テーブルのサイズを大幅に削減し、一意な値のみが送信されるようにすることで、分片間のデータ転送を大幅に高速化できます。
ただし、この設定を有効にすると、各ノードで重複排除（DISTINCT）を行う必要があるため、追加のマージ処理が発生します。ネットワーク転送がボトルネックとなっており、その追加のマージコストが許容できる場合に、この設定を使用してください。

## enable_blob_storage_log \{#enable_blob_storage_log\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込む"}]}]}/>

BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込む

## enable_early_constant_folding \{#enable_early_constant_folding\}

<SettingsInfoBlock type="Bool" default_value="1" />

関数やサブクエリの結果を解析し、それらが定数である場合にクエリを書き換える最適化を有効にします

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` 型と比較して拡張された範囲を持つ `Date32` 型、または `DateTime` 型と比較して拡張された範囲を持つ `DateTime64` 型の結果を返すかどうかを切り替える設定です。

設定可能な値:

- `0` — すべての種類の引数に対して、関数は `Date` または `DateTime` を返します。
- `1` — `Date32` または `DateTime64` の引数に対しては、関数は `Date32` または `DateTime64` を返し、それ以外の場合は `Date` または `DateTime` を返します。

以下の表は、さまざまな日付・時刻関数に対するこの設定の動作を示しています。

| 関数                        | `enable_extended_results_for_datetime_functions = 0`           | `enable_extended_results_for_datetime_functions = 1`                                                                 |
| ------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | `Date` または `DateTime` を返します                                    | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返します |
| `toStartOfISOYear`        | `Date` 型または `DateTime` 型を返します                                  | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` を返す     |
| `toStartOfQuarter`        | `Date` または `DateTime` を返します                                    | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返す     |
| `toStartOfMonth`          | `Date` 型または `DateTime` 型を返します                                  | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` を返します |
| `toStartOfWeek`           | `Date` または `DateTime` 型を返す                                     | `Date`/`DateTime` を入力すると `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` を入力すると `Date32`/`DateTime64` を返します       |
| `toLastDayOfWeek`         | `Date` または `DateTime` を返す                                      | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` を返します |
| `toLastDayOfMonth`        | `Date` または `DateTime` を返す                                      | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返します |
| `toMonday`                | `Date` または `DateTime` を返します                                    | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返します   |
| `toStartOfDay`            | `DateTime` を返します<br />*注: 1970〜2149 の範囲外の値では誤った結果を返す可能性があります*  | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                     |
| `toStartOfHour`           | `DateTime` を返します<br />*注意: 1970〜2149年の範囲外の値では誤った結果になります*       | `Date`/`DateTime` 型の入力に対して `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `DateTime64` を返します                   |
| `toStartOfFifteenMinutes` | `DateTime` を返します<br />*注: 1970〜2149年の範囲外の値では誤った結果を返します*        | `Date`/`DateTime` 型の入力では `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力では `DateTime64` を返します                       |
| `toStartOfTenMinutes`     | `DateTime` を返します<br />*注: 1970〜2149年の範囲外の値では誤った結果になります*        | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                     |
| `toStartOfFiveMinutes`    | `DateTime` を返します<br />*注: 1970〜2149 年の範囲外の値では誤った結果になる可能性があります* | `Date`/`DateTime` 型の入力の場合は `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力の場合は `DateTime64` を返す                       |
| `toStartOfMinute`         | `DateTime` を返します<br />*注: 1970〜2149 年の範囲外の値では誤った結果が返されます*      | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                     |
| `timeSlot`                | `DateTime` を返します<br />*注: 1970〜2149 の範囲外の値では誤った結果を返します*        | `Date`/`DateTime` 型の入力に対しては `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返します                 |

## enable_filesystem_cache \{#enable_filesystem_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステム用にキャッシュを使用します。この設定自体はディスクのキャッシュを有効化/無効化するものではありません（それはディスクの設定で行う必要があります）が、意図的に一部のクエリでキャッシュをバイパスできるようにします。

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

各クエリごとにファイルシステムキャッシュのログを記録できるようにします。

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

`write-through` キャッシュを有効または無効にします。`false` に設定すると、書き込み処理に対する `write-through` キャッシュは無効になります。`true` に設定すると、サーバー設定のキャッシュディスク構成セクションで `cache_on_write_operations` が有効になっている場合に `write-through` キャッシュが有効になります。
詳細については、["Using local cache"](/operations/storing-data#using-local-cache) を参照してください。

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの実行中に system.filesystem の prefetch_log にログを記録します。テストやデバッグ目的でのみ使用すべきであり、デフォルトで有効化することは推奨されません。

## enable_full_text_index \{#enable_full_text_index\}

<BetaBadge/>

**別名**: `allow_experimental_full_text_index`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Text index was moved to Beta."}]}]}/>

true に設定すると、テキスト索引を使用できるようになります。

## enable_global_with_statement \{#enable_global_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "デフォルトで WITH 文を UNION クエリおよびすべてのサブクエリに適用する"}]}]}/>

WITH 文を UNION クエリおよびすべてのサブクエリに適用する

## enable_hdfs_pread \{#enable_hdfs_pread\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

HDFS ファイルに対する pread を有効または無効にします。デフォルトでは `hdfsPread` が使用されます。無効にした場合は、HDFS ファイルの読み取りに `hdfsRead` と `hdfsSeek` が使用されます。

## enable_http_compression \{#enable_http_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一般的に有益です"}]}]}/>

HTTP リクエストに対するレスポンスで、データ圧縮を有効または無効にします。

詳細については、[HTTP インターフェイスの説明](/interfaces/http)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## enable_job_stack_trace \{#enable_job_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パフォーマンスへの影響を避けるため、デフォルトで無効になりました。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "ジョブのスケジューリングからスタックトレースを収集できるようにします。パフォーマンスへの影響を避けるため、デフォルトで無効です。"}]}]}/>

ジョブが例外を発生させた場合に、そのジョブを作成した側のスタックトレースを出力します。パフォーマンスへの影響を避けるため、デフォルトで無効です。

## enable_join_runtime_filters \{#enable_join_runtime_filters\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

実行時に右側から収集した JOIN キーの Set を用いて、左側の行をフィルタリングします。

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "デフォルトで JOIN および ARRAY JOIN における lazy columns replication を有効化"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "JOIN および ARRAY JOIN における lazy columns replication を有効化するための設定を追加"}]}]}/>

JOIN および ARRAY JOIN において lazy columns replication を有効にします。これにより、メモリ上で同じ行が複数回不要にコピーされることを回避できます。

## enable_lightweight_delete \{#enable_lightweight_delete\}

**Aliases**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルに対する論理削除 (lightweight DELETE) の mutation を有効にします。

## enable_lightweight_update \{#enable_lightweight_update\}

<BetaBadge/>

**別名**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Lightweight updates 機能が Beta に移行されました。SETTING 'allow_experimental_lightweight_update' の別名が追加されました。"}]}]}/>

論理更新の使用を許可します。

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

集約結果に対してメモリ制約に基づくマージ戦略を有効にします。

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\}

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句の条件をより多く PREWHERE 句に移動し、複数の条件が AND で結合されている場合は、ディスクからの読み取りとフィルタリングを複数回に分けて実行します

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "すべての名前が一意であり、引用符なしの識別子として扱える場合に、関数 tuple() で名前付きタプルを生成します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "ユーザビリティ改善待ちのため無効化"}]}]}/>

すべての名前が一意であり、引用符なしの識別子として扱える場合に、関数 tuple() で名前付きタプルを生成します。

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

`SELECT` クエリにおける述語プッシュダウンを有効にします。

述語プッシュダウンにより、分散クエリでのネットワークトラフィックを大幅に削減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

使用方法

次のクエリを考えてみます:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1` の場合、ClickHouse は処理時にサブクエリへ `WHERE` を適用するため、これら 2 つのクエリの実行時間は同じになります。

`enable_optimize_predicate_expression = 0` の場合、2 番目のクエリではサブクエリの処理完了後にすべてのデータに対して `WHERE` 句が適用されるため、実行時間は大幅に長くなります。

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

述語を final サブクエリへプッシュすることを許可します。

## enable_order_by_all \{#enable_order_by_all\}

<SettingsInfoBlock type="Bool" default_value="1" />

`ORDER BY ALL` 構文によるソート処理の有効／無効を切り替えます。[ORDER BY](../../sql-reference/statements/select/order-by.md) を参照してください。

設定可能な値:

* 0 — ORDER BY ALL を無効にします。
* 1 — ORDER BY ALL を有効にします。

**例**

クエリ:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- returns an error that ALL is ambiguous

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

結果：

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

分散クエリにのみ影響します。有効にすると、ブロックはイニシエーター側に送信する前後でパイプラインスレッド上でシリアライズ／デシリアライズおよび圧縮／解凍されます（すなわち、デフォルト時より高い並列度で処理されます）。

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、テーブルから取得したシリアライゼーションに関するヒントに従って、カスタムシリアライゼーション（例: スパース）を使用するカラムにデータを直接パースできます。

## enable_positional_arguments \{#enable_positional_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Enable positional arguments feature by default"}]}]} />

[GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) 文での位置引数サポートを有効または無効にします。

設定可能な値:

* 0 — 位置引数はサポートされません。
* 1 — 位置引数がサポートされます。カラム名の代わりにカラム番号を使用できます。

**例**

クエリ:

```sql
CREATE TABLE positional_arguments(one Int, two Int, three Int) ENGINE=Memory();

INSERT INTO positional_arguments VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM positional_arguments ORDER BY 2,3;
```

結果：

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```


## enable_positional_arguments_for_projections \{#enable_positional_arguments_for_projections\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "PROJECTION 内の位置引数を制御する新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "PROJECTION 内の位置引数を制御する新しい設定。"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "PROJECTION 内の位置引数を制御する新しい設定。"}]}]}/>

PROJECTION 定義における位置引数のサポートの有無を切り替えます。参照: [enable_positional_arguments](#enable_positional_arguments) 設定。

:::note
これは上級者向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないことを推奨します。
:::

設定可能な値:

- 0 — 位置引数はサポートされません。
- 1 — 位置引数がサポートされます。カラム名の代わりにカラム番号を指定できます。

## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

メモリ効率の高い集約（`distributed_aggregation_memory_efficient` を参照）で、バケットを順不同で生成できるようにします。
これにより、集約バケットのサイズに偏りがある場合に、あるレプリカが低い ID の重いバケットをまだ処理している間でも、より高い ID のバケットをイニシエータへ送信できるようになり、パフォーマンスが向上する可能性があります。
その代償として、メモリ使用量が増加する可能性があります。

## enable_qbit_type \{#enable_qbit_type\}

<BetaBadge/>

**エイリアス**: `allow_experimental_qbit_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "QBit が Beta 機能に移行されました。設定 'allow_experimental_qbit_type' のエイリアスが追加されました。"}]}]}/>

[QBit](../../sql-reference/data-types/qbit.md) データ型の作成を許可します。

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果は [クエリキャッシュ](../query-cache.md) から取得されます。

可能な値:

- 0 - 無効
- 1 - 有効

## enable_s3_requests_logging \{#enable_s3_requests_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

S3 リクエストのきわめて詳細なログ出力を有効にします。デバッグ用途にのみ使用してください。

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "スカラーサブクエリによる大きなスカラー値の（デ）シリアライズを防ぎ、同じサブクエリを複数回実行せずに済む可能性があります"}]}]}/>

true に設定すると、スカラーサブクエリによる大きなスカラー値の（デ）シリアライズを防ぎ、同じサブクエリを複数回実行せずに済む可能性があります。

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "古いアナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "古いアナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "古いアナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "古いアナライザーとの後方互換性のための新しい設定。"}]}]}/>

この設定を無効化すると、親の WITH 句での宣言は、現在のスコープで宣言されたものと同じスコープとして扱われます。

これは、新しいアナライザーにおいて、古いアナライザーで実行可能だった一部の不正なクエリを実行できるようにするための互換性設定であることに注意してください。

## enable_shared_storage_snapshot_in_query \{#enable_shared_storage_snapshot_in_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリでストレージスナップショットを共有するための新しい設定"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "デフォルトでクエリ内でのストレージスナップショット共有を有効化"}]}]} />

有効にすると、単一のクエリ内のすべてのサブクエリは、各テーブルに対して同じ StorageSnapshot を共有します。
これにより、同じテーブルに複数回アクセスする場合でも、クエリ全体を通して一貫したデータビューが保証されます。

これは、データパーツの内部整合性が重要となるクエリで必要となります。例:

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

この設定を有効にしない場合、外側のクエリと内側のクエリが異なるデータスナップショットに対して動作する可能性があり、その結果、誤った結果が返されることがあります。

:::note
この設定を有効にすると、プランニング段階の完了後に不要なデータパーツをスナップショットから削除する最適化が行われなくなります。
その結果、長時間実行されるクエリは実行中ずっと古いパーツを保持し続ける可能性があり、パーツのクリーンアップが遅れ、ストレージへの負荷が増加します。

この設定は現在、MergeTree ファミリーのテーブルにのみ適用されます。
:::

設定可能な値:

* 0 - 無効
* 1 - 有効


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\}

<SettingsInfoBlock type="Bool" default_value="1" />

同じミューテーション内の異なるタスク間で、IN サブクエリ用に構築された Set オブジェクトを共有できるようにします。これにより、メモリ使用量と CPU 使用量が削減されます。

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

集約処理でソフトウェアプリフェッチを有効にします

## enable_time_time64_type \{#enable_time_time64_type\}

**別名**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定です。実験的な Time 型および Time64 型の使用を許可します。"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Time 型および Time64 型をデフォルトで有効化"}]}]}/>

[Time](../../sql-reference/data-types/time.md) および [Time64](../../sql-reference/data-types/time64.md) データ型の作成を許可します。

## enable_unaligned_array_join \{#enable_unaligned_array_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

サイズが異なる複数の配列に対して ARRAY JOIN を許可します。この設定を有効にすると、配列は最も長い配列の長さに合わせて自動的にリサイズされます。

## enable_url_encoding \{#enable_url_encoding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "既存の設定のデフォルト値を変更"}]}]}/>

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、URI パスのエンコード／デコード処理を有効または無効にします。

デフォルトでは無効です。

## enable_vertical_final \{#enable_vertical_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "バグ修正後に vertical final をデフォルトで再度有効化"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "vertical final をデフォルトで使用"}]}]}/>

有効にすると、FINAL の処理中に行をマージするのではなく、行を削除済みとしてマークし、その後のフィルタ処理で重複した行を削除します

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) に保存されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

有効にすると、英数字とアンダースコアから成る識別子のみが許可されます。

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

フォーマットにサフィックス（`JSON`、`ORC`、`Parquet` など）がある場合に、File エンジンテーブルへの挿入ごとに新しいファイルを作成するかどうかを制御します。有効な場合、各挿入時に次のパターンに従った名前で新しいファイルが作成されます:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` など。

設定可能な値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

基になるファイルが存在しない場合でも、File エンジンテーブルからデータを選択できるようにします。

取りうる値:

- 0 — `SELECT` は例外をスローします。
- 1 — `SELECT` は空の結果を返します。

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンテーブルで空のファイルをスキップするかどうかを制御します。

指定可能な値:

- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルに対して、挿入前にファイルを切り詰めるかどうかを有効または無効にします。

指定可能な値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、空ファイルをスキップするかどうかを有効または無効にします。

設定可能な値:

- 0 — 空ファイルが指定された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## exact_rows_before_limit \{#exact_rows_before_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ClickHouse は rows_before_limit_at_least 統計値に対して正確な値を返しますが、その代償として、LIMIT 以前のデータをすべて読み込む必要があります。

## except_default_mode \{#except_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

EXCEPT クエリにおけるデフォルトモードを設定します。取り得る値は空文字列、'ALL'、'DISTINCT' です。空文字列の場合、モードを指定しないクエリは例外を発生させます。

## exclude_materialize_skip_indexes_on_insert \{#exclude_materialize_skip_indexes_on_insert\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定。"}]}]} />

INSERT 時に構築および保存される対象から、指定したスキップ索引を除外します。除外されたスキップ索引は、[マージ中](merge-tree-settings.md/#materialize_skip_indexes_on_merge)や、明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリによって引き続き構築および保存されます。

[materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) が false の場合には効果がありません。

例:

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

非相関 EXISTS サブクエリをスカラーサブクエリとして実行します。スカラーサブクエリと同様にキャッシュが使用され、結果には定数畳み込みが適用されます。

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="10" />

接続タイムアウト時間（秒）。現在は MySQL のみに対応しています。

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを持つテーブルが履歴データをフラッシュする際に読み込む最大バイト数を制限します。現在は MySQL テーブルエンジン、データベースエンジン、および Dictionary に対してのみサポートされています。0 の場合、この設定は無効になります。

## external_storage_max_read_rows \{#external_storage_max_read_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に処理する行数の上限を設定します。現在は MySQL テーブルエンジン、データベースエンジン、および Dictionary にのみ対応しています。0 の場合、この設定は無効になります。

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

読み取り/書き込みタイムアウト（秒）。現在は MySQL に対してのみサポートされています。

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

[mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md)、および [odbc](../../sql-reference/table-functions/odbc.md) テーブル関数が Nullable カラムをどのように使用するかを定義します。

指定可能な値:

- 0 — テーブル関数は Nullable カラムを明示的に使用します。
- 1 — テーブル関数は Nullable カラムを暗黙的に使用します。

**使用方法**

この設定を `0` にすると、テーブル関数は Nullable カラムを作成せず、NULL の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

## external_table_strict_query \{#external_table_strict_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定されている場合、外部テーブルに対するクエリでは、式をローカルフィルタへ変換することは禁止されます。

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\}

**別名**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "`extractKeyValuePairs` 関数によって生成されるペアの最大数。過剰なメモリ使用を防止するためのセーフガードとして利用されます。"}]}]}/>

`extractKeyValuePairs` 関数によって生成されるペアの最大数です。過剰なメモリ使用を防止するためのセーフガードとして利用されます。

## extremes \{#extremes\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ結果のカラム内における極値（最小値および最大値）をカウントするかどうかを指定します。0 または 1 を指定できます。デフォルトは 0（無効）です。
詳細については、「Extreme values」のセクションを参照してください。

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

最新のデータが利用できない場合に、クエリを古い状態のレプリカへ強制的に送信します。詳細は [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

ClickHouse は、そのテーブルの古い状態のレプリカの中から最も適切なものを選択します。

レプリケーションされたテーブルを参照する分散テーブルに対して `SELECT` を実行する際に使用されます。

デフォルトは 1（有効）です。

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "filesystem キャッシュにおけるバックグラウンドダウンロードをクエリ単位で制御する新しい設定。"}]}]}/>

リモートストレージから読み取るデータについて、filesystem キャッシュがバックグラウンドダウンロードをキューに追加できるようにします。無効にすると、現在のクエリ/セッションではダウンロードはフォアグラウンドで実行され続けます。

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

ファイルシステムキャッシュの境界アラインメントを制御します。この設定はディスク以外からの読み取りに対してのみ適用されます（例えば、リモートテーブルエンジン／テーブル関数のキャッシュには適用されますが、MergeTree テーブルのストレージ設定には適用されません）。値 0 はアラインメントなしを意味します。

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem cache 内で領域を予約するためにキャッシュをロックする際に許容される待機時間です。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem cache において領域を予約するためにキャッシュをロックする際の待機時間です。

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\}

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

1つのクエリでダウンロードできるリモートファイルシステムキャッシュの最大サイズ

## filesystem_cache_name \{#filesystem_cache_name\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "ステートレスなテーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュの名前"}]}]}/>

ステートレスなテーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュの名前

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

filesystem cache が有効になっている場合、小さなファイルセグメントを書き込むことで cache のパフォーマンスが低下するのを避けるため、より大きなバッファサイズを優先します。一方で、この設定を有効にするとメモリ使用量が増加する可能性があります。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "ファイルシステムキャッシュで領域を予約するためにキャッシュをロックする際の待機時間"}]}]}/>

ファイルシステムキャッシュで領域を予約するためにキャッシュをロックする際の待機時間

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="20" />

読み取りバッファがキャッシュから要求できるファイルセグメントの 1 バッチあたりのサイズ上限。値が小さすぎるとキャッシュへのリクエストが過剰になり、大きすぎるとキャッシュからの削除処理が遅くなる可能性があります。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\}

**別名**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "設定 skip_download_if_exceeds_query_cache_limit の改名"}]}]}/>

クエリキャッシュサイズを超える場合は、リモートファイルシステムからのダウンロードをスキップする。

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

プリフェッチに使用されるメモリ使用量の上限。

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

プリフェッチステップのバイト数。ゼロの場合は `auto` を意味します。おおよそ最適なプリフェッチステップが自動的に推定されますが、必ずしも 100% 最適とは限りません。実際の値は、filesystem_prefetch_min_bytes_for_single_read_task 設定により異なる場合があります。

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マーク単位でのプリフェッチステップを指定します。0 の場合は `auto` を意味します。おおよそ最適なプリフェッチステップが自動的に推定されますが、常に 100% 最適とは限りません。実際の値は、設定 filesystem_prefetch_min_bytes_for_single_read_task の影響により異なる場合があります。

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\}

<SettingsInfoBlock type="UInt64" default_value="200" />

プリフェッチの最大数。0 の場合は無制限です。プリフェッチ数を制限したい場合は、`filesystem_prefetches_max_memory_usage` という設定の利用を推奨します。

## final \{#final\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のすべてのテーブルのうち、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) が適用可能なテーブル（結合されたテーブル、サブクエリ内のテーブル、分散テーブルを含む）に対して、自動的に [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用します。

設定可能な値:

* 0 - 無効
* 1 - 有効

例:

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

[nested](../../sql-reference/data-types/nested-data-structures/index.md) 型カラムのデータ形式を設定します。

設定可能な値:

* 1 — Nested カラムが個々の配列にフラット化されます。
* 0 — Nested カラムはタプルからなる単一の配列のままになります。

**使用方法**

この設定を `0` にすると、任意のレベルのネストを使用できます。

**例**

クエリ:

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

結果:

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

クエリ：

```sql
SET flatten_nested = 0;

CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

結果：

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

適用可能であるにもかかわらず、ヒューリスティックにより使用しないと判断された場合でも、この最適化の使用を強制します

## force_aggregation_in_order \{#force_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は、分散クエリをサポートするためにサーバー自身が内部的に使用します。通常の動作が損なわれる可能性があるため、手動で変更しないでください。（分散集約時に、リモートノードでの順序付き集約の実行を強制します）。

## force_data_skipping_indices \{#force_data_skipping_indices\}

指定した data skipping index が使用されなかった場合、クエリの実行を失敗させます。

次の例を見てみます。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "GROUPING 関数の出力を SQL 標準および他の DBMS と同一にする"}]}]}/>

GROUPING 関数の引数が集約キーとして使用されていない場合は 1 を返します

## force_index_by_date \{#force_index_by_date\}

<SettingsInfoBlock type="Bool" default_value="0" />

日付で索引を利用できない場合、そのクエリの実行を無効にします。

MergeTree ファミリーのテーブルで機能します。

`force_index_by_date=1` の場合、ClickHouse はクエリに対し、データ範囲の制限に使用できる日付キー条件があるかどうかをチェックします。適切な条件が存在しない場合、ClickHouse は例外をスローします。ただし、その条件が実際に読み取るデータ量を減らすかどうかはチェックしません。たとえば、条件 `Date != ' 2000-01-01 '` は、テーブル内のすべてのデータにマッチする場合（つまり、クエリの実行に全表スキャンが必要な場合）でも許容されます。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_optimize_projection \{#force_optimize_projection\}

<SettingsInfoBlock type="Bool" default_value="0" />

Enables or disables the obligatory use of [projections](../../engines/table-engines/mergetree-family/mergetree.md/#projections) in `SELECT` queries, when projection optimization is enabled (see [optimize_use_projections](#optimize_use_projections) setting).

[projection](../../engines/table-engines/mergetree-family/mergetree.md/#projections) 最適化が有効な場合（`optimize_use_projections` 設定を参照）、`SELECT` クエリで PROJECTION を必ず使用するようにするかどうかを有効または無効にします。

取り得る値:

- 0 — PROJECTION 最適化の利用は必須ではありません。
- 1 — PROJECTION 最適化の利用が必須です。

## force_optimize_projection_name \{#force_optimize_projection_name\}

空でない文字列が設定されている場合、そのPROJECTIONがクエリ内で少なくとも一度は使用されているかをチェックします。

取りうる値:

- string: クエリで使用されるPROJECTIONの名前

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効で、未使用の分片のスキップが不可能な場合に、クエリの実行を有効または無効にします。スキップが不可能で、この設定が有効な場合は、例外がスローされます。

取り得る値:

- 0 — 無効。ClickHouse は例外をスローしません。
- 1 — 有効。テーブルにシャーディングキーがある場合にのみ、クエリの実行が無効になります。
- 2 — 有効。テーブルにシャーディングキーが定義されているかどうかに関係なく、クエリの実行が無効になります。

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ネストされた分散クエリのレベル（ある `Distributed` テーブルが別の `Distributed` テーブルを参照しているケース）に応じて [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) の動作を制御します（したがって、[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) 自体を有効にしておく必要があります）。

設定可能な値:

- 0 - この設定を無効にし、`force_optimize_skip_unused_shards` を常に動作させます。
- 1 — 最初のレベルに対してのみ `force_optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `force_optimize_skip_unused_shards` を有効にします。

## force_primary_key \{#force_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

主キーによるインデックスの利用ができない場合に、クエリの実行を無効にします。

MergeTree ファミリーに属するテーブルで有効です。

`force_primary_key=1` の場合、ClickHouse はクエリにデータ範囲を制限するために使用できる主キー条件があるかどうかを確認します。適切な条件が存在しない場合は、例外をスローします。ただし、その条件が実際に読み取るデータ量を削減するかどうかまでは確認しません。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

DROP クエリ時にデータを再帰的に削除します。'Directory not empty' エラーを回避しますが、detached データをサイレントに削除してしまう可能性があります

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

関数 `formatDateTime` におけるフォーマッタ `%e` は、1桁の日を先頭に空白を付けて出力します（例: `'2'` ではなく `' 2'`）。

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

関数 `formatDateTime` におけるフォーマッタ `%f` は、固定の 6 桁ではなく、DateTime64 のスケールで指定された桁数のみを出力します。

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "MySQL の DATE_FORMAT()/STR_TO_DATE() との互換性を改善"}]}]}/>

`formatDateTime` 関数におけるフォーマッター '%f' は、フォーマット対象の値に小数秒が含まれない場合、6 個のゼロではなく 1 個のゼロを出力します。

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

関数 'formatDateTime' におけるフォーマッター '%c'、'%l'、'%k' は、先頭にゼロを付けない形式で月と時を出力します。

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性が向上"}]}]}/>

`formatDateTime` と `parseDateTime` 関数におけるフォーマッタ `%M` は、分ではなく月名を出力／解析します。

## fsync_metadata \{#fsync_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

`.sql` ファイルを書き込む際に [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) を有効または無効にします。デフォルトでは有効です。

サーバー上でごく小さなテーブルが数百万単位で継続的に作成および削除されている場合には、これを無効にするのが妥当です。

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "dateTrunc 関数の従来の動作を維持するための新しい設定を追加"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "負の値に対して正しい結果を得るため、dateTrunc 関数において、第 2 引数が DateTime64/Date32 の場合には時間単位に関係なく戻り値の型を常に DateTime64/Date32 に変更"}]}]}/>

`dateTrunc` 関数の戻り値の型に関する動作を変更できるようにします。

設定値:

- 0 - 第 2 引数が `DateTime64/Date32` の場合、最初の引数の時間単位に関係なく戻り値の型は `DateTime64/Date32` になります。
- 1 - `Date32` の場合、結果は常に `Date` になります。`DateTime64` の場合、時間単位が `second` 以上のとき、結果は `DateTime` になります。

## function_implementation \{#function_implementation\}

特定のターゲットまたはバリアント向けの関数実装を選択します（実験的機能）。空欄のままにすると、すべての実装が有効になります。

## function_json_value_return_type_allow_complex \{#function_json_value_return_type_allow_complex\}

<SettingsInfoBlock type="Bool" default_value="0" />

json&#95;value 関数が複合データ型（struct、array、map など）を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

可能な値:

* true — 許可する。
* false — 許可しない。


## function_json_value_return_type_allow_nullable \{#function_json_value_return_type_allow_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON&#95;VALUE 関数で値が存在しない場合に `NULL` を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

設定可能な値:

* true — 許可する。
* false — 許可しない。


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "MySQL の locate 関数との互換性を向上。"}]}]}/>

関数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) における引数の順序を制御します。

設定可能な値:

- 0 — 関数 `locate` は引数 `(haystack, needle[, start_pos])` を受け取ります。
- 1 — 関数 `locate` は引数 `(needle, haystack, [, start_pos])` を受け取ります (MySQL 互換の動作)。

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\}

<SettingsInfoBlock type="UInt64" default_value="500000000" />

関数 [range](/sql-reference/functions/array-functions#range) によって生成されるデータ量の安全性のための閾値を設定します。データの各ブロックごとに関数が生成できる値の最大数（ブロック内のすべての行における配列サイズの合計）を定義します。

設定可能な値：

- 正の整数。

**参考**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\}

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "以前のバージョンでは、最大 3 秒のスリープ時間は `sleep` にのみ適用され、`sleepEachRow` 関数には適用されていませんでした。新しいバージョンでは、この設定を導入しました。以前のバージョンとの互換性を有効にした場合は、この上限を完全に解除します。"}]}]}/>

関数 `sleep` が各ブロックでスリープすることが許可される最大時間（マイクロ秒単位）です。より大きな値で呼び出された場合は、例外をスローします。安全のためのしきい値です。

## function_visible_width_behavior \{#function_visible_width_behavior\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "We changed the default behavior of `visibleWidth` to be more precise"}]}]}/>

`visibleWidth` の動作バージョン。0 - コードポイント数のみをカウントする。1 - ゼロ幅文字と結合文字を正しくカウントし、全角文字を 2 としてカウントし、タブ幅を推定し、削除文字をカウントする。

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトの精度を向上。"}]}]}/>

`geoDistance`、`greatCircleDistance`、`greatCircleAngle` 関数の 4 つの引数すべてが Float64 の場合、戻り値は Float64 型となり、内部計算には倍精度浮動小数点数が使用されます。以前の ClickHouse バージョンでは、これらの関数は常に Float32 を返していました。

## geotoh3_argument_order \{#geotoh3_argument_order\}

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "経度と緯度の引数の順序を従来の動作として設定するための新しい設定"}]}]}/>

Function 'geoToH3' は、`lon_lat` に設定されている場合は (lon, lat)、`lat_lon` に設定されている場合は (lat, lon) を受け付けます。

## glob_expansion_max_elements \{#glob_expansion_max_elements\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

許可されるアドレス数の上限（外部ストレージやテーブル関数など）。

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Grace Hash Join における初期バケット数

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Grace ハッシュ結合におけるバケット数の上限

## group_by_overflow_mode \{#group_by_overflow_mode\}

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

集約におけるユニークキーの数が上限を超えた場合の動作を指定します。

- `throw`: 例外をスローする
- `break`: クエリの実行を停止し、部分結果を返す
- `any`: Set に入ったキーについては集約を継続するが、新しいキーを Set に追加しない

`any` を指定すると、GROUP BY の近似的な処理を実行できます。この近似の精度は、データの統計的性質に依存します。

## group_by_two_level_threshold \{#group_by_two_level_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

キーの数がいくつになったら二段階集約を開始するかを指定します。0 を指定すると、しきい値は設定されません。

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

集計状態のサイズがバイト単位でどの程度以上になったときに二段階集計が使われ始めるかを指定します。0 の場合、しきい値は設定されません。いずれかのしきい値が満たされた場合に二段階集計が使用されます。

## group_by_use_nulls \{#group_by_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

[GROUP BY 句](/sql-reference/statements/select/group-by) が集約キーの型をどのように扱うかを変更します。
`ROLLUP`、`CUBE`、`GROUPING SETS` の指定子が使用されている場合、一部の集約キーは一部の結果行の生成に使用されないことがあります。
これらのキーに対応する行では、この設定に応じて、カラムはデフォルト値または `NULL` で埋められます。

取りうる値:

- 0 — 欠損値を生成する際に、集約キー型のデフォルト値を使用します。
- 1 — ClickHouse は SQL 標準で定義されているのと同じ方法で `GROUP BY` を実行します。集約キーの型は [Nullable](/sql-reference/data-types/nullable) に変換されます。対応する集約キーのカラムは、そのキーが使用されなかった行については [NULL](/sql-reference/syntax#null) で埋められます。

関連項目:

- [GROUP BY 句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

関数 `h3ToGeo` は、true の場合は (lon, lat)、それ以外の場合は (lat, lon) の順で返します。

## handshake_timeout_ms \{#handshake_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

ハンドシェイク時にレプリカから Hello パケットを受信するためのタイムアウト時間（ミリ秒単位）。

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS エンジンのテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを有効または無効にします。有効な場合、各 `INSERT` のたびに、次のパターンと同様の名前で新しい HDFS ファイルが作成されます。

例: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

取り得る値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追加します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合、HDFS テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み込む際、対象のファイルが存在しなくてもエラーとせず無視します。

取りうる値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## hdfs_replication \{#hdfs_replication\}

<SettingsInfoBlock type="UInt64" default_value="0" />

実際のレプリケーション数は、HDFS ファイルの作成時に指定できます。

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[HDFS](../../engines/table-engines/integrations/hdfs.md) エンジンのテーブルで、空ファイルをスキップするかどうかを制御します。

設定可能な値:

- 0 — 空ファイルが指定されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "HDFS エンジンで ListObjects リクエストがいずれのファイルにもマッチしない場合に、空のクエリ結果ではなくエラーをスローできるようにする"}]}]}/>

glob 展開ルールに従ってマッチするファイルが 0 件の場合にエラーをスローします。

Possible values:

- 1 — `SELECT` が例外をスローします。
- 0 — `SELECT` が空の結果を返します。

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

`hdfs` エンジンのテーブルで `INSERT` を行う前にファイルを truncate（切り詰め）する処理を有効または無効にします。無効になっている場合、HDFS 内にファイルがすでに存在するときに `INSERT` を試みると例外がスローされます。

指定可能な値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリはファイルの既存コンテンツを新しいデータで置き換えます。

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "以前の接続タイムアウトと整合させるため、ヘッジ付きリクエストで新しい接続を開始するまでの時間を100 msから50 msに短縮"}]}]}/>

ヘッジ付きリクエストでレプリカへの接続を確立する際の接続タイムアウト

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\}

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新しい設定です。以前は、この値は CREATE INDEX で任意指定でき、デフォルトでは 64 でした。"}]}]}/>

ベクトル類似度索引を検索する際の動的な候補リストのサイズで、「ef_search」とも呼ばれます。

## hsts_max_age \{#hsts_max_age\}

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS の有効期間。0 を指定すると HSTS は無効になります。

## http_connection_timeout \{#http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 接続タイムアウト（秒単位）。

指定可能な値:

- 正の整数。
- 0 - 無効（タイムアウトなし）。

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

指定した間隔より短い間隔で HTTP ヘッダー `X-ClickHouse-Progress` を送信しません。

## http_make_head_request \{#http_make_head_request\}

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 設定は、HTTP からデータを読み込む際に `HEAD` リクエストを実行し、読み取るファイルのサイズなどの情報を取得できるようにします。デフォルトで有効になっているため、サーバーが `HEAD` リクエストをサポートしていない場合などには、この設定を無効化することを検討できます。

## http_max_field_name_size \{#http_max_field_name_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダーのフィールド名の最大長

## http_max_field_value_size \{#http_max_field_value_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダーのフィールド値の最大長

## http_max_fields \{#http_max_fields\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP ヘッダー内のフィールド数の上限

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

multipart/form-data コンテンツのサイズ上限です。この設定は URL パラメータからは指定できず、ユーザープロファイルで設定する必要があります。なお、コンテンツはクエリ実行開始前に解析され、その際に外部テーブルがメモリ上に作成されます。この段階に影響を与えるのはこの制限のみです（`max_memory_usage` や `max_execution_time` の制限は、HTTP フォームデータの読み取り中には影響しません）。

## http_max_request_param_data_size \{#http_max_request_param_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

事前定義された HTTP リクエストで、クエリパラメータとして使用されるリクエストデータのサイズの上限。

## http_max_tries \{#http_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

HTTP 経由での読み取り試行の最大回数。

## http_max_uri_size \{#http_max_uri_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

HTTP リクエストの URI 長の上限を設定します。

設定可能な値：

- 正の整数値。

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\}

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントから送信される HTTP POST データを伸長する際に、チェックサム検証を有効または無効にします。ClickHouse ネイティブ圧縮形式でのみ使用されます（`gzip` や `deflate` では使用されません）。

詳細については、[HTTP インターフェイスの説明](/interfaces/http)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## http_receive_timeout \{#http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "http_send_timeout を参照してください。"}]}]}/>

HTTP 受信のタイムアウト（秒単位）。

設定可能な値:

- 任意の正の整数。
- 0 - 無効（無限タイムアウト）。

## http_response_buffer_size \{#http_response_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クライアントにHTTPレスポンスを送信する前、または（`http_wait_end_of_query` が有効な場合は）ディスクへフラッシュする前に、サーバーのメモリ内でバッファリングするバイト数です。

## http_response_headers \{#http_response_headers\}

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "New setting."}]}]}/>

サーバーがクエリの実行に成功したレスポンスで返す HTTP ヘッダーを追加または上書きできるようにします。
これは HTTP インターフェイスにのみ影響します。

ヘッダーが既定で既に設定されている場合、指定した値でその値が上書きされます。
ヘッダーが既定では設定されていない場合は、ヘッダーの一覧に追加されます。
サーバーによって既定で設定され、この設定で上書きされていないヘッダーは、そのまま保持されます。

この設定では、ヘッダーに固定の値を設定できます。現時点では、動的に計算された値をヘッダーに設定する方法はありません。

名前と値のいずれにも ASCII 制御文字を含めることはできません。

ユーザーが設定を変更できる UI アプリケーションを実装しつつ、同時に返されたヘッダーに基づいて判断や処理を行う場合は、この設定を `readonly` に制限することを推奨します。

例: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP 経由での読み取りを再試行する際のバックオフの最小時間（ミリ秒）

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

HTTP 経由での読み取りを再試行する際に使用されるバックオフの最大時間（ミリ秒）

## http_send_timeout \{#http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 minutes seems crazy long. Note that this is timeout for a single network write call, not for the whole upload operation."}]}]}/>

HTTP 送信タイムアウト（秒単位）。

設定可能な値:

- 任意の正の整数。
- 0 - 無効（タイムアウト無制限）。

:::note
デフォルトのプロファイルにのみ適用されます。変更を反映するにはサーバーの再起動が必要です。
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\}

<SettingsInfoBlock type="Bool" default_value="1" />

HTTP_NOT_FOUND エラーが発生したグロブに一致する URL をスキップする

## http_wait_end_of_query \{#http_wait_end_of_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー側で HTTP レスポンスのバッファリングを有効にします。

## http_write_exception_in_output_format \{#http_write_exception_in_output_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "フォーマット間の一貫性を保つために変更。"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "HTTP ストリーミングでの例外発生時に有効な JSON/XML を出力。"}]}]}/>

例外を出力フォーマットに書き込み、有効な出力を生成します。JSON および XML フォーマットで機能します。

## http_zlib_compression_level \{#http_zlib_compression_level\}

<SettingsInfoBlock type="Int64" default_value="3" />

[enable_http_compression = 1](#enable_http_compression) の場合、HTTP リクエストに対するレスポンスで使用されるデータ圧縮レベルを設定します。

指定可能な値: 1 から 9 までの数値。

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

DROP 時にすべての Iceberg ファイルを削除するかどうかを制御します。

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

INSERT 操作時の iceberg Parquet データファイルの最大サイズ（バイト単位）。

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "新しい設定。"}]}]}/>

Iceberg テーブルエンジンにおいて、1 回の INSERT 操作ごとに許可されるパーティション数の最大値。

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "New setting."}]}]}/>

INSERT 操作時に作成される Iceberg Parquet データファイルの最大行数。

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい設定"}]}]}/>

`.metadata.json` ファイルを圧縮する方法。

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\}

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "新しい設定です。"}]}]}/>

Iceberg テーブルに対するメタデータのログ出力レベルを `system.iceberg_metadata_log` に対して制御します。
通常、この設定はデバッグ目的でのみ変更します。

設定可能な値:

- none - メタデータログなし。
- metadata - ルートの `metadata.json` ファイル。
- manifest_list_metadata - 上記すべて + スナップショットに対応する Avro manifest list からのメタデータ。
- manifest_list_entry - 上記すべて + Avro manifest list のエントリ。
- manifest_file_metadata - 上記すべて + 走査された Avro manifest file からのメタデータ。
- manifest_file_entry - 上記すべて + 走査された Avro manifest file のエントリ。

## iceberg_snapshot_id \{#iceberg_snapshot_id\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting."}]}]}/>

特定のスナップショット ID を指定して Iceberg テーブルに対してクエリを実行します。

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting."}]}]}/>

特定のタイムスタンプ時点で有効だったスナップショットを使用して Iceberg テーブルをクエリします。

## idle_connection_timeout \{#idle_connection_timeout\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

指定した秒数が経過した後に、アイドル状態の TCP 接続を閉じるためのタイムアウト。

取り得る値:

- 正の整数（0 - 0 秒後に即座に接続を閉じる）。

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ有効です。新しいデータパーツは、事前にウォームアップされる（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）か、指定した秒数が経過するまで SELECT クエリから除外されます。Replicated-/SharedMergeTree のみに適用されます。

## ignore_data_skipping_indices \{#ignore_data_skipping_indices\}

クエリで使用される場合、指定されたスキップ索引を無視します。

次の例を考えてみます。

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

いずれの索引も無視しない場合のクエリ:

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

`xy_idx` という索引を無視する:

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

MergeTree ファミリーに属するテーブルで動作します。


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "テスト目的で、指定した確率でサーバーが DROP クエリを無視できるようにする"}]}]}/>

有効にすると、サーバーは指定した確率で、すべての DROP TABLE クエリを無視します（Memory および JOIN エンジンの場合は、DROP を TRUNCATE に置き換えます）。テスト目的で使用されます。

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "削除されたターゲットテーブルを持つ materialized view を無視できるようにする新しい設定を追加"}]}]}/>

VIEW へのプッシュ時に、削除されたターゲットテーブルを持つ materialized view を無視する

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされたアクセスエンティティを管理するクエリでは、`ON CLUSTER` 句を無視します。

## ignore_on_cluster_for_replicated_database \{#ignore_on_cluster_for_replicated_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "レプリケートされたデータベースを対象とする DDL クエリで ON CLUSTER 句を無視する新しい設定を追加しました。"}]}]}/>

レプリケートされたデータベースを対象とする DDL クエリに対して、ON CLUSTER 句を常に無視します。

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "レプリケートされた named collection を管理するクエリに対して ON CLUSTER 句を無視します。"}]}]}/>

レプリケートされた named collection を管理するクエリに対して ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケート UDF の管理クエリに対しては、ON CLUSTER 句を無視します。

## implicit_select \{#implicit_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

先頭の `SELECT` キーワードなしで単純な `SELECT` クエリを記述できるようにし、例えば `1 + 2` のような電卓的な利用方法でも有効なクエリとして扱えるようにします。

`clickhouse-local` ではデフォルトで有効であり、明示的に無効化できます。

## implicit_table_at_top_level \{#implicit_table_at_top_level\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "clickhouse-local で使用される新しい setting"}]}]}/>

空でない場合、トップレベルで FROM を含まないクエリは、`system.one` の代わりにこのテーブルから読み取ります。

これは clickhouse-local で入力データの処理に使用されます。
この setting はユーザーが明示的に指定することもできますが、そのような用途を意図したものではありません。

副問い合わせはこの setting の影響を受けません（スカラー副問い合わせ、FROM 句付き副問い合わせ、IN 句付き副問い合わせのいずれも同様です）。
UNION、INTERSECT、EXCEPT チェーンのトップレベルにある SELECT は、一様に扱われ、この setting の影響を受けます。これは括弧でどのようにグループ化されていても同様です。
この setting が VIEW や分散クエリにどのように影響するかは規定されていません。

この setting はテーブル名（その場合、テーブルはカレントデータベースから解決されます）、または 'database.table' 形式の修飾名を受け取ります。
database 名と table 名の両方はクォートされていてはならず、単純な識別子のみが許可されます。

## implicit_transaction \{#implicit_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

有効化されており、かつすでにトランザクション内で実行されていない場合、クエリ全体を 1 つの完全なトランザクション（begin + commit または rollback）としてラップします。

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

有効化すると、ORDER BY 句を含まない SELECT クエリに対して `ORDER BY rand()` を挿入します。
サブクエリの深さが 0 の場合にのみ適用されます。サブクエリおよび `INSERT INTO ... SELECT` には影響しません。
トップレベルの構文要素が `UNION` の場合、`ORDER BY rand()` はすべての子に対して個別に挿入されます。
ORDER BY を指定しないことが非決定的なクエリ結果の原因となるため、テストおよび開発用途でのみ有用です。

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、INSERT 時にマテリアライズドカラムの使用を許可します。

## insert_deduplicate \{#insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` のブロック重複排除を有効または無効にします（Replicated\* テーブル向け）。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルトでは、`INSERT` ステートメントによって Replicated テーブルに挿入されるブロックは重複排除されます（[Data Replication](../../engines/table-engines/mergetree-family/replication.md) を参照）。
Replicated テーブルでは、デフォルトで各パーティションごとに直近 100 個のブロックのみが重複排除の対象となります（[replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
非 Replicated テーブルについては [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

## insert_deduplication_token \{#insert_deduplication_token\}

この設定により、ユーザーは MergeTree/ReplicatedMergeTree において独自の重複排除ロジックを指定できます。
たとえば、各 INSERT ステートメントでこの設定に一意な値を指定することで、
同じデータが挿入されても重複排除されてしまうことを防ぐことができます。

設定可能な値:

* 任意の文字列

`insert_deduplication_token` は、空でない場合に *のみ* 重複排除に使用されます。

レプリケーションありのテーブルでは、デフォルトで各パーティションについて直近 100 個の INSERT だけが重複排除されます（[replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケーションなしのテーブルについては [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

:::note
`insert_deduplication_token` はパーティションレベルで動作します（`insert_deduplication` チェックサムと同様）。複数のパーティションが同じ `insert_deduplication_token` を持つことができます。
:::

例:

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

挿入時の keeper リクエストに対する障害発生のおおよその確率です。有効な値の範囲は [0.0f, 1.0f] です。

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 の場合はランダムシード、それ以外の場合はこの設定値

## insert_keeper_max_retries \{#insert_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "INSERT 時に Keeper への再接続を有効化し、信頼性を向上"}]}]} />

この設定は、レプリケートされた MergeTree テーブルへの INSERT 中に送信される ClickHouse Keeper（または ZooKeeper）リクエストの最大再試行回数を設定します。ネットワークエラー、Keeper セッションのタイムアウト、またはリクエストのタイムアウトによって失敗した Keeper リクエストのみが再試行対象となります。

取り得る値:

* 正の整数。
* 0 — 再試行を無効化

Cloud におけるデフォルト値: `20`。

Keeper リクエストの再試行は、一定の待ち時間の後に行われます。この待ち時間は、`insert_keeper_retry_initial_backoff_ms`、`insert_keeper_retry_max_backoff_ms` の各設定によって制御されます。
最初の再試行は、`insert_keeper_retry_initial_backoff_ms` で指定された待ち時間の経過後に実行されます。以降の待ち時間は次のように計算されます:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例えば、`insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000`、`insert_keeper_max_retries=8` の場合、タイムアウトは `100, 200, 400, 800, 1600, 3200, 6400, 10000` となります。

フォールトトレランスに加えて、リトライはより良いユーザーエクスペリエンスの提供も目的としています。例えば、アップグレードなどにより Keeper が再起動された場合でも、INSERT の実行中にエラーを返さずに済むようにします。


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

INSERT クエリ実行中に失敗した Keeper リクエストを再試行する際の初回タイムアウト（ミリ秒）

指定可能な値:

- 正の整数。
- 0 — タイムアウトなし

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

INSERT クエリの実行中に失敗した Keeper リクエストを再試行する際の最大タイムアウト（ミリ秒）

設定可能な値:

- 正の整数。
- 0 — 最大タイムアウトは無制限

## insert_null_as_default \{#insert_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

[Nullable](/sql-reference/data-types/nullable) ではないデータ型のカラムに対して、[NULL](/sql-reference/syntax#null) を挿入する代わりに[デフォルト値](/sql-reference/statements/create/table#default_values)を挿入するかどうかを切り替えます。
カラムの型が Nullable ではなく、この設定が無効になっている場合、`NULL` を挿入すると例外が発生します。カラムの型が Nullable の場合は、この設定に関係なく `NULL` 値はそのまま挿入されます。

この設定は [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリに適用されます。`SELECT` サブクエリは `UNION ALL` 句で結合されている場合があります。

設定可能な値:

- 0 — Nullable ではないカラムに `NULL` を挿入すると例外が発生します。
- 1 — `NULL` の代わりにカラムのデフォルト値が挿入されます。

## insert_quorum \{#insert_quorum\}

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
この設定は SharedMergeTree には適用されません。詳細は [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム書き込みを有効にします。

- `insert_quorum < 2` の場合、クォーラム書き込みは無効です。
- `insert_quorum >= 2` の場合、クォーラム書き込みは有効です。
- `insert_quorum = 'auto'` の場合、クォーラム数として過半数（`number_of_replicas / 2 + 1`）が使用されます。

クォーラム書き込み

`INSERT` は、ClickHouse が `insert_quorum_timeout` の間に `insert_quorum` 個のレプリカへ正しくデータを書き込むことに成功した場合にのみ成功と見なされます。何らかの理由で書き込みに成功したレプリカの数が `insert_quorum` に達しない場合、その書き込みは失敗と見なされ、ClickHouse はすでにデータが書き込まれているすべてのレプリカから挿入済みブロックを削除します。

`insert_quorum_parallel` が無効な場合、クォーラム内のすべてのレプリカは整合性が取れており、すなわちそれまでのすべての `INSERT` クエリからのデータを保持します（`INSERT` のシーケンスは直列化されます）。`insert_quorum` を使用して書き込まれたデータを読み取り、かつ `insert_quorum_parallel` が無効な場合、[`select_sequential_consistency`](#select_sequential_consistency) を使用して `SELECT` クエリに対して逐次一貫性を有効にできます。

ClickHouse は次のような場合に例外をスローします。

- クエリ時点で利用可能なレプリカ数が `insert_quorum` より少ない場合。
- `insert_quorum_parallel` が無効で、前のブロックがまだレプリカの `insert_quorum` に挿入されていない状態でデータを書き込もうとした場合。この状況は、`insert_quorum` を指定した直前の `INSERT` が完了する前に、同じテーブルに対して別の `INSERT` クエリを実行しようとした場合に発生する可能性があります。

関連項目:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで並列クォーラム INSERT を使用します。逐次クォーラム INSERT よりも大幅に扱いやすくなります"}]}]}/>

:::note
この設定は SharedMergeTree には適用されません。詳細は [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム `INSERT` クエリの並列実行を有効または無効にします。有効な場合は、前のクエリがまだ完了していなくても、追加の `INSERT` クエリを送信できます。無効な場合は、同じテーブルへの追加の書き込みは拒否されます。

取り得る値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\}

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

クオーラム書き込みのタイムアウトをミリ秒単位で指定します。タイムアウトが経過しても書き込みがまだ行われていない場合、ClickHouse は例外を発生させ、クライアントは同じブロックを同じレプリカまたは任意の別のレプリカに書き込むためにクエリを再実行する必要があります。

参照:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_shard_id \{#insert_shard_id\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`0` 以外の場合、データを同期的に挿入する先となる [Distributed](/engines/table-engines/special/distributed) テーブルの分片を指定します。

`insert_shard_id` の値が正しくない場合、サーバーは例外をスローします。

`requested_cluster` 上の分片数を取得するには、サーバーの設定を確認するか、次のクエリを使用できます。

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

可能な値:

* 0 — 無効。
* 対応する [Distributed](/engines/table-engines/special/distributed) テーブルにおける `1` から `shards_num` までの任意の数値。

**例**

クエリ:

```sql
CREATE TABLE x AS system.numbers ENGINE = MergeTree ORDER BY number;
CREATE TABLE x_dist AS x ENGINE = Distributed('test_cluster_two_shards_localhost', currentDatabase(), x);
INSERT INTO x_dist SELECT * FROM numbers(5) SETTINGS insert_shard_id = 1;
SELECT * FROM x_dist ORDER BY number ASC;
```

結果：

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

リクエスト実行がキャンセルされているかを確認し、進行状況を送信するための、マイクロ秒単位の間隔です。

## intersect_default_mode \{#intersect_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

INTERSECT クエリにおけるデフォルトモードを設定します。取り得る値: 空文字列、'ALL'、'DISTINCT'。空文字列の場合、モードを指定しないクエリは例外を送出します。

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

トレースログ内で jemalloc の割り当ておよび解放のサンプルを収集します。

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

クエリに対して jemalloc プロファイラを有効にします。jemalloc はメモリアロケーションをサンプリングし、サンプリングされたアロケーションに対するすべての解放処理を記録します。
プロファイルは、メモリアロケーションの分析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使ってフラッシュできます。
サンプルは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を用いて `system.trace_log` に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## join_algorithm \{#join_algorithm\}

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' は明示的に指定された join アルゴリズムを優先するため非推奨となり、さらに parallel_hash が hash よりも推奨されるようになりました"}]}]}/>

どの [JOIN](../../sql-reference/statements/select/join.md) アルゴリズムを使用するかを指定します。

複数のアルゴリズムを指定でき、指定された中から、結合の種類/厳格さやテーブルエンジンに基づいて、そのクエリで利用可能なものが選択されます。

指定可能な値:

- grace_hash

[Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join) を使用します。Grace hash は、メモリ使用量を抑えつつ、複雑な join を高い性能で実行するためのアルゴリズムオプションを提供します。

grace join の第 1 フェーズでは、右側のテーブルを読み込み、キーとなるカラムのハッシュ値に応じて N 個のバケットに分割します (初期値の N は `grace_hash_join_initial_buckets`)。これは、それぞれのバケットが独立して処理できるように行われます。最初のバケットの行はインメモリのハッシュテーブルに追加され、残りの行はディスクに保存されます。ハッシュテーブルがメモリ制限 (たとえば [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) で設定) を超えて成長した場合、バケット数が増やされ、各行に再度バケットが割り当てられます。現在のバケットに属さない行はフラッシュされて再割り当てされます。

`INNER/LEFT/RIGHT/FULL ALL/ANY JOIN` をサポートします。

- hash

[Hash join アルゴリズム](https://en.wikipedia.org/wiki/Hash_join) を使用します。結合の種類と厳格さのあらゆる組み合わせ、および `JOIN ON` 句の中で `OR` で組み合わされた複数の join キーをサポートする、最も汎用的な実装です。

`hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM に読み込まれます。

- parallel_hash

`hash` join のバリエーションで、データをバケットに分割し、1 つではなく複数のハッシュテーブルを並行して構築することで、この処理を高速化します。

`parallel_hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM に読み込まれます。

- partial_merge

[ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) のバリエーションで、右側のテーブルのみが完全にソートされます。

`RIGHT JOIN` および `FULL JOIN` は `ALL` 厳格さでのみサポートされます (`SEMI`、`ANTI`、`ANY`、`ASOF` はサポートされません)。

`partial_merge` アルゴリズムを使用する場合、ClickHouse はデータをソートし、ディスクにダンプします。ClickHouse における `partial_merge` アルゴリズムは、古典的な実装とはわずかに異なります。まず、ClickHouse は右テーブルを join キーでブロックごとにソートし、ソート済みブロックに対して min-max 索引を作成します。次に、左テーブルの一部を `join key` でソートし、それらを右テーブルと join します。この際、不要な右テーブルブロックをスキップするために min-max 索引も使用されます。

- direct

`direct` (ネストしたループとしても知られる) アルゴリズムは、左テーブルの行をキーとして使用して右テーブルをルックアップします。
これは、[Dictionary](/engines/table-engines/special/dictionary)、[EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md)、および [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブルなどの特殊なストレージでサポートされています。

MergeTree テーブルに対しては、このアルゴリズムは join キーフィルタをストレージレイヤに直接プッシュダウンします。キーがテーブルのプライマリキー索引を利用してルックアップできる場合、これによりより効率的になる可能性があります。それ以外の場合、左テーブルの各ブロックに対して右テーブルのフルスキャンを実行します。

`INNER` および `LEFT` join をサポートし、その他の条件を伴わない単一カラムの等価 join キーのみをサポートします。

- auto

`auto` に設定すると、まず `hash` join を試行し、メモリ制限に違反した場合にはオンザフライで別のアルゴリズムに切り替えます。

- full_sorting_merge

join を行う前に、join 対象のテーブルを完全にソートする [ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) です。

- prefer_partial_merge

ClickHouse は可能な限り常に `partial_merge` join を使用しようとし、それが不可能な場合は `hash` を使用します。*非推奨* であり、`partial_merge,hash` と同義です。

- default (deprecated)

レガシーな値のため、今後は使用しないでください。
`direct,hash` と同じであり、direct join と hash join を (この順序で) 試行します。

## join_any_take_last_row \{#join_any_take_last_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

`ANY` strictness の `JOIN` 演算における動作を変更します。

:::note
この設定が適用されるのは、[Join](../../engines/table-engines/special/join.md) エンジンのテーブルに対する `JOIN` 演算のみです。
:::

設定可能な値:

- 0 — 右側のテーブルで一致する行が複数ある場合、最初に見つかった 1 行だけが結合されます。
- 1 — 右側のテーブルで一致する行が複数ある場合、最後に見つかった 1 行だけが結合されます。

関連項目:

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\}

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

[JOIN 句](/sql-reference/statements/select/join)のデフォルトの厳格さを設定します。

指定可能な値:

- `ALL` — 右テーブルに複数の一致する行がある場合、ClickHouse は一致する行から[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を作成します。これは標準 SQL における通常の `JOIN` の動作です。
- `ANY` — 右テーブルに複数の一致する行がある場合、最初に見つかった 1 行だけが結合されます。右テーブルに 1 行だけ一致する行がある場合、`ANY` と `ALL` の結果は同じになります。
- `ASOF` — 一致が不確実なシーケンスを結合するために使用します。
- `Empty string` — クエリで `ALL` もしくは `ANY` が指定されていない場合、ClickHouse は例外をスローします。

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\}

<SettingsInfoBlock type="UInt64" default_value="64" />

MergeJoin をディスク上で実行する際に、並列ソートに使用できるファイル数の上限を制御します。

この設定値が大きいほど、より多くの RAM が使用され、必要なディスク I/O は少なくなります。

設定可能な値:

- 2 以上の任意の正の整数。

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "ハッシュ結合で行リスト形式で出力するかどうかを判定するための、右側テーブルにおけるキーごとの平均行数の下限値。"}]}]}/>

ハッシュ結合で行リスト形式で出力するかどうかを判定するための、右側テーブルにおけるキーごとの平均行数の下限値。

## join_overflow_mode \{#join_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

次のいずれかの JOIN 制限に達したときに、ClickHouse がどのように動作するかを定義します:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

取りうる値:

- `THROW` — ClickHouse は例外をスローし、処理を中断します。
- `BREAK` — ClickHouse は例外をスローせずに処理を中断します。

デフォルト値: `THROW`.

**関連情報**

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブル エンジン](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

JOIN のランタイムフィルターとして使用される Bloom filter のサイズ（バイト単位）。`enable_join_runtime_filters` SETTING を参照。

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

JOIN ランタイムフィルターとして使用される Bloom フィルターで利用されるハッシュ関数の数（`enable_join_runtime_filters` 設定を参照）。

## join_runtime_bloom_filter_max_ratio_of_set_bits \{#join_runtime_bloom_filter_max_ratio_of_set_bits\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

ランタイム Bloom フィルター内でセットされているビット数がこの比率を超えた場合、オーバーヘッドを抑えるためにフィルターは完全に無効化されます。

## join_runtime_filter_blocks_to_skip_before_reenabling \{#join_runtime_filter_blocks_to_skip_before_reenabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "30"},{"label": "New setting"}]}]}/>

フィルタリング効率が低いために一度無効化されたランタイムフィルタを、動的に再度有効化しようとする前にスキップするブロック数。

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

実行時フィルタ内で、要素を Set にそのまま格納できる最大要素数。この閾値を超えると、Bloom フィルタに切り替わります。

## join_runtime_filter_pass_ratio_threshold_for_disabling \{#join_runtime_filter_pass_ratio_threshold_for_disabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

通過した行数の検査した行数に対する比率がこのしきい値を超える場合、そのランタイムフィルタはパフォーマンスが低いと見なされ、オーバーヘッドを減らすために次の `join_runtime_filter_blocks_to_skip_before_reenabling` ブロックの間は無効化されます。

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "LEFT JOIN または INNER JOIN において、右側テーブルをキーで再ソートするかどうかを判定するための、右側テーブル内の最大行数"}]}]}/>

LEFT JOIN または INNER JOIN において、右側テーブルをキーで再ソートするかどうかを判定するための、右側テーブル内の最大行数。

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "左結合または内部結合において、右側テーブルをキーで再度並べ替えるかどうかを判断するための、右側テーブルにおけるキーごとの平均行数の下限値。この設定により、スパースなキーを持つテーブルに対しては最適化が適用されないことが保証されます"}]}]}/>

左結合または内部結合において、右側テーブルをキーで再度並べ替えるかどうかを判断するための、右側テーブルにおけるキーごとの平均行数の下限値。この設定により、スパースなキーを持つテーブルに対しては最適化が適用されないことが保証されます

## join_use_nulls \{#join_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JOIN](../../sql-reference/statements/select/join.md) の動作の種類を設定します。テーブルを結合する際、空のセルが生じる場合があります。ClickHouse はこの設定に基づいて、それらを異なる方法で補完します。

設定可能な値:

- 0 — 空のセルは対応するフィールド型のデフォルト値で埋められます。
- 1 — `JOIN` は標準 SQL と同じように動作します。対応するフィールドの型は [Nullable](/sql-reference/data-types/nullable) に変換され、空のセルは [NULL](/sql-reference/syntax) で埋められます。

## joined_block_split_single_row \{#joined_block_split_single_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

左テーブルの単一の行に対応する行ごとに、ハッシュ結合の結果を chunk に分割できるようにします。
これは、右テーブル側で多数の一致を持つ行がある場合のメモリ使用量を削減するのに役立ちますが、CPU 使用量が増加する可能性があります。
この設定を有効にするには、`max_joined_block_size_rows != 0` が必須である点に注意してください。
偏ったデータで、右テーブルに多数の一致を持つ大きな行が存在する場合に過度なメモリ使用量を避けるために、この設定と `max_joined_block_size_bytes` を組み合わせると有用です。

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\}

<SettingsInfoBlock type="Bool" default_value="1" />

結合に用いられるサブクエリおよびテーブル関数には、名前を正しく修飾するためのエイリアス指定を必須とします。

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

利用可能な CPU コア数に基づく `kafka_num_consumers` の制限を無効にします。

## kafka_max_wait_ms \{#kafka_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

再試行前に [Kafka](/engines/table-engines/integrations/kafka) からメッセージを読み取る際の待機時間（ミリ秒）。

可能な値:

- 正の整数。
- 0 — 無限タイムアウト。

関連項目:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

KeeperMap での操作時に追加のチェックを行います。例えば、既に存在するキーに対して insert を行った場合に例外をスローします。

## keeper_max_retries \{#keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "Keeper の一般的な処理の最大リトライ回数"}]}]}/>

Keeper の一般的な処理の最大リトライ回数

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "一般的な keeper 操作向けのバックオフ初期待機時間"}]}]}/>

一般的な keeper 操作向けのバックオフ初期待機時間

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "Keeper の一般的な操作に対する最大バックオフ時間"}]}]}/>

Keeper の一般的な操作に対する最大バックオフ時間

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

この設定を有効にすると、関数 `least` および `greatest` は、引数のいずれかが NULL の場合に NULL を返します。

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "互換性のためだけに追加された設定です。バージョン 21.7 未満からそれより新しいバージョンへクラスタをローリングアップデートする際に、`true` に設定することに意味があります。"}]}]}/>

大きなタプルリテラルについて、ハッシュの代わりにすべての要素名をカラム名に含めます。この設定は互換性のためだけに存在します。バージョン 21.7 未満からそれより新しいバージョンへクラスタをローリングアップデートする際に、`true` に設定することに意味があります。

## lightweight_delete_mode \{#lightweight_delete_mode\}

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

論理削除の一部として実行される、内部的な更新クエリのモードです。

取りうる値:

- `alter_update` - ヘビーウェイトなミューテーションを作成する `ALTER UPDATE` クエリを実行します。
- `lightweight_update` - 可能であれば論理更新を実行し、それ以外の場合は `ALTER UPDATE` を実行します。
- `lightweight_update_force` - 可能であれば論理更新を実行し、それ以外の場合はエラーをスローします。

## lightweight_deletes_sync \{#lightweight_deletes_sync\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "「mutation_sync」と同様ですが、論理削除の実行のみを制御します"}]}]}/>

[`mutations_sync`](#mutations_sync) と同様ですが、論理削除の実行のみを制御します。

取り得る値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | ミューテーションは非同期で実行されます。                                                                                                              |
| `1`   | クエリは、現在のサーバーで論理削除が完了するまで待機します。                                                                                          |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で論理削除が完了するまで待機します。                                                                        |
| `3`   | クエリはアクティブなレプリカのみが完了するのを待機します。`SharedMergeTree` の場合のみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同じ動作になります。|

**関連項目**

- [ALTER クエリの同期性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Mutations](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ結果から取得する最大行数を設定します。クエリで指定された [LIMIT](/sql-reference/statements/select/limit) 句の値を、この設定によって制限し、クエリ内で指定された上限がこの設定値を超えないようにします。

指定可能な値:

- 0 — 行数に制限はありません。
- 正の整数。

## load_balancing \{#load_balancing\}

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

分散クエリ処理で使用されるレプリカ選択アルゴリズムを指定します。

ClickHouse は、レプリカを選択するためのアルゴリズムとして次をサポートしています。

- [Random](#load_balancing-random)（デフォルト）
- [Nearest hostname](#load_balancing-nearest_hostname)
- [Hostname levenshtein distance](#load_balancing-hostname_levenshtein_distance)
- [In order](#load_balancing-in_order)
- [First or random](#load_balancing-first_or_random)
- [Round robin](#load_balancing-round_robin)

関連項目：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### ランダム（デフォルト） \{#load_balancing-random\}

```sql
load_balancing = random
```

エラーの数は各レプリカごとにカウントされます。クエリはエラー数が最も少ないレプリカに送信され、もしそのようなレプリカが複数ある場合は、そのいずれか1つに送信されます。
欠点: サーバーの近接性は考慮されません。また、レプリカ間でデータが異なる場合、取得されるデータもレプリカによって異なります。


### 最も近いホスト名 \{#load_balancing-nearest_hostname\}

```sql
load_balancing = nearest_hostname
```

エラーの数は各レプリカごとにカウントされます。5分ごとに、エラー数は整数除算で2で割られます。したがって、エラー数は指数平滑化により直近の時間に対して計算されます。エラー数が最小のレプリカが1つだけ存在する場合（つまり、他のレプリカで最近エラーが発生している場合）、クエリはそのレプリカに送信されます。エラー数が最小で同じ値のレプリカが複数ある場合、クエリは、configファイル内のサーバーのホスト名と最も似ているホスト名を持つレプリカに送信されます（両方のホスト名の最小長まで、同じ位置にある文字のうち異なる文字数に基づいて比較）。

たとえば、example01-01-1 と example01-01-2 は1文字分だけ異なりますが、example01-01-1 と example01-02-2 は2か所異なります。
この方法は単純に見えるかもしれませんが、ネットワークトポロジに関する外部データを必要とせず、またIPアドレスを比較する必要もありません。IPv6アドレスではそれが複雑になるためです。

したがって、同等のレプリカがある場合は、ホスト名が最も近いものが優先されます。
また、障害がない場合に同じサーバーにクエリを送信すると、分散クエリも一貫して同じサーバー群に送信されると考えることができます。そのため、レプリカ上に異なるデータが配置されていても、クエリはほぼ同じ結果を返します。


### ホスト名のレーベンシュタイン距離 \{#load_balancing-hostname_levenshtein_distance\}

```sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname` と同様ですが、ホスト名を [レーベンシュタイン距離](https://en.wikipedia.org/wiki/Levenshtein_distance) に基づいて比較します。例えば、次のようになります。

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### 順番に \{#load_balancing-in_order\}

```sql
load_balancing = in_order
```

同じエラー数を持つレプリカには、設定で指定された順序どおりにアクセスされます。
この方法は、どのレプリカを優先するかを明確に把握している場合に適しています。


### First または Random（ランダム） \{#load_balancing-first_or_random\}

```sql
load_balancing = first_or_random
```

このアルゴリズムは、Set 内の最初のレプリカ、またはその最初のレプリカが利用できない場合はランダムなレプリカを選択します。クロスレプリケーション・トポロジ構成では有効ですが、それ以外の構成ではほとんど有用ではありません。

`first_or_random` アルゴリズムは、`in_order` アルゴリズムが抱える問題を解決します。`in_order` では、あるレプリカがダウンすると、次のレプリカが通常の 2 倍の負荷を受け、残りのレプリカは通常どおりのトラフィック量を処理します。`first_or_random` アルゴリズムを使用すると、利用可能なレプリカ間で負荷が均等に分散されます。

`load_balancing_first_offset` SETTING を使用することで、どのレプリカを最初のレプリカとするかを明示的に定義できます。これにより、クエリのワークロードをレプリカ間でリバランスする際の制御の自由度が向上します。


### ラウンドロビン \{#load_balancing-round_robin\}

```sql
load_balancing = round_robin
```

このアルゴリズムは、同じエラー数のレプリカ間でラウンドロビンポリシーにより処理を分散します（この際、`round_robin` ポリシーが設定されたクエリのみが対象となります）。


## load_balancing_first_offset \{#load_balancing_first_offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

FIRST_OR_RANDOM ロードバランシング戦略を使用する際に、どのレプリカにクエリを優先的に送信するかを指定します。

## load_marks_asynchronously \{#load_marks_asynchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree のマークを非同期にロードする

## local_filesystem_read_method \{#local_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

ローカルファイルシステムからデータを読み取る方法を指定します。指定できる値は次のいずれかです: read, pread, mmap, io_uring, pread_threadpool。

「io_uring」メソッドは実験的なものであり、Log、TinyLog、StripeLog、File、Set、Join など、追記可能なファイルを持つテーブルで同時に読み書きが行われる場合には動作しません。
インターネット上の「io_uring」に関するさまざまな記事を読んだとしても、それらを鵜呑みにしないでください。大量の小さな IO リクエストが発生する場合（ClickHouse では該当しません）を除いて、これはファイル読み取りの優れた方法とは言えません。「io_uring」を有効にすべき理由はありません。

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

ローカルファイルシステムからデータを読み込む際にプリフェッチを行うかどうかを制御します。

## lock_acquire_timeout \{#lock_acquire_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

ロック要求が失敗するまでに待機する秒数を定義します。

ロックタイムアウトは、テーブルへの読み取り/書き込み操作の実行中にデッドロックを防止するために使用されます。タイムアウトが期限切れとなりロック要求が失敗すると、ClickHouse サーバーはエラーコード `DEADLOCK_AVOIDED` とともに "Locking attempt timed out! Possible deadlock avoided. Client should retry." という例外をスローします。

設定可能な値:

- 正の整数（秒）。
- 0 — ロックタイムアウトなし。

## log_comment \{#log_comment\}

[system.query&#95;log](../system-tables/query_log.md) テーブルの `log_comment` フィールドの値と、サーバーログ用のコメントテキストを指定します。

サーバーログの可読性を向上させるために使用できます。加えて、[clickhouse-test](../../development/tests.md) を実行した後に `system.query_log` からテストに関連するクエリを絞り込むのにも役立ちます。

指定可能な値:

* [max&#95;query&#95;size](#max_query_size) 以下の任意の文字列。max&#95;query&#95;size を超えた場合、サーバーは例外をスローします。

**例**

クエリ:

```sql
SET log_comment = 'log_comment test', log_queries = 1;
SELECT 1;
SYSTEM FLUSH LOGS;
SELECT type, query FROM system.query_log WHERE log_comment = 'log_comment test' AND event_date >= yesterday() ORDER BY event_time DESC LIMIT 2;
```

結果：

```text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```


## log_formatted_queries \{#log_formatted_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

整形済みクエリを [system.query_log](../../operations/system-tables/query_log.md) システムテーブルにログとして記録します（[system.query_log](../../operations/system-tables/query_log.md) 内の `formatted_query` カラムに値を設定します）。

設定可能な値:

- 0 — 整形済みクエリはシステムテーブルに記録されません。
- 1 — 整形済みクエリはシステムテーブルに記録されます。

## log_processors_profiles \{#log_processors_profiles\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

プロセッサが実行中およびデータ待機中に費やした時間を `system.processors_profile_log` テーブルに書き込みます。

あわせて参照してください:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリのパフォーマンスに関する統計情報を query_log、query_thread_log、および query_views_log に記録します。

## log_queries \{#log_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリログの設定。

このセットアップで ClickHouse に送信されたクエリは、[query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) サーバー構成パラメータで定義されたルールに従って記録されます。

例:

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

クエリの長さが指定されたしきい値（バイト単位）を超える場合、`query_log` に書き込む際にクエリを途中で切り詰めます。通常のテキストログに出力されるクエリの表示長も制限します。

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

この設定が有効（0 以外）になっている場合、この設定値より短時間で終了したクエリはログに記録されません（[MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) における `long_query_time` のようなものと考えられます）。つまり、以下のテーブルにはそれらのクエリは含まれません。

- `system.query_log`
- `system.query_thread_log`

次のタイプのクエリのみがログに記録されます。

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 単位: ミリ秒
- デフォルト値: 0（すべてのクエリが対象）

## log_queries_min_type \{#log_queries_min_type\}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

`query_log` に記録する最小の種別。

指定可能な値:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

どの種類のレコードを `query_log` に書き込むかを制限するために使用できます。例えばエラーのみに関心がある場合は、`EXCEPTION_WHILE_PROCESSING` を使用できます。

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\}

<SettingsInfoBlock type="Float" default_value="1" />

指定した確率に基づき、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、および [query_views_log](../../operations/system-tables/query_views_log.md) システムテーブルに、クエリの一部のみをランダムにサンプリングして書き込みます。1 秒あたりのクエリ数が多い場合の負荷低減に役立ちます。

設定可能な値:

- 0 — クエリはシステムテーブルにログ出力されません。
- [0..1] の範囲の正の浮動小数点数。たとえば、`0.5` に設定した場合、クエリのおよそ半分がシステムテーブルにログ出力されます。
- 1 — すべてのクエリがシステムテーブルにログ出力されます。

## log_query_settings \{#log_query_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

`query_log` および OpenTelemetry の span ログにクエリの設定を記録します。

## log_query_threads \{#log_query_threads\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリスレッドのログ記録を行うための設定です。

クエリスレッドは [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) テーブルにログ出力されます。この設定は、[log&#95;queries](#log_queries) が true の場合にのみ有効です。この設定により ClickHouse によって実行されるクエリのスレッドは、[query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) サーバー設定パラメータのルールに従ってログ記録されます。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

```text
log_query_threads=1
```


## log_query_views \{#log_query_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリビューのログ記録を構成します。

この設定を有効にすると、ClickHouse が実行するクエリに関連するビュー（Materialized View または Live View）は、サーバー設定パラメータ [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) にログとして記録されます。

例:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型を [Native](/interfaces/formats/Native) フォーマットで使用できるかどうかを制御します。

`LowCardinality` の使用が制限されている場合、ClickHouse サーバーは `SELECT` クエリに対しては `LowCardinality` カラムを通常のカラムに変換し、`INSERT` クエリに対しては通常のカラムを `LowCardinality` カラムに変換します。

この設定は主に、`LowCardinality` データ型をサポートしていないサードパーティー クライアント向けに必要となります。

設定可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用が制限されます。

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

ストレージファイルシステムに書き込まれる [LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型用の共有グローバルDictionaryについて、その最大サイズ（行数）を設定します。この設定により、Dictionary が無制限に増加した場合に発生しうる RAM に関する問題を防止します。Dictionary サイズの上限によりエンコードできないデータは、ClickHouse は通常の方法で書き込みます。

可能な値:

- 任意の正の整数。

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

データパーツに対して単一の Dictionary を使用するかどうかを切り替えます。

デフォルトでは、ClickHouse サーバーは Dictionary のサイズを監視し、ある Dictionary が容量を超えた場合には次の Dictionary への書き込みを開始します。複数の Dictionary の作成を禁止するには、`low_cardinality_use_single_dictionary_for_part = 1` を設定します。

指定可能な値:

- 1 — データパーツに対する複数の Dictionary の作成を禁止します。
- 0 — データパーツに対する複数の Dictionary の作成を禁止しません。

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

クエリの優先度付け機構（`priority` 設定を参照）が使用されている場合、低優先度のクエリは高優先度のクエリが完了するまで待機します。この設定で、その待機時間を指定します。

## make_distributed_plan \{#make_distributed_plan\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定"}]}]}/>

分散クエリプランを作成します。

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時にスキップ索引のマテリアライズを無効化できる新しい設定を追加"}]}]}/>

INSERT 時にスキップ索引を構築して保存するかどうかを制御します。無効にした場合、スキップ索引は[マージ中](merge-tree-settings.md/#materialize_skip_indexes_on_merge)または明示的な [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) によってのみ構築および保存されます。

[exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert) も参照してください。

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of statistics on insert"}]}]}/>

INSERT 実行時に統計情報を構築して挿入するかどうかを制御します。この設定を無効にした場合、統計情報はマージ処理中、または明示的な MATERIALIZE STATISTICS によって構築・保存されます。

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\}

<SettingsInfoBlock type="Bool" default_value="1" />

ALTER MODIFY TTL クエリの実行後に、既存データに有効期限 (TTL) を適用します

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\}

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZED VIEW で発生したエラーを無視し、materialized view の有無にかかわらず元のブロックをテーブルに挿入できるようにします

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "必要に応じて従来の動作を維持するための設定を追加。"}]}]}/>

単一の INSERT クエリに対する materialized view の宛先テーブルへの並列 INSERT をまとめて実行し、生成されるパーツの数を減らします。
false に設定し、かつ `parallel_view_processing` が有効な場合、INSERT クエリは宛先テーブルで `max_insert_thread` ごとに 1 つずつパーツを生成します。

## max_analyze_depth \{#max_analyze_depth\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

インタープリタが実行する解析処理の最大回数です。

## max_ast_depth \{#max_ast_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

クエリの構文木の最大ネスト深度です。超過した場合は、例外がスローされます。

:::note
現在のところ、これはパース中ではなく、クエリのパース後にのみチェックされます。
つまり、パース中に深さが大きすぎる構文木が生成される可能性がありますが、
そのクエリは失敗します。
:::

## max_ast_elements \{#max_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

クエリの構文木内の要素数の上限です。これを超えると例外が送出されます。

:::note
現時点ではパース中にはチェックされず、クエリのパース後にのみチェックされます。
そのため、パース中に深さが大きすぎる構文木が作成される可能性がありますが、
その場合クエリは失敗します。
:::

## max_autoincrement_series \{#max_autoincrement_series\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

`generateSerialID` 関数によって作成される series の数の上限です。

各 series は Keeper 内のノードを表すため、その総数は数百万個程度までに抑えることを推奨します。

## max_backup_bandwidth \{#max_backup_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバー上の特定のバックアップ処理における最大読み取り速度（バイト/秒）。0 は無制限を意味します。

## max_block_size \{#max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

ClickHouse では、データはブロック単位で処理されます。ブロックはカラムパーツの集合です。1 ブロックに対する内部処理サイクルは効率的ですが、各ブロックを処理する際には無視できないコストが発生します。

`max_block_size` 設定は、テーブルからデータを読み込むときに、1 つのブロックに含める推奨最大行数を示します。`max_block_size` と同じサイズのブロックが常にテーブルから読み込まれるわけではなく、ClickHouse がより少ないデータを取得すべきと判断した場合は、より小さいブロックが処理されます。

ブロックサイズが小さすぎると、各ブロックの処理コストが顕著になってしまうため避けるべきです。同時に、最初のブロックを処理した段階で LIMIT 句付きクエリがすばやく完了できるよう、大きすぎてもいけません。`max_block_size` を設定する際の目標は、多数のカラムを複数スレッドで抽出する場合に過剰なメモリ消費を避けつつ、少なくともある程度のキャッシュ局所性を維持することです。

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud でのデフォルト値: レプリカごとのメモリ量の半分。

`GROUP BY` 句の外部メモリでの実行を有効または無効にします。
（[外部メモリでの GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory) を参照）

設定可能な値:

- 単一の [GROUP BY](/sql-reference/statements/select/group-by) 操作で使用できる RAM の最大容量（バイト単位）。
- `0` — 外部メモリでの `GROUP BY` を無効にします。

:::note
GROUP BY の実行中にメモリ使用量がこのバイト数のしきい値を超えた場合、
「外部集約」モードを有効にし（データをディスクにスピルして）処理します。

推奨値は、利用可能なシステムメモリの半分です。
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud におけるデフォルト値: 1 レプリカあたりのメモリ容量の半分。

`ORDER BY` 句を外部メモリで実行するかどうかを有効または無効にします。詳細は [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。
ORDER BY の処理中にメモリ使用量がこのしきい値（バイト数）を超えた場合、「external sorting」モード（データをディスクへスピルして書き出し）が有効になります。

設定値:

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 処理で使用可能な最大 RAM 容量（バイト数）。
  推奨値は、利用可能なシステムメモリの半分です。
- `0` — 外部メモリでの `ORDER BY` を無効にします。

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

ORDER BY 句と LIMIT 句を含むクエリで、メモリ使用量が指定されたしきい値を超えた場合、最終的なマージの前にデータブロックの追加マージを行い、LIMIT で指定された上位の行だけを保持します。

## max_bytes_in_distinct \{#max_bytes_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`DISTINCT` を使用する際にハッシュテーブルによって使用される、メモリ内に保持される状態の最大サイズ（非圧縮バイト数）。

## max_bytes_in_join \{#max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブルの最大サイズ（バイト単位）。

この設定は、[SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join table engine](/engines/table-engines/special/join) に適用されます。

クエリに JOIN が含まれている場合、ClickHouse はすべての中間結果に対してこの設定を確認します。

制限に到達したとき、ClickHouse は複数の動作のいずれかを実行できます。
実行する動作を選択するには、[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 設定を使用します。

設定可能な値:

- 正の整数。
- 0 — メモリ使用量の制御を無効にします。

## max_bytes_in_set \{#max_bytes_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから作成された IN 句内の Set が使用できる非圧縮データの最大バイト数です。

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトで自動的にディスクへスピルする機能を有効化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

利用可能なメモリのうち、`GROUP BY` に使用を許可される割合です。この割合に達すると、
集約処理に外部ストレージが使用されます。

たとえば `0.6` に設定した場合、`GROUP BY` は実行開始時点で利用可能なメモリ
（サーバー／USER／マージ処理用）の 60% まで使用が許可され、それを超えると
外部集約の使用を開始します。

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトで自動的にディスクへのスピルを有効化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

利用可能メモリのうち、`ORDER BY` に使用を許可する割合です。この割合に達すると external sort が使用されます。

たとえば `0.6` に設定した場合、実行開始時点では `ORDER BY` に対して、サーバー／ユーザー／マージ処理向けの利用可能メモリの `60%` までの使用が許可され、それ以降は external sort の使用が開始されます。

`max_bytes_before_external_sort` は引き続き考慮される点に注意してください。ディスクへのスピルは、ソートブロックが `max_bytes_before_external_sort` より大きい場合にのみ行われます。

## max_bytes_to_read \{#max_bytes_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ実行時にテーブルから読み取ることができる最大バイト数（非圧縮データ）を指定します。
この制限は処理される各データchunkごとにチェックされ、最も深いテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合には、そのリモートサーバー上でのみチェックされます。

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリの実行時に、リーフノード上のローカルテーブルから読み取ることができる
（非圧縮の）最大バイト数です。分散クエリは各分片（リーフ）に対して複数のサブクエリを
発行することがありますが、この制限は各リーフノードでの読み取り段階でのみ適用され、
ルートノードでの結果マージ段階では無視されます。

例えば、クラスタが 2 つの分片から構成されており、それぞれの分片に 100 バイトのデータを
含むテーブルがあるとします。両方のテーブルから全データを読み取ることになっている
分散クエリで、`max_bytes_to_read=150` が設定されている場合、合計 200 バイトになるため
クエリは失敗します。一方、`max_bytes_to_read_leaf=150` を指定したクエリは、
リーフノードごとに最大 100 バイトしか読まないため成功します。

この制限は処理される各データ chunk ごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合には動作が安定しません。
:::

## max_bytes_to_sort \{#max_bytes_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート前の最大バイト数です。ORDER BY 操作で処理しなければならない非圧縮データのバイト数がこの値を超えた場合、動作は `sort_overflow_mode` によって決定されます。`sort_overflow_mode` の既定値は `throw` です。

## max_bytes_to_transfer \{#max_bytes_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN セクションの実行時に、リモートサーバーへ送信するか一時テーブルに保存できる、非圧縮データの最大バイト数。

## max_columns_to_read \{#max_columns_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1つのクエリでテーブルから読み取ることができるカラムの最大数です。
クエリで読み取る必要があるカラム数が、この設定値を超えた場合は例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを防ぐのに役立ちます。
:::

`0` の値は無制限を意味します。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

テーブルへの書き込み時に、圧縮される前の非圧縮データブロックの最大サイズです。デフォルトは 1,048,576 (1 MiB) です。より小さいブロックサイズを指定すると、一般的に圧縮率はわずかに低下しますが、キャッシュローカリティの向上により圧縮および解凍の速度がわずかに向上し、メモリ消費量も減少します。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないでください。
:::

圧縮用のブロック（バイトで構成されるメモリの chunk）と、クエリ処理用のブロック（テーブルからの行の集合）を混同しないでください。

## max_concurrent_queries_for_all_users \{#max_concurrent_queries_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定値が、現在同時に処理されているクエリ数以下の場合、例外をスローします。

例: `max_concurrent_queries_for_all_users` をすべてのユーザーに対して 99 に設定し、データベース管理者自身には 100 に設定しておくことで、サーバーが過負荷のときでも調査用のクエリを実行できます。

特定のクエリまたはユーザーに対してこの設定を変更しても、他のクエリには影響しません。

設定可能な値:

* 正の整数。
* 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**関連項目**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max_concurrent_queries_for_user \{#max_concurrent_queries_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ユーザーごとに同時に処理されるクエリ数の上限。

設定可能な値:

* 正の整数。
* 0 — 無制限。

**例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

1つの分散テーブルに対する単一のクエリを分散処理する際に、リモートサーバーとの間で同時に確立される接続の最大数です。クラスタ内のサーバー数以上の値に設定することを推奨します。

次のパラメータは、分散テーブルの作成時（およびサーバー起動時）にのみ使用されるため、実行時に変更する必要はありません。

## max_distributed_depth \{#max_distributed_depth\}

<SettingsInfoBlock type="UInt64" default_value="5" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルに対する再帰クエリの最大深さを制限します。

値がこの制限を超えると、サーバーは例外をスローします。

設定可能な値:

- 正の整数。
- 0 — 深さに制限なし。

## max_download_buffer_size \{#max_download_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

各スレッドにおける並列ダウンロード（例: URL エンジン）のためのバッファサイズの上限。

## max_download_threads \{#max_download_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="4" />

データをダウンロードするためのスレッド数の最大値（例: URL エンジンでの使用時）。

## max_estimated_execution_time \{#max_estimated_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "max_execution_time と max_estimated_execution_time を分離"}]}]}/>

クエリの推定最大実行時間（秒単位）。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
の有効期限が切れるたびに、各データブロックでチェックされます。

## max_execution_speed \{#max_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1秒あたりに実行できる最大の行数です。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) が
タイムアウトするたびに、各データブロックごとにチェックされます。実行速度が高すぎる場合、実行速度は抑制されます。

## max_execution_speed_bytes \{#max_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最大実行バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が有効期限に達するたびに、すべてのデータブロックでチェックされます。実行速度が高すぎる場合は、実行速度が制限されます。

## max_execution_time \{#max_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

クエリの最大実行時間（秒単位）。

`max_execution_time` パラメータはやや分かりにくい設定です。
このパラメータは、現在のクエリ実行速度に基づいて実行時間を推定する形で動作します
（この挙動は [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) によって制御されます）。

ClickHouse は、予測される実行時間が指定された `max_execution_time` を超える場合、
クエリを中断します。デフォルトでは `timeout_before_checking_execution_speed` は 10 秒に設定されています。
これは、クエリ実行開始後 10 秒経過すると、ClickHouse が合計実行時間の推定を開始することを意味します。
たとえば `max_execution_time` を 3600 秒（1 時間）に設定した場合、推定時間がこの 3600 秒の制限を超えると、
ClickHouse はクエリを中断します。`timeout_before_checking_execution_speed` を 0 に設定すると、
ClickHouse は `max_execution_time` の基準としてクロック時間を使用します。

クエリの実行時間が指定した秒数を超えた場合の動作は、
`timeout_overflow_mode` によって決まり、デフォルトでは `throw` に設定されています。

:::note
タイムアウトは、データ処理中の特定の箇所でのみチェックされ、その時点でのみクエリを停止できます。
現在のところ、集約状態のマージ中やクエリ解析中には停止できないため、
実際の実行時間はこの設定値より長くなります。
:::

## max_execution_time_leaf \{#max_execution_time_leaf\}

<SettingsInfoBlock type="Seconds" default_value="0" />

[`max_execution_time`](#max_execution_time) と意味的には類似していますが、
分散クエリまたはリモートクエリにおいてリーフノードに対してのみ適用されます。

例えば、リーフノードでの実行時間を `10s` に制限したいが、
初期ノードには制限を設けたくない場合、入れ子になったサブクエリの設定で
`max_execution_time` を使う代わりに:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

`max_execution_time_leaf` をクエリ設定として使用できます。

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="500000" />

エイリアスおよびアスタリスクの展開後における、クエリ構文木のノード数で表される最大サイズ。

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\}

<SettingsInfoBlock type="UInt64" default_value="5" />

別のホストからパーティションを取得する際の再試行回数。

## max_final_threads \{#max_final_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付きの `SELECT` クエリにおけるデータ読み取りフェーズで使用される並列スレッドの最大数を設定します。

設定可能な値:

- 正の整数。
- 0 または 1 — 無効。`SELECT` クエリは単一スレッドで実行されます。

## max_http_get_redirects \{#max_http_get_redirects\}

<SettingsInfoBlock type="UInt64" default_value="0" />

許可される HTTP GET リダイレクトの最大ホップ数です。悪意のあるサーバーがリクエストを想定外のサービスへリダイレクトすることを防ぐための追加のセキュリティ対策となります。\n\n外部サーバーが別のアドレスにリダイレクトするが、そのアドレスが会社のインフラストラクチャ内部のものに見える場合があります。その結果、内部サーバーに HTTP リクエストを送信することで、認証をバイパスして内部ネットワークから内部 API を呼び出したり、Redis や Memcached など他のサービスにクエリを送信できてしまう可能性があります。内部インフラストラクチャ（`localhost` 上で動作しているものを含む）を持たない、あるいはサーバーを信頼している場合は、リダイレクトを許可しても安全と考えられます。ただし、URL が HTTPS ではなく HTTP を使用している場合、信頼すべき対象はリモートサーバーだけでなく、ISP や途中経路上のすべてのネットワークも含まれる点に留意してください。

## max_hyperscan_regexp_length \{#max_hyperscan_regexp_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[hyperscan multi-match functions](/sql-reference/functions/string-search-functions#multiMatchAny) における各正規表現の最大長を定義します。

設定可能な値:

* 正の整数。
* 0 - 長さは無制限。

**例**

クエリ:

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 3;
```

結果：

```text
┌─multiMatchAny('abcd', ['ab', 'bcd', 'c', 'd'])─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 2;
```

結果：

```text
Exception: Regexp length too large.
```

**関連項目**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max_hyperscan_regexp_total_length \{#max_hyperscan_regexp_total_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

各[hyperscan multi-match function](/sql-reference/functions/string-search-functions#multiMatchAny) に含まれるすべての正規表現の合計最大長を設定します。

設定可能な値:

* 正の整数。
* 0 - 長さに制限はありません。

**例**

クエリ:

```sql
SELECT multiMatchAny('abcd', ['a','b','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

結果:

```text
┌─multiMatchAny('abcd', ['a', 'b', 'c', 'd'])─┐
│                                           1 │
└─────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT multiMatchAny('abcd', ['ab','bc','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

結果：

```text
Exception: Total regexp lengths too large.
```

**関連項目**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\}

**エイリアス**: `max_insert_block_size_rows`

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

テーブルへの挿入時に形成されるブロックの最大サイズ（行数単位）。

この設定は、フォーマット解析におけるブロック形成を制御します。サーバーが行ベースの入力フォーマット（CSV、TSV、JSONEachRow など）や、任意のインターフェイス（HTTP、インラインデータを使用する clickhouse-client、gRPC、PostgreSQL wire protocol）からの Values フォーマットをパースする際に、どのタイミングでブロックを生成するかをこの設定によって決定します。  
注: clickhouse-client または clickhouse-local を用いてファイルから読み取る場合、データのパースはクライアント側で行われ、この設定はクライアント側に適用されます。

次のいずれかの条件を満たしたときにブロックが生成されます:

- 最小しきい値（AND）: `min_insert_block_size_rows` と `min_insert_block_size_bytes` の両方に到達した場合
- 最大しきい値（OR）: `max_insert_block_size` または `max_insert_block_size_bytes` のいずれかに到達した場合

デフォルト値は `max_block_size` よりわずかに大きく設定されています。これは、特定のテーブルエンジン（`*MergeTree`）が、ディスク上で挿入された各ブロックごとにデータパートを形成し、これがかなり大きな単位となるためです。同様に、`*MergeTree` テーブルは挿入時にデータをソートし、十分に大きなブロックサイズであれば、より多くのデータを RAM 上でソートできます。

取り得る値:

- 正の整数。

## max_insert_block_size_bytes \{#max_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Row Input Format でデータをパースする際のブロックサイズ（バイト単位）を制御できる新しい設定。"}]}]}/>

テーブルへの挿入時に作成されるブロックの最大サイズ（バイト単位）を指定します。

この設定は max_insert_block_size_rows と連携して動作し、同じコンテキストでのブロック形成を制御します。これらの設定がいつどのように適用されるかの詳細については、max_insert_block_size_rows を参照してください。

設定可能な値:

- 正の整数。
- 0 — ブロック形成には影響しません。

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="0" />

最終パートのフラッシュを遅延させるストリーム（カラム）の最大数。デフォルトは自動で、基盤となるストレージが並列書き込みをサポートしている場合（例: S3）は 100、それ以外の場合は 0（無効）です。

## max_insert_threads \{#max_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT SELECT` クエリを実行する際の最大スレッド数を指定します。

設定可能な値:

- 0 (または 1) — `INSERT SELECT` を並列実行しない。
- 正の整数。1 より大きい値。

Cloud におけるデフォルト値:

- メモリ 8 GiB のノードでは `1`
- メモリ 16 GiB のノードでは `2`
- それより大きいノードでは `4`

並列 `INSERT SELECT` は、`SELECT` 部分が並列実行される場合にのみ効果があります。[`max_threads`](#max_threads) 設定を参照してください。
より大きい値を設定すると、メモリ使用量が増加します。

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

JOIN 結果ブロックの最大サイズ（バイト単位、JOIN アルゴリズムが対応している場合）。0 は無制限を意味します。

## max_joined_block_size_rows \{#max_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN の結果に対するブロックサイズの最大値（使用している JOIN アルゴリズムが対応している場合）。0 を指定すると上限なしになります。

## ベクター検索クエリに対する LIMIT の最大値 \{#max_limit_for_vector_search_queries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

この設定値を超える LIMIT を指定した SELECT クエリでは、ベクター類似性インデックスを使用できません。ベクター類似性インデックスにおけるメモリオーバーフローを防止するための設定です。

## max_local_read_bandwidth \{#max_local_read_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルでの読み取り速度の上限（1 秒あたりのバイト数）。

## max_local_write_bandwidth \{#max_local_write_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル書き込みの最大速度（1 秒あたりのバイト数）。

## max_memory_usage \{#max_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud でのデフォルト値: レプリカ上の RAM 量に依存します。

単一のサーバー上でクエリを実行する際に使用できる RAM の最大量です。
値が `0` の場合は無制限を意味します。

この設定は、利用可能なメモリ量やマシン上の総メモリ量を考慮しません。
制限は単一のサーバー内の単一クエリに適用されます。

各クエリの現在のメモリ使用量を確認するには `SHOW PROCESSLIST` を使用できます。
ピーク時のメモリ使用量はクエリごとに追跡され、ログに書き込まれます。

次の集約関数が `String` および `Array` 引数に対して保持する状態については、
メモリ使用量を完全には追跡しません:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

メモリ使用量は、[`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
および [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) のパラメータによっても制限されます。

## max_memory_usage_for_user \{#max_memory_usage_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 台のサーバー上で、特定のユーザーのクエリを実行する際に使用できる RAM の最大量を指定します。値 0 は無制限を意味します。

デフォルトでは、この値には制限がありません（`max_memory_usage_for_user = 0`）。

[`max_memory_usage`](/operations/settings/settings#max_memory_usage) の説明も参照してください。

例えば、`clickhouse_read` という名前のユーザーに対して `max_memory_usage_for_user` を 1000 バイトに設定したい場合は、次のステートメントを使用できます。

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

クライアントから一度ログアウトして再度ログインし、その後に `getSetting` 関数を使用することで、設定が有効になっていることを確認できます。

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由でのデータ交換速度を、1 秒あたりのバイト数で制限します。この設定はすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — 帯域幅制御を無効にします。

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク越しにデータを送受信する際の帯域幅を、1 秒あたりのバイト数で制限します。この設定は、サーバー上で同時に実行されているすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのネットワーク経由でのデータ転送速度をバイト単位で制限します。この設定は、単一のユーザーによって同時に実行されているすべてのクエリに適用されます。

可能な値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bytes \{#max_network_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行する際に、ネットワーク経由で送受信されるデータ量（バイト数）を制限します。この設定は各クエリに対して個別に適用されます。

設定可能な値:

- 正の整数。
- 0 — データ量の制限を無効にします。

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="128" />

最適化を適用するテーブル内のパーティション数の上限

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリの拒否を検討する際に用いられる、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の最大比率です。最小比率と最大比率の間では線形補間によって確率が計算され、この比率に達した時点で確率は 1 になります。

## max_parallel_replicas \{#max_parallel_replicas\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "デフォルトで最大 1000 個の並列レプリカを使用します。"}]}]}/>

クエリを実行する際に、各分片に対して使用されるレプリカの最大数。

設定可能な値:

- 正の整数。

**追加情報**

この設定は、他の設定の内容によって異なる結果を生成する場合があります。

:::note
この設定は、`JOIN` やサブクエリが関係し、かつすべてのテーブルが特定の要件を満たしていない場合に、誤った結果を生成します。詳細については、[Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas) を参照してください。
:::

### `SAMPLE` キーを使用した並列処理 \{#parallel-processing-using-sample-key\}

クエリは、複数のサーバー上で並列実行すると、処理が高速になる場合があります。ただし、次のような場合にはクエリ性能が低下する可能性があります。

- サンプリングキーのパーティションキー内での位置により、効率的な範囲スキャンを実行できない場合
- テーブルにサンプリングキーを追加したことで、他のカラムによるフィルタリングが非効率になる場合
- サンプリングキーが計算コストの高い式である場合
- クラスターのレイテンシー分布にロングテールがあり、より多くのサーバーに対してクエリを行うことで、クエリ全体のレイテンシーが増加する場合

### [parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用した並列処理 \{#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key\}

この設定は、すべてのレプリケーテッドテーブルで使用できます。

## max_parser_backtracks \{#max_parser_backtracks\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

パーサーの最大バックトラック回数（再帰下降パース処理において、さまざまな解釈を試行する回数の上限）。

## max_parser_depth \{#max_parser_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

再帰下降構文解析器における再帰の最大深度に上限を設けます。スタックサイズの制御に使用します。

設定可能な値:

- 正の整数
- 0 — 再帰の深さは無制限

## max_parsing_threads \{#max_parsing_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "ファイルからの並列パース用スレッド数を制御するための個別の設定を追加"}]}]}/>

並列パースをサポートする入力フォーマットでデータを解析する際に使用されるスレッド数の上限です。デフォルトでは自動的に決定されます。

## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時におけるパーティション削除に対する制限です。値 `0` は、パーティションを制限なく削除できることを意味します。

Cloud のデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー設定を上書きします。[max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop) を参照してください。
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "1つのブロック内のパーティション数に対する制限を追加"}]}]}/>

単一の INSERT ブロックに含められるパーティションの最大数を制限し、
ブロックに含まれるパーティションが多すぎる場合は例外をスローします。

- 正の整数値。
- `0` — パーティション数は無制限。

**詳細**

データを挿入する際、ClickHouse は挿入ブロック内のパーティション数を計算します。
パーティション数が `max_partitions_per_insert_block` を超える場合、
ClickHouse は `throw_on_max_partitions_per_insert_block` に基づいて、
警告をログ出力するか、例外をスローします。例外メッセージは次のような内容です。

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
この設定は安全性のためのしきい値であり、多数のパーティションを使用することは一般的な誤解に基づくものです。
:::

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

1 回のクエリでアクセスできるパーティション数の最大値を制限します。

テーブル作成時に指定した設定値は、クエリレベルの設定で上書きできます。

設定可能な値:

- 正の整数
- `-1` - 無制限（デフォルト）

:::note
テーブルの設定で、MergeTree の設定 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) を指定することもできます。
:::

## max_parts_to_move \{#max_parts_to_move\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

1 つのクエリで移動できるパーツ数の上限を設定します。0 は無制限を意味します。

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

projection index から読み取る行数がこのしきい値以下である場合、ClickHouse はクエリ実行時に projection index を適用しようとします。

## max_query_size \{#max_query_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL パーサーによって解析されるクエリ文字列の最大バイト数です。
INSERT クエリの VALUES 句内のデータは、別のストリームパーサー（RAM を O(1) しか消費しない）によって処理され、この制限の影響は受けません。

:::note
`max_query_size` は SQL クエリ内では設定できません（例: `SELECT now() SETTINGS max_query_size=10000`）。これは、ClickHouse がクエリを解析するためのバッファを確保する必要があり、そのバッファサイズが `max_query_size` 設定によって決定され、この設定はクエリ実行前に構成されている必要があるためです。
:::

## max_read_buffer_size \{#max_read_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

ファイルシステムから読み込むためのバッファの最大サイズ。

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

ローカルファイルシステムから読み込む際に使用されるバッファの最大サイズ。0 に設定した場合は max_read_buffer_size が使用されます。

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートファイルシステムから読み込む際のバッファの最大サイズです。0 に設定されている場合は、max_read_buffer_size が使用されます。

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "再帰 CTE 評価深度の上限"}]}]}/>

再帰 CTE 評価深度の上限

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時にネットワーク経由で行われるデータ交換の最大帯域幅（1秒あたりのバイト数）。

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時におけるネットワーク経由のデータ送受信の最大速度（バイト/秒）。

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\}

<SettingsInfoBlock type="UInt64" default_value="300" />

分散クエリで遅延しているレプリカを除外します。詳細は [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

時間を秒単位で設定します。レプリカの遅延が設定値以上の場合、そのレプリカは使用されません。

設定可能な値は次のとおりです:

- 正の整数。
- 0 — レプリカの遅延はチェックされません。

遅延がゼロでないレプリカを一切使用しないようにするには、このパラメータを 1 に設定します。

レプリケーションされたテーブルを参照する分散テーブルに対して `SELECT` を実行するときに使用されます。

## max_result_bytes \{#max_result_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

結果サイズの上限をバイト数（非圧縮）で制限します。しきい値に達した場合、クエリはデータブロックの処理後に停止しますが、
結果の最後のブロックは途中で切り捨てられないため、最終的な結果サイズがしきい値を超えることがあります。

**注意事項**

このしきい値の判定には、メモリ上の結果サイズが使用されます。
結果サイズが小さい場合でも、メモリ上のより大きなデータ構造、
例えば LowCardinality カラムの辞書や AggregateFunction カラムの Arena 領域を参照していることがあり、
そのため結果サイズが小さく見えても、しきい値を超過する可能性があります。

:::warning
この設定はかなり低レベルであり、注意して使用する必要があります
:::

## max_result_rows \{#max_result_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud のデフォルト値: `0`。

結果の行数を制限します。サブクエリに対してもチェックされ、分散クエリの一部をリモートサーバー上で実行する場合にもチェックされます。
値が `0` の場合は、制限は適用されません。

しきい値に達した場合、クエリはあるデータブロックの処理を終えたところで停止しますが、
最後の結果ブロックは途中で切り捨てられないため、結果の行数はしきい値より多くなることがあります。

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "新しい設定。関数 `dictGetKeys` が使用する、クエリ単位の逆引き Dictionary ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュには、同一クエリ内で Dictionary を再スキャンすることを避けるために、属性値ごとにシリアライズされたキーのタプルが保存されます。"}]}]}/>

関数 `dictGetKeys` が使用する、クエリ単位の逆引き Dictionary ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュには、同一クエリ内で Dictionary を再スキャンすることを避けるために、属性値ごとにシリアライズされたキーのタプルが保存されます。制限に達すると、エントリは LRU に基づいて削除されます。0 に設定するとキャッシュは無効になります。

## max_rows_in_distinct \{#max_rows_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

DISTINCT を使用する際に扱われる異なる行の最大数。

## max_rows_in_join \{#max_rows_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブル内の行数を制限します。

この設定は [SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join](/engines/table-engines/special/join) テーブルエンジンに適用されます。

クエリに複数の JOIN が含まれる場合、ClickHouse はすべての中間結果に対してこの設定をチェックします。

制限に達したときに ClickHouse が取り得る挙動はいくつかあります。
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 設定を使用して挙動を選択します。

設定可能な値:

- 正の整数。
- `0` — 行数が無制限。

## max_rows_in_set \{#max_rows_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから作成される IN 句内の Set に含めることができる最大行数。

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Disable join optimization as it prevents from read in order optimization"}]}]}/>

JOIN を実行する前に、互いの行集合を用いて結合テーブル同士をフィルタリングする際に使用される Set の最大サイズ。

取りうる値:

- 0 — 無効。
- 任意の正の整数。

## max_rows_to_group_by \{#max_rows_to_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

集約時に受け取る一意なキーの最大数です。この設定により、集約処理でのメモリ消費を制限できます。

GROUP BY 中の集約によって、指定した数より多くの行（一意な GROUP BY キー）が生成された場合の動作は
`group_by_overflow_mode` によって決まり、デフォルトでは `throw` ですが、近似的な GROUP BY を行うモードに
切り替えることもできます。

## max_rows_to_read \{#max_rows_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時にテーブルから読み取ることのできる最大行数。
この制限は処理されるデータの各 chunk ごとにチェックされ、最も内側のテーブル式にのみ適用されます。リモートサーバーから読み取る場合は、リモートサーバー上でのみチェックされます。

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取ることができる行数の上限を表します。分散クエリは各分片（リーフ）に対して複数のサブクエリを発行できますが、この制限がチェックされるのはリーフノードでの読み取り段階のみであり、ルートノードで結果をマージする段階では無視されます。

例えば、クラスタが 2 つの分片から構成され、各分片に 100 行を含むテーブルがあるとします。両方のテーブルからすべてのデータを読み取ることを意図した分散クエリにおいて `max_rows_to_read=150` を設定すると、合計で 200 行になるため失敗します。一方、`max_rows_to_read_leaf=150` を指定したクエリは成功します。これは、リーフノードでは最大でも 100 行までしか読み取らないためです。

この制限は、処理される各データ chunk ごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合には不安定です。
:::

## max_rows_to_sort \{#max_rows_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート前に処理できる行数の上限です。ソート時のメモリ消費量を制限するために使用できます。
ORDER BY 処理で扱う必要がある行数が指定値を超えた場合の動作は、
デフォルトで `throw` に設定されている `sort_overflow_mode` によって決定されます。

## max_rows_to_transfer \{#max_rows_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN 節の実行時に、リモートサーバーへ渡すか一時テーブルに保存できるデータの最大サイズ（行数）。

## max_sessions_for_user \{#max_sessions_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

認証済みユーザー 1 人あたりの、ClickHouse サーバーに対して同時に確立可能な最大セッション数。

例:

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

設定可能な値:

* 正の整数
* `0` - 同時セッション数が無制限（デフォルト）


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効化します。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "パフォーマンスを最適化します。"}]}]}/>

集約の前に、すべてのハッシュテーブルで合計して最大いくつの要素分まで領域を事前確保することを許可するかを設定します。

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効化。"}]}]}/>

結合を行う前に、すべてのハッシュテーブルで合計何要素分までの領域を事前確保することを許可するかを指定します。

## max_streams_for_files_processing_in_cluster_functions \{#max_streams_for_files_processing_in_cluster_functions\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定を追加し、*Cluster テーブル関数でのファイル処理に使用されるストリーム数を制限できるようにしました"}]}]}/>

0 以外の値に設定されている場合、*Cluster テーブル関数においてファイルからデータを読み取るスレッド数を制限します。

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外の値に設定されている場合、MergeTree テーブルの読み取りストリーム数を制限します。

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\}

<SettingsInfoBlock type="Float" default_value="5" />

Merge テーブルから読み込む際に、より多くのストリームを使用できるようにします。ストリームは、Merge テーブルが参照する各テーブルに分散されます。これにより、スレッド間での処理負荷がより均等に分散され、特にマージ対象のテーブル同士のサイズが異なる場合に有効です。

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\}

<SettingsInfoBlock type="Float" default_value="1" />

スレッド数よりも多くのソースを使用して、スレッド間で作業をより均等に分散できるようにします。これは一時的な対処であり、将来的にはソース数をスレッド数と同じにしたうえで、各ソースが自身の利用可能な作業を動的に選択できるようにすることを想定しています。

## max_subquery_depth \{#max_subquery_depth\}

<SettingsInfoBlock type="UInt64" default_value="100" />

クエリに含まれる入れ子のサブクエリ数が指定値を超えた場合、例外をスローします。

:::tip
これにより、クラスタのユーザーが過度に複雑なクエリを実行しないよう保護するための健全性チェックを行うことができます。
:::

## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時にテーブルを削除する際に適用される制限です。値が `0` の場合、制限なくすべてのテーブルを削除できます。

Cloud 環境でのデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー設定を上書きします。[max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop) を参照してください。
:::

## max_temporary_columns \{#max_temporary_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行する際に、定数カラムを含め、同時に RAM 上に保持できる一時カラムの最大数。
クエリが中間計算の結果として、この値で指定された数より多くの一時カラムをメモリ内に生成した場合、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを防ぐのに役立ちます。
:::

`0` の場合は無制限を意味します。

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行中のすべてのクエリで、ディスク上の一時ファイルが使用できるデータ量の上限（バイト単位）。

設定可能な値:

- 正の整数。
- `0` — 無制限（デフォルト）

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行されているすべてのユーザーのクエリについて、ディスク上の一時ファイルが消費できるデータ量の上限をバイト単位で指定します。

設定可能な値:

- 正の整数
- `0` — 無制限（デフォルト）

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`max_temporary_columns` と同様に、クエリの実行時に RAM 上に同時に保持しなければならない一時カラムの最大数ですが、ただし定数カラムは含めません。

:::note
クエリ実行時には定数カラムがかなり頻繁に生成されますが、ほぼゼロの計算リソースしか必要としません。
:::

## max_threads \{#max_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

リモートサーバーからデータを取得するスレッドを除いた、クエリ処理スレッドの最大数です（['max_distributed_connections'](/operations/settings/settings#max_distributed_connections) パラメータを参照）。

このパラメータは、クエリ処理パイプラインの同じ段階を並列に実行するスレッドに適用されます。
たとえばテーブルから読み込む際に、関数を使った式評価、`WHERE` によるフィルタ、`GROUP BY` 向けの事前集約を、少なくとも `max_threads` 個のスレッドで並列に実行できる場合には、`max_threads` 個のスレッドが使用されます。

LIMIT によりすぐに完了するクエリについては、より低い `max_threads` を設定できます。
たとえば、必要な件数の行が各ブロックに含まれており、`max_threads = 8` の場合、1 ブロックだけ読めば十分であっても 8 ブロックが取得されます。
`max_threads` の値が小さいほど、消費されるメモリ量は少なくなります。

`max_threads` 設定のデフォルト値は、ClickHouse に対して利用可能なハードウェアスレッド数に一致します。
SMT（例: Intel HyperThreading）がない場合、これは CPU コア数に相当します。

ClickHouse Cloud ユーザーの場合、デフォルト値は `auto(N)` と表示され、N はサービスの vCPU サイズ（例: 2vCPU/8GiB、4vCPU/16GiB など）に対応します。
すべてのサービスサイズの一覧は、Cloud コンソールの Settings タブを参照してください。

## max_threads_for_indexes \{#max_threads_for_indexes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

索引を処理するスレッドの最大数。

## max_untracked_memory \{#max_untracked_memory\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小さなメモリ割り当ておよび解放はスレッドローカル変数に集約され、合計量（絶対値）が指定された値より大きくなった場合にのみ追跡またはプロファイルされます。値が `memory_profiler_step` より大きい場合は、実質的には `memory_profiler_step` まで切り下げられます。

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

グローバルレベルでハードリミットに達したときに適用されるソフトメモリ制限を表します。
この値はクエリのオーバーコミット比率を計算するために使用されます。
ゼロを指定すると、そのクエリはスキップされます。
詳しくは、[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "メモリオーバーコミット機能をデフォルトで有効化"}]}]}/>

この設定は、ユーザーレベルでハードリミットに達したときに適用されるソフトなメモリ上限を表します。
この値は、クエリに対するオーバーコミット比率を計算するために使用されます。
値が 0 の場合、そのクエリはスキップされます。
詳細については、[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

指定された値以下のサイズのメモリ割り当てを、`memory_profiler_sample_probability` に等しい確率でランダムにサンプリングして収集します。0 は無効を意味します。このしきい値を期待どおりに動作させるには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`memory_profiler_sample_probability` に等しい確率で、指定された値以上のサイズのメモリ割り当てをランダムに収集します。0 を指定すると無効になります。このしきい値が期待どおりに機能するように、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

ランダムに選択したメモリの割り当ておよび解放を収集し、`system.trace_log` に `MemorySample` の `trace_type` で書き込みます。確率はアロケーションサイズに関係なく、すべての alloc/free に対して適用されます（`memory_profiler_sample_min_allocation_size` および `memory_profiler_sample_max_allocation_size` で変更可能です）。サンプリングは、未追跡メモリ量が `max_untracked_memory` を超えたときにのみ行われる点に注意してください。より細かい粒度のサンプリングを行いたい場合は、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_step \{#memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

メモリプロファイラのステップを設定します。クエリのメモリ使用量が、バイト数で指定された各ステップを超えるたびに、メモリプロファイラは割り当て時のスタックトレースを収集し、それを [trace_log](/operations/system-tables/trace_log) に書き込みます。

設定可能な値:

- 正の整数値（バイト単位）。

- 0 — メモリプロファイラを無効にします。

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

`exception safety` のテスト用 — メモリ割り当て時に、指定した確率で例外をスローします。

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\}

<SettingsInfoBlock type="UInt64" default_value="5000000" />

ユーザーレベルでメモリオーバーコミットが発生した場合に、スレッドがメモリの解放を待機する最大時間。
タイムアウトに達してもメモリが解放されない場合、例外がスローされます。
[メモリオーバーコミット](memory-overcommit.md) の詳細を参照してください。

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

明示的なスキーマを指定せずに `Merge` テーブルを作成する場合、または `merge` テーブル関数を使用する場合、スキーマは条件に一致するテーブルのうち、指定した最大数までのテーブルのスキーマの和集合として推論されます。
テーブル数がそれより多い場合、スキーマは先頭から指定された数のテーブルだけを対象に推論されます。

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8" />

データを検索する際、ClickHouse は索引ファイル内のデータマークを確認します。ClickHouse が必要なキーがある範囲に含まれていると判断した場合、その範囲を `merge_tree_coarse_index_granularity` 個の部分範囲に分割し、その中で再帰的に必要なキーを検索します。

可能な値:

- 任意の正の偶数。

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

ClickHouse Cloud でのみ有効です。MergeTree テーブルのコンパクトパーツにおけるストライプ内の granule 数で、マルチバッファリーダーを使用するかどうかを決定します。マルチバッファリーダーは並列読み取りとプリフェッチをサポートします。リモートファイルシステムから読み取る場合、マルチバッファリーダーを使用すると読み取りリクエスト数が増加します。

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

読み取りタスクのサイズを決定する際に、`PREWHERE` で指定されたカラムのサイズのみを基に判断するかどうかを指定します。

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

ClickHouse が 1 回のクエリで `merge_tree_max_bytes_to_use_cache` バイトを超えて読み取る必要がある場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュは、クエリのために抽出されたデータを格納します。ClickHouse は、このキャッシュを使用して、小さなクエリを繰り返し実行する際の応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュがスラッシングを起こすのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックのキャッシュのサイズを指定します。

考えられる値:

- 任意の正の整数。

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ClickHouse が 1 つのクエリで `merge_tree_max_rows_to_use_cache` 行を超えて読み込む必要がある場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュは、クエリ用に抽出されたデータを保存します。ClickHouse はこのキャッシュを使用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュが無駄に消費されるのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックキャッシュのサイズを定義します。

設定可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="251658240" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブルの 1 つのファイルから読み取るバイト数が `merge_tree_min_bytes_for_concurrent_read` を超える場合、ClickHouse はこのファイルを複数スレッドで並行して読み取ろうとします。

取りうる値:

- 正の整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取りを並列化できるようになる前に、1 つのファイルから読み取る最小バイト数です。この設定は使用を推奨しません。

設定可能な値:

- 正の整数。

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_bytes_for_seek` バイト未満の場合、ClickHouse は両方のブロックを含むファイル範囲をシーケンシャルに読み取り、追加のシーク操作を回避します。

指定可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\}

**エイリアス**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "値は `filesystem_prefetch_min_bytes_for_single_read_task` と統一されています"}]}]}/>

タスクごとに読み取る最小バイト数です。

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "New setting"}]}]}/>

タスクサイズに対する厳密な下限値です（granule 数が少なく、利用可能なスレッド数が多い場合でも、これより小さいタスクは割り当てません）

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="163840" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのファイルから読み取られる行数が `merge_tree_min_rows_for_concurrent_read` を超える場合、ClickHouse はこのファイルを複数スレッドで並行して読み取ろうとします。

可能な値:

- 正の整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取りを並列化できるようになる前に、1 つのファイルから読み取る最小の行数を指定します。この設定の使用は推奨されません。

設定可能な値:

- 正の整数。

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_rows_for_seek` 行未満の場合、ClickHouse はファイル内をシークせず、データを連続して読み取ります。

取り得る値:

- 任意の正の整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`PartsSplitter` のテスト用 — 指定した確率で、MergeTree からの各読み取り時に、読み取り範囲を互いに交差する範囲と交差しない範囲に分割します。"}]}]}/>

`PartsSplitter` のテスト用 — 指定した確率で、MergeTree からの各読み取り時に、読み取り範囲を互いに交差する範囲と交差しない範囲に分割します。

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でのストレージスナップショットの一貫性をデバッグするための新しい設定"}]}]}/>

MergeTree テーブルのストレージスナップショットを作成する際に、ミリ秒単位の意図的な遅延を挿入します。
テストおよびデバッグ用途にのみ使用します。

取り得る値:

- 0 - 遅延なし（デフォルト）
- N - 遅延（ミリ秒）

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\}

<SettingsInfoBlock type="Bool" default_value="1" />

リモートテーブルから読み取る際に、一定サイズのタスクを使用するかどうかを制御します。

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree でのデシリアライズ接頭辞キャッシュの使用を制御する新しい設定"}]}]}/>

MergeTree でリモートディスクからデータを読み取る際に、ファイルプレフィックスに含まれるカラムのメタデータをキャッシュできるようにします。

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree におけるプレフィックスの並列デシリアライズでスレッドプールの使用有無を制御する新しい設定"}]}]}/>

MergeTree の Wide パーツにおけるプレフィックス読み取りを並列に行うために、スレッドプールの利用を有効化します。このスレッドプールのサイズは、サーバー設定 `max_prefixes_deserialization_thread_pool_size` によって制御されます。

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "JSON と Dynamic 型向けの新しいシリアライゼーション V2 バージョンを追加"}]}]}/>

有効にすると、JSON および Dynamic 型のシリアライゼーションで V2 の代わりに V1 バージョンが MergeTree で使用されます。この設定の変更は、サーバーを再起動した後にのみ有効になります。

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、クエリの実行全体を通して一部の perf イベントが計測されます。

## metrics_perf_events_list \{#metrics_perf_events_list\}

クエリ実行中を通して計測される perf メトリクスのカンマ区切りリストです。空文字列の場合はすべてのイベントを意味します。利用可能なイベントについては、ソースコード内の PerfEventInfo を参照してください。

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ストレージディスクへの direct I/O アクセスを使用するために必要な最小データ量。

ClickHouse はテーブルからデータを読み取る際にこの設定を使用します。読み取るすべてのデータの合計ストレージ容量が `min_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は `O_DIRECT` オプションを使用してストレージディスクからデータを読み取ります。

取りうる値:

- 0 — direct I/O は無効です。
- 正の整数。

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

これは実験的な設定です。カーネルからユーザ空間へのデータコピーを行わずに大きなファイルを読み込む際に用いる、メモリ使用量の下限を設定します。推奨されるしきい値は約 64 MB です。これは [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) が低速であるためです。この設定は大きなファイルに対してのみ意味があり、データがページキャッシュ上に存在する場合にのみ効果があります。

取りうる値:

- 正の整数。
- 0 — 大きなファイルは、カーネルからユーザ空間へのデータコピーのみで読み込まれます。

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 型: unsigned int
- デフォルト値: 1 MiB

各スレッドが並列処理で解析を行う chunk の最小サイズ（バイト単位）。

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに適用されます。クエリ処理時のレイテンシを削減するため、書き込み時に次のマークを書き込むタイミングで、そのサイズが `min_compress_block_size` 以上であればブロックが圧縮されます。既定値は 65,536 です。

非圧縮データが `max_compress_block_size` 未満である場合、ブロックの実際のサイズはこの値以上であり、かつ 1 つのマーク分のデータ量以上になります。

例を見てみましょう。テーブル作成時に `index_granularity` が 8192 に設定されているとします。

UInt32 型のカラム（1 値あたり 4 バイト）を書き込んでいます。8192 行を書き込むと、合計は 32 KB のデータになります。min_compress_block_size = 65,536 であるため、2 つのマークごとに 1 つの圧縮ブロックが形成されます。

String 型（平均サイズは 1 値あたり 60 バイト）の URL カラムを書き込んでいます。8192 行を書き込むと、平均で 500 KB をわずかに下回るデータになります。これは 65,536 より大きいため、各マークごとに 1 つの圧縮ブロックが形成されます。この場合、ディスクから単一マークの範囲のデータを読み取る際に、不要なデータが伸長されることはありません。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更すべきではありません。
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の集約式が JIT コンパイルされるようになるために必要な最小数。[compile_aggregate_expressions](#compile_aggregate_expressions) 設定が有効な場合にのみ動作します。

設定可能な値:

- 正の整数。
- 0 — 同一の集約式は常に JIT コンパイルされます。

## min_count_to_compile_expression \{#min_count_to_compile_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の式がコンパイル対象になるまでに必要な最小実行回数。

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\}

<SettingsInfoBlock type="UInt64" default_value="3" />

JIT コンパイルされるまでに必要な、同一のソート記述の出現回数

## min_execution_speed \{#min_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの行数で表される最小実行速度。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が期限切れになるタイミングで、各データブロックごとにチェックされます。実行速度がこれより低い場合は、例外がスローされます。

## min_execution_speed_bytes \{#min_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
のタイムアウトが発生するたびに、各データブロックで確認されます。実行速度がこれより低い場合は、例外が送出されます。

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "外部テーブルに渡されるブロックが十分に大きくない場合、バイト単位で指定されたサイズになるようにブロックを結合します。"}]}]}/>

外部テーブルに渡されるブロックが十分に大きくない場合、バイト単位で指定されたサイズになるようにブロックを結合します。

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを指定した行数になるようにまとめる"}]}]}/>

ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを指定した行数になるようにまとめます。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを引き続き許可しつつ、挿入処理で使用せずに保持しておくディスク空き容量（バイト数）を一定量確保します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

INSERT を実行するために必要な最小ディスク空き容量（バイト数）です。

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを引き続き許可しつつ、挿入時に総ディスク容量に対する比率として表される、一定量の空きディスク容量（バイト数）を維持します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

挿入処理を実行するために必要な最小の空きディスク容量比率。

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

外部ソートおよび集約で使用される一時データを書き込む際に、確保しておくべき最小ディスク空き容量です。

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\}

<SettingsInfoBlock type="Float" default_value="0.5" />

集約処理における連続キー最適化を有効に保つために使用されるキャッシュの最小ヒット率

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

テーブルへの挿入時に形成されるブロックの最小サイズ（バイト単位）。

この設定は `min_insert_block_size_rows` と連動して動作し、同じコンテキスト（フォーマットのパースおよび `INSERT` 操作）におけるブロック形成を制御します。これらの設定がいつどのように適用されるかの詳細については、`min_insert_block_size_rows` を参照してください。

設定可能な値:

- 正の整数。
- 0 — ブロック形成には影響しません。

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリによってテーブルに挿入できるブロックの最小バイト数を設定します。これより小さいサイズのブロックは、より大きなブロックにマージされます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、materialized view へのデータ投入時のブロックのマージを制御し、過剰なメモリ使用を避けることができます。

設定可能な値:

- 任意の正の整数。
- 0 — マージを無効にする。

**関連項目**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

テーブルへ挿入する際に形成されるブロックの最小サイズ（行数）。

この設定は、次の 2 つのコンテキストでブロック形成を制御します。

1. フォーマットのパース: サーバーが任意のインターフェイス（HTTP、インラインデータ付きの clickhouse-client、gRPC、PostgreSQL ワイヤプロトコル）から行ベースの入力フォーマット（CSV、TSV、JSONEachRow など）をパースする際、この設定を使用して、ブロックを出力するタイミングを判断します。  
注意: clickhouse-client または clickhouse-local でファイルから読み取る場合、データのパースはクライアント側で行われ、この設定はクライアント側に適用されます。
2. INSERT 操作: `INSERT...SELECT` クエリの実行中およびデータが materialized view を経由して流れる際、ストレージに書き込む前に、この設定に基づいてブロックがまとめられます。

フォーマットのパースにおいて、次のいずれかの条件が満たされたときにブロックが出力されます:

- 最小しきい値（AND）: `min_insert_block_size_rows` と `min_insert_block_size_bytes` の両方に到達した場合
- 最大しきい値（OR）: `max_insert_block_size` または `max_insert_block_size_bytes` のいずれかに到達した場合

INSERT 操作における小さいサイズのブロックは、より大きなブロックにまとめられ、`min_insert_block_size_rows` または `min_insert_block_size_bytes` のいずれかが満たされた時点で出力されます。

設定可能な値:

- 正の整数。
- 0 — ブロック形成には影響しません。

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリによってテーブルに挿入できるブロック内の最小行数を設定します。これより小さいサイズのブロックは、より大きなブロックにまとめられます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、materialized view への書き込み時におけるブロックの統合方法を制御し、過剰なメモリ使用を回避できます。

設定可能な値:

- 任意の正の整数。
- 0 — 統合を無効化。

**関連項目**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "新しい設定です。"}]}]}/>

JOIN の入力および出力ブロック（JOIN アルゴリズムがサポートしている場合）の最小ブロックサイズ（バイト単位）。小さいブロックはまとめられます。0 は無制限を意味します。

## min_joined_block_size_rows \{#min_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

JOIN の入力ブロックおよび出力ブロックに対する、行数ベースの最小ブロックサイズ（JOIN アルゴリズムがサポートしている場合）。小さなブロックはまとめて 1 つにまとめられます。0 を指定すると無制限になります。

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを検討する際に使用される、OS の CPU 待機時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の最小比率です。確率を計算するために最小比率と最大比率の間で線形補間が使用され、この最小比率における確率は 0 になります。

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\}

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "新しい設定。"}]}]}/>

パイプライン生成時にスプリットが行われた場合、その後の `Resize` または `StrictResize` プロセッサの出力ストリーム数の最小値を指定します。結果として得られるストリーム数がこの値を下回る場合、スプリット処理は実行されません。

### Resize ノードとは \{#what-is-a-resize-node\}

`Resize` ノードは、クエリパイプライン内で流れるデータストリーム数を調整するプロセッサです。複数のスレッドやプロセッサ間で負荷を分散するために、ストリーム数を増減させることができます。たとえば、クエリにより高い並列性が必要な場合、`Resize` ノードは単一のストリームを複数のストリームに分割できます。逆に、複数のストリームをより少ないストリームにマージし、データ処理を集約することも可能です。

`Resize` ノードは、データブロックの構造を維持しながら、データがストリーム間で均等に分散されるようにします。これにより、リソースの利用効率を最適化し、クエリパフォーマンスを向上させます。

### なぜ Resize ノードを分割する必要があるのか \{#why-the-resize-node-needs-to-be-split\}

パイプライン実行中、集約ポイントとなっている `Resize` ノードの ExecutingGraph::Node::status_mutex は、特にコア数の多い環境では激しく競合し、その結果として次の問題が発生します。

1. ExecutingGraph::updateNode のレイテンシが増大し、クエリ性能に直接悪影響を与える。
2. スピンロック競合（native_queued_spin_lock_slowpath）によって過剰な CPU サイクルが浪費され、効率が低下する。
3. CPU 使用率が低下し、並列性とスループットが制限される。

### Resize ノードの分割方法 \{#how-the-resize-node-gets-split\}

1. 出力ストリーム数をチェックし、分割を実行可能かどうかを確認します。具体的には、分割後の各プロセッサの出力ストリーム数が `min_outstreams_per_resize_after_split` のしきい値以上である必要があります。
2. `Resize` ノードは、ポート数が同じ複数の小さな `Resize` ノードに分割され、それぞれが入力ストリームおよび出力ストリームのサブセットを処理します。
3. 各グループは互いに独立して処理されるため、ロック競合が軽減されます。

### 任意の入力/出力を持つ Resize ノードの分割 \{#splitting-resize-node-with-arbitrary-inputsoutputs\}

入力/出力の数が分割後の `Resize` ノードの数で割り切れない場合には、一部の入力は `NullSource` に接続され、一部の出力は `NullSink` に接続されます。これにより、全体的なデータフローに影響を与えることなく分割を行うことができます。

### このSETTINGの目的 \{#purpose-of-the-setting\}

`min_outstreams_per_resize_after_split` SETTING は、`Resize` ノードの分割が有効なものとなるようにし、ストリーム数が少なすぎて並列処理が非効率になることを防ぎます。出力ストリーム数の下限を強制することで、この SETTING は並列度とオーバーヘッドとのバランスを保ち、ストリームの分割やマージを伴うシナリオにおけるクエリ実行を最適化します。

### 設定の無効化 \{#disabling-the-setting\}

`Resize` ノードの分割を無効化するには、この設定値を 0 にします。これによりパイプライン生成中に `Resize` ノードが分割されなくなり、より小さいノードに分割されることなく元の構造を保持できるようになります。

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

テーブルから読み取ると見積もられる行数がこのしきい値以上の場合、ClickHouse はクエリ実行中に PROJECTION インデックスの使用を試みます。

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting."}]}]}/>

有効化すると、MongoDB テーブルでは MongoDB クエリを構築できない場合にエラーを返します。無効の場合、ClickHouse はテーブル全体を読み取り、ローカルで処理します。このオプションは `allow_experimental_analyzer=0` の場合には適用されません。

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句から PREWHERE 句へ適用可能なすべての条件を移動します

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

主キーカラムを含む PREWHERE 条件を、AND 連結の末尾へ移動します。これらの条件は主キー解析の段階ですでに考慮されている可能性が高く、そのため PREWHERE によるフィルタリングへの追加的な寄与はそれほど大きくありません。

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\}

<SettingsInfoBlock type="Bool" default_value="0" />

複数の JOIN の書き換え時には、トップレベルの式リストにエイリアスを追加しません

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、`UPDATE` および `DELETE` クエリにおいて、定数として扱われる非決定的関数（例: 関数 `now()`）がイニシエーター側で実行され、その結果でリテラルに置き換えられます。これにより、定数の非決定的関数を用いたミューテーションを実行する際に、レプリカ間でデータの整合性を保ちやすくなります。デフォルト値: `false`。

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、スカラーサブクエリは initiator で実行され、`UPDATE` および `DELETE` クエリ内のリテラルに置き換えられます。デフォルト値: `false`。

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

`UPDATE` および `DELETE` クエリで置換される、シリアル化されたリテラルの最大サイズ（バイト単位）。上記 2 つの設定のうち少なくとも一方が有効な場合にのみ有効です。デフォルト値: 16384 (16 KiB)。

## mutations_sync \{#mutations_sync\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` クエリ（[mutations](../../sql-reference/statements/alter/index.md/#mutations)）を同期的に実行するかどうかを制御します。

設定可能な値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | ミューテーションを非同期で実行します。                                                                                                                |
| `1`   | クエリは現在のサーバー上で、すべてのミューテーションが完了するまで待機します。                                                                        |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で、すべてのミューテーションが完了するまで待機します。                                                      |
| `3`   | クエリはアクティブなレプリカのみを待機します。`SharedMergeTree` でのみサポートされます。`ReplicatedMergeTree` に対しては `mutations_sync = 2` と同じ動作になります。|

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\}

MySQL 型が対応する ClickHouse 型にどのように変換されるかを定義します。`decimal`、`datetime64`、`date2Date32`、`date2String` を任意に組み合わせて指定するカンマ区切りのリストです。

- `decimal`: 精度が許す場合、`NUMERIC` および `DECIMAL` 型を `Decimal` に変換します。
- `datetime64`: 精度が `0` でない場合、`DATETIME` および `TIMESTAMP` 型を `DateTime` ではなく `DateTime64` に変換します。
- `date2Date32`: `DATE` を `Date` ではなく `Date32` に変換します。`date2String` よりも優先されます。
- `date2String`: `DATE` を `Date` ではなく `String` に変換します。`datetime64` によって上書きされます。

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Reduce the configuration effort to connect ClickHouse with BI tools."}]}]}/>

有効にすると、[FixedString](../../sql-reference/data-types/fixedstring.md) ClickHouse データ型は、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) において `TEXT` として表示されます。

MySQL ワイヤープロトコル経由で接続している場合にのみ有効です。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続するための設定作業を削減します。"}]}]}/>

有効にすると、[String](../../sql-reference/data-types/string.md) ClickHouse データ型は [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) において `TEXT` として表示されます。

MySQL ワイヤプロトコル経由で接続した場合にのみ効果があります。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL ストレージエンジンによる MySQL バッチ挿入時の最大行数

## network_compression_method \{#network_compression_method\}

<SettingsInfoBlock type="String" default_value="LZ4" />

クライアント/サーバー間およびサーバー/サーバー間の通信を圧縮するためのコーデックです。

設定可能な値:

- `NONE` — 圧縮しない。
- `LZ4` — LZ4 コーデックを使用する。
- `LZ4HC` — LZ4HC コーデックを使用する。
- `ZSTD` — ZSTD コーデックを使用する。

**関連項目**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\}

<SettingsInfoBlock type="Int64" default_value="1" />

ZSTD 圧縮レベルを調整します。[network_compression_method](#network_compression_method) が `ZSTD` に設定されている場合にのみ使用されます。

可能な値:

- 1 から 15 までの正の整数値

## normalize_function_names \{#normalize_function_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "関数名を正準名に正規化。これは PROJECTION クエリルーティングのために必要でした"}]}]}/>

関数名を正準名に正規化します

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="0" />

変更対象のテーブルに未完了のmutationが少なくともこの数だけ含まれている場合、テーブルに対するmutation処理を意図的に遅延させます。0 の場合は無効です。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

変更対象のテーブルに未完了のミューテーションがこの値以上存在する場合、'Too many mutations ...' という例外をスローします。0 の場合は無効です。

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC ブリッジにおいて、接続設定文字列ごとに使用されるコネクションプールのサイズ。

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\}

<SettingsInfoBlock type="Bool" default_value="1" />

ODBC ブリッジでコネクションプーリングを使用します。false に設定すると、毎回新しい接続が確立されます。

## offset \{#offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリから行を返し始める前にスキップする行数を設定します。これは [OFFSET](/sql-reference/statements/select/offset) 句で設定されたオフセットを調整し、両方の値が合算されます。

取り得る値:

* 0 — 行はスキップされません。
* 正の整数。

**例**

入力テーブル:

```sql
CREATE TABLE test (i UInt64) ENGINE = MergeTree() ORDER BY i;
INSERT INTO test SELECT number FROM numbers(500);
```

クエリ：

```sql
SET limit = 5;
SET offset = 7;
SELECT * FROM test LIMIT 10 OFFSET 100;
```

結果:

```text
┌───i─┐
│ 107 │
│ 108 │
│ 109 │
└─────┘
```


## opentelemetry_start_trace_probability \{#opentelemetry_start_trace_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

実行されるクエリに対して、ClickHouse がトレースを開始する確率を設定します（親[トレースコンテキスト](https://www.w3.org/TR/trace-context/)が与えられていない場合）。

指定可能な値:

- 0 — すべてのクエリ実行に対するトレースが無効になります（親トレースコンテキストが与えられていない場合）。
- [0..1] の範囲の正の浮動小数点数。たとえば、設定値が `0,5` の場合、ClickHouse は平均してクエリの半分に対してトレースを開始できます。
- 1 — すべてのクエリ実行に対するトレースが有効になります。

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "`cpu_slot_preemption` 機能をトレースするための新しい設定。"}]}]}/>

ワークロードのプリエンプティブ CPU スケジューリングを対象とした OpenTelemetry スパンを収集します。

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\}

<SettingsInfoBlock type="Bool" default_value="0" />

トレースプロセッサ用の OpenTelemetry スパンを収集します。

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

対応する並び順でデータを集約するための [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに対する [SELECT](../../sql-reference/statements/select/index.md) クエリにおいて、[GROUP BY](/sql-reference/statements/select/group-by) の最適化を有効にします。

設定可能な値:

- 0 — `GROUP BY` の最適化を無効にします。
- 1 — `GROUP BY` の最適化を有効にします。

**関連項目**

- [GROUP BY の最適化](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## GROUP BY キーの集約関数を最適化する \{#optimize_aggregators_of_group_by_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 句における GROUP BY キーに対する min/max/any/anyLast 集約関数を削除します。

## optimize_and_compare_chain \{#optimize_and_compare_chain\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

AND チェーン内で定数を用いた比較条件を補完し、フィルタリング性能を向上させます。`<`、`<=`、`>`、`>=`、`=` の各演算子およびそれらの組み合わせをサポートします。たとえば `(a < b) AND (b < c) AND (c < 5)` は `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)` となります。

## optimize_append_index \{#optimize_append_index\}

<SettingsInfoBlock type="Bool" default_value="0" />

索引条件を追加するには、[constraints](../../sql-reference/statements/create/table.md/#constraints) を使用します。既定値は `false` です。

可能な値:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

算術演算を集約関数の外側で実行する

## optimize_const_name_size \{#optimize_const_name_size\}

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "大きな定数についてはスカラーに置き換え、ハッシュ値を名前として使用（サイズは名前の長さで推定）"}]}]}/>

大きな定数についてはスカラーに置き換え、ハッシュ値を名前として使用します（サイズは名前の長さで推定されます）。

取りうる値:

- 正の整数 — 名前の最大長、
- 0 — 常にスカラーに置き換える、
- 負の整数 — 一切置き換えない。

## optimize_count_from_files \{#optimize_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

異なる入力フォーマットのファイルから行数をカウントする処理の最適化を有効化または無効化します。テーブル関数/エンジン `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` に適用されます。

設定可能な値:

- 0 — 最適化を無効にする。
- 1 — 最適化を有効にする。

## optimize_distinct_in_order \{#optimize_distinct_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

`DISTINCT` の対象カラムの一部がソート順のプレフィックスになっている場合に、`DISTINCT` の最適化を有効にします。たとえば、MergeTree のソートキーや `ORDER BY` 句で指定したソートキーのプレフィックスである場合などです。

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

イニシエータサーバー上でコストの高い集約処理を回避することで、`GROUP BY sharding_key` クエリを最適化します（これにより、イニシエータサーバー上でのクエリのメモリ使用量が削減されます）。

次の種類のクエリがサポートされます（およびそれらの任意の組み合わせ）:

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

次の種類のクエリはサポートされません（一部については将来的にサポートが追加される可能性があります）:

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

取り得る値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
現在、この設定を有効にするには `optimize_skip_unused_shards` が必要です（その理由は、将来的にこの設定がデフォルトで有効になる可能性があり、その場合に正しく動作するのは、データが Distributed テーブル経由で挿入されている、つまりデータが sharding_key に従って分散されている場合に限られるためです）。
:::

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

col = '' または '' = col のような式を empty(col) に、col != '' または '' != col のような式を notEmpty(col) に変換します。
この変換は、col が String 型または FixedString 型の場合にのみ行われます。

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "WHERE、PREWHERE、ON、HAVING、および QUALIFY 句における式について、AND 条件の論理和から共通部分式を抽出して最適化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "WHERE、PREWHERE、ON、HAVING、および QUALIFY 句における式について、AND 条件の論理和から共通部分式を抽出して最適化するための設定を導入。"}]}]}/>

WHERE、PREWHERE、ON、HAVING、および QUALIFY 句における、AND 条件の論理和から共通部分式を抽出できるようにします。`(A AND B) OR (A AND C)` のような論理式は `A AND (B OR C)` に書き換えることができ、次のような点で有用となる場合があります:

- 単純なフィルタリング式におけるインデックスの利用
- クロス結合から内部結合への最適化

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "デフォルトで有効な設定"}]}]}/>

一部の関数をサブカラムを読み取る処理に変換することで最適化を有効または無効にします。これにより、読み取るデータ量を削減できます。

次の関数が変換される場合があります:

- [length](/sql-reference/functions/array-functions#length) を [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取る処理に変換します。
- [empty](/sql-reference/functions/array-functions#empty) を [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取る処理に変換します。
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) を [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取る処理に変換します。
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) を [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取る処理に変換します。
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) を [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取る処理に変換します。
- [count](/sql-reference/aggregate-functions/reference/count) を [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取る処理に変換します。
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapKeys) を [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み取る処理に変換します。
- [mapValues](/sql-reference/functions/tuple-map-functions#mapValues) を [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み取る処理に変換します。

設定可能な値:

- 0 — 最適化を無効にする。
- 1 — 最適化を有効にする。

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "デフォルトで定数キーを使う GROUP BY を最適化"}]}]}/>

ブロック内のすべてのキーが定数値である場合に GROUP BY を最適化します

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

GROUP BY 句内で、他のキーに対する関数呼び出しを削除します

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\}

<SettingsInfoBlock type="Bool" default_value="0" />

if(cond1, then1, if(cond2, ...)) 形式のチェーンを multiIf に置き換えます。現時点では、数値型に対しては有益ではありません。

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

If および Transform 関数における文字列型の引数を enum 型に置き換えます。分散クエリで不整合な変更が発生し、クエリが失敗する可能性があるため、デフォルトでは無効になっています。

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "analyzer の GROUP BY セクションで単射関数をその引数に置き換える"}]}]}/>

GROUP BY セクション内で単射関数をその引数に置き換えます

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\}

<SettingsInfoBlock type="Bool" default_value="1" />

uniq*() 関数内の、1 引数を取る単射関数を削除します。

## optimize_inverse_dictionary_lookup \{#optimize_inverse_dictionary_lookup\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

事前に計算された可能なキー値の Set に対して高速にルックアップを行うことで、Dictionary の逆向きルックアップを繰り返し実行することを回避します。

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr = x1 OR ... expr = xN` という式に対して最適化を適用するために必要な最小の長さ

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr <> x1 AND ... expr <> xN` という式を最適化する際の最小の長さ。

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

[SELECT](../../sql-reference/statements/select/index.md) クエリにおける自動 [`PREWHERE`](../../sql-reference/statements/select/prewhere.md) 最適化を有効化または無効化します。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ機能します。

設定可能な値:

- 0 — 自動 `PREWHERE` 最適化を無効にします。
- 1 — 自動 `PREWHERE` 最適化を有効にします。

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子を含む [SELECT](../../sql-reference/statements/select/index.md) クエリにおける、自動的な [PREWHERE](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ動作します。

設定可能な値:

- 0 — `FINAL` 修飾子を含む `SELECT` クエリでの自動 `PREWHERE` 最適化を無効にします。
- 1 — `FINAL` 修飾子を含む `SELECT` クエリでの自動 `PREWHERE` 最適化を有効にします。

**関連項目**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 設定

## optimize_multiif_to_if \{#optimize_multiif_to_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

条件が 1 つしかない 'multiIf' を 'if' に置き換えます。

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "意味的に count() と等価な集約関数を、デフォルトで count() に書き換えます"}]}]}/>

意味的に count() と等価な集約関数を count() に書き換えます。

## optimize_on_insert \{#optimize_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Enable data optimization on INSERT by default for better user experience"}]}]} />

INSERT 時に、テーブルエンジンに従い、このブロックに対してマージが行われたかのようなデータ変換を行うかどうかを制御します。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

有効と無効の違い:

クエリ:

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

結果:

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

なお、この設定は [materialized view](/sql-reference/statements/create/view#materialized-view) の動作に影響します。


## optimize_or_like_chain \{#optimize_or_like_chain\}

<SettingsInfoBlock type="Bool" default_value="0" />

複数の OR LIKE 式を multiMatchAny に最適化します。この最適化は、場合によっては索引の解析を妨げるため、デフォルトでは有効化すべきではありません。

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`QBit` データ型に対する距離関数を、計算に必要なカラムだけをストレージから読み出す同等の関数に置き換えます。

## optimize_read_in_order \{#optimize_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルからデータを読み取る [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、[ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) による最適化を有効化する設定です。

可能な値:

- 0 — `ORDER BY` の最適化を無効にします。
- 1 — `ORDER BY` の最適化を有効にします。

**関連項目**

- [ORDER BY 句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \{#optimize_read_in_window_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルでデータを指定された順序で読み取るために、ウィンドウ句における ORDER BY の最適化を有効にします。

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

引数が ORDER BY 句にも含まれている場合、その関数を ORDER BY 句から削除します

## optimize_respect_aliases \{#optimize_respect_aliases\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、WHERE/GROUP BY/ORDER BY 句でエイリアスを解釈して利用します。これにより、パーティションのプルーニングやセカンダリ索引、optimize_aggregation_in_order/optimize_read_in_order/optimize_trivial_count の最適化に役立ちます。

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

論理的に等価である場合、`if` 式を引数に取る集約関数を書き換えます。
たとえば、`avg(if(cond, col, null))` は `avgOrNullIf(cond, col)` に書き換えることができます。これによりパフォーマンスが向上する可能性があります。

:::note
analyzer（`enable_analyzer = 1`）が有効な場合にのみサポートされます。
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\}

<SettingsInfoBlock type="Bool" default_value="0" />

論理的に同値な場合、arrayExists() 関数を has() に書き換えます。たとえば、arrayExists(x -> x = 1, arr) は has(arr, 1) に書き換えることができます。

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

完全な前方一致または後方一致となる LIKE 式（例: `col LIKE 'ClickHouse%'`）を、`startsWith` や `endsWith` 関数（例: `startsWith(col, 'ClickHouse')`）へ書き換えます。

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

正規表現関連の関数を、より単純かつ効率的な形式へ書き換えます

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Only available for the analyzer, where it works correctly"}]}]}/>

論理的に同値な場合、sumIf() および sum(if()) を countIf() 関数に書き換えます

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\}

<SettingsInfoBlock type="Bool" default_value="0" />

レベルが 0 より大きいパーツが 1 つだけ存在し、そのパーツに有効期限 (TTL) が切れたデータが含まれていない場合に、[OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) クエリに対する最適化を有効化または無効化します。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

デフォルトでは、`OPTIMIZE TABLE ... FINAL` クエリは、パーツが 1 つしかない場合でもそのパーツを書き換えます。

指定可能な値:

- 1 - 最適化を有効にする。
- 0 - 最適化を無効にする。

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

`WHERE/PREWHERE` にシャーディングキー条件を含む [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、未使用の分片をスキップする機能を有効または無効にし、分散クエリに対する関連する最適化（例: シャーディングキーによる集約）を有効にします。

:::note
データがシャーディングキーによって分散されていることを前提としています。そうでない場合、クエリは正しくない結果を返します。
:::

取りうる値:

- 0 — 無効。
- 1 — 有効。

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

シャーディングキー値の個数に対する上限であり、この上限に達すると `optimize_skip_unused_shards` を無効にします。

値が多すぎると処理コストが大きくなる可能性がありますが、`IN (...)` に非常に多くの値が含まれている場合は、結局のところクエリは全ての分片に送信される可能性が高く、その効果はあまり期待できません。

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリのネストレベル（ある `Distributed` テーブルが別の `Distributed` テーブルを参照しているケース）に応じて [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) の動作を制御します（そのため、[`optimize_skip_unused_shards`](#optimize_skip_unused_shards) 自体の有効化が依然として必要です）。

Possible values:

- 0 — 無効。`optimize_skip_unused_shards` は常に適用されます。
- 1 — 第 1 レベルに対してのみ `optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `optimize_skip_unused_shards` を有効にします。

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\}

<SettingsInfoBlock type="Bool" default_value="1" />

リモートの分片に対するクエリ内の IN 句を書き換え、その分片に属さない値を除外します（optimize_skip_unused_shards が必要です）。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\}

<SettingsInfoBlock type="Bool" default_value="1" />

入力ストリームのソート特性を利用してソートを最適化する

## optimize_substitute_columns \{#optimize_substitute_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

カラムの置き換えには [制約](../../sql-reference/statements/create/table.md/#constraints) を使用します。デフォルトは `false` です。

指定可能な値:

- true, false

## optimize_syntax_fuse_functions \{#optimize_syntax_fuse_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

同一の引数を持つ集約関数を一つにまとめる（fuse）最適化を有効にします。クエリ内に、同一の引数を取る [sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count)、または [avg](/sql-reference/aggregate-functions/reference/avg) が少なくとも 2 つ含まれている場合に、それらを書き換えて [sumCount](/sql-reference/aggregate-functions/reference/sumcount) を使用します。

設定可能な値:

* 0 — 同一の引数を持つ関数は結合されません。
* 1 — 同一の引数を持つ関数は結合されます。

**例**

クエリ:

```sql
CREATE TABLE fuse_tbl(a Int8, b Int8) Engine = Log;
SET optimize_syntax_fuse_functions = 1;
EXPLAIN SYNTAX SELECT sum(a), sum(b), count(b), avg(b) from fuse_tbl FORMAT TSV;
```

結果:

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

[OPTIMIZE](../../sql-reference/statements/optimize.md) クエリがマージを実行しなかった場合に、例外をスローするかどうかを制御します。

デフォルトでは、`OPTIMIZE` は何も行わなかった場合でも正常終了します。この設定により、これらの状況を区別し、例外メッセージでその理由を確認できます。

取りうる値:

- 1 — 例外のスローが有効。
- 0 — 例外のスローが無効。

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "日付および DateTime の述語を、関数を変換を伴わない等価な比較条件に書き換えることで最適化します（例: toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'）。"}]}]}/>

日付および DateTime の述語を、関数を変換を伴わない等価な比較条件に書き換えることで最適化します（例: `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

EmbeddedRocksDB など、そのような推定をサポートするストレージに対する単純な COUNT 最適化で、近似値を使用します。

設定可能な値:

- 0 — 最適化を無効にする。
   - 1 — 最適化を有効にする。

## optimize_trivial_count_query \{#optimize_trivial_count_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

`MergeTree` のメタデータを使用して、単純なクエリ `SELECT count() FROM table` を最適化するかどうかを制御します。行レベルセキュリティを使用する必要がある場合は、この設定を無効にしてください。

Possible values:

- 0 — Optimization disabled.
   - 1 — Optimization enabled.

See also:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "The optimization does not make sense in many cases."}]}]}/>

単純な `INSERT INTO table SELECT ... FROM TABLES` クエリの最適化

## optimize_uniq_to_count \{#optimize_uniq_to_count\}

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに DISTINCT 句または GROUP BY 句が含まれている場合、uniq 関数およびそのバリエーション（uniqUpTo を除く）を count に書き換えます。

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT クエリの実行に使用する暗黙的な PROJECTION を自動的に選択します

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

この設定を有効にすると、`SELECT` クエリの実行に `PROJECTION` が選択されていない場合でも、`PROJECTION` を使用してパーツ範囲をフィルタリングできます。

## optimize_use_projections \{#optimize_use_projections\}

**エイリアス**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリを処理する際に、[プロジェクション](../../engines/table-engines/mergetree-family/mergetree.md/#projections)の最適化を有効または無効にします。

可能な値:

- 0 — プロジェクションの最適化を無効にします。
- 1 — プロジェクションの最適化を有効にします。

## optimize_using_constraints \{#optimize_using_constraints\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ最適化のために[constraints](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルト値は `false` です。

可能な値:

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\}

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

materialized view スレッド用の Linux の nice 値。値が低いほど CPU 優先度は高くなります。

CAP_SYS_NICE ケイパビリティが必要です。ない場合は何も行われません (no-op)。

取り得る値の範囲: -20 ～ 19。

## os_threads_nice_value_query \{#os_threads_nice_value_query\}

**エイリアス**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

クエリ処理スレッドに対する Linux の nice 値。値が小さいほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、それがない場合は何も行われません（no-op）。

取りうる値: -20 ～ 19。

## page_cache_block_size \{#page_cache_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "この設定をクエリ単位で調整できるようにしました。"}]}]}/>

ユーザ空間ページキャッシュに格納するファイル chunk のサイズ（バイト単位）。キャッシュを経由するすべての読み取りは、このサイズの倍数に切り上げられます。

この設定はクエリ単位で調整できますが、ブロックサイズが異なるキャッシュエントリは再利用できません。この設定を変更すると、事実上キャッシュ内の既存エントリは無効化されます。

1 MiB のような大きい値はスループット重視のクエリに適しており、64 KiB のような小さい値は低レイテンシのポイントクエリに適しています。

## page_cache_inject_eviction \{#page_cache_inject_eviction\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザースペースページキャッシュを追加"}]}]}/>

ユーザースペースページキャッシュは、ランダムに一部のページを無効化します。テスト用途を想定しています。

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\}

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "この設定をクエリ単位で調整可能にしました。"}]}]}/>

ユーザー空間ページキャッシュでミスが発生した場合、基盤となるストレージから、キャッシュに存在しない連続したブロックをこの数まで一度に読み込みます。各ブロックのサイズは page_cache_block_size バイトです。

より大きな値はスループット重視のクエリに有利ですが、低レイテンシなポイントクエリでは先読みを行わない方がより良く動作します。

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

並列分散 `INSERT ... SELECT` クエリを有効にします。

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` クエリを実行する際に、両方のテーブルが同じクラスターを使用しており、かつ両方のテーブルが[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)あり、または両方とも非レプリケーションである場合、このクエリは各分片上でローカルに処理されます。

設定可能な値:

- `0` — 無効。
- `1` — `SELECT` は分散エンジンの下位テーブルの各分片で実行されます。
- `2` — `SELECT` と `INSERT` は分散エンジンの下位テーブルの各分片で/へ実行されます。

この設定を使用する場合は、`enable_parallel_replicas = 1` を設定しておく必要があります。

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

ハッシュベースの結合アルゴリズムが適用される場合、このしきい値は（右側テーブルのサイズの推定値が利用可能な場合にのみ）、`hash` と `parallel_hash` のどちらを使用するかを決定するために使用されます。
右側テーブルのサイズがこのしきい値を下回ると分かっている場合は、前者が使用されます。

## parallel_replica_offset \{#parallel_replica_offset\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは内部用の設定であり、直接使用すべきではなく、`parallel replicas` モードにおける実装上の詳細を表します。この設定は、分散クエリにおいて parallel replicas の中でクエリ処理に参加するレプリカの索引に対して、イニシエーターサーバーによって自動的に設定されます。

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "true の場合、IN 句のサブクエリはすべての follower レプリカで実行されます"}]}]}/>

true の場合、IN 句のサブクエリはすべての follower レプリカで実行されます。

## parallel_replicas_allow_materialized_views \{#parallel_replicas_allow_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "並列レプリカで materialized view を使用可能にする"}]}]}/>

並列レプリカで materialized view を使用可能にする

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "parallel replicas クエリ用の個別の接続タイムアウト"}]}]}/>

parallel replicas を用いたクエリ実行中に、リモートのレプリカへ接続するためのタイムアウトをミリ秒で指定します。タイムアウトに達した場合、該当するレプリカはクエリ実行には使用されません。

## parallel_replicas_count \{#parallel_replicas_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは内部用の設定であり、直接使用すべきではなく、`parallel replicas` モードの実装上の詳細を表します。この設定は、分散クエリに対して、クエリ処理に参加する並列レプリカの数に応じて、イニシエータサーバーによって自動的に設定されます。

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\}

<BetaBadge/>

特定のテーブルに対して、レプリカ間で処理を分割するために使用できる任意の整数式です。
値には任意の整数式を指定できます。

プライマリキーを用いた単純な式が推奨されます。

単一の分片で複数のレプリカから構成されるクラスタでこの設定を使用する場合、それらのレプリカは仮想分片に変換されます。
それ以外の場合は `SAMPLE` キーと同様に動作し、各分片の複数のレプリカを利用します。

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "parallel replicas を dynamic shards と併用する際の range フィルタを制御するための設定を追加"}]}]}/>

フィルタタイプ `range` が、カスタム範囲 `[parallel_replicas_custom_key_range_lower, INT_MAX]` に基づいてレプリカ間で処理を均等に分割できるようにします。

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` について、フィルタがレプリカ間で処理を均等に分割できるようになります。

注: この設定によってクエリ処理中に追加のデータがフィルタされることはなく、並列処理のために range フィルタが `[0, INT_MAX]` の範囲を分割するポイントが変化するだけです。

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "parallel replicas を動的な分片と併用する際の range フィルタの範囲を制御するための設定を追加。値 0 は上限を無効化"}]}]}/>

フィルタタイプ `range` が、カスタム範囲 `[0, parallel_replicas_custom_key_range_upper]` に基づいてレプリカ間で作業を均等に分割できるようにします。値が 0 の場合、上限は無効になり、カスタムキー式の最大値が上限として使用されます。

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` に対して、フィルタがレプリカ間で作業を均等に分割できるようになります。

注意: この設定によってクエリ処理中に追加のデータがフィルタされることはありません。代わりに、並列処理のために range フィルタが範囲 `[0, INT_MAX]` をどの位置で分割するかが変更されます。

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

テーブル関数エンジンを対応する -Cluster 版に置き換えます。

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse はレプリケーションされていない MergeTree テーブルに対しても parallel replicas のアルゴリズムを使用します

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "索引の解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効化されている場合にのみ有効です。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "索引の解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効化されている場合にのみ有効です。"}]}]}/>

索引の解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効化されている場合にのみ有効です。

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "並列レプリカを使用した分散 INSERT SELECT でローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "並列レプリカを使用した分散 INSERT SELECT でローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}]}/>

並列レプリカを使用した分散 INSERT SELECT でローカルパイプラインを使用します

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "並列レプリカを用いるクエリにおいてローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "並列レプリカを用いるクエリにおいてローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "並列レプリカを用いるクエリにおいてローカルレプリカに対してローカルプランを使用する"}]}]}/>

ローカルレプリカに対するローカルプランを構築する

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "この設定の値は現在、自動的に決定されます"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "新しい parallel replicas coordinator 実装におけるセグメントサイズを制御するための新しい設定を追加"}]}]}/>

パーツは、レプリカ間で並列読み取りのために分配されるセグメントに仮想的に分割されます。この設定は、これらのセグメントのサイズを制御します。その動作を十分に理解していない限り、変更することは推奨されません。値は [128; 16384] の範囲内で指定する必要があります。

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで使用するレプリカ数の上限を、(読み取ると見積もられた行数 / min_number_of_rows_per_replica) に設定します。上限値は依然として 'max_parallel_replicas' によって制限されます。

## parallel_replicas_mode \{#parallel_replicas_mode\}

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "この設定は parallel replicas 機能を Beta 段階にする一環として導入されました"}]}]}/>

parallel replicas 用のカスタムキーに対して使用するフィルタの種類を指定します。`default` — カスタムキーに対して modulo 演算を使用します。`range` — カスタムキーの値型で取り得るすべての値を用いて、カスタムキーに対して範囲フィルタを使用します。

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Parallel replicas は analyzer が有効な場合にのみサポートされます"}]}]}/>

Parallel replicas を使用するには analyzer を有効にしておく必要があります。analyzer が無効な場合、たとえ replicas からの並列読み取りが有効になっていても、クエリ実行はローカル実行にフォールバックします。analyzer を有効にせずに Parallel replicas を使用することはサポートされていません。

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "true の場合、JOIN を parallel replicas アルゴリズムで実行でき、かつ右側の JOIN のすべてのストレージが *MergeTree のとき、GLOBAL JOIN の代わりにローカル JOIN が使用されます。"}]}]}/>

true の場合、JOIN を parallel replicas アルゴリズムで実行でき、かつ右側の JOIN のすべてのストレージが *MergeTree のとき、GLOBAL JOIN の代わりにローカル JOIN が使用されます。

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定。プロジェクションの最適化は並列レプリカで適用できます。`parallel_replicas_local_plan` が有効で、かつ `aggregation_in_order` が無効の場合にのみ有効です。"}]}]}/>

プロジェクションの最適化は並列レプリカで適用できます。`parallel_replicas_local_plan` が有効で、かつ `aggregation_in_order` が無効の場合にのみ有効です。

## 並列ビュー処理 \{#parallel_view_processing\}

<SettingsInfoBlock type="Bool" default_value="0" />

アタッチされているビューへのプッシュを、逐次ではなく並列に実行できるようにします。

## parallelize_output_from_storages \{#parallelize_output_from_storages\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "file/url/S3 などから読み取るクエリを実行する際に並列処理を許可します。これにより行の順序が変更される場合があります。"}]}]}/>

ストレージからの読み取りステップにおける出力を並列化します。可能な場合には、ストレージからの読み取り直後のクエリ処理を並列実行できるようにします。

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 'parseDateTime' におけるフォーマット指定子 '%e' は、1 桁の日がスペースでパディングされていることを前提とします。たとえば ' 2' は受け入れられますが、'2' はエラーになります。

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `parseDateTime` において、フォーマッタ `%c`、`%l`、`%k` は、先頭にゼロを付けない月および時を解釈します。

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外の値の場合、partial merge join において左側テーブルのブロックを、より大きなブロックにまとめます。結合スレッドごとに、指定したメモリ量の最大 2 倍まで使用します。

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

部分マージ結合アルゴリズムにおいて、[JOIN](../../sql-reference/statements/select/join.md) クエリの右側の結合データブロックのサイズを制限します。

ClickHouse サーバーは次の処理を行います。

1.  指定された最大行数以内になるように、右側の結合データを複数のブロックに分割します。
2.  各ブロックを、その最小値と最大値で索引付けします。
3.  可能であれば、準備済みブロックをディスクに退避します。

取り得る値:

- 任意の正の整数。推奨値の範囲: \[1000, 100000\]。

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリのキャンセル後に部分的な結果を返せるようにします。

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルが単一のパーティション内に、この設定値以上の数のアクティブなパーツを含んでいる場合、テーブルへの挿入処理を意図的に遅延させます。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルの1つのパーティション内でアクティブなパーツ数がこの値を超えた場合、'Too many parts ...' という例外をスローします。

## per_part_index_stats \{#per_part_index_stats\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

パーツ単位で索引統計情報をログに記録します

## poll_interval \{#poll_interval\}

<SettingsInfoBlock type="UInt64" default_value="10" />

サーバー側のクエリ待機ループを、指定された秒数だけブロックします。

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 接続の `connect_timeout` パラメータを制御できるようにします。"}]}]}/>

PostgreSQL エンドポイントへの 1 回の接続試行に対するタイムアウト（秒）。
この値は接続 URL の `connect_timeout` パラメータとして渡されます。

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\}

<SettingsInfoBlock type="Bool" default_value="0" />

接続をプールに戻す前に閉じます。

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL コネクションプールにおけるリトライ回数を制御できるようにします。"}]}]}/>

PostgreSQL テーブルエンジンおよびデータベースエンジン向けコネクションプールにおける push/pop のリトライ回数。

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL テーブルエンジンおよびデータベースエンジン用の接続プールのサイズ。

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL テーブルエンジンおよびデータベースエンジンにおいて、接続プールが空の場合のプール push/pop 操作のタイムアウトです。デフォルトでは、プールが空の場合にブロックし続けます。

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

レプリケーション用の内部 PostgreSQL クエリが失敗する近似的な確率です。有効な値の範囲は [0.0f, 1.0f] です。

## prefer_column_name_to_alias \{#prefer_column_name_to_alias\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ式および句で、エイリアスではなく元のカラム名を使用するかどうかを制御します。特に、エイリアスがカラム名と同じ場合に重要になります。詳細は [Expression Aliases](/sql-reference/syntax#notes-on-usage) を参照してください。この設定を有効にすると、ClickHouse におけるエイリアス構文ルールが他の多くのデータベースエンジンとより互換性の高いものになります。

可能な値:

* 0 — カラム名がエイリアスで置き換えられます。
* 1 — カラム名はエイリアスで置き換えられません。

**例**

有効時と無効時の違い:

クエリ:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果：

```text
Received exception from server (version 21.5.1):
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function avg(number) is found inside another aggregate function in query: While processing avg(number) AS number.
```

クエリ:

```sql
SET prefer_column_name_to_alias = 1;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果：

```text
┌─number─┬─max(number)─┐
│    4.5 │           9 │
└────────┴─────────────┘
```


## prefer_external_sort_block_bytes \{#prefer_external_sort_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "外部ソート時にブロックの最大サイズ（バイト数）を優先的に使用し、マージ処理中のメモリ使用量を削減します。"}]}]}/>

外部ソート時にブロックの最大サイズ（バイト数）を優先的に使用し、マージ処理中のメモリ使用量を削減します。

## prefer_global_in_and_join \{#prefer_global_in_and_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

`IN`/`JOIN` 演算子を `GLOBAL IN`/`GLOBAL JOIN` に置き換えることを有効にします。

設定可能な値:

- 0 — 無効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられません。
- 1 — 有効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられます。

**使用法**

`SET distributed_product_mode=global` は分散テーブルに対するクエリの挙動を変更できますが、ローカルテーブルや外部リソース上のテーブルには適していません。そこで `prefer_global_in_and_join` 設定が役に立ちます。

たとえば、分散には適さないローカルテーブルを保持するクエリ処理ノードがあるとします。分散処理中に `GLOBAL` キーワード (`GLOBAL IN`/`GLOBAL JOIN`) を使用して、そのデータをオンザフライで分散させる必要があります。

`prefer_global_in_and_join` の別のユースケースは、外部エンジンによって作成されたテーブルへのアクセスです。この設定は、そのようなテーブルを JOIN する際に外部ソースへの呼び出し回数を削減するのに役立ちます。クエリごとに 1 回の呼び出しのみとなります。

**関連項目:**

- `GLOBAL IN`/`GLOBAL JOIN` の使用方法の詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries) を参照してください。

## prefer_localhost_replica \{#prefer_localhost_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

分散クエリを処理する際に、localhost のレプリカを優先的に使用するかどうかを有効化／無効化します。

設定可能な値:

- 1 — localhost のレプリカが存在する場合、ClickHouse は常にそのレプリカにクエリを送信します。
- 0 — ClickHouse は [load_balancing](#load_balancing) 設定で指定されたバランシング戦略を使用します。

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用せずに [max_parallel_replicas](#max_parallel_replicas) を使用する場合は、この設定を無効にしてください。
[parallel_replicas_custom_key](#parallel_replicas_custom_key) が設定されている場合、複数の分片に複数のレプリカを含むクラスターで使用しているときのみ、この設定を無効にしてください。
1 つの分片と複数のレプリカを持つクラスターで使用している場合にこの設定を無効にすると、パフォーマンスに悪影響を与えます。
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ効果があります。マージ済みパーツがこの秒数より新しく、かつ事前ウォームされていない場合（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）、そのソースとなったすべてのパーツが利用可能かつ事前ウォームされていれば、SELECT クエリは代わりにそれらのパーツから読み取ります。Replicated-/SharedMergeTree の場合のみ有効です。これは CacheWarmer がそのパーツを処理したかどうかだけを確認する点に注意してください。パーツが他の要因によってキャッシュにフェッチされていたとしても、CacheWarmer が処理するまではコールドと見なされます。また、一度ウォームされてからキャッシュから削除された場合でも、ウォームであると見なされます。

## preferred_block_size_bytes \{#preferred_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

この設定はクエリ処理におけるデータブロックサイズを調整し、より大まかな `max_block_size` 設定に対する追加の細かなチューニングに相当します。カラムが大きく、`max_block_size` 行を含めるとブロックサイズが指定されたバイト数を超えると見込まれる場合には、CPU キャッシュの局所性を高めるために、そのサイズが小さく調整されます。

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時のブロック内におけるカラムの最大サイズの上限値。キャッシュミスの発生回数を減らすのに役立ちます。L2 キャッシュサイズに近い値に設定することを推奨します。

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\}

空でない文字列が設定されている場合、ClickHouse はクエリで指定されたプロジェクションを適用しようとします。

設定可能な値:

- string: 優先するプロジェクションの名前

## prefetch_buffer_size \{#prefetch_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ファイルシステムから読み出すためのプリフェッチバッファの最大サイズです。

## print_pretty_type_names \{#print_pretty_type_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Better user experience."}]}]} />

`DESCRIBE` クエリおよび `toTypeName()` 関数で、深くネストした型名をインデント付きの見やすい形式で出力できるようにします。

例:

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

クエリの優先度。1 が最も高く、値が大きいほど優先度が低くなります。0 の場合は優先度を使用しません。

## promql_database \{#promql_database\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的な設定"}]}]}/>

`promql` ダイアレクトで使用されるデータベース名を指定します。空文字列を指定した場合は、現在のデータベースを意味します。

## promql_evaluation_time \{#promql_evaluation_time\}

<ExperimentalBadge/>

**別名**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "この設定の名称は変更されました。以前の名前は `evaluation_time` です。"}]}]}/>

promql 方言で使用される評価時刻を設定します。`auto` は現在の時刻を意味します。

## promql_table \{#promql_table\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的な設定"}]}]}/>

'promql' ダイアレクトで使用する TimeSeries テーブルの名前を指定します。

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリの実行時に、発行元から他のノードへユーザーロールを伝搬させることを有効化します。

## query_cache_compress_entries \{#query_cache_compress_entries\}

<SettingsInfoBlock type="Bool" default_value="1" />

[query cache](../query-cache.md) 内のエントリを圧縮します。クエリキャッシュへの挿入・クエリキャッシュからの読み取りが遅くなる代わりに、クエリキャッシュのメモリ消費を削減します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_max_entries \{#query_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) に保存できるクエリ結果の最大数。0 は無制限を意味します。

取り得る値:

- 0 以上の整数。

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [クエリキャッシュ](../query-cache.md) に割り当てることができるメモリの最大量（バイト単位）。0 は無制限を意味します。

設定可能な値:

- 0 以上の整数。

## query_cache_min_query_duration \{#query_cache_min_query_duration\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

クエリの結果が[クエリキャッシュ](../query-cache.md)に保存されるために必要な、クエリ実行時間の最小値（ミリ秒単位）。

取りうる値:

- 0 以上の整数。

## query_cache_min_query_runs \{#query_cache_min_query_runs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) に保存されるまでに、そのクエリが実行される必要がある最小回数。

設定可能な値:

- 0 以上の整数。

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\}

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

[クエリキャッシュ](../query-cache.md) が、`rand()` や `now()` などの非決定的関数を含む `SELECT` クエリをどのように扱うかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_share_between_users \{#query_cache_share_between_users\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、[query cache](../query-cache.md) にキャッシュされた `SELECT` クエリの結果を他のユーザーが参照できるようになります。
セキュリティ上の理由から、この設定を有効にすることは推奨されません。

指定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

部分的な結果ブロックを、[max_block_size](#max_block_size) のサイズのブロックにまとめます。これにより [query cache](../query-cache.md) への挿入パフォーマンスは低下しますが、キャッシュエントリの圧縮効率が向上します（[query_cache_compress-entries](#query_cache_compress_entries) を参照）。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_system_table_handling \{#query_cache_system_table_handling\}

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "The query cache no longer caches results of queries against system tables"}]}]}/>

[query cache](../query-cache.md) がシステムテーブルに対する `SELECT` クエリ、すなわちデータベース `system.*` および `information_schema.*` 内のテーブルに対するクエリをどのように扱うかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_tag \{#query_cache_tag\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "クエリキャッシュエントリにラベル付けするための新しい設定。"}]}]}/>

[クエリキャッシュ](../query-cache.md) のエントリに付与するラベルとして機能する文字列です。  
同一のクエリでも、異なるタグが付いている場合は、クエリキャッシュ上では別のものとして扱われます。

指定可能な値:

- 任意の文字列

## query_cache_ttl \{#query_cache_ttl\}

<SettingsInfoBlock type="Seconds" default_value="60" />

この秒数が経過すると、[query cache](../query-cache.md) 内のエントリは期限切れと見なされます。

指定可能な値:

- 0 以上の正の整数。

## query_condition_cache_store_conditions_as_plaintext \{#query_condition_cache_store_conditions_as_plaintext\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

[query condition cache](/operations/query-condition-cache) 用のフィルタ条件を平文で格納します。
有効にすると、system.query_condition_cache にフィルタ条件がそのままの形で表示されるため、キャッシュに関する問題のデバッグが容易になります。
平文のフィルタ条件によって機密情報が露出する可能性があるため、デフォルトでは無効です。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_metric_log_interval \{#query_metric_log_interval\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "新しい設定。"}]}]}/>

個々のクエリごとに [query_metric_log](../../operations/system-tables/query_metric_log.md) が収集される間隔（ミリ秒）。

任意の負の値を設定した場合、[query_metric_log setting](/operations/server-configuration-parameters/settings#query_metric_log) の `collect_interval_milliseconds` の値が使用され、それが存在しない場合はデフォルトで 1000 が使用されます。

個々のクエリの収集を無効化するには、`query_metric_log_interval` を 0 に設定します。

デフォルト値: -1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "クエリプラン周りの一部のリファクタリングを有効化"}]}]}/>

クエリプランレベルでの「aggregation in-order」最適化の有効／無効を切り替えます。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) の設定が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグのためにのみ使用すべき上級者向け設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

JOIN の後のフィルタが、未マッチ行またはマッチ行に対して常に false と評価される場合に、ANY JOIN を SEMI JOIN または ANTI JOIN に変換できるようにします

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

出力カラムが左側テーブルのみに紐付いている場合に、`JOIN` を `IN` を用いたサブクエリへ変換することを許可します。非 `ANY` の `JOIN`（デフォルトである `ALL JOIN` など）の場合、誤った結果をもたらす可能性があります。

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "JOIN 後のフィルタが常にデフォルト値を除外する場合に OUTER JOIN を INNER JOIN へ変換することを許可"}]}]}/>

`JOIN` 後のフィルタが常にデフォルト値を除外する場合に、`OUTER JOIN` を `INNER JOIN` へ変換することを許可します

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリプランで、転置テキスト索引だけを使用して全文検索のフィルタ処理を行えるようにします。

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

EXPLAIN PLAN で、元のクエリで指定されたエイリアスではなく、内部エイリアス（__table1 など）を表示します。

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数の評価後のマルチスレッド化を有効にし、ストリーム処理を並列に実行できるようにします

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでのクエリ最適化を有効／無効にします。

:::note
これは、開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - クエリプランレベルでのすべての最適化を無効にする
- 1 - クエリプランレベルでの最適化を有効にする（ただし、個々の最適化は、それぞれの設定で無効化されている場合があります）

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

ソートステップの後に式を移動する、クエリプランレベルの最適化の有効／無効を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途にのみ使用すべきエキスパートレベルの設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_filter_push_down \{#query_plan_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの最適化を切り替えます。この最適化は、実行プラン内でフィルタをより下位のステージへ移動します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは、開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来的に後方互換性のない形で変更されたり、削除される可能性があります。
:::

可能な値:

- 0 - Disable
- 1 - Enable

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

両方のテーブルで JOIN キーが PRIMARY KEY のプレフィックスを含む場合に、JOIN に対して分片処理を適用します。`hash`、`parallel_hash`、`full_sorting_merge` アルゴリズムでサポートされます。通常はクエリの高速化にはつながりませんが、メモリ消費量を抑えられる場合があります。

## query_plan_join_swap_table \{#query_plan_join_swap_table\}

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新しい設定。以前は常に右テーブルが選択されていました。"}]}]}/>

クエリプランにおいて、結合のどちらの側をビルドテーブル（inner とも呼ばれ、ハッシュ結合でハッシュテーブルに挿入される側）とするかを決定します。この設定は、結合の厳密さが `ALL` で、かつ `JOIN ON` 句を使用する場合にのみサポートされます。取りうる値は次のとおりです。

- 'auto': どちらのテーブルをビルドテーブルとして使用するかをプランナーに任せます。
    - 'false': テーブルを入れ替えません（右テーブルがビルドテーブルになります）。
    - 'true': 常にテーブルを入れ替えます（左テーブルがビルドテーブルになります）。

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

`ARRAY JOIN` を実行プラン内で上位に移動させる、クエリプランレベルの最適化を有効／無効に切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ効果があります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_lift_up_union \{#query_plan_lift_up_union\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプラン内の大きなサブツリーを `union` に持ち上げて、さらなる最適化を可能にするクエリプランレベルの最適化を有効／無効に切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "lazy materialization 最適化にクエリプランを使用できるようにする LIMIT の最大値を制御する新しい設定を追加。0 の場合、上限なし"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10000"},{"label": "パフォーマンス改善後に LIMIT の上限を引き上げ"}]}, {"id": "row-3","items": [{"label": "25.11"},{"label": "100"},{"label": "より最適な値に調整"}]}]}/>

lazy materialization 最適化にクエリプランを使用できるようにする LIMIT の最大値を制御します。0 の場合、上限はありません。

## query_plan_max_limit_for_top_k_optimization \{#query_plan_max_limit_for_top_k_optimization\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting."}]}]}/>

TopK 最適化のために、minmax スキップ索引および動的しきい値フィルタリングを使用してクエリプランを評価できる最大の LIMIT 値を制御します。0 の場合、制限はありません。

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

クエリプランに適用される最適化の総数を制限します。設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) も参照してください。
複雑なクエリに対する最適化時間が長くなりすぎるのを避けるのに役立ちます。
EXPLAIN PLAN クエリでは、この上限に達した時点で最適化の適用を停止し、その時点までのプランをそのまま返します。
通常のクエリ実行では、実際の最適化回数がこの設定値を超えた場合、例外がスローされます。

:::note
これは開発者によるデバッグ用途にのみ使用すべきエキスパートレベルの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN におけるステップの説明の最大の長さ。

## query_plan_merge_expressions \{#query_plan_merge_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

連続するフィルタをマージするクエリプランレベルの最適化を有効／無効を切り替えます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途に限って使用すべきエキスパート向けの設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "フィルターを結合条件に統合するための新しい設定を追加"}]}]}/>

`JOIN` 条件にフィルターを統合し、`CROSS JOIN` を `INNER JOIN` に変換できるようにします。

## query_plan_merge_filters \{#query_plan_merge_filters\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "クエリプラン内のフィルタをマージできるようにする"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "クエリプラン内のフィルタをマージできるようにする。これは、新しいアナライザでの filter-push-down を正しくサポートするために必要です。"}]}]}/>

クエリプラン内のフィルタをマージできるようにします。

## query_plan_optimize_join_order_algorithm \{#query_plan_optimize_join_order_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="JoinOrderAlgorithm" default_value="greedy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "greedy"},{"label": "New experimental setting."}]}]}/>

クエリプラン最適化時に試行する JOIN 順序アルゴリズムを指定します。利用可能なアルゴリズムは次のとおりです。

- 'greedy' - 基本的な貪欲法アルゴリズムです。高速に動作しますが、常に最適な JOIN 順序を生成できるとは限りません。
- 'dpsize' - 現在は Inner JOIN に対してのみ実装されている DPsize アルゴリズムです。取り得るすべての JOIN 順序を考慮して最も最適なものを見つけますが、多数のテーブルや JOIN 述語を含むクエリでは遅くなる可能性があります。

複数のアルゴリズムを指定できます（例: 'dpsize,greedy'）。

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "デフォルトでより多くのテーブルに対する JOIN 順序の並べ替えを許可"}]}]}/>

同一サブクエリ内の JOIN の順序を最適化します。現在はごく限られたケースでのみサポートされています。
この値は、最適化対象とするテーブル数の上限です。

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "遅延マテリアライゼーションの最適化にクエリプランを使用する新しい設定を追加しました"}]}]}/>

遅延マテリアライゼーションの最適化にクエリプランを使用します。

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "サポートされているストレージでフィルタ条件を PREWHERE 式までプッシュダウンできるようにする"}]}]}/>

サポートされているストレージでフィルタ条件を PREWHERE 式までプッシュダウンできるようにする

## query_plan_push_down_limit \{#query_plan_push_down_limit\}

<SettingsInfoBlock type="Bool" default_value="1" />

実行プラン内で `LIMIT` をより下位の演算に移動させる、クエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来、この設定は後方互換性のない形で変更されるか、削除される可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order \{#query_plan_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

`read in-order` 最適化である query-plan レベルの最適化の有効・無効を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order_through_join \{#query_plan_read_in_order_through_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

JOIN 操作で左テーブルからの読み取り順序を維持し、その順序を後続のステップで利用できるようにします。

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

クエリプラン内の冗長な DISTINCT ステップを削除する、クエリプランレベルの最適化機能の有効／無効を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "クエリプラン内の冗長なソートを削除します。たとえば、サブクエリ内の ORDER BY 句に関連するソートステップなど"}]}]}/>

クエリプランレベルの最適化で、サブクエリなどにおける冗長なソートステップを削除するかどうかを切り替えます。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 設定が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ用途でのみ使用すべき上級者向け設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "新しい設定。クエリプランから未使用のカラムを削除する最適化を追加。"}]}]}/>

未使用のカラム（入力カラムと出力カラムの両方）をクエリプランの各ステップから削除しようとする、クエリプランレベルの最適化を切り替えます。
この設定は [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者によるデバッグ用途にのみ使用すべきエキスパート向けの設定です。今後のバージョンで後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数のためのソート時に、ストレージの並び順を利用するクエリプランレベルの最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_split_filter \{#query_plan_split_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

フィルタ条件を個々の式に分割する、クエリプランレベルでの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

Possible values:

- 0 - Disable
- 1 - Enable

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

クエリプラン内で、インバーテッドテキスト索引に基づいて構築されるフィルタリングに対して、ヒント（追加の述語）を付加できるようにします。

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting."}]}]}/>

ベクトル類似性索引の利用を試みる、クエリプランレベルの最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。今後、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\}

**別名**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しいステップを有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい join ステップ（内部変更）"}]}]}/>

クエリプラン内で logical join ステップを使用します。  
注意: `query_plan_use_new_logical_join_step` は非推奨です。代わりに `query_plan_use_logical_join_step` を使用してください。

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の CPU クロックタイマーの周期を設定します。このタイマーは CPU 時間のみをカウントします。

設定可能な値:

- 正の整数値（ナノ秒単位）。

    推奨値:

            - 単一クエリのプロファイリングには 10000000（1秒間に100回）ナノ秒以上。
            - クラスター全体のプロファイリングには 1000000000（1秒に1回）ナノ秒。

- タイマーを無効にする場合は 0。

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) のリアルクロックタイマーの周期を設定します。リアルクロックタイマーはウォールクロック時間を計測します。

設定可能な値:

- 正の整数値（ナノ秒単位）。

    推奨値:

            - 単一クエリに対しては 10000000（1 秒間に 100 回）ナノ秒以下。
            - クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）。

- 0 にするとタイマーを無効化します。

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

同時リクエスト数が上限を超えた場合に、リクエストキュー内で発生する待機時間。

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

再試行を行う前に、RabbitMQ からの読み取りで待機する時間。

## read_backoff_max_throughput \{#read_backoff_max_throughput\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

読み取りが遅い場合にスレッド数を減らすための設定です。読み取り帯域幅が 1 秒あたりこの値（バイト数）未満になったときにイベントをカウントします。

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="1" />

読み取りが遅い場合に維持しようとするスレッド数の下限を指定する設定項目です。

## read_backoff_min_events \{#read_backoff_min_events\}

<SettingsInfoBlock type="UInt64" default_value="2" />

読み取りが遅い場合にスレッド数を減らすための設定です。スレッド数を削減するきっかけとなるイベント数を指定します。

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

低速な読み取りが発生した場合にスレッド数を減らすための設定です。直前のイベント発生から一定時間未満しか経過していない場合は、そのイベントを無視します。

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

低速な読み取りが発生した場合に、スレッド数を減らすための設定です。この値以上の時間がかかった読み取りのみを対象とします。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。read_from_filesystem_cache_if_exists_otherwise_bypass_cache と同様ですが、分散キャッシュに対する設定です。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルシステムキャッシュをパッシブモードで使用できるようにします。既存のキャッシュエントリは利用しますが、新しいエントリはキャッシュに追加しません。重いアドホッククエリに対してこの設定を有効にし、短いリアルタイムクエリでは無効のままにしておくことで、負荷の高いクエリによるキャッシュスラッシングを回避し、システム全体の効率を向上させることができます。

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザースペースページキャッシュを追加"}]}]}/>

read_from_filesystem_cache_if_exists_otherwise_bypass_cache と同様に、パッシブモードでユーザースペースページキャッシュを利用します。

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

マルチスレッドでプライマリキー順に読み取る際に、事前のマージ処理を実行するために読み込む必要となるパーツの最小数。

## read_in_order_use_buffering \{#read_in_order_use_buffering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Use buffering before merging while reading in order of primary key"}]}]}/>

主キー順に読み取る際、マージの前にバッファリングを行います。これにより、クエリ実行の並列度が向上します。

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "主キーまたはその単調関数に基づく順序で読み取る際に仮想行を使用します。複数のパーツを検索する場合に、関連するパーツのみがアクセスされるため有用です。"}]}]}/>

主キーまたはその単調関数に基づく順序で読み取る際に仮想行を使用します。複数のパーツを検索する場合に、関連するパーツのみがアクセスされるため有用です。

## read_overflow_mode \{#read_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

制限超過時の挙動を指定します。

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

読み込まれるデータ量が、いずれかの leaf 制限を超えた場合に何が起こるかを設定します。

指定可能なオプションは次のとおりです:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、途中までの結果を返します。

## read_priority \{#read_priority\}

<SettingsInfoBlock type="Int64" default_value="0" />

ローカルファイルシステムまたはリモートファイルシステムからデータを読み出す際の優先度。ローカルファイルシステムでは `pread_threadpool` メソッド、リモートファイルシステムでは `threadpool` メソッドでのみサポートされます。

## read_through_distributed_cache \{#read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからの読み取りを許可します。

## readonly \{#readonly\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 読み取り専用の制限はなし。1 - 読み取りリクエストのみ許可され、明示的に許可された設定のみ変更可能。2 - 読み取りリクエストのみ許可され、`readonly` 設定を除く設定の変更が可能。

## receive_data_timeout_ms \{#receive_data_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

レプリカから最初のデータパケット、または正の進捗を示すパケットを受信するまでの接続タイムアウト

## receive_timeout \{#receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークからデータを受信する際のタイムアウト（秒）です。この時間内に 1 バイトも受信しなかった場合、例外がスローされます。クライアント側でこの設定を行うと、対応するサーバー側接続のソケットにも `send_timeout` が設定されます。

## regexp_dict_allow_hyperscan \{#regexp_dict_allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを使用する `regexp_tree` Dictionary の利用を許可します。

## regexp_dict_flag_case_insensitive \{#regexp_dict_flag_case_insensitive\}

<SettingsInfoBlock type="Bool" default_value="0" />

`regexp_tree` Dictionary に対して大文字と小文字を区別しないマッチングを行います。個々の式ごとに `(?i)` および `(?-i)` を使用して上書きできます。

## regexp_dict_flag_dotall \{#regexp_dict_flag_dotall\}

<SettingsInfoBlock type="Bool" default_value="0" />

regexp_tree Dictionary において、'.' を改行文字にもマッチさせることを許可します。

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

1 行あたり 1 つの正規表現について許可される最大マッチ数を設定します。貪欲な正規表現を [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 関数で使用する際のメモリの過負荷から保護するために使用します。

設定可能な値:

- 正の整数。

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\}

<SettingsInfoBlock type="Bool" default_value="1" />

NFA 状態数の爆発により hyperscan での評価コストが高くなると見なされるパターンを拒否します

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

再マージ後のメモリ使用量がこの比率以上に削減されない場合、再マージは無効になります。

## remote_filesystem_read_method \{#remote_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="threadpool" />

リモートファイルシステムからデータを読み込む方式です。`read` または `threadpool` のいずれかを指定します。

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムからデータを読み込む際にプリフェッチを行うかどうかを指定します。

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="5" />

バックオフしながら実行する読み取りの最大試行回数

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

リモートディスクからデータを読み取る際の最大待機時間

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

リモート読み取り（URL、S3）でシークを行うために必要な最小バイト数。この値より小さい場合は、シークせずにデータを読み飛ばします。

## rename_files_after_processing \{#rename_files_after_processing\}

- **Type:** 文字列

- **Default value:** 空文字列

この設定では、`file` テーブル関数で処理されたファイルに対して使用するリネームパターンを指定できます。オプションが設定されている場合、`file` テーブル関数で読み取られたすべてのファイルは、プレースホルダを含む指定パターンに従ってリネームされます。これは、ファイルの処理が正常に完了した場合にのみ行われます。

### プレースホルダー \{#placeholders\}

- `%a` — 元のファイル名全体（例: "sample.csv"）。
- `%f` — 拡張子を除いた元のファイル名（例: "sample"）。
- `%e` — ドット付きの元のファイル拡張子（例: ".csv"）。
- `%t` — タイムスタンプ（マイクロ秒単位）。
- `%%` — パーセント記号 ("%")。

### 例 \{#example\}

- オプション: `--rename_files_after_processing="processed_%f_%t%e"`

- クエリ: `SELECT * FROM file('sample.csv')`

`sample.csv` の読み込みが成功すると、ファイル名は `processed_sample_1683473210851438.csv` に変更されます。

## replace_running_query \{#replace_running_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP インターフェイスを使用する場合、`query_id` パラメータを渡すことができます。これはクエリ識別子として機能する任意の文字列です。
同じユーザーから、同じ `query_id` を持つクエリがすでに存在する場合、その時の動作は `replace_running_query` パラメータによって決まります。

`0` (デフォルト) – 例外をスローします（同じ `query_id` のクエリがすでに実行中の場合、新しいクエリの実行を許可しません）。

`1` – 古いクエリをキャンセルし、新しいクエリの実行を開始します。

セグメンテーション条件のサジェスト機能を実装する場合は、このパラメータを 1 に設定します。次の文字が入力された時点で古いクエリがまだ終了していなければ、そのクエリはキャンセルされます。

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[replace_running_query](#replace_running_query) 設定が有効な場合に、同じ `query_id` を持つ実行中のクエリが終了するまでの待機時間。

設定可能な値:

- 正の整数。
- 0 — サーバーがすでに同じ `query_id` のクエリを実行している場合、新しいクエリの実行を許可しない例外をスローする。

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\}

<SettingsInfoBlock type="Int64" default_value="120" />

非アクティブなレプリカが [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md)、または [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを実行するまで待機する時間（秒）を指定します。

指定可能な値:

- `0` — 待機しない。
- 負の整数 — 無制限に待機する。
- 正の整数 — 待機する秒数。

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

復元時に外部DictionaryソースをNullに置き換えます。テスト用途で便利です。

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

テスト目的で使用します。すべての外部エンジンを Null に置き換え、外部接続を確立しないようにします。

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

テスト目的に使用する設定です。すべての外部テーブル関数を Null に置き換え、外部接続が開始されないようにします。

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting."}]}]}/>

RESTORE の実行時にテーブルエンジンを Replicated*MergeTree から Shared*MergeTree に置き換えます。

## result_overflow_mode \{#result_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Cloud default value: `throw`

結果の量がいずれかの制限を超えた場合にどうするかを設定します。

取りうる値:

* `throw`: 例外をスローします (デフォルト)。
* `break`: クエリの実行を停止して部分的な結果を返します。ソースデータが
  なくなったかのように振る舞います。

&#39;break&#39; を指定することは、LIMIT を使用することに似ています。`break` はブロックレベルでのみ
実行を中断します。これは、返される行数が
[`max_result_rows`](/operations/settings/settings#max_result_rows) より大きく、[`max_block_size`](/operations/settings/settings#max_block_size)
の倍数であり、かつ [`max_threads`](/operations/settings/settings#max_threads) に依存することを意味します。

**例**

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "count_distinct_implementation 設定を使用して countDistinctIf を書き換える設定"}]}]}/>

`countDistcintIf` を [count_distinct_implementation](#count_distinct_implementation) 設定で書き換えられるようにします。

設定可能な値:

- true — 許可する。
- false — 許可しない。

## rewrite_in_to_join \{#rewrite_in_to_join\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

「x IN サブクエリ」のような式を JOIN に書き換えます。これは、JOIN の並べ替えによってクエリ全体を最適化するのに役立つことがあります。

## rows_before_aggregation \{#rows_before_aggregation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "rows_before_aggregation 統計値に対して正確な値を提供します。これは集約前に読み取られた行数を表します"}]}]}/>

有効化すると、ClickHouse は rows_before_aggregation 統計値に対して正確な値を提供し、それは集約前に読み取られた行数を表します

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting."}]}]}/>

S3でマルチパートコピーを許可します。

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

S3 のマルチパートアップロードに複数スレッドを使用します。メモリ使用量がわずかに増加する可能性があります。

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

アップロードされた各オブジェクトに対して S3 へ HEAD リクエストを送信し、アップロードが成功したことを確認します

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "s3 接続タイムアウト用の新しい専用設定を導入"}]}]}/>

S3 ディスクが接続するホストの接続タイムアウトです。

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

S3 エンジンテーブルへの各 INSERT 実行時に、新しいファイルを作成するかどうかを有効／無効にします。有効にした場合、各 INSERT ごとに、次のパターンと同様のキーを持つ新しい S3 オブジェクトが作成されます:

初期状態: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

設定値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが既に存在していて s3_truncate_on_insert が設定されていない場合は失敗します。
- 1 — `INSERT` クエリは、s3_truncate_on_insert が設定されていない場合、各 INSERT ごとに（2 個目以降について）サフィックスを付与して新しいファイルを作成します。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_disable_checksum \{#s3_disable_checksum\}

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルを S3 に送信する際にチェックサムを計算しません。これにより、ファイルに対する不要な複数回の処理を回避することで書き込みが高速になります。MergeTree テーブルのデータはそもそも ClickHouse によってチェックサムで保護されているため、これは概ね安全です。また、S3 に HTTPS でアクセスする場合、TLS レイヤーがネットワーク転送中の完全性をすでに提供しています。一方で、S3 側で追加のチェックサムを有効にしておくことは、多層防御として機能します。

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、S3 table engine で例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際に、ファイルが存在しない場合は、そのファイルがないことをエラーとせずに無視します。

取りうる値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## s3_list_object_keys_size \{#s3_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストの 1 回のバッチで返される可能性のあるファイルの最大数

## s3_max_connections \{#s3_max_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

サーバーごとの最大接続数です。

## s3_max_get_burst \{#s3_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数の制限に達する前に同時に送信できるリクエストの最大数。デフォルト値 (0) の場合は `s3_max_get_rps` と同じになります。

## s3_max_get_rps \{#s3_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが適用される前の、1 秒あたりの S3 GET リクエスト数の上限です。0 の場合は無制限を意味します。

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

マルチパートアップロードリクエストで同時にアップロードされるパーツの最大数。0 は無制限を意味します。

## s3_max_part_number \{#s3_max_part_number\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "S3 アップロード時のパート番号の最大値"}]}]}/>

S3 アップロード時のパート番号の最大値。

## s3_max_put_burst \{#s3_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数の制限に達する前に、同時に発行できる最大リクエスト数。デフォルト値 (0) の場合は `s3_max_put_rps` と同じです。

## s3_max_put_rps \{#s3_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

レート制限（スロットリング）が行われる前の、毎秒あたりの S3 PUT リクエスト数の上限。0 は無制限を意味します。

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "S3 における単一コピー操作の最大サイズ"}]}]}/>

S3 における単一コピー操作の最大サイズです。この設定は、s3_allow_multipart_copy が true の場合にのみ有効です。

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

S3 への singlepart アップロードで送信できるオブジェクトの最大サイズ。

## s3_max_single_read_retries \{#s3_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の S3 読み取り時に行う再試行の最大回数。

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

S3 への書き込み中に予期しないエラーが発生した場合に再試行する最大回数。

## s3_max_upload_part_size \{#s3_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

S3 へのマルチパートアップロードで使用される各パートの最大サイズ。

## s3_min_upload_part_size \{#s3_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

S3 へのマルチパートアップロードでアップロードする各パートの最小サイズ。

## s3_path_filter_limit \{#s3_path_filter_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting"}]}]}/>

クエリフィルターから抽出され、glob リスティングの代わりにファイルの反復処理に使用できる `_path` 値の最大数です。0 の場合は、この機能は無効になります。

## s3_request_timeout_ms \{#s3_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

S3 との間でデータを送受信する際のアイドル状態のタイムアウトです。単一の TCP の読み取りまたは書き込み呼び出しがこの時間だけブロックされた場合、失敗と見なされます。

## s3_skip_empty_files \{#s3_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "We hope it will provide better UX"}]}]}/>

[S3](../../engines/table-engines/integrations/s3.md) エンジンのテーブルで、空のファイルをスキップする機能を有効または無効にします。

取りうる値:

- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドは、
いずれか 1 つの S3 リクエストでソケットタイムアウトなどの再試行可能なネットワークエラーが発生した後に遅延されます。
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフ処理を行います。

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

S3 へのマルチパートアップロード時にアップロードするパーツの正確なサイズを指定します（一部の実装では可変サイズのパーツをサポートしていません）。

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

ListObjects リクエストでどのファイルも一致しなかった場合にエラーをスローします。

## s3_truncate_on_insert \{#s3_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

s3 エンジンテーブルへの挿入前に `TRUNCATE` を実行するかどうかを有効または無効にします。無効になっている場合、S3 オブジェクトがすでに存在しているときに挿入を試みると、例外がスローされます。

設定可能な値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが存在し、かつ s3_create_new_file_on_insert が設定されていない場合は失敗します。
- 1 — `INSERT` クエリはファイルの既存コンテンツを新しいデータで置き換えます。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

単一の書き込み操作から S3 に `s3_multiply_parts_count_threshold` 個のパーツがアップロードされるたびに、`s3_min_upload_part_size` にこの係数を乗じます。

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

この数のパーツが S3 にアップロードされるたびに、s3_min_upload_part_size は s3_upload_part_size_multiply_factor を掛けた値に更新されます。

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定すると、すべての S3 リクエストに対して、最初の 2 回の試行は送信および受信タイムアウトを短くして実行されます。
`false` に設定すると、すべての試行は同一のタイムアウト値で実行されます。

## s3_validate_request_settings \{#s3_validate_request_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "S3 リクエスト設定の検証を無効化できるようにする"}]}]}/>

S3 リクエスト設定の検証を有効にします。
設定値:

- 1 — 設定を検証します。
- 0 — 設定を検証しません。

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue エンジン用のデフォルトの ZooKeeper パスのプレフィックス

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

system.s3queue_log テーブルへの書き込みを有効にします。この値はテーブルごとの設定で上書きできます。

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

S3Queue 用 Keeper のフォールトインジェクション確率。

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

S3Queue テーブルの旧メタデータ構造を新しい構造に移行します

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

`Last-Modified` ヘッダーを持つ URL について、最終更新時刻を検証した上でキャッシュからスキーマを使用します

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\}

<SettingsInfoBlock type="Bool" default_value="1" />

Azure テーブル関数を使用する際、スキーマ推論でキャッシュを利用する

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\}

<SettingsInfoBlock type="Bool" default_value="1" />

file テーブル関数を使用する際のスキーマ推論時にキャッシュを利用します。

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\}

<SettingsInfoBlock type="Bool" default_value="1" />

hdfs テーブル関数を使用する際のスキーマ推論でキャッシュを使用します

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\}

<SettingsInfoBlock type="Bool" default_value="1" />

S3 テーブル関数を使用する際のスキーマ推論でキャッシュを使用します。

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

URL テーブル関数でスキーマ推論を行う際にキャッシュを使用します。

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "データスキッピングインデックスによるフィルタリングの新しいアルゴリズム"}]}]}/>

インデックスに対する一括フィルタリング用アルゴリズムを有効にします。常により良い結果をもたらすことが想定されていますが、後方互換性と制御のためにこの設定が用意されています。

## select_sequential_consistency \{#select_sequential_consistency\}

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
この設定は SharedMergeTree と ReplicatedMergeTree で動作が異なります。SharedMergeTree における `select_sequential_consistency` の動作の詳細は、[SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

`SELECT` クエリに対して逐次一貫性を有効または無効にします。`insert_quorum_parallel` が無効化されていることが必要です（`insert_quorum_parallel` はデフォルトで有効）。

取り得る値:

- 0 — 無効。
- 1 — 有効。

使用方法

逐次一貫性が有効な場合、ClickHouse は、クライアントが `insert_quorum` を指定して実行したすべての以前の `INSERT` クエリのデータを含むレプリカに対してのみ `SELECT` クエリを実行することを許可します。クライアントが一部のデータしか含まないレプリカを参照した場合、ClickHouse は例外をスローします。`SELECT` クエリには、まだクォーラムのレプリカに書き込まれていないデータは含まれません。

`insert_quorum_parallel` が有効（デフォルト）な場合、`select_sequential_consistency` は機能しません。これは、並列な `INSERT` クエリが異なるクォーラムレプリカの集合に書き込まれる可能性があり、単一のレプリカがすべての書き込みを受け取っていることを保証できないためです。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\}

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

指定した最小レベル以上のサーバー側テキストログをクライアントへ送信します。利用可能な値: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp \{#send_logs_source_regexp\}

サーバーのテキストログのうち、指定した正規表現に一致するログソース名を持つものを送信します。空文字列を指定した場合は、すべてのソースが対象です。

## send_profile_events \{#send_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。プロファイルイベントをクライアントに送信するかどうか。"}]}]}/>

クライアントへの [ProfileEvents](/native-protocol/server.md#profile-events) パケット送信を有効または無効にします。

プロファイルイベントを必要としないクライアント向けには、ネットワークトラフィックを削減するために無効化できます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_progress_in_http_headers \{#send_progress_in_http_headers\}

<SettingsInfoBlock type="Bool" default_value="0" />

`clickhouse-server` のレスポンスに含まれる `X-ClickHouse-Progress` HTTP レスポンスヘッダーの有効／無効を切り替えます。

詳細については、[HTTP インターフェイスの説明](/interfaces/http) を参照してください。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## send_timeout \{#send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークへのデータ送信のタイムアウト（秒単位）。クライアントがデータを送信する必要があるにもかかわらず、この間隔内に1バイトも送信できない場合は、例外が送出されます。クライアント側でこの設定を行うと、対応する接続のサーバー側ソケットにも `receive_timeout` が設定されます。

## serialize_query_plan \{#serialize_query_plan\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

分散処理のためにクエリプランをシリアライズする

## serialize_string_in_memory_with_zero_byte \{#serialize_string_in_memory_with_zero_byte\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

集約中の String 値を、末尾にゼロバイトを付けてシリアライズします。互換性のないバージョンが混在するクラスタに対してクエリを実行する際の互換性を維持するために、この設定を有効にします。

## session_timezone \{#session_timezone\}

<BetaBadge />

現在のセッションまたはクエリの暗黙的なタイムゾーンを設定します。
暗黙的なタイムゾーンとは、明示的にタイムゾーンが指定されていない DateTime/DateTime64 型の値に適用されるタイムゾーンです。
この設定は、グローバルに構成された（サーバーレベルの）暗黙的なタイムゾーンよりも優先されます。
値が &#39;&#39;（空文字列）の場合、現在のセッションまたはクエリの暗黙的なタイムゾーンは [サーバーのタイムゾーン](../server-configuration-parameters/settings.md/#timezone) と同じになります。

セッションのタイムゾーンとサーバーのタイムゾーンを取得するには、`timeZone()` および `serverTimeZone()` 関数を使用します。

設定可能な値:

* `system.time_zones` に含まれる任意のタイムゾーン名。例: `Europe/Berlin`、`UTC`、`Zulu`

例:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

タイムゾーンが明示的に指定されていない内部の DateTime に、セッションタイムゾーン &#39;America/Denver&#39; を割り当てます：

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
すべての DateTime/DateTime64 解析関数が `session_timezone` を考慮するわけではありません。これにより、気付きにくい誤りが発生する可能性があります。
次の例と解説を参照してください。
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

これは、パース処理のパイプラインが異なるために発生します。

* 明示的なタイムゾーンを指定しない `toDateTime()` を使用した最初の `SELECT` クエリでは、設定項目 `session_timezone` とグローバルタイムゾーンが参照されます。
* 2つ目のクエリでは、String から DateTime がパースされ、既存のカラム `d` の型とタイムゾーンを継承します。そのため、設定項目 `session_timezone` とグローバルタイムゾーンは参照されません。

**関連項目**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えたときの動作を設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように振る舞いながら部分的な結果を返します。

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "New setting. By default parts are always synchronized"}]}]}/>

SMT テーブルでの MOVE|REPLACE|ATTACH パーティション操作の後に、一連のデータパーツを自動的に同期します。Cloud のみ

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\}

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

[if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and)、および [or](/sql-reference/functions/logical-functions#or) 関数を[ショートサーキット評価](https://en.wikipedia.org/wiki/Short-circuit_evaluation)に従って計算できるようにします。これにより、これらの関数内の複雑な式の実行を最適化し、（意図しないゼロ除算などの）例外発生を防ぐのに役立ちます。

取りうる値:

- `enable` — ショートサーキット評価を、それに適している関数（例外を送出する可能性がある、または計算コストが高い関数）に対して有効にします。
- `force_enable` — すべての関数に対してショートサーキット評価を有効にします。
- `disable` — ショートサーキット評価を無効にします。

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "すべての引数が非 NULL 値である行に対してのみ、Nullable 引数を持つ関数を実行できるようにします"}]}]}/>

いずれかの引数が NULL の場合に NULL を返す関数の評価を最適化します。関数の引数に含まれる NULL 値の比率が short_circuit_function_evaluation_for_nulls_threshold を超えると、システムは行ごとの関数評価をスキップします。その代わりに、すべての行に対して即座に NULL を返し、不要な計算を回避します。

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\}

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Nullable 引数を持つ関数を、すべての引数が非 NULL 値である行に対してのみ実行するかどうかを決定するための、NULL 値の割合のしきい値。この設定は、short_circuit_function_evaluation_for_nulls が有効な場合に適用されます。"}]}]}/>

Nullable 引数を持つ関数を、すべての引数が非 NULL 値である行に対してのみ実行するかどうかを決定するための、NULL 値の割合のしきい値です。この設定は、`short_circuit_function_evaluation_for_nulls` が有効な場合に適用されます。
NULL 値を含む行数の、全行数に対する割合がこのしきい値を超えた場合、これらの NULL 値を含む行は評価されません。

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable catalogs in system tables by default"}]}]}/>

有効にすると、`system` テーブルでデータレイクカタログを表示します。

## show_processlist_include_internal \{#show_processlist_include_internal\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

内部の補助プロセスを `SHOW PROCESSLIST` クエリの出力に表示します。

内部プロセスには、Dictionary の再読み込み、リフレッシャブルmaterialized view の再読み込み、`SHOW ...` クエリ内で実行される補助的な `SELECT`、破損したテーブルを処理するために内部的に実行される補助的な `CREATE DATABASE ...` クエリなどが含まれます。

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Engine=Atomic のテーブルに対する CREATE クエリでテーブル UUID を表示しないように変更"}]}]}/>

`SHOW TABLE` クエリの表示内容を設定します。

設定可能な値:

- 0 — クエリはテーブル UUID なしで表示されます。
- 1 — クエリはテーブル UUID 付きで表示されます。

## single_join_prefer_left_table \{#single_join_prefer_left_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

単一の JOIN で識別子が曖昧な場合、左側のテーブルを優先して解決します

## skip_redundant_aliases_in_udf \{#skip_redundant_aliases_in_udf\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "有効化すると、同じテーブル内の複数のマテリアライズドカラムに対して、同じユーザー定義関数を複数回使用できるようになります。"}]}]} />

冗長な別名は、ユーザー定義関数内では使用（置換）されず、その利用を簡素化します。

指定可能な値:

* 1 — UDF 内で別名がスキップ（置換）されます。
* 0 — UDF 内で別名はスキップ（置換）されません。

**例**

有効な場合と無効な場合の違い:

クエリ:

```sql
SET skip_redundant_aliases_in_udf = 0;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

結果：

```text
SELECT ((4 + 2) + 1 AS y, y + 2)
```

クエリ：

```sql
SET skip_redundant_aliases_in_udf = 1;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

結果：

```text
SELECT ((4 + 2) + 1, ((4 + 2) + 1) + 2)
```


## skip_unavailable_shards \{#skip_unavailable_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

利用できない分片をエラーにせずスキップするかどうかを有効または無効にします。

すべてのレプリカが利用不能な場合、その分片は利用不能と見なされます。レプリカは次の場合に利用不能と見なされます。

- ClickHouse が何らかの理由でレプリカに接続できない場合。

    レプリカへ接続する際、ClickHouse は複数回試行します。これらの試行がすべて失敗した場合、そのレプリカは利用不能と見なされます。

- DNS を介してレプリカの名前解決ができない場合。

    レプリカのホスト名が DNS を通じて名前解決できない場合、次のような状況を示している可能性があります。

    - レプリカのホストに DNS レコードが存在しない。この状況は、動的 DNS を利用するシステム、例えば [Kubernetes](https://kubernetes.io) などで発生し得るもので、その場合ノードはダウンタイム中に名前解決できないことがあり、これはエラーとは限りません。

    - 設定エラー。ClickHouse の設定ファイルに誤ったホスト名が含まれている。

取りうる値:

- 1 — スキップを有効。

    分片が利用不能な場合、ClickHouse は部分的なデータに基づく結果を返し、ノードの可用性に関する問題を報告しません。

- 0 — スキップを無効。

    分片が利用不能な場合、ClickHouse は例外をスローします。

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

クエリを受信した後に TCPHandler がスリープする時間

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler においてデータ送信時にスリープする時間

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler においてテーブルステータス応答を送信する際にスリープする時間

## sort_overflow_mode \{#sort_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

ソート前に受信した行数がいずれかの制限を超えた場合にどのように動作するかを設定します。

指定可能な値:

- `throw`: 例外をスローします。
- `break`: クエリの実行を停止し、部分的な結果を返します。

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化中に互いに交差するパーツ範囲をレイヤーに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化中に互いに交差するパーツ範囲をレイヤーに分割できるようにする"}]}]}/>

FINAL 最適化中に互いに交差するパーツ範囲をレイヤーに分割します

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を重複するものと重複しないものに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を重複するものと重複しないものに分割できるようにする"}]}]}/>

FINAL 最適化中にパーツ範囲を重複するものと重複しないものに分割します

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

引数 `max_substrings` > 0 を指定した関数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) が、結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。

設定可能な値:

- `0` - 残りの文字列は結果配列の最後の要素に含まれません。
- `1` - 残りの文字列は結果配列の最後の要素に含まれます。これは Spark の [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 関数および Python の ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) メソッドの挙動と同じです。

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー起動時に、`SYSTEM STOP VIEWS` を実行した場合と同様に、リフレッシャブルmaterialized view のスケジューリングを行わないようにします。後から `SYSTEM START VIEWS` または `SYSTEM START VIEW <name>` を使って手動で開始できます。新しく作成されたリフレッシャブルmaterialized view にも適用されます。リフレッシャブルではない materialized view には影響しません。

## storage_file_read_method \{#storage_file_read_method\}

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

ストレージファイルからデータを読み出す方法を指定します。`read`、`pread`、`mmap` のいずれかを選択できます。`mmap` メソッドは clickhouse-server では使用されず、clickhouse-local を対象としています。

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

`system.stack_trace` テーブルをクエリする際に、スレッドからの情報を受信するためにパイプから読み取る処理に許容される最大時間。  
この設定はテスト目的でのみ使用されるものであり、ユーザーによる変更は想定されていません。

## stream_flush_interval_ms \{#stream_flush_interval_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

タイムアウト発生時、またはスレッドが [max_insert_block_size](#max_insert_block_size) 行を生成した場合に、ストリーミングを使用するテーブルで有効になります。

デフォルト値は 7500 です。

値が小さいほど、より頻繁にデータがテーブルへフラッシュされます。値を小さくしすぎるとパフォーマンスの低下を招きます。

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "デフォルトでは Kafka/RabbitMQ/FileLog に対する direct select を許可しない"}]}]}/>

Kafka、RabbitMQ、FileLog、Redis Streams、S3Queue、AzureQueue、および NATS エンジンに対して、直接 SELECT クエリを実行することを許可します。関連する materialized view がアタッチされている場合は、この設定が有効であっても SELECT クエリは許可されません。
関連する materialized view がアタッチされていない場合、この設定を有効にするとデータを読み取ることができます。通常、読み取られたデータはキューから削除されるため注意してください。読み取ったデータが削除されるのを避けるには、関連するエンジンの設定を適切に構成する必要があります。

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\}

stream-like エンジンが複数のキューから読み取る場合、書き込み時にどのキューへ挿入するかをユーザーが 1 つ選択する必要があります。Redis Streams と NATS で使用されます。

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="500" />

ストリーミングストレージとの間でデータをポーリングする際のタイムアウト時間です。

## system_events_show_zero_values \{#system_events_show_zero_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

ゼロ値のイベントを [`system.events`](../../operations/system-tables/events.md) から選択できるようにします。

一部の監視システムでは、たとえメトリクス値がゼロであっても、各チェックポイントごとにすべてのメトリクス値を送信する必要があります。

可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

クエリ

```sql
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

結果

```text
Ok.
```

クエリ

```sql
SET system_events_show_zero_values = 1;
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

結果

```text
┌─event────────────────────┬─value─┬─description───────────────────────────────────────────┐
│ QueryMemoryLimitExceeded │     0 │ Number of times when memory limit exceeded for query. │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ効果があります。テーブルエンジンおよびテーブル関数（S3、Azure など）を通じて分散キャッシュからの読み取りを許可します。

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

[remote](../../sql-reference/table-functions/remote.md) 関数に対して、パターンから生成されるアドレスの最大数を設定します。

設定可能な値:

- 正の整数。

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="290" />

TCP が keepalive プローブの送信を開始するまで、その接続がアイドル状態のまま維持される必要がある時間（秒）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "ファイルシステムキャッシュ内の一時データ用に領域を予約するため、キャッシュのロックを取得するまでの待機時間"}]}]}/>

ファイルシステムキャッシュ内の一時データ用に領域を予約するため、キャッシュのロックを取得するまでの待機時間

## temporary_files_buffer_size \{#temporary_files_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

一時ファイルへの書き込みに使用されるバッファのサイズです。バッファサイズを大きくするとシステムコールの回数が減りますが、メモリ使用量は増加します。

## temporary_files_codec \{#temporary_files_codec\}

<SettingsInfoBlock type="String" default_value="LZ4" />

ディスク上でのソートおよび結合処理に使用される一時ファイルの圧縮コーデックを設定します。

指定可能な値:

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 圧縮が適用されます。
- NONE — 圧縮は適用されません。

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\}

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "New setting"}]}]}/>

反転テキスト索引から構築されたヒントを使用する際のフィルタ選択度の上限値。

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

テスト目的で、テキスト索引における Bloom フィルターの使用を有効または無効にします。

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

空の INSERT を許可するか禁止するかを制御します。デフォルトで有効であり、空の INSERT 実行時にはエラーをスローします。[`clickhouse-client`](/interfaces/cli) を使用した INSERT、または [gRPC インターフェイス](/interfaces/grpc) を使用した INSERT にのみ適用されます。

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

書き込み操作（INSERT、マージ）のキャッシュ利用時に、キャッシュからのエラーを無視します

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\}

<SettingsInfoBlock type="Bool" default_value="1" />

`max_partitions_per_insert_block` に到達したときの動作を制御できます。

設定可能な値:

- `true`  - INSERT ブロックが `max_partitions_per_insert_block` に到達したとき、例外がスローされます。
- `false` - `max_partitions_per_insert_block` に到達したときに警告をログに記録します。

:::tip
[`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) を変更したときのユーザーへの影響を把握するのに役立ちます。
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

サポートされていないクエリがトランザクション内で使用された場合に、例外をスローします。

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\}

<SettingsInfoBlock type="Seconds" default_value="10" />

指定された秒数が経過した後に、実行速度が遅すぎない（`min_execution_speed` を下回っていない）ことを確認します。

## timeout_overflow_mode \{#timeout_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

クエリの実行時間が `max_execution_time` を超えた場合、または推定実行時間が `max_estimated_execution_time` を超えると見積もられた場合にどのように動作するかを設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

leaf ノードでのクエリ実行時間が `max_execution_time_leaf` を超えた場合の動作を設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止して部分的な結果を返します。ソースデータが尽きた場合と同様の挙動になります。

## totals_auto_threshold \{#totals_auto_threshold\}

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'` のしきい値です。
「WITH TOTALS 修飾子」のセクションを参照してください。

## totals_mode \{#totals_mode\}

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

HAVING が指定されている場合や、max_rows_to_group_by および group_by_overflow_mode = 'any' が設定されている場合に、TOTALS をどのように計算するかを指定します。
「WITH TOTALS 修飾子」のセクションを参照してください。

## trace_profile_events \{#trace_profile_events\}

<SettingsInfoBlock type="Bool" default_value="0" />

各プロファイルイベントの更新ごとに、スタックトレースをプロファイルイベント名および増分値とともに収集し、それらを [trace_log](/operations/system-tables/trace_log) に送信するかどうかを制御します。

設定可能な値:

- 1 — プロファイルイベントのトレースを有効にする。
- 0 — プロファイルイベントのトレースを無効にする。

## trace_profile_events_list \{#trace_profile_events_list\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting"}]}]}/>

`trace_profile_events` 設定が有効な場合、追跡対象のイベントを、指定したカンマ区切りの名前リストに制限します。
`trace_profile_events_list` が空文字列（デフォルト値）の場合は、すべてのプロファイルイベントを追跡します。

例: 'DiskS3ReadMicroseconds,DiskS3ReadRequestsCount,SelectQueryTimeMicroseconds,ReadBufferFromS3Bytes'

この設定を使用することで、大量のクエリに対してより精密なデータ収集が可能になります。これは、この設定を使用しない場合、大量のイベントによって内部の system log のキューがオーバーフローし、一部のイベントが破棄されてしまう可能性があるためです。

## transfer_overflow_mode \{#transfer_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えたときの動作を設定します。

設定可能な値:

- `throw`: 例外をスローします (デフォルト)。
- `break`: クエリの実行を停止し、ソースデータが尽きた場合と同様に、一部の結果のみを返します。

## transform_null_in \{#transform_null_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

[IN](../../sql-reference/operators/in.md) 演算子において、[NULL](/sql-reference/syntax#null) 値同士を等しいものとして扱うことを有効にします。

デフォルトでは、`NULL` は未定義値を意味するため、`NULL` 値同士は比較できません。そのため、`expr = NULL` という比較は常に `false` を返さなければなりません。この設定を有効にすると、`IN` 演算子では `NULL = NULL` が `true` を返します。

設定可能な値:

* 0 — `IN` 演算子における `NULL` 値の比較は `false` を返します。
* 1 — `IN` 演算子における `NULL` 値の比較は `true` を返します。

**例**

次の `null_in` テーブルを考えます:

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

クエリ:

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

結果：

```text
┌──idx─┬────i─┐
│    1 │    1 │
└──────┴──────┘
```

クエリ：

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 1;
```

結果：

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
└──────┴───────┘
```

**関連項目**

* [IN 演算子における NULL の処理](/sql-reference/operators/in#null-processing)


## traverse_shadow_remote_data_paths \{#traverse_shadow_remote_data_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "system.remote_data_paths をクエリする際に、シャドウディレクトリも走査します。"}]}]}/>

system.remote_data_paths をクエリする際、実際のテーブルデータに加えて凍結データ（シャドウディレクトリ）も走査します。

## union_default_mode \{#union_default_mode\}

`SELECT` クエリ結果を結合する際のモードを設定します。これは、`UNION ALL` または `UNION DISTINCT` を明示的に指定せずに [UNION](../../sql-reference/statements/select/union.md) と一緒に使用された場合にのみ有効になる設定です。

指定可能な値:

- `'DISTINCT'` — ClickHouse はクエリの結合結果として、重複する行を除去して行を出力します。
- `'ALL'` — ClickHouse はクエリの結合結果として、重複する行も含めてすべての行を出力します。
- `''` — `UNION` と一緒に使用された場合、ClickHouse は例外を発生させます。

[UNION](../../sql-reference/statements/select/union.md) の例を参照してください。

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

N 番目のデータパケットの代わりに未知のパケットを送信する

## update_parallel_mode \{#update_parallel_mode\}

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

同時に実行される更新クエリの挙動を決定します。

設定可能な値:

- `sync` - すべての `UPDATE` クエリを順次実行します。
- `auto` - 1 つのクエリ内で更新されるカラムと、別のクエリの式で使用されるカラムとの間に依存関係がある `UPDATE` クエリのみを順次実行します。
- `async` - 更新クエリ同士を同期しません。

## update_sequential_consistency \{#update_sequential_consistency\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

true の場合、更新を実行する前に、パーツの Set が最新バージョンに更新されます。

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

materialized view のクエリを非同期で（必要に応じてマルチスレッドで）実行します。INSERT 時の materialized view の処理を高速化できますが、より多くのメモリを消費します。

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル関数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` でファイルから `count` を実行する際に、行数のキャッシュを有効にします。

デフォルトで有効です。

## use_client_time_zone \{#use_client_time_zone\}

<SettingsInfoBlock type="Bool" default_value="0" />

`DateTime` 文字列値を解釈する際に、サーバー側のタイムゾーンではなくクライアント側のタイムゾーンを使用します。

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Use compact format for async INSERT into Distributed tables by default"}]}]}/>

`Distributed` エンジンを持つテーブルへのバックグラウンド（`distributed_foreground_insert`）での INSERT において、ブロックを保存する際にコンパクトな形式を使用します。

設定可能な値:

- 0 — `user[:password]@host:port#default_database` というディレクトリ形式を使用します。
- 1 — `[shard{shard_index}[_replica{replica_index}]]` というディレクトリ形式を使用します。

:::note

- `use_compact_format_in_distributed_parts_names=0` の場合、クラスタ定義の変更はバックグラウンド INSERT には適用されません。
- `use_compact_format_in_distributed_parts_names=1` の場合、クラスタ定義内のノードの順序を変更すると、`shard_index` / `replica_index` が変更されるため注意が必要です。
:::

## use_concurrency_control \{#use_concurrency_control\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Enable concurrency control by default"}]}]}/>

サーバーの同時実行制御（`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` のグローバルサーバー設定を参照）に従います。無効にした場合、サーバーが過負荷状態であっても、より多くのスレッド数を使用できるようになります（通常の利用には推奨されず、主にテスト用途で必要となります）。

## use_hash_table_stats_for_join_reordering \{#use_hash_table_stats_for_join_reordering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "新しい設定。以前は 'collect_hash_table_stats_during_joins' 設定と同じ動作でした。"}]}]}/>

結合の再順序付け時の基数推定に収集済みのハッシュテーブル統計情報を使用することを有効にします

## use_hedged_requests \{#use_hedged_requests\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Enable Hedged Requests feature by default"}]}]}/>

リモートクエリ向けの hedged requests ロジックを有効にします。これにより、クエリに対して複数のレプリカとの複数接続を確立できるようになります。
レプリカとの既存の接続が `hedged_connection_timeout` 以内に確立されなかった場合、または `receive_data_timeout` 以内にデータが受信されなかった場合に、新しい接続が開始されます。クエリは、空でない progress パケット（あるいは `allow_changing_replica_until_first_data_packet` が有効な場合はデータパケット）を最初に送信した接続を使用し、
他の接続はキャンセルされます。`max_parallel_replicas > 1` のクエリもサポートされます。

デフォルトで有効です。

Cloud におけるデフォルト値: `1`

## use_hive_partitioning \{#use_hive_partitioning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "この設定をデフォルトで有効にしました。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "File、URL、S3、AzureBlobStorage、HDFS エンジンで Hive パーティショニングを使用できるようにします。"}]}]}/>

有効な場合、ClickHouse はファイル系テーブルエンジンである [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) において、パス (`/name=value/`) 内の Hive 形式のパーティショニングを検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションパス内の名前と同じ名前を持ちますが、先頭に `_` が付きます。

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、iceberg テーブル関数および iceberg ストレージで iceberg メタデータファイルキャッシュを利用できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Iceberg パーティションプルーニングをデフォルトで有効にします。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Iceberg パーティションプルーニング用の新しい設定です。"}]}]}/>

Iceberg テーブルで Iceberg パーティションプルーニングを使用します

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

IN 演算子の右辺にサブクエリまたはテーブル式がある場合に索引の使用を試みます。

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\}

<SettingsInfoBlock type="UInt64" default_value="0" />

IN 演算子の右辺にある Set の最大サイズ。この制限以内であれば、フィルタリングにテーブル索引を使用します。これにより、大規模なクエリに対して追加のデータ構造を準備することによるパフォーマンス低下とメモリ使用量の増加を回避できます。0 は無制限を意味します。

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "この最適化を有効化。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`JOIN` 条件の OR で接続されたパーツを、対応する入力側へプッシュダウンする（「部分的プッシュダウン」）ことを有効にします。
これによりストレージエンジンがより早い段階でフィルタを行えるようになり、読み取るデータ量を削減できる可能性があります。
この最適化はクエリの意味を変えず、各トップレベルの OR ブランチが対象側に対して少なくとも 1 つの決定論的な述語を含む場合にのみ適用されます。

## use_legacy_to_time \{#use_legacy_to_time\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新しい設定。ユーザーが `toTimeWithFixedDate` として動作する旧来の `toTime` 関数ロジックを使用できるようにします。"}]}]}/>

有効化すると、旧来の `toTime` 関数を使用できるようになり、日付と時刻を含む値を変換する際に、時刻情報を保持したまま日付部分のみを特定の固定日付に変換します。
無効の場合は、新しい `toTime` 関数が使用され、さまざまな型のデータを `Time` 型に変換します。
旧来の関数も、`toTimeWithFixedDate` として常に無条件に利用可能です。

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間ページキャッシュを追加"}]}]}/>

ファイルシステムキャッシュが有効化されていないリモートディスクに対して、ユーザー空間ページキャッシュを使用します。

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

分散キャッシュ使用時にユーザー空間ページキャッシュを使用します。

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Paimon テーブル関数で Paimon のパーティションプルーニングを使用します

## use_primary_key \{#use_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "MergeTree がクエリ実行時に granule 単位のプルーニングにプライマリキーを使用するかどうかを制御する新しい設定です。"}]}]}/>

MergeTree テーブルのクエリ実行時に、granule 単位のプルーニングにプライマリキーを使用します。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## use_query_cache \{#use_query_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、`SELECT` クエリが [クエリキャッシュ](../query-cache.md) を利用できるようになります。[enable_reads_from_query_cache](#enable_reads_from_query_cache) と [enable_writes_to_query_cache](#enable_writes_to_query_cache) の各パラメータで、キャッシュの使用方法をより詳細に制御できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_query_condition_cache \{#use_query_condition_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新しい最適化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

[query condition cache](/operations/query-condition-cache) を有効にします。キャッシュは、`WHERE` 句の条件を満たさないデータパーツ内の granule の範囲を保存し、後続のクエリでは、この情報を一時的な索引として再利用します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Iceberg の positional delete に Roaring Bitmap を使用します。

## use_skip_indexes \{#use_skip_indexes\}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行時にデータスキッピングインデックスを使用します。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_for_disjunctions \{#use_skip_indexes_for_disjunctions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

AND と OR が混在する WHERE 句を skip 索引を使って評価します。例: WHERE A = 5 AND (B = 5 OR C = 5)。
無効化していても、skip 索引は WHERE 条件の評価に使用されますが、その場合は AND で連結された句のみを含む必要があります。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_for_top_k \{#use_skip_indexes_for_top_k\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

TopK フィルタリングにデータスキッピングインデックスを使用できるようにします。

有効にすると、`ORDER BY <column> LIMIT n` クエリ内のカラムに minmax スキップインデックスが存在する場合、オプティマイザは最終結果に関係しないグラニュールをスキップするために minmax インデックスを使用しようとします。これにより、クエリレイテンシを削減できる場合があります。

取り得る値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

`FINAL` 修飾子付きでクエリを実行する際に、スキップ索引を使用するかどうかを制御します。

スキップ索引によって、最新データを含む行（granule）が除外される可能性があり、その結果、`FINAL` 修飾子付きクエリの結果が不正確になる場合があります。この設定を有効にすると、`FINAL` 修飾子が付いていてもスキップ索引が適用され、直近の更新を取りこぼすリスクはありますが、パフォーマンスが向上する可能性があります。この設定は、use_skip_indexes_if_final_exact_mode 設定（デフォルトは有効）とあわせて有効化する必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "設定のデフォルト値の変更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "FINAL クエリがスキップ索引と併用された場合に正しい結果を返せるよう、この設定が導入されました"}]}]}/>

スキップ索引によって返されたグラニュールを、より新しいパーツ内で展開するかどうかを制御し、FINAL 修飾子付きクエリの実行時に正しい結果を返せるようにします。

スキップ索引を使用すると、最新データを含む行（グラニュール）が除外され、結果が不正確になる可能性があります。この設定を有効にすると、スキップ索引によって返された範囲と重なりのある、より新しいパーツをスキャンすることで、正しい結果が返されるようにできます。スキップ索引を参照して得られる近似的な結果で問題ないアプリケーションの場合にのみ、この設定を無効にしてください。

取り得る値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Default enable"}]}, {"id": "row-2","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

データ読み取り時にデータスキッピングインデックスの使用を有効にします。

有効にすると、データスキッピングインデックスはクエリ実行開始前に事前解析されるのではなく、各データグラニュールが読み取られるタイミングで動的に評価されます。これにより、クエリの開始レイテンシを低減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_statistics \{#use_statistics\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "この最適化をデフォルトで有効にします。"}]}]}/>

/// 'use_primary_key' および 'use_skip_indexes' と一貫性を保つため、'allow_statistics_optimize' より推奨
統計を用いてクエリを最適化できるようにします

## use_statistics_cache \{#use_statistics_cache\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "新しい設定"}]}]}/>

すべてのパーツの統計情報を読み込むオーバーヘッドを回避するために、クエリで statistics キャッシュを使用します

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Improve using structure from insertion table in table functions"}]}]}/>

データからスキーマを推論するのではなく、挿入元テーブルの構造を使用します。指定可能な値: 0 - 無効、1 - 有効、2 - 自動

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックスDictionaryブロックのキャッシュを使用するかどうかを制御します。
テキストインデックスDictionaryブロックキャッシュを使用すると、大量のテキストインデックスクエリを扱う場合のレイテンシを大幅に削減し、スループットを向上できます。

## use_text_index_header_cache \{#use_text_index_header_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックスヘッダーのキャッシュを使用するかどうか。
テキストインデックスヘッダーキャッシュを使用すると、多数のテキストインデックスクエリを処理する際のレイテンシーを大幅に低減し、スループットを向上させることができます。

## use_text_index_postings_cache \{#use_text_index_postings_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

テキストインデックスのポスティングリストをデシリアライズした結果をキャッシュとして利用するかどうかを制御します。
テキストインデックスに対するクエリ数が多い場合、このキャッシュを使用することでレイテンシを大幅に削減し、スループットを向上させることができます。

## use_top_k_dynamic_filtering \{#use_top_k_dynamic_filtering\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

`ORDER BY <column> LIMIT n` クエリ実行時に、動的フィルタリングによる最適化を有効にします。

有効にすると、クエリエグゼキュータは、最終的な結果セットの `top N` 行に含まれないグラニュールおよび行をスキップしようとします。この最適化は動的に行われるものであり、レイテンシ改善の度合いはデータ分布やクエリ内の他の述語の有無に依存します。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## use_uncompressed_cache \{#use_uncompressed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

非圧縮ブロックのキャッシュを使用するかどうかを指定します。0 または 1 を指定できます。デフォルトは 0（無効）です。
非圧縮キャッシュ（MergeTree ファミリーのテーブルのみ）を使用すると、多数の短いクエリを処理する際のレイテンシを大幅に削減し、スループットを向上できます。頻繁に短いリクエストを送信するユーザーには、この設定を有効にしてください。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 設定パラメータ（config ファイルでのみ設定可能）— 非圧縮キャッシュブロックのサイズ — にも注意してください。デフォルトは 8 GiB です。非圧縮キャッシュは必要に応じて蓄積され、使用頻度の低いデータから自動的に破棄されます。

ある程度以上のデータ量（100 万行以上）を読み取るクエリの場合、小さいクエリのための領域を確保する目的で非圧縮キャッシュは自動的に無効化されます。したがって、`use_uncompressed_cache` 設定は常に 1 に設定しておくことができます。

## use_variant_as_common_type \{#use_variant_as_common_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "共通の型がない場合に if/multiIf で Variant を使用できるようにする"}]}]} />

引数の型に共通の型が存在しない場合に、[if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 関数の結果型として `Variant` 型を使用できるようにします。

例:

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "比較関数における Variant 型のデフォルト実装を有効化"}]}]}/>

比較関数における Variant 型のデフォルト実装を有効または無効にします。

## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 句で WITH FILL の前にあるカラムはソートプレフィックスを形成します。ソートプレフィックスの値が異なる行は、それぞれ独立して補完されます"}]}]}/>

ORDER BY 句で WITH FILL の前にあるカラムはソートプレフィックスを形成します。ソートプレフィックスの値が異なる行は、それぞれ独立して補完されます

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

有効にすると、`IN`、`NOT IN`、`==`、`!=` といった演算子で使用される enum リテラルが enum 型に対して妥当かどうかを検証し、そのリテラルが有効な enum 値でない場合は例外をスローします。

## validate_mutation_query \{#validate_mutation_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "デフォルトでミューテーションクエリを検証する新しい設定。"}]}]}/>

ミューテーションクエリは受け付ける前に検証されます。ミューテーションはバックグラウンドで実行されるため、無効なクエリを実行するとミューテーションが行き詰まり、手動での対応が必要になります。

後方互換性のないバグに遭遇した場合にのみ、この設定を変更してください。

## validate_polygons \{#validate_polygons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "デフォルトで、誤った結果を返す可能性のある動作ではなく、関数 pointInPolygon でポリゴンが不正な場合に例外をスローするように変更"}]}]}/>

ポリゴンが自己交差または自己接線となっている場合に、[pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 関数で例外をスローするかどうかを有効または無効にします。

取り得る値:

- 0 — 例外スローを無効にします。`pointInPolygon` は不正なポリゴンも受け付け、それらに対して誤った結果を返す可能性があります。
- 1 — 例外スローを有効にします。

## vector_search_filter_strategy \{#vector_search_filter_strategy\}

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

ベクトル検索クエリに WHERE 句が含まれている場合、この SETTING は、先に評価されるのが WHERE 句か（プリフィルタリング）、あるいは先にベクトル類似度インデックスがチェックされるか（ポストフィルタリング）を決定します。取りうる値は次のとおりです。

- 'auto' - ポストフィルタリング（正確なセマンティクスは将来変更される可能性があります）。
- 'postfilter' - まずベクトル類似度インデックスを使用して最近傍を特定し、その後に他のフィルターを適用します。
- 'prefilter' - まず他のフィルターを評価し、その後に総当たり検索を行って近傍を特定します。

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\}

**別名**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "SETTING 'vector_search_postfilter_multiplier' の別名"}]}]}/>

ベクトル類似性索引から取得する最近傍の数に、この値を掛けます。他の述語との組み合わせによるポストフィルタリングを行う場合、または SETTING 'vector_search_with_rescoring = 1' に設定されている場合にのみ適用されます。

## vector_search_with_rescoring \{#vector_search_with_rescoring\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse がベクトル類似性インデックスを使用するクエリに対してリスコアリングを実行するかどうかを制御します。
リスコアリングを行わない場合、ベクトル類似性インデックスは、最も類似度の高い一致を含む行を直接返します。
リスコアリングを行う場合、行は granule レベルまで展開され、その granule 内のすべての行が再度チェックされます。
多くの状況では、リスコアリングは精度の向上にはわずかしか寄与せず、ベクトル検索クエリのパフォーマンスを大きく低下させます。
注意: リスコアリングなしで実行され、かつ parallel replicas が有効なクエリは、リスコアリングにフォールバックする場合があります。

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

コミットされた変更が最新のスナップショットに実際に反映されるまで待機します

## wait_for_async_insert \{#wait_for_async_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期挿入の処理が完了するまで待機します。

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

非同期挿入の処理完了を待機するタイムアウト

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

イベント時刻処理で window view の fire signal を待機する際のタイムアウト値

## window_view_clean_interval \{#window_view_clean_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

window view で古いデータを解放するためのクリーン処理を実行する間隔（秒）。

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

watch クエリが稼働していることを示すためのハートビート間隔（秒単位）。

## workload \{#workload\}

<SettingsInfoBlock type="String" default_value="default" />

リソースにアクセスするために使用する workload の名前

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

フルパス（`s3://` を含む）を Iceberg のメタデータファイルに書き込みます。

## write_through_distributed_cache \{#write_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへの書き込みを有効にします（S3 への書き込みも分散キャッシュ経由で行われます）。

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New cloud setting"}]}]}/>

ClickHouse Cloud でのみ有効です。write-through distributed cache 用のバッファサイズを設定します。0 の場合は、distributed cache を使用しない場合に用いられるバッファサイズが使用されます。

## zstd_window_log_max \{#zstd_window_log_max\}

<SettingsInfoBlock type="Int64" default_value="0" />

ZSTD の最大ウィンドウログを選択するための設定です（MergeTree ファミリーでは使用されません）。