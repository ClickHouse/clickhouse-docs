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


## add_http_cors_header {#add_http_cors_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP CORS ヘッダーを追加します。

## additional&#95;result&#95;filter {#additional_result_filter}

`SELECT` クエリの結果に適用する追加のフィルタ式を指定します。
この設定は、どのサブクエリにも適用されません。

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


## additional&#95;table&#95;filters {#additional_table_filters}

<SettingsInfoBlock type="Map" default_value="{}" />

指定したテーブルからデータを読み込んだ後に適用される追加のフィルター式です。

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


## aggregate&#95;function&#95;input&#95;format {#aggregate_function_input_format}

<SettingsInfoBlock type="AggregateFunctionInputFormat" default_value="state" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "INSERT 操作時の AggregateFunction 入力フォーマットを制御するための新しい設定。デフォルトでは値は state に設定されています"}]}]} />

INSERT 操作時の AggregateFunction の入力フォーマット。

使用可能な値:

* `state` — シリアライズされた状態を表すバイナリ文字列 (デフォルト)。これは AggregateFunction の値がバイナリデータとして渡されることを前提としたデフォルトの動作です。
* `value` — フォーマットは集約関数の引数 1 つの値、または複数引数の場合はそれらの 1 つのタプルを受け取ります。これらは対応する `IDataType` または `DataTypeTuple` を使ってデシリアライズされ、その後集約されて状態が構成されます。
* `array` — フォーマットは上記の `value` オプションで説明した値の `Array` を受け取ります。配列内のすべての要素が集約されて状態が構成されます。

**Examples**

次の構造を持つテーブルの場合:

```sql
CREATE TABLE example (
    user_id UInt64,
    avg_session_length AggregateFunction(avg, UInt32)
);
```

`aggregate_function_input_format = 'value'` を設定している場合:

```sql
INSERT INTO example FORMAT CSV
123,456
```

`aggregate_function_input_format = 'array'` の場合:

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

注記: `value` と `array` のフォーマットは、挿入時に値の作成と集約を行う必要があるため、デフォルトの `state` フォーマットよりも遅くなります。


## aggregate&#95;functions&#95;null&#95;for&#95;empty {#aggregate_functions_null_for_empty}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のすべての集約関数を書き換え、その末尾に [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) 接尾辞を付与するかどうかを有効または無効にします。SQL標準との互換性を保つために有効にします。
分散クエリで一貫した結果を得るために、[count&#95;distinct&#95;implementation](#count_distinct_implementation) 設定と同様にクエリの書き換えによって実装されています。

取り得る値:

* 0 — 無効。
* 1 — 有効。

**例**

集約関数を含む次のクエリを考えます:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0` が設定されている場合、次のような結果になります：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1` の場合、結果は以下のとおりです：

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes {#aggregation_in_order_max_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

主キー順序での集約時に蓄積されるデータブロックの最大サイズ（バイト単位）。ブロックサイズを小さくすると、集約の最終マージ段階をより高い並列度で実行できます。

## aggregation_memory_efficient_merge_threads {#aggregation_memory_efficient_merge_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリ効率モードで中間集約結果をマージするために使用するスレッド数。値を大きくするほど、より多くのメモリを消費します。0 の場合は、`max_threads` と同じ値になります。

## allow_aggregate_partitions_independently {#allow_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーが `GROUP BY` キーと一致している場合に、パーティションごとに独立したスレッドで集計を行えるようにします。パーティション数がコア数に近く、かつ各パーティションのサイズが概ね同程度である場合に有効です。

## allow_archive_path_syntax {#allow_archive_path_syntax} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加。"}]}]}/>

File/S3 エンジンおよびテーブル関数は、アーカイブが正しい拡張子を持つ場合、'::' を含むパスを `<archive>::<file>` として解釈します。

## allow_asynchronous_read_from_io_pool_for_merge_tree {#allow_asynchronous_read_from_io_pool_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンドの I/O プールを使用して MergeTree テーブルを読み込みます。この設定により、I/O に制約されているクエリのパフォーマンスが向上する可能性があります。

## allow_changing_replica_until_first_data_packet {#allow_changing_replica_until_first_data_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ヘッジ付きリクエストにおいて、最初のデータパケットを受信するまでは、すでにある程度進捗があっても（その進捗が `receive_data_timeout` の間更新されていない場合）、新しい接続を開始できます。無効の場合は、最初に進捗があった時点以降はレプリカの変更を行いません。

## allow_create_index_without_type {#allow_create_index_without_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

TYPE を指定しない CREATE INDEX クエリを許可しますが、そのクエリは無視されます。SQL の互換性テスト用です。

## allow_custom_error_code_in_throwif {#allow_custom_error_code_in_throwif} 

<SettingsInfoBlock type="Bool" default_value="0" />

throwIf() 関数でカスタムエラーコードを有効にします。true の場合、スローされる例外に想定外のエラーコードが設定される可能性があります。

## allow_ddl {#allow_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定されている場合、ユーザーは DDL クエリを実行できます。

## allow_deprecated_database_ordinary {#allow_deprecated_database_ordinary} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨の Ordinary エンジンを使用したデータベースの作成を許可します。

## allow_deprecated_error_prone_window_functions {#allow_deprecated_error_prone_window_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "非推奨でエラーを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可する"}]}]}/>

非推奨でエラーを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可する

## allow_deprecated_snowflake_conversion_functions {#allow_deprecated_snowflake_conversion_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "非推奨の関数 snowflakeToDateTime[64] と dateTime[64]ToSnowflake を無効化。"}]}]}/>

関数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake`、`dateTime64ToSnowflake` は非推奨であり、デフォルトでは無効になっています。
代わりに、関数 `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID`、`dateTime64ToSnowflakeID` を使用してください。

移行期間などで非推奨の関数を再度有効化する場合は、この SETTING を `true` に設定してください。

## allow_deprecated_syntax_for_merge_tree {#allow_deprecated_syntax_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨のエンジン定義構文を使用した *MergeTree テーブルの作成を許可します。

## allow_distributed_ddl {#allow_distributed_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、ユーザーは分散 DDL クエリを実行できます。

## allow_drop_detached {#allow_drop_detached} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE ... DROP DETACHED PART[ITION] ... クエリを許可します

## allow_dynamic_type_in_join_keys {#allow_dynamic_type_in_join_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトでは JOIN キーで Dynamic 型を使用できないようにする"}]}]}/>

JOIN キーで Dynamic 型の使用を許可します。互換性維持のために追加されました。Dynamic 型を JOIN キーで使用することは推奨されません。その他の型との比較により予期しない結果を招く可能性があるためです。

## allow_execute_multiif_columnar {#allow_execute_multiif_columnar} 

<SettingsInfoBlock type="Bool" default_value="1" />

multiIf 関数の列指向実行を許可します

## allow_experimental_alias_table_engine {#allow_experimental_alias_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Alias エンジンを使用したテーブルの作成を許可します。

## allow_experimental_analyzer {#allow_experimental_analyzer} 

**エイリアス**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトで analyzer と planner を有効にします。"}]}]}/>

新しいクエリアナライザーを有効にします。

## allow_experimental_codecs {#allow_experimental_codecs} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、実験的な圧縮コーデックを指定できるようになります（ただし、現時点ではそのようなコーデックは存在しないため、このオプションには何の効果もありません）。

## allow_experimental_correlated_subqueries {#allow_experimental_correlated_subqueries} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "相関サブクエリのサポートを Beta としてマークしました。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "相関サブクエリの実行を許可する新しい設定を追加しました。"}]}]}/>

相関サブクエリの実行を許可します。

## allow_experimental_database_glue_catalog {#allow_experimental_database_glue_catalog} 

<BetaBadge/>

**別名**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'glue' の実験的なデータベースエンジン DataLakeCatalog を許可"}]}]}/>

catalog_type = 'glue' の実験的なデータベースエンジン DataLakeCatalog を許可

## allow_experimental_database_hms_catalog {#allow_experimental_database_hms_catalog} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "catalog_type = 'hive' の実験的なデータベースエンジン DataLakeCatalog を許可します"}]}]}/>

catalog_type = 'hms' の実験的なデータベースエンジン DataLakeCatalog を許可します

## allow_experimental_database_iceberg {#allow_experimental_database_iceberg} 

<BetaBadge/>

**エイリアス**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

catalog_type = 'iceberg' の実験的なデータベースエンジン DataLakeCatalog を有効にします。

## allow_experimental_database_materialized_postgresql {#allow_experimental_database_materialized_postgresql} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Engine=MaterializedPostgreSQL(...) を使用したデータベースの作成を許可します。

## allow_experimental_database_unity_catalog {#allow_experimental_database_unity_catalog} 

<BetaBadge/>

**エイリアス**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'unity' の実験的な DataLakeCatalog データベースエンジンを有効化"}]}]}/>

catalog_type = 'unity' の実験的な DataLakeCatalog データベースエンジンを有効化

## allow_experimental_delta_kernel_rs {#allow_experimental_delta_kernel_rs} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

実験的な delta-kernel-rs 実装を有効にします。

## allow_experimental_delta_lake_writes {#allow_experimental_delta_lake_writes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

Delta Kernel の書き込み機能を有効にします。

## allow_experimental_full_text_index {#allow_experimental_full_text_index} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Enable experimental text index"}]}]}/>

true に設定すると、実験的なテキストインデックスの使用を許可します。

## allow_experimental_funnel_functions {#allow_experimental_funnel_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

ファネル分析用の実験的関数を有効にします。

## allow_experimental_hash_functions {#allow_experimental_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

実験的なハッシュ関数を有効にします

## allow_experimental_iceberg_compaction {#allow_experimental_iceberg_compaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

iceberg テーブルで 'OPTIMIZE' を明示的に使用できるようにします。

## allow_experimental_insert_into_iceberg {#allow_experimental_insert_into_iceberg} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

Iceberg テーブルへの `INSERT` クエリの実行を許可します。

## allow_experimental_join_right_table_sorting {#allow_experimental_join_right_table_sorting} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "true に設定されていて、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件が満たされている場合、左結合または内部ハッシュ結合のパフォーマンスを向上させるために、右テーブルをキーで再配置します。"}]}]}/>

true に設定されていて、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件が満たされている場合、左結合または内部ハッシュ結合のパフォーマンスを向上させるために、右テーブルをキーで再配置します。

## allow_experimental_kafka_offsets_storage_in_keeper {#allow_experimental_kafka_offsets_storage_in_keeper} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "コミット済みオフセットを ClickHouse Keeper に保存する実験的な Kafka ストレージエンジンの使用を許可"}]}]}/>

Kafka 関連のオフセットを ClickHouse Keeper に保存する実験的機能を許可します。この機能を有効にすると、Kafka テーブルエンジンに対して ClickHouse Keeper のパスとレプリカ名を指定できます。これにより、通常の Kafka エンジンではなく、コミット済みオフセットを ClickHouse Keeper に保存する新しいタイプのストレージエンジンが使用されます。

## allow_experimental_kusto_dialect {#allow_experimental_kusto_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Kusto Query Language (KQL) を有効にします。SQL の代替となるクエリ言語です。

## allow_experimental_materialized_postgresql_table {#allow_experimental_materialized_postgresql_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

MaterializedPostgreSQL テーブルエンジンの使用を許可します。この機能は実験的な段階のため、デフォルトでは無効になっています。

## allow_experimental_nlp_functions {#allow_experimental_nlp_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

自然言語処理向けの実験的関数を有効にします。

## allow_experimental_parallel_reading_from_replicas {#allow_experimental_parallel_reading_from_replicas} 

<BetaBadge/>

**エイリアス**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

SELECT クエリの実行時に、各分片につき最大 `max_parallel_replicas` 個までのレプリカを使用します。読み取りは並列化され、動的に調整されます。0 - 無効、1 - 有効（障害発生時は暗黙的に無効化）、2 - 有効（障害発生時は例外をスロー）

## allow_experimental_prql_dialect {#allow_experimental_prql_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

SQL の代替言語である PRQL を有効にします。

## allow_experimental_qbit_type {#allow_experimental_qbit_type} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい実験的な設定"}]}]}/>

[QBit](../../sql-reference/data-types/qbit.md) データ型を作成できるようにします。

## allow_experimental_query_deduplication {#allow_experimental_query_deduplication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

パートUUIDに基づくSELECTクエリ向けの実験的なデータ重複排除

## allow_experimental_statistics {#allow_experimental_statistics} 

<ExperimentalBadge/>

**Aliases**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "この設定は名前が変更されました。以前の名前は `allow_experimental_statistic` です。"}]}]}/>

[統計情報](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) を持つカラムの定義および [統計情報の操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics) を許可します。

## allow_experimental_time_series_aggregate_functions {#allow_experimental_time_series_aggregate_functions} 

<ExperimentalBadge/>

**エイリアス**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "実験的な timeSeries* 集約関数を有効化する新しい設定。"}]}]}/>

Prometheus に類似したタイムシリーズのリサンプリング、レート、デルタ計算に使用される実験的な timeSeries* 集約関数。

## allow_experimental_time_series_table {#allow_experimental_time_series_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "TimeSeries テーブルエンジンを許可するための新しい設定を追加"}]}]}/>

[TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを使用したテーブルの作成を許可します。取り得る値は次のとおりです。

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは無効です。
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは有効です。

## allow_experimental_window_view {#allow_experimental_window_view} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

WINDOW VIEW を有効にします。まだ十分に安定していません。

## allow_experimental_ytsaurus_dictionary_source {#allow_experimental_ytsaurus_dictionary_source} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

YTsaurus との統合向けの実験的な Dictionary ソース。

## allow_experimental_ytsaurus_table_engine {#allow_experimental_ytsaurus_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

YTsaurus との統合向けの実験的なテーブルエンジン。

## allow_experimental_ytsaurus_table_function {#allow_experimental_ytsaurus_table_function} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

YTsaurus との統合のための実験的なテーブルエンジンです。

## allow_general_join_planning {#allow_general_join_planning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを使用可能にします。"}]}]}/>

より複雑な条件を扱うことができる、より汎用的な結合計画アルゴリズムを使用可能にしますが、ハッシュ結合でのみ利用できます。ハッシュ結合が有効になっていない場合、この SETTING の値に関係なく、通常の結合計画アルゴリズムが使用されます。

## allow_get_client_http_header {#allow_get_client_http_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新しい関数を導入。"}]}]}/>

現在の HTTP リクエストのヘッダー値を取得できる関数 `getClientHTTPHeader` の使用を許可するかどうかを制御します。`Cookie` など一部のヘッダーには機密情報が含まれる可能性があるため、セキュリティ上の理由からデフォルトでは有効化されていません。`X-ClickHouse-*` ヘッダーおよび `Authentication` ヘッダーは常に取得が制限されており、この関数で取得することはできない点に注意してください。

## allow_hyperscan {#allow_hyperscan} 

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを使用する関数を許可します。無効にしておくことで、コンパイル時間が長くなったり、リソース使用量が過剰になったりする可能性を避けられます。

## allow_introspection_functions {#allow_introspection_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリプロファイリング用の[イントロスペクション関数](../../sql-reference/functions/introspection.md)を有効または無効にします。

設定可能な値:

- 1 — イントロスペクション関数を有効。
- 0 — イントロスペクション関数を無効。

**関連項目**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- システムテーブル [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select {#allow_materialized_view_with_bad_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "存在しないカラムやテーブルを参照する MV の作成を許可しない"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "CREATE MATERIALIZED VIEW におけるより厳密な検証をサポート（ただしまだ有効化しない）"}]}]}/>

存在しないテーブルまたはカラムを参照する SELECT クエリを伴う CREATE MATERIALIZED VIEW を許可します。ただし、クエリは構文的に有効である必要があります。refreshable な MV には適用されません。また、MV のスキーマを SELECT クエリから推論する必要がある場合（つまり、CREATE にカラムリストも TO 句のテーブル指定もない場合）には適用されません。ソーステーブルより先に MV を作成する場合に利用できます。

## allow_named_collection_override_by_default {#allow_named_collection_override_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きコレクション内のフィールドの上書きをデフォルトで許可します。

## allow_non_metadata_alters {#allow_non_metadata_alters} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルメタデータだけでなく、ディスク上のデータにも影響する ALTER を実行できるようにします。

## allow_nonconst_timezone_arguments {#allow_nonconst_timezone_arguments} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() のような特定の時間関連関数で、非定数のタイムゾーン引数を許可します。"}]}]}/>

toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() のような特定の時間関連関数で、非定数のタイムゾーン引数を許可します。
この設定は互換性維持のためだけに存在します。ClickHouse では、タイムゾーンはデータ型、ひいてはカラムのプロパティです。
この設定を有効にすると、1 つのカラム内の異なる値が異なるタイムゾーンを持ち得るという誤った印象を与えてしまいます。
したがって、この設定は有効化しないでください。

## allow&#95;nondeterministic&#95;mutations {#allow_nondeterministic_mutations}

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッドテーブルに対して、`dictGet` などの非決定的関数を利用するミューテーションを許可するユーザーレベルの設定です。

たとえば辞書はノード間で同期ずれが起こりうるため、その値を取得するミューテーションは、デフォルトではレプリケーテッドテーブル上では許可されていません。この設定を有効化すると、この挙動が許可され、使用されるデータが全ノード間で同期していることを保証する責任はユーザー側になります。

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


## allow_nondeterministic_optimize_skip_unused_shards {#allow_nondeterministic_optimize_skip_unused_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

シャーディングキー内で、非決定的な関数（`rand` や `dictGet` など。`dictGet` は更新時にいくつか注意点があります）の使用を許可します。

可能な値:

- 0 — 許可しない。
- 1 — 許可する。

## allow_prefetched_read_pool_for_local_filesystem {#allow_prefetched_read_pool_for_local_filesystem} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツがローカルファイルシステム上にある場合に、プリフェッチ済みのスレッドプールの使用を優先する

## allow_prefetched_read_pool_for_remote_filesystem {#allow_prefetched_read_pool_for_remote_filesystem} 

<SettingsInfoBlock type="Bool" default_value="1" />

すべてのパーツがリモートファイルシステム上にある場合、prefetch 用スレッドプールを優先して使用します。

## allow_push_predicate_ast_for_distributed_subqueries {#allow_push_predicate_ast_for_distributed_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定"}]}]}/>

analyzer が有効な分散サブクエリに対して、AST レベルでの述語プッシュダウンを許可します。

## allow_push_predicate_when_subquery_contains_with {#allow_push_predicate_when_subquery_contains_with} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに WITH 句が含まれている場合に述語のプッシュダウンを許可します

## allow_reorder_prewhere_conditions {#allow_reorder_prewhere_conditions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

WHERE から PREWHERE に条件を移動する際、フィルタリングを最適化するために条件の並び順の変更を許可します

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert {#allow_settings_after_format_in_insert}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "ClickHouse が誤解を招く形で SETTINGS を値として解釈してしまうため、INSERT クエリで FORMAT の後に SETTINGS を許可しない"}]}]} />

`INSERT` クエリにおいて、`FORMAT` の後に続く `SETTINGS` を許可するかどうかを制御します。`SETTINGS` の一部を値として解釈してしまう可能性があるため、この設定を使用することは推奨されません。

例:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

ただし、次のクエリは `allow_settings_after_format_in_insert` が有効な場合にのみ動作します。

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

可能な値:

* 0 — 許可しない。
* 1 — 許可する。

:::note
古い構文に依存するユースケースがある場合の後方互換性のためにのみ、この SETTING を使用してください。
:::


## allow_simdjson {#allow_simdjson} 

<SettingsInfoBlock type="Bool" default_value="1" />

AVX2 命令が利用可能な場合に、`JSON*` 関数で simdjson ライブラリの使用を許可します。無効になっている場合は rapidjson が使用されます。

## allow_special_serialization_kinds_in_output_formats {#allow_special_serialization_kinds_in_output_formats} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "一部の出力フォーマットで、Sparse や Replicated のような特殊なカラム表現を直接出力できるようにする"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Sparse や Replicated のような特殊なカラム表現を、完全なカラム表現へ変換せずに出力することを許可する設定を追加"}]}]}/>

Sparse や Replicated などの特殊なシリアライゼーション種別を持つカラムを、完全なカラム表現に変換せずに出力できるようにします。
これにより、フォーマット処理中の不要なデータコピーを回避できます。

## allow_statistics_optimize {#allow_statistics_optimize} 

<BetaBadge/>

**別名**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "この最適化をデフォルトで有効にします。"}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "このSETTINGは名前が変更されました。以前の名前は `allow_statistic_optimize` です。"}]}]}/>

クエリの最適化に統計情報を利用できるようにします

## allow_suspicious_codecs {#allow_suspicious_codecs} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "意味のない圧縮コーデックの指定を許可しない"}]}]}/>

true に設定すると、意味のない圧縮コーデックも指定できるようになります。

## allow_suspicious_fixed_string_types {#allow_suspicious_fixed_string_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE TABLE ステートメント内で、型 FixedString(n) のカラムを n > 256 で作成できるようにします。長さが 256 以上の FixedString は不自然であり、多くの場合は誤用を示しています。

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "true の場合、同一の式を持つ索引を定義できます"}]}]}/>

同一の式を持つプライマリ/セカンダリ索引およびソートキーを拒否します

## allow_suspicious_low_cardinality_types {#allow_suspicious_low_cardinality_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

固定サイズが 8 バイト以下のデータ型（数値データ型および `FixedString(8_bytes_or_less)`）で [LowCardinality](../../sql-reference/data-types/lowcardinality.md) を使用することを許可するかどうかを制御します。

小さな固定長の値に対して `LowCardinality` を使用すると、通常は効率的ではありません。これは、ClickHouse が各行に対して数値の索引を保存するためです。その結果として、次のような影響があります。

- ディスク使用量が増加する可能性があります。
- Dictionary のサイズに応じて、RAM 消費量が多くなる可能性があります。
- 追加のエンコード／デコード処理により、一部の関数が遅くなる場合があります。

上記のすべての理由により、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルにおけるマージ時間が長くなる可能性があります。

設定可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用が制限されます。

## allow_suspicious_primary_key {#allow_suspicious_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "MergeTree テーブルに対する不適切な PRIMARY KEY/ORDER BY（例: SimpleAggregateFunction）を禁止"}]}]}/>

MergeTree テーブルに対する不適切な `PRIMARY KEY`/`ORDER BY`（例: SimpleAggregateFunction）を許可します。

## allow_suspicious_ttl_expressions {#allow_suspicious_ttl_expressions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "新しい設定であり、以前のバージョンでは挙動は常に許可されているのと同等でした。"}]}]}/>

テーブルのいずれのカラムにも依存しない有効期限 (TTL) 式を拒否します。これはほとんどの場合、ユーザーのミスであることを示します。

## allow_suspicious_types_in_group_by {#allow_suspicious_types_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトでは GROUP BY で Variant/Dynamic 型を許可しない"}]}]}/>

GROUP BY キーで [Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型の使用を許可するかどうかを制御します。

## allow_suspicious_types_in_order_by {#allow_suspicious_types_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトで ORDER BY での Variant/Dynamic 型の使用を許可しない"}]}]}/>

ORDER BY キーで [Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を使用できるかどうかを許可または制限します。

## allow_suspicious_variant_types {#allow_suspicious_variant_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "デフォルトでは、疑わしいバリアントを含む Variant 型の作成を許可しない"}]}]}/>

CREATE TABLE ステートメントでは、類似したバリアント型（たとえば、異なる数値型や日付型）を持つ Variant 型を指定できるようにします。この設定を有効にすると、類似した型の値を扱う際に動作があいまいになる可能性があります。

## allow_unrestricted_reads_from_keeper {#allow_unrestricted_reads_from_keeper} 

<SettingsInfoBlock type="Bool" default_value="0" />

system.zookeeper テーブルに対して、パス条件なしの無制限な読み取りを許可します。便利な場合もありますが、ZooKeeper にとっては安全とは言えません。

## alter_move_to_space_execute_async {#alter_move_to_space_execute_async} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE MOVE ... TO [DISK|VOLUME] を非同期で実行する

## alter&#95;partition&#95;verbose&#95;result {#alter_partition_verbose_result}

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションおよびパーツに対する操作が正常に適用されたパーツに関する情報を表示するかどうかを制御します。
[ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) および [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) に適用されます。

設定可能な値:

* 0 — 冗長な出力を無効にします。
* 1 — 冗長な出力を有効にします。

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


## alter_sync {#alter_sync} 

**別名**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

[ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md) または [TRUNCATE](../../sql-reference/statements/truncate.md) クエリによってレプリカ上で実行されるアクションの完了をどの程度待機するかを設定します。

取りうる値:

- `0` — 待機しない。
- `1` — 自身のレプリカでの実行の完了を待機する。
- `2` — すべてのレプリカでの実行の完了を待機する。

Cloud でのデフォルト値: `1`。

:::note
`alter_sync` は `Replicated` テーブルにのみ適用され、`Replicated` ではないテーブルに対する ALTER には何も行われません。
:::

## alter_update_mode {#alter_update_mode} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

`UPDATE` コマンドを含む `ALTER` クエリのモード。

設定可能な値:

- `heavy` - 通常のミューテーションを実行します。
- `lightweight` - 可能であれば論理更新を実行し、それ以外の場合は通常のミューテーションを実行します。
- `lightweight_force` - 可能であれば論理更新を実行し、それ以外の場合は例外をスローします。

## analyze_index_with_space_filling_curves {#analyze_index_with_space_filling_curves} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルの索引に空間充填曲線（例：`ORDER BY mortonEncode(x, y)` や `ORDER BY hilbertEncode(x, y)`）が含まれており、クエリにその引数に対する条件（例：`x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`）が含まれている場合は、索引解析に空間充填曲線を使用します。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested {#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

Nested カラムに複合識別子を追加できるようにします。これはクエリ結果を変更するため、互換性維持のための設定です。無効にすると、`SELECT a.b.c FROM table ARRAY JOIN a` は動作せず、`SELECT a FROM table` の結果の `Nested a` にも `a.b.c` カラムは含まれません。

## analyzer_compatibility_join_using_top_level_identifier {#analyzer_compatibility_join_using_top_level_identifier} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "PROJECTION から JOIN USING 内の識別子を解決するように強制する"}]}]}/>

JOIN USING における識別子を PROJECTION から解決するように強制します（たとえば `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` の場合、結合条件は `t1.b = t2.b` ではなく `t1.a + 1 = t2.b` になります）。

## any_join_distinct_right_table_keys {#any_join_distinct_right_table_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "デフォルトで ANY RIGHT および ANY FULL JOIN を無効にして不整合を回避する"}]}]}/>

`ANY INNER|LEFT JOIN` 演算において、従来の ClickHouse サーバーの動作を有効にします。

:::note
従来の `JOIN` 動作に依存するユースケースがある場合の後方互換性のためにのみ、この設定を使用してください。
:::

従来の動作が有効な場合:

- `t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくありません。これは、ClickHouse が左テーブルから右テーブルへの多対一のキー・マッピングロジックを使用するためです。
- `ANY INNER JOIN` の結果には、`SEMI LEFT JOIN` と同様に、左テーブルのすべての行が含まれます。

従来の動作が無効な場合:

- `t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくなります。これは、ClickHouse が `ANY RIGHT JOIN` 演算で一対多のキー・マッピングを行うロジックを使用するためです。
- `ANY INNER JOIN` の結果には、左テーブルおよび右テーブルの両方から、キーごとに 1 行だけが含まれます。

設定可能な値:

- 0 — 従来の動作を無効にします。
- 1 — 従来の動作を有効にします。

関連項目:

- [JOIN の厳密さ](/sql-reference/statements/select/join#settings)

## apply_deleted_mask {#apply_deleted_mask} 

<SettingsInfoBlock type="Bool" default_value="1" />

論理削除（lightweight DELETE）によって削除された行をフィルタリングして除外できるようにします。無効にした場合、クエリはこれらの行を読み取ることができます。デバッグや削除の取り消し（undelete）シナリオに役立ちます。

## apply_mutations_on_fly {#apply_mutations_on_fly} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、データパーツとしてマテリアライズされていない mutation（UPDATE および DELETE）は、SELECT クエリ実行時に適用されます。

## apply_patch_parts {#apply_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、論理更新を表すパッチパーツが SELECT 時に適用されます。

## apply_patch_parts_join_cache_buckets {#apply_patch_parts_join_cache_buckets} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Join モードでパッチパーツを適用する際に使用する一時キャッシュのバケット数。

## apply_settings_from_server {#apply_settings_from_server} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "クライアント側のコード（例: INSERT 入力のパースおよびクエリ出力のフォーマット）は、サーバーと同じ設定を使用します。これにはサーバー構成ファイルからの設定も含まれます。"}]}]}/>

クライアントがサーバーから送信される設定を受け入れるかどうかを指定します。

これはクライアント側で実行される処理のみに影響します。特に、INSERT 入力データのパースとクエリ結果のフォーマットに影響します。クエリ実行の大部分はサーバー側で行われ、この設定の影響は受けません。

通常、この設定はユーザープロファイル（users.xml や `ALTER USER` のようなクエリ）で設定し、クライアント側（クライアントのコマンドライン引数、`SET` クエリ、`SELECT` クエリの `SETTINGS` セクション）からは設定しないことを推奨します。クライアント側からは、この値を false に変更することはできますが、true に変更することはできません（ユーザープロファイルで `apply_settings_from_server = false` が設定されている場合、サーバーは設定を送信しないため）。

当初（24.12）にはサーバー側の設定（`send_settings_to_client`）が存在していましたが、その後、利便性向上のためにこのクライアント側設定に置き換えられました。

## arrow_flight_request_descriptor_type {#arrow_flight_request_descriptor_type} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新しい設定。Arrow Flight リクエストで使用する descriptor（ディスクリプタ）の種別: 'path' または 'command'。Dremio では 'command' が必要です。"}]}]}/>

Arrow Flight リクエストで使用する descriptor（ディスクリプタ）の種別。'path' はデータセット名を path descriptor として送信します。'command' は SQL クエリを command descriptor として送信します（Dremio ではこれが必須です）。

指定できる値:

- 'path' — FlightDescriptor::Path を使用（デフォルト。ほとんどの Arrow Flight サーバーで動作）
- 'command' — FlightDescriptor::Command を SELECT クエリとともに使用（Dremio では必須）

## asterisk_include_alias_columns {#asterisk_include_alias_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ (`SELECT *`) に [ALIAS](../../sql-reference/statements/create/table.md/#alias) カラムを含めます。

指定可能な値:

- 0 - 無効
- 1 - 有効

## asterisk_include_materialized_columns {#asterisk_include_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）で [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) カラムを含めるかどうかを指定します。

指定可能な値:

- 0 - 無効
- 1 - 有効

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリからのデータはキューに格納され、その後バックグラウンドでテーブルにフラッシュ（書き込み）されます。wait_for_async_insert が false の場合、INSERT クエリはほぼ即座に処理されます。それ以外の場合、クライアントはデータがテーブルにフラッシュされるまで待機します。

## async_insert_busy_timeout_decrease_rate {#async_insert_busy_timeout_decrease_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期 insert のタイムアウトが減少する際の指数関数的な変化率"}]}]}/>

適応型非同期 insert のタイムアウトが減少する際の指数関数的な変化率

## async_insert_busy_timeout_increase_rate {#async_insert_busy_timeout_increase_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期挿入タイムアウトが増加する際の指数関数的な成長率"}]}]}/>

適応型非同期挿入タイムアウトが増加する際の指数関数的な成長率

## async_insert_busy_timeout_max_ms {#async_insert_busy_timeout_max_ms} 

**Aliases**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="ミリ秒" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "非同期挿入のタイムアウトの最小値（ミリ秒単位）。async_insert_busy_timeout_ms は async_insert_busy_timeout_max_ms のエイリアスです"}]}]}/>

最初のデータが現れてから、クエリごとに収集されたデータをダンプするまでに待機する最大時間。

## async_insert_busy_timeout_min_ms {#async_insert_busy_timeout_min_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "非同期インサートのタイムアウトの最小値（ミリ秒単位）。この値は初期値としても使用され、その後アダプティブアルゴリズムによって増加する可能性があります"}]}]}/>

async_insert_use_adaptive_busy_timeout によって自動調整が有効になっている場合、最初のデータが現れてから、各クエリごとに収集されたデータを書き出すまでに待機する最小時間となります。また、この値はアダプティブアルゴリズムの初期値としても使用されます。

## async_insert_deduplicate {#async_insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッドテーブルに対する非同期 INSERT クエリで、挿入されるブロックの重複排除を実行するかどうかを指定します。

## async_insert_max_data_size {#async_insert_max_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "以前の値は小さすぎると判断されました。"}]}]}/>

挿入前にクエリごとに蓄積される未解析データの最大サイズ（バイト単位）。

## async_insert_max_query_number {#async_insert_max_query_number} 

<SettingsInfoBlock type="UInt64" default_value="450" />

実際に挿入される前にバッファリングされる `INSERT` クエリの最大数。
設定 [`async_insert_deduplicate`](#async_insert_deduplicate) が 1 に設定されている場合にのみ有効です。

## async_insert_poll_timeout_ms {#async_insert_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "非同期挿入キューをポーリングしてデータを取得する際のタイムアウト（ミリ秒単位）"}]}]}/>

非同期挿入キューをポーリングしてデータを取得する際のタイムアウト

## async_insert_use_adaptive_busy_timeout {#async_insert_use_adaptive_busy_timeout} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "適応的な非同期挿入タイムアウトを使用"}]}]}/>

true に設定すると、非同期挿入に対して適応的なビジータイムアウトを使用します。

## async_query_sending_for_remote {#async_query_sending_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "接続作成および分片間でのクエリの非同期送信"}]}]}/>

リモートクエリを実行する際に、接続の作成およびクエリ送信を非同期で行えるようにします。

デフォルトで有効です。

## async_socket_for_remote {#async_socket_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "すべての問題を修正し、リモートクエリに対するソケットからの非同期読み取りをデフォルトで再度有効にしました"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "いくつかの問題により、リモートクエリに対するソケットからの非同期読み取りを無効にしました"}]}]}/>

リモートクエリの実行時に、ソケットからの非同期読み取りを有効にします。

デフォルトで有効です。

## azure_allow_parallel_part_upload {#azure_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Azure のマルチパートアップロード時に複数スレッドを使用します。"}]}]}/>

Azure のマルチパートアップロード時に複数スレッドを使用します。

## azure_check_objects_after_upload {#azure_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage 内の各アップロード済みオブジェクトを確認します"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage 内の各アップロード済みオブジェクトを確認します"}]}]}/>

アップロードが成功したことを確認するために、Azure Blob Storage 内の各アップロード済みオブジェクトを確認します

## azure_connect_timeout_ms {#azure_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

Azure ディスク用ホストへの接続タイムアウト時間。

## azure_create_new_file_on_insert {#azure_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

azure エンジンのテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを有効化または無効化します。

## azure_ignore_file_doesnt_exist {#azure_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、AzureBlobStorage テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際、対応するファイルが存在しない場合はエラーとせず無視します。

可能な値：

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## azure_list_object_keys_size {#azure_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストで一度のバッチで返すことができるファイル数の最大値

## azure_max_blocks_in_multipart_upload {#azure_max_blocks_in_multipart_upload} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure のマルチパートアップロードにおけるブロック数の最大数。"}]}]}/>

Azure のマルチパートアップロードにおけるブロック数の最大数。

## azure_max_get_burst {#azure_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト上限に達する前に同時に発行できる最大リクエスト数です。デフォルト値 (0) の場合は `azure_max_get_rps` と同じ値になります。

## azure_max_get_rps {#azure_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが発生する前の、Azure への 1 秒あたりの GET リクエスト数の上限。0 の場合は無制限。

## azure_max_inflight_parts_for_one_file {#azure_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "マルチパートアップロードリクエストで同時にアップロードできるパーツの最大数。0 は無制限を意味します。"}]}]}/>

マルチパートアップロードリクエストで同時にアップロードできるパーツの最大数。0 は無制限を意味します。

## azure_max_put_burst {#azure_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}]}/>

1 秒あたりのリクエスト数制限に達する前に、同時に送信できるリクエストの最大数です。デフォルト値 (0) の場合は `azure_max_put_rps` と同じです。

## azure_max_put_rps {#azure_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Azure への 1 秒あたりの PUT リクエスト数の上限です。この上限を超えるとスロットリングされます。0 を指定した場合は無制限を意味します。

## azure_max_redirects {#azure_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "新しい設定"}]}]}/>

許可される Azure のリダイレクトホップ数の上限。

## azure_max_single_part_copy_size {#azure_max_single_part_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Azure Blob Storage に対して単一パートコピーを使用してコピーできるオブジェクトの最大サイズ。"}]}]}/>

Azure Blob Storage に対して単一パートコピーを使用してコピーできるオブジェクトの最大サイズ。

## azure_max_single_part_upload_size {#azure_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "S3 と整合"}]}]}/>

Azure Blob Storage に対して単一パートアップロードを使用してアップロードできるオブジェクトの最大サイズ。

## azure_max_single_read_retries {#azure_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の Azure Blob Storage からの読み取り処理に対する最大リトライ回数。

## azure_max_unexpected_write_error_retries {#azure_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数"}]}]}/>

Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数

## azure_max_upload_part_size {#azure_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Azure Blob Storage へのマルチパートアップロードでアップロードするパートの最大サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロードでアップロードするパートの最大サイズ。

## azure_min_upload_part_size {#azure_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Azure Blob Storage へのマルチパートアップロードでアップロードする各パートの最小サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロードでアップロードする各パートの最小サイズ。

## azure_request_timeout_ms {#azure_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Azure とのデータ送受信におけるアイドル状態のタイムアウトです。単一の TCP 読み取りまたは書き込み処理が、この時間だけブロックされた場合は失敗とみなします。

## azure_sdk_max_retries {#azure_sdk_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK での最大リトライ回数"}]}]}/>

Azure SDK での最大リトライ回数

## azure_sdk_retry_initial_backoff_ms {#azure_sdk_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK による再試行の最小バックオフ時間"}]}]}/>

Azure SDK による再試行の最小バックオフ時間

## azure_sdk_retry_max_backoff_ms {#azure_sdk_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK における再試行間の最大バックオフ時間"}]}]}/>

Azure SDK における再試行間の最大バックオフ時間

## azure_skip_empty_files {#azure_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Azure テーブルエンジンで空ファイルをスキップできるようにする"}]}]}/>

S3 エンジンで空ファイルをスキップするかどうかを有効化／無効化します。

設定可能な値:

- 0 — 空ファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## azure_strict_upload_part_size {#azure_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Azure Blob Storage へのマルチパートアップロードで使用する各パートの厳密なサイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロードで使用する各パートの厳密なサイズ。

## azure_throw_on_zero_files_match {#azure_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "AzureBlobStorage エンジンで ListObjects リクエストがいずれのファイルにもマッチしない場合に、空のクエリ結果ではなくエラーをスローできるようにする"}]}]}/>

グロブ展開規則に基づいて一致するファイルが 0 件の場合にエラーをスローします。

可能な値:

- 1 — `SELECT` が例外をスローします。
- 0 — `SELECT` が空の結果を返します。

## azure_truncate_on_insert {#azure_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Azure エンジンテーブルへの挿入前に TRUNCATE を実行するかどうかを切り替えます。

## azure_upload_part_size_multiply_factor {#azure_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "Azure Blob Storage への 1 回の書き込みから azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。"}]}]}/>

Azure Blob Storage への 1 回の書き込みから azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。

## azure_upload_part_size_multiply_parts_count_threshold {#azure_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍されます。"}]}]}/>

この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍されます。

## azure_use_adaptive_timeouts {#azure_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定"}]}]}/>

`true` に設定すると、すべての Azure リクエストに対して、最初の 2 回の試行は送信および受信タイムアウトを短くして行われます。
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## backup_restore_batch_size_for_keeper_multi {#backup_restore_batch_size_for_keeper_multi} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

バックアップまたはリストア時に [Zoo]Keeper へ送信される multi リクエストあたりの最大バッチサイズ

## backup_restore_batch_size_for_keeper_multiread {#backup_restore_batch_size_for_keeper_multiread} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バックアップまたはリストア中に [Zoo]Keeper へ送信される multiread リクエストの最大バッチサイズ。

## backup_restore_failure_after_host_disconnected_for_seconds {#backup_restore_failure_after_host_disconnected_for_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の操作中に、ホストがこの時間のあいだ ZooKeeper 内の一時的な「alive」ノードを再作成しない場合、バックアップまたはリストア全体が失敗と見なされます。
この値は、障害発生後にホストが ZooKeeper に再接続するのにかかり得る妥当な最大時間よりも長く設定する必要があります。
0 は無制限を意味します。

## backup_restore_finish_timeout_after_error_sec {#backup_restore_finish_timeout_after_error_sec} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "新しい設定。"}]}]}/>

イニシエーターノードが、他のホストが `error` ノードに反応して、現在実行中の `BACKUP ON CLUSTER` または `RESTORE ON CLUSTER` 操作での処理を停止するまで待機する時間。

## backup_restore_keeper_fault_injection_probability {#backup_restore_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

バックアップまたはリストア中の keeper リクエストが失敗するおおよその確率です。有効な値は [0.0f, 1.0f] の範囲です。

## backup_restore_keeper_fault_injection_seed {#backup_restore_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 の場合はランダムシード、それ以外の場合はその設定値を使用します

## backup_restore_keeper_max_retries {#backup_restore_keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper 障害により、途中で BACKUP または RESTORE 操作全体が失敗しないよう、十分に大きな値にする必要があります。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper 障害により、途中で BACKUP または RESTORE 操作全体が失敗しないよう、十分に大きな値にする必要があります。"}]}]}/>

BACKUP または RESTORE 操作の途中で行われる [Zoo]Keeper 操作に対する最大再試行回数。
一時的な [Zoo]Keeper 障害により操作全体が失敗しないよう、十分に大きな値にする必要があります。

## backup_restore_keeper_max_retries_while_handling_error {#backup_restore_keeper_max_retries_while_handling_error} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新しい設定。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作で発生したエラーの処理中に実行される [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_max_retries_while_initializing {#backup_restore_keeper_max_retries_while_initializing} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新しい設定。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作の初期化中における [Zoo]Keeper 操作の再試行回数の上限。

## backup_restore_keeper_retry_initial_backoff_ms {#backup_restore_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対するバックオフ時間の初期値

## backup_restore_keeper_retry_max_backoff_ms {#backup_restore_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

バックアップまたはリストア中の [Zoo]Keeper 操作の再試行における最大バックオフ時間

## backup_restore_keeper_value_max_size {#backup_restore_keeper_value_max_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックアップ時の [Zoo]Keeper ノードのデータの最大サイズ

## backup_restore_s3_retry_attempts {#backup_restore_s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Aws::Client::RetryStrategy の設定です。Aws::Client が内部でリトライを行い、0 の場合はリトライしません。この設定はバックアップ／リストア時にのみ適用されます。"}]}]}/>

Aws::Client::RetryStrategy の設定です。Aws::Client が内部でリトライを行い、0 の場合はリトライしません。この設定はバックアップ／リストア時にのみ適用されます。

## backup_restore_s3_retry_initial_backoff_ms {#backup_restore_s3_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "新しい設定"}]}]}/>

バックアップおよびリストア時の最初の再試行を行う前のバックオフ遅延時間を、ミリ秒単位で指定します。以降の各再試行では遅延が指数関数的に増加し、`backup_restore_s3_retry_max_backoff_ms` で指定された最大値に達するまで続きます。

## backup_restore_s3_retry_jitter_factor {#backup_restore_s3_retry_jitter_factor} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理中に、`Aws::Client::RetryStrategy` におけるリトライ時のバックオフ遅延時間に適用されるジッタ係数です。計算されたバックオフ遅延時間は、[1.0, 1.0 + jitter] の範囲のランダムな係数を掛けて決定され、最大で `backup_restore_s3_retry_max_backoff_ms` までとなります。値は [0.0, 1.0] の範囲で指定する必要があります。

## backup_restore_s3_retry_max_backoff_ms {#backup_restore_s3_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "新しい設定"}]}]}/>

バックアップおよびリストア処理時の再試行間の最大遅延時間（ミリ秒）。

## backup_slow_all_threads_after_retryable_s3_error {#backup_slow_all_threads_after_retryable_s3_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで設定を無効化"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントへの S3 リクエストを実行しているすべてのスレッドは、いずれか 1 つの S3 リクエストで `Slow Down` などのリトライ可能な S3 エラーが発生した後に、スローダウンされます。
`false` に設定すると、各スレッドは他のスレッドとは独立して、それぞれ個別に S3 リクエストのバックオフを処理します。

## cache_warmer_threads {#cache_warmer_threads} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

ClickHouse Cloud でのみ有効です。[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) が有効な場合に、新しいデータパーツをファイルシステムキャッシュへ先行的にダウンロードするバックグラウンドスレッドの数です。0 にすると無効になります。

## calculate_text_stack_trace {#calculate_text_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行中に例外が発生した場合に、テキスト形式のスタックトレースを計算します。これは既定値です。大量の誤ったクエリが実行されるファジングテストでは、シンボルルックアップが必要になるため、処理が遅くなる可能性があります。通常の利用では、このオプションを無効化しないでください。

## cancel_http_readonly_queries_on_client_close {#cancel_http_readonly_queries_on_client_close} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントがレスポンスを待たずに接続を閉じた場合、HTTP 経由の読み取り専用クエリ（例: SELECT）をキャンセルします。

Cloud のデフォルト値: `0`。

## cast_ipv4_ipv6_default_on_conversion_error {#cast_ipv4_ipv6_default_on_conversion_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "cast(value, 'IPv4') と cast(value, 'IPv6') 関数を toIPv4 および toIPv6 関数と同じ動作にする"}]}]}/>

IPv4 型および IPv6 型への CAST 演算子による変換と、toIPv4 / toIPv6 関数は、変換エラーが発生した場合に例外をスローせず、代わりにデフォルト値を返します。

## cast&#95;keep&#95;nullable {#cast_keep_nullable}

<SettingsInfoBlock type="Bool" default_value="0" />

[CAST](/sql-reference/functions/type-conversion-functions#cast) 操作において `Nullable` データ型を保持するかどうかを切り替えます。

この設定が有効で、`CAST` 関数の引数が `Nullable` の場合、結果も `Nullable` 型に変換されます。設定が無効な場合、結果は常に指定された変換先の型とまったく同じ型になります。

設定可能な値:

* 0 — `CAST` の結果は、指定された変換先の型と厳密に同じになります。
* 1 — 引数の型が `Nullable` の場合、`CAST` の結果は `Nullable(DestinationDataType)` に変換されます。

**例**

次のクエリでは、結果は変換先のデータ型と厳密に同じ型になります。

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

次のクエリにより、出力先のデータ型に `Nullable` 修飾が付与されます。

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

* [CAST](/sql-reference/functions/type-conversion-functions#cast) 関数


## cast_string_to_date_time_mode {#cast_string_to_date_time_mode} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "String から DateTime へのキャスト時に異なる DateTime パースモードを使用可能にする"}]}]}/>

String からのキャスト時に、日付と時刻のテキスト表現を解析するパーサーを選択できます。

指定可能な値:

- `'best_effort'` — 拡張パースを有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` と、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) の日付および時刻形式をパースできます。例えば、`'2018-06-08T01:02:03.000Z'` などです。

- `'best_effort_us'` — `best_effort` と同様です（違いについては [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus) を参照）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみをパースできます。例えば、`2019-08-20 10:18:56` や `2019-08-20` です。

こちらも参照してください:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference {#cast_string_to_dynamic_use_inference} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "String から Dynamic への変換時にパースによる変換を許可する設定を追加"}]}]}/>

String から Dynamic への変換時に型推論を使用する

## cast_string_to_variant_use_inference {#cast_string_to_variant_use_inference} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "String から Variant への CAST 時に型推論を有効化／無効化できる新しい設定"}]}]}/>

String から Variant への変換時に型推論を行います。

## check_query_single_value_result {#check_query_single_value_result} 

<SettingsInfoBlock type="Bool" default_value="1" />

`MergeTree` ファミリーのエンジンに対する [CHECK TABLE](/sql-reference/statements/check-table) クエリ結果の詳細レベルを定義します。

設定可能な値:

- 0 — クエリはテーブル内の各データパートごとのチェック結果を表示します。
- 1 — クエリはテーブル全体のチェック結果を表示します。

## check_referential_table_dependencies {#check_referential_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="0" />

DDL クエリ（DROP TABLE や RENAME など）によって参照関係が壊れないことをチェックします

## check_table_dependencies {#check_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="1" />

DROP TABLE や RENAME などの DDL クエリによってテーブル間の依存関係が壊れないことを確認します

## checksum_on_read {#checksum_on_read} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み込み時にチェックサムを検証します。これはデフォルトで有効であり、本番環境では常に有効にしておくべきです。この設定を無効にしてもメリットはないと考えてください。実験やベンチマークの目的でのみ使用できます。この設定は、MergeTree ファミリーのテーブルにのみ適用されます。その他のテーブルエンジンおよびネットワーク経由でデータを受信する場合には、チェックサムは常に検証されます。

## cloud_mode {#cloud_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

Cloud モード

## cloud_mode_database_engine {#cloud_mode_database_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

Cloud で使用が許可されるデータベースエンジンです。1 - DDL を書き換えて Replicated データベースを使用する、2 - DDL を書き換えて Shared データベースを使用する。

## cloud_mode_engine {#cloud_mode_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Cloud 上で許可されるエンジンファミリー。

- 0 - すべてを許可する
- 1 - DDL を *ReplicatedMergeTree を使用するように書き換える
- 2 - DDL を SharedMergeTree を使用するように書き換える
- 3 - 明示的に指定された remote disk がある場合を除き、DDL を SharedMergeTree を使用するように書き換える

公開される部分を最小限に抑えるための UInt64

## cluster_for_parallel_replicas {#cluster_for_parallel_replicas} 

<BetaBadge/>

現在のサーバーが配置されている分片用のクラスター

## cluster_function_process_archive_on_multiple_nodes {#cluster_function_process_archive_on_multiple_nodes} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、cluster functions でのアーカイブ処理のパフォーマンスを向上させます。以前のバージョンでアーカイブ付きの cluster functions を使用している場合は、25.7 以降へのアップグレード時の互換性確保およびエラー回避のために、`false` に設定しておいてください。

## cluster_table_function_buckets_batch_size {#cluster_table_function_buckets_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting."}]}]}/>

`bucket` 分割粒度を持つ cluster テーブル関数におけるタスクの分散処理で使用されるバッチのおおよそのサイズ（バイト単位）を定義します。システムは、少なくともこの値に達するまでデータを蓄積します。実際のサイズは、データの境界に合わせるためにわずかに大きくなる場合があります。

## cluster_table_function_split_granularity {#cluster_table_function_split_granularity} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "新しい設定です。"}]}]}/>

CLUSTER TABLE FUNCTION を実行する際に、データをタスクへどのように分割するかを制御します。

この設定は、クラスタ全体における処理の分散の粒度を定義します：

- `file` — 各タスクが 1 つのファイル全体を処理します。
- `bucket` — ファイル内の内部データブロックごとにタスクが作成されます（例: Parquet の行グループ）。

より細かい粒度（`bucket` など）を選択すると、少数の大きなファイルを扱う場合の並列性を高められます。
たとえば、1 つの Parquet ファイルに複数の行グループが含まれている場合、`bucket` 粒度を有効にすることで、各グループを異なるワーカーが独立して処理できるようになります。

## collect_hash_table_stats_during_aggregation {#collect_hash_table_stats_during_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

ハッシュテーブルの統計情報を収集し、メモリアロケーションを最適化できるようにします。

## collect_hash_table_stats_during_joins {#collect_hash_table_stats_during_joins} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

ハッシュテーブルの統計情報を収集し、メモリアロケーションを最適化できるようにします。

## compatibility {#compatibility} 

`compatibility` 設定は、以前のバージョンの ClickHouse のデフォルト設定を適用するためのものです。どの以前のバージョンを使うかは、この設定の値として指定します。

個々の設定がデフォルト以外の値に変更されている場合、それらの設定が優先されます（`compatibility` 設定の影響を受けるのは、変更されていない設定のみです）。

この設定には、`22.3` や `22.8` のように、ClickHouse のバージョン番号を文字列として指定します。空文字列を指定した場合、この設定は無効であることを意味します。

デフォルトでは無効です。

:::note
ClickHouse Cloud では、サービスレベルの compatibility 設定のデフォルト値は ClickHouse Cloud サポートによって設定される必要があります。設定を依頼するには、[ケースを作成](https://clickhouse.cloud/support)してください。
ただし、compatibility 設定は、`SET compatibility = '22.3'` をセッションで実行したり、クエリ内で `SETTINGS compatibility = '22.3'` を使用するなど、標準的な ClickHouse の設定メカニズムにより、ユーザー、ロール、プロファイル、クエリ、またはセッションレベルで上書きできます。
:::

## compatibility_ignore_auto_increment_in_create_table {#compatibility_ignore_auto_increment_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、カラム定義内の AUTO_INCREMENT キーワードを無視し、false の場合はエラーを返します。MySQL からの移行を容易にします。

## compatibility_ignore_collation_in_create_table {#compatibility_ignore_collation_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

互換性設定: CREATE TABLE で照合順序を無視する

## compatibility_s3_presigned_url_query_in_path {#compatibility_s3_presigned_url_query_in_path} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

互換性のための設定です。有効にすると、署名付き URL のクエリパラメータ（例: X-Amz-*）を S3 キーに折り込み（従来の動作）、
パス中では「?」がワイルドカードとして動作します。無効（デフォルト）の場合、署名付き URL のクエリパラメータは URL のクエリ部に保持され、
「?」がワイルドカードとして解釈されないようにします。

## compile_aggregate_expressions {#compile_aggregate_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数をネイティブコードへ JIT コンパイルするかどうかを切り替える設定です。この設定を有効にすると、パフォーマンスが向上する場合があります。

可能な値:

- 0 — 集約処理は JIT コンパイルなしで実行されます。
- 1 — 集約処理は JIT コンパイルを使用して実行されます。

**関連項目**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions {#compile_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "JIT コンパイラの背後にある LLVM 基盤は、この設定をデフォルトで有効化できる程度に十分安定していると考えています。"}]}]}/>

一部のスカラー関数や演算子をネイティブコードにコンパイルします。

## compile_sort_description {#compile_sort_description} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート記述をネイティブコードにコンパイルします。

## connect_timeout {#connect_timeout} 

<SettingsInfoBlock type="Seconds" default_value="10" />

レプリカが存在しない場合に使用される接続タイムアウト。

## connect_timeout_with_failover_ms {#connect_timeout_with_failover_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "非同期接続に対応するためデフォルトの接続タイムアウトを増加"}]}]}/>

クラスタ定義で「分片 (shard)」および「レプリカ (replica)」セクションが使用されている場合に、Distributed テーブルエンジンがリモートサーバーへ接続する際のタイムアウト値（ミリ秒単位）です。
接続に失敗した場合は、複数のレプリカに対して接続を複数回試行します。

## connect_timeout_with_failover_secure_ms {#connect_timeout_with_failover_secure_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default secure connect timeout because of async connect"}]}]}/>

セキュア接続において、最初の健全なレプリカを選択するための接続タイムアウト。

## connection_pool_max_wait_ms {#connection_pool_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

接続プールが満杯のときに、接続確立を待機する時間（ミリ秒）。

設定可能な値:

- 正の整数。
- 0 — タイムアウトしない（無制限）。

## connections_with_failover_max_tries {#connections_with_failover_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Distributed テーブルエンジンにおける、各レプリカへの接続試行の最大回数。

## convert&#95;query&#95;to&#95;cnf {#convert_query_to_cnf}

<SettingsInfoBlock type="Bool" default_value="0" />

`true` に設定すると、`SELECT` クエリは CNF（連言標準形）に変換されます。クエリを CNF に書き換えることで、より高速に実行される場合があります（詳しい説明は、この [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749) を参照してください）。

例えば、以下の `SELECT` クエリが変更されないことに注意してください（これがデフォルトの動作です）。

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

結果は次のとおりです。

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

`convert_query_to_cnf` を `true` に設定して、どのような変化があるか確認してみましょう。

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

`WHERE` 句は CNF に書き換えられていますが、結果セットは同一であり、ブール論理は変わっていません。

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


## correlated_subqueries_default_join_kind {#correlated_subqueries_default_join_kind} 

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "新しい設定。相関を除去したクエリプランにおけるデフォルトの JOIN 種別。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "新しい設定。相関を除去したクエリプランにおけるデフォルトの JOIN 種別。"}]}]}/>

相関を除去したクエリプランにおける JOIN の種別を制御します。デフォルト値は `right` であり、これは相関を除去したプランが、サブクエリの入力を右側に持つ RIGHT JOIN を含むことを意味します。

指定可能な値:

- `left` - 相関除去処理は LEFT JOIN を生成し、入力テーブルは左側に現れます。
- `right` - 相関除去処理は RIGHT JOIN を生成し、入力テーブルは右側に現れます。

## correlated_subqueries_substitute_equivalent_expressions {#correlated_subqueries_substitute_equivalent_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "相関サブクエリのプランニング最適化のための新しい設定です。"}]}]}/>

フィルター式から等価な式を推論し、CROSS JOIN を生成する代わりにそれらで置き換えます。

## count_distinct_implementation {#count_distinct_implementation} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

[COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 構文を実行する際に、どの `uniq*` 関数を使用するかを指定します。

設定可能な値:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization {#count_distinct_optimization} 

<SettingsInfoBlock type="Bool" default_value="0" />

`count distinct` を `GROUP BY` のサブクエリに書き換えます

## count_matches_stop_at_empty_match {#count_matches_stop_at_empty_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`countMatches` 関数で、パターンが長さ 0 の一致をした時点でカウントを停止します。

## create_if_not_exists {#create_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "New setting."}]}]}/>

`CREATE` ステートメントで `IF NOT EXISTS` をデフォルトで有効にします。この設定または `IF NOT EXISTS` のいずれかが指定されていて、指定された名前のテーブルがすでに存在する場合でも、例外はスローされません。

## create_index_ignore_unique {#create_index_ignore_unique} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE UNIQUE INDEX 内の UNIQUE キーワードを無視します。SQL 互換性テスト用の設定です。

## create_replicated_merge_tree_fault_injection_probability {#create_replicated_merge_tree_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

ZooKeeper にメタデータを作成した後に、テーブル作成時に障害注入（フォールトインジェクション）が発生する確率

## create_table_empty_primary_key_by_default {#create_table_empty_primary_key_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "使い勝手の向上"}]}]}/>

ORDER BY と PRIMARY KEY が指定されていない場合、空のプライマリキーを持つ *MergeTree テーブルの作成を許可します

## cross_join_min_bytes_to_compress {#cross_join_min_bytes_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "CROSS JOIN において圧縮を行うブロックの最小サイズ。0 を指定すると、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した場合、このブロックは圧縮されます。"}]}]}/>

CROSS JOIN において圧縮を行うブロックの最小サイズ。0 を指定すると、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した場合、このブロックは圧縮されます。

## cross_join_min_rows_to_compress {#cross_join_min_rows_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "CROSS JOIN でブロックを圧縮するための最小行数。値が 0 の場合、このしきい値は無効化されます。ブロックは、行数またはバイト数の 2 つのしきい値のいずれかに達した時点で圧縮されます。"}]}]}/>

CROSS JOIN でブロックを圧縮するための最小行数。値が 0 の場合、このしきい値は無効化されます。ブロックは、行数またはバイト数の 2 つのしきい値のいずれかに達した時点で圧縮されます。

## data_type_default_nullable {#data_type_default_nullable} 

<SettingsInfoBlock type="Bool" default_value="0" />

カラム定義で明示的な修飾子 [NULL または NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) を指定していないデータ型を、[Nullable](/sql-reference/data-types/nullable) として扱うかどうかを制御します。

取りうる値:

- 1 — カラム定義のデータ型は、デフォルトで `Nullable` に設定されます。
- 0 — カラム定義のデータ型は、デフォルトで `Nullable` ではない型に設定されます。

## database_atomic_wait_for_drop_and_detach_synchronously {#database_atomic_wait_for_drop_and_detach_synchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべての `DROP` および `DETACH` クエリに修飾子 `SYNC` を追加します。

設定可能な値：

- 0 — クエリは遅延して実行されます。
- 1 — クエリは遅延なしで実行されます。

## database_replicated_allow_explicit_uuid {#database_replicated_allow_explicit_uuid} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "テーブルの UUID の明示的な指定を禁止する新しい設定を追加"}]}]}/>

0 - Replicated データベース内のテーブルに対して UUID を明示的に指定することを許可しません。1 - 許可します。2 - 許可しますが、指定された UUID は無視し、代わりにランダムな UUID を生成します。

## database_replicated_allow_heavy_create {#database_replicated_allow_heavy_create} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Replicated データベースエンジンに対する長時間実行される DDL クエリ (CREATE AS SELECT および POPULATE) は禁止されます"}]}]}/>

Replicated データベースエンジンにおいて、長時間実行される DDL クエリ (CREATE AS SELECT および POPULATE) を許可します。DDL キューを長時間ブロックする可能性がある点に注意してください。

## database_replicated_allow_only_replicated_engine {#database_replicated_allow_only_replicated_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated エンジンのデータベースでは、Replicated テーブルのみを CREATE できるように制限します

## database_replicated_allow_replicated_engine_arguments {#database_replicated_allow_replicated_engine_arguments} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "デフォルトで明示的な引数を許可しない"}]}]}/>

0 - *Replicated データベース内の *MergeTree テーブルに対して ZooKeeper のパスおよびレプリカ名を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定されたパスは無視し、代わりにデフォルトのパスを使用する。3 - 許可し、警告をログに出力しない。

## database_replicated_always_detach_permanently {#database_replicated_always_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="0" />

database エンジンが Replicated の場合、DETACH TABLE を DETACH TABLE PERMANENTLY として実行します。

## database_replicated_enforce_synchronous_settings {#database_replicated_enforce_synchronous_settings} 

<SettingsInfoBlock type="Bool" default_value="0" />

一部のクエリに対して同期的な完了待ちを強制します（database_atomic_wait_for_drop_and_detach_synchronously、mutations_sync、alter_sync も参照）。これらの設定を有効にすることは推奨されません。

## database_replicated_initial_query_timeout_sec {#database_replicated_initial_query_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

初回の DDL クエリが、Replicated データベースによるそれ以前の DDL キュー内のエントリの処理完了を待機する時間を秒単位で指定します。

取りうる値:

- 正の整数。
- 0 — 無制限。

## database_shared_drop_table_delay_seconds {#database_shared_drop_table_delay_seconds} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "新しい設定。"}]}]}/>

`Shared` データベースで、ドロップされたテーブルが完全に削除されるまでの遅延時間（秒）。この時間内であれば、`UNDROP TABLE` ステートメントを使用してテーブルを復元できます。

## decimal_check_overflow {#decimal_check_overflow} 

<SettingsInfoBlock type="Bool" default_value="1" />

Decimal 型の算術演算および比較演算におけるオーバーフローをチェックする

## deduplicate_blocks_in_dependent_materialized_views {#deduplicate_blocks_in_dependent_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated\* テーブルからデータを受け取る materialized view に対する重複排除チェックを有効または無効にします。

設定可能な値:

0 — 無効。
      1 — 有効。

有効にすると、ClickHouse は Replicated\* テーブルに依存する materialized view 内のブロックの重複排除を行います。
この設定は、障害により挿入操作がリトライされている場合でも、materialized view に重複データが含まれないようにするのに役立ちます。

**関連項目**

- [IN 演算子における NULL の処理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security {#default_materialized_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "materialized view 作成時の SQL SECURITY オプションのデフォルト値を設定できるようにします"}]}]}/>

materialized view を作成する際の SQL SECURITY オプションのデフォルト値を設定できます。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `DEFINER` です。

## default_max_bytes_in_join {#default_max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

`max_bytes_in_join` が設定されておらず制限が必要な場合に適用される、右側テーブルの最大サイズ。

## default_normal_view_sql_security {#default_normal_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "通常ビュー作成時に使用する `SQL SECURITY` オプションのデフォルト値を指定します"}]}]}/>

通常ビューを作成する際に使用される `SQL SECURITY` オプションのデフォルト値を指定します。[`SQL SECURITY` の詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `INVOKER` です。

## default&#95;table&#95;engine {#default_table_engine}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "より使いやすくするため、デフォルトのテーブルエンジンを MergeTree に設定"}]}]} />

`CREATE` 文内で `ENGINE` が設定されていない場合に使用されるデフォルトのテーブルエンジン。

指定可能な値:

* 任意の有効なテーブルエンジン名を表す文字列

Cloud のデフォルト値: `SharedMergeTree`。

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

この例では、`Engine` を指定しない新しいテーブルはすべて、`Log` テーブルエンジンを使用します。

クエリ：

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

結果：

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


## default&#95;temporary&#95;table&#95;engine {#default_temporary_table_engine}

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

一時テーブル用の [default&#95;table&#95;engine](#default_table_engine) と同じ設定です。

この例では、`Engine` を指定しない新しい一時テーブルはすべて、`Log` テーブルエンジンを使用します。

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


## default_view_definer {#default_view_definer} 

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "ビュー作成時のデフォルトの `DEFINER` オプションを設定できる"}]}]}/>

ビュー作成時のデフォルトの `DEFINER` オプションを設定できます。 [SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `CURRENT_USER` です。

## delta_lake_enable_engine_predicate {#delta_lake_enable_engine_predicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

delta-kernel の内部データのプルーニングを有効にします。

## delta_lake_enable_expression_visitor_logging {#delta_lake_enable_expression_visitor_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

DeltaLake の expression visitor のテストレベルのログを有効にします。これらのログは、テストログとしても詳細になり過ぎる場合があります。

## delta_lake_insert_max_bytes_in_data_file {#delta_lake_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定。"}]}]}/>

Delta Lake で挿入される 1 つのデータファイルあたりのサイズ上限（バイト数）を定義します。

## delta_lake_insert_max_rows_in_data_file {#delta_lake_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新しい設定です。"}]}]}/>

Delta Lake で、1 つの挿入データファイルに含める行数の上限を定義します。

## delta_lake_log_metadata {#delta_lake_log_metadata} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

Delta Lake のメタデータファイルを system テーブルに記録できるようにします。

## delta_lake_snapshot_end_version {#delta_lake_snapshot_end_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "新しい設定。"}]}]}/>

読み取る Delta Lake スナップショットの終了バージョン。値 -1 は最新バージョンを読み取ることを意味します（値 0 も有効なスナップショットバージョンです）。

## delta_lake_snapshot_start_version {#delta_lake_snapshot_start_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "新しい設定。"}]}]}/>

読み取る Delta Lake スナップショットの開始バージョンを指定します。値 -1 は最新バージョンを読み取ることを意味します（0 も有効なスナップショットバージョンです）。

## delta_lake_snapshot_version {#delta_lake_snapshot_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "新しい設定"}]}]}/>

読み取る Delta Lake スナップショットのバージョンを指定します。値 -1 は最新バージョンを読み取ることを意味します（0 は有効なスナップショットバージョンです）。

## delta_lake_throw_on_engine_predicate_error {#delta_lake_throw_on_engine_predicate_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

delta-kernel でスキャン述語を解析する際にエラーが発生した場合に、例外をスローするようにします。

## describe_compact_output {#describe_compact_output} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、DESCRIBE クエリの結果にはカラム名と型のみが含まれます

## describe_include_subcolumns {#describe_include_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="0" />

[DESCRIBE](../../sql-reference/statements/describe-table.md) クエリでサブカラムを出力できるようにします。たとえば、[Tuple](../../sql-reference/data-types/tuple.md) のメンバーや、[Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null)、[Array](../../sql-reference/data-types/array.md/#array-size) データ型のサブカラムなどです。

指定可能な値:

- 0 — サブカラムは `DESCRIBE` クエリに含められません。
- 1 — サブカラムは `DESCRIBE` クエリに含められます。

**Example**

[DESCRIBE](../../sql-reference/statements/describe-table.md) 文の例を参照してください。

## describe_include_virtual_columns {#describe_include_virtual_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、テーブルの仮想カラムが DESCRIBE クエリの結果に含まれます

## dialect {#dialect} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

クエリの解析に使用する dialect

## dictionary_validate_primary_key_type {#dictionary_validate_primary_key_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Dictionary の主キーの型を検証します。デフォルトでは、simple レイアウトにおける id 型は自動的に UInt64 に変換されます。"}]}]}/>

Dictionary の主キーの型を検証します。デフォルトでは、simple レイアウトにおける id 型は自動的に UInt64 に変換されます。

## distinct_overflow_mode {#distinct_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えた場合の動作を設定します。

設定可能な値:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように
  部分的な結果を返します。

## distributed_aggregation_memory_efficient {#distributed_aggregation_memory_efficient} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散集約の省メモリモードを有効にするかどうかを指定します。

## distributed_background_insert_batch {#distributed_background_insert_batch} 

**別名**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

挿入データをバッチで送信するかどうかを有効/無効にします。

バッチ送信が有効な場合、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンは、複数の挿入データファイルを個別に送信するのではなく、1回の操作でまとめて送信しようとします。バッチ送信により、サーバーおよびネットワークリソースをより有効に活用することでクラスターのパフォーマンスが向上します。

取りうる値:

- 1 — 有効。
- 0 — 無効。

## distributed_background_insert_max_sleep_time_ms {#distributed_background_insert_max_sleep_time_ms} 

**エイリアス**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する際の最大間隔。 [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) SETTING で設定された間隔の指数的な増加を制限します。

取りうる値:

- ミリ秒単位の正の整数の値。

## distributed_background_insert_sleep_time_ms {#distributed_background_insert_sleep_time_ms} 

**エイリアス**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信するための基本となる間隔です。エラーが発生した場合、実際の間隔は指数関数的に長くなります。

設定可能な値:

- ミリ秒を単位とする正の整数。

## distributed_background_insert_split_batch_on_failure {#distributed_background_insert_split_batch_on_failure} 

**別名**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

失敗時にバッチを分割するかどうかを有効化/無効化します。

特定のバッチをリモートの分片に送信する際、後段のパイプラインが複雑なため（例: `GROUP BY` を伴う `MATERIALIZED VIEW`）`Memory limit exceeded` などのエラーが発生して失敗する場合があります。この場合、単純なリトライでは問題は解決せず（そのテーブルの分散送信が詰まってしまいます）が、そのバッチに含まれるファイルを 1 件ずつ送信すると INSERT が成功する場合があります。

そのため、この設定を `1` に設定すると、そのようなバッチについてはバッチ化を行わなくなります（つまり、失敗したバッチに対して一時的に `distributed_background_insert_batch` を無効化します）。

可能な値:

- 1 — 有効。
- 0 — 無効。

:::note
この設定は、破損したバッチ（[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンに対して `fsync_after_insert` / `fsync_directories` が行われず、サーバー（マシン）の異常終了により発生することがあります）にも影響します。
:::

:::note
自動バッチ分割に依存すべきではありません。パフォーマンスを低下させる可能性があります。
:::

## distributed_background_insert_timeout {#distributed_background_insert_timeout} 

**別名**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Distributed テーブルへの挿入クエリのタイムアウト。`insert_distributed_sync` が有効な場合にのみ使用されます。値が 0 の場合はタイムアウトなしを意味します。

## distributed_cache_alignment {#distributed_cache_alignment} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "distributed_cache_read_alignment の名前変更"}]}]}/>

ClickHouse Cloud でのみ有効です。テスト目的のための設定であり、変更しないでください。

## distributed_cache_bypass_connection_pool {#distributed_cache_bypass_connection_pool} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュの接続プールをバイパスできるようにします。

## distributed_cache_connect_backoff_max_ms {#distributed_cache_connect_backoff_max_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache の接続確立時に適用される最大バックオフ時間（ミリ秒）です。

## distributed_cache_connect_backoff_min_ms {#distributed_cache_connect_backoff_min_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続を確立する際の最小バックオフ時間（ミリ秒単位）です。

## distributed_cache_connect_max_tries {#distributed_cache_connect_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "設定値を変更"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Cloud 専用"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効。分散キャッシュへの接続に失敗した場合に行う再試行回数。

## distributed_cache_connect_timeout_ms {#distributed_cache_connect_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続時のタイムアウトです。

## distributed_cache_credentials_refresh_period_seconds {#distributed_cache_credentials_refresh_period_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

ClickHouse Cloud でのみ有効です。認証情報の更新間隔を指定します。

## distributed_cache_data_packet_ack_window {#distributed_cache_data_packet_ack_window} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の distributed cache 読み取りリクエスト内での DataPacket シーケンスに対して ACK を送信するためのウィンドウサイズです。

## distributed_cache_discard_connection_if_unread_data {#distributed_cache_discard_connection_if_unread_data} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。未読みのデータがある場合に接続を破棄します。

## distributed_cache_fetch_metrics_only_from_current_az {#distributed_cache_fetch_metrics_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_metrics および system.distributed_cache_events から、現在のアベイラビリティゾーンに関するメトリクスのみを取得します。

## distributed_cache_log_mode {#distributed_cache_log_mode} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_log への書き込みモードを指定します。

## distributed_cache_max_unacked_inflight_packets {#distributed_cache_max_unacked_inflight_packets} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の distributed cache 読み取りリクエストで許可される、未確認応答 (ACK) の in-flight パケット数の最大値を指定します。

## distributed_cache_min_bytes_for_seek {#distributed_cache_min_bytes_for_seek} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい非公開設定です。"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ内でシークを行うための最小バイト数です。

## distributed_cache_pool_behaviour_on_limit {#distributed_cache_pool_behaviour_on_limit} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。プールの上限に達したときの分散キャッシュ接続の動作を指定します。

## distributed_cache_prefer_bigger_buffer_size {#distributed_cache_prefer_bigger_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem_cache_prefer_bigger_buffer_size と同様ですが、分散キャッシュ（distributed cache）用です。

## distributed_cache_read_only_from_current_az {#distributed_cache_read_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。現在のアベイラビリティゾーン内のキャッシュサーバーからのみ読み取るように制限します。無効にすると、すべてのアベイラビリティゾーン内のすべてのキャッシュサーバーから読み取りが行われます。

## distributed_cache_read_request_max_tries {#distributed_cache_read_request_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "設定値の変更"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ要求が失敗した場合に再試行を行う最大回数。

## distributed_cache_receive_response_wait_milliseconds {#distributed_cache_receive_response_wait_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。リクエストに対して分散キャッシュからデータを受信するまでの待機時間（ミリ秒単位）です。

## distributed_cache_receive_timeout_milliseconds {#distributed_cache_receive_timeout_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュから何らかの応答を受信するまでの待機時間（ミリ秒単位）です。

## distributed_cache_receive_timeout_ms {#distributed_cache_receive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーからデータを受信する際のタイムアウト時間（ミリ秒単位）です。この時間内に 1 バイトも受信されなかった場合、例外がスローされます。

## distributed_cache_send_timeout_ms {#distributed_cache_send_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへのデータ送信タイムアウトをミリ秒で指定します。クライアントがデータを送信する必要があるにもかかわらず、この時間内に 1 バイトも送信できない場合は、例外がスローされます。

## distributed_cache_tcp_keep_alive_timeout_ms {#distributed_cache_tcp_keep_alive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ効果があります。TCP が keepalive プローブの送信を開始するまで、distributed cache サーバーへの接続をアイドル状態のまま維持する必要がある時間（ミリ秒）を指定します。

## distributed_cache_throw_on_error {#distributed_cache_throw_on_error} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache との通信中に発生した例外、または distributed cache から受信した例外を再スローします。それ以外の場合は、エラー時に distributed cache をスキップするフォールバック動作になります。

## distributed_cache_wait_connection_from_pool_milliseconds {#distributed_cache_wait_connection_from_pool_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed_cache_pool_behaviour_on_limit が wait に設定されている場合に、接続プールから接続を取得できるまでの待機時間（ミリ秒単位）を指定します。

## distributed_connections_pool_size {#distributed_connections_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

単一の分散テーブルに対するすべてのクエリを分散処理する際に、リモートサーバーとの間で同時に確立できる接続の最大数です。クラスター内のサーバー数以上の値に設定することを推奨します。

## distributed_ddl_entry_format_version {#distributed_ddl_entry_format_version} 

<SettingsInfoBlock type="UInt64" default_value="5" />

分散 DDL（`ON CLUSTER`）クエリの互換性バージョン

## distributed_ddl_output_mode {#distributed_ddl_output_mode} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

分散 DDL クエリ結果の形式を設定します。

指定可能な値:

- `throw` — クエリが完了したすべてのホストに対するクエリ実行ステータスを含む結果セットを返します。クエリが一部のホストで失敗した場合、最初の例外を再スローします。クエリが一部のホストでまだ完了しておらず、[distributed_ddl_task_timeout](#distributed_ddl_task_timeout) を超過した場合、`TIMEOUT_EXCEEDED` 例外をスローします。
- `none` — `throw` に似ていますが、分散 DDL クエリは結果セットを返しません。
- `null_status_on_timeout` — クエリが対応するホストで完了していない場合でも `TIMEOUT_EXCEEDED` をスローする代わりに、結果セットの一部の行の実行ステータスとして `NULL` を返します。
- `never_throw` — `TIMEOUT_EXCEEDED` をスローせず、クエリが一部のホストで失敗しても例外を再スローしません。
- `none_only_active` - `none` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。注意: このモードでは、クエリが一部のレプリカで実行されておらず、バックグラウンドで実行されることを判別できません。
- `null_status_on_timeout_only_active` — `null_status_on_timeout` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。
- `throw_only_active` — `throw` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。

Cloud のデフォルト値: `throw`。

## distributed_ddl_task_timeout {#distributed_ddl_task_timeout} 

<SettingsInfoBlock type="Int64" default_value="180" />

クラスタ内のすべてのホストからの DDL クエリ応答に対するタイムアウト値を設定します。DDL リクエストがすべてのホストで実行されなかった場合、応答にはタイムアウトエラーが含まれ、リクエストは非同期モードで実行されます。負の値を指定すると、タイムアウトは無制限になります。

指定可能な値:

- 正の整数。
- 0 — 非同期モード。
- 負の整数 — 無制限のタイムアウト。

## distributed_foreground_insert {#distributed_foreground_insert} 

**別名**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

[Distributed](/engines/table-engines/special/distributed) テーブルへの同期的なデータ挿入を有効または無効にします。

デフォルトでは、`Distributed` テーブルにデータを挿入する際、ClickHouse サーバーはクラスターのノードへデータをバックグラウンドモードで送信します。`distributed_foreground_insert=1` の場合、データは同期的に処理され、すべてのデータがすべての分片上（`internal_replication` が true の場合は、各分片につき少なくとも 1 つのレプリカ）に保存された後にのみ `INSERT` 操作が成功します。

設定可能な値:

- `0` — データはバックグラウンドモードで挿入されます。
- `1` — データは同期モードで挿入されます。

Cloud でのデフォルト値: `0`。

**関連項目**

- [Distributed Table Engine](/engines/table-engines/special/distributed)
- [Managing Distributed Tables](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge {#distributed_group_by_no_merge}

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリ処理において、異なるサーバーからの集約状態をマージしません。分片ごとに異なるキーが存在することが確実な場合に使用できます。

Possible values:

* `0` — 無効（最終的なクエリ処理はイニシエーターノードで行われます）。
* `1` - 分散クエリ処理において、異なるサーバーからの集約状態をマージしません（クエリは各分片上で完全に処理され、イニシエーターノードはデータを中継するだけです）。分片ごとに異なるキーが存在することが確実な場合に使用できます。
* `2` - `1` と同じですが、イニシエーターノード側で `ORDER BY` と `LIMIT` を適用します（`distributed_group_by_no_merge=1` のように、クエリがリモートノード上で完全に処理される場合にはこれは不可能です）。`ORDER BY` および/または `LIMIT` を含むクエリで使用できます。

**Example**

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


## distributed_insert_skip_read_only_replicas {#distributed_insert_skip_read_only_replicas} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "true の場合、Distributed への INSERT で read-only レプリカをスキップします"}]}]}/>

Distributed への INSERT クエリで read-only レプリカをスキップするかどうかを制御します。

取りうる値:

- 0 — INSERT を通常どおり実行し、read-only レプリカに送信された場合は失敗します
- 1 — イニシエータはデータを分片に送信する前に read-only レプリカをスキップします。

## distributed_plan_default_reader_bucket_count {#distributed_plan_default_reader_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定。"}]}]}/>

分散クエリで並列読み込みを行う際のデフォルトのタスク数。タスクは複数のレプリカ間に割り振られます。

## distributed_plan_default_shuffle_join_bucket_count {#distributed_plan_default_shuffle_join_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "実験的な新機能の設定。"}]}]}/>

分散シャッフルハッシュ結合におけるバケット数のデフォルト値。

## distributed_plan_execute_locally {#distributed_plan_execute_locally} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランのすべてのタスクをローカルで実行します。テストやデバッグ用途に有用です。

## distributed_plan_force_exchange_kind {#distributed_plan_force_exchange_kind} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "新しい実験的な設定。"}]}]}/>

分散クエリのステージ間で、指定した種類の Exchange 演算子の使用を強制します。

設定可能な値:

- '' - いかなる種類の Exchange 演算子も強制せず、オプティマイザに選択を任せる
 - 'Persisted' - オブジェクトストレージ内の一時ファイルを使用する
 - 'Streaming' - ネットワーク経由で Exchange データをストリーミングする

## distributed_plan_force_shuffle_aggregation {#distributed_plan_force_shuffle_aggregation} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

分散クエリプランでは、PartialAggregation + Merge の代わりに Shuffle 集約戦略を使用します。

## distributed_plan_max_rows_to_broadcast {#distributed_plan_max_rows_to_broadcast} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新しい実験的な設定。"}]}]}/>

分散クエリプランにおいて、シャッフル結合ではなくブロードキャスト結合を使用するための最大行数。

## distributed_plan_optimize_exchanges {#distributed_plan_optimize_exchanges} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランから不要な exchange を削除します。デバッグ時には無効にしてください。

## distributed_product_mode {#distributed_product_mode} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

[分散サブクエリ](../../sql-reference/operators/in.md) の動作を変更します。

クエリに分散テーブルの積（product）が含まれる場合、つまり分散テーブルに対するクエリの中に、その分散テーブルに対する non-GLOBAL なサブクエリが含まれている場合に、ClickHouse はこの設定を適用します。

制約:

- IN および JOIN サブクエリに対してのみ適用されます。
- FROM 句で、複数の分片を含む分散テーブルを使用している場合にのみ適用されます。
- サブクエリの対象が、複数の分片を含む分散テーブルである場合にのみ適用されます。
- テーブル値 [remote](../../sql-reference/table-functions/remote.md) 関数には使用されません。

取り得る値:

- `deny` — デフォルト値。これらのタイプのサブクエリの使用を禁止します（"Double-distributed in/JOIN subqueries is denied" という例外を返します）。
- `local` — サブクエリ内のデータベースおよびテーブルを、宛先サーバー（分片）のローカルなものに置き換え、通常の `IN`/`JOIN` のままにします。
- `global` — `IN`/`JOIN` クエリを `GLOBAL IN`/`GLOBAL JOIN` に置き換えます。
- `allow` — これらのタイプのサブクエリの使用を許可します。

## distributed_push_down_limit {#distributed_push_down_limit} 

<SettingsInfoBlock type="UInt64" default_value="1" />

[LIMIT](#limit) を各分片ごとに個別に適用するかどうかを有効または無効にします。

これにより、次のことを回避できます。

- 余分な行をネットワーク経由で送信すること。
- イニシエータ側で LIMIT より後ろの行を処理すること。

バージョン 21.9 以降では、`distributed_push_down_limit` は、次のいずれかの条件が満たされる場合にのみクエリ実行を変更するため、結果が不正確になることはありません。

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0 の場合。
- クエリに `GROUP BY` / `DISTINCT` / `LIMIT BY` が **なく**、`ORDER BY` / `LIMIT` がある場合。
- クエリに `GROUP BY` / `DISTINCT` / `LIMIT BY` と `ORDER BY` / `LIMIT` が **あり**、かつ次の条件を満たす場合:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効になっている。
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) が有効になっている。

可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap {#distributed_replica_error_cap} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 型: 符号なし整数
- デフォルト値: 1000

各レプリカのエラー数はこの値で上限が設定され、単一のレプリカが過度に多くのエラーを蓄積することを防ぎます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life {#distributed_replica_error_half_life} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- 種類: 秒
- デフォルト値: 60 秒

分散テーブルにおけるエラー数がどれくらいの速さでゼロにリセットされるかを制御します。あるレプリカがしばらくの間利用できず、エラーが 5 回分蓄積されていて、distributed_replica_error_half_life が 1 秒に設定されている場合、そのレプリカは最後のエラー発生から 3 秒後に正常と見なされます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors {#distributed_replica_max_ignored_errors} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- 型: unsigned int
- デフォルト値: 0

レプリカ選択時に、`load_balancing` アルゴリズムに従って無視されるエラーの数。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final {#do_not_merge_across_partitions_select_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

`SELECT FINAL` の実行時に、同一パーティション内のパーツのみをマージします

## empty_result_for_aggregation_by_constant_keys_on_empty_set {#empty_result_for_aggregation_by_constant_keys_on_empty_set} 

<SettingsInfoBlock type="Bool" default_value="1" />

空の集合に対して定数キーで集約を行う場合は、空の結果を返します。

## empty_result_for_aggregation_by_empty_set {#empty_result_for_aggregation_by_empty_set} 

<SettingsInfoBlock type="Bool" default_value="0" />

空の集合に対してキーなしで集約を行う場合は、空の結果を返します。

## enable_adaptive_memory_spill_scheduler {#enable_adaptive_memory_spill_scheduler} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定。メモリーデータを外部ストレージへアダプティブにスピルします。"}]}]}/>

プロセッサーがデータを外部ストレージにアダプティブにスピルするようにトリガーします。現在は Grace Join がサポートされています。

## enable_add_distinct_to_in_subqueries {#enable_add_distinct_to_in_subqueries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "分散 IN サブクエリで転送される一時テーブルのサイズを削減するための新しい設定。"}]}]}/>

`IN` サブクエリで `DISTINCT` を有効にします。これはトレードオフとなる設定です。有効にすると、分散 IN サブクエリで転送される一時テーブルのサイズを大幅に削減でき、一意な値のみを送信することで、分片間のデータ転送を大きく高速化できます。
ただし、この設定を有効化すると、各ノードでマージ処理の負荷が追加され、重複排除（DISTINCT）を実行する必要があります。ネットワーク転送がボトルネックとなっており、その追加のマージコストを許容できる場合に、この設定を使用してください。

## enable_blob_storage_log {#enable_blob_storage_log} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込みます"}]}]}/>

BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込みます

## enable_deflate_qpl_codec {#enable_deflate_qpl_codec} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、DEFLATE_QPL コーデックを使用してカラムを圧縮できます。

## enable_early_constant_folding {#enable_early_constant_folding} 

<SettingsInfoBlock type="Bool" default_value="1" />

関数およびサブクエリの結果を分析し、そこに定数がある場合にクエリを書き換えるクエリ最適化を有効にします。

## enable_extended_results_for_datetime_functions {#enable_extended_results_for_datetime_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` 型と比較して拡張された範囲を持つ `Date32` 型、
または `DateTime` 型と比較して拡張された範囲を持つ `DateTime64` 型で結果を返すかどうかを有効または無効にします。

設定可能な値:

- `0` — すべての種類の引数に対して、関数は `Date` または `DateTime` を返します。
- `1` — 関数は `Date32` または `DateTime64` の引数に対しては `Date32` または `DateTime64` を返し、それ以外の場合は `Date` または `DateTime` を返します。

以下の表は、各種日時関数に対するこの設定の動作を示します。

| 機能                        | `enable_extended_results_for_datetime_functions = 0`             | `enable_extended_results_for_datetime_functions = 1`                                                                 |
| ------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返す       |
| `toStartOfISOYear`        | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返す       |
| `toStartOfQuarter`        | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` を返します |
| `toStartOfMonth`          | `Date` または `DateTime` を返します。                                     | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返します   |
| `toStartOfWeek`           | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` を入力とした場合、`Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合、`Date32`/`DateTime64` を返す       |
| `toLastDayOfWeek`         | `Date` 型または `DateTime` 型を返す                                      | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返す     |
| `toLastDayOfMonth`        | `Date` 型または `DateTime` 型を返します                                    | `Date`/`DateTime` を入力した場合は `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` を入力した場合は `Date32`/`DateTime64` を返します   |
| `toMonday`                | `Date` または `DateTime` を返します                                      | 入力が `Date`/`DateTime` の場合、`Date`/`DateTime` を返します<br />入力が `Date32`/`DateTime64` の場合、`Date32`/`DateTime64` を返します     |
| `toStartOfDay`            | `DateTime` を返します<br />*注: 1970～2149 年の範囲外の値に対しては誤った結果が返されます*     | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                     |
| `toStartOfHour`           | `DateTime` を返します<br />*注意: 1970～2149 年の範囲外の値では誤った結果が返されます*       | `Date`/`DateTime` 型の入力に対して `DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対して `DateTime64` 型を返します                 |
| `toStartOfFifteenMinutes` | `DateTime` を返します<br />*注意: 1970〜2149 の範囲外の値の場合、誤った結果になります*       | `Date`/`DateTime` 型の入力に対して `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `DateTime64` を返します                   |
| `toStartOfTenMinutes`     | Returns `DateTime`<br />*注意: 1970〜2149年の範囲外の値では誤った結果になる可能性があります* | `Date`/`DateTime` 型の入力に対して `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `DateTime64` を返します                   |
| `toStartOfFiveMinutes`    | Returns `DateTime`<br />*注意: 1970〜2149 年の範囲外の値では誤った結果が返されます*     | `Date`/`DateTime` 型の入力に対しては `DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返します                 |
| `toStartOfMinute`         | `DateTime` を返します<br />*注: 1970～2149 年の範囲外の値では誤った結果が返されます*        | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                     |
| `timeSlot`                | Returns `DateTime`<br />*注意: 1970〜2149年の範囲外の値では誤った結果になります*       | `Date`/`DateTime` の入力に対しては `DateTime` を返します<br />`Date32`/`DateTime64` の入力に対しては `DateTime64` を返します                   |

## enable_filesystem_cache {#enable_filesystem_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムに対してキャッシュを使用します。この設定自体はディスクのキャッシュの有効／無効を切り替えるものではなく（それはディスク設定で行う必要があります）が、必要に応じて一部のクエリでキャッシュをバイパスできるようにします。

## enable_filesystem_cache_log {#enable_filesystem_cache_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

各クエリのファイルシステムキャッシュログを記録できるようにします。

## enable_filesystem_cache_on_write_operations {#enable_filesystem_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

`write-through` キャッシュを有効または無効にします。`false` に設定すると、書き込み操作に対して `write-through` キャッシュが無効になります。`true` に設定すると、サーバー設定のキャッシュディスク構成セクションで `cache_on_write_operations` が有効になっている限り、`write-through` キャッシュが有効になります。
詳細については ["Using local cache"](/operations/storing-data#using-local-cache) を参照してください。

## enable_filesystem_read_prefetches_log {#enable_filesystem_read_prefetches_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの実行中に、`system.filesystem` の `prefetch_log` にログを記録します。テストやデバッグ目的に限って使用してください。デフォルトで有効化することは推奨されません。

## enable_global_with_statement {#enable_global_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "WITH 文を UNION クエリおよびすべてのサブクエリにもデフォルトで適用"}]}]}/>

WITH 文を UNION クエリおよびすべてのサブクエリにも適用する

## enable_hdfs_pread {#enable_hdfs_pread} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

HDFS ファイルに対して pread を有効または無効にします。デフォルトでは `hdfsPread` が使用されます。無効化した場合は、`hdfsRead` と `hdfsSeek` を使用して HDFS ファイルが読み込まれます。

## enable_http_compression {#enable_http_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一般的に有益です"}]}]}/>

HTTP リクエストに対する応答で、データ圧縮を有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## enable_job_stack_trace {#enable_job_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パフォーマンスへの影響を避けるため、デフォルトで無効になりました。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "ジョブのスケジューリングからスタックトレースを収集することを有効にします。パフォーマンスへの影響を避けるため、デフォルトで無効です。"}]}]}/>

ジョブが例外を発生させた場合に、そのジョブの作成元のスタックトレースを出力します。パフォーマンスへの影響を避けるため、デフォルトで無効です。

## enable_join_runtime_filters {#enable_join_runtime_filters} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

実行時に右側から収集した JOIN キーの集合を使って、左側をフィルタリングします。

## enable_lazy_columns_replication {#enable_lazy_columns_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "デフォルトで JOIN および ARRAY JOIN における遅延カラムレプリケーションを有効化"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "JOIN および ARRAY JOIN で遅延カラムレプリケーションを有効化するための設定を追加"}]}]}/>

JOIN および ARRAY JOIN において遅延カラムレプリケーションを有効化します。同じ行をメモリ上で何度もコピーする不要な処理を回避できます。

## enable_lightweight_delete {#enable_lightweight_delete} 

**別名**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルに対して、論理削除を行う DELETE ミューテーションを有効にします。

## enable_lightweight_update {#enable_lightweight_update} 

<BetaBadge/>

**エイリアス**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "論理更新は Beta 段階に移行されました。SETTING 'allow_experimental_lightweight_update' のエイリアスが追加されました。"}]}]}/>

論理更新機能を有効にします。

## enable_memory_bound_merging_of_aggregation_results {#enable_memory_bound_merging_of_aggregation_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約に対してメモリ上限に基づくマージ戦略を有効にします。

## enable_multiple_prewhere_read_steps {#enable_multiple_prewhere_read_steps} 

<SettingsInfoBlock type="Bool" default_value="1" />

複数の条件が AND で結合されている場合、より多くの条件を WHERE から PREWHERE に移動し、ディスクからの読み取りとフィルタリング処理を複数の段階に分けて実行します

## enable_named_columns_in_function_tuple {#enable_named_columns_in_function_tuple} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "すべての名前が一意であり、引用符なしの識別子として扱える場合に、tuple() 関数内で名前付きタプルを生成します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "ユーザビリティの改善が行われるまで無効化されています。"}]}]}/>

すべての名前が一意であり、引用符なしの識別子として扱える場合に、tuple() 関数内で名前付きタプルを生成します。

## enable_optimize_predicate_expression {#enable_optimize_predicate_expression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

`SELECT` クエリにおいて、述語プッシュダウンを有効にします。

述語プッシュダウンにより、分散クエリでのネットワークトラフィックを大幅に削減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

使用例

次のクエリを考えてみます:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1` の場合、ClickHouse はサブクエリを処理するときに `WHERE` をサブクエリに適用するため、これら 2 つのクエリの実行時間は同じになります。

`enable_optimize_predicate_expression = 0` の場合、2 番目のクエリの実行時間は、サブクエリの処理が完了した後にすべてのデータに対して `WHERE` 句が適用されるため、はるかに長くなります。

## enable_optimize_predicate_expression_to_final_subquery {#enable_optimize_predicate_expression_to_final_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

述語を最終サブクエリにプッシュダウンできるようにします。

## enable&#95;order&#95;by&#95;all {#enable_order_by_all}

<SettingsInfoBlock type="Bool" default_value="1" />

`ORDER BY ALL` 構文を使用したソートを有効または無効にします。詳細は [ORDER BY](../../sql-reference/statements/select/order-by.md) を参照してください。

指定可能な値:

* 0 — ORDER BY ALL を無効にします。
* 1 — ORDER BY ALL を有効にします。

**例**

クエリ:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- ALL が曖昧であるというエラーを返します

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


## enable_parallel_blocks_marshalling {#enable_parallel_blocks_marshalling} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "新しい設定"}]}]}/>

分散クエリにのみ影響します。この設定を有効にすると、ブロックはイニシエータへ送信する前後に、パイプラインスレッド上で（デフォルトよりも高い並列度で）シリアライズ／デシリアライズおよび圧縮／解凍されます。

## enable_parsing_to_custom_serialization {#enable_parsing_to_custom_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、テーブルで定義されたシリアライゼーション設定に基づき、データをカスタムシリアライゼーションを使用するカラム（例: スパース）へ直接パースできます。

## enable&#95;positional&#95;arguments {#enable_positional_arguments}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "位置引数機能をデフォルトで有効化"}]}]} />

[GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) 文に対する位置引数のサポートを有効または無効にします。

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

結果:

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```


## enable_producing_buckets_out_of_order_in_aggregation {#enable_producing_buckets_out_of_order_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

メモリ効率の良い集約（`distributed_aggregation_memory_efficient` を参照）が、バケットを順不同で生成できるようにします。
集約バケットのサイズ分布が偏っている場合、より低い id の重いバケットをまだ処理している間に、レプリカがより高い id のバケットをイニシエータに送信できるようにすることで、パフォーマンスが向上する可能性があります。
欠点として、メモリ使用量が増加する可能性があります。

## enable_reads_from_query_cache {#enable_reads_from_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) から取得されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_s3_requests_logging {#enable_s3_requests_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

非常に詳細な S3 リクエストのログ記録を有効にします。デバッグ用途にのみ適しています。

## enable_scalar_subquery_optimization {#enable_scalar_subquery_optimization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "Prevent scalar subqueries from (de)serializing large scalar values and possibly avoid running the same subquery more than once"}]}]}/>

true に設定されている場合、スカラーサブクエリによる大きなスカラー値のシリアライズやデシリアライズを防ぎ、同じサブクエリを複数回実行せずに済む可能性があります。

## enable_scopes_for_with_statement {#enable_scopes_for_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "古いアナライザーとの後方互換性を維持するための新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "古いアナライザーとの後方互換性を維持するための新しい設定。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "古いアナライザーとの後方互換性を維持するための新しい設定。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "古いアナライザーとの後方互換性を維持するための新しい設定。"}]}]}/>

無効化すると、親の WITH 句内の宣言は、現在のスコープで宣言されたものと同じスコープとして扱われます。

これは、新しいアナライザーにおける互換性用の設定であり、古いアナライザーでは実行できていた一部の不正なクエリを実行できるようにするためのものです。

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query {#enable_shared_storage_snapshot_in_query}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でストレージスナップショットを共有する新しい設定"}]}]} />

有効化すると、1 つのクエリ内のすべてのサブクエリは、各テーブルに対して同じ StorageSnapshot を共有します。
これにより、同じテーブルに複数回アクセスする場合でも、クエリ全体でデータの一貫したビューが保証されます。

これは、データパーツの内部一貫性が重要となるクエリで必要になります。例:

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

この設定を有効にしない場合、外側クエリと内側クエリが異なるデータスナップショットに対して動作し、不正確な結果につながる可能性があります。

:::note
この設定を有効にすると、クエリプランニング段階が完了した後にスナップショットから不要なデータパーツを削除する最適化が無効化されます。
その結果、実行時間の長いクエリは実行中ずっと古いパーツを保持し続ける可能性があり、パーツのクリーンアップが遅れてストレージへの負荷が増大することがあります。

この設定は現在、MergeTree ファミリーのテーブルにのみ適用されます。
:::

取り得る値:

* 0 - 無効
* 1 - 有効


## enable_sharing_sets_for_mutations {#enable_sharing_sets_for_mutations} 

<SettingsInfoBlock type="Bool" default_value="1" />

同じ mutation 内の異なるタスク間で、IN サブクエリ用に構築された set オブジェクトを共有できるようにします。これにより、メモリ使用量と CPU 使用量が削減されます。

## enable_software_prefetch_in_aggregation {#enable_software_prefetch_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約処理でソフトウェアプリフェッチを有効にします

## enable_time_time64_type {#enable_time_time64_type} 

**エイリアス**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定です。新しい実験的な Time および Time64 データ型の使用を許可します。"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Time および Time64 型をデフォルトで有効にします。"}]}]}/>

[Time](../../sql-reference/data-types/time.md) データ型および [Time64](../../sql-reference/data-types/time64.md) データ型の作成を許可します。

## enable_unaligned_array_join {#enable_unaligned_array_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

異なるサイズの複数の配列に対して ARRAY JOIN を許可します。この設定を有効にすると、配列は最も長い配列の長さに自動的に揃えられます。

## enable_url_encoding {#enable_url_encoding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "既存の設定のデフォルト値を変更"}]}]}/>

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、URI のパスのデコード／エンコードを有効／無効にします。

デフォルトでは無効です。

## enable_vertical_final {#enable_vertical_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "バグ修正後、デフォルトで vertical final を再び有効化"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "デフォルトで vertical final を使用"}]}]}/>

有効にすると、FINAL 実行時に行をマージするのではなく、重複した行を削除済みとしてマークし、後続のフィルタリングで除外します。

## enable_writes_to_query_cache {#enable_writes_to_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果が[クエリキャッシュ](../query-cache.md)に保存されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_zstd_qat_codec {#enable_zstd_qat_codec} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "新しい ZSTD_QAT コーデックを追加"}]}]}/>

有効にすると、カラムの圧縮に ZSTD_QAT コーデックを使用できます。

## enforce_strict_identifier_format {#enforce_strict_identifier_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

有効にすると、英数字とアンダースコアだけから成る識別子のみが許可されます。

## engine_file_allow_create_multiple_files {#engine_file_allow_create_multiple_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

フォーマットにサフィックス（`JSON`、`ORC`、`Parquet` など）がある場合に、File エンジンのテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを制御します。有効にすると、各 `INSERT` のたびに次のパターンに従う名前で新しいファイルが作成されます。

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` など。

取りうる値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## engine_file_empty_if_not_exists {#engine_file_empty_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

基となるファイルが存在しない場合でも、File エンジンのテーブルからデータを `SELECT` できるようにします。

取り得る値:

- 0 — `SELECT` は例外をスローします。
- 1 — `SELECT` は空の結果を返します。

## engine_file_skip_empty_files {#engine_file_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルで、空のファイルをスキップする動作を有効化／無効化します。

設定値:

- 0 — 空のファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## engine_file_truncate_on_insert {#engine_file_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルで、INSERT 実行前にファイルをトランケートするかどうかを制御します。

可能な値:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

## engine_url_skip_empty_files {#engine_url_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、空のファイルをスキップするかどうかを制御します。

可能な値:

- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## except_default_mode {#except_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

EXCEPT クエリにおけるデフォルトモードを設定します。指定可能な値: 空文字列、'ALL'、'DISTINCT'。空文字列を指定した場合、モードを指定しないクエリは例外をスローします。

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert {#exclude_materialize_skip_indexes_on_insert}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定です。"}]}]} />

指定したスキップ索引を、INSERT 時に構築および保存する対象から除外します。除外されたスキップ索引は、[マージ処理中](merge-tree-settings.md/#materialize_skip_indexes_on_merge)、または明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリによって引き続き構築および保存されます。

[materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) が false の場合は効果がありません。

例：

```sql
CREATE TABLE tab
(
    a UInt64,
    b UInt64,
    INDEX idx_a a TYPE minmax,
    INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple();

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a は挿入時に更新されません
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- どちらのインデックスも挿入時に更新されません

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- idx_b のみが更新されます

-- セッション設定のため、クエリレベルで設定可能です
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- このクエリを使用してインデックスを明示的にマテリアライズできます

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- 設定をデフォルトにリセット
```


## execute_exists_as_scalar_subquery {#execute_exists_as_scalar_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

相関のない `EXISTS` サブクエリをスカラサブクエリとして実行します。スカラサブクエリと同様にキャッシュが使用され、結果には定数畳み込みが適用されます。

## external_storage_connect_timeout_sec {#external_storage_connect_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="10" />

接続タイムアウト（秒単位）。現在は MySQL に対してのみサポートされています

## external_storage_max_read_bytes {#external_storage_max_read_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取るバイト数の上限を制限します。現在は MySQL テーブルエンジン、データベースエンジン、および Dictionary に対してのみサポートされています。0 の場合、この設定は無効になります。

## external_storage_max_read_rows {#external_storage_max_read_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取る最大行数を制限します。現在は MySQL テーブルエンジン、データベースエンジン、および Dictionary のみに対応しています。0 の場合、この設定は無効になります。

## external_storage_rw_timeout_sec {#external_storage_rw_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

読み取り/書き込みタイムアウト（秒単位）。現在は MySQL でのみサポートされています。

## external_table_functions_use_nulls {#external_table_functions_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

[mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md)、および [odbc](../../sql-reference/table-functions/odbc.md) テーブル関数における Nullable カラムの扱いを定義します。

設定値:

- 0 — テーブル関数が Nullable カラムを明示的に使用します。
- 1 — テーブル関数が Nullable カラムを暗黙的に使用します。

**使用方法**

`0` に設定されている場合、テーブル関数は Nullable カラムを作成せず、NULL の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

## external_table_strict_query {#external_table_strict_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、外部テーブルへのクエリで式をローカルフィルタに変換することはできません。

## extract_key_value_pairs_max_pairs_per_row {#extract_key_value_pairs_max_pairs_per_row} 

**Aliases**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "extractKeyValuePairs 関数によって生成されるペアの最大数。メモリの過度な消費を防ぐための安全策として使用されます。"}]}]}/>

`extractKeyValuePairs` 関数によって生成されるペアの最大数。メモリの過度な消費を防ぐための安全策として使用されます。

## extremes {#extremes} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ結果のカラム内における極値（最小値および最大値）を集計するかどうかを指定します。0 または 1 を指定できます。デフォルトは 0（無効）です。
詳細については、「Extreme values」セクションを参照してください。

## fallback_to_stale_replicas_for_distributed_queries {#fallback_to_stale_replicas_for_distributed_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

更新されたデータが利用できない場合に、クエリを古いレプリカへ強制的に送信します。詳細は [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

ClickHouse は、テーブルの古いレプリカの中から最も適切なものを選択します。

レプリケーションされているテーブルを参照する分散テーブルに対して `SELECT` を実行する場合に使用されます。

デフォルトは 1（有効）です。

## filesystem_cache_allow_background_download {#filesystem_cache_allow_background_download} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "ファイルシステムキャッシュにおけるクエリ単位のバックグラウンドダウンロードを制御する新しい設定。"}]}]}/>

リモートストレージから読み取られたデータについて、ファイルシステムキャッシュがバックグラウンドダウンロードをキューイングできるようにします。無効にすると、現在のクエリ／セッションではダウンロードはフォアグラウンドで実行されます。

## filesystem_cache_boundary_alignment {#filesystem_cache_boundary_alignment} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Filesystem キャッシュの境界アラインメントを指定します。この設定はディスクを伴わない読み取りにのみ適用されます（たとえば、リモートテーブルエンジンやテーブル関数のキャッシュには適用されますが、MergeTree テーブルのストレージ構成には適用されません）。値が 0 の場合はアラインメントを行いません。

## filesystem_cache_enable_background_download_during_fetch {#filesystem_cache_enable_background_download_during_fetch} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem cache で領域を予約するためにキャッシュをロックして待機する時間です。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage {#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

この設定は ClickHouse Cloud でのみ有効です。filesystem cache で領域を予約するためにキャッシュをロックする際の待機時間。

## filesystem_cache_max_download_size {#filesystem_cache_max_download_size} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

単一のクエリでダウンロードできるリモートファイルシステムキャッシュの最大サイズ

## filesystem_cache_name {#filesystem_cache_name} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "ステートレスなテーブルエンジンまたはデータレイクに使用するファイルシステムキャッシュ名"}]}]}/>

ステートレスなテーブルエンジンまたはデータレイクに使用するファイルシステムキャッシュ名

## filesystem_cache_prefer_bigger_buffer_size {#filesystem_cache_prefer_bigger_buffer_size} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

filesystem cache が有効な場合、小さなファイルセグメントの書き込みを避けて cache のパフォーマンス低下を防ぐため、より大きなバッファサイズを優先して使用します。一方で、この設定を有効にするとメモリ使用量が増加する可能性があります。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds {#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "ファイルシステムキャッシュで領域を確保するためにキャッシュをロックする際の待機時間"}]}]}/>

ファイルシステムキャッシュで領域を確保するためにキャッシュをロックする際の待機時間

## filesystem_cache_segments_batch_size {#filesystem_cache_segments_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="20" />

1 回のバッチで読み取りバッファーがキャッシュから要求できるファイルセグメントのサイズ上限。値が小さすぎるとキャッシュへのリクエストが過剰になり、大きすぎるとキャッシュからの削除処理が遅くなる可能性があります。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit {#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit} 

**エイリアス**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "設定 skip_download_if_exceeds_query_cache_limit の名称変更"}]}]}/>

クエリキャッシュサイズを超える場合は、リモートファイルシステムからのダウンロードをスキップします。

## filesystem_prefetch_max_memory_usage {#filesystem_prefetch_max_memory_usage} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

プリフェッチに使用できるメモリの最大量。

## filesystem_prefetch_step_bytes {#filesystem_prefetch_step_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

プリフェッチのステップサイズ（バイト単位）。ゼロは `auto` を意味し、おおよそ最適なプリフェッチステップが自動的に決定されますが、必ずしも 100% 最適とは限りません。実際に使用される値は、`filesystem_prefetch_min_bytes_for_single_read_task` の設定によって異なる場合があります。

## filesystem_prefetch_step_marks {#filesystem_prefetch_step_marks} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マーク単位でのプリフェッチステップを指定します。0 は `auto` を意味します。`auto` の場合、おおよそ最適なプリフェッチステップが自動的に推定されますが、必ずしも 100% 最適になるとは限りません。実際に使用される値は、`filesystem_prefetch_min_bytes_for_single_read_task` 設定により異なる場合があります。

## filesystem_prefetches_limit {#filesystem_prefetches_limit} 

<SettingsInfoBlock type="UInt64" default_value="200" />

プリフェッチの最大数。0 は無制限を意味します。プリフェッチを制限したい場合は、`filesystem_prefetches_max_memory_usage` の設定を使用することをより推奨します。

## final {#final}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のテーブルのうち、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) が適用可能なすべてのテーブル（結合されたテーブル、サブクエリ内のテーブル、分散テーブルを含む）に対して、自動的に [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用します。

指定可能な値:

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


## flatten&#95;nested {#flatten_nested}

<SettingsInfoBlock type="Bool" default_value="1" />

[ネストした](../../sql-reference/data-types/nested-data-structures/index.md)カラムのデータ形式を設定します。

指定可能な値:

* 1 — ネストしたカラムを個別の配列にフラット化します。
* 0 — ネストしたカラムをタプルの単一配列のままにします。

**使用方法**

この設定を `0` にすると、任意のレベルまでネストできます。

**例**

クエリ:

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

結果：

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

結果:

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


## force_aggregate_partitions_independently {#force_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

適用可能であるにもかかわらず、ヒューリスティクスによって使用しないと判断された最適化の利用を強制します

## force_aggregation_in_order {#force_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は、分散クエリをサポートするためにサーバー側で使用されます。通常の動作が損なわれるため、手動で変更しないでください（分散集約時に、リモートノードで順序付き集約の使用を強制します）。

## force&#95;data&#95;skipping&#95;indices {#force_data_skipping_indices}

指定した data skipping index が使用されなかった場合、クエリの実行を行いません。

次の例を見てみましょう。

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
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- クエリはCANNOT_PARSE_TEXTエラーを発生させます。
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- クエリはINDEX_NOT_USEDエラーを発生させます。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- 正常。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- 正常(フル機能パーサーの例)。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- d1_null_idxが使用されていないため、クエリはINDEX_NOT_USEDエラーを発生させます。
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- 正常。
```


## force_grouping_standard_compatibility {#force_grouping_standard_compatibility} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "GROUPING 関数の出力を SQL 標準および他の DBMS と同じにする"}]}]}/>

引数が集約キーとして使用されていない場合に GROUPING 関数が 1 を返すようにします

## force_index_by_date {#force_index_by_date} 

<SettingsInfoBlock type="Bool" default_value="0" />

索引を日付で使用できない場合は、クエリの実行を行いません。

MergeTree ファミリーのテーブルに対して有効です。

`force_index_by_date=1` の場合、ClickHouse はクエリにデータ範囲を制限するために使用できる日付キーに関する条件があるかどうかをチェックします。適切な条件がない場合は、例外をスローします。ただし、その条件によって読み取るデータ量が実際に減るかどうかはチェックしません。例えば、条件 `Date != ' 2000-01-01 '` は、テーブル内のすべてのデータに一致する場合（つまり、クエリの実行に全表スキャンが必要な場合）でも許可されます。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_optimize_projection {#force_optimize_projection} 

<SettingsInfoBlock type="Bool" default_value="0" />

[projections](../../engines/table-engines/mergetree-family/mergetree.md/#projections) の最適化が有効な場合（`optimize_use_projections` 設定については [optimize_use_projections](#optimize_use_projections) を参照）、`SELECT` クエリでプロジェクションの必須使用を有効または無効にします。

可能な値:

- 0 — プロジェクション最適化は必須ではありません。
- 1 — プロジェクション最適化は必須です。

## force_optimize_projection_name {#force_optimize_projection_name} 

空でない文字列が設定されている場合、この PROJECTION がクエリで少なくとも 1 回は使用されているかどうかをチェックします。

取りうる値:

- string: クエリで使用される PROJECTION の名前

## force_optimize_skip_unused_shards {#force_optimize_skip_unused_shards} 

<SettingsInfoBlock type="UInt64" default_value="0" />

[optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効で、未使用の分片をスキップできない場合に、クエリ実行を行うかどうかを制御します。スキップが不可能で、この設定が有効な場合は、例外がスローされます。

可能な値:

- 0 — 無効。ClickHouse は例外をスローしません。
- 1 — 有効。テーブルにシャーディングキーがある場合にのみ、クエリ実行が行われません。
- 2 — 有効。テーブルにシャーディングキーが定義されているかどうかに関係なく、クエリ実行が行われません。

## force_optimize_skip_unused_shards_nesting {#force_optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) の動作を制御し、分散クエリのネストレベル（ある `Distributed` テーブルが別の `Distributed` テーブルを参照するケースなど）に応じて適用範囲を変えます。この設定を利用するには、[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) 自体が有効になっている必要があります。

可能な値:

- 0 - 無効。`force_optimize_skip_unused_shards` は常に適用されます。
- 1 — 最初の 1 階層に対してのみ `force_optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 階層まで `force_optimize_skip_unused_shards` を有効にします。

## force_primary_key {#force_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

主キーによる索引付けが行えない場合、クエリの実行を行いません。

MergeTree ファミリーのテーブルで動作します。

`force_primary_key=1` の場合、ClickHouse はクエリに、データ範囲の絞り込みに利用できる主キー条件が含まれているかを確認します。適切な条件がない場合は、例外をスローします。ただし、その条件によって読み取るデータ量が実際に削減されるかどうかは検証しません。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_remove_data_recursively_on_drop {#force_remove_data_recursively_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

DROP クエリでデータを再帰的に削除します。「Directory not empty」エラーを回避しますが、detached データを暗黙的に削除してしまう可能性があります

## formatdatetime_e_with_space_padding {#formatdatetime_e_with_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE との互換性が向上"}]}]}/>

関数 `formatDateTime` におけるフォーマッター `%e` は、1 桁の日付を先頭にスペースを付けて出力します（例: `' 2'`（`'2'` ではなく））。

## formatdatetime_f_prints_scale_number_of_digits {#formatdatetime_f_prints_scale_number_of_digits} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

関数 `formatDateTime` のフォーマッタ `%f` は、固定の 6 桁ではなく、DateTime64 のスケールで指定された桁数のみを出力します。

## formatdatetime_f_prints_single_zero {#formatdatetime_f_prints_single_zero} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "MySQL の DATE_FORMAT()/STR_TO_DATE() との互換性を改善"}]}]}/>

関数 `formatDateTime` におけるフォーマッター '%f' は、フォーマット対象の値に秒の小数部が存在しない場合、6 個のゼロではなく 1 個のゼロのみを出力します。

## formatdatetime_format_without_leading_zeros {#formatdatetime_format_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="0" />

`formatDateTime` 関数におけるフォーマッタ `%c`、`%l`、`%k` は、先頭のゼロなしで月と時を出力します。

## formatdatetime_parsedatetime_m_is_month_name {#formatdatetime_parsedatetime_m_is_month_name} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `formatDateTime` および `parseDateTime` におけるフォーマッタ `%M` は、分ではなく月名を出力および解析します。

## fsync_metadata {#fsync_metadata} 

<SettingsInfoBlock type="Bool" default_value="1" />

`.sql` ファイルを書き込む際に [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) を有効化するかどうかを制御します。デフォルトでは有効です。

サーバー上に、非常に小さなテーブルが数百万個あり、それらが絶えず作成および削除されているような場合には、これを無効にすることが妥当な場合があります。

## function_date_trunc_return_type_behavior {#function_date_trunc_return_type_behavior} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "dateTrunc 関数の従来の動作を保持するための新しい設定を追加"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "負の値に対して正しい結果を得るために、dateTrunc 関数の DateTime64/Date32 引数に対する結果の型を、時間単位に関係なく DateTime64/Date32 となるように変更"}]}]}/>

`dateTrunc` 関数の戻り値の型の動作を変更できます。

設定可能な値:

- 0 - 第 2 引数が `DateTime64/Date32` の場合、戻り値の型は第 1 引数の時間単位に関係なく `DateTime64/Date32` になります。
- 1 - `Date32` に対しては結果は常に `Date` です。`DateTime64` に対しては、時間単位が `second` 以上の場合に結果は `DateTime` になります。

## function_implementation {#function_implementation} 

特定のターゲットまたはバリアント用の関数実装を選択します（実験的）。未指定の場合は、すべてが有効になります。

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex {#function_json_value_return_type_allow_complex}

<SettingsInfoBlock type="Bool" default_value="0" />

json&#95;value 関数が struct、array、map などの複合データ型を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1行のセット。経過時間: 0.001秒。
```

指定可能な値:

* true — 許可する。
* false — 許可しない。


## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;nullable {#function_json_value_return_type_allow_nullable}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON&#95;VALUE 関数で値が存在しない場合に`NULL`を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Possible values:

* true — 許可。
* false — 不許可。


## function_locate_has_mysql_compatible_argument_order {#function_locate_has_mysql_compatible_argument_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "MySQL の locate 関数との互換性を向上。"}]}]}/>

関数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) における引数の順序を制御します。

設定可能な値:

- 0 — 関数 `locate` は引数 `(haystack, needle[, start_pos])` を受け取ります。
- 1 — 関数 `locate` は引数 `(needle, haystack[, start_pos])` を受け取ります (MySQL 互換の挙動)。

## function_range_max_elements_in_block {#function_range_max_elements_in_block} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

関数 [range](/sql-reference/functions/array-functions#range) によって生成されるデータ量の安全のためのしきい値を設定します。データの各ブロックごとに、その関数によって生成される値の最大数（ブロック内のすべての行に対する配列サイズの合計）を定義します。

設定可能な値:

- 正の整数。

**関連項目**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block {#function_sleep_max_microseconds_per_block} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "以前のバージョンでは、最大スリープ時間 3 秒は `sleep` にのみ適用され、`sleepEachRow` 関数には適用されていませんでした。新しいバージョンでは、この設定を導入しています。以前のバージョンとの互換性を有効にした場合は、この制限は完全に無効化されます。"}]}]}/>

関数 `sleep` が各ブロックごとにスリープできる最大マイクロ秒数です。より大きい値で呼び出された場合は、例外をスローします。安全性を確保するためのしきい値です。

## function_visible_width_behavior {#function_visible_width_behavior} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "`visibleWidth` のデフォルト動作をより正確になるように変更しました"}]}]}/>

`visibleWidth` の動作バージョンを指定します。0 - コードポイント数のみをカウントします。1 - ゼロ幅文字および結合文字を正しく扱い、全角文字を 2 文字分としてカウントし、タブ幅を推定し、削除文字もカウントします。

## geo_distance_returns_float64_on_float64_arguments {#geo_distance_returns_float64_on_float64_arguments} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトの精度を向上しました。"}]}]}/>

`geoDistance`、`greatCircleDistance`、`greatCircleAngle` 関数の 4 つの引数がすべて Float64 型の場合、Float64 型を返し、内部計算には倍精度が使用されます。以前の ClickHouse バージョンでは、これらの関数は常に Float32 型を返していました。

## geotoh3_argument_order {#geotoh3_argument_order} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "lon と lat の引数順序をレガシー動作に合わせて設定するための新しい setting"}]}]}/>

Function 'geoToH3' は、'lon_lat' が設定されている場合は (lon, lat)、'lat_lon' が設定されている場合は (lat, lon) の順序で引数を受け取ります。

## glob_expansion_max_elements {#glob_expansion_max_elements} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

許可されるアドレス数の上限（外部ストレージやテーブル関数など）。

## grace_hash_join_initial_buckets {#grace_hash_join_initial_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Grace ハッシュ結合の初期バケット数

## grace_hash_join_max_buckets {#grace_hash_join_max_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Grace ハッシュ結合で使用されるバケット数の上限

## group_by_overflow_mode {#group_by_overflow_mode} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

集約用の一意キーの数が制限を超えた場合の動作を設定します:

- `throw`: 例外をスローする
- `break`: クエリの実行を停止し、部分的な結果を返す
- `any`: すでにセットに入っているキーについては集約を続行するが、新しいキーはセットに追加しない

`any` の値を使用すると、GROUP BY の近似を実行できます。
この近似の精度は、データの統計的な特性に依存します。

## group_by_two_level_threshold {#group_by_two_level_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

キー数がいくつ以上になったら 2 レベルの集約を開始するかを指定します。0 を指定すると、しきい値は設定されません。

## group_by_two_level_threshold_bytes {#group_by_two_level_threshold_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

集約状態のサイズ（バイト数）がどのサイズ以上になった場合に、二段階集約を使用し始めるかを指定します。0 の場合、しきい値は無効です。いずれかのしきい値に達した場合に二段階集約が使用されます。

## group_by_use_nulls {#group_by_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

[GROUP BY 句](/sql-reference/statements/select/group-by) が集約キーの型をどのように扱うかを変更します。
`ROLLUP`、`CUBE`、`GROUPING SETS` 指定子が使用されると、一部の集約キーは一部の結果行の生成に使用されない場合があります。
この設定に応じて、これらのキーに対応する行のカラムはデフォルト値または `NULL` で埋められます。

設定値:

- 0 — 欠落した値を生成する際に、集約キーの型に対するデフォルト値が使用されます。
- 1 — ClickHouse は SQL 標準どおりに `GROUP BY` を実行します。集約キーの型は [Nullable](/sql-reference/data-types/nullable) に変換されます。対応する集約キーのカラムは、そのキーが使用されなかった行では [NULL](/sql-reference/syntax#null) で埋められます。

関連項目:

- [GROUP BY 句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order {#h3togeo_lon_lat_result_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

関数 `h3ToGeo` は、true の場合は (lon, lat)、false の場合は (lat, lon) を返します。

## handshake_timeout_ms {#handshake_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

ハンドシェイク中にレプリカから Hello パケットを受信する際のタイムアウト（ミリ秒単位）。

## hdfs_create_new_file_on_insert {#hdfs_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS エンジンテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを制御します。有効にすると、各 `INSERT` のたびに、次のパターンに類似した名前の新しい HDFS ファイルが作成されます:

initial: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

指定可能な値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## hdfs_ignore_file_doesnt_exist {#hdfs_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、HDFS テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み込む際に、対象のファイルが存在しなくてもエラーとせず無視します。

取り得る値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## hdfs_replication {#hdfs_replication} 

<SettingsInfoBlock type="UInt64" default_value="0" />

実際のレプリカ数は、HDFS ファイルを作成するときに指定できます。

## hdfs_skip_empty_files {#hdfs_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[HDFS](../../engines/table-engines/integrations/hdfs.md) エンジンのテーブルで空ファイルをスキップするかどうかを有効/無効にします。

設定可能な値:

- 0 — 空ファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## hdfs_throw_on_zero_files_match {#hdfs_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "HDFS エンジンで ListObjects リクエストがいずれのファイルにも一致しない場合に、空のクエリ結果ではなくエラーをスローできるようにする"}]}]}/>

glob 展開ルールに従って一致するファイルが 0 件の場合に、エラーをスローします。

可能な値:

- 1 — `SELECT` が例外をスローします。
- 0 — `SELECT` が空の結果を返します。

## hdfs_truncate_on_insert {#hdfs_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

`hdfs` エンジンテーブルへの `INSERT` の前に、ファイルをトランケートするかどうかを有効または無効にします。無効になっている場合、HDFS 上にファイルがすでに存在するときに `INSERT` を試みると、例外がスローされます。

設定可能な値:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存コンテンツを新しいデータで置き換えます。

## hedged_connection_timeout_ms {#hedged_connection_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "以前の接続タイムアウトに合わせるため、Hedged リクエストでは 100 ms ではなく 50 ms 経過後に新しい接続を開始"}]}]}/>

Hedged リクエストでレプリカへの接続を確立するための接続タイムアウト時間

## hnsw_candidate_list_size_for_search {#hnsw_candidate_list_size_for_search} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新しい設定。以前は CREATE INDEX で任意指定でき、デフォルト値は 64 でした。"}]}]}/>

ベクトル類似性索引を検索する際に使用される動的候補リストのサイズで、`ef_search` とも呼ばれます。

## hsts_max_age {#hsts_max_age} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS の失効までの時間。0 は HSTS を無効にすることを意味します。

## http_connection_timeout {#http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 接続のタイムアウト（秒単位）。

取りうる値:

- 任意の正の整数。
- 0 - 無効（タイムアウトなし／無制限）。

## http_headers_progress_interval_ms {#http_headers_progress_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP ヘッダー X-ClickHouse-Progress を、指定した間隔より短い間隔では送信しません。

## http_make_head_request {#http_make_head_request} 

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 設定は、読み取るファイルのサイズなどの情報を取得するために、HTTP からデータを読み込む際に `HEAD` リクエストを実行できるようにします。デフォルトで有効になっているため、サーバーが `HEAD` リクエストをサポートしない場合などには、この設定を無効にした方がよい場合があります。

## http_max_field_name_size {#http_max_field_name_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド名の最大長さ

## http_max_field_value_size {#http_max_field_value_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド値の最大長さ

## http_max_fields {#http_max_fields} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP ヘッダー内のフィールド数の上限

## http_max_multipart_form_data_size {#http_max_multipart_form_data_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

multipart/form-data コンテンツのサイズ上限。この設定は URL パラメータからは解釈されず、ユーザープロファイルで設定する必要があります。コンテンツはクエリ実行の開始前にパースされ、外部テーブルがメモリ内に作成されることに注意してください。また、この段階に影響を与えるのはこの制限のみです（最大メモリ使用量や最大実行時間の制限は、HTTP フォームデータの読み取り中には影響しません）。

## http_max_request_param_data_size {#http_max_request_param_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

事前定義された HTTP リクエストで、クエリパラメータとして使用されるリクエストデータのサイズ上限。

## http_max_tries {#http_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

HTTP 経由での読み取り試行の最大回数。

## http_max_uri_size {#http_max_uri_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

HTTPリクエストのURIの最大長を設定します。

指定可能な値:

- 正の整数。

## http_native_compression_disable_checksumming_on_decompress {#http_native_compression_disable_checksumming_on_decompress} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントから送信された HTTP POST データを伸長する際に、チェックサム検証を有効または無効にします。ClickHouse ネイティブ圧縮形式でのみ使用されます（`gzip` や `deflate` では使用されません）。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## http_receive_timeout {#http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "See http_send_timeout."}]}]}/>

HTTP 受信タイムアウト（秒単位）。

指定可能な値:

- 任意の正の整数。
- 0 - 無効（タイムアウト無制限）。

## http_response_buffer_size {#http_response_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HTTP レスポンスをクライアントに送信する前、または（http_wait_end_of_query が有効な場合に）ディスクへフラッシュする前に、サーバーのメモリ上でバッファリングするバイト数。

## http_response_headers {#http_response_headers} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "New setting."}]}]}/>

サーバーが、クエリが正常に実行された結果に対するレスポンスで返す HTTP ヘッダーを追加または上書きできるようにします。
これは HTTP インターフェイスにのみ影響します。

ヘッダーがデフォルトですでに設定されている場合は、指定した値でそれを上書きします。
ヘッダーがデフォルトで設定されていない場合は、ヘッダー一覧に追加されます。
サーバーによってデフォルトで設定され、この設定で上書きされないヘッダーはそのまま残ります。

この設定では、ヘッダーを定数値に設定できます。現在のところ、動的に計算された値をヘッダーに設定する方法はありません。

名前と値のどちらにも ASCII 制御文字を含めることはできません。

返されたヘッダーに基づいて処理や判断を行う一方で、ユーザーが設定を変更できる UI アプリケーションを実装する場合、この設定は読み取り専用に制限することを推奨します。

例: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms {#http_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP 読み取りの再試行時に使用されるバックオフの最小ミリ秒数

## http_retry_max_backoff_ms {#http_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

HTTP 経由の読み取りを再試行する際に使用されるバックオフの最大時間（ミリ秒）

## http_send_timeout {#http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 分は長すぎるように思えるかもしれません。これはアップロード処理全体のタイムアウトではなく、単一のネットワーク書き込み呼び出しごとのタイムアウトである点に注意してください。"}]}]}/>

HTTP 送信タイムアウト（秒単位）。

指定可能な値:

- 任意の正の整数。
- 0 - 無効（無制限タイムアウト）。

:::note
デフォルトのプロファイルにのみ適用されます。変更を反映するにはサーバーの再起動が必要です。
:::

## http_skip_not_found_url_for_globs {#http_skip_not_found_url_for_globs} 

<SettingsInfoBlock type="Bool" default_value="1" />

グロブパターンにマッチし、HTTP_NOT_FOUND エラーとなった URL をスキップする

## http_wait_end_of_query {#http_wait_end_of_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー側で HTTP レスポンスのバッファリングを有効にします。

## http_write_exception_in_output_format {#http_write_exception_in_output_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "フォーマット間の一貫性のために変更"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "HTTP ストリーミング中に例外が発生した場合に、有効な JSON/XML を出力します。"}]}]}/>

有効な出力を生成するために、例外を出力フォーマットで書き出します。JSON および XML フォーマットで動作します。

## http_zlib_compression_level {#http_zlib_compression_level} 

<SettingsInfoBlock type="Int64" default_value="3" />

[enable_http_compression = 1](#enable_http_compression) の場合に、HTTP リクエストに対するレスポンスで使用されるデータ圧縮レベルを設定します。

可能な値: 1 から 9 までの数値。

## iceberg_delete_data_on_drop {#iceberg_delete_data_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

DROP 時にすべての Iceberg ファイルを削除するかどうかを制御します。

## iceberg_insert_max_bytes_in_data_file {#iceberg_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定。"}]}]}/>

INSERT 操作時に作成される Iceberg の Parquet データファイルの最大サイズ（バイト単位）。

## iceberg_insert_max_partitions {#iceberg_insert_max_partitions} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg テーブルエンジンでの 1 回の insert 操作で許可されるパーティション数の最大値。

## iceberg_insert_max_rows_in_data_file {#iceberg_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新しい設定"}]}]}/>

挿入操作時に作成される Iceberg Parquet データファイルの最大行数。

## iceberg_metadata_compression_method {#iceberg_metadata_compression_method} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい設定"}]}]}/>

`.metadata.json` ファイルの圧縮方式。

## iceberg_metadata_log_level {#iceberg_metadata_log_level} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Iceberg テーブルのメタデータを system.iceberg_metadata_log に記録する際のログレベルを制御します。
通常、この設定はデバッグ目的でのみ変更します。

指定可能な値:

- none - メタデータログなし。
- metadata - ルート metadata.json ファイル。
- manifest_list_metadata - 上記すべて + スナップショットに対応する avro manifest list からのメタデータ。
- manifest_list_entry - 上記すべて + avro manifest list のエントリ。
- manifest_file_metadata - 上記すべて + 走査された avro manifest ファイルからのメタデータ。
- manifest_file_entry - 上記すべて + 走査された avro manifest ファイルのエントリ。

## iceberg_snapshot_id {#iceberg_snapshot_id} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting."}]}]}/>

特定のスナップショット ID を指定して Iceberg テーブルをクエリします。

## iceberg_timestamp_ms {#iceberg_timestamp_ms} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting."}]}]}/>

特定のタイムスタンプの時点で有効だったスナップショットを使用して Iceberg テーブルに対してクエリを実行します。

## idle_connection_timeout {#idle_connection_timeout} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

指定した秒数の経過後に、アイドル状態の TCP 接続を閉じるためのタイムアウト値。

取り得る値:

- 正の整数（0 - 0 秒後に直ちに閉じる）。

## ignore_cold_parts_seconds {#ignore_cold_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ有効です。新しいデータパーツは、事前にウォームアップされる（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）か、指定した秒数が経過するまで SELECT クエリから除外されます。Replicated-/SharedMergeTree にのみ適用されます。

## ignore&#95;data&#95;skipping&#95;indices {#ignore_data_skipping_indices}

クエリで使用される場合でも、指定されたスキップ索引を無視します。

次の例を見てみましょう。

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- クエリはCANNOT_PARSE_TEXTエラーを発生させます。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- 正常。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- 正常。

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- xy_idxが明示的に無視されているため、クエリはINDEX_NOT_USEDエラーを発生させます。
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

索引を無視しないクエリ:

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

`xy_idx` 索引を無視する場合:

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

MergeTree ファミリーのテーブルに対応しています。


## ignore_drop_queries_probability {#ignore_drop_queries_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "テスト目的で、サーバーが指定した確率でDROPクエリを無視できるようにする"}]}]}/>

有効化すると、サーバーは指定した確率で、すべてのDROP TABLEクエリを無視します（MemoryおよびJOINエンジンに対しては、DROPをTRUNCATEに置き換えます）。テスト目的で使用します。

## ignore_materialized_views_with_dropped_target_table {#ignore_materialized_views_with_dropped_target_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "ターゲットテーブルが削除された materialized view を無視できるようにする新しい設定を追加"}]}]}/>

ビューへのプッシュ時に、ターゲットテーブルが削除された materialized view (MV) を無視する

## ignore_on_cluster_for_replicated_access_entities_queries {#ignore_on_cluster_for_replicated_access_entities_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされたアクセスエンティティを管理するクエリにおいて、ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_named_collections_queries {#ignore_on_cluster_for_replicated_named_collections_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "レプリケートされた named collection を管理するクエリに対して ON CLUSTER 句を無視します。"}]}]}/>

レプリケートされた named collection を管理するクエリに対して ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_udf_queries {#ignore_on_cluster_for_replicated_udf_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされた UDF の管理クエリに対しては、ON CLUSTER 句を無視します。

## implicit_select {#implicit_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

先頭の `SELECT` キーワードなしで簡単な SELECT クエリを書けるようにし、電卓のような用途で簡単に使えるようにします。例えば、`1 + 2` が有効なクエリになります。

`clickhouse-local` ではデフォルトで有効になっており、明示的に無効化できます。

## implicit_table_at_top_level {#implicit_table_at_top_level} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "clickhouse-local で使用される新しい設定"}]}]}/>

空でない値が設定されている場合、トップレベルで FROM を持たないクエリは、`system.one` の代わりにこのテーブルからデータを読み込みます。

これは clickhouse-local における入力データ処理に使用されます。
この設定はユーザーが明示的に設定することもできますが、そのような用途を意図したものではありません。

副問い合わせはこの設定の影響を受けません（スカラー副問い合わせ、FROM 句の副問い合わせ、IN 句の副問い合わせのいずれも含みます）。
UNION、INTERSECT、EXCEPT チェーンのトップレベルの SELECT は、一様に扱われ、この設定の影響を受けます。これは、かっこでどのようにグルーピングされているかに関係ありません。
この設定が VIEW および分散クエリにどのような影響を与えるかは規定されていません。

この設定はテーブル名（その場合、テーブルは現在のデータベースから解決されます）または 'database.table' 形式の修飾名を受け付けます。
データベース名およびテーブル名はいずれもクオートしてはいけません。単純識別子のみが許可されます。

## implicit_transaction {#implicit_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

有効化されていて、かつ現在トランザクション内でない場合、クエリを完全なトランザクション（BEGIN + COMMIT または ROLLBACK）でラップして実行します。

## inject_random_order_for_select_without_order_by {#inject_random_order_for_select_without_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

有効にすると、ORDER BY 句を含まない SELECT クエリに対して `ORDER BY rand()` を挿入します。
サブクエリ深度が 0 の場合にのみ適用されます。サブクエリおよび `INSERT INTO ... SELECT` には影響しません。
トップレベルの構造が UNION の場合、`ORDER BY rand()` はすべての子クエリに対して個別に挿入されます。
テストおよび開発用途にのみ有用です（ORDER BY を指定しないことは、クエリ結果が非決定的になる原因となります）。

## input_format_parallel_parsing {#input_format_parallel_parsing} 

<SettingsInfoBlock type="Bool" default_value="1" />

データフォーマットの順序を保持した並列解析を有効または無効にします。 [TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットでのみサポートされます。

指定可能な値:

- 1 — 有効。
- 0 — 無効。

## insert_allow_materialized_columns {#insert_allow_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、INSERT 文でマテリアライズドカラムを指定できるようになります。

## insert_deduplicate {#insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` のブロック重複排除を有効または無効にします（Replicated\* テーブル用）。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルトでは、`INSERT` ステートメントによりレプリケーションされたテーブルに挿入されたブロックは重複排除されます（[Data Replication](../../engines/table-engines/mergetree-family/replication.md) を参照）。
レプリケーションされたテーブルでは、デフォルトで各パーティションごとに直近の 100 ブロックのみが重複排除されます（[replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケーションされていないテーブルについては [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

## insert&#95;deduplication&#95;token {#insert_deduplication_token}

この設定により、ユーザーは MergeTree/ReplicatedMergeTree において独自の重複排除セマンティクスを定義できます。
たとえば、各 `INSERT` 文でこの設定に一意な値を指定することで、
同じデータを挿入しても重複排除されることを防ぐことができます。

設定可能な値:

* 任意の文字列

`insert_deduplication_token` は、空でない場合にのみ重複排除に使用されます。

レプリケートされたテーブルでは、デフォルトでは各パーティションに対して直近 100 件のみが重複排除されます（[replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケートされていないテーブルについては [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

:::note
`insert_deduplication_token` はパーティションレベルで機能します（`insert_deduplication` のチェックサムと同様）。
複数のパーティションが同じ `insert_deduplication_token` を持つことができます。
:::

例:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- 次のINSERTは重複排除されません。insert_deduplication_tokenが異なるためです
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- 次のINSERTは重複排除されます。insert_deduplication_tokenが
-- 以前のものと同じためです
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (2);

SELECT * FROM test_table

┌─A─┐
│ 1 │
└───┘
┌─A─┐
│ 1 │
└───┘
```


## insert_keeper_fault_injection_probability {#insert_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

INSERT 時の keeper リクエストが失敗するおおよその確率。指定可能な値は [0.0f, 1.0f] の範囲です。

## insert_keeper_fault_injection_seed {#insert_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - ランダムなシード値、それ以外の値の場合はこの設定値

## insert&#95;keeper&#95;max&#95;retries {#insert_keeper_max_retries}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "INSERT 時に Keeper への再接続を有効化し、信頼性を向上"}]}]} />

この設定は、replicated MergeTree への INSERT 実行中に、ClickHouse Keeper（または ZooKeeper）リクエストを再試行する最大回数を指定します。ネットワークエラー、Keeper セッションのタイムアウト、またはリクエストのタイムアウトによって失敗した Keeper リクエストのみが再試行の対象になります。

指定可能な値:

* 正の整数
* 0 — 再試行を無効化

Cloud のデフォルト値: `20`。

Keeper リクエストの再試行は、一定のタイムアウト後に行われます。タイムアウトは、次の設定で制御されます: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`。
最初の再試行は、`insert_keeper_retry_initial_backoff_ms` のタイムアウト後に行われます。以降のタイムアウトは次のように計算されます:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例えば、`insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000`、`insert_keeper_max_retries=8` の場合、タイムアウト間隔は `100, 200, 400, 800, 1600, 3200, 6400, 10000` となります。

フォールトトレランスに加えて、リトライ処理はユーザー体験の向上も目的としています。例えばアップグレードなどにより Keeper が再起動された場合でも、INSERT 実行中にエラーを返さずに済むようにします。


## insert_keeper_retry_initial_backoff_ms {#insert_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

INSERT クエリの実行中に失敗した Keeper リクエストを再試行するまでの初期待機時間（ミリ秒）

可能な値:

- 正の整数
- 0 — タイムアウトなし

## insert_keeper_retry_max_backoff_ms {#insert_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

INSERT クエリの実行中に、失敗した Keeper リクエストを再試行する際の最大タイムアウト（ミリ秒）

取りうる値：

- 正の整数
- 0 — 最大タイムアウトは無制限

## insert_null_as_default {#insert_null_as_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

[nullable](/sql-reference/data-types/nullable) ではないデータ型のカラムに対して、[NULL](/sql-reference/syntax#null) の代わりに [デフォルト値](/sql-reference/statements/create/table#default_values) を挿入するかどうかを制御します。
カラムの型が Nullable でなく、この設定が無効な場合に `NULL` を挿入すると、例外が発生します。カラムの型が Nullable の場合、`NULL` の値はこの設定に関係なくそのまま挿入されます。

この設定は [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリに適用されます。`SELECT` サブクエリは `UNION ALL` 句で連結されている場合があります。

取りうる値は次のとおりです:

- 0 — Nullable でないカラムに `NULL` を挿入すると、例外が発生します。
- 1 — `NULL` の代わりに、カラムのデフォルト値が挿入されます。

## insert_quorum {#insert_quorum} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
この設定は SharedMergeTree には適用されません。詳細については、[SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム書き込みを有効にします。

- `insert_quorum < 2` の場合、クォーラム書き込みは無効になります。
- `insert_quorum >= 2` の場合、クォーラム書き込みは有効になります。
- `insert_quorum = 'auto'` の場合、クォーラム数として過半数（`number_of_replicas / 2 + 1`）を使用します。

クォーラム書き込み

`INSERT` は、ClickHouse が `insert_quorum_timeout` の間に `insert_quorum` で指定された数のレプリカに対して正しくデータを書き込めた場合にのみ成功します。何らかの理由で、書き込みに成功したレプリカの数が `insert_quorum` に達しない場合、その書き込みは失敗と見なされ、ClickHouse はすでにデータが書き込まれているすべてのレプリカから挿入されたブロックを削除します。

`insert_quorum_parallel` が無効な場合、クォーラム内のすべてのレプリカは整合が取れており、すなわち過去のすべての `INSERT` クエリのデータを保持しています（`INSERT` のシーケンスは線形化されます）。`insert_quorum` を使用して書き込まれたデータを読み取り、かつ `insert_quorum_parallel` が無効な場合、[select_sequential_consistency](#select_sequential_consistency) を使用して `SELECT` クエリに対して逐次一貫性を有効化できます。

ClickHouse は次の状況で例外をスローします:

- クエリ時点で利用可能なレプリカ数が `insert_quorum` より少ない場合。
- `insert_quorum_parallel` が無効であり、前のブロックがまだレプリカの `insert_quorum` に挿入されていない状態でデータを書き込もうとした場合。この状況は、ユーザーが `insert_quorum` を指定した前の `INSERT` が完了する前に、同じテーブルに対して別の `INSERT` クエリを実行しようとしたときに発生する可能性があります。

関連項目:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel {#insert_quorum_parallel} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで並列クォーラム INSERT を使用します。逐次的なクォーラム INSERT よりも大幅に扱いやすくなります"}]}]}/>

:::note
この設定は SharedMergeTree には適用されません。詳細は [SharedMergeTree の一貫性](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム付き `INSERT` クエリの並列実行を有効または無効にします。有効な場合、前のクエリがまだ完了していない間でも、追加の `INSERT` クエリを送信できます。無効な場合、同じテーブルへの追加の書き込みは拒否されます。

取りうる値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout {#insert_quorum_timeout} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

クォーラム書き込みのタイムアウトをミリ秒で指定します。タイムアウトに達してもまだ書き込みが完了していない場合、ClickHouse は例外をスローし、クライアントは同じブロックを同じレプリカまたは別のレプリカに書き込むためにクエリを再実行する必要があります。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert&#95;shard&#95;id {#insert_shard_id}

<SettingsInfoBlock type="UInt64" default_value="0" />

`0` 以外の場合、データを同期的に挿入する対象の [Distributed](/engines/table-engines/special/distributed) テーブルの分片を指定します。

`insert_shard_id` の値が正しくない場合、サーバーは例外をスローします。

`requested_cluster` 上の分片数を取得するには、サーバー構成を確認するか、次のクエリを使用します。

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

設定可能な値:

* 0 — 無効。
* 対応する [Distributed](/engines/table-engines/special/distributed) テーブルの `1` から `shards_num` までの任意の数値。

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


## interactive_delay {#interactive_delay} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

リクエストの実行がキャンセルされたかどうかをチェックし、進捗状況を送信するための間隔（マイクロ秒単位）です。

## intersect_default_mode {#intersect_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

INTERSECT クエリにおけるデフォルトモードを設定します。指定可能な値: 空文字列、'ALL'、'DISTINCT'。空文字列の場合、モードを指定していないクエリでは例外がスローされます。

## jemalloc_collect_profile_samples_in_trace_log {#jemalloc_collect_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

トレースログ内で jemalloc の割り当ておよび解放のサンプルを収集します。

## jemalloc_enable_profiler {#jemalloc_enable_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリに対して jemalloc プロファイラを有効にします。jemalloc はメモリアロケーションをサンプリングし、サンプリング対象となった割り当てについては、すべての解放を記録します。
プロファイルは、メモリアロケーションの分析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュできます。
サンプルは、設定 jemalloc_collect_global_profile_samples_in_trace_log を使用して system.trace_log に保存するか、クエリ設定 jemalloc_collect_profile_samples_in_trace_log を用いて保存することもできます。
[メモリアロケーションのプロファイリング](/operations/allocation-profiling) を参照してください。

## join_algorithm {#join_algorithm} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' was deprecated in favor of explicitly specified join algorithms, also parallel_hash is now preferred over hash"}]}]}/>

どの [JOIN](../../sql-reference/statements/select/join.md) アルゴリズムを使用するかを指定します。

複数のアルゴリズムを指定でき、指定された中から、結合の種類/厳密さおよびテーブルエンジンに基づいて、そのクエリで利用可能なものが選択されます。

設定可能な値:

- grace_hash

[Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join) を使用します。Grace hash は、メモリ使用量を抑えつつ高性能な複雑な JOIN を実現するためのアルゴリズムオプションを提供します。

Grace join の第 1 フェーズでは、右側のテーブルを読み取り、キーとなるカラムのハッシュ値に応じて N 個のバケットに分割します (初期値の N は `grace_hash_join_initial_buckets` です)。これは、それぞれのバケットを独立して処理できるように行われます。最初のバケットの行はインメモリのハッシュテーブルに追加され、それ以外はディスクに保存されます。ハッシュテーブルがメモリ制限 (たとえば [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) で設定) を超えて成長した場合、バケット数を増やし、各行に対して割り当てバケットを再計算します。現在のバケットに属さない行はフラッシュされて再割り当てされます。

`INNER/LEFT/RIGHT/FULL ALL/ANY JOIN` をサポートします。

- hash

[Hash join algorithm](https://en.wikipedia.org/wiki/Hash_join) を使用します。結合の種類と厳密さのあらゆる組み合わせ、および `JOIN ON` 句内で `OR` で組み合わされた複数の結合キーをサポートする、最も汎用的な実装です。

`hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- parallel_hash

`hash` join のバリエーションで、データを複数のバケットに分割し、1 つではなく複数のハッシュテーブルを並行して構築することで、この処理を高速化します。

`parallel_hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- partial_merge

[sort-merge アルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) のバリエーションで、右側のテーブルのみを完全にソートします。

`RIGHT JOIN` と `FULL JOIN` は `ALL` 厳密さでのみサポートされます (`SEMI`、`ANTI`、`ANY`、`ASOF` はサポートされません)。

`partial_merge` アルゴリズムを使用する場合、ClickHouse はデータをソートしてディスクにダンプします。ClickHouse における `partial_merge` アルゴリズムは、古典的な実装とは若干異なります。まず、ClickHouse は右側のテーブルを結合キーでブロックごとにソートし、ソート済みブロックに対して min-max 索引を作成します。次に、左側テーブルのパーツを `join key` でソートし、それらを右側テーブルと結合します。このとき、min-max 索引を使用して不要な右側テーブルブロックをスキップします。

- direct

このアルゴリズムは、右側のテーブルのストレージがキー・バリュー型の問い合わせをサポートしている場合に適用できます。

`direct` アルゴリズムは、左側テーブルの行をキーとして右側テーブルをルックアップします。[Dictionary](/engines/table-engines/special/dictionary) や [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) のような専用ストレージでのみサポートされ、`LEFT` および `INNER` JOIN のみが対象です。

- auto

`auto` に設定すると、まず `hash` join を試行し、メモリ制限に違反した場合に、その場で別のアルゴリズムへ切り替えます。

- full_sorting_merge

結合の前に両方のテーブルを完全にソートする [sort-merge アルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) です。

- prefer_partial_merge

ClickHouse は可能な限り常に `partial_merge` join を使用しようとし、それが不可能な場合には `hash` を使用します。*非推奨* であり、`partial_merge,hash` と同じ意味です。

- default (deprecated)

レガシーな値であり、今後は使用しないでください。
`direct,hash` と同じであり、direct join と hash join をこの順序で試行します。

## join_any_take_last_row {#join_any_take_last_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

`ANY` 厳格性での `JOIN` 演算の動作を変更します。

:::note
この設定は、[Join](../../engines/table-engines/special/join.md) エンジンのテーブルに対する `JOIN` 演算にのみ適用されます。
:::

設定値:

- 0 — 右側のテーブルに複数の一致する行がある場合、最初に見つかった行のみが結合されます。
- 1 — 右側のテーブルに複数の一致する行がある場合、最後に見つかった行のみが結合されます。

関連項目:

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness {#join_default_strictness} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

[JOIN 句](/sql-reference/statements/select/join)に対するデフォルトの厳密度を設定します。

設定可能な値:

- `ALL` — 右側のテーブルに複数の一致する行がある場合、ClickHouse は一致する行から[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を作成します。これは標準 SQL における通常の `JOIN` の動作です。
- `ANY` — 右側のテーブルに複数の一致する行がある場合、最初に見つかった 1 行だけが結合されます。右側のテーブルに 1 行しか一致する行がない場合、`ANY` と `ALL` の結果は同じになります。
- `ASOF` — 一致が不確実なシーケンスを結合するためのモードです。
- `Empty string` — クエリ内で `ALL` または `ANY` が指定されていない場合、ClickHouse は例外をスローします。

## join_on_disk_max_files_to_merge {#join_on_disk_max_files_to_merge} 

<SettingsInfoBlock type="UInt64" default_value="64" />

MergeJoin 操作がディスク上で実行される場合に、並列ソートに使用できるファイル数の上限を設定します。

この設定値が大きいほど、より多くの RAM が使用され、必要なディスク I/O は少なくなります。

可能な値:

- 2 以上の任意の正の整数。

## join_output_by_rowlist_perkey_rows_threshold {#join_output_by_rowlist_perkey_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "ハッシュ結合において行リスト形式で出力するかどうかを判断するための、右側のテーブルにおけるキーごとの平均行数の下限値。"}]}]}/>

ハッシュ結合において行リスト形式で出力するかどうかを判断するための、右側のテーブルにおけるキーごとの平均行数の下限値。

## join_overflow_mode {#join_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

次のいずれかの JOIN 制限に達したときに、ClickHouse が実行する動作を定義します:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

設定可能な値:

- `THROW` — ClickHouse は例外をスローし、処理を中断します。
- `BREAK` — ClickHouse は処理を中断しますが、例外はスローしません。

デフォルト値: `THROW`。

**関連情報**

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes {#join_runtime_bloom_filter_bytes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

JOIN のランタイムフィルターとして使用される Bloom フィルターのサイズ（バイト単位）。`enable_join_runtime_filters` SETTING を参照。

## join_runtime_bloom_filter_hash_functions {#join_runtime_bloom_filter_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

JOIN のランタイムフィルターとして使用する Bloom フィルターで用いるハッシュ関数の数です（enable_join_runtime_filters 設定を参照）。

## join_runtime_filter_exact_values_limit {#join_runtime_filter_exact_values_limit} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "新しい設定"}]}]}/>

ランタイムフィルタ内で、set としてそのまま保存される要素数の上限。このしきい値を超えると、Bloom フィルタに切り替わります。

## join_to_sort_maximum_table_rows {#join_to_sort_maximum_table_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "right テーブルの行数の最大値です。left または inner join において、right テーブルをキーで再並べ替えするかどうかを判定する際に使用されます。"}]}]}/>

right テーブルの行数の最大値です。left または inner join において、right テーブルをキーで再並べ替えするかどうかを判定する際に使用されます。

## join_to_sort_minimum_perkey_rows {#join_to_sort_minimum_perkey_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "左結合または内部結合において、右側のテーブルをキーで再ソートするかどうかを判定するための、右テーブルにおけるキーごとの平均行数の下限値。この設定により、スパースなキーを持つテーブルに対しては、この最適化が適用されないようにします"}]}]}/>

左結合または内部結合において、右側のテーブルをキーで再ソートするかどうかを判定するための、右テーブルにおけるキーごとの平均行数の下限値。この設定により、スパースなキーを持つテーブルに対しては、この最適化が適用されないようにします

## join_use_nulls {#join_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

[JOIN](../../sql-reference/statements/select/join.md) の挙動を設定します。テーブルを結合すると、空のセルが発生することがあります。ClickHouse は、この設定に応じて空のセルの埋め方を変えます。

設定可能な値:

- 0 — 空のセルは、対応するフィールド型のデフォルト値で埋められます。
- 1 — `JOIN` は標準 SQL と同じように動作します。対応するフィールドの型は [Nullable](/sql-reference/data-types/nullable) に変換され、空のセルは [NULL](/sql-reference/syntax) で埋められます。

## joined_block_split_single_row {#joined_block_split_single_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ハッシュ結合の結果を、左テーブルの単一行に対応する行ごとに chunk に分割できるようにします。
これは、右テーブルで多数の行とマッチする行がある場合のメモリ使用量を削減できる可能性がありますが、CPU 使用量が増加する場合があります。
この設定が有効になるには、`max_joined_block_size_rows != 0` であることが必須です。
`max_joined_block_size_bytes` をこの設定と組み合わせることで、一部の大きな行が右テーブルで多数のマッチを持つような偏りのあるデータの場合でも、過剰なメモリ使用を避けるのに役立ちます。

## joined_subquery_requires_alias {#joined_subquery_requires_alias} 

<SettingsInfoBlock type="Bool" default_value="1" />

結合に用いられるサブクエリおよびテーブル関数にエイリアスの指定を強制し、名前を正しく修飾できるようにします。

## kafka_disable_num_consumers_limit {#kafka_disable_num_consumers_limit} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用可能な CPU コア数に依存する `kafka_num_consumers` の制限を無効にします。

## kafka_max_wait_ms {#kafka_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[Kafka](/engines/table-engines/integrations/kafka) からメッセージを読み取る際に、再試行する前に待機する時間（ミリ秒）。

指定可能な値:

- 正の整数。
- 0 — タイムアウトしない（無制限）。

関連項目:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode {#keeper_map_strict_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

KeeperMap に対する操作時に追加のチェックを行います。例: 既に存在するキーに対して insert を行った場合に例外をスローします。

## keeper_max_retries {#keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "一般的な keeper 操作の最大再試行回数"}]}]}/>

一般的な keeper 操作の最大再試行回数

## keeper_retry_initial_backoff_ms {#keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "一般的な keeper 操作に対する初回バックオフタイムアウト"}]}]}/>

一般的な keeper 操作に対する初回バックオフタイムアウト

## keeper_retry_max_backoff_ms {#keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "一般的な keeper 操作の最大バックオフ時間"}]}]}/>

一般的な keeper 操作の最大バックオフ時間

## least_greatest_legacy_null_behavior {#least_greatest_legacy_null_behavior} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、`least` および `greatest` 関数は、引数のいずれかが NULL の場合に NULL を返します。

## legacy_column_name_of_tuple_literal {#legacy_column_name_of_tuple_literal} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "互換性のためだけに追加された SETTING です。21.7 より低いバージョンから高いバージョンへクラスタをローリングアップデートする際に、'true' に設定することが有用です"}]}]}/>

大きなタプルリテラルに対して、ハッシュではなく、その要素名をカラム名としてすべて列挙します。この SETTING は互換性のためだけに存在します。21.7 より低いバージョンから高いバージョンへクラスタをローリングアップデートする際に、'true' に設定することが有用です。

## lightweight_delete_mode {#lightweight_delete_mode} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "新しい設定"}]}]}/>

論理削除の一部として実行される内部の更新クエリのモードです。

指定可能な値:

- `alter_update` - ヘビーウェイトなミューテーションを作成する `ALTER UPDATE` クエリを実行します。
- `lightweight_update` - 可能であれば論理更新を実行し、それ以外の場合は `ALTER UPDATE` を実行します。
- `lightweight_update_force` - 可能であれば論理更新を実行し、それ以外の場合は例外をスローします。

## lightweight_deletes_sync {#lightweight_deletes_sync} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "「mutation_sync」と同じですが、論理削除の実行のみを制御します"}]}]}/>

[`mutations_sync`](#mutations_sync) と同じですが、論理削除の実行のみを制御します。

取り得る値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | Mutation は非同期に実行されます。                                                                                                                     |
| `1`   | クエリは、現在のサーバー上で論理削除が完了するまで待機します。                                                                                        |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で論理削除が完了するまで待機します。                                                                        |
| `3`   | クエリはアクティブなレプリカのみの完了を待機します。`SharedMergeTree` でのみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同じ動作になります。|

**関連項目**

- [ALTER クエリの同期性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Mutations](../../sql-reference/statements/alter/index.md/#mutations)

## limit {#limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ結果から取得する最大行数を設定します。クエリで指定された [LIMIT](/sql-reference/statements/select/limit) 句による値に対する上限として機能し、クエリ内で指定された制限値が、この設定で指定した値を超えないようにします。

取りうる値:

- 0 — 行数は無制限。
- 正の整数。

## load_balancing {#load_balancing} 

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

分散クエリ処理で使用されるレプリカ選択アルゴリズムを指定します。

ClickHouse は、次のレプリカ選択アルゴリズムをサポートしています。

- [Random](#load_balancing-random) (デフォルト)
- [Nearest hostname](#load_balancing-nearest_hostname)
- [Hostname levenshtein distance](#load_balancing-hostname_levenshtein_distance)
- [In order](#load_balancing-in_order)
- [First or random](#load_balancing-first_or_random)
- [Round robin](#load_balancing-round_robin)

関連項目:

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### ランダム（デフォルト） {#load_balancing-random}

```sql
load_balancing = random
```

エラーの数は各レプリカごとにカウントされます。クエリはエラー数が最も少ないレプリカに送信され、そのようなレプリカが複数ある場合は、そのいずれかに送信されます。
欠点: サーバーの近さは考慮されません。また、レプリカ間でデータが異なる場合、返されるデータも異なります。


### 最寄りのホスト名 {#load_balancing-nearest_hostname}

```sql
load_balancing = nearest_hostname
```

エラーの数は各レプリカごとにカウントされます。5分ごとに、エラー数は 2 で整数除算されます。したがって、エラー数は指数平滑化により直近の期間に対して計算されます。もしエラー数が最小のレプリカが 1 つだけ存在する場合（すなわち、他のレプリカでは最近エラーが発生している場合）、そのレプリカにクエリが送信されます。最小のエラー数を持つレプリカが複数ある場合、クエリは config ファイル内で定義されたサーバーのホスト名と最も類似したホスト名を持つレプリカに送信されます（両方のホスト名の最小長まで、同一位置における異なる文字数で比較）。

たとえば、example01-01-1 と example01-01-2 は 1 つの位置だけ異なりますが、example01-01-1 と example01-02-2 は 2 か所異なります。
この手法は単純に見えるかもしれませんが、ネットワークトポロジーに関する外部データを必要とせず、さらに IPv6 アドレスでは扱いが複雑になり得る IP アドレスの比較も行いません。

したがって、同等なレプリカが存在する場合は、名前が最も近いレプリカが優先されます。
また、障害がない状態で同じサーバーにクエリを送信する場合、分散クエリも同じサーバー群に送られると想定できます。そのため、レプリカごとに異なるデータが配置されている場合でも、クエリはほぼ同じ結果を返します。


### ホスト名のレーベンシュタイン距離 {#load_balancing-hostname_levenshtein_distance}

```sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname` と同様ですが、hostname を [レーベンシュタイン距離](https://en.wikipedia.org/wiki/Levenshtein_distance) で比較します。例えば次のとおりです。

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### 順番に {#load_balancing-in_order}

```sql
load_balancing = in_order
```

同じ数のエラーがあるレプリカには、設定で指定された順序どおりにアクセスされます。
この方式は、どのレプリカを優先すべきかを明確に把握している場合に適しています。


### 先頭 または ランダム {#load_balancing-first_or_random}

```sql
load_balancing = first_or_random
```

このアルゴリズムは、セット内の最初のレプリカ、もしくは最初のレプリカが利用できない場合はランダムなレプリカを選択します。クロスレプリケーションのトポロジー構成では効果的ですが、それ以外の構成ではほとんど意味がありません。

`first_or_random` アルゴリズムは、`in_order` アルゴリズムにおける問題を解決します。`in_order` では、1つのレプリカがダウンすると、次のレプリカが通常の2倍の負荷を受け、残りのレプリカは通常どおりのトラフィックしか処理しません。`first_or_random` アルゴリズムを使用すると、まだ利用可能なレプリカ間で負荷が均等に分散されます。

`load_balancing_first_offset` という SETTING を使用することで、最初のレプリカを明示的に定義できます。これにより、レプリカ間でクエリのワークロードのバランスをより柔軟に調整できます。


### ラウンドロビン {#load_balancing-round_robin}

```sql
load_balancing = round_robin
```

このアルゴリズムは、同じエラー数のレプリカ間でラウンドロビンポリシーを使用します（`round_robin` ポリシーが指定されたクエリのみがカウントされます）。


## load_balancing_first_offset {#load_balancing_first_offset} 

<SettingsInfoBlock type="UInt64" default_value="0" />

FIRST_OR_RANDOM ロードバランシング戦略が使用されている場合に、どのレプリカにクエリを優先的に送信するかを指定します。

## load_marks_asynchronously {#load_marks_asynchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree のマークを非同期で読み込む

## local_filesystem_read_method {#local_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

ローカルファイルシステムからデータを読み取る方法を指定します。指定可能な値はいずれか1つです: read, pread, mmap, io_uring, pread_threadpool。

「io_uring」メソッドは実験的なものであり、Log, TinyLog, StripeLog, File, Set, Join などのテーブルや、追記可能ファイルを持つその他のテーブルに対して、読み取りと書き込みが同時に行われる状況では動作しません。
インターネット上の「io_uring」に関するさまざまな記事を読んだとしても、それらに惑わされないでください。大量の小さな IO リクエストが発生するケース（ClickHouse では該当しません）を除き、これはファイルを読み取るより優れた方法にはなりません。「io_uring」を有効にする理由はありません。

## local_filesystem_read_prefetch {#local_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

ローカルファイルシステムからデータを読み込む際にプリフェッチを使用するかどうかを指定します。

## lock_acquire_timeout {#lock_acquire_timeout} 

<SettingsInfoBlock type="Seconds" default_value="120" />

ロック要求が失敗するまでの待機時間（秒）を定義します。

ロックのタイムアウトは、テーブルに対する読み取り/書き込み操作の実行中に発生し得るデッドロックから保護するために使用されます。タイムアウトが発生してロック要求が失敗した場合、ClickHouse サーバーはエラーコード `DEADLOCK_AVOIDED` と共に、例外「Locking attempt timed out! Possible deadlock avoided. Client should retry.」をスローします。

設定可能な値:

- 正の整数（秒単位）。
- 0 — ロックのタイムアウトなし。

## log&#95;comment {#log_comment}

[system.query&#95;log](../system-tables/query_log.md) テーブルの `log_comment` フィールドの値と、サーバーログ用のコメントテキストを指定します。

サーバーログの可読性を向上させるのに使用できます。加えて、[clickhouse-test](../../development/tests.md) を実行した後に `system.query_log` からテストに関連するクエリのみを抽出する際にも役立ちます。

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

結果:

```text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```


## log_formatted_queries {#log_formatted_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

整形されたクエリを [system.query_log](../../operations/system-tables/query_log.md) システムテーブルに記録できるようにします（[system.query_log](../../operations/system-tables/query_log.md) 内の `formatted_query` カラムに格納します）。

設定可能な値:

- 0 — 整形されたクエリはシステムテーブルに記録されません。
- 1 — 整形されたクエリはシステムテーブルに記録されます。

## log_processors_profiles {#log_processors_profiles} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

processor が実行中またはデータ待機中に費やした時間を、`system.processors_profile_log` テーブルに書き込みます。

関連項目:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events {#log_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリのパフォーマンス統計を query_log、query_thread_log、query_views_log に記録します。

## log&#95;queries {#log_queries}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリのログ記録を設定します。

この設定を有効にすると、ClickHouse に送信されたクエリは、[query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) サーバー構成パラメーターのルールに従ってログに記録されます。

例：

```text
log_queries=1
```


## log_queries_cut_to_length {#log_queries_cut_to_length} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

クエリの長さが指定した閾値（バイト数）を超える場合、`query_log` に書き込む際にクエリを切り詰めます。通常のテキストログに出力されるクエリの長さも制限します。

## log_queries_min_query_duration_ms {#log_queries_min_query_duration_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

ゼロ以外の値に設定して有効化すると、この SETTING の値より短い時間で完了するクエリはログに記録されません（[MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) における `long_query_time` と同様に考えることができます）。つまり、そのようなクエリは次のテーブルには含まれません。

- `system.query_log`
- `system.query_thread_log`

次のタイプを持つクエリのみがログに記録されます。

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 型: ミリ秒
- デフォルト値: 0（すべてのクエリ）

## log&#95;queries&#95;min&#95;type {#log_queries_min_type}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

`query_log` に記録する最小の種別。

指定可能な値:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

`query_log` に出力されるエントリの種別を制限するために使用できます。例えば、エラーのみに関心がある場合は、`EXCEPTION_WHILE_PROCESSING` を使用します。

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability {#log_queries_probability} 

<SettingsInfoBlock type="Float" default_value="1" />

指定した確率に基づき、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、および [query_views_log](../../operations/system-tables/query_views_log.md) システムテーブルには、ランダムに選択された一部のクエリのみを書き込みます。1 秒あたりのクエリ数が多い場合の負荷軽減に役立ちます。

Possible values:

- 0 — クエリはシステムテーブルに記録されません。
- [0..1] の範囲の正の浮動小数点数。たとえば、この設定値が `0.5` の場合、クエリのおよそ半分がシステムテーブルに記録されます。
- 1 — すべてのクエリがシステムテーブルに記録されます。

## log_query_settings {#log_query_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

`query_log` および OpenTelemetry のスパンログにクエリ設定を記録します。

## log&#95;query&#95;threads {#log_query_threads}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリスレッドのログ記録を有効化する設定です。

クエリスレッドは [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) テーブルに記録されます。この設定は、[log&#95;queries](#log_queries) が true の場合にのみ有効です。この設定が有効な場合、ClickHouse によって実行されるクエリのスレッドは、[query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) サーバー設定パラメータで定義されたルールに従ってログに記録されます。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

```text
log_query_threads=1
```


## log&#95;query&#95;views {#log_query_views}

<SettingsInfoBlock type="Bool" default_value="1" />

クエリビューのログ出力を設定します。

この設定を有効にした状態で ClickHouse が実行したクエリに関連する VIEW（マテリアライズドビューまたはライブビュー）がある場合、それらは [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) サーバー設定パラメータに記録されます。

例:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format {#low_cardinality_allow_in_native_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型を [Native](/interfaces/formats/Native) フォーマットで使用できるかどうかを許可または制限します。

`LowCardinality` の使用が制限されている場合、ClickHouse サーバーは `SELECT` クエリに対して `LowCardinality` カラムを通常のカラムに変換し、`INSERT` クエリに対して通常のカラムを `LowCardinality` カラムに変換します。

この設定は主に、`LowCardinality` データ型をサポートしていないサードパーティー製クライアント向けに必要になります。

設定可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用は制限されます。

## low_cardinality_max_dictionary_size {#low_cardinality_max_dictionary_size} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型に対して、ストレージのファイルシステムに書き込むことができる共有グローバル Dictionary の最大サイズ（行数）を設定します。この設定により、Dictionary が無制限に増大した場合の RAM に関する問題を防ぎます。Dictionary の最大サイズ制限によりエンコードできないデータは、すべて ClickHouse によって通常の方法で書き込まれます。

設定可能な値:

- 任意の正の整数。

## low_cardinality_use_single_dictionary_for_part {#low_cardinality_use_single_dictionary_for_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

1つのデータパートに対して単一の Dictionary を使用するかどうかを制御します。

デフォルトでは、ClickHouse サーバーは Dictionary のサイズを監視し、Dictionary がオーバーフローした場合、サーバーは次の Dictionary への書き込みを開始します。複数の Dictionary の作成を禁止するには、`low_cardinality_use_single_dictionary_for_part = 1` を設定します。

設定値:

- 1 — データパートに対して複数の Dictionary を作成することを禁止します。
- 0 — データパートに対して複数の Dictionary を作成することを許可します。

## low_priority_query_wait_time_ms {#low_priority_query_wait_time_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "新しい設定。"}]}]}/>

`priority` 設定（クエリの優先順位付けメカニズム）を使用している場合、低優先度のクエリは高優先度のクエリが終了するまで待機します。この設定は、その待機時間をミリ秒単位で指定します。

## make_distributed_plan {#make_distributed_plan} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランを作成する。

## materialize_skip_indexes_on_insert {#materialize_skip_indexes_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時の skip index マテリアライズを無効化できる新しい設定を追加"}]}]}/>

有効な場合、INSERT 文は skip index を構築して保存します。無効な場合、skip index は[マージ中](merge-tree-settings.md/#materialize_skip_indexes_on_merge)か、明示的に [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) を実行したときにのみ構築および保存されます。

[exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert) も参照してください。

## materialize_statistics_on_insert {#materialize_statistics_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時に統計情報のマテリアライズを無効化できる新しい設定を追加"}]}]}/>

INSERT 時に統計情報を作成して挿入します。この設定を無効化した場合、統計情報はマージ時、または明示的な MATERIALIZE STATISTICS 実行時に作成・保存されます。

## materialize_ttl_after_modify {#materialize_ttl_after_modify} 

<SettingsInfoBlock type="Bool" default_value="1" />

ALTER MODIFY TTL クエリ実行後に、既存データへ TTL を適用します。

## materialized_views_ignore_errors {#materialized_views_ignore_errors} 

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZED VIEW で発生したエラーを無視し、materialized view の有無や結果にかかわらず元のブロックをテーブルに書き込めるようにします

## materialized_views_squash_parallel_inserts {#materialized_views_squash_parallel_inserts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "必要に応じて従来の挙動を維持するための設定を追加。"}]}]}/>

単一の INSERT クエリで materialized view の宛先テーブルに行われる挿入を、並列挿入ではなく 1 つにまとめることで、生成されるパーツの数を削減します。
false に設定されていて、かつ `parallel_view_processing` が有効な場合、INSERT クエリは宛先テーブルに対して `max_insert_thread` ごとに 1 つのパーツを生成します。

## max_analyze_depth {#max_analyze_depth} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

インタプリタが実行する分析の最大回数。

## max_ast_depth {#max_ast_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

クエリの構文木における最大ネスト深度です。これを超えると、例外がスローされます。

:::note
現時点では、パース中ではなく、クエリのパース後にのみチェックされます。
つまり、パース中に深さが深すぎる構文木が作成される可能性はありますが、
その場合、そのクエリは失敗します。
:::

## max_ast_elements {#max_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

クエリの構文木に含められる要素数の上限です。超過すると例外がスローされます。

:::note
現時点では構文解析中にはチェックされず、クエリの構文解析後にのみチェックされます。
これは、構文解析中に過度に深い構文木が生成される可能性があるものの、
その場合はクエリが失敗することを意味します。
:::

## max_autoincrement_series {#max_autoincrement_series} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

`generateSerialID` 関数によって作成される series の数の上限値です。

各 series は Keeper 内のノードを表すため、その数は最大でも数百万個程度に抑えることが推奨されます。

## max_backup_bandwidth {#max_backup_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバー上の特定のバックアップに対して、1 秒あたりの最大読み取り速度（バイト数）を指定します。ゼロは無制限を意味します。

## max_block_size {#max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

ClickHouse では、データはブロック単位で処理されます。ブロックとは、複数のカラムのパーツの集合です。1 つのブロックに対する内部処理サイクル自体は効率的ですが、各ブロックを処理する際には一定のコストが発生します。

`max_block_size` 設定は、テーブルからデータを読み込む際に、1 つのブロックに含める行数の推奨される最大値を示します。常に `max_block_size` と同じサイズのブロックがテーブルから読み込まれるわけではなく、ClickHouse がより少ないデータのみを取得すればよいと判断した場合には、より小さいブロックが処理されます。

ブロックサイズが小さすぎると、各ブロックを処理する際のコストが目立つようになります。一方で、ブロックサイズが大きすぎると、最初のブロックを処理した後に LIMIT 句付きのクエリをすばやく実行することが難しくなります。`max_block_size` を設定する際は、多数のカラムを複数スレッドで抽出する場合でもメモリ消費が過大にならないようにしつつ、ある程度のキャッシュ局所性を維持することを目標とします。

## max_bytes_before_external_group_by {#max_bytes_before_external_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud のデフォルト値: レプリカごとのメモリ量の半分。

`GROUP BY` 句を外部メモリで実行するかどうかを有効または無効にします。
（[外部メモリでの GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory) を参照）

設定可能な値:

- 単一の [GROUP BY](/sql-reference/statements/select/group-by) 処理で使用可能な RAM の最大容量（バイト単位）。
- `0` — 外部メモリでの `GROUP BY` を無効化。

:::note
GROUP BY の実行中にメモリ使用量がこのバイト単位のしきい値を超えた場合、
「外部集約」モードが有効になり（データがディスクに書き出されます）。

推奨値は、利用可能なシステムメモリの半分です。
:::

## max_bytes_before_external_sort {#max_bytes_before_external_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud でのデフォルト値: レプリカごとのメモリ量の半分。

`ORDER BY` 句を外部メモリで実行するかどうかを制御します。詳細は [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。
ORDER BY 実行中のメモリ使用量がこのしきい値（バイト数）を超えると、「外部ソート」モード（ディスクへの書き出し／スピル）が有効になります。

設定可能な値:

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作で使用可能な RAM の最大容量（バイト数）。
  推奨値は、利用可能なシステムメモリの半分です。
- `0` — 外部メモリでの `ORDER BY` を無効にします。

## max_bytes_before_remerge_sort {#max_bytes_before_remerge_sort} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

ORDER BY 句と LIMIT 句を伴うクエリで、メモリ使用量が指定されたしきい値を超えた場合、最終的なマージの前にブロックを追加でマージするステップを実行し、上位 LIMIT 行のみを保持するようにします。

## max_bytes_in_distinct {#max_bytes_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`DISTINCT` を使用する際に、ハッシュテーブルがメモリ上で保持する状態の最大バイト数（非圧縮）。

## max_bytes_in_join {#max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブルの最大サイズ（バイト数）を指定します。

この設定は、[SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join テーブルエンジン](/engines/table-engines/special/join) に適用されます。

クエリに JOIN が含まれている場合、ClickHouse はすべての中間結果に対してこの設定をチェックします。

制限に達したときに ClickHouse が取りうる動作がいくつかあります。
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値:

- 正の整数。
- 0 — メモリ制御を無効にします。

## max_bytes_in_set {#max_bytes_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから作成された `IN` 句内の集合によって使用される（非圧縮データの）最大バイト数。

## max_bytes_ratio_before_external_group_by {#max_bytes_ratio_before_external_group_by} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトで自動的にディスクへのスピルを有効化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

利用可能メモリのうち、`GROUP BY` に使用を許可する割合です。この値に達すると、
集約処理に外部メモリが使用されます。

例えば `0.6` に設定した場合、実行開始時点で `GROUP BY` は
(サーバー/ユーザー/マージ処理向けの) 利用可能メモリの 60% まで使用でき、
その後は外部集約を使用し始めます。

## max_bytes_ratio_before_external_sort {#max_bytes_ratio_before_external_sort} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトで自動的にディスクへのスピルを有効化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`ORDER BY` で使用が許可される、利用可能メモリに対する比率です。この値に達すると、外部ソートが使用されます。

例えば `0.6` に設定した場合、実行の開始時点で `ORDER BY` は利用可能メモリ（サーバー/ユーザー/マージ用）の `60%` まで使用できますが、その後は外部ソートを使用し始めます。

`max_bytes_before_external_sort` は引き続き有効である点に注意してください。ソートするブロックが `max_bytes_before_external_sort` より大きい場合にのみ、ディスクへのスピルが行われます。

## max_bytes_to_read {#max_bytes_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時に、テーブルから読み取ることができる非圧縮データの最大バイト数です。
この制限は処理される各データチャンクごとにチェックされ、最も内側のテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合は、そのリモートサーバー上でのみチェックが行われます。

## max_bytes_to_read_leaf {#max_bytes_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取ることができる非圧縮データの最大バイト数です。分散クエリは各分片（リーフ）に対して複数のサブクエリを発行することがありますが、この制限はリーフノードでの読み取り段階でのみチェックされ、ルートノードでの結果マージ段階では無視されます。

たとえば、クラスタが 2 つの分片で構成されており、それぞれの分片に 100 バイトのデータを含むテーブルがあるとします。両方のテーブルからすべてのデータを読み取ることを想定した分散クエリで `max_bytes_to_read=150` が指定されている場合、合計で 200 バイトとなるため失敗します。`max_bytes_to_read_leaf=150` を指定したクエリは、リーフノードごとに最大 100 バイトのみを読み取るため成功します。

この制限は、処理される各データ chunk ごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合は動作が不安定です。
:::

## max_bytes_to_sort {#max_bytes_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート前の最大バイト数です。ORDER BY 操作で処理しなければならない非圧縮データ量（バイト数）が指定値を超えた場合の挙動は、デフォルトでは `throw` に設定されている `sort_overflow_mode` によって決定されます。

## max_bytes_to_transfer {#max_bytes_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN セクションの実行時に、リモートサーバーへ送信できる、または一時テーブルに保存できる非圧縮データの最大バイト数。

## max_columns_to_read {#max_columns_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 回のクエリでテーブルから読み取ることができるカラムの最大数です。
クエリで読み取る必要があるカラム数がこの値を超える場合、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを防ぐのに役立ちます。
:::

`0` を指定した場合は無制限になります。

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

テーブルに書き込む際の、圧縮前データブロックの最大サイズです。デフォルトは 1,048,576（1 MiB）です。より小さいブロックサイズを指定すると、通常、圧縮率はわずかに低下しますが、キャッシュ局所性により圧縮および伸長の速度がわずかに向上し、メモリ消費量も削減されます。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないでください。
:::

圧縮用のブロック（バイトからなるメモリの chunk）と、クエリ処理用のブロック（テーブルからの一連の行）を混同しないでください。

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users {#max_concurrent_queries_for_all_users}

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定値が現在同時に処理されているクエリ数以下の場合、例外がスローされます。

例: `max_concurrent_queries_for_all_users` を全ユーザーに対して 99 に設定し、データベース管理者だけは 100 に設定しておくことで、サーバーが過負荷状態でも調査用のクエリを実行できます。

1つのクエリまたはユーザーに対してこの設定を変更しても、他のクエリやユーザーには影響しません。

取り得る値:

* 正の整数。
* 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**関連項目**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max&#95;concurrent&#95;queries&#95;for&#95;user {#max_concurrent_queries_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

ユーザーごとに同時に処理されるクエリの最大数。

設定可能な値:

* 正の整数。
* 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections {#max_distributed_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

1 つのクエリに対して、1 つの分散テーブルの分散処理に使用されるリモートサーバーへの同時接続の最大数です。クラスタ内のサーバー台数以上の値を設定することを推奨します。

以下のパラメータは、分散テーブルの作成時（およびサーバー起動時）にのみ使用されるため、実行時に変更しても意味はありません。

## max_distributed_depth {#max_distributed_depth} 

<SettingsInfoBlock type="UInt64" default_value="5" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルに対する再帰クエリの最大深さを制限します。

この値を超えると、サーバーは例外を送出します。

設定可能な値:

- 正の整数
- 0 — 深さに制限なし

## max_download_buffer_size {#max_download_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

各スレッドごとに、並列ダウンロード（例: URL エンジンなど）に使用されるバッファの最大サイズ。

## max_download_threads {#max_download_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

データをダウンロードする際に使用するスレッド数の上限（例：URL エンジン）。

## max_estimated_execution_time {#max_estimated_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "max_execution_time と max_estimated_execution_time を分離"}]}]}/>

クエリの推定最大実行時間（秒）。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
の有効期限が切れるたびに、すべてのデータブロックに対してチェックされます。

## max_execution_speed {#max_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最大実行行数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
のタイムアウトが発生するたびに、各データブロックでチェックされます。実行速度が上限を超えた場合は、実行速度が抑制されます。

## max_execution_speed_bytes {#max_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりに処理できる最大バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が有効期限切れになるたびに、すべてのデータブロックで確認されます。実行速度が高すぎる場合、実行速度は抑制されます。

## max_execution_time {#max_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

クエリの最大実行時間（秒単位）。

`max_execution_time` パラメータは、少し理解しづらい場合があります。
これは、現在のクエリ実行速度に対する補間に基づいて動作します
（この動作は [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) によって制御されます）。

ClickHouse は、予測される実行時間が指定した `max_execution_time` を超える場合、
クエリを中断します。デフォルトでは、`timeout_before_checking_execution_speed`
は 10 秒に設定されています。つまり、クエリが 10 秒間実行された後に、ClickHouse は
総実行時間の見積もりを開始します。例えば、`max_execution_time`
が 3600 秒（1 時間）に設定されている場合、推定時間がこの 3600 秒の上限を超えると、
ClickHouse はクエリを終了します。`timeout_before_checking_execution_speed`
を 0 に設定した場合、ClickHouse は `max_execution_time` の基準として実時間を使用します。

クエリの実行時間が指定した秒数を超えた場合の動作は、
`timeout_overflow_mode` によって決定され、デフォルトでは `throw` に設定されています。

:::note
タイムアウトはチェックが行われるタイミングでのみ評価され、クエリが停止できるのも
データ処理中の特定の箇所に限られます。
現時点では、集約状態のマージ中やクエリ解析中には停止できず、
実際の実行時間はこの設定値より長くなります。
:::

## max&#95;execution&#95;time&#95;leaf {#max_execution_time_leaf}

<SettingsInfoBlock type="Seconds" default_value="0" />

[`max_execution_time`](#max_execution_time) と意味的には類似していますが、
分散クエリまたはリモートクエリにおいてリーフノードにのみ適用されます。

例えば、リーフノードでの実行時間を `10s` に制限しつつ、最初のノード側には制限を設けないようにしたい場合は、
入れ子になったサブクエリの設定で `max_execution_time` を使う代わりに次のようにします:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

`max_execution_time_leaf` をクエリ設定として使用できます。

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements {#max_expanded_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

エイリアスおよびアスタリスクの展開後におけるノード数で表される、クエリ構文木の最大サイズ。

## max_fetch_partition_retries_count {#max_fetch_partition_retries_count} 

<SettingsInfoBlock type="UInt64" default_value="5" />

別のホストからパーティションを取得する際の再試行回数。

## max_final_threads {#max_final_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付きの `SELECT` クエリにおけるデータ読み取りフェーズの並列スレッド数の上限を設定します。

設定可能な値は次のとおりです:

- 正の整数。
- 0 または 1 — 無効。`SELECT` クエリは単一スレッドで実行されます。

## max_http_get_redirects {#max_http_get_redirects} 

<SettingsInfoBlock type="UInt64" default_value="0" />

許可される HTTP GET リダイレクトの最大ホップ数です。悪意のあるサーバーがリクエストを予期しないサービスへリダイレクトするのを防ぐための追加のセキュリティ対策です。\n\n外部サーバーが別のアドレスにリダイレクトするものの、そのアドレスが社内インフラストラクチャ内のものに見える場合があります。このとき内部サーバーに HTTP リクエストを送信すると、認証をバイパスして内部ネットワークから内部 API を呼び出せてしまったり、Redis や Memcached など他のサービスにクエリを送信できてしまう可能性があります。社内インフラストラクチャ（localhost 上で動作しているものを含む）が存在しない場合、またはサーバーを信頼している場合は、リダイレクトを許可しても安全です。ただし、URL が HTTPS ではなく HTTP を使用している場合には、信頼すべき対象はリモートサーバーだけでなく、ISP や経路上のすべてのネットワークも含まれることに留意してください。

## max&#95;hyperscan&#95;regexp&#95;length {#max_hyperscan_regexp_length}

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
例外: 正規表現の長さが大きすぎます。
```

**関連項目**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max&#95;hyperscan&#95;regexp&#95;total&#95;length {#max_hyperscan_regexp_total_length}

<SettingsInfoBlock type="UInt64" default_value="0" />

各 [hyperscan multi-match function](/sql-reference/functions/string-search-functions#multiMatchAny) で、すべての正規表現の合計の長さの上限を設定します。

取りうる値:

* 正の整数。
* 0 - 長さに制限はありません。

**例**

クエリ:

```sql
SELECT multiMatchAny('abcd', ['a','b','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

結果：

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
例外: 正規表現の合計長が大きすぎます。
```

**関連項目**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size {#max_insert_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

テーブルへの挿入時に作成されるブロックのサイズ（行数単位）を指定します。
この設定が適用されるのは、サーバー側でブロックを形成する場合のみです。
たとえば HTTP インターフェース経由での INSERT では、サーバーがデータフォーマットをパースし、指定されたサイズのブロックを形成します。
一方、clickhouse-client を使用する場合はクライアント側でデータがパースされるため、サーバー上の `max_insert_block_size` 設定は挿入されるブロックのサイズに影響しません。
また、INSERT SELECT を使用する場合にもこの設定は意味を持ちません。データは、SELECT の結果として形成されたブロックと同じブロック単位で挿入されるためです。

デフォルト値は `max_block_size` よりわずかに大きくなっています。これは、特定のテーブルエンジン（`*MergeTree`）が、挿入された各ブロックごとにディスク上にデータパートを形成し、これがかなり大きなエンティティとなるためです。同様に、`*MergeTree` テーブルは挿入時にデータをソートするため、十分に大きなブロックサイズをとることで、より多くのデータを RAM 内でソートできるようにしています。

## max_insert_delayed_streams_for_parallel_write {#max_insert_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="0" />

最終パーツのフラッシュを遅延させるストリーム（カラム）の最大数。デフォルトは auto（基盤ストレージが S3 などの並列書き込みをサポートする場合は 100、それ以外の場合は無効化）。

## max_insert_threads {#max_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT SELECT` クエリを実行する際の最大スレッド数。

取りうる値:

- 0 (または 1) — `INSERT SELECT` は並列実行しない。
- 正の整数。1 より大きい値。

Cloud におけるデフォルト値:

- メモリ 8 GiB のノードでは `1`
- メモリ 16 GiB のノードでは `2`
- それより大きいノードでは `4`

並列 `INSERT SELECT` は、`SELECT` 部分が並列実行される場合にのみ有効です。[`max_threads`](#max_threads) 設定も参照してください。
値を大きくすると、メモリ使用量は増加します。

## max_joined_block_size_bytes {#max_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

JOIN の結果に対する最大ブロックサイズ（バイト単位、JOIN アルゴリズムがサポートしている場合に適用）。0 を指定すると無制限になります。

## max_joined_block_size_rows {#max_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN 結果の最大ブロックサイズ（JOIN アルゴリズムが対応している場合）。0 は無制限を意味します。

## max_limit_for_vector_search_queries {#max_limit_for_vector_search_queries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

この値より大きい LIMIT を指定した SELECT クエリは、ベクトル類似性インデックスを使用できません。ベクトル類似性インデックスでのメモリのオーバーフローを防ぐのに役立ちます。

## max_local_read_bandwidth {#max_local_read_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルでの読み取り速度の上限（1 秒あたりのバイト数）。

## max_local_write_bandwidth {#max_local_write_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込みの最大速度（バイト/秒）。

## max_memory_usage {#max_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud のデフォルト値: レプリカ上の RAM 量に依存します。

単一サーバー上でクエリを実行する際に使用できる RAM の最大量です。
値が `0` の場合は無制限を意味します。

この設定は、利用可能なメモリ量やマシン上の総メモリ量を考慮しません。
制限は単一サーバー内の単一クエリに適用されます。

各クエリの現在のメモリ使用量を確認するには `SHOW PROCESSLIST` を使用できます。
ピークメモリ使用量はクエリごとに追跡され、ログに書き込まれます。

次の集約関数については、`String` および `Array` 引数からの状態に対しては
メモリ使用量が完全には追跡されません:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

メモリ使用量は、[`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
および [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) のパラメータによっても制限されます。

## max&#95;memory&#95;usage&#95;for&#95;user {#max_memory_usage_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

単一のサーバー上で、特定ユーザーのクエリを実行する際に使用できる RAM の最大量を指定します。0 は無制限を意味します。

デフォルトでは、この値には制限がありません（`max_memory_usage_for_user = 0`）。

[`max_memory_usage`](/operations/settings/settings#max_memory_usage) の説明も参照してください。

たとえば、`clickhouse_read` という名前のユーザーに対して `max_memory_usage_for_user` を 1000 バイトに設定したい場合は、次のステートメントを使用できます。

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

クライアントから一度ログアウトして再度ログインし、その後に `getSetting` 関数を使用して、設定が正しく適用されていることを確認できます。

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth {#max_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ交換速度を、1 秒あたりのバイト数で制限します。この設定はすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — 帯域幅制御は無効になります。

## max_network_bandwidth_for_all_users {#max_network_bandwidth_for_all_users} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でデータが転送される速度を、1 秒あたりのバイト数で制限します。この設定は、サーバー上で同時に実行されているすべてのクエリに適用されます。

取りうる値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bandwidth_for_user {#max_network_bandwidth_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由のデータ交換速度を、1 秒あたりのバイト数で制限します。この設定は、単一のユーザーによって同時に実行されているすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bytes {#max_network_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行する際に、ネットワークを介して送受信されるデータ量（バイト数）の上限を設定します。この設定は各クエリに対して個別に適用されます。

許容される値:

- 正の整数。
- 0 — データ量の制限を無効にします。

## max_number_of_partitions_for_independent_aggregation {#max_number_of_partitions_for_independent_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="128" />

テーブル内でこの最適化を適用できるパーティションの最大数

## max_os_cpu_wait_time_ratio_to_throw {#max_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを判断する際に使用される、OS の CPU 待ち時間（`OSCPUWaitMicroseconds` メトリック）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリック）の最大比率です。確率を計算するために、最小比率と最大比率の間で線形補間が行われ、この時点で確率は 1 になります。

## max_parallel_replicas {#max_parallel_replicas} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "デフォルトで最大 1000 個の並列レプリカを使用します。"}]}]}/>

クエリ実行時に、各分片ごとに使用されるレプリカの最大数です。

指定可能な値:

- 正の整数。

**追加情報**

この設定は、他の設定値によって結果が変わる場合があります。

:::note
`JOIN` やサブクエリが関係していて、すべてのテーブルが特定の要件を満たしていない場合、この設定によって誤った結果が返される可能性があります。詳細は [Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas) を参照してください。
:::

### `SAMPLE` キーを使用した並列処理 {#parallel-processing-using-sample-key}

クエリは、複数のサーバー上で並列に実行することで、より高速に処理できる場合があります。ただし、次のような場合にはクエリの性能が低下することがあります。

- サンプリングキーのパーティショニングキー内での位置が、効率的なレンジスキャンを行うのに適していない場合。
- テーブルにサンプリングキーを追加することで、他のカラムによるフィルタリングが非効率になる場合。
- サンプリングキーが計算コストの高い式である場合。
- クラスターのレイテンシ分布にロングテールが存在し、より多くのサーバーへクエリを送ることで、クエリ全体のレイテンシが増加する場合。

### [parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用した並列処理 {#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key}

この設定は、任意のレプリケートテーブルで利用できます。

## max_parser_backtracks {#max_parser_backtracks} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

最大パーサーバックトラック回数（再帰下降構文解析処理で、異なる代替案を試行する回数の上限）。

## max_parser_depth {#max_parser_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

再帰下降パーサーにおける最大再帰深度を制限します。スタックサイズを制御するために使用します。

設定可能な値:

- 正の整数。
- 0 — 再帰深度は無制限です。

## max_parsing_threads {#max_parsing_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "ファイルからの並列パースにおけるスレッド数を制御するための個別の設定を追加"}]}]}/>

並列パースをサポートする入力フォーマットでデータをパースするためのスレッド数の最大値です。既定では自動的に決定されます。

## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時に DROP できるパーティションのサイズ制限です。値 `0` は、制限なくパーティションを DROP できることを意味します。

Cloudでのデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー側の設定を上書きします。[max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop) を参照してください。
:::

## max_partitions_per_insert_block {#max_partitions_per_insert_block} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "1 つのブロック内のパーティション数に上限を追加"}]}]}/>

1 回の挿入で 1 つのブロック内に含められるパーティション数の上限を制限し、
ブロックに含まれるパーティション数が多すぎる場合には例外がスローされます。

- 正の整数。
- `0` — パーティション数に上限なし。

**詳細**

データを挿入する際、ClickHouse は挿入ブロック内のパーティション数を計算します。
パーティション数が `max_partitions_per_insert_block` を超える場合、
ClickHouse は `throw_on_max_partitions_per_insert_block` に基づいて
警告をログに記録するか、例外をスローします。例外メッセージは次のとおりです。

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
多数のパーティションを使用すべきだという考えは一般的な誤解であり、この設定はそれに対する安全のためのしきい値です。
:::

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

1回のクエリでアクセスできるパーティションの最大数を制限します。

テーブル作成時に指定した設定値は、クエリレベルの設定で上書きできます。

設定可能な値:

- 正の整数
- `-1` - 無制限（デフォルト）

:::note
MergeTree の設定として [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) をテーブルの設定で指定することもできます。
:::

## max_parts_to_move {#max_parts_to_move} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

1回のクエリで移動できるパーツの数を制限します。0 は無制限を意味します。

## max_projection_rows_to_use_projection_index {#max_projection_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "新しい設定"}]}]}/>

プロジェクションインデックスから読み取る行数がこのしきい値以下の場合、ClickHouse はクエリ実行時にプロジェクションインデックスの適用を試みます。

## max_query_size {#max_query_size} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL パーサーが解析するクエリ文字列の最大サイズ（バイト数）です。
INSERT クエリの VALUES 句内のデータは、別のストリームパーサー（RAM を O(1) しか消費しない）によって処理され、この制限の影響は受けません。

:::note
`max_query_size` は SQL クエリ内では設定できません（例: `SELECT now() SETTINGS max_query_size=10000`）。これは、ClickHouse がクエリを解析するためのバッファを事前に確保する必要があり、そのバッファサイズが `max_query_size` の設定によって決まるためです。この設定はクエリ実行前に行っておく必要があります。
:::

## max_read_buffer_size {#max_read_buffer_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

ファイルシステムから読み込むバッファの最大サイズ。

## max_read_buffer_size_local_fs {#max_read_buffer_size_local_fs} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

ローカルファイルシステムから読み込む際に使用されるバッファの最大サイズです。0 に設定すると、max_read_buffer_size が使用されます。

## max_read_buffer_size_remote_fs {#max_read_buffer_size_remote_fs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートファイルシステムからの読み込みに使用するバッファの最大サイズ。0 に設定した場合は、max_read_buffer_size が使用されます。

## max_recursive_cte_evaluation_depth {#max_recursive_cte_evaluation_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "再帰CTEの評価深度の上限"}]}]}/>

再帰CTEの評価深度の上限

## max_remote_read_network_bandwidth {#max_remote_read_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時における、ネットワーク上でのデータ交換の最大速度（1 秒あたりのバイト数）の上限です。

## max_remote_write_network_bandwidth {#max_remote_write_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時のネットワーク経由のデータ転送の最大速度（1 秒あたりのバイト数）。

## max_replica_delay_for_distributed_queries {#max_replica_delay_for_distributed_queries} 

<SettingsInfoBlock type="UInt64" default_value="300" />

分散クエリで、遅延しているレプリカを使用しないようにします。[Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

時間を秒単位で指定します。レプリカの遅延が設定値以上の場合、そのレプリカは使用されません。

可能な値:

- 正の整数。
- 0 — レプリカの遅延はチェックされません。

遅延が 0 でないレプリカを一切使用しないようにするには、このパラメータを 1 に設定します。

レプリケーションされたテーブルを参照する分散テーブルに対して `SELECT` を実行する際に使用されます。

## max_result_bytes {#max_result_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

結果サイズをバイト数（非圧縮）で制限します。しきい値に達した場合、クエリはその時点で処理中だったデータブロックの処理完了後に停止しますが、最後の結果ブロックは途中で切り捨てられないため、結果サイズがしきい値を上回る場合があります。

**注意事項**

このしきい値には、メモリ上での結果サイズが考慮されます。
結果サイズが小さい場合でも、メモリ上のより大きなデータ構造（LowCardinality カラムの辞書や、
AggregateFunction カラムの Arena など）を参照している可能性があるため、
結果サイズが小さくても、しきい値を超えることがあります。

:::warning
この設定はかなり低レベルなものであり、注意して使用する必要があります
:::

## max_result_rows {#max_result_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud のデフォルト値: `0`。

結果セットに含める行数の上限を設定します。サブクエリや、分散クエリの一部を実行するリモートサーバー上でもチェックされます。
値が `0` の場合は制限は適用されません。

しきい値に達した場合、クエリはデータブロックの処理後に停止しますが、
結果の最後のブロックは途中で切り捨てられないため、結果の行数が
しきい値より多くなることがあります。

## max_reverse_dictionary_lookup_cache_size_bytes {#max_reverse_dictionary_lookup_cache_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "新しい設定。関数 `dictGetKeys` が使用する、クエリ単位の逆引き Dictionary ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で Dictionary を再スキャンしないよう、属性値ごとにシリアル化されたキーのタプルを保存します。"}]}]}/>

関数 `dictGetKeys` が使用する、クエリ単位の逆引き Dictionary ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で Dictionary を再スキャンしないよう、属性値ごとにシリアル化されたキーのタプルを保存します。上限に達すると、LRU によってエントリが削除されます。キャッシュを無効にするには 0 を設定します。

## max_rows_in_distinct {#max_rows_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

DISTINCT 句を使用する際に許可される異なる行の最大数。

## max_rows_in_join {#max_rows_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブル内の行数の上限を設定します。

この設定は、[SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join](/engines/table-engines/special/join) テーブルエンジンに適用されます。

クエリに複数の結合が含まれる場合、ClickHouse は各中間結果に対してこの設定をチェックします。

上限に達したとき、ClickHouse はさまざまな動作を実行できます。
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値:

- 正の整数。
- `0` — 行数に制限なし。

## max_rows_in_set {#max_rows_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 句のサブクエリから生成されるデータセットの最大行数。

## max_rows_in_set_to_optimize_join {#max_rows_in_set_to_optimize_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "read-in-order 最適化を阻害するため、join の最適化を無効化"}]}]}/>

結合を実行する前に、互いの行集合を使って結合対象テーブルをフィルタリングする際に用いられる集合の最大サイズ。

設定可能な値:

- 0 — 無効。
- 任意の正の整数。

## max_rows_to_group_by {#max_rows_to_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

集約で取得される一意キーの最大数です。この設定により、集約時のメモリ消費を制限できます。

GROUP BY 中の集約で、指定した数より多くの行（一意な GROUP BY キー）が生成される場合、その挙動は `group_by_overflow_mode` によって決まります。デフォルトは `throw` ですが、近似 GROUP BY モードに切り替えることもできます。

## max_rows_to_read {#max_rows_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ実行時にテーブルから読み取ることができる最大行数です。
この制限は処理される各データ chunk ごとにチェックされ、最も深いテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合は、リモートサーバー側でのみチェックされます。

## max_rows_to_read_leaf {#max_rows_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取ることができる行数の最大値です。分散クエリは各分片（リーフ）に対して複数のサブクエリを発行することがありますが、この制限はリーフノードでの読み取り段階でのみチェックされ、ルートノードでの結果マージ段階では無視されます。

例えば、クラスタが 2 つの分片で構成され、それぞれの分片に 100 行のテーブルが含まれているとします。両方のテーブルからすべてのデータを読み取ることを想定した分散クエリで `max_rows_to_read=150` を設定すると、合計で 200 行になるため失敗します。一方、`max_rows_to_read_leaf=150` を指定したクエリは成功します。これは、リーフノードでは最大でも 100 行しか読み取らないためです。

この制限は、処理される各データ chunk ごとにチェックされます。

:::note
この SETTING は `prefer_localhost_replica=1` の場合は安定しません。
:::

## max_rows_to_sort {#max_rows_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート対象となる行数の最大値です。これにより、ソート時のメモリ消費量を制限できます。
ORDER BY 演算で処理する必要がある行数が指定した値を超えた場合、
動作は、デフォルトで `throw` に設定されている `sort_overflow_mode` によって決まります。

## max_rows_to_transfer {#max_rows_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`GLOBAL IN` / `JOIN` セクションの実行時に、リモートサーバーへ渡すか一時テーブルに保存できる最大行数。

## max&#95;sessions&#95;for&#95;user {#max_sessions_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

認証済みユーザー1人あたりの ClickHouse サーバーへの最大同時セッション数。

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
    <!-- ユーザーAliceは一度に1回のみClickHouseサーバーに接続できます。 -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- ユーザーBobは同時に2つのセッションを使用できます。 -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- ユーザーCharlesは任意の数の同時セッションを使用できます。 -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

指定可能な値:

* 正の整数
* `0` - 同時セッション数が無制限（デフォルト）


## max_size_to_preallocate_for_aggregation {#max_size_to_preallocate_for_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効にします。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "パフォーマンスを最適化します。"}]}]}/>

集約前に、すべてのハッシュテーブルで合計いくつの要素分まで領域を事前確保することを許可するかを指定します。

## max_size_to_preallocate_for_joins {#max_size_to_preallocate_for_joins} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新しい設定です。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効にします。"}]}]}/>

結合を行う前に、すべてのハッシュテーブルで事前に領域を確保できる要素数の合計上限。

## max_streams_for_merge_tree_reading {#max_streams_for_merge_tree_reading} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外の値に設定されている場合、MergeTree テーブルの読み取りストリーム数を制限します。

## max_streams_multiplier_for_merge_tables {#max_streams_multiplier_for_merge_tables} 

<SettingsInfoBlock type="Float" default_value="5" />

Merge テーブルから読み込む際に、より多くのストリームを利用するようにします。ストリームは、Merge テーブルが参照する各テーブル間に分散されます。これにより、スレッド間での処理負荷がより均等に分散され、特にマージ対象のテーブル同士でサイズが異なる場合に有用です。

## max_streams_to_max_threads_ratio {#max_streams_to_max_threads_ratio} 

<SettingsInfoBlock type="Float" default_value="1" />

スレッド数より多くのソースを使用できるようにし、スレッド間で作業をより均等に分散できるようにします。これは一時的な解決策と想定されています。将来的には、ソース数をスレッド数と同じにした上で、各ソースが自分用の利用可能な作業を動的に選択できるようにすることが可能になる予定です。

## max_subquery_depth {#max_subquery_depth} 

<SettingsInfoBlock type="UInt64" default_value="100" />

クエリに含まれるネストされたサブクエリの数がこの値を超えた場合、
例外をスローします。

:::tip
これにより、クラスタのユーザーが過度に複雑なクエリを書かないようにする
サニティチェックとして機能し、保護することができます。
:::

## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時にテーブルを削除する際の制限です。値 `0` は、制限なくすべてのテーブルを削除できることを意味します。

Cloud のデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー側の設定を上書きします。詳しくは [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop) を参照してください。
:::

## max_temporary_columns {#max_temporary_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ実行時に、定数カラムを含め、RAM 上に同時に保持できる一時カラムの最大数です。中間計算の結果としてメモリ上で生成される一時カラムの数がこの値を超えた場合、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを抑制するのに役立ちます。
:::

`0` を指定した場合は無制限を意味します。

## max_temporary_data_on_disk_size_for_query {#max_temporary_data_on_disk_size_for_query} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行中のすべてのクエリに対して、ディスク上の一時ファイルが消費できるデータ量の上限（バイト単位）。

指定可能な値:

- 正の整数。
- `0` — 無制限（デフォルト）

## max_temporary_data_on_disk_size_for_user {#max_temporary_data_on_disk_size_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行されているすべてのユーザーのクエリによってディスク上の一時ファイルで使用されるデータ量の上限（バイト単位）。

設定可能な値:

- 正の整数
- `0` — 無制限（デフォルト）

## max_temporary_non_const_columns {#max_temporary_non_const_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`max_temporary_columns` と同様に、クエリ実行時に同時に RAM 上に保持しておく必要がある一時カラムの最大数ですが、定数カラムは含みません。

:::note
クエリの実行時には定数カラムがかなり頻繁に生成されますが、ほとんど計算リソースを消費しません。
:::

## max_threads {#max_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

クエリ処理スレッドの最大数です。リモートサーバーからデータを取得するためのスレッドは含まれません（`max_distributed_connections` パラメータを参照）。

このパラメータは、クエリ処理パイプラインの同じステージを並列に実行するスレッドに適用されます。
たとえばテーブルから読み込む際に、関数を用いた式評価、WHERE によるフィルタリング、GROUP BY の事前集計を、少なくとも `max_threads` 個のスレッドで並列実行できる場合は、その数の `max_threads` が使用されます。

LIMIT により短時間で完了するクエリでは、`max_threads` をより小さく設定できます。たとえば、必要な件数の行が各ブロックに含まれていて `max_threads = 8` の場合、本来は 1 ブロックだけ読めば十分でも、8 ブロックが読み込まれます。

`max_threads` の値が小さいほど、消費されるメモリ量は少なくなります。

Cloud のデフォルト値: `auto(3)`

## max_threads_for_indexes {#max_threads_for_indexes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

索引を処理するスレッドの最大数。

## max_untracked_memory {#max_untracked_memory} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小さいメモリアロケーションおよび解放はスレッドローカル変数内でまとめて扱われ、その総量（絶対値）が指定された値より大きくなったときにのみ、追跡またはプロファイルの対象になります。値が `memory_profiler_step` より大きい場合、実質的には `memory_profiler_step` まで引き下げられます。

## memory_overcommit_ratio_denominator {#memory_overcommit_ratio_denominator} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "デフォルトでメモリオーバーコミット機能を有効化"}]}]}/>

グローバルレベルでハードリミットに達したときに適用されるソフトメモリリミットを表します。
この値はクエリのオーバーコミット比率を計算するために使用されます。
0 を指定すると、そのクエリはスキップされます。
詳細は [メモリオーバーコミット](memory-overcommit.md) を参照してください。

## memory_overcommit_ratio_denominator_for_user {#memory_overcommit_ratio_denominator_for_user} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "デフォルトで memory overcommit 機能を有効化"}]}]}/>

ユーザーレベルでハードリミットに達したときのソフトメモリ制限値を表します。
この値はクエリのオーバーコミット率を計算するために使用されます。
ゼロの場合は、そのクエリをスキップします。
[メモリの overcommit](memory-overcommit.md) の詳細を参照してください。

## memory_profiler_sample_max_allocation_size {#memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`memory_profiler_sample_probability` に等しい確率で、指定した値以下のサイズのランダムに選択されたメモリアロケーションを収集します。0 にすると無効になります。このしきい値が想定どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_min_allocation_size {#memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

指定した値以上のサイズのメモリアロケーションを、`memory_profiler_sample_probability` の確率でランダムに収集します。0 は無効を意味します。このしきい値を期待どおりに機能させるには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_probability {#memory_profiler_sample_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

メモリアロケーションおよび解放操作をランダムにサンプリングして収集し、`trace_type` が 'MemorySample' のレコードとして system.trace_log に書き込みます。確率はアロケーションのサイズに関係なく、すべての alloc/free に対して適用されます（`memory_profiler_sample_min_allocation_size` および `memory_profiler_sample_max_allocation_size` で変更可能です）。サンプリングは、未追跡メモリ量が 'max_untracked_memory' を超えた場合にのみ実行される点に注意してください。より細かい粒度でのサンプリングを行いたい場合は、'max_untracked_memory' を 0 に設定することを検討してください。

## memory_profiler_step {#memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

メモリプロファイラのステップを設定します。クエリのメモリ使用量が、バイト数で指定された各ステップ値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを取得し、[trace_log](/operations/system-tables/trace_log) に書き込みます。

設定可能な値:

- 正の整数で表されるバイト数。

- 0 を指定するとメモリプロファイラを無効化します。

## memory_tracker_fault_probability {#memory_tracker_fault_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

`exception safety` のテスト用 — メモリを割り当てるたびに、指定した確率で例外をスローします。

## memory_usage_overcommit_max_wait_microseconds {#memory_usage_overcommit_max_wait_microseconds} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

ユーザーレベルでメモリのオーバーコミットが発生した場合に、スレッドがメモリ解放を待機できる最大時間です。
タイムアウトに達してもメモリが解放されない場合は、例外がスローされます。
詳細については、[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## merge_table_max_tables_to_look_for_schema_inference {#merge_table_max_tables_to_look_for_schema_inference} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

明示的なスキーマを指定せずに `Merge` テーブルを作成する場合、または `merge` テーブル関数を使用する場合、スキーマは指定された数を上限として、その範囲内の一致するテーブルの union として推論されます。
テーブル数がこの上限を超える場合、スキーマは先頭から指定された数のテーブルのみを対象として推論されます。

## merge_tree_coarse_index_granularity {#merge_tree_coarse_index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8" />

データを検索する際、ClickHouse はインデックスファイル内のデータマークをチェックします。ClickHouse が必要なキーがある範囲内に存在すると判断した場合、その範囲を `merge_tree_coarse_index_granularity` 個のサブレンジに分割し、それぞれのサブレンジ内で必要なキーを再帰的に検索します。

取り得る値:

- 任意の正の偶数。

## merge_tree_compact_parts_min_granules_to_multibuffer_read {#merge_tree_compact_parts_min_granules_to_multibuffer_read} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

ClickHouse Cloud でのみ有効です。MergeTree テーブルのコンパクトなパーツのストライプ内で、マルチバッファリーダー（並列読み取りとプリフェッチをサポート）を使用する際の granule 数を指定します。リモートファイルシステムから読み取る場合、マルチバッファリーダーを使用すると読み取りリクエスト数が増加します。

## merge_tree_determine_task_size_by_prewhere_columns {#merge_tree_determine_task_size_by_prewhere_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み取りタスクのサイズを決定する際に、prewhere カラムのサイズのみを使用するかどうか。

## merge_tree_max_bytes_to_use_cache {#merge_tree_max_bytes_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

ClickHouse が 1 回のクエリで `merge_tree_max_bytes_to_use_cache` バイトを超えて読み込む必要がある場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュは、クエリ用に抽出されたデータを保存します。ClickHouse はこのキャッシュを利用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュが無駄に専有されるのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックのキャッシュのサイズを定義します。

設定可能な値:

- 任意の正の整数。

## merge_tree_max_rows_to_use_cache {#merge_tree_max_rows_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ClickHouse が 1 回のクエリで `merge_tree_max_rows_to_use_cache` 行を超えて読み取る場合、非圧縮ブロックキャッシュは使用されません。

非圧縮ブロックキャッシュには、クエリ用に抽出されたデータが保存されます。ClickHouse はこのキャッシュを使用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュがスラッシングを起こすのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックキャッシュのサイズを指定します。

設定可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_for_concurrent_read {#merge_tree_min_bytes_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

1 つの [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのファイルから読み取るバイト数が `merge_tree_min_bytes_for_concurrent_read` を超える場合、ClickHouse はこのファイルを複数のスレッドで並行して読み取ろうとします。

取り得る値:

- 正の整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem {#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "設定は非推奨です"}]}]}/>

リモートファイルシステムから読み込む場合に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが並列読み取りを行えるようになるまでに、1 つのファイルから読み取る必要がある最小バイト数です。この設定の使用は推奨されません。

取りうる値:

- 正の整数。

## merge_tree_min_bytes_for_seek {#merge_tree_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_bytes_for_seek` バイト未満の場合、ClickHouse は両方のブロックを含むファイルの範囲を連続して読み取り、追加のシーク操作を回避します。

取りうる値:

- 任意の正の整数。

## merge_tree_min_bytes_per_task_for_remote_reading {#merge_tree_min_bytes_per_task_for_remote_reading} 

**別名**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "値は `filesystem_prefetch_min_bytes_for_single_read_task` と同一です"}]}]}/>

タスクごとに読み取るバイト数の最小値。

## merge_tree_min_read_task_size {#merge_tree_min_read_task_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "新しい設定"}]}]}/>

タスクサイズに対する厳密な下限値です。グラニュール数が少なく、利用可能なスレッド数が多い場合でも、これより小さいタスクは割り当てません。

## merge_tree_min_rows_for_concurrent_read {#merge_tree_min_rows_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのファイルから読み込まれる行数が `merge_tree_min_rows_for_concurrent_read` を超える場合、ClickHouse は複数スレッドでこのファイルを並列に読み込みます。

設定可能な値:

- 正の整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem {#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み込む場合に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取り処理を並列化できるようになる前に、1つのファイルから読み取る最小行数を指定します。この設定の使用は推奨されません。

可能な値:

- 正の整数。

## merge_tree_min_rows_for_seek {#merge_tree_min_rows_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_rows_for_seek` 行未満の場合、ClickHouse はファイルをシークせず、データを順次読み取ります。

可能な値:

- 任意の正の整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability {#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`PartsSplitter` のテスト用 — 指定した確率で MergeTree から読み取るたびに、読み取り範囲を互いに交差するものと交差しないものに分割します。"}]}]}/>

`PartsSplitter` のテスト用 — 指定した確率で MergeTree から読み取るたびに、読み取り範囲を互いに交差するものと交差しないものに分割します。

## merge_tree_storage_snapshot_sleep_ms {#merge_tree_storage_snapshot_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でストレージスナップショットの一貫性をデバッグするための新しい設定"}]}]}/>

MergeTree テーブルのストレージスナップショットを作成する際に、意図的な遅延（ミリ秒）を挿入します。
テストおよびデバッグの目的にのみ使用します。

設定可能な値:

- 0 - 遅延なし（デフォルト）
- N - ミリ秒単位の遅延

## merge_tree_use_const_size_tasks_for_remote_reading {#merge_tree_use_const_size_tasks_for_remote_reading} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートテーブルから読み取る際に、固定サイズのタスクを使用するかどうかを指定します。

## merge_tree_use_deserialization_prefixes_cache {#merge_tree_use_deserialization_prefixes_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree におけるデシリアライズ時のプレフィックスキャッシュの使用を制御する新しい設定"}]}]}/>

MergeTree でリモートディスクから読み込む際に、ファイルプレフィックスからカラムのメタデータをキャッシュできるようにします。

## merge_tree_use_prefixes_deserialization_thread_pool {#merge_tree_use_prefixes_deserialization_thread_pool} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree におけるプレフィックスの並列デシリアライズでスレッドプールの使用を制御する新しい設定"}]}]}/>

MergeTree の Wide パーツにおけるプレフィックスの並列読み取りでスレッドプールの使用を有効にします。スレッドプールのサイズはサーバー設定 `max_prefixes_deserialization_thread_pool_size` によって制御されます。

## merge_tree_use_v1_object_and_dynamic_serialization {#merge_tree_use_v1_object_and_dynamic_serialization} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "JSON 型および Dynamic 型向けに新しいシリアライゼーションのバージョン V2 を追加"}]}]}/>

有効にすると、MergeTree では JSON 型および Dynamic 型に対して、V2 ではなく V1 のシリアライゼーションバージョンが使用されます。この設定の変更は、サーバーの再起動後にのみ有効になります。

## metrics_perf_events_enabled {#metrics_perf_events_enabled} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、クエリの実行中を通じて一部の perf イベントが計測されます。

## metrics_perf_events_list {#metrics_perf_events_list} 

クエリの実行全体を通して計測される perf メトリクスのカンマ区切りリストです。空にすると、すべてのイベントが対象になります。利用可能なイベントについては、ソースコード内の PerfEventInfo を参照してください。

## min_bytes_to_use_direct_io {#min_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ストレージディスクに対してダイレクト I/O を使用するために必要な最小データ量。

ClickHouse はテーブルからデータを読み取る際にこの設定を使用します。読み取るすべてのデータ量の合計が `min_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は `O_DIRECT` オプションを使用してストレージディスクからデータを読み取ります。

設定可能な値:

- 0 — ダイレクト I/O を無効にします。
- 正の整数。

## min_bytes_to_use_mmap_io {#min_bytes_to_use_mmap_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

これは実験的な設定です。カーネルからユーザ空間へのデータコピーを行わずに大きなファイルを読み込む際に使用する、必要最小限のメモリサイズを設定します。[mmap/munmap](https://en.wikipedia.org/wiki/Mmap) は低速であるため、推奨されるしきい値は約 64 MB です。大きなファイルに対してのみ意味があり、かつデータがページキャッシュ上に存在する場合にのみ効果があります。

設定可能な値:

- 正の整数。
- 0 — 大きなファイルを、カーネルからユーザ空間へのデータコピーのみで読み込みます。

## min_chunk_bytes_for_parallel_parsing {#min_chunk_bytes_for_parallel_parsing} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 型: unsigned int
- デフォルト値: 1 MiB

各スレッドが並列にパースする最小のchunkサイズ（バイト単位）。

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに対する設定です。クエリ処理時のレイテンシを低減するため、ブロックは次のマークを書き込むタイミングで、そのサイズが少なくとも `min_compress_block_size` に達している場合に圧縮されます。デフォルトは 65,536 です。

非圧縮データが `max_compress_block_size` 未満である場合、ブロックの実際のサイズは、この値以上かつ 1 つのマークに対応するデータ量以上になります。

例を見てみましょう。テーブル作成時に `index_granularity` が 8192 に設定されていたとします。

UInt32 型のカラム（1 値あたり 4 バイト）を書き込んでいます。8192 行を書き込むと、合計で 32 KB のデータになります。`min_compress_block_size = 65,536` なので、2 つのマークごとに 1 つの圧縮ブロックが形成されます。

String 型（1 値あたり平均 60 バイト）の URL カラムを書き込んでいます。8192 行を書き込むと、平均で 500 KB 弱のデータになります。これは 65,536 より大きいため、各マークごとに 1 つの圧縮ブロックが形成されます。この場合、単一のマークの範囲でディスクからデータを読み取るときに、余分なデータが伸長されることはありません。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないでください。
:::

## min_count_to_compile_aggregate_expression {#min_count_to_compile_aggregate_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の集約式を JITコンパイルし始める際の最小個数。この設定は [compile_aggregate_expressions](#compile_aggregate_expressions) 設定が有効な場合にのみ機能します。

設定可能な値:

- 正の整数
- 0 — 同一の集約式は常に JITコンパイルされます。

## min_count_to_compile_expression {#min_count_to_compile_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の式がコンパイル対象になるまでに必要な最小実行回数。

## min_count_to_compile_sort_description {#min_count_to_compile_sort_description} 

<SettingsInfoBlock type="UInt64" default_value="3" />

JIT コンパイルの対象となるまでに必要な、同一のソート記述の数。

## min_execution_speed {#min_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行速度（行単位）。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が期限切れになるたびに、各データブロックごとにチェックされます。実行速度がこれより低い場合は、例外がスローされます。

## min_execution_speed_bytes {#min_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が期限切れになるたびに、各データブロックでチェックされます。実行速度がこの値を下回る場合は、例外がスローされます。

## min_external_table_block_size_bytes {#min_external_table_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "外部テーブルに渡されるブロックが十分な大きさでない場合、指定したバイト数のサイズになるようにブロックを結合します。"}]}]}/>

外部テーブルに渡されるブロックが十分な大きさでない場合、指定したバイト数のサイズになるようにブロックを結合します。

## min_external_table_block_size_rows {#min_external_table_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを、指定された行数になるようにまとめます"}]}]}/>

ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを、指定された行数になるようにまとめます。

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを許可しつつ、挿入による消費から一定量の空きディスク容量（バイト数）を確保します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

挿入を実行するために必要な最小の空きディスク容量（バイト数）です。

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを引き続き許可しつつ、挿入処理では使用せず確保しておくディスク空き容量を、総ディスク容量に対する比率で指定します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

INSERT を実行するために必要な最小ディスク空き容量の比率です。

## min_free_disk_space_for_temporary_data {#min_free_disk_space_for_temporary_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部ソートおよび集約に使用される一時データを書き込む際に確保しておく最小限のディスク空き容量。

## min_hit_rate_to_use_consecutive_keys_optimization {#min_hit_rate_to_use_consecutive_keys_optimization} 

<SettingsInfoBlock type="Float" default_value="0.5" />

集約において連続キー最適化を有効にしておくために必要なキャッシュの最小ヒット率。

## min_insert_block_size_bytes {#min_insert_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

`INSERT` クエリでテーブルに挿入できるブロックの最小バイト数を設定します。これより小さいサイズのブロックは、より大きなブロックにまとめられます。

指定可能な値:

- 正の整数。
- 0 — まとめ処理を無効化。

## min_insert_block_size_bytes_for_materialized_views {#min_insert_block_size_bytes_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリによってテーブルに挿入できるブロックの最小バイト数を設定します。より小さいサイズのブロックは、より大きいブロックにまとめられます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、materialized view への書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

設定可能な値:

- 任意の正の整数。
- 0 — まとめ処理を無効化。

**関連項目**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows {#min_insert_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

`INSERT` クエリによってテーブルに挿入されるブロックの最小行数を設定します。より小さいサイズのブロックは、より大きなブロックにまとめられます。

設定可能な値:

- 正の整数。
- 0 — まとめ処理を無効にする。

## min_insert_block_size_rows_for_materialized_views {#min_insert_block_size_rows_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリでテーブルに挿入できるブロック内の最小行数を設定します。より小さいサイズのブロックは、より大きなブロックにまとめられます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、materialized view へのプッシュ時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

設定可能な値:

- 任意の正の整数。
- 0 — まとめ処理を無効化。

**関連項目**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes {#min_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "新しい設定。"}]}]}/>

JOIN の入力および出力ブロック（JOIN アルゴリズムがサポートしている場合）に対する、バイト単位の最小ブロックサイズ。小さいブロックは結合されます。0 は無制限を意味します。

## min_joined_block_size_rows {#min_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "新しい設定。"}]}]}/>

JOIN の入力および出力ブロックに対する最小ブロックサイズ（行数）（JOIN アルゴリズムがこれをサポートする場合）。小さいブロックはまとめて 1 つにまとめられます。0 は無制限を意味します。

## min_os_cpu_wait_time_ratio_to_throw {#min_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Setting の値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい Setting"}]}]}/>

クエリを拒否対象とみなすための、OS の CPU 待機時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の最小比率です。確率を計算するために最小比と最大比の間で線形補間を行い、この比率での確率は 0 になります。

## min_outstreams_per_resize_after_split {#min_outstreams_per_resize_after_split} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "New setting."}]}]}/>

パイプライン生成中に分割が実行された後における `Resize` または `StrictResize` プロセッサの出力ストリームの最小数を指定します。得られたストリーム数がこの値未満の場合、分割操作は行われません。

### Resize ノードとは {#what-is-a-resize-node}

`Resize` ノードは、クエリパイプライン内で、パイプラインを流れるデータストリームの数を調整するプロセッサです。複数のスレッドやプロセッサ間で負荷を分散させるために、ストリーム数を増やすことも減らすこともできます。たとえば、あるクエリでより高い並列性が必要な場合、`Resize` ノードは 1 つのストリームを複数のストリームに分割できます。逆に、複数のストリームをより少ないストリームにまとめて、データ処理を集約することもできます。

`Resize` ノードは、データブロックの構造を保ったまま、データがストリーム間に均等に分散されるようにします。これにより、リソースの利用を最適化し、クエリのパフォーマンスを向上させることができます。

### なぜ Resize ノードを分割する必要があるのか {#why-the-resize-node-needs-to-be-split}

パイプライン実行中、集中ハブとして機能する `Resize` ノードの ExecutingGraph::Node::status_mutex は、特にコア数の多い環境で激しく競合し、この競合によって次のような問題が発生します。

1. ExecutingGraph::updateNode のレイテンシが増加し、クエリ性能に直接的な悪影響を与える。
2. スピンロックの競合 (native_queued_spin_lock_slowpath) によって過剰な CPU サイクルが浪費され、効率が低下する。
3. CPU 使用率が低下し、並列実行性とスループットが制限される。

### Resize ノードが分割される仕組み {#how-the-resize-node-gets-split}

1. 出力ストリーム数を確認し、分割が実行可能かどうかをチェックします。各分割プロセッサの出力ストリーム数が `min_outstreams_per_resize_after_split` のしきい値以上である必要があります。
2. `Resize` ノードは、ポート数が同じ小さな `Resize` ノードに分割され、それぞれが入力ストリームと出力ストリームの一部を処理します。
3. 各グループは独立して処理され、ロック競合が軽減されます。

### 任意の入力/出力を持つ Resize ノードの分割 {#splitting-resize-node-with-arbitrary-inputsoutputs}

入力/出力の数が、分割後に生成される `Resize` ノードの個数で割り切れない場合、一部の入力は `NullSource` に接続され、一部の出力は `NullSink` に接続されます。これにより、全体のデータフローに影響を与えることなく分割を行えます。

### 設定の目的 {#purpose-of-the-setting}

`min_outstreams_per_resize_after_split` 設定は、`Resize` ノードの分割が意味のあるものとなるようにし、ストリーム数が少なすぎる状態を防ぐためのものです。ストリーム数が少なすぎると、並列処理が非効率になる可能性があります。出力ストリームの最小数を強制することで、この設定は並列性とオーバーヘッドのバランスを維持し、ストリームの分割とマージを伴うシナリオにおけるクエリ実行を最適化します。

### 設定を無効化する {#disabling-the-setting}

`Resize` ノードの分割を無効にするには、この設定値を 0 に設定します。これによりパイプライン生成中に `Resize` ノードがより小さなノードへ分割されることがなくなり、元の構造を保持できるようになります。

## min_table_rows_to_use_projection_index {#min_table_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

テーブルから読み取る推定行数がこのしきい値以上の場合、ClickHouse はクエリの実行時にプロジェクション索引の使用を試みます。

## mongodb_throw_on_unsupported_query {#mongodb_throw_on_unsupported_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting."}]}]}/>

有効にした場合、MongoDB テーブルは MongoDB クエリを生成できないときにエラーを返します。無効にした場合、ClickHouse はテーブル全体を読み取り、ローカルで処理します。このオプションは `allow_experimental_analyzer=0` のときには適用されません。

## 移動可能なすべての条件を PREWHERE に移動する {#move_all_conditions_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句から PREWHERE 句へ移動可能なすべての条件を移動します

## move_primary_key_columns_to_end_of_prewhere {#move_primary_key_columns_to_end_of_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

主キーカラムを含む PREWHERE の条件を、AND 句の末尾へ移動します。これらの条件は主キー解析の段階で考慮される可能性が高く、そのため PREWHERE フィルタリングにはあまり大きく寄与しないと想定されます。

## multiple_joins_try_to_keep_original_names {#multiple_joins_try_to_keep_original_names} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数 JOIN のリライト時に、トップレベルの式リストにエイリアスを追加しない

## mutations_execute_nondeterministic_on_initiator {#mutations_execute_nondeterministic_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、定数な非決定的関数（例: 関数 `now()`）はイニシエータ側で実行され、`UPDATE` および `DELETE` クエリ内でリテラルに置き換えられます。これにより、定数の非決定的関数を用いたミューテーションを実行する際に、レプリカ間でデータを同期した状態に保つことができます。デフォルト値: `false`。

## mutations_execute_subqueries_on_initiator {#mutations_execute_subqueries_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、スカラーサブクエリはイニシエーター側で実行され、`UPDATE` および `DELETE` クエリ内でリテラルに置き換えられます。デフォルト値は `false` です。

## mutations_max_literal_size_to_replace {#mutations_max_literal_size_to_replace} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

`UPDATE` と `DELETE` クエリで置き換えを行う際の、シリアライズされたリテラルの最大サイズ（バイト単位）。上記 2 つの設定のうち少なくとも一方が有効な場合にのみ適用されます。デフォルト値: 16384 (16 KiB)。

## mutations_sync {#mutations_sync} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` クエリ（[mutations](../../sql-reference/statements/alter/index.md/#mutations)）を同期的に実行するかどうかを制御します。

設定可能な値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | mutation を非同期で実行します。                                                                                                                       |
| `1`   | クエリは、現在のサーバー上のすべての mutation が完了するまで待機します。                                                                              |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で mutation が完了するまで待機します。                                                                      |
| `3`   | クエリはアクティブなレプリカのみを待機します。`SharedMergeTree` の場合にのみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同じ動作になります。|

## mysql_datatypes_support_level {#mysql_datatypes_support_level} 

MySQL 型が対応する ClickHouse 型にどのように変換されるかを定義します。`decimal`、`datetime64`、`date2Date32`、`date2String` を任意に組み合わせて指定するカンマ区切りのリストです。

- `decimal`: 精度が許す場合に、`NUMERIC` および `DECIMAL` 型を `Decimal` に変換します。
- `datetime64`: 精度が `0` でない場合、`DATETIME` および `TIMESTAMP` 型を `DateTime` ではなく `DateTime64` に変換します。
- `date2Date32`: `DATE` を `Date` ではなく `Date32` に変換します。`date2String` よりも優先されます。
- `date2String`: `DATE` を `Date` ではなく `String` に変換します。ただし `datetime64` が指定されている場合は、`datetime64` が優先されます。

## mysql_map_fixed_string_to_text_in_show_columns {#mysql_map_fixed_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "BI ツールとの接続設定の手間を減らします。"}]}]}/>

有効化すると、ClickHouse のデータ型 [FixedString](../../sql-reference/data-types/fixedstring.md) は [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) で `TEXT` として表示されます。

MySQL ワイヤプロトコル経由で接続している場合にのみ効果があります。

- 0 - `BLOB` を使用します。
- 1 - `TEXT` を使用します。

## mysql_map_string_to_text_in_show_columns {#mysql_map_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続するための設定作業を軽減します。"}]}]}/>

有効にすると、ClickHouse の [String](../../sql-reference/data-types/string.md) データ型は、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) において `TEXT` として表示されます。

MySQL ワイヤプロトコル経由で接続されている場合にのみ効果があります。

- 0 - `BLOB` を使用します。
- 1 - `TEXT` を使用します。

## mysql_max_rows_to_insert {#mysql_max_rows_to_insert} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL ストレージエンジンでの一括挿入時の最大行数

## network_compression_method {#network_compression_method} 

<SettingsInfoBlock type="String" default_value="LZ4" />

クライアント/サーバー間およびサーバー間通信を圧縮するためのコーデック。

指定可能な値:

- `NONE` — 圧縮しない。
- `LZ4` — LZ4 コーデックを使用する。
- `LZ4HC` — LZ4HC コーデックを使用する。
- `ZSTD` — ZSTD コーデックを使用する。

**関連項目**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level {#network_zstd_compression_level} 

<SettingsInfoBlock type="Int64" default_value="1" />

ZSTD の圧縮レベルを調整します。[network_compression_method](#network_compression_method) が `ZSTD` に設定されている場合にのみ有効です。

許容される値：

- 1 から 15 までの正の整数

## normalize_function_names {#normalize_function_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "関数名を正規名（カノニカル名）に正規化します。これは PROJECTION クエリのルーティングに必要でした"}]}]}/>

関数名を正規名（カノニカル名）に正規化します

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに未完了のミューテーションがこの値以上ある場合、そのテーブルに対するミューテーションを意図的に遅延させます。0 の場合は無効。

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに未完了の mutation が少なくともこの数だけ存在する場合、'Too many mutations ...' という例外をスローします。0 - 無効

## odbc_bridge_connection_pool_size {#odbc_bridge_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC ブリッジで使用される各接続設定文字列ごとのコネクションプールサイズ。

## odbc_bridge_use_connection_pooling {#odbc_bridge_use_connection_pooling} 

<SettingsInfoBlock type="Bool" default_value="1" />

ODBC ブリッジでコネクションプーリングを行います。`false` に設定すると、毎回新しい接続が確立されます。

## offset {#offset}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで行の返却を開始する前にスキップする行数を設定します。[OFFSET](/sql-reference/statements/select/offset) 句で設定されたオフセット値に対してこの値が加算されます。

指定可能な値:

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

結果：

```text
┌───i─┐
│ 107 │
│ 108 │
│ 109 │
└─────┘
```


## opentelemetry_start_trace_probability {#opentelemetry_start_trace_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

（親の [trace context](https://www.w3.org/TR/trace-context/) が指定されていない場合に）ClickHouse が実行されたクエリに対してトレースを開始する確率を設定します。

設定可能な値:

- 0 — （親の trace context が指定されていない場合）実行されたすべてのクエリに対するトレースは無効になります。
- [0..1] の範囲の正の浮動小数点数。たとえば、この設定値が `0,5` の場合、ClickHouse は平均してクエリ全体の半分に対してトレースを開始できます。
- 1 — 実行されたすべてのクエリに対するトレースが有効になります。

## opentelemetry_trace_cpu_scheduling {#opentelemetry_trace_cpu_scheduling} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "`cpu_slot_preemption` 機能をトレースするための新しい設定。"}]}]}/>

ワークロードのプリエンプティブ CPU スケジューリングに関する OpenTelemetry スパンを収集します。

## opentelemetry_trace_processors {#opentelemetry_trace_processors} 

<SettingsInfoBlock type="Bool" default_value="0" />

OpenTelemetry の span をトレースプロセッサ向けに収集します。

## optimize_aggregation_in_order {#optimize_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルで対応する順序でデータを集約する [SELECT](../../sql-reference/statements/select/index.md) クエリにおいて、[GROUP BY](/sql-reference/statements/select/group-by) の最適化を有効にします。

設定可能な値:

- 0 — `GROUP BY` の最適化を無効にします。
- 1 — `GROUP BY` の最適化を有効にします。

**関連項目**

- [GROUP BY optimization](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys {#optimize_aggregators_of_group_by_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 句内の GROUP BY キーに対する min/max/any/anyLast 集約関数を削除します。

## optimize_and_compare_chain {#optimize_and_compare_chain} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

AND 連鎖内での定数比較を補完し、フィルタリング性能を向上させます。演算子 `<`、`<=`、`>`、`>=`、`=` およびそれらの組み合わせをサポートします。例えば、`(a < b) AND (b < c) AND (c < 5)` は `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)` となります。

## optimize_append_index {#optimize_append_index} 

<SettingsInfoBlock type="Bool" default_value="0" />

索引条件を追加するには、[制約](../../sql-reference/statements/create/table.md/#constraints) を使用します。既定値は `false` です。

指定可能な値:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions {#optimize_arithmetic_operations_in_aggregate_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数の外側に算術演算を移動する

## optimize_const_name_size {#optimize_const_name_size} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "大きな定数をスカラーに置き換え、名前としてハッシュを使用（サイズは名前の長さで推定）"}]}]}/>

大きな定数をスカラーに置き換え、名前としてハッシュを使用します（サイズは名前の長さで推定されます）。

利用可能な値:

- 正の整数 — 名前の最大長
- 0 — 常に適用
- 負の整数 — 適用しない

## optimize_count_from_files {#optimize_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

さまざまな入力フォーマットのファイルから行数をカウントする処理の最適化を有効にするか無効にするかを制御します。テーブル関数/エンジン `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` に適用されます。

取りうる値:

- 0 — 最適化を無効化。
- 1 — 最適化を有効化。

## optimize_distinct_in_order {#optimize_distinct_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

`DISTINCT` で指定されたカラムの一部が、ソートキーの先頭部分を構成している場合に `DISTINCT` の最適化を有効にします。例えば、MergeTree におけるソートキーの先頭部分や、`ORDER BY` 句の先頭部分などです。

## optimize_distributed_group_by_sharding_key {#optimize_distributed_group_by_sharding_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

イニシエーターサーバー上で高コストな集約を行わないことで、`GROUP BY sharding_key` クエリを最適化します（これにより、イニシエーターサーバー上でのクエリのメモリ使用量が削減されます）。

次の種類のクエリ（およびそれらのすべての組み合わせ）がサポートされています:

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

次の種類のクエリはサポートされていません（一部については、将来的にサポートが追加される可能性があります）:

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

設定可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
現時点では `optimize_skip_unused_shards` が必要です。これは、将来的にこの設定がデフォルトで有効になる可能性があり、その場合でもデータが `Distributed` テーブル経由で挿入されている、すなわちデータが `sharding_key` に従って分散されている場合にのみ正しく動作するためです。
:::

## optimize_empty_string_comparisons {#optimize_empty_string_comparisons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

`col = ''` または `'' = col` のような式を `empty(col)` に、`col != ''` または `'' != col` を `notEmpty(col)` に変換します。
この変換は、`col` の型が `String` または `FixedString` の場合にのみ適用されます。

## optimize_extract_common_expressions {#optimize_extract_common_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY の各式に対して、共通部分式を論理和・論理積の式から抽出することで最適化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY の各式に対して、共通部分式を論理和・論理積の式から抽出する最適化用の設定を導入。"}]}]}/>

WHERE、PREWHERE、ON、HAVING、QUALIFY の各式において、論理和（OR）の式から共通部分式を抽出できるようにします。`(A AND B) OR (A AND C)` のような論理式は `A AND (B OR C)` に書き換えることができ、次の点で役立つ可能性があります:

- 単純なフィルタリング式でのインデックス利用
- CROSS JOIN から INNER JOIN への最適化

## optimize_functions_to_subcolumns {#optimize_functions_to_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled by default"}]}]}/>

一部の関数をサブカラムの読み取りに変換することで行う最適化を有効または無効にします。これにより、読み取るデータ量を削減できます。

次の関数が変換されます:

- [length](/sql-reference/functions/array-functions#length) は [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムの読み取りに変換されます。
- [empty](/sql-reference/functions/array-functions#empty) は [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムの読み取りに変換されます。
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) は [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムの読み取りに変換されます。
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) は [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムの読み取りに変換されます。
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) は [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムの読み取りに変換されます。
- [count](/sql-reference/aggregate-functions/reference/count) は [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムの読み取りに変換されます。
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapkeys) は [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムの読み取りに変換されます。
- [mapValues](/sql-reference/functions/tuple-map-functions#mapvalues) は [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムの読み取りに変換されます。

設定可能な値:

- 0 — 最適化を無効化。
- 1 — 最適化を有効化。

## optimize_group_by_constant_keys {#optimize_group_by_constant_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "デフォルトで定数キーによる GROUP BY を最適化"}]}]}/>

ブロック内のすべての GROUP BY キーが定数である場合に GROUP BY を最適化します

## optimize_group_by_function_keys {#optimize_group_by_function_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

GROUP BY 句内における他のキーの関数を除去します。

## optimize_if_chain_to_multiif {#optimize_if_chain_to_multiif} 

<SettingsInfoBlock type="Bool" default_value="0" />

if(cond1, then1, if(cond2, ...)) という形の if の連鎖を multiIf に置き換えます。現時点では数値型に対しては効果がありません。

## optimize_if_transform_strings_to_enum {#optimize_if_transform_strings_to_enum} 

<SettingsInfoBlock type="Bool" default_value="0" />

If および Transform の文字列型引数を enum 型に変換します。分散クエリに対して不整合な変更を行い、クエリの失敗を招く可能性があるため、デフォルトでは無効になっています。

## optimize_injective_functions_in_group_by {#optimize_injective_functions_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "アナライザー内の GROUP BY 句で、単射関数をその引数に置き換える"}]}]}/>

GROUP BY 句で単射関数をその引数に置き換えます

## optimize_injective_functions_inside_uniq {#optimize_injective_functions_inside_uniq} 

<SettingsInfoBlock type="Bool" default_value="1" />

uniq*() 関数内の、1 つだけ引数を取る単射関数を削除します。

## optimize_inverse_dictionary_lookup {#optimize_inverse_dictionary_lookup} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "新しい設定"}]}]}/>

事前計算済みのキー候補集合に対して高速にルックアップを行うことで、Dictionary の逆引きルックアップを繰り返し行うことを回避します。

## optimize_min_equality_disjunction_chain_length {#optimize_min_equality_disjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr = x1 OR ... expr = xN` 形式の式が最適化されるために必要な最小の長さ

## optimize_min_inequality_conjunction_chain_length {#optimize_min_inequality_conjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr <> x1 AND ... expr <> xN` という式が最適化の対象となるための、式の最小の長さ。

## optimize_move_to_prewhere {#optimize_move_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

[SELECT](../../sql-reference/statements/select/index.md) クエリに対する自動的な [PREWHERE](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ機能します。

可能な値:

- 0 — 自動的な `PREWHERE` 最適化を無効にします。
- 1 — 自動的な `PREWHERE` 最適化を有効にします。

## optimize_move_to_prewhere_if_final {#optimize_move_to_prewhere_if_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付きの [SELECT](../../sql-reference/statements/select/index.md) クエリにおいて、自動的な [PREWHERE](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ動作します。

可能な値:

- 0 — `FINAL` 修飾子付きの `SELECT` クエリにおける自動 `PREWHERE` 最適化を無効にします。
- 1 — `FINAL` 修飾子付きの `SELECT` クエリにおける自動 `PREWHERE` 最適化を有効にします。

**関連項目**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 設定

## optimize_multiif_to_if {#optimize_multiif_to_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

条件が 1 つだけの `multiIf` 式を `if` に置き換えます。

## optimize_normalize_count_variants {#optimize_normalize_count_variants} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "意味的に count() と同等な集約関数を、デフォルトで count() に書き換える"}]}]}/>

意味的に count() と同等な集約関数を count() に書き換えます。

## optimize&#95;on&#95;insert {#optimize_on_insert}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで INSERT 時のデータ最適化を有効化し、ユーザー体験を向上"}]}]} />

INSERT 前に、このブロックに対して（テーブルエンジンに従って）マージが行われたかのようなデータ変換を有効または無効にします。

指定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

有効な場合と無効な場合の違い:

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

なお、この設定は [Materialized view](/sql-reference/statements/create/view#materialized-view) の動作に影響します。


## optimize_or_like_chain {#optimize_or_like_chain} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数の `OR LIKE` を `multiMatchAny` に最適化します。この最適化は、場合によっては索引の解析を妨げる可能性があるため、デフォルトでは有効化すべきではありません。

## optimize_qbit_distance_function_reads {#optimize_qbit_distance_function_reads} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`QBit` データ型に対する距離関数を、計算に必要なカラムのみをストレージから読み取る等価な関数に置き換えます。

## optimize_read_in_order {#optimize_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルからデータを読み取る際の [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、[ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) の最適化を有効にします。

設定可能な値:

- 0 — `ORDER BY` の最適化を無効にします。
- 1 — `ORDER BY` の最適化を有効にします。

**関連項目**

- [ORDER BY 句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order {#optimize_read_in_window_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルでウィンドウ句に指定された順序でデータを読み取れるようにするため、ウィンドウ句における ORDER BY の最適化を有効にします。

## optimize_redundant_functions_in_order_by {#optimize_redundant_functions_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

ORDER BY 句で指定された関数の引数が、同じ ORDER BY 句内に個別にも含まれている場合、その関数を ORDER BY 句から削除します

## optimize_respect_aliases {#optimize_respect_aliases} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、WHERE/GROUP BY/ORDER BY でエイリアスが考慮され、partition pruning/secondary indexes/optimize_aggregation_in_order/optimize_read_in_order/optimize_trivial_count による最適化が行われやすくなります。

## optimize_rewrite_aggregate_function_with_if {#optimize_rewrite_aggregate_function_with_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

`if` 式を引数に取る集約関数を、論理的に等価である場合に書き換えます。
たとえば `avg(if(cond, col, null))` は `avgOrNullIf(cond, col)` に書き換えられます。これによりパフォーマンスが向上する場合があります。

:::note
analyzer 使用時のみサポートされています（`enable_analyzer = 1`）。
:::

## optimize_rewrite_array_exists_to_has {#optimize_rewrite_array_exists_to_has} 

<SettingsInfoBlock type="Bool" default_value="0" />

論理的に等価な場合、`arrayExists()` 関数呼び出しを `has()` に書き換えます。例えば、`arrayExists(x -> x = 1, arr)` は `has(arr, 1)` に書き換えることができます。

## optimize_rewrite_like_perfect_affix {#optimize_rewrite_like_perfect_affix} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

完全な接頭辞または接尾辞パターンを持つ LIKE 式（例: `col LIKE 'ClickHouse%'`）を、`startsWith(col, 'ClickHouse')` や `endsWith(col, 'ClickHouse')` のような関数呼び出しに書き換えます。

## optimize_rewrite_regexp_functions {#optimize_rewrite_regexp_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

正規表現関連の関数をより単純かつ効率的な形式に書き換えます

## optimize_rewrite_sum_if_to_count_if {#optimize_rewrite_sum_if_to_count_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "アナライザーでのみ利用可能で、その場合は正しく動作します"}]}]}/>

論理的に等価な場合、`sumIf()` および `sum(if())` を `countIf()` に書き換えます

## optimize_skip_merged_partitions {#optimize_skip_merged_partitions} 

<SettingsInfoBlock type="Bool" default_value="0" />

[OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) クエリに対して、レベルが 0 より大きいパーツが 1 つだけ存在し、かつそのパーツに有効期限 (TTL) が切れたデータを含んでいない場合に、最適化を有効または無効にします。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

デフォルトでは、`OPTIMIZE TABLE ... FINAL` クエリは、パーツが 1 つしかない場合でもその 1 つのパーツを書き換えます。

設定値:

- 1 - 最適化を有効にします。
- 0 - 最適化を無効にします。

## optimize_skip_unused_shards {#optimize_skip_unused_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

`WHERE/PREWHERE` にシャーディングキー条件を含む [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、使用されない分片をスキップするかどうかを切り替えます（データがシャーディングキーで分散されていることが前提であり、そうでない場合はクエリ結果が不正確になります）。

Possible values:

- 0 — Disabled.
- 1 — Enabled.

## optimize_skip_unused_shards_limit {#optimize_skip_unused_shards_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

シャーディングキーの値の数の上限です。この上限に達すると、`optimize_skip_unused_shards` は無効になります。

値が多すぎると処理にかなりの負荷がかかる可能性がありますが、その最適化効果は疑わしくなります。`IN (...)` 内の値が非常に多い場合、いずれにせよクエリはほぼ確実にすべての分片に送信されるためです。

## optimize_skip_unused_shards_nesting {#optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリのネストレベル（ある `Distributed` テーブルが別の `Distributed` テーブルを参照しているケース）に応じて [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) の動作を制御します（この設定を利用するには [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) 自体が有効である必要があります）。

指定可能な値:

- 0 — 無効。`optimize_skip_unused_shards` が常に動作します。
- 1 — 最初のレベルに対してのみ `optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `optimize_skip_unused_shards` を有効にします。

## optimize_skip_unused_shards_rewrite_in {#optimize_skip_unused_shards_rewrite_in} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモート分片に対するクエリ内の IN 句を書き換えて、その分片に属さない値を除外します（`optimize_skip_unused_shards` の有効化が必要です）。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## optimize_sorting_by_input_stream_properties {#optimize_sorting_by_input_stream_properties} 

<SettingsInfoBlock type="Bool" default_value="1" />

入力ストリームのソート特性を利用してソートを最適化します

## optimize_substitute_columns {#optimize_substitute_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

カラムの置き換えには [制約](../../sql-reference/statements/create/table.md/#constraints) を使用します。デフォルトは `false` です。

指定可能な値:

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions {#optimize_syntax_fuse_functions}

<SettingsInfoBlock type="Bool" default_value="0" />

同一の引数を持つ集約関数を融合する最適化を有効にします。少なくとも 2 つ以上の [sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count)、または [avg](/sql-reference/aggregate-functions/reference/avg) が同一の引数で使用されているクエリを書き換え、[sumCount](/sql-reference/aggregate-functions/reference/sumcount) を用いるようにします。

設定可能な値:

* 0 — 同一の引数を持つ関数は融合されません。
* 1 — 同一の引数を持つ関数は融合されます。

**例**

クエリ:

```sql
CREATE TABLE fuse_tbl(a Int8, b Int8) Engine = Log;
SET optimize_syntax_fuse_functions = 1;
EXPLAIN SYNTAX SELECT sum(a), sum(b), count(b), avg(b) from fuse_tbl FORMAT TSV;
```

結果：

```text
SELECT
    sum(a),
    sumCount(b).1,
    sumCount(b).2,
    (sumCount(b).1) / (sumCount(b).2)
FROM fuse_tbl
```


## optimize_throw_if_noop {#optimize_throw_if_noop} 

<SettingsInfoBlock type="Bool" default_value="0" />

[OPTIMIZE](../../sql-reference/statements/optimize.md) クエリがマージを実行しなかった場合に、例外をスローするかどうかを制御します。

デフォルトでは、`OPTIMIZE` は何も実行しなかった場合でも正常終了します。この設定により、これらの状況を区別し、例外メッセージからその理由を確認できます。

取りうる値:

- 1 — 例外のスローを有効にします。
- 0 — 例外のスローを無効にします。

## optimize_time_filter_with_preimage {#optimize_time_filter_with_preimage} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "関数呼び出しを、変換を伴わない同等な比較条件に書き換えることで、Date および DateTime の述語を最適化します (例: toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31')"}]}]}/>

関数呼び出しを、変換を伴わない同等な比較条件に書き換えることで、Date および DateTime の述語を最適化します (例: `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`)

## optimize_trivial_approximate_count_query {#optimize_trivial_approximate_count_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

EmbeddedRocksDB など、概数推定をサポートするストレージに対して、単純なカウントクエリの最適化に概算値を使用します。

可能な値:

- 0 — 最適化を無効にします。
   - 1 — 最適化を有効にします。

## optimize_trivial_count_query {#optimize_trivial_count_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree のメタデータを使用して、単純なクエリ `SELECT count() FROM table` を最適化するかどうかを有効化または無効化します。行レベルセキュリティを使用する必要がある場合は、この設定を無効にしてください。

可能な値:

- 0 — 最適化を無効にする。
   - 1 — 最適化を有効にする。

関連項目:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select {#optimize_trivial_insert_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "多くのケースでこの最適化は有効ではありません。"}]}]}/>

単純な形式の 'INSERT INTO table SELECT ... FROM TABLES' クエリを最適化します

## optimize_uniq_to_count {#optimize_uniq_to_count} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに DISTINCT 句または GROUP BY 句が含まれている場合、uniq およびそのバリエーション（uniqUpTo を除く）を count に書き換えます。

## optimize_use_implicit_projections {#optimize_use_implicit_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT クエリの実行に使用する暗黙的な PROJECTION を自動選択します

## optimize_use_projection_filtering {#optimize_use_projection_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

SELECT クエリの実行に PROJECTION が選択されていない場合でも、パーツ範囲のフィルタリングに PROJECTION を使用できるようにします。

## optimize_use_projections {#optimize_use_projections} 

**別名**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリを処理する際に、[プロジェクション](../../engines/table-engines/mergetree-family/mergetree.md/#projections)の最適化を有効または無効にします。

設定可能な値:

- 0 — プロジェクション最適化を無効にします。
- 1 — プロジェクション最適化を有効にします。

## optimize_using_constraints {#optimize_using_constraints} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの最適化に [constraints](../../sql-reference/statements/create/table.md/#constraints) を使用します。デフォルト値は `false` です。

可能な値:

- true, false

## os_threads_nice_value_materialized_view {#os_threads_nice_value_materialized_view} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

materialized view スレッド向けの Linux の nice 値。値が小さいほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、持っていない場合は効果がありません。

取りうる値: -20 ～ 19。

## os_threads_nice_value_query {#os_threads_nice_value_query} 

**別名**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

クエリ処理スレッドに対する Linux の nice 値。値が低いほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合は何も行われません。

設定可能な値: -20 から 19。

## output_format_compression_level {#output_format_compression_level} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "クエリ出力の圧縮レベルを変更可能にする"}]}]}/>

クエリの出力が圧縮される場合のデフォルトの圧縮レベルです。`SELECT` クエリで `INTO OUTFILE` 句が指定されている場合、またはテーブル関数 `file`、`url`、`hdfs`、`s3`、`azureBlobStorage` へ書き込む場合に適用されます。

設定可能な値: `1` から `22` まで

## output_format_compression_zstd_window_log {#output_format_compression_zstd_window_log} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "zstd 圧縮が使用されている場合に、クエリ出力で zstd window log を変更できるようにする"}]}]}/>

出力圧縮方式が `zstd` の場合に使用できます。`0` より大きい値を指定すると、この設定は圧縮ウィンドウサイズ（`2` の累乗）を明示的に設定し、zstd 圧縮のロングレンジモードを有効にします。これにより、より高い圧縮率を達成できる場合があります。

指定可能な値: 0 以上の非負整数。値が小さすぎる、または大きすぎる場合は、`zstdlib` が例外をスローします。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）の範囲です。

## output_format_parallel_formatting {#output_format_parallel_formatting} 

<SettingsInfoBlock type="Bool" default_value="1" />

データ出力フォーマットの並列フォーマット処理を有効または無効にします。[TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットでのみサポートされています。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## page_cache_block_size {#page_cache_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "この設定をクエリ単位で調整可能にしました。"}]}]}/>

ユーザー空間ページキャッシュに保存するファイルの chunk のサイズ（バイト単位）。キャッシュを経由するすべての読み取りは、このサイズの倍数に切り上げられます。

この設定はクエリ単位で調整できますが、ブロックサイズが異なるキャッシュエントリは再利用できません。この設定を変更すると、実質的にキャッシュ内の既存エントリが無効化されます。

1 MiB のような大きな値は高スループットのクエリに適しており、64 KiB のような小さな値は低レイテンシのポイントクエリに適しています。

## page_cache_inject_eviction {#page_cache_inject_eviction} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間ページキャッシュを追加"}]}]}/>

ユーザー空間ページキャッシュは、ランダムに一部のページを無効化することがあります。テスト目的で使用されます。

## page_cache_lookahead_blocks {#page_cache_lookahead_blocks} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "この設定をクエリ単位で調整可能にしました。"}]}]}/>

ユーザー空間ページキャッシュでミスが発生した場合に、それらもキャッシュに存在しない場合は、下層ストレージからこの数だけ連続したブロックを一度に読み込みます。各ブロックは page_cache_block_size バイトです。

値を大きくすると高スループットのクエリに有利ですが、低レイテンシーなポイントクエリでは先読みを行わない方がうまく動作します。

## parallel_distributed_insert_select {#parallel_distributed_insert_select} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "parallel distributed insert select をデフォルトで有効にする"}]}]}/>

並列分散 `INSERT ... SELECT` クエリを有効にします。

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` クエリを実行し、両方のテーブルが同じクラスタを使用しており、かつ両方のテーブルが [replicated](../../engines/table-engines/mergetree-family/replication.md) テーブル同士、または非 replicated テーブル同士である場合、このクエリは各分片上でローカルに処理されます。

設定可能な値:

- `0` — 無効。
- `1` — `SELECT` は distributed エンジンの配下テーブルに対して、各分片で実行されます。
- `2` — `SELECT` と `INSERT` は distributed エンジンの配下テーブルに対して／から、各分片で実行されます。

この設定を使用する場合は、`enable_parallel_replicas = 1` を設定しておく必要があります。

## parallel_hash_join_threshold {#parallel_hash_join_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

ハッシュベースの結合アルゴリズムが適用される場合、このしきい値は `hash` と `parallel_hash` のどちらを使用するかを決定するのに用いられます（右側テーブルのサイズ推定値が利用可能な場合に限ります）。
右側テーブルのサイズがしきい値未満であることが分かっている場合は、`hash` が使用されます。

## parallel_replica_offset {#parallel_replica_offset} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは内部用の設定であり、直接利用することは想定されておらず、parallel replicas モードの実装上の詳細を表します。この設定は、分散クエリにおいて、parallel replicas 間でクエリ処理に参加するレプリカの索引に対して、イニシエータとなるサーバーによって自動的に設定されます。

## parallel_replicas_allow_in_with_subquery {#parallel_replicas_allow_in_with_subquery} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "true の場合、IN 句のサブクエリがすべてのフォロワー レプリカで実行されます"}]}]}/>

true の場合、IN 句のサブクエリがすべてのフォロワー レプリカで実行されます。

## parallel_replicas_connect_timeout_ms {#parallel_replicas_connect_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "parallel replicas クエリ用の専用接続タイムアウト"}]}]}/>

parallel replicas を用いたクエリ実行時に、リモートレプリカへ接続する際のタイムアウトをミリ秒単位で指定します。タイムアウトに達した場合、そのレプリカはクエリ実行には使用されません。

## parallel_replicas_count {#parallel_replicas_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは直接使用すべきではない内部用の設定であり、'parallel replicas' モードの実装上の詳細を表します。分散クエリに対しては、クエリ処理に参加する並列レプリカの数に応じて、この設定はイニシエータサーバーによって自動的に設定されます。

## parallel_replicas_custom_key {#parallel_replicas_custom_key} 

<BetaBadge/>

特定のテーブルに対して、レプリカ間で処理を分割するために使用できる任意の整数式です。
値は任意の整数式を指定できます。

主キーを用いた単純な式が推奨されます。

この設定を、1つの分片に複数のレプリカが存在するクラスタで使用した場合、それらのレプリカは仮想分片として扱われます。
それ以外の場合は `SAMPLE` キーと同様に動作し、各分片内の複数のレプリカが使用されます。

## parallel_replicas_custom_key_range_lower {#parallel_replicas_custom_key_range_lower} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "parallel replicas を dynamic 分片 と併用する際の range フィルタを制御するための設定を追加"}]}]}/>

フィルタ種別 `range` が、カスタム範囲 `[parallel_replicas_custom_key_range_lower, INT_MAX]` に基づいて、レプリカ間で処理を均等に分割するようにします。

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` に対して、フィルタが処理をレプリカ間で均等に分割できるようになります。

注記: この設定によってクエリ処理中に追加のデータがフィルタされることはありません。代わりに、並列処理のために `range` フィルタが範囲 `[0, INT_MAX]` を分割する境界が変更されます。

## parallel_replicas_custom_key_range_upper {#parallel_replicas_custom_key_range_upper} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "dynamic shards を用いた parallel replicas 使用時に、range フィルタの範囲を制御するための設定を追加します。値が 0 の場合は上限が無効になります"}]}]}/>

フィルタ種別 `range` が、カスタム範囲 `[0, parallel_replicas_custom_key_range_upper]` に基づいて、レプリカ間で作業を均等に分割できるようにします。値が 0 の場合は上限が無効になり、カスタムキー式の最大値が上限として使用されます。

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` に対して、フィルタがレプリカ間で作業を均等に分割できるようになります。

注意: この設定によってクエリ処理中に追加のデータがフィルタリングされることはなく、並列処理のために範囲 `[0, INT_MAX]` をどの地点で分割するかが変わるだけです。

## parallel_replicas_for_cluster_engines {#parallel_replicas_for_cluster_engines} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

テーブル関数エンジンを、対応する -Cluster 版に置き換えます。

## parallel_replicas_for_non_replicated_merge_tree {#parallel_replicas_for_non_replicated_merge_tree} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse はレプリケーションされていない MergeTree テーブルに対しても parallel replicas アルゴリズムを適用します

## parallel_replicas_index_analysis_only_on_coordinator {#parallel_replicas_index_analysis_only_on_coordinator} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "索引の解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効な場合にのみ動作します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "索引の解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効な場合にのみ動作します。"}]}]}/>

索引の解析は replica-coordinator 上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_pla が有効な場合にのみ動作します。

## parallel_replicas_insert_select_local_pipeline {#parallel_replicas_insert_select_local_pipeline} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "parallel replicas 機能を用いた分散 INSERT SELECT 実行時にローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "parallel replicas 機能を用いた分散 INSERT SELECT 実行時にローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}]}/>

parallel replicas 機能を用いた分散 INSERT SELECT 実行時にローカルパイプラインを使用します

## parallel_replicas_local_plan {#parallel_replicas_local_plan} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "parallel replicas を使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "parallel replicas を使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "parallel replicas を使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}]}/>

ローカルレプリカ用のローカルプランを構築する

## parallel_replicas_mark_segment_size {#parallel_replicas_mark_segment_size} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "この SETTING の値は現在自動的に決定されます"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "新しい parallel replicas coordinator 実装においてセグメントサイズを制御するための新しい SETTING を追加"}]}]}/>

パーツは、並列読み取りのためにレプリカ間で分散されるセグメントに仮想的に分割されます。この SETTING は、これらのセグメントのサイズを制御します。動作を完全に理解しているという確信が持てるまでは、変更しないことを推奨します。値は 128 以上 16384 以下の範囲で指定する必要があります。

## parallel_replicas_min_number_of_rows_per_replica {#parallel_replicas_min_number_of_rows_per_replica} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで使用されるレプリカの数を (読み取りが見込まれる行数 / min_number_of_rows_per_replica) に制限します。上限は引き続き 'max_parallel_replicas' によって決まります。

## parallel_replicas_mode {#parallel_replicas_mode} 

<BetaBadge/>

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "この設定は、parallel replicas 機能を Beta として提供する一環として導入されました"}]}]}/>

parallel replicas で使用するカスタムキーに基づいて適用するフィルタの種類を指定します。`default` - カスタムキーに対してモジュロ演算を使用します。`range` - カスタムキーの値型で取りうるすべての値を対象に、カスタムキーに対して範囲フィルタを使用します。

## parallel_replicas_only_with_analyzer {#parallel_replicas_only_with_analyzer} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Parallel replicas は analyzer が有効な場合にのみサポートされます"}]}]}/>

Parallel replicas を使用するには analyzer を有効にする必要があります。analyzer が無効な場合、たとえ replicas からの並列読み取りが有効になっていても、クエリ実行はローカル実行にフォールバックします。analyzer を有効にせずに Parallel replicas を使用することはサポートされていません。

## parallel_replicas_prefer_local_join {#parallel_replicas_prefer_local_join} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "この設定が true の場合で、JOIN を parallel replicas アルゴリズムで実行でき、右側の JOIN 部分のすべてのストレージが *MergeTree であるときは、GLOBAL JOIN の代わりにローカル JOIN が使用されます。"}]}]}/>

この設定が true の場合で、JOIN を parallel replicas アルゴリズムで実行でき、右側の JOIN 部分のすべてのストレージが *MergeTree であるときは、GLOBAL JOIN の代わりにローカル JOIN が使用されます。

## parallel_replicas_support_projection {#parallel_replicas_support_projection} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定です。プロジェクションの最適化は並列レプリカに対して適用できます。parallel_replicas_local_plan が有効で、かつ aggregation_in_order が無効な場合にのみ有効です。"}]}]}/>

プロジェクションの最適化は並列レプリカに対して適用できます。parallel_replicas_local_plan が有効で、かつ aggregation_in_order が無効な場合にのみ有効です。

## parallel_view_processing {#parallel_view_processing} 

<SettingsInfoBlock type="Bool" default_value="0" />

アタッチされている VIEW へのプッシュを、順次ではなく並列に実行できるようにします。

## parallelize_output_from_storages {#parallelize_output_from_storages} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "file/url/s3 などから読み取るクエリを実行する際に並列処理を許可します。これにより行の順序が変わる可能性があります。"}]}]}/>

ストレージからの読み取りステップの出力を並列化します。可能な場合は、ストレージからの読み取り直後からクエリ処理を並列化できるようにします。

## parsedatetime_e_requires_space_padding {#parsedatetime_e_requires_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 'parseDateTime' におけるフォーマット指定子 '%e' は、1 桁の日付がスペースでパディングされていることを想定します。例えば ' 2' は受け付けられますが、'2' はエラーになります。

## parsedatetime_parse_without_leading_zeros {#parsedatetime_parse_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `parseDateTime` におけるフォーマッタ `%c`、`%l`、`%k` は、先頭のゼロなしで月と時間を解釈します。

## partial_merge_join_left_table_buffer_bytes {#partial_merge_join_left_table_buffer_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外の値を指定すると、partial merge join における左側テーブルで、左テーブルのブロックをより大きなブロックにまとめます。結合スレッドごとに、指定したメモリ量の最大 2 倍まで使用します。

## partial_merge_join_rows_in_right_blocks {#partial_merge_join_rows_in_right_blocks} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

部分マージ結合アルゴリズムを用いた [JOIN](../../sql-reference/statements/select/join.md) クエリにおいて、右側の JOIN データブロックのサイズ（行数）の上限を設定します。

ClickHouse サーバーは次の処理を行います:

1.  右側の JOIN データを、指定された最大行数までのブロックに分割します。
2.  各ブロックに対して、その最小値と最大値で索引を作成します。
3.  可能な場合、準備されたブロックをディスクに書き出します。

設定可能な値:

- 任意の正の整数。推奨値の範囲: \[1000, 100000\]。

## partial_result_on_first_cancel {#partial_result_on_first_cancel} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリのキャンセル後に部分的な結果を返すことを許可します。

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルが 1 つのパーティション内に、この設定値以上のアクティブなパーツを含む場合、テーブルへの挿入を意図的に遅延させます。

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルの 1 つのパーティション内に存在するアクティブなパーツ数がこの数を超えた場合、'Too many parts ...' という例外をスローします。

## per_part_index_stats {#per_part_index_stats} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

パート単位でログの索引統計を記録します

## poll_interval {#poll_interval} 

<SettingsInfoBlock type="UInt64" default_value="10" />

サーバー側のクエリ待機ループを、指定された秒数だけブロックします。

## postgresql_connection_attempt_timeout {#postgresql_connection_attempt_timeout} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 接続の `connect_timeout` パラメータを制御可能にします。"}]}]}/>

PostgreSQL エンドポイントへの 1 回の接続試行に対する接続タイムアウト時間（秒）です。
この値は、接続 URL の `connect_timeout` パラメータとして渡されます。

## postgresql_connection_pool_auto_close_connection {#postgresql_connection_pool_auto_close_connection} 

<SettingsInfoBlock type="Bool" default_value="0" />

接続をプールに戻す前に閉じます。

## postgresql_connection_pool_retries {#postgresql_connection_pool_retries} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL コネクションプールにおける再試行回数を制御できるようにします。"}]}]}/>

PostgreSQL のテーブルエンジンおよびデータベースエンジンで使用されるコネクションプールの push/pop 操作に対する再試行回数。

## postgresql_connection_pool_size {#postgresql_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL テーブルエンジンおよびデータベースエンジンで使用する接続プールのサイズ。

## postgresql_connection_pool_wait_timeout {#postgresql_connection_pool_wait_timeout} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL テーブルエンジンおよびデータベースエンジンで、プールが空の場合のコネクションプールの push/pop 操作に対するタイムアウト。デフォルトでは、プールが空の場合にブロックされます。

## postgresql_fault_injection_probability {#postgresql_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定"}]}]}/>

レプリケーションに使用される内部 PostgreSQL クエリが失敗するおおよその確率を指定します。有効な値は [0.0f, 1.0f] の範囲の値です。

## prefer&#95;column&#95;name&#95;to&#95;alias {#prefer_column_name_to_alias}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの式および句で、エイリアスではなく元のカラム名を使用するかどうかを切り替える設定です。特に、エイリアスがカラム名と同じ場合に重要です。詳細は [Expression Aliases](/sql-reference/syntax#notes-on-usage) を参照してください。この設定を有効にすると、ClickHouse におけるエイリアスの構文ルールが、他の多くのデータベースエンジンのものとより互換的になります。

設定可能な値:

* 0 — カラム名はエイリアスで置き換えられます。
* 1 — カラム名はエイリアスで置き換えられません。

**例**

有効な場合と無効な場合の違い:

クエリ:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果：

```text
サーバーから例外を受信しました (バージョン 21.5.1):
コード: 184. DB::Exception: localhost:9000 から受信しました。DB::Exception: 集約関数 avg(number) がクエリ内の別の集約関数内で見つかりました: avg(number) AS number の処理中。
```

クエリ：

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


## prefer_external_sort_block_bytes {#prefer_external_sort_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "外部ソートで使用するブロックの最大バイト数を優先し、マージ処理中のメモリ使用量を抑えます。"}]}]}/>

外部ソートで使用するブロックの最大バイト数を優先し、マージ処理中のメモリ使用量を抑えます。

## prefer_global_in_and_join {#prefer_global_in_and_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

`IN`/`JOIN` 演算子を `GLOBAL IN`/`GLOBAL JOIN` に置き換えるかどうかを制御します。

取りうる値:

- 0 — 無効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられません。
- 1 — 有効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられます。

**使用方法**

`SET distributed_product_mode=global` は分散テーブルに対するクエリの動作を変更できますが、ローカルテーブルや外部リソース由来のテーブルには適していません。このような場合に `prefer_global_in_and_join` 設定が役立ちます。

例えば、分散処理には適さないローカルテーブルを保持しているクエリ処理ノードがあるとします。分散処理の際に `GLOBAL` キーワード（`GLOBAL IN`/`GLOBAL JOIN`）を使用して、そのデータをオンザフライで分散させる必要があります。

`prefer_global_in_and_join` のもう一つのユースケースは、外部エンジンによって作成されたテーブルへアクセスする場合です。この設定は、そのようなテーブルを JOIN する際に外部ソースへの呼び出し回数を削減するのに役立ちます。クエリごとに 1 回の呼び出しだけで済むようになります。

**併せて参照:**

- [`GLOBAL IN`/`GLOBAL JOIN` の使用方法の詳細については、Distributed subqueries](/sql-reference/operators/in#distributed-subqueries) を参照してください

## prefer_localhost_replica {#prefer_localhost_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散クエリを処理する際に、localhost のレプリカを優先的に使用するかどうかを有効／無効にします。

設定値:

- 1 — localhost のレプリカが存在する場合、ClickHouse は常にクエリをそのレプリカに送信します。
- 0 — ClickHouse は [load_balancing](#load_balancing) 設定で指定されたバランシング戦略を使用します。

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用せずに [max_parallel_replicas](#max_parallel_replicas) を使用する場合は、この設定を無効にしてください。
[parallel_replicas_custom_key](#parallel_replicas_custom_key) が設定されている場合、この設定を無効にするのは、複数の分片と複数のレプリカを含むクラスタで使用している場合に限ってください。
単一の分片と複数のレプリカを持つクラスタで使用している場合にこの設定を無効にすると、悪影響を及ぼします。
:::

## prefer_warmed_unmerged_parts_seconds {#prefer_warmed_unmerged_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ効果があります。マージ済みパーツが作成からこの秒数以内で、かつ事前ウォームされておらず（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）、そのパーツの元となったすべてのパーツが利用可能かつ事前ウォームされている場合、SELECT クエリは代わりにそれらのパーツから読み取ります。Replicated-/SharedMergeTree の場合にのみ有効です。これは CacheWarmer がそのパーツを処理したかどうかだけを確認する点に注意してください。パーツが他の要因によってキャッシュにフェッチされていた場合でも、CacheWarmer が処理するまではコールドと見なされます。また、ウォームされた後にキャッシュから削除された場合でも、ウォーム済みと見なされます。

## preferred_block_size_bytes {#preferred_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

この設定はクエリ処理に使用されるデータブロックサイズを調整し、より大まかな設定である「max_block_size」に対する追加の微調整を行います。カラムが大きく、「max_block_size」行を含めるとブロックサイズが指定したバイト数を超えそうな場合は、CPU キャッシュの局所性を高めるために、そのサイズが自動的に小さく調整されます。

## preferred_max_column_in_block_size_bytes {#preferred_max_column_in_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時に適用される、ブロック内のカラムサイズの上限。キャッシュミスの回数を減らすのに役立ちます。L2 キャッシュサイズに近い値に設定します。

## preferred_optimize_projection_name {#preferred_optimize_projection_name} 

空でない文字列が設定されている場合、ClickHouse はクエリで指定された PROJECTION を適用しようとします。

取りうる値:

- string: 優先する PROJECTION の名前

## prefetch_buffer_size {#prefetch_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ファイルシステムからの読み取りに使用されるプリフェッチバッファの最大サイズ。

## print&#95;pretty&#95;type&#95;names {#print_pretty_type_names}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "ユーザーエクスペリエンスが向上しました。"}]}]} />

`DESCRIBE` クエリおよび `toTypeName()` 関数で、深くネストした型名をインデント付きの読みやすい形式で出力できるようにします。

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


## priority {#priority} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの優先度。1 が最も高く、値が大きいほど優先度は低くなります。0 の場合は優先度を使用しません。

## promql_database {#promql_database} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的な設定"}]}]}/>

`promql` 方言で使用するデータベース名を指定します。空文字列を指定した場合は、現在のデータベースを意味します。

## promql_evaluation_time {#promql_evaluation_time} 

<ExperimentalBadge/>

**エイリアス**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "この設定は名前が変更されました。以前の名前は `evaluation_time` です。"}]}]}/>

PromQL 方言で使用される評価時刻を設定します。`auto` の場合は現在時刻が使用されます。

## promql_table {#promql_table} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的な設定"}]}]}/>

「promql」方言で使用される TimeSeries テーブルの名前を指定します。

## push_external_roles_in_interserver_queries {#push_external_roles_in_interserver_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリの実行中に、発行元ノードから他のノードへユーザーロールを転送できるようにします。

## query_cache_compress_entries {#query_cache_compress_entries} 

<SettingsInfoBlock type="Bool" default_value="1" />

[クエリキャッシュ](../query-cache.md) 内のエントリを圧縮します。クエリキャッシュへの挿入およびそこからの読み取りが遅くなる代わりに、クエリキャッシュのメモリ消費量を抑えます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_max_entries {#query_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) に保存できるクエリ結果の最大数。0 の場合は無制限。

取りうる値:

- 0 以上の整数。

## query_cache_max_size_in_bytes {#query_cache_max_size_in_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) 内で割り当て可能なメモリの最大量（バイト単位）。0 の場合は無制限。

取り得る値:

- 0 以上の整数。

## query_cache_min_query_duration {#query_cache_min_query_duration} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

クエリ結果が[query cache](../query-cache.md)に保存されるための最小実行時間（ミリ秒単位）。

設定可能な値:

- 0 以上の正の整数。

## query_cache_min_query_runs {#query_cache_min_query_runs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) に保存されるまでに、そのクエリが実行されている必要がある最小回数。

取り得る値:

- 0 以上の整数。

## query_cache_nondeterministic_function_handling {#query_cache_nondeterministic_function_handling} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

[クエリキャッシュ](../query-cache.md) が、`rand()` や `now()` のような非決定的関数を含む `SELECT` クエリをどのように扱うかを制御します。

指定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_share_between_users {#query_cache_share_between_users} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、[query cache](../query-cache.md) にキャッシュされた `SELECT` クエリの結果を他のユーザーも読み取れるようになります。
セキュリティ上の理由から、この設定を有効にすることは推奨されません。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_squash_partial_results {#query_cache_squash_partial_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

部分結果ブロックを、サイズが [max_block_size](#max_block_size) のブロックにまとめます。[query cache](../query-cache.md) への挿入性能は低下しますが、キャッシュエントリの圧縮効率が向上します（[query_cache_compress-entries](#query_cache_compress_entries) を参照）。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_system_table_handling {#query_cache_system_table_handling} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "クエリキャッシュは system テーブルに対するクエリ結果をキャッシュしなくなりました"}]}]}/>

[query cache](../query-cache.md) が、`system.*` および `information_schema.*` データベース内のテーブル（システムテーブル）に対する `SELECT` クエリをどのように扱うかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_tag {#query_cache_tag} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "query cache 設定にラベルを付けるための新しい設定。"}]}]}/>

[query cache](../query-cache.md) のエントリに付与するラベルとして機能する文字列です。
同じクエリでも、異なるタグが付いている場合は query cache によって別個のものとして扱われます。

取りうる値:

- 任意の文字列

## query_cache_ttl {#query_cache_ttl} 

<SettingsInfoBlock type="Seconds" default_value="60" />

この秒数が経過すると、[query cache](../query-cache.md) 内のエントリは古くなったと見なされます。

指定可能な値:

- 0 以上の正の整数

## query_condition_cache_store_conditions_as_plaintext {#query_condition_cache_store_conditions_as_plaintext} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

[query condition cache](/operations/query-condition-cache) のフィルタ条件を平文で保存します。
有効化すると、system.query_condition_cache にフィルタ条件がそのままの形で表示され、キャッシュに関する問題のデバッグが容易になります。
平文のフィルタ条件によって機密情報が露出する可能性があるため、デフォルトでは無効です。

指定可能な値:

- 0 - 無効
- 1 - 有効

## query_metric_log_interval {#query_metric_log_interval} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "新しい設定です。"}]}]}/>

個々のクエリに対する [query_metric_log](../../operations/system-tables/query_metric_log.md) が収集される間隔（ミリ秒）です。

負の値が設定された場合は、[query_metric_log setting](/operations/server-configuration-parameters/settings#query_metric_log) の `collect_interval_milliseconds` の値が使用され、設定されていない場合はデフォルトで 1000 が使用されます。

単一のクエリについて収集を無効にするには、`query_metric_log_interval` を 0 に設定します。

デフォルト値: -1

## query_plan_aggregation_in_order {#query_plan_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "クエリプラン周りの一部リファクタリングを有効化"}]}]}/>

クエリプランレベルでのインオーダー集約最適化を切り替えます。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) の値が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_convert_any_join_to_semi_or_anti_join {#query_plan_convert_any_join_to_semi_or_anti_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

JOIN 後のフィルタが、未マッチ行またはマッチ行に対して常に false に評価される場合に、ANY JOIN を SEMI JOIN または ANTI JOIN に変換できるようにする設定です

## query_plan_convert_join_to_in {#query_plan_convert_join_to_in} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

出力カラムが左テーブルにのみ依存している場合、`JOIN` を `IN` を用いたサブクエリに変換することを許可します。`ANY` 以外の JOIN（デフォルトである ALL JOIN など）の場合、誤った結果をもたらす可能性があります。

## query_plan_convert_outer_join_to_inner_join {#query_plan_convert_outer_join_to_inner_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "JOIN の後に適用されるフィルターが常にデフォルト値を除外する場合に OUTER JOIN を INNER JOIN に変換できるようにする"}]}]}/>

`JOIN` の後に適用されるフィルターが常にデフォルト値を除外する場合に、`OUTER JOIN` を `INNER JOIN` に変換できるようにする

## query_plan_direct_read_from_text_index {#query_plan_direct_read_from_text_index} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

クエリプランで反転テキストインデックスのみを用いて、全文検索によるフィルタリングを行えるようにします。

## query_plan_display_internal_aliases {#query_plan_display_internal_aliases} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

元のクエリで指定されたエイリアスの代わりに、EXPLAIN PLAN の出力で内部エイリアス（__table1 など）を表示します。

## query_plan_enable_multithreading_after_window_functions {#query_plan_enable_multithreading_after_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数評価後にマルチスレッド処理を有効化し、ストリーム処理を並列実行できるようにします

## query_plan_enable_optimizations {#query_plan_enable_optimizations} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでのクエリ最適化を切り替えます。

:::note
これは開発者によるデバッグ用途にのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性を損なう形で変更されたり、削除されたりする可能性があります。
:::

指定可能な値:

- 0 - クエリプランレベルでのすべての最適化を無効にする
- 1 - クエリプランレベルでの最適化を有効にする（ただし、個々の最適化はそれぞれの設定で引き続き無効化されている場合があります）

## query_plan_execute_functions_after_sorting {#query_plan_execute_functions_after_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート処理の後に式を移動するクエリプランレベルの最適化を有効 / 無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_filter_push_down {#query_plan_filter_push_down} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプラン単位の最適化のオン／オフを切り替えます。この最適化は、実行プラン内のフィルタをより下位の段階へ移動します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。今後、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

Possible values:

- 0 - 無効
- 1 - 有効

## query_plan_join_shard_by_pk_ranges {#query_plan_join_shard_by_pk_ranges} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

両方のテーブルで、JOIN キーに PRIMARY KEY のプレフィックスが含まれている場合に、JOIN にシャーディングを適用します。`hash`、`parallel_hash`、`full_sorting_merge` アルゴリズムでサポートされます。通常はクエリの高速化にはつながりませんが、メモリ使用量を削減できる場合があります。

## query_plan_join_swap_table {#query_plan_join_swap_table} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新しい設定。以前は常に右テーブルが選択されていました。"}]}]}/>

クエリプランにおいて、結合のどちら側のテーブルをビルドテーブル（インナー（内部）テーブルとも呼ばれ、ハッシュ結合でハッシュテーブルに挿入される側）にするかを決定します。この設定が有効なのは、`JOIN ON` 句を使用する `ALL` 結合の厳密性のみです。取りうる値は次のとおりです。

- 'auto': どちらのテーブルをビルドテーブルとして使用するかをプランナーに任せます。
    - 'false': テーブルを入れ替えません（右テーブルがビルドテーブルになります）。
    - 'true': 常にテーブルを入れ替えます（左テーブルがビルドテーブルになります）。

## query_plan_lift_up_array_join {#query_plan_lift_up_array_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでの最適化を切り替えます。この最適化では、実行プラン内で `ARRAY JOIN` をより上位の段階へ移動します。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) の値が 1 の場合にのみ効果があります。

:::note
これは、開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_lift_up_union {#query_plan_lift_up_union} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランのより大きなサブツリーを `union` に持ち上げて、さらなる最適化を可能にする、クエリプランレベルの最適化の有効／無効を切り替える設定です。
この設定は [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_max_limit_for_lazy_materialization {#query_plan_max_limit_for_lazy_materialization} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "遅延マテリアライゼーション最適化でクエリプランを使用できる最大値を制御するための新しい設定を追加しました。0 の場合、上限はありません。"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "100"},{"label": "より最適化されました"}]}]}/>

遅延マテリアライゼーション最適化でクエリプランを使用できる最大値を制御します。0 の場合、上限はありません。

## query_plan_max_optimizations_to_apply {#query_plan_max_optimizations_to_apply} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

クエリプランに適用される最適化の総数を制限します。設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) を参照してください。
複雑なクエリの最適化処理に時間がかかりすぎることを防ぐのに役立ちます。
EXPLAIN PLAN クエリでは、この上限に達した時点で最適化の適用を停止し、その時点のプランをそのまま返します。
通常のクエリ実行では、実際の最適化回数がこの設定値を超えた場合、例外がスローされます。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。この設定は、将来後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

## query_plan_max_step_description_length {#query_plan_max_step_description_length} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN におけるステップの説明文の最大長さ。

## query_plan_merge_expressions {#query_plan_merge_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

連続するフィルタをマージする、クエリプランレベルの最適化の有効／無効を切り替えます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき、上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_merge_filter_into_join_condition {#query_plan_merge_filter_into_join_condition} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "フィルターを結合条件に統合する新しい設定を追加"}]}]}/>

`JOIN` 条件へのフィルターの統合と、`CROSS JOIN` の `INNER JOIN` への変換を許可します。

## query_plan_merge_filters {#query_plan_merge_filters} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "クエリプラン内のフィルタのマージを許可します"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "クエリプラン内のフィルタのマージを許可します。これは、新しいアナライザでのフィルタプッシュダウンを正しくサポートするために必要です。"}]}]}/>

クエリプラン内のフィルタのマージを許可します。

## query_plan_optimize_join_order_limit {#query_plan_optimize_join_order_limit} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "デフォルトで、より多くのテーブルに対する JOIN の並べ替えを許可"}]}]}/>

同一サブクエリ内での JOIN の順序を最適化します。現在はごく限られたケースでのみサポートされています。
この値は、最適化を行うテーブルの最大数です。

## query_plan_optimize_lazy_materialization {#query_plan_optimize_lazy_materialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "遅延マテリアライゼーションを最適化するためにクエリプランを使用する新しい設定を追加"}]}]}/>

遅延マテリアライゼーションの最適化にクエリプランを使用します。

## query_plan_optimize_prewhere {#query_plan_optimize_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "サポートされているストレージに対し、フィルタ条件を PREWHERE 式までプッシュダウンできるようにする"}]}]}/>

サポートされているストレージに対し、フィルタ条件を PREWHERE 式までプッシュダウンできるようにする

## query_plan_push_down_limit {#query_plan_push_down_limit} 

<SettingsInfoBlock type="Bool" default_value="1" />

実行プラン内で `LIMIT` をより下流の段階に移動させる、クエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ用途でのみ使用すべき、上級者向けの設定です。将来のバージョンで後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

指定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order {#query_plan_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでの順序どおり読み取り最適化を有効／無効にします。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来的に、この設定は後方互換性のない形で変更されたり、削除される可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order_through_join {#query_plan_read_in_order_through_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

JOIN 操作において左側テーブルからの順序どおりの読み取りを維持し、その結果を後続のステップで利用できるようにします。

## query_plan_remove_redundant_distinct {#query_plan_remove_redundant_distinct} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "クエリプラン内の冗長な DISTINCT ステップを削除"}]}]}/>

冗長な DISTINCT ステップを削除するクエリプランレベルの最適化を有効／無効にします。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ用途でのみ使用すべき上級者向けの SETTING です。この SETTING は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_sorting {#query_plan_remove_redundant_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id":"row-1","items":[{"label":"23.1"},{"label":"1"},{"label":"クエリプランで冗長なソートを削除します。例えば、サブクエリ内の ORDER BY 句に関連するソートステップなど"}]}]}/>

クエリプランレベルの最適化で、冗長なソート処理を削除するかどうかを切り替えます（例：サブクエリ内のソートステップなど）。
Only takes effect if setting [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) is 1。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。今後、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_unused_columns {#query_plan_remove_unused_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "新しい設定。クエリプラン内で未使用のカラムを削除する最適化を追加しました。"}]}]}/>

クエリプランの各ステップから未使用のカラム（入力カラムと出力カラムの両方）を削除しようとする、クエリプランレベルの最適化を有効／無効にする設定です。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき、上級者向けの設定です。将来的に後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_reuse_storage_ordering_for_window_functions {#query_plan_reuse_storage_ordering_for_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数のソート時に、ストレージのソート順を利用するクエリプランレベルの最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき、上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_split_filter {#query_plan_split_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来、この設定は後方互換性のない形で変更されるか、削除される可能性があります。
:::

フィルターを個々の式に分割するクエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_text_index_add_hint {#query_plan_text_index_add_hint} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

クエリプラン上で、反転テキスト索引から構築されるフィルタに対してヒント（追加述語）を指定できるようにします。

## query_plan_try_use_vector_search {#query_plan_try_use_vector_search} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

ベクトル類似度索引の利用を試みる、クエリプランレベルの最適化を切り替えます。
Only takes effect if setting [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) is 1.

:::note
これは開発者がデバッグ目的でのみ使用すべき、上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_use_new_logical_join_step {#query_plan_use_new_logical_join_step} 

**別名**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しいステップを有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい join ステップ（内部的な変更）"}]}]}/>

クエリプランで logical join ステップを使用します。  
注意: `query_plan_use_new_logical_join_step` は非推奨です。代わりに `query_plan_use_logical_join_step` を使用してください。

## query_profiler_cpu_time_period_ns {#query_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の CPU クロックタイマーの周期を設定します。このタイマーは CPU 時間のみをカウントします。

取りうる値は次のとおりです:

- 正の整数のナノ秒値。

    推奨値:

            - 単一クエリ向け: 10000000（1 秒間に 100 回）ナノ秒以上。
            - クラスタ全体のプロファイリング向け: 1000000000（1 秒に 1 回）。

- タイマーを無効化する場合は 0 を指定します。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns {#query_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の実時間クロックタイマーの周期を設定します。実時間クロックタイマーはウォールクロック時間を計測します。

設定可能な値：

- 正の整数値（ナノ秒単位）。

    推奨値：

            - 10000000（1 秒間に 100 回）ナノ秒以下: 単一クエリ向け。
            - 1000000000（1 秒に 1 回）: クラスター全体のプロファイリング向け。

- 0: タイマーを無効にします。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms {#queue_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

同時実行リクエスト数が最大値を超えた場合に、リクエストキュー内で待機する最大時間。

## rabbitmq_max_wait_ms {#rabbitmq_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

RabbitMQ からの読み取りを再試行する前に待機する時間。

## read_backoff_max_throughput {#read_backoff_max_throughput} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

読み取りが遅い場合に、スレッド数を削減するための設定です。読み取り帯域幅が 1 秒あたりこの値（バイト数）未満の場合にイベントをカウントします。

## read_backoff_min_concurrency {#read_backoff_min_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="1" />

読み取りが遅い場合に維持しようとする最小スレッド数を設定します。

## read_backoff_min_events {#read_backoff_min_events} 

<SettingsInfoBlock type="UInt64" default_value="2" />

低速な読み取りが発生した場合に、スレッド数を減らすための設定です。スレッド数を減らすきっかけとなるイベント数を指定します。

## read_backoff_min_interval_between_events_ms {#read_backoff_min_interval_between_events_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

読み取りが遅い場合にスレッド数を減らすための設定です。前回のイベントからの経過時間が一定時間未満の場合は、そのイベントを無視します。

## read_backoff_min_latency_ms {#read_backoff_min_latency_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

読み取りが遅い場合にスレッド数を減らすための設定です。この時間以上かかった読み取りのみを対象とします。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache {#read_from_distributed_cache_if_exists_otherwise_bypass_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。read_from_filesystem_cache_if_exists_otherwise_bypass_cache と同じですが、分散キャッシュ用です。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache {#read_from_filesystem_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルシステムキャッシュをパッシブモードで使用することを許可します。すでに存在するキャッシュエントリは利用しますが、新たなエントリはキャッシュに追加しません。重いアドホッククエリに対してこの設定を有効にし、短いリアルタイムクエリでは無効のままにしておくことで、重すぎるクエリによるキャッシュスラッシングを回避し、システム全体の効率を向上させることができます。

## read_from_page_cache_if_exists_otherwise_bypass_cache {#read_from_page_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間ページキャッシュを追加"}]}]}/>

read_from_filesystem_cache_if_exists_otherwise_bypass_cache と同様に、パッシブモードでユーザー空間ページキャッシュを使用します。

## read_in_order_two_level_merge_threshold {#read_in_order_two_level_merge_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

主キー順でのマルチスレッド読み取り時に、事前マージ処理を実行するために読み込む最小のパーツ数。

## read_in_order_use_buffering {#read_in_order_use_buffering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "主キー順に読み取る際にマージの前にバッファリングを使用する"}]}]}/>

主キー順に読み取る際に、マージの前にバッファリングを使用します。これにより、クエリ実行の並列度が向上します。

## read_in_order_use_virtual_row {#read_in_order_use_virtual_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "主キーまたはその単調関数に従った順序で読み取る際に仮想行を使用します。複数のパーツをまたいで検索する場合に、関連するパーツだけにアクセスするため有用です。"}]}]}/>

主キーまたはその単調関数に従った順序で読み取る際に仮想行を使用します。複数のパーツをまたいで検索する場合に、関連するパーツだけにアクセスするため有用です。

## read_overflow_mode {#read_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

上限を超えた場合の動作。

## read_overflow_mode_leaf {#read_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

読み取りデータ量がいずれかの leaf 制限を超えた場合に、どのように処理するかを設定します。

選択可能なオプション:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、途中までの結果を返します。

## read_priority {#read_priority} 

<SettingsInfoBlock type="Int64" default_value="0" />

ローカルファイルシステムまたはリモートファイルシステムからデータを読み取る際の優先度を指定します。ローカルファイルシステムでは 'pread_threadpool' メソッドにのみ、リモートファイルシステムでは `threadpool` メソッドにのみサポートされています。

## read_through_distributed_cache {#read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからの読み取りを許可します。

## readonly {#readonly} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 読み取り専用の制限はない。1 - 読み取りリクエストのみ許可され、明示的に許可された設定のみ変更可能。2 - 読み取りリクエストのみ許可され、`readonly` 設定を除く設定の変更が可能。

## receive_data_timeout_ms {#receive_data_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

レプリカから最初のデータパケット、または正の進行状況を示すパケットを受信するまでの接続タイムアウト。

## receive_timeout {#receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークからデータを受信するためのタイムアウト時間（秒）です。この時間内に1バイトもデータを受信しなかった場合、例外がスローされます。クライアント側でこの SETTING を設定すると、対応するサーバー側接続のソケットに対しても `send_timeout` が設定されます。

## regexp_max_matches_per_row {#regexp_max_matches_per_row} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

1 行あたりの 1 つの正規表現に対する最大一致数を設定します。貪欲な正規表現を使用した [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 関数でのメモリ過負荷を防ぐために使用します。

設定可能な値:

- 正の整数

## reject_expensive_hyperscan_regexps {#reject_expensive_hyperscan_regexps} 

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan で評価する際に（NFA の状態爆発により）計算コストが高くなる可能性が高い正規表現パターンを拒否します

## remerge_sort_lowered_memory_bytes_ratio {#remerge_sort_lowered_memory_bytes_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

再マージ後のメモリ使用量がこの比率以上に削減されない場合、再マージは無効化されます。

## remote_filesystem_read_method {#remote_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="threadpool" />

リモートファイルシステムからのデータ読み取り方式。`read` または `threadpool` を指定できます。

## remote_filesystem_read_prefetch {#remote_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムからデータを読み込む際にプリフェッチを行うかどうかを指定します。

## remote_fs_read_backoff_max_tries {#remote_fs_read_backoff_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="5" />

バックオフしながら行う読み取りの最大試行回数

## remote_fs_read_max_backoff_ms {#remote_fs_read_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

リモートディスクからデータを読み込もうとする際の最大待機時間

## remote_read_min_bytes_for_seek {#remote_read_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

リモート読み取り（URL、S3）で、読み飛ばしながら読み込むのではなくシークを行うために必要な最小バイト数。

## rename_files_after_processing {#rename_files_after_processing} 

- **Type:** 文字列

- **Default value:** 空文字列

この設定では、`file` テーブル関数によって処理されたファイルに対して使用する名前変更パターンを指定できます。この設定が有効な場合、`file` テーブル関数で読み取られたすべてのファイルは、処理が正常に完了した場合にのみ、指定されたプレースホルダー付きパターンに従って名前変更されます。

### プレースホルダー {#placeholders}

- `%a` — 元のファイル名（例: "sample.csv"）。
- `%f` — 拡張子を除いた元のファイル名（例: "sample"）。
- `%e` — ドット付きの元のファイル拡張子（例: ".csv"）。
- `%t` — マイクロ秒単位のタイムスタンプ。
- `%%` — パーセント記号 ("%")。

### 例 {#example}

- オプション: `--rename_files_after_processing="processed_%f_%t%e"`

- クエリ: `SELECT * FROM file('sample.csv')`

`sample.csv` の読み込みが成功すると、ファイル名は `processed_sample_1683473210851438.csv` に変更されます。

## replace_running_query {#replace_running_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP インターフェイスを使用する場合、`query_id` パラメータを渡すことができます。これはクエリ識別子として機能する任意の文字列です。
同じユーザーから同じ `query_id` を持つクエリがその時点ですでに存在する場合、その挙動は `replace_running_query` パラメータによって決まります。

`0` (デフォルト) – 例外をスローします（同じ `query_id` を持つクエリがすでに実行中の場合は、新たなクエリを実行しません）。

`1` – 古いクエリをキャンセルし、新しいクエリの実行を開始します。

セグメンテーション条件のサジェスト機能を実装する場合には、このパラメータを 1 に設定します。次の文字を入力した時点で古いクエリがまだ終了していなければ、そのクエリはキャンセルされるべきです。

## replace_running_query_max_wait_ms {#replace_running_query_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[replace_running_query](#replace_running_query) SETTING が有効な場合に、同じ `query_id` を持つ実行中のクエリが完了するまで待機する時間。

取りうる値:

- 正の整数。
- 0 — サーバーがすでに同じ `query_id` のクエリを実行している場合、新しいクエリの実行を許可しない例外をスローする。

## replication_wait_for_inactive_replica_timeout {#replication_wait_for_inactive_replica_timeout} 

<SettingsInfoBlock type="Int64" default_value="120" />

非アクティブなレプリカが [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md)、または [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを実行するのを待機する時間（秒）を指定します。

指定可能な値:

- `0` — 待機しません。
- 負の整数 — 無制限に待機します。
- 正の整数 — 待機する秒数。

## restore_replace_external_dictionary_source_to_null {#restore_replace_external_dictionary_source_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

リストア時に外部 Dictionary のソースを Null に置き換えます。テスト目的で便利です。

## restore_replace_external_engines_to_null {#restore_replace_external_engines_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

テスト目的で使用するためのものです。すべての外部エンジンを Null に置き換え、外部接続が確立されないようにします。

## restore_replace_external_table_functions_to_null {#restore_replace_external_table_functions_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

テスト目的で使用する設定です。すべての外部テーブル関数を Null に置き換え、外部接続が確立されないようにします。

## restore_replicated_merge_tree_to_shared_merge_tree {#restore_replicated_merge_tree_to_shared_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

RESTORE 実行時にテーブルエンジンを Replicated*MergeTree から Shared*MergeTree に置き換えます。

## result&#95;overflow&#95;mode {#result_overflow_mode}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Cloud のデフォルト値: `throw`

結果のボリュームがいずれかの制限を超えた場合にどうするかを設定します。

取りうる値:

* `throw`: 例外をスローします (デフォルト)。
* `break`: クエリの実行を停止し、ソースデータが尽きたかのように、
  部分的な結果を返します。

`break` の利用は LIMIT の利用に似ています。`break` はブロックレベルでのみ実行を中断します。これは、返される行数が
[`max_result_rows`](/operations/settings/settings#max_result_rows) より大きく、[`max_block_size`](/operations/settings/settings#max_block_size)
の倍数となり、さらに [`max_threads`](/operations/settings/settings#max_threads) に依存することを意味します。

**例**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
6666 行が設定されています。...
```


## rewrite_count_distinct_if_with_count_distinct_implementation {#rewrite_count_distinct_if_with_count_distinct_implementation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "Rewrite countDistinctIf with count_distinct_implementation configuration"}]}]}/>

`countDistcintIf` を [count_distinct_implementation](#count_distinct_implementation) SETTING で書き換えることを許可します。

設定可能な値:

- true — 許可します。
- false — 許可しません。

## rewrite_in_to_join {#rewrite_in_to_join} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

「x IN subquery」のような式を JOIN に書き換えます。これにより、JOIN の並べ替えによってクエリ全体を最適化できる場合があります。

## s3_allow_multipart_copy {#s3_allow_multipart_copy} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

S3 でマルチパートコピーを有効にします。

## s3_allow_parallel_part_upload {#s3_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

S3 のマルチパートアップロードに複数スレッドを使用します。メモリ使用量がわずかに増加する可能性があります。

## s3_check_objects_after_upload {#s3_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

アップロードされた各オブジェクトについて、アップロードが成功したことを確認するために、S3 に対して `HEAD` リクエストを送信してチェックします

## s3_connect_timeout_ms {#s3_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Introduce new dedicated setting for s3 connection timeout"}]}]}/>

S3 ディスクのホストへの接続タイムアウト。

## s3_create_new_file_on_insert {#s3_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

s3 エンジンテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを切り替える設定です。有効にした場合、各 `INSERT` 時に、次のようなパターンに従ったキーを持つ新しい S3 オブジェクトが作成されます。

initial: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

取りうる値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが存在していて `s3_truncate_on_insert` が設定されていない場合は失敗します。
- 1 — `INSERT` クエリは、`s3_truncate_on_insert` が設定されていない場合、(2 回目以降は) サフィックスを使用して `INSERT` ごとに新しいファイルを作成します。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_disable_checksum {#s3_disable_checksum} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルを S3 に送信する際にチェックサムを計算しません。これにより、ファイルに対する余分な処理パスを回避できるため、書き込みが高速になります。多くの場合、安全性に問題はありません。なぜなら、MergeTree テーブルのデータにはそもそも ClickHouse によるチェックサムが付与されており、さらに S3 へ HTTPS でアクセスする場合、ネットワーク転送中の完全性は TLS レイヤーによってすでに保護されているためです。S3 上で追加のチェックサムを有効にすると、多層防御としての効果が得られます。

## s3_ignore_file_doesnt_exist {#s3_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、S3 テーブルエンジンで例外をスローする代わりに 0 行を返すことを許可"}]}]}/>

特定のキーを読み取る際に、対象のファイルが存在しない場合は、そのファイルが存在しないことを無視します。

取りうる値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## s3_list_object_keys_size {#s3_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストで一度に返されるファイル数の上限

## s3_max_connections {#s3_max_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

1 サーバーあたりの最大接続数です。

## s3_max_get_burst {#s3_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数制限に達する前に、同時に発行できるリクエストの最大数です。デフォルト値 (0) の場合、`s3_max_get_rps` と同じ値になります。

## s3_max_get_rps {#s3_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットルがかかる前の、1 秒あたりの S3 GET リクエスト数の上限です。0 は無制限を意味します。

## s3_max_inflight_parts_for_one_file {#s3_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

マルチパートアップロードリクエストで同時にアップロードされるパーツの最大数。0 を指定すると無制限になります。

## s3_max_part_number {#s3_max_part_number} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "S3 アップロード時のパート番号の最大値"}]}]}/>

S3 アップロード時のパート番号の最大値。

## s3_max_put_burst {#s3_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数の上限に達する前に同時に発行できる最大リクエスト数です。デフォルト値 (0) の場合は `s3_max_put_rps` と同じ値になります。

## s3_max_put_rps {#s3_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが発生する前の、1 秒あたりの S3 への PUT リクエスト数の上限です。0 は無制限を意味します。

## s3_max_single_operation_copy_size {#s3_max_single_operation_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "s3 における単一コピー操作の最大サイズ"}]}]}/>

S3 における 1 回のコピー操作の最大サイズ。この設定は、s3_allow_multipart_copy が true の場合にのみ有効です。

## s3_max_single_part_upload_size {#s3_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

単一パートアップロード方式で S3 にアップロードできるオブジェクトの最大サイズです。

## s3_max_single_read_retries {#s3_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の S3 読み取り時に行う再試行の最大回数。

## s3_max_unexpected_write_error_retries {#s3_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

S3 への書き込み中に予期しないエラーが発生した場合に行う再試行の最大回数。

## s3_max_upload_part_size {#s3_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

S3 へのマルチパートアップロードでアップロードする各パートの最大サイズ。

## s3_min_upload_part_size {#s3_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

S3 へのマルチパートアップロードでアップロードするパートの最小サイズ。

## s3_path_filter_limit {#s3_path_filter_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

ファイルを走査する際に glob リストの代わりに利用するため、クエリフィルタから抽出できる `_path` 値の最大数です。
0 を指定すると無効になります。

## s3_request_timeout_ms {#s3_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

S3 とのデータ送受信における無通信状態のタイムアウトです。単一の TCP の read または write 呼び出しがこの時間以上ブロックし続けた場合、失敗とみなします。

## s3_skip_empty_files {#s3_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "より良い UX を提供できることを期待しています"}]}]}/>

[S3](../../engines/table-engines/integrations/s3.md) エンジンテーブルで、空のファイルをスキップする機能を有効または無効にします。

設定可能な値:

- 0 — 空のファイルが要求されたフォーマットと互換性がない場合、`SELECT` が例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## s3_slow_all_threads_after_network_error {#s3_slow_all_threads_after_network_error} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドが、ソケットタイムアウトなどのリトライ可能なネットワークエラーがいずれか 1 つの S3 リクエストで発生した後にスローダウンされます。
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフを処理します。

## s3_strict_upload_part_size {#s3_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

S3 へのマルチパートアップロード時にアップロードするパーツの正確なサイズを指定します（一部の実装では可変サイズのパーツをサポートしません）。

## s3_throw_on_zero_files_match {#s3_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

ListObjects リクエストで一致するファイルが 1 つも見つからない場合にエラーをスローします。

## s3_truncate_on_insert {#s3_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

S3 エンジンのテーブルへの挿入前に、ファイルを切り詰め（truncate）するかどうかを制御します。無効にすると、S3 オブジェクトがすでに存在する場合に挿入を行おうとすると、例外がスローされます。

可能な値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが存在していて s3_create_new_file_on_insert が設定されていない場合は失敗します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_upload_part_size_multiply_factor {#s3_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

単一の S3 への書き込み操作から s3_multiply_parts_count_threshold 個のパーツがアップロードされるごとに、s3_min_upload_part_size をこの係数で乗算します。

## s3_upload_part_size_multiply_parts_count_threshold {#s3_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

この数のパーツが S3 にアップロードされるたびに、s3_min_upload_part_size は s3_upload_part_size_multiply_factor で乗算されます。

## s3_use_adaptive_timeouts {#s3_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定すると、すべての S3 リクエストについて、最初の 2 回の試行は送信および受信タイムアウト値を短くして行われます。  
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## s3_validate_request_settings {#s3_validate_request_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "S3 リクエスト設定の検証を無効化できるようにする"}]}]}/>

S3 リクエスト設定の検証を有効にします。
使用可能な値:

- 1 — 設定を検証する。
- 0 — 設定を検証しない。

## s3queue_default_zookeeper_path {#s3queue_default_zookeeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue エンジン用のデフォルトの ZooKeeper パスのプレフィックス

## s3queue_enable_logging_to_s3queue_log {#s3queue_enable_logging_to_s3queue_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

`system.s3queue_log` への書き込みを有効にします。この値はテーブル設定でテーブルごとに上書きできます。

## s3queue_keeper_fault_injection_probability {#s3queue_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

S3Queue に対する Keeper 障害注入の確率。

## s3queue_migrate_old_metadata_to_buckets {#s3queue_migrate_old_metadata_to_buckets} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

S3Queue テーブルの古いメタデータ構造を新しい構造に移行します

## schema_inference_cache_require_modification_time_for_url {#schema_inference_cache_require_modification_time_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

最終更新時刻を検証したうえで、キャッシュ内のスキーマを URL に対して使用する（Last-Modified ヘッダーを持つ URL が対象）

## schema_inference_use_cache_for_azure {#schema_inference_use_cache_for_azure} 

<SettingsInfoBlock type="Bool" default_value="1" />

Azure テーブル関数を使用する際のスキーマ推論でキャッシュを使用する

## schema_inference_use_cache_for_file {#schema_inference_use_cache_for_file} 

<SettingsInfoBlock type="Bool" default_value="1" />

file テーブル関数を使用する際のスキーマ推論にキャッシュを使用します。

## schema_inference_use_cache_for_hdfs {#schema_inference_use_cache_for_hdfs} 

<SettingsInfoBlock type="Bool" default_value="1" />

HDFS テーブル関数を使用する際のスキーマ推論でキャッシュを利用します

## schema_inference_use_cache_for_s3 {#schema_inference_use_cache_for_s3} 

<SettingsInfoBlock type="Bool" default_value="1" />

S3 テーブル関数使用時のスキーマ推論でキャッシュを使用します

## schema_inference_use_cache_for_url {#schema_inference_use_cache_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

`url` テーブル関数使用時のスキーマ自動推論でキャッシュを利用します

## secondary_indices_enable_bulk_filtering {#secondary_indices_enable_bulk_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "データスキップインデックスによるフィルタリングの新しいアルゴリズム"}]}]}/>

インデックスに対して一括フィルタリングアルゴリズムを有効にします。常により良い結果が得られることが想定されていますが、後方互換性と動作制御のためにこの設定が用意されています。

## select_sequential_consistency {#select_sequential_consistency} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
この設定は SharedMergeTree と ReplicatedMergeTree で挙動が異なります。SharedMergeTree における `select_sequential_consistency` の挙動については、[SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

`SELECT` クエリに対する逐次一貫性を有効または無効にします。`insert_quorum_parallel` が無効化されていることが必要です（`insert_quorum_parallel` はデフォルトで有効）。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

使用方法

逐次一貫性が有効な場合、ClickHouse は、`insert_quorum` を指定して実行されたそれまでのすべての `INSERT` クエリからのデータを保持しているレプリカに対してのみ、クライアントが `SELECT` クエリを実行することを許可します。クライアントが一部のデータしか保持していないレプリカを参照した場合、ClickHouse は例外をスローします。`SELECT` クエリには、まだクォーラムを構成するレプリカ群に書き込まれていないデータは含まれません。

`insert_quorum_parallel` が有効（デフォルト）な場合、`select_sequential_consistency` は機能しません。これは、並列な `INSERT` クエリが異なるクォーラム・レプリカ集合に書き込まれる可能性があり、単一のレプリカがすべての書き込みを受け取っているという保証がないためです。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level {#send_logs_level} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

指定した最小レベル以上のサーバーのテキストログをクライアントに送信します。有効な値: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp {#send_logs_source_regexp} 

指定した正規表現に一致するログソース名を持つサーバーのテキストログを送信します。空文字列の場合はすべてのソースが対象です。

## send_profile_events {#send_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。プロファイルイベントをクライアントに送信するかどうかを制御します。"}]}]}/>

[ProfileEvents](/native-protocol/server.md#profile-events) パケットをクライアントへ送信するかどうかを制御します。

プロファイルイベントを必要としないクライアント向けに、ネットワークトラフィックを削減する目的で無効にできます。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_progress_in_http_headers {#send_progress_in_http_headers} 

<SettingsInfoBlock type="Bool" default_value="0" />

`clickhouse-server` のレスポンスで、`X-ClickHouse-Progress` HTTP レスポンスヘッダーを有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_timeout {#send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークへのデータ送信のタイムアウト（秒）です。クライアントがデータを送信する必要があるにもかかわらず、この時間内に1バイトも送信できなかった場合、例外がスローされます。クライアント側でこの setting を設定すると、対応するサーバー側の接続でも、そのソケットに対して `receive_timeout` が設定されます。

## serialize_query_plan {#serialize_query_plan} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

分散処理のためにクエリプランをシリアル化します

## serialize_string_in_memory_with_zero_byte {#serialize_string_in_memory_with_zero_byte} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

集約時に String 値を末尾にゼロバイト終端を付けてシリアライズします。互換性のないバージョンが混在するクラスタに対してクエリを実行する際の互換性を維持するために有効にします。

## session&#95;timezone {#session_timezone}

<BetaBadge />

現在のセッションまたはクエリの暗黙的なタイムゾーンを設定します。
暗黙的なタイムゾーンとは、タイムゾーンが明示的に指定されていない DateTime/DateTime64 型の値に適用されるタイムゾーンを指します。
この設定は、グローバルに構成されている（サーバーレベルの）暗黙的なタイムゾーンよりも優先されます。
値に &#39;&#39;（空文字列）を指定した場合、現在のセッションまたはクエリの暗黙的なタイムゾーンは、[server time zone](../server-configuration-parameters/settings.md/#timezone) と同一になります。

セッションのタイムゾーンおよびサーバーのタイムゾーンを取得するには、`timeZone()` および `serverTimeZone()` 関数を使用できます。

Possible values:

* `system.time_zones` に含まれる任意のタイムゾーン名（例: `Europe/Berlin`、`UTC`、`Zulu`）

Examples:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

タイムゾーンが明示的に指定されていない内部の DateTime 値に、セッションタイムゾーン &#39;America/Denver&#39; を適用します。

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
DateTime/DateTime64 をパースするすべての関数が `session_timezone` を考慮するわけではありません。これにより、気づきにくい誤りが発生する可能性があります。
以下の例とその説明を参照してください。
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

これは、パース処理のパイプラインが異なることが原因です。

* 明示的なタイムゾーン指定なしで最初の `SELECT` クエリ内で使用される `toDateTime()` は、`session_timezone` 設定とグローバルタイムゾーンを尊重します。
* 2つ目のクエリでは、String から DateTime がパースされ、既存のカラム `d` の型とタイムゾーンを継承します。そのため、`session_timezone` 設定とグローバルタイムゾーンは適用されません。

**関連項目**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode {#set_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えたときに何が起こるかを設定します。

取り得る値は次のとおりです:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## shared_merge_tree_sync_parts_on_partition_operations {#shared_merge_tree_sync_parts_on_partition_operations} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "新しい設定です。デフォルトではパーツは常に同期されます"}]}]}/>

SMT テーブルでの MOVE|REPLACE|ATTACH パーティション操作の後に、データパーツのセットを自動的に同期します。Cloud のみ

## short_circuit_function_evaluation {#short_circuit_function_evaluation} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

[if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and)、[or](/sql-reference/functions/logical-functions#or) 関数を[ショートサーキット評価](https://en.wikipedia.org/wiki/Short-circuit_evaluation)に従って評価できるようにします。これにより、これらの関数内の複雑な式の実行を最適化し、想定していないゼロ除算などの例外が発生する可能性を防ぐのに役立ちます。

設定可能な値:

- `enable` — 例外をスローする可能性がある関数や計算コストが高い関数など、ショートサーキット評価に適した関数に対してショートサーキット評価を有効にします。
- `force_enable` — すべての関数に対してショートサーキット評価を有効にします。
- `disable` — ショートサーキット評価を無効にします。

## short_circuit_function_evaluation_for_nulls {#short_circuit_function_evaluation_for_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "すべての引数が非 NULL 値である行についてのみ、Nullable 引数を持つ関数を実行できるようにする"}]}]}/>

いずれかの引数が NULL の場合に NULL を返す関数の評価を最適化します。関数の引数に含まれる NULL 値の割合が short_circuit_function_evaluation_for_nulls_threshold を超えると、システムは関数を行ごとに評価する処理をスキップします。その代わりに、すべての行に対して即座に NULL を返し、不要な計算を回避します。

## short_circuit_function_evaluation_for_nulls_threshold {#short_circuit_function_evaluation_for_nulls_threshold} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Nullable 引数を取る関数を、すべての引数が非 NULL 値である行に対してのみ実行するかどうかを決定する、NULL 値を含む行の割合のしきい値。設定 short_circuit_function_evaluation_for_nulls が有効な場合に適用されます。"}]}]}/>

Nullable 引数を取る関数を、すべての引数が非 NULL 値である行に対してのみ実行するかどうかを決定する、NULL 値を含む行の割合のしきい値です。設定 short_circuit_function_evaluation_for_nulls が有効な場合に適用されます。
NULL 値を含む行数と全行数の比率がこのしきい値を超えた場合、それらの NULL 値を含む行は評価されません。

## show_data_lake_catalogs_in_system_tables {#show_data_lake_catalogs_in_system_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトでシステムテーブル内のカタログ表示を無効にする"}]}]}/>

システムテーブルでデータレイクカタログを表示できるようにします。

## show_processlist_include_internal {#show_processlist_include_internal} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

`SHOW PROCESSLIST` クエリの出力に、内部の補助プロセスを表示します。

内部プロセスには、Dictionary の再読み込み、リフレッシャブルmaterialized view の再読み込み、`SHOW ...` クエリ内で実行される補助的な `SELECT`、破損したテーブルに対応するために内部的に実行される補助的な `CREATE DATABASE ...` クエリなどが含まれます。

## show_table_uuid_in_table_create_query_if_not_nil {#show_table_uuid_in_table_create_query_if_not_nil} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Engine=Atomic のテーブルでは、その CREATE クエリでテーブル UID を表示しないようにしました"}]}]}/>

`SHOW TABLE` クエリの表示形式を設定します。

可能な値:

- 0 — クエリはテーブル UUID なしで表示されます。
- 1 — クエリはテーブル UUID 付きで表示されます。

## single_join_prefer_left_table {#single_join_prefer_left_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

単一の JOIN で識別子に曖昧さがある場合は、左側のテーブルを優先します

## skip&#95;redundant&#95;aliases&#95;in&#95;udf {#skip_redundant_aliases_in_udf}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "有効にすると、同じテーブル内で複数のマテリアライズドカラムに対して、同じユーザー定義関数を複数回使用できるようになります。"}]}]} />

UDF の利用を簡素化するため、ユーザー定義関数内では冗長なエイリアスは展開（置換）されません。

指定可能な値:

* 1 — UDF 内でエイリアスをスキップ（置換）します。
* 0 — UDF 内でエイリアスをスキップ（置換）しません。

**例**

有効と無効の違い:

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

結果:

```text
SELECT ((4 + 2) + 1, ((4 + 2) + 1) + 2)
```


## skip_unavailable_shards {#skip_unavailable_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用できない分片をエラーを出さずにスキップする動作を有効または無効にします。

分片は、その分片に属するすべてのレプリカが利用できない場合に、利用不能と見なされます。レプリカは次のいずれかの場合に利用不能と見なされます:

- ClickHouse が何らかの理由でレプリカに接続できない。

    レプリカに接続する際、ClickHouse は複数回試行します。これらすべての試行が失敗した場合、そのレプリカは利用不能と見なされます。

- レプリカが DNS で名前解決できない。

    レプリカのホスト名が DNS で名前解決できない場合、次のような状況が考えられます:

    - レプリカのホストに DNS レコードが存在しない。これは、たとえば [Kubernetes](https://kubernetes.io) のような動的 DNS を使用するシステムで発生することがあります。この場合、ノードはダウンタイム中に名前解決できないことがありますが、これはエラーではありません。

    - 設定ミス。ClickHouse の設定ファイルに誤ったホスト名が含まれている。

取り得る値:

- 1 — スキップを有効にする。

    分片が利用不能な場合、ClickHouse は部分的なデータに基づく結果を返し、ノードの可用性に関する問題を報告しません。

- 0 — スキップを無効にする。

    分片が利用不能な場合、ClickHouse は例外をスローします。

## sleep_after_receiving_query_ms {#sleep_after_receiving_query_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler でクエリを受信してからスリープするまでの時間

## sleep_in_send_data_ms {#sleep_in_send_data_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler がデータを送信する際にスリープする時間

## sleep_in_send_tables_status_ms {#sleep_in_send_tables_status_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler がテーブルステータスのレスポンスを送信する際にスリープする時間

## sort_overflow_mode {#sort_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

ソート前に受信した行数がいずれかの制限を超えた場合の動作を設定します。

指定可能な値:

- `throw`: 例外をスローします。
- `break`: クエリの実行を停止して部分的な結果を返します。

## split_intersecting_parts_ranges_into_layers_final {#split_intersecting_parts_ranges_into_layers_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化時に交差するパーツ範囲をレイヤーに分割することを許可します"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化時に交差するパーツ範囲をレイヤーに分割することを許可します"}]}]}/>

FINAL 最適化時に交差するパーツ範囲をレイヤーに分割します

## split_parts_ranges_into_intersecting_and_non_intersecting_final {#split_parts_ranges_into_intersecting_and_non_intersecting_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割できるようにする"}]}]}/>

FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割する

## splitby_max_substrings_includes_remaining_string {#splitby_max_substrings_includes_remaining_string} 

<SettingsInfoBlock type="Bool" default_value="0" />

引数 `max_substrings` が 0 より大きい場合の関数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) について、結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。

設定可能な値:

- `0` - 結果配列の最後の要素に残りの文字列は含められません。
- `1` - 結果配列の最後の要素に残りの文字列が含められます。これは Spark の [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 関数および Python の ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) メソッドの動作です。

## stop_refreshable_materialized_views_on_startup {#stop_refreshable_materialized_views_on_startup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー起動時に、`SYSTEM STOP VIEWS` を実行した場合と同様に、リフレッシャブルmaterialized view がスケジューリングされないようにします。その後、`SYSTEM START VIEWS` または `SYSTEM START VIEW <name>` を使用して手動で起動できます。新しく作成された view にも適用されます。リフレッシャブルではない materialized view には影響しません。

## storage_file_read_method {#storage_file_read_method} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

ストレージファイルからデータを読み込む方法を指定します。`read`、`pread`、`mmap` のいずれかです。`mmap` メソッドは clickhouse-server には適用されず、clickhouse-local 用です。

## storage_system_stack_trace_pipe_read_timeout_ms {#storage_system_stack_trace_pipe_read_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

`system.stack_trace` テーブルをクエリする際に、スレッドから情報を受信するためにパイプから読み取る最大時間を指定します。この設定はテスト目的でのみ使用されるものであり、ユーザーが変更することは想定されていません。

## stream_flush_interval_ms {#stream_flush_interval_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

タイムアウトが発生した場合、またはスレッドが [max_insert_block_size](#max_insert_block_size) 行を生成した場合に、ストリーミングを有効にしたテーブルに対して動作します。

デフォルト値は 7500 です。

値が小さいほど、より頻繁にテーブルへデータがフラッシュされます。値を小さくしすぎるとパフォーマンスの低下につながります。

## stream_like_engine_allow_direct_select {#stream_like_engine_allow_direct_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "デフォルトでは Kafka/RabbitMQ/FileLog への直接 SELECT を許可しない"}]}]}/>

Kafka、RabbitMQ、FileLog、Redis Streams、S3Queue、AzureQueue、NATS エンジンに対して、直接の SELECT クエリの実行を許可します。materialized view がアタッチされている場合は、この設定が有効でも SELECT クエリは許可されません。
materialized view がアタッチされていない場合、この設定を有効にするとデータを読み取れるようになります。通常は、読み取ったデータはキューから削除される点に注意してください。読み取ったデータを削除しないようにするには、関連するエンジンの設定を適切に構成する必要があります。

## stream_like_engine_insert_queue {#stream_like_engine_insert_queue} 

stream-like エンジンが複数のキューからデータを読み取る場合、書き込み時には挿入先とするキューを 1 つ選択する必要があります。Redis Streams と NATS で使用されます。

## stream_poll_timeout_ms {#stream_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

ストリーミングストレージとの間でデータをポーリングする際のタイムアウト値。

## system&#95;events&#95;show&#95;zero&#95;values {#system_events_show_zero_values}

<SettingsInfoBlock type="Bool" default_value="0" />

[`system.events`](../../operations/system-tables/events.md) から値が 0 のイベントを選択できるようにする設定です。

一部のモニタリングシステムでは、メトリクス値が 0 の場合でも、各チェックポイントごとにすべてのメトリクス値を渡す必要があります。

Possible values:

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
│ QueryMemoryLimitExceeded │     0 │ クエリのメモリ制限を超過した回数。 │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache {#table_engine_read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。table エンジンや table functions（S3、Azure など）を介して distributed cache からの読み取りを許可します。

## table_function_remote_max_addresses {#table_function_remote_max_addresses} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

[remote](../../sql-reference/table-functions/remote.md) 関数に対して、パターンから生成されるアドレス数の上限を設定します。

設定可能な値:

- 正の整数。

## tcp_keep_alive_timeout {#tcp_keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="290" />

TCP がキープアライブプローブの送信を開始するまで、接続がアイドル状態を保つ必要がある時間（秒単位）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds {#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "ファイルシステムキャッシュ内の一時データ用に空き領域を予約するためにキャッシュをロックする際の待機時間"}]}]}/>

ファイルシステムキャッシュ内の一時データ用に空き領域を予約するためにキャッシュをロックする際の待機時間

## temporary_files_buffer_size {#temporary_files_buffer_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "新しい設定"}]}]}/>

一時ファイルの書き込みに使用するバッファのサイズ。バッファサイズを大きくするとシステムコールの回数は減りますが、メモリ使用量は増加します。

## temporary_files_codec {#temporary_files_codec} 

<SettingsInfoBlock type="String" default_value="LZ4" />

ディスク上でのソートおよび結合処理に使用される一時ファイルの圧縮コーデックを設定します。

指定可能な値:

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 圧縮が適用されます。
- NONE — 圧縮は適用されません。

## text_index_hint_max_selectivity {#text_index_hint_max_selectivity} 

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "New setting"}]}]}/>

反転テキスト索引から構築されたヒントを使用する際の、フィルター選択度の最大値。

## text_index_use_bloom_filter {#text_index_use_bloom_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

テスト目的で、text index における bloom filter の使用を有効化または無効化します。

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert {#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "依存する materialized view における重複排除は、非同期挿入と同時には動作できません。"}]}]}/>

`deduplicate_blocks_in_dependent_materialized_views` と `async_insert` が同時に有効になっている場合、INSERT クエリ実行時に例外をスローします。これらの機能は同時に動作できないため、この設定により処理の正しさが保証されます。

## throw_if_no_data_to_insert {#throw_if_no_data_to_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

空の INSERT を許可するか禁止するかを制御します。デフォルトでは有効で、空の INSERT に対してエラーをスローします。[`clickhouse-client`](/interfaces/cli) を使用した INSERT、または [gRPC インターフェイス](/interfaces/grpc) を使用した INSERT にのみ適用されます。

## throw_on_error_from_cache_on_write_operations {#throw_on_error_from_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

書き込み操作（INSERT やマージ）時のキャッシュ処理で発生したエラーを無視します

## throw_on_max_partitions_per_insert_block {#throw_on_max_partitions_per_insert_block} 

<SettingsInfoBlock type="Bool" default_value="1" />

`max_partitions_per_insert_block` に到達したときの動作を制御します。

設定可能な値:

- `true`  - 挿入ブロックが `max_partitions_per_insert_block` に達したときに、例外をスローします。
- `false` - `max_partitions_per_insert_block` に到達したときに、警告をログ出力します。

:::tip
[`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) を変更する際に、ユーザーへの影響を把握するのに役立ちます。
:::

## throw_on_unsupported_query_inside_transaction {#throw_on_unsupported_query_inside_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

トランザクション内でサポートされていないクエリが実行された場合に例外をスローします。

## timeout_before_checking_execution_speed {#timeout_before_checking_execution_speed} 

<SettingsInfoBlock type="Seconds" default_value="10" />

指定された秒数が経過した後に、実行速度が遅すぎないこと（`min_execution_speed` を下回っていないこと）を確認します。

## timeout_overflow_mode {#timeout_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

クエリの実行時間が `max_execution_time` を超えた場合、または推定実行時間が
`max_estimated_execution_time` を超える場合にどのように動作するかを設定します。

設定可能な値:

- `throw`: 例外をスローします (デフォルト)。
- `break`: クエリの実行を停止し、ソースデータが尽きた場合と同様に、
  部分的な結果を返します。

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

リーフノード上で実行されるクエリが `max_execution_time_leaf` を超えて実行された場合にどう動作するかを設定します。

設定可能な値:

- `throw`: 例外をスローします (デフォルト)。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## totals_auto_threshold {#totals_auto_threshold} 

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'` のしきい値です。
「WITH TOTALS 修飾子」のセクションを参照してください。

## totals_mode {#totals_mode} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

HAVING 句が存在する場合や、max_rows_to_group_by と group_by_overflow_mode = 'any' が設定されている場合に、TOTALS をどのように計算するかを指定します。
「WITH TOTALS 修飾子」のセクションを参照してください。

## trace_profile_events {#trace_profile_events} 

<SettingsInfoBlock type="Bool" default_value="0" />

各プロファイルイベントの更新時に、そのイベント名とインクリメント値を含むスタックトレースを収集し、それらを [trace_log](/operations/system-tables/trace_log) に送信する機能を有効または無効にします。

設定可能な値:

- 1 — プロファイルイベントのトレースが有効。
- 0 — プロファイルイベントのトレースが無効。

## transfer_overflow_mode {#transfer_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えた場合の動作を設定します。

設定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、元データが尽きたかのように
  部分的な結果を返します。

## transform&#95;null&#95;in {#transform_null_in}

<SettingsInfoBlock type="Bool" default_value="0" />

[IN](../../sql-reference/operators/in.md) 演算子において、[NULL](/sql-reference/syntax#null) 同士を等しいものとして扱えるようにします。

デフォルトでは、`NULL` は「未定義の値」を意味するため `NULL` 値は比較できません。したがって、`expr = NULL` という比較は常に `false` を返さなければなりません。この設定を有効にすると、`IN` 演算子に対する `NULL = NULL` は `true` を返します。

設定可能な値:

* 0 — `IN` 演算子における `NULL` 値の比較は `false` を返します。
* 1 — `IN` 演算子における `NULL` 値の比較は `true` を返します。

**例**

`null_in` というテーブルを考えます。

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

クエリ：

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

結果:

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

* [IN 演算子での NULL の処理](/sql-reference/operators/in#null-processing)


## traverse_shadow_remote_data_paths {#traverse_shadow_remote_data_paths} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "system.remote_data_paths をクエリする際に shadow ディレクトリを走査します。"}]}]}/>

system.remote_data_paths をクエリする際に、実際のテーブルデータに加えて、凍結されたデータ（shadow ディレクトリ）も走査します。

## union_default_mode {#union_default_mode} 

`SELECT` クエリ結果を結合する際のモードを設定します。`UNION ALL` または `UNION DISTINCT` を明示的に指定せずに [UNION](../../sql-reference/statements/select/union.md) と併用した場合にのみ使用されます。

設定可能な値:

- `'DISTINCT'` — ClickHouse はクエリの結合結果から重複する行を削除した結果を出力します。
- `'ALL'` — ClickHouse はクエリの結合結果として重複行を含むすべての行を出力します。
- `''` — `UNION` と併用した場合、ClickHouse は例外を発生させます。

例については [UNION](../../sql-reference/statements/select/union.md) を参照してください。

## unknown_packet_in_send_data {#unknown_packet_in_send_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

N 番目のデータパケットの代わりに未知のパケットを送信します

## update_parallel_mode {#update_parallel_mode} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

並行して実行される更新クエリの動作を制御します。

設定可能な値:

- `sync` - すべての `UPDATE` クエリを逐次実行します。
- `auto` - 同じクエリ内で更新されるカラムと、別のクエリの式で使用されるカラムとの間に依存関係がある `UPDATE` クエリのみを逐次実行します。
- `async` - 更新クエリを同期しません。

## update_sequential_consistency {#update_sequential_consistency} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、UPDATE の実行前に、パーツのセットが最新バージョンに更新されます。

## use_async_executor_for_materialized_views {#use_async_executor_for_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

materialized view のクエリを非同期で、必要に応じてマルチスレッドで実行します。INSERT 実行中の view の処理を高速化できますが、その分メモリ使用量も増加します。

## use_cache_for_count_from_files {#use_cache_for_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル関数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` でファイルから行数をカウントする際に、その行数をキャッシュします。

デフォルトで有効になっています。

## use_client_time_zone {#use_client_time_zone} 

<SettingsInfoBlock type="Bool" default_value="0" />

DateTime 文字列の値を解釈する際に、サーバーのタイムゾーンではなくクライアント側のタイムゾーンを使用します。

## use_compact_format_in_distributed_parts_names {#use_compact_format_in_distributed_parts_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Use compact format for async INSERT into Distributed tables by default"}]}]}/>

`Distributed` エンジンを持つテーブルへのバックグラウンド（`distributed_foreground_insert`）での INSERT 時に、ブロックを保存するためコンパクトな形式を使用します。

設定可能な値:

- 0 — `user[:password]@host:port#default_database` ディレクトリ形式を使用します。
- 1 — `[shard{shard_index}[_replica{replica_index}]]` ディレクトリ形式を使用します。

:::note

- `use_compact_format_in_distributed_parts_names=0` の場合、クラスタ定義の変更はバックグラウンド INSERT には反映されません。
- `use_compact_format_in_distributed_parts_names=1` の場合、クラスタ定義内のノードの順序を変更すると `shard_index`/`replica_index` が変更されるため注意してください。
:::

## use_concurrency_control {#use_concurrency_control} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "デフォルトで同時実行制御を有効化"}]}]}/>

サーバーの同時実行制御（`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` グローバルサーバー設定を参照）に従います。無効にすると、サーバーが過負荷状態であっても、より多くのスレッドを使用できるようになります（通常の利用には推奨されず、主にテスト用途で必要になります）。

## use_hedged_requests {#use_hedged_requests} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Hedged Requests 機能をデフォルトで有効化"}]}]}/>

リモートクエリに対して hedged requests のロジックを有効にします。これにより、1 つのクエリに対して異なるレプリカとの複数の接続を確立できます。
既存のレプリカへの接続が `hedged_connection_timeout` 以内に確立されない場合、または `receive_data_timeout` 以内にデータが受信されない場合に、新しい接続が確立されます。クエリは、空ではない progress パケット（または `allow_changing_replica_until_first_data_packet` が有効な場合はデータパケット）を最初に送信した接続を使用し、
その他の接続はキャンセルされます。`max_parallel_replicas > 1` のクエリがサポートされています。

デフォルトで有効です。

Cloud のデフォルト値: `1`

## use_hive_partitioning {#use_hive_partitioning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "設定をデフォルトで有効化しました。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "File、URL、S3、AzureBlobStorage、HDFS エンジンで Hive パーティション分割を使用できるようにします。"}]}]}/>

有効な場合、ClickHouse はファイル系のテーブルエンジン [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) において、パス（`/name=value/`）内の Hive スタイルのパーティション分割を検出し、パーティションカラムをクエリ内で仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションパスで使用されている名前と同じですが、先頭に `_` が付きます。

## use_iceberg_metadata_files_cache {#use_iceberg_metadata_files_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、`iceberg` テーブル関数および `iceberg` ストレージで Iceberg メタデータファイルキャッシュを利用できます。

取りうる値:

- 0 - 無効
- 1 - 有効

## use_iceberg_partition_pruning {#use_iceberg_partition_pruning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Iceberg パーティションプルーニングをデフォルトで有効にします。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Iceberg パーティションプルーニング向けの新しい設定です。"}]}]}/>

Iceberg テーブルに対してパーティションプルーニングを使用します

## use_index_for_in_with_subqueries {#use_index_for_in_with_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

IN 演算子の右辺に副問い合わせまたはテーブル式がある場合、索引の利用を試みます。

## use_index_for_in_with_subqueries_max_values {#use_index_for_in_with_subqueries_max_values} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 演算子の右辺にある集合について、フィルタリングのためにテーブルの索引を使用する際の最大サイズを指定します。これにより、大きなクエリに対して追加のデータ構造を準備することによるパフォーマンス低下やメモリ使用量の増加を回避できます。0 は無制限を意味します。

## use_join_disjunctions_push_down {#use_join_disjunctions_push_down} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

`JOIN` 条件における OR で接続された部分を、対応する入力側へプッシュダウンする（「部分的プッシュダウン」）ことを有効にします。
これによりストレージエンジンがより早い段階でフィルタリングでき、読み取るデータ量を削減できる場合があります。
この最適化はクエリの意味を保持しつつ行われ、各トップレベルの OR ブランチが、その対象入力側に対して少なくとも 1 つの決定的な述語を含む場合にのみ適用されます。

## use_legacy_to_time {#use_legacy_to_time} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新しい SETTING。ユーザーが toTime の従来の関数ロジック（toTimeWithFixedDate として動作するもの）を使用できるようにします。"}]}]}/>

有効にすると、従来の toTime 関数を使用できます。この関数は、時刻付きの日付を、時刻を保持したまま特定の固定日付に変換します。
無効にすると、新しい toTime 関数が使用され、さまざまな種類のデータを Time 型に変換します。
従来の関数は、toTimeWithFixedDate として常に利用可能です。

## use_page_cache_for_disks_without_file_cache {#use_page_cache_for_disks_without_file_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間ページキャッシュを追加"}]}]}/>

ファイルシステムキャッシュが有効化されていないリモートディスクに対して、ユーザー空間ページキャッシュを使用します。

## use_page_cache_with_distributed_cache {#use_page_cache_with_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

分散キャッシュが使用されている場合に、ユーザースペースのページキャッシュを使用します。

## use_paimon_partition_pruning {#use_paimon_partition_pruning} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

Paimon テーブル関数で Paimon のパーティションプルーニングを使用します

## use_query_cache {#use_query_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、`SELECT` クエリは [query cache](../query-cache.md) を利用できるようになります。[enable_reads_from_query_cache](#enable_reads_from_query_cache)
および [enable_writes_to_query_cache](#enable_writes_to_query_cache) の各パラメータで、キャッシュの使用方法をより細かく制御できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_query_condition_cache {#use_query_condition_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新しい最適化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

[query condition cache](/operations/query-condition-cache) を有効にします。キャッシュは、`WHERE` 句の条件を満たさないデータパーツ内のグラニュールの範囲を保存し、
後続のクエリでこの情報を一時的な索引として再利用します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_roaring_bitmap_iceberg_positional_deletes {#use_roaring_bitmap_iceberg_positional_deletes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Iceberg の positional delete に Roaring Bitmap を使用します。

## use_skip_indexes {#use_skip_indexes} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行時にデータスキッピングインデックスを使用します。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_for_disjunctions {#use_skip_indexes_for_disjunctions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

AND と OR が混在する WHERE 句の条件を、skip 索引を用いて評価します。例: WHERE A = 5 AND (B = 5 OR C = 5)。
無効化した場合でも、skip 索引は WHERE 条件の評価に使用されますが、その場合は AND で連結された句のみを含む必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final {#use_skip_indexes_if_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

`FINAL` 修飾子を付けてクエリを実行する際に、スキップ索引を使用するかどうかを制御します。

スキップ索引は、最新のデータを含む行（グラニュール）を除外してしまう可能性があり、その結果、`FINAL` 修飾子付きクエリの結果が不正確になることがあります。この設定が有効な場合、`FINAL` 修飾子があってもスキップ索引が適用され、最近の更新が見落とされるリスクはあるものの、パフォーマンスが向上する可能性があります。この設定は、use_skip_indexes_if_final_exact_mode 設定（デフォルトは有効）と整合するように有効化する必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final_exact_mode {#use_skip_indexes_if_final_exact_mode} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "SETTING のデフォルト値の変更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "FINAL クエリが skip INDEX 使用時でも正しい結果を返せるように、この SETTING が導入されました"}]}]}/>

スキップ索引によって返された granule が、新しいパーツ内で展開され、`FINAL` 修飾子付きでクエリを実行する際に正しい結果を返すようにするかどうかを制御します。

スキップ索引を使用すると、最新のデータを含む行（granule）が除外され、不正確な結果につながる可能性があります。この SETTING を有効にすると、スキップ索引によって返された範囲と重複する新しいパーツを走査することで、正しい結果が返されるようにできます。アプリケーションにおいて、スキップ索引の検索結果に基づく近似値の結果で問題ない場合にのみ、この SETTING を無効にしてください。

取り得る値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_on_data_read {#use_skip_indexes_on_data_read} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

データ読み取り時にデータスキッピングインデックスの使用を有効にします。

有効にすると、データスキッピングインデックスは、クエリ実行開始前に事前解析されるのではなく、各データグラニュールが読み取られるタイミングで動的に評価されます。これにより、クエリ開始時のレイテンシーを削減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_statistics_cache {#use_statistics_cache} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

すべてのパーツの統計情報をロードする際のオーバーヘッドを回避するために、クエリで statistics cache を使用します

## use_structure_from_insertion_table_in_table_functions {#use_structure_from_insertion_table_in_table_functions} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "テーブル関数における挿入元テーブル構造の利用を改善"}]}]}/>

データからスキーマを推論するのではなく、挿入元テーブルの構造を使用します。設定可能な値: 0 - 無効, 1 - 有効, 2 - 自動

## use_text_index_dictionary_cache {#use_text_index_dictionary_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "新しい設定"}]}]}/>

デシリアライズ済みのテキスト索引 Dictionary ブロックのキャッシュを使用するかどうかを制御します。
テキスト索引 Dictionary ブロックキャッシュを使用すると、大量のテキスト索引クエリを処理する場合のレイテンシを大幅に削減し、スループットを向上させることができます。

## use_text_index_header_cache {#use_text_index_header_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

逆シリアル化されたテキストインデックスヘッダーのキャッシュを使用するかどうか。
テキストインデックスヘッダーキャッシュを使用すると、多数のテキストインデックスクエリを扱う場合のレイテンシーを大幅に削減し、スループットを向上できます。

## use_text_index_postings_cache {#use_text_index_postings_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

テキスト索引ポスティングリストのデシリアライズ結果をキャッシュとして使用するかどうかを制御します。
text index postings cache を有効にすると、大量のテキスト索引クエリを処理する際のレイテンシを大幅に削減し、スループットを向上させることができます。

## use_uncompressed_cache {#use_uncompressed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

非圧縮ブロックのキャッシュを使用するかどうか。0 または 1 を指定できます。デフォルトは 0（無効）です。
非圧縮キャッシュ（MergeTree ファミリーのテーブルに対してのみ有効）を使用すると、多数の短いクエリを処理する場合のレイテンシを大幅に削減し、スループットを向上させることができます。短い短時間クエリを高頻度で送信するユーザー向けに、この設定を有効にしてください。また、非圧縮キャッシュブロックのサイズを指定する設定パラメータ [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size)（config ファイルでのみ設定可能）にも注意してください。デフォルト値は 8 GiB です。非圧縮キャッシュは必要に応じて蓄積され、使用頻度の低いデータは自動的に削除されます。

少なくともある程度のデータ量（100 万行以上）を読み取るクエリに対しては、真に小規模なクエリのための領域を確保する目的で、非圧縮キャッシュは自動的に無効化されます。このため、`use_uncompressed_cache` 設定は常に 1 に設定しておいて問題ありません。

## use&#95;variant&#95;as&#95;common&#95;type {#use_variant_as_common_type}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "共通の型がない場合に if/multiIf で Variant 型を使用できるようにする"}]}]} />

引数型に共通の型がない場合に、[if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 関数の結果の型として `Variant` 型を使用できるようにします。

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


## use_with_fill_by_sorting_prefix {#use_with_fill_by_sorting_prefix} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 句において WITH FILL カラムに先行するカラムはソートプレフィックスを形成します。ソートプレフィックスの値が異なる行は、それぞれ独立して埋められます"}]}]}/>

ORDER BY 句において WITH FILL カラムに先行するカラムはソートプレフィックスを形成します。ソートプレフィックスの値が異なる行は、それぞれ独立して埋められます

## validate_enum_literals_in_operators {#validate_enum_literals_in_operators} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、`IN`、`NOT IN`、`==`、`!=` などの演算子における enum リテラルを enum 型に対して検証し、そのリテラルが有効な enum 値でない場合は例外をスローします。

## validate_mutation_query {#validate_mutation_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "デフォルトでミューテーションクエリを検証する新しい設定。"}]}]}/>

ミューテーションクエリを受け付ける前に検証します。ミューテーションはバックグラウンドで実行されるため、無効なクエリを実行するとミューテーションが進行しなくなり、手動による対応が必要になります。

後方互換性のないバグに遭遇した場合にのみ、この設定を変更してください。

## validate_polygons {#validate_polygons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "デフォルトで、誤った結果を返してしまう可能性がある挙動ではなく、pointInPolygon 関数でポリゴンが無効な場合に例外をスローする"}]}]}/>

ポリゴンが自己交差または自己接触している場合に、[pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 関数で例外をスローするかどうかを有効または無効にします。

可能な値:

- 0 — 例外のスローは無効です。`pointInPolygon` は無効なポリゴンを受け付け、それらに対して誤った結果を返す可能性があります。
- 1 — 例外のスローは有効です。

## vector_search_filter_strategy {#vector_search_filter_strategy} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

ベクトル検索クエリに `WHERE` 句が含まれている場合、この設定は、`WHERE` 句を先に評価する（プリフィルタリング）のか、ベクトル類似度の索引を先に参照する（ポストフィルタリング）のかを決定します。取りうる値は次のとおりです。

- 'auto' - ポストフィルタリング（正確なセマンティクスは将来変更される可能性があります）。
- 'postfilter' - ベクトル類似度の索引を使用して最近傍を特定し、その後に他のフィルターを適用します。
- 'prefilter' - 先に他のフィルターを評価し、その後に総当たり検索を実行して近傍を特定します。

## vector_search_index_fetch_multiplier {#vector_search_index_fetch_multiplier} 

**Aliases**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "設定 'vector_search_postfilter_multiplier' のエイリアス"}]}]}/>

ベクトル類似度索引から取得する最近傍の件数を、この値で乗算します。ほかの述語とのポストフィルタリングを行う場合、または設定 'vector_search_with_rescoring = 1' が有効な場合にのみ適用されます。

## vector_search_with_rescoring {#vector_search_with_rescoring} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse がベクトル類似度索引を使用するクエリに対してリスコアリングを実行するかどうかを制御します。
リスコアリングを行わない場合、ベクトル類似度索引は最良の一致を含む行を直接返します。
リスコアリングを行う場合、行はグラニュールレベルまで展開され、そのグラニュール内のすべての行が再度チェックされます。
ほとんどの場合、リスコアリングは精度をわずかにしか改善しませんが、ベクトル検索クエリのパフォーマンスを大きく低下させます。
注意: リスコアリングなしで実行され、かつ並列レプリカが有効になっているクエリは、リスコアリングにフォールバックする場合があります。

## wait_changes_become_visible_after_commit_mode {#wait_changes_become_visible_after_commit_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

コミットされた変更が最新のスナップショットで実際に反映されるまで待機します

## wait_for_async_insert {#wait_for_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期挿入の処理が完了するまで待機します。

## wait_for_async_insert_timeout {#wait_for_async_insert_timeout} 

<SettingsInfoBlock type="Seconds" default_value="120" />

非同期挿入の処理を待機するタイムアウト時間

## wait_for_window_view_fire_signal_timeout {#wait_for_window_view_fire_signal_timeout} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

イベント時間処理において、window VIEW の fire シグナルを待機する際のタイムアウト時間

## window_view_clean_interval {#window_view_clean_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

古いデータを解放するための window view のクリーンアップ間隔（秒単位）。

## window_view_heartbeat_interval {#window_view_heartbeat_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

`watch` クエリが稼働中であることを示すためのハートビート間隔（秒）。

## workload {#workload} 

<SettingsInfoBlock type="String" default_value="default" />

リソースにアクセスする際に使用する workload の名前

## write_full_path_in_iceberg_metadata {#write_full_path_in_iceberg_metadata} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

完全なパス（s3:// を含む）を Iceberg のメタデータファイルに書き込みます。

## write_through_distributed_cache {#write_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへの書き込みを有効にします（S3 への書き込みも分散キャッシュ経由で実行されます）。

## write_through_distributed_cache_buffer_size {#write_through_distributed_cache_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい Cloud の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。ライトスルー型分散キャッシュ用のバッファサイズを設定します。0 の場合、分散キャッシュが存在しない場合に使用されるバッファサイズが自動的に使用されます。

## zstd_window_log_max {#zstd_window_log_max} 

<SettingsInfoBlock type="Int64" default_value="0" />

ZSTD の最大ウィンドウログ値を選択できます（MergeTree 系エンジンでは使用されません）